# Matchday Maths Academy

A free football-themed supplementary learning resource for the basics of **England’s primary maths curriculum, Years 1–6**. Players create their own nickname profile. There are no preloaded pupil names, scores or fake opponents.

This repository contains the Year 1–6 expansion, a custom player and earned-credit shop, curriculum promotion, adaptive retrieval, a stronger times-table coach, local squad leagues, reading access options and 30 marketing/resource pages.

## Start locally

No dependencies, accounts, database or paid API are needed.

```sh
python3 -m http.server 8080 --directory dist
npm run check
npm test
```

Open the served homepage, then Play. Serve over HTTP because the app uses ES modules. The root repository `index.html` also opens `dist/` for project-based static hosting.

`npm run build` regenerates the marketing pages. Set `SITE_ORIGIN` to the exact public origin plus any hosting subdirectory before building a public deployment. It controls canonical URLs and the sitemap. The checked-in default currently targets the existing Sites preview. Public search indexing requires a publicly accessible host and correctly configured canonical URLs.

## Learning, rather than topic-by-topic clicking

- A year-specific 12-question warm-up samples a starting point. Choosing a player starts questions immediately; a paused or unfinished round keeps its player.
- Coach balances prerequisites, weaknesses, a focus table, written methods, the wider curriculum and due recall. Mistakes return after intervening questions.
- The syllabus provides direct teacher-led access to **247 named exercise families**, with scope descriptions, search and six year maps. This is a finite practice bank, not every possible curriculum question.
- Times tables cover each fact through ×12, direct multiplication, inverse division and missing factors. Multiplication evidence does not invent inverse evidence. A short match introduces at most three new table families before revisiting earlier facts.
- Year 2 focuses on 2/5/10; Year 3 on 3/4/8 and earlier tables; Year 4 onwards consolidates all tables through 12. Year 1 uses pictures, equal groups and sharing.
- Independent recall advances through 1, 3, 7, 14, 30 and 60-day intervals, at most once a day. Mistakes or mathematical help reset the interval. One perfect run cannot manufacture long-term mastery.
- Practical measuring, drawing, constructions and reasoning are recorded separately by a grown-up. Match-fit families plus those checks unlock a 12-shot promotion match requiring at least 90% independent accuracy. XP alone never completes a year. Year 6 graduates remain in Year 6 for review.

Academy promotion is a game milestone, not an official school placement or a validated attainment judgement. These selection and progression thresholds are product heuristics, not guarantees of permanent retention. See [the complete skills map](docs/CURRICULUM_MAP.md).

## Football career and meaningful rewards

Players choose a kit number, position, skin tone and hair colour. Twenty-seven clothing/equipment choices include kits, shorts, boots, hair, accessories, balls and trails. The artwork is original 2D block-style SVG, not Roblox assets.

Independent correct answers earn 10 XP plus a streak bonus rising to a maximum extra 10 XP. Supported correct answers earn 2 XP. Every 10 XP earns 1 credit. Credits buy cosmetics; purchases are checked for balance, ownership, level and duplicate charges. No payments, paid boosts or random prizes are included.

Level thresholds follow `60n + 25n²`, where `n = level − 1`, so early levels come quickly and later gaps grow. A first away kit costs 25 credits. Larger rewards require more work:

| Career target | Level | Different independently recalled facts | Practice days | Recall-secure facts |
| --- | ---: | ---: | ---: | ---: |
| Town Rovers | 2 | 20 | 1 | 0 |
| County United | 4 | 60 | 3 | 10 |
| Arsenal / Chelsea | 7 | 120 | 5 | 30 |
| Liverpool / Manchester City / Manchester United | 9 | 180 | 7 | 50 |
| Barcelona / Real Madrid | 12 | 250 | 10 | 80 |
| World All-Stars | 18 | 400 | 14 | 150 |

Club offers appear as in-game notes. These are fictional rewards without club affiliation. Arithmetic changes the kick style; accurate streaks unlock power shots, fireballs and meteor strikes. Reduced-motion and reading preferences keep the same rewards.

## Records and leagues

Personal records require a completed, unpaused timed match without mathematical hints and at least one correct answer. Version 4 comparison keys separate topic, table mode, length and timing. Higher XP wins, with faster elapsed time breaking equal-score/equal-goal ties.

The squad league compares **real profiles saved in the same browser**, with seven-day/all-time and played-year filters. It counts independent points from completed unpaused timed matches with at least five attempts. Lifetime totals survive the retained match-history limit. There is no global leaderboard, online pupil authentication or cross-device sync.

## Clear working and access

- Column addition carries sit below the answer in the next place-value column. Subtraction exchanges sit above crossed-out top digits. Worked examples preserve successive exchanges, including through zeros, and show an inverse check.
- Learners enter answers from the ones column and can write their own exchange/carry notes. Working notes do not reveal an answer or count as Coach help.
- Ten frames, crossing-10 jumps, equal groups, fraction diagrams, long multiplication and long division provide other worked models.
- Dyslexia-friendly mode uses cream surfaces, familiar sans-serif text, increased spacing and quieter motion. It is a preference, not a treatment.
- Questions and working can be read aloud. The app selects an actual installed `en-GB` voice when available, listens for voice-list changes and exposes speech pace. A British accent cannot be supplied when the device has no British voice.

## Data and privacy

The existing `numbergrove.data.v1` and `numbergrove.round.v1` browser keys are retained for migration. Genuine saved work is preserved. Fresh installs start with an empty squad. Exact unused legacy factory profiles may be removed; progress-bearing profiles are retained.

Profiles are local selections without passwords. Other people using the browser can switch players and view reports. Clearing browser data removes progress. JSON backup/restore and CSV results are available; restoring replaces the current squad after a confirmation. Keep backups private.

The app does not upload pupil answers. It includes no analytics, ads or external fonts/scripts. The host may keep ordinary access logs. A deployed public resource serves application files; each visitor’s progress stays in that visitor’s browser.

## Verification and current checkpoint

**64 automated tests pass**, including all generated answers, six-year promotion attainability, fraction arithmetic, exact table evidence, purchases, leagues, British speech and the written-method exchanges from `864 − 788` and `1000 − 27`.

[Verification evidence](docs/VERIFICATION.md) · [Next-session checkpoint](docs/NEXT_SESSION.md)

| Main files | Purpose |
| --- | --- |
| `dist/app.mjs`, `dist/academy-ui.mjs` | Profiles, question interface, match lifecycle and academy views |
| `dist/engine.mjs`, `dist/curriculum.mjs`, `dist/primary.mjs` | Question families, curriculum and answer validation |
| `dist/adaptive.mjs`, `dist/tables.mjs`, `dist/promotion.mjs` | Selection, recall evidence, six-year promotion and leagues |
| `dist/career.mjs`, `dist/avatar.mjs` | Reward gates, wallet, shop, club offers and original player artwork |
| `dist/column-method.mjs`, `dist/coaching.mjs`, `dist/experience.mjs` | Written methods, mathematical working and football animation |
| `dist/speech.mjs`, `dist/academy.css` | Read-aloud and accessible/responsive game styles |
| `scripts/build-marketing.mjs` | Thirty static marketing/resource pages and SEO metadata |
| `tests/`, `docs/` | Automated checks, source research, screenshots and remaining QA |
