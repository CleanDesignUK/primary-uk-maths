import test from 'node:test';
import assert from 'node:assert/strict';
import {earnedXP,eligibleRecord,newPersonalBest} from '../dist/rewards.mjs';
const match=extra=>({schema:'football-v2',complete:true,mode:'timed',hintsUsed:0,pausedEver:false,attempts:10,correct:10,points:170,elapsed:60,...extra});
test('scoring rewards independent accuracy and caps the streak bonus',()=>{assert.equal(earnedXP(true,false,1),10);assert.equal(earnedXP(true,false,3),14);assert.equal(earnedXP(true,false,100),20);assert.equal(earnedXP(true,true,9),0);assert.equal(earnedXP(false,false,9),0);});
test('only complete unassisted unpaused timed matches qualify for personal records',()=>{assert.ok(eligibleRecord(match()));for(const changed of [{complete:false},{hintsUsed:1},{pausedEver:true},{mode:'check'},{attempts:0}])assert.equal(eligibleRecord(match(changed)),false);});
test('a faster perfect match can beat a record after the score ceiling is reached',()=>{assert.ok(newPersonalBest(match({elapsed:45}),match({elapsed:60})));assert.equal(newPersonalBest(match({elapsed:65}),match({elapsed:60})),false);assert.ok(newPersonalBest(match({points:150,correct:9}),match({points:130,correct:8})));assert.equal(newPersonalBest(match({points:150,correct:9}),match({points:170})),false);});

test('starter credits are a separate one-time gift and do not manufacture XP or mastery',async()=>{
 const {grantStarterCredits}=await import('../dist/rewards.mjs');
 const {newProfile,validateImport,initialData}=await import('../dist/engine.mjs');
 const {credits,buyItem,initCareer}=await import('../dist/career.mjs');
 const p=newProfile('Test',6);initCareer(p);
 const match={id:'warmup',placement:true,complete:true,target:12,attempts:12,rows:Array.from({length:12},()=>({correct:false,unknown:true}))};
 assert.equal(grantStarterCredits(p,{...match,complete:false}),0);
 assert.equal(grantStarterCredits(p,match),10);assert.equal(credits(p),10);
 assert.equal(p.pointsTotal||0,0);assert.deepEqual(p.facts,{});
 assert.equal(grantStarterCredits(p,match),0);assert.equal(grantStarterCredits(p,{...match,id:'again'}),0);
 assert.ok(buyItem(p,'celebrate-jump').ok);assert.ok(credits(p)<10);
 const data=initialData();data.profiles.push(p);assert.doesNotThrow(()=>validateImport(data));
 assert.throws(()=>validateImport({...data,profiles:[{...p,starterReward:{...p.starterReward,credits:1000}}]}),/Invalid starter reward/);
});
