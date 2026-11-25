# Player timers: release 7.1.3

Matchday Maths players can choose **3 minutes**, **5 minutes** or **Unlimited** beneath the dashboard player card or in the new/edit player form. The timer is visible without expanding Kit and style. Dashboard changes save immediately for that player; profile-form changes save with Create & play or Save.

Profiles with no stored timer, or the old 1- and 2-minute choices, move to 3 minutes when local progress or an older backup loads. Three-minute choices remain unchanged. New 5-minute and Unlimited choices persist after reload, profile editing and backup restore. Player IDs, numbergrove storage keys, backup version, learning records, purchases and past results are retained.

Coach matches, times-table challenges, written/manual practice and promotion use the choice consistently. Warm-ups, progress checks and Coach drills remain untimed. Unlimited removes expiry, working countdowns and low-time warnings; the round still finishes after its planned shots. Timed rounds retain feedback pauses and written thinking-time allowances.

Changing the choice updates the player's saved draft without resetting answers, attempts, working or active time already used. Returning to a finite timer uses that spent time; if its budget is already spent, the match ends on resume. Completed history is unchanged. New comparison keys distinguish the timer choices from each other and from legacy timing. Existing XP and league rules stay in place.

Unlimited is stored as duration 0, with finite elapsed practice time. Infinity is only a live clock-helper result and never enters the saved JSON.

## Verification on 25 November 2026

- All 151 tests pass, including seven timer regressions covering migration/backup compatibility, invalid values, all local match types, saved answers/time, pause/feedback, finite expiry, Unlimited reload/JSON, XP and the existing-player control.
- Module syntax, 30 public-page generation and Worker packaging pass. Game cache versions are refreshed to 7.1.3.
- Browser QA created a QA player with 5 minutes selected. Its warm-up correctly remained untimed. Manual addition practice started at 5:00. After a correct answer, Unlimited persisted through dashboard selection, reload and Resume, keeping the goal and answer. Changing to 3 minutes showed 2:45 remaining, retaining spent time and the goal.
- Edit player showed Unlimited selected; saving kept that setting. The new-player form defaults to 3 minutes and offers exactly the three choices.
- At 320px, 5-minute and Unlimited changes worked and the timer card stayed within the available width. The body width and scroll width both measured 305px.
- The original Matchday branding, read-aloud control and North Wales Tutoring footer remained visible during QA.

Evidence: [desktop dashboard](screenshots/timer-options/desktop.jpg) and [320px timer card](screenshots/timer-options/phone-320.jpg).
