import {multiplicationSolution,divisionSolution} from './written-work.mjs?v=7.0.0';
import {columnWorked} from './column-method.mjs?v=7.0.0';
import {avatarSVG} from './avatar.mjs?v=7.0.0';
import {itemById} from './career.mjs?v=7.0.0';
import {esc,icon,mathText} from './visuals.mjs?v=7.0.0';
import {dailyTargets,academyPath,tableChoices,tableFacts} from './progression.mjs?v=7.0.0';
import {workedExample} from './coaching.mjs?v=7.0.0';

export function goalsMarkup(profile,compact=false){
 const targets=dailyTargets(profile),done=targets.filter(t=>t.done).length;
 return `<section class="daily-card daily-goals ${compact?'compact-goals':''}" aria-label="Today's goals"><div class="daily-heading"><span class="eyebrow">Today’s hat-trick</span><span class="daily-total">${done}/3</span></div><h2>${done===3?'Hat-trick.<br>Well played.':'Three goals.<br>One great day.'}</h2><div class="quest-list">${targets.map(t=>`<div class="quest ${t.done?'done':''}"><span class="quest-icon">${icon(t.done?'check':t.symbol,17)}</span><div><b>${t.title}</b><span class="quest-bar"><i style="width:${t.value/t.target*100}%"></i></span></div><strong>${t.value}/${t.target}</strong></div>`).join('')}</div></section>`;
}

export function pathMarkup(profile){
 const path=academyPath(profile),current=path.find(s=>s.current)||path.at(-1);
 return `<section class="academy-panel"><div class="academy-heading"><div><span class="eyebrow">YOUR ACADEMY JOURNEY</span><h2>ROAD TO CAPTAIN.</h2></div><span class="academy-count">${path.filter(s=>s.done).length}<small> / 6</small></span></div><ol class="academy-path">${path.map(s=>`<li class="${s.done?'done':s.current?'current':''}" ${s.current?'aria-current="step"':''}><span class="path-node">${s.done?icon('check',19):s.current?icon(s.symbol,20):s.index}</span><b>${s.title}</b><small>${s.done?'Complete':s.current?'Training':'Next up'}</small></li>`).join('')}</ol><div class="path-next"><span>${icon(current.symbol,18)} <b>${current.title}</b><span>${esc(current.detail)}</span></span><strong>${current.progress}%</strong></div><div class="path-note">Match fit means recalled on later days.</div></section>`;
}

export function factMapMarkup(profile,table=3){
 const choices=tableChoices(profile);if(!choices.length)return `<section class="panel"><h2>Groups before tables</h2><p>Year 1 builds equal groups, sharing and counting.</p><button class="btn soft" data-action="skill" data-skill="groups1">Practise groups</button></section>`;if(!choices.includes(table))table=choices[0];
 const facts=tableFacts(profile,table),secure=facts.filter(f=>f.status==='secure').length;
 const labels={new:'New',training:'Training',due:'Replay due',secure:'Match fit'};
 return `<section class="panel fact-panel"><div class="section-head"><div><span class="eyebrow">EVERY FACT COUNTS</span><h2>Your table tracker</h2></div><span class="fact-count">${secure}/12 <small>match fit</small></span></div><div class="table-tabs" role="group" aria-label="Choose a times table">${choices.map(n=>`<button data-action="table-map" data-table="${n}" class="${n===table?'active':''}" aria-pressed="${n===table}">×${n}</button>`).join('')}</div><div class="fact-cards">${facts.map(f=>`<div class="fact-tile ${f.status}" aria-label="${f.a} times ${f.b} equals ${f.answer}: ${labels[f.status]}"><span>${f.a} × ${f.b}</span><b>${f.answer}</b><i>${f.status==='secure'?icon('shield',12):f.status==='due'?icon('reset',12):f.status==='training'?icon('ball',12):'•'}</i></div>`).join('')}</div><div class="fact-bottom"><div class="fact-legend">${Object.entries(labels).map(([key,label])=>`<span><i class="${key}"></i>${label}</span>`).join('')}</div><button class="btn soft" data-action="skill" data-skill="table${table}">PLAY ×${table} ${icon('arrow',15)}</button></div></section>`;
}

export function workedMarkup(q){
 const model=workedExample(q);if(!model)return '';
 let visual='';
 if(model.type==='bridge'){
  const xx=n=>20+n*15;
  visual=`<div class="split-label"><span>Split ${model.whole}</span><b>${model.parts[0]} <small>+</small> ${model.parts[1]}</b></div><svg class="bridge-model" viewBox="0 0 340 118" role="img" aria-label="${model.steps.join('. ')}"><path d="M20 83h300" stroke="#b6c8b2" stroke-width="2"/>${Array.from({length:21},(_,n)=>`<path d="M${xx(n)} 79v8" stroke="#b6c8b2"/>${n%5===0?`<text x="${xx(n)}" y="108" text-anchor="middle" fill="#536b55" font-size="11">${n}</text>`:''}`).join('')}${model.jumps.map((jump,i)=>`<path d="M${xx(model.points[i])} 79 Q${(xx(model.points[i])+xx(model.points[i+1]))/2} ${i?8:32} ${xx(model.points[i+1])} 79" fill="none" stroke="${i?'#537ac3':'#23784f'}" stroke-width="3"/><text x="${(xx(model.points[i])+xx(model.points[i+1]))/2}" y="${i?24:47}" text-anchor="middle" fill="${i?'#4368b0':'#23784f'}" font-size="16" font-weight="700">${jump>0?'+':''}${jump}</text><circle cx="${xx(model.points[i+1])}" cy="81" r="4" fill="${i?'#537ac3':'#23784f'}"/>`).join('')}</svg>`;
 }else if(model.type==='groups')visual=`<div class="group-model">${Array.from({length:model.groups},()=>`<span>${Array.from({length:model.each},()=>'<i></i>').join('')}</span>`).join('')}</div>`;
 else if(model.type==='parts')visual=`<div class="whole-model">${model.whole}</div><div class="part-model">${model.parts.map((n,i)=>`<span class="part-${i}" style="flex:${Math.max(1,n)}">${n}</span>`).join('')}</div>`;
 else if(model.type==='counters')visual=`<div class="counter-model">${Array.from({length:model.total},(_,i)=>`<i class="${i>=model.split?model.subtract?'removed':'second':''}"></i>`).join('')}</div>`;
 else if(model.type==='longMultiply')visual=multiplicationSolution(model);
 else if(model.type==='division')visual=divisionSolution(model);
 else if(model.type==='columns')visual=columnWorked(q);
 return `<div class="worked-model"><h4>${esc(model.title)}</h4>${visual}${!['columns','longMultiply','division'].includes(model.type)?`<div class="model-steps">${model.steps.map((s,i)=>`<span><i>${i+1}</i>${mathText(s)}</span>`).join('')}</div>`:''}</div>`;
}

export function penaltyArena(profile=null,{aimGuide=false}={}){
 const ball=itemById(profile?.look?.ball||'ball-classic'),trail=itemById(profile?.look?.trail||'trail-none'),keeper=profile?.look?.position==='Goalkeeper';
 return `<div class="penalty-view" data-role="${keeper?'goalkeeper':'striker'}" style="--ball-colour:${ball.colour};--cosmetic-trail:${trail.colour}" aria-hidden="true"><svg viewBox="0 0 300 190" preserveAspectRatio="none" class="goal-scene"><defs><pattern id="goalmesh" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0v12" fill="none" stroke="#a4b7a3" stroke-opacity=".3" stroke-width=".7"/></pattern><linearGradient id="turf" x2="0" y2="1"><stop stop-color="#315e3d"/><stop offset="1" stop-color="#15472f"/></linearGradient></defs><path d="M0 82h300v108H0z" fill="url(#turf)"/><path d="M0 105h300M0 155h300" stroke="#91b979" stroke-opacity=".1" stroke-width="25"/><path d="M5 165h290M65 190l22-75h126l22 75" fill="none" stroke="#bfd3b0" stroke-opacity=".45"/><path d="M42 106V25h216v81" fill="#0e3225" stroke="#ecf3d9" stroke-width="5" stroke-linejoin="round"/><path d="M44 29h212v76H44Z" fill="url(#goalmesh)"/><path d="m44 105 14-60h184l14 60M58 45V28m184 17V28" fill="none" stroke="#91a68c" stroke-width="1.5"/><path d="M20 6v89M280 6v89" stroke="#6a8a67" stroke-width="3"/><path d="M7 9h27M267 9h27" stroke="#e5f3b5" stroke-width="6"/><circle cx="150" cy="166" r="2" fill="#d7e5c6"/><ellipse cx="150" cy="101" rx="30" ry="5" fill="#082d21" opacity=".4"/></svg>${keeper?`<div class="goalkeeper goalkeeper-player">${avatarSVG(profile,{size:80,pose:'save'})}</div>`:`<svg viewBox="0 0 65 80" class="goalkeeper"><circle cx="33" cy="13" r="8" fill="#b98661"/><path d="M22 25h22l5 27H18Z" fill="#e8be67"/><path d="m21 29-14 6-3-10m41 4 13 6 4-10" fill="none" stroke="#e8be67" stroke-width="8" stroke-linecap="round"/><path d="m25 52-5 21m19-21 6 21" stroke="#122e24" stroke-width="9"/><path d="M12 75h14m14 0h13" stroke="#d8efae" stroke-width="5" stroke-linecap="round"/></svg><div class="kicker-avatar">${avatarSVG(profile,{size:64,pose:'kick'})}</div>`}<div id="mini-ball" class="mini-ball">${icon('ball',29)}</div>${aimGuide?'<div class="goal-markers" aria-hidden="true"><i data-zone="left">★</i><i data-zone="centre">★</i><i data-zone="right">★</i></div>':''}<span id="goal-callout" class="goal-callout"></span></div><div id="move-label" class="move-label">${keeper?'Ready to save':'Ready to strike'}</div>`;
}
