import test from 'node:test';
import assert from 'node:assert/strict';
import {previewDatabase} from '../scripts/preview-db.mjs';
import {worldRequest,worldQuestions,seasonOf} from '../worker/league.mjs';
const now=Date.UTC(2026,10,5,12),origin='https://academy.example';
function harness(){
 const DB=previewDatabase();
 return async(route,{token,body,at=now}={})=>{
  const headers={'Content-Type':'application/json',Origin:origin};
  if(token)headers['X-Matchday-Player']=token;
  const response=await worldRequest(new Request(`${origin}/api/world/${route}`,{headers,method:body===undefined?'GET':'POST',body:body===undefined?undefined:JSON.stringify(body)}),{DB},at);
  return {status:response.status,...await response.json()};
 };
}
function solve(question){
 const {expression,a,b,op}=question;
 if(expression.includes('□')){const [known,total]=expression.match(/\d+/g).map(Number);return total-known;}
 if(expression.includes('%')){const [p,n]=expression.match(/\d+/g).map(Number);return p*n/100;}
 if(expression.startsWith('¼'))return Number(expression.split(' ').at(-1))/4;
 if(a===undefined)return expression.split('+').reduce((sum,n)=>sum+Number(n),0);
 return op==='×'?a*b:op==='÷'?a/b:op==='−'?a-b:a+b;
}
test('every ranked blueprint is year-specific, numerically correct and varied by seed',()=>{
 assert.equal(seasonOf(now),'2026-11-02');
 for(let year=1;year<=6;year++)for(let tier=0;tier<=2;tier++){
  for(let seed=1;seed<=25;seed++)for(const q of worldQuestions(year,tier,seed))assert.equal(q.answer,solve(q));
  assert.notDeepEqual(worldQuestions(year,tier,127),worldQuestions(year,tier,821));
 }
});
test('two devices rank real completed results and County requires eight verified goals',async()=>{
 const api=harness();
 const first=await api('join',{body:{name:'Do not upload a name'}}),second=await api('join',{body:{}});
 assert.equal(first.status,201);assert.notEqual(first.alias,second.alias);assert.doesNotMatch(first.alias,/upload/);
 assert.equal((await api('start',{token:first.token,body:{year:6,tier:1}})).status,403);
 for(const [player,miss] of [[first,0],[second,2]]){
  let match=await api('start',{token:player.token,body:{year:6,tier:0}});
  assert.equal(match.status,200);assert.ok(!('answer' in match.question));
  const resume=await api('start',{token:player.token,body:{year:6,tier:0}});assert.equal(resume.id,match.id);
  const outOfOrder=await api('shot',{token:player.token,body:{id:match.id,index:4,answer:'0'}});assert.equal(outOfOrder.status,409);
  for(let i=0;i<10;i++){
   const body={id:match.id,index:i,answer:String(solve(match.question)+(i<miss?1:0)),correct:10};
   const shot=await api('shot',{token:player.token,body,at:now+1000*(i+1)});assert.equal(shot.status,200);assert.equal(shot.index,i+1);
   if(i===0){const repeated=await api('shot',{token:player.token,body,at:now+1500});assert.equal(repeated.index,1);assert.equal(repeated.correct,shot.correct);}
   match=shot;
  }
  assert.equal(match.correct,10-miss);assert.equal(match.complete,true);
  assert.deepEqual(match.unlocked,[0,1]);
 }
 const board=await api('board?year=6&tier=0');assert.deepEqual(board.rows.map(row=>[row.alias,row.correct]),[[first.alias,10],[second.alias,8]]);
 assert.equal((await api('board?year=5&tier=0')).rows.length,0);
 assert.equal((await api('board?year=6&tier=1')).rows.length,0);
 const next=await api('start',{token:first.token,body:{year:6,tier:1},at:now+12000});assert.equal(next.tier,1);
 assert.equal((await api('leave',{token:first.token,body:{}})).left,true);
 assert.equal((await api('me?year=6',{token:first.token})).status,401);
 assert.deepEqual((await api('board?year=6&tier=0')).rows.map(row=>row.alias),[second.alias]);
});
test('unfinished, expired and unauthorised shots cannot appear in standings',async()=>{
 const api=harness(),player=await api('join',{body:{}}),other=await api('join',{body:{}});
 const match=await api('start',{token:player.token,body:{year:3,tier:0}});
 const body={id:match.id,index:0,answer:String(solve(match.question))};
 assert.equal((await api('shot',{token:other.token,body})).status,404);
 assert.equal((await api('shot',{token:player.token,body,at:match.expiresAt+1})).status,409);
 assert.equal((await api('board?year=3&tier=0')).rows.length,0);
 assert.equal((await api('start',{token:player.token,body:{year:3,tier:2}})).status,403);
});
