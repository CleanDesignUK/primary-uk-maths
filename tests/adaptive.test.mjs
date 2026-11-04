import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,DAY} from '../dist/engine.mjs';
import {initLearning,recordLearning,competency,nextAdaptive,resolvePrerequisite,probeIds,validateLearningGraph,laneFocus} from '../dist/adaptive.mjs';
import {syllabusIds} from '../dist/curriculum.mjs';
import {SKILLS} from '../dist/engine.mjs';

const round=extra=>({rows:[],seen:[],retries:[],probeIndex:0,...extra});
test('the prerequisite graph is complete and acyclic',()=>assert.ok(validateLearningGraph()));
test('crossing 10 routes to prerequisite number facts',()=>{
 const p=newProfile('Ace',3);initLearning(p);assert.equal(resolvePrerequisite(p,'bridgeAdd'),'add10');assert.equal(resolvePrerequisite(p,'bridgeSub'),'sub10');
});
test('the baseline samples all 12 probes once, without retries replacing the assessment slots',()=>{
 for(const year of [3,5]){const p=newProfile('Test',year);initLearning(p);const s=round({placement:true,retries:[{q:questionPool('add10')[0],at:0}]});const actual=[];for(let i=0;i<12;i++){const next=nextAdaptive(p,s);actual.push(next.q.skillId);assert.equal(next.reason,'probe');s.probeIndex++;s.rows.push({q:next.q,correct:i%2===0});s.seen.push(next.q.key);}assert.deepEqual(actual,probeIds(p));}
});
test('baseline arithmetic probes avoid uninformative zero and one identities',()=>{
 const p=newProfile('Cruz',5);initLearning(p);for(let i=0;i<20;i++){let s=round({placement:true,probeIndex:0});let q=nextAdaptive(p,s,Date.now(),()=>i/20).q;assert.ok(q.a>=3&&q.b>=2&&q.answer>=7);s.probeIndex=2;q=nextAdaptive(p,s,Date.now(),()=>i/20).q;assert.ok(q.b>=6&&q.b!==10);}
});
test('mistakes are retried after other questions, not immediately',()=>{
 const p=newProfile('Ace',3),q=questionPool('bridgeSub')[0];initLearning(p);const s=round({retries:[{q,at:3}],rows:[{q,correct:false}],seen:[q.key]});assert.notEqual(nextAdaptive(p,s).reason,'repair');
 s.rows.push({q:questionPool('table3')[0],correct:true},{q:questionPool('table4')[0],correct:true});s.seen.push('other-1','other-2','other-3');const next=nextAdaptive(p,s);assert.equal(next.reason,'repair');assert.equal(next.q.key,q.key);
});
test('two consecutive difficulties trigger a supporting skill',()=>{
 const p=newProfile('Ace',3);initLearning(p);const q=questionPool('bridgeSub')[4],s=round({rows:[{q,correct:false},{q,correct:false}]});const next=nextAdaptive(p,s);assert.equal(next.reason,'support');assert.equal(next.q.skillId,'sub10');
});
test('due facts receive spaced review slots and exclude facts already seen in the match',()=>{
 const p=newProfile('Ace',3),now=1_800_000_000_000,q=questionPool('table3')[7];initLearning(p);recordLearning(p,q,true,false,1000,'old',now-2*DAY);
 const s=round({rows:Array.from({length:3},()=>({correct:true,reason:'new'}))});const next=nextAdaptive(p,s,now);assert.equal(next.reason,'review');assert.equal(next.q.key,q.key);
 s.seen=[q.key];assert.notEqual(nextAdaptive(p,s,now).reason,'review');
});
test('manual syllabus drills stay within their chosen topic',()=>{
 const p=newProfile('Cruz',5);initLearning(p);const s=round({manual:'percent5'});for(let i=0;i<25;i++){const next=nextAdaptive(p,s);assert.equal(next.q.skillId,'percent5');s.seen.push(next.q.key);}
});
test('readiness allows progression before long-term mastery, with continued recall needed',()=>{
 const p=newProfile('Ace',3);initLearning(p);const pool=questionPool('add10'),now=Date.now();for(let i=0;i<8;i++)recordLearning(p,pool[i],true,false,1000,'one-session',now);
 assert.ok(competency(p,'add10').ready);assert.equal(competency(p,'add10').secure,false);assert.equal(resolvePrerequisite(p,'bridgeAdd'),'bonds10');
});
test('supported successes never establish independent readiness',()=>{
 const p=newProfile('Ace',3);initLearning(p);for(const q of questionPool('bonds10'))recordLearning(p,q,true,true,1000,'one-session');assert.equal(competency(p,'bonds10').ready,false);
});
test('calibration and training evidence remains individual to each player',()=>{
 const a=newProfile('Ace',3),c=newProfile('Carter',3);initLearning(a);initLearning(c);recordLearning(a,questionPool('table3')[0],true,false,1000,'a');assert.equal(competency(a,'table3').n,1);assert.equal(competency(c,'table3').n,0);
});
test('small construction pools can establish readiness without impossible coverage thresholds',()=>{
 const p=newProfile('Ace',3);initLearning(p);const pool=questionPool('draw3');for(let i=0;i<8;i++)recordLearning(p,pool[i%pool.length],true,false,1000,'practice');assert.ok(competency(p,'draw3').ready);assert.equal(competency(p,'draw3').secure,false);
});
test('the curriculum lane can progress through the full year map, rather than a permanent small shortlist',()=>{
 const p=newProfile('Cruz',5);initLearning(p);const now=Date.now();
 for(const s of SKILLS){const pool=questionPool(s.id);for(let i=0;i<8;i++)recordLearning(p,pool[i%pool.length],true,false,1000,'seed',now);}
 const selected=new Set();for(let i=0;i<100;i++){const id=laneFocus(p,'curriculum');selected.add(id);recordLearning(p,questionPool(id)[0],true,false,1000,'next',now);}
 for(const id of syllabusIds(5).filter(id=>SKILLS.find(s=>s.id===id).extra))assert.ok(selected.has(id),`${id} must eventually be selected`);
});
