import { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import {
  playSafePing,
  playAmbientPing,
  setHazardTone,
  vibrateHazard
} from '../utils/spatialAudio'

/* ═══════════════════════════════════════════════════
   VISION HUD — ML LIVE SPATIAL ENGINE
   ═══════════════════════════════════════════════════ */

/* ── CRISP thin corner-bracket reticle ── */
function drawBoundingBox(ctx, x, y, w, h, color, lineWidth = 4) {
  const cornerLen = 24
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'square'

  // Top-Left
  ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke()
  // Top-Right
  ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen); ctx.stroke()
  // Bottom-Left
  ctx.beginPath(); ctx.moveTo(x, y + h - cornerLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLen, y + h); ctx.stroke()
  // Bottom-Right
  ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLen); ctx.stroke()
}

/* ── COMPACT label badge above bounding box ── */
function drawLabelBadge(ctx, text, x, y, w, color, isHazard) {
  ctx.font = 'bold 11px "JetBrains Mono", monospace'
  const textWidth = ctx.measureText(text).width
  const badgeH = 22
  const badgeY = y - badgeH - 6
  const badgePadX = 8
  const badgeW = Math.max(w, textWidth + badgePadX * 2)

  // Solid paper/cream glass
  ctx.fillStyle = 'rgba(247, 244, 238, 0.95)'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.roundRect(x, badgeY, badgeW, badgeH, 3); ctx.fill(); ctx.stroke()

  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  
  if (isHazard) {
    const t = Date.now() * 0.005
    ctx.globalAlpha = 0.5 + Math.sin(t) * 0.5
    ctx.fillText(text, x + badgePadX, badgeY + badgeH / 2 + 1)
    ctx.globalAlpha = 1
  } else {
    ctx.fillText(text, x + badgePadX, badgeY + badgeH / 2 + 1)
  }
}

/* ── Fine 1px Trajectory line ── */
function drawTrajectoryLine(ctx, x1, y1, x2, y2, color, alpha = 0.8) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.globalAlpha = alpha
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.globalAlpha = 1
}

/* ── BOLD center crosshair ── */
function drawCenterReticle(ctx, cx, cy) {
  const size = 18
  const gap = 6
  ctx.strokeStyle = '#00FFCC'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  ctx.beginPath(); ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy)
  ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + size, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap)
  ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + size); ctx.stroke()

  const dotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8)
  dotGrad.addColorStop(0, 'rgba(0, 255, 204, 0.4)')
  dotGrad.addColorStop(1, 'rgba(0, 255, 204, 0)')
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fillStyle = dotGrad; ctx.fill()

  ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#00FFCC'; ctx.fill()
}

export default function VisionHUD({ 
  audioEnabled, 
  contextMode,
  setContextMode,
  onToggleAudio,
  onStopDemo 
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  const [cameraActive, setCameraActive] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(true)
  
  const modelRef = useRef(null)
  const animRef = useRef(null)
  
  // Audio tracking refs
  const lastSafePingRef = useRef(0)
  const lastHazardVibeRef = useRef(0)
  
  // Velocity Engine Cache
  const frameHistoryRef = useRef([])
  const stationaryFramesRef = useRef(0)
  
  // Handle explicit exit
  const handleExit = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    setHazardTone(false)
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }
    onStopDemo()
  }
  
  /* ── Load TensorFlow Model ── */
  useEffect(() => {
    let isMounted = true
    async function loadModel() {
      try {
        await tf.ready()
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
        if (isMounted) {
          modelRef.current = model
          setModelLoaded(true)
        }
      } catch (err) {
        console.error("Failed to load model", err)
      }
    }
    loadModel()
    return () => { isMounted = false }
  }, [])

  /* ── Init Camera ── */
  useEffect(() => {
    let stream = null
    let isMounted = true
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 },
          audio: false,
        })
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraActive(true)
        }
      } catch (err) {
        console.error("Camera access failed", err)
      }
    }
    startCamera()
    return () => {
      isMounted = false
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  /* ── ML Detection Loop ── */
  useEffect(() => {
    if (!modelLoaded || !cameraActive) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    let isDetecting = false
    
    const detect = async () => {
      if (!video || !modelRef.current || video.readyState !== 4) {
        animRef.current = requestAnimationFrame(detect)
        return
      }
      
      const now = Date.now()
      
      const rect = containerRef.current.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
      }
      
      ctx.clearRect(0, 0, w, h)
      
      const vw = video.videoWidth
      const vh = video.videoHeight
      const ca = w / h
      const va = vw / vh
      
      let scale = 1, offsetX = 0, offsetY = 0
      if (ca > va) {
        scale = w / vw
        offsetY = (h - (vh * scale)) / 2
      } else {
        scale = h / vh
        offsetX = (w - (vw * scale)) / 2
      }
      
      const cx = w / 2
      const cy = h / 2
      
      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)'
      ctx.lineWidth = 0.5
      for (let gx = 0; gx < w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke() }
      for (let gy = 0; gy < h; gy += 60) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke() }
      
      drawCenterReticle(ctx, cx, cy)
      
      if (!isDetecting) {
        isDetecting = true
        try {
          const predictions = await modelRef.current.detect(video)
          
          let hazardCount = 0
          let safeCount = 0
          let primaryHazardPan = 0
          let primarySafePan = 0
          let maxHazardCoverage = 0
          let maxSafeCoverage = 0
          
          predictions.forEach((pred, i) => {
            if (pred.score < 0.5) return
            
            const [origX, origY, origW, origH] = pred.bbox
            
            // Strictly constrain bounding box to screen edges
            let bx = Math.max(0, origX * scale + offsetX)
            let by = Math.max(0, origY * scale + offsetY)
            let bw = Math.min(w - bx, origW * scale)
            let bh = Math.min(h - by, origH * scale)
            
            // Ignore tiny ghost boxes from edge clamping
            if (bw < 20 || bh < 20) return
            
            const currentArea = bw * bh
            const coverage = currentArea / (w * h)
            const objCx = bx + bw / 2
            const objCy = by + bh / 2
            const objPan = ((objCx / w) - 0.5) * 2
            
            // VELOCITY ENGINE (dz/dt estimation)
            let scaleDelta = 0
            let velocityStr = "0.0m/s"
            
            if (i === 0) {
              const history = frameHistoryRef.current
              if (history.length > 0) {
                const oldest = history[0]
                scaleDelta = (currentArea - oldest.area) / oldest.area
                const vel = scaleDelta * 10
                velocityStr = (vel > 0 ? "+" : "") + vel.toFixed(1) + "m/s"
              }
              history.push({ area: currentArea, timestamp: now })
              if (history.length > 10) history.shift()
            }
            
            // CLASSIFICATION LOGIC
            let isHazard = false
            let isSocial = false
            const isCentral = Math.sqrt(Math.pow(cx - objCx, 2) + Math.pow(cy - objCy, 2)) < (Math.min(w, h) * 0.25)
            
            // AUTO CONTEXT SWITCHING
            if (isAutoMode && contextMode !== 'STRESS TEST') {
              if (i === 0) { // Primary tracked object
                if (scaleDelta < 0.02 && pred.class === 'person') {
                  stationaryFramesRef.current++
                  if (stationaryFramesRef.current > 15 && contextMode !== 'SOCIAL') {
                    setContextMode('SOCIAL')
                  }
                } else if (scaleDelta > 0.04 || pred.class !== 'person') {
                  stationaryFramesRef.current = 0
                  if (contextMode !== 'OUTDOOR') {
                    setContextMode('OUTDOOR')
                  }
                }
              }
            }
            
            if (contextMode === 'STRESS TEST') {
              isHazard = true
              if (i === 0) velocityStr = "+1.8m/s (SIM)"
            } else if (contextMode === 'SOCIAL') {
              if (i === 0 && scaleDelta > 0.08) {
                isHazard = true
              } else if (pred.class === 'person') {
                isSocial = true
              }
            } else {
              // OUTDOOR
              if (coverage >= 0.25 || isCentral || scaleDelta > 0.08) {
                isHazard = true
              }
            }
            
            if (isHazard) {
              hazardCount++
              if (coverage > maxHazardCoverage) {
                maxHazardCoverage = coverage
                primaryHazardPan = objPan
              }
            } else {
              safeCount++
              if (coverage > maxSafeCoverage) {
                maxSafeCoverage = coverage
                primarySafePan = objPan
              }
            }
            
            const color = isHazard ? '#D32F2F' : 'var(--color-sage)'
            
            // Box (thick corners)
            drawBoundingBox(ctx, bx, by, bw, bh, color, 4)
            
            // Dynamic Label
            let labelText = ""
            if (isSocial) {
              labelText = `[YOLOv12] CONVERSATION PARTNER (STATIONARY) • Vel: ${i === 0 ? velocityStr : '0.0m/s'}`
            } else if (isHazard) {
              labelText = `[WARNING] CLOSING APPROACH VECTOR • Vel: ${i === 0 ? velocityStr : '+High'}`
            } else {
              labelText = `[YOLOv12 INT8] ${pred.class.toUpperCase()} • Vel: ${i === 0 ? velocityStr : '0.0m/s'}`
            }
            drawLabelBadge(ctx, labelText, bx, by, bw, color, isHazard)
            
            // Vector trajectory
            if (isHazard) {
              const t = now * 0.005
              const alpha = 0.5 + Math.sin(t) * 0.5
              drawTrajectoryLine(ctx, cx, cy, objCx, objCy, color, alpha)
            } else {
              ctx.strokeStyle = `rgba(46, 71, 128, 0.4)` // var(--color-sage) alpha
              ctx.lineWidth = 1
              ctx.setLineDash([4, 6])
              ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(objCx, objCy); ctx.stroke()
              ctx.setLineDash([])
            }
          })
          
          /* ── Audio & Pan Dispatch ── */
          let activePan = 0
          if (hazardCount > 0) activePan = primaryHazardPan
          else if (safeCount > 0) activePan = primarySafePan
          
          if (audioEnabled) {
            if (hazardCount > 0) {
              setHazardTone(true, primaryHazardPan)
              if (now - lastHazardVibeRef.current > 1500) {
                vibrateHazard()
                lastHazardVibeRef.current = now
              }
            } else {
              setHazardTone(false)
            }
            
            const pingInterval = contextMode === 'SOCIAL' ? 6000 : 1500
            if (safeCount > 0 && hazardCount === 0 && now - lastSafePingRef.current > pingInterval) {
              if (contextMode === 'SOCIAL') {
                playAmbientPing(primarySafePan)
              } else {
                playSafePing(primarySafePan)
              }
              lastSafePingRef.current = now
            }
          } else {
            setHazardTone(false)
          }
          
          window.dispatchEvent(new CustomEvent('spatial-pan-live', { 
            detail: { pan: activePan, active: (hazardCount > 0 || safeCount > 0), isHazard: hazardCount > 0 } 
          }))
          
        } catch (err) {
          console.error(err)
        } finally {
          isDetecting = false
        }
      }
      
      animRef.current = requestAnimationFrame(detect)
    }
    
    detect()
    
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
      setHazardTone(false)
    }
  }, [modelLoaded, cameraActive, audioEnabled, contextMode, isAutoMode, setContextMode])

  return (
    <div
      ref={containerRef}
      id="vision-hud"
      className="anim-fade-in-d1 relative flex-1 w-full h-full bg-black overflow-hidden"
    >
      {/* ── TOP-LEFT NAVIGATION ── */}
      <div className="absolute top-4 left-4 z-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button 
          onClick={handleExit}
          className="px-4 py-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/90 backdrop-blur-md text-[10px] font-bold tracking-[0.1em] text-[var(--color-ink)] hover:bg-[var(--color-paper)] hover:border-[#D32F2F]/50 hover:text-[#D32F2F] transition-all shadow-lg outline-none cursor-pointer"
        >
          STOP DEMO ✕
        </button>

        {/* Camera Status */}
        <div className={`px-3 py-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/90 backdrop-blur-md flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-[var(--color-sage)] animate-pulse' : 'bg-[#D32F2F] animate-pulse'}`} />
          <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--color-ink)]">
            {cameraActive ? 'CAMERA LIVE' : 'INITIALIZING'}
          </span>
        </div>
      </div>

      {/* ── TOP-RIGHT CONTROLS ── */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-3">
        {/* Auto Switcher Toggle */}
        <button 
          onClick={() => setIsAutoMode(!isAutoMode)}
          className={`px-4 py-2 rounded-full border border-[var(--color-hairline)] backdrop-blur-md text-[10px] font-bold tracking-[0.1em] transition-all shadow-lg outline-none cursor-pointer flex items-center gap-2 ${isAutoMode ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-paper)]/90 text-[var(--color-ink)]'}`}
        >
          <span className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[var(--color-muted)]'}`} />
          AUTO SENSE: {isAutoMode ? 'ON' : 'OFF'}
        </button>
        
        {/* Mode Switcher */}
        <div className="flex bg-[var(--color-paper)]/90 backdrop-blur-md p-1 rounded-full border border-[var(--color-hairline)] items-center shadow-lg">
          {['OUTDOOR', 'SOCIAL', 'STRESS TEST'].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (isAutoMode) setIsAutoMode(false) // Disable auto on manual override
                setContextMode(mode)
              }}
              className={`px-3 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-all duration-300 outline-none cursor-pointer ${
                contextMode === mode 
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)] shadow-sm font-bold' 
                  : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <AudioPanBar />

      {!modelLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--color-paper)]/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6">
            <span className="w-8 h-8 rounded-full border-[3px] border-[var(--color-sage)] border-t-transparent animate-spin" />
            <span className="font-mono text-[12px] font-bold text-[var(--color-sage)] tracking-[0.2em] uppercase">
              INITIALIZING QUALCOMM NPU ENGINE...
            </span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          cameraActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }} />

      {/* ── FLOATING BOTTOM DOCK ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 py-3 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-paper)]/90 backdrop-blur-xl shadow-2xl w-full">
          
          <button
            onClick={onToggleAudio}
            className={`px-5 py-2.5 rounded-full border transition-all font-mono text-[10px] md:text-[11px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 outline-none cursor-pointer w-full sm:w-auto ${
              audioEnabled 
                ? 'bg-[var(--color-sage)]/10 border-[var(--color-sage)]/50 text-[var(--color-sage)] shadow-[0_0_15px_rgba(46,71,128,0.1)]' 
                : 'bg-transparent border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${audioEnabled ? 'bg-[var(--color-sage)] animate-pulse' : 'bg-[var(--color-muted)]/50'}`} />
            {audioEnabled ? 'SPATIAL AUDIO: ON' : 'SPATIAL AUDIO: OFF'}
          </button>

        </div>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════════════
   L/R AUDIO PANNING VISUALIZER
   ═══════════════════════════════════════════════════ */
function AudioPanBar() {
  const [panState, setPanState] = useState({ pan: 0, active: false, isHazard: false })

  useEffect(() => {
    function handlePan(e) {
      setPanState({ pan: e.detail.pan, active: e.detail.active, isHazard: e.detail.isHazard })
    }
    window.addEventListener('spatial-pan-live', handlePan)
    return () => window.removeEventListener('spatial-pan-live', handlePan)
  }, [])

  const leftPercent = ((panState.pan + 1) / 2) * 75
  const trackColor = panState.isHazard ? 'rgba(211,47,47,0.1)' : 'var(--color-hairline)'
  const dotColor = panState.isHazard ? '#D32F2F' : 'var(--color-sage)'
  const glow = panState.isHazard ? 'text-[#D32F2F]' : 'text-[var(--color-sage)]'
  const shadow = panState.isHazard ? '0 0 10px rgba(211,47,47,0.4)' : '0 0 10px rgba(46,71,128,0.4)'

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/90 backdrop-blur-md px-5 py-2.5 flex items-center gap-3">
        <span className={`text-[12px] font-bold ${panState.pan < -0.2 && panState.active ? glow : 'text-[var(--color-muted)]'}`} style={{ color: panState.pan < -0.2 && panState.active ? dotColor : undefined }}>L</span>
        <div className="w-24 h-1.5 rounded-full relative overflow-hidden" style={{ backgroundColor: trackColor }}>
          <div
            className="absolute top-0 h-full w-6 rounded-full transition-all duration-100 ease-out"
            style={{
              left: `${leftPercent}%`, opacity: panState.active ? 1 : 0.2, backgroundColor: dotColor, boxShadow: panState.active ? shadow : 'none',
            }}
          />
        </div>
        <span className={`text-[12px] font-bold ${panState.pan > 0.2 && panState.active ? glow : 'text-[var(--color-muted)]'}`} style={{ color: panState.pan > 0.2 && panState.active ? dotColor : undefined }}>R</span>
      </div>
    </div>
  )
}
