import React from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
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
  const currentConfig = LEVEL_CONFIGS[levelIndex];
  const lorePages = currentConfig.lore;
  const currentLore = lorePages[currentPage] || lorePages[0];

  const isLastPage = currentPage >= lorePages.length - 1;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/95 border-2 border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden flex flex-col gap-5">
        {/* Glowing Background Ring */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title with Zone Icon */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-pink-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {currentConfig.subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 font-heading tracking-tight">
              {currentLore.title}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            {currentPage + 1}/{lorePages.length}
          </span>
        </div>

        {/* Narrative Text Lines */}
        <div className="flex flex-col gap-3 my-2 text-slate-200 leading-relaxed text-sm sm:text-base font-normal">
          {currentLore.lines.map((line, idx) => (
            <p key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {line}
            </p>
          ))}
          {currentLore.author && (
            <p className="text-right text-xs font-mono text-pink-400/80 italic mt-1">
              — {currentLore.author}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onSkip}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors px-3 py-2"
          >
            Saltar historia [ESC]
          </button>

          <button
            onClick={onAdvance}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-900/40 active:scale-95 transition-all cursor-pointer"
          >
            <span>{isLastPage ? 'COMENZAR NIVEL' : 'CONTINUAR'}</span>
            {isLastPage ? <Play className="w-4 h-4 fill-white" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
