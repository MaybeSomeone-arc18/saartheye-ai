# Evidence log

What is verified about this prototype, how, and when. New entries go on top.
Rules: every number names how it was measured. "Fresh" means re-run against the
current code, not carried over from an older session. Failed checks stay listed.

## 2026-10-14 - independent re-verification (fresh)

| Check | Result | How |
| --- | --- | --- |
| Logic test suite | 25/25 pass on `main`; 31/31 on branch `basis-evidence-prep` | Fresh clone of `main` (13eb31b), `npm test` on Node 22.23.3; branch adds 6 offlineStatus behavior tests |
| Live site renders | Pass | saartheye-ai.vercel.app loaded in a browser; honest limits shown on page |
| Public claims honesty | Pass | Page and README state: prototype, not a safety device, not tested with blind users |

## 2026-10-03 - phone clip observations (past, uncontrolled)

| Observation | Value | Caveat |
| --- | --- | --- |
| Rolling inference p50 | 223-228 ms | Two short OnePlus Nord 2 5G clips, uncontrolled session |
| Rolling inference p95 | 308-396 ms | Same clips |
| Completed detections | ~3.5-3.7 /s | Same clips |

These are not end-to-end camera-to-sound latency, not accuracy evidence, and
were not re-measured since. Treat them as stale until the phone protocol in
docs/PHONE-TEST.md is run again.

## Still unverified (do not claim)

- Spoken-cue audibility on a physical phone (bundled offline words).
- Left/right stereo panning audibility (needs headphones + phone).
- Vibration on a physical phone.
- Offline close-and-restart in airplane mode after offline-ready.
- Sustained-run slowdown (thermal or otherwise).
- Any testing with blind or low-vision users. Never done.
