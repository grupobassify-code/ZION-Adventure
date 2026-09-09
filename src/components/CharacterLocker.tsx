import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  Lock,
  Sparkles,
  Shield,
  Zap,
  Swords,
  Crosshair,
  Layers,
  Flame,
  Info,
  User,
  Clock,
  Shirt,
  Eye,
  Star,
  Activity,
  ChevronRight,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PixelCharacter } from './PixelCharacter';
import { SaveSlot } from '../types';
import { sound } from '../audio/soundEngine';

interface CharacterLockerProps {
  slot: SaveSlot | null;
  onBack: () => void;
  onSelectSkin?: (skinId: string) => void;
}

export type CharacterId = 'zion' | 'zyssa' | 'kael';

interface CharacterAbility {
  name: string;
  type: string;
  desc: string;
}

interface CharacterData {
  id: CharacterId;
  name: string;
  subtitle: string;
  title: string;
  rarity: 'LEGENDARIO' | 'ÉPICO' | 'MÍTICO';
  rarityColor: string;
  rarityBorder: string;
  rarityGlow: string;
  rarityBg: string;
  element: string;
  quote: string;
  isUnlocked: boolean;
  description: string;
  abilities: CharacterAbility[];
}

const CHARACTERS: CharacterData[] = [
  {
    id: 'zion',
    name: 'Zion',
    subtitle: 'El Guerrero Cuántico',
    title: 'Héroe de las Cinco Eras • Aspecto Fundador',
    rarity: 'LEGENDARIO',
    rarityColor: 'text-amber-400',
    rarityBorder: 'border-amber-400',
    rarityGlow: 'rgba(245, 158, 11, 0.4)',
    rarityBg: 'bg-amber-500/15',
    element: 'Energía Cuántica Neón',
    quote: '«El tiempo no se detiene... nosotros lo comandamos.»',
    isUnlocked: true,
    description:
      'Guardián del Santuario Neón y maestro absoluto del continuo temporal. Forjó el filo de plasma y domina el dash cuántico capaz de rasgar la realidad.',
    abilities: [
      {
        name: 'Espada de Plasma Neón',
        type: 'Ataque Principal',
        desc: 'Filo de fotones de alta frecuencia capaz de neutralizar enemigos y proyectiles en un combo de 3 golpes.',
      },
      {
        name: 'Dagas Cuánticas Arrojadizas',
        type: 'A Distancia',
        desc: 'Proyectiles de energía comprimida con recarga rápida para atacar a distancia.',
      },
      {
        name: 'Escudo de Luz Temporal',
        type: 'Defensa / Parry',
        desc: 'Barrera que desvía ataques enemigos y activa un contragolpe fulminante.',
      },
      {
        name: 'Singularidad de Kronos',
        type: 'Especial Mítico',
        desc: 'Detonación de vacío temporal durante el Dash que desacelera el entorno circundante.',
      },
    ],
  },
  {
    id: 'zyssa',
    name: 'Zyssa',
    subtitle: 'Sombra del Cerezo Astral',
    title: 'Kunoichi de la Dimensión Onírica',
    rarity: 'ÉPICO',
    rarityColor: 'text-fuchsia-400',
    rarityBorder: 'border-fuchsia-400',
    rarityGlow: 'rgba(217, 70, 239, 0.4)',
    rarityBg: 'bg-fuchsia-500/15',
    element: 'Éter Astral y Pétalos Sakura',
    quote: '«Entre el pétalo que cae y el filo que danza, el tiempo desaparece.»',
    isUnlocked: false,
    description:
      'Guerrera sigilosa de los santuarios espirituales. Se desplaza a la velocidad del pensamiento entre ráfagas de sakura etéreas y katanas espectrales.',
    abilities: [
      {
        name: 'Katanas Gemelas de Sakura',
        type: 'Ataque Doble',
        desc: 'Danza de hojas espectrales gemelas con cortes ultra-rápidos en abanico.',
      },
      {
        name: 'Shurikens Lunares Giratorios',
        type: 'A Distancia',
        desc: 'Estrellas de luz nocturna que persiguen suavemente las anomalías temporales.',
      },
      {
        name: 'Desvanecimiento de Niebla',
        type: 'Sigilo y Evasión',
        desc: 'Teletransporte instantáneo dejando atrás un señuelo de pétalos brillantes.',
      },
      {
        name: 'Vórtice del Loto Eterno',
        type: 'Especial Astral',
        desc: 'Torbellino místico de pétalos afilados que envuelve y suspende a los rivales.',
      },
    ],
  },
  {
    id: 'kael',
    name: 'Kael',
    subtitle: 'Baluarte del Núcleo Solar',
    title: 'Paladín de la Fusión Ígnea',
    rarity: 'MÍTICO',
    rarityColor: 'text-orange-400',
    rarityBorder: 'border-orange-400',
    rarityGlow: 'rgba(249, 115, 22, 0.4)',
    rarityBg: 'bg-orange-500/15',
    element: 'Fuego Estelar y Magma Cuántico',
    quote: '«Ni la gravedad ni el tiempo pueden extinguir la llama primordial.»',
    isUnlocked: false,
    description:
      'Imponente paladín forjado en las cámaras magmáticas subterráneas de Kronos. Porta un exoesqueleto alimentado por un reactor de supernova en miniatura.',
    abilities: [
      {
        name: 'Guantelete Sísmico Ígneo',
        type: 'Impacto Pesado',
        desc: 'Golpes contundentes que generan ondas de choque terrestres de magma concentrado.',
      },
      {
        name: 'Megacañón de Plasma Térmico',
        type: 'A Distancia',
        desc: 'Haz penetrante de fuego estelar que calcina las barreras temporales.',
      },
      {
        name: 'Blindaje de Radiación Solar',
        type: 'Defensa Pesada',
        desc: 'Barrera cinética que absorbe impactos y los devuelve como chispas radiantes.',
      },
      {
        name: 'Falla Volcánica Cataclísmica',
        type: 'Especial Titánico',
        desc: 'Sobrecarga de antimateria que detiene el suelo y desata columnas de lava estelar.',
      },
    ],
  },
];

export const CharacterLocker: React.FC<CharacterLockerProps> = ({
  slot,
  onBack,
  onSelectSkin,
}) => {
  const [selectedId, setSelectedId] = useState<CharacterId>('zion');
  const [activePose, setActivePose] = useState<'sword' | 'guard' | 'aura'>('sword');
  const [slashTrigger, setSlashTrigger] = useState<number>(0);

  const selectedChar = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];

  const handleSelectCharacter = (char: CharacterData) => {
    sound.playSfx('menuSelect');
    setSelectedId(char.id);
    if (char.isUnlocked && onSelectSkin) {
      onSelectSkin(char.id);
    }
  };

  const handleTriggerAction = () => {
    sound.playSfx('powerup');
    setSlashTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#04060f] text-white flex flex-col select-none overflow-x-hidden font-sans">
      {/* Dynamic Cosmic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e153b_0%,#090d22_50%,#02040c_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf806_1px,transparent_1px),linear-gradient(to_bottom,#38bdf806_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* HEADER: FORTNITE STYLE LOCKER */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="locker-back-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onBack();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver al Reloj</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-orange-500/20">
              <Shirt className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-cyan-400 uppercase">
                  SISTEMA DE CASILLERO & SKINS
                </span>
                <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                  FORTNITE STYLE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-wide">
                CASILLERO DE PERSONAJES
              </h1>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Zion: <span className="text-emerald-400 font-bold">Activo</span></span>
          </div>
        </div>
      </header>

      {/* MAIN LOCKER LAYOUT */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: GRAND 3D STAGE & SPOTLIGHT (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-between rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-[#080d21]/95 to-slate-950/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden min-h-[580px]">
          {/* Spotlight Cone & Ambient Color Tone */}
          <div
            className="absolute -top-20 w-96 h-[500px] blur-3xl pointer-events-none transition-all duration-700"
            style={{
              background:
                selectedChar.id === 'zion'
                  ? 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.25) 0%, transparent 75%)'
                  : selectedChar.id === 'zyssa'
                  ? 'radial-gradient(ellipse at center, rgba(217, 70, 239, 0.25) 0%, transparent 75%)'
                  : 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.25) 0%, transparent 75%)',
            }}
          />

          {/* Top Stage Bar: Rarity & Model Status */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border shadow-lg flex items-center gap-1.5 ${
                  selectedChar.rarity === 'LEGENDARIO'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-amber-500/20'
                    : selectedChar.rarity === 'ÉPICO'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/60 shadow-fuchsia-500/20'
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-orange-500/20'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{selectedChar.rarity}</span>
              </span>

              <span className="text-xs font-mono text-cyan-300/80 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                {selectedChar.element}
              </span>
            </div>

            {selectedChar.isUnlocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-sm">
                <Check className="w-3.5 h-3.5" />
                <span>EQUIPADO</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold shadow-sm">
                <Lock className="w-3.5 h-3.5" />
                <span>PRÓXIMAMENTE</span>
              </div>
            )}
          </div>

          {/* THE GRAND CHARACTER PODIUM */}
          <div className="relative my-6 w-full flex flex-col items-center justify-center flex-1 min-h-[280px]">
            {/* Holographic Concentric Rings on the Floor */}
            <div className="relative flex items-center justify-center">
              {/* Outer Rotating Energy Ring */}
              <div
                className="w-72 h-20 sm:w-88 sm:h-24 rounded-[50%] border-2 border-dashed transition-all duration-700 animate-spin"
                style={{
                  animationDuration: '24s',
                  borderColor:
                    selectedChar.id === 'zion'
                      ? 'rgba(34, 211, 238, 0.4)'
                      : selectedChar.id === 'zyssa'
                      ? 'rgba(244, 114, 182, 0.4)'
                      : 'rgba(251, 146, 60, 0.4)',
                }}
              />

              {/* Main Glowing Podium Disc */}
              <div
                className="absolute w-56 h-16 sm:w-72 sm:h-20 rounded-[50%] shadow-2xl flex items-center justify-center border-2 transition-all duration-500"
                style={{
                  background:
                    selectedChar.id === 'zion'
                      ? 'radial-gradient(ellipse at center, rgba(6,182,212,0.5) 0%, rgba(15,23,42,0.95) 75%)'
                      : selectedChar.id === 'zyssa'
                      ? 'radial-gradient(ellipse at center, rgba(217,70,239,0.5) 0%, rgba(15,23,42,0.95) 75%)'
                      : 'radial-gradient(ellipse at center, rgba(249,115,22,0.5) 0%, rgba(15,23,42,0.95) 75%)',
                  borderColor:
                    selectedChar.id === 'zion'
                      ? '#22d3ee'
                      : selectedChar.id === 'zyssa'
                      ? '#f472b6'
                      : '#fb923c',
                  boxShadow: `0 0 50px ${selectedChar.rarityGlow}`,
                }}
              >
                {/* Core light pillar */}
                <div
                  className="w-32 h-8 rounded-[50%] blur-sm"
                  style={{
                    backgroundColor:
                      selectedChar.id === 'zion'
                        ? 'rgba(56, 189, 248, 0.6)'
                        : selectedChar.id === 'zyssa'
                        ? 'rgba(244, 114, 182, 0.6)'
                        : 'rgba(251, 146, 60, 0.6)',
                  }}
                />
              </div>

              {/* CHARACTER MODEL ON THE PODIUM */}
              <div className="absolute -top-32 sm:-top-36 flex flex-col items-center">
                {/* SCENARIO 1: ZION (ACTIVE UNLOCKED HERO) */}
                {selectedChar.id === 'zion' && (
                  <div
                    key={slashTrigger}
                    onClick={handleTriggerAction}
                    className="relative cursor-pointer group select-none flex flex-col items-center"
                    title="¡Haz clic en Zion para blandir su Espada de Plasma Neón!"
                  >
                    {/* Floating Energy Halo */}
                    <div className="absolute -top-6 w-24 h-24 rounded-full bg-cyan-400/20 blur-xl animate-pulse pointer-events-none" />

                    {/* Crisp Pixel Character Canvas without blurry CSS scale */}
                    <div className="filter drop-shadow-[0_12px_28px_rgba(6,182,212,0.55)] transition-transform duration-300 group-hover:scale-105 active:scale-95">
                      <PixelCharacter
                        scale={activePose === 'sword' ? 4.2 : 3.8}
                        actionPose={activePose === 'sword' || slashTrigger > 0}
                        interactive={true}
                      />
                    </div>

                    {/* Interactive Click Tip Pill */}
                    <div className="mt-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span>Haz clic para blandir la Espada de Luz</span>
                    </div>
                  </div>
                )}

                {/* SCENARIO 2: ZYSSA (ASTRAL SAKURA KUNOICHI TEASER) */}
                {selectedChar.id === 'zyssa' && (
                  <div className="relative flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-500">
                    {/* Sakura petals & Astral Aura */}
                    <div className="absolute -top-10 w-36 h-36 rounded-full bg-fuchsia-500/20 blur-2xl animate-pulse pointer-events-none" />

                    {/* Hologram Scanner Line */}
                    <div className="absolute -top-12 w-48 h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent blur-sm animate-bounce pointer-events-none" />

                    {/* STYLIZED KUNOICHI SILHOUETTE AVATAR */}
                    <div className="relative w-44 h-56 rounded-3xl border-2 border-fuchsia-400/60 bg-gradient-to-b from-fuchsia-950/70 via-slate-900/90 to-[#100922] p-4 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.35)] overflow-hidden group">
                      {/* Cyber grid lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(217,70,239,0.1)_1px,transparent_1px)] bg-[size:100%_6px] pointer-events-none" />

                      {/* Floating Sakura Petals SVG */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-75" viewBox="0 0 160 220">
                        <circle cx="30" cy="40" r="3" fill="#f472b6" className="animate-ping" style={{ animationDuration: '3s' }} />
                        <circle cx="130" cy="65" r="2.5" fill="#e879f9" className="animate-ping" style={{ animationDuration: '4s' }} />
                        <circle cx="45" cy="160" r="3.5" fill="#f472b6" opacity="0.6" />
                        <circle cx="115" cy="180" r="2" fill="#c084fc" opacity="0.8" />
                      </svg>

                      {/* Mysterious Kunoichi Avatar Icon */}
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-fuchsia-900/50 to-slate-950 border-2 border-fuchsia-400/80 flex items-center justify-center shadow-lg mb-2">
                        {/* Dual crossing ethereal katanas */}
                        <Swords className="w-12 h-12 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      </div>

                      <span className="text-xs font-black font-heading tracking-widest text-fuchsia-300">
                        ZYSSA
                      </span>
                      <span className="text-[10px] font-mono text-fuchsia-400/80 mt-0.5">
                        Kunoichi Astral
                      </span>

                      <div className="mt-2 px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-[9px] font-mono font-bold text-fuchsia-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>PRÓXIMAMENTE</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENARIO 3: KAEL (SOLAR CORE PALADIN TEASER) */}
                {selectedChar.id === 'kael' && (
                  <div className="relative flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-500">
                    {/* Fiery Solar Corona & Embers */}
                    <div className="absolute -top-10 w-36 h-36 rounded-full bg-orange-500/25 blur-2xl animate-pulse pointer-events-none" />

                    {/* Hologram Scanner Line */}
                    <div className="absolute -top-12 w-48 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-sm animate-bounce pointer-events-none" />

                    {/* STYLIZED SOLAR PALADIN SILHOUETTE AVATAR */}
                    <div className="relative w-44 h-56 rounded-3xl border-2 border-orange-400/60 bg-gradient-to-b from-orange-950/70 via-slate-900/90 to-[#1f0b07] p-4 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.35)] overflow-hidden group">
                      {/* Cyber grid lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:100%_6px] pointer-events-none" />

                      {/* Floating Ember sparks SVG */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 160 220">
                        <circle cx="35" cy="50" r="3" fill="#fb923c" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                        <circle cx="125" cy="80" r="2.5" fill="#f59e0b" className="animate-ping" style={{ animationDuration: '3.5s' }} />
                        <circle cx="50" cy="170" r="3" fill="#ea580c" opacity="0.6" />
                        <circle cx="110" cy="165" r="2" fill="#facc15" opacity="0.8" />
                      </svg>

                      {/* Formidable Paladin Shield & Core Icon */}
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-900/50 to-slate-950 border-2 border-orange-400/80 flex items-center justify-center shadow-lg mb-2">
                        <Shield className="w-12 h-12 text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]" />
                        <Flame className="w-6 h-6 text-amber-300 absolute inset-0 m-auto animate-pulse" />
                      </div>

                      <span className="text-xs font-black font-heading tracking-widest text-orange-300">
                        KAEL
                      </span>
                      <span className="text-[10px] font-mono text-orange-400/80 mt-0.5">
                        Paladín Solar
                      </span>

                      <div className="mt-2 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[9px] font-mono font-bold text-orange-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>PRÓXIMAMENTE</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stance Selector for Zion */}
          {selectedChar.id === 'zion' && (
            <div className="w-full z-10 flex items-center justify-center gap-2 mb-2">
              <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">
                Postura:
              </span>
              <button
                onClick={() => {
                  sound.playSfx('sword');
                  setActivePose('sword');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activePose === 'sword'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ⚔️ Espada Neón
              </button>
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setActivePose('guard');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activePose === 'guard'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🛡️ Guardia Ninja
              </button>
              <button
                onClick={() => {
                  sound.playSfx('powerup');
                  setActivePose('aura');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activePose === 'aura'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ✨ Aura Cuántica
              </button>
            </div>
          )}

          {/* Character Identity & Lore Bio (No stats bars, as requested) */}
          <div className="w-full z-10 pt-4 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                  {selectedChar.name}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-cyan-300/90 font-bold">
                  {selectedChar.title}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 italic">
                {selectedChar.quote}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {selectedChar.description}
            </p>

            {/* Combat Style & Loadout Showcase */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARSENAL & MAESTRÍA DE COMBATE</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedChar.abilities.map((ab, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-2.5"
                  >
                    <div
                      className="p-1.5 rounded-lg border shrink-0 mt-0.5"
                      style={{
                        backgroundColor: selectedChar.rarityBg,
                        borderColor: selectedChar.rarityColor,
                      }}
                    >
                      {idx === 0 && <Swords className="w-3.5 h-3.5 text-cyan-400" />}
                      {idx === 1 && <Crosshair className="w-3.5 h-3.5 text-amber-400" />}
                      {idx === 2 && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                      {idx === 3 && <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white font-heading">
                          {ab.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {ab.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {ab.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORTNITE STYLE LOCKER SELECTION CARDS (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white font-heading tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>SELECCIONAR TRAJE / SKIN</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              1 Disponible • 2 Próximamente
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {CHARACTERS.map((char) => {
              const isSelected = selectedId === char.id;
              const isUnlocked = char.isUnlocked;

              return (
                <div
                  key={char.id}
                  id={`locker-slot-${char.id}`}
                  onClick={() => handleSelectCharacter(char)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer select-none overflow-hidden ${
                    isSelected
                      ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-[1.01]'
                      : isUnlocked
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                      : 'border-slate-800/80 bg-slate-950/60 opacity-80 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  {/* Subtle Rarity Glow Background Corner */}
                  <div
                    className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-25"
                    style={{
                      backgroundColor:
                        char.id === 'zion'
                          ? '#38bdf8'
                          : char.id === 'zyssa'
                          ? '#e879f9'
                          : '#fb923c',
                    }}
                  />

                  <div className="flex items-center gap-4">
                    {/* Character Card Thumbnail */}
                    <div
                      className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center shrink-0 overflow-hidden shadow-md"
                      style={{
                        borderColor: isSelected
                          ? '#22d3ee'
                          : isUnlocked
                          ? '#f59e0b'
                          : char.id === 'zyssa'
                          ? '#c084fc'
                          : '#fb923c',
                        background: isUnlocked
                          ? 'radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, #090d1a 100%)'
                          : char.id === 'zyssa'
                          ? 'radial-gradient(circle at center, rgba(217,70,239,0.25) 0%, #090d1a 100%)'
                          : 'radial-gradient(circle at center, rgba(249,115,22,0.25) 0%, #090d1a 100%)',
                      }}
                    >
                      {/* Zion Crisp Avatar */}
                      {char.id === 'zion' && (
                        <div className="transform scale-[1.2] origin-center">
                          <PixelCharacter scale={2} interactive={false} />
                        </div>
                      )}

                      {/* Zyssa Kunoichi Icon */}
                      {char.id === 'zyssa' && (
                        <div className="flex flex-col items-center justify-center text-fuchsia-400">
                          <Swords className="w-8 h-8 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                          <span className="text-[9px] font-mono font-black mt-0.5 text-fuchsia-300">
                            ZYSSA
                          </span>
                        </div>
                      )}

                      {/* Kael Paladin Icon */}
                      {char.id === 'kael' && (
                        <div className="flex flex-col items-center justify-center text-orange-400">
                          <Shield className="w-8 h-8 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                          <span className="text-[9px] font-mono font-black mt-0.5 text-orange-300">
                            KAEL
                          </span>
                        </div>
                      )}

                      {/* Checkmark Badge if equipped */}
                      {isUnlocked && (
                        <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-emerald-500 text-slate-950 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase ${
                            char.rarity === 'LEGENDARIO'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : char.rarity === 'ÉPICO'
                              ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          }`}
                        >
                          ★ {char.rarity}
                        </span>

                        {isUnlocked ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            EQUIPADO
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                            PRÓXIMAMENTE
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-white mt-1 truncate font-heading">
                        {char.name}
                      </h4>
                      <p className="text-xs text-slate-300 truncate">
                        {char.subtitle}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                        {isUnlocked ? 'Aspecto principal de Zion' : 'Nueva skin en desarrollo'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>

                  {/* Bottom Strip: Action / Preview */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      {isUnlocked
                        ? 'Haz clic para inspeccionar en el podio'
                        : 'Próxima actualización de Kronos'}
                    </span>
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {isSelected ? 'Mostrando' : 'Ver modelo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fortnite Locker Tip Notice */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200/90 flex items-start gap-3 mt-1 shadow-lg">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-300 font-heading">
                ¡Casillero activado por el Gran Reloj de Kronos!
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Al restaurar el mecanismo temporal ancestral, has desbloqueado el espacio de skins y personalización. Actualmente Zion está equipado. Zyssa y Kael se habilitarán próximamente para equipar en tu aventura.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
