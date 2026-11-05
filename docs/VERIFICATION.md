# Matchday Maths 5 verification

## Automated checks

`npm run check`, `npm test`, `npm run build` and `npm run build:worker` passed. [Test output](test-results.txt)

The 76 tests cover generated answers, curriculum routing, table evidence, later-day recall, six-year promotion, exact exchanges, long multiplication and division, reward gates, kit migration, accessibility helpers, marketing links and the ranked API with its SQL schema. League tests use two generated aliases and verify ordering, year and division boundaries, expiry, repeat submissions, promotion and removal of an alias.

## Browser checks

- All five navigation tabs fit in 320 px and 390 px phone previews. The pitch sits above the question and the desktop number pad is hidden.
- A new Year 6 profile entered a Year 6 warm-up. A correct answer played a goal and an incorrect answer played a miss.
- The Shop opened from the match report. Hair, shirt pattern, trim and clubhouse colour changes applied. The starting paid away kit displayed 125 credits.
- A six-digit long multiplication answer and a long division answer with a remainder scored goals. The written boards displayed aligned working fields. Saving a free-practice round showed zero career XP. Coach help opened the worked board from beside read-aloud.
- A complete ranked Year 6 match recorded nine goals, appeared in the standings and unlocked County. This used the browser preview’s test database.

[Phone goal and shot camera](matchday-phone-goal-v5.jpg)

The image shows a fictional test player. The browser runs used a phone-sized viewport. The earlier version’s screenshots remain in this directory for history.
