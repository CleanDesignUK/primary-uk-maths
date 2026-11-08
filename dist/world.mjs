import {esc,icon,mathText} from './visuals.mjs?v=7.1.0';
import {penaltyArena} from './experience.mjs?v=7.1.0';

export const DIVISIONS=['Academy','County','Premier'];
export const worldClock=expires=>{
 const seconds=Math.max(0,Math.ceil((expires-Date.now())/1000));
 return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
};
export async function leagueApi(route,{token='',query={},body}={}){
 const url=new URL(`api/world/${route}`,import.meta.url);
 for(const [key,value] of Object.entries(query))url.searchParams.set(key,value);
 const headers={Accept:'application/json'};
 if(token)headers['X-Matchday-Player']=token;
 if(body!==undefined)headers['Content-Type']='application/json';
 const response=await fetch(url,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 if(!response.headers.get('Content-Type')?.includes('application/json'))throw Error('Online league is not available on this site yet. Play the Squad League on this device.');
 const result=await response.json();
 if(!response.ok)throw Object.assign(new Error(result.error||'Try again shortly.'),{status:response.status});
 return result;
}
export function worldBoardView(player,state){
 const {tier,board,available,busy,identity,unlocked,error,report}=state;
 if(available===false)return `<section class="world-unavailable panel"><span class="eyebrow">League play</span><h1>Play your Squad League</h1><p>Online matches against players on other devices are not available on this site yet.</p><p>Your Squad League is ready. Compare players saved on this device and earn League XP in completed Coach matches.</p><button class="btn lime" data-action="nav" data-view="league">${icon('trophy',18)} Open Squad League</button></section>`;
 const canPlay=available&&identity&&unlocked.includes(tier);
 const season=board?.season?`Week of ${new Date(board.season+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long'})}`:'Weekly standings';
 return `<section class="world-banner"><div><span class="eyebrow">${icon('trophy',16)} Ranked football maths</span><h1>World League</h1><p>Year ${player.year} · ${esc(season)}</p></div><span class="world-cup">${icon('trophy',64)}</span></section><div class="world-division-tabs" role="group" aria-label="Ranked division">${DIVISIONS.map((name,index)=>`<button data-action="world-tier" data-tier="${index}" aria-pressed="${index===tier}" class="${index===tier?'active':''}"><span>${index+1}</span>${name}</button>`).join('')}</div>
 ${report?`<div class="world-report" role="status">${icon('trophy',22)} <span><b>${report.correct}/10 goals</b> · ${DIVISIONS[report.tier]} ${report.correct>=8&&report.tier<2?`· ${DIVISIONS[report.tier+1]} unlocked`:''}</span></div>`:''}
 <div class="world-board-layout"><section class="world-ranks panel"><h2>${DIVISIONS[tier]} standings</h2><p>Year ${player.year} · Best match per player this week</p>${board?.rows?.length?`<ol>${board.rows.map((row,i)=>`<li><b>${i+1}</b><span>${esc(row.alias)}${row.alias===identity?.alias?' · You':''}</span><strong>${row.correct}/10</strong><small>${(row.elapsed/1000).toFixed(1)} s</small></li>`).join('')}</ol>`:`<div class="world-empty">${icon('trophy',39)}<p>${available===null||busy?'Loading standings…':available?'The first match is still to come.':'Online standings are not available yet.'}</p></div>`}${available?`<button class="text-btn" data-action="world-refresh" ${busy?'disabled':''}>Refresh standings</button>`:''}</section>
 <aside class="world-entry panel"><h2>${identity?esc(identity.alias):'Your world player'}</h2><p>${identity?'Ten shots in your year group. Score eight to reach the next division.':'Join with a generated football nickname. Players can see that nickname, your year group and your ranked score. Your player name stays on this device.'}</p>${available?(identity?`<button class="btn lime" data-action="world-start" ${!canPlay||busy?'disabled':''}>${icon('play',17)} ${canPlay?'Play ranked match':'Qualify in '+DIVISIONS[tier-1]}</button>`:`<button class="btn lime" data-action="world-join" ${busy?'disabled':''}>Join World League ${icon('arrow',17)}</button>`):''}${error?`<p class="world-error" role="alert">${esc(error)}</p>`:''}${identity&&available?`<button class="text-btn" data-action="world-leave" ${busy?'disabled':''}>Leave World League</button>`:''}<button class="text-btn" data-action="nav" data-view="league">${icon('back',15)} Squad league</button></aside></div>`;
}
export function worldMatchView(player,state){
 const match=state.match,feedback=state.feedback,question=feedback?state.lastQuestion:match.question,keeper=player.look?.position==='Goalkeeper';
 const shot=feedback?match.index:match.index+1;
 return `<div class="game-shell world-match"><header class="game-header"><button class="btn white" data-action="world-board">${icon('back',17)} League</button><span class="profile-mini">${esc(state.identity.alias)}</span></header><main id="main" class="game-main"><div class="game-title"><div><div class="eyebrow">World League · ${DIVISIONS[match.tier]}</div><h1>Year ${match.year} match</h1></div><div class="game-metrics"><div class="game-metric"><strong>${match.correct}</strong><small>${keeper?'Saves':'Goals'}</small></div><div class="game-metric"><strong id="world-time">${worldClock(match.expiresAt)}</strong><small>Time</small></div></div></div><div class="shot-track" aria-label="Shot ${shot} of 10">${Array.from({length:10},(_,i)=>`<i class="${i<match.index?state.outcomes?.[i]||'played':i===match.index?'active':''}" aria-hidden="true"></i>`).join('')}<span class="shot-count">${shot}/10</span></div>
 <div class="game-grid match-grid"><section class="pitch-card match-pitch" aria-label="Ranked shot camera"><div class="match-card-top"><span>${icon('ball',13)} Shot cam</span></div>${penaltyArena(player)}<div class="pitch-hud"><span>${feedback?(feedback.goal?(keeper?'Great save':'In the net'):(keeper?'In the net':'Wide')):(keeper?'Ready to save':'Ready to shoot')}</span><strong>${match.correct}<small> ${keeper?'saves':'goals'}</small></strong></div></section><section class="question-card" id="question-host" data-feedback="${feedback?(feedback.goal?'goal':'miss'):''}"><div class="q-prompt">${esc(question.prompt)}</div><div class="q-equation ${question.expression.length>18?'compact':''}">${mathText(question.expression)}</div>
 <form id="world-answer-form"><input class="answer-input ${feedback?(feedback.goal?'correct':'incorrect'):''}" name="answer" aria-label="Ranked answer" inputmode="decimal" autocomplete="off" maxlength="20" required ${feedback?'disabled':''} value="${esc((feedback?state.lastAnswer:state.answer)||'')}">
 ${!feedback?`<div class="question-actions"><button class="btn big shoot-button" type="submit" ${state.busy?'disabled':''}>${state.busy?'Checking…':keeper?'Save':'Shoot'} ${icon('arrow',17)}</button></div>`:''}
 <details class="scratch-paper" ${state.scratch?'open':''}><summary>${icon('edit',16)} Working paper</summary><textarea id="world-scratch-work" aria-label="Ranked working paper" placeholder="Write your working here…" maxlength="1000" ${feedback?'readonly':''}>${esc(state.scratch||'')}</textarea></details>
 </form>
 ${feedback?`<div class="feedback ${feedback.goal?'':'miss'}" role="status">${icon(feedback.goal?'ball':'whistle',27)}<div><h3>${feedback.goal?(keeper?'Save!':'Goal!'):(keeper?'Let’s build it.':'Wide!')}</h3><p>${feedback.goal?'Point on the board':`Answer ${feedback.answer}`}</p></div><button class="btn lime" data-action="world-next">${feedback.complete?'See standings':'Next shot'} ${icon('arrow',16)}</button></div>`:''}${state.error?`<p class="world-error" role="alert">${esc(state.error)}</p>`:''}</section></div></main></div>`;
}
