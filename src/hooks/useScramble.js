import { useState, useEffect, useRef } from 'react'

const GLYPHS = "/\\-_=+|<>~:*"

export default function useScramble(finalText, { speed = 50, active = true } = {}) {
  const [displayText, setDisplayText] = useState(finalText || '')
  const animRef = useRef(null)

  useEffect(() => {
    if (!active) return
    if (!finalText) {
      setDisplayText(finalText || '')
      return
    }

    // Immediately resolve if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayText(finalText)
      return
    }

    let start = null
    const duration = 900 // target reveal time in ms
    const totalChars = finalText.length

    const tick = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      
      // Calculate how many characters are firmly revealed
      const progress = Math.min(elapsed / duration, 1)
      const revealCount = Math.floor(progress * totalChars)
      
      let currentString = ''
      for (let i = 0; i < totalChars; i++) {
        // Preserve whitespace natively
        if (finalText[i] === ' ' || finalText[i] === '\n') {
          currentString += finalText[i]
          continue
        }
        
        if (i < revealCount) {
          currentString += finalText[i]
        } else {
          currentString += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
      }
      
      setDisplayText(currentString)

      if (progress < 1) {
        // Re-throttle the animation slightly using the provided speed, or just run at 60fps
        // requestAnimationFrame naturally runs fast. To get the classic "chunky" 
        // terminal look, we could delay, but smooth text scramble is often just full framerate.
        animRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayText(finalText) // snap exactly to final
      }
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
    }
  }, [finalText, active])

  return displayText
}
