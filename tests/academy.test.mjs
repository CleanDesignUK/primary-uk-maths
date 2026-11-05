import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {SKILLS,newProfile,initialData,questionPool,DAY,validateImport} from '../dist/engine.mjs';
import {answerMatches,syllabusIds,parseNumber} from '../dist/curriculum.mjs';
import {PRACTICAL} from '../dist/primary.mjs';
import {initLearning,recordLearning,competency,probeIds,nextAdaptive} from '../dist/adaptive.mjs';
import {tableQuestion,tableEvidence,focusTables} from '../dist/tables.mjs';
import {initCareer,credits,buyItem,equipItem,chooseClub,clubProgress,careerNews,careerLevel,xpForLevel,CLUBS,validateCareer} from '../dist/career.mjs';
import {yearProgress,checkPromotion,leagueTable,initLeague,recordLeague} from '../dist/promotion.mjs';
import {britishNumber,spokenMath,selectBritishVoice} from '../dist/speech.mjs';
import {divisionWorking,workedExample} from '../dist/coaching.mjs';
import {shotType,superMove} from '../dist/avatar.mjs';
const now=Date.UTC(2026,10,4,12);
function p(year=3){const profile=newProfile('Test player',year);initLearning(profile);initCareer(profile);return profile;}
function completeYear(year){
 const profile=p(year);
 for(const id of syllabusIds(year)){
  const pool=questionPool(id);
  for(const [i,day]of [0,1,4].entries())for(const q of pool)recordLearning(profile,q,true,false,1000,`practice-${i}`,now+day*DAY);
  const variants=[...new Map(pool.map(q=>[q.variant??q.op,q])).values()];
  for(let n=0;n<12;n++)recordLearning(profile,variants[n%variants.length],true,false,1200,`mixed-${n%3}`,now+4*DAY);
 }
 for(const t of focusTables(year))for(const q of questionPool(`table${t}`))recordLearning(profile,{...q,a:q.answer,b:t,answer:q.b,op:'÷',factFamily:true,factFormat:'divide',tableFocus:t},true,false,1000,'inverse',now+4*DAY);
 for(const [id]of PRACTICAL[year])profile.practical[`y${year}:${id}`]=true;
 return profile;
}

test('six year routes have 12 age-specific probes and a full, non-empty family map',()=>{
 assert.equal(SKILLS.length,247);for(let y=1;y<=6;y++){const profile=p(y);assert.equal(probeIds(profile).length,12);assert.ok(syllabusIds(y).length>=25);assert.ok(PRACTICAL[y].length>=3);const round={id:'warmup',mode:'check',placement:true,rows:[],seen:[],retry:[],correct:0,attempts:0};for(let n=0;n<12;n++){const {q}=nextAdaptive(profile,round,now,()=>.4);assert.ok(q?.key);round.rows.push({q,correct:true});round.attempts++;round.seen.push(q.key);}}
 assert.deepEqual(focusTables(1),[]);assert.deepEqual(focusTables(2),[2,5,10]);assert.deepEqual(focusTables(3).slice(0,3),[3,4,8]);assert.equal(focusTables(4).length,12);
});
test('a direct table fact never invents division evidence, including commuted divisors',()=>{
 const profile=p();const q=questionPool('table3').find(q=>q.b===4);
 recordLearning(profile,q,true,false,1000,'one',now);assert.equal(tableEvidence(profile,3).direct,1);assert.equal(tableEvidence(profile,3).inverse,0);
 recordLearning(profile,{...q,a:12,b:3,answer:4,op:'÷',factFamily:true,tableFocus:3},true,false,1000,'two',now+DAY);
 assert.equal(tableEvidence(profile,3).inverse,1);assert.equal(tableEvidence(profile,4).inverse,0);
 assert.equal(tableEvidence(profile,3).matchFit,false);
});
test('table coach limits introductions and reaches multiplication, division and missing forms',()=>{
 const profile=p(),round={rows:[]},seen=[];for(let i=0;i<12;i++){
  const q=tableQuestion(profile,['table3'],seen,now,()=>.31,'auto',round),fresh=!profile.facts[q.key];round.rows.push({q,newFact:fresh});seen.push(q.key);recordLearning(profile,q,true,false,1000,'one',now);
 }
 assert.ok(new Set(round.rows.filter(r=>r.newFact).map(r=>r.q.key)).size<=3);assert.ok(round.rows.some(r=>r.q.factFormat==='divide'));assert.ok(round.rows.some(r=>r.q.factFormat==='missing'));
 for(const mode of ['multiply','divide','missing','mixed'])for(let i=0;i<12;i++){const q=tableQuestion(profile,['table3'],[],now,()=>(i+.5)/12,mode);assert.ok(answerMatches(q,q.answer));assert.equal(q.factFamily,true);if(mode!=='mixed')assert.equal(q.factFormat,mode);}
});
test('table match fitness needs all 12 facts, inverse forms and genuinely spaced days',()=>{
 const profile=p();for(const day of [0,1,4])for(const q of questionPool('table8'))recordLearning(profile,{...q,op:day===1?'÷':'×',a:day===1?q.answer:q.a,b:day===1?8:q.b,answer:day===1?q.b:q.answer,factFamily:true,tableFocus:8},true,false,1000,`day-${day}`,now+day*DAY);
 assert.equal(tableEvidence(profile,8,now+4*DAY).matchFit,true);assert.equal(tableEvidence(profile,8).secure,12);
 const q=questionPool('table8')[0];recordLearning(profile,q,false,false,1000,'miss',now+5*DAY);assert.equal(tableEvidence(profile,8).matchFit,false);
});
test('earned credits cannot be overspent or double-charged and equipped items must be owned',()=>{
 const profile=p();profile.pointsTotal=270;assert.equal(credits(profile),27);assert.equal(equipItem(profile,'kit-blue'),false);assert.equal(buyItem(profile,'kit-blue').ok,true);assert.equal(credits(profile),11);assert.equal(equipItem(profile,'kit-blue'),true);assert.equal(buyItem(profile,'kit-blue').alreadyOwned,true);assert.equal(credits(profile),11);assert.equal(buyItem(profile,'kit-red').ok,false);assert.ok(validateCareer(profile));
 const raw=initialData();raw.profiles=[profile];assert.equal(validateImport(structuredClone(raw)).profiles[0].look.kit,'kit-blue');
 for(const mutate of [p=>p.creditsSpent=999,p=>p.look.number=100,p=>p.inventory.push('kit-gold'),p=>p.purchases.push({...p.purchases[0]})]){const invalid=structuredClone(profile);mutate(invalid);assert.throws(()=>validateCareer(invalid));}
});
test('levels start quickly and later gaps grow, while XP alone cannot buy a top club offer',()=>{
 const profile=p();for(let level=1;level<20;level++){profile.pointsTotal=xpForLevel(level);assert.equal(careerLevel(profile),level);assert.ok(xpForLevel(level+2)-xpForLevel(level+1)>xpForLevel(level+1)-xpForLevel(level));}
 profile.pointsTotal=100000;assert.equal(chooseClub(profile,'arsenal'),false);assert.ok(clubProgress(profile,CLUBS.find(c=>c.id==='arsenal')).remaining.some(g=>g.label==='Practice days'));
 const spurs=CLUBS.find(c=>c.id==='tottenham');assert.equal(spurs.level,7);assert.equal(chooseClub(profile,spurs.id),false);assert.equal(clubProgress(profile,spurs).percent,0);
 for(const q of questionPool('add10').slice(0,20))recordLearning(profile,q,true,false,1000,'match',now);assert.equal(chooseClub(profile,'local'),true);assert.deepEqual(careerNews(profile,1,now).map(c=>c.id),['local']);assert.equal(careerNews(profile,1,now).length,0);
});
test('XP, one easy match, or missing practical observations never award a completed year',()=>{
 const profile=p(1);profile.pointsTotal=1000000;const match={promotion:true,complete:true,target:12,attempts:12,correct:12,hintsUsed:0,curriculumYear:1};assert.equal(yearProgress(profile,1,now).eligible,false);assert.equal(checkPromotion(profile,match,now).promoted,false);assert.equal(profile.year,1);
});
test('a fully evidenced year can be promoted and Year 6 graduation stops at Year 6',()=>{
 for(const year of [1,2,3,4,5,6]){const profile=completeYear(year);const progress=yearProgress(profile,year,now+4*DAY);assert.deepEqual(progress.skills.filter(s=>!s.secure).map(s=>s.id),[],`Year ${year} must have attainable learning gates`);assert.equal(progress.eligible,true);
 const match={promotion:true,complete:true,target:12,attempts:12,correct:12,hintsUsed:0,curriculumYear:year};assert.equal(checkPromotion(profile,{...match,hintsUsed:1},now+4*DAY).promoted,false);const out=checkPromotion(profile,{...match,pausedEver:true},now+4*DAY);assert.equal(out.promoted,true);assert.equal(profile.year,year===6?6:year+1);assert.ok(profile.completedYears.includes(year));if(year===6)assert.equal(profile.graduated,true);
 }
});
const match=(id,year,extra={})=>({id,schema:'football-v5',ranked:true,careerXP:100,target:10,mode:'timed',complete:true,curriculumYear:year,endedAt:now,attempts:10,correct:10,points:100,rows:Array.from({length:10},()=>({correct:true,assisted:false,earned:10})),...extra});
test('local league uses real eligible matches, ties, independent points and the played year',()=>{
 const a=p(3),b=p(5),empty=p(1);a.name='Player A';b.name='Player B';a.sessions=[match('a',3),match('paused',3,{pausedEver:true}),match('probe',3,{mode:'check'})];b.sessions=[match('b',3)];let league=leagueTable([a,b,empty],{now});assert.equal(league.length,2);assert.deepEqual(league.map(r=>[r.rank,r.points]),[[1,100],[1,100]]);assert.equal(leagueTable([a,b],{year:5,now}).length,0);
 b.sessions[0].rows[0].assisted=true;b.sessions[0].careerXP=90;delete b.leagueTotals;league=leagueTable([a,b],{now});assert.equal(league[1].points,90);assert.equal(league[1].accuracy,90);
});
test('lifetime league totals survive trimmed history and a saved match is counted once',()=>{
 const profile=p();profile.pointsTotal=200;initLeague(profile);const first=match('first',3);assert.equal(recordLeague(profile,first),true);assert.equal(recordLeague(profile,first),false);profile.sessions=[];assert.equal(leagueTable([profile],{period:'all',now})[0].points,100);assert.equal(leagueTable([profile],{period:'week',now}).length,0);
});
test('clock, negative coordinates, plots and equations reject plausible wrong answers',()=>{
 const clock={format:'clock',answer:[12,30]};assert.ok(answerMatches(clock,[12,30]));for(const value of [[0,30],[12,90],[1,30]])assert.equal(answerMatches(clock,value),false);
 assert.ok(answerMatches({format:'pair',answer:[-3,2]},'(−3,2)'));assert.equal(answerMatches({format:'pair',answer:[-3,2]},'2,-3'),false);
 const plot={format:'plot',answer:[[1,3],[2,5]]};assert.ok(answerMatches(plot,[[2,5],[1,3]]));assert.equal(answerMatches(plot,[[1,3],[1,3]]),false);
 for(const q of questionPool('pairs6')){assert.ok(answerMatches(q,q.answer));const {coefficient,total}=q.pairRule;assert.ok(answerMatches(q,[0,total]));assert.equal(answerMatches(q,[0,total+1]),false);}
});
test('fraction, decimal and percentage generators agree with independent arithmetic',()=>{
 for(const id of ['fracCalc4','fracCalc6'])for(const q of questionPool(id)){const [a,b]=q.operands;assert.ok(Math.abs(parseNumber(q.answer)-(a[0]/a[1]+(q.operation==='−'?-1:1)*b[0]/b[1]))<1e-9);}
 for(const q of questionPool('decimalMul6')){const [a,b]=q.expression.split(' × ').map(Number);assert.ok(Math.abs(q.answer-a*b)<1e-9);}
 for(const q of questionPool('percent6')){const nums=q.expression.match(/\d+/g).map(Number);assert.equal(q.answer,q.prompt==='Find the whole'?nums[1]*100/nums[0]:q.prompt==='What percentage?'?nums[0]*100/nums[1]:nums[0]*nums[1]/100);}
 assert.ok(questionPool('shape4').some(q=>q.prompt==='Name the quadrilateral'));assert.ok(new Set(questionPool('measure1').map(q=>q.prompt)).size>=4);
});
test('long division handles internal zero digits and reconstructs the full dividend',()=>{
 for(const [a,b]of [[1005,5],[4008,12],[9876,24],[8,12],[1927,17]]){const m=divisionWorking(a,b);assert.equal(Number(m.steps.map(s=>s.digit).join('')),m.quotient);assert.equal(m.quotient*b+m.remainder,a);for(const s of m.steps){assert.equal(s.product,s.digit*b);assert.equal(s.current-s.product,s.remainder);assert.ok(s.remainder<b);}}
 for(const q of questionPool('longMul6')){const m=workedExample(q);assert.equal(m.partials.reduce((sum,p)=>sum+p.value,0),m.total);assert.equal(m.total,q.answer);}
});
test('British read-aloud selects a real en-GB voice and speaks mathematical notation clearly',()=>{
 assert.equal(britishNumber(105),'one hundred and five');assert.equal(britishNumber(1001),'one thousand and one');assert.equal(britishNumber(.000001),'zero point zero zero zero zero zero one');assert.equal(spokenMath('3/4 × 12 = 9'),'three quarters times twelve equals nine');assert.equal(spokenMath('10,000,000'),'ten million');assert.equal(spokenMath('−4 + 0.25'),'minus four plus zero point two five');
 const us={name:'US',lang:'en-US',voiceURI:'us'},gb={name:'British',lang:'en-GB',voiceURI:'gb',localService:true};assert.equal(selectBritishVoice([us]),null);assert.equal(selectBritishVoice([us,gb],'us'),gb);
 assert.equal(shotType({op:'−'}),'curl');assert.equal(shotType({skillId:'longDiv6'}),'chip');assert.equal(superMove(5).id,'fire');assert.equal(superMove(8).id,'meteor');
});
test('30 marketing pages have unique metadata, valid structured data and working local links',()=>{
 const root=path.resolve('dist'),pages=JSON.parse(readFileSync('dist/marketing-pages.json','utf8')),titles=new Set();assert.equal(pages.length,30);
 for(const page of pages){const dir=path.join(root,page.slug),html=readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(!titles.has(page.title));titles.add(page.title);assert.match(html,/<html lang="en-GB">/);assert.match(html,/<meta name="description" content="[^\"]+"/);assert.match(html,/<link rel="canonical"/);assert.ok(JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]).some(s=>s.isAccessibleForFree===true));
  for(const match of html.matchAll(/(?:href|src)="([^\"]+)"/g)){const href=match[1];if(/^(?:https?:|#|data:)/.test(href))continue;const file=path.resolve(dir,href.split(/[?#]/)[0]);assert.ok(file.startsWith(root),href);assert.ok(existsSync(file),`${page.slug}: ${href}`);}
 }
 assert.match(readFileSync('index.html','utf8'),/url=\.\/dist\/play\//);
 assert.equal((readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,30);assert.match(readFileSync('dist/play/index.html','utf8'),/noindex,follow/);assert.match(readFileSync('dist/robots.txt','utf8'),/Disallow: \/play\//);
});

test('written methods preserve actual exchanges, including repeated exchanges and zeros',async()=>{
 const {columnMethod,columnWorked,columnWorkspace}=await import('../dist/column-method.mjs');
 const example=columnMethod({a:864,b:788,answer:76,op:'−'});
 assert.deepEqual(example.columns.map(c=>c.changes),[[7],[5,15],[14]]);assert.deepEqual(example.steps.map(s=>s.result),[6,7,0]);
 const zeros=columnMethod({a:1000,b:27,answer:973,op:'−'});assert.deepEqual(zeros.columns.map(c=>c.changes),[[0],[10,9],[10,9],[10]]);
 for(const skill of SKILLS.filter(s=>s.category==='columns'))for(const q of questionPool(skill.id)){
  const model=columnMethod(q);assert.equal(model.steps.reduce((sum,s,i)=>sum+s.result*10**i,0),q.answer);
  if(q.op==='−'){const shown=model.columns.map(c=>c.changes.at(-1)??Number(c.top));assert.equal(shown.reduce((sum,value,i)=>sum+value*10**(model.n-i-1),0),q.a);assert.ok(model.columns.every(c=>(c.changes.at(-1)??Number(c.top))>=Number(c.bottom)));}
  else for(const c of model.columns)assert.equal(c.carry,model.steps[c.index]?.incoming||0);
 }
 const answer=columnWorked({a:864,b:788,answer:76,op:'−'});assert.match(answer,/<s>5<\/s><b>15<\/b>/);assert.match(answer,/Check: 76 \+ 788 = 864/);
 const addition=columnWorkspace({a:68,b:57,answer:125,op:'+'});assert.ok(addition.indexOf('written-answer-row')<addition.indexOf('carry-row'));assert.match(addition,/Carry into tens column/);
});
