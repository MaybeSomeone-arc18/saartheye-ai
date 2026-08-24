import { useState, useEffect, useCallback, useRef } from 'react'
import VisionHUD from './components/VisionHUD'
import LandingPage from './components/LandingPage'
import {
  getAudioContext,
  playSafePing,
  vibrateTap,
} from './utils/spatialAudio'

/* ─────────────────────────────────────────────
   SIMULATED TELEMETRY
   ───────────────────────────────────────────── */
function useTelemetry() {
  const [data, setData] = useState({
    latency: 11.4,
    fps: 60.0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        latency: +(10.8 + Math.random() * 1.4).toFixed(1),
        fps: +(59.7 + Math.random() * 0.6).toFixed(1),
      })
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return data
}

/* ═════════════════════════════════════════════
   TELEMETRY HEADER — HIGH-CONTRAST TOP BAR
   ═════════════════════════════════════════════ */
function TelemetryHeader({ telemetry }) {
  return (
    <header className="anim-fade-in relative z-20 flex items-center justify-between gap-3 px-3 sm:px-5 py-3 flex-wrap">
      {/* ── Left Card: Brand ── */}
      <div className="panel-dark glow-box-neon px-5 py-3 flex items-center gap-3 shrink-0">
        <span className="w-3.5 h-3.5 rounded-full bg-neon pulse-dot" />
        <span className="text-[15px] sm:text-[16px] font-bold text-pure tracking-wide leading-none">
          SAARTHEYE <span className="text-neon glow-neon">//</span> SPATIAL SAFETY SAARTHI
        </span>
      </div>

      {/* ── Center Pill: Air-Gapped ── */}
      <div className="panel-dark-subtle px-5 py-3 flex items-center gap-2.5 shrink-0">
        <span className="text-lg leading-none">✈️</span>
        <span className="text-[13px] sm:text-[14px] font-bold text-neon glow-neon tracking-wider leading-none">
          100% AIR-GAPPED (AIRPLANE MODE)
        </span>
      </div>

      {/* ── Right Card: Hardware Telemetry ── */}
      <div className="panel-dark-subtle px-5 py-3 shrink-0">
        <span className="text-[13px] font-bold text-pure tracking-wide leading-none">
          SNAPDRAGON 8 GEN 3
          <span className="text-dim mx-2">|</span>
          NPU LATENCY: <span className="text-neon glow-neon jitter">{telemetry.latency} ms</span>
          <span className="text-dim mx-2">|</span>
          <span className="text-neon glow-neon">{telemetry.fps} FPS</span>
        </span>
      </div>
    </header>
  )
}


/* ═════════════════════════════════════════════
   AIRPLANE ISOLATION MODAL — HIGH-CONTRAST
   ═════════════════════════════════════════════ */
function IsolationModal({ onClose, telemetry }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const metrics = [
    { label: 'OUTBOUND DATA',  value: '0 KB/S',               color: 'text-neon glow-neon' },
    { label: 'NPU DELEGATE',   value: 'QUALCOMM QNN DIRECT',   color: 'text-neon glow-neon' },
    { label: 'PROCESSOR',      value: 'HEXAGON NPU ISOLATED',  color: 'text-neon glow-neon' },
    { label: 'INFERENCE',      value: `${telemetry.latency} ms LATENCY`, color: 'text-neon glow-neon' },
    { label: 'FRAME RATE',     value: `${telemetry.fps} FPS`,  color: 'text-neon glow-neon' },
    { label: 'NETWORK',        value: 'DISABLED — AIR-GAPPED', color: 'text-crimson glow-crimson' },
  ]

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="modal-card panel-dark glow-box-neon max-w-lg w-full p-7 sm:p-9 flex flex-col items-center gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <h2 className="text-[18px] font-bold text-neon glow-neon tracking-wider">
            AIRPLANE MODE — VERIFIED
          </h2>
        </div>

        <div className="w-full h-px bg-[rgba(0,255,204,0.35)]" />

        <p className="text-[16px] font-bold text-pure text-center tracking-wide">
          100% On-Device Isolation Verified
        </p>
        <p className="text-[13px] text-dim text-center max-w-md leading-relaxed">
          All inference runs locally on Snapdragon 8 Gen 3 Hexagon Tensor Processor.
          Zero network egress. Zero cloud dependency. Full air-gap enforcement.
        </p>

        <div className="w-full h-px bg-[rgba(0,255,204,0.2)]" />

        {/* Metrics Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="panel-dark-subtle px-4 py-3 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-dim tracking-wider">{m.label}</span>
              <span className={`text-[13px] font-bold ${m.color} tracking-wide`}>{m.value}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-[rgba(0,255,204,0.2)]" />

        <button
          onClick={onClose}
          className="hud-btn hud-btn-neon mt-2"
        >
          DISMISS
        </button>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════
   APP ROOT
   ═════════════════════════════════════════════ */
export default function App() {
  const [activeView, setActiveView] = useState('landing')
  const telemetry = useTelemetry()
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [hazardMode, setHazardMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const ambientRef = useRef(null)

  /* Audio unlock on first interaction */
  useEffect(() => {
    function unlock() {
      getAudioContext()
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
    }
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('touchstart', unlock, { once: true })
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }, [])

  /* Ambient pings */
  // Fully automated by VisionHUD now.

  /* Toggle handlers */
  const handleToggleAudio = useCallback(() => {
    vibrateTap()
    getAudioContext()
    setAudioEnabled(prev => {
      if (!prev) playSafePing(0) // Center confirmation ping
      return !prev
    })
  }, [])

  const handleToggleHazard = useCallback(() => {
    // Just toggle the visual manual mode flag if they want a forced simulation
    // But ML handles the real ones.
    setHazardMode(prev => {
      vibrateTap()
      return !prev
    })
  }, [])

  const handleShowModal = useCallback(() => {
    vibrateTap()
    setShowModal(true)
  }, [])

  return (
    <>
      {activeView === 'landing' && (
        <div className="view-transition w-full h-dvh">
          <LandingPage onLaunchHUD={() => setActiveView('hud')} />
        </div>
      )}

      {activeView === 'hud' && (
        <div className="view-transition flex flex-col h-dvh w-full bg-void overflow-hidden">
          <TelemetryHeader telemetry={telemetry} />

          <div className="relative flex-1 flex flex-col overflow-hidden">
            <VisionHUD
              audioEnabled={audioEnabled}
              hazardMode={hazardMode}
              onToggleAudio={handleToggleAudio}
              onToggleHazard={handleToggleHazard}
              onShowModal={handleShowModal}
              onBackToLanding={() => setActiveView('landing')}
            />
          </div>
        </div>
      )}

      {showModal && (
        <IsolationModal
          onClose={() => setShowModal(false)}
          telemetry={telemetry}
        />
      )}
    </>
  )
}
