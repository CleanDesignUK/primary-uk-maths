const small=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
export function britishNumber(value){
 const n=Number(value);if(!Number.isFinite(n))return String(value);if(n<0)return 'minus '+britishNumber(-n);
 if(!Number.isInteger(n)){const [whole,decimal='']=n.toLocaleString('en-GB',{useGrouping:false,maximumFractionDigits:20}).split('.');return britishNumber(Number(whole))+' point '+[...decimal].map(x=>small[Number(x)]).join(' ');}
 if(n<20)return small[n];if(n<100)return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(n/10)]+(n%10?' '+small[n%10]:'');
 if(n<1000)return small[Math.floor(n/100)]+' hundred'+(n%100?' and '+britishNumber(n%100):'');
 for(const [size,name]of [[1000000000,'billion'],[1000000,'million'],[1000,'thousand']])if(n>=size)return britishNumber(Math.floor(n/size))+' '+name+(n%size?(n%size<100?' and ':' ')+britishNumber(n%size):'');
 return String(value);
}
export function spokenMath(value){
 let s=String(value??'').replace(/<[^>]*>/g,' ').replace(/(?<=\d),(?=\d)/g,'');
 s=s.replace(/\b(\d+)\/(\d+)\b/g,(_,n,d)=>{const denom={2:['half','halves'],3:['third','thirds'],4:['quarter','quarters'],5:['fifth','fifths'],8:['eighth','eighths'],10:['tenth','tenths'],100:['hundredth','hundredths']}[d];return denom?`${britishNumber(n)} ${denom[Number(n)===1?0:1]}`:`${britishNumber(n)} over ${britishNumber(d)}`;});
 s=s.replace(/\b\d+(?:\.\d+)?\b/g,n=>britishNumber(n)).replace(/cm²/g,' square centimetres ').replace(/m²/g,' square metres ').replace(/cm³/g,' cubic centimetres ').replace(/m³/g,' cubic metres ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/-(?=\d)/g,' minus ').replace(/-/g,' ').replace(/\+/g,' plus ').replace(/=/g,' equals ').replace(/□|\?/g,' missing number ').replace(/%/g,' per cent ').replace(/°C/g,' degrees Celsius ').replace(/°/g,' degrees ').replace(/\s+/g,' ').trim();
 return s;
}
export function britishVoices(voices=[]){return voices.filter(v=>/^en[-_]GB$/i.test(v.lang)).sort((a,b)=>Number(!!b.localService)-Number(!!a.localService)||a.name.localeCompare(b.name));}
export function selectBritishVoice(voices=[],preferredURI=''){const available=britishVoices(voices);return available.find(v=>v.voiceURI===preferredURI)||available[0]||null;}
