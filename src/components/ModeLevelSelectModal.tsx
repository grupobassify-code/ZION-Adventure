import React, { useState } from 'react';
import {
  X,
  Play,
  Bot,
  Timer,
  Trophy,
  Lock,
  AlertTriangle,
  Zap,
  Ghost,
  Swords,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { SaveSlot, ZoneId } from '../types';
import { isBossLevel, isLevelUnlockedInSlot, getLevelBestTime } from '../game/saveManager';
import { formatTimeMs, loadGhostRecording } from '../game/timeAttackGhost';
import { sound } from '../audio/soundEngine';

const ZONES: { id: ZoneId; name: string }[] = [
  { id: 'neon', name: 'Bosque Neón' },
  { id: 'sakura', name: 'Cerezo Espiritual' },
  { id: 'lavacliff', name: 'Acantilados de Lava' },
  { id: 'desert', name: 'Dunas de Arena' },
  { id: 'krono', name: 'Templo de Kronos' },
];

const ZONE_NAMES: Record<ZoneId, string> = {
  neon: 'Bosque Neón',
  sakura: 'Cerezo Espiritual',
  lavacliff: 'Acantilados de Lava',
  desert: 'Dunas de Arena',
  krono: 'Templo de Kronos',
  travel: 'Viaje Cuántico',
};

interface ModeLevelSelectModalProps {
  isOpen: boolean;
  mode: 'vs_ai' | 'time_attack';
  activeSlot: SaveSlot | null;
  onClose: () => void;
  onStartLevel: (levelIndex: number, aiDifficulty?: string) => void;
}

export const ModeLevelSelectModal: React.FC<ModeLevelSelectModalProps> = ({
  isOpen,
  mode,
  activeSlot,
  onClose,
  onStartLevel,
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneId>('neon');
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);
  const [aiDifficulty, setAiDifficulty] = useState<'normal' | 'fast' | 'expert'>('normal');

  if (!isOpen) return null;

  const isVsAi = mode === 'vs_ai';

  // Filter levels for the selected zone
  const zoneLevels = LEVEL_CONFIGS.map((cfg, index) => ({ cfg, index })).filter(
    (item) => item.cfg.zone === selectedZone
  );

  const currentCfg = LEVEL_CONFIGS[selectedLevelIndex] || LEVEL_CONFIGS[0];
  const isSelectedLevelBoss = isBossLevel(selectedLevelIndex);
  const isSelectedUnlocked = activeSlot ? isLevelUnlockedInSlot(activeSlot, selectedLevelIndex) : selectedLevelIndex === 0;
  const canLaunchSelected = isSelectedUnlocked && !isSelectedLevelBoss;

  // Best time for currently selected level in Time Attack
  const currentBestMs = activeSlot ? getLevelBestTime(activeSlot.id, selectedLevelIndex) : null;
  const currentHasGhost = activeSlot ? !!loadGhostRecording(activeSlot.id, selectedLevelIndex) : false;

  const handleLevelClick = (index: number) => {
    sound.playSfx('menuSelect');
    setSelectedLevelIndex(index);
  };

  const handleStart = () => {
    if (!canLaunchSelected) return;
    sound.playSfx('click');
    onStartLevel(selectedLevelIndex, aiDifficulty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-6 border-b flex items-center justify-between ${
            isVsAi
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-amber-500/30 bg-amber-950/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-lg border ${
                isVsAi
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-emerald-900/40'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-amber-900/40'
              }`}
            >
              {isVsAi ? <Bot className="w-6 h-6 sm:w-7 sm:h-7" /> : <Timer className="w-6 h-6 sm:w-7 sm:h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isVsAi
                      ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-900/60 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {isVsAi ? 'Carrera 1v1 vs Algoritmo' : 'Contrarreloj & Fantasma'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (Sin niveles con jefe)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                {isVsAi ? 'SELECCIONA PISTA VS IA' : 'SELECCIONA CIRCUITO CONTRARRELOJ'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playSfx('menuBack');
              onClose();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Zone Tabs & Level List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Zone Selector Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {ZONES.map((z) => {
                const isSelected = selectedZone === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => {
                      sound.playSfx('menuSelect');
                      setSelectedZone(z.id);
                      // Auto-select first non-boss level of this zone
                      const firstInZone = LEVEL_CONFIGS.findIndex((c) => c.zone === z.id && !['neon-3', 'sakura-3', 'lavacliff-3', 'desert-3', 'krono-3'].includes(c.id));
                      if (firstInZone !== -1) setSelectedLevelIndex(firstInZone);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{z.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Levels in selected zone */}
            <div className="flex flex-col gap-2.5">
              {zoneLevels.map(({ cfg, index }) => {
                const isBoss = isBossLevel(index);
                const isUnlocked = activeSlot ? isLevelUnlockedInSlot(activeSlot, index) : index === 0;
                const isSelected = selectedLevelIndex === index;
                const bestMs = activeSlot ? getLevelBestTime(activeSlot.id, index) : null;

                return (
                  <div
                    key={cfg.id}
                    onClick={() => {
                      if (!isBoss && isUnlocked) handleLevelClick(index);
                    }}
                    className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isBoss
                        ? 'bg-slate-950/60 border-rose-900/30 opacity-60 cursor-not-allowed'
                        : !isUnlocked
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? isVsAi
                          ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/40 cursor-pointer'
                          : 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/20 shadow-lg shadow-amber-950/40 cursor-pointer'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm border ${
                          isBoss
                            ? 'bg-rose-950/50 border-rose-800/50 text-rose-400'
                            : !isUnlocked
                            ? 'bg-slate-900 border-slate-800 text-slate-500'
                            : isSelected
                            ? isVsAi
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {isBoss ? '⚠️' : !isUnlocked ? <Lock className="w-4 h-4" /> : `A${cfg.act}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-bold text-sm text-white">{cfg.title}</h4>
                          {isBoss && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300">
                              Nivel con Jefe
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isBoss
                            ? 'No disponible en este modo (sin jefes)'
                            : !isUnlocked
                            ? 'Bloqueado. Desbloquea en Modo Aventura'
                            : cfg.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right side info: Best time or Status */}
                    {!isBoss && isUnlocked && (
                      <div className="flex items-center gap-2">
                        {!isVsAi && (
                          <div className="text-right font-mono">
                            <span className="text-[10px] text-slate-400 block">Mejor tiempo</span>
                            <span className="text-xs font-black text-amber-300">
                              {bestMs !== null ? formatTimeMs(bestMs) : '--:--.--'}
                            </span>
                          </div>
                        )}
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isSelected
                              ? isVsAi
                                ? 'text-emerald-400 translate-x-1'
                                : 'text-amber-400 translate-x-1'
                              : 'text-slate-600'
                          } transition-transform`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Level Preview & Configuration */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-400">Detalles de la Pista</span>
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${currentCfg.themeColor}25`,
                    color: currentCfg.themeColor,
                    borderColor: `${currentCfg.themeColor}50`,
                  }}
                >
                  {ZONE_NAMES[currentCfg.zone] || currentCfg.zone}
                </span>
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3 className="text-lg font-mono font-black text-white">{currentCfg.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{currentCfg.subtitle}</p>
              </div>

              {/* Boss warning if boss level */}
              {isSelectedLevelBoss && (
                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>
                    <strong>Restricción del Modo:</strong> Los niveles con jefe no se pueden jugar en VS IA ni Contrarreloj. Selecciona un Acto 1 o 2.
                  </span>
                </div>
              )}

              {/* Mode-Specific Controls */}
              {isVsAi && !isSelectedLevelBoss && (
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Dificultad del Rival IA:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', name: 'Krono-Bot Alfa', badge: 'Normal', color: 'emerald' },
                      { id: 'fast', name: 'Cyber-Specter Ω', badge: 'Rápido', color: 'amber' },
                      { id: 'expert', name: 'Titan Prime', badge: 'Experto', color: 'rose' },
                    ].map((diff) => {
                      const isDiffSelected = aiDifficulty === diff.id;
                      return (
                        <button
                          key={diff.id}
                          onClick={() => {
                            sound.playSfx('menuSelect');
                            setAiDifficulty(diff.id as any);
                          }}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isDiffSelected
                              ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40 shadow-md'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[11px] font-mono font-bold block">{diff.badge}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{diff.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    🤖 La IA navegará plataformas, saltará obstáculos y correrá hacia la meta en tiempo real.
                  </p>
                </div>
              )}

              {!isVsAi && !isSelectedLevelBoss && (
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-3">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-mono text-slate-300">Récord Personal:</span>
                    </div>
                    <span className="text-sm font-mono font-black text-amber-300">
                      {currentBestMs !== null ? formatTimeMs(currentBestMs) : 'Sin récord aún'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ghost className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-slate-300">Fantasma en Pista:</span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        currentHasGhost ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      {currentHasGhost ? '✓ Activo para Carrera' : 'No grabado aún'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Launch Button */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={handleStart}
                disabled={!canLaunchSelected}
                className={`w-full py-3.5 px-5 rounded-2xl font-mono font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  !canLaunchSelected
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : isVsAi
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/60 hover:scale-[1.02] cursor-pointer'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/60 hover:scale-[1.02] cursor-pointer'
                }`}
              >
                {isVsAi ? (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>¡COMENZAR CARRERA VS IA!</span>
                  </>
                ) : (
                  <>
                    <Timer className="w-4 h-4" />
                    <span>¡INICIAR CONTRARRELOJ!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
