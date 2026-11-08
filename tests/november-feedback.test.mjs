import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,questionPool,initialData,validateImport,DAY} from '../dist/engine.mjs';
import {recordLearning} from '../dist/adaptive.mjs';
import {parentReport} from '../dist/parent-report.mjs';
import {yearProfileMarkup} from '../dist/report-visuals.mjs';
import {yearJourney} from '../dist/academy-ui.mjs';
import {initCareer,pendingClubOffers,viewClubOffers,chooseClub,CLUBS} from '../dist/career.mjs';
import {medals,medalsMarkup,historyMarkup,matchLabel} from '../dist/match-records.mjs';
import {MATCH_SCHEMA,rewardCandidate,bankCareerXP,revealFact} from '../dist/rewards.mjs';
import {receiveProgress} from '../dist/tab-sync.mjs';

const now=Date.UTC(2026,10,8,12);
test('another tab keeps newer rewards, preserves the selected pupil and pauses a conflicting match',()=>{
 const first=newProfile('First',5),second=newProfile('Second',3);
 const old={profiles:[first,second],activeId:first.id},latest=structuredClone(old);
 latest.activeId=second.id;latest.profiles[0].pointsTotal=20;latest.profiles[0].sessions.push({id:'new-drill'});
 const update=receiveProgress(old,latest,{profileId:first.id});
 assert.equal(update.data.activeId,first.id);assert.equal(update.data.profiles[0].pointsTotal,20);
 assert.equal(update.roundChanged,true);assert.equal(update.roundRemoved,false);
 assert.equal(receiveProgress(old,latest,{profileId:second.id}).roundChanged,false);
 assert.equal(receiveProgress(old,{profiles:[second],activeId:second.id},{profileId:first.id}).roundRemoved,true);
});
test('starting years survive backups and promotions without completing earlier years',()=>{
 const p=newProfile('Year five starter',5);initCareer(p);
 assert.match(yearJourney(p),/0<small> \/ 2 years/);
 assert.doesNotMatch(yearJourney(p),/data-year="[1-4]"/);
 p.completedYears=[5];p.year=6;
 assert.match(yearJourney(p),/1<small> \/ 2 years/);
 const data=initialData();data.profiles=[p];
 assert.equal(validateImport(structuredClone(data)).profiles[0].startingYear,5);
 const old=newProfile('Existing',6);delete old.startingYear;old.sessions=[{curriculumYear:4}];initCareer(old);
 assert.equal(old.startingYear,4);assert.deepEqual(old.completedYears,[]);
 old.year=2;initCareer(old);assert.equal(old.startingYear,2);
 assert.throws(()=>validateImport({...data,profiles:[{...p,startingYear:0}]}),/Invalid starting year/);
});
test('a completed first warm-up has a medal and saved history before any personal best',()=>{
 const p=newProfile('Test',5);initCareer(p);
 const match={id:'first',endedAt:now,placement:true,mode:'check',complete:true,attempts:12,correct:8,careerXP:0,points:80,rows:[],bestStreak:3};
 p.sessions.push(match);
 assert.equal(medals(p).find(m=>m[0]==='First kick')[3],true);
 assert.match(medalsMarkup(p),/First kick/);assert.match(historyMarkup(p),/Warm-up/);
 assert.match(historyMarkup(p),/8\/12/);assert.match(historyMarkup(p),/1 saved/);
 assert.equal(Object.keys(p.records).length,0);
 assert.equal(matchLabel({...match,progressCheck:true}),'Progress check');
 assert.equal(matchLabel({coachDrill:true}),'Coach drill');
});
test('the learning graph responds to quiz answers without awarding secure mastery',()=>{
 const p=newProfile('Test',6),q=questionPool('add10')[4];
 let number=parentReport(p,now).domains.find(d=>d.id==='calculation');
 assert.equal(number.practicePercent,null);
 recordLearning(p,q,true,false,1000,'warmup',now);
 let report=parentReport(p,now);number=report.domains.find(d=>d.id==='calculation');
 assert.deepEqual([number.practiceAttempts,number.practiceIndependent,number.practicePercent,number.foundationAttempts],[1,1,100,1]);
 assert.equal(report.counts.secure,0);assert.equal(number.securePercent,0);
 assert.match(yearProfileMarkup(report),/1\/1 answers on your own/);
 assert.match(yearProfileMarkup(report),/Includes 1 earlier-year foundation answer/);
 recordLearning(p,questionPool('add10')[5],false,true,1000,'drill',now,false,true);
 number=parentReport(p,now).domains.find(d=>d.id==='calculation');
 assert.equal(number.practicePercent,50);assert.equal(number.practiceAttempts,2);
 assert.equal(parentReport(p,now+31*DAY).domains.find(d=>d.id==='calculation').practicePercent,null);
});
test('Coach drills pay only fresh independent answers once and share Coach-match reward windows',()=>{
 const p=newProfile('Test',3),qs=questionPool('table3').slice(1,4);
 const match={id:'drill',schema:MATCH_SCHEMA,mode:'practice',manual:'table3',coachDrill:true,curriculumYear:3,target:3,attempts:3,complete:true,streak:1,selection:{reason:'chosen'}};
 revealFact(p,qs[1],now);
 match.rows=qs.map(q=>({correct:true,assisted:false,careerCandidate:rewardCandidate(p,q,match,{correct:true,assisted:false,now})}));
 assert.deepEqual(match.rows.map(r=>r.careerCandidate),[10,0,10]);
 assert.equal(bankCareerXP(p,{...match,complete:false}),0);
 assert.equal(bankCareerXP(p,match),20);assert.equal(bankCareerXP(p,match),0);
 assert.equal(rewardCandidate(p,qs[0],{...match,mode:'timed',coachDrill:false,manual:null},{correct:true,assisted:false,now}),0);
 assert.equal(rewardCandidate(p,qs[2],match,{correct:true,assisted:true,now}),0);
 const free={...match,id:'free',coachDrill:false,rows:[{correct:true,careerCandidate:999}]};
 assert.equal(bankCareerXP(p,free),0);
});
test('new club offers stay visible until viewed and the Join action selects an eligible club',()=>{
 const p=newProfile('Test',3);initCareer(p);p.pointsTotal=100;
 for(const q of questionPool('add10').slice(0,22))recordLearning(p,q,true,false,1000,'first',now);
 const club=CLUBS.find(c=>c.level===2);
 assert.ok(pendingClubOffers(p).some(c=>c.id===club.id));
 viewClubOffers(p);assert.equal(pendingClubOffers(p).length,0);
 assert.equal(chooseClub(p,club.id),true);assert.equal(p.look.club,club.id);
 const data=initialData();data.profiles=[p];assert.doesNotThrow(()=>validateImport(structuredClone(data)));
});

test('goalkeepers catch good answers with their customised player while outfield players shoot',async()=>{
 const {paintShot}=await import('../dist/shot.mjs');
 const {penaltyArena}=await import('../dist/experience.mjs');
 const p=newProfile('Keeper',5);initCareer(p);p.look.position='Goalkeeper';p.look.number=21;
 assert.match(penaltyArena(p),/goalkeeper-player/);assert.doesNotMatch(penaltyArena(p),/kicker-avatar/);
 assert.match(penaltyArena(p),/number 21, Goalkeeper/);
 const styles=new Map(),callout={textContent:''};
 const arena={dataset:{role:'goalkeeper'},clientWidth:200,clientHeight:100,style:{setProperty:(k,v)=>styles.set(k,v)},querySelector:()=>callout};
 paintShot(arena,{question:questionPool('add10')[0],correct:true,aim:'left'});
 assert.equal(arena.dataset.outcome,'save');assert.equal(callout.textContent,'SAVE!');
 assert.equal(styles.get('--keeper-x'),styles.get('--flight-x'));
 paintShot(arena,{question:questionPool('add10')[0],correct:false,aim:'left'});
 assert.equal(arena.dataset.outcome,'concede');assert.notEqual(styles.get('--keeper-x'),styles.get('--flight-x'));
 p.look.position='Striker';assert.match(penaltyArena(p),/kicker-avatar/);
 arena.dataset.role='striker';paintShot(arena,{question:questionPool('add10')[0],correct:true,aim:'left'});
 assert.equal(arena.dataset.outcome,'goal');assert.equal(callout.textContent,'GOAL!');
});
test('unavailable online leagues lead to a working local league without a join dead end',async()=>{
 const {worldBoardView}=await import('../dist/world.mjs');
 const html=worldBoardView(newProfile('Test',5),{available:false,unlocked:[0],tier:0});
 assert.match(html,/Open Squad League/);assert.match(html,/data-view="league"/);
 assert.doesNotMatch(html,/hosted academy|world-join|world-start/);
});

test('24-hour clocks distinguish afternoon from evening and explain the p.m. conversion',()=>{
 const questions=questionPool('clock3'),pm=questions.filter(q=>/24-hour/.test(q.prompt));
 assert.ok(pm.some(q=>/evening/.test(q.prompt)));assert.ok(pm.some(q=>/afternoon/.test(q.prompt)));
 for(const q of pm){const hour=Number(q.answer.split(':')[0]);assert.equal(/evening/.test(q.prompt),hour>=18);assert.match(q.hint.join(' '),/add 12/);}
});
