import {MATCH_SCHEMA} from './rewards.mjs?v=7.1.2';
import {skillById,DAY} from './engine.mjs?v=7.1.2';
import {syllabusIds,domainFor,DOMAINS} from './curriculum.mjs?v=7.1.2';
import {competency} from './adaptive.mjs?v=7.1.2';
import {PRACTICAL} from './primary.mjs?v=7.1.2';
import {initCareer} from './career.mjs?v=7.1.2';
import {tableEvidence,focusTables} from './tables.mjs?v=7.1.2';

export function yearProgress(profile,year=profile.year,now=Date.now()){
 initCareer(profile);const ids=syllabusIds(year);
 const skills=ids.map(id=>{const c=competency(profile,id,now),skill=skillById(id),table=/^table\d+$/.test(id)?Number(id.slice(5)):null,fit=table?tableEvidence(profile,table,now).matchFit&&c.ready:c.secure;return {id,title:skill.title,domain:domainFor(skill),...c,secure:fit};});
 const practical=(PRACTICAL[year]||[]).map(([id,title,detail])=>({id:`y${year}:${id}`,title,detail,done:!!profile.practical[`y${year}:${id}`]}));
 const secure=skills.filter(s=>s.secure).length,ready=skills.filter(s=>s.ready).length,checked=practical.filter(p=>p.done).length;
 return {year,skills,practical,total:skills.length,secure,ready,checked,percent:Math.round(100*(secure+checked)/(skills.length+practical.length)),eligible:skills.length>0&&secure===skills.length&&checked===practical.length,domains:DOMAINS.map(d=>({...d,skills:skills.filter(s=>s.domain===d.id)})).filter(d=>d.skills.length)};
}
export function checkPromotion(profile,match,now=Date.now()){
 if(!match.promotion||!match.complete||match.attempts!==match.target||match.target<12||match.correct/match.attempts<.9||match.hintsUsed)return {promoted:false};
 const year=match.curriculumYear||profile.year;if(profile.year!==year||!yearProgress(profile,year,now).eligible)return {promoted:false};
 initCareer(profile);if(!profile.completedYears.includes(year))profile.completedYears.push(year);
 const graduated=year===6;
 if(graduated)profile.graduated=true;else{profile.year=year+1;profile.placementComplete=false;profile.placementProgress=0;}
 const news={key:`promotion:${year}`,kind:'promotion',title:graduated?'Academy graduate!':`Promoted to Year ${year+1}`,text:graduated?'Your Year 6 academy goals are complete. Keep your knowledge fresh with mixed recall.':`Your practice and practical checklist are complete. Your next academy year is Year ${year+1}. Earlier facts will still return for review.`,at:now,read:false};
 if(!profile.inbox.some(n=>n.key===news.key))profile.inbox.push(news);
 return {promoted:true,from:year,to:graduated?6:year+1,graduated,news};
}

const eligibleLeague=s=>s.schema===MATCH_SCHEMA&&s.ranked&&s.complete&&s.mode==='timed'&&!s.manual&&!s.pausedEver&&!s.hintsUsed&&s.attempts===s.target&&s.target>=6&&s.careerXP>0;
const emptyLeague=()=>({points:0,correct:0,attempts:0,matches:0});
function addLeague(total,match){const rows=match.rows||[];total.points+=match.careerXP;total.correct+=rows.filter(r=>r.correct&&!r.assisted).length;total.attempts+=rows.length;total.matches++;}
export function initLeague(p){
 if(p.leagueTotals&&p.leagueVersion===2)return;
 p.leagueVersion=2;
 p.leagueTotals={all:emptyLeague(),years:{}};p.leagueTracked=[];
 for(const s of p.sessions){p.leagueTracked.push(s.id);if(!eligibleLeague(s))continue;const y=s.curriculumYear||p.year||1;p.leagueTotals.years[y]||=emptyLeague();addLeague(p.leagueTotals.all,s);addLeague(p.leagueTotals.years[y],s);}
 p.leagueTracked=p.leagueTracked.slice(-500);
}
export function recordLeague(p,match){initLeague(p);if(p.leagueTracked.includes(match.id))return false;p.leagueTracked.push(match.id);p.leagueTracked=p.leagueTracked.slice(-500);if(!eligibleLeague(match))return false;const y=match.curriculumYear||p.year;p.leagueTotals.years[y]||=emptyLeague();addLeague(p.leagueTotals.all,match);addLeague(p.leagueTotals.years[y],match);return true;}
export function leagueTable(profiles,{period='week',year=0,now=Date.now()}={}){
 const since=period==='week'?now-7*DAY:0;
 const rows=profiles.map(p=>{
  initLeague(p);if(period==='all'){const s=year?p.leagueTotals.years[year]||emptyLeague():p.leagueTotals.all;return {profile:p,...s,accuracy:s.attempts?Math.round(s.correct/s.attempts*100):0};}
  const matches=p.sessions.filter(s=>s.endedAt>=since&&eligibleLeague(s)&&(!year||(s.curriculumYear||p.year)===year));
  const answers=matches.flatMap(s=>s.rows||[]),correct=answers.filter(r=>r.correct&&!r.assisted).length,attempts=answers.length;
  return {profile:p,points:matches.reduce((sum,match)=>sum+match.careerXP,0),correct,attempts,accuracy:attempts?Math.round(correct/attempts*100):0,matches:matches.length};
 }).filter(r=>r.attempts>0).sort((a,b)=>b.points-a.points||b.accuracy-a.accuracy||b.correct-a.correct||a.profile.name.localeCompare(b.profile.name));
 let rank=0;return rows.map((row,i)=>{if(i===0||row.points!==rows[i-1].points||row.accuracy!==rows[i-1].accuracy||row.correct!==rows[i-1].correct)rank=i+1;return {...row,rank};});
}
