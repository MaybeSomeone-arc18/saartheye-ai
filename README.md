# Saartheye

A browser prototype exploring local object detection and left/right audio cues for blind and low-vision users. It is not a safety device, a mobility aid validated for independent use, or a replacement for a cane. It has not been tested with blind users.

[Existing main demo](https://saartheye-ai.vercel.app/) - the public demo may differ from this review branch.

## What this branch implements

- React 19, Vite, TensorFlow.js 4.22 and COCO-SSD 2.2.3 (`lite_mobilenet_v2`). Inference uses WebGL where available, with CPU fallback. It does not use YOLO or a phone NPU.
- Camera permission and a rear-camera preference, with a 640x480 capture request. The actual resolution is browser/device dependent.
- Greedy same-class IoU matching, smoothed boxes and timestamped relative image-area growth. Growth is an approach proxy, not physical speed, distance or collision prediction. Warnings need several observations with hysteresis.
- Left/right stereo panning for one prioritized cue at a time. Presence sounds are 440 Hz. The warning tone is 880 Hz, with pulse rate mapped to the growth proxy. This is not full 3D audio.
- Standard and Social modes. Social softens cues for stable matched people while retaining warnings from other growing tracks. Simulated stress mode explicitly warns on every detection and is not measured approach behavior.
- Optional vibration independent of sound, using the browser Vibration API. API presence does not prove haptics work on a particular phone.
- Real completed detection rate and rolling p50/p95 inference duration in the HUD. These are not camera-to-sound latency. First-result time includes model/camera startup and user permission time.
- Visible camera/model errors, retry, sequential inference, stale-output clearing, camera shutdown and large keyboard-accessible controls.

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

Phone measurements: **not collected yet**. Synthetic logic tests and desktop checks are not phone benchmarks or user validation.

## Roadmap

A scoped native Android camera-to-bundled-model-to-stereo/haptic pipeline, device benchmarking, better tracking and alert evaluation, then consented accessibility feedback in a safe setting. Hardware acceleration and sub-15 ms latency are not promised.

This project predates the iQOO Finale. Third-party components include React, Vite, TensorFlow.js, COCO-SSD and browser APIs. Existing code and third-party model use must be disclosed in submissions.
