import test from 'node:test';
import assert from 'node:assert/strict';
import {initialData,newProfile,validateImport} from '../dist/engine.mjs';
import {applyTrainingTimer,isUntimedMatch,trainingSeconds,timerOptions} from '../dist/training-timer.mjs';
import {matchTimeLeft,tickMatchClock} from '../dist/progression.mjs';
import {homeView} from '../dist/academy-ui.mjs';
import {bankCareerXP,isRewardRound,MATCH_SCHEMA} from '../dist/rewards.mjs';

const draft=(extra={})=>({schema:MATCH_SCHEMA,id:'saved-round',profileId:'player',curriculumYear:3,league:1,target:10,phase:'question',duration:120,elapsed:47,clockElapsed:32,attempts:2,rows:[{correct:true},{correct:false}],workTimeLeft:10,...extra});

test('existing profiles and old backups migrate short timers without changing progress',()=>{
 const data=initialData();
 data.profiles=[undefined,60,120,180,300,0].map((seconds,i)=>({...newProfile(`Player ${i}`,3),trainingSeconds:seconds,placementProgress:i,pointsTotal:100+i}));
 data.activeId=data.profiles[2].id;
 const restored=validateImport(structuredClone(data));
 assert.deepEqual(restored.profiles.map(p=>p.trainingSeconds),[180,180,180,180,300,0]);
 assert.equal(restored.activeId,data.activeId);
 restored.profiles.forEach((p,i)=>{assert.equal(p.placementProgress,i);assert.equal(p.pointsTotal,100+i);});
 assert.deepEqual(validateImport(JSON.parse(JSON.stringify(restored))),restored);
 assert.equal(newProfile('New player',1).trainingSeconds,180);
 for(const invalid of [-1,1,240,'300',null]){
  const broken=structuredClone(data);broken.profiles[0].trainingSeconds=invalid;
  assert.throws(()=>validateImport(broken),/training clock/);
 }
});

test('the chosen timer applies to Coach, tables, written practice and promotion matches',()=>{
 for(const value of [180,300,0])for(const type of [{},{tableChallenge:true},{manual:'add10'},{manual:'longDiv6'},{promotion:true},{curriculumYear:6}]){
  const round=applyTrainingTimer(draft(type),value);
  assert.equal(round.duration,value);
  assert.equal(isUntimedMatch(round),value===0);
 }
 for(const check of ['placement','progressCheck','coachDrill'])assert.equal(applyTrainingTimer(draft({[check]:true}),300).duration,0);
 assert.equal(trainingSeconds(120),180);
});

test('changing a saved timer retains answers and time already used, with separate comparison keys',()=>{
 const round=draft(),answers=structuredClone(round.rows);
 applyTrainingTimer(round,300);const fiveMinuteKey=round.recordKey;
 assert.equal(matchTimeLeft(round),268);
 assert.deepEqual(round.rows,answers);assert.equal(round.attempts,2);assert.equal(round.elapsed,47);
 applyTrainingTimer(round,180);assert.equal(matchTimeLeft(round),148);
 assert.notEqual(round.recordKey,fiveMinuteKey);
 applyTrainingTimer(round,0);assert.equal(round.workTimeLeft,0);assert.equal(matchTimeLeft(round),Infinity);
 assert.notEqual(round.recordKey,fiveMinuteKey);
 const restored=JSON.parse(JSON.stringify(round));
 tickMatchClock(restored,20);applyTrainingTimer(restored,300);
 assert.equal(matchTimeLeft(restored),248);assert.deepEqual(restored.rows,answers);
});

test('three and five minute clocks expire at the selected active-time budget and pause correctly',()=>{
 for(const duration of [180,300]){
  const round=applyTrainingTimer(draft({elapsed:0,clockElapsed:0,workTimeLeft:0}),duration);
  tickMatchClock(round,duration-1);assert.equal(matchTimeLeft(round),1);
  round.paused=true;tickMatchClock(round,100);assert.equal(matchTimeLeft(round),1);
  round.paused=false;round.phase='feedback';tickMatchClock(round,100);assert.equal(matchTimeLeft(round),1);
  round.phase='question';assert.equal(tickMatchClock(round,2),0);assert.equal(round.elapsed,duration);
 }
});

test('unlimited matches never time out, remain serialisable and retain elapsed practice time on resume',()=>{
 const round=applyTrainingTimer(draft({elapsed:0,clockElapsed:0}),0);
 assert.equal(tickMatchClock(round,3600),Infinity);assert.equal(round.elapsed,3600);
 const restored=JSON.parse(JSON.stringify(round));assert.equal(restored.duration,0);
 restored.paused=true;tickMatchClock(restored,500);assert.equal(restored.elapsed,3600);
 restored.paused=false;restored.phase='feedback';tickMatchClock(restored,500);assert.equal(restored.elapsed,3600);
 restored.phase='question';tickMatchClock(restored,30);assert.equal(restored.elapsed,3630);
 assert.equal(matchTimeLeft(restored),Infinity);assert.doesNotMatch(JSON.stringify(restored),/null|Infinity|NaN/);
});

test('unlimited Coach matches still bank eligible independent XP without replaying the reward',()=>{
 const p=newProfile('Unlimited player',3);p.placementComplete=true;
 const round=applyTrainingTimer(draft({profileId:p.id,mode:'timed',complete:true,attempts:10,correct:10,rows:Array.from({length:10},()=>({correct:true,assisted:false,careerCandidate:10}))}),0);
 assert.equal(isRewardRound(p,round),true);assert.equal(bankCareerXP(p,round),100);assert.equal(bankCareerXP(p,round),0);
});

test('the existing-player dashboard offers exactly the three timer choices and preserves unlimited',()=>{
 const p=newProfile('Existing player',3);p.trainingSeconds=0;
 const html=homeView(p),select=html.match(/<select[^>]*data-training-timer[^>]*>([\s\S]*?)<\/select>/)[1];
 assert.equal((select.match(/<option /g)||[]).length,3);
 assert.match(select,/<option value="0" selected>Unlimited<\/option>/);
 assert.match(select,/>3 minutes<\/option>/);assert.match(select,/>5 minutes<\/option>/);
 assert.match(html,/Match timer/);assert.match(html,/Saved for this player/);
 assert.match(timerOptions(120),/<option value="180" selected>/);
});
