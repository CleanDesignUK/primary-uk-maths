import {SKILLS,skillById,profileSummary,localDay} from './engine.mjs?v=7.0.0';
import {DOMAINS,syllabusIds,domainFor} from './curriculum.mjs?v=7.0.0';
import {competency,planSummary,probeIds,progressCheckPlan,roundRecommendation} from './adaptive.mjs?v=7.0.0';
import {esc,icon,mathText,diagram} from './visuals.mjs?v=7.0.0';
import {avatarSVG,clubBadge} from './avatar.mjs?v=7.0.0';
import {ITEMS,CLUBS,POSITIONS,SKIN_TONES,HAIR_COLOURS,credits,careerLevel,careerXP,levelProgress,xpForLevel,owns,clubById,initCareer,clubProgress,itemById,PLAYER_THEMES,KIT_TRIMS} from './career.mjs?v=7.0.0';
import {yearProgress,leagueTable} from './promotion.mjs?v=7.0.0';
import {focusTables,tableEvidence} from './tables.mjs?v=7.0.0';
import {goalsMarkup,factMapMarkup,penaltyArena} from './experience.mjs?v=7.0.0';
import {matchMission,missionProgress} from './shot.mjs?v=7.0.0';
import {britishVoices} from './speech.mjs?v=7.0.0';
import {yearProfileMarkup} from './report-visuals.mjs?v=7.0.0';
import {parentReport,KNOWLEDGE_LEVELS} from './parent-report.mjs?v=7.0.0';
import {animatedItem,careerCard} from './celebrations.mjs?v=7.0.0';

const nav=(view,label,symbol='arrow',className='btn white')=>`<button class="${className}" data-action="nav" data-view="${view}">${icon(symbol,17)}${label}</button>`;
const heading=(eyebrow,title,aside='')=>`<div class="heading academy-page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div>${aside}</div>`;
export const drillTitle=s=>s.digits?`${s.title} · ${s.digits} digits${!s.regroup?' · no exchange':''}`:s.title;
const coachDrillButton=(p,id,target,path)=>`<button class="btn lime" data-action="support-practice" data-profile="${esc(p.id)}" data-skill="${id}" data-target="${target}" data-path="${esc((path||[]).join(','))}">3-shot drill ${icon('arrow',15)}</button>`;

export function coachNextCard(p,step){
 if(!step)return '';
 const caption=step.kind==='retry'?'Try this again':step.kind==='practice'?'Build this first':'Check this first';
 return `<section class="coach-next" aria-label="Coach’s next move"><div><span>${icon('whistle',16)} Coach’s next move</span><h3>${esc(drillTitle(skillById(step.id)))}</h3><p>${caption} · No timer</p></div>${coachDrillButton(p,step.id,step.target,step.path)}</section>`;
}
const progressStrip=p=>{const v=levelProgress(p);return `<div class="career-progress"><div><b>Level ${v.level}</b><span>${Math.floor(v.current)} / ${v.needed} XP</span></div><div class="xp"><i style="width:${v.percent}%"></i></div><small>Next level: ${v.needed-Math.floor(v.current)} XP</small></div>`;};
export const firstShots=[
 {a:3,b:4,op:'×',answer:12,choices:[7,12,16],coach:'Three groups of four. Count 4, 8, 12.'},
 {a:8,b:5,op:'+',answer:13,choices:[12,14,13],coach:'Add 2 to make 10. Add the other 3.'},
 {a:24,b:4,op:'÷',answer:6,choices:[6,8,20],coach:'Four times six makes 24.'}
];
export function firstShotView({index=0,goal=false}={}){
 const q=firstShots[index];
 return `<section class="pitch-card match-pitch first-shot" aria-labelledby="first-shot-title">
  <div class="match-card-top"><h2 id="first-shot-title">${icon('ball',16)} Try a shot</h2><span class="first-shot-tag">FREE PLAY</span></div>
  ${penaltyArena()}
  <div class="first-shot-pad"><p class="first-shot-equation">${q.a} <span>${q.op}</span> ${q.b} <span>=</span> <strong>${goal?q.answer:'?'}</strong></p>
   <div class="first-shot-answers" role="group" aria-label="Choose an answer">${q.choices.map(n=>`<button type="button" class="${goal&&n===q.answer?'scored':''}" data-action="first-shot" data-answer="${n}" ${goal?'disabled':''}>${n}</button>`).join('')}</div>
   <div class="first-shot-footer"><p id="first-shot-feedback" role="status">${goal?'Goal! In the net.':'Tap an answer to shoot.'}</p><button class="text-btn first-shot-next" data-action="first-shot-next" ${goal?'':'hidden'}>Next shot ${icon('arrow',14)}</button></div>
  </div>
 </section>`;
}
export function pickerView(data,firstShot){
 const players=data.profiles;
 if(!players.length)return `<div class="kickoff-screen">
  <section class="kickoff-welcome">
   <span class="field-label"><i class="live-dot" aria-hidden="true"></i> Football academy · Years 1–6</span>
   <h1>Matchday <em>Maths</em></h1>
   <p>Play football. Practise maths.</p>
   <button class="btn lime big arcade-kickoff" data-action="new-player">${icon('play',22)} Create your player</button>
   <button class="text-btn kickoff-curriculum" data-action="browse">Explore the curriculum ${icon('arrow',15)}</button>
  </section>${firstShotView(firstShot)}
 </div>`;
 return `<div class="kickoff-screen"><section class="squad-select"><div class="section-head"><div><span class="eyebrow">Matchday squad</span><h1>Choose a player</h1></div><button class="btn lime" data-action="new-player">${icon('plus',18)} Add player</button></div>
 <div class="squad-cards">${players.map(p=>{
  initCareer(p);
  return `<button class="squad-player" data-action="choose-player" data-id="${p.id}" aria-label="Play as ${esc(p.name)}, Year ${p.year}"><div class="squad-info">${clubBadge(p)}<span>Year ${p.year} · Level ${careerLevel(p)}</span><h2>${esc(p.name)}</h2><small>${esc(p.look.position)} · No. ${p.look.number}</small><span class="squad-play">${icon('play',17)} Play</span></div>${avatarSVG(p,{size:146})}</button>`;
 }).join('')}</div></section>${firstShotView(firstShot)}</div>`;
}
export function yearJourney(p,selectedYear=p.year){
 const progress=yearProgress(p,selectedYear),explored=progress.skills.filter(s=>s.n>0).length;
 return `<section class="year-journey panel"><div class="section-head"><div><span class="eyebrow">Your academy pathway</span><h2>Every year. A stronger player.</h2></div><span class="year-count">${(p.completedYears||[]).length}<small> / 6 years</small></span></div><div class="year-path">${Array.from({length:6},(_,i)=>i+1).map(y=>`<button class="year-stop ${(p.completedYears||[]).includes(y)?'complete':y===p.year?'current':''}" data-action="view-year" data-year="${y}" aria-pressed="${y===selectedYear}" ${y===p.year?'aria-current="step"':''}><span>${(p.completedYears||[]).includes(y)?icon('check',21):y}</span><b>Year ${y}</b><small>${(p.completedYears||[]).includes(y)?'Complete':y===p.year?'Your year':'Explore'}</small></button>`).join('')}</div><div class="year-progress-detail"><div><b>Year ${selectedYear}</b><span>${explored}/${progress.total} skills explored · ${progress.secure} match fit</span></div><div class="dual-progress"><i style="width:${explored/progress.total*100}%"></i><b style="width:${progress.secure/progress.total*100}%"></b></div></div>${selectedYear===p.year?`<div class="promotion-summary"><span>${icon(progress.eligible?'trophy':'shield',17)}${progress.eligible?'Your promotion match is ready.':'Build recall. Show it again on later days.'}</span><button class="text-btn" data-action="promotion-info">Promotion goals ${icon('arrow',13)}</button></div>`:''}</section>`;
}
const gameModes=[
 ['open-tables','Times tables','times','blue'],
 ['open-written','Written maths','edit','green'],
 ['open-shop','Kit shop','shirt','purple'],
 ['open-units','Maths units','grid','gold']
];
function modeCards(){
 return `<section class="arcade-modes"><div class="arcade-section-title"><h2>Game modes</h2><i aria-hidden="true"></i></div><div class="mode-cards">${gameModes.map(([action,label,symbol,colour])=>`<button class="mode-card ${colour}" data-action="${action}"><span class="mode-icon" aria-hidden="true">${icon(symbol,45)}</span><span class="mode-copy"><b>${label}</b></span><span class="mode-arrow" aria-hidden="true">${icon('arrow',17)}</span></button>`).join('')}</div></section>`;
}

function scoutCard(p) {
 const club=CLUBS.find(team=>!clubProgress(p,team).eligible);
 if(!club)return `<button class="scout-card" data-action="club-path">${icon('trophy',24)}<span><b>All-star career</b><small>See your club offers</small></span></button>`;
 const progress=clubProgress(p,club);
 const goal=progress.remaining.find(g=>g.label==='Different facts')||progress.remaining[0];
 const percent=progress.percent;
 return `<button class="scout-card" data-action="club-path"><span class="scout-badge">${icon('shield',24)}</span><span><b>${esc(club.name)} scout watch</b><small>${esc(goal.label)} ${goal.value}/${goal.target}</small><span class="scout-bar"><i style="width:${percent}%"></i></span></span><strong>${percent}%</strong></button>`;
}

export function homeView(p){
 initCareer(p);
 const progress=yearProgress(p),club=clubById(p.look.club);
 const news=p.inbox.filter(note=>!note.read).length;
 const play=progress.eligible?'Play promotion match':p.placementComplete?'Play Coach match':p.placementProgress?'Continue warm-up':'Kick off';
 const match=progress.eligible?'Year promotion':p.placementComplete?'Coach match':'Your warm-up';
 const shots=progress.eligible?12:p.placementComplete?10:Math.max(0,probeIds(p).length-(p.placementProgress||0));
 const checkReady=progressCheckPlan(p).length>0;
 const latest=p.sessions.at(-1);
 const next=latest?.curriculumYear===p.year?roundRecommendation(p,latest):null;
 const objective=progress.eligible?null:missionProgress(matchMission(p.sessions.filter(round=>round.complete).length),[]);
 return `<div class="lobby-layout"><div class="lobby-main">
  <section class="game-lobby" aria-label="Next match">
   <div class="lobby-banner"><div class="lobby-copy">
    <span class="field-label"><i class="live-dot" aria-hidden="true"></i> ${match}</span>
    <h1>GG, ${esc(p.name)}!</h1>
    <div class="lobby-kicker">${clubBadge(p)}<span>${esc(club.name)} · Year ${p.year}</span></div>
    <button class="btn lime lobby-play arcade-kickoff" data-action="${progress.eligible?'promotion':'play'}">${icon('play',24)} ${play}</button>
    <small class="kickoff-round-details">${shots} shots${objective?`<span>${icon('star',13)} ${objective.name}</span>`:''}</small>
   </div><div class="lobby-player"><span class="lobby-jersey" aria-hidden="true">${p.look.number}</span>${careerCard(p)}<button class="lobby-kit-btn" data-action="appearance" aria-label="Edit my player">${icon('shirt',17)} <span>${esc(p.look.position)} · No. ${p.look.number}</span></button></div></div>
   <div class="lobby-stage-footer">${progressStrip(p)}<button class="wallet-shop" data-action="open-shop" aria-label="Shop, ${credits(p)} credits"><span class="credit-chip" aria-hidden="true">C</span><span><b>${credits(p)} credits</b></span>${icon('arrow',16)}</button></div>
  </section>${coachNextCard(p,next)}${modeCards()}
 </div><aside class="lobby-rail">
  <section class="coach-locker"><div class="coach-locker-heading"><div><span>${icon('whistle',17)} Coach</span><h2>Club scout</h2></div><button class="coach-news-btn" data-action="news" aria-label="Coach messages${news?', '+news+' unread':''}">${icon('book',18)}<span>Messages</span>${news?`<b>${news}</b>`:''}</button></div>
   ${scoutCard(p)}<div class="coach-lobby-actions">${checkReady?`<button class="btn white" data-action="progress-check">${icon('check',17)} Progress check</button>`:''}<button class="btn white" data-action="nav" data-view="stats">${icon('trophy',17)} My records</button></div></section>
  ${goalsMarkup(p,true)}
 </aside></div>
 <details class="lobby-year-progress"><summary>Year ${p.year} progress <b>${progress.secure}/${progress.total} match fit</b></summary>${yearJourney(p)}</details>`;
}

const shopCategories=[['starter','Starter','bolt'],['footballers','Footballers','star'],['kit','Kits','shirt'],['hair','Hair','coach'],['boots','Boots','bolt'],['shorts','Shorts','grid'],['accessory','Extras','star'],['pattern','Designs','edit'],['ball','Balls','ball'],['trail','Trails','bolt'],['celebration','Moves','trophy']];

function itemArt(p,item){
 if(item.slot==='ball'||item.slot==='trail'){
  const ball=item.slot==='ball'?item:itemById(p.look.ball);
  return `<div class="shop-ball-art" style="--preview-ball:${ball.colour};--preview-trail:${item.slot==='trail'?item.colour:'transparent'}">${icon('ball',61)}</div>`;
 }
 const preview=item.number?{...p,look:{...p.look,number:item.number}}:p;
 if(item.slot==='celebration')return `<div class="celebration-preview ${item.id}">${avatarSVG(preview,{size:96})}${icon('star',24)}</div>`;
 return avatarSVG(preview,{size:103,preview:item.id});
}

export function lockerView(p,slot='starter') {
 initCareer(p);
 const balance=credits(p),level=careerLevel(p),club=clubById(p.look.club);
 const title=slot==='starter'?'Starter gear':slot==='footballers'?'Footballer Picks':shopCategories.find(([id])=>id===slot)?.[1]||'Kits';
 const items=ITEMS.filter(item=>slot==='starter'?item.level===1&&item.price>0:slot==='footballers'?item.player:item.slot===slot)
  .sort((a,b)=>a.level-b.level||a.price-b.price);
 const subtitle=slot==='starter'?`From ${items[0].price} credits`:slot==='footballers'?'Original player-inspired gear':
  ['celebration','ball','trail'].includes(slot)?'Watch a preview before buying':'Earn credits in Coach matches';
 return `<section class="shop-banner"><div class="shop-headline"><span class="field-label">${icon('shirt',17)} Kit locker</span><h1>Shop</h1><div class="shop-balance"><span class="credit-chip" aria-hidden="true">C</span> ${balance} credits</div><div class="shop-banner-actions"><button class="btn lime" data-action="appearance">${icon('edit',16)} Edit my player</button><button class="btn translucent" data-action="club-path">${icon('shield',16)} Club offers</button></div></div><div class="shop-player">${avatarSVG(p,{size:204})}<span>${esc(club.name)}</span></div></section>
 <div class="shop-tabs game-shop-tabs" role="group" aria-label="Shop category">${shopCategories.map(([id,label,symbol])=>`<button class="${id===slot?'active':''}" data-action="shop-tab" data-slot="${id}" aria-pressed="${id===slot}">${icon(symbol,18)}<span>${label}</span></button>`).join('')}</div>
 <div class="shop-title"><h2>${title}</h2><span>${icon('ball',16)} ${subtitle}</span></div>
 <p class="shop-earn-note">First completed game: 10 starter credits. Then earn 1 credit per 10 career XP in Coach matches.</p>
 <div class="shop-grid game-shop-grid">${items.map(item=>{
  const owned=owns(p,item),equipped=p.look[item.slot]===item.id,locked=level<item.level,short=Math.max(0,item.price-balance);
  const grade=item.level>=13?'elite':item.level>=7?'rare':item.level>1?'pro':'starter';
  const label=equipped?'Wearing':owned?'Equip':locked?`Unlocks at level ${item.level}`:short?`Need ${short} more credits`:`Buy · ${item.price}`;
  return `<article class="shop-item game-item ${grade} ${equipped?'equipped':''}"><div class="item-card-top"><span>${grade==='elite'?'Elite':grade==='rare'?'Rare':grade==='pro'?'Pro':'Starter'}</span><b>${owned?(equipped?'Equipped':'Owned'):`<span class="credit-chip" aria-hidden="true">C</span> ${item.price}`}</b></div><div class="item-preview">${itemArt(p,item)}</div><h3>${esc(item.name)}</h3>${animatedItem(item)?`<button class="text-btn item-play-preview" type="button" data-action="preview-item" data-item="${item.id}" aria-label="Preview ${esc(item.name)}">${icon('play',15)} Preview</button>`:''}${item.player?`<p class="player-inspiration"><span>Inspired by</span> <b>${esc(item.player)}</b></p>`:''}<button class="btn ${owned?'white':'lime'}" data-action="${owned?'equip':'buy'}" data-item="${item.id}" ${equipped||!owned&&(locked||short)?'disabled':''}>${label}</button>${owned&&item.number&&p.look.number!==item.number?`<button class="text-btn wear-number" data-action="wear-number" data-item="${item.id}">Wear No. ${item.number}</button>`:''}</article>`;
 }).join('')}</div><div class="shop-foot">${scoutCard(p)}<button class="btn white" data-action="play">${icon('play',17)} Play Coach match</button></div>`;
}

export function appearanceView(p){
 const look=p.look;
 const select=(id,options,chosen)=>`<select class="field" id="${id}">${options.map(([value,label])=>`<option value="${esc(value)}" ${chosen===value?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
 return `<span class="eyebrow">My player</span><h2 id="dialog-title">Edit your look</h2><div class="appearance-layout"><div id="appearance-preview">${avatarSVG(p,{size:155})}</div><div class="appearance-fields"><label>Kit number<input class="field" id="kit-number" type="number" min="1" max="99" inputmode="numeric" value="${look.number}"></label><label>Position${select('kit-position',POSITIONS.map(value=>[value,value]),look.position)}</label><label>Hair style${select('kit-hair',ITEMS.filter(item=>item.slot==='hair'&&owns(p,item)).map(item=>[item.id,item.name]),look.hair)}</label><label>Hair colour${select('kit-hair-colour',Object.keys(HAIR_COLOURS).map(value=>[value,value]),look.hairColour)}</label><label>Skin tone${select('kit-skin',Object.keys(SKIN_TONES).map(value=>[value,value]),look.skin)}</label><label>Shirt trim${select('kit-trim',Object.keys(KIT_TRIMS).map(value=>[value,value==='match'?'Match the kit':value]),look.trim)}</label><label>Shirt pattern${select('kit-pattern',ITEMS.filter(item=>item.slot==='pattern'&&owns(p,item)).map(item=>[item.id,item.name]),look.pattern)}</label><label>Lobby colours${select('kit-theme',Object.entries(PLAYER_THEMES).map(([id,theme])=>[id,theme.name]),look.theme)}</label></div></div><div class="dialog-actions"><button class="btn white" data-action="shop-hair">More hairstyles</button><button class="btn lime" data-action="close-dialog">Done ${icon('check',16)}</button></div>`;
}

export function clubJourneyView(p){
 return `<span class="eyebrow">Coach’s scout report</span><h2 id="dialog-title">Club offers</h2><p>Different facts, practice days and later recall help you move up.</p><div class="club-route">${CLUBS.map(club=>{
  const report=clubProgress(p,club),selected=p.look.club===club.id;
  return `<article>${clubBadge({look:{club:club.id}})}<div><h3>${esc(club.name)}</h3><small>${selected?'Your club':report.eligible?'Offer ready':report.remaining.map(goal=>`${goal.label} ${Math.min(goal.value,goal.target)}/${goal.target}`).join(' · ')}</small></div>${report.eligible&&!selected?`<button class="btn lime" data-action="club" data-club="${club.id}">Join</button>`:''}</article>`;
 }).join('')}</div><p class="small-print">Club offers are part of your game career.</p><div class="dialog-actions"><button class="btn white" data-action="close-dialog">Done</button></div>`;
}
export function leagueView(data,p,period='week',selectedYear=0){
 const rows=leagueTable(data.profiles,{period,year:selectedYear});
 return `<section class="league-hero"><div><span class="field-label">${icon('trophy',17)} Club standings</span><h1>Squad League</h1><p>Your players on this device</p></div><div class="league-cup" aria-hidden="true">${icon('trophy',83)}</div></section><div class="league-world-callout"><div><b>World League</b><small>Ranked matches by year and division</small></div><button class="btn lime" data-action="world-league">${icon('trophy',17)} World League</button></div><div class="league-toolbar"><div class="year-toggle"><button class="${period==='week'?'active':''}" data-action="league-period" data-period="week">Last 7 days</button><button class="${period==='all'?'active':''}" data-action="league-period" data-period="all">All-time</button></div><label class="sr-only" for="league-year">Leaderboard year</label><select class="field" id="league-year"><option value="0">Whole squad</option>${Array.from({length:6},(_,i)=>i+1).map(y=>`<option value="${y}" ${selectedYear===y?'selected':''}>Year ${y}</option>`).join('')}</select></div>${rows.length?`<section class="league-board">${rows.map(r=>`<article class="league-row ${r.profile.id===p?.id?'you':''}"><strong class="league-rank">${r.rank<=3?icon('trophy',23):r.rank}</strong><div class="league-avatar">${avatarSVG(r.profile,{size:54})}</div><div class="league-name"><h2>${esc(r.profile.name)} ${r.profile.id===p?.id?'<span>You</span>':''}</h2><small>${esc(r.profile.look?.position||'Player')} · ${esc(clubById(r.profile.look?.club).name)}</small></div><div class="league-stat"><b>${r.points}</b><small>League XP</small></div><div class="league-stat accuracy"><b>${r.accuracy}%</b><small>Accuracy</small></div></article>`).join('')}</section>`:`<section class="league-empty panel">${icon('trophy',48)}<h2>Take the top spot.</h2><p>Bank XP in a Coach match to set a score.</p>${p?'<button class="btn lime" data-action="play">Play a match '+icon('arrow',17)+'</button>':'<button class="btn lime" data-action="new-player">Create a player '+icon('plus',17)+'</button>'}</section>`}<details class="league-explainer"><summary>How scores work</summary><p>Bank XP from independent answers in completed Coach matches. Reading support keeps the same rewards.</p><button class="text-btn" data-action="players">Switch or add a player ${icon('arrow',14)}</button></details>`;
}
export function tablesView(p,{table=3,mode='auto',length=10}={}){
 const choices=focusTables(p.year);if(!choices.length)return `${heading('Build meaning first','Groups before tables.')}<div class="table-start panel"><div>${avatarSVG(p,{size:170})}</div><div><h2>Count. Group. Share.</h2><p>Year 1 begins with equal groups and pictures.</p><button class="btn lime" data-action="skill" data-skill="groups1">Equal groups ${icon('arrow',17)}</button><button class="btn white" data-action="skill" data-skill="share1">Share equally ${icon('arrow',17)}</button></div></div>`;
 if(table!=='all'&&!choices.includes(table))table=choices[0];const evidence=table==='all'?choices.map(t=>tableEvidence(p,t)).reduce((a,e)=>({total:a.total+e.total,direct:a.direct+e.direct,inverse:a.inverse+e.inverse,gaps:a.gaps+e.gaps,secure:a.secure+e.secure}),{total:0,direct:0,inverse:0,gaps:0,secure:0}):tableEvidence(p,table),modes=[['auto','Coach picks','Facts to work on'],['multiply','Multiply','3 × 8'],['divide','Divide','24 ÷ 3'],['missing','Missing factor','3 × ? = 24'],['mixed','Mixed facts','All three forms']];
 return `${heading(`Year ${p.year} · Training ground`,'Times tables')}<div class="table-gym-layout"><section class="table-session panel"><div class="tables-challenge-card"><div><span class="field-label">${icon('bolt',15)} XP match</span><b>Coach challenge</b><small>10 shots · Coach picks the facts</small></div><button class="btn lime" data-action="table-challenge">${icon('play',16)} Play</button></div><h2>Free practice</h2><div class="gym-table-tabs" role="group" aria-label="Choose a table">${choices.map(t=>`<button data-action="gym-table" data-table="${t}" class="${table===t?'active':''}" aria-pressed="${table===t}">×${t}</button>`).join('')}<button data-action="gym-table" data-table="all" class="${table==='all'?'active':''}">Mixed</button></div><div class="gym-modes">${modes.map(([id,title,detail])=>`<button data-action="gym-mode" data-mode="${id}" class="${mode===id?'selected':''}" aria-pressed="${mode===id}"><b>${title}</b><small>${detail}</small>${icon(mode===id?'check':'ball',17)}</button>`).join('')}</div><div class="gym-length"><span>Match length</span><button class="${length===10?'active':''}" data-action="gym-length" data-length="10">10 shots</button><button class="${length===25?'active':''}" data-action="gym-length" data-length="25">25 shots</button></div><button class="btn lime big full" data-action="gym-play">Start free practice ${icon('arrow',18)}</button></section><aside><section class="table-evidence panel"><span class="eyebrow">${table==='all'?'Mixed tables':'×'+table} / Your evidence</span><h2>Your table stats</h2><div class="evidence-row"><span>${icon('ball',18)}Multiplication</span><b>${evidence.direct}/${evidence.total}</b></div><div class="evidence-row"><span>${icon('reset',18)}Inverse division</span><b>${evidence.inverse}/${evidence.total}</b></div><div class="evidence-row"><span>${icon('help',18)}Missing factors</span><b>${evidence.gaps}/${evidence.total}</b></div><div class="evidence-row fit"><span>${icon('shield',18)}Match fit</span><b>${evidence.secure}/${evidence.total}</b></div><p>Facts return on later days. A missed fact comes back after other questions.</p></section><div class="coach-note">Coach introduces up to three new fact families in a match and revisits earlier facts. Multiplication and division evidence stay separate.</div></aside></div><div id="table-tracker-host">${factMapMarkup(p,table==='all'?choices[0]:table)}</div>`;
}
export function syllabusBank(p,year,domain,search){
 const query=search.trim().toLowerCase();
 if(domain==='all'&&!query)return '';
 const ids=syllabusIds(year).filter(id=>{
  const skill=skillById(id);
  return `${skill.title} ${skill.focus||''}`.toLowerCase().includes(query);
 });
 return syllabusCards(p,ids,domain);
}

export function syllabusView(p,year=1,domain='all',search=''){
 const available=new Set(syllabusIds(year).map(id=>domainFor(skillById(id))));
 return `<section class="units-page">
  <div class="units-heading">
   <h1>Maths units</h1>
   <label for="unit-year"><span>Year group</span><select id="unit-year" class="field">
    ${Array.from({length:6},(_,i)=>i+1).map(y=>`<option value="${y}" ${y===year?'selected':''}>Year ${y}</option>`).join('')}
   </select></label>
  </div>
  <div class="units-search">
   <input id="skill-search" class="search" type="search" aria-label="Find an exercise" placeholder="Find an exercise" value="${esc(search)}">
  </div>
  <div class="unit-grid" role="group" aria-label="Choose a maths unit">
   ${DOMAINS.filter(d=>available.has(d.id)).map(d=>`<button class="unit-choice" data-action="domain" data-domain="${d.id}" aria-pressed="${d.id===domain}">
    <span class="unit-symbol" aria-hidden="true">${esc(d.symbol)}</span><span>${esc(d.title)}</span>
   </button>`).join('')}
   ${p?`<button class="unit-choice" data-action="open-written"><span class="unit-symbol" aria-hidden="true">${icon('edit',19)}</span><span>Written maths</span></button>`:''}
  </div>
  <div id="syllabus-bank" tabindex="-1">${syllabusBank(p,year,domain,search)}</div>
  <div class="units-links"><a class="text-btn" href="../curriculum/">Curriculum guide ${icon('book',15)}</a>${p?nav('stats','My progress','chart','text-btn'):''}</div>
 </section>`;
}
export function syllabusCards(p,ids,domain='all'){
 return DOMAINS.filter(d=>domain==='all'||domain===d.id).map(d=>{const list=ids.filter(id=>domainFor(skillById(id))===d.id);if(!list.length)return '';return `<section class="domain-section"><div class="domain-title"><span class="domain-number">${d.symbol}</span><h2>${d.title}</h2><small>${list.length} skills</small></div><div class="curriculum-grid">${list.map(id=>{const sk=skillById(id),c=p?competency(p,id):{n:0,secure:false,ready:false};return `<article class="curriculum-card"><button data-action="skill" data-skill="${id}" aria-label="Practise ${esc(sk.title)}"><span class="curriculum-symbol">${sk.table?'×'+sk.table:d.symbol}</span><h3>${esc(sk.title)}${sk.digits?`<small>${sk.digits} digits${sk.regroup?' · exchange':' · no exchange'}</small>`:''}</h3>${icon('arrow',17)}<span class="status ${c.secure?'fit':c.n?'training':''}">${c.secure?'Match fit':c.ready?'Building on it':c.n?'Training':'New'}</span></button><div class="skill-card-tools"><details><summary>What this covers</summary><p>${esc(sk.focus||sk.description||sk.title)}</p></details><button class="text-btn" data-action="example" data-skill="${id}">Example ${icon('book',14)}</button></div></article>`;}).join('')}</div></section>`;}).join('')||'<div class="empty"><h3>No skills found.</h3><p>Try table, time or fraction.</p></div>';
}
export function progressView(p,records){
 const sum=profileSummary(p);return `${heading(`${esc(p.name)} / Your progress`,'The trophy room.',`<span class="wallet-pill">${icon('star',16)}Level ${careerLevel(p)}</span>`)}<div class="progress-top"><div>${avatarSVG(p,{size:130})}</div><div><h2>${careerXP(p)} XP earned</h2><p>${sum.factsSecure} fact families recalled on later days.</p>${progressStrip(p)}</div><div>${nav('league','Squad league','trophy')}${nav('locker','Locker room','coach')}<button class="btn white" data-action="report" data-id="${esc(p.id)}">${icon('book',17)} Parent report</button></div></div>${yearProfileMarkup(parentReport(p))}${yearJourney(p)}<section class="panel" style="margin-bottom:22px"><h2>Your personal bests</h2>${records}</section><div id="table-tracker-host">${factMapMarkup(p,focusTables(p.year)[0])}</div>`;
}
const reportDate=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/London'});
const levelTag=level=>`<span class="knowledge-level level-${level}">${KNOWLEDGE_LEVELS[level]}</span>`;
const reportTitle=skill=>`${drillTitle(skill.skill)} · Year ${skill.year}`;

function answerEvidence(skill){
 if(!skill.total)return 'No recorded attempts yet';
 if(!skill.attempts)return Number.isFinite(skill.lastAt)?`Last checked ${reportDate.format(skill.lastAt)}${skill.previouslySecure?' · previously secure':''}`:'Older evidence recorded';
 const outcomes=[[skill.wrong,'incorrect'],[skill.helped,'with help'],[skill.askedCoach,'asked Coach'],[skill.skipped,'skipped']]
  .filter(([count])=>count).map(([count,label])=>`${count} ${label}`);
 return [`${skill.independent}/${skill.attempts} independent`,...outcomes].join(' · ');
}

function priorityCard(p,skill,formatQuestion){
 const {route,next,example}=skill;
 const label=route.kind==='retry'?`Revisit ${drillTitle(next.skill)}.`:`${route.kind==='practice'?'Practise':'Check'} ${drillTitle(next.skill)} first.`;
 const question=example&&(formatQuestion(example.q)||example.q.prompt);
 const outcome=example?.unknown?(example.assisted?'Asked Coach':'Skipped'):example?.assisted?'Used Coach help':'Incorrect';
 const response=outcome==='Incorrect'&&['number','string'].includes(typeof example?.typed)&&['number','string'].includes(typeof example.q.answer)?
  `<small>Entered ${mathText(String(example.typed).slice(0,40))} · expected ${mathText(example.q.answer)}</small>`:'';
 return `<article class="parent-priority">
  <div class="parent-row-heading"><h4>${esc(reportTitle(skill))}</h4>${levelTag(skill.level)}</div>
  <p>${answerEvidence(skill)}${skill.sessions?` across ${skill.sessions} ${skill.sessions===1?'session':'sessions'}`:''}.</p>
  ${question?`<p class="parent-example">Recent example <b>${mathText(question)}</b> · ${outcome}${response}</p>`:''}
  <div class="parent-next-step"><b>${esc(label)}</b>
   ${route.id!==skill.id?`<small>Evidence for this step · ${answerEvidence(next)}</small>`:''}
   ${route.path.length>2?`<small>Build forwards · ${route.path.slice().reverse().map(id=>esc(drillTitle(skillById(id)))).join(' → ')}</small>`:''}
  </div>
  ${coachDrillButton(p,route.id,route.target,route.path)}
 </article>`;
}

function skillExample(skill,formatQuestion){
 const example=skill.example;if(!example)return '';
 const q=example.q;
 const fallback=q.expression||q.prompt||(q.op==='bond'?`${q.a} + ? = ${q.total}`:q.op==='place'?`Value of ${q.b} in ${q.a}`:`${q.a} ${q.op} ${q.b}`);
 const text=formatQuestion(q)||fallback;
 const expected=Array.isArray(q.answer)?q.format==='clock'?`${q.answer[0]}:${String(q.answer[1]).padStart(2,'0')}`:JSON.stringify(q.answer):String(q.answer);
 return `<details class="parent-question-example"><summary>Example question</summary><p>${example.recorded?'Recorded question':'Illustrative question, not a result'}: <b>${mathText(text)}</b></p>${q.visual&&q.visual.type!=='written'?diagram(q.visual):''}<small>Expected answer: ${mathText(expected)}${example.recorded?` · ${example.correct?'Answered independently':'Still practising'}`:''}</small></details>`;
}
function securityChecklist(skill){
 return `<details class="security-checklist"><summary>What makes this skill secure?</summary><p>${skill.ready?'Independent starting evidence is in place.':'First build independent success on varied questions: six recent attempts with at least 83% independent accuracy and five different questions (or three successful warm-up checks). Small question banks use the available questions.'}</p><ul>${skill.checks.map(c=>`<li class="${c.met?'met':''}"><span aria-hidden="true">${c.met?'✓':'○'}</span><span>${esc(c.label)}</span><b>${c.value}${c.label.includes('(%)')?'%':''}<small>target ${c.target}${c.label.includes('(%)')?'%':''}</small></b></li>`).join('')}</ul><small>Coach help and unsure answers do not count as independent success.</small></details>`;
}
function domainEvidence(domain,year,formatQuestion){
 const summary=Object.entries(domain.counts).filter(([,count])=>count)
  .map(([level,count])=>`<span class="level-${level}">${count} ${KNOWLEDGE_LEVELS[level].toLowerCase()}</span>`).join('');
 const evidenceRows=[...domain.skills,...domain.earlier].sort((a,b)=>Number(a.level==='unseen')-Number(b.level==='unseen')||a.year-b.year);
 return `<article class="parent-topic">
  <h4>${esc(domain.title)}</h4><p class="topic-expectation">${esc(domain.status)}</p>
  ${summary?`<div class="parent-counts" aria-label="Year ${year} skills">${summary}</div>`:'<p>Earlier skills recorded</p>'}
  ${domain.shown?`<p>${domain.shown.level==='secure'?'Secure example':'Developing independently'} · <b>${esc(reportTitle(domain.shown))}</b></p>`:'<p>Still gathering evidence of independent answers.</p>'}
  <details class="parent-skill-details"><summary>Skill-by-skill evidence</summary><ul>
   ${evidenceRows.map(skill=>`<li><div><b>${esc(reportTitle(skill))}</b><small>${answerEvidence(skill)}</small></div>${levelTag(skill.level)}${skillExample(skill,formatQuestion)}${securityChecklist(skill)}</li>`).join('')}
  </ul></details>
 </article>`;
}

export function reportContent(p,formatQuestion=q=>q.expression||q.prompt,now=Date.now()){
 const report=parentReport(p,now),progress=yearProgress(p,p.year,now);
 const checked=report.current.length-report.counts.unseen;
 return `<article class="parent-report">
  <header class="parent-report-head">
   <span class="eyebrow">Matchday Maths · Parent feedback</span>
   <h2 id="dialog-title">${esc(p.name)}’s learning report</h2>
   <p>Practice Year ${report.year} · ${reportDate.format(report.now)}</p>
   <div class="parent-report-stats"><span><b>${report.counts.secure}</b> secure</span><span><b>${checked}/${report.current.length}</b> skills checked</span><span><b>${progress.checked}/${progress.practical.length}</b> practical checks</span></div>
  </header>
  <div class="parent-report-actions"><button class="btn white" data-action="print-report">${icon('book',15)} Print / save PDF</button><button class="btn white" data-action="export-csv" data-id="${esc(p.id)}">Export scores</button></div>
  <p class="parent-report-intro">Each skill shows up to eight recent answers from the last 30 days. A year label shows where the skill first appears in the game’s curriculum. Use the topic evidence to see what ${esc(p.name)} can do independently.</p>
  ${yearProfileMarkup(report)}
  <section class="security-explainer"><h3>When does checked become secure?</h3><p><b>Checked</b> means a question has been attempted. <b>Developing</b> means different questions have been answered independently. <b>Secure</b> needs the evidence rules for that skill, including recall on later days. Open “What makes this skill secure?” below to see the exact targets and current evidence.</p></section>
  ${report.stage!=='building'?`<section class="year-next-step"><h3>${report.stage==='secure'?'All digital skills secure':'Close to securing the year'}</h3><p>${report.stage==='secure'?progress.eligible?'The year promotion match is ready.':`Complete the ${progress.practical.length-progress.checked} remaining practical checks to unlock the promotion match.`:`${report.current.length-report.counts.secure} ${report.current.length-report.counts.secure===1?'skill still needs':'skills still need'} secure recall. Continue varied practice on later days and complete the practical checks.`}</p>${progress.eligible?'<button class="btn lime" data-action="promotion">Play promotion match</button>':''}</section>`:''}
  <section><h3>Skills to support</h3>
   ${report.priorities.length?`<div class="parent-priorities">${report.priorities.map(skill=>priorityCard(p,skill,formatQuestion)).join('')}</div>`:'<p>No current priorities from the recorded answers. Warm-up and practice will build the picture.</p>'}
  </section>
  <section><h3>Knowledge by topic</h3>
   <div class="parent-topics">${report.domains.map(domain=>domainEvidence(domain,report.year,formatQuestion)).join('')}</div>
   <p class="parent-report-key">Secure means the skill’s independent evidence targets have been met on later days. Developing means successful independent answers on different questions. Needs a check means the evidence is limited. Needs support means difficulty on more than one recent question. Older attempts show as refresh needed.</p>
  </section>
  <section class="parent-practical"><h3>Practical checks for a grown-up</h3><p>Record activities you have observed.</p>
   <div class="practical-list">${progress.practical.map(t=>`<label><input type="checkbox" data-practical="${t.id}" data-profile="${esc(p.id)}" ${t.done?'checked':''}><span><b>${esc(t.title)}</b><small>${esc(t.detail)}</small></span></label>`).join('')}</div>
  </section>
  <div class="dialog-actions"><button class="btn" data-action="close-dialog">Done</button></div>
 </article>`;
}
export function coachView(data,voices=[]){
 const british=britishVoices(voices);return `${heading('For grown-ups','Coach’s corner.')}<div class="coach-grid"><section class="panel"><div class="section-head"><h2>Your squad</h2><button class="text-btn" data-action="new-player">Add ${icon('plus',15)}</button></div>${data.profiles.length?data.profiles.map(p=>`<div class="profile-row"><span class="profile-dot">${p.look?.number||9}</span><div><strong>${esc(p.name)}</strong><small>Year ${p.year} · Level ${careerLevel(p)} · ${p.sessions.length} matches</small></div><button class="text-btn" data-action="report" data-id="${p.id}">Parent report</button><button class="text-btn" data-action="edit-player" data-id="${p.id}">Edit</button></div>`).join(''):'<p>Create a player to begin. No pupil names or scores are preloaded.</p>'}<div class="coach-note">Profiles and the squad league belong to this browser. Switching player keeps results separate. There are no passwords or online pupil accounts.</div></section><section class="panel"><h2>Reading and sound</h2><label class="setting-check"><input type="checkbox" id="dyslexia-setting" ${data.settings.dyslexia?'checked':''}> Dyslexia-friendly layout</label><label class="setting-check"><input type="checkbox" id="reduce-motion" ${data.settings.reduceMotion?'checked':''}> Reduce motion</label><label class="setting-check"><input type="checkbox" id="auto-read" ${data.settings.autoRead?'checked':''}> Read questions automatically</label><label class="voice-field" for="british-voice">British voice<select class="field" id="british-voice"><option value="">${british.length?'Choose automatically':'No en-GB voice available on this device'}</option>${british.map(v=>`<option value="${esc(v.voiceURI)}" ${data.settings.voiceURI===v.voiceURI?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label><label class="voice-field" for="speech-rate">Speech pace<select id="speech-rate" class="field"><option value="0.75" ${data.settings.speechRate===.75?'selected':''}>Slower</option><option value="0.9" ${data.settings.speechRate===.9?'selected':''}>Steady</option><option value="1" ${data.settings.speechRate===1?'selected':''}>Normal</option></select></label><button class="text-btn" data-action="voice-test">${icon('sound',16)}Try the voice</button><p class="small-print">Voice availability and pronunciation depend on the browser and device. Reading support never reduces rewards.</p></section></div><section class="panel backup-panel"><div><h2>Keep a squad backup</h2><p>Clearing browser data removes local progress. Export a backup to move to another computer.</p></div><div class="data-buttons"><button class="btn white" data-action="backup">${icon('download',16)}Backup</button><button class="btn white" data-action="import">Restore</button><input type="file" id="import-file" accept=".json,application/json" hidden></div></section><section class="panel coach-rules"><h2>What drives practice and promotion?</h2><ol><li>A warm-up checks basic number facts and smaller written methods before harder year targets. Completing your first game gives 10 starter credits; it does not award mastery.</li><li>Coach balances weak prerequisites, a focus table, written methods, wider curriculum and due recall. Written mistakes lead to smaller methods. Two distinct independent successes build back up. Coach also checks supporting number skills.</li><li>Table families need separate multiplication and inverse-division evidence. At most three new table families enter a short match.</li><li>Match-fit evidence needs broad independent success on later days. Reviews use increasing intervals of 1, 3, 7, 14, 30 and 60 days.</li><li>Promotion requires the current year’s digital families, recorded practical checks and a successful promotion match. XP alone cannot promote a year.</li><li>Finish Coach matches to bank XP for new or due independent answers. One credit is earned per 10 XP. Free practice keeps your learning history.</li></ol><p>Changing a practice year in Edit does not award completion of earlier years. The curriculum map is for England; it does not claim a single uniform UK curriculum or guarantee permanent retention.</p><div class="sources"><a href="../curriculum/">Full curriculum guide</a><a href="../accessibility/">Accessibility</a><a href="../privacy/">Privacy</a></div></section>`;
}
