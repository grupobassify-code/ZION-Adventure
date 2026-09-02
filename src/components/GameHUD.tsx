import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Maximize2, ShieldAlert, Zap, Award, Shield, Diamond, Save } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameEngine } from '../game/gameEngine';
import { DAGGER_MAX_AMMO, DAGGER_RECHARGE_TIME } from '../game/constants';

interface GameHUDProps {
  engine: GameEngine;
  onTogglePause: () => void;
  onToggleFullscreen: () => void;
  onToggleAudio: () => void;
  audioActive: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  engine,
  onTogglePause,
  onToggleFullscreen,
  onToggleAudio,
  audioActive,
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
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2">
      {/* Top Main Status Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Player Status, Hearts, XP, Energy, Shield & Score */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Level & XP Capsule */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-cyan-500/40 shadow-lg">
            <div className="flex items-center gap-1 text-[11px] font-black text-cyan-300 font-mono">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>NV.{p.level}</span>
            </div>
            {/* XP Bar */}
            <div className="w-12 sm:w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60" title={`XP: ${p.xp}/${p.xpNeeded}`}>
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Hearts Container */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl border border-pink-500/30 shadow-lg shadow-pink-950/30" title={`Vidas: ${engine.lives}/${engine.maxLives}`}>
            {Array.from({ length: engine.maxLives }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
                  idx < engine.lives
                    ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                    : 'text-slate-700 fill-transparent scale-90'
                }`}
              />
            ))}
          </div>

          {/* Shield Stamina & Recharge Gauge */}
          <div 
            className={`flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-xl border shadow-lg transition-all duration-200 ${
              p.isShieldBroken
                ? 'bg-rose-950/90 border-rose-500 shadow-rose-950/50 animate-pulse'
                : p.isBlocking
                ? 'bg-cyan-950/90 border-cyan-400 shadow-cyan-500/40'
                : 'bg-slate-950/85 border-cyan-500/40'
            }`} 
            title={p.isShieldBroken ? '¡Escudo Roto! Esperando recarga...' : `Energía de Escudo: ${Math.round(p.shieldEnergy)}% (Se drena al bloquear y se recarga solo)`}
          >
            <Shield className={`w-3.5 h-3.5 ${p.isShieldBroken ? 'text-rose-400 animate-spin' : p.isBlocking ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`} />
            <div className="w-12 sm:w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
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
            <span className={`text-[9px] font-mono font-black ${p.isShieldBroken ? 'text-rose-400' : 'text-cyan-300'}`}>
              {p.isShieldBroken ? 'ROTO' : `${shieldEnergyPercent}%`}
            </span>
          </div>

          {/* SP Energy Gauge */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-500/40 shadow-lg" title={`Energía SP: ${p.energy}/${p.maxEnergy} (Especial: 70 SP)`}>
            <Zap className={`w-3.5 h-3.5 ${p.energy >= 70 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="w-10 sm:w-14 h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-900/60">
              <div
                className={`h-full transition-all duration-200 ${
                  p.energy >= 70
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300">
              {p.energy}
            </span>
          </div>

          {/* Dagger Ammo */}
          <div className="hidden xs:flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl border border-purple-500/30 shadow-lg">
            <span className="text-xs font-mono font-bold text-purple-400">🗡</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: DAGGER_MAX_AMMO }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-3.5 sm:w-2 sm:h-4 rounded-sm transition-all ${
                    idx < engine.daggers
                      ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
            {engine.daggers < DAGGER_MAX_AMMO && (
              <div className="w-6 sm:w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-0.5 border border-purple-900">
                <div
                  className="h-full bg-purple-400 transition-all duration-100"
                  style={{ width: `${rechargePercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Score & Crystals Pill */}
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-yellow-500/40 shadow-lg">
            <div className="flex items-center gap-1 text-[11px] font-mono font-black text-amber-300">
              <span>PTS</span>
              <span>{engine.stats.score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 border-l border-slate-700 pl-2">
              <Diamond className="w-3 h-3 text-cyan-400" />
              <span>{engine.stats.crystalsCollected}</span>
            </div>
          </div>
        </div>

        {/* Right: Level Badge, Device Save Indicator & Pause */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Current Level Pill / Only Up Pill */}
          {engine.isOnlyUpMode ? (
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-950/80 border border-orange-500/60 text-xs font-bold text-orange-200 shadow-md backdrop-blur-md animate-pulse"
              title="Kronos Only Up: ¡Sube sin parar!"
            >
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="font-mono text-orange-300">ONLY UP:</span>
              <span className="text-white font-mono">{engine.onlyUpAltitude}m</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-md backdrop-blur-md"
              title={`${currentLevelConfig.title} - ${currentLevelConfig.subtitle}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLevelConfig.themeColor || '#06b6d4' }} />
              <span className="font-mono text-cyan-300 hidden md:inline">ACTO {currentLevelConfig.act}:</span>
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentLevelConfig.title}</span>
            </div>
          )}

          {/* Device Auto-Save Pill */}
          <div 
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-400 shadow-md backdrop-blur-md"
            title="Progreso guardado automáticamente en este dispositivo"
          >
            <Save className="w-3 h-3 text-emerald-400" />
            <span>AUTO-SAVE</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudio}
            title={audioActive ? 'Silenciar Audio' : 'Activar Sonido y Música'}
            className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-colors shadow-md active:scale-95"
          >
            {audioActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            title="Pantalla Completa"
            className="hidden sm:flex p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-pink-400 transition-colors shadow-md active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            title="Pausa (P / ESC)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 transition-all shadow-md active:scale-95 text-xs font-bold"
          >
            <Pause className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PAUSA (P)</span>
          </button>
        </div>
      </div>

      {/* Boss Health Bar Overlay */}
      {isBossActive && (
        <div className="w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-rose-500/50 shadow-2xl shadow-rose-950/50 pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
            <div className="flex items-center gap-1.5 text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>{boss.name}</span>
            </div>
            <span className="text-slate-300 text-[10px]">
              {boss.shield ? '🛡️ ESCUDO ACTIVO (DESACTIVA LOS 3 NODOS)' : `FASE ${boss.phase} · ${boss.hp}/${boss.maxHp} HP`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-rose-900">
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
