import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/soundEngine';
import { Sparkles, Play, ChevronRight, Zap } from 'lucide-react';

interface LoadingIntroScreenProps {
  onComplete: () => void;
  onUnlockAudio: () => void;
}

const LOADING_TIPS = [
  '⚡ Sincronizando núcleos cuánticos y dimensiones...',
  '🗡️ Calibrando katanas de plasma y dagas arrojadizas...',
  '💡 Tip: ¡En las Special Stages hay tolerancia de hasta 3 cristales!',
  '🌋 Generando géiseres volcánicos y ríos de magma en Lavacliff...',
  '🏙️ Activando barreras láser y rascacielos en Krono City...',
  '🧗 Ajustando amortiguadores antigravedad para el modo Only Up...',
  '💡 Tip: Pulsa Bloqueo justo en el momento del impacto para rebotar proyectiles.',
  '✨ ¡Todo listo! Prepárate para la aventura de Zion...',
];

export const LoadingIntroScreen: React.FC<LoadingIntroScreenProps> = ({
  onComplete,
  onUnlockAudio,
}) => {
  // Phase 1: 'studio' (0.0s - 3.2s) -> Phase 2: 'loading' (3.2s - finish) -> 'ready' (100% loaded)
  const [phase, setPhase] = useState<'studio' | 'loading' | 'ready'>('studio');
  const [progress, setProgress] = useState<number>(0);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [soundPlayed, setSoundPlayed] = useState<boolean>(false);
  const progressRef = useRef(0);

  // Play studio sound when user interacts or if permitted
  const handleTriggerAudio = () => {
    onUnlockAudio();
    if (!soundPlayed) {
      sound.playSfx('studioIntro');
      setSoundPlayed(true);
    }
  };

  // Phase 1: Studio logo duration
  useEffect(() => {
    // Attempt audio unlock if browser policy allows
    const timer = setTimeout(() => {
      setPhase('loading');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  // Tip cycler during loading
  useEffect(() => {
    if (phase !== 'loading') return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  // Loading bar progress animation (Brawl Stars / Duolingo style smooth cadence)
  useEffect(() => {
    if (phase !== 'loading') return;

    const startProgress = Date.now();
    const duration = 2800; // ~2.8 seconds loading experience

    const interval = setInterval(() => {
      const elapsed = Date.now() - startProgress;
      const t = Math.min(1, elapsed / duration);
      // Smooth ease-out curve
      const nextP = Math.min(100, Math.round(t * 100));
      progressRef.current = nextP;
      setProgress(nextP);

      if (t >= 1) {
        clearInterval(interval);
        setPhase('ready');
        sound.playSfx('splashLoadComplete');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [phase]);

  // Keyboard handler: Space or Enter to proceed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const finishIntro = () => {
    if (isFadingOut) return;
    handleTriggerAudio();
    sound.playSfx('menuSelect');
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      id="game-intro-loading-screen"
      onClick={handleTriggerAudio}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-500 bg-[#050711] ${
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
        className="absolute top-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
      >
        <span>Saltar</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* ========================================================================= */}
      {/* STAGE 1: STUDIO INTRO ANIMATION (Video recreation: Dmn / Bass Guitar)      */}
      {/* ========================================================================= */}
      {phase === 'studio' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#003ba8] via-[#054ec9] to-[#012873] overflow-hidden">
          {/* Geometric angled background cards matching the video layout */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1a68e8]/25 rotate-12 rounded-3xl blur-xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#002773]/40 -rotate-12 rounded-3xl blur-lg pointer-events-none" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#0088ff]/20 rotate-45 rounded-3xl blur-2xl pointer-events-none" />

          {/* Central Logo Box with Electric Bass & D */}
          <div className="relative flex flex-col items-center justify-center gap-5 z-10 px-4">
            {/* Concentric sound wave ripples */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full border border-white/20 animate-ping pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-cyan-300/15 pointer-events-none animate-pulse" />
              <div className="absolute w-68 h-68 rounded-full border border-blue-400/10 pointer-events-none" />

              {/* Logo Card */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-[#081735] border-2 border-blue-400/40 shadow-[0_0_50px_rgba(0,100,255,0.4)] flex items-center justify-center overflow-hidden p-2 group">
                <img
                  src="/dmn_studio_logo.jpg"
                  alt="Dmn Studio Logo"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG if image is loading
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Shimmer light bar across the logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            {/* Studio Name & Bass Tagline */}
            <div className="text-center flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white font-heading drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                DMN STUDIOS
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-0.5 w-6 bg-blue-300/60 rounded-full" />
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-blue-200 uppercase font-mono">
                  Interactive Entertainment
                </span>
                <div className="h-0.5 w-6 bg-blue-300/60 rounded-full" />
              </div>
            </div>

            <p className="text-[11px] text-blue-200/60 font-mono tracking-wider mt-3 animate-pulse">
              Toca para omitir o habilitar audio
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: BRAWL STARS / DUOLINGO STYLE LOADING SCREEN                      */}
      {/* ========================================================================= */}
      {(phase === 'loading' || phase === 'ready') && (
        <div className="absolute inset-0 flex flex-col justify-between items-center p-4 sm:p-6 overflow-hidden">
          {/* Full-bleed splash art background */}
          <div className="absolute inset-0 -z-10 bg-slate-950 overflow-hidden">
            <img
              src="/zion_splash_art.jpg"
              alt="Zion Adventure Splash"
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic color vignette and atmospheric gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
            <div className="absolute inset-0 bg-cyan-950/20 mix-blend-color-dodge pointer-events-none" />
          </div>

          {/* Top Header: Cyberpunk Game Badge */}
          <div className="w-full flex justify-between items-center z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono tracking-wider text-cyan-300 font-semibold uppercase">
                Kronos Engine v2.4 · Pixel Edition
              </span>
            </div>
          </div>

          {/* Centerpiece: Glowing Chromatic 3D Game Title */}
          <div className="flex flex-col items-center justify-center text-center my-auto z-10 px-4">
            <div className="relative">
              {/* Glow Aura */}
              <div className="absolute -inset-6 bg-cyan-500/20 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -inset-10 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter font-heading text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
                ZION ADVENTURE
              </h1>
              <p className="text-sm sm:text-base font-bold tracking-[0.25em] text-pink-400 font-mono uppercase mt-1 drop-shadow-[0_0_12px_rgba(244,114,182,0.5)]">
                ODISEA DIMENSIONAL
              </p>
            </div>
          </div>

          {/* Bottom Section: Brawl Stars / Duolingo Style Loading Bar & Action */}
          <div className="w-full max-w-xl flex flex-col items-center gap-3 z-10 mb-2 sm:mb-4">
            {/* Dynamic Lore / Tips Bar */}
            <div className="h-6 flex items-center justify-center text-center px-3">
              <p className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide drop-shadow-md transition-all duration-300">
                {phase === 'ready' ? '✨ ¡Carga completa! Listo para iniciar la aventura.' : LOADING_TIPS[tipIndex]}
              </p>
            </div>

            {/* Brawl Stars / Duolingo Style Thick Capsule Loading Bar */}
            <div className="w-full bg-slate-950/80 border-2 border-cyan-400/50 rounded-full p-1 shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md relative overflow-hidden">
              {/* Inner progress bar */}
              <div
                className="h-5 sm:h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 relative overflow-hidden transition-all duration-150 ease-out shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                style={{ width: `${Math.max(4, progress)}%` }}
              >
                {/* Moving diagonal animated stripes (Brawl Stars signature look) */}
                <div
                  className="absolute inset-0 opacity-30 animate-[stripes_1s_linear_infinite]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.8) 10px, rgba(255,255,255,0.8) 20px)',
                  }}
                />
                {/* Shimmer gloss line */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full" />
              </div>

              {/* Centered Percentage Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] sm:text-xs font-black font-mono tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Ready State: Big Pulsing Action Button */}
            {phase === 'ready' ? (
              <button
                id="start-game-splash-btn"
                type="button"
                onClick={finishIntro}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-sm sm:text-base font-heading tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse hover:scale-105 active:scale-95 transition-all mt-1 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>¡TOCA PARA INICIAR JUEGO!</span>
                <Sparkles className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                Cargando recursos y calibrando circuitos...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
