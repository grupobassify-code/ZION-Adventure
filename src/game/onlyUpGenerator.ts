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
  // Track last trampoline Y to strictly prevent trampoline saturation
  let lastTrampolineY = fromY + 400;

  while (currentY > toY) {
    const altitude = Math.max(0, Math.floor((140 - currentY) / 2));
    const biome = getOnlyUpBiome(altitude);

    // Vertical spacing matches Zion's altitude-scaled jump power progression:
    // Higher altitude gives Zion higher jump height, so gaps expand dynamically!
    let baseDy = 28;
    if (altitude < 80) {
      baseDy = 28 + Math.floor(Math.sin(currentY * 0.05) * 3); // 25-31px (easy starting jump)
    } else if (altitude < 200) {
      baseDy = 34 + Math.floor(Math.sin(currentY * 0.05) * 4); // 30-38px
    } else if (altitude < 450) {
      baseDy = 42 + Math.floor(Math.sin(currentY * 0.05) * 5); // 37-47px
    } else if (altitude < 800) {
      baseDy = 50 + Math.floor(Math.sin(currentY * 0.05) * 5); // 45-55px
    } else if (altitude < 1200) {
      baseDy = 58 + Math.floor(Math.sin(currentY * 0.05) * 6); // 52-64px
    } else {
      baseDy = 66 + Math.floor(Math.sin(currentY * 0.05) * 7); // 59-73px (apex leaps!)
    }
    currentY -= baseDy;

    // Platform width: very generous at start, gradually narrows to require precision landing
    let baseW = 95;
    if (altitude < 80) {
      baseW = 85 + Math.floor(Math.random() * 25); // 85-110px
    } else if (altitude < 200) {
      baseW = 68 + Math.floor(Math.random() * 20); // 68-88px
    } else if (altitude < 450) {
      baseW = 52 + Math.floor(Math.random() * 18); // 52-70px
    } else if (altitude < 800) {
      baseW = 42 + Math.floor(Math.random() * 14); // 42-56px
    } else if (altitude < 1200) {
      baseW = 35 + Math.floor(Math.random() * 12); // 35-47px
    } else {
      baseW = 30 + Math.floor(Math.random() * 10); // 30-40px (apex precision)
    }
    const platW = Math.max(30, Math.min(115, baseW));

    // Stagger X across left (32-90), middle (110-170), right (180-250)
    // Higher speeds allow wider horizontal traversals
    let targetX: number;
    if (prevX < 110) {
      targetX = 145 + Math.floor(Math.random() * 95); // move right
    } else if (prevX > 180) {
      targetX = 35 + Math.floor(Math.random() * 90); // move left
    } else {
      targetX = Math.random() > 0.5 ? 35 + Math.floor(Math.random() * 70) : 185 + Math.floor(Math.random() * 70);
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
      if (Math.random() > 0.42) {
        kind = 'basalt'; // Sinking platform
      } else if (Math.random() > 0.45) {
        kind = 'conveyor';
        dir = Math.random() > 0.5 ? 1 : -1;
        speed = 1.3 + Math.min(1.2, altitude / 700);
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
        speed = 1.5 + Math.min(1.4, altitude / 600);
      } else if (Math.random() > 0.5) {
        kind = 'hologram';
        phase = (Math.floor(Math.abs(currentY / 25)) % 4);
      } else {
        kind = 'cyber';
      }
    } else {
      // Quantum Fusion: Hybrid of all eras
      const roll = Math.random();
      if (roll < 0.3) {
        kind = 'conveyor';
        dir = Math.random() > 0.5 ? 1 : -1;
        speed = 1.8;
      } else if (roll < 0.55) {
        kind = 'moon';
        phase = (Math.floor(Math.abs(currentY / 20)) % 4);
      } else if (roll < 0.8) {
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

    // Trampolines (Bounce Pads)
    // STRICT REDUCTION: Prevents trampoline saturation and ensures they become much rarer as altitude rises
    // At high altitude, Zion's enhanced speed and super jump take over, so trampolines become rare bonus shortcuts!
    let hasTrampoline = false;
    let minGap = 200;
    let trampChance = 0.08;

    if (altitude < 80) {
      minGap = 200; // ~100m gap
      trampChance = 0.07;
    } else if (altitude < 250) {
      minGap = 360; // ~180m gap
      trampChance = 0.045;
    } else if (altitude < 600) {
      minGap = 550; // ~275m gap
      trampChance = 0.025;
    } else if (altitude < 1000) {
      minGap = 850; // ~425m gap
      trampChance = 0.012;
    } else {
      minGap = 1300; // ~650m gap (virtually none at apex)
      trampChance = 0.006;
    }

    const distFromLastTramp = Math.abs(currentY - lastTrampolineY);
    if (distFromLastTramp >= minGap && platW >= 42 && Math.random() < trampChance) {
      hasTrampoline = true;
      lastTrampolineY = currentY;
      const isSuper = altitude >= 150 && Math.random() < 0.45;
      const trampW = isSuper ? 22 : 18;
      const trampH = 7;
      trampolines.push({
        x: platX + platW / 2 - trampW / 2,
        y: currentY - trampH,
        w: trampW,
        h: trampH,
        bounceForce: isSuper ? -13.5 : -11.0,
        springAnim: 0,
        type: isSuper ? 'super' : 'standard',
      });
    }

    // Collectibles: Crystals along the way
    if (Math.random() > 0.35) {
      crystals.push({
        x: platX + platW / 2 - 4,
        y: hasTrampoline ? currentY - 34 : currentY - 14,
        w: 8,
        h: 10,
        taken: false,
      });
    }

    // Heals: Early on (~60m) and rarer later (~160m), never on trampolines
    const healInterval = altitude < 100 ? 90 : 200;
    if (!hasTrampoline && Math.abs(currentY) % healInterval < 28 && Math.random() > 0.45) {
      heals.push({
        x: platX + platW / 2 - 5,
        y: currentY - 14,
        w: 10,
        h: 10,
        taken: false,
      });
    }

    // Dynamic Hazard & Obstacle Generation (Richer and more diverse as altitude rises)
    // Strict safety: NEVER generate hazards on trampoline platforms
    const hazardChance = (altitude < 50 || hasTrampoline)
      ? 0
      : Math.min(0.58, 0.18 + (altitude / 1200) * 0.38);

    if (hazardChance > 0 && Math.random() < hazardChance) {
      if (biome.zone === 'neon') {
        // Neon Zone (0-150m): Edge spikes, patrolling saws, wall dart traps
        const roll = Math.random();
        if (roll < 0.45) {
          // Ledge Spikes
          hazards.push({
            x: platX + 4,
            y: currentY - 6,
            w: Math.min(20, platW - 12),
            h: 7,
            type: 'spike',
          });
        } else if (roll < 0.75 && platW >= 55) {
          // Patrolling Saw Blade
          hazards.push({
            x: platX + 8,
            y: currentY - 12,
            w: 14,
            h: 14,
            type: 'sawBlade',
            railMin: platX + 2,
            railMax: platX + platW - 16,
            moveSpeed: 1.2,
            dir: 1,
            bladeAngle: 0,
          });
        } else {
          // Wall Dart Trap
          const onRight = Math.random() > 0.5;
          hazards.push({
            x: onRight ? 284 : 26,
            y: currentY - 16,
            w: 10,
            h: 12,
            type: 'dartTrap',
            dir: onRight ? -1 : 1,
            shootDir: onRight ? -1 : 1,
            shootCooldown: 40 + Math.floor(Math.random() * 40),
          });
        }
      } else if (biome.zone === 'sakura') {
        // Sakura Era (150-350m): Ceremonial swinging blades, wall shuriken traps, falling torii blocks
        const roll = Math.random();
        if (roll < 0.4) {
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 48,
            w: 16,
            h: 42,
            type: 'swingingBlade',
            bladeAngle: 0,
            bladeSpeed: 0.042,
          });
        } else if (roll < 0.7) {
          hazards.push({
            x: platX + platW / 2 - 9,
            y: currentY - 50,
            w: 18,
            h: 14,
            type: 'fallingBlock',
            isFalling: false,
            vy: 0,
            fallVy: 0,
            originalY: currentY - 50,
            floorY: currentY - 14,
          });
        } else if (platW >= 50) {
          hazards.push({
            x: platX + 6,
            y: currentY - 12,
            w: 14,
            h: 14,
            type: 'sawBlade',
            railMin: platX + 2,
            railMax: platX + platW - 16,
            moveSpeed: 1.5,
            dir: 1,
            bladeAngle: 0,
          });
        } else {
          hazards.push({
            x: Math.random() > 0.5 ? 284 : 26,
            y: currentY - 16,
            w: 10,
            h: 12,
            type: 'dartTrap',
            dir: Math.random() > 0.5 ? -1 : 1,
            shootCooldown: 30 + Math.floor(Math.random() * 35),
          });
        }
      } else if (biome.zone === 'lavacliff') {
        // Lavacliff Era (350-600m): Volcanic geysers, flame jets, hydraulic crushers, thermal saws
        const roll = Math.random();
        if (roll < 0.3) {
          // Flame Jet Nozzle
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 10,
            w: 16,
            h: 10,
            type: 'flameJet',
            erupting: false,
            flameTimer: 0,
            cycleTimer: Math.floor(Math.random() * 50),
            flameAngle: 0, // upward fire blast
          });
        } else if (roll < 0.58) {
          // Volcanic Geyser
          hazards.push({
            x: platX + platW / 2 - 7,
            y: currentY - 12,
            w: 14,
            h: 30,
            type: 'geyser',
            erupting: false,
            cycleTimer: Math.floor(Math.random() * 40),
            maxCycle: 110,
            warnTimer: 25,
          });
        } else if (roll < 0.82) {
          // Basalt Crusher Piston
          hazards.push({
            x: platX + platW / 2 - 12,
            y: currentY - 50,
            w: 24,
            h: 22,
            type: 'crusher',
            ceilingY: currentY - 50,
            floorY: currentY - 20,
            crushState: 'idle',
            crushTimer: Math.floor(Math.random() * 60),
            crushSpeed: 5.5,
          });
        } else if (platW >= 48) {
          hazards.push({
            x: platX + 4,
            y: currentY - 12,
            w: 14,
            h: 14,
            type: 'sawBlade',
            railMin: platX + 2,
            railMax: platX + platW - 16,
            moveSpeed: 1.8,
            dir: 1,
            bladeAngle: 0,
          });
        }
      } else if (biome.zone === 'desert') {
        // Desert Sanctuary Era (600-900m): Heavy stone crushers, golden scythes, curse runes, falling blocks
        const roll = Math.random();
        if (roll < 0.32) {
          // Pharaoh Heavy Stone Crusher
          hazards.push({
            x: platX + platW / 2 - 13,
            y: currentY - 52,
            w: 26,
            h: 22,
            type: 'crusher',
            ceilingY: currentY - 52,
            floorY: currentY - 20,
            crushState: 'idle',
            crushTimer: Math.floor(Math.random() * 50),
            crushSpeed: 5.8,
          });
        } else if (roll < 0.58) {
          // Golden Scythe Swinging Blade
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 48,
            w: 16,
            h: 42,
            type: 'swingingBlade',
            bladeAngle: 0,
            bladeSpeed: 0.048,
          });
        } else if (roll < 0.78) {
          // Sarcophagus Falling Block
          hazards.push({
            x: platX + platW / 2 - 9,
            y: currentY - 52,
            w: 18,
            h: 14,
            type: 'fallingBlock',
            isFalling: false,
            vy: 0,
            fallVy: 0,
            originalY: currentY - 52,
            floorY: currentY - 14,
          });
        } else {
          // Cursed Rune on platform
          hazards.push({
            x: platX + platW / 2 - 9,
            y: currentY - 8,
            w: 18,
            h: 8,
            type: 'curseRune',
          });
        }
      } else if (biome.zone === 'krono') {
        // Krono City Era (900-1300m): Tesla coils, laser gates, pneumatic crushers, laser sawblades, EMP floors
        const roll = Math.random();
        if (roll < 0.28) {
          // Tesla Pillar
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 26,
            w: 16,
            h: 26,
            type: 'teslaPillar',
            cycleTimer: Math.floor(Math.random() * 40),
            active: false,
          });
        } else if (roll < 0.54) {
          // Laser Gate
          hazards.push({
            x: platX + platW / 2 - 5,
            y: currentY - 42,
            w: 10,
            h: 42,
            type: 'laserGate',
            active: true,
            cycleTimer: Math.floor(Math.random() * 30),
            maxCycle: 90,
          });
        } else if (roll < 0.76) {
          // Pneumatic High-Speed Crusher
          hazards.push({
            x: platX + platW / 2 - 13,
            y: currentY - 54,
            w: 26,
            h: 22,
            type: 'crusher',
            ceilingY: currentY - 54,
            floorY: currentY - 20,
            crushState: 'idle',
            crushTimer: Math.floor(Math.random() * 45),
            crushSpeed: 6.2,
          });
        } else if (platW >= 46) {
          // High-Speed Laser Buzzsaw
          hazards.push({
            x: platX + 4,
            y: currentY - 12,
            w: 14,
            h: 14,
            type: 'sawBlade',
            railMin: platX + 2,
            railMax: platX + platW - 16,
            moveSpeed: 2.2,
            dir: 1,
            bladeAngle: 0,
          });
        } else {
          // EMP Electrified Floor
          hazards.push({
            x: platX + 4,
            y: currentY - 4,
            w: platW - 8,
            h: 6,
            type: 'empFloor',
            active: true,
            cycleTimer: Math.floor(Math.random() * 30),
            maxCycle: 90,
          });
        }
      } else {
        // Quantum Fusion Era (1300m+): The Apex Gauntlet
        const roll = Math.random();
        if (roll < 0.25) {
          hazards.push({
            x: platX + platW / 2 - 8,
            y: currentY - 26,
            w: 16,
            h: 26,
            type: 'teslaPillar',
            cycleTimer: Math.floor(Math.random() * 40),
            active: false,
          });
        } else if (roll < 0.5) {
          hazards.push({
            x: platX + platW / 2 - 5,
            y: currentY - 44,
            w: 10,
            h: 44,
            type: 'laserGate',
            active: true,
            cycleTimer: Math.floor(Math.random() * 30),
            maxCycle: 80,
          });
        } else if (roll < 0.75) {
          hazards.push({
            x: platX + platW / 2 - 13,
            y: currentY - 56,
            w: 26,
            h: 22,
            type: 'crusher',
            ceilingY: currentY - 56,
            floorY: currentY - 20,
            crushState: 'idle',
            crushTimer: Math.floor(Math.random() * 40),
            crushSpeed: 6.8,
          });
        } else {
          hazards.push({
            x: platX + 4,
            y: currentY - 12,
            w: 14,
            h: 14,
            type: 'sawBlade',
            railMin: platX + 2,
            railMax: platX + platW - 16,
            moveSpeed: 2.6,
            dir: 1,
            bladeAngle: 0,
          });
        }
      }
    }

    // Airborne Sentinels & Cyber Drones: appear in high-altitude layers (>= 900m) on viable platforms
    if (altitude >= 900 && platW >= 55 && !hasTrampoline && Math.random() < 0.24) {
      const highAltitudeEnemies: Enemy['type'][] = ['cyber_drone', 'cyberturret', 'plasma_trooper', 'sentinel'];
      const selectedType = highAltitudeEnemies[Math.floor(Math.random() * highAltitudeEnemies.length)];
      enemies.push({
        id: enemyId++,
        type: selectedType,
        x: platX + 10,
        y: currentY - 16,
        w: 14,
        h: 16,
        vx: 0.75,
        vy: 0,
        min: platX + 3,
        max: platX + platW - 17,
        alive: true,
        hp: 2,
        maxHp: 2,
        scoreValue: 200,
        xpValue: 40,
        home: platX + 10,
        cool: 55,
      });
    }
  }

  return { platforms, hazards, crystals, heals, enemies, trampolines };
}
