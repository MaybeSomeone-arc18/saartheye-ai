import { useEffect, useRef } from 'react'

export default function FieldCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })

    let dpr = window.devicePixelRatio || 1
    let w, h
    let animId = null
    let lastTime = 0
    const FPS_INTERVAL = 1000 / 45 // cap at ~45 fps to stay incredibly GPU-cheap

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Initialize state
    const motes = Array.from({ length: 40 }).map(() => ({
      x: Math.random(), // fraction of width
      y: Math.random(), // fraction of height
      vx: (Math.random() - 0.5) * 0.0003, // slow drift velocity
      vy: (Math.random() - 0.5) * 0.0003
    }))

    // Start with a couple rings so the page isn't empty on load
    const rings = [
      { radius: 200, opacity: 0.8 },
      { radius: 600, opacity: 0.3 }
    ]
    let lastRingTime = performance.now()

    let gridOffsetY = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', resize)
    resize()

    const draw = (timestamp) => {
      if (!lastTime) lastTime = timestamp
      const dt = timestamp - lastTime
      
      // Frame limiting
      if (!prefersReducedMotion && dt < FPS_INTERVAL) {
        animId = requestAnimationFrame(draw)
        return
      }
      
      if (!prefersReducedMotion) {
        lastTime = timestamp - (dt % FPS_INTERVAL)
      }

      ctx.clearRect(0, 0, w, h)

      // 1. Draw Slow-Scrolling Hairline Grid
      gridOffsetY = (gridOffsetY + 0.15) % 60
      ctx.strokeStyle = 'rgba(255, 253, 247, 0.03)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < w; x += 60) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      // Depending on reduced motion, either lock grid or scroll
      const activeGridOffsetY = prefersReducedMotion ? 0 : gridOffsetY
      for (let y = activeGridOffsetY - 60; y < h; y += 60) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      // 2. Draw Concentric Echolocation Rings
      const cx = w / 2
      const cy = h * 0.3
      const maxRadius = Math.max(w, h) * 1.5

      if (!prefersReducedMotion && timestamp - lastRingTime > 3500) {
        rings.push({ radius: 0, opacity: 1 })
        lastRingTime = timestamp
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i]
        
        ctx.beginPath()
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(63, 224, 176, ${0.1 * ring.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
        
        if (!prefersReducedMotion) {
          ring.radius += 0.8 // expansion speed
          ring.opacity = Math.max(0, 1 - (ring.radius / (maxRadius * 0.6)))
          if (ring.radius > maxRadius) {
            rings.splice(i, 1) // cull out of bounds
          }
        }
      }

      // 3. Draw Motes (Parallax dust)
      ctx.fillStyle = 'rgba(237, 234, 225, 0.12)'
      motes.forEach(mote => {
        if (!prefersReducedMotion) {
          mote.x += mote.vx
          mote.y += mote.vy
          // Wrap screen edges
          if (mote.x < 0) mote.x = 1
          if (mote.x > 1) mote.x = 0
          if (mote.y < 0) mote.y = 1
          if (mote.y > 1) mote.y = 0
        }
        ctx.beginPath()
        ctx.arc(mote.x * w, mote.y * h, 1, 0, Math.PI * 2)
        ctx.fill()
      })

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(draw)
      }
    }

    animId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 0 }} 
    />
  )
}
