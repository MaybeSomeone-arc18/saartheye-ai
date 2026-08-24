import React from 'react'

export default function LandingPage({ onLaunchHUD }) {
  return (
    <div className="relative min-h-dvh w-full bg-[#04060A] text-white overflow-x-hidden selection:bg-[#00FFCC] selection:text-[#04060A]">
      {/* ── Ambient Radial Mesh Gradient ── */}
      <div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(0,255,204,0.08) 0%, transparent 60%)'
        }}
      />
      
      {/* ── Background Noise Texture (optional depth) ── */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 flex flex-col min-h-dvh max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ════════════════════════════════════════
            NAVIGATION HEADER
            ════════════════════════════════════════ */}
        <header className="flex items-center justify-between py-8 anim-fade-in">
          {/* Left: Brand */}
          <div className="text-[16px] tracking-[0.25em] font-light text-white shrink-0">
            SAARTHEYE
          </div>

          {/* Center Pill: Status */}
          <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00FFCC] pulse-dot" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#00FFCC] uppercase">
              QUALCOMM SNAPDRAGON 8 GEN 3 // NPU ACCELERATED
            </span>
          </div>

          {/* Right: Action */}
          <button 
            onClick={onLaunchHUD}
            className="group relative px-6 py-2.5 rounded-full border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#00FFCC]/40 hover:bg-[rgba(15,22,35,0.95)] shrink-0 outline-none"
          >
            <div className="absolute inset-0 bg-[#00FFCC]/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative text-[11px] font-bold tracking-[0.15em] text-white group-hover:text-[#00FFCC] transition-colors">
              LAUNCH HUD
            </span>
          </button>
        </header>

        {/* ════════════════════════════════════════
            HERO SECTION
            ════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-20 lg:py-32">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FFCC]/20 bg-[#00FFCC]/5 mb-8 anim-fade-in-d1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#00FFCC]">
              AIR-GAPPED SILICON-LEVEL SPATIAL SAFETY
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight text-white max-w-4xl leading-[1.1] mb-8 anim-fade-in-d2">
            The World's First <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">On-Device Vision Saarthi</span> for Independent Mobility.
          </h1>

          <p className="text-[15px] sm:text-[17px] font-light text-[#A0AEC0] max-w-2xl leading-relaxed mb-12 anim-fade-in-d3">
            Processing 60 FPS camera feeds and delivering sub-15ms binaural 3D audio cues directly on the Snapdragon Hexagon NPU — with 0 bytes sent to the cloud.
          </p>

          <button 
            onClick={onLaunchHUD}
            className="group relative px-8 py-4 rounded-full border border-[#00FFCC] bg-[#00FFCC]/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] outline-none shadow-[0_0_30px_rgba(0,255,204,0.15)] hover:shadow-[0_0_50px_rgba(0,255,204,0.25)] anim-fade-in-d3"
          >
            <div className="absolute inset-0 bg-[#00FFCC]/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative text-[14px] font-bold tracking-[0.1em] text-[#00FFCC] flex items-center gap-2">
              <span className="text-lg">⚡</span> LAUNCH SPATIAL SAARTHI HUD
            </span>
          </button>
        </main>

        {/* ════════════════════════════════════════
            INTERACTIVE FEATURE TILES
            ════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24 anim-fade-in-d3">
          
          {/* Card 01 */}
          <div className="group flex flex-col gap-4 p-8 rounded-2xl border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-xl transition-all duration-500 hover:border-[#00FFCC]/30 hover:bg-[rgba(15,22,35,0.9)]">
            <div className="w-10 h-10 rounded-full bg-[#00FFCC]/10 flex items-center justify-center border border-[#00FFCC]/20">
              <span className="text-[#00FFCC] text-lg">⚡</span>
            </div>
            <h3 className="text-[16px] font-bold text-white tracking-wide">
              11.4ms Sub-Frame Latency
            </h3>
            <p className="text-[13px] text-[#A0AEC0] leading-relaxed font-light">
              Zero network delays; hardware accelerated via LiteRT with Qualcomm QNN Direct Delegate.
            </p>
          </div>

          {/* Card 02 */}
          <div className="group flex flex-col gap-4 p-8 rounded-2xl border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-[rgba(15,22,35,0.9)]">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <span className="text-white text-lg">✈️</span>
            </div>
            <h3 className="text-[16px] font-bold text-white tracking-wide">
              100% Air-Gapped Isolation
            </h3>
            <p className="text-[13px] text-[#A0AEC0] leading-relaxed font-light">
              Complete data privacy with zero outbound network requests (0 KB/s outbound).
            </p>
          </div>

          {/* Card 03 */}
          <div className="group flex flex-col gap-4 p-8 rounded-2xl border border-white/[0.08] bg-[rgba(15,22,35,0.75)] backdrop-blur-xl transition-all duration-500 hover:border-[#F59E0B]/30 hover:bg-[rgba(15,22,35,0.9)]">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center border border-[#F59E0B]/20">
              <span className="text-[#F59E0B] text-lg">🎧</span>
            </div>
            <h3 className="text-[16px] font-bold text-white tracking-wide">
              3D Binaural Sound Engine
            </h3>
            <p className="text-[13px] text-[#A0AEC0] leading-relaxed font-light">
              Real-time spatial audio panning and low-latency haptic vibration alerts.
            </p>
          </div>

        </section>

        {/* ════════════════════════════════════════
            FOOTER ARCHITECTURE BAND
            ════════════════════════════════════════ */}
        <footer className="w-full py-6 border-t border-white/[0.08] mt-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold tracking-[0.15em] text-[#A0AEC0]/60 uppercase">
            <span>Snapdragon Hexagon HTP</span>
            <span className="text-[#00FFCC]/40">•</span>
            <span>YOLOv12 INT8</span>
            <span className="text-[#00FFCC]/40">•</span>
            <span>Phi-3.5 Mini</span>
            <span className="text-[#00FFCC]/40">•</span>
            <span>Web Audio API</span>
            <span className="text-[#00FFCC]/40">•</span>
            <span>60 FPS CameraX NDK Pipeline</span>
          </div>
        </footer>

      </div>
    </div>
  )
}
