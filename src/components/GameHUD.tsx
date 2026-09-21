import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Maximize2, ShieldAlert, Zap, Award, Shield, Diamond, Smartphone, Ghost, Swords, Timer, Trophy } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameEngine } from '../game/gameEngine';
import { formatTimeMs } from '../game/timeAttackGhost';

interface GameHUDProps {
  engine: GameEngine;
  onTogglePause: () => void;
  onToggleFullscreen: () => void;
  onToggleAudio: () => void;
  audioActive: boolean;
  isPortrait?: boolean;
  onToggleOrientation?: () => void;
  onOpenAchievements?: () => void;
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

  // Real-time animation ticker for Contrarreloj (Time Attack) so the stopwatch updates smoothly every frame
  const [, setHudTick] = React.useState(0);

  React.useEffect(() => {
    if (!engine.isTimeAttackMode && !engine.isVsAiMode) return;
    let animId: number;
    let lastTime = 0;
    const tick = (now: number) => {
      // 30 FPS update interval gives ultra-smooth centisecond precision with zero lag
      if (now - lastTime >= 33) {
        lastTime = now;
        setHudTick((t) => (t + 1) % 100000);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [engine.isTimeAttackMode, engine.isVsAiMode]);

  // Live calculated Time Attack elapsed milliseconds (guarantees continuous display, even on respawn)
  const liveTimeAttackMs = engine.timeAttackResult
    ? engine.timeAttackResult.finalTimeMs
    : engine.timeAttackStartTime > 0 && !engine.isCountdownActive
    ? Math.max(0, performance.now() - engine.timeAttackStartTime)
    : engine.timeAttackCurrentMs;

  const p = engine.player;
  const xpPercent = Math.min(100, Math.round((p.xp / Math.max(1, p.xpNeeded)) * 100));
  const energyPercent = Math.min(100, Math.round((p.energy / Math.max(1, p.maxEnergy)) * 100));
  const shieldEnergyPercent = Math.min(100, Math.max(0, Math.round((p.shieldEnergy / Math.max(1, p.maxShieldEnergy || 100)) * 100)));

  const currentLevelConfig = LEVEL_CONFIGS[engine.levelIndex] || LEVEL_CONFIGS[0];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-1 sm:p-2 flex flex-col gap-1 select-none">
      {/* Top Main Status Bar */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Player Status, Hearts, Shield, SP (Clean & minimal) */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-nowrap">
          {/* Level & XP Capsule */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-cyan-500/40 shadow-sm">
            <div className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-black text-cyan-300 font-mono">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span>NV.{p.level}</span>
            </div>
            {/* XP Bar (shown on medium screens and up) */}
            <div className="hidden sm:block w-10 sm:w-14 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60" title={`XP: ${p.xp}/${p.xpNeeded}`}>
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Hearts Container / Skiing Immunity Badge */}
          {p.isSkiing ? (
            <div className="flex items-center gap-1 bg-sky-950/90 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-sky-400/60 shadow-sm" title="Blizzard Rush: ¡Inmune al daño!">
              <span className="text-sky-300 font-black text-[9px] sm:text-[11px] font-mono tracking-wider flex items-center gap-1">
                🎿 <span>DESCENSO</span>
              </span>
            </div>
          ) : !engine.isOnlyUpMode ? (
            <div className="flex items-center gap-0.5 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border border-pink-500/30 shadow-sm" title={`Vidas: ${engine.lives}/${engine.maxLives}`}>
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
            <div className="flex items-center gap-1 bg-orange-950/90 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border border-orange-500/50 shadow-sm">
              <span className="text-orange-400 font-black text-[9px] sm:text-[11px] font-mono tracking-wide">▲ ONLY UP</span>
            </div>
          )}

          {/* Shield Stamina & Recharge Gauge */}
          <div 
            className={`flex items-center gap-1 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border shadow-sm transition-all duration-200 ${
              p.isShieldBroken
                ? 'bg-rose-950/90 border-rose-500 animate-pulse'
                : p.isBlocking
                ? 'bg-cyan-950/90 border-cyan-400'
                : 'bg-slate-950/85 border-cyan-500/40'
            }`} 
            title={p.isShieldBroken ? '¡Escudo Roto!' : `Escudo: ${Math.round(p.shieldEnergy)}%`}
          >
            <Shield className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${p.isShieldBroken ? 'text-rose-400 animate-spin' : p.isBlocking ? 'text-cyan-300' : 'text-cyan-400'}`} />
            <div className="w-7 sm:w-12 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
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
          </div>

          {/* SP Energy Gauge */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border border-amber-500/40 shadow-sm" title={`Energía SP: ${p.energy}/${p.maxEnergy}`}>
            <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${p.energy >= 70 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="w-7 sm:w-10 h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-900/60">
              <div
                className={`h-full transition-all duration-200 ${
                  p.energy >= 70
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Score, Crystals, Audio, Orientation, Pause */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-nowrap">
          {/* Score & Crystals Pill */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border border-yellow-500/40 shadow-sm">
            <div className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-mono font-black text-amber-300">
              <span>{engine.stats.score.toLocaleString()}</span>
            </div>
            <div 
              className={`flex items-center gap-0.5 text-[8px] sm:text-[10px] font-mono font-bold border-l border-slate-700 pl-1 sm:pl-1.5 transition-all ${
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

          {/* Current Level Pill (shown on larger screens) */}
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
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            {audioActive ? <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" /> : <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />}
          </button>

          {/* Orientation / Fullscreen */}
          <button
            onClick={onToggleOrientation || onToggleFullscreen}
            title={isPortrait ? 'Cambiar a horizontal' : 'Pantalla Completa'}
            className="p-1 sm:p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-colors shadow-sm active:scale-95 cursor-pointer"
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
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 transition-all shadow-sm active:scale-95 text-[10px] sm:text-xs font-bold cursor-pointer"
          >
            <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">PAUSA</span>
          </button>
        </div>
      </div>

      {/* VS IA Duel Header Bar - Strictly in VS AI mode only, ultra-compact on mobile */}
      {engine.isVsAiMode && !engine.isOnlyUpMode && !engine.isTimeAttackMode && engine.aiRunner && (
        <div className="w-auto max-w-[220px] sm:max-w-md mx-auto bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-500/40 shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between text-[8px] sm:text-xs font-mono mb-0.5">
            <div className="flex items-center gap-1 text-cyan-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Tú ({Math.min(100, Math.round((engine.player.x / Math.max(1, engine.goal.x)) * 100))}%)</span>
            </div>
            <div className="flex items-center gap-0.5 text-[7px] sm:text-[9px] font-mono font-black text-amber-300 px-1 py-0.2 rounded-full bg-slate-900 border border-amber-500/30">
              <Swords className="w-2 h-2 text-amber-400" />
              <span>{engine.player.x >= engine.aiRunner.x ? '1º' : '2º'}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-300 font-bold">
              <span className="truncate max-w-[60px] sm:max-w-none">{engine.aiRunner.name}</span>
              <span>({Math.min(100, Math.round((engine.aiRunner.x / Math.max(1, engine.goal.x)) * 100))}%)</span>
            </div>
          </div>
          {/* Dual Progress Track */}
          <div className="relative w-full h-1 sm:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            {/* Player bar */}
            <div
              className="absolute left-0 top-0 h-0.5 sm:h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-100"
              style={{ width: `${Math.min(100, (engine.player.x / Math.max(1, engine.goal.x)) * 100)}%` }}
            />
            {/* AI bar */}
            <div
              className="absolute left-0 bottom-0 h-0.5 sm:h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100"
              style={{ width: `${Math.min(100, (engine.aiRunner.x / Math.max(1, engine.goal.x)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Contrarreloj (Time Attack) Header Bar - Ultra-compact minimal pill on mobile */}
      {engine.isTimeAttackMode && !engine.isVsAiMode && !engine.isOnlyUpMode && (
        <div className="w-auto max-w-[190px] sm:max-w-xs mx-auto bg-slate-950/85 backdrop-blur-sm px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-amber-500/40 shadow-lg pointer-events-auto flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[11px] sm:text-sm font-black text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">
              {formatTimeMs(liveTimeAttackMs)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] sm:text-xs">
            <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-200">
              {engine.timeAttackBestMs !== null ? formatTimeMs(engine.timeAttackBestMs) : '--:--'}
            </span>
            {engine.timeAttackGhostFrames.length > 0 && (
              <Ghost className="w-2.5 h-2.5 text-cyan-300 ml-0.5" />
            )}
          </div>
        </div>
      )}

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
