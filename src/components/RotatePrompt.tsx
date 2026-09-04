import React from 'react';
import { Smartphone, RotateCw, Maximize2, X, Sparkles, Check } from 'lucide-react';
import { requestFullscreenAndLockLandscape } from '../utils/orientation';

interface RotatePromptProps {
  onDismiss?: () => void;
  onPlayVertical?: () => void;
}

export const RotatePrompt: React.FC<RotatePromptProps> = ({ onDismiss, onPlayVertical }) => {
  const handleForceLandscape = async () => {
    await requestFullscreenAndLockLandscape(document.documentElement);
    if (onDismiss) onDismiss();
  };

  const handleVertical = () => {
    if (onPlayVertical) onPlayVertical();
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="rotate-orientation-prompt"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#030612]/95 backdrop-blur-md text-white select-none animate-in fade-in duration-300"
    >
      {/* Background Matrix Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_center,#06b6d433_0,transparent_70%)]" />

      {/* Dismiss button */}
      <button
        onClick={handleVertical}
        className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
        title="Jugar en vertical"
      >
        <X className="w-4 h-4" />
        <span className="text-[11px] font-mono font-bold">CERRAR</span>
      </button>

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center text-center">
        {/* Animated Rotating Smartphone Graphic */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-ping" />
          
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            <Smartphone className="w-9 h-9 sm:w-10 sm:h-10 text-cyan-400 animate-[spin_4s_ease-in-out_infinite]" />
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 absolute top-2 right-2 animate-spin duration-1000" />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          ORIENTACIÓN MÓVIL
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide mb-2">
          ¿CÓMO DESEAS JUGAR?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mb-5">
          El juego se adapta a los píxeles horizontales de tu celular. Puedes girar tu pantalla a horizontal para mayor visión panorámica o jugar directamente en vertical con mando táctil ergonómico.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleForceLandscape}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 fill-current" />
            <span>MODO HORIZONTAL (RECOMENDADO)</span>
          </button>

          <button
            onClick={handleVertical}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95"
          >
            <Check className="w-4 h-4 text-cyan-400" />
            <span>JUGAR EN VERTICAL (ADAPTADO)</span>
          </button>
        </div>

        <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-3.5">
          El tamaño se calibrará automáticamente sin recortar gráficos
        </p>
      </div>
    </div>
  );
};
