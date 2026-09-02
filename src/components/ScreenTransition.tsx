import React, { useEffect, useState } from 'react';

interface ScreenTransitionProps {
  isActive: boolean;
  zoneColor?: string;
  onComplete?: () => void;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  isActive,
  zoneColor = '#06b6d4',
  onComplete,
}) => {
  const [phase, setPhase] = useState<'idle' | 'closing' | 'opening'>('idle');

  useEffect(() => {
    if (isActive) {
      setPhase('closing');
      const timer1 = setTimeout(() => {
        setPhase('opening');
      }, 450);

      const timer2 = setTimeout(() => {
        setPhase('idle');
        if (onComplete) onComplete();
      }, 950);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setPhase('idle');
    }
  }, [isActive, onComplete]);

  if (phase === 'idle') return null;

  const barCount = 10;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-col">
      {/* Pixelated Horizontal Curtain Blinds */}
      {Array.from({ length: barCount }).map((_, idx) => {
        const delay = idx * 25;
        const isClosing = phase === 'closing';

        return (
          <div
            key={idx}
            className="flex-1 relative transition-transform duration-300 ease-in-out"
            style={{
              backgroundColor: '#050711',
              borderBottom: `1px solid ${zoneColor}33`,
              transform: isClosing
                ? 'scaleX(1)'
                : 'scaleX(0)',
              transformOrigin: idx % 2 === 0 ? 'left' : 'right',
              transitionDelay: `${delay}ms`,
            }}
          >
            {/* High-tech pixel grid & glow accents */}
            <div
              className="absolute inset-y-0 w-8"
              style={{
                [idx % 2 === 0 ? 'right' : 'left']: 0,
                background: `linear-gradient(to ${idx % 2 === 0 ? 'left' : 'right'}, ${zoneColor}88, transparent)`,
              }}
            />
          </div>
        );
      })}

      {/* Center cyber sweep line */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
        style={{ opacity: phase === 'closing' ? 1 : 0 }}
      >
        <div
          className="w-full h-1 shadow-[0_0_25px_rgba(6,182,212,0.9)] animate-pulse"
          style={{ backgroundColor: zoneColor }}
        />
      </div>
    </div>
  );
};
