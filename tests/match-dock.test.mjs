import test from 'node:test';
import assert from 'node:assert/strict';
import {setMatchDock} from '../dist/match-dock.mjs';

function dockFixture(){
 const classes=()=>({classList:{toggle(name,on){this[name]=on;}}});
 const main=classes(),nodes=new Map();
 const get=selector=>{
  if(!nodes.has(selector))nodes.set(selector,{dataset:{},textContent:''});
  return nodes.get(selector);
 };
 const numbers=[get('number')],symbols=[{dataset:{key:'−'}}];
 const pad={...classes(),dataset:{},closest:()=>main,querySelector:get,
  querySelectorAll:selector=>selector==='.numpad button'?numbers:symbols};
 return {pad,main,get,numbers,symbols};
}

test('mobile number keys and the dock remain mounted through a miss, a goal and the next shot',()=>{
 const {pad,main,get,numbers}=dockFixture();
 const state={touch:true,typed:true,done:false,symbols:['−']};
 setMatchDock(pad,state);
 assert.equal(pad.hidden,false);
 assert.equal(numbers[0].disabled,false);
 for(const working of [true,false]){
  setMatchDock(pad,{...state,done:true,working,nextLabel:'Skill check'});
  assert.equal(pad.hidden,false);
  assert.equal(main.classList['touch-keypad'],true);
  assert.equal(pad.dataset.layout,'numbers');
  assert.equal(numbers[0].disabled,true);
  assert.equal(get('[data-action="show-working"]').hidden,!working);
  assert.equal(get('.pad-shoot').dataset.action,'next');
 }
 setMatchDock(pad,state);
 assert.equal(get('.pad-shoot').dataset.key,'shoot');
 assert.equal(numbers[0].disabled,false);
});

test('visual and multiple-choice questions retain the same dock and use their own controls',()=>{
 const {pad,get,numbers}=dockFixture();
 setMatchDock(pad,{touch:true,typed:false,done:false,choices:true});
 assert.equal(pad.hidden,false);
 assert.equal(pad.dataset.layout,'guide');
 assert.equal(get('.pad-choices').hidden,false);
 assert.equal(get('.pad-guide').hidden,true);
 assert.equal(numbers[0].disabled,true);
 assert.equal(get('.pad-shoot').disabled,true);
 setMatchDock(pad,{touch:true,typed:false,done:false});
 assert.equal(get('.pad-choices').hidden,true);
 assert.equal(get('.pad-shoot').disabled,false);
 assert.equal(get('.pad-shoot').dataset.key,'shoot');
 setMatchDock(pad,{touch:true,typed:true,done:true,advance:'world-next'});
 assert.equal(get('.pad-shoot').dataset.action,'world-next');
});

test('desktop still hides the auxiliary keypad outside numeric entry',()=>{
 const {pad,main}=dockFixture();
 setMatchDock(pad,{touch:false,typed:true,done:false});
 assert.equal(pad.hidden,false);
 setMatchDock(pad,{touch:false,typed:true,done:true});
 assert.equal(pad.hidden,true);
 assert.equal(main.classList['touch-keypad'],false);
});
