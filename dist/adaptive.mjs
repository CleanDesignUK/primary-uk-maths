import {SKILLS,skillById,questionPool,selectQuestion,recordFact,localDay,DAY,skillStats} from './engine.mjs';
import {syllabusIds,domainFor} from './curriculum.mjs';
import {focusTables,tableEvidence,tableQuestion} from './tables.mjs';

export const REQUIREMENTS={
 mix2510:['table2','table5','table10'],div2510:['mix2510'],add20:['add10','bonds10'],sub20:['sub10','bonds10'],missing20:['add20','sub20'],place2:['count1'],mental2:['place2','bridgeAdd','bridgeSub'],related2:['bonds10'],frac2:['fraction1'],place4:['place3'],place7:['place6'],round4:['place4'],round6:['place7'],mul4:['mulWritten3'],longMul6:['mul5'],longDiv6:['division5'],ratio6:['fracOf3'],share6:['ratio6'],percent6:['percent5'],fracMul6:['fracOf4'],fracDiv6:['fracMul6'],fracCalc6:['fracCalc5'],
 bonds10:['add10'],bridgeAdd:['add10','bonds10'],bridgeSub:['sub10','bonds10'],bonds20:['bonds10'],missing:['add10','sub10'],
 table4:['table2'],table8:['table4'],table6:['table3'],table9:['table3'],table12:['table6'],mix348:['table3','table4','table8'],mixAll:Array.from({length:12},(_,i)=>`table${i+1}`),div348:['table3','table4','table8'],divAll:['mixAll'],
 colAdd0:['add10'],colSub0:['sub10'],colAdd1:['colAdd0','bridgeAdd'],colSub1:['colSub0','bridgeSub'],colAdd2:['colAdd1','place3'],colSub2:['colSub1','place3'],colAdd3:['colAdd2'],colSub3:['colSub2'],colAdd4:['colAdd3','place6'],colSub4:['colSub3','place6'],
};
export const requirements=id=>REQUIREMENTS[id]||skillById(id)?.requires||[];
export function initLearning(p){
 if(!p.familyVersion){for(const [key,f] of Object.entries(p.facts||{})){f.forms||={};if(key.startsWith('×:')&&f.history?.some(h=>h.correct))f.forms.multiply=true;const m=key.match(/^÷:(\d+):(\d+)/);if(m&&f.lastCorrect){const a=Number(m[1]),b=Number(m[2]),other=a/b,k=`×:${Math.min(b,other)}:${Math.max(b,other)}`;if(p.facts[k]){p.facts[k].forms||={};p.facts[k].forms[`divide:${b}`]=true;}}}p.familyVersion=4;}
 if(p.learning)return p;
 p.learning={};
 for(const s of p.sessions||[])for(const r of s.rows||[])if(r.q?.skillId&&skillById(r.q.skillId))updateLearning(p,r.q,r.correct,!!r.assisted,r.ms||0,s.id,s.endedAt||Date.now(),false);
 p.placementComplete=!!p.placementComplete||(p.sessions||[]).some(s=>s.mode==='check'&&s.complete);
 return p;
}
function updateLearning(p,q,correct,help,ms,sessionId,now,probe){
 const st=p.learning[q.skillId]||{n:0,correct:0,recent:[],keys:[],days:[],probes:[],firstAt:now};
 st.n++;st.correct+=correct&&!help?1:0;st.lastAt=now;
 st.recent=[...st.recent.slice(-19),{key:q.key,correct:correct&&!help,help,ms,at:now,variant:q.factFormat??q.variant??q.op,sessionId,probe}];
 if(!st.keys.includes(q.key))st.keys.push(q.key);
 if(correct&&!help&&!st.days.includes(localDay(now)))st.days.push(localDay(now));
 if(probe&&correct&&!help&&!st.probes.includes(q.key))st.probes.push(q.key);
 p.learning[q.skillId]=st;return st;
}
export function recordLearning(p,q,correct,help,ms,sessionId,now=Date.now(),probe=false){
 initLearning(p);recordFact(p,q,correct,help,ms,now);const result=updateLearning(p,q,correct,help,ms,sessionId,now,probe);
 if(q.factFamily&&q.tableFocus&&q.skillId!==`table${q.tableFocus}`)updateLearning(p,{...q,skillId:`table${q.tableFocus}`},correct,help,ms,sessionId,now,probe);
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
export function resolvePrerequisite(p,id,visited=new Set()){
 if(visited.has(id))return id;visited.add(id);
 for(const req of requirements(id)){const c=competency(p,req);if(!c.ready&&!(c.n>=3&&c.accuracy>=95))return resolvePrerequisite(p,req,visited);}
 return id;
}
const PROBES3=['add10','sub10','table3','bonds10','table4','bridgeAdd','table8','bridgeSub','place3','colAdd0','colSub0','div348'];
const PROBES5=['add10','sub10','table3','bridgeAdd','table4','bridgeSub','table8','table6','table7','table9','colAdd2','colSub2'];
const PROBE_YEARS={1:['objects1','more1','add10','sub10','bonds10','add20','sub20','groups1','fraction1','clock1','shape1','position1'],2:['place2','add20','sub20','mental2','table2','table5','table10','frac2','money2','clock2','shape2','data2'],3:PROBES3,4:['add10','sub10','place4','table6','table7','table9','table12','colAdd3','colSub3','decimal4','coordinate4','chart4'],5:PROBES5,6:['place7','negative6','table7','longMul6','longDiv6','fracCalc6','decimalMul6','ratio6','equation6','area6','coordinate6','mean6']};
export const probeIds=p=>PROBE_YEARS[p.year]||PROBES3;
function weakest(p,ids){
 return [...new Set(ids)].sort((a,b)=>{
   const x=competency(p,a),y=competency(p,b);
   const score=(c,id)=>(c.accuracy===null?40:100-c.accuracy)+(!c.ready?30:0)-(p.learning[id]?.n||0)*.75;
   return score(y,b)-score(x,a);
 })[0];
}
function yearTarget(profile, id) {
 const year = profile.year || 1;
 if (year <= 3) return resolvePrerequisite(profile, id);
 const evidence = competency(profile, id);
 // Unseen earlier years are not evidence of a gap.
 if (evidence.n < 3 || evidence.accuracy >= 60) return id;
 return requirements(id)[0] || id;
}
export function laneFocus(p, lane) {
 initLearning(p);
 const year = p.year || 1;
 if (lane === 'foundation') {
  const targets = year <= 2 ? ['add20','sub20','missing20','bonds20'] : year === 3 ? ['bridgeAdd','bridgeSub','bonds20','missing'] : year === 4 ? ['round4','decimal4'] : year === 5 ? ['mental5','decimalCalc5'] : ['mental6','order6'];
  const gaps = targets.filter(id => !competency(p, id).ready);
  return weakest(p, (gaps.length ? gaps : targets).map(id => yearTarget(p, id)));
 }
 if (lane === 'tables') {
  const tables = focusTables(year).map(n => `table${n}`);
  if (!tables.length) return 'groups1';
  const gaps = tables.filter(id => !tableEvidence(p, Number(id.slice(5))).complete);
  if (gaps.length) return weakest(p, gaps);
  return year === 2 ? 'mix2510' : year === 3 ? 'mix348' : 'mixAll';
 }
 if (lane === 'written') {
  const targets = year === 1 ? ['stories1','missing20'] : year === 2 ? ['mental2','inverse2','threeAdd2'] : year === 3 ? ['colAdd2','colSub2'] : year === 4 ? ['colAdd3','colSub3','mul4','divide4'] : year === 5 ? ['colAdd4','colSub4','mul5','division5'] : ['longMul6','longDiv6'];
  return weakest(p, targets.map(id => yearTarget(p, id)));
 }
 const ids = syllabusIds(year).filter(id => skillById(id).extra);
 return [...new Set(ids.map(id => yearTarget(p, id)))].sort((a,b) => {
  const x = competency(p,a), y = competency(p,b);
  return Number(x.secure) - Number(y.secure) || x.n - y.n;
 })[0];
}
export function planSummary(p){return ['foundation','tables','written','curriculum'].map(lane=>({lane,id:laneFocus(p,lane),why:lane==='foundation'?'Close a prerequisite gap':lane==='tables'?'Build individual recall before mixing':lane==='written'?'Use facts in a written method':'Keep the wider curriculum in practice'}));}

export function progressCheckPlan(profile) {
 const skills = syllabusIds(profile.year || 1).map(id => ({id, ...competency(profile, id)}));
 const practised = skills.filter(skill => skill.n >= 3 && skill.accuracy >= 60);
 const ordered = practised.sort((a,b) => Number(a.secure) - Number(b.secure) || b.n - a.n).map(skill => skill.id);
 const domains = [...new Set(ordered.map(id => domainFor(skillById(id))))];
 const varied = domains.map(domain => ordered.find(id => domainFor(skillById(id)) === domain));
 return [...varied, ...ordered.filter(id => !varied.includes(id))].slice(0,6);
}

export function learningNotes(profile) {
 initLearning(profile);
 return syllabusIds(profile.year || 1).flatMap(id => {
  const recent = profile.learning[id]?.recent.slice(-8) || [];
  const sessions = new Set(recent.map(row => row.sessionId));
  const difficulties = recent.filter(row => !row.correct).length;
  if (recent.length < 6 || sessions.size < 2 || difficulties / recent.length < .5) return [];
  return [{id, title: skillById(id).title, difficulties, attempts: recent.length, next: requirements(id)[0] || id}];
 }).sort((a,b) => b.difficulties / b.attempts - a.difficulties / a.attempts);
}

export function nextAdaptive(p,s,now=Date.now(),rng=Math.random){
 initLearning(p);const seen=s.seen||[],rows=s.rows||[],recent=new Set(seen.slice(-3));
 const retry=(s.retries||[]).find(r=>r.at<=rows.length&&!recent.has(r.q.key));
 if(retry&&!s.placement)return {q:{...retry.q},reason:'repair',label:'Replay',detail:'A previous mistake, revisited after other questions.',retryKey:retry.q.key};
 if(s.progressCheck){
  const ids=s.checkPlan, id=ids[rows.length%ids.length];
  const known=questionPool(id).filter(q=>p.facts[q.key]?.history?.some(answer=>answer.correct));
  const q=selectQuestion(p,[id],seen,now,rng,known.length>=3?known:null);
  return {q,reason:'check-in',label:'Progress check',detail:'A skill you have already practised.'};
 }
 if(s.promotion){const ids=syllabusIds(s.curriculumYear||p.year),domains=[...new Set(ids.map(id=>domainFor(skillById(id))))],domain=domains[rows.length%domains.length],candidates=ids.filter(id=>domainFor(skillById(id))===domain),id=candidates[Math.floor(rows.length/domains.length)%candidates.length],sk=skillById(id),q=sk.category==='tables'?tableQuestion(p,[id],seen,now,rng,'mixed',s):selectQuestion(p,[id],seen,now,rng);return {q,reason:'promotion',label:'Promotion match',detail:'Independent mixed retrieval after practice and practical checks.'};}
 if(s.manual){const q=skillById(s.manual).category==='tables'?tableQuestion(p,[s.manual],seen,now,rng,s.tableMode||'auto',s):selectQuestion(p,[s.manual],seen,now,rng);return {q,newFact:!p.facts[q.key],reason:'chosen',label:'Training',detail:'The exercise selected on the syllabus page.'};}
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
 if(last&&!last.correct&&prev&&!prev.correct&&rows.filter(row=>row.reason==='support').length<2){
  const target=requirements(last.q.skillId)[0]||last.q.skillId;
  const id=p.year>=4?target:resolvePrerequisite(p,target);
  return {q:selectQuestion(p,[id],seen,now,rng),reason:'support',label:'Build-up',detail:'Coach picked a supporting skill after two difficult answers.'};
 }
 const reviewCount=rows.filter(r=>r.reason==='review').length;
 if(reviewCount<2&&(rows.length%4===3||rows.length%7===5)){
  const ids=[...new Set([...syllabusIds(p.year||1),...Object.keys(p.learning)])];
  const due=ids.flatMap(questionPool).filter(q=>{const f=p.facts[q.key];return f&&f.due<=now&&!seen.includes(q.key)&&!recent.has(q.key);});
  const unique=[...new Map(due.map(q=>[q.key,q])).values()];
  unique.sort((a,b)=>p.facts[a.key].due-p.facts[b.key].due);
  if(unique.length)return {q:{...unique[0]},reason:'review',label:'Match recall',detail:'This fact is due for spaced retrieval.'};
 }
 const year=p.year||1;
 const lanes=year===1?['foundation','curriculum','foundation','tables','curriculum','foundation','written','curriculum','foundation','curriculum']:year>=4?['curriculum','written','tables','curriculum','foundation','written','curriculum','tables','written','curriculum']:['foundation','tables','curriculum','tables','written','tables','foundation','curriculum','tables','curriculum'];
 const lane=s.tableChallenge?'tables':lanes[rows.length%lanes.length],id=lane==='tables'&&s.focusTable?s.focusTable:laneFocus(p,lane);
 const targeted=skillById(id),reason=competency(p,id).n?'weakness':'new';
 const q=targeted.category==='tables'?tableQuestion(p,[id],seen,now,rng,s.tableMode||'auto',s):selectQuestion(p,[id],seen,now,rng);
 return {q,newFact:!p.facts[q.key],reason,label:lane==='tables'?'Ball control':lane==='written'?'Set piece':reason==='new'?'New move':'Training',detail:`${lane}: ${targeted.title}. ${reason==='new'?'Not yet sampled.':'Selected from recent accuracy and prerequisite evidence.'}`};
}
export function validateLearningGraph(){for(const skill of SKILLS){const walk=(id,path=[])=>{if(path.includes(id))throw new Error(`Prerequisite cycle: ${[...path,id].join(' → ')}`);for(const req of requirements(id)){if(!skillById(req))throw new Error(`Unknown prerequisite ${req}`);walk(req,[...path,id]);}};walk(skill.id);}return true;}
