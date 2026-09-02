import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, RotateCcw, Cpu, Home, Award } from 'lucide-react';
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

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.35)] relative overflow-hidden flex flex-col gap-5 my-auto max-h-[92vh]">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory & Creator Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase shadow-lg shadow-amber-950/50 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            ¡Victoria Definitiva — Aventura Completada!
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-heading tracking-tight">
            CRÉDITOS FINALES
          </h1>

          {/* CREATOR BADGE: Dmn */}
          <div className="mt-1 flex flex-col items-center bg-slate-950/80 border-2 border-cyan-500/60 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] w-full max-w-md">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> CREADO Y DISEÑADO POR
            </span>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 font-heading tracking-wider mt-1 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
              Dmn
            </div>
            <p className="text-xs text-slate-300 mt-1.5 max-w-sm text-center font-medium">
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

        {/* EXTRA LEVEL UNLOCKED: KRONOS TRAVEL */}
        <div className="bg-gradient-to-r from-cyan-950/90 via-purple-950/90 to-rose-950/90 border-2 border-cyan-400 p-4 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              ¡NIVEL EXTRA DESBLOQUEADO!
            </div>
            <h4 className="text-base font-black text-white font-heading tracking-wide">
              🌌 Kronos Travel: La Fusión Dimensional
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Todas las eras, enemigos, peligros y mecánicas combinados en un último y descomunal desafío.
            </p>
          </div>

          <button
            onClick={() => onSelectLevel(11)}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-400 hover:from-cyan-300 hover:to-pink-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-95 transition-all animate-pulse"
          >
            <span>ENTRAR A KRONOS TRAVEL</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Volver al Menú</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectLevel(0)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver al Inicio (Acto 1)</span>
            </button>
          )}

          <button
            onClick={onRestartGame}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-900/50 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>NUEVA PARTIDA PLUS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
