import { useState, useCallback } from 'react'
import ModelCompare from './components/ModelCompare'
import LandingPage from './components/LandingPage'
import {
  unlockAudio,
  playSafePing,
  vibrateTap,
} from './utils/spatialAudio'

export default function App() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [contextMode, setContextMode] = useState('OUTDOOR')

  const [audioMessage, setAudioMessage] = useState('Sound is off. Vibration is separate.')
  const handleToggleAudio = useCallback(async () => {
    if (audioEnabled) { setAudioEnabled(false); setAudioMessage('Sound is off.'); return }
    try {
      // resume() starts synchronously within the tap; wait for it to finish.
      await unlockAudio()
      playSafePing(0)
      vibrateTap()
      setAudioEnabled(true)
      setAudioMessage('Audio running. If silent, raise media volume and check headphone/Bluetooth output.')
    } catch (error) {
      setAudioEnabled(false)
      setAudioMessage(`Sound could not start: ${error.message}`)
    }
  }, [audioEnabled])

  if(new URLSearchParams(window.location.search).has('compare'))return <ModelCompare />

  return (
    <div className="w-full h-dvh">
      <LandingPage 
        audioEnabled={audioEnabled}
        audioMessage={audioMessage}
        contextMode={contextMode}
        onToggleAudio={handleToggleAudio}
        setContextMode={setContextMode}
      />
    </div>
  )
}
