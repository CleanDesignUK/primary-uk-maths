import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,DAY} from '../dist/engine.mjs';
import {initLearning,recordLearning,competency,nextAdaptive,resolvePrerequisite,probeIds,validateLearningGraph,laneFocus,coachRecommendation,nextFoundationCheck,matchRecommendation,roundRecommendation,teachingRoute} from '../dist/adaptive.mjs';
import {syllabusIds} from '../dist/curriculum.mjs';
import {SKILLS} from '../dist/engine.mjs';

const round=extra=>({rows:[],seen:[],retries:[],probeIndex:0,...extra});
const now=Date.UTC(2026,10,6,12);
function answer(p,id,correct=true,{count=3,assisted=false,at=now}={}){
 for(const q of questionPool(id).slice(0,count))recordLearning(p,q,correct,assisted,1000,'practice',at);
}
test('every curriculum family is mapped without cycles or later-year prerequisites',()=>assert.ok(validateLearningGraph()));
test('a new player stays at the chosen level and crossing 10 has specific foundations to check',()=>{
 const p=newProfile('Test',3);
 assert.equal(resolvePrerequisite(p,'bridgeAdd',now),'bridgeAdd');
 assert.deepEqual(coachRecommendation(p,'bridgeAdd',now),{id:'add10',target:'bridgeAdd',kind:'check'});
 assert.equal(coachRecommendation(p,'bridgeSub',now).id,'sub10');
});
test('the baseline samples all 12 probes once, without retries replacing the assessment slots',()=>{
 for(const year of [3,5]){const p=newProfile('Test',year);initLearning(p);const s=round({placement:true,retries:[{q:questionPool('add10')[0],at:0}]});const actual=[];for(let i=0;i<12;i++){const next=nextAdaptive(p,s);actual.push(next.q.skillId);assert.equal(next.reason,'probe');s.probeIndex++;s.rows.push({q:next.q,correct:i%2===0});s.seen.push(next.q.key);}assert.deepEqual(actual,probeIds(p));}
});
test('baseline arithmetic probes avoid uninformative zero and one identities',()=>{
 const p=newProfile('Test',3);initLearning(p);for(let i=0;i<20;i++){let s=round({placement:true,probeIndex:0});let q=nextAdaptive(p,s,Date.now(),()=>i/20).q;assert.ok(q.a>=3&&q.b>=2&&q.answer>=7);s.probeIndex=2;q=nextAdaptive(p,s,Date.now(),()=>i/20).q;assert.ok(q.b>=6&&q.b!==10);}
});
test('a slip with known foundations gets a fresh question after other shots',()=>{
 const p=newProfile('Test',3),q=questionPool('bridgeSub')[0];
 answer(p,'sub10');answer(p,'bonds10');
 const s=round({retries:[{q,at:3}],rows:[{q,correct:false}],seen:[q.key]});
 const first=nextAdaptive(p,s,now);
 assert.ok(!['repair','support'].includes(first.reason));
 s.rows.push({q:questionPool('table3')[0],correct:true},{q:questionPool('table4')[0],correct:true});
 const next=nextAdaptive(p,s,now);
 assert.equal(next.reason,'repair');assert.equal(next.q.skillId,q.skillId);
 assert.notEqual(next.q.key,q.key);assert.equal(next.retryKey,q.key);
});
test('Coach prefers observed trouble to an untested prerequisite and bypasses known steps',()=>{
 const p=newProfile('Test',3),q=questionPool('colSub2')[4];
 answer(p,'bridgeSub');answer(p,'place3',false);
 const s=round({rows:[{q,correct:false}],seen:[q.key]});
 const next=nextAdaptive(p,s,now,()=>.1);
 assert.equal(next.reason,'support');assert.equal(next.q.skillId,'place3');assert.equal(next.coachFor,'colSub2');
 assert.equal(coachRecommendation(p,'colSub2',now).kind,'practice');
});
test('assisted, repeated and old answers do not establish that a foundation is known',()=>{
 const p=newProfile('Test',3),q=questionPool('sub10')[4];
 answer(p,'sub10',true,{at:now-31*DAY});
 answer(p,'sub10',true,{assisted:true,count:1});
 for(let i=0;i<3;i++)recordLearning(p,q,true,false,1000,'repeat',now);
 assert.equal(coachRecommendation(p,'bridgeSub',now).id,'sub10');
 assert.equal(coachRecommendation(p,'bridgeSub',now).kind,'check');
});
test('a difficult foundation check defers the target and recommends focused practice',()=>{
 const p=newProfile('Test',3),q=questionPool('colSub2')[4],s=round({rows:[{q,correct:false}],seen:[q.key],retries:[{q,at:3}]});
 const check=nextAdaptive(p,s,now);
 assert.equal(check.q.skillId,'bridgeSub');
 const row={q:check.q,reason:check.reason,coachFor:check.coachFor,correct:false,unknown:true};
 s.rows.push(row);s.seen.push(check.q.key);
 recordLearning(p,check.q,false,false,1200,'match',now,false,true,check.coachFor);
 assert.equal(nextFoundationCheck(p,s,now),null);
 s.rows.push({q:questionPool('add10')[0],correct:true});
 assert.notEqual(nextAdaptive(p,s,now).q.skillId,q.skillId);
 assert.deepEqual(matchRecommendation(p,s.rows,now),{id:'bridgeSub',target:'colSub2',kind:'practice',path:['colSub2','bridgeSub']});
 assert.equal(resolvePrerequisite(p,'colSub2',now),'bridgeSub');
});
test('a passed check recommends a fresh original problem until it is solved independently',()=>{
 const p=newProfile('Test',3),q=questionPool('bridgeSub')[4],s=round({rows:[{q,correct:false}],seen:[q.key],retries:[{q,at:3}]});
 const check=nextAdaptive(p,s,now);
 assert.equal(check.q.skillId,'sub10');
 s.rows.push({q:check.q,reason:check.reason,coachFor:check.coachFor,correct:true});s.seen.push(check.q.key);
 assert.deepEqual(matchRecommendation(p,s.rows,now),{id:'bridgeSub',target:'bridgeSub',kind:'retry',path:['bridgeSub']});
 s.rows.push({q:questionPool('add10')[0],correct:true});
 const retry=nextAdaptive(p,s,now);
 assert.equal(retry.reason,'repair');assert.equal(retry.q.skillId,q.skillId);assert.notEqual(retry.q.key,q.key);
 s.rows.push({q:retry.q,correct:true});
 assert.equal(matchRecommendation(p,s.rows,now),null);
});
test('checks stay short and never replace manual, tables or assessment questions',()=>{
 const p=newProfile('Test',3),q=questionPool('colSub2')[4],rows=[{q,correct:false}];
 for(const mode of [{manual:'colSub2'},{tableChallenge:true},{placement:true},{progressCheck:true},{promotion:true},{target:1}]){
  assert.equal(nextFoundationCheck(p,round({rows,...mode}),now),null);
 }
 const checked=['bridgeAdd','place3'].map(id=>({q:questionPool(id)[0],reason:'support',correct:true}));
 assert.equal(nextFoundationCheck(p,round({rows:[...checked,...rows]}),now),null);
});
test('an inverse fact checks its own table and a replay keeps the table and format',()=>{
 const p=newProfile('Test',3),q=questionPool('div348').find(q=>q.b===8&&q.answer===7);
 const s=round({rows:[{q,correct:false}],seen:[q.key],retries:[{q,at:3}]});
 const check=nextAdaptive(p,s,now);
 assert.equal(check.q.skillId,'table8');assert.equal(check.q.op,'×');assert.notEqual(check.q.answer,q.a);
 s.rows.push({q:check.q,correct:true,reason:'support',coachFor:q.skillId},{q:questionPool('add10')[0],correct:true});
 s.seen.push(check.q.key);
 const next=nextAdaptive(p,s,now);
 assert.equal(next.reason,'repair');assert.equal(next.q.skillId,'div348');
 assert.equal(next.q.op,'÷');assert.equal(next.q.b,8);assert.notEqual(next.q.a,q.a);
});
test('the first Coach match can follow up a missed warm-up skill once',()=>{
 const p=newProfile('Test',6),q=questionPool('longDiv6')[4],s=round();
 p.placementComplete=true;
 recordLearning(p,q,false,false,1000,'warmup',now,true);
 const check=nextAdaptive(p,s,now);
 assert.equal(check.q.skillId,'division5');assert.equal(check.coachSource.key,q.key);
 recordLearning(p,check.q,true,false,1000,'coach',now+1,false,false,check.coachFor);
 assert.notEqual(nextAdaptive(p,s,now+1).reason,'support');
});
test('an untimed drill can lead back to its original skill after two distinct independent answers',()=>{
 const p=newProfile('Test',3),[one,two,three]=questionPool('bridgeSub');
 const drill={coachDrill:true,complete:true,manual:'bridgeSub',coachTarget:'colSub2',endedAt:now,
  rows:[{q:one,correct:false},{q:two,correct:true},{q:three,correct:true}]};
 assert.deepEqual(roundRecommendation(p,drill,now),{id:'colSub2',target:'colSub2',kind:'retry',path:['colSub2']});
 assert.equal(roundRecommendation(p,drill,now+31*DAY),null);
 drill.rows[2].assisted=true;
 assert.notEqual(roundRecommendation(p,drill,now)?.id,'colSub2');
 drill.rows[2]={q:two,correct:true};
 assert.notEqual(roundRecommendation(p,drill,now)?.id,'colSub2');
});
test('repeated difficulties trace a concept chain and stop at the first untested step',()=>{
 const p=newProfile('Test',5);
 for(const id of ['colSub4','colSub3','colSub2'])answer(p,id,false);
 const path=['colSub4','colSub3','colSub2','bridgeSub'];
 assert.deepEqual(teachingRoute(p,'colSub4',now),{id:'bridgeSub',target:'colSub4',kind:'check',path});
 assert.equal(resolvePrerequisite(p,'colSub4',now),'bridgeSub');
 const rows=questionPool('bridgeSub').slice(0,3).map(q=>({q,correct:true}));
 const drill={coachDrill:true,complete:true,manual:'bridgeSub',coachTarget:'colSub4',coachPath:path,endedAt:now,rows};
 assert.deepEqual(roundRecommendation(p,drill,now),{id:'colSub2',target:'colSub4',kind:'retry',path:path.slice(0,-1)});
});
test('Coach checks repeated weakness on a chosen-year target, with no automatic drop for a single slip',()=>{
 const p=newProfile('Test',6),q=questionPool('decimalMul6')[0],s=round();
 answer(p,q.skillId,false,{count:1});
 assert.equal(nextFoundationCheck(p,s,now,q),null);
 answer(p,q.skillId,false);
 assert.equal(nextFoundationCheck(p,s,now,q).id,'mul4');
 answer(p,'mul4');answer(p,'decimalPlace6');
 assert.equal(nextFoundationCheck(p,s,now,q),null);
});
test('a Year 5 warm-up starts at Year 5 and samples both written methods',()=>{
 const p=newProfile('Test',5);
 assert.equal(nextAdaptive(p,round({placement:true})).q.skillId,'place6');
 assert.ok(probeIds(p).includes('mul5'));
 assert.ok(probeIds(p).includes('division5'));
});
test('an unsure answer saves a gap without an invented fact attempt or an identical replay',()=>{
 const p=newProfile('Test',6), q=questionPool('longDiv6')[0], now=Date.now();
 const status=recordLearning(p,q,false,false,1500,'round',now,false,true);
 assert.equal(status.recent[0].unknown,true);
 assert.equal(status.correct,0);
 assert.equal(p.facts[q.key],undefined);
 const next=nextAdaptive(p,round({rows:[{q,unknown:true,correct:false}],seen:[q.key]}),now);
 assert.equal(next.reason,'support');
 assert.equal(next.q.skillId,'division5');
 assert.notEqual(next.q.key,q.key);
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
 assert.ok(competency(p,'add10').ready);assert.equal(competency(p,'add10').secure,false);assert.equal(coachRecommendation(p,'bridgeAdd',now).id,'bonds10');
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
