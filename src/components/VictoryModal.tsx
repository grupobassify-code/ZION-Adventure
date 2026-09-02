import React from 'react';
import { Trophy, ArrowRight, RotateCcw, Sparkles, Clock, Skull, Zap } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameStats } from '../game/gameEngine';

interface VictoryModalProps {
  levelIndex: number;
  stats: GameStats;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenCredits?: () => void;
  onReturnToMenu?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelIndex,
  stats,
  onNextLevel,
  onReplayLevel,
  onOpenCredits,
  onReturnToMenu,
}) => {

  const currentConfig = LEVEL_CONFIGS[levelIndex];
  const isFinalLevel = levelIndex >= LEVEL_CONFIGS.length - 1;

  // Calculate Performance Rank
  const crystalRatio = stats.totalCrystals > 0 ? stats.crystalsCollected / stats.totalCrystals : 1;
  const secretRatio = stats.totalSecrets > 0 ? stats.secretsFound / stats.totalSecrets : 1;
  const scoreFactor = crystalRatio * 0.5 + secretRatio * 0.5 - stats.deaths * 0.1;
  const rank = scoreFactor >= 0.85 ? 'S' : scoreFactor >= 0.65 ? 'A' : scoreFactor >= 0.45 ? 'B' : 'C';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col gap-6">
        {/* Glowing Background Radial */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/50">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-heading tracking-tight">
            {isFinalLevel ? '🏆 ¡AVENTURA COMPLETADA!' : '🌀 ¡PORTAL ABIERTO!'}
          </h2>
          <p className="text-sm text-cyan-300 font-medium">{currentConfig.title}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Cristales</span>
              <p className="text-base font-mono font-bold text-slate-100">
                {stats.crystalsCollected}/{stats.totalCrystals}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Secretos</span>
              <p className="text-base font-mono font-bold text-slate-100">
                {stats.secretsFound}/{stats.totalSecrets}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Tiempo</span>
              <p className="text-base font-mono font-bold text-slate-100">{formatTime(stats.elapsedTime)}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Enemigos</span>
              <p className="text-base font-mono font-bold text-slate-100">{stats.enemiesDefeated}</p>
            </div>
          </div>
        </div>

        {/* Rank Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-950/60 via-slate-950/60 to-purple-950/60 p-4 rounded-2xl border border-cyan-800/40">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Rango de Desempeño</span>
            <p className="text-sm font-semibold text-cyan-200">
              {rank === 'S'
                ? '¡Maestría Legendaria!'
                : rank === 'A'
                ? '¡Excelente Exploración!'
                : rank === 'B'
                ? '¡Buen Desempeño!'
                : '¡Nivel Superado!'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-black text-2xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            {rank}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition-all active:scale-95"
              >
                <span>MENÚ & NIVELES</span>
              </button>
            )}
            <button
              onClick={onReplayLevel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rejugar</span>
            </button>
          </div>

          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-900/50 active:scale-95 transition-all"
            >
              <span>SIGUIENTE ACTO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenCredits || onReplayLevel}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(251,191,36,0.5)] active:scale-95 transition-all animate-pulse"
            >
              <span>PORTAL A LOS CRÉDITOS</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
