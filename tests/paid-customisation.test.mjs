import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,initialData,validateImport} from '../dist/engine.mjs';
import {initCareer,ITEMS,itemById,itemValue,owns,buyItem,equipItem,setAppearanceChoice,credits,validateCareer} from '../dist/career.mjs';
import {appearanceView,lockerView} from '../dist/academy-ui.mjs';
import {avatarSVG} from '../dist/avatar.mjs';

const player=(xp=0)=>{const p=initCareer(newProfile('Wardrobe test',3));p.pointsTotal=xp;return p;};
const options=(p,id)=>appearanceView(p).match(new RegExp(`<select class="field" id="${id}">([\\s\\S]*?)</select>`))[1];

test('every alternate style and colour needs its own credit purchase',()=>{
 for(const item of ITEMS.filter(i=>['hairColour','trim','theme'].includes(i.slot)||['hair-curls','hair-wave','pattern-stripes'].includes(i.id))){
  if(!item.price)continue;
  const p=player(300),before=structuredClone(p.look),balance=credits(p);
  assert.equal(owns(p,item),false,item.id);
  assert.equal(equipItem(p,item.id),false,item.id);
  assert.equal(setAppearanceChoice(p,item.slot,itemValue(item)),false,item.id);
  assert.deepEqual(p.look,before);
  assert.equal(buyItem(p,item.id).ok,true,item.id);
  assert.equal(credits(p),balance-item.price,item.id);
  assert.equal(equipItem(p,item.id),true,item.id);
  assert.equal(p.look[item.slot],itemValue(item),item.id);
  assert.equal(buyItem(p,item.id).alreadyOwned,true,item.id);
  assert.equal(credits(p),balance-item.price);
  assert.equal(p.purchases.length,1);
  assert.ok(validateCareer(p));
  const data=initialData();data.profiles=[p];
  const restored=validateImport(JSON.parse(JSON.stringify(data))).profiles[0];
  assert.equal(restored.look[item.slot],itemValue(item));
  assert.ok(owns(restored,item));
 }
});

test('no credits, fake inventory or a free receipt cannot unlock paid customisation',()=>{
 for(const id of ['hair-curls','pattern-stripes','hair-colour-black','trim-gold','theme-ocean']){
  const p=player(),item=itemById(id),before=structuredClone(p.look);
  assert.equal(buyItem(p,id).ok,false);
  assert.equal(credits(p),0);
  p.inventory.push(id);
  assert.equal(equipItem(p,id),false);
  assert.equal(setAppearanceChoice(p,item.slot,itemValue(item)),false);
  assert.deepEqual(p.look,before);
  assert.throws(()=>validateCareer(p),/unpurchased/);
 }
 const p=player(100);p.inventory=['hair-curls'];p.purchases=[{id:'hair-curls',cost:0,catalogue:4,at:Date.now()}];
 assert.equal(equipItem(p,'hair-curls'),false);
 assert.throws(()=>validateCareer(p),/unpurchased/);
});

test('legacy unpaid looks reset without charging or losing a purchased kit or learning progress',()=>{
 const p=player(400);assert.ok(buyItem(p,'kit-blue').ok);assert.ok(equipItem(p,'kit-blue'));
 delete p.wardrobeVersion;
 Object.assign(p.look,{hair:'hair-curls',pattern:'pattern-stripes',hairColour:'black',trim:'gold',theme:'ocean',skin:'deep',number:17,position:'Defender'});
 p.inventory.push('hair-curls','pattern-stripes');
 p.purchases.push({id:'hair-curls',cost:0,catalogue:4,at:Date.now()});
 const balance=credits(p),progress=JSON.stringify({facts:p.facts,sessions:p.sessions,pointsTotal:p.pointsTotal});
 const data=initialData();data.profiles=[p];
 const restored=validateImport(JSON.parse(JSON.stringify(data))).profiles[0];
 assert.deepEqual([restored.look.hair,restored.look.pattern,restored.look.hairColour,restored.look.trim,restored.look.theme],['hair-crop','pattern-classic','brown','match','pitch']);
 assert.deepEqual([restored.look.kit,restored.look.skin,restored.look.number,restored.look.position],['kit-blue','deep',17,'Defender']);
 assert.equal(credits(restored),balance);
 assert.equal(JSON.stringify({facts:restored.facts,sessions:restored.sessions,pointsTotal:restored.pointsTotal}),progress);
 assert.deepEqual(restored.inventory,['kit-blue']);assert.equal(restored.purchases.length,1);
 assert.equal(restored.wardrobeVersion,1);
 assert.ok(buyItem(restored,'hair-curls').ok);assert.ok(equipItem(restored,'hair-curls'));
 assert.ok(validateCareer(restored));
});

test('current backups reject unowned colours and styles instead of equipping them',()=>{
 for(const [slot,value] of [['hairColour','black'],['trim','gold'],['theme','ocean'],['hair','hair-curls'],['pattern','pattern-stripes']]){
  const p=player();p.look[slot]=value;assert.throws(()=>validateCareer(p),/not owned/);
 }
});

test('customise lists only starter and purchased choices, while the Shop offers priced colours',()=>{
 const p=player(600);
 for(const [id,value] of [['kit-hair','hair-curls'],['kit-pattern','pattern-stripes'],['kit-hair-colour','black'],['kit-trim','gold'],['kit-theme','ocean']])assert.ok(!options(p,id).includes(`value="${value}"`));
 assert.ok(options(p,'kit-skin').includes('value="deep"'));
 for(const id of ['hair-curls','pattern-stripes','hair-colour-black','trim-gold','theme-ocean'])assert.ok(buyItem(p,id).ok);
 for(const [id,value] of [['kit-hair','hair-curls'],['kit-pattern','pattern-stripes'],['kit-hair-colour','black'],['kit-trim','gold'],['kit-theme','ocean']])assert.ok(options(p,id).includes(`value="${value}"`));
 assert.match(lockerView(p,'colours'),/data-item="theme-ocean"/);
 assert.ok(equipItem(p,'theme-ocean'));
 assert.match(lockerView(p,'colours'),/data-action="equip" data-item="theme-ocean" disabled/);
});

test('previewing an unbought colour or style never equips it or spends credits',()=>{
 const p=player(),before=JSON.stringify(p);
 for(const id of ['hair-colour-black','trim-gold','hair-curls','kit-blue']){
  assert.notEqual(avatarSVG(p,{preview:id}),avatarSVG(p),id);
  assert.equal(JSON.stringify(p),before,id);
  assert.equal(equipItem(p,id),false,id);
 }
});
