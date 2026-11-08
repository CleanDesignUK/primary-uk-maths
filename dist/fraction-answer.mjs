import {esc} from './visuals.mjs?v=7.1.1';

export const takesFraction = question => question.format === 'fraction' || question.format === 'mixed';

// Restore answers saved before the separate fields were introduced.
export function fractionParts(answer = '', {mixed = false, completed = false} = {}) {
 const text = String(answer).trim().replace(/−/g, '-');
 const stack = text.match(/^(?:(-?\d+)\s+)?(-?\d*)\s*\/\s*(\d*)$/);
 if(stack) return {whole:stack[1] ?? (mixed ? '' : null), numerator:stack[2], denominator:stack[3]};
 const unfinishedMixed = mixed && text.match(/^(-?\d+)\s+(\d*)$/);
 if(unfinishedMixed) return {whole:unfinishedMixed[1], numerator:unfinishedMixed[2], denominator:''};
 if(mixed || completed && text) return {whole:text, numerator:'', denominator:''};
 return {whole:null, numerator:text, denominator:''};
}

export function fractionSubmission(parts, mixed = false) {
 const whole = (parts.whole ?? '').trim().replace('−', '-');
 const numerator = parts.numerator.trim().replace('−', '-');
 const denominator = parts.denominator.trim();
 const integer = /^-?\d+$/;
 if(mixed && !whole) return {field:'whole', message:'Add the whole number.'};
 if(whole && !integer.test(whole)) return {field:'whole', message:'Use a whole number.'};
 if(whole && !numerator && !denominator && !mixed) return {value:whole};
 if(!integer.test(numerator)) return {field:'numerator', message:numerator ? 'Use a whole number on top.' : 'Add the top number.'};
 if(!/^\d+$/.test(denominator) || Number(denominator) === 0) {
  return {field:'denominator', message:denominator ? 'Use 1 or more on the bottom.' : 'Add the bottom number.'};
 }
 if(whole && (Number(numerator) < 0 || Number(numerator) >= Number(denominator))) {
  return {field:'numerator', message:'For a mixed number, use a top number smaller than the bottom number.'};
 }
 return {value:`${whole ? whole + ' ' : ''}${numerator}/${denominator}`};
}

export function fractionAnswerMarkup(parts, {mixed, done, correct}) {
 const hasWhole = parts.whole !== null;
 const status = done ? correct ? 'correct' : 'incorrect' : '';
 const field = (part, label, accessibleLabel = label) => `<label class="fraction-part fraction-part-${part}"><span>${label}</span><input class="answer-input ${status}" id="fraction-${part}" data-fraction-part="${part}" aria-label="${accessibleLabel}" inputmode="numeric" autocomplete="off" maxlength="9" value="${esc(parts[part])}" placeholder="?" ${done ? 'disabled' : ''}></label>`;
 return `<div class="fraction-answer" role="group" aria-label="Your fraction answer"><div class="fraction-parts">${hasWhole ? field('whole','Whole number') : ''}<div class="fraction-stack">${field('numerator','Top number','Numerator (top number)')}<span class="fraction-rule" aria-hidden="true"></span>${field('denominator','Bottom number','Denominator (bottom number)')}</div></div>${!mixed && !done ? `<button type="button" class="text-btn fraction-whole-toggle" data-action="fraction-whole" aria-expanded="${hasWhole}">${hasWhole ? 'Remove whole number' : '+ Whole number'}</button>` : ''}</div>`;
}
