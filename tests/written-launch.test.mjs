import test from 'node:test';
import assert from 'node:assert/strict';
import {questionPool} from '../dist/engine.mjs';
import {answerMatches} from '../dist/curriculum.mjs';
import {writtenTask,writtenSubmission,multiplicationWorking,divisionWorking,multiplicationWorkspace,divisionWorkspace,multiplicationSolution,divisionSolution} from '../dist/written-work.mjs';
import {workedExample} from '../dist/coaching.mjs';

test('every decimal multiplication and division can be answered through its written digit fields',()=>{
 for(const id of ['decimalMul6','decimalDiv6'])for(const q of questionPool(id)){
  const task=writtenTask(q);assert.ok(task,q.expression);
  const model=workedExample(q),dp=model.decimalPlaces;
  const raw=task.type==='multiply'?model.rawTotal:model.rawQuotient;
  const entered=String(raw).padStart(dp+1,'0').split('');
  assert.ok(answerMatches(q,writtenSubmission(task,entered)),q.expression);
  const workspace=task.type==='multiply'?multiplicationWorkspace(task):divisionWorkspace(task);
  if(dp){assert.match(workspace,/decimal-row/);assert.match(workspace,/hundredths|tenths/);}
  assert.doesNotMatch(workspace,/NaN|undefined/);
  const solution=task.type==='multiply'?multiplicationSolution(model):divisionSolution(model);
  assert.doesNotMatch(solution,/NaN|undefined/);
  if(task.type==='multiply')assert.equal(model.partials.reduce((n,p)=>n+p.value,0)/model.scale,q.answer);
  else assert.equal(model.rawQuotient*task.b,model.dividend);
 }
});

test('decimal working preserves leading zeros and carries without shifting place value',()=>{
 const model=multiplicationWorking(.04,8);
 assert.equal(model.total,.32);assert.equal(model.rawTotal,32);
 assert.match(multiplicationWorkspace({a:.04,b:8}),/Product hundredths column/);
 assert.match(multiplicationSolution(model),/decimal-row/);
 const division=divisionWorking(.08,8,2);
 assert.equal(division.quotient,.01);assert.equal(division.digitText,'008');
 assert.match(divisionSolution(division),/decimal point/);
});

test('integer division always exposes remainder space, including exact divisions',()=>{
 for(const id of ['divWritten3','divide4','division5','longDiv6'])for(const q of questionPool(id)){
  const task=writtenTask(q);if(!task)continue;
  assert.match(divisionWorkspace(task),/aria-label="Remainder"/);
  const model=divisionWorking(task.a,task.b);
  const answer=writtenSubmission(task,String(model.quotient).split(''),String(model.remainder));
  assert.ok(answerMatches(q,answer),q.expression);
  if(model.remainder)assert.equal(task.needsRemainder,true,q.expression);
 }
});

 test('an incorrect leftover is rejected even when the quotient of an exact division is correct',()=>{
 const q=questionPool('divWritten3')[0],task=writtenTask(q);
 assert.equal(answerMatches(q,writtenSubmission(task,String(q.answer).split(''),'1')),false);
 });
