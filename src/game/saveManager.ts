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
  slot.totalCrystals += stats.crystals;
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

