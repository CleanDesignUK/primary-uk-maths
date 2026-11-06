import test from 'node:test';
import assert from 'node:assert/strict';
import {DAY,newProfile,questionPool,skillById,initialData,validateImport} from '../dist/engine.mjs';
import {syllabusIds,answerMatches} from '../dist/curriculum.mjs';
import {initLearning,nextAdaptive,recordLearning,progressCheckPlan,learningNotes} from '../dist/adaptive.mjs';
import {initCareer,buyItem,credits,validateCareer,ITEMS} from '../dist/career.mjs';
import {bankCareerXP,rewardCandidate,revealFact,rewardFactKey,initRewards,MATCH_SCHEMA} from '../dist/rewards.mjs';
import {writtenTask,divisionWorking,multiplicationWorking,divisionWorkspace,multiplicationWorkspace} from '../dist/written-work.mjs';
import {leagueTable} from '../dist/promotion.mjs';
const now=Date.UTC(2026,10,5,12);
const challenge=(profile,extra={})=>({id:'coach-1',schema:MATCH_SCHEMA,mode:'timed',curriculumYear:profile.year,target:10,attempts:10,complete:true,streak:1,rows:[],...extra});
const attempt=(profile,question,match,extra={})=>rewardCandidate(profile,question,match,{correct:true,assisted:false,now,...extra});

test('free choice, previews, warm-up and progress checks cannot mint career XP',()=>{
 const p=newProfile('Test',6),q=questionPool('add10')[4];
 for(const extra of [{manual:'add10'},{mode:'check',placement:true},{progressCheck:true},{promotion:true},{schema:'football-v4'}]){
  assert.equal(attempt(p,q,challenge(p,extra)),0);
  assert.equal(bankCareerXP(p,challenge(p,{...extra,rows:Array(10).fill({correct:true,careerCandidate:20})})),0);
 }
});
test('commuted facts, hints, intentional errors and round restarts cannot reset the reward window',()=>{
 const p=newProfile('Test',3),q=questionPool('table3').find(q=>q.b===4);
 const inverse={...q,a:12,b:4,op:'÷',answer:3,factFamily:true};
 assert.equal(rewardFactKey(q),rewardFactKey(inverse));
 assert.equal(attempt(p,q,challenge(p)),10);
 assert.equal(attempt(p,inverse,challenge(p,{id:'second'})),0);
 recordLearning(p,q,false,false,1000,'mistake',now+1000);
 assert.equal(attempt(p,q,challenge(p,{id:'second'}),{now:now+2000}),0);
 assert.equal(attempt(p,q,challenge(p),{now:now+DAY+1000}),14);
 const help=questionPool('add10')[11];revealFact(p,help,now);
 assert.equal(attempt(p,help,challenge(p),{now:now+1000}),0);
 assert.equal(attempt(p,help,challenge(p),{now:now+DAY}),10);
});
test('only a completed match banks the pending award, and the same round pays once',()=>{
 const p=newProfile('Test',3);p.pointsTotal=340;
 const rows=Array.from({length:10},(_,i)=>({correct:true,assisted:i===0,careerCandidate:i===0?2:10}));
 assert.equal(bankCareerXP(p,challenge(p,{rows,complete:false})),0);
 assert.equal(bankCareerXP(p,challenge(p,{rows,attempts:9})),0);
 assert.equal(bankCareerXP(p,challenge(p,{rows})),90);
 assert.equal(bankCareerXP(p,challenge(p,{rows})),0);
 assert.equal(p.pointsTotal,430);
});
test('switching the profile to an easier year keeps practice and blocks a second reward ladder',()=>{
 const p=newProfile('Test',6);initRewards(p);p.year=1;initRewards(p);
 assert.equal(p.rewardYear,6);assert.equal(attempt(p,questionPool('add10')[5],challenge(p)),0);
});
test('starter discounts preserve both previous catalogues and charge the new price once',()=>{
 const backup=initialData();
 for(const [catalogue,cost] of [[undefined,25],[2,125]]){
  const player=newProfile(`Previous ${cost}`,3);initCareer(player);player.pointsTotal=1500;
  player.inventory=['kit-blue'];player.look.kit='kit-blue';player.creditsSpent=cost;
  player.purchases=[{id:'kit-blue',cost,at:now,catalogue}];
  assert.ok(validateCareer(player));assert.equal(credits(player),150-cost);
  backup.profiles.push(player);
 }
 const starter=newProfile('Starter',3);initCareer(starter);starter.pointsTotal=150;
 assert.equal(buyItem(starter,'kit-blue').ok,false);
 assert.equal(buyItem(starter,'boots-power-7').ok,true);
 assert.equal(buyItem(starter,'boots-power-7').alreadyOwned,true);
 assert.equal(credits(starter),1);
 assert.deepEqual(starter.purchases.map(({catalogue,cost})=>[catalogue,cost]),[[3,14]]);
 backup.profiles.push(starter);
 assert.deepEqual(validateImport(structuredClone(backup)).profiles.map(credits),[125,25,1]);
 assert.ok(ITEMS.length>=60);assert.ok(ITEMS.filter(item=>item.slot==='hair').length>=10);
});
test('the new league omits easy legacy scores and zero XP rounds',()=>{
 const p=newProfile('Test',3);p.sessions=[challenge(p,{schema:'football-v4',ranked:true,careerXP:170,endedAt:now}),challenge(p,{id:'zero',ranked:true,careerXP:0,endedAt:now}),challenge(p,{id:'manual',ranked:true,manual:'add10',careerXP:50,endedAt:now})];
 assert.equal(leagueTable([p],{now}).length,0);
});
test('Year 6 Coach questions start in the selected year instead of assuming earlier gaps',()=>{
 const p=newProfile('Test',6);initLearning(p);p.placementComplete=true;
 const round={rows:[],seen:[],retries:[]};const ids=syllabusIds(6);let written=0;
 for(let i=0;i<10;i++){
  const next=nextAdaptive(p,round,now,()=>.47);assert.ok(ids.includes(next.q.skillId),next.q.skillId);
  written+=Number(['longMul6','longDiv6'].includes(next.q.skillId));
  round.rows.push({q:next.q,correct:true,reason:next.reason,newFact:next.newFact});round.seen.push(next.q.key);
  recordLearning(p,next.q,true,false,1400,'coach',now);
 }
 assert.ok(written>=2);
});
test('progress checks select practised skills and learning notes require difficulty across matches',()=>{
 const p=newProfile('Test',6),pool=questionPool('longMul6');initLearning(p);
 recordLearning(p,questionPool('place7')[0],true,false,2000,'warmup',now);
 assert.equal(progressCheckPlan(p).length,0);
 for(let i=0;i<6;i++)recordLearning(p,pool[i],false,false,2000,'one',now);
 assert.equal(learningNotes(p,now).length,0);assert.equal(progressCheckPlan(p).length,0);
 recordLearning(p,pool[6],false,false,2000,'two',now+1000);
 const note=learningNotes(p,now+1000).find(n=>n.id==='longMul6');assert.equal(note.next,'mul5');
 for(let i=0;i<6;i++)recordLearning(p,pool[i],true,false,2000,'three',now+2000);
 assert.deepEqual(progressCheckPlan(p),['longMul6']);
 assert.equal(learningNotes(p,now+2000).length,0);
 const next=nextAdaptive(p,{progressCheck:true,checkPlan:progressCheckPlan(p),rows:[]},now+3000,()=>.1);
 assert.equal(next.q.skillId,'longMul6');assert.ok(p.facts[next.q.key].history.some(row=>row.correct));
});
test('grown-up reports render a linked Coach drill for recent difficulties',async()=>{
 const {reportContent}=await import('../dist/academy-ui.mjs');
 const p=newProfile('Test',3),pool=questionPool('colSub2');
 assert.doesNotMatch(reportContent(p),/Skills to support/);
 for(let i=0;i<6;i++)recordLearning(p,pool[i],false,false,2000,i<3?'one':'two');
 const report=reportContent(p);
 assert.match(report,/Skills to support/);
 assert.match(report,/Check Subtraction across 10 first/);
 assert.match(report,/data-skill="bridgeSub" data-target="colSub2"/);
});
test('written multiplication and division workspaces match the entire integer question pools',()=>{
 for(const id of ['mulWritten3','mul4','mul5','longMul6','divWritten3','divide4','division5','longDiv6']){
  for(const q of questionPool(id)){
   const task=writtenTask(q);
   if(!task){assert.equal(id,'division5');assert.match(q.prompt,/Vans/);continue;}
   if(task.type==='multiply'){
    const model=multiplicationWorking(task.a,task.b);
    assert.equal(model.partials.reduce((sum,part)=>sum+part.value,0),q.answer);
    assert.match(multiplicationWorkspace(task),/Product ones column/);
   }else{
    const model=divisionWorking(task.a,task.b);
    assert.equal(model.quotient*task.b+model.remainder,task.a);
    assert.ok(answerMatches(q,task.needsRemainder?`${model.quotient} r ${model.remainder}`:model.quotient));
    assert.match(divisionWorkspace(task),/Quotient ones column/);
   }
  }
 }
 assert.ok(questionPool('longDiv6').some(q=>writtenTask(q)?.needsRemainder));
});

test('pupils carry into a receiving digit and the coach writes the final carry once', async () => {
 const {columnWorkspace} = await import('../dist/column-method.mjs');
 const {multiplicationSolution} = await import('../dist/written-work.mjs');
 const addition = columnWorkspace({a:68,b:57,answer:125,op:'+'});
 assert.match(addition,/Carry into tens column/);
 assert.doesNotMatch(addition,/Carry into (ones|hundreds) column/);
 const short = multiplicationWorking(97,8);
 assert.deepEqual(short.partials[0].carries,['','5','']);
 assert.equal((multiplicationSolution(short).match(/method-answer/g)||[]).length,1);
 const long = multiplicationWorking(98,76);
 assert.deepEqual(long.partials.map(p=>p.value),[588,6860]);
 assert.deepEqual(long.sumCarries,['1','1','','']);
 assert.match(multiplicationWorkspace({a:98,b:76}),/class="method-cell place-zero">0/);
});

test('bus-stop notes sit beside dividend digits and long division brings down in the same grid', async () => {
 const {divisionSolution} = await import('../dist/written-work.mjs');
 const short = divisionSolution(divisionWorking(945,7));
 assert.match(short,/<sup>2<\/sup><span>4<\/span>/);
 assert.match(short,/<sup>3<\/sup><span>5<\/span>/);
 const long = divisionSolution(divisionWorking(972,36));
 assert.match(long,/<span class="method-cell ">2<\/span><span class="method-cell ">5<\/span><span class="method-cell brought-digit">2<\/span>/);
 assert.match(long,/27 × 36 = 972/);
 const board = divisionWorkspace({a:1206,b:12,type:'long-division',needsRemainder:true});
 assert.equal((board.match(/division-rule/g)||[]).length,3);
 assert.match(board,/data-start-digit/);
 assert.match(board,/aria-label="Remainder"/);
});

test('a progress check only uses independently answered questions once',()=>{
 const p=newProfile('Test',5),pool=questionPool('mul5');
 for(const q of pool.slice(0,3))recordLearning(p,q,true,false,2000,'practice',now);
 recordLearning(p,pool[3],true,true,2000,'practice',now);
 const check={progressCheck:true,checkPlan:progressCheckPlan(p),rows:[],seen:[],retries:[{q:pool[3],at:0}]};
 const chosen=[];
 for(let i=0;i<3;i++){
  const next=nextAdaptive(p,check,now,()=>.2);
  assert.equal(next.reason,'check-in');
  chosen.push(next.q.key);
  check.seen.push(next.q.key);
  check.rows.push({q:next.q,correct:false});
 }
 assert.deepEqual(new Set(chosen),new Set(pool.slice(0,3).map(q=>q.key)));
 assert.equal(nextAdaptive(p,check,now),null);
});

test('skips and easy build-up questions cannot award career XP',()=>{
 const p=newProfile('Test',6),q=questionPool('division5')[0];
 assert.equal(attempt(p,q,challenge(p,{selection:{reason:'support'}})),0);
 assert.equal(attempt(p,q,challenge(p,{selection:{reason:'repair'}})),0);
 assert.equal(attempt(p,q,challenge(p),{correct:false}),0);
});

test('match objectives require independent goals and the corner mission uses both sides',async()=>{
 const {matchMission,missionProgress,spotlightZone}=await import('../dist/shot.mjs');
 assert.deepEqual([0,1,2,3].map(matchMission),['targets','corners','combo','targets']);
 assert.deepEqual([0,1,2].map(n=>spotlightZone('corners',n)),['left','right','left']);
 const hits=[
  {correct:true,targetHit:true,aim:'left'},
  {correct:true,targetHit:true,aim:'left'},
  {correct:true,assisted:true,targetHit:true,aim:'right'},
  {correct:false,targetHit:true,aim:'right'}
 ];
 assert.equal(missionProgress('corners',hits).value,1);
 assert.equal(missionProgress('targets',hits).value,2);
 hits.push({correct:true,targetHit:true,aim:'right'});
 assert.ok(missionProgress('corners',hits).complete);
 assert.ok(missionProgress('targets',hits).complete);
 assert.equal(missionProgress('combo',hits,2).complete,false);
 assert.ok(missionProgress('combo',hits,3).complete);
});
