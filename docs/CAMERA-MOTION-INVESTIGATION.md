# Camera-motion false-warning investigation (2026-10-14, synthetic replay only)

Local investigation, no phone input, no public claims. Nothing here changes
shipped behavior: `src/` is untouched. Probes live in `probes/` and are not
wired into `npm test`.

## Question

README admits: common expansion of 3+ tracks is suppressed as possible camera
motion, but single-object camera motion can still cause false warnings. How
big is the gap, and can a code-level signal reduce it?

## Method

Replay synthetic scenes through the real `createTracker` + `chooseCue`
(probes/camera-motion-replay.mjs). Camera forward motion is modelled correctly:
every box scales about the FRAME center (projection), so off-center static
objects drift radially outward as they grow. A real approaching object grows
about its own center; its center stays fixed.

## Findings (current code)

| Scene | Warning frames /40 | Correct? |
| --- | --- | --- |
| Real approach, 1 object | 29 (from ~1.8s) | Yes - wanted |
| Camera dolly, 1 off-center static object | 29 | NO - false warning |
| Camera dolly, 2 static objects | 29 | NO - suppression needs >=3 |
| Camera dolly, 4 static objects | 0 | Yes - existing suppression works |
| Pure camera pan | 0 | Yes |
| Camera dolly, 1 DEAD-CENTER static object | 29 | NO - and irreducible by this signal |

A dead-center static object during forward camera motion is indistinguishable
from an object approaching head-on, using area growth alone. That limit stays
documented; no fix claims to solve it.

## Candidate mitigation (probe only, NOT applied)

probes/camera-motion-mitigation-probe.mjs adds a per-track radial center-drift
signature: area growth + center moving radially outward from the frame center
(>40 px off-center, >50 px/s) marks the track motion-uncertain and suppresses
its warning. Measured on the same replays:

| Scene | Current | Mitigated |
| --- | --- | --- |
| Camera dolly, 1-2 off-center static objects | 29/40 | 4/40 (warm-up only) |
| Real approach (centered or off-center) | 29/40 | 29/40 preserved |
| Camera dolly + one real approacher | 33/40 | 33/40 preserved |
| Dead-center dolly | 29/40 | 29/40 (limit unchanged) |

Evidence is synthetic only. Before any merge: replay real phone-session frames
through both paths, keep the 31/31 suite green, and state the dead-center
limit wherever the feature is described.
