import {columnSteps} from './engine.mjs?v=7.1.1';
import {writtenTask,multiplicationWorking,divisionWorking} from './written-work.mjs?v=7.1.1';
export {divisionWorking} from './written-work.mjs?v=7.1.1';

// Numeric models keep every displayed jump and written step tied to the actual question.
export function workedExample(q){
 const {a,b,answer,op}=q;
 if(q.key.startsWith('column'))return {type:'columns',title:'Start on the right',steps:columnSteps(q)};
 const task=writtenTask(q);
 if(task) return task.type==='multiply'?multiplicationWorking(task.a,task.b):divisionWorking(task.a,task.b,task.decimalPlaces||0);
 if(op==='+'&&a<10&&b<10&&answer>10){
  const first=10-a,rest=b-first;
  return {type:'bridge',title:'Make 10 first',points:[a,10,answer],jumps:[first,rest],steps:[`${a} + ${first} = 10`,`10 + ${rest} = ${answer}`],parts:[first,rest],whole:b};
 }
 if(op==='−'&&a>10&&a<20&&answer<10){
  const first=a-10,rest=b-first;
  return {type:'bridge',title:'Back through 10',points:[a,10,answer],jumps:[-first,-rest],steps:[`${a} − ${first} = 10`,`10 − ${rest} = ${answer}`],parts:[first,rest],whole:b};
 }
 if(op==='×')return {type:'groups',title:'Equal groups',groups:a,each:b,total:answer,steps:[`${a} groups of ${b}`,`${a} × ${b} = ${answer}`,`${b} × ${a} = ${answer}`]};
 if(op==='÷')return {type:'groups',title:'Turn the fact around',groups:answer,each:b,total:a,steps:[`${answer} groups of ${b}`,`${b} × ${answer} = ${a}`,`${a} ÷ ${b} = ${answer}`]};
 if(op==='bond')return {type:'parts',title:`Make ${q.total}`,parts:[a,answer],whole:q.total,steps:[`${q.total} − ${a} = ${answer}`,`${a} + ${answer} = ${q.total}`]};
 if((op==='+'||op==='−')&&a<20&&b<10)return {type:'counters',title:op==='+'?'Put the parts together':'Take away',total:op==='+'?answer:a,split:op==='+'?a:answer,subtract:op==='−',steps:[`${a} ${op} ${b} = ${answer}`]};
 return null;
}

export function workingText(q){const m=workedExample(q);if(m?.type==='division')return `${q.prompt}. ${m.originalDividend} divided by ${m.divisor}. ${m.decimalPlaces?'Keep the decimal point in the quotient directly above the decimal point in the dividend.':''} `+m.steps.map(s=>`${s.current} divided by ${m.divisor} gives ${s.digit}. ${m.divisor} times ${s.digit} equals ${s.product}. ${s.current} minus ${s.product} equals ${s.remainder}. ${s.bring!==null?'Bring down '+s.bring+'.':''}`).join(' ')+` Quotient ${m.quotient}, remainder ${m.remainder}.`;if(m?.type==='longMultiply')return (m.decimalPlaces?`First multiply the digits without the decimal point. `:'')+m.partials.map(p=>`${m.a} times ${p.factor} equals ${p.value}.`).join(' ')+` ${m.decimalPlaces?`Place the decimal point ${m.decimalPlaces} places from the right. `:''}Total ${m.total}.`;return (q.hint||[]).join('. ');}
