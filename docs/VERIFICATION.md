# Matchday Maths 4 verification

Checkpoint: 4 November 2026. Screenshots show developer test play, not pupil assessment data. Test profiles are not bundled in the application.

## Automated

`npm run check` and `npm test` pass. There are 64 tests. [Full output](test-results.txt).

Coverage includes: arithmetic and all generated question answers; six year maps and probes; prerequisite routing and delayed retries; spaced recall; direct/inverse/missing table evidence; three-new-family table limit; correct fraction, decimal and percentage arithmetic; valid clock/coordinate/graph responses; six-year promotion gates and attainability; nonlinear levels; balances, purchases and inventory; larger club offers requiring actual practice; local league eligibility/ties/lifetime totals; real British-voice selection; long division; and all 30 marketing pages’ metadata, structured data and local links.

The written-method tests check every column pool and the user's exact example, `864 − 788 = 76`. They retain the intermediate tens value 5 before 15, final ones value 14 and the hundreds reduction to 7. Exchange through zeros is also checked independently for `1000 − 27`. Addition carries appear below the answer and in the incoming column.

## Browser checks actually completed

- Fresh empty squad and profile creation, without names or invented scores.
- Custom nickname, number 17, Midfielder position and skin tone.
- Immediate Year 3 warm-up and saving an unfinished warm-up.
- Dyslexia-friendly mode toggled during a live question; a correct independent answer still earned 10 XP.
- A complete ten-shot multiplication match: 10/10, 170 XP, new record, 17 earned credits and the three daily goals.
- A second complete ten-shot table-coach match, which presented multiplication, inverse division and missing factors.
- Buying the 25-credit away kit after earning 35 credits. The kit was equipped and 10 credits remained after reloading.
- The shop visibly withheld club offers because the test player had only seven different facts and one practice day.
- Updated subtraction workspace and the actual worked method for `701 − 579 = 122`, including exchange through a zero, crossed-out original digits and the inverse check.
- Marketing homepage loaded, with six year links, resource navigation and the stated supplementary-resource scope.
- Corrected an old hash-route alias that had sent Tables to the syllabus instead of the dedicated table gym.

## Current proof

- [Fresh profile screen](matchday-profile-v4.jpg)
- [Dyslexia-friendly live question](matchday-reading-v4.jpg)
- [Real completed match and record](matchday-record-v4.jpg)
- [Earned kit purchase after reload](matchday-kit-v4.jpg)
- [Revised column workspace](matchday-column-v4.jpg)
- [Actual exchanged-digit working](matchday-column-working-v4.jpg)

Earlier `*-preview.jpg` files belong to version 3 and are retained as historical screenshots. They are not proof of this expansion.

## Still to complete

Final 390 px mobile browser regression; a second player's full UI match and displayed league comparison; direct browser interaction checks for the new Year 6 constructions; the complete public hosting/canonical/indexing configuration; and final deployed-version checks. Automated checks cover the underlying rules but do not replace those browser checks. See [the next-session checkpoint](NEXT_SESSION.md).

This is supplementary practice. Neither automated tests nor browser QA establishes teaching efficacy, official attainment or permanent retention.
