import {avatarSVG} from './avatar.mjs?v=6.5.0';
import {clubById,credits,itemById,owns} from './career.mjs?v=6.9.1';
import {penaltyArena} from './experience.mjs?v=6.5.0';
import {paintShot} from './shot.mjs?v=6.3.0';
import {esc,icon} from './visuals.mjs';

export const animatedItem=item=>['celebration','ball','trail'].includes(item?.slot);

function moveStage(player,move){
 return `<div class="move-stage" data-celebration="${move.id}">${avatarSVG(player,{size:124})}</div>`;
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
