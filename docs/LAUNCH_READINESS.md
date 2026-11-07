# November launch checkpoint

Base: `9ac9333` on `main`. Work branch: `launch/november-readiness`.

This checklist records the owner's 7 November feedback. Each completed group must
have regression checks and its own GitHub commit. Merge the tested result to main;
do not claim a check passed without running it.

- [ ] Written arithmetic: consistent responsive boards in matches, examples and Coach.
- [ ] Decimal multiplication and division: place-value working and accepted answers.
- [ ] Division: explicit, usable remainder entry and keyboard/keypad navigation.
- [ ] Adaptive practice: easier questions after errors; separate method variants;
      foundations before demanding Year 6 work; rebuild challenge after success.
- [ ] First completed warm-up pays a one-time starter credit reward.
- [ ] Parent report: examples for every skill, year-based radar, clear evidence
      thresholds and next steps when close to completing the year.
- [ ] Football career: more visible levels, rewards and distinctive celebrations.
- [ ] Contrast, mobile sizes (320/390/desktop), persistence and core journeys.
- [ ] Full automated suite, build checks, final commit, release verification.

## Baseline

`npm test`: 107 passed. Existing tests explicitly assume hard year-specific warm-up
questions and do not cover decimal written workspaces or difficulty within a skill.
These expectations need to change to reflect the owner's requested behaviour.

## Hosting

The existing GitHub Pages entry is `dist/play/`. This checkout has no Sites hosting
manifest. Preserve the existing deployment and player storage keys. A database-backed
World League requires a separate configured host; static play uses the squad league.
