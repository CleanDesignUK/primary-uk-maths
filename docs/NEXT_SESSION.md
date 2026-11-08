# Current checkpoint

Release 7.1.1 is published and verified. PR #4 merged two development commits as `997bf6bae974cdc8d43bffc738ca51ce3735e7c2`. Main verification and GitHub Pages deployment succeeded.

- Learning graph appears first in the Trophy room, above XP details, medals and history.
- First warm-up independent answers earn career XP; helped/unsure answers earn zero. Saved portions retain XP. Existing first warm-ups are corrected once. Backups preserve the correction receipt.
- App and resource footers link to North Wales Tutoring Group.
- Local League rules are explained in the UI: same browser only, eligible completed Coach matches, ordered by League XP then accuracy.
- 138 automated tests, syntax, both builds pass. Browser: 2 independent / 10 helped first-warm-up answers banked 22 XP, 12 total credits and persisted on reload. Graph-first layout and no horizontal overflow confirmed at 320px.
- Google Form is NOT created or connected. Sign-in request was not completed. Five questions and settings are saved in FEEDBACK_FORM.md; Dashboard integration waits for FEEDBACK_FORM_URL in dist/feedback.mjs. Do not claim the feedback button is live until its verified respondent URL is configured.
- Published site reports 7.1.1. Live first-shot play, footer link and graph-first Trophy room are verified.

See [follow-up evidence](FIRST_LESSON_FEEDBACK.md). The remaining task is creating or receiving the Google Form respondent link, configuring FEEDBACK_FORM_URL, and verifying the Dashboard button. Do not restart sign-in after the cancelled request unless the user asks.
