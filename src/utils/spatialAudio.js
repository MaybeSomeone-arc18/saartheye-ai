/* ═══════════════════════════════════════════════════════════
   SPATIAL AUDIO ENGINE — Saartheye ML
   ═══════════════════════════════════════════════════════════ */

let audioCtx = null
let hazardNode = null

/**
 * Lazily initialise AudioContext (must be called after user gesture).
 */
export function getAudioContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    const Audio = window.AudioContext || window.webkitAudioContext
    if (!Audio) throw new Error('Web Audio is not supported in this browser.')
    audioCtx = new Audio()
  }
  return audioCtx
}

// Call directly from a tap, then await resume before scheduling any tones.
export async function unlockAudio() {
  const ctx = getAudioContext()
  if (ctx.state !== 'running') await ctx.resume()
  if (ctx.state !== 'running') throw new Error(`Audio is ${ctx.state}. Tap again to enable it.`)
  return ctx
}

export function audioState() { return audioCtx?.state || 'not started' }

function connectPan(ctx, gain, pan) {
  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner()
    panner.pan.setValueAtTime(clampPan(pan), ctx.currentTime)
    gain.connect(panner); panner.connect(ctx.destination)
    return panner
  }
  // Older browsers still get an audible mono cue, without a stereo claim.
  gain.connect(ctx.destination)
  return { pan: { setTargetAtTime() {} }, disconnect() {} }
}

export async function testStereo() {
  const ctx = await unlockAudio()
  setHazardTone(false)
  playSafePing(-1, ctx.currentTime + 0.05)
  playSafePing(1, ctx.currentTime + 1.45)
  return typeof ctx.createStereoPanner === 'function' ? 'stereo' : 'mono fallback'
}

/**
 * Play a safe target ping (440Hz Sine with exponential decay)
 * @param {number} pan -1.0 (Left) to +1.0 (Right)
 */
export function playSafePing(pan = 0, at) {
  const ctx = getAudioContext()
  if (ctx.state !== 'running') return
  const now = at ?? ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)

  osc.connect(gain)
  const panner = connectPan(ctx, gain, pan)

  osc.start(now)
  osc.stop(now + 1.2)

  setTimeout(() => {
    try {
      gain.disconnect()
      panner.disconnect()
    } catch { /* Node may already be disconnected. */ }
  }, 1500)
}

/**
 * Play a very soft ambient ping for stationary SOCIAL nodes
 */
export function playAmbientPing(pan = 0) {
  const ctx = getAudioContext()
  if (ctx.state !== 'running') return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.05, now + 0.1) // Much softer
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

  osc.connect(gain)
  const panner = connectPan(ctx, gain, pan)

  osc.start(now)
  osc.stop(now + 1.6)

  setTimeout(() => {
    try {
      gain.disconnect()
      panner.disconnect()
    } catch { /* Node may already be disconnected. */ }
  }, 2000)
}

/**
 * Maintain a continuous hazard pulse (880Hz Sawtooth + 1.2Hz LFO)
 * @param {boolean} active 
 * @param {number} pan -1.0 (Left) to +1.0 (Right)
 */
export function setHazardTone(active, pan = 0, urgency = 0) {
  if (!active && !hazardNode) return
  const ctx = getAudioContext()
  if (ctx.state !== 'running') return
  const now = ctx.currentTime
  const clampedPan = clampPan(pan)
  const pulseHz = 1.2 + Math.max(0, Math.min(1, urgency)) * 2.8

  if (active && !hazardNode) {
    // Start new hazard tone
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, now)

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(pulseHz, now)

    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(0.1, now) // LFO depth

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.05, now) // Base volume
    masterGain.gain.linearRampToValueAtTime(0.08, now + 0.5)

    lfo.connect(lfoGain)
    lfoGain.connect(masterGain.gain)

    osc.connect(masterGain)
    const panner = connectPan(ctx, masterGain, clampedPan)

    osc.start(now)
    lfo.start(now)

    hazardNode = { osc, lfo, lfoGain, masterGain, panner }
  } else if (active && hazardNode) {
    // Smoothly interpolate panning
    hazardNode.panner.pan.setTargetAtTime(clampedPan, now, 0.1)
    hazardNode.lfo.frequency.setTargetAtTime(pulseHz, now, 0.2)
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
      } catch { /* Node may already be disconnected. */ }
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
  } catch { /* Vibration is optional. */ }
}

export function vibrateTap() {
  try {
    if (navigator.vibrate) navigator.vibrate(30)
  } catch { /* Vibration is optional. */ }
}
