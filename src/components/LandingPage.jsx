import React, { useState } from 'react'
import useScramble from '../hooks/useScramble'
import VisionHUD from './VisionHUD'
import FieldCanvas from './FieldCanvas'
import iqooBg from '../assets/iqoo-bg.svg'

export default function LandingPage({ 
  audioEnabled,
  hazardMode,
  onToggleAudio,
  onToggleHazard
}) {
  const headline = useScramble("The Guide\nThat Sees\nFor You")
  const [isHUDActive, setIsHUDActive] = useState(false)

  // Standard interactive 3D box component to render inline
  const renderInlineDemo = () => (
    <div className="perspective-container w-full max-w-[600px] mx-auto flex items-center justify-center relative">
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
        <header className="h-16 flex items-center justify-between px-5 md:px-8 w-full max-w-[1440px] mx-auto">
          <div className="font-mono text-xs md:text-[13px] tracking-widest whitespace-nowrap text-[var(--color-ink)] uppercase font-bold flex items-center gap-2">
            SAARTHEYE <span className="opacity-40">☾</span>
          </div>
          <div className="font-mono text-xs font-bold tracking-widest text-[var(--color-ink)] uppercase">
            ABOUT
          </div>
        </header>
      </div>

      {/* ── FULLSCREEN HUD MODAL (when launched) ── */}
      {isHUDActive && (
        <div className="fixed inset-0 z-[100] bg-[var(--color-night)]">
          <VisionHUD 
            audioEnabled={audioEnabled}
            hazardMode={hazardMode}
            onToggleAudio={onToggleAudio}
            onToggleHazard={onToggleHazard}
            onStopDemo={() => setIsHUDActive(false)}
          />
        </div>
      )}

      {/* ════════════════════════════════════════
          DESKTOP SVG MAPPED LAYOUT
          ════════════════════════════════════════ */}
      {/* ── DESKTOP & TABLET LAYOUT (SVG Mapped) ── */}
      <div className="hidden md:block relative w-full max-w-[1440px] mx-auto aspect-[1440/2880] @container" 
           style={{ backgroundImage: `url(${iqooBg})`, backgroundSize: '100% 100%' }}>
        
        {/* HERO (TOP SPLIT SCREEN IN SVG DOME) */}
        <div className="absolute top-[4%] left-[2%] w-[96%] flex items-start gap-[4cqi] z-20">
          {/* Left Text */}
          <div className="w-[45%] flex flex-col items-start text-left pt-[2cqi]">
            {/* MASSIVE ANIMATED FONT */}
            <h1 className="font-serif text-[7.5cqi] leading-[0.8] mb-[1.5cqi] text-shimmer tracking-tight">
              SAARTHEYE
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
                Open source · MIT · 100% on-device
              </div>
            </div>
          </div>
          
          {/* Right Demo Box */}
          <div className="w-[50%] flex flex-col pt-[2cqi]">
            {renderInlineDemo()}
            <div className="mt-[1.5cqi] text-center w-full mx-auto px-[1cqi] py-[0.5cqi] rounded-[1cqi] bg-[var(--color-paper)]/40 backdrop-blur-md">
              <div className="font-mono text-[0.8cqi] font-bold tracking-widest text-[var(--color-muted)] uppercase mb-[0.2cqi]">Live on-device vision HUD</div>
              <div className="font-sans text-[0.9cqi] leading-relaxed text-[var(--color-ink)]/75">Functional web prototype (TF.js + Web Audio).</div>
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
        <h1 className="font-serif text-[3.8rem] leading-[0.8] mb-4 text-shimmer tracking-tight">
          SAARTHEYE
        </h1>
        <h2 className="font-serif text-[var(--color-ink)] text-[2.8rem] leading-[1] mb-6 whitespace-pre-wrap">
          {headline}
        </h2>
        <p className="font-sans text-[var(--color-ink)]/85 text-[17px] leading-[1.6] mb-8">
          An on-device navigation companion, running entirely on your device for real-time vision and 3D spatial audio.
        </p>
        <button 
          onClick={() => setIsHUDActive(true)}
          className="bg-[var(--color-sage)] text-white px-8 h-[52px] rounded-full font-sans font-medium text-[16px] mb-12 shadow-lg"
        >
          Launch the demo
        </button>

        {renderInlineDemo()}

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

        <footer className="w-full max-w-[1440px] mx-auto py-8 px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute inset-0 border-2 border-dashed border-[var(--color-sage)]/40 rounded-full animate-spin-slow"></div>
              <div className="w-2 h-2 bg-[var(--color-sage)] rounded-full animate-pulse shadow-[0_0_10px_var(--color-sage)]"></div>
            </div>
            <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--color-ink)] leading-tight">
              System Online <br/> <span className="text-[var(--color-muted)]">NPU Active</span>
            </div>
          </div>
          
          <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--color-muted)] flex gap-8">
            <span className="hover:text-[var(--color-ink)] transition-colors cursor-pointer">SAARTHEYE v1.0.0</span>
            <span className="hover:text-[var(--color-ink)] transition-colors cursor-pointer">MIT License</span>
            <span className="hover:text-[var(--color-ink)] transition-colors cursor-pointer">2026</span>
          </div>
        </footer>
      </div>
    </div>
      
    </div>
  )
}
