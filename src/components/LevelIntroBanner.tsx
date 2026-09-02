import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Target, ShieldAlert } from 'lucide-react';
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
    }, 3400);

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
  const isBossLevel = config.act === 3 || (config.zone === 'desert' && config.act === 2) || (config.zone === 'krono' && config.act === 2) || config.zone === 'travel';

  return (
    <div
      onClick={() => {
        setAnimatingOut(true);
        setTimeout(() => setVisible(false), 300);
      }}
      className={`absolute inset-x-0 top-16 sm:top-20 z-40 flex justify-center pointer-events-auto cursor-pointer select-none transition-all duration-500 ease-out px-4 ${
        animatingOut
          ? 'opacity-0 -translate-y-8 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative max-w-xl w-full bg-slate-950/90 backdrop-blur-xl border-2 border-cyan-400/70 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col items-center text-center gap-2">
        {/* Animated Cyber Grid & Scanline Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

        {/* Zone Badge & Act Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/60 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm">
            <span>{zoneInfo.icon}</span>
            <span>{zoneInfo.name}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-mono font-black uppercase tracking-wider ${
              isBossLevel
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse'
                : 'bg-amber-950/80 border-amber-400/60 text-amber-300'
            }`}
          >
            {isBossLevel ? <ShieldAlert className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
            <span>{isBossLevel ? 'DUELO DE JEFE' : `ACTO ${config.act}`}</span>
          </span>
        </div>

        {/* Level Title in Retro Display Style */}
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-300 font-heading tracking-wide uppercase drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
          {config.title}
        </h2>

        {/* Subtitle & Mission Goal */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md leading-relaxed">
          {config.subtitle}
        </p>

        {/* Mission Directive Banner */}
        <div className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-[10px] sm:text-[11px] font-mono font-semibold">
          <Target className="w-3.5 h-3.5 text-rose-400" />
          <span>
            {isBossLevel
              ? 'OBJETIVO: Desactiva los 3 Nodos y Derrota al Guardián'
              : 'OBJETIVO: Recolecta Cristales, Encuentra Secretos y Llega al Portal'}
          </span>
        </div>
      </div>
    </div>
  );
};
