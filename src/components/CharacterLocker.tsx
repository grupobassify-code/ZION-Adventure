import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Swords,
  Shirt,
  Star,
  Lock,
  Clock,
  Zap,
  Activity,
  Gamepad2,
} from 'lucide-react';
import { PixelCharacter } from './PixelCharacter';
import { SaveSlot, CharacterSkin } from '../types';
import { sound } from '../audio/soundEngine';
import { CHARACTERS_CONFIG, CharacterConfig } from '../game/characterConfig';
import { isCharacterSkinUnlocked, hasKronosPiece } from '../game/saveManager';

interface CharacterLockerProps {
  slot: SaveSlot | null;
  onBack: () => void;
  onSelectSkin?: (skinId: string) => void;
}

const VALID_SKINS: CharacterSkin[] = [
  'zion',
  'zizz',
  'kael',
  'anuk',
  'vector',
  'balam',
  'blizzard',
  'steampunk',
  'castlesmash',
  'pirate',
  'jurassic',
  'moon',
];

export const CharacterLocker: React.FC<CharacterLockerProps> = ({
  slot,
  onBack,
  onSelectSkin,
}) => {
  const skinFromSlot = slot?.selectedSkin as CharacterSkin;
  const initialEquipped: CharacterSkin =
    VALID_SKINS.includes(skinFromSlot) && isCharacterSkinUnlocked(slot, skinFromSlot)
      ? skinFromSlot
      : 'zion';

  const [equippedId, setEquippedId] = useState<CharacterSkin>(initialEquipped);
  const [selectedId, setSelectedId] = useState<CharacterSkin>(initialEquipped);
  const [viewMode, setViewMode] = useState<'pixelArt' | 'animatedSprite'>('pixelArt');
  const [slashTrigger, setSlashTrigger] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'preview'>('catalog');

  const characterList: CharacterConfig[] = [
    CHARACTERS_CONFIG.zion,
    CHARACTERS_CONFIG.zizz,
    CHARACTERS_CONFIG.kael,
    CHARACTERS_CONFIG.anuk,
    CHARACTERS_CONFIG.vector,
    CHARACTERS_CONFIG.balam,
    CHARACTERS_CONFIG.blizzard,
    CHARACTERS_CONFIG.steampunk,
    CHARACTERS_CONFIG.castlesmash,
    CHARACTERS_CONFIG.pirate,
    CHARACTERS_CONFIG.jurassic,
    CHARACTERS_CONFIG.moon,
  ];

  const selectedChar = CHARACTERS_CONFIG[selectedId] || CHARACTERS_CONFIG.zion;
  const isSelectedUnlocked = isCharacterSkinUnlocked(slot, selectedChar.id);
  const isCurrentlyEquipped = equippedId === selectedChar.id;
  const totalUnlocked = characterList.filter((c) => isCharacterSkinUnlocked(slot, c.id)).length;
  const selectedHasPieceInBag = selectedChar.unlockPieceId
    ? hasKronosPiece(slot, selectedChar.unlockPieceId)
    : false;

  const handleSelectCharacter = (charId: CharacterSkin) => {
    sound.playSfx('menuSelect');
    setSelectedId(charId);
  };

  const handleEquipCharacter = (charId: CharacterSkin) => {
    if (!isCharacterSkinUnlocked(slot, charId)) {
      sound.playSfx('error');
      return;
    }
    sound.playSfx('powerup');
    setEquippedId(charId);
    if (onSelectSkin) {
      onSelectSkin(charId);
    }
  };

  const handleTriggerAction = () => {
    if (selectedChar.id === 'kael' || selectedChar.id === 'balam') {
      sound.playSfx('heavySlam');
    } else if (selectedChar.id === 'zizz') {
      sound.playSfx('crit');
    } else {
      sound.playSfx('sword');
    }
    setSlashTrigger((prev) => prev + 1);
  };

  const getThemeColor = (id: CharacterSkin) => {
    switch (id) {
      case 'zion':
        return '#22d3ee';
      case 'zizz':
        return '#f472b6';
      case 'kael':
        return '#f97316';
      case 'anuk':
        return '#eab308';
      case 'vector':
        return '#6366f1';
      case 'balam':
        return '#10b981';
      case 'blizzard':
        return '#38bdf8';
      case 'steampunk':
        return '#f59e0b';
      case 'castlesmash':
        return '#3b82f6';
      case 'pirate':
        return '#14b8a6';
      case 'jurassic':
        return '#84cc16';
      case 'moon':
        return '#a855f7';
      default:
        return '#22d3ee';
    }
  };

  const themeColor = getThemeColor(selectedChar.id);

  return (
    <div className="relative w-full min-h-screen bg-[#050713] text-white flex flex-col select-none overflow-x-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#141938_0%,#090c22_50%,#03050e_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf804_1px,transparent_1px),linear-gradient(to_bottom,#38bdf804_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* CLEAN RESPONSIVE HEADER */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            id="locker-back-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span>Volver</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-white font-heading tracking-wide flex items-center gap-1.5 truncate">
              <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
              <span>CASILLERO DE SKINS</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
              {totalUnlocked} de {characterList.length} Skins Desbloqueadas
            </p>
          </div>
        </div>

        {/* Current Equipped Skin Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 hidden xs:inline">Skin Activa:</span>
          <span className="text-emerald-400 font-bold truncate max-w-[130px] sm:max-w-none">
            {CHARACTERS_CONFIG[equippedId]?.name || 'Zion Clásico'}
          </span>
        </div>
      </header>

      {/* MOBILE TABS SWITCHER (Visible only on mobile/tablet screens < lg) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-2.5 pb-0 lg:hidden">
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setMobileTab('catalog');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'catalog'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Catálogo ({totalUnlocked}/{characterList.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              setMobileTab('preview');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Zion & Poder</span>
          </button>
        </div>
      </div>

      {/* MAIN LOCKER LAYOUT */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex-1 px-3 sm:px-6 py-3 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-stretch">
        
        {/* LEFT / CENTER: HERO SHOWCASE (Cols 1-7) - Full view on Desktop, Tab on Mobile */}
        <div
          className={`lg:col-span-7 flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-5 md:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl min-h-[auto] lg:min-h-[540px] ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Ambient Glow */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl pointer-events-none opacity-40 transition-all duration-500"
            style={{ backgroundColor: themeColor }}
          />

          {/* Top Bar: Rarity, Origin & Mode Toggle */}
          <div className="w-full flex items-center justify-between z-10 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black tracking-wider uppercase border flex items-center gap-1 ${
                  selectedChar.rarity === 'LEGENDARIO'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : selectedChar.rarity === 'ÉPICO'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50'
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                }`}
              >
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span>{selectedChar.rarity}</span>
              </span>

              <span className="text-[10px] sm:text-xs font-mono text-cyan-300/90 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800">
                {selectedChar.unlockZoneName}
              </span>
            </div>

            {/* View Mode Toggle: 16-Bit Pixel Art vs Sprite Animation */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setViewMode('pixelArt');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'pixelArt'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Pixel Art</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setViewMode('animatedSprite');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'animatedSprite'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Sprite</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Pixel Art Masterpiece OR Animated Canvas Sprite (Fluidly sized on mobile) */}
          <div className="relative my-auto flex flex-col items-center justify-center py-2 sm:py-4 w-full z-10">
            {viewMode === 'pixelArt' ? (
              <div className="relative group flex flex-col items-center">
                {/* 16-Bit Pixel Art Card Showcase */}
                <div
                  className="relative w-40 sm:w-60 md:w-72 h-48 sm:h-68 md:h-84 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 group-hover:scale-102 bg-slate-950"
                  style={{ borderColor: themeColor }}
                >
                  <img
                    src={selectedChar.pixelArtImage}
                    alt={selectedChar.name}
                    referrerPolicy="no-referrer"
                    style={{ imageRendering: 'pixelated' }}
                    className="w-full h-full object-cover object-center filter brightness-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />

                  {/* Lock Overlay if locked */}
                  {!isSelectedUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 sm:p-4 text-center">
                      <div className="p-2 sm:p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1.5 sm:mb-2">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-300">
                        {selectedChar.unlockRequirement}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-1.5 text-[9px] sm:text-[10px] font-mono text-cyan-300/80">
                  ★ Traje dimensional para Zion en Pixel Art 16-bit
                </p>
              </div>
            ) : (
              <div
                key={slashTrigger}
                onClick={handleTriggerAction}
                className={`cursor-pointer group select-none flex flex-col items-center transition-transform hover:scale-105 active:scale-95 ${
                  !isSelectedUnlocked ? 'opacity-85' : ''
                }`}
                title="¡Haz clic para probar el ataque y la hitbox en movimiento!"
              >
                {/* 3D Rotating Cyber Podium */}
                <div className="relative flex items-center justify-center mt-3 sm:mt-6">
                  <div
                    className="w-36 sm:w-52 h-9 sm:h-14 rounded-[100%] border border-cyan-400/40 bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner"
                    style={{ borderColor: themeColor }}
                  />

                  {/* Character Pixel Canvas with Animation */}
                  <div className="absolute -top-20 sm:-top-32 flex flex-col items-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] scale-85 sm:scale-100">
                    <PixelCharacter
                      scale={3.6}
                      actionPose={slashTrigger > 0}
                      characterId={selectedChar.id}
                      interactive={true}
                    />
                  </div>
                </div>

                <div className="mt-3 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[9px] sm:text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Toca para probar ataque y animación</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Info & Action */}
          <div className="w-full z-10 pt-2.5 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-heading">
                  {selectedChar.name}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 font-mono">
                  {selectedChar.subtitle}
                </p>
              </div>

              {/* Equip Action Button */}
              {isCurrentlyEquipped ? (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>SKIN EQUIPADA</span>
                </div>
              ) : isSelectedUnlocked ? (
                <button
                  id="locker-equip-btn"
                  onClick={() => handleEquipCharacter(selectedChar.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm font-heading shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>EQUIPAR SKIN</span>
                </button>
              ) : selectedHasPieceInBag ? (
                <button
                  onClick={() => {
                    sound.playSfx('menuSelect');
                    onBack();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 fill-slate-950" />
                  <span>IR AL RELOJ A ENCAJAR</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-mono font-bold">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>SKIN BLOQUEADA</span>
                </div>
              )}
            </div>

            {/* Essential Combat Loadout Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">
                    Arma Melee · {selectedChar.meleeReach}px
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {selectedChar.abilities[0]?.name || 'Arma Principal'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">
                    Superpoder (Q/V) · Radio {selectedChar.specialRadius}px
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {selectedChar.specialName}
                  </span>
                </div>
              </div>
            </div>

            {/* Unlock requirement message if locked */}
            {!isSelectedUnlocked && (
              <p className="text-[10px] sm:text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <Lock className="w-3 h-3 shrink-0" />
                <span>{selectedChar.unlockRequirement}</span>
              </p>
            )}

            {/* Mobile switch back to catalog button */}
            <div className="pt-1 flex justify-center lg:hidden">
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setMobileTab('catalog');
                }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 py-1"
              >
                <span>← Volver al Catálogo de Skins</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: CLEAN SKIN SELECTION CARDS (Cols 8-12) - Full view on Desktop, Tab on Mobile */}
        <div
          className={`lg:col-span-5 flex flex-col gap-2 ${
            mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-cyan-400" />
              <span>Skins de Zion ({totalUnlocked}/{characterList.length})</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400">
              Toca para equipar o ver
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 overflow-y-auto max-h-[460px] sm:max-h-[500px] lg:max-h-[580px] pr-0.5 touch-pan-y">
            {characterList.map((char) => {
              const isSelected = selectedId === char.id;
              const isEquipped = equippedId === char.id;
              const isUnlocked = isCharacterSkinUnlocked(slot, char.id);
              const cardColor = getThemeColor(char.id);

              return (
                <div
                  key={char.id}
                  id={`locker-slot-${char.id}`}
                  onClick={() => {
                    handleSelectCharacter(char.id);
                  }}
                  className={`relative p-2.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-900 shadow-[0_0_18px_rgba(6,182,212,0.35)] scale-[1.01]'
                      : isEquipped
                      ? 'border-emerald-500/60 bg-slate-900/90'
                      : !isUnlocked
                      ? 'border-slate-800/80 bg-slate-950/70 opacity-80 hover:opacity-100 hover:border-slate-700'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Pixel Art Thumbnail */}
                    <div
                      className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl border-2 shrink-0 overflow-hidden bg-slate-950 shadow"
                      style={{
                        borderColor: isSelected
                          ? '#22d3ee'
                          : isEquipped
                          ? '#10b981'
                          : !isUnlocked
                          ? '#334155'
                          : cardColor,
                      }}
                    >
                      <img
                        src={char.pixelArtImage}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        style={{ imageRendering: 'pixelated' }}
                        className={`w-full h-full object-cover object-top ${!isUnlocked ? 'filter grayscale brightness-50' : ''}`}
                      />

                      {/* Equipped Check */}
                      {isEquipped && (
                        <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-emerald-500 text-slate-950 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Lock */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Name & Origin */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-white font-heading truncate">
                          {char.name}
                        </h4>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            char.rarity === 'LEGENDARIO'
                              ? 'bg-amber-500/20 text-amber-300'
                              : char.rarity === 'ÉPICO'
                              ? 'bg-fuchsia-500/20 text-fuchsia-300'
                              : 'bg-orange-500/20 text-orange-300'
                          }`}
                        >
                          {char.rarity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {char.unlockZoneName}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status on Mobile & Desktop */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isEquipped ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Activa
                      </span>
                    ) : isUnlocked ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipCharacter(char.id);
                          }}
                          className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-[10px] sm:text-xs font-heading shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Equipar</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(char.id);
                            setMobileTab('preview');
                          }}
                          className="p-1 sm:hidden rounded-lg bg-slate-800 text-cyan-400 text-[10px] font-mono"
                          title="Ver detalle"
                        >
                          Ver
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          <span>Bloq</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(char.id);
                            setMobileTab('preview');
                          }}
                          className="p-1 sm:hidden rounded-lg bg-slate-800 text-slate-400 text-[10px] font-mono"
                          title="Ver requisito"
                        >
                          Ver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};
