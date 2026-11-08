# Current checkpoint

Follow-up release 7.1.1 is prepared on `fix/first-lesson-and-feedback`.

- Learning graph appears first in the Trophy room, above XP details, medals and history.
- First warm-up independent answers earn career XP; helped/unsure answers earn zero. Saved portions retain XP. Existing first warm-ups are corrected once. Backups preserve the correction receipt.
- App and resource footers link to North Wales Tutoring Group.
- Local League rules are explained in the UI: same browser only, eligible completed Coach matches, ordered by League XP then accuracy.
- 138 automated tests, syntax, both builds pass. Browser: 2 independent / 10 helped first-warm-up answers banked 22 XP, 12 total credits and persisted on reload. Graph-first layout and no horizontal overflow confirmed at 320px.
- Google Form is NOT created or connected. Sign-in request was not completed. Five questions and settings are saved in FEEDBACK_FORM.md; Dashboard integration waits for FEEDBACK_FORM_URL in dist/feedback.mjs. Do not claim the feedback button is live until its verified respondent URL is configured.
- Release merge, CI and deployment verification still need to be recorded.

See [follow-up evidence](FIRST_LESSON_FEEDBACK.md). Existing 7.1.0 remains the last previously verified live release until 7.1.1 publication is confirmed.
