import React from 'react';
import { Sparkles, ArrowRight, Play, FastForward } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';

interface DialogModalProps {
  levelIndex: number;
  currentPage: number;
  onAdvance: () => void;
  onSkip: () => void;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  levelIndex,
  currentPage,
  onAdvance,
  onSkip,
}) => {
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const lorePages = currentConfig.lore;
  const currentLore = lorePages[currentPage] || lorePages[0];

  const isLastPage = currentPage >= lorePages.length - 1;
  const themeColor = currentConfig.themeColor || '#ec4899';

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none">
      <div
        className="w-full max-w-lg bg-slate-950/95 border-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh] transition-all"
        style={{
          borderColor: `${themeColor}60`,
          boxShadow: `0 0 40px ${themeColor}25`,
        }}
      >
        {/* Glowing Background Accent */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        {/* Header Title with Zone & Page Indicator */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 sm:pb-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1"
                style={{ color: themeColor }}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{currentConfig.subtitle}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-100 mt-0.5 font-heading tracking-tight truncate">
              {currentLore.title}
            </h2>
          </div>

          <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 sm:py-1 bg-slate-900 text-slate-300 rounded-full border border-slate-800 shrink-0">
            {currentPage + 1}/{lorePages.length}
          </span>
        </div>

        {/* Narrative Text Lines — Scrollable on Short Mobile Screens */}
        <div className="flex-1 overflow-y-auto max-h-[38vh] sm:max-h-[48vh] pr-1 my-2.5 sm:my-3 flex flex-col gap-2 text-slate-200 text-xs sm:text-sm font-normal leading-relaxed custom-scroll">
          {currentLore.lines.map((line, idx) => (
            <p key={idx} className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
              {line}
            </p>
          ))}
          {currentLore.author && (
            <p
              className="text-right text-[11px] sm:text-xs font-mono italic mt-0.5"
              style={{ color: themeColor }}
            >
              — {currentLore.author}
            </p>
          )}
        </div>

        {/* Action Controls — Always Visible at Bottom on Mobile */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800 shrink-0">
          <button
            onClick={onSkip}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg active:scale-95"
            title="Saltar historia e iniciar partida directamente"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-500" />
            <span>Saltar historia</span>
          </button>

          <button
            onClick={onAdvance}
            className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${themeColor}, #f43f5e)`,
              boxShadow: `0 0 20px ${themeColor}50`,
            }}
          >
            <span>{isLastPage ? 'COMENZAR NIVEL' : 'CONTINUAR'}</span>
            {isLastPage ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
