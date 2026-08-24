import React from 'react';

export default function ModalGraphics() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Right Sweeping Arc - Only visible on very wide screens to avoid text collision */}
      <svg 
        className="hidden xl:block absolute top-[-10%] right-0 h-[120vh] mix-blend-multiply opacity-80" 
        style={{ width: 'calc(50vw - 460px)' }}
        viewBox="0 0 400 1000" 
        preserveAspectRatio="none"
      >
        <g stroke="var(--color-sage)" fill="none">
          {[...Array(30)].map((_, i) => {
            const sw = (Math.sin(i) * 1.5 + 2).toFixed(1); 
            const op = (Math.cos(i) * 0.2 + 0.3).toFixed(2); 
            const qX = 100 - i * 15 + Math.sin(i * 0.5) * 30; 
            const endX = 400 + i * 10; 
            return (
              <path 
                key={i}
                d={`M500,${-100 + i * 15} Q${qX},500 ${endX},1100`}
                strokeWidth={sw}
                opacity={op}
              />
            );
          })}
        </g>
      </svg>
      
      {/* Bottom Left Sweeping Arc */}
      <svg 
        className="hidden xl:block absolute bottom-[-10%] left-0 h-[80vh] mix-blend-multiply opacity-60" 
        style={{ width: 'calc(50vw - 480px)' }}
        viewBox="0 0 400 800" 
        preserveAspectRatio="none"
      >
        <g stroke="var(--color-sage)" fill="none">
          {[...Array(20)].map((_, i) => {
            const sw = (Math.cos(i) * 1.5 + 1.5).toFixed(1);
            const op = (Math.sin(i) * 0.2 + 0.25).toFixed(2);
            const qX = 300 + i * 20; 
            return (
              <path 
                key={i}
                d={`M${-100 - i * 8},900 Q${qX},400 ${-50 - i * 10},-100`}
                strokeWidth={sw}
                opacity={op}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
