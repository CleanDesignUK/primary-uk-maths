import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile} from '../dist/engine.mjs';
import {buyItem,equipItem,initCareer,itemById,xpForLevel} from '../dist/career.mjs';
import {lockerView} from '../dist/academy-ui.mjs';
import {cosmeticPreview,fullTimeShowcase,playShowcase} from '../dist/celebrations.mjs';

test('moves can be previewed while locked and a purchase equips the move used at full time',()=>{
 const player=initCareer(newProfile('Test',3));
 const move=itemById('celebrate-open-arms');
 assert.match(lockerView(player,'celebration'),/data-action="preview-item" data-item="celebrate-open-arms"/);
 assert.match(cosmeticPreview(player,move),/data-celebration="celebrate-open-arms"/);
 assert.equal(player.look.celebration,'celebrate-fist');
 player.pointsTotal=xpForLevel(8);
 assert.ok(buyItem(player,move.id).ok);
 assert.ok(equipItem(player,move.id));
 assert.match(cosmeticPreview(player,move,{justEquipped:true}),/Equipped[\s\S]*Replay preview/);
 assert.match(fullTimeShowcase(player),/data-celebration="celebrate-open-arms"[\s\S]*Replay move/);
 assert.match(fullTimeShowcase(player,false),/Match move/);
});

test('ball and trail previews use the offered effect without changing the locker',()=>{
 const player=initCareer(newProfile('Test',3)),trail=itemById('trail-mint');
 const preview=cosmeticPreview(player,trail);
 assert.ok(preview.includes(`--cosmetic-trail:${trail.colour}`));
 assert.equal(player.look.trail,'trail-none');
});

test('each replay restarts the same stage from the start',()=>{
 const calls=[];
 const move={
  removeAttribute:name=>calls.push(['clear',name]),
  get offsetWidth(){calls.push(['layout']);return 123;},
  setAttribute:(name,value)=>calls.push(['play',name,value])
 };
 const showcase={querySelector:selector=>selector==='.move-stage'?move:null};
 playShowcase(showcase);
 playShowcase(showcase);
 const replay=[['clear','data-playing'],['layout'],['play','data-playing','']];
 assert.deepEqual(calls,[...replay,...replay]);
});
