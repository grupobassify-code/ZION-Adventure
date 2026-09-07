import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, ShieldAlert, Cpu, Lightbulb } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';

interface ScreenTransitionProps {
  isActive: boolean;
  levelIndex?: number;
  zoneColor?: string;
  onComplete?: () => void;
}

const NINJA_TIPS = [
  'Pulsa Saltar en el aire para realizar un Doble Salto ágil.',
  'Mantén el botón de Escudo para bloquear proyectiles y láseres.',
  'Los kunais energéticos rebotan y penetran enemigos débiles.',
  'Elimina enemigos en racha para recargar tu barra de SP.',
  'Si pierdes tus 3 corazones, reaparecerás en el último checkpoint seguro.',
  'Destruye los 3 Nodos energéticos para desactivar el escudo de los jefes.',
  'Encuentra los 3 cristales de cada nivel para desbloquear la Special Stage.',
];

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  isActive,
  levelIndex = 0,
  zoneColor = '#06b6d4',
  onComplete,
}) => {
  const [phase, setPhase] = useState<'idle' | 'closing' | 'opening'>('idle');
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const config = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const isBossLevel =
    config.act === 3 ||
    (config.zone === 'desert' && config.act === 2) ||
    (config.zone === 'krono' && config.act === 2) ||
    config.zone === 'travel';

  useEffect(() => {
    if (isActive) {
      setPhase('closing');
      setProgress(15);
      setTipIndex(Math.floor(Math.random() * NINJA_TIPS.length));

      const pTimer1 = setTimeout(() => setProgress(55), 250);
      const pTimer2 = setTimeout(() => setProgress(88), 450);
      const pTimer3 = setTimeout(() => setProgress(100), 650);

      const timer1 = setTimeout(() => {
        setPhase('opening');
      }, 750);

      const timer2 = setTimeout(() => {
        setPhase('idle');
        setProgress(0);
        if (onComplete) onComplete();
      }, 1300);

      return () => {
        clearTimeout(pTimer1);
        clearTimeout(pTimer2);
        clearTimeout(pTimer3);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setPhase('idle');
      setProgress(0);
    }
  }, [isActive, onComplete]);

  if (phase === 'idle') return null;

  const barCount = 10;
  const isClosing = phase === 'closing';

  const zoneNames: Record<string, { name: string; icon: string }> = {
    neon: { name: 'BOSQUE NEÓN', icon: '⚡' },
    sakura: { name: 'BOSQUE DE CEREZO', icon: '🌸' },
    lavacliff: { name: 'ACANTILADO DE LAVA', icon: '🌋' },
    desert: { name: 'SANTUARIO DEL DESIERTO', icon: '🏛️' },
    krono: { name: 'KRONO CITY METRÓPOLIS', icon: '🏙️' },
    travel: { name: 'DIMENSIÓN KRONOS TRAVEL', icon: '🌌' },
  };

  const zoneInfo = zoneNames[config.zone] || { name: config.zone.toUpperCase(), icon: '⚔️' };

  const getStatusText = () => {
    if (progress < 40) return 'SINCRONIZANDO BIOMA CUÁNTICO...';
    if (progress < 85) return 'CARGANDO TERRENO & HAZARDS...';
    if (progress < 100) return 'CALIBRANDO SISTEMAS DE COMBATE...';
    return '¡SISTEMA LISTO! DESPLEGANDO A ZION';
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
      {/* Pixelated Horizontal Curtain Blinds */}
      {Array.from({ length: barCount }).map((_, idx) => {
        const delay = idx * 20;

        return (
          <div
            key={idx}
            className="flex-1 w-full relative transition-transform duration-300 ease-in-out"
            style={{
              backgroundColor: '#030612',
              borderBottom: `1px solid ${zoneColor}33`,
              transform: isClosing ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: idx % 2 === 0 ? 'left' : 'right',
              transitionDelay: `${delay}ms`,
            }}
          >
            <div
              className="absolute inset-y-0 w-12"
              style={{
                [idx % 2 === 0 ? 'right' : 'left']: 0,
                background: `linear-gradient(to ${idx % 2 === 0 ? 'left' : 'right'}, ${zoneColor}66, transparent)`,
              }}
            />
          </div>
        );
      })}

      {/* Center Cyber Loading Screen Overlay — Fits Mobile in Portrait & Landscape */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${
          isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div
          className="relative w-full max-w-sm sm:max-w-md bg-slate-950/95 border-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 sm:gap-3 text-center overflow-hidden max-h-[92vh]"
          style={{
            borderColor: `${zoneColor}80`,
            boxShadow: `0 0 35px ${zoneColor}33`,
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: zoneColor }}
          />

          {/* Top Badges: Zone & Mission Status */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase border"
              style={{
                backgroundColor: `${zoneColor}20`,
                borderColor: `${zoneColor}50`,
                color: zoneColor,
              }}
            >
              <span>{zoneInfo.icon}</span>
              <span>{zoneInfo.name}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider border ${
                isBossLevel
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'
                  : 'bg-amber-950/90 border-amber-400 text-amber-300'
              }`}
            >
              {isBossLevel ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : <Compass className="w-3 h-3 text-amber-400" />}
              <span>{isBossLevel ? 'DUELO DE JEFE' : `ACTO ${config.act}`}</span>
            </span>
          </div>

          {/* Level Main Title */}
          <div>
            <h2 className="text-base sm:text-xl font-black text-white font-heading tracking-wide uppercase leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              {config.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 line-clamp-2">
              {config.subtitle}
            </p>
          </div>

          {/* Animated Cyber Loading Bar */}
          <div className="w-full flex flex-col gap-1 bg-slate-900/80 p-2 sm:p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-1 text-slate-300 font-bold">
                <Cpu className="w-3 h-3 text-cyan-400 animate-spin" />
                {getStatusText()}
              </span>
              <span className="text-cyan-400 font-black">{progress}%</span>
            </div>

            <div className="w-full h-2 sm:h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full transition-all duration-200 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: zoneColor,
                  boxShadow: `0 0 10px ${zoneColor}`,
                }}
              />
            </div>
          </div>

          {/* Tactical Hint (Consejo Ninja) */}
          <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-left">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono leading-tight">
              {NINJA_TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
