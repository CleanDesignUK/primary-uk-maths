import {esc} from './visuals.mjs?v=7.1.0';

const colours=['#147d7a','#346dc1','#8751b5','#9e5712','#ba4964','#487e35','#396c9c','#a65228'];
// Recent accuracy and year-level security are deliberately separate measures.
export function yearProfileMarkup(report){
 const domains=report.domains.filter(d=>d.skills.length||d.practiceAttempts),cx=200,cy=190,r=132,n=domains.length;
 const point=(angle,value)=>[cx+Math.cos(angle)*r*value/100,cy+Math.sin(angle)*r*value/100];
 const axis=i=>-Math.PI/2+i*Math.PI*2/n;
 const str=pts=>pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
 const rings=[25,50,75,100].map(value=>`<polygon points="${str(domains.map((_,i)=>point(axis(i)-Math.PI/n,value)))}"/>`).join('');
 const attempts=domains.reduce((sum,d)=>sum+d.practiceAttempts,0),correct=domains.reduce((sum,d)=>sum+d.practiceIndependent,0);
 const description=domains.map(d=>`${d.title}: ${d.practiceAttempts?`${d.practiceIndependent} of ${d.practiceAttempts} recent answers independent`:'not checked'}, ${d.counts.secure} of ${d.skills.length} Year ${report.year} skills secure`).join('. ');
 const sectors=domains.map((d,i)=>{
  const a=axis(i),colour=colours[i%colours.length],value=d.practicePercent??0,[x,y]=point(a,value),[lx,ly]=point(a,120);
  return `${d.practiceAttempts?`<polygon class="radar-practice-sector" points="${str([[cx,cy],point(a-Math.PI/n,value),point(a+Math.PI/n,value)])}" fill="${colour}" fill-opacity=".35" stroke="${colour}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="${colour}"/>`:''}<circle cx="${lx}" cy="${ly}" r="15" fill="${d.practiceAttempts?colour:'#e8edf2'}"/><text x="${lx}" y="${ly+6}" text-anchor="middle" class="radar-topic-index ${d.practiceAttempts?'has-evidence':''}">${i+1}</text>`;
 }).join('');
 return `<section class="year-profile" aria-label="Year ${report.year} learning profile"><div class="year-profile-heading"><div><span class="eyebrow">Your year at a glance</span><h3>Year ${report.year} learning profile</h3></div><span class="year-profile-total">${report.counts.secure}/${report.current.length}<small>skills secure</small></span></div>
 <div class="learning-profile-layout"><div class="practice-chart"><h4>Recent practice</h4><p>${attempts?`${correct}/${attempts} answers on your own`:'Play your warm-up to start your profile'}</p><svg class="practice-radar" viewBox="0 0 400 375" role="img" aria-label="${esc(description)}"><g class="radar-grid">${rings}${domains.map((_,i)=>{const [x,y]=point(axis(i)-Math.PI/n,100);return `<path d="M${cx} ${cy}L${x} ${y}"/>`;}).join('')}</g>${sectors}<text x="${cx+8}" y="${cy-r+17}" class="radar-scale">100%</text><text x="${cx+8}" y="${cy-r*.5+5}" class="radar-scale">50%</text></svg><div class="radar-legend"><span><i class="practice"></i>Independent answers</span><span><i class="unseen"></i>Not checked</span></div></div>
 <div class="year-topic-standards">${domains.map((d,i)=>`<article style="--topic-colour:${colours[i%colours.length]}"><div class="topic-title"><span class="topic-number">${i+1}</span><h4>${esc(d.title)}</h4></div><p class="topic-practice">${d.practiceAttempts?`<b>${d.practiceIndependent}/${d.practiceAttempts}</b> on your own`:'Not checked yet'}</p><div class="topic-practice-bar"><i style="width:${d.practicePercent??0}%"></i></div>${d.foundationAttempts?`<p class="foundation-evidence">Includes ${d.foundationAttempts} earlier-year foundation ${d.foundationAttempts===1?'answer':'answers'}</p>`:''}<p class="topic-status">${esc(d.status==='Not checked'?`Year ${report.year} skills not checked`:d.status)}</p><span class="topic-security">${d.counts.secure}/${d.skills.length} Year ${report.year} skills secure</span></article>`).join('')}</div></div>
 <p class="radar-explainer">The coloured chart shows independent answers from recent quizzes, including warm-ups and earlier foundations. Help and incorrect answers stay in the count. Each skill uses up to eight answers from the last 30 days. An untested topic has no score yet. This is practice accuracy, not a year grade.</p>
 <p class="year-evidence-note">Secure needs varied independent answers and recall on later days. These are the game’s Year ${report.year} practice expectations. School assessments also include classroom and practical work.</p></section>`;
}
