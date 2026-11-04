import {EXTRA_SKILLS,makeExtraPool} from './curriculum.mjs';
export const VERSION = 1;
export const DAY = 86400000;
export const INTERVALS = [0, 1, 3, 7, 14, 30, 60];
export const SKILLS = [
  {id:'add10',title:'Addition within 10',category:'foundations',kind:'add',icon:'plus',color:'mint',description:'Little numbers. A strong start.',example:'4 + 3 = 7',priority:1},
  {id:'sub10',title:'Subtraction within 10',category:'foundations',kind:'sub',icon:'minus',color:'peach',description:'Take away and find what is left.',example:'8 − 3 = 5',priority:2},
  {id:'bonds10',title:'Make 10',category:'foundations',kind:'bonds',icon:'bond',color:'lavender',description:'Find the two parts that make 10.',example:'6 + □ = 10',priority:3},
  {id:'bridgeAdd',title:'Addition across 10',category:'crossing',kind:'add',icon:'bridge',color:'yellow',description:'Make 10, then add the rest.',example:'8 + 5 = 13',priority:4},
  {id:'bridgeSub',title:'Subtraction across 10',category:'crossing',kind:'sub',icon:'bridge',color:'blue',description:'Step back to 10, then keep going.',example:'14 − 6 = 8',priority:5},
  {id:'bonds20',title:'Make 20',category:'foundations',kind:'bonds',icon:'bond',color:'mint',description:'Build on the bonds you already know.',example:'13 + □ = 20',priority:6},
  {id:'doubles',title:'Doubles & halves',category:'foundations',kind:'doubles',icon:'double',color:'peach',description:'Two equal parts, both ways round.',example:'Double 7 = 14',priority:7},
  {id:'missing',title:'Missing numbers',category:'foundations',kind:'missing',icon:'question',color:'lavender',description:'Use what you know to find the gap.',example:'□ + 4 = 9',priority:8},
  {id:'place3',title:'Place value to 1,000',category:'number',kind:'place',icon:'blocks',color:'blue',description:'Explore hundreds, tens and ones.',example:'The 4 in 342 is worth 40',priority:9},
  {id:'place6',title:'Bigger place values',category:'number',kind:'place',icon:'blocks',color:'lavender',description:'See the value of each digit to 1,000,000.',example:'The 5 in 254,301 is worth 50,000',priority:10},
  ...Array.from({length:12},(_,i)=>({id:`table${i+1}`,title:`The ${i+1} times table`,category:'tables',kind:'mul',table:i+1,icon:'times',color:['mint','peach','lavender','yellow'][i%4],description:`Build every fact from ${i+1} × 1 to ${i+1} × 12.`,example:`${i+1} × 4 = ${(i+1)*4}`,priority:20+i})),
  {id:'mix348',title:'Mix the 3, 4 & 8s',category:'tables',kind:'mul',tables:[3,4,8],icon:'shuffle',color:'mint',description:'Keep your three focus tables flexible.',example:'3 × 7, 4 × 6, 8 × 9',priority:33},
  {id:'mixAll',title:'All tables mixed',category:'tables',kind:'mul',tables:Array.from({length:12},(_,i)=>i+1),icon:'shuffle',color:'lavender',description:'Switch confidently between tables 1 to 12.',example:'7 × 8, 12 × 9, 6 × 4',priority:34},
  {id:'div348',title:'Division: 3, 4 & 8',category:'tables',kind:'div',tables:[3,4,8],icon:'divide',color:'blue',description:'Turn your times-table facts around.',example:'24 ÷ 3 = 8',priority:35},
  {id:'divAll',title:'All division facts',category:'tables',kind:'div',tables:Array.from({length:12},(_,i)=>i+1),icon:'divide',color:'peach',description:'Use multiplication to help you divide.',example:'56 ÷ 7 = 8',priority:36},
  ...['Add','Sub'].flatMap(op=>[
    {digits:2,regroup:false,label:'2 digits · no exchange'},
    {digits:2,regroup:true,label:'2 digits · with exchange'},
    {digits:3,regroup:true,label:'3 digits · with exchange'},
    {digits:4,regroup:true,label:'4 digits · mixed exchanges'},
    {digits:5,regroup:true,label:'5 digits · mixed exchanges'},
  ].map((level,i)=>({id:`col${op}${i}`,title:`Column ${op==='Add'?'addition':'subtraction'}`,category:'columns',kind:op==='Add'?'coladd':'colsub',icon:op==='Add'?'plus':'minus',color:op==='Add'?'mint':'peach',description:level.label,...level,priority:40+i}))),
  ...EXTRA_SKILLS,
];
export const skillById = id => SKILLS.find(s=>s.id===id);
export const localDay = (now=Date.now()) => {const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const uid = () => globalThis.crypto?.randomUUID?.() || `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
export function newProfile(name,year=3,avatar='sprout') {return {id:uid(),name:name.trim().slice(0,24),year:Number(year),avatar,createdAt:Date.now(),facts:{},sessions:[],records:{}};}
export function initialData(){return {version:VERSION,activeId:null,profiles:[newProfile('Ace',3,'sprout'),newProfile('Carter',3,'flower'),newProfile('Cruz',5,'tree')],settings:{sound:false,reduceMotion:false}};}

function seeded(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export function hasRegroup(a,b,op){
  let carry=0;
  while(a>0||b>0){const x=a%10,y=b%10;if(op==='+'){if(x+y+carry>=10)return true;carry=0;}else if(x-carry<y)return true;a=Math.floor(a/10);b=Math.floor(b/10);}
  return false;
}
const poolCache = new Map();
export function questionPool(id){
  if(poolCache.has(id))return poolCache.get(id);
  const s=skillById(id);if(!s) return [];
  if(s.extra){const p=makeExtraPool(id);poolCache.set(id,p);return p;}
  const pool=[];
  const add=(a,b,op,answer,extra={})=>pool.push({a,b,op,answer,key:`${op}:${a}:${b}:${extra.blank||''}`,skillId:id,...extra});
  if(id==='add10'){for(let a=0;a<10;a++)for(let b=0;b<10;b++)if(a+b<=10)add(a,b,'+',a+b);}
  if(id==='sub10')for(let a=0;a<10;a++)for(let b=0;b<=a;b++)add(a,b,'−',a-b);
  if(id==='bridgeAdd')for(let a=1;a<10;a++)for(let b=1;b<10;b++)if(a+b>10)add(a,b,'+',a+b);
  if(id==='bridgeSub')for(let a=11;a<20;a++)for(let b=1;b<10;b++)if(b>a%10)add(a,b,'−',a-b);
  if(s.kind==='bonds'){const total=id==='bonds10'?10:20;for(let a=0;a<=total;a++)add(a,total,'bond',total-a,{blank:'b',total});}
  if(id==='doubles')for(let a=0;a<=10;a++){add(a,a,'double',2*a);add(2*a,2,'half',a);}
  if(id==='missing')for(let a=0;a<=10;a++)for(let b=0;b<=10-a;b++){add(a,b,'missing+',a,{blank:'a',total:a+b});if(a+b>0)add(a+b,b,'missing−',b,{blank:'b',total:a});}
  if(s.kind==='mul'||s.kind==='div')for(const t of s.tables||[s.table])for(let n=1;n<=12;n++){
    if(s.kind==='mul')add(t,n,'×',t*n,{key:`×:${Math.min(t,n)}:${Math.max(t,n)}`});
    else add(t*n,t,'÷',n);
  }
  if(s.kind==='place'){
    const rnd=seeded(id==='place3'?33:66),digits=id==='place3'?3:6;
    for(let i=0;i<72;i++){const n=Math.floor(rnd()*(10**digits-10**(digits-1)))+10**(digits-1);const pos=i%digits,power=10**pos,digit=Math.floor(n/power)%10;add(n,digit,'place',digit*power,{power,key:`place:${n}:${power}`});}
    if(id==='place6')add(1000000,1,'place',1000000,{power:1000000,key:'place:1000000:1000000'});
  }
  if(s.category==='columns'){
    const rnd=seeded(s.digits*919+(s.kind==='coladd'?13:71)+(s.regroup?8:0)),op=s.kind==='coladd'?'+':'−',lo=10**(s.digits-1),hi=10**s.digits-1;
    let tries=0;
    while(pool.length<48&&tries++<50000){let a=Math.floor(rnd()*(hi-lo+1))+lo,b=Math.floor(rnd()*(hi-lo+1))+lo;if(op==='−'&&a<b)[a,b]=[b,a];if(hasRegroup(a,b,op)==s.regroup)add(a,b,op,op==='+'?a+b:a-b,{key:`column${op}:${a}:${b}`});}
    if(s.kind==='colsub'&&s.regroup&&s.digits>=3){const a=10**(s.digits-1),b=27;add(a,b,'−',a-b,{key:`column−:${a}:${b}`});}
  }
  const unique=[...new Map(pool.map(q=>[q.key,q])).values()];poolCache.set(id,unique);return unique;
}

export function poolForSkills(ids){return [...new Map(ids.flatMap(questionPool).map(q=>[q.key,q])).values()];}
export function selectQuestion(profile,ids,seen=[],now=Date.now(),rng=Math.random){
  const pool=poolForSkills(ids),recent=new Set(seen.slice(-3)),counts=new Map();for(const k of seen)counts.set(k,(counts.get(k)||0)+1);
  let choices=pool.filter(q=>!recent.has(q.key));if(!choices.length)choices=pool;
  const weights=choices.map(q=>{const f=profile.facts[q.key];let w=!f?4:f.due<=now?9:1;if(f&&f.lastCorrect===false)w*=2;
    // Keep zero/one facts in the bank without letting easy identities dominate training.
    // Due reviews and actual mistakes retain their full priority, including simple facts.
    if(!f||f.due>now){if(['+','−'].includes(q.op)&&(q.a===0||q.b===0))w*=.15;else if(['+','−'].includes(q.op)&&(q.a===1||q.b===1))w*=.6;if(q.op==='×'&&(q.a===1||q.b===1))w*=.25;}
    w/=1+(counts.get(q.key)||0)*4;return w;});
  let target=rng()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<choices.length;i++){target-=weights[i];if(target<=0)return {...choices[i]};}return {...choices.at(-1)};
}
export function recordFact(profile,q,correct,assisted=false,ms=0,now=Date.now()){
  const f=profile.facts[q.key]||{attempts:0,correct:0,stage:0,due:now,days:[],history:[],assisted:0};
  const day=localDay(now);f.attempts++;f.correct+=correct?1:0;f.assisted+=assisted?1:0;f.lastAt=now;f.lastCorrect=correct&&!assisted;f.history=[...f.history.slice(-9),{correct:correct&&!assisted,ms,day}];
  if(correct&&!assisted){
    if(!f.days.includes(day))f.days=[...f.days.slice(-11),day];
    if(f.lastAdvanceDay!==day&&f.due<=now){f.stage=Math.min(6,f.stage+1);f.lastAdvanceDay=day;f.due=now+INTERVALS[f.stage]*DAY;}
  }else{f.stage=0;f.due=now;f.lastAdvanceDay=null;}
  profile.facts[q.key]=f;return f;
}
export function factSecure(f){return !!f&&f.stage>=3&&f.days.length>=3&&f.history.slice(-3).every(h=>h.correct);}
export function skillStats(profile,id,now=Date.now()){
  const pool=questionPool(id),facts=pool.map(q=>profile.facts[q.key]),seen=facts.filter(Boolean).length,secure=facts.filter(factSecure).length,due=facts.filter(f=>f&&f.due<=now).length;
  const hs=facts.filter(Boolean).flatMap(f=>f.history),acc=hs.length?Math.round(100*hs.filter(h=>h.correct).length/hs.length):null;
  return {total:pool.length,seen,secure,due,accuracy:acc,percent:pool.length?Math.round(100*secure/pool.length):0,status:secure>=Math.ceil(pool.length*.9)?'Secure':seen?'Growing':'Ready to grow'};
}
export function recommendedIds(profile){return profile.year>=5?['add10','sub10','bonds10','bridgeAdd','bridgeSub','table3','table4','table8','mixAll','divAll','place6','colAdd4','colSub4']:['add10','sub10','bonds10','bridgeAdd','bridgeSub','table3','table4','table8','mix348','div348','place3','colAdd2','colSub2'];}
export function dueQuestions(profile,now=Date.now()){return poolForSkills(SKILLS.map(s=>s.id)).filter(q=>profile.facts[q.key]?.due<=now);}
export function dailySkills(profile){
  const ids=recommendedIds(profile),due=dueQuestions(profile).map(q=>q.skillId);
  const foundation=ids.filter(id=>!['tables','columns'].includes(skillById(id).category));
  const next=foundation.find(id=>skillStats(profile,id).status!=='Secure')||foundation[0];
  const tables=profile.year>=5?[3,4,8,6,7,9,12,2,5,10,11,1]:[3,4,8];
  const table=tables.map(t=>`table${t}`).sort((a,b)=>skillStats(profile,a).seen-skillStats(profile,b).seen)[0];
  const chosen=[...new Set([next,table,...due,foundation.find(id=>id!==next)])];return chosen.filter(Boolean).slice(0,3);
}
export function profileSummary(profile,now=Date.now()){
  const sessions=profile.sessions.filter(s=>s.attempts>0),facts=Object.values(profile.facts),today=localDay(now),todaySessions=sessions.filter(s=>localDay(s.endedAt)===today);
  const days=[...new Set(sessions.map(s=>localDay(s.endedAt)))];let streak=0;let cursor=now;
  if(!days.includes(today))cursor-=DAY;while(days.includes(localDay(cursor))){streak++;cursor-=DAY;}
  return {sessions:sessions.length,minutes:Math.floor(sessions.reduce((n,s)=>n+s.elapsed,0)/60),todayCorrect:todaySessions.reduce((n,s)=>n+s.correct,0),todayMinutes:Math.floor(todaySessions.reduce((n,s)=>n+s.elapsed,0)/60),factsSeen:facts.length,factsSecure:facts.filter(factSecure).length,skillsSecure:SKILLS.filter(s=>skillStats(profile,s.id,now).status==='Secure').length,due:dueQuestions(profile,now).length,streak,days};
}

export function columnSteps(q){
  const places=['ones','tens','hundreds','thousands','ten-thousands','hundred-thousands'];
  const digits=String(q.a).split('').reverse().map(Number),other=String(q.b).split('').reverse().map(Number),n=Math.max(digits.length,other.length),steps=[];let carry=0;
  if(q.op==='+')for(let i=0;i<n;i++){const a=digits[i]||0,b=other[i]||0,total=a+b+carry,incoming=carry;carry=Math.floor(total/10);steps.push({place:places[i],a,b,incoming,result:total%10,carry,text:`${places[i][0].toUpperCase()+places[i].slice(1)}: ${a} + ${b}${incoming?' + 1 carried':''} = ${total}. Write ${total%10}${carry?`; carry 1 ${places[i+1].replace(/s$/,'')} into the next column`:''}.`});} 
  else for(let i=0;i<n;i++){
    let a=digits[i]||0,b=other[i]||0,exchanged=false,from=-1;
    if(a<b){let j=i+1;while(digits[j]===0)j++;from=j;digits[j]--;for(let k=j-1;k>i;k--)digits[k]=9;digits[i]+=10;a=digits[i];exchanged=true;}
    steps.push({place:places[i],a,b,result:a-b,exchanged,from,text:`${places[i][0].toUpperCase()+places[i].slice(1)}: ${exchanged?`exchange 1 ${places[from].replace(/s$/,'')} for smaller units${from>i+1?' through the zero columns':''}. Now `:''}${a} − ${b} = ${a-b}. Write ${a-b}.`});
  }
  if(q.op==='+'&&carry)steps.push({place:places[n],result:carry,text:`Write the final carried ${carry} in the ${places[n]} column.`});
  return steps;
}
export function explain(q){
  const {a,b,answer}=q;
  if(q.key.startsWith('column'))return {title:'One column at a time',steps:['Line up the place values. Begin with the ones on the right.',...columnSteps(q).map(s=>s.text),`So ${a.toLocaleString()} ${q.op} ${b.toLocaleString()} = ${answer.toLocaleString()}. Check with the inverse operation.`],visual:'column'};
  if(q.op==='+'&&a+b>10){const jump=10-a,rest=b-jump;return {title:'Make 10 first',steps:[`${a} needs ${jump} more to reach 10.`,`Split ${b} into ${jump} and ${rest}.`,`${a} + ${jump} = 10. Then 10 + ${rest} = ${answer}.`],visual:'tenframe'};}
  if(q.op==='−'&&a>10&&answer<10){const jump=a-10,rest=b-jump;return {title:'Go back through 10',steps:[`Split ${b} into ${jump} and ${rest}.`,`${a} − ${jump} = 10.`,`Then 10 − ${rest} = ${answer}.`],visual:'tenframe'};}
  if(q.op==='×')return {title:'Equal groups make a total',steps:[`Think of ${a} equal groups of ${b}.`,`${Array(Math.min(a,12)).fill(b).join(' + ')} = ${answer}.`,`You can turn it around: ${b} × ${a} = ${answer}.`],visual:'array'};
  if(q.op==='÷')return {title:'Use a multiplication fact',steps:[`${a} shared into groups of ${b}. How many groups?`,`${b} × ${answer} = ${a}.`,`So ${a} ÷ ${b} = ${answer}.`],visual:'groups'};
  if(q.op==='bond')return {title:`Find the part that makes ${q.total}`,steps:[`The whole is ${q.total}. One part is ${a}.`,`${q.total} − ${a} = ${answer}.`,`So ${a} + ${answer} = ${q.total}.`],visual:'tenframe'};
  if(q.op==='double')return {title:'Add two equal parts',steps:[`Double ${a} means ${a} + ${a}.`,`${a} + ${a} = ${answer}.`],visual:'tenframe'};
  if(q.op==='half')return {title:'Split into two equal parts',steps:[`Half of ${a} is one of two equal parts.`,`${answer} + ${answer} = ${a}, so half is ${answer}.`],visual:'groups'};
  if(q.op==='missing+')return {title:'Use the inverse',steps:[`The whole is ${q.total}. The known part is ${b}.`,`${q.total} − ${b} = ${answer}.`,`Check: ${answer} + ${b} = ${q.total}.`],visual:'tenframe'};
  if(q.op==='missing−')return {title:'Find how much was taken away',steps:[`Start with ${a} and finish with ${q.total}.`,`${a} − ${q.total} = ${answer}.`,`Check: ${a} − ${answer} = ${q.total}.`],visual:'tenframe'};
  if(q.op==='place'){const place={1:'ones',10:'tens',100:'hundreds',1000:'thousands',10000:'ten-thousands',100000:'hundred-thousands',1000000:'millions'}[q.power];return {title:'Every digit has a place',steps:[`The highlighted ${b} is in the ${place} column.`,`Its value is ${b} × ${q.power.toLocaleString()} = ${answer.toLocaleString()}.`],visual:'place'};}
  return {title:q.op==='+'?'Put the two parts together':'Take away from the whole',steps:[q.op==='+'?`Start with ${a}. Add ${b} more.`:`Start with ${a}. Take away ${b}.`,`${a} ${q.op} ${b} = ${answer}.`,q.op==='+'?`Check: ${answer} − ${b} = ${a}.`:`Check: ${answer} + ${b} = ${a}.`],visual:'tenframe'};
}

export function validateImport(raw){
  if(!raw||raw.version!==VERSION||!Array.isArray(raw.profiles)||!raw.profiles.length||raw.profiles.length>100)throw new Error('Choose a Matchday Maths backup file (version 1).');
  const seen=new Set();
  for(const p of raw.profiles){if(!p||typeof p.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(p.id)||seen.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>24||![3,5,0].includes(p.year)||!['sprout','flower','tree','sun'].includes(p.avatar)||!Array.isArray(p.sessions)||p.sessions.length>500||!p.facts||Array.isArray(p.facts)||typeof p.facts!=='object')throw new Error('This backup has an invalid pupil profile.');seen.add(p.id);if(p.goalsTotal!==undefined&&(!Number.isFinite(p.goalsTotal)||p.goalsTotal<0))throw new Error('This backup contains invalid goals.');if(p.pointsTotal!==undefined&&(!Number.isFinite(p.pointsTotal)||p.pointsTotal<0))throw new Error('This backup contains invalid points.');
    if(p.trainingSeconds!==undefined&&![60,120,180].includes(p.trainingSeconds))throw new Error('This backup contains an invalid training clock.');
    if(p.placementProgress!==undefined&&(!Number.isInteger(p.placementProgress)||p.placementProgress<0||p.placementProgress>12))throw new Error('This backup contains invalid warm-up progress.');
    if(p.learning){
      if(typeof p.learning!=='object'||Array.isArray(p.learning))throw new Error('This backup contains invalid learning records.');
      for(const [id,st] of Object.entries(p.learning))if(!skillById(id)||!st||!Number.isInteger(st.n)||st.n<0||!Number.isInteger(st.correct)||st.correct<0||st.correct>st.n||!Array.isArray(st.recent)||st.recent.length>20||!Array.isArray(st.keys)||!Array.isArray(st.days)||!Array.isArray(st.probes)||!Number.isFinite(st.firstAt)||st.recent.some(r=>!r||typeof r.correct!=='boolean'||!Number.isFinite(r.ms)||r.ms<0||!Number.isFinite(r.at)))throw new Error('This backup contains invalid learning records.');
    }
    for(const [key,f] of Object.entries(p.facts)){if(['__proto__','prototype','constructor'].includes(key)||!f||typeof f!=='object'||!Number.isInteger(f.attempts)||f.attempts<0||!Number.isInteger(f.correct)||f.correct<0||f.correct>f.attempts||!Number.isInteger(f.stage)||f.stage<0||f.stage>6||!Number.isFinite(f.due)||!Array.isArray(f.days)||f.days.length>12||f.days.some(d=>typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d))||!Array.isArray(f.history)||f.history.length>10||f.history.some(h=>!h||typeof h.correct!=='boolean'||!Number.isFinite(h.ms)||h.ms<0))throw new Error('This backup contains invalid progress.');}
    if(p.records&&(typeof p.records!=='object'||Array.isArray(p.records)||Object.keys(p.records).length>500))throw new Error('This backup contains invalid records.');
    for(const s of [...p.sessions,...Object.values(p.records||{})])if(!s||(s.manual!==undefined&&s.manual!==null&&!skillById(s.manual))||typeof s.id!=='string'||!Array.isArray(s.skillIds)||!s.skillIds.length||s.skillIds.some(id=>!skillById(id))||!Number.isInteger(s.attempts)||s.attempts<0||!Number.isInteger(s.correct)||s.correct<0||s.correct>s.attempts||!Number.isFinite(s.points)||s.points<0||!Number.isFinite(s.duration)||!Number.isFinite(s.elapsed)||s.elapsed<0||!Number.isFinite(s.endedAt)||typeof s.complete!=='boolean'||!['timed','practice','check','review'].includes(s.mode))throw new Error('This backup contains invalid sessions.');
  }
  return {version:VERSION,profiles:raw.profiles,activeId:seen.has(raw.activeId)?raw.activeId:null,settings:{sound:!!raw.settings?.sound,reduceMotion:!!raw.settings?.reduceMotion}};
}
