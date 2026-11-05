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
  const width = String(a * b).length;
  const multiplicand = [...String(a)].reverse().map(Number);
  const partials = [...String(b)].reverse().map((digit, shift) => {
    const factor = Number(digit) * 10 ** shift;
    const carries = Array(width).fill('');
    let carry = 0;
    for (let i = 0; i < multiplicand.length; i++) {
      carry = Math.floor((multiplicand[i] * Number(digit) + carry) / 10);
      const nextColumn = width - 2 - i - shift;
      if (carry && nextColumn >= 0) carries[nextColumn] = String(carry);
    }
    return {label: shift ? 'Tens' : 'Ones', factor, value: a * factor, carries, shift};
  });
  return {type:'longMultiply', title:'Multiply in columns', a, b, partials, total:a*b, width};
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
function answerDigits(width, entered, done, label, expected) {
  const correct = String(expected).padStart(width,'0');
  return Array.from({length:width}, (_, i) => {
    const place = placeNames[width-i-1] || `digit ${i+1}`;
    const status = done ? (Number(entered[i] || 0) === Number(correct[i]) ? 'correct' : 'incorrect') : '';
    return `<input class="column-digit ${status}" id="digit-${i}" data-digit="${i}" aria-label="${label} ${place} column" inputmode="numeric" maxlength="1" value="${esc(entered[i] || '')}" autocomplete="off" ${done ? 'disabled' : ''}>`;
  });
}

export function multiplicationWorkspace(task, {entered = [], notes = {}, done = false} = {}) {
  const model = multiplicationWorking(task.a, task.b);
  // Use the operand widths so the blank board does not reveal the answer's length.
  const width = String(task.a).length + String(task.b).length;
  const work = model.partials.map(({label, shift}, index) => {
    const fields = Array.from({length:width}, (_, i) => i >= width-shift ? '<span class="method-cell place-zero">0</span>' : noteField(`product-${index}-${i}`, `${label} row, ${placeNames[width-i-1]} column`, notes[`product-${index}-${i}`], done));
    const carryFields = Array.from({length:width}, (_, i) => i >= width-shift ? '<span></span>' : noteField(`carry-${index}-${i}`, `${label} carry, ${placeNames[width-i-1]} column`, notes[`carry-${index}-${i}`], done));
    return `<div class="partial-work"><small>${label} row</small>${row(width, fields, '', index ? '+' : '')}${row(width, carryFields, 'method-carries', 'Carry')}</div>`;
  }).join('');
  const answer = row(width, answerDigits(width, entered, done, 'Product', model.total), 'method-answer');
  return `<div class="method-board multiply-board" aria-label="Written multiplication workspace">${row(width,digits(task.a,width))}${row(width,digits(task.b,width),'','×')}<div class="method-rule"></div>${model.partials.length > 1 ? work : row(width, Array.from({length:width}, (_, i) => noteField(`carry-0-${i}`, `Carry, ${placeNames[width-i-1]} column`, notes[`carry-0-${i}`],done)), 'method-carries','Carry')}<div class="method-final"><small>Answer</small>${answer}</div></div><p class="worksheet-caption">${task.b >= 10 ? 'Multiply by the ones, then the tens. Add both rows.' : 'Start with the ones. Write any carries in the small boxes.'}</p>`;
}

export function divisionWorkspace(task, {entered = [], notes = {}, done = false, remainder = ''} = {}) {
  const width = String(task.a).length;
  const model = divisionWorking(task.a,task.b);
  const quotient = row(width, answerDigits(width,entered,done,'Quotient',model.quotient),'quotient-row');
  const dividend = row(width,digits(task.a,width),'dividend-row',String(task.b));
  let work = '';
  if (task.type === 'short-division') {
    const carries = Array.from({length:width},(_, i) => i ? noteField(`rem-carry-${i}`,`Remainder carried to digit ${i+1}`,notes[`rem-carry-${i}`],done) : '<span></span>');
    work = row(width,carries,'method-carries short-carries','Carry');
  } else {
    const count = width - String(task.b).length + 1;
    work = Array.from({length:count}, (_, step) => {
      const end = String(task.b).length + step - 1;
      const fields = (kind,label,limit) => Array.from({length:width},(_,i) => i <= limit ? noteField(`${kind}-${step}-${i}`,`${label} ${step+1}, digit ${i+1}`,notes[`${kind}-${step}-${i}`],done) : '<span></span>');
      return `<div class="division-work-step"><small>Step ${step+1}</small>${row(width,fields('back','Multiply back',end),'division-product','−')}${row(width,fields('down','Subtract and bring down',Math.min(width-1,end+1)),'division-difference')}</div>`;
    }).join('');
  }
  const remainderField = task.needsRemainder ? `<label class="remainder-field">Remainder <input class="work-note" id="division-remainder" data-remainder inputmode="numeric" maxlength="2" aria-label="Remainder" value="${esc(remainder)}" ${done?'disabled':''}></label>` : '';
  return `<div class="method-board division-board ${task.type}" aria-label="${model.title} workspace"><small>Quotient</small>${quotient}${task.type==='short-division'?work:''}${dividend}${task.type==='long-division'?work:''}${remainderField}</div><p class="worksheet-caption">${task.type==='short-division'?'Divide from the left. Carry the remainder to the next digit.':'Divide, multiply back, subtract, then bring down.'}</p>`;
}

export function multiplicationSolution(model) {
  const width = model.width;
  const partials = model.partials.map((part,i) => `<div class="partial-work"><small>${part.label} · ${model.a} × ${part.factor}</small>${row(width,digits(part.value,width),'',i?'+':'')}${row(width,part.carries.map(c=>`<span>${c}</span>`),'method-carries','Carry')}</div>`).join('');
  return `<div class="method-board multiply-board worked-board">${row(width,digits(model.a,width))}${row(width,digits(model.b,width),'','×')}<div class="method-rule"></div>${partials}${row(width,digits(model.total,width),'method-answer')}</div><p class="worksheet-caption">${model.partials.length>1?'The tens row starts one place to the left. Add the two products.':'Multiply each digit from the right. Carry to the next column.'}</p>`;
}

export function divisionSolution(model) {
  const width = String(model.dividend).length;
  const short = model.divisor < 10;
  const carries = Array(width).fill('');
  model.steps.forEach(step => { if (step.carry) carries[step.index] = String(step.carry); });
  const steps = model.steps.map((step,i) => `<div class="division-work-step"><small>${i+1}. ${step.current} ÷ ${model.divisor} gives ${step.digit}</small>${row(width,digits(step.product,width,step.index),'division-product','−')}${row(width,digits(step.remainder,width,step.index),'division-difference')}${step.bring!==null?`<small>Bring down ${step.bring} to make ${step.remainder*10+step.bring}.</small>`:''}</div>`).join('');
  return `<div class="method-board division-board worked-board">${row(width,digits(model.quotient,width),'quotient-row')}${short?row(width,carries.map(c=>`<span>${c}</span>`),'method-carries','Carry'):''}${row(width,digits(model.dividend,width),'dividend-row',String(model.divisor))}${short?'':steps}</div><p class="worksheet-caption">${mathText(`${model.quotient} × ${model.divisor} + ${model.remainder} = ${model.dividend}`)}${model.remainder?` · Remainder ${model.remainder}`:''}</p>`;
}
