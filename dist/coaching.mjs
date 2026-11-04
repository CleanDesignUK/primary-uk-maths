import {columnSteps} from './engine.mjs';

// Numeric models keep every displayed jump and written step tied to the actual question.
export function workedExample(q){
 const {a,b,answer,op}=q;
 if(q.key.startsWith('column'))return {type:'columns',title:'Start on the right',steps:columnSteps(q)};
 if(q.visual?.type==='written'&&q.visual.op==='×'){const {a,b}=q.visual,ones=b%10,tens=Math.floor(b/10)*10;return {type:'longMultiply',title:'One place value at a time',a,b,partials:[{label:'Ones',factor:ones,value:a*ones},...(tens?[{label:'Tens',factor:tens,value:a*tens}]:[])],total:a*b};}
 const division=String(q.expression||'').match(/^(\d+)\s*÷\s*(\d+)/);
 if(division&&['longDiv6','division5','divide4','divWritten3'].includes(q.skillId))return divisionWorking(Number(division[1]),Number(division[2]));
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

export function divisionWorking(dividend,divisor){
 const digits=String(dividend).split('').map(Number),steps=[];let remainder=0,started=false;
 for(let i=0;i<digits.length;i++){
  const current=remainder*10+digits[i],digit=Math.floor(current/divisor),product=digit*divisor;
  if(current>=divisor||started||i===digits.length-1){steps.push({current,digit,product,remainder:current-product,bring:i<digits.length-1?digits[i+1]:null});started=true;}
  remainder=current-product;
 }
 return {type:'division',title:'Divide, multiply, subtract, bring down',dividend,divisor,quotient:Math.floor(dividend/divisor),remainder,steps};
}
export function workingText(q){const m=workedExample(q);if(m?.type==='division')return `${q.prompt}. ${m.dividend} divided by ${m.divisor}. `+m.steps.map(s=>`${s.current} divided by ${m.divisor} gives ${s.digit}. ${m.divisor} times ${s.digit} equals ${s.product}. ${s.current} minus ${s.product} equals ${s.remainder}. ${s.bring!==null?'Bring down '+s.bring+'.':''}`).join(' ')+` Quotient ${m.quotient}, remainder ${m.remainder}.`;if(m?.type==='longMultiply')return m.partials.map(p=>`${m.a} times ${p.factor} equals ${p.value}.`).join(' ')+` Total ${m.total}.`;return (q.hint||[]).join('. ');}
