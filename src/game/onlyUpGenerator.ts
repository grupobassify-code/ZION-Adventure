import { Platform, Hazard, Collectible, Enemy, ZoneId, Trampoline } from '../types';

export interface OnlyUpChunk {
  platforms: Platform[];
  hazards: Hazard[];
  crystals: Collectible[];
  heals: Collectible[];
  enemies: Enemy[];
  trampolines: Trampoline[];
}

export function getOnlyUpBiome(altitudeMeters: number): {
  zone: ZoneId;
  name: string;
  themeColor: string;
  accentColor: string;
  bgGradient: [string, string, string];
} {
  if (altitudeMeters < 150) {
    return {
      zone: 'neon',
      name: 'ERA 1: BOSQUE NEÓN',
      themeColor: '#22d3ee',
      accentColor: '#4ade80',
      bgGradient: ['#030712', '#082f49', '#022c22'],
    };
  } else if (altitudeMeters < 350) {
    return {
      zone: 'sakura',
      name: 'ERA 2: CEREZO ESPIRITUAL',
      themeColor: '#f472b6',
      accentColor: '#fb7185',
      bgGradient: ['#0f051d', '#3b0764', '#500724'],
    };
  } else if (altitudeMeters < 600) {
    return {
      zone: 'lavacliff',
      name: 'ERA 3: ACANTILADOS DE LAVA',
      themeColor: '#f97316',
      accentColor: '#ef4444',
      bgGradient: ['#180303', '#450a0a', '#7c2d12'],
    };
  } else if (altitudeMeters < 900) {
    return {
      zone: 'desert',
      name: 'ERA 4: SANTUARIO DEL DESIERTO',
      themeColor: '#f59e0b',
      accentColor: '#d97706',
      bgGradient: ['#1c1003', '#451a03', '#78350f'],
    };
  } else if (altitudeMeters < 1300) {
    return {
      zone: 'krono',
      name: 'ERA 5: KRONO CITY',
      themeColor: '#06b6d4',
      accentColor: '#8b5cf6',
      bgGradient: ['#030712', '#0f172a', '#1e1b4b'],
    };
  } else {
    return {
      zone: 'travel',
      name: 'ERA FINAL: FUSIÓN CUÁNTICA',
      themeColor: '#e879f9',
      accentColor: '#38bdf8',
      bgGradient: ['#0b021a', '#2e1065', '#0c4a6e'],
    };
  }
}

/**
 * Procedurally generates climbing platforms, obstacles, and items across a vertical height range.
 * Coordinates: y decreases as Zion climbs UP.
 */
export function generateOnlyUpChunk(
  fromY: number,
  toY: number,
  startEnemyId = 1000
): OnlyUpChunk {
  const platforms: Platform[] = [];
  const hazards: Hazard[] = [];
  const crystals: Collectible[] = [];
  const heals: Collectible[] = [];
  const enemies: Enemy[] = [];
  const trampolines: Trampoline[] = [];

  let currentY = fromY;
  let enemyId = startEnemyId;

  // Track previous horizontal position to ensure jumping paths zig-zag nicely
  let prevX = 140;

  while (currentY > toY) {
    const altitude = Math.max(0, Math.floor((140 - currentY) / 2));
    const biome = getOnlyUpBiome(altitude);

    // Vertical spacing: gentler (26-32px) at the start (<80m), then normal (30-42px)
    const dy = altitude < 80
      ? 26 + Math.floor(Math.sin(currentY * 0.05) * 4)
      : 32 + Math.floor(Math.sin(currentY * 0.05) * 6) + Math.min(6, Math.floor((altitude - 80) / 300));
    currentY -= dy;

    // Platform width: very generous (85-115px) at start (<100m), then gradually narrows to ~45px
    const baseW = altitude < 100
      ? 95 - Math.floor(altitude / 10)
      : Math.max(42, 75 - Math.floor((altitude - 100) / 60));
    const widthVar = Math.floor(Math.abs(Math.sin(currentY * 0.1)) * (altitude < 100 ? 20 : 16));
    const platW = altitude < 100
      ? Math.min(120, Math.max(75, baseW + widthVar))
      : Math.min(90, Math.max(40, baseW + widthVar));

    // Stagger X across left (32-90), middle (110-170), right (180-250)
    // Alternate sides to create an engaging climbing rhythm
    let targetX: number;
    if (prevX < 110) {
      targetX = 150 + Math.floor(Math.random() * 85); // move right
    } else if (prevX > 180) {
      targetX = 35 + Math.floor(Math.random() * 80); // move left
    } else {
      targetX = Math.random() > 0.5 ? 35 + Math.floor(Math.random() * 65) : 190 + Math.floor(Math.random() * 65);
    }
    prevX = targetX;
    const platX = Math.max(28, Math.min(292 - platW, targetX));

    // Determine platform kind according to era
    let kind: Platform['kind'] = 'ground';
    let dir: 1 | -1 | undefined = undefined;
    let speed: number | undefined = undefined;
    let phase: number | undefined = undefined;

    if (biome.zone === 'neon') {
      kind = Math.random() > 0.4 ? 'ledge' : 'ground';
    } else if (biome.zone === 'sakura') {
      if (Math.random() > 0.5) {
        kind = 'moon';
        phase = (Math.floor(Math.abs(currentY / 30)) % 4);
      } else {
        kind = 'bridge';
      }
    } else if (biome.zone === 'lavacliff') {
      if (Math.random() > 0.45) {
        kind = 'basalt'; // Sinking platform
      } else if (Math.random() > 0.5) {
        kind = 'conveyor';
        dir = Math.random() > 0.5 ? 1 : -1;
        speed = 1.2 + Math.min(1.0, altitude / 1000);
      } else {
        kind = 'ledge';
      }
    } else if (biome.zone === 'desert') {
      if (Math.random() > 0.5) {
        kind = 'sandstone';
      } else {
        kind = 'ruins';
      }
    } else if (biome.zone === 'krono') {
      if (Math.random() > 0.4) {
        kind = 'conveyor';
        dir = Math.random() > 0.5 ? 1 : -1;
        speed = 1.4 + Math.min(1.2, altitude / 800);
      } else if (Math.random() > 0.5) {
        kind = 'hologram';
        phase = (Math.floor(Math.abs(currentY / 25)) % 4);
      } else {
        kind = 'cyber';
      }
    } else {
      // Quantum Fusion: Hybrid of all eras
      const roll = Math.random();
      if (roll < 0.25) {
        kind = 'conveyor';
        dir = Math.random() > 0.5 ? 1 : -1;
        speed = 1.6;
      } else if (roll < 0.5) {
        kind = 'moon';
        phase = (Math.floor(Math.abs(currentY / 20)) % 4);
      } else if (roll < 0.75) {
        kind = 'basalt';
      } else {
        kind = 'hologram';
      }
    }

    platforms.push({
      x: platX,
      y: currentY,
      w: platW,
      h: 9,
      kind,
      dir,
      speed,
      phase,
      sinkTimer: 0,
      isSinking: false,
      originalY: currentY,
    });

    // Trampolines: Dynamic Bounce Pads that launch the player high into the air!
    // Start appearing after 15m, making the climb fast, fluid and exciting.
    let hasTrampoline = false;
    const canHaveTrampoline = altitude >= 15 && platW >= 42;
    const rollTrampoline = (Math.abs(currentY) % 60 < 22 && Math.random() < 0.65) || (Math.random() < 0.16);
    if (canHaveTrampoline && rollTrampoline) {
      hasTrampoline = true;
      const isSuper = altitude >= 120 && Math.random() < 0.30;
      const trampW = isSuper ? 22 : 18;
      const trampH = 7;
      trampolines.push({
        x: platX + platW / 2 - trampW / 2,
        y: currentY - trampH,
        w: trampW,
        h: trampH,
        bounceForce: isSuper ? -13.0 : -10.8,
        springAnim: 0,
        type: isSuper ? 'super' : 'standard',
      });
    }

    // Collectibles: Crystals along the way
    if (Math.random() > 0.3) {
      crystals.push({
        x: platX + platW / 2 - 4,
        y: hasTrampoline ? currentY - 32 : currentY - 14,
        w: 8,
        h: 10,
        taken: false,
      });
    }

    // Heals: More frequent early on (~40m) and every ~90m later (never on trampolines)
    const healInterval = altitude < 100 ? 80 : 170;
    if (!hasTrampoline && Math.abs(currentY) % healInterval < 30 && Math.random() > 0.4) {
      heals.push({
        x: platX + platW / 2 - 5,
        y: currentY - 14,
        w: 10,
        h: 10,
        taken: false,
      });
    }

    // Hazards generation based on biome (ZERO hazards on trampoline platforms or in early zone < 80m)
    const hazardChance = (altitude < 80 || hasTrampoline)
      ? 0
      : 0.14 + Math.min(0.32, (altitude - 80) / 700);
    if (hazardChance > 0 && Math.random() < hazardChance) {
      if (biome.zone === 'neon') {
        hazards.push({
          x: platX + 8,
          y: currentY - 6,
          w: Math.min(22, platW - 16),
          h: 7,
          type: 'spike',
        });
      } else if (biome.zone === 'sakura') {
        if (Math.random() > 0.5) {
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 45,
            w: 16,
            h: 40,
            type: 'swingingBlade',
            bladeAngle: 0,
            bladeSpeed: 0.04,
          });
        }
      } else if (biome.zone === 'lavacliff') {
        // Geyser
        if (Math.random() > 0.5) {
          hazards.push({
            x: platX + platW / 2 - 7,
            y: currentY - 32,
            w: 14,
            h: 32,
            type: 'geyser',
            erupting: false,
            cycleTimer: 0,
            maxCycle: 110,
            warnTimer: 25,
          });
        }
      } else if (biome.zone === 'desert') {
        if (Math.random() > 0.5) {
          hazards.push({
            x: platX + platW / 2 - 9,
            y: currentY - 45,
            w: 18,
            h: 14,
            type: 'fallingBlock',
            isFalling: false,
            vy: 0,
            originalY: currentY - 45,
          });
        } else {
          hazards.push({
            x: platX + platW / 2 - 10,
            y: currentY - 10,
            w: 20,
            h: 10,
            type: 'curseRune',
          });
        }
      } else if (biome.zone === 'krono' || biome.zone === 'travel') {
        // Laser gates or EMP floors
        if (Math.random() > 0.5) {
          hazards.push({
            x: platX + platW / 2 - 5,
            y: currentY - 38,
            w: 10,
            h: 38,
            type: 'laserGate',
            active: true,
            cycleTimer: 0,
            maxCycle: 90,
          });
        } else {
          hazards.push({
            x: platX + 4,
            y: currentY - 4,
            w: platW - 8,
            h: 6,
            type: 'empFloor',
            active: true,
            cycleTimer: 0,
            maxCycle: 100,
          });
        }
      }
    }

    // Enemies ONLY start appearing after 1000m in high-altitude layers on wide platforms
    if (altitude >= 1000 && platW >= 65 && !hasTrampoline && Math.random() < 0.22) {
      const highAltitudeEnemies: Enemy['type'][] = ['cyber_drone', 'cyberturret', 'plasma_trooper', 'sentinel'];
      const selectedType = highAltitudeEnemies[Math.floor(Math.random() * highAltitudeEnemies.length)];
      enemies.push({
        id: enemyId++,
        type: selectedType,
        x: platX + 12,
        y: currentY - 16,
        w: 14,
        h: 16,
        vx: 0.6,
        vy: 0,
        min: platX + 4,
        max: platX + platW - 18,
        alive: true,
        hp: 2,
        maxHp: 2,
        scoreValue: 150,
        xpValue: 30,
        home: platX + 12,
        cool: 60,
      });
    }
  }

  return { platforms, hazards, crystals, heals, enemies, trampolines };
}
