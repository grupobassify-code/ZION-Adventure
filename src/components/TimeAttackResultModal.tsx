import React from 'react';
import { Timer, Trophy, RotateCcw, Menu, Ghost, Sparkles, Flame } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { formatTimeMs, formatDeltaMs } from '../game/timeAttackGhost';
import { sound } from '../audio/soundEngine';

interface TimeAttackResultModalProps {
  levelIndex: number;
  finalTimeMs: number;
  isNewBest: boolean;
  deltaMs: number;
  prevBestMs: number | null;
  onReplay: () => void;
  onSelectOtherLevel: () => void;
  onReturnToMenu: () => void;
}

export const TimeAttackResultModal: React.FC<TimeAttackResultModalProps> = ({
  levelIndex,
  finalTimeMs,
  isNewBest,
  deltaMs,
  prevBestMs,
  onReplay,
  onSelectOtherLevel,
  onReturnToMenu,
}) => {
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const delta = formatDeltaMs(deltaMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Glow Header Icon */}
        <div
          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-2xl border mb-4 animate-pulse ${
            isNewBest
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-amber-950/70'
              : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-950/60'
          }`}
        >
          {isNewBest ? <Trophy className="w-10 h-10" /> : <Timer className="w-10 h-10" />}
        </div>

        {/* Title Badge */}
        <span
          className={`text-xs font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 flex items-center gap-1.5 ${
            isNewBest
              ? 'bg-amber-900/60 border-amber-500/40 text-amber-300'
              : 'bg-cyan-900/60 border-cyan-500/40 text-cyan-300'
          }`}
        >
          {isNewBest ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>¡NUEVO RÉCORD PERSONAL!</span>
            </>
          ) : (
            <>
              <Timer className="w-3.5 h-3.5" />
              <span>CIRCUITO CONTRARRELOJ COMPLETADO</span>
            </>
          )}
        </span>

        {/* Main Time Display */}
        <div className="my-2">
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            Tiempo Registrado
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white mt-1 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            {formatTimeMs(finalTimeMs)}
          </div>
        </div>

        {/* Delta / PB comparison */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 my-4 grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Circuito</span>
            <span className="text-xs font-mono font-bold text-white truncate block mt-0.5">
              {currentConfig.title}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              {prevBestMs !== null ? 'Diferencia vs PB' : 'Estado Fantasma'}
            </span>
            {prevBestMs !== null ? (
              <span
                className={`text-xs font-mono font-black block mt-0.5 ${
                  delta.isFaster ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {delta.text}
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-cyan-300 block mt-0.5">
                👻 ¡Fantasma Guardado!
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5 font-mono">
          {isNewBest
            ? 'Tu nueva mejor marca ha sido guardada. El fantasma ahora correrá con esta velocidad.'
            : 'Tu fantasma anterior sigue siendo el más rápido. ¡Vuelve a intentarlo para batirlo!'}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playSfx('click');
              onReplay();
            }}
            className="w-full py-3.5 px-4 rounded-2xl font-mono font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR MEJORAR TIEMPO (R)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onSelectOtherLevel();
              }}
              className="py-3 px-3 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>OTRO CIRCUITO</span>
            </button>

            <button
              onClick={() => {
                sound.playSfx('menuBack');
                onReturnToMenu();
              }}
              className="py-3 px-3 rounded-xl font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>MENÚ PRINCIPAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
