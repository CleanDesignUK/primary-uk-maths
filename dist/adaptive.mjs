import {SKILLS,skillById,questionPool,selectQuestion,recordFact,localDay,DAY,skillStats} from './engine.mjs';
import {syllabusIds,domainFor} from './curriculum.mjs';
import {focusTables,tableEvidence,tableQuestion} from './tables.mjs?v=6.7.0';

export const REQUIREMENTS={
 mix2510:['table2','table5','table10'],div2510:['mix2510'],add20:['add10','bonds10'],sub20:['sub10','bonds10'],missing20:['add20','sub20'],place2:['count1'],mental2:['place2','bridgeAdd','bridgeSub'],related2:['bonds10'],frac2:['fraction1'],place4:['place3'],place7:['place6'],round4:['place4'],round6:['place7'],
 bonds10:['add10'],bridgeAdd:['add10','bonds10'],bridgeSub:['sub10','bonds10'],bonds20:['bonds10'],missing:['add10','sub10'],
 table4:['table2'],table8:['table4'],table6:['table3'],table9:['table3'],table12:['table6'],mix348:['table3','table4','table8'],mixAll:Array.from({length:12},(_,i)=>`table${i+1}`),div348:['table3','table4','table8'],divAll:['mixAll'],
 colAdd0:['add10','place2'],colAdd1:['bridgeAdd','colAdd0'],colAdd2:['bridgeAdd','colAdd1','place3'],colAdd3:['bridgeAdd','colAdd2','place4'],colAdd4:['bridgeAdd','colAdd3','place6'],
 colSub0:['sub10','place2'],colSub1:['bridgeSub','colSub0'],colSub2:['bridgeSub','colSub1','place3'],colSub3:['bridgeSub','colSub2','place4'],colSub4:['bridgeSub','colSub3','place6'],
 mul4:['mulWritten3','place3'],mul5:['mul4','powers5'],longMul6:['mul5','mul4'],divide4:['divWritten3'],division5:['divide4','divAll'],longDiv6:['division5','divide4'],
 fracEq4:['fracEq3'],fracCalc4:['fracCalc3'],fracCalc5:['fracCalc4','fracEq5'],fracCalc6:['fracCalc5','fracEq5','mixed5'],
 ratio6:['fracOf3'],share6:['ratio6'],percent6:['percent5'],fracMul6:['fracOf4'],fracDiv6:['fracMul6'],
};
export const requirements=id=>REQUIREMENTS[id]||skillById(id)?.requires||[];
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
 st.recent=[...st.recent.slice(-19),{key:q.key,correct:correct&&!help,help,ms,at:now,variant:q.factFormat??q.variant??q.op,sessionId,probe,unknown,coachFor}];
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
const independent=row=>row.correct&&!row.assisted&&!row.help&&!row.unknown;
const recentEvidence=(p,id,now)=>(p.learning[id]?.recent||[]).filter(row=>row.at>=now-30*DAY&&row.at<=now);
const tableOf=q=>q?.tableFocus||q?.table||(q?.op==='÷'?q.b:null);
function familyKey(q){
 if(q.op==='÷'&&q.key.startsWith('÷:'))return `×:${Math.min(q.b,q.answer)}:${Math.max(q.b,q.answer)}`;
 return q.key;
}
function foundationStatus(p,id,now){
 const sample=recentEvidence(p,id,now).slice(-5);
 const missed=sample.filter(row=>!independent(row));
 const distinct=rows=>new Set(rows.map(row=>row.key)).size;
 if(sample.at(-1)?.coachFor&&!independent(sample.at(-1)))return 'practice';
 if(distinct(missed)>=2&&missed.length>=sample.length/2)return 'practice';
 if(distinct(sample.filter(independent))>=3&&missed.length<=1)return 'known';
 return 'check';
}

export function coachRecommendation(p,id,now=Date.now(),question=null){
 initLearning(p);
 const table=tableOf(question);
 const candidates=skillById(id)?.tables?.includes(table)?[`table${table}`]:requirements(id);
 const steps=candidates.map(req=>({id:req,target:id,kind:foundationStatus(p,req,now)}));
 return steps.find(step=>step.kind==='practice')||steps.find(step=>step.kind==='check')||{id,target:id,kind:'retry'};
}

export function resolvePrerequisite(p,id,now=Date.now()){
 initLearning(p);
 if(foundationStatus(p,id,now)!=='practice')return id;
 const step=coachRecommendation(p,id,now);
 return step.kind==='practice'?step.id:id;
}
const PROBES3=['add10','sub10','table3','bonds10','table4','bridgeAdd','table8','bridgeSub','place3','colAdd0','colSub0','div348'];
const PROBES5=['place6','mental5','table6','colAdd4','colSub4','mul5','division5','fracCalc5','decimalCalc5','percent5','area5','table5'];
const PROBE_YEARS={1:['objects1','more1','add10','sub10','bonds10','add20','sub20','groups1','fraction1','clock1','shape1','position1'],2:['place2','add20','sub20','mental2','table2','table5','table10','frac2','money2','clock2','shape2','data2'],3:PROBES3,4:['place4','round4','table6','table7','table9','table12','colAdd3','colSub3','decimal4','coordinate4','chart4','mul4'],5:PROBES5,6:['place7','negative6','table7','longMul6','longDiv6','fracCalc6','decimalMul6','ratio6','equation6','area6','coordinate6','mean6']};
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
 const routed=ids=>available(available(ids).map(id=>resolvePrerequisite(p,id,now)));
 if (lane === 'foundation') {
  const targets = year <= 2 ? ['add20','sub20','missing20','bonds20'] : year === 3 ? ['bridgeAdd','bridgeSub','bonds20','missing'] : year === 4 ? ['round4','decimal4'] : year === 5 ? ['mental5','decimalCalc5'] : ['mental6','order6'];
  const gaps = routed(targets.filter(id=>!competency(p,id,now).ready));
  return weakest(p,gaps.length?gaps:routed(targets));
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
  return weakest(p,routed(targets));
 }
 const ids = syllabusIds(year).filter(id => skillById(id).extra);
 return [...new Set(routed(ids))].sort((a,b) => {
  const x = competency(p,a,now), y = competency(p,b,now);
  return Number(x.secure) - Number(y.secure) || x.n - y.n;
 })[0];
}
const LANES=['foundation','tables','written','curriculum'];
export function planSummary(p){return LANES.map(lane=>({lane,id:laneFocus(p,lane),why:lane==='foundation'?'Build strong number skills':lane==='tables'?'Build individual recall before mixing':lane==='written'?'Use facts in a written method':'Keep the wider curriculum in practice'}));}

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
  const recommendation=coachRecommendation(profile,id,now);
  return [{id,title:skillById(id).title,difficulties,attempts:recent.length,next:recommendation.id,kind:recommendation.kind}];
 }).sort((a,b) => b.difficulties / b.attempts - a.difficulties / a.attempts);
}

export function matchRecommendation(p,rows,now=Date.now()) {
 initLearning(p);
 const handled=new Set();
 let recommendation=null;
 for(const row of [...rows].reverse()){
  const id=row.reason==='support'?row.coachFor:row.q?.skillId;
  if(!id||handled.has(id))continue;
  handled.add(id);
  if(row.reason==='support'){
   if(!independent(row)&&foundationStatus(p,row.q.skillId,now)!=='known')return {id:row.q.skillId,target:id,kind:'practice'};
   recommendation??={id,target:id,kind:'retry'};
  }else if(!independent(row)){
   recommendation??=coachRecommendation(p,id,now,row.q);
  }
 }
 return recommendation;
}

function samplePool(id) {
 const pool=questionPool(id);
 if(id==='add10')return pool.filter(q=>q.a>=3&&q.b>=2&&q.answer>=7);
 if(id==='sub10')return pool.filter(q=>q.a>=7&&q.b>=2&&q.answer>=2);
 if(id==='bonds10')return pool.filter(q=>q.a>=3&&q.a<=8);
 if(/^table\d+$/.test(id))return pool.filter(q=>q.b>=6&&q.b!==10);
 return pool;
}

export function nextFoundationCheck(p,s,now=Date.now()) {
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
 if(last?.q&&!last.correct&&!['support','repair'].includes(last.reason))return build(last.q);
 if(!rows.length&&p.placementComplete){
  for(const id of probeIds(p)){
   const gap=recentEvidence(p,id,now).at(-1);
   if(!gap?.probe||independent(gap))continue;
   const source=questionPool(id).find(q=>q.key===gap.key);
   const step=source&&build(source);
   if(step&&!recentEvidence(p,step.id,now).some(row=>row.coachFor===id&&row.at>=gap.at))return step;
  }
 }
 return null;
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
 return selectQuestion(p,[id],seen,now,rng,similar.length?similar:pool);
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
 if(check){
  const {id,target,pool,source}=check,q=selectQuestion(p,[id],seen,now,rng,pool);
  return {q,coachFor:target,coachSource:source,reason:'support',label:'Skill check',detail:'A quick check of a skill that helps with the original question.'};
 }
 const deferred=new Set(rows.filter(row=>row.reason==='support'&&row.coachFor&&!independent(row)).map(row=>row.coachFor));
 if(!s.placement&&rows.filter(row=>row.reason==='repair').length<2){
  for(const retry of s.retries||[]){
   if(retry.at>rows.length||deferred.has(retry.q.skillId))continue;
   const q=replayQuestion(p,s,retry,seen,now,rng);
   if(q)return {q,reason:'repair',label:'Second chance',detail:'A fresh question on the same skill, after a few other shots.',retryKey:retry.q.key};
  }
 }
 if(s.manual){const q=skillById(s.manual).category==='tables'?tableQuestion(p,[s.manual],seen,now,rng,s.tableMode||'auto',s):selectQuestion(p,[s.manual],seen,now,rng);return {q,newFact:!p.facts[q.key],reason:'chosen',label:'Training',detail:'The exercise selected on the syllabus page.'};}
 if(s.placement){
  const ids=probeIds(p),index=s.probeIndex||0;
  if(index<ids.length){
   const id=ids[index];let pool=samplePool(id);
   const unseen=pool.filter(q=>!seen.includes(q.key));if(unseen.length)pool=unseen;
   const q={...pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]};
   return {q,reason:'probe',label:'Warm-up',detail:'A nontrivial sample checks number facts, tables and written methods; no identity-only probe is used.',advanceProbe:true};
  }
 }
 const reviewCount=rows.filter(r=>r.reason==='review').length;
 if(!s.tableChallenge&&reviewCount<2&&(rows.length%4===3||rows.length%7===5)){
  const ids=[...new Set([...syllabusIds(p.year||1),...Object.keys(p.learning)])];
  const due=ids.filter(id=>!deferred.has(id)).flatMap(questionPool).filter(q=>{const f=p.facts[q.key];return f&&f.due<=now&&!seen.includes(q.key)&&!recent.has(q.key);});
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
 const targeted=skillById(id),reason=competency(p,id).n?'weakness':'new';
 const q=targeted.category==='tables'?tableQuestion(p,[id],seen,now,rng,s.tableMode||'auto',s):selectQuestion(p,[id],seen,now,rng);
 return {q,newFact:!p.facts[q.key],reason,label:lane==='tables'?'Ball control':lane==='written'?'Set piece':reason==='new'?'New move':'Training',detail:`${lane}: ${targeted.title}. ${reason==='new'?'Not yet sampled.':'Selected from recent accuracy and prerequisite evidence.'}`};
}
export function validateLearningGraph(){for(const skill of SKILLS){const walk=(id,path=[])=>{if(path.includes(id))throw new Error(`Prerequisite cycle: ${[...path,id].join(' → ')}`);for(const req of requirements(id)){if(!skillById(req))throw new Error(`Unknown prerequisite ${req}`);walk(req,[...path,id]);}};walk(skill.id);}return true;}
