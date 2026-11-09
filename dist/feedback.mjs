import {esc,icon} from './visuals.mjs?v=7.1.2';

// Set only after the owner's Google Form has been published and checked.
export const FEEDBACK_FORM_URL='';
export function feedbackMarkup(url=FEEDBACK_FORM_URL){
 if(!url)return '';
 return `<section class="dashboard-feedback" aria-label="Game feedback"><div><h2>Help improve the game</h2><p>Found a bug? Got an idea? We’d like to hear it.</p></div><a class="btn white" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('book',18)} Give feedback ${icon('arrow',16)}</a></section>`;
}
