import React, { useState, useEffect } from 'react';
import { Sparkles, X, Swords, ArrowRight, ArrowLeft, ArrowUp, MoveHorizontal, Keyboard, Smartphone, Check, Zap, Shield, HelpCircle } from 'lucide-react';

interface TutorialPopupProps {
  levelIndex: number;
  inCutscene?: boolean;
  onDismiss?: () => void;
}

const TUTORIAL_DISMISSED_KEY = 'zion_tutorial_dismissed_v1';

export const TutorialPopup: React.FC<TutorialPopupProps> = ({ levelIndex, inCutscene, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'keyboard' | 'touch'>(() => {
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
      ? 'touch'
      : 'keyboard';
  });
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds auto-dismiss
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only show on Level 1 (index 0) and when cutscene is not blocking
    if (levelIndex !== 0 || inCutscene) {
      setVisible(false);
      return;
    }

    const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
    if (!dismissed) {
      // Delay slightly so player enters game world first
      const startTimer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(startTimer);
    }
  }, [levelIndex, inCutscene]);

  // Countdown timer for automatic non-intrusive fadeout
  useEffect(() => {
    if (!visible || minimized || isHovered) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, minimized, isHovered]);

  const handleDismiss = (dontShowAgain = false) => {
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
    }
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleManualOpen = () => {
    setVisible(true);
    setMinimized(false);
    setTimeLeft(12);
  };

  if (!visible && levelIndex === 0 && !inCutscene) {
    // Floating Help Trigger Button in corner for quick access anytime on level 1
    return (
      <button
        onClick={handleManualOpen}
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 pointer-events-auto bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 group"
        title="Ver Guía de Controles Rápidos"
      >
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-bounce" />
        <span className="hidden sm:inline font-bold">CONTROLES</span>
      </button>
    );
  }

  if (!visible) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute top-12 sm:top-auto sm:bottom-6 inset-x-2 sm:inset-x-auto sm:left-6 sm:max-w-md z-40 pointer-events-auto transition-all duration-300 animate-slide-up max-h-[82vh] overflow-y-auto"
      aria-label="Guía de Controles Básicos"
    >
      <div className="bg-slate-950/95 border-2 border-cyan-500/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-[0_10px_40px_rgba(6,182,212,0.35)] backdrop-blur-xl relative overflow-hidden flex flex-col gap-3">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Progress Bar (Auto-Dismiss) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        {/* Header with Title, Mode Switcher & Close */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white font-heading tracking-wide flex items-center gap-1.5">
                GUÍA DE CONTROLES
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  NIVEL 1
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {isHovered ? 'Tiempo pausado' : `Se cerrará en ${timeLeft}s`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tab switch Keyboard / Touch */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('keyboard')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                  activeTab === 'keyboard'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ver controles de teclado"
              >
                <Keyboard className="w-3 h-3" />
                <span className="hidden sm:inline">PC</span>
              </button>
              <button
                onClick={() => setActiveTab('touch')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                  activeTab === 'touch'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ver controles táctiles"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Móvil</span>
              </button>
            </div>

            {/* Dismiss X button */}
            <button
              onClick={() => handleDismiss(false)}
              className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
              title="Cerrar tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        {activeTab === 'keyboard' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* 1. Moverse / Move */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] font-mono uppercase">
                <MoveHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Moverse</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-slate-200 shadow">A</kbd>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-slate-200 shadow">D</kbd>
                <span className="text-[10px] text-slate-500">o</span>
                <kbd className="px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-md text-[10px] font-mono text-slate-300 shadow">←</kbd>
                <kbd className="px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-md text-[10px] font-mono text-slate-300 shadow">→</kbd>
              </div>
              <span className="text-[10px] text-slate-400">Izquierda / Derecha</span>
            </div>

            {/* 2. Saltar / Jump */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] font-mono uppercase">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Saltar</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-emerald-300 shadow">W</kbd>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[10px] font-mono font-bold text-emerald-300 shadow">ESPACIO</kbd>
                <span className="text-[10px] text-slate-500">o</span>
                <kbd className="px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-md text-[10px] font-mono text-slate-300 shadow">↑</kbd>
              </div>
              <span className="text-[10px] text-slate-400">Doble salto habilitado</span>
            </div>

            {/* 3. Atacar / Attack */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px] font-mono uppercase">
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>3. Atacar</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-rose-300 shadow">J</kbd>
                <span className="text-[10px] text-slate-500">o</span>
                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-rose-300 shadow">Z</kbd>
              </div>
              <span className="text-[10px] text-slate-400">Combo espada de 3 golpes</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Mobile Touch: Move */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] font-mono uppercase">
                <MoveHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Moverse</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold text-[10px]">
                  🕹️
                </div>
                <span className="font-mono text-[11px]">Joystick / D-Pad izquierdo</span>
              </div>
              <span className="text-[10px] text-slate-400">Arrastra para correr</span>
            </div>

            {/* Mobile Touch: Jump */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] font-mono uppercase">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Saltar</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center font-bold text-[10px] text-emerald-300">
                  ▲
                </div>
                <span className="font-mono text-[11px]">Botón Verde (Derecha)</span>
              </div>
              <span className="text-[10px] text-slate-400">Toca 2 veces para doble salto</span>
            </div>

            {/* Mobile Touch: Attack */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px] font-mono uppercase">
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>3. Atacar</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-full bg-rose-950 border border-rose-500/50 flex items-center justify-center font-bold text-[10px] text-rose-300">
                  ⚔️
                </div>
                <span className="font-mono text-[11px]">Botón Rojo Central</span>
              </div>
              <span className="text-[10px] text-slate-400">Espadazo rápido & combos</span>
            </div>
          </div>
        )}

        {/* Secondary controls teaser + Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="text-amber-400 font-bold">Extras:</span>
            <span>[K] Daga · [Shift] Dash · [E] Bloqueo</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleDismiss(true)}
              className="text-[10px] text-slate-500 hover:text-slate-300 underline font-mono transition-colors"
              title="No volver a mostrar en futuras partidas"
            >
              No volver a mostrar
            </button>
            <button
              onClick={() => handleDismiss(false)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs font-mono flex items-center gap-1 transition-all active:scale-95 shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>¡Entendido!</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
