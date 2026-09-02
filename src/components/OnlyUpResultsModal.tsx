import React from 'react';
import { Flame, Trophy, ArrowUp, RotateCcw, Home, Diamond, Clock } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface OnlyUpResultsModalProps {
  altitude: number;
  record: number;
  isNewRecord: boolean;
  timeSurvived: number;
  crystals: number;
  score: number;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

export const OnlyUpResultsModal: React.FC<OnlyUpResultsModalProps> = ({
  altitude,
  record,
  isNewRecord,
  timeSurvived,
  crystals,
  score,
  onRetry,
  onReturnToMenu,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-orange-500/50 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 p-5 sm:p-7 shadow-[0_0_50px_rgba(249,115,22,0.35)] overflow-hidden">
        {/* Animated Lava Embers background glow */}
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-500 p-0.5 shadow-[0_0_25px_rgba(234,88,12,0.6)] mb-3 flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-[11px] font-mono font-bold text-orange-300 mb-1">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>KRONOS ONLY UP — RESULTADOS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-wide">
            ¡LA LAVA TE HA ALCANZADO!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
            La lava cuántica ha consumido tu ascenso. ¡Aprende los patrones de las plataformas y escala más rápido la próxima vez!
          </p>
        </div>

        {/* Main Stats Showcase */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Altitude Reached */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 border border-orange-500/30 text-center shadow-md">
            <span className="text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5" /> ALTURA ALCANZADA
            </span>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {altitude} <span className="text-base text-orange-400 font-bold">m</span>
            </div>
            {isNewRecord && (
              <span className="mt-1 px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-400/40 text-[10px] font-mono font-bold text-yellow-300 animate-pulse">
                ¡NUEVO RÉCORD!
              </span>
            )}
          </div>

          {/* Personal Record */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 border border-yellow-500/30 text-center shadow-md">
            <span className="text-[11px] font-mono font-bold text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> RÉCORD PERSONAL
            </span>
            <div className="text-3xl font-black text-yellow-300 font-mono mt-1">
              {record} <span className="text-base text-yellow-500 font-bold">m</span>
            </div>
            <span className="mt-1 text-[10px] font-mono text-slate-500">
              Guardado en tu partida
            </span>
          </div>
        </div>

        {/* Secondary Stats Strip */}
        <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> TIEMPO
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {formatTime(timeSurvived)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
              <Diamond className="w-3 h-3 text-cyan-400" /> CRISTALES
            </span>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              +{crystals}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500">PUNTOS</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onRetry();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-sm shadow-[0_0_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR AHORA</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onReturnToMenu();
            }}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENÚ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
