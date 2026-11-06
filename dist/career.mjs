export const SKIN_TONES={sand:'#e7b88c',warm:'#c58c62',brown:'#9a6544',deep:'#65432f',rose:'#f0c8aa'};
export const HAIR_COLOURS={brown:'#503b2b',black:'#272824',blond:'#d3ad61',ginger:'#a75532',silver:'#c3c7bd'};
export const PLAYER_THEMES = {
 pitch:{name:'Stadium green',accent:'#d3f66e',dark:'#163b2b'},
 ocean:{name:'Ocean blue',accent:'#80e2ff',dark:'#17334c'},
 ember:{name:'Ember orange',accent:'#ffc384',dark:'#4c2b23'},
 violet:{name:'Night violet',accent:'#d6baff',dark:'#322554'},
 rose:{name:'Rose red',accent:'#ffaab7',dark:'#492636'}
};
export const KIT_TRIMS = {match:'Kit trim',lime:'#d8f477',sky:'#83dbfa',gold:'#f9d674',rose:'#f6a0ae',white:'#f5f6f0'};
export const POSITIONS=['Striker','Midfielder','Defender','Goalkeeper'];
const ORIGINAL_ITEMS=[
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
const LEGACY_PRICE = Object.fromEntries(ORIGINAL_ITEMS.map(item => [item.id,item.price]));
const newItem = (id, slot, name, price, level, colour, extra={}) => ({id,slot,name,price,level,colour,...extra});
const CATALOGUE_2 = [
 ...ORIGINAL_ITEMS.map(item=>({...item,price:item.price*5})),
 newItem('kit-sash','kit','Stadium sash',185,5,'#295b47',{accent:'#f3de9d',pattern:'sash'}),
 newItem('kit-halves','kit','Two-tone away',235,6,'#2c4f91',{accent:'#98d9ff',pattern:'halves'}),
 newItem('kit-sunset','kit','Sunset captain',350,8,'#b34739',{accent:'#ffd186',pattern:'stripes'}),
 newItem('kit-aurora','kit','Aurora eleven',480,10,'#344375',{accent:'#96f3cc',pattern:'chevron'}),
 newItem('kit-obsidian','kit','Obsidian cup',780,13,'#1e2b37',{accent:'#e7cc78',pattern:'sash'}),
 newItem('kit-glacier','kit','Glacier final',940,15,'#234a66',{accent:'#b6fbff',pattern:'halves'}),
 newItem('kit-diamond','kit','Diamond legends',1600,20,'#562f70',{accent:'#e8cdfd',pattern:'chevron'}),
 newItem('shorts-lime','shorts','Lime away shorts',155,5,'#a1bf5c'),
 newItem('shorts-ice','shorts','Glacier shorts',235,7,'#b0d9e0'),
 newItem('shorts-gold','shorts','Gold stripe shorts',390,10,'#ac8339'),
 newItem('boots-blue','boots','Blue sprint boots',185,5,'#6598ed'),
 newItem('boots-violet','boots','Violet curl boots',285,7,'#ad83df'),
 newItem('boots-gold','boots','Gold finisher boots',560,12,'#e6c16e'),
 newItem('boots-cosmic','boots','Cosmic stud boots',850,15,'#7f98e6'),
 newItem('hair-wave','hair','Wavy crop',0,1),
 newItem('hair-fade','hair','High fade',120,4),
 newItem('hair-fringe','hair','Swept fringe',190,5),
 newItem('hair-locs','hair','Short locs',220,6),
 newItem('hair-bun','hair','Top knot',260,7,null,{player:'Erling Haaland',number:9}),
 newItem('hair-mohawk','hair','Mohawk',325,8),
 newItem('hair-long','hair','Long waves',410,10),
 newItem('accessory-cap','accessory','Training cap',155,5,'#335b4c'),
 newItem('accessory-band-gold','accessory','Gold armband',400,10,'#e6c16e'),
 newItem('accessory-headphones','accessory','Tunnel headphones',360,9,'#7096d4'),
 newItem('accessory-scarf','accessory','Club scarf',295,8,'#e99b60'),
 newItem('ball-voltage','ball','Voltage ball',260,7,'#d9f176'),
 newItem('ball-ember','ball','Ember ball',520,11,'#ffb16b'),
 newItem('ball-nebula','ball','Nebula ball',845,14,'#cfb5ff'),
 newItem('trail-ember','trail','Ember trail',460,10,'#f4a04f'),
 newItem('trail-mint','trail','Mint streak',290,8,'#80e8c2'),
 newItem('trail-solar','trail','Solar burst',925,16,'#ffd55c'),
 newItem('pattern-classic','pattern','Club design',0,1),
 newItem('pattern-stripes','pattern','Touchline stripes',0,1),
 newItem('pattern-sash','pattern','Diagonal sash',165,5),
 newItem('pattern-halves','pattern','Split colours',230,6),
 newItem('pattern-chevron','pattern','Captain chevrons',340,8),
 newItem('celebrate-fist','celebration','Fist pump',0,1),
 newItem('celebrate-jump','celebration','Victory jump',175,5,'#bada6f',{player:'Cristiano Ronaldo',number:7}),
 newItem('celebrate-slide','celebration','Knee slide',320,8,'#92d8fc'),
 newItem('celebrate-spin','celebration','Champion turn',580,12,'#d1a8f0')
];
const CATALOGUE_2_PRICE = Object.fromEntries(CATALOGUE_2.map(item => [item.id,item.price]));
const CATALOGUE_3_DISCOUNTS = {
 'hair-sweep':{price:6,level:1},
 'shorts-white':{price:8,level:1},
 'accessory-headband':{price:9,level:1},
 'boots-lime':{price:10,level:1},
 'kit-blue':{price:16,level:1},
 'hair-bun':{price:22,level:2},
 'celebrate-jump':{price:24,level:2}
};
const CATALOGUE_3 = [
 ...CATALOGUE_2.map(item => ({...item,...CATALOGUE_3_DISCOUNTS[item.id]})),
 newItem('kit-sky-10','kit','Sky Playmaker',18,1,'#8ccff3',{accent:'#f9fbff',pattern:'stripes',player:'Lionel Messi',number:10}),
 newItem('boots-power-7','boots','Power 7 Boots',14,1,'#e8c577',{player:'Cristiano Ronaldo',number:7}),
 newItem('kit-midfield-5','kit','Midfield Five',38,3,'#f1f3f8',{accent:'#6c55c8',pattern:'chevron',player:'Jude Bellingham',number:5}),
 newItem('celebrate-open-arms','celebration','Open Arms',34,3,'#a3cdf7',{player:'Jude Bellingham',number:5})
];
const CATALOGUE_3_PRICE=Object.fromEntries(CATALOGUE_3.map(item=>[item.id,item.price]));
const SHOP_CATALOGUE=4;

// A short Coach match can bank single-digit credits even with several correct answers.
// Keep a first purchase within reach and give later unlocks a useful saving target.
const SHOP_PRICES={
 'kit-red':22, 'kit-purple':32, 'kit-gold':74, 'kit-cosmic':148,
 'kit-sash':34, 'kit-halves':44, 'kit-sunset':75, 'kit-aurora':110,
 'kit-obsidian':165, 'kit-glacier':205, 'kit-diamond':320, 'kit-midfield-5':30,
 'shorts-white':7, 'shorts-blue':12, 'shorts-lime':24, 'shorts-ice':42, 'shorts-gold':72,
 'boots-lime':9, 'boots-red':26, 'boots-ice':49, 'boots-blue':31,
 'boots-violet':52, 'boots-gold':115, 'boots-cosmic':180,
 'hair-sweep':5, 'hair-spikes':23, 'hair-fade':20, 'hair-fringe':25,
 'hair-locs':36, 'hair-bun':20, 'hair-mohawk':48, 'hair-long':65,
 'accessory-headband':8, 'accessory-band':24, 'accessory-gloves':16, 'accessory-cap':26,
 'accessory-band-gold':80, 'accessory-headphones':66, 'accessory-scarf':50,
 'ball-voltage':14, 'ball-gold':50, 'ball-ice':65, 'ball-ember':90, 'ball-nebula':155,
 'trail-mint':16, 'trail-blue':38, 'trail-purple':105, 'trail-ember':88, 'trail-solar':185,
 'pattern-sash':24, 'pattern-halves':39, 'pattern-chevron':62,
 'celebrate-jump':10, 'celebrate-open-arms':24, 'celebrate-slide':44, 'celebrate-spin':95
};
const SHOP_LEVELS={
 'ball-voltage':1, 'trail-mint':2, 'trail-solar':15, 'ball-nebula':13, 'ball-ember':10,
 'shorts-lime':4, 'hair-fade':3, 'hair-locs':5, 'hair-mohawk':7, 'hair-long':9,
 'accessory-cap':4, 'accessory-headphones':8, 'accessory-scarf':7,
 'pattern-sash':4, 'pattern-halves':5, 'pattern-chevron':7,
 'celebrate-jump':1, 'celebrate-slide':5, 'celebrate-spin':8
};
export const ITEMS=CATALOGUE_3.map(item=>({...item,price:SHOP_PRICES[item.id]??item.price,level:SHOP_LEVELS[item.id]??item.level}));
export const CLUBS=[
 {id:'academy',name:'Academy XI',level:1,colour:'#2d704c',short:'AXI'},
 {id:'local',name:'Town Rovers',level:2,colour:'#53719a',short:'TR'},
 {id:'county',name:'County United',level:4,colour:'#8d6cb2',short:'CU'},
 {id:'arsenal',name:'Arsenal',level:7,colour:'#b64f46',short:'ARS'},
 {id:'chelsea',name:'Chelsea',level:7,colour:'#3d62b8',short:'CHE'},
 {id:'tottenham',name:'Tottenham Hotspur',level:7,colour:'#233659',short:'TOT'},
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
 p.look={skin:'warm',hairColour:'brown',kit:'kit-home',shorts:'shorts-dark',boots:'boots-classic',hair:'hair-crop',accessory:'accessory-none',ball:'ball-classic',trail:'trail-none',number:9,position:'Striker',club:'academy',theme:'pitch',trim:'match',pattern:'pattern-classic',celebration:'celebrate-fist',...(p.look||{})};
 return p;
}
export const owns=(p,item)=>item.price===0||(p.inventory||[]).includes(item.id);
export const credits=p=>Math.max(0,Math.floor(careerXP(p)/10)-(p.creditsSpent||0));
export function buyItem(p,id){
 initCareer(p);const item=itemById(id);if(!item)return {ok:false,message:'Choose an item from the shop.'};
 if(owns(p,item))return {ok:true,alreadyOwned:true,message:'Already in your locker.'};
 if(careerLevel(p)<item.level)return {ok:false,message:`Unlocks at level ${item.level}.`};
 if(credits(p)<item.price)return {ok:false,message:`Earn ${item.price-credits(p)} more credits.`};
 p.creditsSpent+=item.price;p.inventory.push(id);p.purchases.push({id,cost:item.price,catalogue:SHOP_CATALOGUE,at:Date.now()});return {ok:true,message:`${item.name} is yours.`};
}
export function equipItem(p,id){initCareer(p);const item=itemById(id);if(!item||!owns(p,item))return false;p.look[item.slot]=id;return true;}
// Club offers require breadth and later-day recall as well as XP.
export function clubProgress(p,club){
 const facts=Object.values(p.facts||{}),unique=facts.filter(f=>f.history?.some(h=>h.correct)).length;
 const secure=facts.filter(f=>f.stage>=3&&f.days?.length>=3&&f.history?.slice(-3).every(h=>h.correct)).length;
 const days=new Set(facts.flatMap(f=>f.days||[])).size;
 const target=club.level<=1?{unique:0,days:0,secure:0}:club.level<=2?{unique:20,days:1,secure:0}:club.level<=4?{unique:60,days:3,secure:10}:club.level<=7?{unique:120,days:5,secure:30}:club.level<=9?{unique:180,days:7,secure:50}:club.level<=12?{unique:250,days:10,secure:80}:{unique:400,days:14,secure:150};
 const goals=[{label:'Level',value:careerLevel(p),target:club.level},{label:'Different facts',value:unique,target:target.unique},{label:'Practice days',value:days,target:target.days},{label:'Recall-secure facts',value:secure,target:target.secure}].filter(g=>g.target>0);
 // An offer is only as close as its slowest requirement. Level progress starts at zero XP.
 const fractions=goals.map(goal=>goal.label==='Level'&&club.level>1?careerXP(p)/xpForLevel(club.level):goal.value/goal.target);
 return {eligible:goals.every(g=>g.value>=g.target),goals,remaining:goals.filter(g=>g.value<g.target),percent:Math.floor(100*Math.min(1,...fractions))};
}
export function chooseClub(p,id){initCareer(p);const club=CLUBS.find(c=>c.id===id);if(!club||!clubProgress(p,club).eligible)return false;p.look.club=id;return true;}
export function careerNews(p,previousLevel,now=Date.now()){
 initCareer(p);const newClubs=CLUBS.filter(c=>!p.offeredClubs.includes(c.id)&&clubProgress(p,c).eligible);
 if(newClubs.length){newClubs.forEach(c=>p.offeredClubs.push(c.id));p.inbox.push({key:'clubs:'+newClubs.map(c=>c.id).join(':'),kind:'club',title:'You earned a club offer',text:`Your independent practice and recall have earned ${newClubs.map(c=>c.name).join(' or ')} in your game career. Visit Club offers in the Shop.`,at:now,read:false});}
 const next=CLUBS.find(club=>!clubProgress(p,club).eligible);
 if(next&&careerXP(p)>0){
  const progress=clubProgress(p,next);
  const milestone=[75,50,25].find(mark=>progress.percent>=mark);
  const key=`scout:${next.id}:${milestone}`;
  if(milestone&&!p.inbox.some(note=>note.key===key)){
   const goal=progress.remaining.find(g=>g.label==='Different facts')||progress.remaining[0];
   p.inbox.push({key,kind:'coach',title:`Coach · ${next.name} scout watch`,text:`GG, ${p.name}! You’re ${progress.percent}% of the way to this club offer. Next target: ${goal.label.toLowerCase()} ${goal.value}/${goal.target}.`,at:now,read:false});
  }
 }
 p.inbox=p.inbox.slice(-100);
 return newClubs;
}
function validPurchase(t){
 const item=itemById(t?.id);
 if(!item||!Number.isFinite(t.at))return false;
 const price=t.catalogue===SHOP_CATALOGUE?item.price:t.catalogue===3?CATALOGUE_3_PRICE[t.id]:
  t.catalogue===2?CATALOGUE_2_PRICE[t.id]:LEGACY_PRICE[t.id]??CATALOGUE_2_PRICE[t.id];
 return Number.isSafeInteger(t.cost)&&t.cost===price;
}
export function validateCareer(p){
 if(p.look){const l=p.look;if(!SKIN_TONES[l.skin]||!HAIR_COLOURS[l.hairColour]||!Number.isInteger(l.number)||l.number<1||l.number>99||!POSITIONS.includes(l.position)||!CLUBS.some(c=>c.id===l.club))throw Error('Invalid player customisation.');for(const slot of ['kit','shorts','boots','hair','accessory','ball','trail'])if(!ITEMS.some(i=>i.id===l[slot]&&i.slot===slot))throw Error('Invalid equipped item.');}
 if(p.offeredClubs!==undefined&&(!Array.isArray(p.offeredClubs)||p.offeredClubs.some(id=>!CLUBS.some(c=>c.id===id))||new Set(p.offeredClubs).size!==p.offeredClubs.length))throw Error('Invalid club offers.');
 if(p.look&&((p.look.theme!==undefined&&!Object.hasOwn(PLAYER_THEMES,p.look.theme))||(p.look.trim!==undefined&&!Object.hasOwn(KIT_TRIMS,p.look.trim))))throw Error('Invalid player colours.');
 for(const slot of ['pattern','celebration'])if(p.look?.[slot]!==undefined&&(!ITEMS.some(item=>item.id===p.look[slot]&&item.slot===slot)||!owns(p,itemById(p.look[slot]))))throw Error('Invalid player equipment.');
 if(p.inventory!==undefined&&(!Array.isArray(p.inventory)||new Set(p.inventory).size!==p.inventory.length||p.inventory.some(id=>!itemById(id))))throw Error('Invalid player inventory.');
 if(p.creditsSpent!==undefined&&(!Number.isSafeInteger(p.creditsSpent)||p.creditsSpent<0||p.creditsSpent>Math.floor(careerXP(p)/10)))throw Error('Invalid credit balance.');
 if(p.purchases!==undefined&&(!Array.isArray(p.purchases)||p.purchases.length>ITEMS.length||p.purchases.some(t=>!validPurchase(t))))throw Error('Invalid shop history.');
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
