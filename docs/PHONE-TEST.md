# Phone test protocol

One supervised session, about 30-45 minutes, produces the numbers this project
may publish. Run it indoors in a clear area. Never blindfolded, never in
traffic, never while walking near hazards. The phone holder stays responsible
for their own safety; the prototype is not relied on for navigation.

## Setup

- Device: record model, Android version, Chrome version.
- Use the production build (preview or the live site), not `npm run dev`.
- Note the actual capture resolution the browser grants.
- Charge the phone; a hot or throttling phone skews sustained-run results.

## Checklist and results template

Fill in during the session. Keep failures - they are results too.

| # | Check | Pass/Fail | Notes |
| --- | --- | --- | --- |
| 1 | Camera permission granted; rear camera used | | |
| 2 | Model loads; first-result time recorded | | ____ s |
| 3 | Spoken cue audible: object name + direction ("person, left") | | |
| 4 | Left cue pans left, right cue pans right (headphones) | | |
| 5 | Warning tone distinct from presence tone | | |
| 6 | Vibration felt with sound off (if supported) | | |
| 7 | Growing object raises approach warning; stable object stays quiet | | |
| 8 | SOCIAL mode: stable person softens, growing second object still warns | | |
| 9 | Detection dropout recovers without a stuck cue | | |
| 10 | Permission denial shows a visible error, not a hang | | |
| 11 | Offline: after "offline ready", close tab + airplane mode + restart app | | |
| 12 | Sustained run (5 min): p50/p95 at start vs end | | start ____/____ ms, end ____/____ ms |

Metrics to copy from the HUD at the end: completed detections/s ____ ,
inference p50 ____ ms, p95 ____ ms, first-result time ____ s.

## After the session

Add a dated row to docs/EVIDENCE.md marked fresh, with this template attached
(filled). Numbers from this session replace the 2026-10-03 clip observations.
