const key='matchday.reading';
function reading(on){document.body.classList.toggle('reading-mode',on);document.querySelectorAll('[data-reading]').forEach(b=>b.setAttribute('aria-pressed',String(on)));try{localStorage.setItem(key,String(on));}catch{}}
try{reading(localStorage.getItem(key)==='true');}catch{}
document.querySelectorAll('[data-reading]').forEach(b=>b.addEventListener('click',()=>reading(!document.body.classList.contains('reading-mode'))));
document.querySelectorAll('[data-quick-quiz]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const input=form.querySelector('input'),feedback=form.querySelector('[data-quiz-feedback]'),value=Number(input.value),correct=Number.isFinite(value)&&value===Number(form.dataset.answer);feedback.textContent=correct?'That’s right. Try the related division fact next.':`Use equal groups. The answer is ${form.dataset.answer}. Try it again after a short gap.`;feedback.className=correct?'correct':'working';}));
