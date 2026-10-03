# Saartheye

A browser prototype exploring local object detection and spoken object/direction cues and optional tones for blind and low-vision users. It is not a safety device, a mobility aid validated for independent use, or a replacement for a cane. It has not been tested with blind users.

[Existing main demo](https://saartheye-ai.vercel.app/) - the public demo may differ from this review branch.

## What this branch implements

- React 19, Vite, TensorFlow.js 4.22 and COCO-SSD 2.2.3 (`lite_mobilenet_v2`). Model loading, warm-up and inference run in a dedicated module worker. Transferable ImageBitmap frames keep the UI thread separate. Worker inference uses WebGL where available, with CPU fallback. Worker/ImageBitmap support is required; no blocking main-thread fallback is silently used. It does not use YOLO or a phone NPU.
- Camera permission and a rear-camera preference, with a 640x480 capture request. The actual resolution is browser/device dependent.
- Greedy same-class IoU matching, smoothed boxes and timestamped relative image-area growth. Growth is an approach proxy, not physical speed, distance or collision prediction. Warnings need several observations with hysteresis.
- Rate-limited spoken object and left/right/ahead cues use bundled offline English words through Web Audio, independent of the phone voice service. A local English Web Speech voice is secondary fallback if bundled decode is unavailable. No network voice is selected. Tests need a tap to unlock audio, and empty detections cannot interrupt the six-second test window. Physical audibility still needs phone verification.
- Experimental approach estimates require sustained box growth and track age; higher "path" severity adds central-frame overlap and faster growth. This is not calibrated proximity or collision prediction. Common expansion of at least three tracks is suppressed as possible camera motion; single-object camera motion can still cause false warnings.
- Optional left/right stereo panning for one prioritized cue at a time. Presence sounds are 440 Hz. The warning tone is 880 Hz, with pulse rate mapped to the growth proxy. This is not full 3D audio.
- Standard and Social modes. Social softens cues for stable matched people while retaining warnings from other growing tracks. Simulated stress mode explicitly warns on every detection and is not measured approach behavior.
- Optional vibration independent of sound, using the browser Vibration API. API presence does not prove haptics work on a particular phone.
- Real completed detection rate and rolling p50/p95 inference duration in the HUD. These are not camera-to-sound latency. First-result time includes model/camera startup and user permission time.
- Visible camera/model errors, retry, fresh-video-frame sequential inference (no fixed 40ms idle delay), stale-output clearing, camera shutdown and large keyboard-accessible controls.

## Privacy and offline behavior

The application does not implement camera recording, frame storage or frame uploading. Pixel processing and detection run locally. This is a code-scope statement, not a guarantee of secure erasure of browser or GPU memory.

The build downloads and checksum-verifies the pinned model JSON and five weight shards into `public/models/coco`, then bundles them into the site. Build setup needs internet if the assets are not already available. The production build generates a versioned service worker that caches the app shell, icons and model. Initial setup requires internet. The HUD reports offline readiness only when every production asset is found in its cache. Browser storage can be evicted, and private browsing/device restrictions can prevent persistence. Verify close-and-restart in airplane mode on the target phone before claiming offline startup. Installability is not native Android inference or NPU access.

Model files originate from the TensorFlow.js COCO-SSD distribution:
https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json

Upstream model implementation and documentation:
https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd

## Known limits

- 80 COCO object classes, not arbitrary hazards. There is no reliable stair, drop-off, glass, pothole or thin-branch detector.
- No depth estimation, metric distance, physical speed, camera-motion compensation, route guidance or free-path guarantee. Stationary hazards may receive only presence cues.
- Same-class detections can swap tracks in crowds or occlusion. Camera movement and changing lighting can cause false warnings or missed warnings. Thresholds are engineering defaults, not field-validated settings.
- Warnings take multiple detections to accumulate. The freshness watchdog clears output after 1.5 seconds without a completed result, adapting up to 4 seconds for slow measured inference. This favors avoiding stale alarms, but a slow phone can lose cues.
- Actual stereo audibility needs headphones and phone verification. Vibration support varies.
- Not validated with blind users. No safety/accuracy/latency claim is made.

## Local development and checks

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

Service worker registration is production-only. Test offline behavior using the production preview on localhost or an HTTPS review deployment, not the Vite development server. Do not commit `dist` or `node_modules`.

## Target-phone test checklist

Record phone model, Android/Chrome versions and actual capture resolution. In a supervised clear indoor area, test left/right cue audibility, stable/growing people, a growing second object in Social mode, detection dropout, camera permission denial, audio off/vibration on, and model load retry. Log completed detection rate, inference p50/p95, first-result time and a short sustained run for slowdown. Separately test loaded-tab disconnection and app close/restart in airplane mode after offline readiness is verified. Keep failures in the report. Do not test blindfolded or in traffic.

Two short OnePlus Nord 2 5G clips show about 3.5-3.7 completed detections/s, rolling inference p50 223-228 ms and p95 308-396 ms. These are uncontrolled session observations, not end-to-end latency or accuracy evidence. Tones are present in the second recording; physical audibility, spoken cues and offline restart still need verification. Synthetic logic tests and desktop checks are not phone benchmarks or user validation.

## Roadmap

A scoped native Android camera-to-bundled-model-to-stereo/haptic pipeline, device benchmarking, better tracking and alert evaluation, then consented accessibility feedback in a safe setting. Hardware acceleration and sub-15 ms latency are not promised.


## Detector comparison review

Light remains the default (COCO-SSD lite, TensorFlow.js WebGL/CPU). Balanced uses official YOLOX-Tiny ONNX (20.2 MB); Accuracy uses YOLOX-M (101.3 MB). YOLOX and its official release weights are Apache-2.0, Megvii 2021-2022. ONNX Runtime Web 1.23.2 is MIT. License texts are in public. YOLOX runs single-threaded WASM in a dedicated worker, with BGR 0-255 top-left letterboxing and class-agnostic NMS to reduce duplicate cross-class boxes. No Snapdragon NPU or WebGPU use is claimed.

Build-only downloads pin SHA-256 hashes from https://github.com/Megvii-BaseDetection/YOLOX/releases/tag/0.1.1rc0. All runtime assets are same-origin and offline-cacheable. First setup needs roughly 140 MB including all modes; browser storage may be evicted. Weight bytes are included in deployment, retrieved by checksum at build rather than committed to Git.

Open `/?compare` for same-camera-frame comparison. Three independent workers run sequentially on copies of the same snapshot, reducing concurrency contention. Shows per-model labels, scores, boxes, rolling inference p50/p95, worker load and exportable JSON. Potential standalone rate is reciprocal mean worker turnaround, NOT measured camera FPS. Sequential comparison cycle cadence is shown separately. Production settings differ: lite score 0.5; YOLOX 0.35. Compare misses and false labels manually; confidence scores are not calibrated across models.

Small smoke test: seven COCO training photos and one owner screenshot, not held-out accuracy or blind-user validation. Tiny improved some chair/cup detections versus lite but missed the laptop in one case. M detected more chair/phone instances and recovered that laptop. None recognized the screenshot's partially hidden red bottle; its visible top was mislabeled phone/cup. Screenshot UI created false detections. These results do not establish a general accuracy improvement.

Same desktop test environment, fake camera standalone: Tiny 2.8 detections/s, p50/p95 310/434 ms (35 samples); M 0.3/s, 2932/3015 ms (4); lite 0.9/s, 1086/1310 ms (11). Software-GPU limitations and unequal sample sizes matter. These are not M4 Air, Nord 2 or iQOO phone results. Actual devices must run comparison and standalone tests before selection. M is a slow explicit experiment, not navigation-ready.

Strongest present use case: supervised indoor object-location research using spoken left/right/ahead cues. It is not reliable collision avoidance, distance measurement, or validated independent navigation. Office Kit can mirror the phone demo to a paired computer; inference remains on the phone. Deeper laptop inference via Office Kit is a proposal, not implemented camera transport.
