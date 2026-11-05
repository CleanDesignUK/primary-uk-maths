import {esc} from './visuals.mjs';
import {columnSteps} from './engine.mjs';

const places=['ones','tens','hundreds','thousands','ten-thousands','hundred-thousands'];
const labels=['O','T','H','Th','TTh','HTh'];
const singular=s=>s.replace(/s$/,'');
export function columnMethod(q){
 const n=Math.max(String(q.a).length,String(q.b).length,String(q.answer).length),top=String(q.a).padStart(n,' ').split('').reverse(),bottom=String(q.b).padStart(n,' ').split('').reverse(),values=top.map(v=>Number(v)),changes=Array.from({length:n},()=>[]),exchanges=[];
 if(q.op==='−')for(let i=0;i<n;i++){
  if(values[i]>=Number(bottom[i]))continue;
  let from=i+1;while(values[from]===0)from++;
  const before=[...values],record=(index,value)=>{values[index]=value;changes[index].push(value);};
  record(from,values[from]-1);
  for(let j=from-1;j>=i;j--){record(j,values[j]+10);if(j>i)record(j,values[j]-1);}
  exchanges.push({at:i,from,before,after:[...values],text:from===i+1?`Exchange 1 ${singular(places[from])} for 10 ${places[i]}.`:Array.from({length:from-i},(_,j)=>`Exchange 1 ${singular(places[from-j])} for 10 ${places[from-j-1]}.`).join(' Then ')});
 }
 const steps=columnSteps(q),answer=String(q.answer).padStart(n,' ').split('').reverse();
 const columns=Array.from({length:n},(_,index)=>({index:n-index-1,place:places[n-index-1],label:labels[n-index-1],top:top[n-index-1],bottom:bottom[n-index-1],answer:answer[n-index-1],changes:changes[n-index-1],carry:steps[n-index-1]?.incoming||0}));
 return {n,columns,steps,exchanges};
}
const row=(cells,kind='')=>`<div class="written-row ${kind}">${cells.join('')}</div>`;
const cell=(content,i,kind='')=>`<span class="written-cell ${kind}" data-column="${i}">${content}</span>`;
export function columnWorkspace(q,{digits=[],notes=[],history=[],done=false}={}){
 const m=columnMethod(q),sub=q.op==='−',correct=String(q.answer).padStart(m.n,'0');
 const heads=row(['<span></span>',...m.columns.map((c,i)=>cell(`<abbr title="${c.place}">${c.label}</abbr>`,i))],'written-heads');
 const noteRow=row(['<span></span>',...m.columns.map((c,i)=>{
  const hasNote=sub?c.top!==' ':c.index>0&&(c.top!==' '||c.bottom!==' ');
  if(!hasNote)return cell('',i);
  const previous=sub&&(history[i]||[]).length?`<span class="pupil-note-history">${history[i].map(n=>`<s>${esc(n)}</s>`).join('')}</span>`:'';
  const input=`<input class="column-note ${sub?'exchange-note':'carry-note'}" aria-label="${sub?'Exchanged value in':'Carry into'} ${c.place} column" inputmode="numeric" maxlength="${sub?2:1}" autocomplete="off" data-note="${i}" value="${esc(notes[i]??'')}" ${done?'disabled':''}>`;
  return cell(previous+input,i,'note-cell');
 })],sub?'exchange-row':'carry-row');
 const top=row(['<span></span>',...m.columns.map((c,i)=>cell(`<span class="operand-original ${sub&&notes[i]!==undefined&&notes[i]!==''?'crossed':''}" data-original="${i}">${c.top===' '?'&nbsp;':c.top}</span>`,i))]);
 const bottom=row([`<span class="written-operator">${q.op}</span>`,...m.columns.map((c,i)=>cell(c.bottom===' '?'&nbsp;':c.bottom,i))]);
 const answers=row(['<span></span>',...m.columns.map((c,i)=>cell(`<input class="column-digit ${done?(Number(digits[i]||0)===Number(correct[i])?'correct':'incorrect'):''}" id="digit-${i}" data-digit="${i}" aria-label="Answer ${c.place} column" inputmode="numeric" maxlength="1" autocomplete="off" value="${esc(digits[i]??'')}" ${done?'disabled':''}>`,i,'answer-cell'))],'written-answer-row');
 return `<div class="written-method arithmetic-paper workspace ${sub?'subtraction':'addition'}" style="--digits:${m.n}" aria-label="${q.op==='+'?'Column addition':'Column subtraction'} workspace">${heads}${sub?noteRow:''}${top}${bottom}${answers}${sub?'':noteRow}</div><p class="written-caption">${sub?'Exchange above the digit.':'Carry below the next column.'}</p>`;
}
export function columnWorked(q){
 const m=columnMethod(q),sub=q.op==='−';
 const heads=row(['<span></span>',...m.columns.map((c,i)=>cell(`<abbr title="${c.place}">${c.label}</abbr>`,i))],'written-heads');
 const regroup=sub&&m.exchanges.length?row(['<span></span>',...m.columns.map((c,i)=>cell(c.changes.length?`<span class="exchange-trail">${c.changes.map((value,j)=>j===c.changes.length-1?`<b>${value}</b>`:`<s>${value}</s>`).join('')}</span>`:'',i))],'exchange-row'):'';
 const top=row(['<span></span>',...m.columns.map((c,i)=>cell(`<span class="operand-original ${sub&&c.changes.length?'crossed':''}">${c.top===' '?'&nbsp;':c.top}</span>`,i))]);
 const bottom=row([`<span class="written-operator">${q.op}</span>`,...m.columns.map((c,i)=>cell(c.bottom===' '?'&nbsp;':c.bottom,i))]);
 const answer=row(['<span></span>',...m.columns.map((c,i)=>cell(c.answer===' '?'&nbsp;':c.answer,i))],'written-answer-row');
 const carries=!sub&&m.columns.some(c=>c.carry)?row(['<span></span>',...m.columns.map((c,i)=>cell(c.carry?`<b class="worked-carry">${c.carry}</b>`:'',i))],'carry-row'):'';
 const steps=m.steps.map((s,i)=>{const exchange=m.exchanges.find(e=>e.at===i),calculation=s.a===undefined?`Write the final ${s.result}.`:`${s.a} ${q.op} ${s.b}${s.incoming?' + '+s.incoming:''} = ${q.op==='+'?s.result+(s.carry||0)*10:s.result}`;return `<li><span class="method-step-number">${i+1}</span><div><b>${places[i][0].toUpperCase()+places[i].slice(1)}: ${calculation}</b>${exchange?`<p>${esc(exchange.text)}</p>`:s.carry?`<p>Write ${s.result}. Carry 1 ${singular(places[i+1])} into the next column.</p>`:''}</div></li>`;}).join('');
 return `<div class="written-method arithmetic-paper worked ${sub?'subtraction':'addition'}" style="--digits:${m.n}" aria-label="Worked ${q.a} ${q.op} ${q.b} equals ${q.answer}">${heads}${regroup}${top}${bottom}${answer}${carries}</div><ol class="written-steps">${steps}</ol><p class="written-check">${sub?`Check: ${q.answer} + ${q.b} = ${q.a}`:`Check: ${q.answer} − ${q.b} = ${q.a}`}</p>`;
}
