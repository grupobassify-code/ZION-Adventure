import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Shield,
  ShieldAlert,
  Swords,
  Timer,
  Gem,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  Info,
  X,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Compass,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import {
  MALLA_ZONES,
  TEMPORAL_ISLAND_MAP_IMG,
  KRONOS_CENTRAL_CLOCK_IMG,
  TEMPORAL_STORM_FOG_IMG,
} from '../game/mallaTemporalData';
import {
  SaveSlot,
  ZoneId,
  MallaMission,
  MallaZoneInfo,
} from '../types';
import {
  getMallaProgress,
  isMallaZoneRescued,
  isMallaZoneUnlocked,
  chooseStartingMallaZone,
  unlockMallaZone,
  getRescuedZonesCount,
  getMallaCompletedMissionsCount,
  toggleAllMallaZonesForTesting,
} from '../game/saveManager';
import { sound } from '../audio/soundEngine';
import { useLanguage, getZoneLocalizedName } from '../utils/i18n';

interface MallaTemporalModalProps {
  slot: SaveSlot | null;
  initialZoneId?: ZoneId;
  onClose: () => void;
  onStartMission: (mission: MallaMission) => void;
  audioActive: boolean;
  onToggleAudio: () => void;
}

export const MallaTemporalModal: React.FC<MallaTemporalModalProps> = ({
  slot,
  initialZoneId,
  onClose,
  onStartMission,
  audioActive,
  onToggleAudio,
}) => {
  const { language, t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<MallaZoneInfo | null>(() => {
    if (initialZoneId) {
      return MALLA_ZONES.find((z) => z.id === initialZoneId) || null;
    }
    return null;
  });
  const [showCenterInfo, setShowCenterInfo] = useState<boolean>(false);
  const [showVictoryCelebration, setShowVictoryCelebration] = useState<boolean>(false);
  const [showLorePrologue, setShowLorePrologue] = useState<boolean>(() => {
    try {
      const key = `zion_malla_lore_prologue_${slot?.id ?? 0}`;
      return !localStorage.getItem(key);
    } catch {
      return true;
    }
  });
  const [normalLockToast, setNormalLockToast] = useState<string | null>(null);
  const [, setForceUpdate] = useState<number>(0);

  const handleDismissPrologue = () => {
    sound.playSfx('checkpoint');
    try {
      const key = `zion_malla_lore_prologue_${slot?.id ?? 0}`;
      localStorage.setItem(key, 'true');
    } catch {}
    setShowLorePrologue(false);
  };

  // Fresh progress calculated from the active save slot
  const progress = getMallaProgress(slot);
  const rescuedCount = getRescuedZonesCount(slot);
  const totalCompletedMissions = getMallaCompletedMissionsCount(slot);
  const isIslandRescued = rescuedCount >= MALLA_ZONES.length;

  const hasChosenStartingZone = Boolean(
    progress.chosenStartingZone || (progress.unlockedZoneIds && progress.unlockedZoneIds.length > 0)
  );

  const handleSelectZone = (zone: MallaZoneInfo) => {
    sound.playSfx('menuSelect');
    setSelectedZone(zone);
    setShowCenterInfo(false);
  };

  const handleChooseAsStartingZone = (zoneId: ZoneId) => {
    if (!slot) return;
    sound.playSfx('special');
    chooseStartingMallaZone(slot.id, zoneId);
    setForceUpdate((prev) => prev + 1);
  };

  const handleUnlockZone = (zoneId: ZoneId) => {
    if (!slot) return;
    sound.playSfx('powerup');
    unlockMallaZone(slot.id, zoneId);
    setForceUpdate((prev) => prev + 1);
  };

  const handleToggleTestRescue = () => {
    if (!slot) return;
    const shouldRescue = rescuedCount < MALLA_ZONES.length;
    toggleAllMallaZonesForTesting(slot.id, shouldRescue);
    setForceUpdate((prev) => prev + 1);
    sound.playSfx('special');
    if (shouldRescue) {
      setShowVictoryCelebration(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none animate-in fade-in duration-300">
      {/* TOP HEADER: MODO HISTORIA — LA MALLA TEMPORAL */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-slate-900/90 backdrop-blur-md border-b border-purple-500/40 shadow-xl shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-300" />
            <span>{t('back')}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {language === 'es' ? 'MODO HISTORIA · ISLA CUÁNTICA' : 'STORY MODE · QUANTUM ISLAND'}
              </span>
              <h1 className="text-base sm:text-xl font-black text-white font-heading tracking-wide">
                {language === 'es' ? 'LA MALLA TEMPORAL' : 'THE TEMPORAL MESH'}
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-purple-200/80 hidden xs:block">
              {language === 'es'
                ? 'Completa estas misiones para rescatar el universo de Zion y rastrear su señal de auxilio'
                : 'Complete these trials to rescue Zion’s universe and track down his distress signal'}
            </p>
          </div>
        </div>

        {/* Global Stats Capsule */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rescue Progress Meter */}
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 shadow-inner">
            <Trophy className={`w-4 h-4 ${isIslandRescued ? 'text-amber-400 animate-bounce' : 'text-amber-400'}`} />
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                {language === 'es' ? 'REINOS RESCATADOS' : 'REALMS RESCUED'}
              </div>
              <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                {rescuedCount}/{MALLA_ZONES.length}
                <span className="text-slate-500 text-[10px] ml-1">({totalCompletedMissions}/36)</span>
              </div>
            </div>
          </div>

          {/* Distress Signal Lore Re-open Button */}
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setShowLorePrologue(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md"
            title={language === 'es' ? 'Ver transmisión y lore' : 'View transmission & lore'}
          >
            <Radio className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden sm:inline">{language === 'es' ? 'Señal de Auxilio' : 'Distress Beacon'}</span>
          </button>

          {/* Quick Demo Test Action */}
          <button
            onClick={handleToggleTestRescue}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
            title="Botón de prueba rápida para desarrollador / jurado"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{rescuedCount >= MALLA_ZONES.length ? (language === 'es' ? 'Reiniciar Tormenta' : 'Reset Storm') : (language === 'es' ? 'Despejar Nubes (Demo)' : 'Clear Clouds (Demo)')}</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            {audioActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* CALLOUT: FIRST ZONE SELECTION PROMPT */}
      {!hasChosenStartingZone && (
        <div className="relative z-20 bg-gradient-to-r from-purple-950/95 via-indigo-900/95 to-purple-950/95 border-b border-purple-500/40 px-4 py-2 text-center flex items-center justify-center gap-2 shadow-lg">
          <Compass className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-amber-200">
            {language === 'es'
              ? '🎯 ¡Elige cualquier reino del mapa como tu primera zona a desbloquear!'
              : '🎯 Choose any realm on the map as your first zone to unlock!'}
          </span>
        </div>
      )}

      {/* MAIN BODY: INTERACTIVE FORTNITE-STYLE ISLAND MAP */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-slate-950">
        {/* Radar scan grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f70a_1px,transparent_1px),linear-gradient(to_bottom,#a855f70a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* The Island Map Container */}
        <div className="relative w-full max-w-5xl aspect-[16/9] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/30">
          {/* Island Map Generated Image */}
          <img
            src={TEMPORAL_ISLAND_MAP_IMG}
            alt="Isla de la Malla Temporal"
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Ambient Cosmic Horizon Lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

          {/* ============================================================== */}
          {/* STATIC CLOUDS (Super Smash Bros World of Light)                */}
          {/* Cubren toda su área territorial y NO giran                     */}
          {/* ============================================================== */}
          {MALLA_ZONES.map((zone) => {
            const isRescued = isMallaZoneRescued(slot, zone.id);
            const territory = zone.territory;

            return (
              <div
                key={`cloud-${zone.id}`}
                style={{
                  left: `${territory.left}%`,
                  top: `${territory.top}%`,
                  width: `${territory.width}%`,
                  height: `${territory.height}%`,
                }}
                className={`absolute pointer-events-none transition-all duration-1000 ease-out z-10 ${
                  isRescued ? 'opacity-0 scale-95' : 'opacity-90 scale-100'
                }`}
              >
                {/* Dense, static cloud blanket (NO ROTATION) */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={TEMPORAL_STORM_FOG_IMG}
                    alt={`Tormenta Temporal - ${zone.name}`}
                    className="w-full h-full object-cover opacity-90 mix-blend-screen filter brightness-95 contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  {/* Atmospheric storm gradient covering the full realm area */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-purple-950/75 to-slate-950/85 backdrop-blur-[2px]" />
                  {/* Subtle rim border */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-purple-500/30 rounded-3xl" />
                  {/* Soft static lightning glow */}
                  <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-purple-400/20 rounded-full blur-md" />
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* CENTER: EL GRAN RELOJ DE KRONOS (VÓRTICE CUÁNTICO)             */}
          {/* ============================================================== */}
          <div
            style={{ left: '50%', top: '50%' }}
            onClick={() => {
              sound.playSfx('menuSelect');
              setShowCenterInfo(true);
              setSelectedZone(null);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
          >
            {/* Pulsing Energy Aura */}
            <div className={`absolute -inset-4 rounded-full blur-xl transition-all ${
              isIslandRescued
                ? 'bg-amber-400/60 animate-ping'
                : 'bg-cyan-500/40 group-hover:bg-cyan-400/60 animate-pulse'
            }`} />

            {/* Central Clock Circle Landmark */}
            <div className={`relative p-2.5 sm:p-3.5 rounded-full border-2 transition-transform duration-300 group-hover:scale-110 shadow-2xl flex items-center justify-center ${
              isIslandRescued
                ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-200 text-slate-950 shadow-amber-500/50'
                : 'bg-slate-950/95 border-amber-400 text-amber-300 shadow-cyan-500/30'
            }`}>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
              {/* Core Stability Indicator */}
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-[8px] sm:text-[9px] font-mono font-black text-amber-300 whitespace-nowrap shadow-lg">
                {Math.round((rescuedCount / MALLA_ZONES.length) * 100)}% {language === 'es' ? 'ESTABLE' : 'STABLE'}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 12 REALMS / ZONES SCATTERED ACROSS THE ISLAND                   */}
          {/* ============================================================== */}
          {MALLA_ZONES.map((zone) => {
            const isRescued = isMallaZoneRescued(slot, zone.id);
            const isUnlocked = isMallaZoneUnlocked(slot, zone.id);
            const missionsDone = progress.completedMissions[zone.id] || [];
            const doneCount = missionsDone.filter(Boolean).length;
            const isSelected = selectedZone?.id === zone.id;

            return (
              <div
                key={zone.id}
                style={{ left: `${zone.mapCoords.x}%`, top: `${zone.mapCoords.y}%` }}
                onClick={() => handleSelectZone(zone)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              >
                {/* Radiant Halo (Si la zona YA fue rescatada) */}
                {isRescued && (
                  <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400/40 via-emerald-400/40 to-cyan-400/40 blur-md animate-pulse pointer-events-none" />
                )}

                {/* REALM PIN / BANNER */}
                <div
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border-2 transition-all duration-300 group-hover:scale-110 shadow-xl backdrop-blur-md ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 scale-110'
                      : ''
                  } ${
                    isRescued
                      ? 'bg-slate-900/90 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                      : isUnlocked
                      ? 'bg-slate-900/90 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950/90 border-purple-500/70 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  {isRescued ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 fill-emerald-400/20" />
                  ) : isUnlocked ? (
                    <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <div className="relative shrink-0">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    </div>
                  )}

                  {/* Realm Name & Progress */}
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[11px] font-black font-heading tracking-wide text-white truncate max-w-[85px] sm:max-w-[110px]">
                      {zone.name}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono">
                      <span className={isRescued ? 'text-emerald-400 font-bold' : isUnlocked ? 'text-cyan-300 font-bold' : 'text-purple-300 font-bold'}>
                        {isRescued
                          ? (language === 'es' ? '¡RESCATADO!' : 'RESCUED!')
                          : isUnlocked
                          ? `${doneCount}/3 ${language === 'es' ? 'desafíos' : 'trials'}`
                          : (language === 'es' ? 'BLOQUEADO' : 'LOCKED')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* DRAWER / MODAL: DETALLES DEL REINO Y SUS 3 DESAFÍOS             */}
      {/* ============================================================== */}
      {selectedZone && (() => {
        const isRescued = isMallaZoneRescued(slot, selectedZone.id);
        const isUnlocked = isMallaZoneUnlocked(slot, selectedZone.id);

        return (
          <div className="fixed inset-x-3 bottom-3 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-96 z-40 bg-slate-900/95 backdrop-blur-xl border-2 border-purple-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col gap-3">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedZone.themeColor }}
                  />
                  <h3 className="text-base sm:text-lg font-black text-white font-heading">
                    {selectedZone.name}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                  {selectedZone.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedZone(null)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lore Corruption */}
            <div className="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-2.5 text-[11px] text-slate-300 leading-relaxed">
              {selectedZone.loreCorruption}
            </div>

            {/* UNLOCK / STARTING ZONE ACTION BUTTON */}
            {!isRescued && !isUnlocked && (
              <div className="bg-purple-950/70 border-2 border-purple-500/50 rounded-2xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>
                    {!hasChosenStartingZone
                      ? (language === 'es' ? '¿Quieres comenzar en esta zona?' : 'Start here?')
                      : (language === 'es' ? 'Zona Bloqueada por la Tormenta' : 'Locked by the Storm')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!hasChosenStartingZone) {
                      handleChooseAsStartingZone(selectedZone.id);
                    } else {
                      handleUnlockZone(selectedZone.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs font-heading shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Unlock className="w-4 h-4 fill-current" />
                  <span>
                    {!hasChosenStartingZone
                      ? (language === 'es' ? 'ELEGIR COMO PRIMERA ZONA A DESBLOQUEAR' : 'CHOOSE AS STARTING UNLOCKED REALM')
                      : (language === 'es' ? 'DESBLOQUEAR Y DESAFIAR ESTE REINO' : 'UNLOCK AND CHALLENGE THIS REALM')}
                  </span>
                </button>
              </div>
            )}

            {/* Realm Status Banner */}
            {isRescued ? (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-2.5 flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-black uppercase font-mono tracking-wider">
                    {language === 'es' ? '¡REINO RESCATADO AL 100%!' : 'REALM 100% RESCUED!'}
                  </div>
                  <div className="text-[10px] text-emerald-200/80">
                    {language === 'es'
                      ? 'Las nubes de tormenta se han disipado. El nexo temporal de esta era está estabilizado.'
                      : 'The storm clouds have dispersed. The temporal nexus of this era is stabilized.'}
                  </div>
                </div>
              </div>
            ) : isUnlocked ? (
              <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-2xl p-2.5 flex items-center gap-2.5 text-cyan-300">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-black uppercase font-mono tracking-wider">
                    {language === 'es' ? 'REINO DESBLOQUEADO · LISTO PARA EL COMBATE' : 'UNLOCKED REALM · READY FOR TRIAL'}
                  </div>
                  <div className="text-[10px] text-cyan-200/80">
                    {language === 'es'
                      ? 'Completa los 3 desafíos para expulsar permanentemente las nubes de este reino.'
                      : 'Complete all 3 trials to permanently banish clouds from this realm.'}
                  </div>
                </div>
              </div>
            ) : null}

            {/* 3 MISSIONS LIST */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {selectedZone.missions.map((mission, idx) => {
                const isDone = Boolean(progress.completedMissions[selectedZone.id]?.[idx]);
                const isLevelCompletedInNormal = Boolean(slot?.completedLevels?.includes(mission.levelIndex));

                return (
                  <div
                    key={mission.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-950/80 border-emerald-500/50 text-slate-200'
                        : !isLevelCompletedInNormal
                        ? 'bg-slate-950/70 border-amber-900/40 text-slate-400 opacity-80'
                        : isUnlocked
                        ? 'bg-slate-950/90 border-slate-700/80 hover:border-cyan-400/60 text-slate-100'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : !isLevelCompletedInNormal
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
                            : mission.type === 'boss'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : mission.type === 'time'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : !isLevelCompletedInNormal ? (
                            <Lock className="w-4 h-4 text-amber-400" />
                          ) : mission.type === 'boss' ? (
                            <Swords className="w-4 h-4" />
                          ) : mission.type === 'time' ? (
                            <Timer className="w-4 h-4" />
                          ) : (
                            <Gem className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold uppercase text-purple-400">
                              {language === 'es' ? `DESAFÍO ${idx + 1}` : `TRIAL ${idx + 1}`}
                            </span>
                            {isDone ? (
                              <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-1 rounded">
                                {language === 'es' ? 'COMPLETADO' : 'CLEARED'}
                              </span>
                            ) : !isLevelCompletedInNormal ? (
                              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 rounded flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                {language === 'es' ? 'REQUIERE MODO NORMAL' : 'REQUIRES NORMAL MODE'}
                              </span>
                            ) : null}
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {mission.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {mission.objectiveText}
                          </p>
                          {!isLevelCompletedInNormal && (
                            <p className="text-[9px] text-amber-300/80 font-mono mt-1 flex items-center gap-1">
                              <span>⚠️ {language === 'es' ? 'Completa este nivel en el modo normal para desbloquear' : 'Complete this level in normal mode to unlock'}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Launch Mission Button */}
                      {!isLevelCompletedInNormal ? (
                        <button
                          onClick={() => {
                            sound.playSfx('block');
                            setNormalLockToast(
                              language === 'es'
                                ? '¡Debes completar este nivel en el Modo Normal antes de poder jugarlo en el Modo Historia!'
                                : 'You must complete this level in Normal Mode first to play this Story Mode trial!'
                            );
                            setTimeout(() => setNormalLockToast(null), 3500);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-black font-heading shrink-0 flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 transition-all active:scale-95 cursor-pointer shadow-sm"
                          title={language === 'es' ? 'Supera este nivel en Modo Normal primero' : 'Beat this level in Normal Mode first'}
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'es' ? 'BLOQUEADO' : 'LOCKED'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isUnlocked) {
                              if (!hasChosenStartingZone) {
                                handleChooseAsStartingZone(selectedZone.id);
                              } else {
                                handleUnlockZone(selectedZone.id);
                              }
                            }
                            sound.playSfx('menuSelect');
                            onStartMission(mission);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-black font-heading shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md ${
                            isDone
                              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                              : isUnlocked
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-cyan-500/30'
                              : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {isDone
                              ? (language === 'es' ? 'REPETIR' : 'REPLAY')
                              : (language === 'es' ? 'JUGAR' : 'PLAY')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* CENTER KRONOS CLOCK INFO MODAL                                  */}
      {/* ============================================================== */}
      {showCenterInfo && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-[480px] z-40 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading">
                  {language === 'es' ? 'El Gran Reloj de Kronos' : 'The Grand Kronos Clock'}
                </h3>
                <p className="text-xs text-amber-300 font-mono">
                  {language === 'es' ? 'Núcleo de Estabilidad de la Isla' : 'Island Stability Core'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCenterInfo(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {language === 'es'
              ? 'En el centro de la fractura temporal, el Reloj de Kronos absorbe la resonancia de todas las realidades. Con cada reino rescatado de las nubes de tormenta, sus engranajes se sincronizan. ¡Rescata los 12 reinos para reestabilizar la línea temporal!'
              : 'At the center of the temporal fracture, the Kronos Clock absorbs the resonance of all realities. With each realm rescued from the storm clouds, its gears synchronize. Rescue all 12 realms to stabilize the timeline!'}
          </p>

          {/* Gauge Bar */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">{language === 'es' ? 'Potencia Cuántica' : 'Quantum Power'}</span>
              <span className="text-amber-400 font-bold">{rescuedCount}/{MALLA_ZONES.length} ({Math.round((rescuedCount / MALLA_ZONES.length) * 100)}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-amber-500/20">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${(rescuedCount / MALLA_ZONES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 100% ISLAND VICTORY CELEBRATION MODAL                           */}
      {/* ============================================================== */}
      {showVictoryCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_80px_rgba(245,158,11,0.5)] animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mx-auto mb-3 shadow-lg">
              <Trophy className="w-9 h-9 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-white font-heading tracking-wide">
              {language === 'es' ? '¡LA MALLA TEMPORAL HA SIDO RESTAURADA!' : 'THE TEMPORAL MESH HAS BEEN RESTORED!'}
            </h2>

            <p className="text-xs text-amber-200 mt-2 leading-relaxed">
              {language === 'es'
                ? '¡Todas las nubes de tormenta se han disipado! Los 12 reinos de la isla han sido rescatados y el Gran Reloj de Kronos vuelve a latir en perfecta armonía cuántica.'
                : 'All storm clouds have dispersed! All 12 realms on the island have been rescued and the Grand Kronos Clock beats in perfect quantum harmony.'}
            </p>

            <div className="bg-slate-950/80 border border-amber-400/40 rounded-2xl p-3 my-4 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono font-black text-amber-300">
                {language === 'es' ? 'TÍTULO DESBLOQUEADO: ZION CRONONAUTA SUPREMO' : 'TITLE UNLOCKED: ZION SUPREME CHRONONAUT'}
              </span>
            </div>

            <button
              onClick={() => setShowVictoryCelebration(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-sm font-heading shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              {language === 'es' ? '¡CONTINUAR EXPLORANDO LA ISLA!' : 'CONTINUE EXPLORING THE ISLAND!'}
            </button>
          </div>
        </div>
      )}

      {/* Normal mode completion requirement toast */}
      {normalLockToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-950/95 border-2 border-amber-500/70 text-amber-200 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 font-mono text-xs font-bold animate-in fade-in slide-in-from-bottom duration-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span>{normalLockToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* LORE PROLOGUE MODAL (Transmisión Cuántica de Auxilio)          */}
      {/* ============================================================== */}
      {showLorePrologue && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-gradient-to-b from-purple-950/95 via-slate-900/98 to-slate-950 border-2 border-purple-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.4)] relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Hologram scanlines effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(168,85,247,0.05)_51%)] bg-[size:100%_4px] pointer-events-none rounded-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400/60 flex items-center justify-center text-purple-300 shrink-0 shadow-lg shadow-purple-500/30">
                  <Radio className="w-6 h-6 text-purple-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest">
                      {language === 'es' ? 'FRECUENCIA KRONOS-9 · TRANSMISIÓN' : 'KRONOS-9 FREQUENCY · TRANSMISSION'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-heading tracking-wide">
                    {language === 'es' ? 'Señal de Auxilio Detectada' : 'Distress Beacon Detected'}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleDismissPrologue}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={language === 'es' ? 'Cerrar' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Lore Text */}
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-3 text-slate-200 text-xs sm:text-sm leading-relaxed">
              <p className="text-purple-200 font-semibold">
                {language === 'es'
                  ? '«¡Atención, Crononauta! Se ha producido una fractura colosal en el continuo espacio-tiempo. Las doce eras se han fragmentado en una isla cuántica aislada, cubierta por una densa tormenta temporal.»'
                  : '“Attention, Chrononaut! A colossal fracture has occurred in the space-time continuum. The twelve eras have fragmented into an isolated quantum island, engulfed in dense temporal storms.”'}
              </p>

              <p className="text-slate-300">
                {language === 'es'
                  ? 'Hemos interceptado una débil frecuencia en el Gran Reloj central: ¡el universo de Zion ha colapsado y necesita rescate urgente!'
                  : 'We have intercepted a faint frequency at the Grand central Clock: Zion’s universe has collapsed and urgently needs rescue!'}
              </p>

              <div className="bg-purple-950/60 border border-purple-400/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-purple-200">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="font-bold text-amber-200">
                  {language === 'es'
                    ? 'Completa estas misiones para poder rescatar el universo de Zion, estabilizar los doce reinos y poder rastrear su señal de auxilio en el corazón del Reloj de Kronos.'
                    : 'Complete these trials to rescue Zion’s universe, stabilize the twelve realms, and track down his distress signal at the heart of the Kronos Clock.'}
                </span>
              </div>
            </div>

            {/* Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span className="text-slate-300 text-[11px]">{language === 'es' ? 'Elige tu primer reino' : 'Choose first realm'}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span className="text-slate-300 text-[11px]">{language === 'es' ? 'Disipa las nubes' : 'Dispel storm clouds'}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span className="text-slate-300 text-[11px]">{language === 'es' ? 'Rastrea la señal' : 'Track beacon'}</span>
              </div>
            </div>

            {/* Launch Action */}
            <button
              onClick={handleDismissPrologue}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black text-sm font-heading shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'es' ? '¡ENTENDIDO, ABRIR MAPA DE LA ISLA!' : 'UNDERSTOOD, OPEN ISLAND MAP!'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
