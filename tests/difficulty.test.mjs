import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,DAY} from '../dist/engine.mjs';
import {recordLearning,nextAdaptive,probeIds} from '../dist/adaptive.mjs';
import {methodEntry,methodVariant,practicePool,questionDemand} from '../dist/difficulty.mjs';
const now=Date.UTC(2026,10,7,12);
const round=extra=>({rows:[],seen:[],retries:[],target:12,...extra});
function answer(p,s,next,correct){
 const row={...next,q:next.q,correct,assisted:false};
 s.rows.push(row);s.seen.push(next.q.key);recordLearning(p,next.q,correct,false,1000,'test',now);return row;
}

test('repeated manual column errors descend the same operation, never larger digit lengths',()=>{
 for(const op of ['Add','Sub']){
  const p=newProfile('Test',6),s=round({manual:`col${op}4`});
  for(const level of [4,3,2,1,0,0]){
   const next=nextAdaptive(p,s,now,()=>.9);
   assert.equal(next.q.skillId,`col${op}${level}`);
   answer(p,s,next,false);
  }
 }
});
test('smaller methods stay in place until two distinct independent successes then build one step up',()=>{
 const p=newProfile('Test',6),s=round({manual:'colSub4'});
 answer(p,s,nextAdaptive(p,s,now),false);
 for(let i=0;i<2;i++){const next=nextAdaptive(p,s,now);assert.equal(next.q.skillId,'colSub3');answer(p,s,next,true);}
 assert.equal(nextAdaptive(p,s,now).q.skillId,'colSub4');
});
test('a mistake narrows numeric demand and keeps the same structural variant',()=>{
 for(const id of ['mul5','longMul6','decimalMul6','longDiv6']){
  const p=newProfile('Test',6);const q=[...questionPool(id)].sort((a,b)=>questionDemand(b)-questionDemand(a))[0];
  recordLearning(p,q,false,false,1000,'test',now);
  const pool=practicePool(p,id,now);
  assert.ok(pool.length);
  assert.ok(pool.every(next=>questionDemand(next)<questionDemand(q)),id);
  assert.ok(pool.every(next=>methodVariant(next)===methodVariant(q)),id);
 }
});
test('short multiplication is checked before long multiplication and evidence expires',()=>{
 const p=newProfile('Test',6),pool=questionPool('mul5').filter(q=>q.visual.b<10);
 assert.ok(practicePool(p,'mul5',now).every(q=>q.visual.b<10));
 for(const q of pool.slice(0,3))recordLearning(p,q,true,false,1000,'test',now);
 assert.ok(practicePool(p,'mul5',now).every(q=>q.visual.b>=10));
 assert.ok(practicePool(p,'mul5',now+31*DAY).every(q=>q.visual.b<10));
});
test('Year 6 starts with basic checks and retains the selected year',()=>{
 const p=newProfile('Test',6),s=round({placement:true,probeIndex:0});
 assert.equal(nextAdaptive(p,s,now).q.skillId,'place3');
 assert.ok(probeIds(p).includes('colAdd0'));assert.ok(probeIds(p).includes('colSub0'));
 assert.ok(!probeIds(p).includes('longMul6'));assert.ok(!probeIds(p).includes('longDiv6'));
 assert.equal(methodEntry(p,'longMul6',now),'mulWritten3');
 for(const id of ['mulWritten3','mul4','mul5'])for(const q of questionPool(id).slice(0,12))recordLearning(p,q,true,false,1000,'test',now);
 assert.equal(methodEntry(p,'longMul6',now),'longMul6');assert.equal(p.year,6);
});
