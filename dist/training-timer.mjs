export const TRAINING_TIMERS=Object.freeze([
 {seconds:180,label:'3 minutes'},
 {seconds:300,label:'5 minutes'},
 {seconds:0,label:'Unlimited'}
]);

export const trainingSeconds=value=>TRAINING_TIMERS.some(option=>option.seconds===value)?value:180;
export const timerLabel=value=>TRAINING_TIMERS.find(option=>option.seconds===trainingSeconds(value)).label;
export const timerOptions=value=>TRAINING_TIMERS.map(option=>`<option value="${option.seconds}" ${option.seconds===trainingSeconds(value)?'selected':''}>${option.label}</option>`).join('');
export const isUntimedMatch=round=>round.duration===0||!!(round.placement||round.progressCheck||round.coachDrill);

// Only active drafts change. Historical scores retain the timing they were earned with.
export function applyTrainingTimer(round,value){
 const selected=trainingSeconds(value);
 round.duration=round.placement||round.progressCheck||round.coachDrill?0:selected;
 round.clockElapsed=Number.isFinite(round.clockElapsed)?round.clockElapsed:round.elapsed||0;
 if(!round.duration)round.workTimeLeft=0;
 const kind=round.manual?`practice:${round.manual}:${round.tableMode||'auto'}`:round.tableChallenge?'table-challenge':round.promotion?'promotion':`coach:${round.league||1}`;
 round.recordKey=`timer-v1:${kind}:y${round.curriculumYear}:${round.target}:${round.duration}`;
 return round;
}
