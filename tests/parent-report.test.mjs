import test from 'node:test';
import assert from 'node:assert/strict';
import {DAY,newProfile,questionPool} from '../dist/engine.mjs';
import {recordLearning} from '../dist/adaptive.mjs';
import {earnedXP,rewardCandidate,MATCH_SCHEMA} from '../dist/rewards.mjs';
import {parentReport} from '../dist/parent-report.mjs';
import {reportContent} from '../dist/academy-ui.mjs';

const now=Date.UTC(2026,10,6,12);

test('asking Coach records an unsure answer, with zero points and no independent fact credit',()=>{
 const profile=newProfile('Test',3),q=questionPool('colSub2')[0];
 const match={schema:MATCH_SCHEMA,mode:'timed',curriculumYear:3,streak:1};
 assert.equal(rewardCandidate(profile,q,match,{correct:false,assisted:true,now}),0);
 assert.equal(earnedXP(false,true,1),0);
 const evidence=recordLearning(profile,q,false,true,1000,'first',now,false,true);
 assert.equal(profile.facts[q.key],undefined);
 assert.equal(evidence.recent.at(-1).unknown,true);
 assert.equal(evidence.recent.at(-1).correct,false);
 assert.equal(rewardCandidate(profile,q,match,{correct:true,assisted:false,now:now+1000}),0);
 const skill=parentReport(profile,now).priorities.find(s=>s.id===q.skillId);
 assert.equal(skill.level,'check');
 assert.deepEqual([skill.askedCoach,skill.skipped,skill.wrong,skill.independent],[1,0,0,0]);
 assert.match(reportContent(profile,undefined,now),/0\/1 independent · 1 asked Coach/);
});

test('the report separates missed, helped, skipped and independent answers for each pupil',()=>{
 const profile=newProfile('A <B>',4),other=newProfile('Other',4);
 const [a,b,c,d]=questionPool('colSub3');
 const rows=[
  {q:a,correct:false,unknown:true},
  {q:b,correct:true,assisted:true},
  {q:c,correct:true},
  {q:d,correct:false,typed:5},
 ];
 for(let i=0;i<rows.length;i++){
  const row=rows[i];
  recordLearning(profile,row.q,row.correct,!!row.assisted,1300,i<2?'one':'two',now-60,false,!!row.unknown);
 }
 profile.sessions.push({endedAt:now-60,rows});
 for(const q of questionPool('colSub2').slice(0,3))recordLearning(profile,q,true,false,1200,'known',now-10);
 const report=parentReport(profile,now),priority=report.priorities[0];
 assert.equal(priority.id,'colSub3');
 assert.equal(priority.level,'support');
 assert.deepEqual([priority.independent,priority.helped,priority.skipped,priority.wrong,priority.sessions],[1,1,1,1,2]);
 assert.equal(priority.route.id,'bridgeSub');
 assert.equal(priority.next.level,'unseen');
 assert.equal(priority.example.q.key,d.key);
 assert.equal(parentReport(other,now).priorities.length,0);
 assert.ok(parentReport(other,now).current.every(skill=>skill.level==='unseen'));
 const markup=reportContent(profile,q=>`${q.a} − ${q.b}`,now);
 assert.match(markup,/A &lt;B&gt;’s learning report/);
 assert.match(markup,/1\/4 independent · 1 incorrect · 1 with help · 1 skipped/);
 assert.match(markup,/Entered 5 · expected/);
 assert.match(markup,/data-action="print-report"/);
 assert.match(markup,/data-skill="bridgeSub" data-target="colSub3"/);
});

test('one miss is a check, spaced success is secure and older evidence is due for a refresh',()=>{
 const profile=newProfile('Test',4);
 recordLearning(profile,questionPool('money4')[0],false,false,1000,'one',now-1);
 const evidence=questionPool('place4').slice(0,9);
 for(const [index,q] of evidence.entries()){
  const session=Math.floor(index/3);
  recordLearning(profile,q,true,false,1000,`s${session}`,now-(4-session*2)*DAY);
 }
 const current=parentReport(profile,now);
 assert.equal(current.priorities.find(skill=>skill.id==='money4').level,'check');
 assert.equal(current.current.find(skill=>skill.id==='place4').level,'secure');
 assert.equal(current.domains.find(domain=>domain.id==='number').shown.id,'place4');
 const older=parentReport(profile,now+31*DAY).current.find(skill=>skill.id==='place4');
 assert.equal(older.level,'review');
 assert.equal(older.previouslySecure,true);
});

test('every skill has an example and a visible checklist, with no invented scores on a new year radar',()=>{
 const profile=newProfile('Test',6),report=parentReport(profile,now),html=reportContent(profile,undefined,now);
 assert.ok(report.current.every(s=>s.example?.q&&Array.isArray(s.checks)));
 assert.ok(report.domains.every(d=>d.securePercent===0&&d.readyPercent===0));
 assert.equal((html.match(/<summary>Example question<\/summary>/g)||[]).length,report.current.length);
 assert.equal((html.match(/<summary>What makes this skill secure\?<\/summary>/g)||[]).length,report.current.length);
 assert.match(html,/Year 6 learning profile/);assert.match(html,/Illustrative question, not a result/);
 assert.match(html,/Checked<\/b> means a question has been attempted/);
 assert.match(html,/Not checked/);assert.match(html,/game’s Year 6 practice expectations/);
});

test('waiting without a later recall cannot turn checked work into secure evidence',()=>{
 const profile=newProfile('Test',4),pool=questionPool('place4');
 for(let day=0;day<3;day++)for(const q of pool.slice(day*3,day*3+3))recordLearning(profile,q,true,false,1000,`day-${day}`,now+day*DAY);
 const skill=parentReport(profile,now+7*DAY).current.find(s=>s.id==='place4');
 assert.notEqual(skill.level,'secure');
 const check=skill.checks.find(c=>/Days between/.test(c.label));assert.equal(check.value,2);assert.equal(check.met,false);
});

test('near-secure and fully secure years give parents concrete remaining steps',async()=>{
 const {syllabusIds}=await import('../dist/curriculum.mjs');
 const profile=newProfile('Test',1),ids=syllabusIds(1);
 for(const id of ids){
  const pool=questionPool(id);
  for(const [i,offset] of [4,3,0].entries())for(const q of pool)recordLearning(profile,q,true,false,1000,`s${i}`,now-offset*DAY);
  const variants=[...new Map(pool.map(q=>[q.variant??q.op,q])).values()];
  for(let i=0;i<12;i++)recordLearning(profile,variants[i%variants.length],true,false,1000,`mixed-${i%3}`,now);
 }
 assert.equal(parentReport(profile,now).stage,'secure');
 assert.match(reportContent(profile,undefined,now),/All digital skills secure/);
 assert.match(reportContent(profile,undefined,now),/remaining practical checks/);
 profile.learning[ids[0]].days=[new Date(now).toISOString().slice(0,10)];
 assert.equal(parentReport(profile,now).stage,'nearly');
 assert.match(reportContent(profile,undefined,now),/Close to securing the year/);
 assert.match(reportContent(profile,undefined,now),/1 skill still needs secure recall/);
});
