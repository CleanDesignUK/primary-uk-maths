import {focusTables} from './tables.mjs';
import {localDay,questionPool,factSecure} from './engine.mjs';
import {competency,probeIds} from './adaptive.mjs';

// Goals use recorded answers. Supported answers cannot fill an independent-goal target.
export function dailyTargets(profile,now=Date.now()){
 const matches=(profile.sessions||[]).filter(s=>localDay(s.endedAt)===localDay(now));
 const independent=matches.reduce((n,s)=>n+(s.rows||[]).filter(r=>r.correct&&!r.assisted).length,0);
 const played=matches.filter(s=>s.mode==='timed'&&s.complete&&s.attempts>0).length;
 const streak=Math.max(0,...matches.map(s=>s.bestStreak||0));
 return [
  {id:'match',title:'Play a match',symbol:'ball',value:Math.min(1,played),target:1},
  {id:'goals',title:'Score 8 on your own',symbol:'trophy',value:Math.min(8,independent),target:8},
  {id:'streak',title:'Get 3 in a row',symbol:'flame',value:Math.min(3,streak),target:3},
 ].map(t=>({...t,done:t.value>=t.target}));
}

export function academyPath(profile,now=Date.now()){
 const y5=profile.year>=5,tableIds=(y5?Array.from({length:12},(_,i)=>i+1):[3,4,8]).map(n=>`table${n}`);
 const columns=y5?['colAdd4','colSub4']:['colAdd2','colSub2'];
 const stages=[
  {title:'Kick off',symbol:'ball',ids:[],detail:'Finish your warm-up',passed:!!profile.placementComplete},
  {title:'First touch',symbol:'shield',ids:['add10','sub10','bonds10'],detail:'Build your number facts'},
  {title:'Playmaker',symbol:'plus',ids:['bridgeAdd','bridgeSub'],detail:'Add and subtract across 10'},
  {title:'Midfield',symbol:'star',ids:[...tableIds,y5?'mixAll':'mix348'],detail:y5?'Recall all tables, then mix':'Recall 3, 4 and 8, then mix'},
  {title:'Set pieces',symbol:'grid',ids:columns,detail:'Build your column methods'},
  {title:'Captain',symbol:'trophy',ids:['bonds10','bridgeAdd','bridgeSub',...tableIds],secure:true,detail:'Keep core facts strong on later days'},
 ];
 let previous=true;
 return stages.map((stage,i)=>{
  const count=stage.ids.filter(id=>competency(profile,id,now)[stage.secure?'secure':'ready']).length;
  const earned=stage.passed??count===stage.ids.length;
  const done=previous&&earned,current=previous&&!earned;
  previous=done;
  return {...stage,index:i+1,count,total:stage.ids.length,done,current,progress:stage.ids.length?Math.round(count/stage.ids.length*100):profile.placementComplete?100:Math.round(Math.min(probeIds(profile).length,profile.placementProgress||0)/probeIds(profile).length*100)};
 });
}

export function tableFacts(profile,table,now=Date.now()){
 return questionPool(`table${table}`).map(q=>{
  const fact=profile.facts[q.key];
  const status=!fact?'new':fact.due<=now?'due':factSecure(fact)&&fact.forms?.multiply&&fact.forms?.[`divide:${table}`]?'secure':'training';
  return {a:q.a,b:q.b,answer:q.answer,key:q.key,status};
 });
}

export function tableChoices(profile){return focusTables(profile.year||1);}

export function warmupProgress(profile){return Math.max(0,Math.min(probeIds(profile).length,Math.floor(profile.placementProgress||0)));}
export function clockDelta(session,seconds){
 if(session.paused||session.progressCheck||session.coachDrill||!Number.isFinite(seconds)||seconds<=0)return 0;
 // Old drafts retain their old timing. Current records have separate versioned comparison keys.
 return session.schema==='football-v2'||session.phase==='question'?seconds:0;
}

export function matchTimeLeft(round) {
 return Math.max(0,round.duration-(round.clockElapsed??round.elapsed));
}

export function tickMatchClock(round,seconds) {
 const active=clockDelta(round,seconds);
 const available=round.workTimeLeft??0;
 const working=Math.min(active,available);
 const timed=Math.min(active-working,matchTimeLeft(round));
 round.clockElapsed=Math.min(round.duration,(round.clockElapsed??round.elapsed)+timed);
 round.elapsed+=working+timed;
 round.workTimeLeft=available-working;
 return matchTimeLeft(round);
}
