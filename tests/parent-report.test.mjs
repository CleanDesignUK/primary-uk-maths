import test from 'node:test';
import assert from 'node:assert/strict';
import {DAY,newProfile,questionPool} from '../dist/engine.mjs';
import {recordLearning} from '../dist/adaptive.mjs';
import {parentReport} from '../dist/parent-report.mjs';
import {reportContent} from '../dist/academy-ui.mjs';

const now=Date.UTC(2026,10,6,12);

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
