import {esc} from './visuals.mjs';
import {initCareer,itemById,SKIN_TONES,HAIR_COLOURS,KIT_TRIMS,clubById} from './career.mjs?v=6.5.0';

export function avatarSVG(profile,{size=200,pose='stand',preview=null}={}){
 const p=profile?{...profile,look:{...(profile.look||{})}}:{look:{}};initCareer(p);if(preview){const item=itemById(preview);if(item)p.look[item.slot]=item.id;}
 const l=p.look,kit=itemById(l.kit),shorts=itemById(l.shorts),boots=itemById(l.boots),skin=SKIN_TONES[l.skin],hair=HAIR_COLOURS[l.hairColour];
 const trim=l.trim==='match'?kit.accent:KIT_TRIMS[l.trim];
 const pattern=l.pattern==='pattern-classic'?kit.pattern:l.pattern.slice(8);
 const shirtDesign={
  stripes:`<path d="M68 94h8v57h-8ZM100 94h8v57h-8Z" fill="${trim}" opacity=".55"/>`,
  sash:`<path d="m60 95 7-9 57 52 2 14h-13Z" fill="${trim}" opacity=".7"/>`,
  halves:`<path d="M91 89l29-1 7 65H91Z" fill="${trim}" opacity=".32"/>`,
  chevron:`<path d="m59 101 31 15 32-15 2 9-34 17-32-16Z" fill="${trim}" opacity=".8"/>`
 }[pattern]||'';
 const numberInk=Number.parseInt(kit.colour.slice(1,3),16)*.25+Number.parseInt(kit.colour.slice(3,5),16)*.65+Number.parseInt(kit.colour.slice(5,7),16)*.1>165?'#132f27':'#fcfff4';
 const hairs={
  'hair-crop':`<path d="M66 43q0-17 23-17t24 17v10H66Z" fill="${hair}"/><path d="M66 43v20h5V45m42-2v20h-5V45" fill="${hair}"/>`,
  'hair-curls':`<g fill="${hair}">${[68,79,90,101,112].map((x,i)=>`<circle cx="${x}" cy="37" r="10"/><circle cx="${x}" cy="${i%2?28:30}" r="8"/>`).join('')}</g>`,
  'hair-sweep':`<path d="M65 47q-2-25 28-24l25 8-8 26-7-14-35 10Z" fill="${hair}"/>`,
  'hair-wave':`<path d="M65 51q-3-23 13-25 7-11 16-2 17-4 22 13l-4 15-10-10-17 7-10-5Z" fill="${hair}"/>`,
  'hair-fade':`<path d="M65 47V31q2-12 18-14h17q15 3 15 14v17l-8-4V33H73v14Z" fill="${hair}"/>`,
  'hair-fringe':`<path d="M64 42q0-26 23-23l25 9 6 21-12-4-7-10-18 17-15 2Z" fill="${hair}"/>`,
  'hair-locs':`<path d="M66 36q0-19 24-19t24 19v16H66Z" fill="${hair}"/><path d="M68 34v23m9-26v20m10-23v21m11-23v24m11-23v27" stroke="${hair}" stroke-width="7" stroke-linecap="round"/>`,
  'hair-bun':`<circle cx="98" cy="16" r="13" fill="${hair}"/><path d="M65 47q-3-26 26-26 23 0 24 24v12l-9-11H72l-7 10Z" fill="${hair}"/>`,
  'hair-mohawk':`<path d="M67 43h46v9H67Zm10-4 3-20 9 6 7-15 7 13 7-3v20Z" fill="${hair}"/>`,
  'hair-long':`<path d="M64 42q-2-25 27-26 26 1 26 25l4 38-12 6-6-16 1-26-18-10-11 14v33l-14-1Z" fill="${hair}"/>`,
  'hair-spikes':`<path d="m64 48 5-22 11 6 9-17 9 16 12-8 7 25Z" fill="${hair}"/>`
 };
 return `<svg class="block-player pose-${esc(pose)}" width="${size}" height="${size*1.25}" viewBox="0 0 180 225" role="img" aria-label="Custom football player, number ${l.number}, ${esc(l.position)}"><ellipse cx="91" cy="213" rx="52" ry="8" fill="#153a2620"/><g class="player-figure"><g class="arm arm-left"><path d="m59 89-25 10 11 52 21-6Z" fill="${kit.colour}"/><path d="m43 137 21-6 5 25-22 5Z" fill="${skin}"/>${l.accessory==='accessory-gloves'?'<path d="m45 151 25-6 4 18-25 5Z" fill="#dbe9d1"/>':''}</g><g class="arm arm-right"><path d="m119 89 26 10-11 52-21-6Z" fill="${kit.colour}"/><path d="m116 132 21 6-5 23-22-5Z" fill="${skin}"/>${l.accessory==='accessory-gloves'?'<path d="m110 145 25 7-4 18-25-5Z" fill="#dbe9d1"/>':''}</g><g class="leg leg-left"><path d="M62 145h26v46H62Z" fill="${skin}"/><path d="M62 171h26v25H62Z" fill="${trim}"/><path d="M59 192h29v17H51v-10Z" fill="${boots.colour}"/><path d="M54 207h34" stroke="#101d19" stroke-width="3"/></g><g class="leg leg-right"><path d="M94 145h26v46H94Z" fill="${skin}"/><path d="M94 171h26v25H94Z" fill="${trim}"/><path d="M94 192h29l8 7v10H94Z" fill="${boots.colour}"/><path d="M94 207h35" stroke="#101d19" stroke-width="3"/></g><path d="m60 87 20-7h22l19 7 7 67H53Z" fill="${kit.colour}"/><path d="M70 147h23v22H59v-20m34-2h29v22H94" fill="${shorts.colour}"/>${shirtDesign}<path d="m78 81 12 14 13-14" fill="${trim}"/><path d="M84 90v57h10V90" fill="#fff" opacity=".11"/><text x="90" y="132" text-anchor="middle" font-size="26" font-weight="800" font-family="Arial,sans-serif" fill="${numberInk}">${l.number}</text><path d="M107 100h10v9h-10Z" fill="${trim}" opacity=".8"/>${['accessory-band','accessory-band-gold'].includes(l.accessory)?`<path d="m34 112 26-7 3 12-26 7Z" fill="#e7c05d"/>`:''}<rect x="81" y="70" width="19" height="16" rx="3" fill="${skin}"/><rect x="65" y="31" width="50" height="47" rx="10" fill="${skin}"/><path d="M66 61v8q0 10 12 10h23q12 0 12-10v-8" fill="#000" opacity=".05"/>${hairs[l.hair]}${l.accessory==='accessory-cap'?`<path d="M64 42q0-22 24-22 25 0 26 21l11 4H64Z" fill="${trim}"/>`:l.accessory==='accessory-headphones'?'<path d="M62 52v-9q0-25 28-25t28 25v9" fill="none" stroke="#343e51" stroke-width="5"/><rect x="60" y="44" width="10" height="21" rx="4" fill="#343e51"/><rect x="110" y="44" width="10" height="21" rx="4" fill="#343e51"/>':l.accessory==='accessory-scarf'?`<path d="M76 80h30v10H76Zm22 5h8v29h-8Z" fill="${trim}"/>`:''}<rect x="76" y="52" width="5" height="6" rx="1" fill="#263127"/><rect x="99" y="52" width="5" height="6" rx="1" fill="#263127"/><path d="M82 66q8 6 15 0" fill="none" stroke="#6d4131" stroke-width="2" stroke-linecap="round"/>${l.accessory==='accessory-headband'?`<path d="M65 43h50v8H65Z" fill="${trim}"/>`:''}</g></svg>`;
}
export function clubBadge(p){const c=clubById(p.look?.club);return `<span class="club-badge" style="--club-colour:${c.colour}">${esc(c.short)}</span>`;}
export function shotType(q){
 const op=q?.op||q?.visual?.op||q?.expression?.match(/[×÷−+]/)?.[0];
 if(op==='÷'||/div|ratio|share/i.test(q?.skillId||''))return 'chip';
 if(op==='×'||op==='missing×')return 'power';
 if(op==='−')return 'curl';
 if(q?.key?.startsWith('column'))return 'freekick';
 return 'drive';
}
export function superMove(streak){return streak>=8?{id:'meteor',label:'Meteor strike'}:streak>=5?{id:'fire',label:'Fireball'}:streak>=3?{id:'power',label:'Power shot'}:{id:'normal',label:'Good strike'};}
