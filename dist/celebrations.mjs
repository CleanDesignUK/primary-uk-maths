import {avatarSVG} from './avatar.mjs?v=6.5.0';
import {clubById,credits,itemById,owns,ITEMS,careerLevel,levelProgress} from './career.mjs?v=6.9.1';
import {penaltyArena} from './experience.mjs?v=6.5.0';
import {paintShot} from './shot.mjs?v=6.3.0';
import {esc,icon} from './visuals.mjs';

export const animatedItem=item=>['celebration','ball','trail'].includes(item?.slot);

function moveStage(player,move){
 const slogans={'celebrate-fist':'LET’S GO!','celebrate-jump':'UP FOR THE CUP!','celebrate-slide':'WHAT A FINISH!','celebrate-spin':'STAR TURN!','celebrate-open-arms':'TAKE A BOW!'};
 return `<div class="move-stage" data-celebration="${move.id}"><div class="move-lights" aria-hidden="true"></div><span class="move-slogan" aria-hidden="true">${slogans[move.id]||'GREAT PLAY!'}</span>${avatarSVG(player,{size:124})}<div class="move-sparks" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i style="--spark:${i}"></i>`).join('')}</div></div>`;
}

const replayButton=label=>`<button class="btn white showcase-replay" type="button" data-action="replay-cosmetic">${icon('reset',16)} ${label}</button>`;

export function fullTimeShowcase(player,complete=true){
 const move=itemById(player.look?.celebration)||itemById('celebrate-fist');
 const club=clubById(player.look?.club);
 return `<section class="match-showcase" data-showcase aria-label="Match celebration">
  ${moveStage(player,move)}
  <div><span class="showcase-label">${complete?'Full-time move':'Match move'}</span>
   <h3>${esc(move.name)}</h3><p>${esc(club.name)}</p>${replayButton('Replay move')}
  </div>
 </section>`;
}

export function cosmeticPreview(player,item,{justEquipped=false}={}){
 const preview={...player,look:{...player.look,[item.slot]:item.id}};
 const stage=item.slot==='celebration'?moveStage(preview,item):`<div class="match-pitch shop-shot-stage">${penaltyArena(preview)}</div>`;
 const status=justEquipped?`${credits(player)} credits left in your locker.`:
  owns(player,item)?'In your locker.':`${item.price} credits · Level ${item.level}`;
 return `<div class="shop-showcase" data-showcase>
  <span class="eyebrow">${justEquipped?'Equipped':item.slot==='celebration'?'Move preview':'Shot preview'}</span>
  <h2 id="dialog-title">${esc(item.name)}</h2>${stage}
  <p>${status}</p>
  <div class="dialog-actions">${replayButton('Replay preview')}<button class="btn lime" data-action="close-dialog">Back to shop</button></div>
 </div>`;
}

export function playShowcase(root){
 const move=root?.querySelector('.move-stage');
 if(move){
  move.removeAttribute('data-playing');
  void move.offsetWidth;
  move.setAttribute('data-playing','');
  return;
 }
 const arena=root?.querySelector('.penalty-view');
 if(arena)paintShot(arena,{question:{op:'+'},correct:true,aim:'right',callout:'GOAL!',replay:true});
}

export function levelMoment(player,round){
 if(!round.newLevel||round.newLevel<=round.previousLevel)return '';
 const unlocked=ITEMS.filter(item=>item.price>0&&item.level>round.previousLevel&&item.level<=round.newLevel);
 return `<section class="level-moment" aria-label="Level up"><span class="level-moment-badge">${round.newLevel}<small>LEVEL</small></span><div><span class="showcase-label">LEVEL UP!</span><h2>Your next chapter.</h2><p>Level ${round.previousLevel} → ${round.newLevel}${unlocked.length?` · ${unlocked.length} new shop ${unlocked.length===1?'unlock':'unlocks'}`:''}</p>${unlocked.length?`<button class="btn lime" data-action="result-locker">See your unlocks ${icon('arrow',15)}</button>`:''}</div></section>`;
}
export function careerCard(player){
 const level=careerLevel(player),progress=levelProgress(player);
 return `<div class="career-card" aria-label="Player card: level ${level}, Year ${player.year}"><div class="card-rating"><b>${level}</b><small>LEVEL</small></div><span class="card-season">MATCHDAY<br>ACADEMY</span>${avatarSVG(player,{size:225})}<div class="card-name">${esc(player.name)}</div><div class="card-position">${esc(player.look.position)} · ${player.look.number}</div><div class="card-career"><span>YEAR <b>${player.year}</b></span><span>NEXT LEVEL <b>${Math.ceil(progress.needed-progress.current)} XP</b></span></div></div>`;
}
