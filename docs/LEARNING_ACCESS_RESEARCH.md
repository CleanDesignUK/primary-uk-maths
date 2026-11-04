# Matchday Maths: reading access, fluency and engagement

Research checked 4 November 2026. This is an implementation brief. The numeric thresholds and reward ideas below are product heuristics, not validated teaching protocols or guarantees of retention.

## Verified source findings

**British Dyslexia Association.** Its style guide favours familiar sans-serif text, roughly 16–19 px or larger when requested, proportional spacing, about 1.5 line height, bold emphasis, clear headings, left alignment and short instructions. It discourages continuous capitals, italics, distracting patterned surrounds and dazzling white reading surfaces. Cream or a light pastel can help some readers; individual preferences differ. Source: [BDA Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf?v=1680084017).

**NCETM.** Fluency combines fact recall, accurate and appropriate procedures, and flexible connections. Its primary fluency guidance explicitly joins related facts, conceptual understanding, retrieval on later days and application. It advises slowing down and focusing on one fact when a pupil needs more support. Source: [The Five Big Ideas at Primary: Fluency](https://www.ncetm.org.uk/features/the-five-big-ideas-at-primary-fluency/). Refs: , , . Supporting primary overview: [Research, evidence and argument](https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained/supporting-research-evidence-and-argument/), refs , , .

**EEF.** Its KS2/3 guidance recommends assessment that changes future teaching, clear specific feedback and attention to misconceptions. It does not present itself as a complete teaching programme. The early maths guidance covers ages 3–7 and includes mathematical language, everyday activity, representations, stories and number games. Sources: [KS2 and KS3](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3), refs , ; [Early Years and KS1](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths), refs , .

**Web Speech API.** Voice availability is device/browser dependent; the voice list can initially be empty and change asynchronously. `lang` is a BCP 47 tag; specifying `en-GB` alone does not install or guarantee a British voice. An explicit voice must come from the available voice list. Sources: [Web Speech community specification](https://webaudio.github.io/web-speech-api/); MDN [getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [voice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice), [lang](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang), and [voice properties](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice).

## Reading button and clean solutions

Recommended toggle label: **Dyslexia-friendly** with `aria-pressed` and a stored preference. Describe it as a reading preference, not diagnosis or treatment. Apply a familiar sans-serif, larger support text, sentence case, about 1.6 line height, a cream question/support surface, modest tracking and generous control spacing. Keep maths symbols large and aligned. Do not apply `letter-spacing: .35em`: BDA's spacing discussion refers to a proportion of average letter width, not 35% of an em. Offer normal/wider spacing rather than claiming one setting suits everybody.

Keep each worked step to a heading, one mathematical line and an optional short explanation. Use the same numeric model to drive the answer, diagram, displayed working and spoken working. For 8 + 5: show the split 5 = 2 + 3, then 8 + 2 = 10, then 10 + 3 = 13. Put an inverse check behind a disclosure. For columns, expose each place-value exchange and carry explicitly, including exchanges through zeros. Prefer “exchange 1 ten for 10 ones” to an unexplained “borrow 1”.

Animate the football action after an answer. Keep the question area still while the pupil is thinking. Reading mode should quiet background effects; a separate reduced-motion option must retain the same earned rewards through a static badge/text alternative. Accessibility settings and read-aloud must not reduce XP, coins, mastery credit or promotion eligibility. Mathematical hints can remain separately labelled as supported answers.

## British read-aloud implementation

1. Feature-detect synthesis and preserve visible working as the universal fallback.
2. Load `getVoices()` immediately and again when `voiceschanged` fires. Store a selected `voiceURI`, not an array index.
3. Prefer the explicitly chosen voice; otherwise choose an actual `en-GB` voice, preferring a local voice when available. Set the utterance's `voice` and `lang = 'en-GB'`.
4. If there is no British voice, state that the browser's available voice will be used, or let the user keep written help. Do not label an American fallback “British”. A native British voice cannot be guaranteed on all devices without a separate audio service or recordings.
5. Cancel previous utterances before a new question, when leaving the match and when the user stops speech. Provide a sample and speed control. A rate around 0.85–0.95 is a starting preference, not a clinical recommendation.
6. Generate spoken maths from question data. Speak × as “times”, ÷ as “divided by”, □ as “missing number”, cm² as “square centimetres”, and fractions with their mathematical names where possible. Speak decimal digits individually. Use British number phrasing such as “one hundred and twenty-six” and British spelling throughout the interface.

## Concrete times-table policy

The following is a proposed software policy informed by the principles above, not an evidence-validated sequence of exact percentages.

- Track a canonical multiplication fact family, but keep separate evidence for multiplication, missing-factor and inverse-division formats. Seeing 3 × 8 should connect to 8 × 3, 24 ÷ 3 and 24 ÷ 8; a single correct multiplication answer should not prove the whole family secure.
- Begin with an array/equal-groups model for an unfamiliar fact, then independent recall. A supported answer does not advance independent recall evidence.
- Limit new facts in a short round, for example at most three. Combine them with previously learned and due facts. Narrow to fewer new facts after repeated errors.
- Mix tables after sufficient individual coverage. Continue to include earlier learned tables after new tables unlock. Include missing factors and inverse facts after direct recall becomes reliable.
- Replay a mistake after several intervening questions. Preserve the weakness for later sessions so ending a round cannot erase it. Step back to supporting facts after repeated difficulty.
- Same-day repetitions can establish readiness to continue, but should not establish durable mastery. Require broad fact coverage, separate successful sessions and retrieval on later days. Existing intervals of 1, 3, 7, 14, 30 and 60 days are transparent product choices, not a proven optimum for every child.
- Gate year promotion on curriculum evidence, not accumulated XP or the avatar's level. Make practical/observational objectives visible as teacher checks rather than silently declaring them assessed by a typed quiz.
- Keep speed challenges optional and compare like conditions. Accuracy, supported learning and accessible reading settings should remain useful. A child taking longer to read a prompt should not be publicly framed as mathematically weaker.

## Strong engagement without coercion

Use short matches with a clear result and an easy stopping point. Reward visible learning achievements, improvement and completed sessions. Make the first level and affordable cosmetic unlock arrive quickly, then increase the level threshold gradually. Explain each unlock's cost and requirement. Credits are earned in play and buy cosmetics, not learning advantages. Avoid random paid rewards, loss-of-progress threats, expiring streak pressure and endless automatic rounds.

Personal records should be prominent. For leaderboards, compare the same challenge, year, question format and timing conditions, or show weekly improvement. Use nicknames and an opt-out. In the browser-local version, label the board as the squad on this device; do not imply a global student database. Never seed invented children or scores. Leave learning accessible even when a pupil is low on the board.

Scout letters can celebrate a real milestone and preview the next requirement. Team status, kit numbers, positions, shirts, boots and celebration effects can supply meaningful choices. Original blocky characters and fictional club badges give the intended football style without implying an official Roblox or professional-club partnership.

## Supplementary resource positioning and SEO

Recommended positioning: **“The basics of the curriculum. Extra maths practice for Years 1–6.”** Supporting description: **“A supplementary learning resource organised around England's primary maths curriculum, with short football challenges, worked examples and a personal practice path.”** Distinguish an academy promotion from a school's judgement of attainment. Do not promise permanent recall, proven dyslexia treatment, automatic exam success, or official approval.

Google's current people-first guidance emphasises useful original content, descriptive titles and visible expertise rather than mass-produced pages created to manipulate ranking. Source: [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

Recommended static page set: home, six year pages, times tables, number bonds, column methods, curriculum map, parents/teachers, and accessibility. Each year page should contain genuinely different objectives, a worked example, a link into the appropriate practice and a transparent account of what the app covers. Use unique descriptive titles and descriptions, meaningful internal links, actual rendered HTML, a sitemap and correct canonical URLs. Avoid a large set of thin near-duplicate keyword pages. Show the author/reviewer honestly without invented credentials, reviews or aggregate ratings. Do not promise special Google results from schema markup.

The existing owner-private preview cannot be treated as a publicly indexable marketing site. Public hosting and crawlability must be verified before claiming the SEO pages can appear in search. Scope the curriculum claim to England; Wales, Scotland and Northern Ireland organise their curricula differently.
