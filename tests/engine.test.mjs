import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILLS,DAY,questionPool,poolForSkills,newProfile,initialData,recordFact,factSecure,selectQuestion,hasRegroup,columnSteps,skillStats,validateImport,dailySkills,profileSummary} from '../dist/engine.mjs';

test('the original 36 arithmetic activities have unique, correct questions',()=>{
 assert.equal(SKILLS.filter(s=>!s.extra).length,36);
 for(const s of SKILLS.filter(s=>!s.extra)){const pool=questionPool(s.id);assert.ok(pool.length>0,s.id);assert.equal(new Set(pool.map(q=>q.key)).size,pool.length,s.id);
  for(const q of pool){assert.ok(Number.isInteger(q.answer)&&q.answer>=0,s.id);if(q.op==='+')assert.equal(q.answer,q.a+q.b);if(q.op==='−')assert.equal(q.answer,q.a-q.b);if(q.op==='×')assert.equal(q.answer,q.a*q.b);if(q.op==='÷')assert.equal(q.answer,q.a/q.b);if(q.op==='bond')assert.equal(q.a+q.answer,q.total);if(q.op==='missing+')assert.equal(q.answer+q.b,q.total);if(q.op==='missing−')assert.equal(q.a-q.answer,q.total);if(q.op==='double')assert.equal(q.answer,2*q.a);if(q.op==='half')assert.equal(q.answer,q.a/2);if(q.op==='place')assert.equal(q.answer,Math.floor(q.a/q.power)%10*q.power);}
 }
});
test('foundations and crossing-ten boundaries match the exact intended skills',()=>{
 assert.ok(questionPool('add10').every(q=>q.a<10&&q.b<10&&q.answer<=10));
 assert.ok(questionPool('sub10').every(q=>q.a<10&&q.b<=q.a));
 assert.equal(questionPool('bridgeAdd').length,36);assert.ok(questionPool('bridgeAdd').every(q=>q.a>0&&q.a<10&&q.b>0&&q.b<10&&q.answer>10&&q.answer<=18));
 assert.equal(questionPool('bridgeSub').length,36);assert.ok(questionPool('bridgeSub').every(q=>q.a>10&&q.a<20&&q.b>q.a%10&&q.answer<10&&q.answer>=0));
 assert.ok(!questionPool('bridgeSub').some(q=>q.a===19),'19 minus one digit cannot cross below 10');
});
test('tables cover 1 to 12 individually and blend only the requested tables',()=>{
 for(let t=1;t<=12;t++){const pool=questionPool(`table${t}`);assert.equal(pool.length,12);assert.deepEqual(pool.map(q=>q.b),Array.from({length:12},(_,i)=>i+1));assert.ok(pool.every(q=>q.a===t));}
 assert.ok(questionPool('mix348').every(q=>[3,4,8].includes(q.a)));assert.equal(questionPool('mixAll').length,78);assert.equal(questionPool('divAll').length,144);
 assert.equal(poolForSkills(['table3','table4','table8']).length,33,'commuted facts share recall evidence');
});
test('every column difficulty respects its regrouping choice and produces a valid step-by-step solution',()=>{
 for(const s of SKILLS.filter(s=>s.category==='columns'))for(const q of questionPool(s.id)){
  assert.equal(hasRegroup(q.a,q.b,q.op),s.regroup,s.id);
  assert.equal(String(q.a).length,s.digits);const steps=columnSteps(q);const rebuilt=steps.reduce((n,st,i)=>n+st.result*10**i,0);assert.equal(rebuilt,q.answer,`${s.id}: ${q.a}${q.op}${q.b}`);
 }
 const zero=columnSteps({a:1000,b:27,op:'−'});assert.equal(zero[0].from,3);assert.match(zero[0].text,/through the zero columns/);assert.deepEqual(zero.map(s=>s.result),[3,7,9,0]);
});
test('one-day repetition cannot manufacture secure recall',()=>{
 const p=newProfile('A'),q=questionPool('table3')[0],now=new Date('2026-11-04T12:00:00Z').getTime();
 for(let i=0;i<50;i++)recordFact(p,q,true,false,1000,now+i*1000);
 assert.equal(p.facts[q.key].stage,1);assert.equal(p.facts[q.key].days.length,1);assert.equal(factSecure(p.facts[q.key]),false);assert.equal(p.facts[q.key].due,now+DAY);
});
test('reviews advance after spaced independent successes and mistakes reset the interval',()=>{
 const p=newProfile('A'),q=questionPool('table3')[0];let now=1_800_000_000_000;
 let f=recordFact(p,q,true,false,2000,now);assert.equal(f.stage,1);
 now=f.due;f=recordFact(p,q,true,false,2000,now);assert.equal(f.stage,2);
 now=f.due;f=recordFact(p,q,true,false,2000,now);assert.equal(f.stage,3);assert.ok(factSecure(f));
 f=recordFact(p,q,false,false,2000,now+1000);assert.equal(f.stage,0);assert.equal(factSecure(f),false);assert.equal(f.due,now+1000);
});
test('a hint never counts as independent success or secure recall',()=>{
 const p=newProfile('A'),q=questionPool('table8')[4];let now=1_800_000_000_000;
 for(let i=0;i<6;i++){recordFact(p,q,true,true,1000,now);now+=7*DAY;}
 const f=p.facts[q.key];assert.equal(f.stage,0);assert.equal(f.days.length,0);assert.equal(factSecure(f),false);assert.equal(skillStats(p,'table8').accuracy,0);
});
test('pupils have completely separate facts and sessions',()=>{
 const a=newProfile('Pupil A'),b=newProfile('Pupil B'),q=questionPool('add10')[0];recordFact(a,q,true,false,1000);assert.equal(Object.keys(b.facts).length,0);assert.equal(a.sessions.length,0);assert.notEqual(a.id,b.id);
});
test('adaptive practice avoids the last three facts and never leaves its selected pool',()=>{
 const p=newProfile('A'),seen=questionPool('table4').slice(0,3).map(q=>q.key),allowed=new Set(questionPool('table4').map(q=>q.key));
 for(let i=0;i<100;i++){const q=selectQuestion(p,['table4'],seen,Date.now(),()=>i/100);assert.ok(allowed.has(q.key));assert.ok(!seen.includes(q.key));}
});
test('daily route includes a number foundation and a focus table',()=>{
 const p=newProfile('A',3);const ids=dailySkills(p);assert.equal(ids.length,3);assert.ok(ids.includes('add10'));assert.ok(ids.includes('table3'));
});
test('valid backups round trip, malformed and duplicate profiles are rejected',()=>{
 const d=initialData();assert.equal(validateImport(JSON.parse(JSON.stringify(d))).profiles.length,3);
 assert.throws(()=>validateImport({version:99,profiles:[]}));
 const dup=structuredClone(d);dup.profiles[1].id=dup.profiles[0].id;assert.throws(()=>validateImport(dup));
 const broken=structuredClone(d);broken.profiles[0].facts.bad={attempts:3,correct:8,stage:0,due:0,days:[],history:[]};assert.throws(()=>validateImport(broken));
 const html=structuredClone(d);html.profiles[0].sessions.push({id:'bad',skillIds:['add10'],attempts:1,correct:1,points:'<script>',duration:60,elapsed:60,endedAt:Date.now(),complete:true,mode:'timed'});assert.throws(()=>validateImport(html));
});
test('fresh profiles never show invented scores or streaks',()=>{
 const s=profileSummary(newProfile('New'));assert.equal(s.sessions,0);assert.equal(s.todayCorrect,0);assert.equal(s.streak,0);assert.equal(s.factsSecure,0);
});
