import {questionPool,selectQuestion,factSecure,skillById} from './engine.mjs';
import {TABLE_TARGETS} from './primary.mjs';

export const focusTables=year=>TABLE_TARGETS[year]||TABLE_TARGETS[1];
export function tableEvidence(profile,table,now=Date.now()){
 const facts=questionPool(`table${table}`).map(q=>profile.facts[q.key]);
 const direct=facts.filter(f=>f?.forms?.multiply).length;
 const inverse=facts.filter(f=>f?.forms?.[`divide:${table}`]).length;
 const gaps=facts.filter(f=>f?.forms?.[`missing:${table}`]).length;
 const secure=facts.filter(f=>factSecure(f)&&f.forms?.multiply&&f.forms?.[`divide:${table}`]).length;
 return {total:facts.length,direct,inverse,gaps,secure,complete:direct===facts.length&&inverse===facts.length,matchFit:secure===facts.length,due:facts.filter(f=>f&&f.due<=now).length};
}
export function factForm(q){
 if(q.factFormat==='divide'||q.op==='÷')return `divide:${q.op==='÷'?q.b:q.tableFocus}`;
 if(q.factFormat==='missing'||q.op==='missing×')return `missing:${q.tableFocus||q.a}`;
 return 'multiply';
}
function canonical(q){
 const table=q.tableFocus||q.table||(q.op==='÷'?q.b:q.a),other=q.op==='÷'?q.answer:q.b;
 return {...q,a:table,b:other,answer:table*other,op:'×',tableFocus:table,otherFactor:other,key:`×:${Math.min(table,other)}:${Math.max(table,other)}`};
}
export function tableQuestion(profile,ids,seen=[],now=Date.now(),rng=Math.random,mode='auto',round=null,allow=null){
 let pool=[...new Map(ids.flatMap(questionPool).map(canonical).map(q=>[q.key+'|'+q.tableFocus,q])).values()];
 if(!pool.length)return null;
 const introduced=new Set((round?.rows||[]).filter(r=>r.newFact&&r.q.factFamily).map(r=>r.q.key));
 if(introduced.size>=3){const known=pool.filter(q=>profile.facts[q.key]);if(known.length)pool=known;}
 if(allow)pool=pool.filter(allow);
 if(!pool.length)return null;
 const base=selectQuestion(profile,ids,seen,now,rng,pool),f=profile.facts[base.key];
 if(mode==='auto'&&ids.every(id=>skillById(id)?.kind==='div'))mode='divide';
 let format=mode==='mixed'?['multiply','divide','missing'][Math.floor(rng()*3)]:mode;
 if(format==='auto'||format==='learn')format=!f?.forms?.multiply?'multiply':!f.forms[`divide:${base.tableFocus}`]?'divide':!f.forms[`missing:${base.tableFocus}`]?'missing':['multiply','divide','missing'][Math.floor(rng()*3)];
 const q={...base,factFamily:true,factFormat:format,variant:format};
 if(format==='divide'){q.a=base.a*base.b;q.b=base.a;q.op='÷';q.answer=base.b;}
 else if(format==='missing'){q.a=base.a;q.b=base.b;q.total=base.a*base.b;q.op='missing×';q.answer=base.b;}
 else if(rng()<.5){q.a=base.b;q.b=base.a;}
 return q;
}
