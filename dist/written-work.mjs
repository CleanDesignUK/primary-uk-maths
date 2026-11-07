import {esc, mathText} from './visuals.mjs?v=7.0.0';

const divisionSkills = new Set(['divWritten3', 'divide4', 'division5', 'longDiv6', 'decimalDiv6']);
const placeName = power => power < 0 ? ['tenths','hundredths','thousandths'][-power-1] : placeNames[power] || `digit ${power+1}`;
const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

export const isWrittenSkill = id => /^col(?:Add|Sub)/.test(id) ||
  ['mulWritten3', 'mul4', 'mul5', 'longMul6', 'decimalMul6'].includes(id) || divisionSkills.has(id);

export function writtenAllowance(question) {
  if (question.key?.startsWith('column')) {
    return Math.max(String(question.a).length, String(question.b).length) > 3 ? 45 : 30;
  }
  const task = writtenTask(question);
  if (!task) return 0;
  return task.type === 'long-division' || task.type === 'multiply' && task.b >= 10 ? 60 : 45;
}

export const decimalPlaces = value => (String(value).split('.')[1] || '').length;

export function writtenTask(question) {
  if (question.visual?.type === 'written' && question.visual.op === '×') {
    const {a, b} = question.visual;
    return {type: 'multiply', a, b};
  }
  if (question.skillId === 'decimalMul6') {
    const match = String(question.expression).match(/^(\d+(?:\.\d+)?)\s*×\s*(\d+)/);
    if (match) return {type:'multiply', a:Number(match[1]), b:Number(match[2]), decimalPlaces:decimalPlaces(match[1])};
  }
  if (!divisionSkills.has(question.skillId)) return null;
  const match = String(question.expression || '').match(/^(\d+(?:\.\d+)?)\s*÷\s*(\d+)/);
  if (!match) return null;
  const [, dividend, divisor] = match;
  return {
    type: Number(divisor) < 10 ? 'short-division' : 'long-division',
    a: Number(dividend), b: Number(divisor),
    decimalPlaces: question.skillId === 'decimalDiv6' ? Math.max(decimalPlaces(dividend), decimalPlaces(question.answer)) : 0,
    needsRemainder: /^\d+\s*r\s*\d+$/.test(String(question.answer))
  };
}

export function multiplicationWorking(a, b) {
  const originalA = a, dp = decimalPlaces(a), scale = 10 ** dp;
  a = Math.round(a * scale);
  const width = Math.max(String(a).length, String(b).length, String(a * b).length, dp + 1);
  const multiplicand = [...String(a)].reverse().map(Number);
  const partials = [...String(b)].reverse().map((digit, shift) => {
    const factor = Number(digit) * 10 ** shift;
    const carries = Array(width).fill('');
    let carry = 0;
    for (let i = 0; i < multiplicand.length; i++) {
      carry = Math.floor((multiplicand[i] * Number(digit) + carry) / 10);
      const nextColumn = width - 2 - i - shift;
      if (carry && i + 1 < multiplicand.length) carries[nextColumn] = String(carry);
    }
    return {label: shift ? 'Tens' : 'Ones', factor, value: a * factor, carries, shift};
  });
  const sumCarries = Array(width).fill('');
  if (partials.length > 1) {
    const products = partials.map(part => String(part.value).padStart(width, '0'));
    let carry = 0;
    for (let i = width - 1; i > 0; i--) {
      carry = Math.floor((carry + products.reduce((sum, product) => sum + Number(product[i]), 0)) / 10);
      if (carry) sumCarries[i - 1] = String(carry);
    }
  }
  return {type:'longMultiply', title:'Multiply in columns', a, b, partials, sumCarries, total:a*b/scale, rawTotal:a*b, originalA, decimalPlaces:dp, scale, width:Math.max(width,dp+1)};
}

export function divisionWorking(dividend, divisor, precision = decimalPlaces(dividend)) {
  const originalDividend = dividend, scale = 10 ** precision;
  dividend = Math.round(dividend * scale);
  const digitText = String(dividend).padStart(precision + 1, '0');
  const digits = [...digitText].map(Number);
  const steps = [];
  let remainder = 0;
  let started = false;
  for (let index = 0; index < digits.length; index++) {
    const carry = remainder;
    const current = carry * 10 + digits[index];
    const digit = Math.floor(current / divisor);
    const product = digit * divisor;
    remainder = current - product;
    if (digit || started || index === digits.length - 1) {
      steps.push({index, current, digit, product, remainder, carry, bring: digits[index + 1] ?? null});
      started = true;
    }
  }
  return {type:'division', title:divisor < 10 ? 'Short division' : 'Long division', dividend, originalDividend, divisor, quotient:Math.floor(dividend / divisor) / scale, rawQuotient:Math.floor(dividend / divisor), decimalPlaces:precision, scale, digitText, remainder, steps};
}

function row(width, content, css = '', prefix = '', dp = 0) {
  if (dp) content = [...content.slice(0,width-dp), '<span class="method-decimal" aria-label="decimal point">.</span>', ...content.slice(width-dp)];
  return `<div class="method-row ${css}${dp?' decimal-row':''}" style="--places:${width};--whole-places:${width-dp};--decimal-places:${dp}"><span class="method-prefix">${prefix}</span>${content.join('')}</div>`;
}
function digits(value, width, end = width - 1) {
  const left = String(value).padStart(end + 1, ' ');
  return [...left.padEnd(width, ' ')].map(digit => `<span class="method-cell">${digit === ' ' ? '&nbsp;' : esc(digit)}</span>`);
}
function noteField(key, label, value, done, maxlength = 1) {
  return `<input class="work-note" data-work="${esc(key)}" aria-label="${esc(label)}" inputmode="numeric" maxlength="${maxlength}" value="${esc(value || '')}" ${done ? 'disabled' : ''} autocomplete="off">`;
}
function answerDigits(width, entered, done, label, expected, start = 0, dp = 0) {
  const correct = String(expected).padStart(width,'0');
  return Array.from({length:width}, (_, i) => {
    const power = width-i-1-dp;
    const place = placeName(power);
    const status = done ? (Number(entered[i] || 0) === Number(correct[i]) ? 'correct' : 'incorrect') : '';
    return `<input class="column-digit ${status}" id="digit-${i}" data-digit="${i}" aria-label="${label} ${place} column" inputmode="numeric" maxlength="1" value="${esc(entered[i] || '')}" autocomplete="off" ${i === start ? 'data-start-digit' : ''} ${done ? 'disabled' : ''}>`;
  });
}

function multiplicationCarries(task, width, shift, key, label, notes, done) {
  const start = width - String(Math.round(task.a * 10 ** (task.decimalPlaces || 0))).length - shift;
  const end = width - 1 - shift;
  return row(width, Array.from({length:width}, (_, i) => i >= start && i < end
    ? noteField(`${key}-${i}`, `${label}, ${placeName(width-i-1-(task.decimalPlaces||0))} column`, notes[`${key}-${i}`], done)
    : '<span></span>'), 'method-carries', '', task.decimalPlaces || 0);
}

export function multiplicationWorkspace(task, {entered = [], notes = {}, done = false} = {}) {
  const model = multiplicationWorking(task.a, task.b);
  // Use the operand widths so the blank board does not reveal the answer's length.
  const dp = model.decimalPlaces;
  task = {...task, decimalPlaces:dp};
  const width = Math.max(String(model.a).length + String(model.b).length, dp + 1);
  const long = model.partials.length > 1;
  const work = long ? model.partials.map(({label, shift}, index) => {
    const fields = Array.from({length:width}, (_, i) => i >= width-shift ? '<span class="method-cell place-zero">0</span>' : noteField(`product-${index}-${i}`, `${label} row, ${placeNames[width-i-1]} column`, notes[`product-${index}-${i}`], done));
    return row(width, fields, 'partial-product-row', index ? '+' : '', dp) +
      multiplicationCarries(task, width, shift, `carry-${index}`, `${label} carry into`, notes, done);
  }).join('') : '';
  const carries = long
    ? row(width, Array.from({length:width}, (_, i) => i < width-1
      ? noteField(`sum-${i}`, `Addition carry into ${placeNames[width-i-1]} column`, notes[`sum-${i}`], done)
      : '<span></span>'), 'method-carries', '', dp)
    : multiplicationCarries(task, width, 0, 'carry-0', 'Carry into', notes, done);
  const answer = row(width, answerDigits(width, entered, done, 'Product', model.rawTotal, width-1, dp), 'method-answer', '', dp);
  return `<div class="method-board arithmetic-paper multiply-board" style="--board-places:${width};--decimal-slots:${dp?1:0}" aria-label="Written multiplication workspace">${row(width,digits(String(model.a).padStart(dp+1,'0'),width),'','',dp)}${row(width,digits(model.b,width),'','×',dp).replace('method-decimal','method-decimal decimal-spacer')}${long?'<div class="method-rule"></div>'+work:''}${answer}${carries}</div><p class="worksheet-caption">${dp ? `Keep the decimal point lined up. ${long?'Use the partial-product rows, then add.':'Start on the right; carry below.'}` : long ? 'Ones row, tens row, then add.' : 'Carry below the next column.'}</p>`;
}

function shortDividend(model, notes, done) {
  const digits = [...model.digitText];
  const carries = new Map(model.steps.map(step => [step.index, step.carry]));
  return row(digits.length, digits.map((digit, i) => {
    const carry = notes ? (i ? noteField(`rem-carry-${i}`, `Remainder carried to digit ${i+1}`, notes[`rem-carry-${i}`], done) : '')
      : (carries.get(i) ? `<sup>${carries.get(i)}</sup>` : '');
    return `<span class="method-cell bus-digit">${carry}<span>${digit}</span></span>`;
  }), 'dividend-row', String(model.divisor), model.decimalPlaces);
}

function divisionRows(model, notes, done) {
  const width = model.digitText.length;
  const divisorWidth = String(model.divisor).length;
  return model.steps.map(step => {
    const end = step.index;
    const start = Math.max(0, end - divisorWidth);
    const slot = end - divisorWidth + 1;
    const downEnd = step.bring === null ? end : end + 1;
    const down = step.bring === null ? step.remainder : step.remainder * 10 + step.bring;
    const fields = (kind, label, first, last, value, minus = false) => {
      const printed = String(value);
      const left = notes ? first : last - printed.length + 1;
      return row(width, Array.from({length:width}, (_, i) => {
        if (minus && i === left - 1) return '<span class="method-minus">−</span>';
        if (i < left || i > last) return '<span></span>';
        const key = `${kind}-${slot}-${i}`;
        if (notes) return noteField(key, `${label}, ${placeNames[width-i-1]} column`, notes[key], done);
        const brought = kind === 'down' && i === downEnd && step.bring !== null;
        return `<span class="method-cell ${brought?'brought-digit':''}">${printed[i-left]}</span>`;
      }), kind === 'back' ? 'division-product' : 'division-difference', minus && left === 0 ? '−' : '');
    };
    const line = row(width, Array.from({length:width}, (_, i) => i >= start && i <= end
      ? '<span class="rule-segment"></span>' : '<span></span>'), 'division-rule');
    const downStart = Math.max(0, downEnd - divisorWidth + Number(step.bring === null));
    return fields('back', 'Subtract the product', start, end, step.product, true) + line +
      fields('down', step.bring === null ? 'Remainder' : 'Subtract and bring down', downStart, downEnd, down);
  }).join('');
}

export function divisionWorkspace(task, {entered = [], notes = {}, done = false, remainder = ''} = {}) {
  const model = divisionWorking(task.a, task.b, task.decimalPlaces || 0);
  const width = model.digitText.length, dp = model.decimalPlaces;
  const short = task.type === 'short-division';
  const quotient = row(width, answerDigits(width, entered, done, 'Quotient', model.rawQuotient, model.steps[0].index, dp), 'quotient-row', '', dp);
  const dividend = short ? shortDividend(model, notes, done) : row(width, digits(model.digitText,width), 'dividend-row', String(task.b), dp);
  const remainderField = !dp ? `<label class="remainder-field">Remainder <input class="work-note" id="division-remainder" data-remainder inputmode="numeric" maxlength="2" placeholder="0" aria-label="Remainder" value="${esc(remainder)}" ${done?'disabled':''}></label>` : '';
  return `<div class="method-board arithmetic-paper division-board ${task.type}" style="--board-places:${width};--decimal-slots:${dp?1:0}" aria-label="${model.title} workspace"><div class="quotient-line">${quotient}</div>${dividend}${short?'':divisionRows(model, notes, done)}${remainderField}</div><p class="worksheet-caption">${dp?'Keep the decimal point above the decimal point.':short?'Work left to right. Carry small remainders beside the next digit; put any leftover in Remainder.':'Divide, multiply, subtract, bring down. Put any leftover in Remainder.'}</p>`;
}

export function multiplicationSolution(model) {
  const width = model.width, dp = model.decimalPlaces || 0;
  const long = model.partials.length > 1;
  const carries = values => values.some(Boolean) ? row(width, values.map(c => `<span>${c}</span>`), 'method-carries', '', dp) : '';
  const partials = long ? model.partials.map((part, i) => row(width, digits(part.value,width), 'partial-product-row', i?'+':'', dp) + carries(part.carries)).join('') : '';
  return `<div class="method-board arithmetic-paper multiply-board worked-board" style="--board-places:${width};--decimal-slots:${dp?1:0}" aria-label="Worked multiplication">${row(width,digits(String(model.a).padStart(dp+1,'0'),width),'','',dp)}${row(width,digits(model.b,width),'','×',dp).replace('method-decimal','method-decimal decimal-spacer')}${long?'<div class="method-rule"></div>'+partials:''}${row(width,digits(model.rawTotal,width),'method-answer','',dp)}${carries(long?model.sumCarries:model.partials[0].carries)}</div><p class="worksheet-caption">${long?'Multiply by the ones, then the tens. Add the two rows.':'Multiply from the right. Carry to the next column.'}</p>`;
}

export function divisionSolution(model) {
  const width = model.digitText.length;
  const dp = model.decimalPlaces || 0;
  const short = model.divisor < 10;
  const quotient = row(width, digits(String(model.rawQuotient).padStart(dp+1,'0'),width), 'quotient-row', '', dp);
  const remainder = model.remainder ? `<span class="remainder-field" aria-label="Remainder ${model.remainder}">r ${model.remainder}</span>` : '';
  const dividend = short ? shortDividend(model) : row(width, digits(model.digitText,width), 'dividend-row', String(model.divisor), dp);
  return `<div class="method-board arithmetic-paper division-board worked-board ${short?'short-division':'long-division'}" style="--board-places:${width};--decimal-slots:${dp?1:0}" aria-label="Worked ${model.title.toLowerCase()}"><div class="quotient-line">${quotient}${remainder}</div>${dividend}${short?'':divisionRows(model)}</div><p class="worksheet-caption">${mathText(`${model.quotient} × ${model.divisor}${model.remainder?` + ${model.remainder}`:''} = ${model.originalDividend}`)}</p>`;
}

// Shared by the match and its regression checks: working notes never form the answer.
export function writtenSubmission(task, entered, remainder = '') {
  const dp = task.type === 'multiply' ? decimalPlaces(task.a) : task.decimalPlaces || 0;
  const value = Number(entered.map(digit => digit || '0').join('')) / 10 ** dp;
  return task.needsRemainder || task.type!=='multiply'&&!dp&&Number(remainder)>0 ? `${value} r ${Number(remainder || 0)}` : value;
}
