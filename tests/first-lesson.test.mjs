import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,initialData,validateImport} from '../dist/engine.mjs';
import {initCareer,credits} from '../dist/career.mjs';
import {MATCH_SCHEMA,rewardCandidate,bankCareerXP,migrateFirstWarmupXP,grantStarterCredits,isRewardRound} from '../dist/rewards.mjs';
import {recordLearning,competency} from '../dist/adaptive.mjs';
import {recordLeague} from '../dist/promotion.mjs';
const now=Date.UTC(2026,10,8,18),qs=questionPool('add10').slice(1,5);
const warmup=(extra={})=>({id:'first-warmup',schema:MATCH_SCHEMA,placement:true,manual:null,mode:'check',curriculumYear:5,target:3,attempts:3,complete:true,streak:1,skillIds:['add10'],duration:300,elapsed:50,endedAt:now,points:20,correct:2,rows:[],...extra});

test('the first warm-up earns independent-answer XP alongside starter credits, without mastery or League points',()=>{
 const p=initCareer(newProfile('First',5)),round=warmup();
 round.rows=qs.slice(0,3).map((q,i)=>{
  const assisted=i===1,candidate=rewardCandidate(p,q,round,{correct:!assisted,assisted,now});
  recordLearning(p,q,!assisted,assisted,1200,round.id,now,false,assisted);
  return {q,correct:!assisted,assisted,unknown:assisted,careerCandidate:candidate};
 });
 assert.deepEqual(round.rows.map(r=>r.careerCandidate),[10,0,10]);
 round.careerXP=bankCareerXP(p,round);assert.equal(round.careerXP,20);assert.equal(p.pointsTotal,20);
 assert.equal(grantStarterCredits(p,round,now),10);assert.equal(credits(p),12);
 assert.equal(competency(p,'add10',now).secure,false);assert.equal(recordLeague(p,round),false);
 p.sessions.push(round);assert.equal(bankCareerXP(p,round),0);
 assert.equal(isRewardRound(p,warmup({id:'replay'})),false);
 p.year=6;assert.equal(isRewardRound(p,warmup({id:'next-year',curriculumYear:6})),false);
});

test('saving part of the first warm-up keeps its XP and completing the remainder pays only new answers',()=>{
 const p=initCareer(newProfile('First',5));
 const first=warmup({id:'part-one',target:2,attempts:1,complete:false,rows:[{q:qs[0],correct:true,careerCandidate:10}]});
 assert.equal(bankCareerXP(p,first),10);assert.equal(p.warmupXP.complete,false);
 p.sessions.push({...first,careerXP:10});
 const final=warmup({id:'part-two',target:1,attempts:1,rows:[{q:qs[1],correct:true,careerCandidate:10}]});
 assert.equal(bankCareerXP(p,final),10);assert.equal(p.pointsTotal,20);assert.equal(p.warmupXP.complete,true);assert.equal(grantStarterCredits(p,final,now),10);
 assert.equal(bankCareerXP(p,first),0);assert.equal(migrateFirstWarmupXP(p),0);
});

test('an all-help first warm-up earns zero XP and cannot be replayed for another first-lesson award',()=>{
 const p=newProfile('Help',5),round=warmup({correct:0,rows:qs.slice(0,3).map(q=>({q,correct:false,assisted:true,unknown:true,careerCandidate:0}))});
 assert.equal(bankCareerXP(p,round),0);assert.equal(p.warmupXP.complete,true);
 assert.equal(isRewardRound(p,warmup({id:'again'})),false);
});

test('saved zero-XP first warm-ups are credited once, preserving later XP, credits and learning evidence',()=>{
 const p=initCareer(newProfile('Existing',6));p.pointsTotal=70;p.starterReward={roundId:'first-warmup',credits:10,at:now};
 const round=warmup({careerXP:0,rows:[{q:qs[0],correct:true},{q:qs[1],correct:false,assisted:true,unknown:true},{q:qs[2],correct:true}]});
 p.sessions.push(round);const facts=JSON.stringify(p.facts),before=credits(p);
 assert.equal(migrateFirstWarmupXP(p),20);assert.equal(p.pointsTotal,90);assert.equal(credits(p),before+2);
 assert.equal(round.careerXP,20);assert.equal(JSON.stringify(p.facts),facts);
 assert.equal(migrateFirstWarmupXP(p),0);assert.equal(p.pointsTotal,90);
 assert.equal(p.warmupXP.year,5);assert.ok(p.rewardClaims[qs[0].key]||Object.keys(p.rewardClaims).length);
 const backup=initialData();backup.profiles=[p];assert.doesNotThrow(()=>validateImport(structuredClone(backup)));
 backup.profiles[0].warmupXP.xp=99999;assert.throws(()=>validateImport(backup),/Invalid first warm-up XP/);
});

test('partial old warm-ups and already-paid first lessons stay idempotent on repeated loads',()=>{
 const partial=initCareer(newProfile('Partial',5));partial.pointsTotal=0;
 partial.sessions=[warmup({attempts:1,complete:false,careerXP:0,rows:[{q:qs[0],correct:true}]})];
 assert.equal(migrateFirstWarmupXP(partial),10);const receipt=JSON.stringify(partial.warmupXP);
 assert.equal(migrateFirstWarmupXP(partial),0);assert.equal(JSON.stringify(partial.warmupXP),receipt);
 const paid=initCareer(newProfile('Paid',5));paid.pointsTotal=20;
 paid.sessions=[warmup({careerXP:20,rows:[{q:qs[0],correct:true},{q:qs[1],correct:false,assisted:true},{q:qs[2],correct:true}]})];
 assert.equal(migrateFirstWarmupXP(paid),0);assert.equal(paid.pointsTotal,20);assert.equal(paid.warmupXP.complete,true);
});

test('free practice and progress checks cannot masquerade as the first warm-up',()=>{
 const p=newProfile('Test',5);
 for(const changed of [{manual:'add10'},{progressCheck:true},{promotion:true},{placement:false},{schema:'football-v4'},{mode:'timed'}])assert.equal(isRewardRound(p,warmup(changed)),false);
});
