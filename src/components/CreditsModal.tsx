import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, RotateCcw, Cpu, Home, Award, X, ChevronDown, Music2, Shield, Heart } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { GameStats } from '../game/gameEngine';

interface CreditsModalProps {
  stats: GameStats;
  onRestartGame: () => void;
  onSelectLevel: (lvlIdx: number) => void;
  onClose?: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  stats,
  onRestartGame,
  onSelectLevel,
  onClose,
}) => {
  const [easterEggUnlocked, setEasterEggUnlocked] = useState<boolean>(false);
  const [easterEggClicks, setEasterEggClicks] = useState<number>(0);
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop any previously playing jukebox / credit songs as requested
    sound.stopMusic();
    return () => {
      sound.stopMusic();
    };
  }, []);

  const handleEasterEggClick = () => {
    const next = easterEggClicks + 1;
    setEasterEggClicks(next);
    sound.playSfx('crystal');
    if (next >= 3) {
      setEasterEggUnlocked(true);
      sound.playSfx('special');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Touch Swipe-to-Dismiss Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow drag-down to dismiss if at the top of scroll container
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 5) {
      return;
    }
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 90 && onClose) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      onSelectLevel(0);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-400/60 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] relative flex flex-col max-h-[94vh] overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Swipe Handle Indicator */}
        <div className="pt-3 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-cyan-400/50" />
          <span className="text-[9px] font-mono text-cyan-300/70 tracking-widest mt-1 flex items-center gap-1">
            <ChevronDown className="w-3 h-3 animate-bounce" /> DESLIZA PARA EXPLORAR O SALIR
          </span>
        </div>

        {/* Top-Right Quick Close Button */}
        <button
          onClick={handleExit}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-rose-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
          title="Cerrar créditos"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Credit Reel Container */}
        <div 
          ref={scrollContainerRef}
          className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex flex-col gap-4 max-h-[78vh] touch-pan-y"
        >
          {/* Victory & Creator Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold tracking-widest uppercase shadow-md shadow-amber-950/50 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              ¡Victoria Definitiva — Aventura Completada!
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-heading tracking-tight">
              CRÉDITOS FINALES
            </h1>

            {/* CREATOR BADGE: Dmn */}
            <div className="mt-1 flex flex-col items-center bg-slate-950/80 border-2 border-cyan-500/60 rounded-2xl px-5 py-3.5 shadow-[0_0_25px_rgba(6,182,212,0.3)] w-full max-w-md">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> CREADO Y DISEÑADO POR
              </span>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 font-heading tracking-wider mt-0.5 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                Dmn
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-sm text-center font-medium">
                Arquitecto del mundo de Zion Adventure: diseño de niveles, combate de espadas, jefes titánicos y sistemas de juego.
              </p>
            </div>
          </div>

          {/* Global Adventure Stats & Score */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Puntuación</span>
              <p className="text-sm font-black text-cyan-300 font-mono flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                {stats.score.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Tiempo Total</span>
              <p className="text-sm font-bold text-slate-200 font-mono">{formatTime(stats.elapsedTime)}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Enemigos</span>
              <p className="text-sm font-bold text-slate-200 font-mono">{stats.enemiesDefeated}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Secretos</span>
              <p className="text-sm font-bold text-amber-400 font-mono">{stats.secretsFound}/{stats.totalSecrets}</p>
            </div>
          </div>

          {/* GAME PRODUCTION DETAILS SLIDER SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col items-center text-center">
              <Music2 className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold">Banda Sonora</span>
              <p className="text-[11px] text-slate-300 mt-0.5">12 Temas Originales Chiptune y Sintetizador</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col items-center text-center">
              <Shield className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">Sistema de Combate</span>
              <p className="text-[11px] text-slate-300 mt-0.5">Espada de luz, parry, dagas y poderes SP</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col items-center text-center">
              <Heart className="w-4 h-4 text-rose-400 mb-1" />
              <span className="text-[10px] font-mono uppercase text-rose-300 font-bold">Clasificación</span>
              <p className="text-[11px] text-slate-300 mt-0.5">+10 Años (Aventura sin violencia gráfica)</p>
            </div>
          </div>

          {/* EASTER EGG SECTION: KRONOS */}
          <div
            onClick={handleEasterEggClick}
            className={`cursor-pointer transition-all p-4 rounded-2xl border-2 text-center relative overflow-hidden select-none ${
              easterEggUnlocked
                ? 'bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-cyan-950/80 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] scale-102'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest uppercase">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className={easterEggUnlocked ? 'text-amber-300' : 'text-slate-500'}>
                {easterEggUnlocked ? '⚡ SECRETO DESBLOQUEADO — PROTOCOLO KRONOS ⚡' : 'TERMINAL DE ANOMALÍA TEMPORAL'}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-center">
              {easterEggUnlocked ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                    “Kronos”
                  </span>
                  <p className="text-[11px] font-mono text-cyan-300">
                    «El bucle temporal ha sido sellado por Dmn. El guardián supremo de las eras ha despertado.»
                  </p>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-500">
                  [ Toca 3 veces para revelar el Easter Egg ({easterEggClicks}/3) ]
                </div>
              )}
            </div>
          </div>

          {/* EXTRA LEVEL INFO: KRONOS TRAVEL */}
          <div className="bg-gradient-to-r from-cyan-950/90 via-purple-950/90 to-rose-950/90 border-2 border-cyan-400/60 p-4 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                DESAFÍO SUPREMO
              </div>
              <h4 className="text-base font-black text-white font-heading tracking-wide">
                🌌 Kronos Travel: La Fusión Dimensional
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Todas las eras, enemigos, trampas y jefes combinados en un desafío final legendario.
              </p>
            </div>

            <div className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 font-semibold">
              🔒 Desbloqueable al completar la campaña
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-center gap-3 shrink-0">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-cyan-900/40"
            >
              <Home className="w-4 h-4" />
              <span>Volver al Menú</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectLevel(0)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-cyan-900/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver al Inicio (Acto 1)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
