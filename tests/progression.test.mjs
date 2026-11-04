import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,DAY,initialData,validateImport,selectQuestion} from '../dist/engine.mjs';
import {initLearning,recordLearning} from '../dist/adaptive.mjs';
import {dailyTargets,tableFacts,academyPath,clockDelta,warmupProgress} from '../dist/progression.mjs';
import {workedExample} from '../dist/coaching.mjs';

test('daily targets exclude supported answers, earlier days and other players',()=>{
 const now=Date.now(),p=newProfile('Ace',3),other=newProfile('Carter',3);
 p.sessions=[{endedAt:now-DAY,mode:'timed',complete:true,attempts:10,bestStreak:8,rows:Array(10).fill({correct:true})},{endedAt:now,mode:'check',complete:true,attempts:3,bestStreak:2,rows:[{correct:true},{correct:true,assisted:true},{correct:false}]}];
 let targets=dailyTargets(p,now);assert.deepEqual(targets.map(t=>t.value),[0,1,2]);
 p.sessions.push({endedAt:now,mode:'timed',complete:true,attempts:10,bestStreak:5,rows:Array(10).fill({correct:true,assisted:false})});
 assert.ok(dailyTargets(p,now).every(t=>t.done));assert.ok(dailyTargets(other,now).every(t=>!t.done));
});
test('a fact must be recalled over spaced days and still shows when it is due',()=>{
 const p=newProfile('Ace',3),q=questionPool('table3')[6],now=Date.now();initLearning(p);
 assert.equal(tableFacts(p,3,now)[6].status,'new');
 recordLearning(p,q,true,false,1000,'a',now);assert.equal(tableFacts(p,3,now)[6].status,'training');
 recordLearning(p,q,true,false,1000,'b',now+DAY);recordLearning(p,{...q,a:q.answer,b:3,answer:7,op:'÷',factFamily:true,tableFocus:3,factFormat:'divide'},true,false,1000,'c',now+4*DAY);
 assert.equal(tableFacts(p,3,now+4*DAY)[6].status,'secure');assert.equal(tableFacts(p,3,now+12*DAY)[6].status,'due');
 recordLearning(p,q,false,false,1000,'d',now+12*DAY);assert.equal(tableFacts(p,3,now+12*DAY)[6].status,'due');
});
test('same-day success cannot unlock captain and the next stage stays explicit',()=>{
 const p=newProfile('Ace',3);initLearning(p);assert.equal(academyPath(p)[0].current,true);
 p.placementComplete=true;for(const id of ['add10','sub10','bonds10','bridgeAdd','bridgeSub','table3','table4','table8','mix348','colAdd2','colSub2'])for(const q of questionPool(id))recordLearning(p,q,true,false,1000,'one');
 const path=academyPath(p);assert.ok(path.slice(0,5).every(s=>s.done));assert.equal(path[5].done,false);assert.equal(path[5].current,true);
});
test('the new clock counts answer time and gives feedback time without mixing legacy records',()=>{
 assert.equal(clockDelta({schema:'football-v3',phase:'question'},2),2);
 assert.equal(clockDelta({schema:'football-v4',phase:'feedback'},90),0);
 assert.equal(clockDelta({schema:'football-v3',phase:'question',paused:true},20),0);
 assert.equal(clockDelta({schema:'football-v2',phase:'feedback'},2),2);
 assert.equal(clockDelta({schema:'football-v3',phase:'question'},NaN),0);
});
test('warm-up progress is bounded and can be resumed for each player',()=>{
 assert.equal(warmupProgress(newProfile('Ace',3)),0);assert.equal(warmupProgress({year:3,placementProgress:5}),5);assert.equal(warmupProgress({year:5,placementProgress:99}),12);
});
test('reloading an unselected squad never silently logs in the first child',()=>{
 const data=initialData();data.profiles=[newProfile('Player A',1),newProfile('Player B',3),newProfile('Player C',6)];assert.equal(validateImport(JSON.parse(JSON.stringify(data))).activeId,null);
 data.activeId=data.profiles[2].id;assert.equal(validateImport(JSON.parse(JSON.stringify(data))).activeId,data.profiles[2].id);
 data.profiles[2].trainingSeconds=180;data.profiles[2].placementProgress=5;
 const restored=validateImport(JSON.parse(JSON.stringify(data)));assert.equal(restored.profiles[2].placementProgress,5);assert.equal(restored.profiles[2].trainingSeconds,180);
 data.profiles[2].trainingSeconds=-1;assert.throws(()=>validateImport(data),/clock/);
});
test('every crossing-10 example has correct partitioned jumps and endpoints',()=>{
 for(const id of ['bridgeAdd','bridgeSub'])for(const q of questionPool(id)){
  const model=workedExample(q);assert.equal(model.type,'bridge');assert.equal(model.points[0],q.a);assert.equal(model.points[1],10);assert.equal(model.points[2],q.answer);assert.equal(model.parts[0]+model.parts[1],q.b);
  model.jumps.forEach((jump,i)=>assert.equal(model.points[i]+jump,model.points[i+1]));
 }
});
test('equal-group examples preserve multiplication and inverse-division totals',()=>{
 for(const id of ['table3','table4','table8','divAll'])for(const q of questionPool(id)){
  const model=workedExample(q);assert.equal(model.groups*model.each,model.total);assert.equal(model.total,q.op==='×'?q.answer:q.a);
 }
});
test('training samples every foundation fact while reducing easy identities, and prioritises an identity when it was missed',()=>{
 const p=newProfile('Ace',3),now=Date.now(),all=questionPool('sub10');
 const sample=()=>Array.from({length:2000},(_,i)=>selectQuestion(p,['sub10'],[],now,()=>(i+.5)/2000));
 const initial=sample();assert.equal(new Set(initial.map(q=>q.key)).size,all.length);assert.ok(initial.filter(q=>q.b===0).length<initial.length*.1);
 const missed=all.find(q=>q.a===8&&q.b===0);const before=initial.filter(q=>q.key===missed.key).length;
 recordLearning(p,missed,false,false,1000,'a',now);assert.ok(sample().filter(q=>q.key===missed.key).length>before*5);
});
