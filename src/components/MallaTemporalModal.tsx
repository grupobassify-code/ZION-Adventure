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
  ChevronRight,
  Map,
  List,
} from 'lucide-react';
import {
  MALLA_ZONES,
  TEMPORAL_ISLAND_MAP_IMG,
  KRONOS_CENTRAL_CLOCK_IMG,
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
import { useLanguage } from '../utils/i18n';

interface MallaTemporalModalProps {
  slot: SaveSlot | null;
  initialZoneId?: ZoneId;
  onClose: () => void;
  onStartMission: (mission: MallaMission) => void;
  audioActive: boolean;
  onToggleAudio: () => void;
}

function getShortZoneName(name: string): string {
  if (name.includes('Volcánico')) return 'Volcán';
  if (name.includes('Glaciar')) return 'Glaciar';
  if (name.includes('Sakura')) return 'Sakura';
  if (name.includes('Desértico')) return 'Desierto';
  if (name.includes('Ciberpunk')) return 'Krono';
  if (name.includes('Jungla')) return 'Jungla';
  if (name.includes('Prehistórico')) return 'Jurásico';
  if (name.includes('Medieval')) return 'Castillo';
  if (name.includes('Steampunk')) return 'Steampunk';
  if (name.includes('Pirata')) return 'Pirata';
  if (name.includes('Lunar')) return 'Lunar';
  if (name.includes('Neón')) return 'Neón';
  return name.replace(/^Reino (de la |del |de )?/, '');
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
  const [mobileViewTab, setMobileViewTab] = useState<'map' | 'list'>('map');
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
      {/* TOP HEADER: RESPONSIVE & ULTRA-COMPACT FOR MOBILE */}
      <header className="relative z-20 flex items-center justify-between px-2.5 sm:px-6 py-1.5 sm:py-3 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/40 shadow-xl shrink-0 gap-2">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
            <span className="hidden xs:inline">{t('back')}</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                {language === 'es' ? 'MODO HISTORIA' : 'STORY MODE'}
              </span>
              <h1 className="text-xs sm:text-lg font-black text-white font-heading tracking-wide truncate">
                {language === 'es' ? 'La Malla Temporal' : 'The Temporal Mesh'}
              </h1>
            </div>
            <p className="text-[10px] text-purple-200/80 hidden lg:block truncate">
              {language === 'es'
                ? 'Completa estas misiones para rescatar el universo de Zion y rastrear su señal de auxilio'
                : 'Complete these trials to rescue Zion’s universe and track down his distress signal'}
            </p>
          </div>
        </div>

        {/* Center/Right: Mobile Tab Switcher & Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile View Toggle (Mapa / Lista) */}
          <div className="flex sm:hidden items-center p-0.5 rounded-xl bg-slate-950/80 border border-purple-500/40 shadow-inner">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setMobileViewTab('map');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                mobileViewTab === 'map'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>{language === 'es' ? 'Mapa' : 'Map'}</span>
            </button>
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setMobileViewTab('list');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                mobileViewTab === 'list'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <List className="w-3 h-3" />
              <span>{language === 'es' ? 'Lista' : 'List'}</span>
            </button>
          </div>

          {/* Rescue Progress Meter */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 shadow-inner shrink-0">
            <Trophy className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isIslandRescued ? 'text-amber-400 animate-bounce' : 'text-amber-400'}`} />
            <div className="text-right">
              <div className="text-[8px] sm:text-[9px] font-mono text-slate-400 hidden sm:block">
                {language === 'es' ? 'REINOS' : 'REALMS'}
              </div>
              <div className="text-[11px] sm:text-xs font-black text-amber-300 font-mono">
                {rescuedCount}/{MALLA_ZONES.length}
                <span className="text-slate-500 text-[9px] ml-0.5 hidden xs:inline">({totalCompletedMissions}/36)</span>
              </div>
            </div>
          </div>

          {/* Distress Signal Lore Re-open Button */}
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setShowLorePrologue(true);
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md shrink-0"
            title={language === 'es' ? 'Ver transmisión y lore' : 'View transmission & lore'}
          >
            <Radio className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden md:inline">{language === 'es' ? 'Señal de Auxilio' : 'Distress Beacon'}</span>
          </button>

          {/* Quick Demo Test Action */}
          <button
            onClick={handleToggleTestRescue}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
            title="Botón de prueba rápida para desarrollador / jurado"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{rescuedCount >= MALLA_ZONES.length ? (language === 'es' ? 'Reiniciar Tormenta' : 'Reset') : (language === 'es' ? 'Despejar (Demo)' : 'Clear Demo')}</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {audioActive ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* CALLOUT: FIRST ZONE SELECTION PROMPT */}
      {!hasChosenStartingZone && (
        <div className="relative z-20 bg-gradient-to-r from-purple-950/95 via-indigo-900/95 to-purple-950/95 border-b border-purple-500/40 px-3 py-1.5 text-center flex items-center justify-center gap-2 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-amber-200 truncate">
            {language === 'es'
              ? '🎯 ¡Elige cualquier reino del mapa como tu primera zona a desbloquear!'
              : '🎯 Choose any realm on the map as your first zone to unlock!'}
          </span>
        </div>
      )}

      {/* MAIN CONTAINER: FULL-SCREEN ADAPTIVE FOR CELLPHONES & DESKTOP */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-slate-950">
        {/* Radar scan grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f70a_1px,transparent_1px),linear-gradient(to_bottom,#a855f70a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* ============================================================== */}
        {/* OPTION A: MOBILE SCROLLABLE LIST VIEW                          */}
        {/* ============================================================== */}
        {mobileViewTab === 'list' && (
          <div className="w-full h-full flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-3 max-w-2xl mx-auto z-10 animate-in fade-in duration-200">
            <div className="text-center pb-1">
              <h2 className="text-sm font-black text-white font-heading">
                {language === 'es' ? 'Los 12 Reinos de la Malla Temporal' : 'The 12 Realms of the Temporal Mesh'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {language === 'es' ? 'Toca cualquier reino para ver sus desafíos y rescatarlo' : 'Tap any realm to view trials and rescue it'}
              </p>
            </div>

            {MALLA_ZONES.map((zone) => {
              const isRescued = isMallaZoneRescued(slot, zone.id);
              const isUnlocked = isMallaZoneUnlocked(slot, zone.id);
              const missionsDone = progress.completedMissions[zone.id] || [];
              const doneCount = missionsDone.filter(Boolean).length;

              return (
                <div
                  key={`list-${zone.id}`}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                    isRescued
                      ? 'bg-slate-900/95 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : isUnlocked
                      ? 'bg-slate-900/95 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/95 border-purple-900/60 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                        style={{ backgroundColor: zone.themeColor }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white font-heading">
                            {zone.name}
                          </h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            isRescued
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isUnlocked
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          }`}>
                            {isRescued
                              ? '¡RESCATADO!'
                              : isUnlocked
                              ? `${doneCount}/3 ${language === 'es' ? 'DESAFÍOS' : 'TRIALS'}`
                              : (language === 'es' ? 'BLOQUEADO' : 'LOCKED')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{zone.subtitle}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-purple-300">
                      {language === 'es' ? 'Jefe' : 'Boss'}: {zone.bossName}
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {language === 'es' ? 'Ver desafíos →' : 'View trials →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION B: FULLSCREEN EDGE-TO-EDGE ISLAND MAP                   */}
        {/* (Ocupa toda la pantalla completa del celular sin verse apretado)*/}
        {/* ============================================================== */}
        {mobileViewTab === 'map' && (
          <div className="relative w-full h-full flex-1 overflow-hidden sm:max-w-5xl sm:aspect-[16/9] sm:max-h-[85vh] sm:rounded-3xl sm:border-2 sm:border-purple-500/30 sm:shadow-2xl sm:my-auto">
            {/* Island Map Image: Full screen cover on mobile */}
            <img
              src={TEMPORAL_ISLAND_MAP_IMG}
              alt="Isla de la Malla Temporal"
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Ambient Cosmic Horizon Lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />

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
              <div className={`absolute -inset-3 sm:-inset-4 rounded-full blur-lg sm:blur-xl transition-all ${
                isIslandRescued
                  ? 'bg-amber-400/60 animate-ping'
                  : 'bg-cyan-500/40 group-hover:bg-cyan-400/60 animate-pulse'
              }`} />

              {/* Central Clock Circle Landmark */}
              <div className={`relative p-2 sm:p-3.5 rounded-full border-2 transition-transform duration-300 group-hover:scale-110 shadow-2xl flex items-center justify-center ${
                isIslandRescued
                  ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-200 text-slate-950 shadow-amber-500/50'
                  : 'bg-slate-950/95 border-amber-400 text-amber-300 shadow-cyan-500/30'
              }`}>
                <Clock className="w-5 h-5 sm:w-8 sm:h-8" />
                {/* Core Stability Indicator */}
                <div className="absolute -bottom-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-[7px] sm:text-[9px] font-mono font-black text-amber-300 whitespace-nowrap shadow-lg">
                  {Math.round((rescuedCount / MALLA_ZONES.length) * 100)}% {language === 'es' ? 'ESTABLE' : 'STABLE'}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 12 REALMS / MISSIONS SCATTERED ACROSS THE ISLAND               */}
            {/* Sin nubes: Mapa 100% visible, con candadito arriba de cada     */}
            {/* misión que desaparece al completarla para ver bien el mapa      */}
            {/* ============================================================== */}
            {MALLA_ZONES.map((zone) => {
              const isRescued = isMallaZoneRescued(slot, zone.id);
              const isUnlocked = isMallaZoneUnlocked(slot, zone.id);
              const missionsDone = progress.completedMissions[zone.id] || [];
              const doneCount = missionsDone.filter(Boolean).length;
              const isSelected = selectedZone?.id === zone.id;
              const shortName = getShortZoneName(zone.name);

              return (
                <div
                  key={zone.id}
                  style={{ left: `${zone.mapCoords.x}%`, top: `${zone.mapCoords.y}%` }}
                  onClick={() => handleSelectZone(zone)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                >
                  {/* Radiant Halo discreto cuando la misión fue completada */}
                  {isRescued && (
                    <div className="absolute -inset-1.5 rounded-full bg-emerald-400/25 blur-sm pointer-events-none" />
                  )}

                  {/* ======================================================== */}
                  {/* VISTA MÓVIL: Candadito arriba que desaparece al completar*/}
                  {/* ======================================================== */}
                  <div className="flex sm:hidden flex-col items-center">
                    {/* CANDADITO FLOTANDO ARRIBA DE LA MISIÓN (desaparece al completarse) */}
                    {!isRescued && (
                      <div className="relative mb-0.5 animate-bounce z-30 transition-all duration-300">
                        <div className="p-1 rounded-full bg-slate-950/95 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center">
                          <Lock className="w-3 h-3 text-amber-400" />
                        </div>
                      </div>
                    )}

                    {/* Pin de la misión */}
                    <div
                      className={`relative w-7 h-7 xs:w-8 xs:h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform active:scale-125 ${
                        isSelected
                          ? 'ring-4 ring-cyan-400 scale-110'
                          : ''
                      } ${
                        isRescued
                          ? 'bg-slate-900/60 border-emerald-400/80 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)] backdrop-blur-xs'
                          : isUnlocked
                          ? 'bg-slate-900/90 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-950/90 border-purple-500/70 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      }`}
                    >
                      {isRescued ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: zone.themeColor }}
                        />
                      )}
                    </div>

                    {/* Micro-label underneath (transparente cuando está completada para ver bien el mapa) */}
                    <span
                      className={`mt-0.5 px-1 py-0.2 rounded-full text-[7.5px] font-black font-heading tracking-tight shadow-md border whitespace-nowrap transition-all ${
                        isRescued
                          ? 'bg-slate-900/65 text-emerald-300 border-emerald-500/40 opacity-70 group-hover:opacity-100 backdrop-blur-xs'
                          : isUnlocked
                          ? 'bg-slate-900/90 text-cyan-200 border-cyan-500/50'
                          : 'bg-slate-950/90 text-purple-300 border-purple-500/50'
                      }`}
                    >
                      {shortName}
                    </span>
                  </div>

                  {/* ======================================================== */}
                  {/* VISTA ESCRITORIO: Candadito arriba que desaparece al completar */}
                  {/* ======================================================== */}
                  <div className="hidden sm:flex flex-col items-center">
                    {/* CANDADITO FLOTANDO ARRIBA DE LA MISIÓN (desaparece al completarse) */}
                    {!isRescued && (
                      <div className="relative -mb-1 z-30 animate-bounce transition-all duration-300">
                        <div className="px-1.5 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span className="text-[9px] font-mono font-black text-amber-300">
                            {doneCount}/3
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Badge de la misión (sutil y limpio al completarse para ver bien el mapa) */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border-2 transition-all duration-300 group-hover:scale-105 shadow-xl backdrop-blur-md ${
                        isSelected
                          ? 'ring-4 ring-cyan-400 scale-105'
                          : ''
                      } ${
                        isRescued
                          ? 'bg-slate-900/65 border-emerald-400/70 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)] opacity-75 group-hover:opacity-100'
                          : isUnlocked
                          ? 'bg-slate-900/90 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-950/90 border-purple-500/70 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: zone.themeColor }}
                      />

                      <div className="text-left">
                        <div className="text-[11px] font-black font-heading tracking-wide text-white truncate max-w-[110px]">
                          {zone.name}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono">
                          {isRescued ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                              {language === 'es' ? 'COMPLETADO' : 'CLEARED'}
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-cyan-300 font-bold">
                              {language === 'es' ? 'DISPONIBLE' : 'READY'}
                            </span>
                          ) : (
                            <span className="text-amber-400/90 font-bold">
                              {language === 'es' ? 'BLOQUEADO' : 'LOCKED'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* DRAWER / BOTTOM SHEET: DETALLES DEL REINO Y SUS 3 DESAFÍOS     */}
      {/* (Bottom sheet fluido en celular, modal flotante en escritorio)  */}
      {/* ============================================================== */}
      {selectedZone && (() => {
        const isRescued = isMallaZoneRescued(slot, selectedZone.id);
        const isUnlocked = isMallaZoneUnlocked(slot, selectedZone.id);

        return (
          <>
            {/* Backdrop on mobile for tapping outside to dismiss */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 sm:hidden animate-in fade-in duration-200"
              onClick={() => setSelectedZone(null)}
            />

            <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-96 z-40 bg-slate-900/98 backdrop-blur-2xl border-t-2 sm:border-2 border-purple-500/70 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] sm:shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col gap-3 max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
              {/* Drag Handle on Mobile */}
              <div className="w-12 h-1.5 rounded-full bg-slate-600 mx-auto sm:hidden -mt-1 mb-1 shrink-0" />

              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
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
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lore Corruption */}
              <div className="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-2.5 text-[11px] text-slate-300 leading-relaxed shrink-0">
                {selectedZone.loreCorruption}
              </div>

              {/* UNLOCK / STARTING ZONE ACTION BUTTON */}
              {!isRescued && !isUnlocked && (
                <div className="bg-purple-950/70 border-2 border-purple-500/50 rounded-2xl p-3 flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                    <Lock className="w-4 h-4 text-purple-400 shrink-0" />
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
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs font-heading shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    <Unlock className="w-4 h-4 fill-current shrink-0" />
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
                <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-2.5 flex items-center gap-2.5 text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[11px] font-black uppercase font-mono tracking-wider">
                      {language === 'es' ? '¡REINO RESCATADO AL 100%!' : 'REALM 100% RESCUED!'}
                    </div>
                    <div className="text-[10px] text-emerald-200/80">
                      {language === 'es'
                        ? 'El candado ha desaparecido y este sector del mapa ha quedado totalmente libre y visible.'
                        : 'The lock has vanished and this sector of the map is now fully clear and visible.'}
                    </div>
                  </div>
                </div>
              ) : isUnlocked ? (
                <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-2xl p-2.5 flex items-center gap-2.5 text-cyan-300 shrink-0">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[11px] font-black uppercase font-mono tracking-wider">
                      {language === 'es' ? 'REINO DESBLOQUEADO · LISTO PARA EL COMBATE' : 'UNLOCKED REALM · READY FOR TRIAL'}
                    </div>
                    <div className="text-[10px] text-cyan-200/80">
                      {language === 'es'
                        ? 'Completa los 3 desafíos para quitar el candado y revelar limpiamente el mapa.'
                        : 'Complete all 3 trials to remove the lock and clearly reveal the map.'}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* 3 MISSIONS LIST (Scrollable on mobile) */}
              <div className="flex-1 overflow-y-auto max-h-[48vh] sm:max-h-56 pr-1 flex flex-col gap-2">
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
                        <div className="flex items-start gap-2 min-w-0">
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

                          <div className="min-w-0">
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
                            className="px-3 py-2 rounded-xl text-xs font-black font-heading shrink-0 flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 transition-all active:scale-95 cursor-pointer shadow-sm min-h-[44px]"
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
                            className={`px-3 py-2 rounded-xl text-xs font-black font-heading shrink-0 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md min-h-[44px] ${
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
          </>
        );
      })()}

      {/* ============================================================== */}
      {/* CENTER KRONOS CLOCK INFO MODAL                                  */}
      {/* ============================================================== */}
      {showCenterInfo && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-[480px] z-40 bg-slate-900/98 backdrop-blur-xl border-2 border-amber-400/60 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-heading">
                  {language === 'es' ? 'El Gran Reloj de Kronos' : 'The Grand Kronos Clock'}
                </h3>
                <p className="text-[11px] sm:text-xs text-amber-300 font-mono">
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
              ? 'En el centro de la fractura temporal, el Reloj de Kronos absorbe la resonancia de todas las realidades. Con cada reino completado y liberado de su candado, sus engranajes se sincronizan. ¡Rescata los 12 reinos para reestabilizar la línea temporal!'
              : 'At the center of the temporal fracture, the Kronos Clock absorbs the resonance of all realities. With each realm cleared and freed of its lock, its gears synchronize. Rescue all 12 realms to stabilize the timeline!'}
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
                ? '¡Todos los candados temporales han sido abiertos! Los 12 reinos de la isla han sido liberados y el Gran Reloj de Kronos vuelve a latir en perfecta armonía cuántica.'
                : 'All temporal locks have been opened! All 12 realms on the island have been liberated and the Grand Kronos Clock beats in perfect quantum harmony.'}
            </p>

            <div className="bg-slate-950/80 border border-amber-400/40 rounded-2xl p-3 my-4 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono font-black text-amber-300">
                {language === 'es' ? 'TÍTULO DESBLOQUEADO: ZION CRONONAUTA SUPREMO' : 'TITLE UNLOCKED: ZION SUPREME CHRONONAUT'}
              </span>
            </div>

            <button
              onClick={() => setShowVictoryCelebration(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-sm font-heading shadow-xl active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              {language === 'es' ? '¡CONTINUAR EXPLORANDO LA ISLA!' : 'CONTINUE EXPLORING THE ISLAND!'}
            </button>
          </div>
        </div>
      )}

      {/* Normal mode completion requirement toast */}
      {normalLockToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-950/95 border-2 border-amber-500/70 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 font-mono text-xs font-bold animate-in fade-in slide-in-from-bottom duration-300 max-w-[90vw] text-center">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span>{normalLockToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* LORE PROLOGUE MODAL (Transmisión Cuántica de Auxilio)          */}
      {/* ============================================================== */}
      {showLorePrologue && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-gradient-to-b from-purple-950/95 via-slate-900/98 to-slate-950 border-2 border-purple-500/70 rounded-3xl p-4 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.4)] relative flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
            {/* Hologram scanlines effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(168,85,247,0.05)_51%)] bg-[size:100%_4px] pointer-events-none rounded-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400/60 flex items-center justify-center text-purple-300 shrink-0 shadow-lg shadow-purple-500/30">
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[8px] sm:text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest">
                      {language === 'es' ? 'FRECUENCIA KRONOS-9' : 'KRONOS-9 FREQUENCY'}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white font-heading tracking-wide">
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
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-3 sm:p-4 flex flex-col gap-2.5 text-slate-200 text-xs sm:text-sm leading-relaxed">
              <p className="text-purple-200 font-semibold">
                {language === 'es'
                  ? '«¡Atención, Crononauta! Se ha producido una fractura colosal en el continuo espacio-tiempo. Las doce eras se han fragmentado en una isla cuántica aislada, cubierta por una densa tormenta temporal.»'
                  : '“Attention, Chrononaut! A colossal fracture has occurred in the space-time continuum. The twelve eras have fragmented into an isolated quantum island, engulfed in dense temporal storms.”'}
              </p>

              <p className="text-slate-300 text-[11px] sm:text-xs">
                {language === 'es'
                  ? 'Hemos interceptado una débil frecuencia en el Gran Reloj central: ¡el universo de Zion ha colapsado y necesita rescate urgente!'
                  : 'We have intercepted a faint frequency at the Grand central Clock: Zion’s universe has collapsed and urgently needs rescue!'}
              </p>

              <div className="bg-purple-950/60 border border-purple-400/40 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 text-xs text-purple-200">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="font-bold text-amber-200 text-[11px] sm:text-xs">
                  {language === 'es'
                    ? 'Completa estas misiones para poder rescatar el universo de Zion, estabilizar los doce reinos y poder rastrear su señal de auxilio en el corazón del Reloj de Kronos.'
                    : 'Complete these trials to rescue Zion’s universe, stabilize the twelve realms, and track down his distress signal at the heart of the Kronos Clock.'}
                </span>
              </div>
            </div>

            {/* Directives */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs font-mono">
              <div className="bg-slate-950/60 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">1</span>
                <span className="text-slate-300 text-[9px] sm:text-[11px]">{language === 'es' ? 'Elige reino' : 'Pick realm'}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">2</span>
                <span className="text-slate-300 text-[9px] sm:text-[11px]">{language === 'es' ? 'Abre candados' : 'Unlock realms'}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">3</span>
                <span className="text-slate-300 text-[9px] sm:text-[11px]">{language === 'es' ? 'Rastrea señal' : 'Find Zion'}</span>
              </div>
            </div>

            {/* Launch Action */}
            <button
              onClick={handleDismissPrologue}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm font-heading shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[44px]"
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
