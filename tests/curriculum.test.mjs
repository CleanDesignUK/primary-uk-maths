import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILLS,initialData,questionPool,skillById} from '../dist/engine.mjs';
import {EXTRA_SKILLS,DOMAINS,syllabusIds,domainFor,answerMatches,validDrawing,parseNumber,roman} from '../dist/curriculum.mjs';
import {takesFraction,fractionParts,fractionSubmission} from '../dist/fraction-answer.mjs';

test('a fresh academy has no pupil names, accounts or invented scores',()=>{assert.deepEqual(initialData().profiles,[]);assert.equal(initialData().activeId,null);});
test('all six syllabus maps contain the age-appropriate maths domains',()=>{
 assert.equal(new Set(SKILLS.map(s=>s.id)).size,SKILLS.length,'Each exercise has its own unique id');
 for(const year of [1,2,3,4,5,6]){const ids=syllabusIds(year);assert.equal(ids.length,new Set(ids).size);for(const d of DOMAINS.filter(d=>!(d.id==='reasoning'&&year<6)&&!(d.id==='statistics'&&year===1)))assert.ok(ids.some(id=>domainFor(skillById(id))===d.id),`${year}: ${d.id}`);for(const id of ids)assert.ok(questionPool(id).length>0,id);for(const s of EXTRA_SKILLS.filter(s=>s.year===year))assert.ok(ids.includes(s.id));}
 assert.ok(syllabusIds(3).includes('table3')&&syllabusIds(3).includes('table4')&&syllabusIds(3).includes('table8'));
 for(let t=1;t<=12;t++)assert.ok(syllabusIds(5).includes(`table${t}`));
});
test('all generated question answers are accepted, with unique stable keys and valid choices',()=>{
 for(const s of SKILLS){const pool=questionPool(s.id);assert.equal(new Set(pool.map(q=>q.key)).size,pool.length,s.id);for(const q of pool){assert.ok(answerMatches(q,q.format==='drawing'?true:q.answer),`${s.id}: ${q.answer}`);if(q.options){assert.equal(q.options.length,new Set(q.options).size);assert.ok(q.options.some(v=>answerMatches(q,v)),s.id);}if(['number','decimal','angle'].includes(q.format))assert.ok(Number.isFinite(parseNumber(q.answer)),s.id);}}
});
test('fraction equivalence is mathematical while fraction tasks require a fraction response',()=>{
 assert.ok(answerMatches({answer:'1/2',format:'fraction'},'2/4'));
 assert.ok(answerMatches({answer:'7/3',format:'mixed'},'2 1/3'));
 assert.ok(!answerMatches({answer:'1/2',format:'fraction'},'0.5'));
 assert.ok(!answerMatches({answer:'1/2',format:'fraction'},'1/0'));
 assert.ok(answerMatches({answer:0.03,format:'decimal'},'.030'));
 assert.ok(answerMatches({answer:-4,format:'number'},'−4'));
 assert.ok(!answerMatches({answer:0,format:'number'},''));
});
test('stacked answer fields support generated fractions, mixed numbers and whole results',()=>{
 for(const s of SKILLS)for(const q of questionPool(s.id).filter(takesFraction)){
  const mixed=q.format==='mixed';
  const parts=fractionParts(q.answer,{mixed,completed:true});
  const submission=fractionSubmission(parts,mixed);
  assert.ok(answerMatches(q,submission.value),`${s.id}: ${q.answer}`);
 }
 assert.deepEqual(fractionParts('2 1/',{mixed:true}),{whole:'2',numerator:'1',denominator:''});
 assert.equal(fractionSubmission(fractionParts('2/4')).value,'2/4');
 assert.equal(fractionSubmission(fractionParts('1/0')).field,'denominator');
 assert.equal(fractionSubmission(fractionParts('1/')).field,'denominator');
});
test('ruler measurements subtract the starting offset',()=>{
 for(const q of questionPool('ruler3'))assert.equal(q.answer,q.visual.end-q.visual.start);
 assert.ok(questionPool('ruler3').some(q=>q.visual.start!==0));
});
test('rectangle and compound perimeter diagrams agree with the answers',()=>{
 for(const id of ['perimeter3','perimeter5'])for(const q of questionPool(id))assert.equal(q.answer,2*(q.visual.w+q.visual.h));
 for(const q of questionPool('area5'))if(q.visual.type==='rectangle')assert.equal(q.answer,q.visual.w*q.visual.h);else assert.equal(q.answer,q.visual.full+q.visual.half/2);
 for(const q of questionPool('volume5'))assert.equal(q.answer,q.visual.w*q.visual.h*q.visual.depth);
});
test('statistics and timetable values produce independently checked answers',()=>{
 for(const id of ['chart3','lineGraph5'])for(const q of questionPool(id)){const v=q.visual;if(q.prompt==='How many goals?'){const idx=id==='lineGraph5'?Number(q.expression.split(' ')[1])-1:v.labels.indexOf(q.expression);assert.equal(q.answer,v.values[idx]);}else if(q.prompt==='Goals altogether?')assert.equal(q.answer,v.values.reduce((a,b)=>a+b,0));else assert.equal(q.answer,Math.abs(v.values[0]-v.values[1]));}
 for(const q of questionPool('timetable5')){const [from,to]=q.expression.split(' → '),i=q.visual.labels.indexOf(from),j=q.visual.labels.indexOf(to);assert.equal(q.answer,q.visual.times[j]-q.visual.times[i]);}
});
test('fractions of shapes and quantities match the depicted or stated fractions',()=>{
 for(const q of questionPool('fracRead3'))assert.equal(parseNumber(q.answer),q.visual.n/q.visual.d);
 for(const q of questionPool('fracOf3')){const [n,d,total]=q.expression.match(/\d+/g).map(Number);assert.equal(q.answer,total*n/d);}
});
test('clock questions include Roman dials, minute precision and explicit p.m. context',()=>{
 const pool=questionPool('clock3');assert.ok(pool.some(q=>q.visual.roman));assert.ok(pool.some(q=>q.visual.m%5!==0));assert.ok(pool.some(q=>q.prompt.includes('afternoon')));
 for(const q of pool){const [hour,minute]=q.answer.split(':').map(Number);assert.equal(minute,q.visual.m);assert.equal(hour,q.prompt.includes('24-hour')?q.visual.h+12:q.visual.h);}
});
test('construction requires valid geometry, rather than any collection of clicks',()=>{
 assert.ok(validDrawing([[0,0],[4,0],[2,3]],3));assert.ok(!validDrawing([[0,0],[1,1],[2,2]],3));
 assert.ok(validDrawing([[0,0],[4,0],[4,3],[0,3]],4));assert.ok(!validDrawing([[0,0],[4,0],[3,3],[0,3]],4));assert.ok(!validDrawing([[0,0],[4,0],[4,0],[0,3]],4));
 assert.ok(answerMatches({format:'angle',answer:65},65));assert.ok(!answerMatches({format:'angle',answer:65},70));
 assert.ok(answerMatches({format:'bars',answer:[6,12]},[6,12]));assert.ok(!answerMatches({format:'bars',answer:[6,12]},[12,6]));
});
test('coordinates and Roman numerals are checked in their intended formats',()=>{
 assert.ok(answerMatches({format:'pair',answer:'3,5'},'(3, 5)'));assert.ok(!answerMatches({format:'pair',answer:'3,5'},'5,3'));
 assert.equal(roman(944),'CMXLIV');assert.equal(roman(1000),'M');assert.equal(roman(49),'XLIX');
});
