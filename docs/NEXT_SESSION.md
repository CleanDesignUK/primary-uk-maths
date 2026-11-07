# Matchday Maths 7.0.0 checkpoint

Repository: `CleanDesignUK/primary-uk-maths`. Release branch:
`launch/november-readiness`. Preserve the incremental commit history when merging.

[Launch checklist](LAUNCH_READINESS.md) · [Verification](VERIFICATION.md)

This release adds responsive written and decimal methods, explicit remainders,
foundation-first warm-up and error recovery, one-time starter credits, football
career cards, larger celebrations and parent year profiles with example questions
and exact mastery rules. Browser storage keys and the backup version are preserved.
Earlier quotient-only division evidence is separated from full remainder evidence;
old match history remains available.

The static GitHub Pages entry is `/primary-uk-maths/dist/play/`. Static play includes
local profiles and the squad league. Public ranked hosting remains a separate
infrastructure choice. Before moving hosts, export player backups because browser
storage belongs to the current origin.

Always run `npm run check`, `npm run build`, `npm run build:worker` and `npm test`.
The GitHub workflow performs these checks on pushes and pull requests. Do not claim
physical-device verification: current mobile checks are browser viewports.
