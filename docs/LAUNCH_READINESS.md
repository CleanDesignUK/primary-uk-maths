# November launch checkpoint

Base: `9ac9333` on `main`. Work branch: `launch/november-readiness`.

This checklist records the owner's 7 November feedback. Each completed group must
have regression checks and its own GitHub commit. Merge the tested result to main;
do not claim a check passed without running it.

- [x] Written arithmetic: consistent responsive boards in matches, examples and Coach.
- [x] Decimal multiplication and division: place-value working and accepted answers.
- [x] Division: explicit, usable remainder entry and keyboard/keypad navigation.
- [x] Adaptive practice: easier questions after errors; separate method variants;
      foundations before demanding Year 6 work; rebuild challenge after success.
- [x] First completed warm-up pays a one-time starter credit reward.
- [x] Parent report: examples for every skill, year-based radar, clear evidence
      thresholds and next steps when close to completing the year.
- [x] Football career: more visible levels, rewards and distinctive celebrations.
- [x] Contrast, mobile sizes (320/390/desktop), persistence and core journeys.
- [x] Full automated suite, build checks, final commit, release verification.

## Baseline

`npm test`: 107 passed. Existing tests explicitly assume hard year-specific warm-up
questions and do not cover decimal written workspaces or difficulty within a skill.
These expectations need to change to reflect the owner's requested behaviour.

## Hosting

The existing GitHub Pages entry is `dist/play/`. This checkout has no Sites hosting
manifest. Preserve the existing deployment and player storage keys. A database-backed
World League requires a separate configured host; static play uses the squad league.

## Implemented and verified

- Written integer, decimal and remainder answer models have complete generated-pool
  regression checks. Multiplication carry labels include tenths and hundredths.
- A 320 px phone played decimal multiplication (4/4), paid 10 starter credits, bought
  Victory jump and played its preview. A later 390 px long-division round scored 4/4,
  including `917 ÷ 15 = 61 r 2`; the bonus did not repeat and the equipped move played
  at full time. Decimal division `4.56 ÷ 4 = 1.14` also scored correctly.
- Coach's decimal solution used a 218 px board within its 235 px container at 320 px.
- Parent examples and secure checklists expand; the tested parent report had no
  rendered text under a 3:1 contrast ratio in the solid-background scan. This is a
  targeted check, not a claim of a complete accessibility certification.
- The untimed Year 6 warm-up begins with place value to 1,000. Unit tests cover repeated errors
  stepping down the column ladder and independent successes building back up.
- Desktop clubhouse and its original football career card were inspected visually.
- Browser checks use desktop and phone-sized viewports. Physical iOS and Android
  devices have not been tested in this environment.

The existing static GitHub Pages game uses the local squad league. A separate public
ranked World League host and database are not provisioned by this release.
