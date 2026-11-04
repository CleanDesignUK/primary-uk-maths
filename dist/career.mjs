export const SKIN_TONES={sand:'#e7b88c',warm:'#c58c62',brown:'#9a6544',deep:'#65432f',rose:'#f0c8aa'};
export const HAIR_COLOURS={brown:'#503b2b',black:'#272824',blond:'#d3ad61',ginger:'#a75532',silver:'#c3c7bd'};
export const POSITIONS=['Striker','Midfielder','Defender','Goalkeeper'];
export const ITEMS=[
 {id:'kit-home',slot:'kit',name:'Academy home',price:0,level:1,colour:'#2d704c',accent:'#d4f36a'},
 {id:'kit-blue',slot:'kit',name:'Electric away',price:25,level:2,colour:'#466ccd',accent:'#e8eeff'},
 {id:'kit-red',slot:'kit',name:'Red captain',price:40,level:3,colour:'#bd4e43',accent:'#f6dfad'},
 {id:'kit-purple',slot:'kit',name:'Midnight purple',price:65,level:4,colour:'#7256b3',accent:'#e6d8fb'},
 {id:'kit-gold',slot:'kit',name:'Golden playmaker',price:120,level:7,colour:'#c5a04b',accent:'#1c3b31'},
 {id:'kit-cosmic',slot:'kit',name:'Cosmic champion',price:210,level:11,colour:'#253d75',accent:'#96e3db'},
 {id:'shorts-dark',slot:'shorts',name:'Classic shorts',price:0,level:1,colour:'#18362c'},
 {id:'shorts-white',slot:'shorts',name:'White shorts',price:20,level:2,colour:'#e9eddf'},
 {id:'shorts-blue',slot:'shorts',name:'Blue shorts',price:25,level:2,colour:'#304b88'},
 {id:'boots-classic',slot:'boots',name:'Classic boots',price:0,level:1,colour:'#23342b'},
 {id:'boots-lime',slot:'boots',name:'Volt boots',price:35,level:3,colour:'#c4e85a'},
 {id:'boots-red',slot:'boots',name:'Rocket boots',price:60,level:4,colour:'#de6b48'},
 {id:'boots-ice',slot:'boots',name:'Ice boots',price:90,level:6,colour:'#80cee0'},
 {id:'hair-crop',slot:'hair',name:'Short crop',price:0,level:1},
 {id:'hair-curls',slot:'hair',name:'Curls',price:0,level:1},
 {id:'hair-sweep',slot:'hair',name:'Side sweep',price:20,level:2},
 {id:'hair-spikes',slot:'hair',name:'Spikes',price:45,level:4},
 {id:'accessory-none',slot:'accessory',name:'No accessory',price:0,level:1},
 {id:'accessory-band',slot:'accessory',name:'Captain armband',price:50,level:4},
 {id:'accessory-headband',slot:'accessory',name:'Headband',price:35,level:3},
 {id:'accessory-gloves',slot:'accessory',name:'Keeper gloves',price:40,level:3},
 {id:'ball-classic',slot:'ball',name:'Match ball',price:0,level:1,colour:'#edf2df'},
 {id:'ball-gold',slot:'ball',name:'Golden ball',price:85,level:6,colour:'#e5c568'},
 {id:'ball-ice',slot:'ball',name:'Ice ball',price:100,level:7,colour:'#a4e1ee'},
 {id:'trail-none',slot:'trail',name:'Clean strike',price:0,level:1,colour:'transparent'},
 {id:'trail-blue',slot:'trail',name:'Blue comet',price:80,level:5,colour:'#6caff4'},
 {id:'trail-purple',slot:'trail',name:'Purple lightning',price:140,level:9,colour:'#b48cef'}
];
export const CLUBS=[
 {id:'academy',name:'Academy XI',level:1,colour:'#2d704c',short:'AXI'},
 {id:'local',name:'Town Rovers',level:2,colour:'#53719a',short:'TR'},
 {id:'county',name:'County United',level:4,colour:'#8d6cb2',short:'CU'},
 {id:'arsenal',name:'Arsenal',level:7,colour:'#b64f46',short:'ARS'},
 {id:'chelsea',name:'Chelsea',level:7,colour:'#3d62b8',short:'CHE'},
 {id:'liverpool',name:'Liverpool',level:9,colour:'#b7443f',short:'LIV'},
 {id:'man-city',name:'Manchester City',level:9,colour:'#70a7c8',short:'MCI'},
 {id:'man-utd',name:'Manchester United',level:9,colour:'#b64039',short:'MUN'},
 {id:'barcelona',name:'Barcelona',level:12,colour:'#76558d',short:'BAR'},
 {id:'real-madrid',name:'Real Madrid',level:12,colour:'#b4a66d',short:'RMA'},
 {id:'world',name:'World All-Stars',level:18,colour:'#bd9846',short:'WAS'}
];
export const xpForLevel=level=>{const n=Math.max(0,level-1);return 60*n+25*n*n;};
export const careerXP=p=>Math.max(0,p.pointsTotal??(p.sessions||[]).reduce((n,s)=>n+(s.points||0),0));
export const careerLevel=p=>1+Math.floor((Math.sqrt(3600+100*careerXP(p))-60)/50+1e-9);
export const levelProgress=p=>{const level=careerLevel(p),start=xpForLevel(level),next=xpForLevel(level+1);return {level,current:careerXP(p)-start,needed:next-start,percent:Math.min(100,(careerXP(p)-start)/(next-start)*100)};};
export const itemById=id=>ITEMS.find(item=>item.id===id);
export const clubById=id=>CLUBS.find(club=>club.id===id)||CLUBS[0];
export function initCareer(p){
 p.inventory||=[];p.creditsSpent??=0;p.purchases||=[];p.completedYears||=[];p.practical||={};p.inbox||=[];p.offeredClubs||=['academy'];
 p.look={skin:'warm',hairColour:'brown',kit:'kit-home',shorts:'shorts-dark',boots:'boots-classic',hair:'hair-crop',accessory:'accessory-none',ball:'ball-classic',trail:'trail-none',number:9,position:'Striker',club:'academy',...(p.look||{})};
 return p;
}
export const owns=(p,item)=>item.price===0||(p.inventory||[]).includes(item.id);
export const credits=p=>Math.max(0,Math.floor(careerXP(p)/10)-(p.creditsSpent||0));
export function buyItem(p,id){
 initCareer(p);const item=itemById(id);if(!item)return {ok:false,message:'Choose an item from the shop.'};
 if(owns(p,item))return {ok:true,alreadyOwned:true,message:'Already in your locker.'};
 if(careerLevel(p)<item.level)return {ok:false,message:`Unlocks at level ${item.level}.`};
 if(credits(p)<item.price)return {ok:false,message:`Earn ${item.price-credits(p)} more credits.`};
 p.creditsSpent+=item.price;p.inventory.push(id);p.purchases.push({id,cost:item.price,at:Date.now()});return {ok:true,message:`${item.name} is yours.`};
}
export function equipItem(p,id){initCareer(p);const item=itemById(id);if(!item||!owns(p,item))return false;p.look[item.slot]=id;return true;}
// Club offers require breadth and later-day recall as well as XP.
export function clubProgress(p,club){
 const facts=Object.values(p.facts||{}),unique=facts.filter(f=>f.history?.some(h=>h.correct)).length;
 const secure=facts.filter(f=>f.stage>=3&&f.days?.length>=3&&f.history?.slice(-3).every(h=>h.correct)).length;
 const days=new Set(facts.flatMap(f=>f.days||[])).size;
 const target=club.level<=1?{unique:0,days:0,secure:0}:club.level<=2?{unique:20,days:1,secure:0}:club.level<=4?{unique:60,days:3,secure:10}:club.level<=7?{unique:120,days:5,secure:30}:club.level<=9?{unique:180,days:7,secure:50}:club.level<=12?{unique:250,days:10,secure:80}:{unique:400,days:14,secure:150};
 const goals=[{label:'Level',value:careerLevel(p),target:club.level},{label:'Different facts',value:unique,target:target.unique},{label:'Practice days',value:days,target:target.days},{label:'Recall-secure facts',value:secure,target:target.secure}].filter(g=>g.target>0);
 return {eligible:goals.every(g=>g.value>=g.target),goals,remaining:goals.filter(g=>g.value<g.target)};
}
export function chooseClub(p,id){initCareer(p);const club=CLUBS.find(c=>c.id===id);if(!club||!clubProgress(p,club).eligible)return false;p.look.club=id;return true;}
export function careerNews(p,previousLevel,now=Date.now()){
 initCareer(p);const newClubs=CLUBS.filter(c=>!p.offeredClubs.includes(c.id)&&clubProgress(p,c).eligible);
 if(newClubs.length){newClubs.forEach(c=>p.offeredClubs.push(c.id));p.inbox.push({key:'clubs:'+newClubs.map(c=>c.id).join(':'),kind:'club',title:'You earned a club offer',text:`Your independent practice and recall have earned ${newClubs.map(c=>c.name).join(' or ')} in your game career. Visit the locker room.`,at:now,read:false});}
 return newClubs;
}
export function validateCareer(p){
 if(p.look){const l=p.look;if(!SKIN_TONES[l.skin]||!HAIR_COLOURS[l.hairColour]||!Number.isInteger(l.number)||l.number<1||l.number>99||!POSITIONS.includes(l.position)||!CLUBS.some(c=>c.id===l.club))throw Error('Invalid player customisation.');for(const slot of ['kit','shorts','boots','hair','accessory','ball','trail'])if(!ITEMS.some(i=>i.id===l[slot]&&i.slot===slot))throw Error('Invalid equipped item.');}
 if(p.offeredClubs!==undefined&&(!Array.isArray(p.offeredClubs)||p.offeredClubs.some(id=>!CLUBS.some(c=>c.id===id))||new Set(p.offeredClubs).size!==p.offeredClubs.length))throw Error('Invalid club offers.');
 if(p.inventory!==undefined&&(!Array.isArray(p.inventory)||new Set(p.inventory).size!==p.inventory.length||p.inventory.some(id=>!itemById(id))))throw Error('Invalid player inventory.');
 if(p.creditsSpent!==undefined&&(!Number.isSafeInteger(p.creditsSpent)||p.creditsSpent<0||p.creditsSpent>Math.floor(careerXP(p)/10)))throw Error('Invalid credit balance.');
 if(p.purchases!==undefined&&(!Array.isArray(p.purchases)||p.purchases.length>ITEMS.length||p.purchases.some(t=>!t||!itemById(t.id)||t.cost!==itemById(t.id).price||!Number.isFinite(t.at))))throw Error('Invalid shop history.');
 if(p.purchases&&new Set(p.purchases.map(t=>t.id)).size!==p.purchases.length)throw Error('Duplicate shop purchases.');
 if(p.purchases&&p.purchases.reduce((n,t)=>n+t.cost,0)!==(p.creditsSpent||0))throw Error('Shop balance does not match purchases.');
 if(p.inventory?.some(id=>itemById(id).price>0&&!p.purchases?.some(t=>t.id===id)))throw Error('Inventory has an unpurchased item.');
 if(p.leagueTotals){const totals=[p.leagueTotals.all,...Object.values(p.leagueTotals.years||{})];if(!p.leagueTotals.all||totals.some(t=>!t||['points','correct','attempts','matches'].some(k=>!Number.isSafeInteger(t[k])||t[k]<0)||t.correct>t.attempts)||p.leagueTotals.all.points>careerXP(p))throw Error('Invalid league totals.');}
 if(p.leagueTracked!==undefined&&(!Array.isArray(p.leagueTracked)||p.leagueTracked.length>500||p.leagueTracked.some(id=>typeof id!=='string')))throw Error('Invalid league history.');
 if(p.look)for(const slot of ['kit','shorts','boots','hair','accessory','ball','trail'])if(!owns(p,itemById(p.look[slot])))throw Error('Equipped item is not owned.');
 if(p.practical!==undefined&&(!p.practical||typeof p.practical!=='object'||Array.isArray(p.practical)||Object.entries(p.practical).some(([key,value])=>!/^y[1-6]:[a-z]+$/.test(key)||typeof value!=='boolean')))throw Error('Invalid practical checklist.');
 if(p.completedYears!==undefined&&(!Array.isArray(p.completedYears)||new Set(p.completedYears).size!==p.completedYears.length||p.completedYears.some(y=>!Number.isInteger(y)||y<1||y>6)))throw Error('Invalid year history.');
 if(p.inbox!==undefined&&(!Array.isArray(p.inbox)||p.inbox.length>100||p.inbox.some(n=>!n||typeof n.key!=='string'||typeof n.title!=='string'||n.title.length>100||typeof n.text!=='string'||n.text.length>1500||!Number.isFinite(n.at))))throw Error('Invalid academy news.');
 return true;
}
