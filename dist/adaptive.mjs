import {skillById,questionPool,selectQuestion,recordFact,localDay,DAY,skillStats} from './engine.mjs';
import {syllabusIds,domainFor} from './curriculum.mjs';
import {focusTables,tableEvidence,tableQuestion} from './tables.mjs?v=6.7.0';

import {methodEntry,practicePool,practiceQuestion,recoveryStep,methodVariant} from './difficulty.mjs';

import {requirements,validateTeachingOrder} from './teaching-order.mjs?v=6.8.0';
export {requirements,REQUIREMENTS} from './teaching-order.mjs?v=6.8.0';
export const validateLearningGraph=validateTeachingOrder;

export function initLearning(p){
 if(!p.familyVersion){for(const [key,f] of Object.entries(p.facts||{})){f.forms||={};if(key.startsWith('×:')&&f.history?.some(h=>h.correct))f.forms.multiply=true;const m=key.match(/^÷:(\d+):(\d+)/);if(m&&f.lastCorrect){const a=Number(m[1]),b=Number(m[2]),other=a/b,k=`×:${Math.min(b,other)}:${Math.max(b,other)}`;if(p.facts[k]){p.facts[k].forms||={};p.facts[k].forms[`divide:${b}`]=true;}}}p.familyVersion=4;}
 if(p.learning)return p;
 p.learning={};
 for(const s of p.sessions||[])for(const r of s.rows||[])if(r.q?.skillId&&skillById(r.q.skillId))updateLearning(p,r.q,r.correct,!!r.assisted,r.ms||0,s.id,s.endedAt||Date.now(),r.reason==='probe',!!r.unknown,r.coachFor);
 p.placementComplete=!!p.placementComplete||(p.sessions||[]).some(s=>s.mode==='check'&&s.complete);
 return p;
}
function updateLearning(p,q,correct,help,ms,sessionId,now,probe,unknown,coachFor){
 const st=p.learning[q.skillId]||{n:0,correct:0,recent:[],keys:[],days:[],probes:[],firstAt:now};
 st.n++;st.correct+=correct&&!help?1:0;st.lastAt=now;
 st.recent=[...st.recent.slice(-19),{key:q.key,correct:correct&&!help,help,ms,at:now,variant:q.factFormat??q.variant??q.op,methodVariant:methodVariant(q),sessionId,probe,unknown,coachFor}];
 if(!unknown&&!st.keys.includes(q.key))st.keys.push(q.key);
 if(correct&&!help&&!st.days.includes(localDay(now)))st.days.push(localDay(now));
 if(probe&&correct&&!help&&!st.probes.includes(q.key))st.probes.push(q.key);
 p.learning[q.skillId]=st;return st;
}
export function recordLearning(p,q,correct,help,ms,sessionId,now=Date.now(),probe=false,unknown=false,coachFor){
 initLearning(p);
 if(!unknown)recordFact(p,q,correct,help,ms,now);
 const result=updateLearning(p,q,correct&&!unknown,help,ms,sessionId,now,probe,unknown,coachFor);
 if(q.factFamily&&q.tableFocus&&q.skillId!==`table${q.tableFocus}`)updateLearning(p,{...q,skillId:`table${q.tableFocus}`},correct&&!unknown,help,ms,sessionId,now,probe,unknown);
 return result;
}
export function competency(p,id,now=Date.now()){
 initLearning(p);const st=p.learning[id];if(!st)return {ready:false,secure:false,accuracy:null,n:0,coverage:0,level:'New'};
 const last=st.recent.slice(-10),good=last.filter(r=>r.correct).length,accuracy=last.length?good/last.length:0,coverage=st.keys.length/questionPool(id).length;
 const ready=(last.length>=6&&accuracy>=.83&&st.keys.length>=Math.min(5,questionPool(id).length))||(st.probes.length>=3&&accuracy>=.9);
 const days=st.days.length,span=now-st.firstAt,independentSessions=new Set(last.filter(r=>r.correct).map(r=>r.sessionId)).size;
 const exact=skillById(id)?.category==='tables'||['add10','sub10','bonds10','bonds20','bridgeAdd','bridgeSub'].includes(id);
 let secure=ready&&days>=3&&span>=4*DAY&&independentSessions>=3&&accuracy>=.9&&(exact?skillStats(p,id,now).status==='Secure':st.keys.length>=Math.min(8,questionPool(id).length)&&new Set(last.map(r=>r.variant)).size>=Math.min(2,new Set(questionPool(id).map(q=>q.variant??q.op)).size));
 if(/^table\d+$/.test(id))secure=ready&&tableEvidence(p,Number(id.slice(5)),now).matchFit;
 if(skillById(id)?.kind==='div')secure=ready&&days>=3&&span>=4*DAY&&independentSessions>=3&&focusTables(p.year||1).every(t=>tableEvidence(p,t,now).matchFit);
 return {ready,secure,accuracy:Math.round(accuracy*100),n:st.n,coverage:Math.round(coverage*100),level:secure?'Match fit':ready?'Improving':'Training',lastAt:st.lastAt};
}
export const LEARNING_WINDOW=30*DAY;
export const independent=row=>row.correct&&!row.assisted&&!row.help&&!row.unknown;
export const recentEvidence=(p,id,now)=>(p.learning?.[id]?.recent||[]).filter(row=>row.at>=now-LEARNING_WINDOW&&row.at<=now);
const tableOf=q=>q?.tableFocus||q?.table||(q?.op==='÷'?q.b:null);
function familyKey(q){
 if(q.op==='÷'&&q.key.startsWith('÷:'))return `×:${Math.min(q.b,q.answer)}:${Math.max(q.b,q.answer)}`;
 return q.key;
}
function repeatedDifficulty(sample){
 const missed=sample.filter(row=>!independent(row));
 return new Set(missed.map(row=>row.key)).size>=2&&missed.length>=sample.length/2;
}
export const recentDifficulty=(p,id,now)=>repeatedDifficulty(recentEvidence(p,id,now).slice(-5));
function foundationStatus(p,id,now){
 const sample=recentEvidence(p,id,now).slice(-5);
 if(sample.at(-1)?.coachFor&&!independent(sample.at(-1)))return 'practice';
 if(repeatedDifficulty(sample))return 'practice';
 const correct=sample.filter(independent);
 if(new Set(correct.map(row=>row.key)).size>=3&&sample.length-correct.length<=1)return 'known';
 return 'check';
}

export function coachRecommendation(p,id,now=Date.now(),question=null){
 initLearning(p);
 const table=tableOf(question);
 const candidates=skillById(id)?.tables?.includes(table)?[`table${table}`]:requirements(id);
 const steps=candidates.map(req=>({id:req,target:id,kind:foundationStatus(p,req,now)}));
 return steps.find(step=>step.kind==='practice')||steps.find(step=>step.kind==='check')||{id,target:id,kind:'retry'};
}

export function teachingRoute(p,target,now=Date.now(),question=null){
 const path=[target];
 let step=coachRecommendation(p,target,now,question);
 while(step.kind!=='retry'){
  path.push(step.id);
  // A single check can suggest practice. Only repeated difficulty warrants
  // tracing further back, and an untested step must be checked first.
  if(step.kind==='check'||!recentDifficulty(p,step.id,now))break;
  const earlier=coachRecommendation(p,step.id,now);
  if(earlier.kind==='retry')break;
  step=earlier;
 }
 return {...step,target,path};
}

function foundationNeeded(p,id,now,question=null){
 const step=coachRecommendation(p,id,now,question);
 if(step.kind==='retry')return false;
 const linkedCheck=recentEvidence(p,step.id,now).at(-1);
 const missedLinkedCheck=linkedCheck?.coachFor===id&&!independent(linkedCheck);
 return missedLinkedCheck||recentDifficulty(p,id,now);
}

export function resolvePrerequisite(p,id,now=Date.now()){
 return foundationNeeded(p,id,now)?teachingRoute(p,id,now).id:id;
}
const PROBES3=['add10','sub10','table3','bonds10','table4','bridgeAdd','table8','bridgeSub','place3','colAdd0','colSub0','div348'];
const PROBES5=['place3','colAdd0','colSub0','table6','mulWritten3','divWritten3','place6','fracEq3','decimal4','clock3','solids3','chart3'];
// The chosen year sets the destination. Warm-up checks foundations before it
// assumes fluency with four-digit written methods or unlike fractions.
const PROBE_YEARS={1:['objects1','more1','add10','sub10','bonds10','add20','sub20','groups1','fraction1','clock1','shape1','position1'],2:['place2','add20','sub20','mental2','table2','table5','table10','frac2','money2','clock2','shape2','data2'],3:PROBES3,4:['place3','add20','sub20','table4','colAdd0','colSub0','mulWritten3','divWritten3','fracRead3','decimal4','clock3','chart3'],5:PROBES5,6:['place3','colAdd0','colSub0','table7','mulWritten3','divWritten3','place6','fracEq4','decimal4','clock3','solids3','chart4']};
export const probeIds=p=>PROBE_YEARS[p.year]||PROBES3;
function weakest(p,ids){
 return [...new Set(ids)].sort((a,b)=>{
   const x=competency(p,a),y=competency(p,b);
   const score=(c,id)=>(c.accuracy===null?40:100-c.accuracy)+(!c.ready?30:0)-(p.learning[id]?.n||0)*.75;
   return score(y,b)-score(x,a);
 })[0];
}
export function laneFocus(p,lane,now=Date.now(),deferred=new Set()) {
 initLearning(p);
 const year = p.year || 1;
 const available=ids=>ids.filter(id=>!deferred.has(id));
 if (lane === 'foundation') {
  const targets = year <= 2 ? ['add20','sub20','missing20','bonds20'] : year === 3 ? ['bridgeAdd','bridgeSub','bonds20','missing'] : year === 4 ? ['round4','decimal4'] : year === 5 ? ['mental5','decimalCalc5'] : ['mental6','order6'];
  const gaps = available(targets.filter(id=>!competency(p,id,now).ready));
  return weakest(p,gaps.length?gaps:available(targets));
 }
 if (lane === 'tables') {
  const tables = available(focusTables(year).map(n=>`table${n}`));
  if (!focusTables(year).length) return available(['groups1'])[0];
  const gaps = tables.filter(id => !tableEvidence(p,Number(id.slice(5)),now).complete);
  if (gaps.length) return weakest(p, gaps);
  return available([year===2?'mix2510':year===3?'mix348':'mixAll',...tables])[0];
 }
 if (lane === 'written') {
  const targets = year === 1 ? ['stories1','missing20'] : year === 2 ? ['mental2','inverse2','threeAdd2'] : year === 3 ? ['colAdd2','colSub2'] : year === 4 ? ['colAdd3','colSub3','mul4','divide4'] : year === 5 ? ['colAdd4','colSub4','mul5','division5'] : ['longMul6','longDiv6'];
  return weakest(p,available(targets));
 }
 const ids = syllabusIds(year).filter(id => skillById(id).extra);
 return available(ids).sort((a,b) => {
  const x = competency(p,a,now), y = competency(p,b,now);
  return Number(x.secure) - Number(y.secure) || x.n - y.n;
 })[0];
}
const LANES=['foundation','tables','written','curriculum'];
export function planSummary(p){
 const now=Date.now();
 return LANES.map(lane=>{
  const target=laneFocus(p,lane,now),id=resolvePrerequisite(p,target,now);
  const why=id!==target?`A step towards ${skillById(target).title}`:lane==='foundation'?'Build strong number skills':lane==='tables'?'Build individual recall before mixing':lane==='written'?'Use facts in a written method':'Keep the wider curriculum in practice';
  return {lane,id,why};
 });
}

function practisedQuestions(profile,id) {
 const known=new Set(profile.learning[id]?.recent.filter(row=>row.correct).map(row=>row.key)||[]);
 return questionPool(id).filter(q=>known.has(q.key));
}
export function progressCheckQuestions(profile, ids) {
 initLearning(profile);
 return [...new Map(ids.flatMap(id=>practisedQuestions(profile,id)).map(q=>[q.key,q])).values()];
}
export function progressCheckPlan(profile) {
 const skills = syllabusIds(profile.year || 1).map(id => ({id, ...competency(profile, id)}));
 const practised = skills.filter(skill => skill.n >= 3 && skill.accuracy >= 60 && practisedQuestions(profile,skill.id).length >= 3);
 const ordered = practised.sort((a,b) => Number(a.secure) - Number(b.secure) || b.n - a.n).map(skill => skill.id);
 const domains = [...new Set(ordered.map(id => domainFor(skillById(id))))];
 const varied = domains.map(domain => ordered.find(id => domainFor(skillById(id)) === domain));
 return [...varied, ...ordered.filter(id => !varied.includes(id))].slice(0,6);
}

export function learningNotes(profile,now=Date.now()) {
 initLearning(profile);
 return syllabusIds(profile.year || 1).flatMap(id => {
  const recent = recentEvidence(profile,id,now).slice(-8);
  const missed = recent.filter(row=>!independent(row));
  const sessions = new Set(missed.map(row=>row.sessionId));
  const difficulties = missed.length;
  if (recent.length < 6 || sessions.size < 2 || difficulties / recent.length < .5) return [];
  const recommendation=teachingRoute(profile,id,now);
  return [{id,title:skillById(id).title,difficulties,attempts:recent.length,next:recommendation.id,kind:recommendation.kind,path:recommendation.path}];
 }).sort((a,b) => b.difficulties / b.attempts - a.difficulties / a.attempts);
}

export function matchRecommendation(p,rows,now=Date.now()) {
 initLearning(p);
 const handled=new Set();
 let recommendation=null;
 for(const row of [...rows].reverse()){
  if(!skillById(row?.q?.skillId))continue;
  const id=row.reason==='support'?row.coachFor:row.q.skillId;
  if(!skillById(id)||handled.has(id))continue;
  handled.add(id);
  if(row.reason==='support'){
   if(!independent(row)&&foundationStatus(p,row.q.skillId,now)!=='known'){
    const checked=row.q.skillId;
    const earlier=recentDifficulty(p,checked,now)?teachingRoute(p,checked,now,row.q):null;
    if(earlier&&earlier.kind!=='retry')return {...earlier,target:id,path:[id,...earlier.path]};
    return {id:checked,target:id,kind:'practice',path:[id,checked]};
   }
   recommendation??={id,target:id,kind:'retry',path:[id]};
  }else if(!independent(row)){
   recommendation??=teachingRoute(p,id,now,row.q);
  }
 }
 return recommendation;
}

export function roundRecommendation(p,round,now=Date.now()) {
 if(!round||round.endedAt<now-LEARNING_WINDOW)return null;
 const rows=round.rows||[];
 if(!round.coachDrill||!skillById(round.manual))return matchRecommendation(p,rows,now);
 const path=coachPathFor(round.manual,round.coachTarget,round.coachPath);
 const lastTwo=rows.slice(-2);
 const finishedIndependently=lastTwo.length===2&&lastTwo.every(row=>row?.q&&independent(row))&&lastTwo[0].q.key!==lastTwo[1].q.key;
 const earlier=path.slice(0,-1);
 if(round.complete&&finishedIndependently){
  return earlier.length?{id:earlier.at(-1),target:earlier[0],kind:'retry',path:earlier}:null;
 }
 const next=matchRecommendation(p,rows,now);
 if(next&&next.id!==round.manual)return {...next,target:path[0],path:[...earlier,...next.path]};
 return {id:round.manual,target:path[0],kind:'practice',path};
}

export function coachPathFor(skill,target,path){
 if(Array.isArray(path)&&path.at(-1)===skill&&new Set(path).size===path.length&&path.every(skillById))return path;
 return target!==skill&&skillById(target)?[target,skill]:[skill];
}

function samplePool(id) {
 const pool=questionPool(id);
 if(id==='add10')return pool.filter(q=>q.a>=3&&q.b>=2&&q.answer>=7);
 if(id==='sub10')return pool.filter(q=>q.a>=7&&q.b>=2&&q.answer>=2);
 if(id==='bonds10')return pool.filter(q=>q.a>=3&&q.a<=8);
 if(/^table\d+$/.test(id))return pool.filter(q=>q.b>=6&&q.b!==10);
 return pool;
}

export function nextFoundationCheck(p,s,now=Date.now(),planned=null) {
 if(s.manual||s.placement||s.progressCheck||s.promotion||s.tableChallenge)return null;
 initLearning(p);
 const rows=s.rows||[],seen=s.seen||[],last=rows.at(-1);
 const checks=rows.filter(row=>row.reason==='support');
 if(checks.length>=2||rows.length>=s.target)return null;
 const build=source=>{
  const step=coachRecommendation(p,source.skillId,now,source);
  if(step.kind==='retry'||checks.some(row=>row.coachFor===step.target||row.q.skillId===step.id))return null;
  const pool=samplePool(step.id).filter(q=>familyKey(q)!==familyKey(source)&&!seen.includes(q.key));
  return pool.length?{...step,pool,source}:null;
 };
 if(planned)return foundationNeeded(p,planned.skillId,now,planned)?build(planned):null;
 if(last?.q&&!last.correct&&!['support','repair'].includes(last.reason))return build(last.q);
 if(!rows.length&&p.placementComplete){
  for(const id of new Set([...probeIds(p),...Object.keys(p.learning)])){
   const gap=recentEvidence(p,id,now).at(-1);
   if(!gap?.probe||independent(gap))continue;
   const source=questionPool(id).find(q=>q.key===gap.key);
   const step=source&&build(source);
   if(step&&!recentEvidence(p,step.id,now).some(row=>row.coachFor===id&&row.at>=gap.at))return step;
  }
 }
 return null;
}

function supportSelection(p,check,seen,now,rng){
 const {id,target,pool,source}=check;
 const q=selectQuestion(p,[id],seen,now,rng,pool);
 return {q,coachFor:target,coachSource:source,reason:'support',label:'Skill check',detail:'A quick check of a skill that helps with the original question.'};
}

function replayQuestion(p,s,retry,seen,now,rng){
 const original=retry.q,id=original.skillId;
 const excluded=new Set([...seen,original.key]);
 if(skillById(id)?.category==='tables'){
  const mode=original.factFormat||(original.op==='÷'?'divide':original.op==='missing×'?'missing':'multiply');
  const table=tableOf(original);
  excluded.add(familyKey(original));
  for(const row of s.rows||[])if(row.q)excluded.add(familyKey(row.q));
  return tableQuestion(p,[id],seen,now,rng,mode,s,q=>!excluded.has(q.key)&&(!table||q.tableFocus===table));
 }
 const pool=questionPool(id).filter(q=>!excluded.has(q.key));
 const similar=pool.filter(q=>q.format===original.format&&q.op===original.op&&q.variant===original.variant);
 if(!pool.length)return null;
 return practiceQuestion(p,id,seen,now,rng);
}

export function nextAdaptive(p,s,now=Date.now(),rng=Math.random){
 initLearning(p);const seen=s.seen||[],rows=s.rows||[],recent=new Set(seen.slice(-3));
 if(s.progressCheck){
  const used=new Set(seen);
  const pool=s.checkQuestions||progressCheckQuestions(p,s.checkPlan);
  const ids=[...s.checkPlan.slice(rows.length%s.checkPlan.length),...s.checkPlan.slice(0,rows.length%s.checkPlan.length)];
  for(const id of ids){
   const known=pool.filter(q=>q.skillId===id&&!used.has(q.key));
   if(known.length)return {q:selectQuestion(p,[id],seen,now,rng,known),reason:'check-in',label:'Progress check',detail:'A question you have answered independently.'};
  }
  return null;
 }
 if(s.promotion){const ids=syllabusIds(s.curriculumYear||p.year),domains=[...new Set(ids.map(id=>domainFor(skillById(id))))],domain=domains[rows.length%domains.length],candidates=ids.filter(id=>domainFor(skillById(id))===domain),id=candidates[Math.floor(rows.length/domains.length)%candidates.length],sk=skillById(id),q=sk.category==='tables'?tableQuestion(p,[id],seen,now,rng,'mixed',s):selectQuestion(p,[id],seen,now,rng);return {q,reason:'promotion',label:'Promotion match',detail:'Independent mixed retrieval after practice and practical checks.'};}
 const check=nextFoundationCheck(p,s,now);
 if(check)return supportSelection(p,check,seen,now,rng);
 const recovery=recoveryStep(p,s,now,rng);
 if(recovery)return recovery;
 const deferred=new Set(rows.filter(row=>row.reason==='support'&&row.coachFor&&!independent(row)).map(row=>row.coachFor));
 if(!s.placement&&rows.filter(row=>row.reason==='repair').length<2){
  for(const retry of s.retries||[]){
   if(retry.at>rows.length||deferred.has(retry.q.skillId))continue;
   const q=replayQuestion(p,s,retry,seen,now,rng);
   if(q)return {q,reason:'repair',label:'Second chance',detail:'A fresh question on the same skill, after a few other shots.',retryKey:retry.q.key};
  }
 }
 if(s.manual){const q=skillById(s.manual).category==='tables'?tableQuestion(p,[s.manual],seen,now,rng,s.tableMode||'auto',s):practiceQuestion(p,s.manual,seen,now,rng);return {q,newFact:!p.facts[q.key],reason:'chosen',label:'Training',detail:'The exercise selected on the syllabus page.'};}
 if(s.placement){
  const ids=probeIds(p),index=s.probeIndex||0;
  if(index<ids.length){
   const id=ids[index];let pool=samplePool(id);
   const unseen=pool.filter(q=>!seen.includes(q.key));if(unseen.length)pool=unseen;
   const samples=new Set(pool.map(q=>q.key));
   const band=practicePool(p,id,now,seen).filter(q=>samples.has(q.key));
   const q=selectQuestion(p,[id],seen,now,rng,band.length?band:pool);
   return {q,reason:'probe',label:'Warm-up',detail:'Start with number facts and smaller methods. The chosen year sets the learning destination.',advanceProbe:true};
  }
 }
 const reviewCount=rows.filter(r=>r.reason==='review').length;
 if(!s.tableChallenge&&reviewCount<2&&(rows.length%4===3||rows.length%7===5)){
  const ids=[...new Set([...syllabusIds(p.year||1),...Object.keys(p.learning)])];
  const due=ids.filter(id=>!deferred.has(id)).flatMap(questionPool).filter(q=>{
   const fact=p.facts[q.key];
   return fact&&fact.due<=now&&!seen.includes(q.key)&&!recent.has(q.key)&&!foundationNeeded(p,q.skillId,now,q);
  });
  const unique=[...new Map(due.map(q=>[q.key,q])).values()];
  unique.sort((a,b)=>p.facts[a.key].due-p.facts[b.key].due);
  if(unique.length)return {q:{...unique[0]},reason:'review',label:'Match recall',detail:'This fact is due for spaced retrieval.'};
 }
 const year=p.year||1;
 const lanes=year===1?['foundation','curriculum','foundation','tables','curriculum','foundation','written','curriculum','foundation','curriculum']:year>=4?['curriculum','written','tables','curriculum','foundation','written','curriculum','tables','written','curriculum']:['foundation','tables','curriculum','tables','written','tables','foundation','curriculum','tables','curriculum'];
 let lane=s.tableChallenge?'tables':lanes[rows.length%lanes.length];
 let id=lane==='tables'&&s.focusTable&&!deferred.has(s.focusTable)?s.focusTable:laneFocus(p,lane,now,deferred);
 for(const fallback of LANES){
  if(id)break;
  id=laneFocus(p,fallback,now,deferred);
  lane=fallback;
 }
 const requested=id;id=methodEntry(p,id,now);
 const targeted=skillById(id),reason=competency(p,id).n?'weakness':'new';
 const q=targeted.category==='tables'?tableQuestion(p,[id],seen,now,rng,s.tableMode||'auto',s):practiceQuestion(p,id,seen,now,rng);
 const plannedCheck=nextFoundationCheck(p,s,now,q);
 if(plannedCheck)return supportSelection(p,plannedCheck,seen,now,rng);
 return {q,newFact:!p.facts[q.key],reason,coachFor:id!==requested?requested:undefined,label:lane==='tables'?'Ball control':lane==='written'?'Set piece':reason==='new'?'New move':'Training',detail:`${lane}: ${targeted.title}. ${reason==='new'?'Not yet sampled.':'Selected from recent accuracy and prerequisite evidence.'}`};
}
