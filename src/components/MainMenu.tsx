import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Trash2,
  Plus,
  Lock,
  Unlock,
  ChevronRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Gamepad2,
  Award,
  Shield,
  Zap,
  Clock,
  Skull,
  Star,
  Swords,
  Info,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Flame,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import { PixelCharacter } from './PixelCharacter';
import { LevelPixelThumbnail } from './LevelPixelThumbnail';
import { LEVEL_CONFIGS } from '../game/levelData';
import { SaveSlot, ZoneId } from '../types';
import {
  loadAllSaveSlots,
  getActiveSaveSlot,
  setActiveSlotId,
  createNewSaveSlot,
  deleteSaveSlot,
  getZoneCompletion,
  resetAllSaveData,
  MAX_SAVE_SLOTS,
  isOnlyUpUnlocked,
  getOnlyUpRecord,
} from '../game/saveManager';
import { sound } from '../audio/soundEngine';
import { PrivacyModal, PRIVACY_POLICY_URL } from './PrivacyModal';
import { SoundtrackModal } from './SoundtrackModal';
import { Music } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (levelIndex: number, slotId: number) => void;
  onStartOnlyUp?: (slotId: number) => void;
  onOpenCredits: () => void;
  audioActive: boolean;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
  initialView?: MenuView;
  initialZone?: ZoneId | null;
}

type MenuView = 'title' | 'slots' | 'zones' | 'acts' | 'controls';

interface ZoneMeta {
  id: ZoneId;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  actsCount: number;
}

const ZONES_DATA: ZoneMeta[] = [
  {
    id: 'neon',
    name: 'Bosque Neón',
    subtitle: 'Arboleda Bioluminiscente Ancestral',
    themeColor: '#22d3ee',
    accentColor: '#4ade80',
    actsCount: 3,
  },
  {
    id: 'sakura',
    name: 'Cerezo Espiritual',
    subtitle: 'El Sendero Místico de los Pétalos',
    themeColor: '#f472b6',
    accentColor: '#fb7185',
    actsCount: 3,
  },
  {
    id: 'lavacliff',
    name: 'Acantilados de Lava',
    subtitle: 'Caldera Volcánica y Núcleo Ígneo',
    themeColor: '#f97316',
    accentColor: '#ef4444',
    actsCount: 3,
  },
  {
    id: 'desert',
    name: 'Santuario del Desierto',
    subtitle: 'Pirámides Doradas y Tumbas de Faraones',
    themeColor: '#f59e0b',
    accentColor: '#10b981',
    actsCount: 3,
  },
  {
    id: 'krono',
    name: 'Krono City',
    subtitle: 'Metrópolis Ciberpunk y Reactor Cuántico',
    themeColor: '#06b6d4',
    accentColor: '#8b5cf6',
    actsCount: 3,
  },
  {
    id: 'travel',
    name: 'Kronos Travel',
    subtitle: 'La Fusión Dimensional de Todas las Eras',
    themeColor: '#38bdf8',
    accentColor: '#f43f5e',
    actsCount: 1,
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onStartOnlyUp,
  onOpenCredits,
  audioActive,
  onToggleAudio,
  onToggleFullscreen,
  initialView = 'title',
  initialZone = null,
}) => {
  const [view, setView] = useState<MenuView>(initialView);
  const [slots, setSlots] = useState<(SaveSlot | null)[]>(loadAllSaveSlots());
  const [activeSlotId, setActiveSlotState] = useState<number>(0);
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(initialZone);
  const [newSlotModal, setNewSlotModal] = useState<{ open: boolean; slotId: number; name: string }>({
    open: false,
    slotId: 0,
    name: '',
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ open: boolean; slotId: number }>({
    open: false,
    slotId: 0,
  });
  const [resetAllConfirmModal, setResetAllConfirmModal] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [soundtrackModalOpen, setSoundtrackModalOpen] = useState<boolean>(false);

  const activeSlot = slots[activeSlotId] || slots[0];

  const refreshSlots = () => {
    setSlots(loadAllSaveSlots());
  };

  const handleResetAllProgress = () => {
    resetAllSaveData();
    refreshSlots();
    setActiveSlotState(0);
    setResetAllConfirmModal(false);
    sound.playSfx('dash');
  };

  const handleSelectSlotAndProceed = (slotId: number) => {
    setActiveSlotId(slotId);
    setActiveSlotState(slotId);
    sound.playSfx('menuSelect');
    setView('zones');
  };

  const handleCreateSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotModal.name.trim()) return;
    const newSlot = createNewSaveSlot(newSlotModal.slotId, newSlotModal.name);
    refreshSlots();
    setActiveSlotId(newSlotModal.slotId);
    setActiveSlotState(newSlotModal.slotId);
    setNewSlotModal({ open: false, slotId: 0, name: '' });
    sound.playSfx('upgrade');
    setView('zones');
  };

  const handleDeleteSlotConfirm = () => {
    deleteSaveSlot(deleteConfirmModal.slotId);
    refreshSlots();
    setDeleteConfirmModal({ open: false, slotId: 0 });
    sound.playSfx('dash');
  };

  const handleLaunchLevel = (levelIndex: number) => {
    sound.playSfx('special');
    onStartGame(levelIndex, activeSlotId);
  };

  return (
    <div
      id="main-menu-root"
      className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-radial from-[#0c132c] via-[#050814] to-[#020307] text-white overflow-y-auto overflow-x-hidden p-4 sm:p-6 select-none"
    >
      {/* Dynamic Cyber Matrix Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d418_1px,transparent_1px),linear-gradient(to_bottom,#06b6d418_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {view !== 'title' && (
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                if (view === 'acts') setView('zones');
                else if (view === 'zones' || view === 'controls') setView('slots');
                else if (view === 'slots') setView('title');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-bold text-xs shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>VOLVER</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-black tracking-widest uppercase">
              VERSION 2.5 EXTENDED
            </span>
          </div>
        </div>

        {/* Global Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setSoundtrackModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95"
            title="Escuchar Banda Sonora Original (Jukebox)"
          >
            <Music className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="hidden sm:inline">JUKEBOX BSO</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setPrivacyModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95"
            title="Política de Privacidad (Google Play)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">PRIVACIDAD</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setView('controls');
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              view === 'controls'
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Guía de Controles"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">CONTROLES</span>
          </button>

          <button
            onClick={onToggleAudio}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
            title="Activar/Desactivar Audio"
          >
            {audioActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* VIEW 1: TITLE SCREEN */}
      {view === 'title' && (
        <main className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-center my-auto py-3 sm:py-6 px-2">
          {/* Animated Pixel Art Character Zion */}
          <div className="relative mb-1 sm:mb-2">
            <PixelCharacter scale={typeof window !== 'undefined' && window.innerWidth < 640 ? 2.8 : 3.8} interactive={true} />
            <div className="text-[9px] sm:text-[11px] font-mono text-cyan-400/80 tracking-wider sm:tracking-widest mt-[-6px] sm:mt-[-10px] animate-pulse">
              [ TOCA A ZION PARA ATACAR ]
            </div>
          </div>

          {/* Epic Main Game Title: ZION ADVENTURE */}
          <div className="relative mt-1 mb-3 sm:mb-4">
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-2xl -z-10 rounded-full" />
            <h1 className="text-3xl xs:text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 font-heading drop-shadow-[0_5px_25px_rgba(6,182,212,0.8)] leading-tight">
              ZION ADVENTURE
            </h1>
            <p className="text-xs sm:text-base font-bold text-cyan-300/90 tracking-[0.15em] sm:tracking-[0.25em] uppercase font-mono mt-1">
              LA LEYENDA DEL CONTINUO ESPACIO-TIEMPO
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 mt-2 sm:mt-4 w-full max-w-md">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setView('slots');
              }}
              className="w-full group relative flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-base sm:text-xl tracking-wider shadow-[0_0_35px_rgba(6,182,212,0.7)] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>INICIAR JUEGO</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin" />
            </button>

            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onOpenCredits();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-pink-500/50 text-slate-200 hover:text-pink-300 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg active:scale-95"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              <span>CRÉDITOS & BSO</span>
            </button>
          </div>

          {/* Quick Legal & Privacy Trust Bar */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setPrivacyModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900/60"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Política de Privacidad</span>
            </button>

            <span className="text-slate-600">·</span>

            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900/60"
            >
              <span>Ver en Google Docs</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 w-full max-w-lg text-center">
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-cyan-400 font-black text-sm sm:text-base">6 ZONAS</div>
              <div className="text-[10px] text-slate-400 font-mono">12 NIVELES EXTENSOS</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-pink-400 font-black text-sm sm:text-base">5 JEFES ÉPICOS</div>
              <div className="text-[10px] text-slate-400 font-mono">FASES & PATRONES</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-amber-400 font-black text-sm sm:text-base">3 PARTIDAS</div>
              <div className="text-[10px] text-slate-400 font-mono">GUARDADO AUTOMÁTICO</div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 2: SAVE SLOTS SCREEN (Máximo 3 Partidas) */}
      {view === 'slots' && (
        <main className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto py-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              RANURAS DE MEMORIA (MÁXIMO 3)
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-wide">
              SELECCIONA O CREA TU PARTIDA
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Cada ranura guarda independientemente tu progreso de niveles desbloqueados, cristales, secretos y puntuación.
            </p>
          </div>

          {/* 3 Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[0, 1, 2].map((slotIdx) => {
              const slot = slots[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all shadow-xl ${
                    slot
                      ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/60 border-dashed border-slate-700/80 hover:border-cyan-500/50'
                  }`}
                >
                  {slot ? (
                    <>
                      {/* Slot Header */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                            RANURA {slotIdx + 1}
                          </span>
                          <button
                            onClick={() => setDeleteConfirmModal({ open: true, slotId: slotIdx })}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-red-200 transition-colors"
                            title="Borrar Partida"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="text-lg font-black text-white font-heading truncate">
                          {slot.name}
                        </h3>

                        {/* Progression Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{slot.unlockedLevels.length} / 12 Niveles</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{slot.totalCrystals} Cristales</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>{slot.totalSecrets} Secretos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Star className="w-3.5 h-3.5 text-purple-400" />
                            <span>{slot.totalScore.toLocaleString()} PTS</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                            <span>PROGRESO TOTAL</span>
                            <span>{Math.min(100, Math.round((slot.completedLevels.length / LEVEL_CONFIGS.length) * 100))}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, (slot.completedLevels.length / LEVEL_CONFIGS.length) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Slot Launch Button */}
                      <button
                        onClick={() => handleSelectSlotAndProceed(slotIdx)}
                        className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
                      >
                        <span>PORTAL DE NIVELES</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    /* Empty Slot Prompt */
                    <div className="flex flex-col items-center justify-center text-center my-auto py-8">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-300">Ranura {slotIdx + 1} Vacía</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
                        Comienza una nueva aventura desde el Bosque Neón.
                      </p>
                      <button
                        onClick={() =>
                          setNewSlotModal({
                            open: true,
                            slotId: slotIdx,
                            name: `Aventurero ${slotIdx + 1}`,
                          })
                        }
                        className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold text-xs transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>CREAR PARTIDA</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slots Screen Footer Info & Reset Option */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-bold">💾 DISPOSITIVO:</span>
              <span>Progreso guardado automáticamente en este navegador</span>
            </div>

            <button
              onClick={() => setResetAllConfirmModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-red-100 font-semibold text-xs transition-all active:scale-95"
              title="Borra todos los progresos de todas las ranuras"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reiniciar Todos los Progresos</span>
            </button>
          </div>
        </main>
      )}

      {/* VIEW 3: ZONE SELECTION (1 Tarjeta Principal por Zona con Muestra de Mapa en Pixeles) */}
      {view === 'zones' && (
        <main className="relative z-10 w-full max-w-5xl flex flex-col items-center my-auto py-2">
          {/* Header */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Layers className="w-3.5 h-3.5" />
                <span>PARTIDA: {activeSlot?.name || 'Zion'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                SELECCIÓN DE ZONA
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Desbloqueados: {activeSlot?.unlockedLevels.length || 1} / 12</span>
            </div>
          </div>

          {/* 6 Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {ZONES_DATA.map((z) => {
              const zoneStatus = getZoneCompletion(activeSlot, z.id);
              const isExtraZone = z.id === 'travel';

              return (
                <div
                  key={z.id}
                  onClick={() => {
                    if (zoneStatus.unlocked) {
                      sound.playSfx('menuSelect');
                      setSelectedZone(z.id);
                      setView('acts');
                    } else {
                      sound.playSfx('block');
                    }
                  }}
                  className={`relative group flex flex-col rounded-2xl border-2 overflow-hidden transition-all shadow-xl cursor-pointer ${
                    zoneStatus.unlocked
                      ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] active:scale-98'
                      : 'bg-slate-950/80 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Pixel Art Map Landscape Preview */}
                  <div className="relative w-full h-36 overflow-hidden">
                    <LevelPixelThumbnail
                      zone={z.id}
                      act={1}
                      isLocked={!zoneStatus.unlocked}
                      width={280}
                      height={144}
                    />

                    {/* Zone Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-mono font-bold text-cyan-300">
                      {z.actsCount} {z.actsCount === 1 ? 'ACTO' : 'ACTOS'}
                    </div>
                  </div>

                  {/* Zone Details */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-white font-heading">
                          {z.name}
                        </h3>
                        {zoneStatus.unlocked ? (
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {zoneStatus.completed}/{zoneStatus.total}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {z.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-bold">
                        {zoneStatus.unlocked ? 'ENTRAR A ACTOS' : 'SUPERAR ERA PREVIA'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kronos Only Up Banner & Mode Selection */}
          {(() => {
            const onlyUpUnlocked = isOnlyUpUnlocked(activeSlot);
            const onlyUpRecord = getOnlyUpRecord(activeSlot?.id || 0);

            return (
              <div
                id="kronos-only-up-card"
                onClick={() => {
                  if (onlyUpUnlocked) {
                    sound.playSfx('menuSelect');
                    if (onStartOnlyUp) {
                      onStartOnlyUp(activeSlot?.id || 0);
                    }
                  } else {
                    sound.playSfx('block');
                  }
                }}
                className={`relative w-full mt-6 rounded-2xl border-2 overflow-hidden transition-all shadow-xl cursor-pointer ${
                  onlyUpUnlocked
                    ? 'bg-gradient-to-r from-orange-950/60 via-slate-900/90 to-red-950/60 border-orange-500/80 hover:border-orange-400 hover:shadow-[0_0_35px_rgba(249,115,22,0.35)] active:scale-98'
                    : 'bg-slate-950/80 border-slate-800 opacity-65 cursor-not-allowed'
                }`}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl border ${
                      onlyUpUnlocked
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-slate-800/40 border-slate-700 text-slate-500'
                    }`}>
                      <Flame className="w-8 h-8 animate-pulse" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                          onlyUpUnlocked
                            ? 'bg-orange-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          NUEVO MODO
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                          KRONOS ONLY UP
                        </h3>
                        {onlyUpUnlocked && onlyUpRecord > 0 && (
                          <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Trophy className="w-3.5 h-3.5" />
                            Récord: {onlyUpRecord}m
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                        {onlyUpUnlocked
                          ? 'Ascenso vertical infinito con plataformas y trampas de todas las eras. ¡La lava cuántica sube sin cesar: sube rápido para romper tu récord!'
                          : 'Derrota al Guardián de Bosque Neón (Zona 3) para desbloquear el desafío de ascenso infinito.'}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Flame className="w-3 h-3" /> Lava creciente
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Layers className="w-3 h-3" /> Plataformas híbridas
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Trophy className="w-3 h-3" /> Dificultad progresiva
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col items-center justify-end gap-2">
                    {onlyUpUnlocked ? (
                      <button
                        id="play-only-up-btn"
                        type="button"
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm font-heading flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>¡ASCENDER AHORA!</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Lock className="w-4 h-4" />
                        <span>Supera Bosque Neón (Zona 3)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Más Niveles Próximamente Placeholder */}
          <div
            id="more-levels-coming-soon"
            className="w-full mt-4 rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-all hover:border-slate-700/80"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                <Sparkles className="w-6 h-6 text-cyan-400/60 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-300 font-heading tracking-wide">
                  MÁS NIVELES PRÓXIMAMENTE
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nuevas dimensiones, biomas ancestrales, desafíos temporales y más guardianes en desarrollo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-cyan-400">
                ✦ Nuevas Eras
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-purple-400">
                ✦ Nuevos Jefes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-amber-400">
                ✦ Secretos Ocultos
              </span>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 4: ACT SELECTOR FOR SELECTED ZONE */}
      {view === 'acts' && selectedZone && (
        <main className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto py-2">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">
                ZONA: {ZONES_DATA.find((z) => z.id === selectedZone)?.name}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                SELECCIONA EL ACTO
              </h2>
            </div>

            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setView('zones');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>OTRA ZONA</span>
            </button>
          </div>

          {/* Acts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {LEVEL_CONFIGS.map((lvl, index) => {
              if (lvl.zone !== selectedZone) return null;
              const isUnlocked = activeSlot?.unlockedLevels.includes(index) ?? (index === 0);
              const isCompleted = activeSlot?.completedLevels.includes(index) ?? false;
              const isBoss = lvl.act === 3;

              return (
                <div
                  key={lvl.id}
                  className={`relative flex flex-col justify-between rounded-2xl border-2 overflow-hidden transition-all shadow-xl ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/80 border-slate-800 opacity-60'
                  }`}
                >
                  {/* Pixel Art Preview of Act */}
                  <div className="relative w-full h-36 overflow-hidden">
                    <LevelPixelThumbnail
                      zone={lvl.zone}
                      act={lvl.act}
                      isLocked={!isUnlocked}
                      isBoss={isBoss}
                      width={280}
                      height={144}
                    />

                    {/* Act Tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-cyan-300">
                      ACTO {lvl.act}
                    </div>

                    {isBoss && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold">
                        <Swords className="w-3 h-3" />
                        <span>JEFE</span>
                      </div>
                    )}
                  </div>

                  {/* Level Details */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-base font-black text-white font-heading">
                        {lvl.title.split('—')[1]?.trim() || lvl.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {lvl.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      {isUnlocked ? (
                        <button
                          onClick={() => handleLaunchLevel(index)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCompleted ? 'REPETIR ACTO' : 'JUGAR ACTO'}</span>
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>BLOQUEADO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* VIEW 5: CONTROLS GUIDE MODAL */}
      {view === 'controls' && (
        <main className="relative z-10 w-full max-w-3xl flex flex-col items-center my-auto py-4">
          <div className="w-full bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-black text-white font-heading">
                  GUÍA DE COMBATE & CONTROLES
                </h3>
              </div>
              <button
                onClick={() => setView('title')}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                CERRAR
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Moverse & Acelerar</div>
                  <div className="text-slate-400 text-[11px]">Movimiento fluido y salto</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  A / D o Flechas + Espacio
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Espada de Luz (Combo 3 Golpes)</div>
                  <div className="text-slate-400 text-[11px]">Ataque cuerpo a cuerpo letal</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  J o Z
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Dagas de Energía</div>
                  <div className="text-slate-400 text-[11px]">Ataque a distancia recargable</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  K o X
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Escudo & Parry Perfecto</div>
                  <div className="text-slate-400 text-[11px]">Bloquea o noquea proyectiles</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  E o C
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Dash / Esquiva Invulnerable</div>
                  <div className="text-slate-400 text-[11px]">Atraviesa enemigos y trampas</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  Shift o L
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Especial (Explosión SP)</div>
                  <div className="text-slate-400 text-[11px]">Onda expansiva devastadora</div>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                  Q o V
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MODAL: CREAR NUEVA PARTIDA */}
      {newSlotModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSlotSubmit}
            className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-5 shadow-2xl"
          >
            <h3 className="text-lg font-black text-white font-heading mb-2">
              CREAR PARTIDA (RANURA {newSlotModal.slotId + 1})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingresa el nombre de tu aventurero para identificar este archivo de guardado:
            </p>

            <input
              type="text"
              maxLength={16}
              value={newSlotModal.name}
              onChange={(e) => setNewSlotModal({ ...newSlotModal, name: e.target.value })}
              placeholder="Nombre del Jugador"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white font-bold text-sm focus:outline-none focus:border-cyan-400 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewSlotModal({ open: false, slotId: 0, name: '' })}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs shadow-lg"
              >
                CONFIRMAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CONFIRMAR BORRADO DE PARTIDA */}
      {deleteConfirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500/50 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center mx-auto mb-3 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-heading mb-1">
              ¿BORRAR RANURA {deleteConfirmModal.slotId + 1}?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Se eliminarán permanentemente todos los niveles desbloqueados, cristales y récords de esta ranura.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmModal({ open: false, slotId: 0 })}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                CANCELAR
              </button>
              <button
                onClick={handleDeleteSlotConfirm}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg"
              >
                SÍ, BORRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REINICIAR TODOS LOS PROGRESOS DEL DISPOSITIVO */}
      {resetAllConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/90 border border-red-500 flex items-center justify-center mx-auto mb-3 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-heading mb-1">
              ¿REINICIAR TODOS LOS PROGRESOS?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Esta acción restablecerá todas las ranuras de guardado en este dispositivo. Todos los niveles volverán a bloquearse excepto el Acto 1.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setResetAllConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                CANCELAR
              </button>
              <button
                onClick={handleResetAllProgress}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg font-mono"
              >
                REINICIAR TODO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POLÍTICA DE PRIVACIDAD & SEGURIDAD */}
      {privacyModalOpen && <PrivacyModal onClose={() => setPrivacyModalOpen(false)} />}

      {/* MODAL: JUKEBOX BANDA SONORA ORIGINAL */}
      {soundtrackModalOpen && <SoundtrackModal onClose={() => setSoundtrackModalOpen(false)} />}

      {/* Footer with Compliance, Credits & Privacy Link */}
      <footer className="relative z-10 text-[10px] text-slate-500 font-mono tracking-wider text-center py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>ZION ADVENTURE © 2026 · CREADO POR DMN</span>
        <span className="hidden sm:inline text-slate-700">|</span>
        <button
          onClick={() => {
            sound.playSfx('menuSelect');
            setPrivacyModalOpen(true);
          }}
          className="text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 transition-colors"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Política de Privacidad</span>
        </button>
        <span className="hidden sm:inline text-slate-700">|</span>
        <span className="text-slate-600">GOOGLE PLAY COMPLIANT</span>
      </footer>
    </div>
  );
};
