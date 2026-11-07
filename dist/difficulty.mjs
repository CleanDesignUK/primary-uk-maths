import {questionPool,selectQuestion,DAY} from './engine.mjs';
import {writtenTask} from './written-work.mjs';

export const METHOD_LADDERS=[
 ['colAdd0','colAdd1','colAdd2','colAdd3','colAdd4'],
 ['colSub0','colSub1','colSub2','colSub3','colSub4'],
 ['mulWritten3','mul4','mul5','longMul6'],
 ['divWritten3','divide4','division5','longDiv6']
];
const good=r=>r.correct&&!r.help&&!r.assisted&&!r.unknown;
const evidence=(p,id,now)=>(p.learning?.[id]?.recent||[]).filter(r=>r.at>=now-30*DAY&&r.at<=now);
export function methodChecked(p,id,now){
 const recent=evidence(p,id,now).slice(-5),correct=recent.filter(good);
 const pool=questionPool(id),lookup=new Map(pool.map(q=>[q.key,q]));
 const variants=[...new Set(pool.filter(q=>writtenTask(q)).map(methodVariant))];
 const variantEvidence=variants.every(v=>new Set(evidence(p,id,now).filter(r=>good(r)&&lookup.has(r.key)&&methodVariant(lookup.get(r.key))===v).map(r=>r.key)).size>=3);
 return new Set(correct.map(r=>r.key)).size>=3&&correct.length/recent.length>=.8&&variantEvidence;
}
export function methodEntry(p,target,now){
 const ladder=METHOD_LADDERS.find(ids=>ids.includes(target));
 return ladder?.slice(0,ladder.indexOf(target)).find(id=>!methodChecked(p,id,now))||target;
}
export function methodVariant(q){
 const task=writtenTask(q);
 if(task?.type==='multiply')return `multiply:${q.skillId==='decimalMul6'||task.decimalPlaces?'decimal':task.b>=10?'long':'short'}`;
 if(task)return `${task.type}:${q.skillId==='decimalDiv6'||task.decimalPlaces?'decimal':task.needsRemainder?'remainder':'exact'}`;
 return String(q.factFormat??q.variant??q.op??q.format);
}
export function questionDemand(q){
 const task=writtenTask(q);
 const a=Number(task?.a??q.a??0),b=Number(task?.b??q.b??0);
 const digits=n=>String(Math.trunc(Math.abs(n))).length;
 if(q.key.startsWith('column')){
  let carry=0,exchanges=0,x=a,y=b;
  while(x||y){const u=x%10,v=y%10;carry=q.op==='+'?Number(u+v+carry>=10):Number(u-carry<v);exchanges+=carry;x=Math.floor(x/10);y=Math.floor(y/10);}
  return digits(a)*100+exchanges*15+(q.op==='−'&&/0/.test(String(a))?25:0)+(a+b)/10**digits(a);
 }
 if(task)return digits(a)*100+digits(b)*40+Math.log10(Math.abs(a)+1)*5+b+(task.needsRemainder?20:0);
 const numbers=String(q.expression||'').match(/\d+(?:\.\d+)?/g)?.map(Number)||[a,b];
 return numbers.reduce((n,v)=>n+Math.log10(Math.abs(v)+1),0)+numbers.length;
}

// Keep structurally different methods separate until there is evidence for each.
// Random selection happens only inside the child's current difficulty band.
export function practicePool(p,id,now,seen=[]){
 const pool=questionPool(id),recent=evidence(p,id,now),lookup=new Map(pool.map(q=>[q.key,q]));
 const groups=[...new Set(pool.map(methodVariant))].sort((a,b)=>{
  const rank=v=>/short|exact/.test(v)?0:/long|remainder/.test(v)?1:0;
  return rank(a)-rank(b);
 });
 const covered=variant=>new Set(recent.filter(r=>good(r)&&lookup.has(r.key)&&methodVariant(lookup.get(r.key))===variant).map(r=>r.key)).size>=3;
 const last=recent.at(-1),previous=lookup.get(last?.key);
 let variant=previous&&!good(last)?methodVariant(previous):groups.find(v=>!covered(v))||groups[recent.length%groups.length];
 let choices=pool.filter(q=>methodVariant(q)===variant).sort((a,b)=>questionDemand(a)-questionDemand(b));
 const answers=recent.filter(r=>lookup.has(r.key)&&methodVariant(lookup.get(r.key))===variant).slice(-8);
 const successes=new Set(answers.filter(good).map(r=>r.key)).size;
 const mistakes=answers.filter(r=>!good(r)).length;
 const fraction=Math.min(1,.3+Math.max(0,successes-mistakes*2)*.14);
 let band=choices.slice(0,Math.max(Math.min(4,choices.length),Math.ceil(choices.length*fraction)));
 if(previous&&!good(last)){
  const easier=choices.filter(q=>questionDemand(q)<questionDemand(previous));
  band=easier.length?easier:choices.filter(q=>questionDemand(q)<=questionDemand(previous));
 }
 const fresh=band.filter(q=>!seen.slice(-3).includes(q.key));
 return fresh.length?fresh:band;
}
export const practiceQuestion=(p,id,seen,now,rng)=>selectQuestion(p,[id],seen,now,rng,practicePool(p,id,now,seen));

export function recoveryStep(p,round,now,rng){
 if(round.placement||round.progressCheck||round.promotion||round.tableChallenge)return null;
 const last=round.rows?.at(-1);if(!last?.q)return null;
 const ladder=METHOD_LADDERS.find(ids=>ids.includes(last.q.skillId));
 if(!ladder)return null;
 const target=last.reason==='ease'?last.coachFor:last.q.skillId;
 let id=last.q.skillId;
 if(!good(last))id=ladder[Math.max(0,ladder.indexOf(id)-1)];
 else if(last.reason==='ease'){
  const wins=round.rows.slice(-2);
  const recovered=wins.length===2&&wins.every(r=>r.q.skillId===id&&good(r))&&wins[0].q.key!==wins[1].q.key;
  if(recovered){
   if(id===target)return null;
   id=ladder[Math.min(ladder.indexOf(target),ladder.indexOf(id)+1)];
  }
 }else return null;
 const q=practiceQuestion(p,id,round.seen||[],now,rng);
 return {q,reason:'ease',coachFor:target,label:'Build confidence',detail:id===target?'A simpler question in the same method.':'A smaller version of the same method. Two independent successes build towards the original skill.'};
}
