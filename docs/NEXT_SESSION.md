# Current checkpoint

Release 7.1.3 adds per-player 3-minute, 5-minute and Unlimited match timers. See TIMER_OPTIONS.md. Publishing uses a checked PR to main, followed by the existing GitHub Pages deployment.

- Choose Match timer under the dashboard player card or in the new/edit player form. New players default to 3 minutes; missing, 60-second and 120-second legacy settings migrate to 180. Existing 180, 300 and 0 selections are retained.
- The timer applies to Coach matches, tables challenges, written/manual practice and promotion. Warm-ups, progress checks and Coach drills remain untimed.
- Changing the choice updates that player's saved draft while keeping answers and active time already used. Completed history stays unchanged. Backups and numbergrove storage keys remain compatible.
- All 151 tests, syntax, public-page generation and Worker packaging pass. Desktop and 320px browser QA covered setup, Edit player, 5-minute and 3-minute countdowns, Unlimited reload/resume and saved answer retention. See timer screenshots.
- Branding, read-aloud, the North Wales Tutoring footer and the original game's other features are retained. The cancelled Google Form setup is still out of scope.

## Previous release 7.1.2

Release 7.1.2 fixes unpaid customisation. Core change committed as `28416f92c3930c425e29de1da8d16ab5fb641378` on `fix/paid-customisation`; release assets and QA are in the following commit. Fetch GitHub before continuing to confirm merge/deployment status.

- Customise lists starter and purchased styles/colours only; all paid equip paths require a valid purchase receipt. Colours are individually priced in the Shop.
- Previously unpaid looks return to starter defaults on upgrade without charging or losing learning progress or real purchases.
- All 144 tests, syntax checks and both builds pass. Desktop and 320px browser QA confirms actual credit debits, unlocks, equipped state after reload and no horizontal overflow.
- See [paid customisation evidence](PAID_CUSTOMISATION.md) and screenshots.
- Google Form remains pending. The previous sign-in request was cancelled. Do not restart it unless the user asks.

## Previous release checkpoint

Release 7.1.1 is published and verified. PR #4 merged two development commits as `997bf6bae974cdc8d43bffc738ca51ce3735e7c2`. Main verification and GitHub Pages deployment succeeded.

- Learning graph appears first in the Trophy room, above XP details, medals and history.
- First warm-up independent answers earn career XP; helped/unsure answers earn zero. Saved portions retain XP. Existing first warm-ups are corrected once. Backups preserve the correction receipt.
- App and resource footers link to North Wales Tutoring Group.
- Local League rules are explained in the UI: same browser only, eligible completed Coach matches, ordered by League XP then accuracy.
- 138 automated tests, syntax, both builds pass. Browser: 2 independent / 10 helped first-warm-up answers banked 22 XP, 12 total credits and persisted on reload. Graph-first layout and no horizontal overflow confirmed at 320px.
- Google Form is NOT created or connected. Sign-in request was not completed. Five questions and settings are saved in FEEDBACK_FORM.md; Dashboard integration waits for FEEDBACK_FORM_URL in dist/feedback.mjs. Do not claim the feedback button is live until its verified respondent URL is configured.
- Published site reports 7.1.1. Live first-shot play, footer link and graph-first Trophy room are verified.

See [follow-up evidence](FIRST_LESSON_FEEDBACK.md). The remaining task is creating or receiving the Google Form respondent link, configuring FEEDBACK_FORM_URL, and verifying the Dashboard button. Do not restart sign-in after the cancelled request unless the user asks.
