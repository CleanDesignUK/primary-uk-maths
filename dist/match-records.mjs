import {profileSummary,skillById} from './engine.mjs?v=7.0.0';
import {missionProgress} from './shot.mjs?v=7.0.0';
import {esc,icon} from './visuals.mjs?v=7.0.0';

export function medals(p){
 const summary=profileSummary(p),matches=p.sessions||[],goals=p.goalsTotal??matches.reduce((n,s)=>n+s.correct,0);
 return [['First kick','Finish your first game, including the warm-up','ball',matches.some(s=>s.complete)],
  ['Hat-trick','3 independent answers in a row','flame',matches.some(s=>s.bestStreak>=3)],
  ['Clean sheet','10/10 without help','shield',matches.some(s=>s.attempts>=10&&s.correct===s.attempts&&!s.hintsUsed&&!s.rows?.some(r=>r.assisted||r.unknown))],
  ['Golden boot','50 goals or saves','trophy',goals>=50],['Match regular','Train on 3 days','clock',summary.days.length>=3],
  ['Record breaker','Set a personal best','star',Object.keys(p.records||{}).length>0],
  ['Midfield master','Practise the 3, 4 and 8 tables','ball',[3,4,8].every(t=>p.learning?.[`table${t}`]?.correct>=5)],
  ['Match fit','12 secure facts','shield',summary.factsSecure>=12],
  ['Stadium star','Finish a match objective','star',matches.some(s=>s.complete&&missionProgress(s.mission,s.rows||[],s.bestStreak)?.complete)]];
}
export function medalsMarkup(p){
 const awards=medals(p);
 return `<section class="panel trophy-medals"><div class="section-head"><h2>Your medals</h2><span>${awards.filter(m=>m[3]).length}/${awards.length} earned</span></div><div class="badge-grid">${awards.map(([name,detail,symbol,earned])=>`<div class="badge ${earned?'earned':'locked'}"><span class="badge-icon">${icon(symbol,28)}</span><b>${name}</b><span class="medal-state">${earned?'Earned':'To unlock'}</span><p>${detail}</p></div>`).join('')}</div></section>`;
}
export function matchLabel(s){
 if(s.progressCheck)return 'Progress check';
 if(s.placement||s.mode==='check')return 'Warm-up';
 if(s.promotion)return 'Promotion match';
 if(s.coachDrill)return 'Coach drill';
 return s.manual?skillById(s.manual)?.title||'Free practice':s.tableChallenge?'Tables challenge':'Coach match';
}
export function historyMarkup(p){
 return `<section class="panel match-history"><div class="section-head"><h2>Match history</h2><span>${p.sessions.length} saved</span></div>${p.sessions.length?`<div class="history-list">${[...p.sessions].reverse().slice(0,20).map(s=>`<article><span class="history-icon">${icon(s.complete?'ball':'clock',24)}</span><div><h3>${esc(matchLabel(s))}</h3><p>${new Date(s.endedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · ${s.complete?'Completed':'Saved early'}${s.hintsUsed?' · Coach helped':''}</p></div><div class="history-score"><b>${s.correct}/${s.attempts}</b><span>correct</span></div><div class="history-score"><b>${s.careerXP??s.points??0}</b><span>XP</span></div></article>`).join('')}</div><p class="history-note">Warm-ups, drills and saved games all appear here. Personal bests need a completed timed match without help or pauses.</p>`:'<p>Your first warm-up and every saved game will appear here.</p>'}</section>`;
}
