import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Maximize2, ShieldAlert, Zap, Award, Shield, Diamond, Save, Smartphone } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameEngine } from '../game/gameEngine';
import { DAGGER_MAX_AMMO, DAGGER_RECHARGE_TIME } from '../game/constants';

interface GameHUDProps {
  engine: GameEngine;
  onTogglePause: () => void;
  onToggleFullscreen: () => void;
  onToggleAudio: () => void;
  audioActive: boolean;
  isPortrait?: boolean;
  onToggleOrientation?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  engine,
  onTogglePause,
  onToggleFullscreen,
  onToggleAudio,
  audioActive,
  isPortrait = false,
  onToggleOrientation,
}) => {
  const boss = engine.boss;
  const isBossActive = boss && engine.arenaActive && !engine.bossDefeated;
  const rechargePercent = Math.min(100, Math.round((engine.daggerRechargeTimer / DAGGER_RECHARGE_TIME) * 100));

  const p = engine.player;
  const xpPercent = Math.min(100, Math.round((p.xp / Math.max(1, p.xpNeeded)) * 100));
  const energyPercent = Math.min(100, Math.round((p.energy / Math.max(1, p.maxEnergy)) * 100));
  const shieldEnergyPercent = Math.min(100, Math.max(0, Math.round((p.shieldEnergy / Math.max(1, p.maxShieldEnergy || 100)) * 100)));

  const currentLevelConfig = LEVEL_CONFIGS[engine.levelIndex] || LEVEL_CONFIGS[0];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-1.5 sm:p-2.5 flex flex-col gap-1 sm:gap-1.5 select-none">
      {/* Top Main Status Bar */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Player Status, Hearts, Shield, SP */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-wrap sm:flex-nowrap">
          {/* Level & XP Capsule */}
          <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-cyan-500/40 shadow-md">
            <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black text-cyan-300 font-mono">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span>NV.{p.level}</span>
            </div>
            {/* XP Bar */}
            <div className="w-8 sm:w-14 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60" title={`XP: ${p.xp}/${p.xpNeeded}`}>
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Hearts Container (Eliminated in Only Up mode as requested) */}
          {!engine.isOnlyUpMode ? (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-pink-500/30 shadow-md" title={`Vidas: ${engine.lives}/${engine.maxLives}`}>
              {Array.from({ length: engine.maxLives }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 ${
                    idx < engine.lives
                      ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                      : 'text-slate-700 fill-transparent scale-90'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-orange-950/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]" title="Modo Only Up: ¡Sin corazones! Los obstáculos te empujan y aturden.">
              <span className="text-orange-400 font-black text-[10px] sm:text-[11px] font-mono tracking-wide">▲ ONLY UP</span>
            </div>
          )}

          {/* Shield Stamina & Recharge Gauge */}
          <div 
            className={`flex items-center gap-1 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border shadow-md transition-all duration-200 ${
              p.isShieldBroken
                ? 'bg-rose-950/90 border-rose-500 animate-pulse'
                : p.isBlocking
                ? 'bg-cyan-950/90 border-cyan-400'
                : 'bg-slate-950/90 border-cyan-500/40'
            }`} 
            title={p.isShieldBroken ? '¡Escudo Roto!' : `Escudo: ${Math.round(p.shieldEnergy)}%`}
          >
            <Shield className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${p.isShieldBroken ? 'text-rose-400 animate-spin' : p.isBlocking ? 'text-cyan-300' : 'text-cyan-400'}`} />
            <div className="w-8 sm:w-14 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-100 ${
                  p.isShieldBroken
                    ? 'bg-rose-600 animate-pulse'
                    : p.shieldEnergy < 30
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-cyan-400 to-sky-300'
                }`}
                style={{ width: p.isShieldBroken ? '100%' : `${shieldEnergyPercent}%` }}
              />
            </div>
            <span className={`text-[8px] sm:text-[9px] font-mono font-black ${p.isShieldBroken ? 'text-rose-400' : 'text-cyan-300'}`}>
              {p.isShieldBroken ? '!' : `${shieldEnergyPercent}%`}
            </span>
          </div>

          {/* SP Energy Gauge */}
          <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-amber-500/40 shadow-md" title={`Energía SP: ${p.energy}/${p.maxEnergy}`}>
            <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${p.energy >= 70 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-900/60">
              <div
                className={`h-full transition-all duration-200 ${
                  p.energy >= 70
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300">
              {p.energy}
            </span>
          </div>

          {/* Dagger Ammo & Dynamic Recharge Visualizer */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/95 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-xl border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all"
            title={`Dagas Shinobi: ${engine.daggers}/${DAGGER_MAX_AMMO}${engine.daggers < DAGGER_MAX_AMMO ? ` (Recargando: ${rechargePercent}%)` : ' (Completas)'}`}
          >
            {/* Handcrafted Pixel-Art Kunai Daggers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: DAGGER_MAX_AMMO }).map((_, idx) => {
                const isFull = idx < engine.daggers;
                const isCharging = idx === engine.daggers;
                const fillPct = isFull ? 100 : isCharging ? rechargePercent : 0;
                
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center justify-center w-3 sm:w-3.5 h-6 transition-all"
                  >
                    <svg viewBox="0 0 12 24" className="w-full h-full">
                      <defs>
                        <linearGradient id={`kunaiGrad-${idx}`} x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#7e22ce" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="85%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                        <clipPath id={`bladeClip-${idx}`}>
                          <rect x="0" y={14 - (14 * fillPct) / 100} width="12" height="14" />
                        </clipPath>
                      </defs>

                      {/* Pommel Ring */}
                      <circle
                        cx="6"
                        cy="21.5"
                        r="2"
                        fill="none"
                        stroke={isFull ? '#eab308' : isCharging ? '#c084fc' : '#475569'}
                        strokeWidth="1.2"
                      />
                      {/* Handle Grip */}
                      <rect
                        x="5"
                        y="15"
                        width="2"
                        height="5"
                        fill={isFull ? '#3b0764' : isCharging ? '#1e1b4b' : '#1e293b'}
                      />
                      {/* Grip Ties */}
                      <line x1="4.5" y1="16.5" x2="7.5" y2="16.5" stroke={isFull ? '#c084fc' : '#475569'} strokeWidth="0.8" />
                      <line x1="4.5" y1="18.5" x2="7.5" y2="18.5" stroke={isFull ? '#c084fc' : '#475569'} strokeWidth="0.8" />
                      {/* Guard */}
                      <rect
                        x="3"
                        y="14"
                        width="6"
                        height="1.5"
                        rx="0.5"
                        fill={isFull ? '#facc15' : isCharging ? '#a855f7' : '#334155'}
                      />

                      {/* Empty Blade Outline Slot */}
                      <polygon
                        points="6,1 11,14 1,14"
                        fill={isFull || isCharging ? '#2e1065' : '#090d16'}
                        stroke={isFull ? '#a855f7' : isCharging ? '#6b21a8' : '#334155'}
                        strokeWidth="1"
                      />

                      {/* Active Plasma Blade Fill */}
                      {(isFull || isCharging) && (
                        <g clipPath={`url(#bladeClip-${idx})`}>
                          <polygon points="6,1 11,14 1,14" fill={`url(#kunaiGrad-${idx})`} />
                          {/* Center Spine Ridge Highlight */}
                          <line x1="6" y1="1" x2="6" y2="14" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.8" />
                        </g>
                      )}

                      {/* Recharge Line Particle Spark */}
                      {isCharging && rechargePercent > 5 && (
                        <circle
                          cx="6"
                          cy={14 - (14 * fillPct) / 100}
                          r="1.2"
                          fill="#38bdf8"
                        />
                      )}
                    </svg>

                    {/* Subtle Neon Under-Glow when ready */}
                    {isFull && (
                      <div className="absolute inset-0 bg-purple-500/20 blur-[3px] rounded-full pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recharge Progress Bar & Real-time Percentage */}
            {engine.daggers < DAGGER_MAX_AMMO ? (
              <div className="flex items-center gap-1.5 pl-0.5">
                <div className="w-10 sm:w-14 h-2 bg-slate-900/90 rounded-full overflow-hidden border border-purple-800/80 p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-cyan-300 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(168,85,247,0.7)]"
                    style={{ width: `${rechargePercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono font-black text-fuchsia-300 min-w-[26px] text-right">
                  {rechargePercent}%
                </span>
              </div>
            ) : (
              <span className="text-[9px] font-mono font-black text-emerald-400 tracking-wider pl-0.5 animate-pulse">
                MAX
              </span>
            )}
          </div>
        </div>

        {/* Right: Score, Crystals, Audio, Orientation, Pause */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
          {/* Score & Crystals Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-xl border border-yellow-500/40 shadow-md">
            <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-mono font-black text-amber-300">
              <span className="hidden xs:inline">PTS</span>
              <span>{engine.stats.score.toLocaleString()}</span>
            </div>
            <div 
              className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] font-mono font-bold border-l border-slate-700 pl-1.5 sm:pl-2 transition-all ${
                engine.stats.totalCrystals > 0 && engine.stats.crystalsCollected >= engine.stats.totalCrystals
                  ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                  : 'text-cyan-300'
              }`}
              title={`Cristales: ${engine.stats.crystalsCollected}/${engine.stats.totalCrystals || '?'}`}
            >
              <Diamond className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${engine.stats.totalCrystals > 0 && engine.stats.crystalsCollected >= engine.stats.totalCrystals ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`} />
              <span>
                {engine.stats.crystalsCollected}
                {engine.stats.totalCrystals > 0 && !engine.isOnlyUpMode ? `/${engine.stats.totalCrystals}` : ''}
              </span>
            </div>
          </div>

          {/* Current Level Pill / Special Stage / Only Up (hidden on tiny screens, shown in row 2 on mobile) */}
          <div className="hidden lg:flex items-center">
            {engine.isInSpecialStage ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-500/70 text-xs font-bold text-purple-200 shadow-md backdrop-blur-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span className="font-mono text-purple-300 text-[10px]">SPECIAL STAGE</span>
              </div>
            ) : engine.isOnlyUpMode ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-950/80 border border-orange-500/60 text-xs font-bold text-orange-200 shadow-md backdrop-blur-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="font-mono text-orange-300 text-[10px]">ONLY UP: {engine.onlyUpAltitude}m</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-md backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentLevelConfig.themeColor || '#06b6d4' }} />
                <span className="truncate max-w-[120px] text-[11px]">{currentLevelConfig.title}</span>
              </div>
            )}
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudio}
            title={audioActive ? 'Silenciar Audio' : 'Activar Sonido y Música'}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            {audioActive ? <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" /> : <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />}
          </button>

          {/* Orientation / Fullscreen */}
          <button
            onClick={onToggleOrientation || onToggleFullscreen}
            title={isPortrait ? 'Cambiar a horizontal' : 'Pantalla Completa'}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            {isPortrait ? (
              <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 rotate-90" />
            ) : (
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            title="Pausa (P / ESC)"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 transition-all shadow-md active:scale-95 text-[10px] sm:text-xs font-bold cursor-pointer"
          >
            <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">PAUSA</span>
          </button>
        </div>
      </div>

      {/* Row 2 (Mobile Level Sub-bar / Mode indicator) */}
      <div className="flex lg:hidden items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono px-1">
        {engine.isInSpecialStage ? (
          <span className="text-purple-300 font-bold animate-pulse">✦ SPECIAL STAGE: DIMENSIÓN CUÁNTICA</span>
        ) : engine.isOnlyUpMode ? (
          <span className="text-orange-400 font-bold">▲ ONLY UP: {engine.onlyUpAltitude}m</span>
        ) : (
          <span className="text-slate-400 truncate max-w-[220px]">
            {currentLevelConfig.title} · Acto {currentLevelConfig.act}
          </span>
        )}
      </div>

      {/* Boss Health Bar Overlay */}
      {isBossActive && (
        <div className="w-full max-w-sm sm:max-w-md mx-auto bg-slate-950/95 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-2xl border border-rose-500/50 shadow-2xl pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono font-bold mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1 text-rose-400 truncate max-w-[60%]">
              <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse shrink-0" />
              <span className="truncate">{boss.name}</span>
            </div>
            <span className="text-slate-300 text-[9px] sm:text-[10px] shrink-0">
              {boss.shield ? '🛡️ ESCUDO ACTIVO (3 NODOS)' : `FASE ${boss.phase} · ${boss.hp}/${boss.maxHp} HP`}
            </span>
          </div>
          <div className="w-full h-2 sm:h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-rose-900">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                boss.shield
                  ? 'bg-cyan-400 animate-pulse'
                  : boss.phase === 3
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600'
                  : boss.phase === 2
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                  : 'bg-rose-500'
              }`}
              style={{
                width: boss.shield ? '100%' : `${(boss.hp / boss.maxHp) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
