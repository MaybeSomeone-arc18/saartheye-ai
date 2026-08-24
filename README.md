<div align="center">
  <br />
  <h1>सारथि-EYE <br /> SAARTHEYE</h1>
  <p>
    <strong>The Guide That Sees For You.</strong>
  </p>
  <p>
    An advanced, on-device navigation companion designed for the visually impaired. Running entirely in-browser for zero-latency real-time vision and 3D spatial audio echolocation.
  </p>
  <br />
</div>

## Architecture of Awareness.

Saartheye represents a paradigm shift in accessibility technology. By leveraging raw silicon sensing and edge AI, it completely bypasses the cloud. No servers, no network latency—just direct, real-time spatial awareness.

### 01. Silicon Sensing
Raw camera streams bypass overhead, piping directly into native device memory. Driven by a highly optimized **YOLOv12 INT8** model via TensorFlow.js, it processes environmental data at the speed of thought. Zero frame drops. Zero network calls. 

### 02. Spatial Echolocation
We translated 2D bounding boxes into a 3D binaural landscape. By mathematically mapping pixel coordinates to a dynamic Web Audio spatial panner network, Saartheye paints the world in sound. Obstacle proximity alters frequency pitch, while lateral placement translates seamlessly to stereo panning.

### 03. Spatial Velocity Vectoring
Saartheye doesn't just see what's there; it sees where it's going. The custom velocity engine calculates instantaneous `dz/dt` bounding box growth (`Scale_Delta`). Rapidly enlarging objects trigger aggressive, high-frequency collision trajectories, while stationary objects fade into ambient background acoustics.

---

## Intelligent Contextual Modes

Saartheye features **Auto Sense**, an intelligent state-machine that autonomously adapts to your environment by tracking the spatial velocity of objects around you. 

* **Outdoor Mode:** Standard high-sensitivity navigation. Aggressive alerting on all rapidly approaching objects and nearby collision hazards.
* **Social Mode:** Smart suppression active. Automatically detects stationary conversation partners and suppresses aggressive alarms, emitting soft, ambient 440Hz pings to maintain gentle spatial awareness.
* **Stress Test:** A simulated emergency override that forces a rapidly approaching vector to demonstrate the critical collision feedback loop.

---

## Technology Stack

Engineered for absolute performance on the modern web.

* **Core Engine:** React + Vite
* **Design System:** Vanilla CSS & Tailwind CSS (Custom Contextual VW Scaling)
* **Vision Inference:** TensorFlow.js (`@tensorflow-models/coco-ssd`)
* **Audio Synthesis:** Web Audio API (Native Spatial Panner Nodes)

---

## Getting Started

Saartheye requires no installation and runs directly on the edge. To run the development environment locally:

```bash
# Install dependencies
npm install

# Start the high-performance local edge server
npm run dev
```

> **Note:** Camera permissions are strictly required. For the Spatial Echolocation engine to map the binaural landscape accurately, **stereo headphones are mandatory**.

---

<div align="center">
  <p>Designed and engineered for true spatial independence.</p>
</div>
