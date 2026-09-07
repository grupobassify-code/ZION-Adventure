import React, { useEffect, useState } from 'react';
import { Compass, Target, ShieldAlert, X } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';

interface LevelIntroBannerProps {
  levelIndex: number;
  onDismiss?: () => void;
}

export const LevelIntroBanner: React.FC<LevelIntroBannerProps> = ({ levelIndex, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);

  const config = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];

  useEffect(() => {
    setVisible(true);
    setAnimatingOut(false);

    const timer1 = setTimeout(() => {
      setAnimatingOut(true);
    }, 2800);

    const timer2 = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 3300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [levelIndex, onDismiss]);

  if (!visible) return null;

  const zoneNames: Record<string, { name: string; icon: string }> = {
    neon: { name: 'BOSQUE NEÓN', icon: '⚡' },
    sakura: { name: 'BOSQUE DE CEREZO', icon: '🌸' },
    lavacliff: { name: 'ACANTILADO DE LAVA', icon: '🌋' },
    desert: { name: 'SANTUARIO DEL DESIERTO', icon: '🏛️' },
    krono: { name: 'KRONO CITY METRÓPOLIS', icon: '🏙️' },
    travel: { name: 'DIMENSIÓN KRONOS TRAVEL', icon: '🌌' },
  };

  const zoneInfo = zoneNames[config.zone] || { name: config.zone.toUpperCase(), icon: '⚔️' };
  const isBossLevel =
    config.act === 3 ||
    (config.zone === 'desert' && config.act === 2) ||
    (config.zone === 'krono' && config.act === 2) ||
    config.zone === 'travel';

  const themeColor = config.themeColor || '#06b6d4';

  const handleManualClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 200);
  };

  return (
    <div
      onClick={handleManualClose}
      className={`absolute inset-x-0 top-10 sm:top-14 z-40 flex justify-center pointer-events-auto cursor-pointer select-none transition-all duration-300 ease-out px-2.5 sm:px-4 ${
        animatingOut
          ? 'opacity-0 -translate-y-6 scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-slide-down'
      }`}
    >
      <div
        className="relative max-w-sm sm:max-w-lg w-full bg-slate-950/95 backdrop-blur-xl border-2 rounded-2xl p-2.5 sm:p-4 shadow-2xl overflow-hidden flex flex-col items-center text-center gap-1.5 sm:gap-2"
        style={{
          borderColor: `${themeColor}99`,
          boxShadow: `0 0 30px ${themeColor}40`,
        }}
      >
        {/* Subtle Cyber Accents */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Quick Close Button */}
        <button
          onClick={handleManualClose}
          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white"
          title="Cerrar banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Zone Badge & Act Pill */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider border"
            style={{
              backgroundColor: `${themeColor}25`,
              borderColor: `${themeColor}60`,
              color: themeColor,
            }}
          >
            <span>{zoneInfo.icon}</span>
            <span>{zoneInfo.name}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider ${
              isBossLevel
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-amber-950/90 border-amber-400 text-amber-300'
            }`}
          >
            {isBossLevel ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : <Compass className="w-3 h-3 text-amber-400" />}
            <span>{isBossLevel ? 'DUELO DE JEFE' : `ACTO ${config.act}`}</span>
          </span>
        </div>

        {/* Level Title */}
        <h2 className="text-sm sm:text-xl font-black text-white font-heading tracking-wide uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] leading-tight">
          {config.title}
        </h2>

        {/* Subtitle */}
        <p className="text-[10px] sm:text-xs text-slate-300 font-medium max-w-md line-clamp-1">
          {config.subtitle}
        </p>

        {/* Mission Directive Banner */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 text-[9px] sm:text-[10px] font-mono font-semibold">
          <Target className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate">
            {isBossLevel
              ? 'OBJETIVO: Desactiva los 3 Nodos y Derrota al Guardián'
              : 'OBJETIVO: Recolecta Cristales y Llega al Portal'}
          </span>
        </div>

        <span className="text-[8px] text-slate-500 font-mono -mt-0.5">
          (Toca para continuar jugando)
        </span>
      </div>
    </div>
  );
};
