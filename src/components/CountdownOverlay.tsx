import React from 'react';
import { Bot, Swords, Timer, Zap } from 'lucide-react';

interface CountdownOverlayProps {
  countdown: number | null; // 3, 2, 1, 0 (0 = ¡YA!) or null
  mode: 'vsAi' | 'timeAttack';
  aiName?: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  countdown,
  mode,
  aiName = 'Krono-Bot',
}) => {
  if (countdown === null) return null;

  const isGo = countdown === 0;

  return (
    <div
      id="race-countdown-overlay"
      className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center select-none"
    >
      {/* Background ambient radial aura */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isGo
            ? 'bg-emerald-950/20 backdrop-blur-[1px]'
            : 'bg-slate-950/40 backdrop-blur-[2px]'
        }`}
      />

      {/* Main Countdown Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-2 sm:px-4 animate-in zoom-in-75 duration-200">
        {/* Mode Tag Header Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-950/90 border border-slate-700 shadow-2xl backdrop-blur-md mb-1.5 sm:mb-3">
          {mode === 'vsAi' ? (
            <>
              <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-300">
                DUELO VS IA · {aiName}
              </span>
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            </>
          ) : (
            <>
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300">
                MODO CONTRARRELOJ
              </span>
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
            </>
          )}
        </div>

        {/* Dynamic Countdown Display */}
        <div className="relative flex items-center justify-center my-1 sm:my-2">
          {isGo ? (
            <div className="flex flex-col items-center animate-bounce">
              <span
                className="text-5xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] scale-110"
                style={{
                  WebkitTextStroke: '1.5px #14532d',
                  filter: 'drop-shadow(0 0 15px #22c55e)',
                }}
              >
                ¡YA!
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 mt-1">
                ¡CORRE A LA META!
              </span>
            </div>
          ) : countdown === 1 ? (
            <div className="flex flex-col items-center">
              <span
                className="text-5xl sm:text-7xl md:text-9xl font-black font-mono text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse"
                style={{
                  WebkitTextStroke: '1.5px #881337',
                  filter: 'drop-shadow(0 0 15px #f43f5e)',
                }}
              >
                1
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono font-bold text-rose-300 uppercase tracking-widest mt-0.5">
                ¡ATENTOS!
              </span>
            </div>
          ) : countdown === 2 ? (
            <div className="flex flex-col items-center">
              <span
                className="text-5xl sm:text-7xl md:text-9xl font-black font-mono text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse"
                style={{
                  WebkitTextStroke: '1.5px #78350f',
                  filter: 'drop-shadow(0 0 15px #fbbf24)',
                }}
              >
                2
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono font-bold text-amber-300 uppercase tracking-widest mt-0.5">
                LISTOS...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span
                className="text-5xl sm:text-7xl md:text-9xl font-black font-mono text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse"
                style={{
                  WebkitTextStroke: '1.5px #164e63',
                  filter: 'drop-shadow(0 0 15px #38bdf8)',
                }}
              >
                3
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono font-bold text-cyan-300 uppercase tracking-widest mt-0.5">
                PREPARADOS...
              </span>
            </div>
          )}
        </div>

        {/* Helper subtext */}
        <p className="text-[9px] sm:text-xs font-medium text-slate-300/90 mt-1 bg-slate-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-slate-800">
          {mode === 'vsAi'
            ? '¡La IA y tú arrancan al mismo tiempo!'
            : '¡El cronómetro arrancará en cuanto se dé la señal!'}
        </p>
      </div>
    </div>
  );
};
