# Current checkpoint

Release 7.1.0 is published and verified, 8 November 2026.

- PR #3 merged five development commits intact into main, merge `e7693758d0d3945f83070ceec2ca6dbd39b1e1a5`.
- 132 automated tests pass. Module syntax, 30 public pages, Worker packaging, GitHub verification and Pages deployment pass.
- The public game reports 7.1.0. First-shot play, new Year 5 player/warm-up, Dashboard and the Squad League fallback were verified on the published site.
- All 13 PDF feedback pages are addressed. [Checklist, scope and browser evidence](NOVEMBER_8_FEEDBACK.md).
- Existing progress keys and backup version are preserved. QA profiles are not shipped. New imports and styles use 7.1.0 together.
- Public GitHub Pages uses local learning and Squad League on one device. Online World League needs its separate database service and is omitted from launch navigation.

Future work should start from current main, retain focused commits and repeat relevant browser checks after behaviour changes. Do not reintroduce white text on light reward panels, hide warm-ups from history or conflate practice accuracy with secure year mastery.
