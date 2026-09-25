import React from 'react';
import { Trophy, ArrowRight, RotateCcw, Sparkles, Clock, Skull, Zap, Gem } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameStats } from '../game/gameEngine';
import { KRONOS_PIECES } from '../game/saveManager';
import { useLanguage, getLevelTitle, getKronosPieceLocalized } from '../utils/i18n';

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
  const { language, t } = useLanguage();
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const isFinalLevel = levelIndex >= LEVEL_CONFIGS.length - 1 || currentConfig.id === 'piratestreasure-3';
  const isSpecialStage = stats.totalCrystals === 5 && stats.totalSecrets === 0;

  // Calculate Performance Rank (With Special Stage tolerance of up to 3 crystals)
  const crystalTarget = isSpecialStage ? Math.max(1, stats.totalCrystals - 3) : stats.totalCrystals;
  const crystalRatio = crystalTarget > 0 ? Math.min(1, stats.crystalsCollected / crystalTarget) : 1;
  const secretRatio = stats.totalSecrets > 0 ? stats.secretsFound / stats.totalSecrets : 1;
  const scoreFactor = crystalRatio * 0.5 + secretRatio * 0.5 - stats.deaths * 0.1;
  const rank = scoreFactor >= 0.85 ? 'S' : scoreFactor >= 0.65 ? 'A' : scoreFactor >= 0.45 ? 'B' : 'C';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-400/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.3)] relative overflow-y-auto max-h-[96vh] flex flex-col gap-3 sm:gap-5">
        {/* Glowing Background Radial */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="text-center flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/50">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 font-heading tracking-tight">
            {isSpecialStage 
              ? `🌌 ${t('victorySpecialStageComplete')}`
              : isFinalLevel 
              ? `🏆 ${t('victoryAdventureComplete')}` 
              : `🌀 ${t('victoryTitle')}`}
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300 font-medium">
            {isSpecialStage ? t('victorySpecialStageSubtitle') : getLevelTitle(currentConfig, language)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-cyan-950/60 text-cyan-400 shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase">{t('victoryCrystals')}</span>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-100">
                {stats.crystalsCollected}/{stats.totalCrystals}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-950/60 text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase">{t('victorySecrets')}</span>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-100">
                {stats.secretsFound}/{stats.totalSecrets}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-950/60 text-purple-400 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase">{t('victoryTime')}</span>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-100">{formatTime(stats.elapsedTime)}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-950/60 text-rose-400 shrink-0">
              <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase">{t('victoryEnemies')}</span>
              <p className="text-sm sm:text-base font-mono font-bold text-slate-100">{stats.enemiesDefeated}</p>
            </div>
          </div>
        </div>

        {/* Rank Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-950/60 via-slate-950/60 to-purple-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-cyan-800/40">
          <div>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase">{t('victoryRankTitle')}</span>
            <p className="text-xs sm:text-sm font-semibold text-cyan-200">
              {rank === 'S'
                ? t('victoryRankS')
                : rank === 'A'
                ? t('victoryRankA')
                : rank === 'B'
                ? t('victoryRankB')
                : t('victoryRankC')}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-black text-xl sm:text-2xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            {rank}
          </div>
        </div>

        {/* Special Unlock Notification for Jungle Run upon completing Kronos Travel */}
        {LEVEL_CONFIGS[levelIndex]?.id === 'krono-travel' && (
          <div className="w-full bg-emerald-950/80 border-2 border-emerald-500/60 rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400">
                {t('victoryJungleUnlockTitle')}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {t('victoryJungleUnlockDesc')}
              </div>
            </div>
          </div>
        )}

        {/* Special Notification when defeating a Boss and obtaining a Kronos Clock Piece */}
        {(() => {
          const bossPiece = KRONOS_PIECES.find((p) => p.levelIndex === levelIndex);
          if (!bossPiece) return null;
          const locPiece = getKronosPieceLocalized(bossPiece.id, language);
          return (
            <div className="w-full bg-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <Gem className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
                  {t('victoryKronosPieceTitle')}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {locPiece.name} ({locPiece.bossName}) · {t('victoryKronosPieceDesc')}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action Buttons — Mobile-Optimized with at least 44px touch targets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 shrink-0">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition-all active:scale-95 border border-cyan-500/30"
              >
                <span>{t('victoryLevelPortal')}</span>
              </button>
            )}
            <button
              onClick={onReplayLevel}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('victoryReplay')}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto mt-1 sm:mt-0">
            {!isFinalLevel && !isSpecialStage ? (
              <button
                onClick={onNextLevel}
                className={`w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 sm:px-6 py-2 rounded-xl font-black text-xs sm:text-sm active:scale-95 transition-all ${
                  currentConfig.id === 'krono-travel'
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-pulse'
                    : currentConfig.id === 'castlesmash-3'
                    ? 'bg-gradient-to-r from-amber-400 via-sky-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(2,132,199,0.6)] animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-900/50'
                }`}
              >
                <span>
                  {currentConfig.id === 'krono-travel'
                    ? (language === 'es' ? '🌴 AVANZAR A JUNGLE RUN (ZONA 6)' : '🌴 ADVANCE TO JUNGLE RUN (ZONE 6)')
                    : currentConfig.id === 'castlesmash-3'
                    ? (language === 'es' ? '⚓ AVANZAR A PIRATES TREASURE (ZONA 10)' : '⚓ ADVANCE TO PIRATES TREASURE (ZONE 10)')
                    : t('victoryNextAct')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenCredits || onReturnToMenu || onReplayLevel}
                className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(251,191,36,0.5)] active:scale-95 transition-all animate-pulse"
              >
                <span>{isSpecialStage ? t('victoryContinueAdventure') : t('victoryCreditsPortal')}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
