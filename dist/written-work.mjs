import {esc, mathText} from './visuals.mjs';

const divisionSkills = new Set(['divWritten3', 'divide4', 'division5', 'longDiv6']);
const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

export function writtenTask(question) {
  if (question.visual?.type === 'written' && question.visual.op === '×') {
    const {a, b} = question.visual;
    return {type: 'multiply', a, b};
  }
  if (!divisionSkills.has(question.skillId)) return null;
  const match = String(question.expression || '').match(/^(\d+)\s*÷\s*(\d+)/);
  if (!match) return null;
  const [, dividend, divisor] = match;
  return {
    type: Number(divisor) < 10 ? 'short-division' : 'long-division',
    a: Number(dividend), b: Number(divisor),
    needsRemainder: /^\d+\s*r\s*\d+$/.test(String(question.answer))
  };
}

export function multiplicationWorking(a, b) {
  const width = Math.max(String(a).length, String(b).length, String(a * b).length);
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
  return {type:'longMultiply', title:'Multiply in columns', a, b, partials, sumCarries, total:a*b, width};
}

export function divisionWorking(dividend, divisor) {
  const digits = [...String(dividend)].map(Number);
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
  return {type:'division', title:divisor < 10 ? 'Short division' : 'Long division', dividend, divisor, quotient:Math.floor(dividend / divisor), remainder, steps};
}

function row(width, content, css = '', prefix = '') {
  return `<div class="method-row ${css}" style="--places:${width}"><span class="method-prefix">${prefix}</span>${content.join('')}</div>`;
}
function digits(value, width, end = width - 1) {
  const left = String(value).padStart(end + 1, ' ');
  return [...left.padEnd(width, ' ')].map(digit => `<span class="method-cell">${digit === ' ' ? '&nbsp;' : esc(digit)}</span>`);
}
function noteField(key, label, value, done, maxlength = 1) {
  return `<input class="work-note" data-work="${esc(key)}" aria-label="${esc(label)}" inputmode="numeric" maxlength="${maxlength}" value="${esc(value || '')}" ${done ? 'disabled' : ''} autocomplete="off">`;
}
function answerDigits(width, entered, done, label, expected, start = 0) {
  const correct = String(expected).padStart(width,'0');
  return Array.from({length:width}, (_, i) => {
    const place = placeNames[width-i-1] || `digit ${i+1}`;
    const status = done ? (Number(entered[i] || 0) === Number(correct[i]) ? 'correct' : 'incorrect') : '';
    return `<input class="column-digit ${status}" id="digit-${i}" data-digit="${i}" aria-label="${label} ${place} column" inputmode="numeric" maxlength="1" value="${esc(entered[i] || '')}" autocomplete="off" ${i === start ? 'data-start-digit' : ''} ${done ? 'disabled' : ''}>`;
  });
}

function multiplicationCarries(task, width, shift, key, label, notes, done) {
  const start = width - String(task.a).length - shift;
  const end = width - 1 - shift;
  return row(width, Array.from({length:width}, (_, i) => i >= start && i < end
    ? noteField(`${key}-${i}`, `${label}, ${placeNames[width-i-1]} column`, notes[`${key}-${i}`], done)
    : '<span></span>'), 'method-carries');
}

export function multiplicationWorkspace(task, {entered = [], notes = {}, done = false} = {}) {
  const model = multiplicationWorking(task.a, task.b);
  // Use the operand widths so the blank board does not reveal the answer's length.
  const width = String(task.a).length + String(task.b).length;
  const long = model.partials.length > 1;
  const work = long ? model.partials.map(({label, shift}, index) => {
    const fields = Array.from({length:width}, (_, i) => i >= width-shift ? '<span class="method-cell place-zero">0</span>' : noteField(`product-${index}-${i}`, `${label} row, ${placeNames[width-i-1]} column`, notes[`product-${index}-${i}`], done));
    return row(width, fields, 'partial-product-row', index ? '+' : '') +
      multiplicationCarries(task, width, shift, `carry-${index}`, `${label} carry into`, notes, done);
  }).join('') : '';
  const carries = long
    ? row(width, Array.from({length:width}, (_, i) => i < width-1
      ? noteField(`sum-${i}`, `Addition carry into ${placeNames[width-i-1]} column`, notes[`sum-${i}`], done)
      : '<span></span>'), 'method-carries')
    : multiplicationCarries(task, width, 0, 'carry-0', 'Carry into', notes, done);
  const answer = row(width, answerDigits(width, entered, done, 'Product', model.total, width-1), 'method-answer');
  return `<div class="method-board arithmetic-paper multiply-board" aria-label="Written multiplication workspace">${row(width,digits(task.a,width))}${row(width,digits(task.b,width),'','×')}${long?'<div class="method-rule"></div>'+work:''}${answer}${carries}</div><p class="worksheet-caption">${long ? 'Ones row, tens row, then add.' : 'Carry below the next column.'}</p>`;
}

function shortDividend(model, notes, done) {
  const digits = [...String(model.dividend)];
  const carries = new Map(model.steps.map(step => [step.index, step.carry]));
  return row(digits.length, digits.map((digit, i) => {
    const carry = notes ? (i ? noteField(`rem-carry-${i}`, `Remainder carried to digit ${i+1}`, notes[`rem-carry-${i}`], done) : '')
      : (carries.get(i) ? `<sup>${carries.get(i)}</sup>` : '');
    return `<span class="method-cell bus-digit">${carry}<span>${digit}</span></span>`;
  }), 'dividend-row', String(model.divisor));
}

function divisionRows(model, notes, done) {
  const width = String(model.dividend).length;
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
  const width = String(task.a).length;
  const model = divisionWorking(task.a, task.b);
  const short = task.type === 'short-division';
  const quotient = row(width, answerDigits(width, entered, done, 'Quotient', model.quotient, model.steps[0].index), 'quotient-row');
  const dividend = short ? shortDividend(model, notes, done) : row(width, digits(task.a,width), 'dividend-row', String(task.b));
  const remainderField = task.needsRemainder ? `<label class="remainder-field">r <input class="work-note" id="division-remainder" data-remainder inputmode="numeric" maxlength="2" aria-label="Remainder" value="${esc(remainder)}" ${done?'disabled':''}></label>` : '';
  return `<div class="method-board arithmetic-paper division-board ${task.type}" aria-label="${model.title} workspace"><div class="quotient-line">${quotient}${remainderField}</div>${dividend}${short?'':divisionRows(model, notes, done)}</div><p class="worksheet-caption">${short?'Write remainders small beside the next digit.':'Divide, multiply, subtract, bring down.'}</p>`;
}

export function multiplicationSolution(model) {
  const width = model.width;
  const long = model.partials.length > 1;
  const carries = values => values.some(Boolean) ? row(width, values.map(c => `<span>${c}</span>`), 'method-carries') : '';
  const partials = long ? model.partials.map((part, i) => row(width, digits(part.value,width), 'partial-product-row', i?'+':'') + carries(part.carries)).join('') : '';
  return `<div class="method-board arithmetic-paper multiply-board worked-board" aria-label="Worked multiplication">${row(width,digits(model.a,width))}${row(width,digits(model.b,width),'','×')}${long?'<div class="method-rule"></div>'+partials:''}${row(width,digits(model.total,width),'method-answer')}${carries(long?model.sumCarries:model.partials[0].carries)}</div><p class="worksheet-caption">${long?'Multiply by the ones, then the tens. Add the two rows.':'Multiply from the right. Carry to the next column.'}</p>`;
}

export function divisionSolution(model) {
  const width = String(model.dividend).length;
  const short = model.divisor < 10;
  const quotient = row(width, digits(model.quotient,width), 'quotient-row');
  const remainder = model.remainder ? `<span class="remainder-field" aria-label="Remainder ${model.remainder}">r ${model.remainder}</span>` : '';
  const dividend = short ? shortDividend(model) : row(width, digits(model.dividend,width), 'dividend-row', String(model.divisor));
  return `<div class="method-board arithmetic-paper division-board worked-board ${short?'short-division':'long-division'}" aria-label="Worked ${model.title.toLowerCase()}"><div class="quotient-line">${quotient}${remainder}</div>${dividend}${short?'':divisionRows(model)}</div><p class="worksheet-caption">${mathText(`${model.quotient} × ${model.divisor}${model.remainder?` + ${model.remainder}`:''} = ${model.dividend}`)}</p>`;
}
