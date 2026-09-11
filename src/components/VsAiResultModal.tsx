import React from 'react';
import { Trophy, Skull, RotateCcw, Menu, ChevronRight, Bot, Swords, Sparkles } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { sound } from '../audio/soundEngine';

interface VsAiResultModalProps {
  playerWon: boolean;
  levelIndex: number;
  playerTime: number;
  aiName: string;
  onReplay: () => void;
  onSelectOtherLevel: () => void;
  onReturnToMenu: () => void;
}

export const VsAiResultModal: React.FC<VsAiResultModalProps> = ({
  playerWon,
  levelIndex,
  playerTime,
  aiName,
  onReplay,
  onSelectOtherLevel,
  onReturnToMenu,
}) => {
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Result Icon */}
        <div
          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-2xl border mb-4 animate-bounce ${
            playerWon
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-950/60'
              : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-rose-950/60'
          }`}
        >
          {playerWon ? <Trophy className="w-10 h-10" /> : <Bot className="w-10 h-10" />}
        </div>

        {/* Title */}
        <span
          className={`text-xs font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 ${
            playerWon
              ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-900/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {playerWon ? '¡VICTORIA EN LA CARRERA!' : '¡DERROTA EN LA META!'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
          {playerWon ? '¡SUPERASTE A LA IA!' : `¡${aiName} LLEGÓ PRIMERO!`}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
          {playerWon
            ? 'Tus reflejos cuánticos y precisión de salto fueron superiores al algoritmo.'
            : 'La inteligencia artificial optimizó su ruta a la meta. ¡Intenta de nuevo para vencerla!'}
        </p>

        {/* Stats Panel */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 my-5 grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Pista Superada</span>
            <span className="text-xs font-mono font-bold text-white truncate block mt-0.5">
              {currentConfig.title}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Tiempo del Jugador</span>
            <span className="text-xs font-mono font-bold text-cyan-300 block mt-0.5">
              ⏱️ {formatSeconds(playerTime)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playSfx('click');
              onReplay();
            }}
            className="w-full py-3.5 px-4 rounded-2xl font-mono font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{playerWon ? 'CORRER DE NUEVO' : 'REINTENTAR REVANCHA'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onSelectOtherLevel();
              }}
              className="py-3 px-3 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>OTRA PISTA</span>
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
