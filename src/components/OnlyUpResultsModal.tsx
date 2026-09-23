import React, { useEffect } from 'react';
import { Skull, Trophy, ArrowUp, RotateCcw, Home, Diamond, Clock } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { useLanguage } from '../utils/i18n';

interface OnlyUpResultsModalProps {
  altitude: number;
  record: number;
  isNewRecord: boolean;
  timeSurvived: number;
  crystals?: number;
  score?: number;
  isVictory?: boolean;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

export const OnlyUpResultsModal: React.FC<OnlyUpResultsModalProps> = ({
  altitude,
  record,
  isNewRecord,
  timeSurvived,
  crystals = 0,
  score = 0,
  isVictory = false,
  onRetry,
  onReturnToMenu,
}) => {
  const { language } = useLanguage();
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isVictory) {
      sound.playSfx('win');
    } else {
      sound.playSfx('gameOver');
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playSfx('menuSelect');
        onRetry();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        sound.playSfx('menuSelect');
        onReturnToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry, onReturnToMenu, isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`relative w-full max-w-lg max-h-[96vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 ${
          isVictory ? 'border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.45)]' : 'border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.4)]'
        } bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 p-3.5 sm:p-6`}
      >
        {/* Animated background glow */}
        <div className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full ${isVictory ? 'bg-amber-500/20' : 'bg-red-600/20'} blur-3xl pointer-events-none`} />
        <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full ${isVictory ? 'bg-yellow-400/20' : 'bg-orange-600/20'} blur-3xl pointer-events-none`} />

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl ${
              isVictory ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_25px_rgba(251,191,36,0.6)]' : 'bg-gradient-to-tr from-red-600 to-orange-500 shadow-[0_0_25px_rgba(239,68,68,0.6)]'
            } p-0.5 mb-3 flex items-center justify-center animate-bounce`}
          >
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              {isVictory ? (
                <Trophy className="w-8 h-8 text-amber-400" />
              ) : (
                <Skull className="w-8 h-8 text-red-400" />
              )}
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isVictory ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' : 'bg-red-500/20 border-red-400/40 text-red-300'
            } border text-[11px] font-mono font-bold mb-1`}
          >
            <span>
              {isVictory
                ? (language === 'es' ? '👑 KRONOS ONLY UP — ¡CIMA CONQUISTADA!' : '👑 KRONOS ONLY UP — SUMMIT CONQUERED!')
                : (language === 'es' ? 'KRONOS ONLY UP — FIN DE LA PARTIDA' : 'KRONOS ONLY UP — GAME OVER')}
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-black font-heading tracking-wide text-transparent bg-clip-text ${
              isVictory
                ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                : 'bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]'
            }`}
          >
            {isVictory
              ? (language === 'es' ? '¡VICTORIA ÉPICA!' : 'EPIC VICTORY!')
              : 'GAME OVER'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
            {isVictory
              ? (language === 'es'
                  ? '¡Increíble hazaña! Has derrotado al Guardián de la Cima y completado el ascenso de 500 metros.'
                  : 'Incredible feat! You defeated the Summit Guardian and conquered the 500m ascent.')
              : (language === 'es'
                  ? '¡Tu ascenso ha terminado! Puedes volver a jugar inmediatamente o regresar al menú de inicio.'
                  : 'Your ascent has ended! You can retry immediately or return to the main menu.')}
          </p>
        </div>

        {/* Main Stats Showcase */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Altitude Reached */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 border border-orange-500/30 text-center shadow-md">
            <span className="text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5" /> {language === 'es' ? 'ALTURA ALCANZADA' : 'ALTITUDE REACHED'}
            </span>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {altitude} <span className="text-base text-orange-400 font-bold">m</span>
            </div>
            {isNewRecord && (
              <span className="mt-1 px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-400/40 text-[10px] font-mono font-bold text-yellow-300 animate-pulse">
                {language === 'es' ? '¡NUEVO RÉCORD!' : 'NEW RECORD!'}
              </span>
            )}
          </div>

          {/* Personal Record */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 border border-yellow-500/30 text-center shadow-md">
            <span className="text-[11px] font-mono font-bold text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> {language === 'es' ? 'RÉCORD PERSONAL' : 'PERSONAL RECORD'}
            </span>
            <div className="text-3xl font-black text-yellow-300 font-mono mt-1">
              {record} <span className="text-base text-yellow-500 font-bold">m</span>
            </div>
            <span className="mt-1 text-[10px] font-mono text-slate-500">
              {language === 'es' ? 'Guardado en tu partida' : 'Saved to profile'}
            </span>
          </div>
        </div>

        {/* Secondary Stats Strip */}
        <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> {language === 'es' ? 'TIEMPO' : 'TIME'}
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {formatTime(timeSurvived)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
              <Diamond className="w-3 h-3 text-cyan-400" /> {language === 'es' ? 'CRISTALES' : 'CRYSTALS'}
            </span>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              +{crystals}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500">{language === 'es' ? 'PUNTOS' : 'POINTS'}</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dynamic Climb Pro-Tip */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center gap-2.5 text-[11px] text-cyan-200">
          <span className="text-sm">⚡</span>
          <span>
            <strong>Pro Tip:</strong>{' '}
            {language === 'es'
              ? '¡Entre más subes, mayor es tu velocidad y potencia de salto! Pero ten cuidado: los trampolines escasean y los obstáculos aumentan.'
              : 'The higher you climb, the greater your speed and jump power! But beware: trampolines become scarce and hazards increase.'}
          </span>
        </div>

        {/* Actions Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="only-up-play-again-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onRetry();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'es' ? 'JUGAR DE NUEVO' : 'PLAY AGAIN'}</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono opacity-80">{language === 'es' ? 'ESPACIO' : 'SPACE'}</span>
          </button>

          <button
            id="only-up-return-start-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onReturnToMenu();
            }}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'es' ? 'REGRESAR AL INICIO' : 'RETURN TO MENU'}</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono opacity-80">ESC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
