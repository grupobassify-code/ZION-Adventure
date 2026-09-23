import React, { useEffect } from 'react';
import { Timer, Trophy, RotateCcw, Menu, Sparkles } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { formatTimeMs, formatDeltaMs } from '../game/timeAttackGhost';
import { sound } from '../audio/soundEngine';
import { unlockAchievement } from '../game/achievements';
import { useLanguage, getLevelTitle } from '../utils/i18n';

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
  const { language, t } = useLanguage();
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const delta = formatDeltaMs(deltaMs);

  useEffect(() => {
    if (finalTimeMs < 75000 || isNewBest) {
      unlockAchievement('time_attack_record');
    }
  }, [finalTimeMs, isNewBest]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/98 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-3.5 sm:p-6 flex flex-col items-center text-center my-auto max-h-[94vh] overflow-y-auto">
        {/* Glow Header Icon */}
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg border mb-2 shrink-0 ${
            isNewBest
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-amber-950/70'
              : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-950/60'
          }`}
        >
          {isNewBest ? <Trophy className="w-7 h-7 sm:w-9 sm:h-9" /> : <Timer className="w-7 h-7 sm:w-9 sm:h-9" />}
        </div>

        {/* Title Badge */}
        <span
          className={`text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1.5 flex items-center gap-1.5 shrink-0 ${
            isNewBest
              ? 'bg-amber-900/60 border-amber-500/40 text-amber-300'
              : 'bg-cyan-900/60 border-cyan-500/40 text-cyan-300'
          }`}
        >
          {isNewBest ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{t('timeAttackNewBest')}</span>
            </>
          ) : (
            <>
              <Timer className="w-3 h-3 text-cyan-300" />
              <span>{language === 'es' ? 'CONTRARRELOJ COMPLETADO' : 'TIME ATTACK COMPLETED'}</span>
            </>
          )}
        </span>

        {/* Main Time Display */}
        <div className="my-1 shrink-0">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            {t('timeAttackFinalTime')}
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-0.5 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            {formatTimeMs(finalTimeMs)}
          </div>
        </div>

        {/* Delta / PB comparison */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2 sm:p-3 my-2 sm:my-3 grid grid-cols-2 gap-2 text-left shrink-0">
          <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block uppercase">
              {language === 'es' ? 'Circuito' : 'Circuit'}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-white truncate block mt-0.5">
              {getLevelTitle(currentConfig, language)}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block uppercase">
              {prevBestMs !== null ? (language === 'es' ? 'Diferencia vs PB' : 'Delta vs PB') : (language === 'es' ? 'Fantasma' : 'Ghost')}
            </span>
            {prevBestMs !== null ? (
              <span
                className={`text-xs sm:text-sm font-mono font-black block mt-0.5 ${
                  delta.isFaster ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {delta.text}
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 block mt-0.5">
                👻 {language === 'es' ? '¡Guardado!' : 'Saved!'}
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-slate-400 mb-2 sm:mb-3 font-mono line-clamp-2 shrink-0">
          {isNewBest
            ? (language === 'es'
                ? 'Tu nueva mejor marca ha sido guardada. El fantasma ahora correrá con esta velocidad.'
                : 'Your new personal best has been saved. The ghost will now race at this speed.')
            : (language === 'es'
                ? 'Tu fantasma anterior sigue siendo el más rápido. ¡Vuelve a intentarlo para batirlo!'
                : 'Your previous ghost remains faster. Try again to beat it!')}
        </p>

        {/* Action Buttons — Touch Friendly min-h-[44px] */}
        <div className="w-full flex flex-col gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playSfx('click');
              onReplay();
            }}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl font-mono font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>{t('timeAttackRetryBtn')}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onSelectOtherLevel();
              }}
              className="min-h-[44px] py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'es' ? 'OTRO CIRCUITO' : 'OTHER CIRCUIT'}</span>
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
