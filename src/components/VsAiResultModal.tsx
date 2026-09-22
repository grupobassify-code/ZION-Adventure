import React from 'react';
import { Trophy, RotateCcw, Menu, Bot, Swords } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { sound } from '../audio/soundEngine';
import { useLanguage, getLevelTitle } from '../utils/i18n';

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
  const { language } = useLanguage();
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/98 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-3.5 sm:p-6 flex flex-col items-center text-center my-auto max-h-[94vh] overflow-y-auto">
        {/* Result Icon */}
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg border mb-2 shrink-0 ${
            playerWon
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-950/60'
              : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-rose-950/60'
          }`}
        >
          {playerWon ? <Trophy className="w-7 h-7 sm:w-9 sm:h-9" /> : <Bot className="w-7 h-7 sm:w-9 sm:h-9" />}
        </div>

        {/* Title Badge */}
        <span
          className={`text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1.5 shrink-0 ${
            playerWon
              ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-900/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {playerWon
            ? (language === 'es' ? '¡VICTORIA EN LA CARRERA!' : 'RACE VICTORY!')
            : (language === 'es' ? '¡DERROTA EN LA META!' : 'RACE DEFEAT!')}
        </span>

        <h2 className="text-lg sm:text-2xl font-black font-mono text-white tracking-tight shrink-0">
          {playerWon
            ? (language === 'es' ? '¡SUPERASTE A LA IA!' : 'YOU BEAT THE AI!')
            : (language === 'es' ? `¡${aiName} LLEGÓ PRIMERO!` : `${aiName} FINISHED FIRST!`)}
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-sm line-clamp-2 shrink-0">
          {playerWon
            ? (language === 'es' ? 'Tus reflejos cuánticos y precisión de salto fueron superiores al algoritmo.' : 'Your quantum reflexes and jumping precision bested the algorithm.')
            : (language === 'es' ? 'La IA optimizó su ruta a la meta. ¡Intenta de nuevo para vencerla!' : 'The AI optimized its path to the finish. Try again to beat it!')}
        </p>

        {/* Stats Panel */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2 sm:p-3 my-2.5 sm:my-3.5 grid grid-cols-2 gap-2 text-left shrink-0">
          <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block uppercase">
              {language === 'es' ? 'Pista Superada' : 'Track'}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-white truncate block mt-0.5">
              {getLevelTitle(currentConfig, language)}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block uppercase">
              {language === 'es' ? 'Tiempo' : 'Time'}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 block mt-0.5">
              ⏱️ {formatSeconds(playerTime)}
            </span>
          </div>
        </div>

        {/* Action Buttons — Touch Friendly min-h-[44px] */}
        <div className="w-full flex flex-col gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playSfx('click');
              onReplay();
            }}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl font-mono font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>
              {playerWon
                ? (language === 'es' ? 'CORRER DE NUEVO' : 'RACE AGAIN')
                : (language === 'es' ? 'REINTENTAR REVANCHA' : 'RETRY REMATCH')}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onSelectOtherLevel();
              }}
              className="min-h-[44px] py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'es' ? 'OTRA PISTA' : 'OTHER TRACK'}</span>
            </button>

            <button
              onClick={() => {
                sound.playSfx('menuBack');
                onReturnToMenu();
              }}
              className="min-h-[44px] py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'es' ? 'MENÚ' : 'MENU'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
