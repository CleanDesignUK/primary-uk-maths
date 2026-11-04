import {SKILLS,skillById,questionPool,selectQuestion,recordFact,localDay,DAY,skillStats} from './engine.mjs';
import {syllabusIds} from './curriculum.mjs';

export const REQUIREMENTS={
 bonds10:['add10'],bridgeAdd:['add10','bonds10'],bridgeSub:['sub10','bonds10'],bonds20:['bonds10'],missing:['add10','sub10'],
 table4:['table2'],table8:['table4'],table6:['table3'],table9:['table3'],table12:['table6'],mix348:['table3','table4','table8'],mixAll:['table3','table4','table8','table6','table7','table9','table12'],div348:['table3','table4','table8'],divAll:['mixAll'],
 colAdd0:['add10'],colSub0:['sub10'],colAdd1:['colAdd0','bridgeAdd'],colSub1:['colSub0','bridgeSub'],colAdd2:['colAdd1','place3'],colSub2:['colSub1','place3'],colAdd3:['colAdd2'],colSub3:['colSub2'],colAdd4:['colAdd3','place6'],colSub4:['colSub3','place6'],
};
export const requirements=id=>REQUIREMENTS[id]||skillById(id)?.requires||[];
export function initLearning(p){
 if(p.learning)return p;
 p.learning={};
 for(const s of p.sessions||[])for(const r of s.rows||[])if(r.q?.skillId&&skillById(r.q.skillId))updateLearning(p,r.q,r.correct,!!r.assisted,r.ms||0,s.id,s.endedAt||Date.now(),false);
 p.placementComplete=!!p.placementComplete||(p.sessions||[]).some(s=>s.mode==='check'&&s.complete);
 return p;
}
function updateLearning(p,q,correct,help,ms,sessionId,now,probe){
 const st=p.learning[q.skillId]||{n:0,correct:0,recent:[],keys:[],days:[],probes:[],firstAt:now};
 st.n++;st.correct+=correct&&!help?1:0;st.lastAt=now;
 st.recent=[...st.recent.slice(-19),{key:q.key,correct:correct&&!help,help,ms,at:now,variant:q.variant??q.op,sessionId,probe}];
 if(!st.keys.includes(q.key))st.keys.push(q.key);
 if(correct&&!help&&!st.days.includes(localDay(now)))st.days.push(localDay(now));
 if(probe&&correct&&!help&&!st.probes.includes(q.key))st.probes.push(q.key);
 p.learning[q.skillId]=st;return st;
}
export function recordLearning(p,q,correct,help,ms,sessionId,now=Date.now(),probe=false){
 initLearning(p);recordFact(p,q,correct,help,ms,now);return updateLearning(p,q,correct,help,ms,sessionId,now,probe);
}
export function competency(p,id,now=Date.now()){
 initLearning(p);const st=p.learning[id];if(!st)return {ready:false,secure:false,accuracy:null,n:0,coverage:0,level:'New'};
 const last=st.recent.slice(-10),good=last.filter(r=>r.correct).length,accuracy=last.length?good/last.length:0,coverage=st.keys.length/questionPool(id).length;
 const ready=(last.length>=6&&accuracy>=.83&&st.keys.length>=Math.min(5,questionPool(id).length))||(st.probes.length>=3&&accuracy>=.9);
 const days=st.days.length,span=now-st.firstAt,independentSessions=new Set(last.filter(r=>r.correct).map(r=>r.sessionId)).size;
 const exact=skillById(id)?.category==='tables'||['add10','sub10','bonds10','bonds20','bridgeAdd','bridgeSub'].includes(id);
 const secure=ready&&days>=3&&span>=4*DAY&&independentSessions>=3&&accuracy>=.9&&(exact?skillStats(p,id,now).status==='Secure':st.keys.length>=Math.min(8,questionPool(id).length)&&new Set(last.map(r=>r.variant)).size>=Math.min(2,new Set(questionPool(id).map(q=>q.variant??q.op)).size));
 return {ready,secure,accuracy:Math.round(accuracy*100),n:st.n,coverage:Math.round(coverage*100),level:secure?'Match fit':ready?'Improving':'Training',lastAt:st.lastAt};
}
export function resolvePrerequisite(p,id,visited=new Set()){
 if(visited.has(id))return id;visited.add(id);
 for(const req of requirements(id))if(!competency(p,req).ready)return resolvePrerequisite(p,req,visited);
 return id;
}
const PROBES3=['add10','sub10','table3','bonds10','table4','bridgeAdd','table8','bridgeSub','place3','colAdd0','colSub0','div348'];
const PROBES5=['add10','sub10','table3','bridgeAdd','table4','bridgeSub','table8','table6','table7','table9','colAdd2','colSub2'];
export const probeIds=p=>p.year>=5?PROBES5:PROBES3;
function weakest(p,ids){
 return [...new Set(ids)].sort((a,b)=>{
   const x=competency(p,a),y=competency(p,b);
   const score=(c,id)=>(c.accuracy===null?40:100-c.accuracy)+(!c.ready?30:0)-(p.learning[id]?.n||0)*.75;
   return score(y,b)-score(x,a);
 })[0];
}
export function laneFocus(p,lane){
 initLearning(p);
 if(lane==='foundation'){
  const targets=['bridgeAdd','bridgeSub','bonds20','missing'];
  const gaps=targets.filter(id=>!competency(p,id).ready);return weakest(p,(gaps.length?gaps:targets).map(id=>resolvePrerequisite(p,id)));
 }
 if(lane==='tables'){
  const tables=(p.year>=5?[3,4,8,6,7,9,12,2,5,10,11,1]:[3,4,8]).map(n=>`table${n}`);
  const notReady=tables.filter(id=>!competency(p,id).ready);
  if(!notReady.length)return p.year>=5?'mixAll':'mix348';
  // A pupil is assessed on the focus tables directly. Prerequisite table work is used after repeated errors.
  return weakest(p,notReady);
 }
 if(lane==='written')return weakest(p,(p.year>=5?['colAdd4','colSub4']:['colAdd2','colSub2']).map(id=>resolvePrerequisite(p,id)));
 const candidates=p.year>=5?['place6','negative5','round5','fracRead3','fracEq5','decimalFrac5','metric5','angles5','lineGraph5','time5','factors5','percent5','transform5']:['place3','fracRead3','tenths3','clock3','metric3','angle3','chart3','perimeter3','solids3','count3'];
 const all=[...new Set([...candidates,...syllabusIds(p.year>=5?5:3).filter(id=>skillById(id).extra)])];
 const available=all.map(id=>resolvePrerequisite(p,id));
 return [...new Set(available)].sort((a,b)=>(p.learning[a]?.n||0)-(p.learning[b]?.n||0))[0];
}
export function planSummary(p){return ['foundation','tables','written','curriculum'].map(lane=>({lane,id:laneFocus(p,lane),why:lane==='foundation'?'Close a prerequisite gap':lane==='tables'?'Build individual recall before mixing':lane==='written'?'Use facts in a written method':'Keep the wider curriculum in practice'}));}

export function nextAdaptive(p,s,now=Date.now(),rng=Math.random){
 initLearning(p);const seen=s.seen||[],rows=s.rows||[],recent=new Set(seen.slice(-3));
 const retry=(s.retries||[]).find(r=>r.at<=rows.length&&!recent.has(r.q.key));
 if(retry&&!s.placement)return {q:{...retry.q},reason:'repair',label:'Replay',detail:'A previous mistake, revisited after other questions.',retryKey:retry.q.key};
 if(s.manual)return {q:selectQuestion(p,[s.manual],seen,now,rng),reason:'chosen',label:'Training',detail:'The exercise selected on the syllabus page.'};
 if(s.placement){
  const ids=probeIds(p),index=s.probeIndex||0;
  if(index<ids.length){
   const id=ids[index];let pool=questionPool(id);
   if(id==='add10')pool=pool.filter(q=>q.a>=3&&q.b>=2&&q.answer>=7);
   if(id==='sub10')pool=pool.filter(q=>q.a>=7&&q.b>=2&&q.answer>=2);
   if(id==='bonds10')pool=pool.filter(q=>q.a>=3&&q.a<=8);
   if(/^table\d+$/.test(id))pool=pool.filter(q=>q.b>=6&&q.b!==10);
   const unseen=pool.filter(q=>!seen.includes(q.key));if(unseen.length)pool=unseen;
   const q={...pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]};
   return {q,reason:'probe',label:'Warm-up',detail:'A nontrivial sample checks number facts, tables and written methods; no identity-only probe is used.',advanceProbe:true};
  }
 }
 const last=rows.at(-1),prev=rows.at(-2);
 if(last&&!last.correct&&prev&&!prev.correct){const target=requirements(last.q.skillId)[0]||(['table8','table4'].includes(last.q.skillId)?'table2':last.q.skillId==='bridgeSub'?'sub10':last.q.skillId==='bridgeAdd'?'bonds10':'add10');return {q:selectQuestion(p,[resolvePrerequisite(p,target)],seen,now,rng),reason:'support',label:'Build-up',detail:'Two difficult answers: practise the supporting skill before returning.'};}
 const reviewCount=rows.filter(r=>r.reason==='review').length;
 if(reviewCount<2&&(rows.length%4===3||rows.length%7===5)){
  const ids=[...new Set([...syllabusIds(p.year>=5?5:3),...Object.keys(p.learning)])];
  const due=ids.flatMap(questionPool).filter(q=>{const f=p.facts[q.key];return f&&f.due<=now&&!seen.includes(q.key)&&!recent.has(q.key);});
  const unique=[...new Map(due.map(q=>[q.key,q])).values()];
  unique.sort((a,b)=>p.facts[a.key].due-p.facts[b.key].due);
  if(unique.length)return {q:{...unique[0]},reason:'review',label:'Match recall',detail:'This fact is due for spaced retrieval.'};
 }
 const coreReady=['bridgeAdd','bridgeSub',p.year>=5?'mixAll':'mix348'].filter(id=>competency(p,id).ready).length;
 const lanes=coreReady>=2?['foundation','tables','written','curriculum','tables','foundation','curriculum','written','tables','curriculum']:['foundation','tables','foundation','tables','written','foundation','tables','curriculum','written','tables'];
 const lane=lanes[rows.length%lanes.length],id=laneFocus(p,lane);
 const targeted=skillById(id),reason=competency(p,id).n?'weakness':'new';
 return {q:selectQuestion(p,[id],seen,now,rng),reason,label:lane==='tables'?'Ball control':lane==='written'?'Set piece':reason==='new'?'New move':'Training',detail:`${lane}: ${targeted.title}. ${reason==='new'?'Not yet sampled.':'Selected from recent accuracy and prerequisite evidence.'}`};
}
export function validateLearningGraph(){for(const skill of SKILLS){const walk=(id,path=[])=>{if(path.includes(id))throw new Error(`Prerequisite cycle: ${[...path,id].join(' → ')}`);for(const req of requirements(id)){if(!skillById(req))throw new Error(`Unknown prerequisite ${req}`);walk(req,[...path,id]);}};walk(skill.id);}return true;}
