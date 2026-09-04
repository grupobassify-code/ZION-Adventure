import { sound } from '../audio/soundEngine';
import {
  BASE_XP_NEEDED,
  COYOTE_FRAMES,
  DAGGER_BASE_DAMAGE,
  DAGGER_LIFETIME,
  DAGGER_MAX_AMMO,
  DAGGER_RECHARGE_TIME,
  DAGGER_SPEED,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  INVULNERABILITY_FRAMES,
  JUMP_BUFFER_FRAMES,
  JUMP_FORCE,
  MAX_ENERGY_BASE,
  MAX_FALL_SPEED,
  MAX_LIVES_BASE,
  MAX_PLAYER_LEVEL,
  MELEE_BASE_DAMAGE,
  MELEE_DURATION,
  MELEE_RANGE,
  PERFECT_PARRY_WINDOW,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_MAX_SPEED,
  SHOWDOWN_CHARGE_ON_PARRY,
  SHOWDOWN_CHARGE_PER_BLOCK,
  SHOWDOWN_COUNTER_DAMAGE,
  SHOWDOWN_SLOWMO_DURATION,
  SPECIAL_BASE_DAMAGE,
  SPECIAL_BURST_RADIUS,
  SPECIAL_ENERGY_COST,
  VARIABLE_JUMP_FALL_MULTIPLIER,
} from './constants';
import { buildLevel, LEVEL_CONFIGS } from './levelData';
import { generateOnlyUpChunk } from './onlyUpGenerator';
import { getOnlyUpRecord, saveOnlyUpRecord } from './saveManager';
import {
  Boss,
  Checkpoint,
  Collectible,
  Enemy,
  FloatingText,
  GameSettings,
  Hazard,
  Landmark,
  MeleeSlashEffect,
  NodePillar,
  Particle,
  Platform,
  Player,
  Projectile,
  SecretItem,
  SpecialBurstEffect,
  Trampoline,
} from '../types';

export interface GameInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  dagger: boolean;
  attack: boolean;
  block: boolean;
  dash: boolean;
  special: boolean;
  analogX?: number; // -1 to 1 analog joystick support
}

export interface GameStats {
  crystalsCollected: number;
  totalCrystals: number;
  secretsFound: number;
  totalSecrets: number;
  enemiesDefeated: number;
  elapsedTime: number; // in seconds
  deaths: number;
  score: number;
}

export class GameEngine {
  public levelIndex = 0;
  public cameraX = 0;
  public time = 0;

  public player: Player;
  public maxLives = MAX_LIVES_BASE;
  public lives = MAX_LIVES_BASE;
  public daggers = DAGGER_MAX_AMMO;
  public daggerRechargeTimer = 0;
  private daggerInputHeld = false;
  private attackInputHeld = false;
  private dashInputHeld = false;
  private specialInputHeld = false;

  public platforms: Platform[] = [];
  public hazards: Hazard[] = [];
  public enemies: Enemy[] = [];
  public crystals: Collectible[] = [];
  public secrets: SecretItem[] = [];
  public heals: Collectible[] = [];
  public checkpoints: Checkpoint[] = [];
  public landmarks: Landmark[] = [];
  public nodes: NodePillar[] = [];
  public boss: Boss | null = null;
  public goal: { x: number; y: number; w: number; h: number } | null = null;

  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public meleeEffects: MeleeSlashEffect[] = [];
  public specialEffects: SpecialBurstEffect[] = [];

  public spawnPoint = { x: 35, y: 100 };
  public arenaActive = false;
  public bossDefeated = false;
  public isLevelWon = false;
  public isGameOver = false;
  public isPaused = false;
  public inCutscene = true;
  public currentCutscenePage = 0;

  // Visual FX & Combat Feedback
  public screenShake = 0;
  public comboCount = 0;
  public comboTimer = 0;
  public comboRank: 'D' | 'C' | 'B' | 'A' | 'S' | 'SSS' = 'D';
  public bossIntroBanner: { active: boolean; timer: number; title: string; subtitle: string } | null = null;
  public levelIntroBanner: { active: boolean; timer: number; title: string; subtitle: string; act: number; zoneName: string; themeColor: string } | null = null;

  // Kronos Only Up Mode
  public isOnlyUpMode: boolean = false;
  public cameraY: number = 0;
  public onlyUpLavaY: number = 215;
  public onlyUpLavaSpeed: number = 0;
  public onlyUpGraceTimer: number = 180; // 3 seconds head start / ventaja
  public onlyUpAltitude: number = 0;
  public onlyUpMaxAltitude: number = 0;
  public onlyUpRecord: number = 0;
  public onlyUpIsGameOver: boolean = false;
  public onlyUpTimeSurvived: number = 0;
  public onlyUpActiveSlotId: number = 0;
  public onlyUpGeneratedTopY: number = 140;
  public onlyUpNewRecordAchieved: boolean = false;
  public onlyUpNextEnemyId: number = 2000;
  public trampolines: Trampoline[] = [];

  public stats: GameStats = {
    crystalsCollected: 0,
    totalCrystals: 0,
    secretsFound: 0,
    totalSecrets: 0,
    enemiesDefeated: 0,
    elapsedTime: 0,
    deaths: 0,
    score: 0,
  };

  public settings: GameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.6,
    godMode: false,
    infiniteDaggers: false,
    infiniteEnergy: false,
    showHitboxes: false,
    controlMode: 'joystick',
    performanceMode: false,
    showFps: false,
  };

  public onStateChange?: () => void;
  public onLevelComplete?: () => void;
  public onCheckpoint?: (cp: Checkpoint) => void;

  // Checkpoint & Progression Persistence Sets
  private collectedCrystalIndices = new Set<number>();
  private collectedHealIndices = new Set<number>();
  private collectedSecretIndices = new Set<number>();
  private collectedNodeIndices = new Set<number>();
  private defeatedEnemyIndices = new Set<number>();

  private cpSavedCrystals = new Set<number>();
  private cpSavedHeals = new Set<number>();
  private cpSavedSecrets = new Set<number>();
  private cpSavedNodes = new Set<number>();
  private cpSavedEnemies = new Set<number>();

  constructor(initialLevel = 0) {
    this.player = {
      x: 35,
      y: 100,
      w: 14,
      h: 16,
      vx: 0,
      vy: 0,
      facing: 1,
      ground: false,
      jumpHeld: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      inv: 0,
      time: 0,
      animState: 'idle',
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      isAttacking: false,
      attackTimer: 0,
      comboStep: 0,
      comboResetTimer: 0,
      isBlocking: false,
      blockTimer: 0,
      perfectParryTimer: 0,
      shieldEnergy: 100,
      maxShieldEnergy: 100,
      isShieldBroken: false,
      shieldBreakTimer: 0,
      showdownMeter: 0,
      showdownActive: false,
      showdownTimer: 0,
      showdownReady: false,
      level: 1,
      xp: 0,
      xpNeeded: BASE_XP_NEEDED,
      energy: 50,
      maxEnergy: MAX_ENERGY_BASE,
      attackPower: MELEE_BASE_DAMAGE,
      dashTrail: [],
    };
    this.loadLevel(initialLevel, true);
  }

  public loadLevel(index: number, showLore = true, fromCheckpoint = false) {
    this.isOnlyUpMode = false;
    this.cameraY = 0;
    this.onlyUpIsGameOver = false;
    this.levelIndex = Math.max(0, Math.min(LEVEL_CONFIGS.length - 1, index));
    const lvl = buildLevel(this.levelIndex);

    this.platforms = lvl.platforms;
    this.hazards = lvl.hazards;
    this.enemies = lvl.enemies;
    this.crystals = lvl.crystals;
    this.secrets = lvl.secrets;
    this.heals = lvl.heals;
    this.checkpoints = lvl.checkpoints;
    this.landmarks = lvl.landmarks;
    this.nodes = lvl.nodes;
    this.boss = lvl.boss;
    this.goal = lvl.goal;

    if (!fromCheckpoint) {
      this.collectedCrystalIndices.clear();
      this.collectedHealIndices.clear();
      this.collectedSecretIndices.clear();
      this.collectedNodeIndices.clear();
      this.defeatedEnemyIndices.clear();

      this.cpSavedCrystals.clear();
      this.cpSavedHeals.clear();
      this.cpSavedSecrets.clear();
      this.cpSavedNodes.clear();
      this.cpSavedEnemies.clear();

      this.spawnPoint = { x: 35, y: 100 };
      this.player.x = 35;
      this.player.y = 100;
    } else {
      this.player.x = this.spawnPoint.x;
      this.player.y = this.spawnPoint.y;

      // Apply checkpoint saved collections
      this.collectedCrystalIndices = new Set(this.cpSavedCrystals);
      this.collectedHealIndices = new Set(this.cpSavedHeals);
      this.collectedSecretIndices = new Set(this.cpSavedSecrets);
      this.collectedNodeIndices = new Set(this.cpSavedNodes);
      this.defeatedEnemyIndices = new Set(this.cpSavedEnemies);

      this.crystals.forEach((c, idx) => {
        if (this.collectedCrystalIndices.has(idx)) c.taken = true;
      });
      this.heals.forEach((h, idx) => {
        if (this.collectedHealIndices.has(idx)) h.taken = true;
      });
      this.secrets.forEach((s, idx) => {
        if (this.collectedSecretIndices.has(idx)) s.taken = true;
      });
      this.nodes.forEach((n, idx) => {
        if (this.collectedNodeIndices.has(idx)) n.taken = true;
      });
      this.enemies.forEach((e, idx) => {
        if (this.defeatedEnemyIndices.has(idx)) e.alive = false;
      });
    }

    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.inv = 30;
    this.player.isDashing = false;
    this.player.dashTimer = 0;
    this.player.dashCooldown = 0;
    this.player.isAttacking = false;
    this.player.isBlocking = false;
    this.player.shieldEnergy = 100;
    this.player.maxShieldEnergy = 100;
    this.player.isShieldBroken = false;
    this.player.shieldBreakTimer = 0;
    this.player.showdownActive = false;
    this.player.showdownTimer = 0;
    this.player.showdownReady = false;
    this.player.dashTrail = [];

    this.lives = this.maxLives;
    this.daggers = DAGGER_MAX_AMMO;
    this.daggerRechargeTimer = 0;

    // Instant array allocation to avoid lag/stutter
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.meleeEffects = [];
    this.specialEffects = [];
    this.cameraX = 0;

    this.arenaActive = false;
    this.bossDefeated = false;
    this.isLevelWon = false;
    this.isGameOver = false;
    this.screenShake = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboRank = 'D';
    this.bossIntroBanner = null;

    const zoneNames: Record<string, string> = {
      neon: 'BOSQUE NEÓN',
      sakura: 'BOSQUE DE CEREZO',
      lavacliff: 'ACANTILADO DE LAVA',
      desert: 'SANTUARIO DEL DESIERTO',
      krono: 'KRONO CITY',
      travel: 'KRONOS TRAVEL',
    };

    this.levelIntroBanner = {
      active: true,
      timer: 180,
      title: lvl.config.title,
      subtitle: lvl.config.subtitle,
      act: lvl.config.act,
      zoneName: zoneNames[lvl.config.zone] || lvl.config.zone.toUpperCase(),
      themeColor: lvl.config.themeColor || '#06b6d4',
    };

    this.inCutscene = showLore && (lvl.config.lore.length > 0);
    this.currentCutscenePage = 0;

    this.stats.totalCrystals = lvl.crystals.length;
    this.stats.totalSecrets = lvl.secrets.length;

    this.syncMusic();
    this.addFloatingText(GAME_WIDTH / 2, 40, lvl.config.title, '#38bdf8');
    this.notifyState();
  }

  public startOnlyUpMode(slotId = 0) {
    this.isOnlyUpMode = true;
    this.onlyUpActiveSlotId = slotId;
    this.onlyUpRecord = getOnlyUpRecord(slotId);
    this.onlyUpAltitude = 0;
    this.onlyUpMaxAltitude = 0;
    this.onlyUpIsGameOver = false;
    this.onlyUpNewRecordAchieved = false;
    this.onlyUpTimeSurvived = 0;
    this.onlyUpGraceTimer = 180; // 3 seconds head start (ventaja de 3s)
    this.onlyUpLavaY = 215; // submerged comfortably below ground
    this.onlyUpLavaSpeed = 0;
    this.onlyUpGeneratedTopY = 140;
    this.onlyUpNextEnemyId = 2000;

    this.levelIndex = 0;
    this.arenaActive = false;
    this.boss = null;
    this.bossDefeated = false;
    this.isLevelWon = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.inCutscene = false;

    this.player.x = 145;
    this.player.y = 136;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.inv = 60;
    this.player.shieldEnergy = 100;
    this.player.maxShieldEnergy = 100;
    this.player.isShieldBroken = false;
    this.player.energy = 60;
    this.lives = this.maxLives;
    this.daggers = DAGGER_MAX_AMMO;

    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.meleeEffects = [];
    this.specialEffects = [];
    this.cameraX = 0;
    this.cameraY = 0;

    // Solid base foundation
    this.platforms = [
      { x: 26, y: 155, w: 268, h: 25, kind: 'ground' },
    ];
    this.hazards = [];
    this.crystals = [];
    this.heals = [];
    this.enemies = [];
    this.checkpoints = [];
    this.landmarks = [];
    this.nodes = [];
    this.goal = null;
    this.trampolines = [];

    // Initial climbing platforms
    const initialChunk = generateOnlyUpChunk(140, -460, this.onlyUpNextEnemyId);
    this.platforms.push(...initialChunk.platforms);
    this.hazards.push(...initialChunk.hazards);
    this.crystals.push(...initialChunk.crystals);
    this.heals.push(...initialChunk.heals);
    this.enemies.push(...initialChunk.enemies);
    if (initialChunk.trampolines) {
      this.trampolines.push(...initialChunk.trampolines);
    }
    this.onlyUpGeneratedTopY = -460;
    this.onlyUpNextEnemyId += 100;

    this.levelIntroBanner = {
      active: true,
      timer: 180,
      title: 'KRONOS ONLY UP',
      subtitle: '¡Sube sin parar y escapa de la lava cuántica!',
      act: 1,
      zoneName: 'MODO ASCENSO INFINITO',
      themeColor: '#f97316',
    };

    sound.setMusicTrack('lavacliffAct1');
    this.notifyState();
  }

  public syncMusic() {
    if (this.inCutscene || this.isPaused) {
      sound.stopMusic();
      return;
    }
    if (this.isOnlyUpMode) {
      sound.setMusicTrack('lavacliffAct1');
      return;
    }
    const currentConfig = LEVEL_CONFIGS[this.levelIndex];
    if (currentConfig.zone === 'neon') {
      if (this.boss && this.arenaActive && !this.bossDefeated) {
        sound.setMusicTrack('neonBoss');
      } else {
        sound.setMusicTrack('neonAct1');
      }
    } else if (currentConfig.zone === 'sakura') {
      if (this.boss && this.arenaActive && !this.bossDefeated) {
        sound.setMusicTrack('sakuraBoss');
      } else {
        sound.setMusicTrack('sakuraAct1');
      }
    } else if (currentConfig.zone === 'lavacliff') {
      // Lavacliff Zone
      if (this.boss && this.arenaActive && !this.bossDefeated) {
        sound.setMusicTrack('lavacliffBoss');
      } else {
        sound.setMusicTrack('lavacliffAct1');
      }
    } else if (currentConfig.zone === 'desert') {
      // Desert Sanctuary Zone
      if (this.boss && this.arenaActive && !this.bossDefeated) {
        sound.setMusicTrack('desertBoss');
      } else if (currentConfig.act === 2) {
        sound.setMusicTrack('desertAct2');
      } else {
        sound.setMusicTrack('desertAct1');
      }
    } else if (currentConfig.zone === 'krono') {
      // Krono City Zone
      if (this.boss && this.arenaActive && !this.bossDefeated) {
        sound.setMusicTrack('kronoBoss');
      } else if (currentConfig.act === 2) {
        sound.setMusicTrack('kronoAct2');
      } else {
        sound.setMusicTrack('kronoAct1');
      }
    } else if (currentConfig.zone === 'travel') {
      // Kronos Travel: Grand Dimensional Fusion Medley
      sound.setMusicTrack('kronosTravel');
    }
  }

  public advanceCutscene() {
    const lore = LEVEL_CONFIGS[this.levelIndex].lore;
    if (this.currentCutscenePage < lore.length - 1) {
      this.currentCutscenePage++;
      sound.playSfx('node');
    } else {
      this.inCutscene = false;
      sound.playSfx('win');
      this.syncMusic();
    }
    this.notifyState();
  }

  public skipCutscene() {
    this.inCutscene = false;
    this.syncMusic();
    this.notifyState();
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    this.syncMusic();
    this.notifyState();
  }

  public getComboMultiplier(): number {
    switch (this.comboRank) {
      case 'SSS': return 4.0;
      case 'S': return 2.75;
      case 'A': return 2.0;
      case 'B': return 1.5;
      case 'C': return 1.25;
      default: return 1.0;
    }
  }

  public addXp(amount: number) {
    const p = this.player;
    p.xp += amount;
    this.stats.score += amount * 10;
    this.addFloatingText(p.x, p.y - 18, `+${amount} XP`, '#38bdf8');

    while (p.xp >= p.xpNeeded && p.level < MAX_PLAYER_LEVEL) {
      p.xp -= p.xpNeeded;
      p.level++;
      p.xpNeeded = Math.round(p.xpNeeded * 1.45);
      
      // Stat Growth
      p.attackPower += 1;
      p.maxEnergy = Math.min(200, p.maxEnergy + 20);
      p.energy = p.maxEnergy;
      
      this.maxLives = Math.min(5, MAX_LIVES_BASE + Math.floor(p.level / 2));
      this.lives = this.maxLives; // Full heal on level up

      sound.playSfx('levelUp');
      this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 28, '#facc15');
      this.addFloatingText(p.x, p.y - 30, `★ ¡NIVEL ${p.level}! ★`, '#facc15');
      this.addFloatingText(p.x, p.y - 42, `+1 ATK | +20 SP | SALUD AL MÁX`, '#4ade80');
    }
    this.notifyState();
  }

  public addEnergy(amount: number) {
    const p = this.player;
    p.energy = Math.min(p.maxEnergy, p.energy + amount);
  }

  public update(inputs: GameInputState) {
    if (this.isPaused || this.inCutscene || this.isLevelWon) {
      return;
    }

    if (this.isOnlyUpMode && this.onlyUpIsGameOver) {
      this.updateEffects();
      return;
    }

    this.time++;
    if (this.time % 60 === 0) {
      this.stats.elapsedTime++;
      // Passive energy regen (1 SP every 3 seconds)
      if (this.time % 180 === 0) {
        this.addEnergy(1);
      }
    }

    if (this.settings.infiniteEnergy) {
      this.player.energy = this.player.maxEnergy;
    }

    if (this.isOnlyUpMode) {
      this.updateOnlyUp();
      if (this.onlyUpIsGameOver) {
        this.updateEffects();
        return;
      }
    }

    this.updatePlayerMovement(inputs);
    this.updatePlayerCombat(inputs);
    this.updateDaggers(inputs);
    this.updateEnemies();
    this.updateBoss();
    this.updateHazards();
    this.updateProjectiles();
    this.updatePhasingMoonPlatforms();
    this.checkCollisions();
    this.updateEffects();
    this.updateCamera();
  }

  private updatePlayerMovement(inputs: GameInputState) {
    const p = this.player;
    p.time++;

    // Dash / Dodge Execution
    if (inputs.dash && !this.dashInputHeld && p.dashCooldown <= 0 && !p.isDashing) {
      p.isDashing = true;
      p.dashTimer = DASH_DURATION;
      p.dashCooldown = DASH_COOLDOWN;
      p.inv = Math.max(p.inv, DASH_DURATION + 4);
      p.vx = p.facing * DASH_SPEED;
      p.vy = 0; // suspend gravity momentarily
      sound.playSfx('dash');
      this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 10, '#38bdf8');
      this.dashInputHeld = true;
    }
    if (!inputs.dash) {
      this.dashInputHeld = false;
    }

    if (p.dashCooldown > 0) {
      p.dashCooldown--;
    }

    // Process Active Dash
    if (p.isDashing) {
      p.dashTimer--;
      p.vx = p.facing * DASH_SPEED;
      p.vy = 0;

      // Add ghost trail for visual impact
      if (p.time % 2 === 0) {
        p.dashTrail.push({
          x: p.x,
          y: p.y,
          facing: p.facing,
          alpha: 0.65,
        });
      }

      if (p.dashTimer <= 0) {
        p.isDashing = false;
        p.vx *= 0.5; // smooth decel transition
      }
    } else {
      // Normal Horizontal Movement with Analog & Digital Smooth Accel/Decel
      let targetDirection = 0;
      if (inputs.analogX !== undefined && Math.abs(inputs.analogX) > 0.15) {
        targetDirection = inputs.analogX;
        p.facing = inputs.analogX > 0 ? 1 : -1;
      } else if (inputs.left && !inputs.right) {
        targetDirection = -1;
        p.facing = -1;
      } else if (inputs.right && !inputs.left) {
        targetDirection = 1;
        p.facing = 1;
      }

      if (targetDirection !== 0) {
        p.vx += targetDirection * PLAYER_ACCEL;
      } else {
        // Smooth Deceleration
        if (Math.abs(p.vx) > 0.05) {
          p.vx = p.vx > 0 ? Math.max(0, p.vx - PLAYER_DECEL) : Math.min(0, p.vx + PLAYER_DECEL);
        } else {
          p.vx = 0;
        }
      }

      // Max Speed Clamping
      const maxSpd = PLAYER_MAX_SPEED;
      p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));

      // Sakura Zone wind assist
      const config = LEVEL_CONFIGS[this.levelIndex];
      if (config.zone === 'sakura' && config.act === 1) {
        p.vx += 0.04;
      }

      // Jump Buffering & Coyote Time
      if (p.ground) {
        p.coyoteTimer = COYOTE_FRAMES;
      } else if (p.coyoteTimer > 0) {
        p.coyoteTimer--;
      }

      if (inputs.jump && !p.jumpHeld) {
        p.jumpBufferTimer = JUMP_BUFFER_FRAMES;
      } else if (p.jumpBufferTimer > 0) {
        p.jumpBufferTimer--;
      }
      p.jumpHeld = inputs.jump;

      // Execute Jump
      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
        p.vy = JUMP_FORCE;
        p.ground = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        sound.playSfx('jump');
        this.createBurst(p.x + p.w / 2, p.y + p.h, 6, '#e2e8f0');
      }

      // Variable jump height release cut
      if (!inputs.jump && p.vy < 0) {
        p.vy += GRAVITY * VARIABLE_JUMP_FALL_MULTIPLIER;
      }

      // Gravity
      p.vy = Math.min(p.vy + GRAVITY, MAX_FALL_SPEED);
    }

    // Resolve Horizontal Movement
    p.x += p.vx;
    if (this.isOnlyUpMode) {
      p.x = Math.max(26, Math.min(294 - p.w, p.x));
    } else {
      const config = LEVEL_CONFIGS[this.levelIndex];
      const worldW = config.worldWidth;
      p.x = Math.max(0, Math.min(worldW - p.w, p.x));
    }

    // Resolve Wall Collisions (In Only Up mode, platforms are jump-through and do not block horizontally)
    const walls = this.isOnlyUpMode ? [] : [...this.platforms];
    if (this.boss && this.arenaActive && !this.bossDefeated) {
      const arenaLeft = this.boss.x - 380;
      const arenaRight = this.boss.x + 380;
      walls.push({ x: arenaLeft, y: 0, w: 8, h: 180, kind: 'arena' });
      walls.push({ x: arenaRight, y: 0, w: 8, h: 180, kind: 'arena' });
    }

    for (const plat of walls) {
      if (plat.hidden) continue;
      if (this.checkAABB(p, plat)) {
        if (p.vx > 0) {
          p.x = plat.x - p.w;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.w;
        }
        p.vx = 0;
      }
    }

    // Resolve Vertical Movement
    p.y += p.vy;
    p.ground = false;

    if (this.isOnlyUpMode) {
      // In Only Up mode: platforms are jump-through (traspasables)
      // Moving UP (vy < 0): player passes freely right through platforms
      // Falling DOWN (vy >= 0): player lands securely on top
      const prevBottom = (p.y - p.vy) + p.h;
      const currentBottom = p.y + p.h;

      for (const plat of this.platforms) {
        if (plat.hidden) continue;

        // Ground base platform at y=155 is solid
        if (plat.kind === 'ground' && plat.y >= 155) {
          if (this.checkAABB(p, plat) && p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.ground = true;
          }
          continue;
        }

        // Pass-through platforms: land only when falling down
        if (p.vy >= 0) {
          const horizontalOverlap = p.x + p.w > plat.x + 2 && p.x < plat.x + plat.w - 2;
          const verticalLanding = prevBottom <= plat.y + 7 && currentBottom >= plat.y;
          if (horizontalOverlap && verticalLanding) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.ground = true;

            // Handle conveyor platform movement
            if (plat.kind === 'conveyor' && plat.speed && plat.dir) {
              p.x += plat.speed * plat.dir;
              p.x = Math.max(26, Math.min(294 - p.w, p.x));
            }
          }
        }
      }

      // Dynamic Trampolines (Bounce Pads)
      for (const t of this.trampolines) {
        if (t.springAnim > 0) {
          t.springAnim--;
        }
        if (this.checkAABB(p, t)) {
          if (p.vy >= -1.0) {
            p.y = t.y - p.h;
            p.vy = t.bounceForce; // Launches Zion high up into the air!
            t.springAnim = 16;
            p.ground = false;
            p.coyoteTimer = 0;
            sound.playSfx('jump');
            this.screenShake = t.type === 'super' ? 8 : 4;
            const isSuper = t.type === 'super';
            this.createBurst(t.x + t.w / 2, t.y, isSuper ? 18 : 12, isSuper ? '#e879f9' : '#38bdf8');
            this.addFloatingText(
              p.x,
              p.y - 14,
              isSuper ? '🚀 ¡MEGA IMPULSO!' : '⏫ ¡TRAMPOLÍN!',
              isSuper ? '#f472b6' : '#38bdf8'
            );
          }
        }
      }
    } else {
      // Campaign level collision
      for (const plat of this.platforms) {
        if (plat.hidden) continue;
        if (this.checkAABB(p, plat)) {
          if (plat.kind === 'quicksand') {
            p.ground = true;
            if (!p.isDashing) {
              p.vy = 0.35;
              p.vx *= 0.6;
            }
          } else if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.ground = true;
          } else if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        }
      }
    }

    // Pit fall check (Only in campaign levels; Only Up mode handles falls via the rising lava)
    if (!this.isOnlyUpMode && p.y > GAME_HEIGHT + 40) {
      this.handlePlayerDamage('¡Caíste al abismo!');
    }

    // Invulnerability timer
    if (p.inv > 0) {
      p.inv--;
    }

    // Update Dash Trail Fading (in-place zero allocation)
    let trailWrite = 0;
    for (let i = 0; i < p.dashTrail.length; i++) {
      const trail = p.dashTrail[i];
      trail.alpha -= 0.08;
      if (trail.alpha > 0) {
        p.dashTrail[trailWrite++] = trail;
      }
    }
    p.dashTrail.length = trailWrite;
  }

  public triggerShowdownParry(sourceX: number, sourceY: number, label = '⚡ ¡SHOWDOWN PARRY! ⚡') {
    const p = this.player;
    p.showdownActive = true;
    p.showdownTimer = SHOWDOWN_SLOWMO_DURATION;
    p.showdownMeter = 100;
    p.showdownReady = true;
    p.inv = 60;
    this.screenShake = 10;
    sound.playSfx('showdownParry');

    // Create golden radial shockwave
    this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 35, '#facc15');
    this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 20, '#ffffff');
    this.addFloatingText(p.x, p.y - 25, label, '#facc15');
    this.addFloatingText(p.x, p.y - 38, '⚔️ PRESIONA ATAQUE PARA CONTRAATAQUE ⚔️', '#ffffff');

    // Restore energy & dagger
    this.addEnergy(40);
    this.daggers = Math.min(DAGGER_MAX_AMMO, this.daggers + 1);

    // Stagger all nearby enemies & boss
    for (const e of this.enemies) {
      if (e.alive && Math.abs(e.x - p.x) < 180) {
        e.vx = -p.facing * 4.0;
        e.vy = -2.5;
        this.applyDamageToEnemy(e, 2, -p.facing);
      }
    }

    if (this.boss && this.boss.alive && Math.abs(this.boss.x - p.x) < 260) {
      if (this.boss.name.includes('Kronos')) {
        this.boss.state = 'overheat';
        this.boss.stateTimer = 160;
        this.boss.inv = 0;
        this.addFloatingText(this.boss.x + this.boss.w / 2, this.boss.y - 28, '🔥 ¡TITÁN KRONOS-Ω SOBRECALENTADO! (DAÑO x3)', '#f97316');
      } else {
        this.boss.isStaggered = true;
        this.boss.stagger = this.boss.maxStagger;
        this.boss.stateTimer = 90;
        this.addFloatingText(this.boss.x + this.boss.w / 2, this.boss.y - 20, '⚡ ¡JEFE ATURDIDO POR SHOWDOWN!', '#facc15');
      }
    }

    // Deflect all hostile projectiles on screen into golden seeker star bolts
    for (const proj of this.projectiles) {
      if (!proj.isHero) {
        proj.isHero = true;
        proj.vx = -proj.vx * 1.6;
        proj.vy = -1.5;
        proj.damage = 4;
        proj.kind = 'sakuraShuriken';
        proj.life = 120;
      }
    }
  }

  public executeShowdownCounterSlash() {
    const p = this.player;
    p.showdownActive = false;
    p.showdownTimer = 0;
    p.showdownMeter = 0;
    p.showdownReady = false;
    p.inv = 45;

    sound.playSfx('showdownSlash');
    this.screenShake = 12;

    // Fast golden forward flash dash
    p.vx = p.facing * DASH_SPEED * 1.8;
    p.vy = -1.0;
    p.isAttacking = true;
    p.attackTimer = 16;

    // Leave golden trail afterimages
    for (let i = 0; i < 5; i++) {
      p.dashTrail.push({
        x: p.x - p.facing * i * 8,
        y: p.y,
        facing: p.facing,
        alpha: 1.0,
      });
    }

    // Huge golden counter slash effect
    const slashX = p.x + (p.facing > 0 ? p.w : -24);
    this.meleeEffects.push({
      x: slashX,
      y: p.y - 8,
      facing: p.facing,
      life: 14,
      maxLife: 14,
      combo: 3,
    });

    this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 40, '#facc15');
    this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 25, '#f43f5e');
    this.addFloatingText(p.x, p.y - 30, '⚡ ¡¡CORTE SHOWDOWN CRÍTICO!! ⚡', '#fde047');

    const counterHitbox = {
      x: p.facing > 0 ? p.x - 10 : p.x - MELEE_RANGE * 2.2,
      y: p.y - 12,
      w: MELEE_RANGE * 2.2 + 20,
      h: p.h + 24,
    };

    const counterDamage = p.attackPower + SHOWDOWN_COUNTER_DAMAGE;

    // Hit Enemies
    for (const e of this.enemies) {
      if (e.alive && this.checkAABB(counterHitbox, e)) {
        this.applyDamageToEnemy(e, counterDamage, p.facing);
        this.createBurst(e.x + e.w / 2, e.y + e.h / 2, 18, '#facc15');
      }
    }

    // Hit Boss
    if (this.boss && this.boss.alive && !this.boss.shield && this.checkAABB(counterHitbox, this.boss)) {
      const bossDmg = this.boss.state === 'overheat' ? counterDamage * 3 : counterDamage * 2;
      this.applyDamageToBoss(bossDmg);
      this.createBurst(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 35, '#facc15');
    }
  }

  private updatePlayerCombat(inputs: GameInputState) {
    const p = this.player;

    // Showdown Slow-Mo Timer Update
    if (p.showdownActive) {
      p.showdownTimer--;
      if (p.showdownTimer <= 0) {
        p.showdownActive = false;
      }
    }

    // 1. DEFENSE / BLOCKING & SHIELD RECHARGE MECHANIC
    if (inputs.block && !p.isShieldBroken && p.shieldEnergy > 0) {
      p.isBlocking = true;
      p.blockTimer++;
      if (p.blockTimer === 1) {
        p.perfectParryTimer = PERFECT_PARRY_WINDOW;
        sound.playSfx('block');
      }
      // Drain shield stamina continuously while held (lasts ~3.8 seconds)
      p.shieldEnergy = Math.max(0, p.shieldEnergy - 0.44);
      if (p.shieldEnergy <= 0) {
        p.isBlocking = false;
        p.isShieldBroken = true;
        p.shieldBreakTimer = 120; // 2 seconds cooldown
        sound.playSfx('shieldBreak');
        this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#ef4444');
        this.addFloatingText(p.x, p.y - 18, '⚡ ¡ESCUDO AGOTADO Y ROTO!', '#ef4444');
        this.screenShake = 6;
      }
    } else {
      p.isBlocking = false;
      p.blockTimer = 0;

      // Handle cooldown if shield was broken
      if (p.isShieldBroken) {
        p.shieldBreakTimer--;
        if (p.shieldBreakTimer <= 0) {
          p.isShieldBroken = false;
          p.shieldEnergy = 25; // Base restoration
          sound.playSfx('node');
          this.addFloatingText(p.x, p.y - 14, '🛡️ ¡Escudo Restaurado!', '#38bdf8');
          this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 12, '#38bdf8');
        }
      } else {
        // Passive shield stamina regeneration when not blocking
        if (p.shieldEnergy < p.maxShieldEnergy) {
          p.shieldEnergy = Math.min(p.maxShieldEnergy, p.shieldEnergy + 0.55);
        }
      }
    }
    if (p.perfectParryTimer > 0) {
      p.perfectParryTimer--;
    }

    // 2. SHOWDOWN COUNTER TRIGGER VIA ATTACK INPUT
    if (inputs.attack && !this.attackInputHeld && (p.showdownActive || (p.isBlocking && p.showdownMeter >= 100))) {
      this.executeShowdownCounterSlash();
      this.attackInputHeld = true;
      return;
    }

    // 3. MELEE ATTACK COMBO
    if (p.comboResetTimer > 0) {
      p.comboResetTimer--;
      if (p.comboResetTimer <= 0) {
        p.comboStep = 0;
      }
    }

    if (inputs.attack && !this.attackInputHeld && !p.isAttacking && !p.isBlocking) {
      p.isAttacking = true;
      p.attackTimer = MELEE_DURATION;
      p.comboStep = (p.comboStep % 3) + 1;
      p.comboResetTimer = 35; // Window to continue next combo hit

      sound.playSfx('slash');

      // Create visual slash effect
      const slashX = p.x + (p.facing > 0 ? p.w : -12);
      this.meleeEffects.push({
        x: slashX,
        y: p.y - 2,
        facing: p.facing,
        life: 8,
        maxLife: 8,
        combo: p.comboStep,
      });

      // Hitbox for Melee Attack
      const attackHitbox = {
        x: p.facing > 0 ? p.x + p.w : p.x - MELEE_RANGE,
        y: p.y - 6,
        w: MELEE_RANGE + 4,
        h: p.h + 12,
      };

      const dmg = p.attackPower + (p.comboStep === 3 ? 2 : 0);

      // Hit Enemies
      for (const e of this.enemies) {
        if (e.alive && this.checkAABB(attackHitbox, e)) {
          this.applyDamageToEnemy(e, dmg, p.facing);
          this.addEnergy(6);
        }
      }

      // Hit Boss Nodes
      for (const node of this.nodes) {
        if (!node.taken && this.checkAABB(attackHitbox, node)) {
          node.taken = true;
          this.createBurst(node.x + node.w / 2, node.y + node.h / 2, 14, '#22d3ee');
          sound.playSfx('node');
          this.addFloatingText(node.x, node.y - 14, '✦ Nodo Activado', '#22d3ee');
          if (this.nodes.every((n) => n.taken) && this.boss && this.boss.shield) {
            this.boss.shield = false;
            sound.playSfx('shieldBreak');
            this.addFloatingText(this.boss.x, this.boss.y - 20, '¡ESCUDO DESTRUIDO!', '#4ade80');
          }
        }
      }

      // Hit Boss
      if (this.boss && this.boss.alive && !this.boss.shield && this.boss.inv <= 0 && this.checkAABB(attackHitbox, this.boss)) {
        this.applyDamageToBoss(dmg);
        this.addEnergy(8);
      }

      this.attackInputHeld = true;
    }
    if (!inputs.attack) {
      this.attackInputHeld = false;
    }

    if (p.isAttacking) {
      p.attackTimer--;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
      }
    }

    // 4. SPECIAL ABILITY (ENERGY BURST)
    if (inputs.special && !this.specialInputHeld && p.energy >= SPECIAL_ENERGY_COST) {
      p.energy -= SPECIAL_ENERGY_COST;
      sound.playSfx('special');

      const config = LEVEL_CONFIGS[this.levelIndex];
      const burstColor = config.zone === 'neon' ? '#22d3ee' : '#f43f5e';

      this.specialEffects.push({
        x: p.x + p.w / 2,
        y: p.y + p.h / 2,
        radius: 10,
        maxRadius: SPECIAL_BURST_RADIUS,
        color: burstColor,
        life: 20,
        maxLife: 20,
      });

      this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 35, burstColor);

      // Special Ability Area Damage Hitbox
      const burstArea = {
        x: p.x + p.w / 2 - SPECIAL_BURST_RADIUS,
        y: p.y + p.h / 2 - SPECIAL_BURST_RADIUS,
        w: SPECIAL_BURST_RADIUS * 2,
        h: SPECIAL_BURST_RADIUS * 2,
      };

      const specialDmg = SPECIAL_BASE_DAMAGE + p.attackPower;

      // Clear hostile projectiles in radius
      this.projectiles = this.projectiles.filter((proj) => {
        if (!proj.isHero && this.checkAABB(burstArea, proj)) {
          this.createBurst(proj.x, proj.y, 4, '#fbbf24');
          return false;
        }
        return true;
      });

      // Damage all enemies in radius
      for (const e of this.enemies) {
        if (e.alive && this.checkAABB(burstArea, e)) {
          this.applyDamageToEnemy(e, specialDmg, Math.sign(e.x - p.x) || p.facing);
        }
      }

      // Damage Boss if in radius
      if (this.boss && this.boss.alive && !this.boss.shield && this.checkAABB(burstArea, this.boss)) {
        this.applyDamageToBoss(specialDmg);
      }

      this.addFloatingText(p.x, p.y - 24, '💥 ¡HABILIDAD ESPECIAL!', burstColor);
      this.specialInputHeld = true;
    }
    if (!inputs.special) {
      this.specialInputHeld = false;
    }
  }

  public registerHit(damage: number, isCrit = false) {
    this.comboCount++;
    this.comboTimer = 110;
    
    const prevRank = this.comboRank;
    if (this.comboCount >= 25) this.comboRank = 'SSS';
    else if (this.comboCount >= 18) this.comboRank = 'S';
    else if (this.comboCount >= 12) this.comboRank = 'A';
    else if (this.comboCount >= 7) this.comboRank = 'B';
    else if (this.comboCount >= 3) this.comboRank = 'C';
    else this.comboRank = 'D';

    // Milestone healing on S and SSS Combo Ranks!
    if ((this.comboRank === 'S' && prevRank !== 'S' && prevRank !== 'SSS') || (this.comboRank === 'SSS' && prevRank !== 'SSS')) {
      if (this.lives < this.maxLives) {
        this.lives = Math.min(this.maxLives, this.lives + 1);
        sound.playSfx('heal');
        this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 20, '#4ade80');
        this.addFloatingText(this.player.x, this.player.y - 36, `🔥 ¡COMBO ${this.comboRank}! +1 VIDA RECUPERADA ❤`, '#4ade80');
      }
    }

    if (this.comboCount % 5 === 0) {
      sound.playSfx('combo');
      this.addFloatingText(this.player.x, this.player.y - 28, `🔥 COMBO x${this.comboCount} [${this.comboRank}]`, '#facc15');
    }
    this.screenShake = Math.max(this.screenShake, isCrit ? 7 : 3.5);
  }

  private applyDamageToEnemy(e: Enemy, damage: number, knockbackDir: number) {
    this.registerHit(damage);
    e.hp -= damage;
    e.hitFlash = 12;
    e.vx = knockbackDir * 2.2;
    this.createBurst(e.x + e.w / 2, e.y + e.h / 2, 8, '#38bdf8');
    sound.playSfx('hit');
    this.addFloatingText(e.x + e.w / 2, e.y - 8, `-${damage}`, '#fde047');

    if (e.hp <= 0) {
      e.alive = false;
      const eIdx = this.enemies.indexOf(e);
      if (eIdx !== -1) {
        this.defeatedEnemyIndices.add(eIdx);
      }
      this.stats.enemiesDefeated++;
      this.createBurst(e.x + e.w / 2, e.y + e.h / 2, 16, '#f43f5e');
      
      const multiplier = this.getComboMultiplier();
      const pts = Math.round((e.scoreValue || 200) * multiplier);
      this.stats.score += pts;
      this.addXp(e.xpValue || 25);
      
      // 30% chance to drop energy recovery
      if (Math.random() < 0.30) {
        this.addEnergy(15);
        this.addFloatingText(e.x, e.y - 14, '+15 SP', '#06b6d4');
      }

      // 25% chance to drop life recovery if wounded!
      if (this.lives < this.maxLives && Math.random() < 0.25) {
        this.lives = Math.min(this.maxLives, this.lives + 1);
        sound.playSfx('heal');
        this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 18, '#4ade80');
        this.addFloatingText(this.player.x, this.player.y - 22, `❤ ¡BOTÍN DE VIDA RECUPERADA! [${this.lives}/${this.maxLives}]`, '#4ade80');
      }
    }
  }

  private applyDamageToBoss(rawDamage: number) {
    const b = this.boss;
    if (!b || !b.alive || b.shield) return;

    let damage = rawDamage;
    let isStaggerHit = false;

    // Bonus damage if boss is currently staggered or overheated
    if (b.state === 'overheat') {
      damage = Math.round(rawDamage * 2.0);
      isStaggerHit = true;
      this.addFloatingText(b.x + b.w / 2, b.y - 28, '🔥 ¡GOLPE CRÍTICO EN SOBRECALENTAMIENTO (x2)!', '#f97316');
    } else if (b.isStaggered) {
      damage = Math.round(rawDamage * 1.5);
      isStaggerHit = true;
      this.addFloatingText(b.x + b.w / 2, b.y - 28, '💥 ¡GOLPE EN ATURDIMIENTO (+50%)!', '#fbbf24');
    }

    this.registerHit(damage, isStaggerHit);

    // Build stagger bar if not already staggered
    if (!b.isStaggered) {
      b.stagger += rawDamage * 12;
      if (b.stagger >= b.maxStagger) {
        b.isStaggered = true;
        b.state = 'staggered';
        b.stateTimer = 160;
        b.stagger = b.maxStagger;
        sound.playSfx('stagger');
        this.screenShake = 8;
        this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 25, '#fbbf24');
        this.addFloatingText(b.x + b.w / 2, b.y - 35, '⚡ ¡POSTURA ROTA! ¡JEFE ATURDIDO!', '#facc15');
      }
    }

    b.hp = Math.max(0, b.hp - damage);
    b.inv = b.isStaggered ? 12 : 32;
    b.flash = 16;
    this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 14, '#ef4444');
    sound.playSfx('crit');
    this.addFloatingText(b.x + b.w / 2, b.y - 15, `💥 -${damage} HP [${b.hp}/${b.maxHp}]`, '#f43f5e');

    if (b.hp <= 0) {
      b.alive = false;
      this.bossDefeated = true;
      this.screenShake = 12;
      this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 50, '#ffd700');
      sound.playSfx('win');
      this.addXp(600);
      this.addFloatingText(b.x + b.w / 2, b.y - 25, '🏆 ¡JEFE DERROTADO! +600 XP', '#facc15');
    }
  }

  private updateDaggers(inputs: GameInputState) {
    if (inputs.dagger && !this.daggerInputHeld && (this.daggers > 0 || this.settings.infiniteDaggers)) {
      if (!this.settings.infiniteDaggers) {
        this.daggers--;
      }
      this.projectiles.push({
        x: this.player.x + (this.player.facing > 0 ? this.player.w + 2 : -10),
        y: this.player.y + 6,
        w: 9,
        h: 4,
        vx: this.player.facing * DAGGER_SPEED,
        vy: 0,
        life: DAGGER_LIFETIME,
        isHero: true,
        damage: DAGGER_BASE_DAMAGE + Math.floor(this.player.attackPower / 2),
      });
      sound.playSfx('dagger');
      this.daggerInputHeld = true;
    }
    if (!inputs.dagger) {
      this.daggerInputHeld = false;
    }

    // Dagger Recharge
    if (this.daggers < DAGGER_MAX_AMMO) {
      this.daggerRechargeTimer++;
      if (this.daggerRechargeTimer >= DAGGER_RECHARGE_TIME) {
        this.daggers++;
        this.daggerRechargeTimer = 0;
        this.addFloatingText(this.player.x, this.player.y - 12, '🗡 +1 Daga', '#a855f7');
      }
    }
  }

  private updateHazards() {
    const p = this.player;

    for (const h of this.hazards) {
      if (h.type === 'laserGate') {
        h.cycleTimer = ((h.cycleTimer || 0) + 1) % 90;
        h.active = h.cycleTimer < 60; // Active for 60 frames, inactive for 30
        if (h.active && Math.random() < 0.25) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: h.y + Math.random() * h.h,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 10,
            maxLife: 10,
            color: '#06b6d4',
            size: 1.5,
          });
        }
      } else if (h.type === 'geyser') {
        // Volcanic Flame Geyser cycle
        h.cycleTimer = ((h.cycleTimer || 0) + 1) % 150;
        h.warnTimer = h.cycleTimer >= 60 && h.cycleTimer < 80 ? 80 - h.cycleTimer : 0;
        h.erupting = h.cycleTimer >= 80 && h.cycleTimer < 125;

        if (h.warnTimer === 15) {
          sound.playSfx('bossWarning');
        }
        if (h.cycleTimer === 80) {
          sound.playSfx('lava');
          this.createBurst(h.x + h.w / 2, 140, 12, '#f97316');
        }
        if (h.erupting && Math.random() < 0.4) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: 140 - Math.random() * 55,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -Math.random() * 2.5,
            life: 14,
            maxLife: 14,
            color: '#fbbf24',
            size: 2,
          });
        }
      } else if (h.type === 'stalactite') {
        // Fall when player walks underneath
        if (!h.falling && Math.abs(p.x - (h.x + h.w / 2)) < 38 && p.y > h.y) {
          h.falling = true;
          h.vy = 0;
          this.createBurst(h.x + h.w / 2, h.y, 4, '#ea580c');
        }
        if (h.falling) {
          h.vy = Math.min((h.vy || 0) + 0.4, 7);
          h.y += h.vy;
          if (h.y >= 142) {
            h.falling = false;
            h.y = 142;
            sound.playSfx('hit');
            this.createBurst(h.x + h.w / 2, 145, 10, '#ea580c');
          }
        }
      } else if (h.type === 'swingingBlade') {
        // Desert temple swinging pendulum blade
        const speed = h.bladeSpeed || 0.04;
        h.bladeAngle = Math.sin(this.time * speed) * 1.25;
        if (Math.abs(Math.sin(this.time * speed)) > 0.96 && this.time % 10 === 0) {
          sound.playSfx('slash');
        }
      } else if (h.type === 'fallingBlock') {
        // Sandstone falling block
        if (!h.isFalling && Math.abs(p.x - (h.x + h.w / 2)) < 36 && p.y > h.y) {
          h.isFalling = true;
          h.fallVy = 0;
          this.createBurst(h.x + h.w / 2, h.y + h.h, 6, '#d97706');
          sound.playSfx('bossWarning');
        }
        if (h.isFalling) {
          h.fallVy = Math.min((h.fallVy || 0) + 0.45, 7.5);
          h.y += h.fallVy;
          if (h.y >= 144) {
            h.y = 144;
            h.isFalling = false;
            sound.playSfx('bossSlam');
            this.createBurst(h.x + h.w / 2, 146, 12, '#d97706');
          }
        }
      } else if (h.type === 'quicksand') {
        if (Math.random() < 0.2) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: h.y + Math.random() * h.h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.8,
            life: 12,
            maxLife: 12,
            color: '#f59e0b',
            size: 1.5,
          });
        }
      } else if (h.type === 'curseRune') {
        if (Math.random() < 0.25) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: h.y,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -Math.random() * 1.2,
            life: 14,
            maxLife: 14,
            color: '#c084fc',
            size: 1.8,
          });
        }
      } else if (h.type === 'crusher') {
        // Heavy Hydraulic / Stone Crusher Piston
        h.ceilingY = h.ceilingY ?? h.y;
        h.floorY = h.floorY ?? (148 - h.h);
        h.crushState = h.crushState || 'idle';
        h.crushTimer = (h.crushTimer || 0) + 1;

        if (h.crushState === 'idle') {
          h.y = h.ceilingY;
          if (h.crushTimer > 80) {
            h.crushState = 'warning';
            h.crushTimer = 0;
            sound.playSfx('bossWarning');
          }
        } else if (h.crushState === 'warning') {
          // Warning vibration / spark discharge
          h.y = h.ceilingY + ((h.crushTimer % 4 < 2) ? 1 : -1);
          if (Math.random() < 0.3) {
            this.particles.push({
              x: h.x + Math.random() * h.w,
              y: h.y + h.h,
              vx: (Math.random() - 0.5) * 1.5,
              vy: Math.random() * 1.5,
              life: 8,
              maxLife: 8,
              color: '#ef4444',
              size: 1.5,
            });
          }
          if (h.crushTimer >= 22) {
            h.crushState = 'slamming';
            h.crushTimer = 0;
          }
        } else if (h.crushState === 'slamming') {
          // Rapid downward slam
          h.y += 8.5;
          if (h.y >= h.floorY) {
            h.y = h.floorY;
            h.crushState = 'rising';
            h.crushTimer = 0;
            this.screenShake = 5;
            sound.playSfx('crushSlam');
            this.createBurst(h.x + h.w / 2, h.floorY + h.h, 10, '#71717a');
          }
        } else if (h.crushState === 'rising') {
          // Slow retraction back to ceiling
          if (h.crushTimer > 18) {
            h.y -= 1.25;
            if (h.y <= h.ceilingY) {
              h.y = h.ceilingY;
              h.crushState = 'idle';
              h.crushTimer = 0;
            }
          }
        }
      } else if (h.type === 'sawBlade') {
        // High-speed spinning buzzsaw traversing along a rail track
        const spd = h.moveSpeed || 1.6;
        const dir = h.dir || 1;
        h.x += spd * dir;
        const minX = h.railMin ?? (h.x - 70);
        const maxX = h.railMax ?? (h.x + 70);

        if (h.x >= maxX) {
          h.x = maxX;
          h.dir = -1;
        } else if (h.x <= minX) {
          h.x = minX;
          h.dir = 1;
        }
        h.bladeAngle = ((h.bladeAngle || 0) + 0.32 * (h.dir || 1)) % (Math.PI * 2);

        // Friction sparks on track
        if (Math.random() < 0.28) {
          this.particles.push({
            x: h.x + h.w / 2,
            y: h.y + h.h,
            vx: (Math.random() - 0.5) * 1.8 - (h.dir || 1) * 1.2,
            vy: -Math.random() * 2,
            life: 8,
            maxLife: 8,
            color: '#f59e0b',
            size: 1.4,
          });
        }
      } else if (h.type === 'flameJet') {
        // Industrial / Volcanic Flame Jet Nozzle
        h.cycleTimer = ((h.cycleTimer || 0) + 1) % 130;
        h.warnTimer = (h.cycleTimer >= 55 && h.cycleTimer < 75) ? 75 - h.cycleTimer : 0;
        h.erupting = (h.cycleTimer >= 75 && h.cycleTimer < 115);

        if (h.cycleTimer === 75) {
          sound.playSfx('flameWhoosh');
        }
        if (h.erupting && Math.random() < 0.45) {
          this.particles.push({
            x: h.x + (h.flameAngle === 1 ? h.w + Math.random() * 30 : Math.random() * h.w),
            y: h.y + (h.flameAngle === 0 ? -Math.random() * 30 : Math.random() * h.h),
            vx: h.flameAngle === 1 ? 2.5 + Math.random() * 2 : (Math.random() - 0.5) * 1.4,
            vy: h.flameAngle === 0 ? -2.5 - Math.random() * 2 : (Math.random() - 0.5) * 1.4,
            life: 12,
            maxLife: 12,
            color: Math.random() < 0.5 ? '#f97316' : '#facc15',
            size: 2,
          });
        }
      } else if (h.type === 'teslaPillar') {
        // Pulsing High-Voltage Tesla Lightning Coil
        h.cycleTimer = ((h.cycleTimer || 0) + 1) % 110;
        h.active = (h.cycleTimer >= 45 && h.cycleTimer < 90);

        if (h.cycleTimer === 45) {
          sound.playSfx('teslaShock');
        }
        if (h.active && Math.random() < 0.35) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: h.y + Math.random() * h.h,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 8,
            maxLife: 8,
            color: '#38bdf8',
            size: 1.5,
          });
        }
      } else if (h.type === 'acidPool') {
        // Corrosive toxic acid pool with rising vapors
        if (Math.random() < 0.22) {
          this.particles.push({
            x: h.x + Math.random() * h.w,
            y: h.y + 2,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.9 - 0.3,
            life: 16,
            maxLife: 16,
            color: '#22c55e',
            size: 1.8,
          });
        }
      } else if (h.type === 'dartTrap') {
        // Sentry dart trap that fires when player approaches
        h.shootCooldown = (h.shootCooldown || 0) + 1;
        const dist = Math.abs(p.x - h.x);
        if (h.shootCooldown >= 85 && dist < 240 && Math.abs(p.y - h.y) < 45) {
          h.shootCooldown = 0;
          sound.playSfx('dartFire');
          const isFacingRight = h.shootDir === 1 || h.dir === 1;
          this.projectiles.push({
            x: isFacingRight ? h.x + h.w + 2 : h.x - 6,
            y: h.y + h.h / 2 - 2,
            w: 6,
            h: 4,
            vx: isFacingRight ? 4.2 : -4.2,
            vy: 0,
            life: 65,
            isHero: false,
            damage: 1,
            kind: 'sakuraShuriken',
          });
        }
      }
    }
  }

  private updateEnemies() {
    const p = this.player;

    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.hitFlash && e.hitFlash > 0) e.hitFlash--;
      if (e.alertTimer && e.alertTimer > 0) e.alertTimer--;

      const dist = p.x - e.x;
      const absDist = Math.abs(dist);
      e.facing = dist >= 0 ? 1 : -1;

      if (e.type === 'patrol') {
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) {
          e.vx *= -1;
        }
      } else if (e.type === 'sentinel') {
        if (absDist < 140) {
          e.vx += Math.sign(dist) * 0.03;
          e.cool = (e.cool || 80) - 1;
          if (e.cool === 25) {
            e.alertTimer = 25;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w + 2 : -6),
              y: e.y + 4,
              w: 6,
              h: 4,
              vx: Math.sign(dist) * 2.2,
              vy: 0,
              life: 110,
              isHero: false,
              kind: 'laserBolt',
            });
            sound.playSfx('bossShot');
            e.cool = 90;
          }
        } else {
          e.vx += Math.sign(e.home - e.x) * 0.03;
        }
        e.vx = Math.max(-0.9, Math.min(0.9, e.vx));
        e.x += e.vx;
      } else if (e.type === 'hopper') {
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) e.vx *= -1;
        if (e.vy === 0 && Math.random() < 0.03) {
          e.vy = -4.5;
          e.alertTimer = 18;
          this.createBurst(e.x + e.w / 2, e.y + e.h, 4, '#94a3b8');
        }
      } else if (e.type === 'charger') {
        if (e.charge && e.charge > 0) {
          e.charge--;
          e.x += Math.sign(dist) * 2.2;
          if (Math.random() < 0.4) {
            this.particles.push({
              x: e.x + e.w / 2,
              y: e.y + e.h / 2,
              vx: -Math.sign(dist) * 1.5,
              vy: -0.5,
              life: 12,
              maxLife: 12,
              color: '#ef4444',
              size: 2,
            });
          }
        } else if (absDist < 150) {
          e.wait = (e.wait || 0) + 1;
          if (e.wait === 10) {
            e.alertTimer = 25;
            sound.playSfx('bossWarning');
          }
          if (e.wait > 30) {
            e.charge = 40;
            e.wait = 0;
          }
        } else {
          e.x += Math.sign(e.home - e.x) * 0.3;
        }
      } else if (e.type === 'sphere') {
        e.angle = (e.angle || 0) + 0.1;
        e.x += Math.sign(dist) * 0.55;
        e.x = Math.max(e.min, Math.min(e.max, e.x));
        e.y = 134 + Math.sin(e.angle) * 9;
      } else if (e.type === 'kitsune') {
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) e.vx *= -1;
        if (absDist < 90 && Math.random() < 0.03) {
          e.vy = -4.4;
          e.vx = -Math.sign(dist) * 1.4;
          e.alertTimer = 20;
        }
      } else if (e.type === 'kage' || e.type === 'kagered') {
        const range = e.type === 'kagered' ? 160 : 120;
        const sp = e.type === 'kagered' ? 1.6 : 1.1;
        if (absDist < range) {
          e.cool = (e.cool || 60) - 1;
          if (e.cool === 20) {
            e.alertTimer = 20;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            e.vx = Math.sign(dist) * sp * 2.6;
            e.cool = e.type === 'kagered' ? 45 : 70;
          }
        } else {
          e.vx *= 0.85;
        }
        e.x += e.vx;
        e.vx *= 0.9;
      } else if (e.type === 'kodama') {
        if (absDist < 65 && (e.cool || 0) > 0) {
          e.cool = 0;
          this.hazards.push({
            x: e.x + (dist > 0 ? 18 : -20),
            y: 141,
            w: 18,
            h: 7,
            type: 'branch',
            life: 180,
          });
          e.alertTimer = 20;
          this.addFloatingText(e.x, e.y - 10, '🌱 ¡Barrera Espiritual!', '#4ade80');
        }
        e.cool = (e.cool || 0) + 1;
      } else if (e.type === 'yurei') {
        e.t = (e.t || 0) + 0.06;
        e.x += Math.sign(dist) * 0.45;
        e.y = 112 + Math.sin(e.t) * 12;
      } else if (e.type === 'butterfly') {
        e.t = (e.t || 0) + 0.08;
        e.x += Math.sin(e.t) * 0.9;
        if (absDist < 80) e.x += Math.sign(dist) * 0.75;
        e.y = 92 + Math.sin(e.t * 1.6) * 15;
      } else if (e.type === 'salamander') {
        // Magma Salamander: Patrols and shoots fireballs
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) e.vx *= -1;
        if (absDist < 130) {
          e.cool = (e.cool || 75) - 1;
          if (e.cool === 20) {
            e.alertTimer = 20;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w + 2 : -6),
              y: e.y + 4,
              w: 7,
              h: 7,
              vx: Math.sign(dist) * 2.4,
              vy: -0.4,
              life: 120,
              isHero: false,
              kind: 'fireball',
            });
            sound.playSfx('bossShot');
            e.cool = 85;
          }
        }
      } else if (e.type === 'magma_golem') {
        // Heavy Magma Golem: Armor and ground shock
        if (absDist < 110) {
          e.vx += Math.sign(dist) * 0.04;
          e.cool = (e.cool || 90) - 1;
          if (e.cool === 25) {
            e.alertTimer = 25;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            e.vy = -3.8;
            sound.playSfx('bossSlam');
            this.createBurst(e.x + e.w / 2, e.y + e.h, 12, '#ea580c');
            e.cool = 110;
          }
        } else {
          e.vx += Math.sign(e.home - e.x) * 0.02;
        }
        e.vx = Math.max(-0.8, Math.min(0.8, e.vx));
        e.x += e.vx;
      } else if (e.type === 'flame_wisp') {
        // Floating incandescent flame wisp
        e.angle = (e.angle || 0) + 0.07;
        e.x += Math.sign(dist) * 0.6;
        e.y = 108 + Math.sin(e.angle) * 14;
      } else if (e.type === 'fire_hopper') {
        // Agile volcanic hopper
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) e.vx *= -1;
        if (e.vy === 0 && Math.random() < 0.04) {
          e.vy = -5.0;
          e.alertTimer = 16;
          this.createBurst(e.x + e.w / 2, e.y + e.h, 6, '#ea580c');
        }
      } else if (e.type === 'scarab') {
        // Armored Rolling Scarab
        e.x += e.vx;
        if (e.x < e.min || e.x > e.max) e.vx *= -1;
        if (absDist < 120) {
          e.vx = Math.sign(dist) * 1.8;
          if (this.time % 4 === 0) {
            this.particles.push({
              x: e.x + e.w / 2,
              y: e.y + e.h,
              vx: -Math.sign(dist) * 0.8,
              vy: -0.4,
              life: 8,
              maxLife: 8,
              color: '#fbbf24',
              size: 1.5,
            });
          }
        }
      } else if (e.type === 'mummy_warrior') {
        // Ancient Mummy Warrior: Lunges with bandage wrap
        if (absDist < 110) {
          e.cool = (e.cool || 60) - 1;
          if (e.cool === 20) {
            e.alertTimer = 20;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            e.vx = Math.sign(dist) * 2.8;
            e.vy = -3.2;
            sound.playSfx('slash');
            this.addFloatingText(e.x, e.y - 12, '🗡️ ¡Estocada Sagrada!', '#d97706');
            e.cool = 75;
          }
        } else {
          e.x += Math.sign(e.home - e.x) * 0.35;
        }
        e.x += e.vx;
        e.vx *= 0.88;
      } else if (e.type === 'sand_serpent') {
        // Sand Serpent: Burrows and shoots venom sand
        if (absDist < 140) {
          e.cool = (e.cool || 70) - 1;
          if (e.cool === 20) {
            e.alertTimer = 20;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w + 2 : -6),
              y: e.y + 4,
              w: 7,
              h: 7,
              vx: Math.sign(dist) * 2.6,
              vy: -0.6,
              life: 110,
              isHero: false,
              kind: 'sandSpit',
            });
            sound.playSfx('bossShot');
            e.cool = 80;
          }
        }
      } else if (e.type === 'anubis_statue') {
        // Anubis Statue: Heavy guardian with curse lasers
        if (absDist < 160) {
          e.cool = (e.cool || 90) - 1;
          if (e.cool === 25) {
            e.alertTimer = 25;
            sound.playSfx('laserCharge');
          }
          if (e.cool <= 0) {
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w + 2 : -6),
              y: e.y + 6,
              w: 8,
              h: 6,
              vx: Math.sign(dist) * 3.0,
              vy: 0,
              life: 120,
              isHero: false,
              kind: 'curseOrb',
            });
            sound.playSfx('laserFire');
            e.cool = 100;
          }
        }
      } else if (e.type === 'desert_vulture') {
        // Desert Vulture: Arc swoop attack
        e.angle = (e.angle || 0) + 0.05;
        if (absDist < 110 && e.y < 95) {
          e.vy = 2.4;
          e.vx = Math.sign(dist) * 1.6;
        } else if (e.y >= 95) {
          e.vy = -1.8;
        }
        e.y += e.vy || Math.sin(e.angle) * 0.8;
        e.x += e.vx || 0.4;
        e.x = Math.max(e.min, Math.min(e.max, e.x));
      } else if (e.type === 'cyber_drone') {
        // Patrol Cyber Drone: Floats and fires downward twin plasma pulses
        e.angle = (e.angle || 0) + 0.06;
        e.y = 80 + Math.sin(e.angle) * 12;
        e.x += Math.sign(dist) * 0.75;
        e.x = Math.max(e.min, Math.min(e.max, e.x));

        if (absDist < 140) {
          e.cool = (e.cool || 70) - 1;
          if (e.cool === 18) {
            e.alertTimer = 18;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w : -4),
              y: e.y + e.h,
              w: 7,
              h: 7,
              vx: Math.sign(dist) * 2.2,
              vy: 1.6,
              life: 90,
              isHero: false,
              kind: 'plasma',
            });
            sound.playSfx('bossShot');
            e.cool = 75;
          }
        }
      } else if (e.type === 'cyberturret') {
        // Automated Cyber Turret: High velocity laser tracking
        if (absDist < 180) {
          e.cool = (e.cool || 80) - 1;
          if (e.cool === 22) {
            e.alertTimer = 22;
            sound.playSfx('laserCharge');
          }
          if (e.cool <= 0) {
            const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
            this.projectiles.push({
              x: e.x + (dist > 0 ? e.w : -4),
              y: e.y + 4,
              w: 9,
              h: 4,
              vx: Math.cos(angle) * 3.6,
              vy: Math.sin(angle) * 3.6,
              life: 110,
              isHero: false,
              kind: 'laserBolt',
            });
            sound.playSfx('laserFire');
            e.cool = 85;
          }
        }
      } else if (e.type === 'cyber_hound') {
        // Fast Cybernetic Hound: Lunges with turbo boost
        if (absDist < 130) {
          e.cool = (e.cool || 50) - 1;
          if (e.cool === 16) {
            e.alertTimer = 16;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            e.vx = Math.sign(dist) * 3.6;
            e.vy = -3.0;
            sound.playSfx('dash');
            this.createBurst(e.x + e.w / 2, e.y + e.h, 8, '#06b6d4');
            e.cool = 65;
          }
        } else {
          e.vx = Math.sign(e.home - e.x) * 0.45;
        }
        e.x += e.vx;
        e.vx *= 0.9;
      } else if (e.type === 'plasma_trooper') {
        // Heavy Plasma Trooper: Frontal shielding & rapid burst
        if (absDist < 150) {
          e.cool = (e.cool || 85) - 1;
          if (e.cool === 24) {
            e.alertTimer = 24;
            sound.playSfx('bossWarning');
          }
          if (e.cool <= 0) {
            for (let i = 0; i < 2; i++) {
              this.projectiles.push({
                x: e.x + (dist > 0 ? e.w + 2 : -6),
                y: e.y + 6 + i * 4,
                w: 8,
                h: 6,
                vx: Math.sign(dist) * (2.8 + i * 0.4),
                vy: (i - 0.5) * 0.4,
                life: 120,
                isHero: false,
                kind: 'plasma',
              });
            }
            sound.playSfx('bossShot');
            e.cool = 90;
          }
        } else {
          e.vx += Math.sign(e.home - e.x) * 0.03;
        }
        e.vx = Math.max(-0.7, Math.min(0.7, e.vx));
        e.x += e.vx;
      } else if (e.type === 'gravity_orb') {
        // Gravity Anomaly Orb: Distorts gravity field & releases sparks
        e.angle = (e.angle || 0) + 0.08;
        e.y = 100 + Math.sin(e.angle) * 16;
        e.x += Math.sign(dist) * 0.4;
        e.x = Math.max(e.min, Math.min(e.max, e.x));

        if (absDist < 90) {
          // Gravitational pull towards anomaly
          this.player.vx += -Math.sign(dist) * 0.08;
          if (this.time % 20 === 0) {
            this.particles.push({
              x: e.x + e.w / 2,
              y: e.y + e.h / 2,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              life: 12,
              maxLife: 12,
              color: '#c084fc',
              size: 2,
            });
          }
        }
      }

      // Gravity for ground enemies
      if (
        e.type !== 'sphere' &&
        e.type !== 'yurei' &&
        e.type !== 'butterfly' &&
        e.type !== 'flame_wisp' &&
        e.type !== 'desert_vulture' &&
        e.type !== 'cyber_drone' &&
        e.type !== 'gravity_orb' &&
        e.type !== 'cyberturret'
      ) {
        e.vy = Math.min(e.vy + GRAVITY, 6);
        e.y += e.vy;
        for (const p of this.platforms) {
          if (p.hidden) continue;
          if (this.checkAABB(e, p) && e.vy >= 0) {
            e.y = p.y - e.h;
            e.vy = 0;
          }
        }
      }
    }
  }

  private updateBoss() {
    const b = this.boss;
    if (!b || !b.alive) return;

    // Trigger Arena lock & Cinematic Intro
    if (this.player.x > b.x - 330 && !this.arenaActive) {
      this.arenaActive = true;
      const cp = this.checkpoints.find((c) => c.arena) || this.checkpoints[this.checkpoints.length - 1];
      if (cp) {
        cp.active = true;
        this.spawnPoint = { ...cp.spawn };
        this.cpSavedCrystals = new Set(this.collectedCrystalIndices);
        this.cpSavedHeals = new Set(this.collectedHealIndices);
        this.cpSavedSecrets = new Set(this.collectedSecretIndices);
        this.cpSavedNodes = new Set(this.collectedNodeIndices);
        this.cpSavedEnemies = new Set(this.defeatedEnemyIndices);
        if (this.onCheckpoint) {
          this.onCheckpoint(cp);
        }
      }
      this.lives = this.maxLives;
      this.player.shieldEnergy = this.player.maxShieldEnergy;
      this.player.isShieldBroken = false;
      this.daggers = DAGGER_MAX_AMMO;
      sound.playSfx('shieldBreak');
      sound.playSfx('bossWarning');
      this.syncMusic();
      this.screenShake = 9;
      this.bossIntroBanner = {
        active: true,
        timer: 150,
        title: b.title || b.name,
        subtitle: b.subtitle || 'Duelo Decisivo',
      };
      this.addFloatingText(this.player.x, this.player.y - 20, '⚔️ ¡ARENA SELLADA! CHECKPOINT ACTIVO', '#ef4444');
    }

    if (!this.arenaActive || this.bossDefeated) return;

    if (b.inv > 0) b.inv--;
    if (b.flash > 0) b.flash--;
    if (b.telegraphTimer > 0) b.telegraphTimer--;
    if (b.thrusterFlame && b.thrusterFlame > 0) b.thrusterFlame--;

    // Determine Phase based on HP ratio
    const hpRatio = b.hp / b.maxHp;
    b.phase = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
    b.facing = this.player.x >= b.x ? 1 : -1;

    // Process Stagger Recovery
    if (b.isStaggered) {
      b.stateTimer--;
      b.vx *= 0.8;
      if (b.stateTimer <= 0) {
        b.isStaggered = false;
        b.stagger = 0;
        b.state = 'idle';
        b.inv = 25;
        this.addFloatingText(b.x + b.w / 2, b.y - 20, '⚡ ¡JEFE RECUPERADO!', '#38bdf8');
      }
      // Process gravity while staggered
      b.vy = Math.min(b.vy + GRAVITY, 7);
      b.y += b.vy;
      if (b.y + b.h >= 148) {
        b.y = 148 - b.h;
        b.vy = 0;
      }
      this.updateShockwaves();
      return;
    } else {
      // Natural stagger decay when not being hit
      if (b.stagger > 0 && this.time % 15 === 0) {
        b.stagger = Math.max(0, b.stagger - 1);
      }
    }

    // --- BOSS 1: GUARDIÁN NEÓN MK-IV ---
    if (this.levelIndex <= 1) {
      const speed = b.shield ? 0.7 : b.phase === 1 ? 1.0 : b.phase === 2 ? 1.35 : 1.7;
      
      if (b.state === 'idle') {
        b.vx += Math.sign(this.player.x - b.x) * 0.04;
        b.vx = Math.max(-speed, Math.min(speed, b.vx));
        b.x += b.vx;

        // Boss 1 Continuous Rapid Harassment in Idle (Relentless Attacks)
        b.shotTimer--;
        if (b.shotTimer <= 0) {
          const count = b.shield ? 1 : b.phase === 3 ? 3 : 2;
          for (let k = 0; k < count; k++) {
            this.projectiles.push({
              x: b.x + (b.facing > 0 ? b.w : -8),
              y: b.y + 6,
              w: 7,
              h: 7,
              vx: b.facing * (2.2 + k * 0.35),
              vy: (k - (count - 1) / 2) * 0.5,
              life: 140,
              isHero: false,
              kind: b.phase === 3 ? 'homing' : 'plasma',
              homingTimer: b.phase === 3 ? 35 : 0,
            });
          }
          sound.playSfx('bossShot');
          b.shotTimer = b.phase === 3 ? 35 : 55;
        }

        b.stateTimer--;
        if (b.stateTimer <= 0) {
          // Rapidly choose next special move: Cyber Laser, Ground Slam, or Plasma Barrage
          const roll = Math.random();
          if (roll < 0.35) {
            b.state = 'charging';
            b.stateTimer = 35;
            b.telegraphTimer = 35;
            sound.playSfx('laserCharge');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '⚠️ ¡CARGANDO RAYO!', '#f43f5e');
          } else if (roll < 0.70) {
            b.state = 'slamming';
            b.vy = -6.8;
            b.thrusterFlame = 35;
            sound.playSfx('jump');
            this.createBurst(b.x + b.w / 2, b.y + b.h, 12, '#06b6d4');
          } else {
            b.state = 'barrage' as unknown as typeof b.state;
            b.stateTimer = 45;
            sound.playSfx('bossWarning');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '⚠️ ¡RÁFAGA DE PLASMA!', '#06b6d4');
          }
        }
      } else if (b.state === 'charging') {
        // Charging cyber laser
        b.vx *= 0.8;
        if (b.stateTimer <= 0) {
          b.state = 'laser';
          b.stateTimer = 35;
          sound.playSfx('laserFire');
          this.screenShake = 6;
          b.laser = {
            active: true,
            charging: false,
            chargeTimer: 0,
            maxCharge: 35,
            dir: b.facing,
            x: b.facing > 0 ? b.x + b.w : b.x - 280,
            y: b.y + 6,
            length: 280,
            thickness: 14,
            duration: 35,
          };
        }
        b.stateTimer--;
      } else if (b.state === 'laser') {
        b.vx *= 0.5;
        b.stateTimer--;
        if (b.laser) {
          b.laser.duration--;
          b.laser.x = b.facing > 0 ? b.x + b.w : b.x - 280;
          b.laser.y = b.y + 6;

          // Laser Hitbox collision check with Player
          const laserBox = {
            x: b.laser.x,
            y: b.laser.y,
            w: b.laser.length,
            h: b.laser.thickness,
          };

          if (this.checkAABB(this.player, laserBox) && this.player.inv <= 0 && !this.settings.godMode) {
            if (this.player.isBlocking) {
              if (this.player.perfectParryTimer > 0) {
                sound.playSfx('parry');
                this.addEnergy(30);
                this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 20, '#facc15');
                this.addFloatingText(this.player.x, this.player.y - 18, '✦ PARRY LÁSER!', '#facc15');
              } else {
                sound.playSfx('block');
                this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 8, '#38bdf8');
              }
            } else {
              this.handlePlayerDamage('¡Impacto del Rayo Cibernético!');
            }
          }
        }
        if (b.stateTimer <= 0) {
          b.laser = undefined;
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      } else if (b.state === 'slamming') {
        // Rising and falling slam
        if (b.vy > 0) {
          b.vy += 0.45; // Fast descent
        }
      } else if ((b.state as string) === 'barrage') {
        b.stateTimer--;
        b.vx *= 0.6;
        if (b.stateTimer % 9 === 0 && b.stateTimer > 8) {
          sound.playSfx('bossShot');
          this.screenShake = 3;
          const count = b.phase === 3 ? 3 : 2;
          for (let k = 0; k < count; k++) {
            this.projectiles.push({
              x: b.x + (b.facing > 0 ? b.w : -8),
              y: b.y + 4 + k * 8,
              w: 8,
              h: 7,
              vx: b.facing * (2.9 + k * 0.35),
              vy: (k - (count - 1) / 2) * 0.6,
              life: 140,
              isHero: false,
              kind: b.phase === 3 ? 'homing' : 'plasma',
              homingTimer: b.phase === 3 ? 35 : 0,
            });
          }
        }
        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      }

      // Arena boundary limits
      b.x = Math.max(this.spawnPoint.x - 50, Math.min(this.spawnPoint.x + 600, b.x));

      // Gravity & Ground Slam Collision
      b.vy = Math.min(b.vy + GRAVITY, 8);
      b.y += b.vy;
      if (b.y + b.h >= 148) {
        if (b.state === 'slamming' && b.vy > 3) {
          // Trigger Ground Slam Seismic Shockwaves!
          sound.playSfx('bossSlam');
          this.screenShake = 8;
          this.createBurst(b.x + b.w / 2, 148, 20, '#06b6d4');
          
          b.shockwaves.push(
            { x: b.x - 10, y: 138, vx: -3.2, w: 14, h: 10, life: 75, maxLife: 75, color: '#06b6d4' },
            { x: b.x + b.w, y: 138, vx: 3.2, w: 14, h: 10, life: 75, maxLife: 75, color: '#06b6d4' }
          );

          if (b.phase === 3) {
            // Triple shockwaves in phase 3
            b.shockwaves.push(
              { x: b.x - 10, y: 138, vx: -4.5, w: 16, h: 12, life: 90, maxLife: 90, color: '#ef4444' },
              { x: b.x + b.w, y: 138, vx: 4.5, w: 16, h: 12, life: 90, maxLife: 90, color: '#ef4444' }
            );
          }
          this.addFloatingText(b.x + b.w / 2, b.y - 12, '💥 ¡IMPACTO SÍSMICO!', '#06b6d4');
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 26;
        }
        b.y = 148 - b.h;
        b.vy = 0;
      }

      // Boss 1 relentless ground slam finish
      // (continuous projectiles handled above in idle)
    } else if (b.name.includes('Kunoichi')) {
      // --- BOSS 2: MAESTRA KUNOICHI ROSA ---
      const speed = b.phase === 1 ? 1.4 : b.phase === 2 ? 1.9 : 2.4;

      if (b.state === 'idle') {
        b.vx += Math.sign(this.player.x - b.x) * 0.04;
        b.vx = Math.max(-speed, Math.min(speed, b.vx));
        b.x += b.vx;

        // Continuous Sakura Shuriken Harassment in Idle (Relentless Attacks)
        b.shotTimer--;
        if (b.shotTimer <= 0) {
          sound.playSfx('bossShot');
          const angle = Math.atan2(this.player.y - b.y, this.player.x - b.x);
          this.projectiles.push({
            x: b.x + (b.facing > 0 ? b.w : -6),
            y: b.y + 8,
            w: 8,
            h: 8,
            vx: Math.cos(angle) * 3.4,
            vy: Math.sin(angle) * 3.4,
            life: 120,
            isHero: false,
            kind: 'sakuraShuriken',
            angle: 0,
          });
          b.shotTimer = b.phase === 3 ? 28 : 42;
        }

        b.stateTimer--;
        if (b.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.4) {
            // Katana Shadow Dash
            b.state = 'dash';
            b.stateTimer = 22;
            b.telegraphTimer = 22;
            sound.playSfx('bossWarning');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '⚠️ ¡ESTOCADA LUNAR!', '#f43f5e');
          } else if (roll < 0.72) {
            // Sakura Teleport
            b.state = 'teleport';
            b.stateTimer = 18;
            this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 22, '#f472b6');
            sound.playSfx('teleport');
          } else {
            // Sakura Fan Shurikens
            b.state = 'charging';
            b.stateTimer = 22;
            b.telegraphTimer = 22;
          }
        }
      } else if (b.state === 'dash') {
        b.stateTimer--;
        b.vx = b.facing * (b.phase === 3 ? 6.5 : 5.2);
        b.x += b.vx;

        // Katana trail particles
        if (this.time % 2 === 0) {
          this.particles.push({
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            vx: -b.facing * 1.2,
            vy: (Math.random() - 0.5) * 1.0,
            life: 14,
            maxLife: 14,
            color: '#fb7185',
            size: 2.2,
          });
        }

        // Check if player parries her dash for INSTANT STAGGER!
        const dashHitbox = { x: b.x, y: b.y, w: b.w, h: b.h };
        if (this.checkAABB(this.player, dashHitbox)) {
          if (this.player.isBlocking && this.player.perfectParryTimer > 0) {
            sound.playSfx('parry');
            sound.playSfx('stagger');
            this.screenShake = 8;
            b.isStaggered = true;
            b.state = 'staggered';
            b.stateTimer = 180;
            b.stagger = b.maxStagger;
            this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 30, '#facc15');
            this.addFloatingText(b.x + b.w / 2, b.y - 30, '⚔️ ¡PARRY PERFECTO! ¡KUNOICHI ATURDIDA!', '#facc15');
            this.addEnergy(40);
            return;
          }
        }

        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      } else if (b.state === 'teleport') {
        b.stateTimer--;
        if (b.stateTimer === 10) {
          // Reappear on opposite side or above player
          const targetX = this.player.x + (Math.random() < 0.5 ? -90 : 90);
          b.x = Math.max(this.spawnPoint.x, Math.min(this.spawnPoint.x + 550, targetX));
          b.y = Math.random() < 0.5 ? 90 : 120;
          b.vy = 0;
          this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 22, '#f472b6');
          sound.playSfx('teleport');
        }
        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = 14;
        }
      } else if (b.state === 'charging') {
        b.stateTimer--;
        if (b.stateTimer <= 0) {
          // Fire Sakura Fan of Shurikens
          const count = b.phase === 3 ? 5 : 3;
          for (let i = 0; i < count; i++) {
            const angle = ((i - (count - 1) / 2) * 0.22) + (b.facing > 0 ? 0 : Math.PI);
            const speed = 3.2;
            this.projectiles.push({
              x: b.x + (b.facing > 0 ? b.w : -8),
              y: b.y + 8,
              w: 8,
              h: 8,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 140,
              isHero: false,
              kind: 'sakuraShuriken',
              angle: 0,
            });
          }
          sound.playSfx('bossShot');
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 30;
        }
      }

      // Gravity
      b.vy = Math.min(b.vy + GRAVITY, 7);
      b.y += b.vy;
      for (const p of this.platforms) {
        if (p.hidden) continue;
        if (this.checkAABB(b, p) && b.vy >= 0) {
          b.y = p.y - b.h;
          b.vy = 0;
        }
      }

      // Phase 3 Clones Illusion
      if (b.phase === 3 && (!b.clones || b.clones.length === 0)) {
        b.clones = [
          { x: b.x - 40, y: b.y, w: b.w, h: b.h, vx: 0, vy: 0, alpha: 0.65, attackTimer: 50, action: 'shuriken' },
          { x: b.x + 40, y: b.y, w: b.w, h: b.h, vx: 0, vy: 0, alpha: 0.65, attackTimer: 75, action: 'slash' },
        ];
        this.addFloatingText(b.x + b.w / 2, b.y - 25, '🌸 ¡ILUSIÓN DE SOMBRAS!', '#e879f9');
      }

      if (b.clones) {
        for (const clone of b.clones) {
          clone.attackTimer--;
          if (clone.attackTimer <= 0) {
            this.projectiles.push({
              x: clone.x + (b.facing > 0 ? clone.w : -6),
              y: clone.y + 6,
              w: 7,
              h: 7,
              vx: b.facing * 2.6,
              vy: (Math.random() - 0.5) * 0.8,
              life: 120,
              isHero: false,
              kind: 'sakuraShuriken',
              angle: 0,
            });
            clone.attackTimer = 65;
          }
        }
      }
    } else if (b.name.includes('Ignis')) {
      // --- BOSS 3: IGNIS, COLOSO DE MAGMA PRIMORDIAL ---
      const speed = b.phase === 1 ? 0.9 : b.phase === 2 ? 1.3 : 1.7;

      if (b.state === 'idle') {
        b.vx += Math.sign(this.player.x - b.x) * 0.035;
        b.vx = Math.max(-speed, Math.min(speed, b.vx));
        b.x += b.vx;

        // Continuous Magma Fireballs in Idle (Relentless Attacks)
        b.shotTimer--;
        if (b.shotTimer <= 0) {
          sound.playSfx('lava');
          this.projectiles.push({
            x: b.x + (b.facing > 0 ? b.w : -8),
            y: b.y + 12,
            w: 9,
            h: 9,
            vx: b.facing * 3.0,
            vy: -0.8 + (Math.random() - 0.5) * 0.8,
            life: 120,
            isHero: false,
            kind: 'magmaMeteor',
          });
          b.shotTimer = b.phase === 3 ? 26 : 42;
        }

        b.stateTimer--;
        if (b.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.4) {
            // Volcanic Jump Slam & Shockwave
            b.state = 'slamming';
            b.vy = -6.5;
            b.thrusterFlame = 40;
            sound.playSfx('jump');
            this.createBurst(b.x + b.w / 2, b.y + b.h, 15, '#ea580c');
          } else if (roll < 0.72) {
            // Magma Charge (Parriable for Stagger!)
            b.state = 'dash';
            b.stateTimer = 30;
            b.telegraphTimer = 25;
            sound.playSfx('bossWarning');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '⚠️ ¡EMBESTIDA DE MAGMA!', '#ea580c');
          } else {
            // Volcanic Meteor Shower & Fireballs
            b.state = 'charging';
            b.stateTimer = 38;
            b.telegraphTimer = 35;
            sound.playSfx('laserCharge');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '🌋 ¡LLUVIA DE METEOROS!', '#f97316');
          }
        }
      } else if (b.state === 'dash') {
        b.stateTimer--;
        b.vx = b.facing * (b.phase === 3 ? 4.8 : 3.8);
        b.x += b.vx;

        if (this.time % 2 === 0) {
          this.particles.push({
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            vx: -b.facing * 1.5,
            vy: (Math.random() - 0.5) * 1.2,
            life: 14,
            maxLife: 14,
            color: '#ea580c',
            size: 2.5,
          });
        }

        // Check if player parries Ignis charge for INSTANT STAGGER!
        const dashHitbox = { x: b.x, y: b.y, w: b.w, h: b.h };
        if (this.checkAABB(this.player, dashHitbox)) {
          if (this.player.isBlocking && this.player.perfectParryTimer > 0) {
            sound.playSfx('parry');
            sound.playSfx('stagger');
            this.screenShake = 10;
            b.isStaggered = true;
            b.state = 'staggered';
            b.stateTimer = 200;
            b.stagger = b.maxStagger;
            this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 35, '#facc15');
            this.addFloatingText(b.x + b.w / 2, b.y - 30, '⚔️ ¡PARRY TITÁNICO! ¡IGNIS ATURDIDO!', '#facc15');
            this.addEnergy(45);
            return;
          }
        }

        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      } else if (b.state === 'charging') {
        b.stateTimer--;
        if (b.stateTimer <= 0) {
          // Rain falling magma meteors
          sound.playSfx('lava');
          this.screenShake = 6;
          const count = b.phase === 3 ? 6 : 4;
          for (let m = 0; m < count; m++) {
            const rx = this.player.x - 120 + m * 55 + (Math.random() - 0.5) * 20;
            this.projectiles.push({
              x: rx,
              y: -20 - m * 15,
              w: 10,
              h: 10,
              vx: (Math.random() - 0.5) * 0.8,
              vy: 3.2 + Math.random() * 0.8,
              life: 90,
              isHero: false,
              kind: 'magmaMeteor',
            });
          }
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 20 : 32;
        }
      }

      // Gravity & Ground Slam Collision for Ignis
      b.vy = Math.min(b.vy + GRAVITY, 8);
      b.y += b.vy;
      if (b.y + b.h >= 148) {
        if (b.state === 'slamming' && b.vy > 3) {
          sound.playSfx('bossSlam');
          this.screenShake = 9;
          this.createBurst(b.x + b.w / 2, 148, 24, '#ea580c');

          b.shockwaves.push(
            { x: b.x - 12, y: 138, vx: -3.5, w: 16, h: 10, life: 80, maxLife: 80, color: '#ea580c' },
            { x: b.x + b.w, y: 138, vx: 3.5, w: 16, h: 10, life: 80, maxLife: 80, color: '#ea580c' }
          );

          if (b.phase === 3) {
            b.shockwaves.push(
              { x: b.x - 12, y: 138, vx: -4.8, w: 18, h: 12, life: 95, maxLife: 95, color: '#fbbf24' },
              { x: b.x + b.w, y: 138, vx: 4.8, w: 18, h: 12, life: 95, maxLife: 95, color: '#fbbf24' }
            );
          }
          this.addFloatingText(b.x + b.w / 2, b.y - 12, '💥 ¡TERREMOTO VOLCÁNICO!', '#ea580c');
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 16 : 26;
        }
        b.y = 148 - b.h;
        b.vy = 0;
      }
    } else if (b.name.includes('Akhen') || b.name.includes('Faraón') || b.name.includes('Momia')) {
      // --- BOSS 4: FARAÓN AKHEN'RA — LA MOMIA ETERNA ---
      const speed = b.phase === 1 ? 1.0 : b.phase === 2 ? 1.45 : 1.9;

      if (b.state === 'idle') {
        b.vx += Math.sign(this.player.x - b.x) * 0.035;
        b.vx = Math.max(-speed, Math.min(speed, b.vx));
        b.x += b.vx;

        // Continuous Cursed Orbs in Idle (Relentless Attacks)
        b.shotTimer--;
        if (b.shotTimer <= 0) {
          sound.playSfx('bossShot');
          this.projectiles.push({
            x: b.x + (b.facing > 0 ? b.w : -8),
            y: b.y + 8,
            w: 8,
            h: 8,
            vx: b.facing * 3.0,
            vy: (Math.random() - 0.5) * 0.8,
            life: 130,
            isHero: false,
            kind: 'curseOrb',
          });
          b.shotTimer = b.phase === 3 ? 26 : 40;
        }

        // Golden aura dust
        if (this.time % 3 === 0) {
          this.particles.push({
            x: b.x + Math.random() * b.w,
            y: b.y + Math.random() * b.h,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.6,
            life: 12,
            maxLife: 12,
            color: '#f59e0b',
            size: 1.6,
          });
        }

        b.stateTimer--;
        if (b.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.3) {
            // Mummy Rush Dash (Parriable!)
            b.state = 'dash';
            b.stateTimer = 25;
            b.telegraphTimer = 22;
            sound.playSfx('bossWarning');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '⚠️ ¡EMBESTIDA DEL FARAÓN!', '#f59e0b');
          } else if (roll < 0.58) {
            // Sand Vortex & Sandstorm
            b.state = 'charging';
            b.stateTimer = 35;
            b.telegraphTimer = 30;
            sound.playSfx('laserCharge');
            this.addFloatingText(b.x + b.w / 2, b.y - 14, '🌪️ ¡VÓRTICE DE ARENAS!', '#d97706');
          } else if (roll < 0.82) {
            // Sarcophagus Jump Slam & Curse Shockwave
            b.state = 'slamming';
            b.vy = -6.8;
            b.thrusterFlame = 40;
            sound.playSfx('jump');
            this.createBurst(b.x + b.w / 2, b.y + b.h, 16, '#f59e0b');
          } else {
            // Pharaonic Teleport
            b.state = 'teleport';
            b.stateTimer = 18;
            this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 25, '#d97706');
            sound.playSfx('teleport');
          }
        }
      } else if (b.state === 'dash') {
        b.stateTimer--;
        b.vx = b.facing * (b.phase === 3 ? 5.8 : 4.6);
        b.x += b.vx;

        // Bandage trail
        if (this.time % 2 === 0) {
          this.particles.push({
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            vx: -b.facing * 1.5,
            vy: (Math.random() - 0.5) * 1.0,
            life: 16,
            maxLife: 16,
            color: '#fef08a',
            size: 2.2,
          });
        }

        // Check if player parries Pharaoh Mummy Rush for INSTANT STAGGER!
        const dashHitbox = { x: b.x, y: b.y, w: b.w, h: b.h };
        if (this.checkAABB(this.player, dashHitbox)) {
          if (this.player.isBlocking && this.player.perfectParryTimer > 0) {
            sound.playSfx('parry');
            sound.playSfx('stagger');
            this.screenShake = 10;
            b.isStaggered = true;
            b.state = 'staggered';
            b.stateTimer = 210;
            b.stagger = b.maxStagger;
            this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 35, '#facc15');
            this.addFloatingText(b.x + b.w / 2, b.y - 30, '⚔️ ¡PARRY SAGRADO! ¡FARAÓN ATURDIDO!', '#facc15');
            this.addEnergy(50);
            return;
          }
        }

        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      } else if (b.state === 'charging') {
        b.stateTimer--;
        if (b.stateTimer <= 0) {
          // Unleash Cursed Sand Tornadoes & Orbs
          sound.playSfx('bossShot');
          this.screenShake = 6;
          const count = b.phase === 3 ? 5 : 3;
          for (let k = 0; k < count; k++) {
            const angle = ((k - (count - 1) / 2) * 0.3) + (b.facing > 0 ? 0 : Math.PI);
            this.projectiles.push({
              x: b.x + (b.facing > 0 ? b.w : -8),
              y: b.y + 6,
              w: 9,
              h: 9,
              vx: Math.cos(angle) * (2.4 + k * 0.2),
              vy: Math.sin(angle) * (2.4 + k * 0.2),
              life: 140,
              isHero: false,
              kind: 'curseOrb',
              angle: 0,
            });
          }

          if (b.phase === 3) {
            // Extra Sand Tornado Homing Projectile
            this.projectiles.push({
              x: b.x + b.w / 2,
              y: b.y,
              w: 12,
              h: 14,
              vx: b.facing * 1.8,
              vy: 0,
              life: 160,
              isHero: false,
              kind: 'sandVortex',
              homingTimer: 60,
            });
          }

          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 20 : 32;
        }
      } else if (b.state === 'teleport') {
        b.stateTimer--;
        if (b.stateTimer === 10) {
          const targetX = this.player.x + (Math.random() < 0.5 ? -100 : 100);
          b.x = Math.max(this.spawnPoint.x, Math.min(this.spawnPoint.x + 600, targetX));
          b.y = Math.random() < 0.5 ? 90 : 115;
          b.vy = 0;
          this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 28, '#d97706');
          sound.playSfx('teleport');
        }
        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = 14;
        }
      }

      // Gravity & Ground Slam Collision for Pharaoh
      b.vy = Math.min(b.vy + GRAVITY, 8);
      b.y += b.vy;
      if (b.y + b.h >= 148) {
        if (b.state === 'slamming' && b.vy > 3) {
          sound.playSfx('bossSlam');
          this.screenShake = 9;
          this.createBurst(b.x + b.w / 2, 148, 26, '#f59e0b');

          b.shockwaves.push(
            { x: b.x - 12, y: 138, vx: -3.8, w: 16, h: 10, life: 85, maxLife: 85, color: '#f59e0b' },
            { x: b.x + b.w, y: 138, vx: 3.8, w: 16, h: 10, life: 85, maxLife: 85, color: '#f59e0b' }
          );

          if (b.phase === 3) {
            b.shockwaves.push(
              { x: b.x - 12, y: 138, vx: -5.0, w: 18, h: 12, life: 100, maxLife: 100, color: '#8b5cf6' },
              { x: b.x + b.w, y: 138, vx: 5.0, w: 18, h: 12, life: 100, maxLife: 100, color: '#8b5cf6' }
            );
          }
          this.addFloatingText(b.x + b.w / 2, b.y - 12, '💥 ¡TERREMOTO DE LAS ARENAS!', '#f59e0b');
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 16 : 26;
        }
        b.y = 148 - b.h;
        b.vy = 0;
      }
    } else if (b.name.includes('Kronos')) {
      // --- BOSS 5: TITÁN MECÁNICO KRONOS-Ω (JEFE FINAL) ---
      const speed = b.state === 'overheat' ? 0 : b.phase === 1 ? 0.9 : b.phase === 2 ? 1.4 : 1.9;

      // Overheat state logic
      if (b.state === 'overheat') {
        b.stateTimer--;
        b.vx *= 0.8;
        // Overheat steam and critical spark particles
        if (this.time % 2 === 0) {
          this.particles.push({
            x: b.x + Math.random() * b.w,
            y: b.y + Math.random() * b.h,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 - Math.random() * 1.5,
            life: 16,
            maxLife: 16,
            color: Math.random() < 0.5 ? '#f97316' : '#ffffff',
            size: 2.5,
          });
        }
        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = 25;
          b.inv = 20;
          this.addFloatingText(b.x + b.w / 2, b.y - 20, '⚡ ¡KRONOS REINICIA SISTEMAS!', '#06b6d4');
        }
      } else if (b.state === 'idle') {
        b.vx += Math.sign(this.player.x - b.x) * 0.04;
        b.vx = Math.max(-speed, Math.min(speed, b.vx));
        b.x += b.vx;

        // Continuous Chrono-Pulse fire in Idle (Relentless Attacks)
        b.shotTimer--;
        if (b.shotTimer <= 0) {
          sound.playSfx('bossShot');
          this.projectiles.push({
            x: b.x + (b.facing > 0 ? b.w : -8),
            y: b.y + 14,
            w: 8,
            h: 8,
            vx: b.facing * 3.2,
            vy: (Math.random() - 0.5) * 0.9,
            life: 120,
            isHero: false,
            kind: 'plasma',
          });
          b.shotTimer = b.phase === 3 ? 24 : 38;
        }

        b.stateTimer--;
        if (b.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.32) {
            // Mega Chrono-Laser Cannon Sweep
            b.state = 'charging';
            b.stateTimer = 30;
            b.telegraphTimer = 30;
            sound.playSfx('laserCharge');
            this.addFloatingText(b.x + b.w / 2, b.y - 18, '⚠️ ¡CARGA DE CAÑÓN CHRONO-LÁSER!', '#f43f5e');
          } else if (roll < 0.62) {
            // High-Altitude Titan Drop Slam
            b.state = 'slamming';
            b.vy = -7.5;
            b.thrusterFlame = 45;
            sound.playSfx('jump');
            this.createBurst(b.x + b.w / 2, b.y + b.h, 20, '#06b6d4');
            this.addFloatingText(b.x + b.w / 2, b.y - 18, '⚡ ¡SALTO PROPULSADO TITÁNICO!', '#06b6d4');
          } else if (roll < 0.84) {
            // Homing Plasma Missile Barrage
            b.state = 'missileBarrage';
            b.stateTimer = 40;
            b.telegraphTimer = 22;
            sound.playSfx('bossWarning');
            this.addFloatingText(b.x + b.w / 2, b.y - 18, '🚀 ¡DESPLIEGUE DE MISILES RASTREADORES!', '#ea580c');
          } else {
            // Overheat High-Output EMP Blast -> Triggers Overheated Vulnerability!
            b.state = 'emp';
            b.stateTimer = 28;
            b.telegraphTimer = 28;
            sound.playSfx('special');
            this.addFloatingText(b.x + b.w / 2, b.y - 18, '⚡ ¡DESCARGA EMP TOTAL!', '#a855f7');
          }
        }
      } else if (b.state === 'charging') {
        b.vx *= 0.75;
        b.stateTimer--;
        if (b.stateTimer <= 0) {
          b.state = 'laser';
          b.stateTimer = b.phase === 3 ? 40 : 32;
          sound.playSfx('laserFire');
          this.screenShake = 8;
          b.laser = {
            active: true,
            charging: false,
            chargeTimer: 0,
            maxCharge: 30,
            dir: b.facing,
            x: b.facing > 0 ? b.x + b.w : b.x - 340,
            y: b.y + 12,
            length: 340,
            thickness: 18,
            duration: b.phase === 3 ? 40 : 32,
          };
        }
      } else if (b.state === 'laser') {
        b.stateTimer--;
        if (b.laser) {
          b.laser.x = b.facing > 0 ? b.x + b.w : b.x - b.laser.length;
          b.laser.y = b.y + 12;

          const laserHitbox = {
            x: b.laser.x,
            y: b.laser.y,
            w: b.laser.length,
            h: b.laser.thickness,
          };

          if (this.checkAABB(this.player, laserHitbox) && this.player.inv <= 0 && !this.settings.godMode) {
            if (this.player.isBlocking) {
              if (this.player.perfectParryTimer > 0) {
                sound.playSfx('parry');
                this.addEnergy(35);
                this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 22, '#facc15');
                this.addFloatingText(this.player.x, this.player.y - 20, '✦ PARRY CHRONO-LÁSER!', '#facc15');
              } else {
                sound.playSfx('block');
                this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 10, '#38bdf8');
              }
            } else {
              this.handlePlayerDamage('¡Impacto de Cañón Chrono-Láser!');
            }
          }
        }
        if (b.stateTimer <= 0) {
          b.laser = undefined;
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 18 : 28;
        }
      } else if (b.state === 'missileBarrage') {
        b.stateTimer--;
        if (b.stateTimer % 10 === 0 && b.stateTimer > 8) {
          const missileCount = b.phase === 3 ? 3 : 2;
          for (let m = 0; m < missileCount; m++) {
            const angleOffset = (m - (missileCount - 1) / 2) * 0.4;
            this.projectiles.push({
              x: b.x + (b.facing > 0 ? b.w : -8),
              y: b.y + 4 + m * 8,
              w: 9,
              h: 7,
              vx: b.facing * (2.8 + m * 0.3),
              vy: Math.sin(angleOffset) * 2.0,
              life: 160,
              isHero: false,
              kind: 'plasma',
              homingTimer: 70,
            });
          }
          sound.playSfx('bossShot');
        }
        if (b.stateTimer <= 0) {
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 20 : 30;
        }
      } else if (b.state === 'emp') {
        b.stateTimer--;
        if (b.stateTimer <= 0) {
          // Fire 360 EMP Shockwave Ring & Enter Overheated Exhaust State!
          sound.playSfx('special');
          this.screenShake = 10;
          this.createBurst(b.x + b.w / 2, b.y + b.h / 2, 40, '#a855f7');
          for (let a = 0; a < 8; a++) {
            const angle = (a * Math.PI * 2) / 8;
            this.projectiles.push({
              x: b.x + b.w / 2,
              y: b.y + b.h / 2,
              w: 8,
              h: 8,
              vx: Math.cos(angle) * 3.0,
              vy: Math.sin(angle) * 3.0,
              life: 100,
              isHero: false,
              kind: 'plasma',
            });
          }
          // Enter Overheated vulnerable state!
          b.state = 'overheat';
          b.stateTimer = 110;
          this.addFloatingText(b.x + b.w / 2, b.y - 28, '🔥 ¡NÚCLEO SOBRECALENTADO! ¡VULNERABLE (DAÑO x2)!', '#f97316');
        }
      } else if (b.state === 'slamming') {
        if (b.vy > 0) {
          b.vy += 0.55;
        }
      }

      // Gravity & Ground Slam Collision for Kronos-Ω
      b.vy = Math.min(b.vy + GRAVITY, 9);
      b.y += b.vy;
      if (b.y + b.h >= 148) {
        if (b.state === 'slamming' && b.vy > 3) {
          sound.playSfx('bossSlam');
          this.screenShake = 12;
          this.createBurst(b.x + b.w / 2, 148, 32, '#06b6d4');

          b.shockwaves.push(
            { x: b.x - 14, y: 136, vx: -4.2, w: 18, h: 12, life: 90, maxLife: 90, color: '#06b6d4' },
            { x: b.x + b.w, y: 136, vx: 4.2, w: 18, h: 12, life: 90, maxLife: 90, color: '#06b6d4' }
          );

          if (b.phase >= 2) {
            b.shockwaves.push(
              { x: b.x - 14, y: 136, vx: -5.6, w: 20, h: 14, life: 110, maxLife: 110, color: '#f43f5e' },
              { x: b.x + b.w, y: 136, vx: 5.6, w: 20, h: 14, life: 110, maxLife: 110, color: '#f43f5e' }
            );
          }
          this.addFloatingText(b.x + b.w / 2, b.y - 12, '💥 ¡COLAPSO TEMPORAL TITÁNICO!', '#06b6d4');
          b.state = 'idle';
          b.stateTimer = b.phase === 3 ? 16 : 26;
        }
        b.y = 148 - b.h;
        b.vy = 0;
      }
    }

    // Universal Relentless Boss Watchdog: Ensures the boss NEVER goes passive or stops attacking
    if (!b.isStaggered && b.state !== 'overheat') {
      if (b.stateTimer <= 0 && b.state !== 'slamming') {
        b.state = 'idle';
        b.stateTimer = 1;
      }
    }

    this.updateShockwaves();
  }

  private updateShockwaves() {
    const b = this.boss;
    if (!b) return;

    for (const sw of b.shockwaves) {
      sw.x += sw.vx;
      sw.life--;

      // Check collision with Player
      if (this.checkAABB(this.player, sw) && this.player.inv <= 0 && !this.settings.godMode) {
        if (this.player.isBlocking) {
          if (this.player.perfectParryTimer > 0) {
            sound.playSfx('parry');
            this.addEnergy(20);
            this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 16, '#facc15');
            this.addFloatingText(this.player.x, this.player.y - 18, '✦ PARRY DE ONDA!', '#facc15');
            sw.life = 0;
          } else {
            sound.playSfx('block');
            this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 8, '#38bdf8');
            this.addFloatingText(this.player.x, this.player.y - 12, '🛡️ ¡Bloqueado!', '#38bdf8');
            sw.life = 0;
          }
        } else {
          sw.life = 0;
          this.handlePlayerDamage('¡Onda de Choque Sísmica!');
        }
      }
    }
    // In-place zero allocation shockwave compaction
    let swWrite = 0;
    for (let i = 0; i < b.shockwaves.length; i++) {
      if (b.shockwaves[i].life > 0) {
        b.shockwaves[swWrite++] = b.shockwaves[i];
      }
    }
    b.shockwaves.length = swWrite;
  }

  private updateProjectiles() {
    let projWrite = 0;
    const maxParticles = this.settings.performanceMode ? 40 : 80;
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (p.kind === 'homing' && p.homingTimer && p.homingTimer > 0) {
        p.homingTimer--;
        const angle = Math.atan2(this.player.y - p.y, this.player.x - p.x);
        p.vx += Math.cos(angle) * 0.12;
        p.vy += Math.sin(angle) * 0.12;
      }
      if (p.kind === 'sakuraShuriken') {
        p.angle = ((p.angle || 0) + 0.25) % (Math.PI * 2);
      }
      if (p.kind === 'magmaMeteor') {
        if (Math.random() < 0.3 && this.particles.length < maxParticles) {
          this.particles.push({
            x: p.x + p.w / 2,
            y: p.y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.8,
            life: 10,
            maxLife: 10,
            color: '#f97316',
            size: 2,
          });
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life > 0) {
        this.projectiles[projWrite++] = p;
      }
    }
    this.projectiles.length = projWrite;
  }

  private updatePhasingMoonPlatforms() {
    const p = this.player;

    for (const plat of this.platforms) {
      if (plat.kind === 'moon') {
        const cycle = Math.floor((this.time + (plat.phase || 0)) / 75) % 2;
        plat.hidden = cycle === 1;
      } else if (plat.kind === 'sinking') {
        // Sinking Basalt Platform Logic
        const isStandingOn = p.ground && p.x + p.w > plat.x && p.x < plat.x + plat.w && Math.abs(p.y + p.h - plat.y) < 3;
        if (isStandingOn) {
          plat.sinkTimer = (plat.sinkTimer || 0) + 1;
          if (plat.sinkTimer > 15) {
            plat.sinkOffset = Math.min(14, (plat.sinkOffset || 0) + 0.35);
            plat.y += 0.35;
            p.y += 0.35;
          }
        } else {
          plat.sinkTimer = Math.max(0, (plat.sinkTimer || 0) - 1);
          if (plat.sinkOffset && plat.sinkOffset > 0) {
            plat.sinkOffset = Math.max(0, plat.sinkOffset - 0.2);
            plat.y -= 0.2;
          }
        }
      }
    }
  }

  private checkCollisions() {
    const p = this.player;

    // 1. Dagger Hits
    for (const proj of this.projectiles) {
      if (!proj.isHero) continue;

      // Enemy hit
      for (const e of this.enemies) {
        if (e.alive && this.checkAABB(proj, e)) {
          this.applyDamageToEnemy(e, proj.damage || 1, Math.sign(proj.vx));
          proj.life = 0;
        }
      }

      // Boss Node Hit
      for (let nodeIdx = 0; nodeIdx < this.nodes.length; nodeIdx++) {
        const node = this.nodes[nodeIdx];
        if (!node.taken && Math.abs(proj.x - node.x) < 40 && this.checkAABB(proj, node)) {
          node.taken = true;
          this.collectedNodeIndices.add(nodeIdx);
          proj.life = 0;
          this.createBurst(node.x + node.w / 2, node.y + node.h / 2, 16, '#22d3ee');
          sound.playSfx('node');
          this.addFloatingText(node.x, node.y - 14, '✦ Nodo Sobrecargado', '#22d3ee');

          if (this.nodes.every((n) => n.taken) && this.boss && this.boss.shield) {
            this.boss.shield = false;
            sound.playSfx('shieldBreak');
            this.screenShake = 6;
            this.addFloatingText(this.boss.x, this.boss.y - 20, '⚡ ¡ESCUDO DEL JEFE DESTRUIDO!', '#4ade80');
          }
        }
      }

      // Boss Direct Hit
      if (this.boss && this.boss.alive && !this.boss.shield && this.boss.inv <= 0 && this.checkAABB(proj, this.boss)) {
        this.applyDamageToBoss(proj.damage || 1);
        proj.life = 0;
      }
    }

    // 2. Crystal Pickups - Grants High Score + Energy + Milestone Life Recovery!
    for (let idx = 0; idx < this.crystals.length; idx++) {
      const c = this.crystals[idx];
      if (c.taken || Math.abs(c.x - p.x) > 50 || Math.abs(c.y - p.y) > 50) continue;
      if (this.checkAABB(p, c)) {
        c.taken = true;
        this.collectedCrystalIndices.add(idx);
        this.stats.crystalsCollected++;
        
        const multiplier = this.getComboMultiplier();
        const pts = Math.round(150 * multiplier);
        this.stats.score += pts;
        this.addEnergy(10);
        this.createBurst(c.x + c.w / 2, c.y + c.h / 2, 9, '#38bdf8');
        sound.playSfx('crystal');
        
        const multLabel = multiplier > 1 ? ` (x${multiplier.toFixed(1)})` : '';
        this.addFloatingText(c.x, c.y - 8, `+${pts} PTS 💎${multLabel}`, '#38bdf8');

        // Milestone Life Recovery: Every 5 crystals restores +1 Life!
        if (this.stats.crystalsCollected % 5 === 0) {
          if (this.lives < this.maxLives) {
            this.lives = Math.min(this.maxLives, this.lives + 1);
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#4ade80');
            sound.playSfx('heal');
            this.addFloatingText(p.x, p.y - 24, `❤ ¡BONUS DE CRISTALES: +1 VIDA! [${this.lives}/${this.maxLives}]`, '#4ade80');
          } else {
            this.stats.score += 500;
            this.addFloatingText(p.x, p.y - 24, '★ ¡BONUS MÁXIMO DE CRISTALES: +500 PTS! ★', '#facc15');
          }
        }
      }
    }

    // 3. Heart Heals - Reliable Health Recovery with Points
    for (let idx = 0; idx < this.heals.length; idx++) {
      const h = this.heals[idx];
      if (h.taken || Math.abs(h.x - p.x) > 50 || Math.abs(h.y - p.y) > 50) continue;
      if (this.checkAABB(p, h)) {
        h.taken = true;
        this.collectedHealIndices.add(idx);
        this.lives = Math.min(this.maxLives, this.lives + 1);
        this.stats.score += 250;
        this.createBurst(h.x + h.w / 2, h.y + h.h / 2, 16, '#22c55e');
        this.createBurst(h.x + h.w / 2, h.y + h.h / 2, 10, '#ef4444');
        sound.playSfx('heal');
        this.addFloatingText(h.x, h.y - 10, `❤ +1 VIDA [${this.lives}/${this.maxLives}] +250 PTS`, '#4ade80');
      }
    }

    // 4. Secrets
    for (let idx = 0; idx < this.secrets.length; idx++) {
      const s = this.secrets[idx];
      if (s.taken || Math.abs(s.x - p.x) > 50 || Math.abs(s.y - p.y) > 50) continue;
      if (this.checkAABB(p, s)) {
        s.taken = true;
        this.collectedSecretIndices.add(idx);
        this.stats.secretsFound++;
        this.stats.score += 1000;
        this.addXp(120);
        this.createBurst(s.x + s.w / 2, s.y + s.h / 2, 20, '#fbbf24');
        sound.playSfx('secret');
        this.addFloatingText(s.x, s.y - 12, `${s.name} (+1000 PTS)`, '#fbbf24');
      }
    }

    // 5. Checkpoints - Restores Full Lives & Full Shield & Daggers!
    for (const cp of this.checkpoints) {
      if (cp.active || Math.abs(cp.x - p.x) > 80) continue;
      if (this.checkAABB(p, cp)) {
        cp.active = true;
        this.spawnPoint = { ...cp.spawn };
        // Save complete snapshot of collected items and defeated enemies
        this.cpSavedCrystals = new Set(this.collectedCrystalIndices);
        this.cpSavedHeals = new Set(this.collectedHealIndices);
        this.cpSavedSecrets = new Set(this.collectedSecretIndices);
        this.cpSavedNodes = new Set(this.collectedNodeIndices);
        this.cpSavedEnemies = new Set(this.defeatedEnemyIndices);

        this.lives = this.maxLives;
        p.shieldEnergy = p.maxShieldEnergy;
        p.isShieldBroken = false;
        p.shieldBreakTimer = 0;
        p.energy = Math.min(p.maxEnergy, p.energy + 30);
        this.daggers = DAGGER_MAX_AMMO;
        this.stats.score += 500;

        this.createBurst(cp.x + cp.w / 2, cp.y + 10, 25, '#22c55e');
        this.createBurst(cp.x + cp.w / 2, cp.y + 10, 15, '#38bdf8');
        sound.playSfx('checkpoint');
        sound.playSfx('heal');
        this.addFloatingText(cp.x, cp.y - 12, `✦ CHECKPOINT & SALUD AL 100% [${this.lives}/${this.maxLives}] ✦`, '#4ade80');
        if (this.onCheckpoint) {
          this.onCheckpoint(cp);
        }
      }
    }

    // 6. Hazards & Enemies Contact (Damage, Stomp, Block & Parry)
    if (p.inv <= 0 && !this.settings.godMode) {
      // Hazards (Fix phantom damage: only deal damage when hazards are actively dangerous)
      for (const h of this.hazards) {
        if (h.type === 'bamboo' || h.type === 'branch' || h.type === 'rock') continue; // Decorative
        if (h.type === 'laserGate' && !h.active) continue;
        if (h.type === 'geyser' && !h.erupting) continue;
        if (h.type === 'fallingBlock' && (!h.isFalling || (h.fallVy || 0) < 1.0)) continue; // Only damage while actually falling
        if (h.type === 'stalactite' && (!h.falling || (h.vy || 0) < 1.0)) continue; // Only damage while actually falling
        if (h.type === 'flameJet' && !h.erupting) continue;
        if (h.type === 'teslaPillar' && !h.active) continue;
        if (h.type === 'crusher' && h.crushState !== 'slamming' && h.y < (h.floorY ?? 140) - 6) continue;
        if (h.type === 'dartTrap') continue;
        if (Math.abs(h.x - p.x) > 90 || Math.abs(h.y - p.y) > 90) continue;

        let isColliding = false;
        if (h.type === 'swingingBlade') {
          // Calculate exact circular pendulum blade tip position instead of top bounding box
          const pivotX = h.x + h.w / 2;
          const pivotY = h.y;
          const length = 55;
          const angle = h.bladeAngle || 0;
          const bladeX = pivotX + Math.sin(angle) * length;
          const bladeY = pivotY + Math.cos(angle) * length;
          const playerCenterX = p.x + p.w / 2;
          const playerCenterY = p.y + p.h / 2;
          const dist = Math.hypot(playerCenterX - bladeX, playerCenterY - bladeY);
          if (dist < 14) {
            isColliding = true;
          }
        } else if (h.type === 'sawBlade') {
          // Circular saw blade contact
          const sawCenterX = h.x + h.w / 2;
          const sawCenterY = h.y + h.h / 2;
          const playerCenterX = p.x + p.w / 2;
          const playerCenterY = p.y + p.h / 2;
          const dist = Math.hypot(playerCenterX - sawCenterX, playerCenterY - sawCenterY);
          if (dist < h.w / 2 + 3) {
            isColliding = true;
          }
        } else if (h.type === 'teslaPillar') {
          // Electric field dome around coil
          const teslaX = h.x + h.w / 2;
          const teslaY = h.y + 12;
          const playerCenterX = p.x + p.w / 2;
          const playerCenterY = p.y + p.h / 2;
          const dist = Math.hypot(playerCenterX - teslaX, playerCenterY - teslaY);
          if (dist < 24) {
            isColliding = true;
          }
        } else if (h.type === 'flameJet') {
          // Directional flame blast box
          if (h.flameAngle === 1) {
            // Facing Right
            const flameBox = { x: h.x, y: h.y - 2, w: h.w + 36, h: h.h + 4 };
            isColliding = this.checkAABB(p, flameBox);
          } else if (h.flameAngle === -1) {
            // Facing Left
            const flameBox = { x: h.x - 36, y: h.y - 2, w: h.w + 36, h: h.h + 4 };
            isColliding = this.checkAABB(p, flameBox);
          } else {
            // Upward Nozzle
            const flameBox = { x: h.x - 2, y: h.y - 45, w: h.w + 4, h: 48 };
            isColliding = this.checkAABB(p, flameBox);
          }
        } else if (h.type === 'crusher') {
          // Piston head crushing block
          const crushBox = { x: h.x + 2, y: h.y, w: h.w - 4, h: h.h };
          isColliding = this.checkAABB(p, crushBox);
        } else if (h.type === 'laserGate') {
          // Precise 4px central beam collision box
          const beamBox = {
            x: h.x + h.w / 2 - 2,
            y: h.y + 2,
            w: 4,
            h: h.h - 4,
          };
          isColliding = this.checkAABB(p, beamBox);
        } else if (h.type === 'geyser') {
          // Flame column above geyser base
          const flameBox = {
            x: h.x + 2,
            y: 148 - 60,
            w: h.w - 4,
            h: 60,
          };
          isColliding = this.checkAABB(p, flameBox);
        } else if (h.type === 'spike' || h.type === 'sandSpike') {
          // Inset 2px horizontally so brushing air doesn't trigger damage
          const spikeBox = {
            x: h.x + 2,
            y: h.y + 2,
            w: Math.max(2, h.w - 4),
            h: h.h - 2,
          };
          isColliding = this.checkAABB(p, spikeBox);
        } else {
          isColliding = this.checkAABB(p, h);
        }

        if (isColliding) {
          if (h.type === 'crusher') {
            sound.playSfx('crushSlam');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 20, '#71717a');
            this.handlePlayerDamage('¡Aplastado por Prensa Hidráulica!');
          } else if (h.type === 'sawBlade') {
            sound.playSfx('buzzSaw');
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 20, '#f59e0b');
            this.handlePlayerDamage('¡Serrado por Sierra Giratoria!');
          } else if (h.type === 'flameJet') {
            sound.playSfx('flameWhoosh');
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#f97316');
            this.handlePlayerDamage('¡Alcanzado por Llamas!');
          } else if (h.type === 'teslaPillar') {
            sound.playSfx('teslaShock');
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 24, '#38bdf8');
            this.handlePlayerDamage('¡Electrocutado por Bobina Tesla!');
          } else if (h.type === 'acidPool') {
            sound.playSfx('acidSizzle');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 18, '#22c55e');
            this.handlePlayerDamage('¡Caíste al Tanque de Ácido!');
          } else if (h.type === 'water') {
            sound.playSfx('splash');
            this.createBurst(p.x + p.w / 2, 160, 16, '#38bdf8');
            this.handlePlayerDamage('¡Caíste al Manantial!');
          } else if (h.type === 'lava') {
            sound.playSfx('lava');
            this.createBurst(p.x + p.w / 2, 150, 20, '#ea580c');
            this.handlePlayerDamage('¡Quemadura de Lava Ardiente!');
          } else if (h.type === 'geyser') {
            sound.playSfx('lava');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 18, '#f97316');
            this.handlePlayerDamage('¡Alcanzado por Géiser Volcánico!');
          } else if (h.type === 'stalactite') {
            sound.playSfx('hit');
            this.createBurst(p.x + p.w / 2, p.y, 16, '#ea580c');
            this.handlePlayerDamage('¡Aplastado por Estalactita!');
          } else if (h.type === 'laserGate') {
            this.handlePlayerDamage('¡Barrera Láser Activa!');
          } else if (h.type === 'sandSpike') {
            sound.playSfx('hit');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 16, '#ea580c');
            this.handlePlayerDamage('¡Pinchado por Púas del Desierto!');
          } else if (h.type === 'swingingBlade') {
            sound.playSfx('slash');
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 20, '#f43f5e');
            this.handlePlayerDamage('¡Cortado por Cuchilla Pendular!');
          } else if (h.type === 'fallingBlock') {
            sound.playSfx('bossSlam');
            this.createBurst(p.x + p.w / 2, p.y, 20, '#d97706');
            this.handlePlayerDamage('¡Aplastado por Bloque de Piedra!');
          } else if (h.type === 'curseRune') {
            sound.playSfx('curse');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 22, '#a855f7');
            this.handlePlayerDamage('¡Maldición de los Faraones!');
          } else if (h.type === 'empFloor') {
            sound.playSfx('block');
            this.createBurst(p.x + p.w / 2, p.y + p.h, 20, '#06b6d4');
            this.handlePlayerDamage('¡Sobrecarga de Red EMP!');
          } else if (h.type === 'plasmaBeam') {
            sound.playSfx('laserFire');
            this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#22d3ee');
            this.handlePlayerDamage('¡Desintegración por Rayo de Plasma!');
          } else {
            this.handlePlayerDamage('¡Peligro en el terreno!');
          }
          break;
        }
      }

      // Hostile Projectiles
      for (const proj of this.projectiles) {
        if (!proj.isHero) {
          if (Math.abs(proj.x - p.x) > 30 || Math.abs(proj.y - p.y) > 30) continue;
          if (this.checkAABB(p, proj)) {
            proj.life = 0;

            // Check for Perfect Parry or Active Block
            if (p.isBlocking && !p.isShieldBroken) {
              if (p.perfectParryTimer > 0) {
                sound.playSfx('parry');
                this.addEnergy(25);
                p.shieldEnergy = Math.min(p.maxShieldEnergy, p.shieldEnergy + 30);
                this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 18, '#facc15');
                this.addFloatingText(p.x, p.y - 18, '✦ PERFECT PARRY! +25 SP & +30 ESCUDO', '#facc15');
                this.screenShake = 4;
              } else {
                p.shieldEnergy = Math.max(0, p.shieldEnergy - 18);
                sound.playSfx('block');
                this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 8, '#38bdf8');
                if (p.shieldEnergy <= 0) {
                  p.isBlocking = false;
                  p.isShieldBroken = true;
                  p.shieldBreakTimer = 120;
                  sound.playSfx('shieldBreak');
                  this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#ef4444');
                  this.addFloatingText(p.x, p.y - 18, '⚡ ¡ESCUDO AGOTADO Y ROTO!', '#ef4444');
                } else {
                  this.addFloatingText(p.x, p.y - 14, `🛡️ ¡Bloqueado! (${Math.round(p.shieldEnergy)}%)`, '#38bdf8');
                }
              }
            } else {
              this.handlePlayerDamage('¡Ataque recibido!');
            }
            break;
          }
        }
      }

      // Enemy Collisions
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (Math.abs(e.x - p.x) > 50 || Math.abs(e.y - p.y) > 50) continue;
        if (this.checkAABB(p, e)) {
          // Stomp enemy if jumping onto head
          if (p.vy > 0 && p.y + p.h - p.vy <= e.y + 6 && e.type !== 'sphere') {
            this.applyDamageToEnemy(e, p.attackPower * 2, p.facing);
            p.vy = JUMP_FORCE * 0.75;
            sound.playSfx('hit');
            this.addFloatingText(e.x, e.y - 10, '¡Pisotón!', '#fde047');
          } else if (p.isBlocking && !p.isShieldBroken) {
            if (p.perfectParryTimer > 0) {
              sound.playSfx('parry');
              e.vx = -p.facing * 3.5;
              this.applyDamageToEnemy(e, p.attackPower * 1.5, -p.facing);
              this.addEnergy(25);
              p.shieldEnergy = Math.min(p.maxShieldEnergy, p.shieldEnergy + 30);
              this.screenShake = 4;
              this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 18, '#facc15');
              this.addFloatingText(p.x, p.y - 16, '✦ CONTRAATAQUE PARRY! +30 ESCUDO', '#facc15');
            } else {
              p.shieldEnergy = Math.max(0, p.shieldEnergy - 22);
              p.vx = -p.facing * 1.5;
              sound.playSfx('block');
              if (p.shieldEnergy <= 0) {
                p.isBlocking = false;
                p.isShieldBroken = true;
                p.shieldBreakTimer = 120;
                sound.playSfx('shieldBreak');
                this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 22, '#ef4444');
                this.addFloatingText(p.x, p.y - 18, '⚡ ¡ESCUDO AGOTADO Y ROTO!', '#ef4444');
              } else {
                this.addFloatingText(p.x, p.y - 12, `🛡️ ¡Bloqueado! (${Math.round(p.shieldEnergy)}%)`, '#38bdf8');
              }
            }
          } else {
            this.handlePlayerDamage('¡El enemigo te alcanzó!');
            break;
          }
        }
      }

      // Boss Body Collision (Only when boss is actively performing offensive move, NOT while staggered/idle/recovering)
      const bossCanDamage =
        this.boss &&
        this.boss.alive &&
        !this.boss.isStaggered &&
        this.boss.state !== 'staggered' &&
        this.boss.state !== 'idle' &&
        this.boss.inv < 15 &&
        (this.boss.introTimer || 0) <= 0;

      if (bossCanDamage && this.boss) {
        const bossHurtbox = {
          x: this.boss.x + 4,
          y: this.boss.y + 4,
          w: Math.max(8, this.boss.w - 8),
          h: Math.max(8, this.boss.h - 8),
        };
        if (this.checkAABB(p, bossHurtbox)) {
          if (p.isBlocking && !p.isShieldBroken) {
            p.shieldEnergy = Math.max(0, p.shieldEnergy - 30);
            p.vx = -p.facing * 2.8;
            sound.playSfx('block');
            if (p.shieldEnergy <= 0) {
              p.isBlocking = false;
              p.isShieldBroken = true;
              p.shieldBreakTimer = 120;
              sound.playSfx('shieldBreak');
              this.createBurst(p.x + p.w / 2, p.y + p.h / 2, 25, '#ef4444');
              this.addFloatingText(p.x, p.y - 18, '⚡ ¡ESCUDO ROTO POR EL JEFE!', '#ef4444');
            } else {
              this.addFloatingText(p.x, p.y - 14, `🛡️ ¡Impacto Bloqueado! (${Math.round(p.shieldEnergy)}%)`, '#38bdf8');
            }
          } else {
            this.handlePlayerDamage('¡Impacto contra el jefe!');
          }
        }
      }
    }

    // 7. Goal Portal Reached
    const config = LEVEL_CONFIGS[this.levelIndex];
    if (this.goal && (config.act === 1 || this.bossDefeated) && this.checkAABB(p, this.goal)) {
      this.handleLevelWin();
    }
  }

  private handlePlayerDamage(msg: string) {
    if (this.settings.godMode) return;
    this.lives--;
    this.stats.deaths++;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboRank = 'D';
    this.screenShake = 6;
    this.player.inv = INVULNERABILITY_FRAMES;
    this.player.vx = -this.player.facing * 2.5;
    this.player.vy = -3.2;
    this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 12, '#f43f5e');
    sound.playSfx('hurt');
    this.addFloatingText(this.player.x, this.player.y - 15, msg, '#f43f5e');

    if (this.lives <= 0) {
      if (this.isOnlyUpMode) {
        this.onlyUpIsGameOver = true;
      } else {
        this.handlePlayerRespawn();
      }
    }
    this.notifyState();
  }

  private handlePlayerRespawn() {
    this.lives = this.maxLives;
    this.player.x = this.spawnPoint.x;
    this.player.y = this.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.inv = 90;
    this.player.shieldEnergy = this.player.maxShieldEnergy;
    this.player.isShieldBroken = false;
    this.daggers = DAGGER_MAX_AMMO;
    this.player.energy = Math.max(60, this.player.energy);

    // If player died during a boss arena battle, reset the boss state for an immediate, fair retry inside the arena
    if (this.arenaActive && this.boss && this.boss.alive) {
      this.boss.hp = this.boss.maxHp;
      this.boss.phase = 1;
      this.boss.state = 'idle';
      this.boss.stateTimer = 35;
      this.boss.shotTimer = 35;
      this.boss.vx = 0;
      this.boss.vy = 0;
      this.boss.isStaggered = false;
      this.boss.stagger = 0;
      this.boss.laser = undefined;
      this.boss.shockwaves = [];
      this.boss.inv = 0;
      if (this.boss.clones) this.boss.clones = [];
      // Restore shield nodes for Guardián Neón (Boss 1)
      if (this.levelIndex <= 1) {
        this.boss.shield = true;
        this.nodes.forEach((n) => (n.taken = false));
      }
      // Restore shield nodes for Kronos-Ω (Boss 5)
      if (this.levelIndex === 10) {
        this.boss.shield = true;
        this.nodes.forEach((n) => (n.taken = false));
      }
      this.addFloatingText(this.spawnPoint.x, this.spawnPoint.y - 20, '⚡ ¡Zion Reaparece en la Arena del Jefe!', '#38bdf8');
    } else {
      this.addFloatingText(this.spawnPoint.x, this.spawnPoint.y - 20, '⚡ ¡Zion Reaparece en Checkpoint!', '#38bdf8');
    }

    // Revert/sync to checkpoint saved state so everything collected up to the checkpoint remains collected
    this.collectedCrystalIndices = new Set(this.cpSavedCrystals);
    this.collectedHealIndices = new Set(this.cpSavedHeals);
    this.collectedSecretIndices = new Set(this.cpSavedSecrets);
    this.collectedNodeIndices = new Set(this.cpSavedNodes);
    this.defeatedEnemyIndices = new Set(this.cpSavedEnemies);

    // Apply to current level items so they do not reappear
    this.crystals.forEach((c, idx) => {
      if (this.collectedCrystalIndices.has(idx)) c.taken = true;
    });
    this.heals.forEach((h, idx) => {
      if (this.collectedHealIndices.has(idx)) h.taken = true;
    });
    this.secrets.forEach((s, idx) => {
      if (this.collectedSecretIndices.has(idx)) s.taken = true;
    });
    this.nodes.forEach((n, idx) => {
      if (this.collectedNodeIndices.has(idx)) n.taken = true;
    });
    this.enemies.forEach((e, idx) => {
      if (this.defeatedEnemyIndices.has(idx)) e.alive = false;
    });

    // Clear hazardous hostile projectiles near respawn point
    this.projectiles = this.projectiles.filter((proj) => proj.isHero);
  }

  private handleLevelWin() {
    if (this.isLevelWon) return;
    this.isLevelWon = true;
    sound.stopMusic();
    sound.playSfx('win');
    this.notifyState();
    if (this.onLevelComplete) {
      this.onLevelComplete();
    }
  }

  private updateEffects() {
    // 1. Combo Timer Decay
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboRank = 'D';
      }
    }

    // 2. Screen Shake Decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 3. Boss Intro Banner Timer Decay
    if (this.bossIntroBanner && this.bossIntroBanner.active) {
      this.bossIntroBanner.timer--;
      if (this.bossIntroBanner.timer <= 0) {
        this.bossIntroBanner.active = false;
      }
    }

    // 4. Particles (In-place zero allocation)
    let pWrite = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life > 0) {
        this.particles[pWrite++] = p;
      }
    }
    this.particles.length = pWrite;

    // 5. Floating Texts (In-place zero allocation)
    let tWrite = 0;
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.life--;
      if (t.life > 0) {
        this.floatingTexts[tWrite++] = t;
      }
    }
    this.floatingTexts.length = tWrite;

    // 6. Melee Slashes (In-place zero allocation)
    let mWrite = 0;
    for (let i = 0; i < this.meleeEffects.length; i++) {
      const m = this.meleeEffects[i];
      m.life--;
      if (m.life > 0) {
        this.meleeEffects[mWrite++] = m;
      }
    }
    this.meleeEffects.length = mWrite;

    // 7. Special Bursts (In-place zero allocation)
    let sWrite = 0;
    for (let i = 0; i < this.specialEffects.length; i++) {
      const s = this.specialEffects[i];
      s.radius += (s.maxRadius - s.radius) * 0.22;
      s.life--;
      if (s.life > 0) {
        this.specialEffects[sWrite++] = s;
      }
    }
    this.specialEffects.length = sWrite;
  }

  public createBurst(x: number, y: number, count = 8, color = '#38bdf8') {
    const maxParticles = this.settings.performanceMode ? 40 : 85;
    if (this.particles.length >= maxParticles) return;
    const spawnCount = Math.min(count, maxParticles - this.particles.length);
    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 18 + Math.floor(Math.random() * 14),
        maxLife: 32,
        color,
        size: 1.5 + Math.random() * 2,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color = '#ffffff') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 45,
      vy: -0.65,
    });
  }

  private updateCamera() {
    if (this.isOnlyUpMode) {
      const targetCameraY = this.player.y - GAME_HEIGHT * 0.58;
      this.cameraY += (targetCameraY - this.cameraY) * 0.14;
      this.cameraX = 0;
      return;
    }
    const config = LEVEL_CONFIGS[this.levelIndex];
    const targetCameraX = this.player.x - GAME_WIDTH * 0.38;
    this.cameraX += (targetCameraX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(config.worldWidth - GAME_WIDTH, this.cameraX));
  }

  private updateOnlyUp() {
    if (this.onlyUpIsGameOver) return;

    this.onlyUpTimeSurvived += 1 / 60;

    // Track Altitude (meters climbed, starting at y = 140)
    const currentMeters = Math.max(0, Math.floor((140 - this.player.y) / 2));
    if (currentMeters > this.onlyUpAltitude) {
      this.onlyUpAltitude = currentMeters;
    }
    if (this.onlyUpAltitude > this.onlyUpMaxAltitude) {
      this.onlyUpMaxAltitude = this.onlyUpAltitude;
    }

    // High score check
    if (this.onlyUpAltitude > this.onlyUpRecord) {
      if (!this.onlyUpNewRecordAchieved && this.onlyUpRecord > 0) {
        this.onlyUpNewRecordAchieved = true;
        sound.playSfx('secret');
        this.addFloatingText(this.player.x, this.player.y - 20, '👑 ¡NUEVO RÉCORD DE ALTURA!', '#fbbf24');
      }
      this.onlyUpRecord = this.onlyUpAltitude;
      saveOnlyUpRecord(this.onlyUpActiveSlotId, this.onlyUpRecord);
    }

    // 3 Seconds Head Start Grace Period
    if (this.onlyUpGraceTimer > 0) {
      this.onlyUpGraceTimer--;
      this.onlyUpLavaSpeed = 0;
    } else {
      // Rising Lava Dynamics: Base altitude scaling + Continuous Time-Based Acceleration
      // "Entre más pasa el tiempo, más rápido sube la lava"
      let baseSpeed = 0.20;
      if (this.onlyUpAltitude > 100) baseSpeed = 0.28;
      if (this.onlyUpAltitude > 250) baseSpeed = 0.38;
      if (this.onlyUpAltitude > 500) baseSpeed = 0.50;
      if (this.onlyUpAltitude > 800) baseSpeed = 0.64;
      if (this.onlyUpAltitude > 1200) baseSpeed = 0.80;

      // Time acceleration: each 10 seconds of survival adds +0.035 lava speed continuously
      const timeBonus = (this.onlyUpTimeSurvived / 10) * 0.035;
      let speed = baseSpeed + timeBonus;

      // If player is far ahead (> 240px), lava picks up extra speed to maintain pressure
      const distFromLava = this.onlyUpLavaY - this.player.y;
      if (distFromLava > 240) {
        speed += 0.12;
      }
      this.onlyUpLavaSpeed = Math.min(2.6, speed);
      this.onlyUpLavaY -= this.onlyUpLavaSpeed;
    }

    // Lava Collision Check (Takes exactly 1 heart, bounces player up with invulnerability)
    if (
      (this.player.y + this.player.h >= this.onlyUpLavaY || this.player.y > this.onlyUpLavaY) &&
      !this.settings.godMode
    ) {
      if (this.player.inv <= 0) {
        this.lives--;
        this.player.inv = INVULNERABILITY_FRAMES;
        this.player.vy = -7.2; // Propel player upward to give chance to catch next platform
        sound.playSfx('lava');
        this.createBurst(this.player.x + this.player.w / 2, this.onlyUpLavaY, 20, '#ea580c');
        this.screenShake = 12;
        this.addFloatingText(this.player.x, this.player.y - 15, '🔥 ¡QUEMADURA DE LAVA! -1 ❤', '#ef4444');
      }

      if (this.lives <= 0) {
        this.lives = 0;
        this.onlyUpIsGameOver = true;
        this.createBurst(this.player.x + this.player.w / 2, this.onlyUpLavaY, 35, '#ea580c');
        this.createBurst(this.player.x + this.player.w / 2, this.onlyUpLavaY, 20, '#fbbf24');
        this.screenShake = 16;
        this.addFloatingText(this.player.x, this.player.y - 25, '💀 ¡FIN DE LA PARTIDA!', '#ef4444');
        this.notifyState();
        return;
      }
    }

    // Procedural generation: spawn next chunk when player gets near top of generated world
    if (this.player.y < this.onlyUpGeneratedTopY + 450) {
      const nextChunk = generateOnlyUpChunk(
        this.onlyUpGeneratedTopY,
        this.onlyUpGeneratedTopY - 450,
        this.onlyUpNextEnemyId
      );
      this.platforms.push(...nextChunk.platforms);
      this.hazards.push(...nextChunk.hazards);
      this.crystals.push(...nextChunk.crystals);
      this.heals.push(...nextChunk.heals);
      this.enemies.push(...nextChunk.enemies);
      if (nextChunk.trampolines) {
        this.trampolines.push(...nextChunk.trampolines);
      }
      this.onlyUpGeneratedTopY -= 450;
      this.onlyUpNextEnemyId += 100;
    }

    // Prune submerged items below lava (every 60 frames) to maintain 60 FPS
    if (this.time % 60 === 0) {
      const cleanupY = this.onlyUpLavaY + 90;
      this.platforms = this.platforms.filter((p) => p.y < cleanupY);
      this.hazards = this.hazards.filter((h) => h.y < cleanupY);
      this.crystals = this.crystals.filter((c) => !c.taken && c.y < cleanupY);
      this.heals = this.heals.filter((h) => !h.taken && h.y < cleanupY);
      this.enemies = this.enemies.filter((e) => e.alive && e.y < cleanupY);
      this.trampolines = this.trampolines.filter((t) => t.y < cleanupY);
    }
  }

  public checkAABB(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
