import { Language, getSavedLanguage } from '../utils/i18n';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AchievementCategory = 'combat' | 'exploration' | 'speed' | 'mastery';

export interface AchievementDef {
  id: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconName: string;
  target?: number;
  points: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
  progress: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // COMBAT FEATS
  {
    id: 'no_damage_run',
    titleEs: 'Intocable (No Damage Run)',
    titleEn: 'Untouchable (No Damage Run)',
    descriptionEs: 'Completa cualquier nivel de la campaña o jefe sin recibir ni un solo golpe de daño.',
    descriptionEn: 'Complete any campaign level or boss without taking a single hit of damage.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Shield',
    points: 100,
  },
  {
    id: 'boss_slayer',
    titleEs: 'Cazador de Jefes (Boss Slayer)',
    titleEn: 'Boss Slayer',
    descriptionEs: 'Derrota a tu primer gran jefe de zona y abre el portal interdimensional.',
    descriptionEn: 'Defeat your first major zone boss and open the interdimensional portal.',
    category: 'combat',
    tier: 'bronze',
    iconName: 'Swords',
    points: 50,
  },
  {
    id: 'titan_slayer',
    titleEs: 'Azote de Titanes',
    titleEn: 'Titan Slayer',
    descriptionEs: 'Derrota a 3 grandes jefes a lo largo de las distintas eras.',
    descriptionEn: 'Defeat 3 major bosses across the different eras.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Skull',
    target: 3,
    points: 120,
  },
  {
    id: 'boss_flawless',
    titleEs: 'Duelo Inmaculado',
    titleEn: 'Flawless Boss Duel',
    descriptionEs: 'Vence a un jefe final con la barra de vida intacta (0 daño recibido).',
    descriptionEn: 'Defeat a final boss with your health bar intact (0 damage taken).',
    category: 'combat',
    tier: 'platinum',
    iconName: 'Crown',
    points: 150,
  },
  {
    id: 'dagger_sniper',
    titleEs: 'Maestro del Kunai',
    titleEn: 'Kunai Master',
    descriptionEs: 'Elimina a 20 enemigos a distancia lanzando dagas cuánticas.',
    descriptionEn: 'Defeat 20 enemies from a distance throwing quantum daggers.',
    category: 'combat',
    tier: 'silver',
    iconName: 'Zap',
    target: 20,
    points: 60,
  },

  // EXPLORATION & CRYSTAL FEATS
  {
    id: 'crystal_collector_50',
    titleEs: 'Recolector de Cristales I',
    titleEn: 'Crystal Collector I',
    descriptionEs: 'Acumula 50 cristales de energía cuántica en tu partida.',
    descriptionEn: 'Accumulate 50 quantum energy crystals in your save file.',
    category: 'exploration',
    tier: 'bronze',
    iconName: 'Gem',
    target: 50,
    points: 25,
  },
  {
    id: 'crystal_collector_250',
    titleEs: 'Coleccionista de Cristales II',
    titleEn: 'Crystal Collector II',
    descriptionEs: 'Reúne 250 cristales a lo largo de tus expediciones.',
    descriptionEn: 'Gather 250 crystals throughout your expeditions.',
    category: 'exploration',
    tier: 'silver',
    iconName: 'Gem',
    target: 250,
    points: 50,
  },
  {
    id: 'crystal_collector_500',
    titleEs: 'Magnate de Cristales III',
    titleEn: 'Crystal Tycoon III',
    descriptionEs: 'Alcanza la colosal cifra de 500 cristales de energía recolectados.',
    descriptionEn: 'Reach the colossal milestone of 500 energy crystals collected.',
    category: 'exploration',
    tier: 'gold',
    iconName: 'Sparkles',
    target: 500,
    points: 100,
  },
  {
    id: 'crystal_perfectionist',
    titleEs: 'Perfección Cristalina',
    titleEn: 'Crystal Perfectionist',
    descriptionEs: 'Recoge el 100% de todos los cristales en cualquier nivel individual.',
    descriptionEn: 'Collect 100% of all crystals in any individual level.',
    category: 'exploration',
    tier: 'gold',
    iconName: 'Star',
    points: 75,
  },
  {
    id: 'secret_archaeologist',
    titleEs: 'Arqueólogo del Tiempo',
    titleEn: 'Time Archaeologist',
    descriptionEs: 'Descubre 3 reliquias o cámaras secretas ocultas en los mundos.',
    descriptionEn: 'Discover 3 secret relics or hidden chambers in the worlds.',
    category: 'exploration',
    tier: 'silver',
    iconName: 'Compass',
    target: 3,
    points: 75,
  },
  {
    id: 'bounce_acrobat',
    titleEs: 'Acróbata de Trampolines',
    titleEn: 'Spring Acrobat',
    descriptionEs: 'Rebota 15 veces en trampolines solares, setas gigantes o impulsores.',
    descriptionEn: 'Bounce 15 times on solar trampolines, giant mushrooms or spring pads.',
    category: 'exploration',
    tier: 'bronze',
    iconName: 'Wind',
    target: 15,
    points: 35,
  },

  // SPEED FEATS
  {
    id: 'speed_demon',
    titleEs: 'Demonio Veloz',
    titleEn: 'Speed Demon',
    descriptionEs: 'Completa cualquier nivel de la campaña en menos de 60 segundos.',
    descriptionEn: 'Complete any campaign level in less than 60 seconds.',
    category: 'speed',
    tier: 'silver',
    iconName: 'Timer',
    points: 60,
  },
  {
    id: 'time_attack_record',
    titleEs: 'Maestro del Contrarreloj',
    titleEn: 'Time Attack Master',
    descriptionEs: 'Consigue una medalla de Oro en cualquier pista del Modo Contrarreloj.',
    descriptionEn: 'Earn a Gold medal on any track in Time Attack Mode.',
    category: 'speed',
    tier: 'gold',
    iconName: 'Trophy',
    points: 100,
  },

  // MASTERY & SPECIAL MODES FEATS
  {
    id: 'only_up_50m',
    titleEs: 'Hacia las Nubes',
    titleEn: 'Cloud Climber',
    descriptionEs: 'Escala al menos 50 metros en el modo Kronos Only Up.',
    descriptionEn: 'Climb at least 50 meters in Kronos Only Up mode.',
    category: 'mastery',
    tier: 'bronze',
    iconName: 'Flame',
    target: 50,
    points: 40,
  },
  {
    id: 'only_up_100m',
    titleEs: 'Rey de las Alturas (100m)',
    titleEn: 'Apex Ascendant (100m)',
    descriptionEs: 'Supera los 100 metros en Kronos Only Up esquivando la lava cuántica.',
    descriptionEn: 'Surpass 100 meters in Kronos Only Up dodging the quantum lava.',
    category: 'mastery',
    tier: 'platinum',
    iconName: 'Award',
    target: 100,
    points: 150,
  },
  {
    id: 'jungle_conqueror',
    titleEs: 'Conquistador de la Selva Maya',
    titleEn: 'Jungle Run Conqueror',
    descriptionEs: 'Supera la Zona 6 (Jungle Run) y vence al colosal jaguar Balam.',
    descriptionEn: 'Conquer Zone 6 (Jungle Run) and defeat the colossal jaguar Balam.',
    category: 'mastery',
    tier: 'gold',
    iconName: 'Target',
    points: 100,
  },
  {
    id: 'dimension_voyager',
    titleEs: 'Viajero Dimensional',
    titleEn: 'Dimension Voyager',
    descriptionEs: 'Entra y supera un Special Stage a través de un portal dimensional.',
    descriptionEn: 'Enter and conquer a Special Stage through an interdimensional portal.',
    category: 'mastery',
    tier: 'silver',
    iconName: 'Radio',
    points: 70,
  },
  {
    id: 'kronos_restored',
    titleEs: 'Guardián del Reloj de Kronos',
    titleEn: 'Guardian of Kronos',
    descriptionEs: 'Reúne las 5 piezas místicas y restaura el Santuario del Reloj de Kronos.',
    descriptionEn: 'Gather the 5 mystical pieces and restore the Kronos Clock Sanctuary.',
    category: 'mastery',
    tier: 'platinum',
    iconName: 'Clock',
    points: 200,
  },
  {
    id: 'blizzard_skier',
    titleEs: 'Descenso en la Ventisca',
    titleEn: 'Blizzard Downhill Racer',
    descriptionEs: 'Supera el descenso en esquís del Acto 1 de Blizzard Rush saltando rampas y esquivando ramas.',
    descriptionEn: 'Conquer the ski downhill in Blizzard Rush Act 1 jumping ramps and dodging branches.',
    category: 'speed',
    tier: 'silver',
    iconName: 'Wind',
    points: 70,
  },
  {
    id: 'blizzard_yeti_slayer',
    titleEs: 'Conquistador del Yeti',
    titleEn: 'Yeti Conqueror',
    descriptionEs: 'Vence al temible Yeti Colosal en la cima helada del Acto 3 de Blizzard Rush.',
    descriptionEn: 'Defeat the Colossal Yeti at the frozen peak of Blizzard Rush Act 3.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Skull',
    points: 120,
  },
  {
    id: 'blizzard_conqueror',
    titleEs: 'Amo del Invierno',
    titleEn: 'Master of Winter',
    descriptionEs: 'Completa todos los actos de la Zona Blizzard Rush.',
    descriptionEn: 'Complete all acts of the Blizzard Rush Zone.',
    category: 'mastery',
    tier: 'gold',
    iconName: 'Award',
    points: 100,
  },

  // STEAMPUNK ERA FEATS (ZONE 8)
  {
    id: 'steampunk_vulkan_slayer',
    titleEs: 'Apaga-Calderas: Vulkan-Ω',
    titleEn: 'Boiler Extinguisher: Vulkan-Ω',
    descriptionEs: 'Vence al titán Vulkan-Ω tras ascender los 1000m de la chimenea industrial de vapor.',
    descriptionEn: 'Defeat titan Vulkan-Ω after ascending 1000m through the industrial steam smokestack.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Flame',
    points: 120,
  },
  {
    id: 'steampunk_conqueror',
    titleEs: 'Maestro del Vapor y Latón',
    titleEn: 'Master of Steam & Brass',
    descriptionEs: 'Supera la Zona 8 (Steampunk) y reclama el Núcleo Térmico de Alta Presión.',
    descriptionEn: 'Conquer Zone 8 (Steampunk) and claim the High-Pressure Thermal Core.',
    category: 'mastery',
    tier: 'gold',
    iconName: 'Award',
    points: 100,
  },

  // CASTLE SMASH FEATS (ZONE 9)
  {
    id: 'castle_wall_breaker',
    titleEs: 'Ariete Demoledor',
    titleEn: 'Bastion Battering Ram',
    descriptionEs: 'Destruye 15 barricadas, empalizadas y muros de piedra en Castle Smash.',
    descriptionEn: 'Smash 15 barricades, palisades, and stone walls in Castle Smash.',
    category: 'exploration',
    tier: 'silver',
    iconName: 'Target',
    target: 15,
    points: 60,
  },
  {
    id: 'castle_malakar_slayer',
    titleEs: 'Verdugo de Lord Malakar',
    titleEn: 'Slayer of Lord Malakar',
    descriptionEs: 'Vence al temible señor de la guerra Lord Malakar en la torre más alta del bastión.',
    descriptionEn: 'Defeat warlord Lord Malakar at the highest battlements of the bastion.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Skull',
    points: 120,
  },
  {
    id: 'castle_conqueror',
    titleEs: 'Señor del Bastión Feudal',
    titleEn: 'Lord of the Feudal Bastion',
    descriptionEs: 'Completa los 3 actos de Castle Smash y obtén el Blasón Real de Hierro.',
    descriptionEn: 'Complete all 3 acts of Castle Smash and earn the Royal Bastion Crest.',
    category: 'mastery',
    tier: 'gold',
    iconName: 'Crown',
    points: 100,
  },

  // PIRATE'S TREASURE FEATS (ZONE 10)
  {
    id: 'pirate_deep_diver',
    titleEs: 'Explorador Submarino',
    titleEn: 'Abyssal Deep Diver',
    descriptionEs: 'Sumérgete en el arrecife abisal del Acto 2 de Pirate\'s Treasure en baja gravedad.',
    descriptionEn: 'Dive into the abyssal reef of Pirate\'s Treasure Act 2 under low gravity.',
    category: 'exploration',
    tier: 'silver',
    iconName: 'Compass',
    points: 60,
  },
  {
    id: 'pirate_cursed_chest_slayer',
    titleEs: 'Cazatesoros de Ultramar',
    titleEn: 'High Seas Treasure Hunter',
    descriptionEs: 'Destruye al colosal Mímico del Cofre Maldito en el naufragio del Acto 3.',
    descriptionEn: 'Defeat the colossal Cursed Mimic Chest in the Act 3 shipwreck depths.',
    category: 'combat',
    tier: 'gold',
    iconName: 'Skull',
    points: 130,
  },
  {
    id: 'pirate_conqueror',
    titleEs: 'Rey Corsario de los 7 Mares',
    titleEn: 'Corsair King of the Seven Seas',
    descriptionEs: 'Supera los 3 actos de Pirate\'s Treasure y reclama el Astrolabio Dorado del Corsario.',
    descriptionEn: 'Conquer all 3 acts of Pirate\'s Treasure and claim the Corsair\'s Golden Astrolabe.',
    category: 'mastery',
    tier: 'platinum',
    iconName: 'Crown',
    points: 150,
  },

  // COMBAT & DEXTERITY FEATS
  {
    id: 'parry_master',
    titleEs: 'Maestro del Parry Cuántico',
    titleEn: 'Quantum Parry Master',
    descriptionEs: 'Ejecuta 10 desvíos y bloqueos perfectos con tu escudo de luz.',
    descriptionEn: 'Execute 10 perfect parries and deflections with your light shield.',
    category: 'combat',
    tier: 'silver',
    iconName: 'Shield',
    target: 10,
    points: 60,
  },
  {
    id: 'speed_runner_pro',
    titleEs: 'Viajero a la Velocidad de la Luz',
    titleEn: 'Lightspeed Speedrunner',
    descriptionEs: 'Supera 5 niveles distintos de la campaña en menos de 90 segundos cada uno.',
    descriptionEn: 'Beat 5 different campaign levels in under 90 seconds each.',
    category: 'speed',
    tier: 'gold',
    iconName: 'Timer',
    target: 5,
    points: 100,
  },
  {
    id: 'master_archaeologist_all',
    titleEs: 'Gran Arqueólogo del Espacio-Tiempo',
    titleEn: 'Grand Spacetime Archaeologist',
    descriptionEs: 'Encuentra y recoge 10 secretos ocultos a lo largo de las distintas eras.',
    descriptionEn: 'Find and collect 10 hidden secrets across the dimensional eras.',
    category: 'exploration',
    tier: 'platinum',
    iconName: 'Compass',
    target: 10,
    points: 150,
  },
];

const ACHIEVEMENTS_STORAGE_KEY = 'zion_achievements_v2';

export const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

// Listeners for newly unlocked achievements
const unlockListeners = new Set<(achievement: AchievementDef) => void>();

export function onAchievementUnlocked(cb: (achievement: AchievementDef) => void): () => void {
  unlockListeners.add(cb);
  return () => {
    unlockListeners.delete(cb);
  };
}

export function loadUnlockedAchievements(): Record<string, UnlockedAchievement> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading achievements:', e);
  }
  return {};
}

export function saveUnlockedAchievements(data: Record<string, UnlockedAchievement>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving achievements:', e);
  }
}

/**
 * Unlocks an achievement or updates its progress.
 * If progress meets or exceeds target (or target is undefined), unlocks it.
 * Returns true if this call newly unlocked the achievement.
 */
export function unlockAchievement(id: string, progress = 1): boolean {
  const def = ACHIEVEMENT_MAP.get(id);
  if (!def) return false;

  const current = loadUnlockedAchievements();
  const existing = current[id];

  const target = def.target || 1;
  const newProgress = Math.max(existing?.progress || 0, progress);
  const isNowUnlocked = newProgress >= target;

  if (isNowUnlocked && (!existing || existing.progress < target)) {
    current[id] = {
      id,
      unlockedAt: existing?.unlockedAt || Date.now(),
      progress: newProgress,
    };
    saveUnlockedAchievements(current);

    // Notify listeners
    unlockListeners.forEach((fn) => {
      try {
        fn(def);
      } catch (err) {
        console.error('Error in achievement listener:', err);
      }
    });

    return true;
  } else if (!existing || existing.progress < newProgress) {
    current[id] = {
      id,
      unlockedAt: existing?.unlockedAt || 0,
      progress: newProgress,
    };
    saveUnlockedAchievements(current);
  }

  return false;
}

/**
 * Increment numeric progress for a tiered achievement (e.g. bounce count, crystal count, dagger kills)
 */
export function incrementAchievementProgress(id: string, amount = 1): boolean {
  const current = loadUnlockedAchievements();
  const existing = current[id];
  const oldProgress = existing?.progress || 0;
  return unlockAchievement(id, oldProgress + amount);
}

/**
 * Returns overall statistics for achievements
 */
export function getAchievementStats() {
  const unlocked = loadUnlockedAchievements();
  const total = ACHIEVEMENTS.length;
  let unlockedCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  let bronze = 0;
  let silver = 0;
  let gold = 0;
  let platinum = 0;

  for (const a of ACHIEVEMENTS) {
    totalPoints += a.points;
    const rec = unlocked[a.id];
    const target = a.target || 1;
    const isUnlocked = rec && rec.progress >= target;

    if (isUnlocked) {
      unlockedCount++;
      earnedPoints += a.points;
      if (a.tier === 'bronze') bronze++;
      else if (a.tier === 'silver') silver++;
      else if (a.tier === 'gold') gold++;
      else if (a.tier === 'platinum') platinum++;
    }
  }

  const percentage = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return {
    total,
    unlockedCount,
    percentage,
    totalPoints,
    earnedPoints,
    bronze,
    silver,
    gold,
    platinum,
  };
}

export interface LevelCompletionContext {
  levelIndex: number;
  hitsTaken: number;
  deaths: number;
  crystalsCollected: number;
  totalCrystalsInLevel: number;
  timeSeconds: number;
  isBossLevel: boolean;
  isBossDefeated: boolean;
  isSpecialStage: boolean;
  isJungleRunFinal: boolean;
  isBlizzardDownhill?: boolean;
  isBlizzardFinal?: boolean;
  totalSaveCrystals: number;
  totalSaveSecrets: number;
  clockPiecesPlacedCount: number;
}

/**
 * Evaluates achievements at the end of a level run
 */
export function checkLevelCompletionAchievements(ctx: LevelCompletionContext): string[] {
  const newlyUnlocked: string[] = [];

  // 1. No Damage Run (Feat specifically requested by user)
  if (ctx.hitsTaken === 0 && ctx.deaths === 0) {
    if (unlockAchievement('no_damage_run')) {
      newlyUnlocked.push('no_damage_run');
    }
  }

  // 2. Boss Slayer & Flawless Boss
  if (ctx.isBossLevel && ctx.isBossDefeated) {
    if (unlockAchievement('boss_slayer')) {
      newlyUnlocked.push('boss_slayer');
    }
    incrementAchievementProgress('titan_slayer', 1);

    if (ctx.hitsTaken === 0 && ctx.deaths === 0) {
      if (unlockAchievement('boss_flawless')) {
        newlyUnlocked.push('boss_flawless');
      }
    }
  }

  // 3. Crystal Perfectionist (100% in a level)
  if (ctx.totalCrystalsInLevel > 0 && ctx.crystalsCollected >= ctx.totalCrystalsInLevel) {
    if (unlockAchievement('crystal_perfectionist')) {
      newlyUnlocked.push('crystal_perfectionist');
    }
  }

  // 4. Cumulative Crystal collector milestones
  if (ctx.totalSaveCrystals >= 50) {
    if (unlockAchievement('crystal_collector_50', ctx.totalSaveCrystals)) {
      newlyUnlocked.push('crystal_collector_50');
    }
  }
  if (ctx.totalSaveCrystals >= 250) {
    if (unlockAchievement('crystal_collector_250', ctx.totalSaveCrystals)) {
      newlyUnlocked.push('crystal_collector_250');
    }
  }
  if (ctx.totalSaveCrystals >= 500) {
    if (unlockAchievement('crystal_collector_500', ctx.totalSaveCrystals)) {
      newlyUnlocked.push('crystal_collector_500');
    }
  }

  // 5. Speed Demon (< 60 seconds)
  if (ctx.timeSeconds > 0 && ctx.timeSeconds < 60) {
    if (unlockAchievement('speed_demon')) {
      newlyUnlocked.push('speed_demon');
    }
  }

  // 6. Secret Archaeologist
  if (ctx.totalSaveSecrets >= 3) {
    if (unlockAchievement('secret_archaeologist', ctx.totalSaveSecrets)) {
      newlyUnlocked.push('secret_archaeologist');
    }
  }

  // 7. Special Stage Clear
  if (ctx.isSpecialStage) {
    if (unlockAchievement('dimension_voyager')) {
      newlyUnlocked.push('dimension_voyager');
    }
  }

  // 8. Jungle Conqueror (Zone 6 completed, boss Balam beaten)
  if (ctx.isJungleRunFinal && ctx.isBossDefeated) {
    if (unlockAchievement('jungle_conqueror')) {
      newlyUnlocked.push('jungle_conqueror');
    }
  }

  // 9. Kronos Clock Restored
  if (ctx.clockPiecesPlacedCount >= 5) {
    if (unlockAchievement('kronos_restored')) {
      newlyUnlocked.push('kronos_restored');
    }
  }

  // 10. Blizzard Rush Achievements
  if (ctx.isBlizzardDownhill) {
    if (unlockAchievement('blizzard_skier')) {
      newlyUnlocked.push('blizzard_skier');
    }
  }
  if (ctx.isBlizzardFinal && ctx.isBossDefeated) {
    if (unlockAchievement('blizzard_yeti_slayer')) {
      newlyUnlocked.push('blizzard_yeti_slayer');
    }
    if (unlockAchievement('blizzard_conqueror')) {
      newlyUnlocked.push('blizzard_conqueror');
    }
  }

  // 11. Steampunk (Zone 8, levelIndex 24 is steampunk-3)
  if (ctx.levelIndex === 24 && ctx.isBossDefeated) {
    if (unlockAchievement('steampunk_vulkan_slayer')) {
      newlyUnlocked.push('steampunk_vulkan_slayer');
    }
    if (unlockAchievement('steampunk_conqueror')) {
      newlyUnlocked.push('steampunk_conqueror');
    }
  }

  // 12. Castle Smash (Zone 9, levelIndex 27 is castlesmash-3)
  if (ctx.levelIndex === 27 && ctx.isBossDefeated) {
    if (unlockAchievement('castle_malakar_slayer')) {
      newlyUnlocked.push('castle_malakar_slayer');
    }
    if (unlockAchievement('castle_conqueror')) {
      newlyUnlocked.push('castle_conqueror');
    }
  }

  // 13. Pirate's Treasure (Zone 10: levelIndex 29 is piratestreasure-2, levelIndex 30 is piratestreasure-3)
  if (ctx.levelIndex === 29) {
    if (unlockAchievement('pirate_deep_diver')) {
      newlyUnlocked.push('pirate_deep_diver');
    }
  }
  if (ctx.levelIndex === 30 && ctx.isBossDefeated) {
    if (unlockAchievement('pirate_cursed_chest_slayer')) {
      newlyUnlocked.push('pirate_cursed_chest_slayer');
    }
    if (unlockAchievement('pirate_conqueror')) {
      newlyUnlocked.push('pirate_conqueror');
    }
  }

  // 14. Master Archaeologist (10 secrets)
  if (ctx.totalSaveSecrets >= 10) {
    if (unlockAchievement('master_archaeologist_all', ctx.totalSaveSecrets)) {
      newlyUnlocked.push('master_archaeologist_all');
    }
  }

  // 15. Speedrunner Pro (Fast level clear under 90s)
  if (ctx.timeSeconds > 0 && ctx.timeSeconds < 90) {
    incrementAchievementProgress('speed_runner_pro', 1);
  }

  return newlyUnlocked;
}
