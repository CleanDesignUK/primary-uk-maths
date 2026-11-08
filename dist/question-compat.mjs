import {questionPool} from './engine.mjs?v=7.1.0';

// Resume the same calculation and working when a quotient-only draft predates
// the new remainder requirement. Feedback already earned keeps its old meaning.
export function migrateWrittenDraft(round){
 if(round.phase!=='question'||round.q?.skillId!=='divide4')return round;
 const pool=questionPool('divide4');
 if(pool.some(q=>q.key===round.q.key))return round;
 const expression=String(round.q.expression).replace(/\s*\(whole-number quotient\)/,'');
 const current=pool.find(q=>q.expression===expression);
 if(!current)return round;
 round.q={...current};round.selection={...round.selection,q:round.q};
 round.remainder='';
 if(Array.isArray(round.seen)&&!round.seen.includes(current.key))round.seen.push(current.key);
 return round;
}
