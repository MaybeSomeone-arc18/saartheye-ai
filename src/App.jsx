import { useState, useEffect, useCallback } from 'react'
import LandingPage from './components/LandingPage'
import {
  getAudioContext,
  playSafePing,
  vibrateTap,
} from './utils/spatialAudio'

export default function App() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [hazardMode, setHazardMode] = useState(false)

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
    setHazardMode(prev => {
      vibrateTap()
      return !prev
    })
  }, [])

  return (
    <div className="w-full h-dvh">
      <LandingPage 
        audioEnabled={audioEnabled}
        hazardMode={hazardMode}
        onToggleAudio={handleToggleAudio}
        onToggleHazard={handleToggleHazard}
      />
    </div>
  )
}
