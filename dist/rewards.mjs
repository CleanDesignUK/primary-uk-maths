export function earnedXP(correct,supported,streak){return correct?(supported?2:10+Math.min(5,Math.max(0,streak-1))*2):0;}
export function eligibleRecord(s){return ['football-v2','football-v3','football-v4'].includes(s.schema)&&s.complete&&s.mode==='timed'&&!s.hintsUsed&&!s.pausedEver&&s.attempts>0&&s.correct>0;}
export function newPersonalBest(s,old){return eligibleRecord(s)&&(!old||s.points>old.points||(s.points===old.points&&s.correct===old.correct&&s.elapsed<old.elapsed-.1));}
