const ROUND_SIZE = 10;
const DAY = 86_400_000;
const names = ['Comet','Rovers','Bolt','Falcon','Ranger','Orbit','Striker','Jet','Stag','Blaze','Puma','Meteor'];
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const error = (message,status=400) => json({error:message},status);

export function seasonOf(now) {
  const date = new Date(now);
  date.setUTCHours(0,0,0,0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay()+6)%7);
  return date.toISOString().slice(0,10);
}

// Each division keeps the same topic mix and operand ranges. A new match draws new numbers.
export function worldQuestions(year,tier,seed) {
  let state=seed>>>0;
  const int=(lo,hi)=>{
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    return lo+Math.floor(state/2**32*(hi-lo+1));
  };
  const pick=items=>items[int(0,items.length-1)];
  const arithmetic=(a,b,op,answer)=>({prompt:op==='÷'?'Divide':op==='×'?'Multiply':op==='−'?'Subtract':'Add',expression:`${a} ${op} ${b}`,a,b,op,answer});
  return Array.from({length:ROUND_SIZE},(_,index)=>{
    const slot=index%5;
    if(year===1){
      const max=tier===0?10:20;
      const a=int(3,max-2),b=int(1,Math.min(9,max-a));
      if(slot===2)return {prompt:`Make ${max}`,expression:`${a} + □ = ${max}`,op:'+',answer:max-a};
      if(slot===4&&tier>0)return {prompt:'How many altogether?',expression:`${int(2,4)} + ${b} + 2`,op:'+',answer:null};
      return slot%2?arithmetic(a,b,'−',Math.max(a,b)-Math.min(a,b)):arithmetic(a,b,'+',a+b);
    }
    const table=pick(year===2?[2,5,10]:year===3?[3,4,8]:[3,4,6,7,8,9,11,12]);
    const factor=int(tier===0?2:4,tier===0?9:12);
    if(slot===0&&year<=4)return arithmetic(table,factor,'×',table*factor);
    if(slot===1&&year<=4)return arithmetic(table*factor,table,'÷',factor);
    if(year===2){
      const a=int(20,64),b=int(7,tier===0?19:35);
      return slot===3?arithmetic(a,b<=a?b:a-1,'−',a-Math.min(b,a-1)):arithmetic(a,b,'+',a+b);
    }
    const lo=year===3?105:year===4?1020:110;
    const hi=year===3?999:year===4?9999:tier===0?899:4999;
    const a=int(lo,hi),b=int(year>=4?21:12,year>=4?599:90);
    if(slot===2)return arithmetic(a,b,'+',a+b);
    if(slot===3){const top=Math.max(a,b),bottom=Math.min(a,b);return arithmetic(top,bottom,'−',top-bottom);}
    if(year===3)return {prompt:'Find one quarter',expression:`¼ of ${factor*4}`,answer:factor,op:'÷'};
    if(year===4)return arithmetic(int(14,tier===0?89:399),table, '×',null);
    if(slot===0){const multiplier=tier===0?int(3,9):int(11,tier===1?29:49);return arithmetic(a,multiplier,'×',a*multiplier);}
    if(slot===1){const divisor=year===6&&tier>0?int(11,39):int(3,9),quotient=int(12,tier===0?69:149);return arithmetic(divisor*quotient,divisor,'÷',quotient);}
    const percent=pick(tier===0?[10,25,50]:[15,20,25,35,40,60,75]);
    const whole=int(2,15)*20;
    return {prompt:'Find the percentage',expression:`${percent}% of ${whole}`,answer:whole*percent/100,op:'÷'};
  }).map(question=>{
    if(question.answer===null){
      const answer=question.op==='×'?question.a*question.b:question.expression.split('+').reduce((sum,value)=>sum+Number(value),0);
      return {...question,answer};
    }
    if(question.op==='−'&&question.a<question.b){const {a,b}=question;return arithmetic(b,a,'−',b-a);}
    return question;
  });
}

function publicQuestion(match,index) {
  const {answer,...question}=worldQuestions(match.year,match.tier,match.seed)[index];
  return question;
}
function matchState(match) {
  return {id:match.id,year:match.year,tier:match.tier,index:match.answered,correct:match.correct,target:ROUND_SIZE,expiresAt:match.expires_at,question:match.answered<ROUND_SIZE?publicQuestion(match,match.answered):null};
}
function validGroup(year,tier){return Number.isInteger(year)&&year>=1&&year<=6&&Number.isInteger(tier)&&tier>=0&&tier<=2;}
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
async function playerFor(request,db){
  const token=request.headers.get('X-Matchday-Player')||'';
  return /^[a-f0-9]{64}$/.test(token)?db.prepare('SELECT token_hash, alias FROM world_players WHERE token_hash = ?').bind(await digest(token)).first():null;
}
async function unlockedTiers(db,player,year){
  const {results}=await db.prepare('SELECT DISTINCT tier FROM world_matches WHERE player = ? AND year = ? AND correct >= 8 AND answered = 10 AND finished_at > 0').bind(player,year).all();
  const tiers=results.map(row=>row.tier);
  return [0,...(tiers.includes(0)?[1]:[]),...(tiers.includes(1)?[2]:[])];
}

export async function worldRequest(request,env,now=Date.now()) {
  const db=env.DB;
  if(!db)return error('The World League is unavailable on this host.',503);
  const url=new URL(request.url),route=url.pathname.split('/').at(-1);
  const year=Number(url.searchParams.get('year')||1),tier=Number(url.searchParams.get('tier')||0);
  if(request.method==='GET'&&route==='board'){
    if(!validGroup(year,tier))return error('Choose a year and a division.');
    const season=seasonOf(now);
    const {results}=await db.prepare(`WITH best AS (
      SELECT p.alias,m.correct,m.finished_at-m.started_at AS elapsed,
        ROW_NUMBER() OVER(PARTITION BY m.player ORDER BY m.correct DESC,m.finished_at-m.started_at ASC) AS position
      FROM world_matches m JOIN world_players p ON p.token_hash=m.player
      WHERE m.season=? AND m.year=? AND m.tier=? AND m.answered=10 AND m.finished_at>0
    ) SELECT alias,correct,elapsed FROM best WHERE position=1 ORDER BY correct DESC,elapsed ASC,alias ASC LIMIT 50`).bind(season,year,tier).all();
    return json({season,year,tier,rows:results});
  }
  if(request.method==='POST'){
    const origin=request.headers.get('Origin');
    if(origin&&origin!==url.origin)return error('Open the academy to play.',403);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return error('Use the academy to play.',415);
  }
  if(request.method==='POST'&&route==='join'){
    const raw=crypto.getRandomValues(new Uint8Array(32));
    const token=[...raw].map(byte=>byte.toString(16).padStart(2,'0')).join('');
    const alias=`${names[raw[0]%names.length]} ${token.slice(0,6).toUpperCase()}`;
    await db.prepare('INSERT INTO world_players(token_hash,alias,created_at) VALUES(?,?,?)').bind(await digest(token),alias,now).run();
    return json({token,alias},201);
  }
  const player=await playerFor(request,db);
  if(!player)return error('Join the World League first.',401);
  if(request.method==='POST'&&route==='leave'){
    await db.prepare('DELETE FROM world_players WHERE token_hash=?').bind(player.token_hash).run();
    return json({left:true});
  }
  if(request.method==='GET'&&route==='me'){
    if(!validGroup(year,tier))return error('Choose a year and a division.');
    return json({alias:player.alias,unlocked:await unlockedTiers(db,player.token_hash,year)});
  }
  if(request.method!=='POST'||!['start','shot'].includes(route))return error('Unknown league action.',404);
  const bodyText=await request.text();
  if(bodyText.length>1024)return error('That answer is too long.',413);
  let body;
  try{body=JSON.parse(bodyText);}catch{return error('Could not read that answer.');}
  if(!body||typeof body!=='object')return error('Choose a match first.');
  if(route==='start'){
    if(!validGroup(body.year,body.tier))return error('Choose a year and a division.');
    if(!(await unlockedTiers(db,player.token_hash,body.year)).includes(body.tier))return error('Score eight in the previous division to qualify.',403);
    await db.prepare('UPDATE world_matches SET finished_at=-1 WHERE player=? AND finished_at IS NULL AND expires_at<?').bind(player.token_hash,now).run();
    const active=await db.prepare('SELECT * FROM world_matches WHERE player=? AND finished_at IS NULL').bind(player.token_hash).first();
    if(active)return json(matchState(active));
    const count=await db.prepare('SELECT COUNT(*) AS n FROM world_matches WHERE player=? AND started_at>=?').bind(player.token_hash,now-DAY).first();
    if(count.n>=6)return error('You’ve played six ranked matches today. Coach practice is open.',429);
    const id=crypto.randomUUID(),seed=crypto.getRandomValues(new Uint32Array(1))[0];
    const expires=now+(body.year>=5?420_000:240_000);
    await db.prepare('INSERT OR IGNORE INTO world_matches(id,player,year,tier,season,seed,started_at,expires_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,player.token_hash,body.year,body.tier,seasonOf(now),seed,now,expires).run();
    const match=await db.prepare('SELECT * FROM world_matches WHERE player=? AND finished_at IS NULL').bind(player.token_hash).first();
    if(!match)return error('Could not start a ranked match.',503);
    return json(matchState(match));
  }
  if(typeof body.id!=='string'||body.id.length>40||!Number.isInteger(body.index)||body.index<0||body.index>=ROUND_SIZE||
     typeof body.answer!=='string'||!/^\s*-?\d+(?:\.\d+)?\s*$/.test(body.answer)||body.answer.length>20)return error('Enter a number for the current shot.');
  let match=await db.prepare('SELECT * FROM world_matches WHERE id=? AND player=?').bind(body.id,player.token_hash).first();
  if(!match)return error('This match could not be found.',404);
  const target=worldQuestions(match.year,match.tier,match.seed)[body.index].answer;
  if(body.index===match.answered-1&&match.finished_at!==-1){
    return json({...matchState(match),goal:!!match.last_correct,answer:target,complete:match.answered===ROUND_SIZE});
  }
  if(match.finished_at||now>=match.expires_at||body.index!==match.answered)return error('This shot is closed. Open the current match.',409);
  const goal=Math.abs(Number(body.answer)-target)<1e-7;
  const finished=body.index===ROUND_SIZE-1?now:null;
  const update=await db.prepare(`UPDATE world_matches SET answered=answered+1,correct=correct+?,last_correct=?,finished_at=?
    WHERE id=? AND player=? AND answered=? AND finished_at IS NULL AND expires_at>?`).bind(Number(goal),Number(goal),finished,body.id,player.token_hash,body.index,now).run();
  if(update.meta.changes!==1)return error('This shot has already been scored.',409);
  match={...match,answered:match.answered+1,correct:match.correct+Number(goal),finished_at:finished};
  return json({...matchState(match),goal,answer:target,complete:!!finished,unlocked:finished?await unlockedTiers(db,player.token_hash,match.year):undefined});
}
