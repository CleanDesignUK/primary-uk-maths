import {VERSION,DAY,SKILLS,skillById,questionPool,initialData,newProfile,validateImport,profileSummary,skillStats,factSecure,explain,columnSteps,localDay,uid} from './engine.mjs?v=6.5.0';
import {DOMAINS,syllabusIds,domainFor,answerMatches,validDrawing,parseNumber} from './curriculum.mjs';
import {initLearning,competency,planSummary,nextAdaptive,recordLearning,probeIds,laneFocus,progressCheckPlan,progressCheckQuestions} from './adaptive.mjs?v=6.2.0';
import {esc,icon,kit,stadium,diagram,mathText} from './visuals.mjs?v=6';
import {earnedXP,eligibleRecord,newPersonalBest,MATCH_SCHEMA,initRewards,isCoachChallenge,rewardCandidate,revealFact,bankCareerXP} from './rewards.mjs?v=6.2.0';
import {isWrittenSkill,writtenAllowance,writtenTask,multiplicationWorkspace,divisionWorkspace} from './written-work.mjs?v=6.6.0';
import {goalsMarkup,pathMarkup,factMapMarkup,workedMarkup,penaltyArena} from './experience.mjs?v=6.5.0';
import {warmupProgress,matchTimeLeft,tickMatchClock,academyPath} from './progression.mjs?v=6.6.0';
import {pickerView,firstShots,firstShotView,homeView,lockerView,leagueView,tablesView,syllabusView,syllabusBank,syllabusCards,progressView,reportContent,coachView,appearanceView,clubJourneyView} from './academy-ui.mjs?v=6.5.0';
import {initCareer,careerLevel,careerXP,levelProgress,credits,buyItem,equipItem,owns,chooseClub,careerNews,clubProgress,CLUBS,SKIN_TONES,HAIR_COLOURS,POSITIONS,itemById,PLAYER_THEMES,KIT_TRIMS,ITEMS} from './career.mjs?v=6.5.0';
import {avatarSVG} from './avatar.mjs?v=6.5.0';
import {AIM_ZONES,matchMission,missionProgress,paintShot,spotlightZone} from './shot.mjs?v=6.3.0';
import {leagueApi,worldBoardView,worldMatchView,worldClock} from './world.mjs?v=6.5.0';
import {yearProgress,checkPromotion,initLeague,recordLeague} from './promotion.mjs';
import {focusTables} from './tables.mjs';
import {workingText} from './coaching.mjs?v=6.3.0';
import {spokenMath,selectBritishVoice} from './speech.mjs';
import {columnWorkspace} from './column-method.mjs?v=6.1.1';
import {takesFraction,fractionParts,fractionSubmission,fractionAnswerMarkup} from './fraction-answer.mjs';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const STORAGE='numbergrove.data.v1',DRAFT='numbergrove.round.v1';
const app=$('#app'),modalRoot=$('#modal-root');
const touchMatch=matchMedia('(max-width: 680px), (pointer: coarse)');
const padFields='#answer,.column-digit,.column-note,.work-note,[data-fraction-part],.bar-input,#world-answer-form input';
const padSymbols=[['.','Decimal point'],['−','Minus'],[',','Comma'],['r','Remainder'],[':','Ratio separator']];
let lastPadField;
let data,storageWarning='',session=null,result=null,view='home',year=3,domain='all',search='',tableView=3,pendingSkill=null,shopSlot='starter',leaguePeriod='week',leagueYear=0,gym={table:null,mode:'auto',length:10},voices=[],lastSpokenKey='',tickId=null,lastTick=0,lastSave=0,returnFocus=null,pendingImport=null,pendingMatch=null,audio;
const draftRounds=new Map();
const firstShot={index:0,goal:false};
try{const raw=localStorage.getItem(STORAGE);data=raw?validateImport(JSON.parse(raw)):initialData();}catch{data=initialData();storageWarning='Progress could not be loaded. Restore a backup in Coach.';}
if(data.profiles.length===3&&data.profiles.every(p=>['Ace','Carter','Cruz'].includes(p.name)&&!p.sessions.length&&!Object.keys(p.facts).length)&&Math.max(...data.profiles.map(p=>p.createdAt))-Math.min(...data.profiles.map(p=>p.createdAt))<1000){data.profiles=[];data.activeId=null;}
try{const reading=localStorage.getItem('matchday.reading');if(reading!==null)data.settings.dyslexia=reading==='true';}catch{}
for(const p of data.profiles){initCareer(p);if(p.year===0)p.year=1;initLearning(p);initRewards(p);initLeague(p);}
const routeMap={today:'home',skills:'syllabus',progress:'stats',grownups:'coach'};
const GOAL_FEEDBACK_MS=1200;
let goalTimer;
function newWorkTime(round) {
 return round.progressCheck||isWrittenSkill(round.manual)?0:writtenAllowance(round.q);
}
let initialRoute=location.hash.slice(1);view=routeMap[initialRoute]||(['home','tables','syllabus','stats','coach','players','locker','league','written','world'].includes(initialRoute)?initialRoute:'home');
try{
 const saved=JSON.parse(localStorage.getItem(DRAFT)||'null');
 const rounds=saved?.schema==='rounds-v1'?saved.rounds:[saved];
 for(const round of rounds){
  if(!['football-v2','football-v3','football-v4',MATCH_SCHEMA].includes(round?.schema)||!data.profiles.some(p=>p.id===round.profileId)||!Number.isFinite(round.elapsed)||!round.q||!Array.isArray(round.skillIds)||!round.skillIds.every(skillById))continue;
  round.paused=true;round.pausedEver=true;
  if(round.phase==='question'&&!Number.isFinite(round.workTimeLeft))round.workTimeLeft=newWorkTime(round);
  draftRounds.set(round.profileId,round);
 }
 session=draftRounds.get(saved?.schema==='rounds-v1'?saved.active:saved?.profileId)||null;
 if(session)data.activeId=session.profileId;
}catch{}
const player=()=>data.profiles.find(p=>p.id===(session?.profileId||data.activeId));
const savedRound=()=>draftRounds.get(data.activeId);
const colours=['#326443','#4c70be','#c0874e','#7179a8'];
const playerIndex=p=>Math.max(0,data.profiles.findIndex(x=>x.id===p.id));
const shirtNumber=p=>p?.look?.number||9;
const clubPoints=p=>p.pointsTotal??p.sessions.reduce((n,s)=>n+s.points,0);
const level=p=>careerLevel(p);
const totalGoals=p=>p.goalsTotal??p.sessions.reduce((n,s)=>n+s.correct,0);
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data));localStorage.setItem('matchday.reading',String(!!data.settings.dyslexia));return true;}catch{storageWarning='This browser cannot save progress. Download a backup in Coach.';return false;}}
function saveRound(){
 if(session)draftRounds.set(session.profileId,session);
 try{
  if(draftRounds.size)localStorage.setItem(DRAFT,JSON.stringify({schema:'rounds-v1',active:session?.profileId??null,rounds:[...draftRounds.values()]}));
  else localStorage.removeItem(DRAFT);
 }catch{storageWarning='This round cannot be saved in this browser.';}
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3300);}
function profileDot(p){return `<span class="profile-dot">${p?.look?.number||9}</span>`;}
function brand(){
 return `<a class="brand" href="#home" data-action="home" aria-label="Matchday Maths home"><span class="brand-mark">${icon('ball',26)}</span><span class="brand-type">Matchday <em>Maths</em></span></a>`;
}
const gameMenu = [
 ["home","Play","play"],
 ["syllabus","Units","grid"],
 ["locker","Shop","shop"],
 ["tables","Tables","times"],
 ["league","League","trophy"]
];
function gameNavigation(activeView=view){
 return `<nav class="arcade-nav" aria-label="Game navigation">${gameMenu.map(([id,label,symbol])=>{
  const active=activeView===id||id==='syllabus'&&activeView==='written'||id==='league'&&activeView==='world';
  return `<button class="nav-btn ${active?'active':''}" data-action="${id==='syllabus'?'open-units':'nav'}" data-view="${id}" aria-label="${id==='tables'?'Times tables':label}" ${active?'aria-current="page"':''}>
   <span class="arcade-nav-icon">${icon(symbol,20)}</span><span>${label}</span>
  </button>`;
 }).join('')}</nav>`;
}
function header(hasMenu){
 const p=player();
 return `<header class="header arcade-topbar ${hasMenu?'has-game-menu':''}">
  ${brand()}${hasMenu?gameNavigation():''}
  <div class="header-tools">
   ${p&&data.activeId?`<button class="profile-mini" data-action="players" aria-label="Switch player">${profileDot(p)}<span>${esc(p.name)}</span></button>`:''}
   <button class="icon-btn coach-top" data-action="nav" data-view="coach" aria-label="Coach and settings">${icon('settings',20)}</button>
  </div>
 </header>`;
}
function footer(){
 return `<footer class="footer arcade-footer"><span>${icon('shield',13)} Saved on this device</span><div><a href="../parents/">Parents</a><a href="../teachers/">Teachers</a><button class="text-btn" data-action="nav" data-view="coach">Grown-ups ${icon('settings',13)}</button></div></footer>`;
}
function parkMatch(){
 if(!session)return;
 clearTimeout(goalTimer);clearInterval(tickId);window.speechSynthesis?.cancel();
 session.paused=true;session.pausedEver=true;
 draftRounds.set(session.profileId,session);session=null;saveRound();
}
function navigate(next){
 parkMatch();
 if(view==='world'&&next!=='world'){clearTimeout(goalTimer);clearInterval(worldTimer);world.match=null;world.feedback=null;}
 if(next==='world')world.loaded=false;
 closeDialog();result=null;view=next;location.hash=next;render();scrollTo({top:0});
}
window.addEventListener('hashchange',()=>{if(location.hash==='#main')return;if(!session&&!result){view=routeMap[location.hash.slice(1)]||(['home','tables','syllabus','stats','coach','players','locker','league','written','world'].includes(location.hash.slice(1))?location.hash.slice(1):'home');render();}});
function render(){
 applyAccessPreferences();
 if(view==='world'&&world.match&&!session&&!result){renderWorldMatch();return;}
 if(session){renderGame();return;}
 if(result){renderResult();return;}
 const content=!data.activeId&&!['coach','syllabus','league','world'].includes(view)?'players':view;
 const hasMenu=!!data.activeId&&content!=='players';
 const pages={players:playersPage,home:homePage,tables:()=>tablesView(player(),gym),syllabus:syllabusPage,written:writtenPage,world:worldPage,stats:statsPage,coach:coachPage,locker:()=>lockerView(player(),shopSlot),league:()=>leagueView(data,player(),leaguePeriod,leagueYear)};
 const resume=savedRound();
 const ribbon=resume&&hasMenu?`<aside class="resume-ribbon"><div>${icon('ball',20)} <b>Match saved</b><small>${resume.attempts}/${resume.target} played</small></div><button class="btn lime" data-action="resume-saved">Resume ${icon('play',17)}</button></aside>`:'';
 app.innerHTML=`<div class="shell arcade-shell">${header(hasMenu)}<main id="main" class="${content==='players'?'welcome':'page'} arcade-page" tabindex="-1">${storageWarning?`<div class="storage-warning" role="alert">${esc(storageWarning)}</div>`:''}${ribbon}${(pages[content]||playersPage)()}</main>${footer()}</div>`;
 applyAccessPreferences();
}
function playersPage(){return pickerView(data,firstShot);}
function takeFirstShot(answer){
 const drill=$('.first-shot');
 const question=firstShots[firstShot.index];
 if(!drill||firstShot.goal||!question.choices.includes(answer))return;
 const goal=answerMatches(question,answer);
 firstShot.goal=goal;
 paintShot($('.penalty-view',drill),{question,correct:goal,attempt:firstShot.index+1,aim:'centre',replay:true});
 $('#first-shot-feedback').textContent=goal?'Goal! In the net.':question.coach;
 if(goal){
  $('.first-shot-equation strong',drill).textContent=String(answer);
  $$('[data-action="first-shot"]',drill).forEach(button=>{button.disabled=true;button.classList.toggle('scored',Number(button.dataset.answer)===answer);});
  const next=$('[data-action="first-shot-next"]',drill);
  next.hidden=false;next.focus({preventScroll:true});
 }
}
function metric(value,label,symbol){return `<div class="metric"><span class="metric-icon">${icon(symbol,23)}</span><div><strong>${value}</strong><small>${label}</small></div></div>`;}
function shortTitle(s){if(s.id.startsWith('col'))return `${s.title} · ${s.digits} digits${!s.regroup?' · no exchange':''}`;return s.title;}
function symbolFor(s){if(s.table)return `×${s.table}`;if(['mix348','mixAll'].includes(s.id))return '×';if(s.kind==='div')return '÷';if(s.kind==='place')return '123';if(s.kind==='coladd'||s.kind==='add')return '+';if(s.kind==='colsub'||s.kind==='sub')return '−';if(s.kind==='bonds')return s.id==='bonds10'?'10':'20';return DOMAINS.find(d=>d.id===domainFor(s))?.symbol||'?';}
function drillCard(id,clickable=true){const s=skillById(id),c=data.activeId?competency(player(),id):{secure:false,n:0,coverage:0};return `<${clickable?'button':'div'} class="drill-card" ${clickable?`data-action="skill" data-skill="${id}" aria-label="Practise ${esc(shortTitle(s))}"`:''}><span class="drill-icon">${symbolFor(s)}</span><h3>${esc(shortTitle(s))}</h3><div class="drill-meta"><span class="status ${c.secure?'fit':c.n?'training':''}">${c.secure?'Match fit':c.n?'Training':'New'}</span>${clickable?icon('arrow',14):icon('whistle',14)}</div><div class="skill-bar"><i style="width:${c.secure?100:Math.min(90,c.coverage||0)}%"></i></div></${clickable?'button':'div'}>`;}
function homePage(){return homeView(player());}

function syllabusPage(){return syllabusView(data.activeId?player():null,year,domain,search);}
const eligible=eligibleRecord;
function recordKey(s){return s.recordKey||`${[...s.skillIds].sort().join(',')}|${s.duration}`;}
function bestFor(key,p=player()){return p.records?.[key]||null;}
function recordLabel(s){return s.manual?shortTitle(skillById(s.manual)):['football-v2','football-v3','football-v4',MATCH_SCHEMA].includes(s.schema)?`Coach training · League ${s.league||1}`:s.skillIds.length===1?skillById(s.skillIds[0]).title:'Mixed practice';}
function recordsMarkup(p){const records=Object.values(p.records||{}).sort((a,b)=>b.endedAt-a.endedAt);return records.length?`<div class="records">${records.slice(0,10).map(s=>`<div class="record">${icon('trophy',22)}<div><b>${esc(recordLabel(s))}</b><small>${s.correct}/${s.attempts} goals · ${Math.round(s.elapsed)}s</small></div><strong>${s.points}</strong></div>`).join('')}</div>`:'<div class="empty">'+icon('trophy',33)+'<h3>Your first record is waiting.</h3><button class="btn soft" data-action="play" style="margin-top:17px">Kick off '+icon('arrow',15)+'</button></div>';}
function medals(p){const s=profileSummary(p),ss=p.sessions,goals=totalGoals(p);return [['First kick','Finish a match','ball',ss.some(x=>x.complete)],['Hat-trick','3 goals in a row','flame',ss.some(x=>x.bestStreak>=3)],['Clean sheet','10/10 without help','shield',ss.some(x=>x.attempts>=10&&x.correct===x.attempts&&!x.hintsUsed)],['Golden boot','50 goals','trophy',goals>=50],['Match regular','Train on 3 days','clock',s.days.length>=3],['Record breaker','Set a personal best','star',Object.keys(p.records||{}).length>0],['Midfield master','Practise 3, 4 and 8','ball',[3,4,8].every(t=>p.learning[`table${t}`]?.correct>=5)],['Match fit','12 secure facts','shield',s.factsSecure>=12],['Stadium star','Finish a match objective','star',ss.some(match=>match.complete&&missionProgress(match.mission,match.rows||[],match.bestStreak)?.complete)]];}
function statsPage(){return progressView(player(),recordsMarkup(player()));}
function historyMarkup(p){return p.sessions.length?`<div class="report-wrap"><table class="report"><thead><tr><th>Date</th><th>Match</th><th>Goals</th><th>XP</th><th>Time</th></tr></thead><tbody>${[...p.sessions].reverse().slice(0,20).map(s=>`<tr><td>${new Date(s.endedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td><td>${esc(s.mode==='check'?'Warm-up':recordLabel(s))}<small>${s.complete?'Full match':'Saved early'}${s.hintsUsed?' · Coach helped':''}${s.pausedEver?' · paused':''}</small></td><td>${s.correct}/${s.attempts}</td><td>${s.careerXP??s.points}</td><td>${Math.round(s.elapsed)}s</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty"><h3>A fresh start.</h3><p>Your match results appear here.</p></div>';}
function coachPage(){return coachView(data,voices);}

function startMatch(manual=null,options={}) {
 const p=player();
 if(!p){profileForm();return;}
 const skill=manual?skillById(manual):null;
 if(manual&&!skill)return;
 if(manual){const url=new URL(location.href);if(url.searchParams.has('skill')){url.searchParams.delete('skill');history.replaceState(null,'',url);}}
 if(savedRound()){
  pendingMatch={manual,options};
  openDialog(`<h2 id="dialog-title">Match saved</h2><p>Resume it or finish early to start a new one.</p><div class="dialog-actions"><button class="btn white" data-action="start-fresh">Start new</button><button class="btn lime" data-action="resume-saved">Resume ${icon('play',17)}</button></div>`);
  return;
 }
 initCareer(p);initRewards(p);data.activeId=p.id;save();closeDialog();result=null;
 const checkPlan=options.progressCheck?progressCheckPlan(p):[];
 const checkQuestions=progressCheckQuestions(p,checkPlan);
 if(options.progressCheck&&checkQuestions.length<3){toast('Practise a skill first.');return;}
 const progressCheck=checkPlan.length>0;
 if(warmupProgress(p)>=probeIds(p).length)p.placementComplete=true;
 const placement=!manual&&!options.promotion&&!progressCheck&&!p.placementComplete;
 const probeStart=placement?warmupProgress(p):0;
 const league=Math.min(5,1+Math.floor(SKILLS.filter(s=>competency(p,s.id).ready).length/12));
 const written=isWrittenSkill(manual);
 const pace=[60,120,180].includes(p.trainingSeconds)?p.trainingSeconds:120;
 const duration=options.promotion||written?600:placement?300:options.length===25?180:manual?(skill.extra?180:60):p.year>=5&&!options.tableChallenge?420:pace;
 const target=options.promotion?12:progressCheck?Math.min(6,checkQuestions.length):placement?probeIds(p).length-probeStart:written?4:options.length||10;
 const matchType=manual?`practice:${manual}:${options.tableMode||'auto'}`:options.tableChallenge?'table-challenge':options.promotion?'promotion':`coach:${league}`;
 session={
  schema:MATCH_SCHEMA, curriculumYear:p.year, promotion:!!options.promotion,
  progressCheck, checkPlan, checkQuestions, tableChallenge:!!options.tableChallenge, tableMode:options.tableMode||'auto',
  focusTable:laneFocus(p,'tables'), clockHour:12,clockMinute:0,id:uid(),profileId:p.id,
  skillIds:[],manual,league,placement,probeIndex:probeStart,mode:placement||progressCheck?'check':'timed',duration,target,
  recordKey:`v5:${matchType}:y${p.year}:${target}:${duration}`, startedAt:Date.now(),
  mission:progressCheck||options.promotion?null:matchMission(p.sessions.filter(match=>match.complete).length),
  aimSeed:p.sessions.length%3,aim:null,
  elapsed:0,clockElapsed:0,currentMs:0,attempts:0,correct:0,points:0,careerPending:0,streak:0,bestStreak:0,
  rows:[],seen:[],retries:[],paused:false,pausedEver:false,hintsUsed:0,assisted:false,phase:'question',q:null,selection:null,
  answer:'',digits:[],notes:[],drawing:[],bars:[],angle:30,work:{},scratch:'',remainder:''
 };
 nextQuestion(false);renderGame();startTick();saveRound();scrollTo({top:0});
}

function nextQuestion(renderHost=true){
 clearTimeout(goalTimer);
 if(!session)return;
 if(session.attempts>=session.target){finishMatch(true);return;}
 const next=nextAdaptive(player(),session);
 if(!next?.q&&session.progressCheck){session.target=session.attempts;finishMatch(true);return;}
 if(!next?.q)throw Error('No next exercise');
 if(next.retryKey){const i=session.retries.findIndex(r=>r.q.key===next.retryKey);if(i>=0)session.retries.splice(i,1);}
 if(next.advanceProbe)session.probeIndex++;
 session.q=next.q;session.selection=next;session.assisted=false;session.phase='question';session.aim=null;session.answer='';session.fractionParts=null;session.digits=[];session.notes=[];session.noteHistory=[];session.drawing=[];session.bars=[];session.angle=30;session.clockHour=12;session.clockMinute=0;session.currentMs=0;session.lastDigit=null;session.work={};session.scratch='';session.remainder='';
 session.lastBar=null;
 session.workTimeLeft=newWorkTime(session);
 session.seen.push(session.q.key);if(!session.skillIds.includes(session.q.skillId))session.skillIds.push(session.q.skillId);saveRound();
 if(renderHost&&$('#question-host')){
  renderQuestion();paintPitch();updateLive();
  if(window.matchMedia('(max-width: 680px)').matches)scrollTo({top:0,behavior:'instant'});
 }
}
const clock=s=>`${Math.floor(Math.max(0,Math.ceil(s))/60)}:${String(Math.max(0,Math.ceil(s))%60).padStart(2,'0')}`;
function matchTimer() {
 const working=session.phase==='question'&&session.workTimeLeft>0;
 const remaining=working?session.workTimeLeft:matchTimeLeft(session);
 const caption=session.progressCheck?'No timer':working?'Work time':session.phase==='feedback'?'Coach time':'Time';
 return {working,remaining,caption,display:session.progressCheck?'∞':clock(remaining)};
}
function shotTrack(){return `${Array.from({length:session.target},(_,i)=>`<i class="${session.rows[i]?(session.rows[i].unknown?'played':session.rows[i].correct?'goal':'miss'):i===session.attempts?'active':''}" aria-hidden="true"></i>`).join('')}<span class="shot-count">${Math.min(session.target,session.attempts+(session.phase==='question'?1:0))}/${session.target}</span>`;}
function aimMarkup(){
 if(!session.mission)return '';
 return `<div class="aim-controls" role="group" aria-label="Aim your shot">${AIM_ZONES.map((zone,i)=>`<button type="button" data-action="aim" data-zone="${zone}" aria-pressed="false"><span aria-hidden="true">${['‹','·','›'][i]}</span><b>${zone}</b></button>`).join('')}</div><div class="match-mission" id="match-mission"></div>`;
}
function keypadMarkup() {
 const numbers=[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-action="key" data-key="${n}">${n}</button>`).join('');
 return `<div id="keypad" class="match-keypad" role="group" aria-label="Match keypad" hidden>
  <div class="numpad" role="group" aria-label="Number keys">${numbers}<button type="button" class="key-muted" data-action="key" data-key="clear" aria-label="Clear answer">C</button><button type="button" data-action="key" data-key="0">0</button><button type="button" class="key-muted" data-action="key" data-key="back" aria-label="Delete last digit">${icon('erase',18)}</button></div>
  <div class="pad-actions"><div class="symbol-keys">${padSymbols.map(([key,label])=>`<button type="button" data-action="key" data-key="${key}" aria-label="${label}">${key}</button>`).join('')}</div><span class="pad-clock" hidden><strong id="pad-time"></strong><small id="pad-time-caption"></small></span><button class="btn lime pad-shoot" type="button" data-action="key" data-key="shoot">Shoot ${icon('arrow',15)}</button></div>
 </div>`;
}
function questionPadSymbols(q) {
 if(q.format==='bars'||q.key.startsWith('column')||writtenTask(q))return [];
 if(q.format==='pair')return ['−',','];
 if(q.format==='remainder')return ['r'];
 if(String(q.answer).includes(':'))return [':'];
 if(q.format==='decimal'||typeof q.answer==='number'&&!Number.isInteger(q.answer))return ['−','.'];
 return ['−'];
}
function updateKeypad(visible,enabled,symbols) {
 const pad=$('#keypad'),touch=touchMatch.matches;
 pad.hidden=!visible;
 pad.inert=!enabled;
 pad.classList.toggle('touch-pad',touch);
 pad.closest('.game-main').classList.toggle('touch-keypad',touch&&visible);
 $$('.symbol-keys button',pad).forEach(button=>{button.hidden=!symbols.includes(button.dataset.key);});
 $('.symbol-keys',pad).hidden=!symbols.length;
 $('.pad-clock',pad).hidden=!touch||symbols.length>0;
 if(touch)for(const field of $$(padFields,$('#question-host'))){
  field.inputMode='none';
  field.readOnly=true;
  field.dataset.touchAnswer='';
 }
}
function renderGame() {
 const p=player();
 const best=bestFor(session.recordKey);
 const earns=isCoachChallenge(p,session);
 const label=session.promotion?'Promotion match':session.progressCheck?'Progress check':session.placement?'Warm-up':session.manual?'Free practice':session.tableChallenge?'Tables challenge':'Coach match';
 const title=session.manual?shortTitle(skillById(session.manual)):session.progressCheck?'Check your progress':session.placement?`Year ${session.curriculumYear} warm-up`:`Year ${session.curriculumYear} ${session.promotion?'promotion':'match'}`;
 const timer=matchTimer();
 app.innerHTML=`<div class="game-shell">
  <header class="game-header arcade-topbar match-topbar">${brand()}${gameNavigation('home')}<div class="header-tools"><span class="profile-mini">${profileDot(p)}<span>${esc(p.name)}</span></span><button class="icon-btn" data-action="pause" aria-label="Pause match">${icon('pause',17)}</button></div></header>
  <main id="main" class="game-main">
   <div class="game-title"><div><div class="eyebrow">${label}</div><h1>${esc(title)}</h1></div><div class="game-metrics"><div class="game-metric"><strong id="live-goals">${session.correct}</strong><small>Goals</small></div><div class="game-metric"><strong id="live-streak">${session.streak}</strong><small>Streak</small></div><div class="game-metric" id="timer-box"><strong id="live-time">${timer.display}</strong><small id="timer-caption">${timer.caption}</small></div></div></div>
   <div class="shot-track" id="shot-track" aria-label="Match progress">${shotTrack()}</div>
   <div class="game-grid match-grid">
    <section class="pitch-card match-pitch" aria-label="Shot camera"><div class="match-card-top"><span><i class="live-dot" aria-hidden="true"></i> <span id="match-stage">Kick-off</span></span><button class="pitch-replay" data-action="replay-shot" aria-label="Replay shot" hidden>${icon('reset',15)}</button></div>${penaltyArena(p,{aimGuide:!!session.mission})}${aimMarkup()}<div class="pitch-hud"><span id="move-caption" aria-live="polite">Ready to shoot</span><strong id="live-xp">${earns?session.careerPending||0:session.points}<small> ${earns?'XP to bank':'pts'}</small></strong></div><div class="sideline-note" id="sideline-note" hidden></div></section>
    <section id="question-host" class="question-card" aria-label="Maths question"></section>
    <aside class="match-controls"><div class="desktop-record">${best?`Personal best · ${best.points} pts`:earns?'Finish the match to bank XP':'Practice goals'}</div>${keypadMarkup()}<button class="text-btn finish-practice" data-action="finish">Save & finish ${icon('arrow',12)}</button></aside>
   </div>
  </main></div>`;
 renderQuestion();paintPitch();updateLive();
 if(session.paused)showPauseOverlay();
}

function coreExpression(q,reveal=false){const a=q.a?.toLocaleString('en-GB'),b=q.b?.toLocaleString('en-GB'),ans=String(q.answer);switch(q.op){case 'bond':return `${a} + ${reveal?ans:'□'} = ${q.total}`;case 'missing+':return `${reveal?ans:'□'} + ${b} = ${q.total}`;case 'missing−':return `${a} − ${reveal?ans:'□'} = ${q.total}`;case 'missing×':return `${a} <span class="op">×</span> □ <span class="op">=</span> ${q.total}`;case 'double':return `Double ${a}${reveal?' = '+ans:''}`;case 'half':return `Half of ${a}${reveal?' = '+ans:''}`;case 'place':return String(q.a).split('').map((digit,i,str)=>({digit,i})).map(({digit,i})=>i===String(q.a).length-1-Math.log10(q.power)?`<span class="highlight">${digit}</span>`:digit).join('');default:return `${a} <span class="op">${q.op}</span> ${b}${reveal?' = '+ans:' <span class="op">=</span>'}`;}}
function equationLabel(q,reveal=true){if(q.expression!==undefined)return q.expression||skillById(q.skillId).title;return coreExpression(q,reveal).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();}
function questionPrompt(q){if(q.prompt!==undefined)return q.prompt;return q.op==='place'?'Value of the green digit?':q.op==='bond'?`Make ${q.total}`:q.op?.startsWith('missing')?'Find the gap':q.key.startsWith('column')?'Start with the ones.':q.op==='double'||q.op==='half'?'':q.op==='×'?'Multiply':q.op==='÷'?'Divide':q.op==='+'?'Add':'Subtract';}
function columnMarkup(q,done=false){return columnWorkspace(q,{digits:session.digits,notes:session.notes,history:session.noteHistory||[],done});}
function writtenPage(){
 const p=player(),ids=syllabusIds(year).filter(isWrittenSkill);
 return `<div class="heading"><div><span class="eyebrow">Year ${year}</span><h1>Written maths</h1><p>Four shots per drill. Use the working boxes or start with an example.</p></div></div>${ids.length?syllabusCards(p,ids):`<div class="panel"><h2>Build your number methods</h2><p>Start with ${year===1?'numbers and equal groups':'adding and subtracting within 100'}.</p><button class="btn lime" data-action="skill" data-skill="${year===1?'add20':'mental2'}">Start practice</button></div>`}`;
}
let shownExample=null;
function showSkillExample(id){
 const skill=skillById(id),q=questionPool(id)[0];
 if(!skill||!q)return;
 shownExample=q;
 if(player()){revealFact(player(),q);save();}
 const prompt=questionPrompt(q),expression=q.expression===undefined?coreExpression(q):mathText(q.expression),answer=answerLabel(q);
 let visual=writtenTask(q)?'':diagram(q.visual,{angle:q.format==='angle'?q.answer:30,hour:q.format==='clock'?q.answer[0]:12,minute:q.format==='clock'?q.answer[1]:0});
 if(q.format==='plot')visual+=plotMarkup(q.visual,true,q.answer);
 if(q.format==='bars')visual+=diagram({...q.visual,type:'barChart'});
 if(q.format==='drawing')visual=drawingMarkup(q.visual,true,q.visual.sides===3?[[1,4],[2,1],[4,4]]:[[1,1],[4,1],[4,3],[1,3]]);
 openDialog(`<span class="eyebrow">Worked example</span><h2 id="dialog-title">${esc(skill.title)}</h2>${prompt?`<p>${esc(prompt)}</p>`:''}${expression?`<p class="example-equation">${expression}</p>`:''}${visual}${helpMarkup(q)}${answer?`<p class="example-answer"><b>Answer</b> ${mathText(answer)}</p>`:''}<div class="dialog-actions"><button class="btn white" data-action="close-dialog">Back</button><button class="btn lime" data-action="skill" data-skill="${id}">Practise this ${icon('arrow',16)}</button></div>`,{wide:true});
}
function answerLabel(q){
 if(q.format==='drawing')return '';
 if(q.format==='clock')return `${q.answer[0]}:${String(q.answer[1]).padStart(2,'0')}`;
 if(q.format==='plot')return q.answer.map(([x,y])=>`(${x}, ${y})`).join(' · ');
 if(q.format==='bars')return q.answer.map((n,i)=>`${q.visual.labels[i]} ${n}`).join(' · ');
 if(q.format==='angle')return `${q.answer}°`;
 if(q.format==='pair')return `(${Array.isArray(q.answer)?q.answer.join(', '):q.answer.replace(',',', ')})`;
 const value=typeof q.answer==='number'?q.answer.toLocaleString('en-GB',{maximumFractionDigits:12}):q.answer;
 return `${q.unit==='£'?'£':''}${value}${q.unit&&q.unit!=='£'?` ${q.unit}`:''}`;
}
function drawingMarkup(v,done,points=session.drawing||[]){const path=points.map(p=>`${24+p[0]*45},${20+p[1]*43}`).join(' ');return `<div class="drawing" id="drawing-board"><svg viewBox="0 0 290 260" aria-hidden="true">${Array.from({length:6},(_,i)=>`<path d="M${24+i*45} 20v215M24 ${20+i*43}h225" stroke="#dfe7d6" stroke-width="1"/>`).join('')}<polyline points="${path}${points.length===v.sides&&points.length?' '+(24+points[0][0]*45)+','+(20+points[0][1]*43):''}" fill="${points.length===v.sides?'#7193d026':'none'}" stroke="#4e78bd" stroke-width="3"/></svg>${Array.from({length:36},(_,i)=>{const x=i%6,y=Math.floor(i/6),selected=points.some(p=>p[0]===x&&p[1]===y);return `<button type="button" class="dot-btn ${selected?'selected':''}" style="left:${(24+x*45)/290*100}%;top:${(20+y*43)/260*100}%" data-action="draw-point" data-x="${x}" data-y="${y}" aria-label="Point ${x}, ${y}" aria-pressed="${selected}" ${done?'disabled':''}></button>`;}).join('')}</div>${!done?'<div class="drawing-actions"><button type="button" class="text-btn" data-action="draw-undo">Undo</button><button type="button" class="text-btn" data-action="draw-clear">Reset</button></div>':''}`;}
function basicHelpVisual(q){if(q.op==='×')return `<div class="math-array" style="grid-template-columns:repeat(${q.b},12px)">${Array.from({length:q.a*q.b},()=>'<i></i>').join('')}</div>`;if(['+','−','bond','double'].includes(q.op)&&q.a<=20){const total=Math.min(20,q.op==='+'||q.op==='double'?q.answer:q.op==='bond'?q.total:q.a),split=q.op==='+'||q.op==='bond'||q.op==='double'?q.a:q.answer;return `<div class="ten-frames">${Array.from({length:Math.max(1,Math.ceil(total/10))},(_,r)=>`<div class="ten-frame">${Array.from({length:10},(_,j)=>`<i class="${r*10+j<total?'filled':''} ${r*10+j>=split&&r*10+j<total?'second':''}"></i>`).join('')}</div>`).join('')}</div>`;}return '';}
function helpMarkup(q,small=false){const hints=q.hint||explain(q).steps,model=workedMarkup(q);return `<div class="help-box clean-solution"><h3>${icon('whistle',16)} Coach’s working</h3>${model||`<ol class="solution-steps">${hints.map((t,i)=>`<li><span>${i+1}</span><div>${mathText(t)}</div></li>`).join('')}</ol>`}${model?`<details class="more-help"><summary>Explain the steps</summary><ol class="solution-steps">${hints.map((t,i)=>`<li><span>${i+1}</span><div>${mathText(t)}</div></li>`).join('')}</ol></details>`:''}<button class="text-btn" data-action="hear-help">${icon('sound',15)} Hear the working</button></div>`;}
function renderQuestion(){
 if(!session)return;const q=session.q,done=session.phase==='feedback',extra=skillById(q.skillId).extra,column=q.key.startsWith('column'),written=writtenTask(q),options=written?null:q.options;
 const unknown=done&&session.rows.at(-1).unknown;
 let content='',input='',isWords=false;
 if(written){
  const work={entered:session.digits,notes:session.work||{},done,remainder:session.remainder||''};
  content=`<div class="q-prompt">${esc(questionPrompt(q))}</div>${written.type==='multiply'?multiplicationWorkspace(written,work):divisionWorkspace(written,work)}`;
 }else if(extra){isWords=/[A-Za-z]/.test(q.expression||'');content=`<div class="q-prompt">${esc(questionPrompt(q))}</div>${q.expression?`<div class="q-equation ${isWords?'words':String(q.expression).length>19?'compact':''}">${mathText(q.expression)}</div>`:''}`;
 if(q.format==='drawing')content+=drawingMarkup(q.visual,done);else if(q.format==='plot')content+=diagram(q.visual)+plotMarkup(q.visual,done);else content+=diagram(q.visual,{angle:session.angle,points:session.drawing,bars:session.bars,hour:session.clockHour,minute:session.clockMinute});
 }else{content=`<div class="q-prompt">${esc(questionPrompt(q))}</div>`;if(column)content+=columnMarkup(q,done);else content+=`<div class="q-equation ${['double','half'].includes(q.op)?'words':q.op==='place'?'compact':''}">${coreExpression(q)}</div>`;}
 if(options){const symbol=options.every(x=>['<','>','='].includes(String(x)));input=`<div class="choices ${options.some(x=>/[A-Za-z]/.test(x))?'words':''} ${symbol?'choice-symbols':''}" role="group" aria-label="Answer choices">${options.map(o=>`<button class="choice ${done?(answerMatches(q,o)?'correct':String(session.answer)===String(o)?'incorrect':''):''}" type="button" data-action="answer-choice" data-value="${esc(o)}" ${done?'disabled':''}>${mathText(o)}</button>`).join('')}</div>`;}
 else if(q.format==='clock')input=`<div class="clock-controls"><label>Hour<select id="clock-hour" class="field" ${done?'disabled':''}>${Array.from({length:12},(_,i)=>i+1).map(h=>`<option value="${h}" ${session.clockHour===h?'selected':''}>${h}</option>`).join('')}</select></label><label>Minutes<select id="clock-minute" class="field" ${done?'disabled':''}>${Array.from({length:q.skillId==='clockHands1'?2:12},(_,i)=>i*(q.skillId==='clockHands1'?30:5)).map(m=>`<option value="${m}" ${session.clockMinute===m?'selected':''}>${String(m).padStart(2,'0')}</option>`).join('')}</select></label></div>`;
 else if(q.format==='angle')input=`<input type="range" min="0" max="${q.visual?.max||180}" step="1" class="angle-control" id="angle-control" aria-label="Turn the angle ray" value="${session.angle}" ${done?'disabled':''}>`;
 else if(q.format==='bars')input=`<div class="bar-answer-row">${q.visual.labels.map((l,i)=>`<label>${esc(l)}<span style="height:100px;width:60px;display:flex;align-items:flex-end;background:#f1f5e8;border-radius:5px;overflow:hidden"><i id="bar-view-${i}" style="display:block;background:${i?'#6489d2':'#7f9f55'};width:100%;height:${(session.bars[i]||0)*5}px"></i></span><input class="bar-input" type="number" min="0" max="20" inputmode="numeric" aria-label="${esc(l)} bar height" data-bar="${i}" value="${esc(session.bars[i]??'')}" ${done?'disabled':''}></label>`).join('')}</div>`;
 else if(takesFraction(q)){
  const mixed=q.format==='mixed';
  session.fractionParts??=fractionParts(session.answer,{mixed,completed:done});
  input=fractionAnswerMarkup(session.fractionParts,{mixed,done,correct:session.rows.at(-1)?.correct});
 }else if(!['drawing','plot','clock'].includes(q.format)&&!column&&!written)input=`<div class="answer-line">${q.unit==='£'?'<span class="unit">£</span>':''}<input class="answer-input ${q.format==='pair'||Number(q.answer)>9999?'wide':''} ${done?(session.rows.at(-1).correct?'correct':'incorrect'):''}" id="answer" aria-label="Your answer" inputmode="${q.format==='pair'||Number(q.answer)<0||String(q.answer).includes(':')?'text':q.format==='decimal'?'decimal':'numeric'}" autocomplete="off" maxlength="24" value="${esc(session.answer)}" placeholder="?" ${done?'disabled':''}>${q.unit&&q.unit!=='£'?`<span class="unit">${esc(q.unit)}</span>`:''}</div>`;
 if(unknown&&(column||written)){
  content=`<div class="q-equation compact">${mathText(equationLabel(q,false))}</div>`;
  input='';
 }else if(unknown)input='';
 const coachButton=`<button class="coach-assist" type="button" data-action="hint" aria-expanded="${!!session.assisted}">${icon('whistle',17)} Coach help</button>`;
 const scratch=`<details class="scratch-paper" ${session.scratch?'open':''}><summary>${icon('edit',16)} Working paper</summary><textarea id="scratch-work" maxlength="1000" aria-label="Working paper" placeholder="Write your working here…" ${done?'readonly':''}>${esc(session.scratch||'')}</textarea></details>`;
 let tail='';
 if(done){
  const last=session.rows.at(-1);
  const target=answerLabel(q);
  const feedback=last.unknown?'See how Coach does it.':last.correct?(last.careerCandidate?`+${last.careerCandidate} XP to bank`:`+${last.earned} points${isCoachChallenge(player(),session)?' · Recall practice':''}`):q.format==='drawing'?'Check the corners.':q.format==='plot'?'Check each point.':q.format==='bars'?'Match the bar heights.':`Answer ${target}`;
  tail=`<div class="feedback ${last.unknown?'coach-stop':last.correct?'':'miss'}" role="status">${icon(last.correct?'ball':'whistle',30)}<div><h3>${last.unknown?'Coach will help':last.correct?'Goal!':'Let’s build it.'}</h3><p>${mathText(feedback)}</p></div><button class="btn ${last.correct?'lime':'white'}" type="button" data-action="next">${last.unknown?'Next question':'Next shot'} ${icon('arrow',15)}</button></div>${!last.correct?helpMarkup(q):''}${session.scratch?scratch:''}`;
 }else{
  const submitButton=options?'':`<button class="btn big shoot-button" type="submit">Shoot ${icon('arrow',18)}</button>`;
  tail=`<div id="answer-error" class="field-error" role="alert"></div>${submitButton?`<div class="question-actions">${submitButton}</div>`:''}${scratch}${session.assisted?helpMarkup(q):''}`;
 }
 const skill=skillById(q.skillId);
 const reason=session.selection.reason;
 const coachLabel=reason==='support'?'Build up':reason==='review'?'Recall':reason==='repair'?'Try again':session.selection.label;
 $('#question-host').innerHTML=`<div class="q-toolbar"><span class="q-label ${reason==='repair'?'replay':''}">${icon('whistle',13)}${esc(coachLabel)}</span><div class="q-toolbar-actions">${done?'':coachButton+'<button class="dont-know" type="button" data-action="dont-know">I don’t know</button>'}<button class="voice-button" data-action="hear" aria-label="Read the question aloud">${icon('sound',17)}</button></div></div><form id="answer-form" novalidate>${content}${input}${tail}</form>${!done&&!session.manual?`<p class="coach-selection" title="${esc(session.selection.detail||'')}">${icon('whistle',14)} Coach picked ${esc(skill.title.toLowerCase())}</p>`:''}`;
 const typed=!options&&!['drawing','angle','plot','clock'].includes(q.format);
 updateKeypad(typed&&(!done||touchMatch.matches&&session.rows.at(-1).correct),typed&&!done,questionPadSymbols(q));
 applyAccessPreferences();if(!done&&data.settings.autoRead&&lastSpokenKey!==q.key){lastSpokenKey=q.key;speak(`${questionPrompt(q)}. ${q.expression!==undefined?q.expression:coreExpression(q)}`);}
 if(!done&&!touchMatch.matches)requestAnimationFrame(()=>{
  const first=$('[data-start-digit]')||$$('.column-digit').at(-1);
  if(first)first.focus({preventScroll:true});
  else if(!document.activeElement?.matches('[data-fraction-part]'))($('#fraction-whole')||$('#fraction-numerator')||$('#answer'))?.focus({preventScroll:true});
 });
}
function submit(value=null,unknown=false) {
 if(!session||session.paused||session.phase!=='question')return;
 const q=session.q,written=writtenTask(q);
 const digits=$$('.column-digit');
 if(!unknown&&value===null){
  if(digits.length){
   session.digits=digits.map(input=>input.value);
   if(!session.digits.some(Boolean))return answerError('Add your answer.');
   value=Number(session.digits.map(digit=>digit||'0').join(''));
   if(written?.needsRemainder){
    const remainder=$('#division-remainder').value;
    if(!remainder)return answerError('Add the remainder. Use 0 if there is none.',$('#division-remainder'));
    value=`${value} r ${Number(remainder)}`;
   }
  }else if(q.format==='clock')value=[session.clockHour,session.clockMinute];
  else if(q.format==='plot')value=session.drawing;
  else if(q.format==='drawing')value=validDrawing(session.drawing,q.visual.sides);
  else if(q.format==='angle')value=session.angle;
  else if(q.format==='bars'){
   session.bars=$$('.bar-input').map(input=>input.value);
   if(session.bars.some(n=>n===''))return answerError('Set both bars.');
   value=session.bars.map(Number);
  }else if(takesFraction(q)){
   const submission=fractionSubmission(session.fractionParts,q.format==='mixed');
   if(submission.message)return answerError(submission.message,$(`#fraction-${submission.field}`));
   value=session.answer=submission.value;
  }else{
   session.answer=$('#answer')?.value.trim()||'';
   if(!session.answer)return answerError('Add your answer.');
   if(!['pair','choice','remainder'].includes(q.format)&&!Number.isFinite(parseNumber(session.answer)))return answerError('Use a number.');
   value=session.answer;
  }
 }else if(!unknown)session.answer=String(value);
 const p=player(),correct=!unknown&&answerMatches(q,value),assisted=session.assisted,now=Date.now();
 const missionBefore=missionProgress(session.mission,session.rows,session.bestStreak);
 session.attempts++;session.correct+=Number(correct);session.streak=correct&&!assisted?session.streak+1:0;
 session.bestStreak=Math.max(session.bestStreak,session.streak);
 const earned=earnedXP(correct,assisted,session.streak);
 const candidate=rewardCandidate(p,q,session,{correct,assisted,now});
 session.points+=earned;session.careerPending=(session.careerPending||0)+candidate;
 const aim=session.aim;
 const targetHit=!!session.mission&&correct&&!assisted&&aim===spotlightZone(session.mission,session.attempts-1,session.aimSeed);
 const row={q:{...q},typed:value,correct,assisted,unknown,aim,targetHit,ms:Math.round(session.currentMs),earned,careerCandidate:candidate,reason:session.selection.reason,detail:session.selection.detail,newFact:!!session.selection.newFact};
 if(correct&&!assisted){
  const after=missionProgress(session.mission,[...session.rows,row],session.bestStreak);
  row.celebration=after?.complete&&!missionBefore?.complete?'MISSION WON!':session.streak===8?'METEOR!':session.streak===5?'FIREBALL!':session.streak===3?'HAT-TRICK!':targetHit?'TOP BINS!':session.rows.at(-1)?.correct===false?'COMEBACK!':'';
 }
 session.rows.push(row);
 recordLearning(p,q,correct,assisted,row.ms,session.id,now,session.selection.reason==='probe',unknown);
 if(session.selection.reason==='probe'){
  p.placementProgress=session.probeIndex;
  if(session.probeIndex>=probeIds(p).length)p.placementComplete=true;
 }
 if(!unknown&&!session.progressCheck&&!session.promotion&&(!correct||assisted))session.retries.push({q:{...q},at:session.attempts+2});
 session.phase='feedback';save();saveRound();renderQuestion();updateLive();paintPitch(!unknown);
 if(unknown){
  $('.feedback')?.scrollIntoView({block:'nearest'});
  $('[data-action="next"]')?.focus({preventScroll:true});
 }else sound(correct);
}

function answerError(message,input=$('#answer')){$('#answer-error').textContent=message;input?.focus();}
function startTick(){clearInterval(tickId);lastTick=performance.now();tickId=setInterval(()=>{if(!session||session.paused)return;const now=performance.now(),delta=Math.max(0,(now-lastTick)/1000);lastTick=now;const remaining=tickMatchClock(session,delta);if(session.phase==='question')session.currentMs+=delta*1000;if(remaining===0){finishMatch(true);return;}updateLive();if(now-lastSave>1100){saveRound();lastSave=now;}},150);}
// Keep the goal and celebration visible before clearing the question.
function afterGoal(advance){
 clearTimeout(goalTimer);
 goalTimer=setTimeout(advance,GOAL_FEEDBACK_MS);
}
function updateAim(){
 const mission=missionProgress(session.mission,session.rows,session.bestStreak);
 if(!mission)return;
 const done=session.phase==='feedback';
 const zone=spotlightZone(session.mission,Math.max(0,session.attempts-Number(done)),session.aimSeed);
 for(const button of $$('[data-action="aim"]')){
  const target=button.dataset.zone===zone;
  button.disabled=done;
  button.classList.toggle('spotlight',target);
  button.setAttribute('aria-label',`Aim ${button.dataset.zone}${target?' at the star':''}`);
  button.setAttribute('aria-pressed',String(button.dataset.zone===session.aim));
 }
 const arena=$('.match-pitch .penalty-view');
 arena.dataset.target=zone;arena.dataset.aim=session.aim||'';
 $('#match-mission').innerHTML=`<span>${icon(mission.complete?'check':'star',14)} ${mission.name}</span><span class="mission-pips" aria-label="${mission.value} of ${mission.goal}">${Array.from({length:mission.goal},(_,i)=>`<i class="${i<mission.value?'hit':''}"></i>`).join('')}</span>`;
}
function paintPitch(replay=false) {
 const arena=$('.penalty-view'),round=session;
 if(!arena||!round)return;
 const row=round.phase==='feedback'?round.rows.at(-1):null;
 const move=paintShot(arena,{question:session.q,correct:row?.unknown?undefined:row?.correct,attempt:session.attempts,streak:session.streak,celebration:player()?.look?.celebration,replay,aim:row?.aim,callout:row?.celebration});
 $('#move-caption').textContent=row?(row.unknown?'Coach’s turn':row.correct?row.celebration||move.label:'Coach has the replay'):session.mission?'Aim at the star':'Ready to shoot';
 const shot=round.attempts+Number(!row);
 const half=Math.ceil(round.target/2);
 $('#match-stage').textContent=shot===round.target?'Last shot':shot>half?'Second half':shot===half&&row?'Half-time':shot===1?'Kick-off':'First half';
 const sideline=$('#sideline-note');
 const scout=round.mission&&shot===half+Number(!row)?CLUBS.find(club=>!clubProgress(player(),club).eligible):null;
 sideline.hidden=!scout;
 if(scout)sideline.textContent=`Coach · ${scout.name} offer ${clubProgress(player(),scout).percent}%`;
 updateAim();
 $('.pitch-replay').hidden=!row||row.unknown;
 if(row?.correct&&!round.paused)afterGoal(()=>{
  if(session===round&&!round.paused&&round.phase==='feedback'&&round.rows.at(-1)===row)nextQuestion();
 });
}
function updateLive() {
 if(!session)return;
 const timer=matchTimer();
 const values={'live-goals':session.correct,'live-streak':session.streak,'live-time':timer.display,'timer-caption':timer.caption,'pad-time':timer.display,'pad-time-caption':timer.caption};
 for(const [id,value] of Object.entries(values)){const el=document.getElementById(id);if(el)el.textContent=value;}
 const earns=isCoachChallenge(player(),session);
 if($('#live-xp'))$('#live-xp').innerHTML=`${earns?session.careerPending||0:session.points}<small> ${earns?'XP to bank':'pts'}</small>`;
 $('#timer-box')?.classList.toggle('low',!session.progressCheck&&!timer.working&&timer.remaining<16&&session.phase==='question');
 $('#timer-box')?.classList.toggle('work-clock',timer.working);
 $('#timer-box')?.classList.toggle('clock-rest',session.phase==='feedback');
 if($('#shot-track'))$('#shot-track').innerHTML=shotTrack();
}

function pause(){if(!session)return;clearTimeout(goalTimer);session.paused=true;session.pausedEver=true;saveRound();showPauseOverlay();}
function showPauseOverlay(){if($('.paused'))return;$('.game-main').inert=true;$('.game-header').inert=true;const el=document.createElement('div');el.className='paused';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','pause-title');el.innerHTML=`<div class="pause-inner">${icon('whistle',58)}<div class="eyebrow" style="justify-content:center;margin-top:20px;color:var(--muted)">TIME OUT</div><h2 id="pause-title">TAKE A BREATHER.</h2><p>${esc(player().name)}’s match is saved.</p><button class="btn lime big" data-action="resume">PLAY ON ${icon('play',18)}</button><div class="pause-options"><button class="btn white" data-action="nav" data-view="home">Play menu</button>${readingButton()}<button class="btn white" data-action="finish">Finish</button></div></div>`;app.append(el);requestAnimationFrame(()=>$('[data-action=resume]',el).focus());}
function resume(){session.paused=false;$('.paused')?.remove();$('.game-main').inert=false;$('.game-header').inert=false;renderQuestion();paintPitch();startTick();saveRound();}
function resumeSaved(){
 const saved=savedRound();
 if(!saved)return;
 closeDialog();pendingMatch=null;result=null;session=saved;session.paused=false;
 renderGame();startTick();saveRound();scrollTo({top:0});
}
function finishMatch(complete,showResult=true) {
 if(!session)return;
 clearTimeout(goalTimer);clearInterval(tickId);window.speechSynthesis?.cancel();
 const p=player(),previousLevel=careerLevel(p),priorXP=careerXP(p),old=bestFor(session.recordKey);
 const before=new Set(medals(p).filter(x=>x[3]).map(x=>x[0]));
 const saved={...session,complete:complete&&session.attempts===session.target,endedAt:Date.now(),elapsed:Math.round(session.elapsed*10)/10};
 for(const key of ['q','selection','retries','seen','answer','digits','notes','drawing','bars','angle','currentMs','lastDigit','work','scratch','remainder','noteHistory','checkPlan','checkQuestions','clockElapsed','workTimeLeft'])delete saved[key];
 saved.previousBest=old?.points||0;saved.previousTime=old?.elapsed||0;
 saved.newRecord=newPersonalBest(saved,old);
 if(saved.attempts&&!p.sessions.some(match=>match.id===saved.id)){
  p.pointsTotal??=priorXP;
  saved.careerXP=bankCareerXP(p,saved);
  saved.ranked=isCoachChallenge(p,saved)&&eligibleRecord(saved)&&saved.careerXP>0;
  p.goalsTotal=totalGoals(p)+saved.correct;
  p.sessions=[...p.sessions,saved].slice(-500);
  if(saved.newRecord){p.records||={};p.records[saved.recordKey]={...saved,rows:[]};}
  recordLeague(p,saved);
  saved.promotionResult=checkPromotion(p,saved);
  saved.newClubs=careerNews(p,previousLevel);
  saved.creditsEarned=Math.floor(careerXP(p)/10)-Math.floor(priorXP/10);
  saved.medals=medals(p).filter(x=>x[3]&&!before.has(x[0])).map(x=>({name:x[0],symbol:x[2]}));
  save();
 }
 draftRounds.delete(p.id);session=null;result=showResult?saved:null;saveRound();
 if(!showResult)return;
 renderResult();
 if(saved.newRecord&&!data.settings.reduceMotion)confetti();
}

function renderResult(){const r=result,p=player(),mission=missionProgress(r.mission,r.rows,r.bestStreak),accuracy=r.attempts?Math.round(r.correct/r.attempts*100):0,stars=r.complete&&r.attempts>=5?(accuracy>=95?3:accuracy>=80?2:accuracy>=60?1:0):0,errors=[...new Map(r.rows.filter(x=>!x.correct||x.assisted).map(x=>[x.q.key,x])).values()];
 app.innerHTML=`<div class="game-shell">${header(true)}<main id="main" class="results"><div class="result-symbol">${icon(r.newRecord?'trophy':'ball',55)}</div><div class="eyebrow">${r.progressCheck?'Progress check':r.mode==='check'?(r.complete?'Warm-up complete':'Warm-up saved'):'Match report'}</div><h1>${r.promotionResult?.promoted?r.promotionResult.graduated?'Academy graduate!':`Promoted to Year ${r.promotionResult.to}!`:r.newRecord?'New record!':r.complete?'Full time.':'Match saved.'}</h1><p>${r.progressCheck?`${r.rows.filter(row=>row.correct&&!row.assisted).length} on your own · ${r.rows.filter(row=>!row.correct||row.assisted).length} to practise`:r.mode==='check'?(r.complete?'Coach now has a starting point.':'Your warm-up is saved. Keep going next time.'):r.correct>=8?'Great play, '+esc(p.name)+'.':'Every shot is training.'}</p>${r.complete&&mission?.complete?`<div class="mission-won">${icon('star',17)} ${mission.name} complete</div>`:''}${r.creditsEarned?`<div class="credits-earned">● +${r.creditsEarned} credits earned</div>`:''}${r.newClubs?.length?`<button class="club-offer-banner" data-action="result-locker">${icon('book',18)}New club offer: ${esc(r.newClubs.map(c=>c.name).join(' / '))}${icon('arrow',15)}</button>`:''}${r.newRecord?`<div class="record-banner">${icon('trophy',17)} ${r.points} pts · ${r.previousBest?(r.points===r.previousBest?`${(r.previousTime-r.elapsed).toFixed(1)}s FASTER`:`+${r.points-r.previousBest} ON YOUR BEST`):'FIRST PERSONAL BEST'}</div>`:''}<div class="stars" aria-label="${stars} out of 3 accuracy stars">${[1,2,3].map(n=>`<span class="${n<=stars?'':'off'}">${icon('star',31).replace('fill="none"',n<=stars?'fill="currentColor"':'fill="none"')}</span>`).join('')}</div><div class="result-metrics"><div><strong>${r.correct}/${r.attempts}</strong><small>goals</small></div><div><strong>${r.careerXP||0}</strong><small>career XP</small></div><div><strong>${accuracy}%</strong><small>accuracy</small></div><div><strong>${r.bestStreak}</strong><small>best streak</small></div></div><div class="level-line" style="max-width:380px;margin:22px auto 0"><strong>LEVEL ${level(p)}</strong><span>${Math.floor(levelProgress(p).current)}/${levelProgress(p).needed} XP</span></div><div class="xp" style="max-width:380px;margin:9px auto"><i style="width:${levelProgress(p).percent}%"></i></div><div class="result-buttons"><button class="btn lime big" data-action="next-match">${r.progressCheck?'Coach match':r.mode==='check'?(p.placementComplete?'Start training':'Continue warm-up'):'Next match'} ${icon('arrow',18)}</button><button class="btn white big" data-action="result-locker">${icon('shop',18)} Shop</button><button class="btn white big" data-action="result-home">Clubhouse</button></div>${goalsMarkup(p,true)}${r.manual?'<p class="muted">Free practice saves goals and recall. Play a Coach match to earn credits.</p>':!r.complete&&r.careerPending?'<p class="muted">Progress saved. Finish every shot in a Coach match to bank XP.</p>':''}${r.medals?.length?`<section class="panel"><h3>New medals</h3><div class="badge-grid">${r.medals.map(m=>`<div class="badge"><span class="badge-icon">${icon(m.symbol,24)}</span><b>${esc(m.name)}</b></div>`).join('')}</div></section>`:''}${errors.length?`<section class="panel"><h3>Back on the training ground</h3><div class="result-review">${errors.slice(0,5).map(x=>`<button data-action="review-example" data-key="${esc(x.q.key)}"><span>${mathText(equationLabel(x.q,false))}</span><span>${icon('whistle',18)}</span></button>`).join('')}</div></section>`:''}<section class="panel"><h3>${r.mode==='check'?'Coach’s next move':'Keep your match fitness'}</h3><p>${r.mode==='check'?'Your next round targets gaps in the warm-up. Facts you know return later.':'Mistakes get a replay. Other facts return on later days.'}</p><button class="text-btn" data-action="how" style="margin-top:10px">How Coach picks ${icon('arrow',13)}</button></section></main></div>`;scrollTo({top:0});}
function sound(good){if(!data.settings.sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(good?600:300,audio.currentTime);o.frequency.linearRampToValueAtTime(good?820:340,audio.currentTime+.12);g.gain.setValueAtTime(.03,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.22);o.start();o.stop(audio.currentTime+.24);}catch{}}
function confetti(){const e=document.createElement('div');e.className='confetti';e.setAttribute('aria-hidden','true');e.innerHTML=Array.from({length:32},(_,i)=>`<i style="left:${Math.random()*100}%;background:${['#d4f36a','#739e5e','#d6b76b','#7a9bdc'][i%4]};animation-delay:${Math.random()*.4}s;--drift:${Math.random()*180-90}px"></i>`).join('');document.body.append(e);setTimeout(()=>e.remove(),2700);}
function speak(text){if(!('speechSynthesis'in window)){toast('Read-aloud is unavailable on this device.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(spokenMath(text)),voice=selectBritishVoice(voices,data.settings.voiceURI);if(voice)u.voice=voice;else if(!speak.warned){toast('No British voice is installed. This device will choose the voice.');speak.warned=true;}u.lang='en-GB';u.rate=data.settings.speechRate||.9;speechSynthesis.speak(u);}

function openDialog(content,{wide=false,focus=null}={}){returnFocus=document.activeElement;modalRoot.innerHTML=`<div class="dialog-backdrop"><section class="dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><button class="icon-btn close-dialog" data-action="close-dialog" aria-label="Close">${icon('close',17)}</button>${content}</section></div>`;app.inert=true;requestAnimationFrame(()=>$(focus||'.dialog button,.dialog input,.dialog select,.dialog',modalRoot)?.focus());}
function closeDialog(){if(!modalRoot.firstChild)return;shownExample=null;modalRoot.innerHTML='';app.inert=false;if(returnFocus?.isConnected)returnFocus.focus();}
function profileForm(id=null){const p=data.profiles.find(x=>x.id===id),y=p?.year||year||1;openDialog(`<span class="eyebrow">${p?'Your player':'Join the academy'}</span><h2 id="dialog-title">${p?'Edit player':'Build your player'}</h2><form id="profile-form" data-id="${p?.id||''}"><div class="profile-builder"><div id="profile-preview">${avatarSVG(p||{look:{}},{size:145})}</div><div><div class="field-row"><label for="player-name">Nickname</label><input class="field" id="player-name" maxlength="24" required autocomplete="off" value="${esc(p?.name||'')}" placeholder="Your nickname"></div><div class="field-row"><label for="player-year">Practice year</label><select class="field" id="player-year">${Array.from({length:6},(_,i)=>i+1).map(n=>`<option value="${n}" ${y===n?'selected':''}>Year ${n}</option>`).join('')}</select></div><details class="profile-options" ${p?'open':''}><summary>Kit and style</summary><div class="custom-fields"><label>Kit number<input class="field" id="player-number" inputmode="numeric" type="number" min="1" max="99" value="${p?.look?.number||9}" required></label><label>Position<select class="field" id="player-position">${POSITIONS.map(n=>`<option ${p?.look?.position===n?'selected':''}>${n}</option>`).join('')}</select></label></div><label class="voice-field" for="player-skin">Skin tone<select class="field" id="player-skin">${Object.keys(SKIN_TONES).map(n=>`<option value="${n}" ${(p?.look?.skin||'warm')===n?'selected':''}>${n}</option>`).join('')}</select></label><div class="field-row"><label for="training-clock">Match pace</label><select class="field" id="training-clock"><option value="120" ${!p||!p.trainingSeconds||p.trainingSeconds===120?'selected':''}>Match pace · 2 minutes</option><option value="180" ${p?.trainingSeconds===180?'selected':''}>Steady pace · 3 minutes</option><option value="60" ${p?.trainingSeconds===60?'selected':''}>Sprint pace · 1 minute</option></select></div></details></div></div><div class="field-error" id="profile-error" role="alert"></div><div class="dialog-actions">${p?`<button type="button" class="text-btn text-danger" data-action="delete-player" data-id="${p.id}" style="margin-right:auto">Delete player</button>`:''}<button class="btn lime" type="submit">${p?'Save':'Create & play'}${icon('arrow',17)}</button></div></form>`,{focus:'#player-name'});}
function showHow(){const plan=planSummary(player());openDialog(`<div class="eyebrow" style="color:var(--muted);margin-bottom:10px">YOUR TRAINING PLAN</div><h2 id="dialog-title">Coach picks the next shot.</h2><div class="records">${plan.map((x,i)=>`<div class="record"><span class="domain-number">${i+1}</span><div><b>${esc(shortTitle(skillById(x.id)))}</b><small>${esc(x.why)}</small></div></div>`).join('')}</div><div class="coach-note">Choose “I don’t know” to see the working. Coach can then practise a step that leads back to that skill. Facts you know return on later days.</div><div class="dialog-actions"><button class="btn" data-action="close-dialog">Got it ${icon('check',16)}</button></div>`);}
function showReport(id){const p=data.profiles.find(x=>x.id===id);if(p)openDialog(reportContent(p),{wide:true});}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function csv(p){const rows=[['Player','Date','Match','Goals','Shots','XP','Seconds','Complete','Hints','Paused'],...p.sessions.map(s=>[p.name,new Date(s.endedAt).toISOString(),s.mode==='check'?'Warm-up':recordLabel(s),s.correct,s.attempts,s.careerXP??s.points,s.elapsed,s.complete,s.hintsUsed,s.pausedEver])];return rows.map(row=>row.map(v=>{let s=String(v);if(/^[=+@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
function restoreFile(file){if(file.size>20*1024*1024){toast('Choose a backup under 20 MB.');return;}file.text().then(text=>{pendingImport=validateImport(JSON.parse(text));for(const p of pendingImport.profiles){initLearning(p);initCareer(p);initRewards(p);initLeague(p);}openDialog(`<h2 id="dialog-title">Restore ${pendingImport.profiles.length} players?</h2><p>This replaces the squad and results currently saved in this browser. Download a backup first if you want to keep them.</p><div class="dialog-actions"><button class="btn white" data-action="close-dialog">Cancel</button><button class="btn" data-action="confirm-import">Restore squad</button></div>`);}).catch(err=>toast(err.message||'Could not read that backup.'));}
function editPadField(field,key,roll=false){
 const max=field.maxLength>0?field.maxLength:24;
 if(key==='clear')field.value='';
 else if(key==='back')field.value=field.value.slice(0,-1);
 else field.value=roll?(field.value+key).slice(-max):(field.value+key).slice(0,max);
 field.focus({preventScroll:true});
 field.dispatchEvent(new Event('input',{bubbles:true}));
}
function pressKeypad(key){
 if(key==='shoot'){($('#answer-form')||$('#world-answer-form'))?.requestSubmit();return;}
 if(!session){
  const field=$('#world-answer-form input');
  if(field&&!world.busy)editPadField(field,key);
  return;
 }
 if(session.paused||session.phase!=='question')return;
 const selected=lastPadField?.isConnected&&!lastPadField.disabled?lastPadField:null;
 if(session.fractionParts){
  const field=selected?.matches('[data-fraction-part]')?selected:$('#fraction-whole')||$('#fraction-numerator');
  if(field)editPadField(field,key);
  return;
 }
 if(session.q.key.startsWith('column')||writtenTask(session.q)){
  const note=selected?.matches('.column-note,.work-note')?selected:null;
  if(note){
   editPadField(note,key,true);
   return;
  }
  const digits=$$('.column-digit');
  const start=Number($('[data-start-digit]')?.dataset.digit??digits.length-1);
  const direction=$('.division-board')?1:-1;
  let i=session.lastDigit??start;
  if(key==='clear'){digits.forEach(input=>input.value='');i=start;}
  else if(key==='back'){
   if(!digits[i].value&&digits[i-direction])i-=direction;
   digits[i].value='';
  }else if(/^\d$/.test(key)){
   digits[i].value=key;
   if(digits[i+direction])i+=direction;
  }
  session.digits=digits.map(input=>input.value);
  digits[i].focus({preventScroll:true});
  saveRound();
 }else{
  const field=$('#answer')||$$('.bar-input')[session.lastBar??0];
  if(field)editPadField(field,key);
 }
}
function handleTouchAnswerKey(event) {
 if(!event.target.hasAttribute?.('data-touch-answer')||event.ctrlKey||event.metaKey||event.altKey)return false;
 const key={Enter:'shoot',Backspace:'back',Delete:'clear','-':'−'}[event.key]??event.key;
 const buttons=$$('#keypad button');
 if(!buttons.some(button=>button.dataset.key===key&&!button.hidden))return false;
 event.preventDefault();
 pressKeypad(key);
 return true;
}
function handleClick(event){const b=event.target.closest('[data-action]');if(!b||b.disabled)return;event.preventDefault();switch(b.dataset.action){
 case 'home':navigate('home');break;
 case 'nav':navigate(b.dataset.view);break;
 case 'players':parkMatch();pendingSkill=null;data.activeId=null;save();navigate('players');break;
 case 'choose-player':
  data.activeId=b.dataset.id;year=player().year;save();
  if(!pendingSkill&&savedRound())resumeSaved();else startMatch(pendingSkill);
  pendingSkill=null;break;
 case 'new-player':profileForm();break;
 case 'first-shot':takeFirstShot(Number(b.dataset.answer));break;
 case 'first-shot-next':
  if(firstShot.goal){
   firstShot.index=(firstShot.index+1)%firstShots.length;
   firstShot.goal=false;
   $('.first-shot').outerHTML=firstShotView(firstShot);
   $('[data-action="first-shot"]')?.focus({preventScroll:true});
  }
  break;
 case 'edit-player':profileForm(b.dataset.id);break;
 case 'delete-player':{const p=data.profiles.find(x=>x.id===b.dataset.id);openDialog(`<h2 id="dialog-title">Delete ${esc(p.name)}?</h2><p>This removes this player’s progress from this browser. Back up first if you want to keep it.</p><div class="dialog-actions"><button class="btn white" data-action="close-dialog">Keep player</button><button class="btn danger" data-action="confirm-delete" data-id="${p.id}">Delete player</button></div>`);break;}
 case 'confirm-delete':data.profiles=data.profiles.filter(p=>p.id!==b.dataset.id);draftRounds.delete(b.dataset.id);if(data.activeId===b.dataset.id)data.activeId=null;save();saveRound();closeDialog();render();toast('Player removed.');break;
 case 'browse':year=data.activeId?player().year:1;navigate('syllabus');break;
 case 'play':startMatch();break;
 case 'resume-saved':resumeSaved();break;
 case 'start-fresh':{
  if(!pendingMatch||!savedRound())break;
  const {manual,options}=pendingMatch;pendingMatch=null;
  session=savedRound();finishMatch(false,false);startMatch(manual,options);break;
 }
 case 'open-tables':navigate('tables');break;
 case 'open-units':
  if(view!=='syllabus')year=player()?.year||year;
  domain='all';search='';navigate('syllabus');break;
 case 'open-shop':navigate('locker');break;
 case 'open-league':navigate('league');break;
 case 'world-league':navigate('world');break;
 case 'world-tier':if(!world.busy){world.tier=Number(b.dataset.tier);world.loaded=false;render();}break;
 case 'world-join':joinWorld();break;
 case 'world-refresh':if(!world.busy){world.loaded=false;render();}break;
 case 'world-leave':openDialog(`<h2 id="dialog-title">Leave the World League?</h2><p>Your ranked alias and scores will be removed. You can rejoin with a new alias.</p><div class="dialog-actions"><button class="btn white" data-action="close-dialog">Back</button><button class="btn danger" data-action="world-confirm-leave">Leave league</button></div>`);break;
 case 'world-confirm-leave':closeDialog();leaveWorld();break;
 case 'world-start':startWorld();break;
 case 'world-next':nextWorld();break;
 case 'world-board':clearTimeout(goalTimer);clearInterval(worldTimer);world.match=null;world.feedback=null;world.loaded=false;render();scrollTo({top:0});break;
 case 'open-written':if(view!=='syllabus')year=player().year;domain='calculation';search='';navigate('written');break;
 case 'appearance':openDialog(appearanceView(player()),{wide:true});break;
 case 'shop-hair':shopSlot='hair';navigate('locker');break;
 case 'club-path':openDialog(clubJourneyView(player()));break;
 case 'example':showSkillExample(b.dataset.skill);break;
 case 'support-practice':data.activeId=b.dataset.profile;closeDialog();startMatch(b.dataset.skill);break;
 case 'table-challenge':startMatch(null,{tableChallenge:true});break;
 case 'progress-check':startMatch(null,{progressCheck:true});break;
 case 'replay-shot':if(session?.phase==='feedback')paintPitch(true);break;
 case 'aim':
  if(session?.phase==='question'&&!session.paused&&session.mission&&AIM_ZONES.includes(b.dataset.zone)){
   session.aim=b.dataset.zone;updateAim();saveRound();
  }
  break;
 case 'skill':if(!data.activeId){closeDialog();pendingSkill=b.dataset.skill;view='players';render();scrollTo({top:0});}else startMatch(b.dataset.skill);break;
 case 'domain': {
  domain=domain===b.dataset.domain?'all':b.dataset.domain;
  search='';render();
  if(domain!=='all'){
   const bank=$('#syllabus-bank');
   bank?.focus({preventScroll:true});
   bank?.scrollIntoView({block:'start'});
  }
  break;
 }
 case 'table-map':tableView=Number(b.dataset.table);$('#table-tracker-host')?$('#table-tracker-host').innerHTML=factMapMarkup(player(),tableView):render();break;
 case 'reading':data.settings.dyslexia=!data.settings.dyslexia;save();applyAccessPreferences();if(!session&&!result)render();break;
 case 'shop-tab':shopSlot=b.dataset.slot;render();break;
 case 'buy':{const bought=buyItem(player(),b.dataset.item);if(bought.ok){equipItem(player(),b.dataset.item);save();render();}toast(bought.message);break;}
 case 'equip':if(equipItem(player(),b.dataset.item)){save();render();}break;
 case 'wear-number':{
  const item=itemById(b.dataset.item),p=player();
  if(item?.number&&p&&owns(p,item)){p.look.number=item.number;save();render();}
  break;
 }
 case 'skin':if(SKIN_TONES[b.dataset.value]){player().look.skin=b.dataset.value;save();render();}break;
 case 'hair-colour':if(HAIR_COLOURS[b.dataset.value]){player().look.hairColour=b.dataset.value;save();render();}break;
 case 'club':if(chooseClub(player(),b.dataset.club)){save();closeDialog();render();toast('Your new club is ready.');}break;
 case 'league-period':leaguePeriod=b.dataset.period;render();break;
 case 'gym-table':gym.table=b.dataset.table==='all'?'all':Number(b.dataset.table);render();break;
 case 'gym-mode':gym.mode=b.dataset.mode;render();break;
 case 'gym-length':gym.length=Number(b.dataset.length);render();break;
 case 'gym-play':{const choices=focusTables(player().year),table=gym.table||choices[0],id=table==='all'?(player().year===2?'mix2510':player().year===3?'mix348':'mixAll'):`table${table}`;startMatch(id,{tableMode:gym.mode,length:gym.length});break;}
 case 'view-year':year=Number(b.dataset.year);domain='all';search='';navigate('syllabus');break;
 case 'promotion-info':showPromotion();break;
 case 'promotion':if(yearProgress(player()).eligible)startMatch(null,{promotion:true});else showPromotion();break;
 case 'news':showNews();break;
 case 'result-locker':result=null;navigate('locker');break;
 case 'news-locker':closeDialog();navigate('locker');break;
 case 'voice-test':speak('One hundred and twenty-six. Three quarters. Eight plus five equals thirteen.');break;
 case 'plot-point':if(session&&session.phase==='question'){const point=[Number(b.dataset.x),Number(b.dataset.y)],index=session.drawing.findIndex(p=>p[0]===point[0]&&p[1]===point[1]);if(index>=0)session.drawing.splice(index,1);else if(session.drawing.length<session.q.answer.length)session.drawing.push(point);saveRound();renderQuestion();}break;
 case 'sound':data.settings.sound=!data.settings.sound;save();sound(true);if(!session&&!result)render();else toast(`Sound ${data.settings.sound?'on':'off'}`);break;
 case 'hear':if(session)speak(`${questionPrompt(session.q)}. ${session.q.expression!==undefined?session.q.expression:coreExpression(session.q)}`);break;
 case 'hear-help':{const q=session?.q||shownExample;if(q)speak(workingText(q)||(q.hint||explain(q).steps).join('. '));else if(modalRoot.dataset.question)speak(modalRoot.dataset.question);break;}
 case 'hint':if(session?.phase==='question'){
  if(!session.assisted){session.assisted=true;session.hintsUsed++;revealFact(player(),session.q);save();saveRound();renderQuestion();}
  requestAnimationFrame(()=>$('.help-box')?.scrollIntoView({block:'nearest'}));
 }break;
 case 'answer-choice':submit(b.dataset.value);break;
 case 'dont-know':submit(null,true);break;
 case 'next':if(session?.phase==='feedback'&&!session.paused)nextQuestion();break;
 case 'key':pressKeypad(b.dataset.key);break;
 case 'fraction-whole':if(session?.phase==='question'&&!session.paused&&session.fractionParts){
  const parts=session.fractionParts;
  parts.whole=parts.whole===null?'':null;
  saveRound();renderQuestion();
  ($('#fraction-whole')||$('#fraction-numerator'))?.focus();
 }break;
 case 'draw-point':if(session&&session.phase==='question'){const point=[Number(b.dataset.x),Number(b.dataset.y)],idx=session.drawing.findIndex(p=>p[0]===point[0]&&p[1]===point[1]);if(idx>=0)session.drawing.splice(idx,1);else if(session.drawing.length<session.q.visual.sides)session.drawing.push(point);saveRound();renderQuestion();}break;
 case 'draw-undo':if(session){session.drawing.pop();renderQuestion();saveRound();}break;
 case 'draw-clear':if(session){session.drawing=[];renderQuestion();saveRound();}break;
 case 'pause':pause();break;
 case 'resume':resume();break;
 case 'finish':finishMatch(false);break;
 case 'result-home':result=null;navigate('home');break;
 case 'next-match':{const manual=result?.manual||null,options=manual?{tableMode:result.tableMode,length:result.target}:{tableChallenge:result?.tableChallenge};startMatch(manual,options);break;}
 case 'review-example':{const q=result.rows.find(r=>r.q.key===b.dataset.key).q;modalRoot.dataset.question=(q.hint||explain(q).steps).join('. ');openDialog(`<h2 id="dialog-title">COACH’S REPLAY</h2><div class="q-prompt" style="margin-top:25px">${esc(questionPrompt(q))}</div><div class="q-equation compact">${mathText(equationLabel(q,true))}</div>${q.visual?diagram(q.visual):''}${helpMarkup(q)}<div class="dialog-actions"><button class="btn" data-action="close-dialog">Got it ${icon('check',15)}</button></div>`);break;}
 case 'how':showHow();break;
 case 'report':showReport(b.dataset.id);break;
 case 'close-dialog':closeDialog();break;
 case 'backup':download(JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2),`Matchday_Maths_Backup_${localDay()}.json`,'application/json');toast('Backup downloaded.');break;
 case 'import':$('#import-file').click();break;
 case 'confirm-import':data=validateImport(pendingImport);for(const p of data.profiles){initLearning(p);initCareer(p);initRewards(p);initLeague(p);}pendingImport=null;session=null;draftRounds.clear();saveRound();save();closeDialog();view='coach';render();toast('Squad restored.');break;
 case 'export-csv':{const p=b.dataset.id?data.profiles.find(x=>x.id===b.dataset.id):player();download(csv(p),`Matchday_${p.name.replace(/[^a-z0-9]/gi,'_')}_Scores.csv`,'text/csv;charset=utf-8');break;}
 }}
 document.addEventListener('click',handleClick);
 document.addEventListener('submit',event=>{if(event.target.id==='world-answer-form'){event.preventDefault();submitWorld(new FormData(event.target).get('answer'));return;}if(event.target.id==='answer-form'){event.preventDefault();submit();}if(event.target.id==='profile-form'){event.preventDefault();const id=event.target.dataset.id,name=$('#player-name').value.trim(),y=Number($('#player-year').value),number=Number($('#player-number').value),position=$('#player-position').value,skin=$('#player-skin').value;if(!name)return $('#profile-error').textContent='Add a nickname.';if(!Number.isInteger(number)||number<1||number>99)return $('#profile-error').textContent='Choose a kit number from 1 to 99.';if(data.profiles.some(p=>p.id!==id&&p.name.toLowerCase()===name.toLowerCase()))return $('#profile-error').textContent='That nickname is already in the squad.';const trainingSeconds=Number($('#training-clock').value);if(id){const p=data.profiles.find(p=>p.id===id);if(p.year!==y){const saved=draftRounds.get(p.id);if(saved){session=saved;finishMatch(false,false);}initRewards(p);p.placementComplete=false;p.placementProgress=0;}p.name=name;p.year=y;initRewards(p);p.trainingSeconds=trainingSeconds;initCareer(p);Object.assign(p.look,{number,position,skin});save();closeDialog();render();}else{const p=newProfile(name,y,'sprout');initLearning(p);initCareer(p);initRewards(p);Object.assign(p.look,{number,position,skin});p.trainingSeconds=trainingSeconds;data.profiles.push(p);data.activeId=p.id;year=y;save();closeDialog();startMatch(pendingSkill);pendingSkill=null;}}});
 document.addEventListener('input',event=>{const el=event.target;
  if(el.matches('#world-answer-form input')){world.answer=el.value;return;}
  if(session?.phase==='question'&&el.dataset.fractionPart){
   session.fractionParts[el.dataset.fractionPart]=el.value;
   $('#answer-error').textContent='';
   saveRound();return;
  }
  if(['player-number','player-position','player-skin'].includes(el.id)){profilePreview();}if(el.id==='answer'&&session){el.value=el.value.replace(/[^0-9.,/:()r\s−-]/g,'').slice(0,24);session.answer=el.value;saveRound();}if(el.classList?.contains('column-digit')&&session){el.value=el.value.replace(/\D/g,'').slice(-1);session.digits=$$('.column-digit').map(x=>x.value);if(el.value){const next=$(`#digit-${Number(el.dataset.digit)+($('.division-board')?1:-1)}`);if(next){session.lastDigit=Number(next.dataset.digit);next.focus();next.select();}}saveRound();}if(el.classList?.contains('column-note')&&session){const i=Number(el.dataset.note);el.value=el.value.replace(/\D/g,'').slice(0,session.q.op==='+'?1:2);session.notes[i]=el.value;document.querySelector(`[data-original="${i}"]`)?.classList.toggle('crossed',session.q.op==='−'&&el.value!=='');saveRound();}if(session&&el.matches('.work-note')){el.value=el.value.replace(/\D/g,'').slice(0,el.maxLength);session.work||={};if(el.dataset.work)session.work[el.dataset.work]=el.value;else session.remainder=el.value;saveRound();}if(session&&el.id==='scratch-work'){session.scratch=el.value.slice(0,1000);saveRound();}if(el.classList?.contains('bar-input')&&session){session.bars[Number(el.dataset.bar)]=el.value;const bar=$(`#bar-view-${el.dataset.bar}`);if(bar)bar.style.height=`${Math.min(20,Math.max(0,Number(el.value)))*5}px`;saveRound();}if(el.id==='angle-control'&&session){session.angle=Number(el.value);const current=$('.math-visual',$('#question-host'));if(current){const holder=document.createElement('div');holder.innerHTML=diagram(session.q.visual,{angle:session.angle});current.replaceWith(holder.firstElementChild);}saveRound();}if(el.id==='skill-search'){search=el.value;$('#syllabus-bank').innerHTML=syllabusBank(data.activeId?player():null,year,domain,search);}});
 document.addEventListener('focusin',event=>{if(event.target.matches?.(padFields))lastPadField=event.target;if(event.target.classList?.contains('bar-input')&&session)session.lastBar=Number(event.target.dataset.bar);if(event.target.classList?.contains('column-digit')&&session){session.lastDigit=Number(event.target.dataset.digit);event.target.select();}});
 document.addEventListener('change',event=>{const el=event.target;if(el.dataset.practical){const p=data.profiles.find(p=>p.id===el.dataset.profile);if(p){p.practical[el.dataset.practical]=el.checked;save();}return;}if(['kit-hair','kit-pattern','kit-hair-colour','kit-skin','kit-trim','kit-theme'].includes(el.id)){const p=player();if(!p)return;const value=el.value;if(el.id==='kit-hair'||el.id==='kit-pattern')equipItem(p,value);else{const [slot,choices]=({'kit-hair-colour':['hairColour',HAIR_COLOURS],'kit-skin':['skin',SKIN_TONES],'kit-trim':['trim',KIT_TRIMS],'kit-theme':['theme',PLAYER_THEMES]})[el.id];if(Object.hasOwn(choices,value))p.look[slot]=value;}save();render();if($('#appearance-preview'))$('#appearance-preview').innerHTML=avatarSVG(p,{size:155});}if(el.id==='kit-number'){const n=Number(el.value);if(Number.isInteger(n)&&n>=1&&n<=99){player().look.number=n;save();render();if($('#appearance-preview'))$('#appearance-preview').innerHTML=avatarSVG(player(),{size:155});}else{el.value=player().look.number;toast('Choose a number from 1 to 99.');}}if(el.id==='kit-position'&&POSITIONS.includes(el.value)){player().look.position=el.value;save();render();if($('#appearance-preview'))$('#appearance-preview').innerHTML=avatarSVG(player(),{size:155});}if(el.id==='unit-year'){year=Number(el.value);domain='all';search='';render();$('#unit-year')?.focus({preventScroll:true});return;}if(el.id==='league-year'){leagueYear=Number(el.value);render();}if(el.id==='dyslexia-setting'){data.settings.dyslexia=el.checked;save();applyAccessPreferences();}if(el.id==='auto-read'){data.settings.autoRead=el.checked;save();}if(el.id==='british-voice'){data.settings.voiceURI=el.value;save();}if(el.id==='speech-rate'){data.settings.speechRate=Number(el.value);save();}if(['player-position','player-skin'].includes(el.id))profilePreview();if(session&&['clock-hour','clock-minute'].includes(el.id)){session.clockHour=Number($('#clock-hour').value);session.clockMinute=Number($('#clock-minute').value);const current=$('.math-visual',$('#question-host'));if(current){const holder=document.createElement('div');holder.innerHTML=diagram(session.q.visual,{hour:session.clockHour,minute:session.clockMinute});current.replaceWith(holder.firstElementChild);}saveRound();}if(event.target.id==='reduce-motion'){data.settings.reduceMotion=event.target.checked;document.body.classList.toggle('reduce-motion',event.target.checked);save();}if(event.target.id==='import-file'){const file=event.target.files?.[0];if(file)restoreFile(file);event.target.value='';}});
 document.addEventListener('keydown',event=>{const container=modalRoot.firstChild?modalRoot:session?.paused?$('.paused'):null;if(container){if(event.key==='Escape'&&container===modalRoot){event.preventDefault();closeDialog();return;}if(event.key==='Tab'){const controls=$$('button:not([disabled]),input:not([hidden]):not([disabled]),select,a[href],[tabindex="0"]',container).filter(e=>e.offsetParent!==null);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}return;}if(handleTouchAnswerKey(event))return;if(session&&!session.paused){if(event.key==='Escape'){event.preventDefault();pause();return;}if(event.key==='Enter'&&session.phase==='feedback'){event.preventDefault();nextQuestion();}if(event.target.classList?.contains('column-digit')){const i=Number(event.target.dataset.digit);if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();$(`#digit-${i+(event.key==='ArrowLeft'?-1:1)}`)?.focus();}if(event.key==='Backspace'&&event.target.value===''){event.preventDefault();$(`#digit-${i+1}`)?.focus();}}}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&session&&!session.paused)pause();});
 window.addEventListener('pagehide',()=>{clearTimeout(goalTimer);if(session){session.paused=true;session.pausedEver=true;saveRound();}save();});

function readingButton(){
 return `<button class="btn white reading-preference ${data.settings.dyslexia?'on':''}" data-action="reading" aria-pressed="${!!data.settings.dyslexia}">Reading mode</button>`;
}
function applyAccessPreferences(){document.body.dataset.playerTheme=player()?.look?.theme||'pitch';document.body.classList.toggle('reduce-motion',!!data.settings.reduceMotion);document.body.classList.toggle('reading-mode',!!data.settings.dyslexia);$$('[data-action="reading"]').forEach(b=>{b.setAttribute('aria-pressed',String(!!data.settings.dyslexia));b.classList.toggle('on',!!data.settings.dyslexia);});}
function profilePreview(){const id=$('#profile-form')?.dataset.id,old=data.profiles.find(p=>p.id===id),p={...(old||{}),look:{...(old?.look||{})}};initCareer(p);p.look.number=Math.max(1,Math.min(99,Number($('#player-number')?.value)||9));p.look.position=$('#player-position')?.value||'Striker';p.look.skin=$('#player-skin')?.value||'warm';if($('#profile-preview'))$('#profile-preview').innerHTML=avatarSVG(p,{size:145});}
function showPromotion(){const p=player();if(!p)return profileForm();const progress=yearProgress(p),missing=progress.skills.filter(s=>!s.secure);openDialog(`<span class="eyebrow">Academy Year ${p.year}</span><h2 id="dialog-title">Your promotion goals</h2><div class="promotion-counts"><b>${progress.secure}/${progress.total}<small>Families match fit</small></b><b>${progress.checked}/${progress.practical.length}<small>Practical checks</small></b></div>${progress.eligible?'<p>Your 12-shot promotion match is ready. Aim for at least 90% independent accuracy.</p>':`<p>Keep showing independent recall on later days. A grown-up records practical work in Year goals.</p><div class="promotion-missing">${missing.slice(0,8).map(s=>`<span>${icon('ball',14)}${esc(s.title)}</span>`).join('')}${missing.length>8?`<small>And ${missing.length-8} more families on your year map.</small>`:''}</div>`}<div class="dialog-actions"><button class="btn white" data-action="close-dialog">Back</button>${progress.eligible?'<button class="btn lime" data-action="promotion">Play promotion match</button>':`<button class="btn" data-action="close-dialog">Keep training</button>`}</div>`);}
function showNews(){const p=player();if(!p)return;initCareer(p);p.inbox.forEach(n=>n.read=true);save();openDialog(`<span class="eyebrow">Your game career</span><h2 id="dialog-title">Academy news</h2><div class="academy-news">${p.inbox.length?[...p.inbox].reverse().map(n=>`<article>${icon(n.kind==='promotion'?'trophy':'book',25)}<div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><small>${new Date(n.at).toLocaleDateString('en-GB')}</small></div></article>`).join(''):'<p>Your club offers and year-promotion notes will appear here.</p>'}</div><div class="dialog-actions"><button class="btn white" data-action="close-dialog">Done</button><button class="btn" data-action="news-locker">Locker room</button></div>`);}
function plotMarkup(v,done,points=session.drawing||[]){const lo=v.min||0,hi=v.max||8,scale=240/(hi-lo),xx=n=>35+(n-lo)*scale,yy=n=>265-(n-lo)*scale,sorted=[...points].sort((a,b)=>a[0]-b[0]);return `<div class="plot-board"><svg viewBox="0 0 310 300" aria-hidden="true">${Array.from({length:hi-lo+1},(_,i)=>{const n=lo+i;return `<path d="M${xx(n)} 25v240M35 ${yy(n)}h240" stroke="#dce6d4"/><text x="${xx(n)}" y="288" text-anchor="middle" font-size="11" fill="#4f6c4b">${n}</text><text x="18" y="${yy(n)+4}" text-anchor="middle" font-size="11" fill="#4f6c4b">${n}</text>`;}).join('')}<polyline points="${sorted.map(([x,y])=>`${xx(x)},${yy(y)}`).join(' ')}" fill="none" stroke="#507dc6" stroke-width="3"/></svg>${Array.from({length:(hi-lo+1)**2},(_,i)=>{const x=lo+i%(hi-lo+1),y=lo+Math.floor(i/(hi-lo+1)),selected=points.some(p=>p[0]===x&&p[1]===y);return `<button type="button" class="plot-point ${selected?'selected':''}" style="left:${xx(x)/310*100}%;top:${yy(y)/300*100}%" data-action="plot-point" data-x="${x}" data-y="${y}" aria-label="Plot point ${x}, ${y}" aria-pressed="${selected}" ${done?'disabled':''}></button>`;}).join('')}</div>${done?'':`<div class="drawing-actions"><button class="text-btn" type="button" data-action="draw-clear">Clear points</button><span>${points.length}/${session.q.answer.length} points</span></div>`}`;}

let world={profileId:null,tier:0,loaded:false,busy:false,available:null,board:null,match:null,feedback:null,unlocked:[0],identity:null,error:'',streak:0};
let worldTimer;
function worldPage(){
 const p=player();
 if(!p)return '<div class="panel"><h1>World League</h1><p>Choose your player to see your year group.</p><button class="btn lime" data-action="players">Choose player</button></div>';
 if(world.profileId!==p.id||world.year!==p.year){
  let identity=null;
  try{identity=JSON.parse(localStorage.getItem(`matchday.world.${p.id}`)||'null');}catch{}
  world={profileId:p.id,year:p.year,tier:0,loaded:false,busy:false,available:null,board:null,match:null,feedback:null,unlocked:[0],identity,error:'',streak:0};
 }
 if(!world.loaded&&!world.busy)queueMicrotask(loadWorldBoard);
 return worldBoardView(p,world);
}
async function loadWorldBoard(){
 const p=player(),state=world;
 if(!p||view!=='world'||state.loaded||state.busy)return;
 state.busy=true;state.error='';
 try{
  const query={year:p.year,tier:state.tier};
  state.board=await leagueApi('board',{query});state.available=true;
  if(state.identity){
   try{const me=await leagueApi('me',{query,token:state.identity.token});state.unlocked=me.unlocked;}
   catch(error){if(error.status===401)forgetWorld(state);else state.error=error.message;}
  }
 }catch(error){state.available=false;state.error=error.message;state.board=null;}
 finally{state.loaded=true;state.busy=false;if(view==='world'&&world===state)render();}
}
async function joinWorld(){
 if(world.busy||!world.available||!player())return;
 const state=world;state.busy=true;render();
 try{state.identity=await leagueApi('join',{body:{}});localStorage.setItem(`matchday.world.${state.profileId}`,JSON.stringify(state.identity));state.unlocked=[0];state.error='';}
 catch(error){state.error=error.message;}
 finally{state.busy=false;if(view==='world'&&world===state)render();}
}
function forgetWorld(state){
 state.identity=null;state.unlocked=[0];state.report=null;
 try{localStorage.removeItem(`matchday.world.${state.profileId}`);}catch{}
}
async function leaveWorld(){
 const state=world;
 if(!state.identity||state.busy)return;
 state.busy=true;state.error='';render();
 try{await leagueApi('leave',{token:state.identity.token,body:{}});forgetWorld(state);}
 catch(error){if(error.status===401)forgetWorld(state);else state.error=error.message;}
 finally{state.busy=false;state.loaded=false;if(view==='world'&&world===state)render();}
}
async function startWorld(){
 const p=player(),state=world;
 if(!p||!state.identity||state.busy||!state.unlocked.includes(state.tier))return;
 state.busy=true;state.error='';render();
 try{
  state.match=await leagueApi('start',{token:state.identity.token,body:{year:p.year,tier:state.tier}});
  state.feedback=null;state.streak=0;state.answer='';state.report=null;state.outcomes=[];
 }catch(error){state.error=error.message;}
 finally{
  state.busy=false;
  if(view==='world'&&world===state){render();scrollTo({top:0});}
 }
}
async function submitWorld(value){
 const state=world;
 if(state.busy||!state.match||state.feedback||view!=='world')return;
 state.answer=String(value||'').trim().replace('−','-');
 if(!/^-?\d+(?:\.\d+)?$/.test(state.answer)){state.error='Enter a number.';render();return;}
 const match=state.match;
 state.busy=true;state.error='';state.lastQuestion=match.question;
 const submitButton=$('#world-answer-form button[type="submit"]');
 if(submitButton)submitButton.disabled=true;
 try{
  const shot=await leagueApi('shot',{token:state.identity.token,body:{id:match.id,index:match.index,answer:state.answer}});
  if(world!==state||view!=='world'||state.match!==match)return;
  state.match=shot;state.feedback=shot;state.outcomes[shot.index-1]=shot.goal?'goal':'miss';state.streak=shot.goal?state.streak+1:0;state.answer='';
  if(shot.unlocked)state.unlocked=shot.unlocked;
 }catch(error){state.error=error.message;}
 finally{state.busy=false;if(view==='world'&&world===state)render();}
}
function nextWorld(){
 clearTimeout(goalTimer);
 if(!world.feedback)return;
 if(world.feedback.complete){
  world.report=world.feedback;world.tier=world.match.tier;
  world.match=null;world.feedback=null;world.loaded=false;clearInterval(worldTimer);
 }else world.feedback=null;
 render();
}
function renderWorldMatch(){
 const p=player();
 if(!p){world.match=null;render();return;}
 app.innerHTML=worldMatchView(p,world);
 const state=world,feedback=state.feedback;
 if(touchMatch.matches){
  $('#question-host').insertAdjacentHTML('beforeend',keypadMarkup());
  updateKeypad(!feedback||feedback.goal,!feedback&&!state.busy,['−','.']);
 }
 paintShot($('.penalty-view'),{question:feedback?state.lastQuestion:state.match.question,correct:feedback?.goal,attempt:state.match.index,streak:state.streak,celebration:p.look.celebration});
 if(feedback?.goal)afterGoal(()=>{
  if(view==='world'&&world===state&&state.feedback===feedback&&state.match)nextWorld();
 });
 clearInterval(worldTimer);
 if(!world.feedback?.complete)worldTimer=setInterval(()=>{
  if(view!=='world'||!world.match){clearInterval(worldTimer);return;}
  const time=$('#world-time');if(time)time.textContent=worldClock(world.match.expiresAt);
  if(Date.now()>=world.match.expiresAt&&!world.busy){
   clearInterval(worldTimer);world.match=null;world.feedback=null;world.error='Time is up. Open a new match when you’re ready.';render();
  }
 },250);
}
const requestedYear=Number(new URLSearchParams(location.search).get('year'));year=requestedYear>=1&&requestedYear<=6?requestedYear:player()?.year||1;const requestedSkill=new URLSearchParams(location.search).get('skill');if(skillById(requestedSkill)&&!session){pendingSkill=requestedSkill;if(player())startMatch(pendingSkill);else view='players';}render();if(session)startTick();if('speechSynthesis'in window){voices=speechSynthesis.getVoices();speechSynthesis.addEventListener('voiceschanged',()=>{voices=speechSynthesis.getVoices();if(view==='coach'&&!session&&!result)render();});}
