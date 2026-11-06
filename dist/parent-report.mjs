import {skillById} from './engine.mjs';
import {DOMAINS,domainFor,syllabusIds} from './curriculum.mjs';
import {competency,initLearning,independent,LEARNING_WINDOW,recentDifficulty,recentEvidence,teachingRoute} from './adaptive.mjs?v=6.8.1';
import {teachingYear} from './teaching-order.mjs?v=6.8.0';

export const KNOWLEDGE_LEVELS={
 secure:'Secure',
 developing:'Developing',
 support:'Needs support',
 check:'Needs a check',
 review:'Refresh needed',
 unseen:'Not checked'
};

function skillEvidence(profile,id,now){
 const skill=skillById(id),recent=recentEvidence(profile,id,now).slice(-8);
 const correct=recent.filter(independent);
 const skipped=recent.filter(answer=>answer.unknown).length;
 const helped=recent.filter(answer=>answer.help&&!answer.unknown).length;
 const wrong=recent.length-correct.length-skipped-helped;
 const stats=competency(profile,id,now);
 let level='unseen';
 if(stats.n&&!recent.length)level='review';
 if(recent.length){
  if(recentDifficulty(profile,id,now))level='support';
  else if(stats.secure)level='secure';
  else if(new Set(correct.map(answer=>answer.key)).size>=2)level='developing';
  else level='check';
 }
 return {
  id,skill,domain:domainFor(skill),year:teachingYear(id),level,
  attempts:recent.length,total:stats.n,independent:correct.length,wrong,helped,skipped,
  lastAt:stats.lastAt??profile.learning[id]?.recent.at(-1)?.at,previouslySecure:level==='review'&&stats.secure,
  sessions:new Set(recent.map(answer=>answer.sessionId).filter(Boolean)).size,
 };
}

function lastDifficulty(profile,id,now){
 for(let i=profile.sessions.length-1;i>=0;i--){
  const match=profile.sessions[i];
  if(match.endedAt<now-LEARNING_WINDOW||match.endedAt>now||!Array.isArray(match.rows))continue;
  const row=match.rows.findLast(answer=>answer?.q&&
   (answer.q.skillId===id||id===`table${answer.q.tableFocus}`)&&!independent(answer));
  if(row)return row;
 }
 return null;
}

export function parentReport(profile,now=Date.now()){
 initLearning(profile);
 const year=profile.year||1;
 const currentIds=new Set(syllabusIds(year));
 const ids=[...new Set([...currentIds,...Object.keys(profile.learning).filter(skillById)])];
 const evidence=new Map(ids.map(id=>[id,skillEvidence(profile,id,now)]));
 const current=[...currentIds].map(id=>evidence.get(id));
 const counts=skills=>Object.fromEntries(Object.keys(KNOWLEDGE_LEVELS).map(level=>[level,skills.filter(skill=>skill.level===level).length]));
 const priorities=[...evidence.values()]
  .filter(skill=>skill.level==='support'||skill.level==='check'&&skill.attempts>skill.independent)
  .sort((a,b)=>Number(b.level==='support')-Number(a.level==='support')||
   Number(currentIds.has(b.id))-Number(currentIds.has(a.id))||
   b.sessions-a.sessions||b.attempts-b.independent-(a.attempts-a.independent)||b.lastAt-a.lastAt)
  .slice(0,5)
  .map(skill=>{
   const example=lastDifficulty(profile,skill.id,now);
   const route=teachingRoute(profile,skill.id,now,example?.q);
   return {...skill,route,example,next:evidence.get(route.id)||skillEvidence(profile,route.id,now)};
  });
 const domains=DOMAINS.map(domain=>{
  const skills=current.filter(skill=>skill.domain===domain.id);
  const earlier=[...evidence.values()].filter(skill=>skill.domain===domain.id&&!currentIds.has(skill.id)&&skill.total);
  const shown=[...skills,...earlier].filter(skill=>skill.level==='secure'||skill.level==='developing')
   .sort((a,b)=>Number(b.level==='secure')-Number(a.level==='secure')||
    b.year-a.year||b.independent-a.independent||b.lastAt-a.lastAt)[0];
  return {...domain,skills,earlier,shown,counts:counts(skills)};
 }).filter(domain=>domain.skills.length||domain.earlier.length);
 return {year,now,current,counts:counts(current),priorities,domains};
}
