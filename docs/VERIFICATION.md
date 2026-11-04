# Matchday Maths 3 verification

Verified on 4 November 2026. Browser screenshots show test play, not student assessment results. Fresh profiles have no seeded scores or mastery.

## Automated checks

`npm run check` and `node --test tests/*.test.mjs` pass. There are 48 checks covering arithmetic pools, all curriculum families, prerequisite routing, delayed retries, spaced retrieval, mathematical answer equivalence, shape construction, profile separation, import validation, daily goals, progress milestones, worked examples and record eligibility. The captured output is in [test-results.txt](test-results.txt).

## Browser checks

- Completed the 12-skill warm-up over two visits. After the first two answers, continuing began at the 3 times table with 10 shots remaining.
- Verified the feedback clock remained unchanged while reading a mistake explanation.
- Completed a 10-shot independent training match. The result showed 10/10, 170 XP, a new personal record and all three daily goals completed.
- Checked mixed adaptive practice including arithmetic, times tables and a visual fraction.
- Verified anonymous syllabus browsing, the player picker before a chosen drill, and the selected crossing-10 drill starting under Carter.
- Checked Cruz's Year 5 profile on a 390 px mobile frame. The document had a 375 px content viewport and a 375 px scroll width, with no horizontal overflow. After the spacing adjustment, the question, Shoot control and full keypad fit in the 844 px frame.
- Verified the visible 9 + 9 worked example split 9 into 1 and 8, jumped through 10, and reached 18.

## Screenshots

- [Dashboard](dashboard-preview.jpg)
- [Match](game-preview.jpg)
- [New record](record-preview.jpg)
- [Mobile](mobile-preview.jpg)
- [Visual coaching](coaching-preview.jpg)

## Practical limits

Automated tests and browser QA do not establish teaching efficacy or permanent retention. The app uses England's Year 3 and Year 5 curriculum map, with earlier prerequisites. Profiles use browser storage and have no password or cross-device sync. The 1, 2 and 3 minute auto-training settings use separate record keys; version 3 feedback timing is separate from earlier records. GitHub Pages activation is a separate hosting setting.
