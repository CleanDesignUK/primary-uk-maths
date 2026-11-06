import {esc,icon} from './visuals.mjs?v=6';

export function setMatchDock(pad,{
 touch,typed,done,busy=false,choices=false,symbols=[],caption='',resultLabel=caption,
 nextLabel='Next shot',advance='next',working=false,announce=''
}) {
 const find=selector=>pad.querySelector(selector);
 const guide=touch&&!typed;
 const acceptsNumbers=typed&&!done&&!busy;
 pad.hidden=!touch&&(!typed||done);
 pad.classList.toggle('touch-pad',touch);
 pad.closest('.game-main').classList.toggle('touch-keypad',touch);
 pad.dataset.layout=guide?'guide':'numbers';
 pad.querySelectorAll('.numpad button').forEach(button=>{button.disabled=!acceptsNumbers;});
 pad.querySelectorAll('.symbol-keys button').forEach(button=>{button.hidden=!symbols.includes(button.dataset.key);button.disabled=!acceptsNumbers;});
 find('.symbol-keys').hidden=guide||done||!symbols.length;
 find('.pad-clock').hidden=!touch;
 find('.pad-guide').hidden=!guide||choices;
 find('.pad-choices').hidden=!touch||!choices;
 find('.pad-feedback-side').hidden=!touch||!done;
 find('[data-action="show-working"]').hidden=!working;
 find('#pad-result').textContent=working?'':resultLabel;
 find('#pad-guide-text').textContent=caption||(choices?'Tap an answer above':'Work in the question above');
 const announcement=find('#pad-announcement');
 if(announcement.textContent!==announce)announcement.textContent=announce;
 const action=find('.pad-shoot');
 action.dataset.action=done?advance:'key';
 action.dataset.key=done?'':'shoot';
 action.disabled=busy||!done&&choices;
 action.innerHTML=`${done?esc(nextLabel):busy?'Checking…':choices?'Choose':'Shoot'} ${icon('arrow',15)}`;
}
