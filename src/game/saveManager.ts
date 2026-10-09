import { SaveSlot, ZoneId, CharacterSkin, MallaProgress } from '../types';
import { LEVEL_CONFIGS } from './levelData';
import { MALLA_ZONES } from './mallaTemporalData';

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
      const krono3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-3');
      const jungle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-1');
      const moon3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-3');
      const travelIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-travel');
      let hasMigrationChanges = false;

      for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
        const slot = parsed[i] || null;
        if (slot) {
          if (!slot.completedLevels) slot.completedLevels = [];
          if (!slot.unlockedLevels) slot.unlockedLevels = [0];

          // If Krono City boss (krono-3) was beaten, unlock Jungle Run
          if (krono3Idx !== -1 && slot.completedLevels.includes(krono3Idx)) {
            if (jungle1Idx !== -1 && !slot.unlockedLevels.includes(jungle1Idx)) {
              slot.unlockedLevels.push(jungle1Idx);
              hasMigrationChanges = true;
            }
          }

          // If Moon boss (themoon-3) was beaten, unlock Kronos Travel (the grand climax)
          if (moon3Idx !== -1 && slot.completedLevels.includes(moon3Idx)) {
            if (travelIdx !== -1 && !slot.unlockedLevels.includes(travelIdx)) {
              slot.unlockedLevels.push(travelIdx);
              hasMigrationChanges = true;
            }
          }

          // Check if player has beaten Balam in Jungle Run (jungle-3)
          const jungle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-3');
          const blizzard1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-1');
          const isBalamBeaten =
            jungle3Idx !== -1 && (slot.completedLevels.includes(jungle3Idx) || slot.completedLevels.includes('jungle-3' as any));

          if (isBalamBeaten) {
            if (blizzard1Idx !== -1 && !slot.unlockedLevels.includes(blizzard1Idx)) {
              slot.unlockedLevels.push(blizzard1Idx);
              hasMigrationChanges = true;
            }
          } else if (blizzard1Idx !== -1) {
            // Remove any prematurely unlocked blizzard levels if Balam hasn't been defeated yet
            const beforeCount = slot.unlockedLevels.length;
            slot.unlockedLevels = slot.unlockedLevels.filter((lvl) => {
              const cfg = LEVEL_CONFIGS[lvl];
              return !cfg || cfg.zone !== 'blizzard';
            });
            if (slot.unlockedLevels.length !== beforeCount) {
              hasMigrationChanges = true;
            }
          }

          // Check if player has beaten Yukio el Yeti in Blizzard Rush (blizzard-3)
          const blizzard3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-3');
          const steampunk1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-1');
          const isBlizzardBossBeaten =
            blizzard3Idx !== -1 && (slot.completedLevels.includes(blizzard3Idx) || slot.completedLevels.includes('blizzard-3' as any));

          if (isBlizzardBossBeaten) {
            if (steampunk1Idx !== -1 && !slot.unlockedLevels.includes(steampunk1Idx)) {
              slot.unlockedLevels.push(steampunk1Idx);
              hasMigrationChanges = true;
            }
          } else if (steampunk1Idx !== -1) {
            const beforeCount = slot.unlockedLevels.length;
            slot.unlockedLevels = slot.unlockedLevels.filter((lvl) => {
              const cfg = LEVEL_CONFIGS[lvl];
              return !cfg || cfg.zone !== 'steampunk';
            });
            if (slot.unlockedLevels.length !== beforeCount) {
              hasMigrationChanges = true;
            }
          }

          // Check if player has beaten Vulkan-Ω in Steampunk (steampunk-3)
          const steampunk3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-3');
          const castle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-1');
          const isSteampunkBossBeaten =
            steampunk3Idx !== -1 && (slot.completedLevels.includes(steampunk3Idx) || slot.completedLevels.includes('steampunk-3' as any));

          if (isSteampunkBossBeaten) {
            if (castle1Idx !== -1 && !slot.unlockedLevels.includes(castle1Idx)) {
              slot.unlockedLevels.push(castle1Idx);
              hasMigrationChanges = true;
            }
          } else if (castle1Idx !== -1) {
            // Remove any prematurely unlocked castlesmash levels if Steampunk boss hasn't been defeated yet
            const beforeCount = slot.unlockedLevels.length;
            slot.unlockedLevels = slot.unlockedLevels.filter((lvl) => {
              const cfg = LEVEL_CONFIGS[lvl];
              return !cfg || cfg.zone !== 'castlesmash';
            });
            if (slot.unlockedLevels.length !== beforeCount) {
              hasMigrationChanges = true;
            }
          }

          // Check if player has beaten Lord Malakar in Castle Smash (castlesmash-3)
          const castle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-3');
          const pirate1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-1');
          const isCastleSmashBossBeaten =
            castle3Idx !== -1 && (slot.completedLevels.includes(castle3Idx) || slot.completedLevels.includes('castlesmash-3' as any));

          if (isCastleSmashBossBeaten) {
            if (pirate1Idx !== -1 && !slot.unlockedLevels.includes(pirate1Idx)) {
              slot.unlockedLevels.push(pirate1Idx);
              hasMigrationChanges = true;
            }
          } else if (pirate1Idx !== -1) {
            // Remove any prematurely unlocked piratestreasure levels if Castle Smash boss hasn't been defeated yet
            const beforeCount = slot.unlockedLevels.length;
            slot.unlockedLevels = slot.unlockedLevels.filter((lvl) => {
              const cfg = LEVEL_CONFIGS[lvl];
              return !cfg || cfg.zone !== 'piratestreasure';
            });
            if (slot.unlockedLevels.length !== beforeCount) {
              hasMigrationChanges = true;
            }
          }
        }
        slots[i] = slot;
      }
      if (hasMigrationChanges) {
        saveAllSlots(slots);
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

export function getSaveSlot(slotId: number): SaveSlot | null {
  const slots = loadAllSaveSlots();
  return slots[slotId] || null;
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
  const travelIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-travel');
  const jungle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-1');
  const jungleFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-3');
  const blizzard1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-1');
  const blizzardFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-3');
  const steampunk1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-1');
  const steampunkFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-3');
  const castleSmash1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-1');
  const castleSmashFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-3');
  const pirateTreasure1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-1');
  const pirateTreasureFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-3');
  const jurassicDraft1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-1');

  // If nextLevel is jungle-1, only unlock it if Kronos Travel is beaten
  // If nextLevel is blizzard-1, only unlock it if Balam (jungle-3) is beaten
  // If nextLevel is steampunk-1, only unlock it if Yukio el Yeti (blizzard-3) is beaten
  // If nextLevel is castlesmash-1, only unlock it if Vulkan-Ω (steampunk-3) is beaten
  // If nextLevel is piratestreasure-1, only unlock it if Lord Malakar (castlesmash-3) is beaten
  // If nextLevel is jurasicdraft-1, only unlock it if El Cofre Maldito (piratestreasure-3) is beaten
  // Once Jurassic Draft (jurasicdraft-3) is completed, the player has conquered the full campaign.
  const isJurassicDraftFinal = LEVEL_CONFIGS[levelIndex]?.id === 'jurasicdraft-3';
  if (!isJurassicDraftFinal && nextLevel < LEVEL_CONFIGS.length && !slot.unlockedLevels.includes(nextLevel)) {
    if (nextLevel === jungle1Idx) {
      if (travelIdx !== -1 && slot.completedLevels.includes(travelIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else if (nextLevel === blizzard1Idx) {
      if (jungleFinalBossIdx !== -1 && slot.completedLevels.includes(jungleFinalBossIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else if (nextLevel === steampunk1Idx) {
      if (blizzardFinalBossIdx !== -1 && slot.completedLevels.includes(blizzardFinalBossIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else if (nextLevel === castleSmash1Idx) {
      if (steampunkFinalBossIdx !== -1 && slot.completedLevels.includes(steampunkFinalBossIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else if (nextLevel === pirateTreasure1Idx) {
      if (castleSmashFinalBossIdx !== -1 && slot.completedLevels.includes(castleSmashFinalBossIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else if (nextLevel === jurassicDraft1Idx) {
      if (pirateTreasureFinalBossIdx !== -1 && slot.completedLevels.includes(pirateTreasureFinalBossIdx)) {
        slot.unlockedLevels.push(nextLevel);
      }
    } else {
      slot.unlockedLevels.push(nextLevel);
    }
  }

  // When Krono City (krono-3) is beaten, unlock Jungle Run (jungle-1)
  const kronoFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-3');
  if (levelIndex === kronoFinalBossIdx && jungle1Idx !== -1 && !slot.unlockedLevels.includes(jungle1Idx)) {
    slot.unlockedLevels.push(jungle1Idx);
  }

  // When Balam (jungle-3) is beaten, unlock Blizzard Rush (blizzard-1)
  if (levelIndex === jungleFinalBossIdx && blizzard1Idx !== -1 && !slot.unlockedLevels.includes(blizzard1Idx)) {
    slot.unlockedLevels.push(blizzard1Idx);
  }

  // When Yukio el Yeti (blizzard-3) is beaten, unlock Steampunk (steampunk-1)
  if (levelIndex === blizzardFinalBossIdx && steampunk1Idx !== -1 && !slot.unlockedLevels.includes(steampunk1Idx)) {
    slot.unlockedLevels.push(steampunk1Idx);
  }

  // When Vulkan-Ω (steampunk-3) is beaten, unlock Castle Smash (castlesmash-1)
  if (levelIndex === steampunkFinalBossIdx && castleSmash1Idx !== -1 && !slot.unlockedLevels.includes(castleSmash1Idx)) {
    slot.unlockedLevels.push(castleSmash1Idx);
  }

  // When Lord Malakar (castlesmash-3) is beaten, unlock Pirate's Treasure (piratestreasure-1)
  if (levelIndex === castleSmashFinalBossIdx && pirateTreasure1Idx !== -1 && !slot.unlockedLevels.includes(pirateTreasure1Idx)) {
    slot.unlockedLevels.push(pirateTreasure1Idx);
  }

  // When El Cofre Maldito (piratestreasure-3) is beaten, unlock Jurassic Draft (jurasicdraft-1)
  if (levelIndex === pirateTreasureFinalBossIdx && jurassicDraft1Idx !== -1 && !slot.unlockedLevels.includes(jurassicDraft1Idx)) {
    slot.unlockedLevels.push(jurassicDraft1Idx);
  }

  // When Titan Rex (jurasicdraft-3) is beaten, unlock The Moon: Rocket Launch Facility (themoon-1)
  const jurassicFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-3');
  const moon1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-1');
  if (levelIndex === jurassicFinalBossIdx && moon1Idx !== -1 && !slot.unlockedLevels.includes(moon1Idx)) {
    slot.unlockedLevels.push(moon1Idx);
  }

  // When Doomsday Dreadnought (themoon-3) is beaten, unlock Kronos Travel (the grand climax level at the very end!)
  const moonFinalBossIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-3');
  if (levelIndex === moonFinalBossIdx && travelIdx !== -1 && !slot.unlockedLevels.includes(travelIdx)) {
    slot.unlockedLevels.push(travelIdx);
  }

  slots[slotId] = slot;
  saveAllSlots(slots);
  return slot;
}

export function isLevelUnlockedInSlot(slot: SaveSlot | null, levelIndex: number): boolean {
  if (!slot) return levelIndex === 0;
  const cfg = LEVEL_CONFIGS[levelIndex];
  if (cfg && cfg.zone === 'jungle') {
    const krono3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-3');
    const jungle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isKronoCompleted =
      (krono3Idx !== -1 && (completedList.includes(krono3Idx) || completedList.includes('krono-3' as any))) ||
      unlockedList.includes(levelIndex) ||
      (jungle1Idx !== -1 && (unlockedList.includes(jungle1Idx) || completedList.includes(jungle1Idx)));

    if (!isKronoCompleted && !unlockedList.includes(levelIndex)) {
      return false; // Jungle Run is locked until Kronos Titan is defeated!
    }
    if (levelIndex === jungle1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1);
  }
  if (cfg && cfg.zone === 'travel') {
    const moon3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-3');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isMoonCompleted =
      (moon3Idx !== -1 && (completedList.includes(moon3Idx) || completedList.includes('themoon-3' as any))) ||
      unlockedList.includes(levelIndex);

    return isMoonCompleted || unlockedList.includes(levelIndex);
  }
  if (cfg && cfg.zone === 'blizzard') {
    const jungle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-3');
    const blizzard1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isBalamDefeated =
      (jungle3Idx !== -1 && (completedList.includes(jungle3Idx) || completedList.includes('jungle-3' as any)));

    if (!isBalamDefeated) {
      return false; // Blizzard Rush is strictly locked until Balam is defeated!
    }
    if (levelIndex === blizzard1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1);
  }
  if (cfg && cfg.zone === 'steampunk') {
    const blizzard3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-3');
    const steampunk1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isBlizzardBossDefeated =
      blizzard3Idx !== -1 && (completedList.includes(blizzard3Idx) || completedList.includes('blizzard-3' as any));

    if (!isBlizzardBossDefeated) {
      return false; // Steampunk is strictly locked until Yukio el Yeti (blizzard-3) is defeated!
    }
    if (levelIndex === steampunk1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1) || completedList.includes(`steampunk-${cfg.act - 1}` as any);
  }
  if (cfg && cfg.zone === 'castlesmash') {
    const steampunk3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-3');
    const castle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isSteampunkBossDefeated =
      steampunk3Idx !== -1 && (completedList.includes(steampunk3Idx) || completedList.includes('steampunk-3' as any));

    if (!isSteampunkBossDefeated) {
      return false; // Castle Smash is strictly locked until Vulkan-Ω (steampunk-3) is defeated!
    }
    if (levelIndex === castle1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1) || completedList.includes(`castlesmash-${cfg.act - 1}` as any);
  }
  if (cfg && cfg.zone === 'piratestreasure') {
    const castle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-3');
    const pirate1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isCastleBossDefeated =
      castle3Idx !== -1 && (completedList.includes(castle3Idx) || completedList.includes('castlesmash-3' as any));

    if (!isCastleBossDefeated && !unlockedList.includes(levelIndex)) {
      return false; // Pirate's Treasure is locked until Castle Smash (castlesmash-3) is defeated!
    }
    if (levelIndex === pirate1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1) || completedList.includes(`piratestreasure-${cfg.act - 1}` as any);
  }
  if (cfg && cfg.zone === 'jurasicdraft') {
    const pirate3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-3');
    const jurasic1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isPirateBossDefeated =
      pirate3Idx !== -1 && (completedList.includes(pirate3Idx) || completedList.includes('piratestreasure-3' as any));

    if (!isPirateBossDefeated && !unlockedList.includes(levelIndex)) {
      return false; // Jurassic Draft is locked until Pirate's Treasure (piratestreasure-3) is defeated!
    }
    if (levelIndex === jurasic1Idx) {
      return true;
    }
    return unlockedList.includes(levelIndex) || completedList.includes(levelIndex - 1) || completedList.includes(`jurasicdraft-${cfg.act - 1}` as any);
  }
  if (cfg && cfg.zone === 'themoon') {
    const jurasic3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-3');
    const moon1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isJurassicBossDefeated =
      jurasic3Idx !== -1 && (completedList.includes(jurasic3Idx) || completedList.includes('jurasicdraft-3' as any));

    // Act 1 of The Moon is unlocked once Jurassic Draft Boss (Titan Rex) is defeated
    if (cfg.act === 1) {
      if (!isJurassicBossDefeated && !unlockedList.includes(levelIndex)) {
        return false;
      }
      return true;
    }
    // Act 2 is unlocked when Act 1 is completed or in unlocked levels
    if (cfg.act === 2) {
      const isMoon1Completed = moon1Idx !== -1 && (completedList.includes(moon1Idx) || completedList.includes('themoon-1' as any));
      return isMoon1Completed || unlockedList.includes(levelIndex);
    }
    // Act 3 (Doomsday Zone Boss) is unlocked when Act 2 is completed or in unlocked levels
    if (cfg.act === 3) {
      const moon2Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-2');
      const isMoon2Completed = moon2Idx !== -1 && (completedList.includes(moon2Idx) || completedList.includes('themoon-2' as any));
      return isMoon2Completed || unlockedList.includes(levelIndex);
    }
    return false;
  }
  return slot.unlockedLevels.includes(levelIndex);
}

/**
 * Identifies if a level contains a major boss battle (boss levels cannot be selected in VS IA or Contrarreloj)
 */
export function isBossLevel(levelIndex: number): boolean {
  const cfg = LEVEL_CONFIGS[levelIndex];
  if (!cfg) return false;
  return ['neon-3', 'sakura-3', 'lavacliff-3', 'desert-3', 'krono-3', 'jungle-3', 'blizzard-3', 'steampunk-3', 'castlesmash-3', 'piratestreasure-3', 'jurasicdraft-3', 'themoon-3'].includes(cfg.id);
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

  // Jungle Run requires completing Kronos Travel first
  if (zone === 'jungle') {
    const travelIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-travel');
    const jungle1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-1');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isTravelCompleted =
      (travelIdx !== -1 && (completedList.includes(travelIdx) || completedList.includes('krono-travel' as any))) ||
      (jungle1Idx !== -1 && (unlockedList.includes(jungle1Idx) || completedList.includes(jungle1Idx))) ||
      zoneLevels.some((item) => unlockedList.includes(item.idx) || completedList.includes(item.idx)) ||
      completedList.some((lvl) => typeof lvl === 'number' && lvl >= (travelIdx !== -1 ? travelIdx : 15));

    if (!isTravelCompleted) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // Blizzard Rush requires defeating the jungle boss Balam (jungle-3)
  if (zone === 'blizzard') {
    const jungle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jungle-3');
    const completedList = slot.completedLevels || [];

    const isBalamDefeated =
      (jungle3Idx !== -1 && (completedList.includes(jungle3Idx) || completedList.includes('jungle-3' as any)));

    if (!isBalamDefeated) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // Steampunk Zone requires defeating the blizzard boss Yukio el Yeti (blizzard-3)
  if (zone === 'steampunk') {
    const blizzard3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'blizzard-3');
    const completedList = slot.completedLevels || [];

    const isBlizzardBossDefeated =
      blizzard3Idx !== -1 && (completedList.includes(blizzard3Idx) || completedList.includes('blizzard-3' as any));

    if (!isBlizzardBossDefeated) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // Castle Smash Zone requires defeating the steampunk boss Vulkan-Ω (steampunk-3)
  if (zone === 'castlesmash') {
    const steampunk3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'steampunk-3');
    const completedList = slot.completedLevels || [];

    const isSteampunkBossDefeated =
      steampunk3Idx !== -1 && (completedList.includes(steampunk3Idx) || completedList.includes('steampunk-3' as any));

    if (!isSteampunkBossDefeated) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // Pirate's Treasure Zone requires defeating Castle Smash boss Lord Malakar (castlesmash-3)
  if (zone === 'piratestreasure') {
    const castle3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'castlesmash-3');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isCastleBossDefeated =
      castle3Idx !== -1 && (completedList.includes(castle3Idx) || completedList.includes('castlesmash-3' as any));

    const pirate1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-1');
    const isUnlocked = isCastleBossDefeated || (pirate1Idx !== -1 && unlockedList.includes(pirate1Idx));

    if (!isUnlocked) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // Jurassic Draft Zone requires defeating Pirate's Treasure boss El Cofre Maldito (piratestreasure-3)
  if (zone === 'jurasicdraft') {
    const pirate3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'piratestreasure-3');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isPirateBossDefeated =
      pirate3Idx !== -1 && (completedList.includes(pirate3Idx) || completedList.includes('piratestreasure-3' as any));

    const jurassic1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-1');
    const isUnlocked = isPirateBossDefeated || (jurassic1Idx !== -1 && unlockedList.includes(jurassic1Idx));

    if (!isUnlocked) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
  }

  // The Moon Zone requires defeating Jurassic Draft boss Titan Rex (jurasicdraft-3)
  if (zone === 'themoon') {
    const jurasic3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'jurasicdraft-3');
    const completedList = slot.completedLevels || [];
    const unlockedList = slot.unlockedLevels || [];

    const isJurassicBossDefeated =
      jurasic3Idx !== -1 && (completedList.includes(jurasic3Idx) || completedList.includes('jurasicdraft-3' as any));

    const moon1Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-1');
    const isUnlocked = isJurassicBossDefeated || (moon1Idx !== -1 && unlockedList.includes(moon1Idx));

    if (!isUnlocked) {
      return { completed: 0, total, unlocked: false };
    }
    let completed = 0;
    for (const item of zoneLevels) {
      if (completedList.includes(item.idx)) completed++;
    }
    return { completed, total, unlocked: true };
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
  id:
    | 'neon'
    | 'sakura'
    | 'lavacliff'
    | 'desert'
    | 'krono'
    | 'jungle'
    | 'blizzard'
    | 'steampunk'
    | 'castlesmash'
    | 'piratestreasure'
    | 'jurasicdraft'
    | 'themoon';
  name: string;
  subtitle: string;
  bossName: string;
  zoneName: string;
  levelId: string;
  levelIndex: number;
  color: string;
  accentColor: string;
  position?: string;
  angle: number;
  iconName: string;
  lore: string;
  isComingSoon?: boolean;
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
    angle: 30,
    iconName: 'Sparkles',
    lore: 'Oscila entre las dimensiones astrales asegurando un paso suave y preciso de los segundos.',
  },
  {
    id: 'lavacliff',
    name: 'Engranaje Térmico Ígneo',
    subtitle: 'Rueda Dentada de Basalto Forjado',
    bossName: 'Dragón de Magma Ignis',
    zoneName: 'Acantilados de Lava (Acto 3)',
    levelId: 'lavacliff-3',
    levelIndex: 8,
    color: '#f97316',
    accentColor: '#ef4444',
    position: 'bottomRight',
    angle: 60,
    iconName: 'Flame',
    lore: 'Transmite la inmensa fuerza motriz del magma primigenio para impulsar los ejes del reloj.',
  },
  {
    id: 'desert',
    name: 'Escarabajo Solar del Tiempo',
    subtitle: 'Espiral Sagrada de Arena Dorada',
    bossName: "Faraón Akhen'Ra",
    zoneName: 'Santuario del Desierto (Acto 3)',
    levelId: 'desert-3',
    levelIndex: 11,
    color: '#f59e0b',
    accentColor: '#10b981',
    position: 'bottomLeft',
    angle: 90,
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
    angle: 120,
    iconName: 'Zap',
    lore: 'El epicentro gravitatorio que unifica todas las épocas pasadas, presentes y futuras.',
  },
  {
    id: 'jungle',
    name: 'Gema Sagrada del Sol Maya',
    subtitle: 'Corona de Jade del Jaguar Balam',
    bossName: 'Balam, el Jaguar Gigante Ancestral',
    zoneName: 'Jungle Run (Acto 3)',
    levelId: 'jungle-3',
    levelIndex: 18,
    color: '#10b981',
    accentColor: '#eab308',
    position: 'topLeft',
    angle: 150,
    iconName: 'Gem',
    lore: 'Canaliza el poder del Sol cenital maya y la sabiduría de la selva ancestral para sincronizar los ciclos naturales del tiempo.',
  },
  {
    id: 'blizzard',
    name: 'Orbe Criogénico Glacial',
    subtitle: 'Prisma de Escarcha de la Cumbre Nevada',
    bossName: 'Coloso Yeti del Glaciar',
    zoneName: 'Blizzard Rush (Acto 3)',
    levelId: 'blizzard-3',
    levelIndex: 21,
    color: '#38bdf8',
    accentColor: '#bae6fd',
    position: 'bottom',
    angle: 180,
    iconName: 'Snowflake',
    lore: 'Cristaliza los fragmentos temporales en una matriz de escarcha eterna para evitar fracturas en el vórtice dimensional.',
  },
  {
    id: 'steampunk',
    name: 'Núcleo de Vapor Térmico',
    subtitle: 'Engranaje de Latón de Alta Presión',
    bossName: 'Vulkan-Ω, Coloso del Reactor',
    zoneName: 'Steampunk Factory (Acto 3)',
    levelId: 'steampunk-3',
    levelIndex: 24,
    color: '#ea580c',
    accentColor: '#fbbf24',
    position: 'bottomLeft',
    angle: 210,
    iconName: 'Gauge',
    lore: 'Genera el vapor hiperbárico a 1000m de altitud necesario para impulsar la rotación del portal de Kronos.',
  },
  {
    id: 'castlesmash',
    name: 'Blasón Real del Bastión',
    subtitle: 'Emblema Feudal de Hierro Templado',
    bossName: 'Lord Malakar, Señor del Bastión',
    zoneName: 'Castle Smash (Acto 3)',
    levelId: 'castlesmash-3',
    levelIndex: 27,
    color: '#64748b',
    accentColor: '#f59e0b',
    position: 'left',
    angle: 240,
    iconName: 'Shield',
    lore: 'Escudo heráldico forjado en las murallas medievales que blinda la estructura física del portal contra colapsos cuánticos.',
  },
  {
    id: 'piratestreasure',
    name: 'Brújula Dorada del Corsario',
    subtitle: 'Astrolabio Místico de los Mares',
    bossName: 'El Cofre Maldito del Naufragio',
    zoneName: "Pirate's Treasure (Acto 3)",
    levelId: 'piratestreasure-3',
    levelIndex: 30,
    color: '#0284c7',
    accentColor: '#facc15',
    position: 'topLeft',
    angle: 270,
    iconName: 'Compass',
    lore: 'Apunta inexorablemente hacia las coordenadas cardinales exactas del nexo interdimensional a través de cualquier tormenta.',
  },
  {
    id: 'jurasicdraft',
    name: 'Ámbar Fósil Primigenio',
    subtitle: 'Gota de Resina Prehistórica Ancestral',
    bossName: 'Titan Rex Colosal · Rey del Mesozoico',
    zoneName: 'Jurassic Draft (Acto 3)',
    levelId: 'jurasicdraft-3',
    levelIndex: 33,
    color: '#15803d',
    accentColor: '#ea580c',
    position: 'top',
    angle: 300,
    iconName: 'Flame',
    isComingSoon: false,
    lore: 'Preserva en su interior la chispa biológica de la era mesozoica, otorgando vigor orgánico a la sincronización del reloj.',
  },
  {
    id: 'themoon',
    name: 'Esfera Celestial de Helio-3',
    subtitle: 'Núcleo de Fusión Orbital Lunar',
    bossName: 'Mecha Titán Lunar Helios (En Desarrollo)',
    zoneName: 'The Moon (Acto 3)',
    levelId: 'themoon-3',
    levelIndex: 36,
    color: '#818cf8',
    accentColor: '#c084fc',
    position: 'topRight',
    angle: 330,
    iconName: 'Moon',
    isComingSoon: true,
    lore: 'Canaliza el flujo cósmico de la gravedad reducida lunar para calibrar el salto cuántico final del casillero dimensional.',
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
 * Maps each Clock Piece ID to what it unlocks.
 * - Piece 1 (neon - Bosque Neón): Unlocks the Character Locker.
 * - Piece 2 (sakura): Unlocks Zizz.
 * - Piece 3 (lavacliff): Unlocks Kael.
 * - Piece 4 (desert): Unlocks Anuk.
 * - Piece 5 (krono): Unlocks Vector.
 * - Piece 6 (jungle): Unlocks Balam.
 */
export const CLOCK_PIECE_REWARDS: Record<
  string,
  {
    type: 'locker' | 'character';
    characterId?: CharacterSkin;
    title: string;
    rewardName: string;
    description: string;
  }
> = {
  neon: {
    type: 'locker',
    title: 'Casillero de Skins',
    rewardName: '¡Casillero de Skins de Zion Desbloqueado!',
    description: 'Accede al vestidor dimensional y equipa los diferentes trajes de Zion.',
  },
  sakura: {
    type: 'character',
    characterId: 'zizz',
    title: 'Zion Flor Astral',
    rewardName: '¡Skin Zion Flor Astral Desbloqueada!',
    description: 'Zion viste el traje de Kunoichi del Cerezo Astral con katanas gemelas y 28% de crítico.',
  },
  lavacliff: {
    type: 'character',
    characterId: 'kael',
    title: 'Zion Paladín Ígneo',
    rewardName: '¡Skin Zion Paladín Ígneo Desbloqueada!',
    description: 'Zion viste la armadura volcánica pesada con mandoble sísmico y deflexión.',
  },
  desert: {
    type: 'character',
    characterId: 'anuk',
    title: 'Zion Centinela Solar',
    rewardName: '¡Skin Zion Centinela Solar Desbloqueada!',
    description: 'Zion viste el manto sagrado de las arenas con Khopesh solar y torbellino divino.',
  },
  krono: {
    type: 'character',
    characterId: 'vector',
    title: 'Zion Agente de Fusión',
    rewardName: '¡Skin Zion Agente de Fusión Desbloqueada!',
    description: 'Zion viste el exo-traje cibernético con nanodagas de pulso y onda PEM.',
  },
  jungle: {
    type: 'character',
    characterId: 'balam',
    title: 'Zion Guerrero Jaguar',
    rewardName: '¡Skin Zion Guerrero Jaguar Desbloqueada!',
    description: 'Zion viste el manto sagrado maya con macuahuitl de jade y furia de Kukulkán.',
  },
};

/**
 * Checks whether a specific CharacterSkin is unlocked for a given SaveSlot.
 * - Zion: Always unlocked by default (initial protagonist of Neon Forest).
 * - Other heroes: Unlocked as soon as their corresponding Clock Piece is placed in the clock.
 */
export function isCharacterSkinUnlocked(slot: SaveSlot | null, skinId: CharacterSkin | string): boolean {
  if (skinId === 'zion') return true;
  if (!slot) return false;

  const placed = slot.kronosPiecesPlaced || [];
  const completed = slot.completedLevels || [];

  const isLevelCompleted = (levelId: string) => {
    const idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === levelId);
    return idx !== -1 && (completed.includes(idx) || (completed as any).includes(levelId));
  };

  switch (skinId) {
    case 'zizz':
    case 'zyssa':
      return placed.includes('sakura');
    case 'kael':
      return placed.includes('lavacliff');
    case 'anuk':
      return placed.includes('desert');
    case 'vector':
      return placed.includes('krono');
    case 'balam':
      return placed.includes('jungle');
    case 'blizzard':
      return isLevelCompleted('blizzard-3');
    case 'steampunk':
      return isLevelCompleted('steampunk-3');
    case 'castlesmash':
      return isLevelCompleted('castlesmash-3');
    case 'pirate':
      return isLevelCompleted('piratestreasure-3');
    case 'jurassic':
      return isLevelCompleted('jurasicdraft-3');
    case 'moon':
      return isLevelCompleted('themoon-3');
    default:
      return false;
  }
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

  // Placing the first piece (neon) or any clock piece unlocks the Character Locker
  if (slot.kronosPiecesPlaced.includes('neon') || slot.kronosPiecesPlaced.length >= 1) {
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

  if (slot.kronosPiecesPlaced.includes('neon') || slot.kronosPiecesPlaced.length >= 1) {
    slot.kronosLockerUnlocked = true;
  }

  slot.lastPlayed = Date.now();
  saveAllSlots(slots);
  return { slot, newlyPlaced };
}

/**
 * Checks whether the entire Kronos Clock is fully repaired (all 12 pieces placed)
 */
export function isKronosClockCompleted(slot: SaveSlot | null): boolean {
  if (!slot || !slot.kronosPiecesPlaced) return false;
  return KRONOS_PIECES.every((p) => slot.kronosPiecesPlaced?.includes(p.id));
}

/**
 * Checks if the Character Locker is unlocked.
 * Unlocks as soon as the first piece (neon from Bosque Neón) is placed into the clock mechanism!
 */
export function isKronosLockerUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  const placed = slot.kronosPiecesPlaced || [];
  return Boolean(
    placed.includes('neon') ||
    placed.length >= 1 ||
    slot.kronosLockerUnlocked ||
    isKronosClockCompleted(slot)
  );
}

/**
 * For testing/demo purposes: grants all boss completions to test the clock assembly & cinematic
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
 * Set selected skin with unlocking validation
 */
export function setSelectedSkin(slotId: number, skinId: string): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  // Protect against equipping locked skins
  if (!isCharacterSkinUnlocked(slot, skinId)) {
    return slot;
  }

  slot.selectedSkin = skinId;
  saveAllSlots(slots);
  return slot;
}

/**
 * Checks if the player has finished the main story campaign.
 * Either beat krono-travel or beat themoon-3 or completed 12+ levels.
 */
export function isMainStoryCompleted(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  const completed = slot.completedLevels || [];
  const travelIdx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'krono-travel');
  const moon3Idx = LEVEL_CONFIGS.findIndex((lvl) => lvl.id === 'themoon-3');

  if (travelIdx !== -1 && completed.includes(travelIdx)) return true;
  if (moon3Idx !== -1 && completed.includes(moon3Idx)) return true;
  if (completed.length >= 12) return true;
  return false;
}

/**
 * Checks if Malla Temporal (Modo Historia Post-Game) is unlocked.
 */
export function isMallaTemporalUnlocked(slot: SaveSlot | null): boolean {
  if (!slot) return false;
  if (slot.mallaProgress?.unlocked) return true;
  return isMainStoryCompleted(slot);
}

/**
 * Force unlock Malla Temporal on slot (for testing/demo)
 */
export function unlockMallaTemporal(slotId: number): void {
  try {
    const slots = loadAllSaveSlots();
    const slot = slots[slotId];
    if (slot) {
      if (!slot.mallaProgress) {
        slot.mallaProgress = {
          unlocked: true,
          completedMissions: {},
          rescuedZones: [],
          islandFullyRescued: false,
        };
      } else {
        slot.mallaProgress.unlocked = true;
      }
      slot.lastPlayed = Date.now();
      saveAllSlots(slots);
    }
  } catch (e) {
    console.error('Error unlocking Malla Temporal:', e);
  }
}

/**
 * Gets or initializes MallaProgress for a save slot
 */
export function getMallaProgress(slot: SaveSlot | null): MallaProgress {
  if (!slot || !slot.mallaProgress) {
    return {
      unlocked: slot ? isMainStoryCompleted(slot) : false,
      completedMissions: {},
      rescuedZones: [],
      islandFullyRescued: false,
    };
  }
  return slot.mallaProgress;
}

/**
 * Checks if a specific zone has been rescued (all 3 missions completed)
 */
export function isMallaZoneRescued(slot: SaveSlot | null, zoneId: ZoneId): boolean {
  if (!slot || !slot.mallaProgress) return false;
  const rescued = slot.mallaProgress.rescuedZones || [];
  if (rescued.includes(zoneId)) return true;

  const missionsDone = slot.mallaProgress.completedMissions[zoneId] || [];
  return missionsDone.length >= 3 && Boolean(missionsDone[0]) && Boolean(missionsDone[1]) && Boolean(missionsDone[2]);
}

/**
 * Checks if a specific zone is unlocked for playing missions.
 * If no starting zone has been chosen yet, all are available to inspect and choose.
 */
export function isMallaZoneUnlocked(slot: SaveSlot | null, zoneId: ZoneId): boolean {
  if (!slot || !slot.mallaProgress) return true;
  const prog = slot.mallaProgress;
  // If no starting zone chosen yet, the player can choose any
  if (!prog.chosenStartingZone && (!prog.unlockedZoneIds || prog.unlockedZoneIds.length === 0)) {
    return true;
  }
  if (prog.rescuedZones && prog.rescuedZones.includes(zoneId)) return true;
  if (prog.unlockedZoneIds && prog.unlockedZoneIds.includes(zoneId)) return true;
  if (prog.chosenStartingZone === zoneId) return true;
  return false;
}

/**
 * Lets the player choose their first unlockable zone on the island!
 */
export function chooseStartingMallaZone(slotId: number, zoneId: ZoneId): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  if (!slot.mallaProgress) {
    slot.mallaProgress = {
      unlocked: true,
      completedMissions: {},
      rescuedZones: [],
      islandFullyRescued: false,
      unlockedZoneIds: [zoneId],
      chosenStartingZone: zoneId,
    };
  } else {
    slot.mallaProgress.chosenStartingZone = zoneId;
    if (!slot.mallaProgress.unlockedZoneIds) {
      slot.mallaProgress.unlockedZoneIds = [];
    }
    if (!slot.mallaProgress.unlockedZoneIds.includes(zoneId)) {
      slot.mallaProgress.unlockedZoneIds.push(zoneId);
    }
  }

  saveAllSlots(slots);
  return slot;
}

/**
 * Unlocks a new zone to challenge
 */
export function unlockMallaZone(slotId: number, zoneId: ZoneId): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  if (!slot.mallaProgress) {
    slot.mallaProgress = {
      unlocked: true,
      completedMissions: {},
      rescuedZones: [],
      islandFullyRescued: false,
      unlockedZoneIds: [zoneId],
    };
  } else {
    if (!slot.mallaProgress.unlockedZoneIds) {
      slot.mallaProgress.unlockedZoneIds = [];
    }
    if (!slot.mallaProgress.unlockedZoneIds.includes(zoneId)) {
      slot.mallaProgress.unlockedZoneIds.push(zoneId);
    }
  }

  saveAllSlots(slots);
  return slot;
}

/**
 * Returns the number of rescued zones (0 to 12)
 */
export function getRescuedZonesCount(slot: SaveSlot | null): number {
  if (!slot || !slot.mallaProgress) return 0;
  return (slot.mallaProgress.rescuedZones || []).length;
}

/**
 * Returns total completed missions across the entire island (0 to 36)
 */
export function getMallaCompletedMissionsCount(slot: SaveSlot | null): number {
  if (!slot || !slot.mallaProgress) return 0;
  let count = 0;
  for (const zoneId in slot.mallaProgress.completedMissions) {
    const list = slot.mallaProgress.completedMissions[zoneId] || [];
    for (const done of list) {
      if (done) count++;
    }
  }
  return count;
}

/**
 * Marks a Malla mission as completed in device storage.
 * Evaluates if the zone was just rescued and if the whole island was rescued.
 */
export function completeMallaMission(
  slotId: number,
  zoneId: ZoneId,
  missionIndex: number
): { isZoneNewlyRescued: boolean; isIslandNewlyRescued: boolean; progress: MallaProgress } {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) {
    return {
      isZoneNewlyRescued: false,
      isIslandNewlyRescued: false,
      progress: { completedMissions: {}, rescuedZones: [], islandFullyRescued: false },
    };
  }

  if (!slot.mallaProgress) {
    slot.mallaProgress = {
      unlocked: true,
      completedMissions: {},
      rescuedZones: [],
      islandFullyRescued: false,
    };
  }

  const prog = slot.mallaProgress;
  prog.unlocked = true;

  if (!prog.completedMissions[zoneId]) {
    prog.completedMissions[zoneId] = [false, false, false];
  }
  prog.completedMissions[zoneId][missionIndex] = true;

  // Add bonus score
  slot.totalScore = (slot.totalScore || 0) + 3000;

  // Check if zone was newly rescued (all 3 done)
  const isZoneDone =
    Boolean(prog.completedMissions[zoneId][0]) &&
    Boolean(prog.completedMissions[zoneId][1]) &&
    Boolean(prog.completedMissions[zoneId][2]);

  let isZoneNewlyRescued = false;
  if (isZoneDone && !prog.rescuedZones.includes(zoneId)) {
    prog.rescuedZones.push(zoneId);
    isZoneNewlyRescued = true;
    slot.totalScore = (slot.totalScore || 0) + 5000;
  }

  // Check if whole island is rescued (all 12 zones)
  let isIslandNewlyRescued = false;
  if (prog.rescuedZones.length >= MALLA_ZONES.length && !prog.islandFullyRescued) {
    prog.islandFullyRescued = true;
    isIslandNewlyRescued = true;
    slot.totalScore = (slot.totalScore || 0) + 25000;
  }

  prog.lastPlayedMission = { zoneId, missionIndex };
  slot.lastPlayed = Date.now();
  saveAllSlots(slots);

  return { isZoneNewlyRescued, isIslandNewlyRescued, progress: prog };
}

/**
 * Testing helper: rescues all zones or resets them
 */
export function toggleAllMallaZonesForTesting(slotId: number, rescueAll: boolean): SaveSlot | null {
  const slots = loadAllSaveSlots();
  const slot = slots[slotId];
  if (!slot) return null;

  if (!slot.mallaProgress) {
    slot.mallaProgress = {
      unlocked: true,
      completedMissions: {},
      rescuedZones: [],
      islandFullyRescued: false,
    };
  }

  if (rescueAll) {
    slot.mallaProgress.unlocked = true;
    slot.mallaProgress.rescuedZones = MALLA_ZONES.map((z) => z.id);
    slot.mallaProgress.islandFullyRescued = true;
    for (const z of MALLA_ZONES) {
      slot.mallaProgress.completedMissions[z.id] = [true, true, true];
    }
  } else {
    slot.mallaProgress.rescuedZones = [];
    slot.mallaProgress.islandFullyRescued = false;
    slot.mallaProgress.completedMissions = {};
  }

  slot.lastPlayed = Date.now();
  saveAllSlots(slots);
  return slot;
}


