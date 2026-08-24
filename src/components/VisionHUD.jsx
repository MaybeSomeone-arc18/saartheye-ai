import { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import {
  playSafePing,
  setHazardTone,
  vibrateHazard
} from '../utils/spatialAudio'

/* ═══════════════════════════════════════════════════
   VISION HUD — ML LIVE SPATIAL ENGINE
   ═══════════════════════════════════════════════════ */

/* ── SLEEK rounded corner-bracket reticle ── */
function drawBoundingBox(ctx, x, y, w, h, color, lineWidth = 3) {
  const cornerLen = 12
  const radius = 6
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  function drawCorner(startX, startY, midX, midY, endX, endY) {
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.arcTo(midX, midY, endX, endY, radius)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  // Top-Left
  drawCorner(x, y + cornerLen, x, y, x + cornerLen, y)
  // Top-Right
  drawCorner(x + w - cornerLen, y, x + w, y, x + w, y + cornerLen)
  // Bottom-Left
  drawCorner(x, y + h - cornerLen, x, y + h, x + cornerLen, y + h)
  // Bottom-Right
  drawCorner(x + w, y + h - cornerLen, x + w, y + h, x + w - cornerLen, y + h)
}

/* ── SOLID DARK label badge above bounding box ── */
function drawLabelBadge(ctx, text, x, y, w, color) {
  ctx.font = 'bold 12px "JetBrains Mono", monospace'
  const textWidth = ctx.measureText(text).width
  const badgeH = 26
  const badgeY = y - badgeH - 8
  const badgePadX = 12
  const badgeW = Math.max(w, textWidth + badgePadX * 2)

  // Floating Glass
  ctx.fillStyle = 'rgba(10, 15, 25, 0.88)'
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(x, badgeY, badgeW, badgeH, 6); ctx.fill(); ctx.stroke()

  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + badgePadX, badgeY + badgeH / 2 + 1)
}

/* ── Glowing gradient laser line ── */
function drawLaserLine(ctx, x1, y1, x2, y2, color, alpha = 0.8) {
  const grad = ctx.createLinearGradient(x1, y1, x2, y2)
  grad.addColorStop(0, 'rgba(0,255,204,0.8)') // Teal center
  grad.addColorStop(1, 'rgba(255,0,85,0.8)')  // Crimson hazard

  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.globalAlpha = alpha * 0.15
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()

  ctx.lineWidth = 2
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
  hazardMode,
  onToggleAudio,
  onToggleHazard,
  onShowModal,
  onBackToLanding 
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  const [cameraActive, setCameraActive] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  
  const modelRef = useRef(null)
  const animRef = useRef(null)
  
  // Audio tracking refs
  const lastSafePingRef = useRef(0)
  const lastHazardVibeRef = useRef(0)
  const prevAudioEnabledRef = useRef(false)
  
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
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 },
          audio: false,
        })
        if (videoRef.current) {
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
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  /* ── Cleanup audio if disabled ── */
  useEffect(() => {
    if (prevAudioEnabledRef.current && !audioEnabled) {
      setHazardTone(false)
    }
    prevAudioEnabledRef.current = audioEnabled
  }, [audioEnabled])

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
          
          predictions.forEach(pred => {
            if (pred.score < 0.5) return
            
            const [origX, origY, origW, origH] = pred.bbox
            
            // Constrain bounding box to screen edges to prevent full screen stretch
            let bx = Math.max(0, origX * scale + offsetX)
            let by = Math.max(0, origY * scale + offsetY)
            let bw = Math.min(w - bx, origW * scale)
            let bh = Math.min(h - by, origH * scale)
            
            // Ignore tiny ghost boxes from edge clamping
            if (bw < 20 || bh < 20) return
            
            const coverage = (bw * bh) / (w * h)
            const objCx = bx + bw / 2
            const objCy = by + bh / 2
            const objPan = ((objCx / w) - 0.5) * 2
            
            const distToCenter = Math.sqrt(Math.pow(cx - objCx, 2) + Math.pow(cy - objCy, 2))
            const isCentral = distToCenter < (Math.min(w, h) * 0.25)
            // If manual hazard mode is active, treat largest central object as hazard
            const isHazard = coverage >= 0.25 || isCentral || hazardMode
            
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
            
            const color = isHazard ? '#FF0055' : '#00FFCC'
            const colorRgb = isHazard ? '255, 0, 85' : '0, 255, 204'
            const estDist = Math.max(0.5, (h / bh) * 0.4).toFixed(1)
            
            // Tint
            ctx.fillStyle = `rgba(${colorRgb}, ${isHazard ? 0.1 : 0.05})`
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill()
            
            // Box
            drawBoundingBox(ctx, bx, by, bw, bh, color, 3)
            
            // Label
            const labelPrefix = isHazard ? '[POSENET INT8] COLLISION HAZARD' : `[YOLOv12 INT8] ${pred.class.toUpperCase()}`
            const labelSuffix = isHazard ? '0.5m (CRITICAL)' : `${estDist}m (SAFE)`
            drawLabelBadge(ctx, `${labelPrefix} • ${labelSuffix}`, bx, by, bw, color)
            
            if (isHazard) {
              const t = now * 0.005
              const laserAlpha = 0.6 + Math.sin(t) * 0.4
              drawLaserLine(ctx, cx, cy, objCx, objCy, color, laserAlpha)
            } else {
              ctx.strokeStyle = `rgba(${colorRgb}, 0.25)`
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
            
            if (safeCount > 0 && hazardCount === 0 && now - lastSafePingRef.current > 1500) {
              playSafePing(primarySafePan)
              lastSafePingRef.current = now
            }
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
      if (animRef.current) cancelAnimationFrame(animRef.current)
      setHazardTone(false)
    }
  }, [modelLoaded, cameraActive, audioEnabled, hazardMode])

  return (
    <div
      ref={containerRef}
      id="vision-hud"
      className="anim-fade-in-d1 relative flex-1 w-full h-full bg-black overflow-hidden"
    >
      {/* ── TOP-LEFT NAVIGATION ── */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <button 
          onClick={onBackToLanding}
          className="px-5 py-2.5 rounded-full border border-white/[0.1] bg-[rgba(15,22,35,0.75)] backdrop-blur-md text-[11px] font-bold tracking-[0.1em] text-white hover:bg-[rgba(15,22,35,0.95)] hover:border-[#00FFCC]/50 transition-all shadow-lg outline-none"
        >
          ← BACK TO OVERVIEW
        </button>

        {/* Camera Status */}
        <div className={`px-4 py-2 rounded-full border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-md flex items-center gap-2.5`}>
          <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-[#00FFCC] pulse-dot' : 'bg-[#FF0055] pulse-crimson'}`} />
          <span className="text-[11px] font-bold tracking-[0.15em] text-white">
            {cameraActive ? 'CAMERA LIVE' : 'INITIALIZING'}
          </span>
        </div>
      </div>

      <AudioPanBar />

      {!modelLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(4,6,10,0.85)] backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 rounded-full border-2 border-neon border-t-transparent animate-spin" />
            <span className="text-[14px] font-bold text-[#00FFCC] glow-neon tracking-wider">
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-xl shadow-2xl flex-wrap justify-center w-full max-w-[90vw]">
          
          <button
            onClick={onToggleAudio}
            className={`px-5 py-3 rounded-xl border transition-all text-[12px] font-bold tracking-wide flex items-center gap-2 outline-none ${
              audioEnabled 
                ? 'bg-[#00FFCC]/10 border-[#00FFCC] text-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.2)]' 
                : 'bg-white/[0.05] border-white/20 text-white hover:bg-white/10'
            }`}
          >
            🔊 {audioEnabled ? 'SPATIAL AUDIO: ON' : 'TOGGLE 3D SPATIAL AUDIO'}
          </button>

          <button
            onClick={onToggleHazard}
            className={`px-5 py-3 rounded-xl border transition-all text-[12px] font-bold tracking-wide flex items-center gap-2 outline-none ${
              hazardMode 
                ? 'bg-[#FF0055]/10 border-[#FF0055] text-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.2)]' 
                : 'bg-white/[0.05] border-white/20 text-white hover:bg-[#FF0055]/10 hover:border-[#FF0055]/30 hover:text-[#FF0055]'
            }`}
          >
            ⚠️ {hazardMode ? 'STOP SIMULATION' : 'SIMULATE HAZARD TRAJECTORY'}
          </button>

          <button
            onClick={onShowModal}
            className="px-5 py-3 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/10 transition-all text-[12px] font-bold tracking-wide flex items-center gap-2 text-white outline-none"
          >
            ✈️ ISOLATION MODAL
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
  const trackColor = panState.isHazard ? 'rgba(255,0,85,0.1)' : 'rgba(255,255,255,0.1)'
  const dotColor = panState.isHazard ? '#FF0055' : '#00FFCC'
  const glow = panState.isHazard ? 'glow-crimson' : 'glow-neon'
  const shadow = panState.isHazard ? '0 0 10px rgba(255,0,85,0.7)' : '0 0 10px rgba(0,255,204,0.7)'

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="rounded-full border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-md px-5 py-2.5 flex items-center gap-3">
        <span className={`text-[12px] font-bold ${panState.pan < -0.2 && panState.active ? glow : 'text-dim'}`} style={{ color: panState.pan < -0.2 && panState.active ? dotColor : undefined }}>L</span>
        <div className="w-24 h-1.5 rounded-full relative overflow-hidden" style={{ backgroundColor: trackColor }}>
          <div
            className="absolute top-0 h-full w-6 rounded-full transition-all duration-100 ease-out"
            style={{
              left: `${leftPercent}%`, opacity: panState.active ? 1 : 0.2, backgroundColor: dotColor, boxShadow: panState.active ? shadow : 'none',
            }}
          />
        </div>
        <span className={`text-[12px] font-bold ${panState.pan > 0.2 && panState.active ? glow : 'text-dim'}`} style={{ color: panState.pan > 0.2 && panState.active ? dotColor : undefined }}>R</span>
      </div>
    </div>
  )
}
