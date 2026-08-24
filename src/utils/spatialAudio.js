/* ═══════════════════════════════════════════════════════════
   SPATIAL AUDIO ENGINE — Sartheye ML
   ═══════════════════════════════════════════════════════════ */

let audioCtx = null
let hazardNode = null

/**
 * Lazily initialise AudioContext (must be called after user gesture).
 */
export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Play a safe target ping (440Hz Sine with exponential decay)
 * @param {number} pan -1.0 (Left) to +1.0 (Right)
 */
export function playSafePing(pan = 0) {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)

  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(clampPan(pan), now)

  osc.connect(gain)
  gain.connect(panner)
  panner.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 1.2)

  setTimeout(() => {
    try {
      gain.disconnect()
      panner.disconnect()
    } catch (e) {}
  }, 1500)
}

/**
 * Play a very soft ambient ping for stationary SOCIAL nodes
 */
export function playAmbientPing(pan = 0) {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.05, now + 0.1) // Much softer
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(clampPan(pan), now)

  osc.connect(gain)
  gain.connect(panner)
  panner.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 1.6)

  setTimeout(() => {
    try {
      gain.disconnect()
      panner.disconnect()
    } catch (e) {}
  }, 2000)
}

/**
 * Maintain a continuous hazard pulse (880Hz Sawtooth + 1.2Hz LFO)
 * @param {boolean} active 
 * @param {number} pan -1.0 (Left) to +1.0 (Right)
 */
export function setHazardTone(active, pan = 0) {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const clampedPan = clampPan(pan)

  if (active && !hazardNode) {
    // Start new hazard tone
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, now)

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(1.2, now)

    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(0.1, now) // LFO depth

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.05, now) // Base volume
    masterGain.gain.linearRampToValueAtTime(0.08, now + 0.5)

    lfo.connect(lfoGain)
    lfoGain.connect(masterGain.gain)

    const panner = ctx.createStereoPanner()
    panner.pan.setValueAtTime(clampedPan, now)

    osc.connect(masterGain)
    masterGain.connect(panner)
    panner.connect(ctx.destination)

    osc.start(now)
    lfo.start(now)

    hazardNode = { osc, lfo, lfoGain, masterGain, panner }
  } else if (active && hazardNode) {
    // Smoothly interpolate panning
    hazardNode.panner.pan.setTargetAtTime(clampedPan, now, 0.1)
  } else if (!active && hazardNode) {
    // Fade out and stop
    const n = hazardNode
    n.masterGain.gain.setTargetAtTime(0.001, now, 0.1)
    setTimeout(() => {
      try {
        n.osc.stop()
        n.lfo.stop()
        n.masterGain.disconnect()
        n.panner.disconnect()
      } catch (e) {}
    }, 500)
    hazardNode = null
  }
}

function clampPan(v) {
  return Math.max(-1, Math.min(1, v))
}

/* ─────────────────────────────────────────────
   HAPTIC FEEDBACK
   ───────────────────────────────────────────── */

export function vibrateHazard() {
  try {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100])
  } catch {}
}

export function vibrateTap() {
  try {
    if (navigator.vibrate) navigator.vibrate(30)
  } catch {}
}
