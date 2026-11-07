import {SKILLS} from './engine.mjs?v=7.0.0';
import {syllabusIds} from './curriculum.mjs?v=7.0.0';

// In each list, put the most useful first check before other related foundations.
// These are possible routes for support, not a checklist a pupil must complete.
export const REQUIREMENTS={
 // Whole numbers and place value
 objects1:[], count1:['objects1'], more1:['objects1'], words1:['objects1'], compare1:['objects1'],
 place2:['objects1','count1'], count2:['count1','place2'], words2:['place2','words1'],
 compare2:['place2','compare1'], numberline2:['place2','count2'], odd2:['groups1','table2'],
 place3:['place2'], count3:['place3','count2'], words3:['place3','words2'],
 compare3:['place3','compare2'], estimate3:['numberline2','place3'],
 place4:['place3'], count4:['count3','place4'], compare4:['place4','compare3'],
 numberline4:['estimate3','place4'], round4:['numberline4','place4'],
 roman4:[], negative4:['numberline2','count2'],
 place6:['place4'], words5:['place6','words3'], compare5:['place6','compare4'],
 sequence5:['place6','count4'], round5:['round4','place6'],
 negative5:['negative4'], roman5:['roman4'], place7:['place6'],
 round6:['round5','place7'], negative6:['negative5','sub20'],

 // Addition, subtraction and written exchange
 add10:['objects1'], sub10:['objects1'], bonds10:['add10'],
 bridgeAdd:['add10','bonds10'], bridgeSub:['sub10','bonds10'], bonds20:['bonds10'],
 doubles:['add10'], missing:['add10','sub10'],
 add20:['add10','bonds10'], sub20:['sub10','bonds10'], missing20:['add20','sub20'],
 stories1:['add20','sub20'], threeAdd2:['bonds10','add20'], related2:['bonds10','place2'],
 inverse2:['missing20','related2'], mental2:['place2','bridgeAdd','bridgeSub'],
 stories2:['stories1','mental2'], mental3:['mental2','place3'],
 estimateCalc3:['estimate3','mental3'], inverse3:['inverse2','mental3'],
 colAdd0:['add10','place2'], colAdd1:['bridgeAdd','colAdd0'],
 colAdd2:['bridgeAdd','colAdd1','place3'], colAdd3:['colAdd2','bridgeAdd','place4'],
 colAdd4:['colAdd3','bridgeAdd','place6'],
 colSub0:['sub10','place2'], colSub1:['bridgeSub','colSub0'],
 colSub2:['bridgeSub','colSub1','place3'], colSub3:['colSub2','bridgeSub','place4'],
 colSub4:['colSub3','bridgeSub','place6'],
 calcProblem4:['stories2','colAdd2','colSub2'], estimate4:['round4','estimateCalc3'],
 mental5:['mental3','place6'], estimate5:['round5','estimate4'],
 problems5:['calcProblem4','colAdd4','colSub4'], mental6:['mental5','place7'],
 order6:['tableStructure4','threeAdd2'], estimate6:['estimate5','round6'],
 problems6:['problems5','longMul6','longDiv6'],

 // Equal groups, connected table facts and written methods
 groups1:['add10'], share1:['groups1'], groups2:['groups1','share1'],
 table1:['groups1'], table2:['groups2','doubles'], table3:['groups2','count2'],
 table4:['table2','doubles'], table5:['groups2','count2'], table6:['table3','doubles'],
 table7:['groups2','table5','table2'], table8:['table4','doubles'],
 table9:['table3','groups2'], table10:['groups2','place2'],
 table11:['table10','table1'], table12:['table6','table10'],
 mix2510:['table2','table5','table10'], div2510:['mix2510','share1'],
 mix348:['table3','table4','table8'], div348:['table3','table4','table8','div2510'],
 mixAll:Array.from({length:12},(_,i)=>`table${i+1}`), divAll:['mixAll','div348'],
 scaling3:['groups2','table3'], mulWritten3:['place2','table3','table4'],
 divWritten3:['div348','place2'], tableStructure4:['groups2','table4'],
 mul4:['mulWritten3','place3'], divide4:['divWritten3'],
 scaling4:['scaling3','tableStructure4'], factors5:['tableStructure4','mixAll'],
 prime5:['factors5'], commonMultiples5:['factors5'], primeFactors5:['prime5','factors5'],
 powers5:['place6','table10'], squarecube5:['tableStructure4','mixAll'],
 mul5:['mul4','powers5'], division5:['divide4','divAll'],
 contextDiv5:['division5'], rates5:['scaling4','division5'],
 longMul6:['mul5','mul4'], longDiv6:['division5','divide4'],
 remainder6:['longDiv6','contextDiv5'], factors6:['commonMultiples5','primeFactors5'],

 // Fractions, decimals and percentages
 fraction1:[], fracAmount1:['fraction1','share1'], frac2:['fraction1','fracAmount1'],
 fracEq2:['frac2'], fracRead3:['frac2'], tenths3:['fracRead3','place2'],
 fracOf3:['fracAmount1','fracRead3','div348'], fracEq3:['fracRead3','fracEq2'],
 fracCalc3:['fracRead3','add10'], fracOrder3:['fracRead3'], fracProblem3:['fracOf3'],
 fracEq4:['fracEq3'], hundredths4:['tenths3'], fracOf4:['fracOf3','fracEq4'],
 fracCalc4:['fracCalc3'], decimal4:['tenths3','hundredths4','place2'],
 decimalRound4:['decimal4','round4'], decimalOrder4:['decimal4','compare4'],
 decimalMeasure4:['decimal4','money3'],
 fracOrder5:['fracOrder3','fracEq4'], fracEq5:['fracEq4'], mixed5:['fracRead3','fracEq5'],
 fracCalc5:['fracCalc4','fracEq5'], fracMul5:['fracOf3','fracOf4'],
 mixedMul5:['mixed5','fracMul5'], decimalFrac5:['decimal4','fracEq4'],
 thousandths5:['decimal4','hundredths4'], decimalRound5:['decimalRound4','thousandths5'],
 decimalOrder5:['decimalOrder4','thousandths5'], decimalCalc5:['decimalOrder4','colAdd2','colSub2'],
 percent5:['hundredths4','decimalFrac5'], percentProblem5:['percent5','fracOf4'],
 simplify6:['fracEq5','factors5'], fracOrder6:['fracOrder5','mixed5','fracEq5'],
 fracCalc6:['fracCalc5','fracEq5','mixed5'], fracMul6:['fracMul5','fracOf4'],
 fracDiv6:['fracMul6','fracEq5'], fracDecimal6:['decimalFrac5','division5'],
 decimalPlace6:['thousandths5'], decimalPower6:['decimalPlace6','powers5'],
 decimalMul6:['mul4','decimalPlace6'], decimalDiv6:['division5','decimalPlace6'],
 percent6:['percent5','percentProblem5'],

 // Measures, time and money
 measure1:[], money1:[], calendar1:[], clock1:[], clockHands1:['clock1'],
 metric2:['measure1'], coins2:['money1','add20'], money2:['coins2','sub20'],
 clock2:['clock1','table5'], clockHands2:['clock2','clockHands1'], duration2:['clock2','sub20'],
 metric3:['metric2','place3'], ruler3:['measure1','numberline2'],
 money3:['money2','bridgeSub'], clock3:['clock2'], timeFacts3:['calendar1','duration2'],
 amPm3:['clock2'], duration3:['duration2','clock3','timeFacts3'], perimeter3:['ruler3','add20'],
 metric4:['metric3','timeFacts3'], perimeter4:['perimeter3','shape2'],
 area4:['groups2','shape2'], money4:['money3','decimalMeasure4'], time4:['duration3','amPm3'],
 metric5:['metric4','powers5','decimal4'], imperial5:['metric5','scaling4'],
 perimeter5:['perimeter4','perimeter3'], area5:['area4','groups2'],
 volume5:['area4','solid2'], time5:['time4','timeFacts3'], measure5:['decimalCalc5','metric4'],
 metric6:['metric5','decimalPower6'], miles6:['imperial5','rates5'],
 measure6:['measure5','metric6'], areaCompare6:['area5','perimeter5'],
 area6:['area5','shape4'], volume6:['volume5','area5'],

 // Geometry, position and movement
 shape1:[], solid1:[], position1:[], turn1:['position1','fraction1'],
 shape2:['shape1'], solid2:['solid1','shape1'], symmetry2:['shape2'],
 patterns2:['shape1'], turn2:['turn1'],
 orientation3:['position1'], draw3:['shape2'], solids3:['solid2'],
 angle3:['turn2'], lines3:['orientation3','angle3'],
 shape4:['shape2','lines3','angle3'], angle4:['angle3'],
 coordinate4:['position1','numberline2'], symmetry4:['symmetry2','coordinate4'],
 translate4:['coordinate4','position1'], rectangle5:['perimeter4','shape4'],
 solid5:['solids3','solid2'], angles5:['angle4'], drawAngle5:['angles5'],
 angleFacts5:['angles5','rectangle5'], polygon5:['shape4','angle4'],
 transform5:['translate4','symmetry4'], shape6:['polygon5','angleFacts5'],
 nets6:['solid5','shape4'], angles6:['angleFacts5','polygon5'],
 circle6:['doubles'], coordinate6:['coordinate4','negative5'],
 transform6:['coordinate6','transform5'],

 // Data, ratio and algebra
 data2:['objects1','add20'], dataBuild2:['data2'],
 chart3:['data2'], chartBuild3:['chart3','dataBuild2'],
 chart4:['chart3','numberline4'], chartBuild4:['chart4','chartBuild3'],
 lineGraph5:['chart4'], timetable5:['duration3','data2'],
 line6:['lineGraph5','chart4'], lineBuild6:['line6','chartBuild4'],
 pie6:['fracOf4','angleFacts5'], pieBuild6:['pie6','fracEq5'],
 mean6:['divAll','add20'],
 ratio6:['fracOf3','scaling4'], scale6:['scaling4','ratio6'], share6:['ratio6','fracOf4'],
 formula6:['order6'], sequence6:['sequence5','count4'],
 equation6:['inverse3','formula6'], pairs6:['equation6','formula6'], possibilities6:['pairs6','bonds20'],
};

const introduction=new Map();
for(let year=1;year<=6;year++){
 for(const id of syllabusIds(year))if(!introduction.has(id))introduction.set(id,year);
}
export const teachingYear=id=>introduction.get(id);
export const requirements=id=>Object.hasOwn(REQUIREMENTS,id)?REQUIREMENTS[id]:[];

export function validateTeachingOrder(){
 const ids=new Set(SKILLS.map(skill=>skill.id)),complete=new Set(),visiting=new Set();
 const visit=id=>{
  if(complete.has(id))return;
  if(visiting.has(id))throw Error(`Prerequisite cycle at ${id}`);
  if(!ids.has(id)||!teachingYear(id)||!Object.hasOwn(REQUIREMENTS,id))throw Error(`Unmapped skill ${id}`);
  visiting.add(id);
  for(const prerequisite of requirements(id)){
   visit(prerequisite);
   if(teachingYear(prerequisite)>teachingYear(id))throw Error(`Later prerequisite ${prerequisite} for ${id}`);
  }
  visiting.delete(id);complete.add(id);
 };
 ids.forEach(visit);
 Object.keys(REQUIREMENTS).forEach(visit);
 return true;
}
