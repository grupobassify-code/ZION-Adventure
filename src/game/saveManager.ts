import { SaveSlot, ZoneId } from '../types';
import { LEVEL_CONFIGS } from './levelData';

// Storage keys - Clean V3 version to reset all prior progress
const SAVE_KEY = 'zion_adventure_save_v3';
const ACTIVE_SLOT_KEY = 'zion_active_slot_v3';

// Clean out legacy keys on startup
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('zion_adventure_save_slots');
    localStorage.removeItem('zion_adventure_save_slots_v2');
    localStorage.removeItem('zion_active_slot_id');
  }
} catch {}

export const MAX_SAVE_SLOTS = 3;

/**
 * Resets all progress on the device back to initial fresh state
 */
export function resetAllSaveData(): (SaveSlot | null)[] {
  try {
    const freshSlots: (SaveSlot | null)[] = [
      {
        id: 0,
        name: 'Partida 1',
        createdAt: Date.now(),
        lastPlayed: Date.now(),
        unlockedLevels: [0], // Only Level 1 / Act 1 unlocked
        completedLevels: [],
        totalScore: 0,
        totalCrystals: 0,
        totalSecrets: 0,
        deaths: 0,
        playTimeSeconds: 0,
        characterLevel: 1,
      },
      null,
      null,
    ];
    localStorage.setItem(SAVE_KEY, JSON.stringify(freshSlots));
    localStorage.setItem(ACTIVE_SLOT_KEY, '0');
    return freshSlots;
  } catch (e) {
    console.error('Error resetting save data:', e);
    return [null, null, null];
  }
}

export function loadAllSaveSlots(): (SaveSlot | null)[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return resetAllSaveData();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const slots: (SaveSlot | null)[] = [null, null, null];
      for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
        slots[i] = parsed[i] || null;
      }
      return slots;
    }
  } catch (e) {
    console.error('Error loading save slots:', e);
  }
  return resetAllSaveData();
}

export function saveAllSlots(slots: (SaveSlot | null)[]): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error('Error saving slots to device:', e);
  }
}

export function getActiveSlotId(): number {
  try {
    const raw = localStorage.getItem(ACTIVE_SLOT_KEY);
    if (raw !== null) {
      const id = parseInt(raw, 10);
      if (!isNaN(id) && id >= 0 && id < MAX_SAVE_SLOTS) {
        return id;
      }
    }
  } catch {}
  return 0;
}

export function setActiveSlotId(id: number): void {
  try {
    localStorage.setItem(ACTIVE_SLOT_KEY, id.toString());
  } catch {}
}

export function getActiveSaveSlot(): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const id = getActiveSlotId();
  return slots[id] || null;
}

export function createNewSaveSlot(slotId: number, name: string): SaveSlot {
  const slots = loadAllSaveSlots();
  const newSlot: SaveSlot = {
    id: slotId,
    name: name.trim() || `Partida ${slotId + 1}`,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    unlockedLevels: [0], // Only first level unlocked
    completedLevels: [],
    totalScore: 0,
    totalCrystals: 0,
    totalSecrets: 0,
    deaths: 0,
    playTimeSeconds: 0,
    characterLevel: 1,
  };
  slots[slotId] = newSlot;
  saveAllSlots(slots);
  setActiveSlotId(slotId);
  return newSlot;
}

export function deleteSaveSlot(slotId: number): void {
  const slots = loadAllSaveSlots();
  slots[slotId] = null;
  saveAllSlots(slots);
}

/**
 * Saves current checkpoint & level progress directly to device storage
 */
export function recordCheckpointSave(
  slotId: number,
  levelIndex: number,
  score: number,
  crystals: number,
  playerLevel = 1
): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  slot.lastPlayed = Date.now();
  slot.characterLevel = Math.max(slot.characterLevel, playerLevel);
  if (!slot.unlockedLevels.includes(levelIndex)) {
    slot.unlockedLevels.push(levelIndex);
  }

  slots[slotId] = slot;
  saveAllSlots(slots);
  return slot;
}

/**
 * Saves level completion, scores and unlocks next level
 */
export function recordLevelCompletion(
  slotId: number,
  levelIndex: number,
  stats: {
    score: number;
    crystals: number;
    secrets: number;
    deaths: number;
    time: number;
  },
  playerLevel = 1
): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  slot.lastPlayed = Date.now();
  slot.totalScore += stats.score;

  // Anti-farming protection: Only award crystals that exceed previous best record for this level
  slot.levelBestCrystals = slot.levelBestCrystals || {};
  const prevBestCrystals = slot.levelBestCrystals[levelIndex] || 0;
  if (stats.crystals > prevBestCrystals) {
    const newCrystalsEarned = stats.crystals - prevBestCrystals;
    slot.totalCrystals += newCrystalsEarned;
    slot.levelBestCrystals[levelIndex] = stats.crystals;
  }

  slot.totalSecrets += stats.secrets;
  slot.deaths += stats.deaths;
  slot.playTimeSeconds += Math.round(stats.time);
  slot.characterLevel = Math.max(slot.characterLevel, playerLevel);

  if (!slot.completedLevels.includes(levelIndex)) {
    slot.completedLevels.push(levelIndex);
  }

  // Unlock next level sequentially
  const nextLevel = levelIndex + 1;
  if (nextLevel < LEVEL_CONFIGS.length && !slot.unlockedLevels.includes(nextLevel)) {
    slot.unlockedLevels.push(nextLevel);
  }

  // If final boss of Krono City is beaten, unlock Kronos Travel
  const kronoFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-3');
  const travelIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'travel-1');
  if (levelIndex === kronoFinalBossIdx && travelIdx !== -1 && !slot.unlockedLevels.includes(travelIdx)) {
    slot.unlockedLevels.push(travelIdx);
  }

  slots[slotId] = slot;
  saveAllSlots(slots);
  return slot;
}

export function isLevelUnlockedInSlot(slot: SaveSlot | null, levelIndex: number): boolean {
  if (!slot) return levelIndex === 0;
  return slot.unlockedLevels.includes(levelIndex);
}

/**
 * Identifies if a level contains a major boss battle (boss levels cannot be selected in VS IA or Contrarreloj)
 */
export function isBossLevel(levelIndex: number): boolean {
  const cfg = LEVEL_CONFIGS[levelIndex];
  if (!cfg) return false;
  return ['neon-3', 'sakura-3', 'lavacliff-3', 'desert-3', 'krono-3'].includes(cfg.id);
}

/**
 * VS IA mode is unlocked upon defeating the Sakura world boss (sakura-3 / Level 5)
 */
export function isVsAiUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  const sakuraBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'sakura-3');
  const targetIdx = sakuraBossIdx !== -1 ? sakuraBossIdx : 5;
  return slot.completedLevels.includes(targetIdx) || slot.unlockedLevels.some((lvl) => lvl > targetIdx);
}

/**
 * Contrarreloj (Time Attack) mode is unlocked upon defeating Boss 3 of Lavacliff (lavacliff-3 / Level 8)
 */
export function isTimeAttackUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  const lavacliffBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'lavacliff-3');
  const targetIdx = lavacliffBossIdx !== -1 ? lavacliffBossIdx : 8;
  return slot.completedLevels.includes(targetIdx) || slot.unlockedLevels.some((lvl) => lvl > targetIdx);
}

export function getLevelBestTime(slotId: number, levelIndex: number): number | null {
  try {
    const raw = localStorage.getItem(`zion_time_attack_best_${slotId}_lvl_${levelIndex}`);
    if (raw !== null) {
      const val = parseFloat(raw);
      return isNaN(val) ? null : val;
    }
  } catch {}
  return null;
}

export function saveLevelBestTime(slotId: number, levelIndex: number, timeMs: number): boolean {
  try {
    const current = getLevelBestTime(slotId, levelIndex);
    if (current === null || timeMs < current) {
      localStorage.setItem(`zion_time_attack_best_${slotId}_lvl_${levelIndex}`, timeMs.toString());
      return true;
    }
  } catch {}
  return false;
}

/**
 * Kronos Only Up is unlocked as soon as Bosque Neón is conquered (neon-3 boss defeated)
 */
export function isOnlyUpUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  const neonBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'neon-3');
  const targetIdx = neonBossIdx !== -1 ? neonBossIdx : 2;
  return slot.completedLevels.includes(targetIdx) || slot.unlockedLevels.some((lvl) => lvl > targetIdx);
}

export function getOnlyUpRecord(slotId: number): number {
  try {
    const raw = localStorage.getItem(`zion_only_up_record_slot_${slotId}`);
    if (raw !== null) {
      const val = parseInt(raw, 10);
      return isNaN(val) ? 0 : val;
    }
  } catch {}
  return 0;
}

export function saveOnlyUpRecord(slotId: number, altitude: number): boolean {
  try {
    const current = getOnlyUpRecord(slotId);
    if (altitude > current) {
      localStorage.setItem(`zion_only_up_record_slot_${slotId}`, altitude.toString());
      return true;
    }
  } catch {}
  return false;
}

export function getZoneCompletion(slot: SaveSlot | null, zone: ZoneId): { completed: number; total: number; unlocked: boolean } {
  const zoneLevels = LEVEL_CONFIGS.map((cfg, idx) => ({ cfg, idx })).filter((item) => item.cfg.zone === zone);
  const total = zoneLevels.length;
  if (!slot) {
    const isFirstZone = zone === 'neon';
    return { completed: 0, total, unlocked: isFirstZone };
  }

  let completed = 0;
  let hasAnyUnlocked = false;

  for (const item of zoneLevels) {
    if (slot.completedLevels.includes(item.idx)) completed++;
    if (slot.unlockedLevels.includes(item.idx)) hasAnyUnlocked = true;
  }

  return { completed, total, unlocked: hasAnyUnlocked };
}

/**
 * Checks if Special Stages are unlocked as an extra level mode.
 * The requirement: "añade que puedes jugar las special stages, como un nivel extra, pero solo hasta que completes, minimo una"
 */
export function isSpecialStageUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  return Boolean(slot.specialStageUnlocked || (slot.specialStagesCompleted && slot.specialStagesCompleted >= 1));
}

/**
 * Records completion of at least one Special Stage on the given slot
 */
export function recordSpecialStageCompleted(slotId: number): void {
  try {
    const slots = loadAllSaveSlots();
    const slot = slots[slotId];
    if (slot) {
      slot.specialStageUnlocked = true;
      slot.specialStagesCompleted = (slot.specialStagesCompleted || 0) + 1;
      slot.lastPlayed = Date.now();
      saveAllSlots(slots);
    }
  } catch (e) {
    console.error('Error recording special stage completion:', e);
  }
}

export interface KronosPieceInfo {
  id: 'neon' | 'sakura' | 'lavacliff' | 'desert' | 'krono';
  name: string;
  subtitle: string;
  bossName: string;
  zoneName: string;
  levelId: string;
  levelIndex: number;
  color: string;
  accentColor: string;
  position: 'top' | 'right' | 'bottomRight' | 'bottomLeft' | 'center';
  angle: number;
  iconName: string;
  lore: string;
}

export const KRONOS_PIECES: KronosPieceInfo[] = [
  {
    id: 'neon',
    name: 'Dial Solar Neón',
    subtitle: 'Corona Bioluminiscente Ancestral',
    bossName: 'Guardián Neón MK-IV',
    zoneName: 'Bosque Neón (Acto 3)',
    levelId: 'neon-3',
    levelIndex: 2,
    color: '#22d3ee',
    accentColor: '#4ade80',
    position: 'top',
    angle: 0,
    iconName: 'Sun',
    lore: 'Canaliza la energía cuántica de las raíces de la arboleda para sincronizar el amanecer temporal.',
  },
  {
    id: 'sakura',
    name: 'Péndulo Místico Sakura',
    subtitle: 'Agujas Espirituales de Cristal',
    bossName: 'Maestra Kunoichi Rosa',
    zoneName: 'Cerezo Espiritual (Acto 3)',
    levelId: 'sakura-3',
    levelIndex: 5,
    color: '#f472b6',
    accentColor: '#fb7185',
    position: 'right',
    angle: 72,
    iconName: 'Sparkles',
    lore: 'Oscila entre las dimensiones astrales asegurando un paso suave y preciso de los segundos.',
  },
  {
    id: 'lavacliff',
    name: 'Engranaje Térmico Ígneo',
    subtitle: 'Rueda Dentada de Basalto Forjado',
    bossName: 'Coloso Ignis',
    zoneName: 'Acantilados de Lava (Acto 3)',
    levelId: 'lavacliff-3',
    levelIndex: 8,
    color: '#f97316',
    accentColor: '#ef4444',
    position: 'bottomRight',
    angle: 144,
    iconName: 'Flame',
    lore: 'Transmite la inmensa fuerza motriz del magma primigenio para impulsar los ejes del reloj.',
  },
  {
    id: 'desert',
    name: 'Resorte Astral de la Eternidad',
    subtitle: 'Espiral Sagrada de Arena Dorada',
    bossName: 'Faraón Akhen\'Ra',
    zoneName: 'Santuario del Desierto (Acto 3)',
    levelId: 'desert-3',
    levelIndex: 11,
    color: '#f59e0b',
    accentColor: '#10b981',
    position: 'bottomLeft',
    angle: 216,
    iconName: 'Clock',
    lore: 'Mantiene la tensión cósmica para que el tiempo nunca decaiga ni se disipe en el olvido.',
  },
  {
    id: 'krono',
    name: 'Corazón Cuántico Kronos-Ω',
    subtitle: 'Núcleo Central de Singularidad',
    bossName: 'Titán Mecánico Kronos-Ω',
    zoneName: 'Krono City (Acto 3)',
    levelId: 'krono-3',
    levelIndex: 14,
    color: '#a855f7',
    accentColor: '#38bdf8',
    position: 'center',
    angle: 288,
    iconName: 'Zap',
    lore: 'El epicentro gravitatorio que unifica todas las épocas pasadas, presentes y futuras.',
  },
];

/**
 * Checks if player owns a specific Kronos piece by defeating its corresponding boss
 */
export function hasKronosPiece(slot: SaveSlot | null, pieceId: string): boolean {
  if (!slot) return false;
  const piece = KRONOS_PIECES.find((p) => p.id === pieceId);
  if (!piece) return false;
  return slot.completedLevels.includes(piece.levelIndex);
}

/**
 * Checks if a specific piece has already been placed on the clock
 */
export function isKronosPiecePlaced(slot: SaveSlot | null, pieceId: string): boolean {
  if (!slot || !slot.kronosPiecesPlaced) return false;
  return slot.kronosPiecesPlaced.includes(pieceId);
}

/**
 * Places a Kronos piece into the clock mechanism
 */
export function placeKronosPiece(slotId: number, pieceId: string): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  slot.kronosPiecesPlaced = slot.kronosPiecesPlaced || [];
  if (!slot.kronosPiecesPlaced.includes(pieceId)) {
    slot.kronosPiecesPlaced.push(pieceId);
  }

  // If all 5 pieces are placed, unlock character locker
  if (slot.kronosPiecesPlaced.length >= KRONOS_PIECES.length) {
    slot.kronosLockerUnlocked = true;
  }

  slot.lastPlayed = Date.now();
  saveAllSlots(slots);
  return slot;
}

/**
 * Places all available (unplaced) Kronos pieces in the player's possession
 */
export function placeAllAvailableKronosPieces(slotId: number): { slot: SaveSlot | null; newlyPlaced: string[] } {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return { slot: null, newlyPlaced: [] };

  slot.kronosPiecesPlaced = slot.kronosPiecesPlaced || [];
  const newlyPlaced: string[] = [];

  for (const piece of KRONOS_PIECES) {
    const isOwned = slot.completedLevels.includes(piece.levelIndex);
    const isPlaced = slot.kronosPiecesPlaced.includes(piece.id);
    if (isOwned && !isPlaced) {
      slot.kronosPiecesPlaced.push(piece.id);
      newlyPlaced.push(piece.id);
    }
  }

  if (slot.kronosPiecesPlaced.length >= KRONOS_PIECES.length) {
    slot.kronosLockerUnlocked = true;
  }

  slot.lastPlayed = Date.now();
  saveAllSlots(slots);
  return { slot, newlyPlaced };
}

/**
 * Checks whether the entire Kronos Clock is fully repaired (all 5 pieces placed)
 */
export function isKronosClockCompleted(slot: SaveSlot | null): boolean {
  if (!slot || !slot.kronosPiecesPlaced) return false;
  return KRONOS_PIECES.every((p) => slot.kronosPiecesPlaced?.includes(p.id));
}

/**
 * Checks if the Character Locker is unlocked
 */
export function isKronosLockerUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  return Boolean(slot.kronosLockerUnlocked || isKronosClockCompleted(slot));
}

/**
 * For testing/demo purposes: grants all 5 boss completions to test the clock assembly & cinematic
 */
export function unlockAllKronosBossesForDemo(slotId: number): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  for (const piece of KRONOS_PIECES) {
    if (!slot.completedLevels.includes(piece.levelIndex)) {
      slot.completedLevels.push(piece.levelIndex);
    }
    if (!slot.unlockedLevels.includes(piece.levelIndex)) {
      slot.unlockedLevels.push(piece.levelIndex);
    }
  }

  slot.lastPlayed = Date.now();
  saveAllSlots(slots);
  return slot;
}

/**
 * Set selected skin
 */
export function setSelectedSkin(slotId: number, skinId: string): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;
  slot.selectedSkin = skinId;
  saveAllSlots(slots);
  return slot;
}


