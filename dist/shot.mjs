import {shotType,superMove} from './avatar.mjs?v=7.1.1';

export const AIM_ZONES=['left','centre','right'];
const missions=[
  {id:'targets',name:'Spotlight strikes',goal:3},
  {id:'corners',name:'Both corners',goal:2},
  {id:'combo',name:'Hat-trick',goal:3}
];
export const matchMission=count=>missions[count%missions.length].id;

export function spotlightZone(mission,attempt,seed=0) {
  const zones=mission==='corners'?['left','right']:AIM_ZONES;
  return zones[(attempt+seed)%zones.length];
}

export function missionProgress(id,rows,bestStreak=0) {
  const mission=missions.find(item=>item.id===id);
  if(!mission)return null;
  const hits=rows.filter(row=>row.correct&&!row.assisted&&row.targetHit);
  const value=id==='combo'?bestStreak:id==='corners'?new Set(hits.filter(row=>row.aim!=='centre').map(row=>row.aim)).size:hits.length;
  return {...mission,value:Math.min(mission.goal,value),complete:value>=mission.goal};
}

export function paintShot(arena,{question,correct,attempt=0,streak=0,celebration='celebrate-fist',replay=false,aim,callout:message}) {
  if(!arena)return;
  if(replay){arena.dataset.outcome='ready';void arena.offsetWidth;}
  const width=arena.clientWidth,height=arena.clientHeight,direction=attempt%2?1:-1,keeper=arena.dataset.role==='goalkeeper';
  const aimIndex=AIM_ZONES.indexOf(aim);
  const lateral=correct?(aimIndex>=0?(aimIndex-1)*.25:direction*.22):direction*.39;
  arena.style.setProperty('--flight-x',`${lateral*width}px`);
  arena.style.setProperty('--keeper-x',`${keeper&&correct?lateral*width:-(Math.sign(lateral)||direction)*width*.16}px`);
  arena.style.setProperty('--flight-y',`${-height*.58}px`);
  arena.style.setProperty('--arc-y',`${-height*.83}px`);
  arena.style.setProperty('--curve-x',`${-direction*width*.12}px`);
  const move=superMove(streak);
  arena.dataset.shot=shotType(question);
  arena.dataset.super=move.id;
  arena.dataset.outcome=correct===undefined?'ready':keeper?(correct?'save':'concede'):(correct?'goal':'miss');
  arena.dataset.celebration=celebration;
  const callout=arena.querySelector('.goal-callout');
  if(callout)callout.textContent=correct===undefined?'':keeper?(correct?'SAVE!':'IN THE NET'):(correct?message||'GOAL!':'WIDE!');
  return move;
}
