import React, { useState } from 'react'
import useScramble from '../hooks/useScramble'
import VisionHUD from './VisionHUD'
import FieldCanvas from './FieldCanvas'
import iqooBg from '../assets/iqoo-bg.svg'
import ModalGraphics from './ModalGraphics'

export default function LandingPage({ 
  audioEnabled,
  contextMode,
  onToggleAudio,
  setContextMode
}) {
  const headline = useScramble("The Guide\nThat Sees\nFor You")
  const [isHUDActive, setIsHUDActive] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  // Standard interactive 3D box component to render inline
  const renderInlineDemo = (customWidthClass = "w-full max-w-[600px]") => (
    <div className={`perspective-container ${customWidthClass} mx-auto flex items-center justify-center relative`}>
      <div className="absolute inset-[-1rem] md:inset-[-2rem] bg-[var(--color-paper)]/30 backdrop-blur-xl rounded-[3rem] -z-10 md:opacity-0" />
      <div className="tilt-panel-3d w-full aspect-video bg-[var(--color-night)] rounded-2xl shadow-[0_50px_100px_-20px_rgba(28,26,23,0.5)] border border-white/5 relative overflow-hidden flex flex-col cursor-pointer" onClick={() => setIsHUDActive(true)}>
        <div className="h-10 w-full flex items-center px-4 gap-2 absolute top-0 left-0 z-20">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-muted)]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-muted)]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-muted)]/40" />
        </div>
        <div className="relative flex-1 w-full mt-10 flex items-center justify-center overflow-hidden">
          <div className="anim-laser-scan" />
          <div className="absolute inset-0 opacity-40">
            <FieldCanvas />
          </div>
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 relative opacity-100">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--color-sage)] opacity-80" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--color-sage)] opacity-80" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--color-sage)] opacity-80" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--color-sage)] opacity-80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[var(--color-sage)] rounded-full animate-pulse" />
              <div className="absolute top-[15%] left-[20%] w-[60%] h-[70%] border border-[var(--color-sage)] bg-[var(--color-sage)]/5">
                <div className="absolute -top-[22px] left-[-1px] bg-[var(--color-sage)] text-white text-[10px] font-mono px-2 py-1 tracking-widest font-bold whitespace-nowrap">
                  CLICK TO LAUNCH
                </div>
              </div>
            </div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, var(--color-sage) 1px, transparent 1px), linear-gradient(to bottom, var(--color-sage) 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)' }} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden selection:bg-[var(--color-sage)] selection:text-white bg-[var(--color-paper)]">
      
      {/* ── STICKY TOP NAV ── */}
      <div className="sticky top-0 z-50 w-full bg-[var(--color-paper)]/80 backdrop-blur-md hairline border-x-0 border-t-0">
        <header className="h-16 md:h-[4.4vw] flex items-center justify-between px-5 md:px-[2.2vw] w-full mx-auto">
          <div className="font-mono text-xs md:text-[0.9vw] tracking-widest whitespace-nowrap text-[var(--color-ink)] uppercase font-bold flex items-center gap-2 md:gap-[0.5vw]">
            SAARTHEYE <span className="opacity-40">☾</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-[1.6vw] z-50 relative">
            {/* ── CONTEXTUAL SENSITIVITY MODE SWITCHER ── */}
            <div className="hidden md:flex bg-[var(--color-ink)]/5 p-1 md:p-[0.3vw] rounded-full border border-[var(--color-hairline)] items-center">
              {['OUTDOOR', 'SOCIAL', 'STRESS TEST'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setContextMode(mode)}
                  className={`px-4 py-1.5 md:px-[1vw] md:py-[0.4vw] rounded-full font-mono text-[9px] sm:text-[10px] md:text-[0.7vw] tracking-widest uppercase transition-all duration-300 outline-none cursor-pointer ${
                    contextMode === mode 
                      ? (mode === 'SOCIAL' ? 'bg-[#0E4D3A] text-white shadow-sm font-bold' : mode === 'STRESS TEST' ? 'bg-[#D32F2F] text-white shadow-sm font-bold' : 'bg-[var(--color-sage)] text-white shadow-sm font-bold')
                      : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div 
              onClick={() => setIsAboutOpen(true)}
              className="font-mono text-xs md:text-[0.85vw] font-bold tracking-widest text-[var(--color-ink)] uppercase cursor-pointer hover:opacity-70 transition-opacity ml-[1vw]"
            >
              ABOUT
            </div>
            
            <div className="flex items-center gap-4 md:gap-[1vw]">
              <a 
                href="https://github.com/MaybeSomeone-arc18/saartheye-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--color-ink)] hover:opacity-70 transition-opacity flex items-center"
                aria-label="GitHub Repository"
              >
                <svg className="w-[22px] h-[22px] md:w-[1.5vw] md:h-[1.5vw]" aria-hidden="true" viewBox="0 0 16 16" version="1.1" fill="currentColor">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/sanskar-kharya-614301310/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--color-ink)] hover:opacity-70 transition-opacity flex items-center"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-[22px] h-[22px] md:w-[1.5vw] md:h-[1.5vw]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>
      </div>

      {/* ── CONTEXTUAL AMBIENT GLOW ── */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-out mix-blend-multiply z-10"
        style={{
          background: contextMode === 'OUTDOOR' 
                        ? 'radial-gradient(circle at 50% 0%, rgba(46,71,128,0.08), transparent 60%)' 
                    : contextMode === 'SOCIAL'
                        ? 'radial-gradient(circle at 50% 0%, rgba(14,77,58,0.15), transparent 60%)' 
                        : 'radial-gradient(circle at 50% 0%, rgba(211,47,47,0.12), transparent 60%)' 
        }}
      />

      {/* ── FULLSCREEN HUD MODAL (when launched) ── */}
      {isHUDActive && (
        <div className="fixed inset-0 z-[100] bg-[var(--color-night)]">
          <VisionHUD 
            audioEnabled={audioEnabled}
            contextMode={contextMode}
            setContextMode={setContextMode}
            onToggleAudio={onToggleAudio}
            onStopDemo={() => setIsHUDActive(false)}
          />
        </div>
      )}

      {/* ════════════════════════════════════════
          DESKTOP SVG MAPPED LAYOUT
          ════════════════════════════════════════ */}
      {/* ── DESKTOP & TABLET LAYOUT (SVG Mapped) ── */}
      <div className="hidden md:block relative w-full mx-auto aspect-[1440/2880] @container" 
           style={{ backgroundImage: `url(${iqooBg})`, backgroundSize: '100% 100%' }}>
        
        {/* HERO (TOP SPLIT SCREEN IN SVG DOME) */}
        <div className="absolute top-[4%] left-[2%] w-[96%] flex items-start gap-[4cqi] z-20">
          {/* Left Text */}
          <div className="w-[45%] flex flex-col items-start text-left pt-[2cqi]">
            {/* MASSIVE ANIMATED FONT */}
            <h1 className="font-serif text-[7.5cqi] leading-[0.8] mb-[1.5cqi] text-shimmer tracking-tight flex flex-col gap-[0.1em]">
              <span className="font-bold">सारथि-EYE</span>
              <span>SAARTHEYE</span>
            </h1>
            <h2 className="font-serif text-[4cqi] leading-[1] text-[var(--color-ink)] mb-[1.5cqi] whitespace-pre-wrap">
              {headline}
            </h2>
            <p className="font-sans text-[var(--color-ink)]/85 text-[1.3cqi] leading-[1.6] mb-[2cqi] max-w-[30cqi]">
              An on-device navigation companion, running entirely on your device for real-time vision and 3D spatial audio.
            </p>
            <div className="flex items-center gap-[1cqi]">
              <button 
                onClick={() => setIsHUDActive(true)}
                className="bg-[var(--color-sage)] text-white px-[2.5cqi] py-[0.8cqi] rounded-full font-sans font-medium text-[1cqi] hover:-translate-y-[0.2cqi] transition-transform"
              >
                Launch the demo
              </button>
              <div className="font-mono text-[0.9cqi] text-[var(--color-muted)] font-medium">
                100% on-device
              </div>
            </div>
          </div>
          
          {/* Right Demo Box */}
          <div className="w-[50%] flex flex-col pt-[2cqi]">
            {renderInlineDemo("w-[85%]")}
            <div className="mt-[1.5cqi] text-center w-[85%] mx-auto px-[1cqi] py-[1cqi] rounded-[1cqi] bg-[var(--color-paper)]/40 backdrop-blur-md">
              <div className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[0.2cqi]">Live on-device vision HUD</div>
              <div className="font-sans text-[0.9cqi] leading-relaxed text-[var(--color-ink)]/75 mb-[1cqi]">Functional web prototype (TF.js + Web Audio).</div>
              
              {/* Mode Explainer Box Desktop */}
              <div className="flex flex-col gap-[0.8cqi] border-l-[3px] pl-[1.5cqi] text-left transition-all duration-500 ease-out mx-auto w-full"
                   style={{ borderColor: contextMode === 'SOCIAL' ? '#0E4D3A' : contextMode === 'STRESS TEST' ? '#D32F2F' : 'var(--color-sage)' }}>
                <div className="font-mono text-[0.8cqi] font-bold tracking-widest uppercase transition-colors duration-500"
                     style={{ color: contextMode === 'SOCIAL' ? '#0E4D3A' : contextMode === 'STRESS TEST' ? '#D32F2F' : 'var(--color-sage)' }}>
                  MODE // {contextMode}
                </div>
                <p className="font-sans text-[1.1cqi] text-[var(--color-ink)]/70 leading-relaxed transition-opacity duration-300">
                  {contextMode === 'OUTDOOR' && 'Standard high-sensitivity navigation. Alerts on all rapidly approaching objects and nearby collision hazards.'}
                  {contextMode === 'SOCIAL' && 'Smart suppression active. Ignores stationary conversation partners. Emits soft ambient pings to maintain spatial awareness.'}
                  {contextMode === 'STRESS TEST' && 'Simulated emergency override. Forces a rapidly approaching vector to demonstrate critical collision feedback loops.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 01 SILICON SENSING (RIGHT) */}
        <div className="absolute top-[32%] left-[75%] w-[18%] flex flex-col text-left z-10">
          <div className="font-serif text-[4cqi] text-[var(--color-sage)] leading-none mb-[0.5cqi]">01</div>
          <h3 className="font-sans text-[1.5cqi] font-medium text-[var(--color-ink)] mb-[1cqi]">Silicon Sensing</h3>
          <p className="font-sans text-[1cqi] text-[var(--color-ink)]/80 leading-snug">
            Raw camera streams bypass overhead, piping directly into native memory. Zero frame drops, zero network calls.
          </p>
        </div>

        {/* 02 ON-DEVICE INFERENCE (LEFT) */}
        <div className="absolute top-[46%] left-[3%] w-[18%] flex flex-col text-left z-10">
          <div className="font-serif text-[4cqi] text-[var(--color-sage)] leading-none mb-[0.5cqi]">02</div>
          <h3 className="font-sans text-[1.5cqi] font-medium text-[var(--color-ink)] mb-[1cqi]">On-Device Inference</h3>
          <p className="font-sans text-[1cqi] text-[var(--color-ink)]/80 leading-snug">
            Quantized vision models run in parallel directly on the NPU. Real-time spatial hazard classification in under 15ms.
          </p>
        </div>

        {/* 03 ACOUSTIC PROJECTION (CENTER) */}
        <div className="absolute top-[57%] left-1/2 -translate-x-1/2 w-[24%] flex flex-col items-center text-center z-10">
          <div className="font-serif text-[4cqi] text-[var(--color-sage)] leading-none mb-[0.5cqi]">03</div>
          <h3 className="font-sans text-[1.5cqi] font-medium text-[var(--color-ink)] mb-[1cqi]">Acoustic Projection</h3>
          <p className="font-sans text-[1cqi] text-[var(--color-ink)]/80 leading-snug">
            Spatial vectors map to 3D audio and dynamic haptics. Hear obstacles precisely where they exist in physical space.
          </p>
        </div>

        {/* 2x2 METRICS ARRAY (CENTER) */}
        {/* 2x2 METRICS ARRAY (CENTER) */}
        <div className="absolute top-[71%] left-1/2 -translate-x-1/2 w-[65%] z-10 grid grid-cols-2 gap-[1px] bg-[var(--color-hairline)] overflow-hidden rounded-[2cqi] shadow-sm border border-[var(--color-hairline)]">
          {/* Card 1: Latency */}
          <div className="bg-[var(--color-paper)]/80 backdrop-blur-md p-[2cqi] flex flex-col hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[1cqi]">Latency</h4>
            <div className="flex flex-col gap-[0.2cqi] mb-[1cqi]">
              <div className="font-serif text-[1.4cqi] text-[var(--color-sage)] leading-none">11.4 ms <span className="font-sans text-[0.8cqi] text-[var(--color-ink)]">Local NPU</span></div>
              <div className="font-serif text-[1.1cqi] text-[var(--color-muted)] opacity-60">1,200+ ms <span className="font-sans text-[0.8cqi]">Network delay</span></div>
            </div>
            <p className="font-sans text-[0.8cqi] text-[var(--color-ink)]/80 leading-snug">Sub-frame hazard classification faster than human blink rate.</p>
          </div>
          {/* Card 2: Isolation */}
          <div className="bg-[var(--color-paper)]/80 backdrop-blur-md p-[2cqi] flex flex-col hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[1cqi]">Isolation</h4>
            <div className="flex flex-col gap-[0.2cqi] mb-[1cqi]">
              <div className="font-serif text-[1.4cqi] text-[var(--color-sage)] leading-none">100% Air-Gapped <span className="font-sans text-[0.8cqi] text-[var(--color-ink)]">Airplane mode</span></div>
              <div className="font-serif text-[1.1cqi] text-[var(--color-muted)] opacity-60">5G/Wi-Fi Required <span className="font-sans text-[0.8cqi]">Fails in dead zones</span></div>
            </div>
            <p className="font-sans text-[0.8cqi] text-[var(--color-ink)]/80 leading-snug">Uncompromising mobility in basements, underground transit, and rural dead zones.</p>
          </div>
          {/* Card 3: Privacy */}
          <div className="bg-[var(--color-paper)]/80 backdrop-blur-md p-[2cqi] flex flex-col hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[1cqi]">Privacy</h4>
            <div className="flex flex-col gap-[0.2cqi] mb-[1cqi]">
              <div className="font-serif text-[1.4cqi] text-[var(--color-sage)] leading-none">0 Bytes Sent <span className="font-sans text-[0.8cqi] text-[var(--color-ink)]">Local RAM</span></div>
              <div className="font-serif text-[1.1cqi] text-[var(--color-muted)] opacity-60">Continuous Stream <span className="font-sans text-[0.8cqi]">Cloud feed</span></div>
            </div>
            <p className="font-sans text-[0.8cqi] text-[var(--color-ink)]/80 leading-snug">Visual data exists in memory for 11ms, then vanishes forever.</p>
          </div>
          {/* Card 4: Cost */}
          <div className="bg-[var(--color-paper)]/80 backdrop-blur-md p-[2cqi] flex flex-col hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[1cqi]">Operating Cost</h4>
            <div className="flex flex-col gap-[0.2cqi] mb-[1cqi]">
              <div className="font-serif text-[1.4cqi] text-[var(--color-sage)] leading-none">$0 Server Cost <span className="font-sans text-[0.8cqi] text-[var(--color-ink)]">Local silicon</span></div>
              <div className="font-serif text-[1.1cqi] text-[var(--color-muted)] opacity-60">Token Billing <span className="font-sans text-[0.8cqi]">API overhead</span></div>
            </div>
            <p className="font-sans text-[0.8cqi] text-[var(--color-ink)]/80 leading-snug">Zero recurring API costs, zero cloud compute infrastructure.</p>
          </div>
        </div>

        {/* CTA (CENTER BOTTOM) */}
        <div className="absolute top-[88%] left-1/2 -translate-x-1/2 flex flex-col items-center w-full z-10">
          <h2 className="font-serif text-[3.5cqi] text-[var(--color-ink)] mb-[1.5cqi] text-center leading-tight">
            Uncompromising mobility,<br/>executed locally on silicon.
          </h2>
          <button 
            onClick={() => setIsHUDActive(true)}
            className="bg-[var(--color-sage)] text-white px-[3cqi] py-[1cqi] rounded-full font-sans font-medium text-[1.1cqi] hover:-translate-y-[0.2cqi] transition-transform shadow-lg shadow-[var(--color-sage)]/20"
          >
            Launch the demo
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MOBILE FALLBACK LAYOUT (VERTICAL STACK)
          ════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col items-center px-6 py-12 w-full text-center z-10 relative">
        <h1 className="font-serif text-[3.8rem] leading-[0.8] mb-4 text-shimmer tracking-tight flex flex-col gap-[0.1em]">
          <span className="font-bold">सारथि-EYE</span>
          <span>SAARTHEYE</span>
        </h1>
        <h2 className="font-serif text-[var(--color-ink)] text-[2.8rem] leading-[1] mb-6 whitespace-pre-wrap">
          {headline}
        </h2>
        <p className="font-sans text-[var(--color-ink)]/85 text-[17px] leading-[1.6] mb-8">
          An on-device navigation companion, running entirely on your device for real-time vision and 3D spatial audio.
        </p>
        
        {/* ── MOBILE CONTEXTUAL SENSITIVITY MODE SWITCHER ── */}
        <div className="flex bg-[var(--color-ink)]/5 p-1.5 rounded-full border border-[var(--color-hairline)] items-center mb-8 mx-auto w-fit max-w-full overflow-x-auto no-scrollbar shadow-inner">
          {['OUTDOOR', 'SOCIAL', 'STRESS TEST'].map((mode) => (
            <button
              key={mode}
              onClick={() => setContextMode(mode)}
              className={`px-3 py-2 sm:px-4 rounded-full font-mono text-[9px] sm:text-[10px] tracking-widest uppercase transition-all duration-300 outline-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
                contextMode === mode 
                  ? (mode === 'SOCIAL' ? 'bg-[#0E4D3A] text-white shadow-sm font-bold' : mode === 'STRESS TEST' ? 'bg-[#D32F2F] text-white shadow-sm font-bold' : 'bg-[var(--color-sage)] text-white shadow-sm font-bold')
                  : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsHUDActive(true)}
          className="bg-[var(--color-sage)] text-white px-8 h-[52px] rounded-full font-sans font-medium text-[16px] mb-8 shadow-lg"
        >
          Launch the demo
        </button>

        {renderInlineDemo()}
        
        <div className="mt-4 text-center w-full max-w-[600px] mx-auto px-4 py-4 rounded-2xl bg-[var(--color-paper)]/40 backdrop-blur-md">
          <div className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-1">Live on-device vision HUD</div>
          <div className="font-sans text-[12px] leading-relaxed text-[var(--color-ink)]/75 mb-4">Functional web prototype (TF.js + Web Audio).</div>
          
          {/* Mode Explainer Box Mobile */}
          <div className="flex flex-col gap-2 border-l-[3px] pl-4 text-left transition-all duration-500 ease-out mx-auto w-full"
               style={{ borderColor: contextMode === 'SOCIAL' ? '#0E4D3A' : contextMode === 'STRESS TEST' ? '#D32F2F' : 'var(--color-sage)' }}>
            <div className="font-mono text-[10px] font-bold tracking-widest uppercase transition-colors duration-500"
                 style={{ color: contextMode === 'SOCIAL' ? '#0E4D3A' : contextMode === 'STRESS TEST' ? '#D32F2F' : 'var(--color-sage)' }}>
              MODE // {contextMode}
            </div>
            <p className="font-sans text-[14px] text-[var(--color-ink)]/70 leading-relaxed transition-opacity duration-300">
              {contextMode === 'OUTDOOR' && 'Standard high-sensitivity navigation. Alerts on all rapidly approaching objects and nearby collision hazards.'}
              {contextMode === 'SOCIAL' && 'Smart suppression active. Ignores stationary conversation partners. Emits soft ambient pings to maintain spatial awareness.'}
              {contextMode === 'STRESS TEST' && 'Simulated emergency override. Forces a rapidly approaching vector to demonstrate critical collision feedback loops.'}
            </p>
          </div>
        </div>

        <div className="w-full mt-16 flex flex-col gap-12 bg-white/50 backdrop-blur p-8 rounded-[2rem] shadow-sm text-left">
          <div className="flex flex-col">
            <div className="font-serif text-5xl text-[var(--color-sage)] mb-2">01</div>
            <h3 className="font-sans text-xl text-[var(--color-ink)] font-bold mb-1">Silicon Sensing</h3>
            <p className="font-sans text-[15px] text-[var(--color-ink)]/80">Raw camera streams bypass overhead, piping directly into native memory. Zero frame drops, zero network calls.</p>
          </div>
          <div className="flex flex-col">
            <div className="font-serif text-5xl text-[var(--color-sage)] mb-2">02</div>
            <h3 className="font-sans text-xl text-[var(--color-ink)] font-bold mb-1">On-Device Inference</h3>
            <p className="font-sans text-[15px] text-[var(--color-ink)]/80">Quantized vision models run in parallel directly on the NPU. Real-time spatial hazard classification in under 15ms.</p>
          </div>
          <div className="flex flex-col">
            <div className="font-serif text-5xl text-[var(--color-sage)] mb-2">03</div>
            <h3 className="font-sans text-xl text-[var(--color-ink)] font-bold mb-1">Acoustic Projection</h3>
            <p className="font-sans text-[15px] text-[var(--color-ink)]/80">Spatial vectors map to 3D audio and dynamic haptics. Hear obstacles precisely where they exist in physical space.</p>
          </div>
        </div>

        <div className="w-full mt-12 bg-[var(--color-paper)]/80 backdrop-blur rounded-[2rem] shadow-sm flex flex-col overflow-hidden text-left border border-[var(--color-hairline)]">
          <div className="flex flex-col p-6 border-b border-[var(--color-hairline)] hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-3">Latency</h4>
            <div className="font-serif text-[22px] text-[var(--color-sage)] leading-none mb-1">11.4 ms <span className="font-sans text-[12px] text-[var(--color-ink)]">Local NPU</span></div>
            <div className="font-serif text-[18px] text-[var(--color-muted)] opacity-60 mb-3">1,200+ ms <span className="font-sans text-[12px]">Network delay</span></div>
            <p className="font-sans text-[13px] text-[var(--color-ink)]/80 leading-snug">Sub-frame hazard classification faster than human blink rate.</p>
          </div>
          <div className="flex flex-col p-6 border-b border-[var(--color-hairline)] hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-3">Isolation</h4>
            <div className="font-serif text-[22px] text-[var(--color-sage)] leading-none mb-1">100% Air-Gapped <span className="font-sans text-[12px] text-[var(--color-ink)]">Airplane mode</span></div>
            <div className="font-serif text-[18px] text-[var(--color-muted)] opacity-60 mb-3">5G/Wi-Fi Required <span className="font-sans text-[12px]">Fails in dead zones</span></div>
            <p className="font-sans text-[13px] text-[var(--color-ink)]/80 leading-snug">Uncompromising mobility in basements, underground transit, and rural dead zones.</p>
          </div>
          <div className="flex flex-col p-6 border-b border-[var(--color-hairline)] hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-3">Privacy</h4>
            <div className="font-serif text-[22px] text-[var(--color-sage)] leading-none mb-1">0 Bytes Sent <span className="font-sans text-[12px] text-[var(--color-ink)]">Local RAM</span></div>
            <div className="font-serif text-[18px] text-[var(--color-muted)] opacity-60 mb-3">Continuous Stream <span className="font-sans text-[12px]">Cloud feed</span></div>
            <p className="font-sans text-[13px] text-[var(--color-ink)]/80 leading-snug">Visual data exists in memory for 11ms, then vanishes forever.</p>
          </div>
          <div className="flex flex-col p-6 hover:bg-[var(--color-paper)] transition-colors">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-3">Operating Cost</h4>
            <div className="font-serif text-[22px] text-[var(--color-sage)] leading-none mb-1">$0 Server Cost <span className="font-sans text-[12px] text-[var(--color-ink)]">Local silicon</span></div>
            <div className="font-serif text-[18px] text-[var(--color-muted)] opacity-60 mb-3">Token Billing <span className="font-sans text-[12px]">API overhead</span></div>
            <p className="font-sans text-[13px] text-[var(--color-ink)]/80 leading-snug">Zero recurring API costs, zero cloud compute infrastructure.</p>
          </div>
        </div>

        <h2 className="font-serif text-[2.5rem] text-[var(--color-ink)] mt-20 mb-8 leading-tight">
          Uncompromising mobility, executed locally on silicon.
        </h2>
        <button 
          onClick={() => setIsHUDActive(true)}
          className="bg-[var(--color-sage)] text-white px-10 h-[52px] rounded-full font-sans font-medium text-[16px] shadow-lg"
        >
          Launch the demo
        </button>
      </div>

      {/* ── FOOTER CONTAINER ── */}
      <div className="w-full relative z-20 flex flex-col md:-mt-[8vw]">
        {/* Seamless Fade Mask (Desktop) */}
        <div className="hidden md:block w-full h-[8vw] bg-gradient-to-b from-transparent to-[var(--color-paper)] pointer-events-none"></div>
        
        <div className="w-full bg-[var(--color-paper)] relative overflow-hidden flex flex-col">
          {/* Trending Marquee */}
          <div className="flex w-[200%] py-4 border-y border-[var(--color-hairline)] opacity-60 group">
          <div className="animate-marquee items-center justify-around font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-ink)] group-hover:[animation-play-state:paused]">
            <span className="mx-8">● 100% Air-Gapped</span>
            <span className="mx-8">● Sub-15ms Latency</span>
            <span className="mx-8">● Zero Cloud Reliance</span>
            <span className="mx-8">● NPU Accelerated</span>
            <span className="mx-8">● Zero Data Footprint</span>
          </div>
          <div className="animate-marquee items-center justify-around font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-ink)] group-hover:[animation-play-state:paused]" aria-hidden="true">
            <span className="mx-8">● 100% Air-Gapped</span>
            <span className="mx-8">● Sub-15ms Latency</span>
            <span className="mx-8">● Zero Cloud Reliance</span>
            <span className="mx-8">● NPU Accelerated</span>
            <span className="mx-8">● Zero Data Footprint</span>
          </div>
        </div>

        <footer className="w-full mx-auto py-8 md:py-[2vw] px-5 md:px-[2.2vw] flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-[1.5vw]">
          <div className="flex items-center gap-4 md:gap-[1vw]">
            <div className="relative flex items-center justify-center w-8 h-8 md:w-[2.2vw] md:h-[2.2vw]">
              <div className="absolute inset-0 border-2 md:border-[0.15vw] border-dashed border-[var(--color-sage)]/40 rounded-full animate-spin-slow"></div>
              <div className="w-2 h-2 md:w-[0.55vw] md:h-[0.55vw] bg-[var(--color-sage)] rounded-full animate-pulse shadow-[0_0_10px_var(--color-sage)]"></div>
            </div>
            <div className="font-mono text-[10px] md:text-[0.7vw] font-bold tracking-widest uppercase text-[var(--color-ink)] leading-tight">
              System Online <br/> <span className="text-[var(--color-muted)]">NPU Active</span>
            </div>
          </div>
          
          <div className="font-mono text-[10px] md:text-[0.7vw] font-bold tracking-widest uppercase text-[var(--color-muted)] flex gap-8 md:gap-[2vw]">
            <span className="hover:text-[var(--color-ink)] transition-colors cursor-pointer" onClick={() => setIsAboutOpen(true)}>SAARTHEYE v1.0.0</span>
            <span className="hover:text-[var(--color-ink)] transition-colors cursor-pointer">2026</span>
          </div>
        </footer>
      </div>
    </div>
      
      {/* ── FULLSCREEN ABOUT MODAL ── */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[200] bg-[var(--color-paper)] flex flex-col overflow-y-auto animate-in fade-in duration-300">
          <ModalGraphics />
          <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col flex-1 relative z-10">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-6 right-6 md:top-12 md:right-8 text-[var(--color-ink)] hover:opacity-60 transition-opacity font-mono text-[10px] tracking-widest uppercase font-bold"
            >
              [ CLOSE ]
            </button>
            
            <header className="mb-16 md:mb-24 mt-8 md:mt-0">
              <h1 className="font-mono text-[11px] md:text-sm tracking-[0.2em] font-bold text-[var(--color-sage)] uppercase mb-4">
                Architectural Manifesto
              </h1>
              <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] text-[var(--color-ink)]">
                SAARTHEYE <br className="hidden md:block" /> (सारथि-EYE)
              </h2>
            </header>

            <div className="flex flex-col gap-16 md:gap-24 mb-24">
              <section className="flex flex-col md:flex-row gap-6 md:gap-16">
                <div className="md:w-1/3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase border-t border-[var(--color-hairline)] pt-4">
                    01 // Philosophy
                  </h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-serif text-2xl md:text-3xl text-[var(--color-ink)] mb-4">
                    The charioteer concept of invisible spatial guidance.
                  </h4>
                  <p className="font-sans text-[15px] md:text-[17px] text-[var(--color-ink)]/80 leading-relaxed">
                    In ancient epics, a <em>Saarthi</em> (सारथि) is the ultimate guide—a charioteer who sees the battlefield clearly, anticipating hazards before they materialize, and steering the hero to safety. We architected Saartheye around this exact philosophy. It isn't a passive camera; it is an active, invisible sensory organ that interprets physical space and whispers actionable guidance into your ears, turning a smartphone into a cognitive spatial shield.
                  </p>
                </div>
              </section>

              <section className="flex flex-col md:flex-row gap-6 md:gap-16">
                <div className="md:w-1/3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase border-t border-[var(--color-hairline)] pt-4">
                    02 // Architecture
                  </h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-serif text-2xl md:text-3xl text-[var(--color-ink)] mb-4">
                    Why On-Device Silicon Wins.
                  </h4>
                  <p className="font-sans text-[15px] md:text-[17px] text-[var(--color-ink)]/80 leading-relaxed mb-6">
                    Cloud-based vision APIs are brittle. They require persistent 5G connections and cost hundreds of milliseconds in round-trip latency. When you're navigating a busy intersection, a 1,200ms delay is the difference between safety and collision.
                  </p>
                  <ul className="space-y-4 font-mono text-[11px] text-[var(--color-ink)]/70 uppercase tracking-wide">
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--color-sage)]">●</span> 11.4ms NPU speed vs 1,200ms Cloud latency
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--color-sage)]">●</span> 100% Air-gapped isolation
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--color-sage)]">●</span> 0 Bytes privacy footprint
                    </li>
                  </ul>
                </div>
              </section>

              <section className="flex flex-col md:flex-row gap-6 md:gap-16">
                <div className="md:w-1/3">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase border-t border-[var(--color-hairline)] pt-4">
                    03 // Hardware Stack
                  </h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-serif text-2xl md:text-3xl text-[var(--color-ink)] mb-4">
                    Forged for the Hexagon NPU.
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] p-6 rounded-2xl">
                      <div className="font-mono text-[10px] text-[var(--color-muted)] font-bold tracking-widest uppercase mb-2">Compute Core</div>
                      <div className="font-serif text-[19px] leading-tight text-[var(--color-ink)]">Qualcomm Snapdragon 8 Gen 3 HTP</div>
                    </div>
                    <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] p-6 rounded-2xl">
                      <div className="font-mono text-[10px] text-[var(--color-muted)] font-bold tracking-widest uppercase mb-2">Inference Engine</div>
                      <div className="font-serif text-[19px] leading-tight text-[var(--color-ink)]">LiteRT QNN Delegate</div>
                    </div>
                    <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] p-6 rounded-2xl sm:col-span-2">
                      <div className="font-mono text-[10px] text-[var(--color-muted)] font-bold tracking-widest uppercase mb-2">Memory Pipeline</div>
                      <div className="font-serif text-[19px] leading-tight text-[var(--color-ink)]">Zero-Copy C++ NDK Buffer Pipeline</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            

          </div>
        </div>
      )}
      
    </div>
  )
}
