import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/soundEngine';
import { ChevronRight, Sparkles, Volume2 } from 'lucide-react';

interface LoadingIntroScreenProps {
  onComplete: () => void;
  onUnlockAudio: () => void;
}

const LOADING_STATUSES = [
  '⚡ Sincronizando núcleos cuánticos...',
  '🗡️ Calibrando katanas de plasma y dagas...',
  '🌌 Generando dimensiones de Kronos...',
  '🎿 Ajustando pistas alpinas de nieve...',
  '🧗 Calibrando gravedad y plataformas...',
  '✨ ¡Todo listo! Iniciando aventura...',
];

export const LoadingIntroScreen: React.FC<LoadingIntroScreenProps> = ({
  onComplete,
  onUnlockAudio,
}) => {
  // Phase 1: 'grupobassify' (Desarrollado por grupobassify)
  // Phase 2: 'zion_adventure' (Zion Adventure loading screen)
  const [phase, setPhase] = useState<'grupobassify' | 'zion_adventure'>('grupobassify');
  const [progress, setProgress] = useState<number>(0);
  const [statusIndex, setStatusIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [soundPlayed, setSoundPlayed] = useState<boolean>(false);
  const finishTriggeredRef = useRef(false);

  // Audio unlock and studio sound trigger
  const handleTriggerAudio = () => {
    onUnlockAudio();
    if (!soundPlayed) {
      sound.playSfx('studioIntro');
      setSoundPlayed(true);
    }
  };

  // Phase 1: "Desarrollado por grupobassify" timer (~2.2 seconds)
  useEffect(() => {
    // Play intro sound if possible
    try {
      sound.playSfx('studioIntro');
    } catch {
      // Ignored if browser blocks autoplay before user gesture
    }

    const timer = setTimeout(() => {
      setPhase('zion_adventure');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Status message cycler during loading phase
  useEffect(() => {
    if (phase !== 'zion_adventure') return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 700);
    return () => clearInterval(interval);
  }, [phase]);

  const finishIntro = () => {
    if (finishTriggeredRef.current) return;
    finishTriggeredRef.current = true;
    handleTriggerAudio();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  // Phase 2: "Zion Adventure" Loading progress animation (0% -> 100%)
  // Once finished, it automatically transitions directly to the initial screen!
  useEffect(() => {
    if (phase !== 'zion_adventure') return;

    const startTime = Date.now();
    const duration = 2200; // ~2.2 seconds smooth load

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth ease-out progression
      const nextProgress = Math.min(100, Math.round(t * 100));
      setProgress(nextProgress);

      if (t >= 1) {
        clearInterval(interval);
        try {
          sound.playSfx('splashLoadComplete');
        } catch {
          // Ignore audio error if not unlocked
        }
        // Small delay at 100% so player sees full bar, then auto-proceeds to initial screen
        setTimeout(() => {
          finishIntro();
        }, 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div
      id="game-intro-loading-screen"
      onClick={handleTriggerAudio}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-400 bg-[#050711] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Quick Skip Button in Top Right */}
      <button
        id="skip-intro-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        className="absolute top-3 right-3 z-40 px-3 py-1 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-[11px] font-mono flex items-center gap-1 transition-all shadow-lg active:scale-95 cursor-pointer"
      >
        <span>Saltar</span>
        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
      </button>

      {/* ========================================================================= */}
      {/* ETAPA 1: DESARROLLADO POR GRUPOBASSIFY                                     */}
      {/* ========================================================================= */}
      {phase === 'grupobassify' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#030612] via-[#07112c] to-[#02050f] px-4 overflow-hidden animate-fadeIn">
          {/* Subtle glowing ambient lighting */}
          <div className="absolute w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          {/* Graphic Equalizer / Bass Frequency Waves */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="relative flex items-end gap-1.5 h-16 sm:h-20 px-6 py-2 rounded-2xl bg-slate-950/60 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.25)]">
              {/* Dynamic bouncing bass bars */}
              <div className="w-2 rounded-full bg-gradient-to-t from-cyan-500 to-blue-400 animate-[bounce_0.8s_infinite_100ms] h-8" />
              <div className="w-2 rounded-full bg-gradient-to-t from-cyan-400 to-sky-300 animate-[bounce_0.6s_infinite_200ms] h-14" />
              <div className="w-2.5 rounded-full bg-gradient-to-t from-sky-300 via-fuchsia-400 to-purple-400 animate-[bounce_0.5s_infinite_50ms] h-16" />
              <div className="w-2.5 rounded-full bg-gradient-to-t from-fuchsia-400 to-pink-400 animate-[bounce_0.7s_infinite_150ms] h-12" />
              <div className="w-2 rounded-full bg-gradient-to-t from-pink-400 to-rose-400 animate-[bounce_0.9s_infinite_250ms] h-7" />
              <div className="w-2 rounded-full bg-gradient-to-t from-cyan-400 to-sky-200 animate-[bounce_0.65s_infinite_120ms] h-10" />

              {/* Central Glowing Bass / Audio Emblem */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-cyan-400/40 bg-slate-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <Volume2 className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Studio Typography */}
          <div className="text-center flex flex-col items-center z-10">
            {/* Tag: desarrollado por */}
            <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.35em] text-cyan-400/90 font-bold mb-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              Desarrollado por
            </p>

            {/* Brand: grupobassify */}
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-fuchsia-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]">
              grupobassify
            </h1>

            {/* Accent divider line with pulse */}
            <div className="flex items-center gap-2 mt-3">
              <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-cyan-400" />
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-cyan-400" />
            </div>
          </div>

          <p className="absolute bottom-5 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Toca en cualquier lugar para habilitar audio
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ETAPA 2: ZION ADVENTURE (PANTALLA DE CARGA)                               */}
      {/* ========================================================================= */}
      {phase === 'zion_adventure' && (
        <div className="absolute inset-0 flex flex-col justify-between items-center p-4 sm:p-6 overflow-hidden">
          {/* Background: Zion Adventure Splash Art with Cinematic Vignette */}
          <div className="absolute inset-0 -z-10 bg-slate-950 overflow-hidden">
            <img
              src="/zion_splash_art.jpg"
              alt="Zion Adventure"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Dark cinematic vignette overlay for high contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/70" />
            <div className="absolute inset-0 bg-cyan-950/20 mix-blend-color-dodge pointer-events-none" />
          </div>

          {/* Top Pill: Game Edition Badge */}
          <div className="w-full flex justify-center items-center z-10 pt-1">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] sm:text-xs font-mono tracking-wider text-cyan-300 font-semibold uppercase">
                Zion Adventure · Móvil Edition
              </span>
            </div>
          </div>

          {/* Centerpiece: Glowing 3D Game Title "ZION ADVENTURE" */}
          <div className="flex flex-col items-center justify-center text-center my-auto z-10 px-4">
            <div className="relative">
              {/* Radial glow auras */}
              <div className="absolute -inset-6 bg-cyan-500/25 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -inset-10 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-heading text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.7)]">
                ZION ADVENTURE
              </h1>
              <p className="text-xs sm:text-sm font-bold tracking-[0.3em] text-pink-400 font-mono uppercase mt-1 drop-shadow-[0_0_12px_rgba(244,114,182,0.6)]">
                Odisea Dimensional
              </p>
            </div>
          </div>

          {/* Bottom Section: Progress Loading Bar */}
          <div className="w-full max-w-md flex flex-col items-center gap-2.5 z-10 mb-3 sm:mb-5">
            {/* Status Hint */}
            <div className="h-5 flex items-center justify-center text-center px-2">
              <p className="text-xs font-medium text-slate-200 tracking-wide drop-shadow-md">
                {progress >= 100 ? '✨ ¡Carga completa! Iniciando...' : LOADING_STATUSES[statusIndex]}
              </p>
            </div>

            {/* Smooth Loading Capsule Bar */}
            <div className="w-full bg-slate-950/85 border-2 border-cyan-400/60 rounded-full p-1 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md relative overflow-hidden">
              {/* Inner animated progress gradient */}
              <div
                className="h-4 sm:h-5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 relative overflow-hidden transition-all duration-100 ease-out shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                style={{ width: `${Math.max(5, progress)}%` }}
              >
                {/* Moving diagonal animated stripes */}
                <div
                  className="absolute inset-0 opacity-30 animate-[stripes_1s_linear_infinite]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.8) 8px, rgba(255,255,255,0.8) 16px)',
                  }}
                />
                {/* Gloss highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full" />
              </div>

              {/* Centered Percentage Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] sm:text-[11px] font-black font-mono tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {progress}%
                </span>
              </div>
            </div>

            <p className="text-[10px] text-cyan-300/70 font-mono tracking-wider">
              {progress >= 100 ? 'Abriendo pantalla inicial...' : 'Cargando recursos...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
