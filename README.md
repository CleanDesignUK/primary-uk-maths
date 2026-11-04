# Matchday Maths

Football-themed primary maths training for **Ace and Carter (Year 3)** and **Cruz (Year 5)**. Select a player and start answering. The main route chooses questions from learning evidence; the syllabus route offers teacher-directed drills.

[Working preview](https://numbergrove-maths.cleandesign-uk.chatgpt.site) · GitHub repository: [CleanDesignUK/primary-uk-maths](https://github.com/CleanDesignUK/primary-uk-maths)

## Run

No installation, build, database or paid API is needed.

```sh
python3 -m http.server 8080 --directory dist
node --test tests/*.test.mjs
```

Open the served URL. ES modules need HTTP rather than opening `index.html` directly as a local file. `package.json` also provides `npm test` and `npm run check`, without dependencies.

## Main experience

- Ace, Carter and Cruz have separate local profiles, scores, recall evidence and personal records. Add other players from the opening screen or Coach.
- Selecting a player starts questions immediately. A new player gets a 12-question starting-point sample; later training matches have 10 shots.
- Coach selects supporting prerequisites, weak facts, due recall, written methods and wider-curriculum samples. Pupils do not need to select the next topic.
- Correct answers score goals and XP. Streaks, medals, levels, personal records and faster-record tie-breaks provide rewards.
- Short labels, large answer controls, an on-screen keypad and optional question read-aloud support limited reading. Detailed explanations stay behind Coach or appear after a mistake.
- A separate Year 3/Year 5 syllabus has 105 exercise families across number, calculation, multiplication/division, fractions/decimals, measure/time, geometry and statistics. See [the curriculum map](docs/CURRICULUM_MAP.md).
- Visual interactions include minute-accurate and Roman clocks, rulers, fractions, coordinate diagrams, shape drawing, angle construction and bar-chart construction.
- Written addition/subtraction has five difficulty levels, interactive digit boxes, optional working notes, and carrying/exchanging feedback, including exchange through zeros.
- Coach reports expose the selection reason for recent questions. CSV scores and JSON backup/restore are available.

## Practice decisions

`dist/adaptive.mjs` contains the policy, independently of the interface:

1. **Placement sample:** 12 distinct skill probes. Errors do not replace the remaining probes. This is calibration, not a pass/fail judgement.
2. **Prerequisite graph:** weak supporting skills are selected before harder targets. For example, addition across 10 depends on addition facts and bonds to 10. Column levels build on earlier columns, place value and crossing-10 facts.
3. **Lane balance:** early training concentrates on foundations and tables, with written methods and a wider-curriculum sample. As the core becomes ready, wider curriculum practice increases.
4. **Error replay:** mistakes return after other questions. Consecutive difficult answers trigger a supporting skill in the automatic route. Manual drills stay within their chosen topic.
5. **Spaced retrieval:** due facts receive review slots. Successful independent recall advances intervals of 1, 3, 7, 14, 30 and 60 days, at most once per calendar day. Help or an error resets the interval.
6. **Readiness versus mastery:** recent independent accuracy and question coverage can allow progression. Long-term “match fit” status requires spaced evidence and repeated independent sessions. Exact fact families also need broad secure-fact coverage. A same-day run cannot establish mastery.

The rules are product heuristics, not guarantees of permanent memory, a validated diagnostic test or a replacement for a teacher. Reading/typing speed affects response times. Physical measuring, model making and discussion remain valuable.

## Points and records

An independent correct answer earns 10 XP, plus a streak bonus rising by 2 XP to a maximum extra 10 XP. A supported correct answer earns 2 XP and breaks the independent streak. Accuracy stars use 95%, 80% and 60% thresholds.

A personal record requires a complete timed match, at least one answer, and no help or pauses. A higher score wins; equal-score, equal-goal matches can set a faster time record. Warm-up samples do not set timed records. Individual drills are compared by topic and time limit. Adaptive records are grouped by year and training league because their question mix changes.

## Data

The established `numbergrove.data.v1` and `numbergrove.round.v1` browser keys are preserved so the visual redesign does not erase earlier progress. Placeholder names Pupil 1/2/3 migrate to Ace/Carter/Cruz while retaining their IDs and saved work.

Profiles are device-local selections without passwords. Anyone using the same browser can switch profiles or view results. Refreshing or hiding the page pauses the current match and preserves its player. Clearing browser data removes local progress. Use JSON backup/restore to move a squad to another browser or origin. Restoring replaces current data after a confirmation. Backups contain player progress and should be kept private.

The app has no analytics, advertising, external scripts or external fonts. Its display font is bundled with its licence in `dist/assets/`. Hosting infrastructure may still keep ordinary access logs. No player answers are sent to a backend by the application.

## GitHub and hosting

The root `index.html` opens the app in `dist/`. The project is ready for a static host or GitHub Pages using `main` and `/ (root)`. Relative URLs support project subdirectory hosting. Enabling GitHub Pages is a separate hosting setting.


## Files

| File | Responsibility |
| --- | --- |
| `dist/app.mjs` | Interface, profiles, local persistence and match lifecycle |
| `dist/engine.mjs` | Original arithmetic pools, fact recall and backup validation |
| `dist/adaptive.mjs` | Prerequisites, calibration, weak skills and review selection |
| `dist/curriculum.mjs` | Wider curriculum generators, answer equivalence and geometry validation |
| `dist/rewards.mjs` | XP and personal-record eligibility |
| `dist/visuals.mjs` | Football artwork and exact mathematical diagrams |
| `dist/style.css` | Football design and responsive layouts |
| `tests/` | Arithmetic, adaptive policy, curriculum, construction and record checks |

Research and curriculum references were reviewed on 4 November 2026. Earlier competitor research informed the focused drills, visual feedback and retrieval approach; no claim of experimentally proven superiority is made.
