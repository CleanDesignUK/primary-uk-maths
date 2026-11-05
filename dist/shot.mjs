import {shotType,superMove} from './avatar.mjs';

export function paintShot(arena,{question,correct,attempt=0,streak=0,celebration='celebrate-fist',replay=false}) {
  if(!arena)return;
  if(replay){arena.dataset.outcome='ready';void arena.offsetWidth;}
  const width=arena.clientWidth,height=arena.clientHeight,direction=attempt%2?1:-1;
  arena.style.setProperty('--flight-x',`${direction*width*(correct ? .22 : .37)}px`);
  arena.style.setProperty('--flight-y',`${-height*.58}px`);
  arena.style.setProperty('--arc-y',`${-height*.83}px`);
  arena.style.setProperty('--curve-x',`${-direction*width*.12}px`);
  const move=superMove(streak);
  arena.dataset.shot=shotType(question);
  arena.dataset.super=move.id;
  arena.dataset.outcome=correct===undefined?'ready':correct?'goal':'miss';
  arena.dataset.celebration=celebration;
  const callout=arena.querySelector('.goal-callout');
  if(callout)callout.textContent=correct===undefined?'':correct?'GOAL!':'WIDE!';
  return move;
}
