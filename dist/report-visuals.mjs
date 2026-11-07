import {esc} from './visuals.mjs?v=7.0.0';

// The radar shows curriculum coverage, never a school grade or an invented score.
export function yearProfileMarkup(report){
 const domains=report.domains.filter(d=>d.skills.length),cx=260,cy=182,r=112;
 const point=(i,value)=>{const a=-Math.PI/2+i*Math.PI*2/domains.length;return [cx+Math.cos(a)*r*value/100,cy+Math.sin(a)*r*value/100];};
 const points=values=>values.map((value,i)=>point(i,value).map(n=>n.toFixed(1)).join(',')).join(' ');
 const titles={number:'Number',calculation:'Add / subtract',multiplication:'Multiply / divide',fractions:'Fractions / decimals',measure:'Measure / time',geometry:'Shape / space',statistics:'Data',reasoning:'Ratio / algebra'};
 const axes=domains.map((d,i)=>{
  const [x,y]=point(i,100),[tx,ty]=point(i,143),anchor=tx>cx+20?'start':tx<cx-20?'end':'middle';
  return `<path d="M${cx} ${cy}L${x} ${y}"/><text class="radar-axis-title" x="${tx}" y="${ty+4}" text-anchor="${anchor}">${esc(titles[d.id])}</text><text class="radar-axis-number" x="${point(i,124)[0]}" y="${point(i,124)[1]+6}" text-anchor="middle">${i+1}</text>`;
 }).join('');
 const description=domains.map(d=>`${d.title}: ${d.securePercent}% secure, ${d.readyPercent}% ready for recall`).join('. ');
 const svg=(css,viewBox)=>`<svg class="${css}" viewBox="${viewBox}" role="img" aria-label="${esc(description)}"><g class="radar-grid">${[25,50,75,100].map(n=>`<polygon points="${points(domains.map(()=>n))}"/>`).join('')}${axes}</g><polygon class="radar-ready" points="${points(domains.map(d=>d.readyPercent))}"/><polygon class="radar-secure" points="${points(domains.map(d=>d.securePercent))}"/>${domains.map((d,i)=>{const [x,y]=point(i,d.securePercent);return `<circle cx="${x}" cy="${y}" r="3.5"/>`;}).join('')}</svg>`;
 return `<section class="year-profile" aria-label="Year ${report.year} learning profile"><div class="year-profile-heading"><div><span class="eyebrow">Your year at a glance</span><h3>Year ${report.year} learning profile</h3></div><span class="year-profile-total">${report.counts.secure}/${report.current.length}<small>skills secure</small></span></div>
  <div class="year-radar">${svg('radar-desktop','0 0 520 365')}${svg('radar-phone','110 30 300 300')}</div>
  <div class="radar-legend"><span><i class="secure"></i>Secure</span><span><i class="ready"></i>Ready for later recall</span></div><p class="radar-explainer">Share of this year’s skills with evidence. Untested skills have no score yet. Ready means independent success so far; secure also needs later recall.</p>
  <div class="year-topic-standards">${domains.map((d,i)=>`<div><b><span class="topic-axis-number">${i+1}. </span>${esc(d.title)}</b><span>${esc(d.status)}</span><small>${d.counts.secure}/${d.skills.length} secure · ${d.counts.unseen} not checked</small></div>`).join('')}</div>
  <p class="year-evidence-note">These are the game’s Year ${report.year} practice expectations. School assessments also include classroom and practical work.</p></section>`;
}
