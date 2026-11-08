const DAY_MS = 86_400_000;
const REVIEW_DAYS = [1, 3, 7, 14, 30, 60];
export const MATCH_SCHEMA = 'football-v5';

// Match points are useful feedback in every exercise. Career XP has separate gates.
export function earnedXP(correct, supported, streak) {
  return correct && !supported ? 10 + Math.min(5, Math.max(0, streak - 1)) * 2 : 0;
}

export function initRewards(profile) {
  const priorYears = (profile.sessions || []).map(match => match.curriculumYear || 1);
  profile.rewardYear = Math.max(profile.rewardYear || 1, profile.year || 1, ...priorYears);
  profile.rewardClaims ||= {};
  profile.revealedFacts ||= {};
  profile.paidRounds ||= [];
}

export function rewardFactKey(question) {
  if (question.op === '×' || question.op === 'missing×' || question.op === '÷' && question.factFamily) {
    const first = question.op === '÷' ? question.b : question.a;
    const second = question.op === '÷' ? question.answer : question.b;
    return `table:${Math.min(first, second)}:${Math.max(first, second)}`;
  }
  if (question.op === '+' && Number.isInteger(question.a) && Number.isInteger(question.b)) {
    return `sum:${Math.min(question.a, question.b)}:${Math.max(question.a, question.b)}`;
  }
  return question.key;
}

export function isCoachChallenge(profile, match) {
  return match.schema === MATCH_SCHEMA && match.mode === 'timed' && !match.manual &&
    !match.placement && !match.progressCheck && !match.promotion &&
    match.curriculumYear === profile.year && profile.year >= (profile.rewardYear || profile.year);
}

export function isRewardRound(profile,match){
 return isFirstWarmup(profile,match)||isCoachChallenge(profile,match)||match.schema===MATCH_SCHEMA&&match.mode==='practice'&&!!match.coachDrill&&!!match.manual&&
  !match.placement&&!match.progressCheck&&!match.promotion&&match.curriculumYear===profile.year&&profile.year>=(profile.rewardYear||profile.year);
}

const warmupRound=match=>match?.schema===MATCH_SCHEMA&&match.placement&&match.mode==='check'&&!match.manual&&!match.progressCheck&&!match.promotion;
export function isFirstWarmup(profile,match){
 return warmupRound(match)&&!profile.warmupXP?.complete&&match.curriculumYear===profile.year&&
  profile.year>=(profile.rewardYear||profile.year)&&(!profile.warmupXP||profile.warmupXP.year===match.curriculumYear)&&
  !(profile.sessions||[]).some(saved=>warmupRound(saved)&&saved.complete);
}

function warmupXPFromRows(rows){
 let streak=0;const seen=new Set();
 return rows.reduce((total,row)=>{
  const independent=row.correct&&!row.assisted&&!row.help&&!row.unknown;
  streak=independent?streak+1:0;
  if(!independent||!row.q?.key)return total;
  const key=rewardFactKey(row.q);
  if(seen.has(key))return total;
  seen.add(key);return total+earnedXP(true,false,streak);
 },0);
}

function settleWarmup(profile,match,award){
 const priorXP=profile.pointsTotal??(profile.sessions||[]).reduce((sum,saved)=>sum+(saved.careerXP??saved.points??0),0);
 profile.pointsTotal=priorXP+award;
 profile.paidRounds=[...profile.paidRounds.slice(-499),match.id];
 profile.warmupXP={year:match.curriculumYear,roundId:match.id,xp:(profile.warmupXP?.xp||0)+award,complete:!!match.complete,at:match.endedAt||Date.now()};
 return award;
}

// Existing first warm-ups used to earn no career XP. Correct those saved answers
// once, including saved portions, without changing learning or League evidence.
export function migrateFirstWarmupXP(profile){
 initRewards(profile);
 if(profile.warmupXP)return 0;
 const first=(profile.sessions||[]).find(warmupRound);
 if(!first)return 0;
 let added=0;
 for(const match of profile.sessions){
  if(!warmupRound(match)||match.curriculumYear!==first.curriculumYear)continue;
  if(!Number.isInteger(match.attempts)||match.attempts<1||match.rows?.length!==match.attempts)continue;
  if(profile.paidRounds.includes(match.id)||match.careerXP>0){
   profile.warmupXP={year:first.curriculumYear,roundId:match.id,xp:(profile.warmupXP?.xp||0)+(match.careerXP||0),complete:!!match.complete,at:match.endedAt};
  }else{
   const award=warmupXPFromRows(match.rows);
   added+=settleWarmup(profile,match,award);match.careerXP=award;
   for(const row of match.rows){
    if(!row.correct||row.assisted||row.help||row.unknown||!row.q?.key)continue;
    const key=rewardFactKey(row.q),nextAt=match.endedAt+DAY_MS;
    if(!profile.rewardClaims[key]||profile.rewardClaims[key].nextAt<nextAt)profile.rewardClaims[key]={interval:0,nextAt};
   }
  }
  if(match.complete)break;
 }
 return added;
}

export function revealFact(profile, question, now = Date.now()) {
  initRewards(profile);
  profile.revealedFacts[rewardFactKey(question)] = now;
}

export function rewardCandidate(profile, question, match, { correct, assisted, now = Date.now() }) {
  if (!correct || assisted) {
    revealFact(profile, question, now);
    return 0;
  }
  initRewards(profile);
  if (!isRewardRound(profile, match) || !match.coachDrill&&!match.placement&&['support', 'repair', 'ease'].includes(match.selection?.reason)) return 0;
  const key = rewardFactKey(question);
  const previous = profile.rewardClaims[key];
  const revealedAt = profile.revealedFacts[key];
  const evidence = profile.facts[question.key];
  if (revealedAt !== undefined && now - revealedAt < DAY_MS) return 0;
  if (previous && now < previous.nextAt) return 0;
  if (evidence?.history?.some(answer => answer.correct) && evidence.due > now) return 0;

  const interval = Math.min(REVIEW_DAYS.length - 1, previous ? previous.interval + 1 : 0);
  profile.rewardClaims[key] = { interval, nextAt: now + REVIEW_DAYS[interval] * DAY_MS };
  return earnedXP(true, false, match.streak) + (previous ? 4 : 0);
}

export function bankCareerXP(profile, match) {
  initRewards(profile);
  if(isFirstWarmup(profile,match)){
   if(!Number.isInteger(match.target)||match.target<1||!Number.isInteger(match.attempts)||match.attempts<1||match.attempts>match.target||match.complete&&match.attempts!==match.target||match.rows?.length!==match.attempts||profile.paidRounds.includes(match.id))return 0;
   const award=match.rows.reduce((sum,row)=>sum+(row.correct&&!row.assisted&&!row.unknown?row.careerCandidate||0:0),0);
   return settleWarmup(profile,match,award);
  }
  if (!isRewardRound(profile, match) || !match.complete || match.attempts !== match.target ||
      match.target < (match.coachDrill?3:6) || match.rows.length !== match.target || profile.paidRounds.includes(match.id)) return 0;
  const award = match.rows.reduce((sum, row) => sum + (row.correct && !row.assisted ? row.careerCandidate || 0 : 0), 0);
  if (!award) return 0;
  const priorXP = profile.pointsTotal ?? (profile.sessions || []).reduce((sum, saved) => sum + (saved.points || 0), 0);
  profile.pointsTotal = priorXP + award;
  profile.paidRounds = [...profile.paidRounds.slice(-499), match.id];
  return award;
}

export function eligibleRecord(match) {
  return ['football-v2', 'football-v3', 'football-v4', MATCH_SCHEMA].includes(match.schema) &&
    match.complete && match.mode === 'timed' && !match.hintsUsed && !match.pausedEver && !match.rows?.some(row => row.unknown) &&
    match.attempts > 0 && match.correct > 0;
}

export function newPersonalBest(match, previous) {
  return eligibleRecord(match) && (!previous || match.points > previous.points ||
    match.points === previous.points && match.correct === previous.correct && match.elapsed < previous.elapsed - .1);
}

export function validateRewards(profile) {
  if(profile.warmupXP!==undefined){
   const receipt=profile.warmupXP;
   if(!receipt||!Number.isInteger(receipt.year)||receipt.year<1||receipt.year>6||typeof receipt.roundId!=='string'||receipt.roundId.length>100||!Number.isSafeInteger(receipt.xp)||receipt.xp<0||receipt.xp>5000||typeof receipt.complete!=='boolean'||!Number.isFinite(receipt.at))throw Error('Invalid first warm-up XP.');
  }
  if (profile.rewardYear !== undefined && (!Number.isInteger(profile.rewardYear) || profile.rewardYear < 1 || profile.rewardYear > 6)) {
    throw Error('Invalid reward year.');
  }
  for (const [name, validate] of [
    ['rewardClaims', entry => entry && Number.isInteger(entry.interval) && entry.interval >= 0 && entry.interval < REVIEW_DAYS.length && Number.isFinite(entry.nextAt)],
    ['revealedFacts', entry => Number.isFinite(entry)]
  ]) {
    const map = profile[name];
    if (map === undefined) continue;
    if (!map || typeof map !== 'object' || Array.isArray(map) || Object.keys(map).length > 25_000 ||
        Object.entries(map).some(([key, entry]) => key.length > 200 || ['__proto__', 'constructor', 'prototype'].includes(key) || !validate(entry))) {
      throw Error('Invalid reward history.');
    }
  }
  if (profile.paidRounds !== undefined && (!Array.isArray(profile.paidRounds) || profile.paidRounds.length > 500 || profile.paidRounds.some(id => typeof id !== 'string' || id.length > 100))) {
    throw Error('Invalid paid matches.');
  }
}

export const STARTER_CREDITS=10;
// A participation gift is separate from XP and mastery. It pays once, including
// the warm-up, so a child's first completed game can buy starter gear.
export function grantStarterCredits(profile,match,now=Date.now()){
 if(profile.starterReward||!match.complete||match.attempts!==match.target||match.target<(match.placement?1:3)||match.rows?.length!==match.target)return 0;
 profile.starterReward={roundId:match.id,at:now,credits:STARTER_CREDITS};
 return STARTER_CREDITS;
}
