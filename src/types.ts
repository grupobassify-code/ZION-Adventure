export type ZoneId = 'neon' | 'sakura' | 'lavacliff' | 'desert' | 'krono' | 'travel';

export interface LevelConfig {
  id: string;
  zone: ZoneId;
  act: number;
  title: string;
  subtitle: string;
  lore: {
    title: string;
    lines: string[];
    author?: string;
  }[];
  worldWidth: number;
  themeColor: string;
  accentColor: string;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'ground' | 'ledge' | 'arena' | 'moon' | 'bridge' | 'sinking' | 'basalt' | 'quicksand' | 'sandstone' | 'ruins' | 'cyber' | 'conveyor' | 'hologram';
  phase?: number;
  hidden?: boolean;
  speed?: number;
  dir?: 1 | -1;
  
  // Sinking platform properties
  sinkTimer?: number;
  sinkOffset?: number;
  isSinking?: boolean;
  originalY?: number;
}

export type EnemyType = 
  | 'patrol' 
  | 'sentinel' 
  | 'hopper' 
  | 'charger' 
  | 'sphere' 
  | 'kitsune' 
  | 'kage' 
  | 'kagered' 
  | 'kodama' 
  | 'yurei' 
  | 'butterfly'
  | 'salamander'
  | 'magma_golem'
  | 'flame_wisp'
  | 'fire_hopper'
  | 'scarab'
  | 'mummy_warrior'
  | 'sand_serpent'
  | 'anubis_statue'
  | 'desert_vulture'
  | 'cyber_drone'
  | 'cyberturret'
  | 'cyber_hound'
  | 'plasma_trooper'
  | 'gravity_orb';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  min: number;
  max: number;
  alive: boolean;
  hp: number;
  maxHp: number;
  hitFlash?: number;
  home: number;
  wait?: number;
  charge?: number;
  angle?: number;
  t?: number;
  cool?: number;
  solid?: boolean;
  scoreValue?: number;
  xpValue?: number;
  alertTimer?: number; // Visual exclamation indicator before attacking
  facing?: 1 | -1;
  animTimer?: number;
}

export interface Hazard {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'laserGate' | 'vine' | 'bamboo' | 'water' | 'rock' | 'branch' | 'lava' | 'geyser' | 'stalactite' | 'quicksand' | 'sandSpike' | 'swingingBlade' | 'curseRune' | 'fallingBlock' | 'empFloor' | 'conveyorLeft' | 'conveyorRight' | 'plasmaBeam' | 'turretLaser';
  life?: number;
  dead?: boolean;
  active?: boolean;
  cycleTimer?: number;
  
  // Geyser / Stalactite / Trap mechanics
  erupting?: boolean;
  warnTimer?: number;
  maxCycle?: number;
  fallVy?: number;
  originalY?: number;
  isFalling?: boolean;
  falling?: boolean;
  vy?: number;
  bladeAngle?: number;
  bladeSpeed?: number;
  beamLength?: number;
}

export interface Collectible {
  x: number;
  y: number;
  w: number;
  h: number;
  taken: boolean;
  t?: number;
}

export interface SecretItem extends Collectible {
  name: string;
}

export interface Checkpoint {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  spawn: { x: number; y: number };
  arena?: boolean;
}

export interface NodePillar {
  x: number;
  y: number;
  w: number;
  h: number;
  taken: boolean;
  id?: string | number;
}

export interface BossShockwave {
  x: number;
  y: number;
  vx: number;
  w: number;
  h: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface BossLaser {
  active: boolean;
  charging: boolean;
  chargeTimer: number;
  maxCharge: number;
  dir: number;
  x: number;
  y: number;
  length: number;
  thickness: number;
  duration: number;
}

export interface BossClone {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  alpha: number;
  attackTimer: number;
  action: 'slash' | 'shuriken';
}

export interface Boss {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  shield?: boolean;
  inv: number;
  flash: number;
  phase: number;
  jumpTimer: number;
  shotTimer: number;
  attackTimer?: number;
  targetX?: number;
  name: string;
  title: string;
  subtitle?: string;
  state: 'idle' | 'charging' | 'slamming' | 'laser' | 'teleport' | 'dash' | 'staggered' | 'summon' | 'overheat' | 'emp' | 'missileBarrage';
  stateTimer: number;
  telegraphTimer: number;
  stagger: number;
  maxStagger: number;
  isStaggered: boolean;
  facing: 1 | -1;
  laser?: BossLaser;
  shockwaves: BossShockwave[];
  clones?: BossClone[];
  introTimer?: number;
  thrusterFlame?: number;
  overheatTimer?: number;
  shieldCores?: number;
}

export interface Projectile {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  life: number;
  isHero?: boolean;
  damage?: number;
  isSpecial?: boolean;
  kind?: 'normal' | 'plasma' | 'sakuraShuriken' | 'homing' | 'laserBolt' | 'fireball' | 'magmaMeteor' | 'lavaBlob' | 'curseOrb' | 'sandVortex' | 'bandageWrap' | 'sandSpit' | 'homingMissile' | 'empSpark' | 'plasmaVolley' | 'mechLaser';
  homingTimer?: number;
  angle?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface MeleeSlashEffect {
  x: number;
  y: number;
  facing: 1 | -1;
  life: number;
  maxLife: number;
  combo: number;
}

export interface SpecialBurstEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface Landmark {
  type: 'torii' | 'bridge' | 'waterfall' | 'shrine' | 'bamboo' | 'lanterns' | 'volcano_vent' | 'obsidian_pillar' | 'lava_fall' | 'basalt_arch' | 'magma_pipe' | 'pyramid' | 'sphinx' | 'sand_dune' | 'obelisk' | 'pharaoh_statue' | 'oasis' | 'sarcophagus' | 'ancient_columns' | 'cyber_skyscraper' | 'holo_billboard' | 'antenna_tower' | 'warp_portal' | 'reactor_core' | 'kronos_statue' | 'credits_gate' | 'travel_beacon' | 'dimensional_rift';
  x: number;
  y?: number;
  w?: number;
  h?: number;
  scale?: number;
  label?: string;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  ground: boolean;
  jumpHeld: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  inv: number;
  time: number;
  animState: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'block';
  
  // Dash / Dodge
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  
  // Melee Attack Combo
  isAttacking: boolean;
  attackTimer: number;
  comboStep: number;
  comboResetTimer: number;

  // Defense / Shield & Showdown
  isBlocking: boolean;
  blockTimer: number;
  perfectParryTimer: number;
  shieldEnergy: number;      // 0 to 100% Shield Stamina
  maxShieldEnergy: number;   // 100
  isShieldBroken: boolean;   // True when stamina reached 0
  shieldBreakTimer: number;  // Recovery cooldown frames
  showdownMeter: number;     // 0 to 100% Charge
  showdownActive: boolean;    // In bullet-time slow-mo counter state
  showdownTimer: number;     // Active showdown frames remaining
  showdownReady: boolean;    // Meter is 100% full

  // RPG / Level Up & Stats
  level: number;
  xp: number;
  xpNeeded: number;
  energy: number;     // SP (Special Power)
  maxEnergy: number;
  attackPower: number;
  dashTrail: { x: number; y: number; facing: 1 | -1; alpha: number }[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  godMode: boolean;
  infiniteDaggers: boolean;
  infiniteEnergy: boolean;
  showHitboxes: boolean;
  controlMode: 'joystick' | 'dpad';
}

export interface SaveSlot {
  id: number;
  name: string;
  createdAt: number;
  lastPlayed: number;
  unlockedLevels: number[];
  completedLevels: number[];
  totalScore: number;
  totalCrystals: number;
  totalSecrets: number;
  deaths: number;
  playTimeSeconds: number;
  characterLevel: number;
}

