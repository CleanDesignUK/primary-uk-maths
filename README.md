# Matchday Maths

A free football-themed supplementary resource for the basics of England’s primary maths curriculum, Years 1–6. Each player chooses a nickname, starting year and kit. Their first warm-up begins as soon as they enter the academy.

## Run the academy

```sh
npm run check
npm test
npm run dev
```

Use Node 22.13 or later for the local preview and league tests, which use built-in SQLite. `npm run dev` serves the full academy with a temporary league database. Static play can also be served with `python3 -m http.server 8080 --directory dist`. The GitHub Pages root opens the game at `dist/play/`. Parents and teachers can access the resource pages from the game footer.

`npm run build` regenerates 30 marketing and curriculum pages. Set `SITE_ORIGIN` to the exact public address, including any project path, before generating a public sitemap and canonical URLs. `npm run build:worker` produces the Worker entry point. The hosted edition needs a D1 binding named `DB` and the migration in `drizzle/`.

## The learning route

- Coach starts with the selected year and mixes current-year work, table facts and due reviews. “I don’t know” shows Coach’s working and can route the pupil to a supporting skill. Wrong answers can return after intervening practice.
- The six [curriculum maps](docs/CURRICULUM_MAP.md) contain 247 named exercise families with worked examples. Physical measuring, construction and explanation have separate grown-up checklists.
- Individual and mixed table practice covers facts through ×12, related division and missing factors. Year 2 emphasises 2, 5 and 10. Year 3 emphasises 3, 4 and 8. Later years consolidate all tables. Coach revisits facts over gaps of up to 60 days.
- A short untimed progress check uses three to six distinct questions the pupil has answered independently. Grown-up reports flag persistent difficulty and suggest an exercise. Promotion requires the year’s practice evidence, practical checks and a mixed promotion match. These are game milestones.
- Column addition and subtraction show carries and exchanges. Written multiplication has aligned carry and partial-product rows. Division has bus-stop or long-division working, including remainders where appropriate. Fraction answers use stacked numerator and denominator fields, with a whole-number box for mixed answers. Working paper provides extra space.
- The Aa button applies the dyslexia-friendly layout. Reduced motion has its own setting. Questions and working can be read aloud using an installed British voice when available.

## The football career

Play, Units, Shop, Tables and League are available during matches. Visiting a tab saves the current round for that player. The shot camera stays above the question on phones. Players can aim left, centre or right and complete rotating match objectives with independent answers. Accurate streaks unlock power shots, fireballs and meteor strikes.

Players bank career XP after completing an eligible Coach match. New and due facts count when answered independently in the current-year route. Repeated facts, revealed answers and free-choice rounds still give practice feedback and record learning. Every 10 career XP earns one credit. Previous XP and owned kit are preserved.

The Shop has 67 choices across kit, hair, boots, shorts, accessories, shirt designs, balls, trails and celebrations. Players can also change shirt number, position, trim, skin tone and clubhouse colour. The first paid kit costs 125 credits. Levels start at 85 XP and the gaps grow. Club offers require a combination of levels, varied facts, practice days and secure recall. Club offers are fictional game rewards.

## Profiles and leagues

The squad league compares eligible completed Coach matches across profiles on one browser. Local profiles, progress, cosmetics and working stay in that browser. Export a JSON backup to move a squad or CSV to review results. Earlier progress uses the same storage keys.

In the database-backed edition, players can opt into the World League using a generated football alias. It ranks the best completed ten-shot match each week within a year group and division. Eight verified goals in Academy unlock County. Eight in County unlock Premier. The server issues and scores each question, enforces the timer and limits ranked starts per alias. The ranking uses the player’s chosen year.

Ranked shots send answers for scoring. The database retains the generated alias, match totals and timing. Leave World League removes that alias and its results. The static edition supports local play and the squad league.

## Verification

[Browser checks and screenshots](docs/VERIFICATION.md) · [77 automated tests](docs/test-results.txt)
