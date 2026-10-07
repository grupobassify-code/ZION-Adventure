export type ZoneId = 
  | 'neon' 
  | 'sakura' 
  | 'lavacliff' 
  | 'desert' 
  | 'krono' 
  | 'travel' 
  | 'jungle' 
  | 'blizzard'
  | 'steampunk'
  | 'castlesmash'
  | 'piratestreasure'
  | 'jurasicdraft'
  | 'themoon';

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
  kind: 
    | 'ground' 
    | 'ledge' 
    | 'arena' 
    | 'moon' 
    | 'bridge' 
    | 'sinking' 
    | 'basalt' 
    | 'quicksand' 
    | 'sandstone' 
    | 'ruins' 
    | 'cyber' 
    | 'conveyor' 
    | 'hologram' 
    | 'jungle_stone' 
    | 'temple_stone' 
    | 'treetop' 
    | 'vine_bridge' 
    | 'snow' 
    | 'ice' 
    | 'frozen_rock' 
    | 'ski_slope' 
    | 'glacier_ice'
    | 'steampunk_brass'
    | 'steampunk_rust'
    | 'steampunk_pipe'
    | 'steampunk_gear'
    | 'gear_rotating'
    | 'castle_stone'
    | 'castle_parapet'
    | 'castle_bridge'
    | 'castle_iron'
    | 'crumbling_floor'
    | 'sand'
    | 'palm_wood'
    | 'coral'
    | 'sunken_deck'
    | 'shipwreck_hull'
    | 'prehistoric_earth'
    | 'petrified_wood'
    | 'dino_fossil_rock'
    | 'volcanic_basalt'
    | 'launch_gantry'
    | 'space_chassis'
    | 'moon_regolith'
    | 'rocket_scaffold'
    | 'lunar_regolith'
    | 'lunar_base_habitat'
    | 'solar_deck'
    | 'biodome_catwalk'
    | 'pressurized_conduit';
  slopeEndY?: number;
  phase?: number;
  hidden?: boolean;
  speed?: number;
  dir?: 1 | -1;
  rotationSpeed?: number;
  gearRadius?: number;
  
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
  | 'gravity_orb'
  | 'jungle_serpent'
  | 'jungle_monkey'
  | 'giant_hornet'
  | 'arctic_wolf'
  | 'ice_golem'
  | 'frost_bat'
  | 'snow_hopper'
  | 'clockwork_drone'
  | 'steam_spider'
  | 'brass_automaton'
  | 'rust_golem'
  | 'castle_knight'
  | 'shield_guard'
  | 'gargoyle'
  | 'siege_crossbow'
  | 'castle_golem'
  | 'pirate_skeleton'
  | 'pirate_crab'
  | 'parrot_bomber'
  | 'anglerfish'
  | 'electric_jellyfish'
  | 'shark_corsair'
  | 'raptor'
  | 'pterodactyl'
  | 'triceratops'
  | 'ankylosaur'
  | 'astro_guard'
  | 'rocket_drone'
  | 'lunar_crawler'
  | 'thruster_mech'
  | 'cosmic_parasite';

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
  type: 
    | 'spike' 
    | 'laserGate' 
    | 'vine' 
    | 'bamboo' 
    | 'water' 
    | 'rock' 
    | 'branch' 
    | 'lava' 
    | 'geyser' 
    | 'stalactite' 
    | 'quicksand' 
    | 'sandSpike' 
    | 'swingingBlade' 
    | 'curseRune' 
    | 'fallingBlock' 
    | 'empFloor' 
    | 'conveyorLeft' 
    | 'conveyorRight' 
    | 'plasmaBeam' 
    | 'turretLaser'
    | 'crusher'
    | 'sawBlade'
    | 'flameJet'
    | 'teslaPillar'
    | 'acidPool'
    | 'dartTrap'
    | 'rotatingFireChain'
    | 'proximityMine'
    | 'antigravRift'
    | 'electricArc'
    | 'rollingSpikeBall'
    | 'retractableSpikes'
    | 'plasmaTurret'
    | 'gravityVortex'
    | 'snow_branch'
    | 'fallen_log'
    | 'rolling_snowball'
    | 'icicle'
    | 'blizzard_gust'
    | 'ice_spikes'
    | 'steam_jet'
    | 'steam_pipe_burst'
    | 'rotating_gear_hazard'
    | 'scalding_steam'
    | 'swinging_mace'
    | 'portcullis'
    | 'catapult_boulder'
    | 'crumbling_floor'
    | 'sea_mine'
    | 'sea_urchin'
    | 'bubble_geyser'
    | 'coral_spikes'
    | 'falling_coconut'
    | 'lava_fissure'
    | 'pterodactyl_nest'
    | 'rolling_boulder'
    | 'tar_pit'
    | 'rocket_thruster_plume'
    | 'cryo_steam_vent'
    | 'electrified_gantry_rail'
    | 'laser_barrier'
    | 'cosmic_geyser'
    | 'lunar_spike';
  life?: number;
  dead?: boolean;
  active?: boolean;
  cycleTimer?: number;
  spikePhase?: 'retracted' | 'warning' | 'extended';
  turretAngle?: number;
  gravityRadius?: number;
  
  // Geyser / Stalactite / Trap mechanics
  erupting?: boolean;
  warnTimer?: number;
  maxCycle?: number;
  fallVy?: number;
  originalY?: number;
  isFalling?: boolean;
  falling?: boolean;
  vy?: number;
  vx?: number;
  bladeAngle?: number;
  bladeSpeed?: number;
  beamLength?: number;

  // Crusher, Saw, FlameJet, Tesla & Dart mechanics
  crushState?: 'idle' | 'warning' | 'slamming' | 'rising';
  crushTimer?: number;
  crushSpeed?: number;
  ceilingY?: number;
  floorY?: number;
  railMin?: number;
  railMax?: number;
  moveSpeed?: number;
  dir?: 1 | -1;
  flameAngle?: number; // 0 = up, 1 = right, -1 = left, 2 = down
  flameRange?: number;
  flameTimer?: number;
  arcTimer?: number;
  teslaTimer?: number;
  teslaState?: 'charging' | 'active' | 'cooldown';
  acidTimer?: number;
  shootCooldown?: number;
  shootDir?: 1 | -1;

  // New Obstacle Mechanics: Fire Chain, Proximity Mine, Antigrav Rift, Electric Arc
  spinAngle?: number;
  spinSpeed?: number;
  chainLength?: number;
  orbCount?: number;
  mineArmed?: boolean;
  mineTriggered?: boolean;
  mineTimer?: number;
  detonated?: boolean;
  vortexForce?: number;
  liftPower?: number;
  targetX?: number;
  targetY?: number;
  bobAngle?: number;
}

export interface Collectible {
  x: number;
  y: number;
  w: number;
  h: number;
  taken: boolean;
  t?: number;
}

export interface Trampoline {
  x: number;
  y: number;
  w: number;
  h: number;
  bounceForce: number;
  springAnim: number;
  type?: 'standard' | 'super' | 'mega' | 'normal' | 'steam_boost';
}

export interface Liana {
  id: number;
  x: number;
  y: number;
  length: number;
  angle?: number;
  angularVelocity?: number;
  maxAngle?: number;
}

export interface Waterfall {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  flowSpeed?: number;
  mistParticles?: boolean;
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
  hp?: number;
  maxHp?: number;
  active?: boolean;
}

export interface DestructibleObject {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  type: 'wooden_barricade' | 'stone_wall' | 'drawbridge_chain' | 'siege_core' | 'iron_gate';
  destroyed: boolean;
  name: string;
  hitFlash?: number;
  shake?: number;
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
  startX?: number;
  startY?: number;
  state: 'idle' | 'charging' | 'slamming' | 'laser' | 'teleport' | 'dash' | 'staggered' | 'summon' | 'overheat' | 'emp' | 'missileBarrage' | 'pounce' | 'slash' | 'roar' | 'jumping' | 'slam' | 'run' | 'attack' | 'catapult' | 'shooting' | 'smashing' | 'roaring' | 'shield' | 'invisible';
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
  slashHitbox?: { x: number; y: number; w: number; h: number; active: boolean };
  afterimages?: Array<{ x: number; y: number; alpha: number; facing: 1 | -1 }>;
  isInvisible?: boolean;
  invisibilityTimer?: number;
  hasTriggeredPhase2Invis?: boolean;
  shieldCores?: number;
  immuneToStun?: boolean;
}

export type CharacterSkin =
  | 'zion'
  | 'zizz'
  | 'kael'
  | 'anuk'
  | 'vector'
  | 'balam'
  | 'blizzard'
  | 'steampunk'
  | 'castlesmash'
  | 'pirate'
  | 'jurassic'
  | 'moon';

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
  kind?: 'normal' | 'plasma' | 'sakuraShuriken' | 'magmaDart' | 'sakuraKunai' | 'sandDart' | 'empDisc' | 'jadeDart' | 'iceShard' | 'steamBolt' | 'ironJavelin' | 'anchorHarpoon' | 'primalClaw' | 'starPebble' | 'homing' | 'laserBolt' | 'fireball' | 'magmaMeteor' | 'lavaBlob' | 'curseOrb' | 'sandVortex' | 'bandageWrap' | 'sandSpit' | 'homingMissile' | 'empSpark' | 'plasmaVolley' | 'mechLaser' | 'coconut' | 'stinger' | 'jaguarClawSlash' | 'jaguarRoarWave' | 'snowball' | 'ice_shard' | 'yetiSlamWave' | 'iceSpikeBlast' | 'blizzardRoarWave' | 'steam_fireball' | 'castle_arrow' | 'gargoyle_fire' | 'catapult_rock' | 'catapult_boulder' | 'stone_shrapnel' | 'apex_energy_orb' | 'apex_plasma_bolt' | 'cryo_canister' | 'lunar_laser' | 'space_missile' | 'doomsday_laser' | 'asteroid_debris' | 'bionic_burst';
  homingTimer?: number;
  angle?: number;
  color?: string;
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
  skin?: CharacterSkin;
}

export interface SpecialBurstEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
  skin?: CharacterSkin;
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
  type: 'torii' | 'bridge' | 'waterfall' | 'shrine' | 'bamboo' | 'lanterns' | 'volcano_vent' | 'obsidian_pillar' | 'lava_fall' | 'basalt_arch' | 'magma_pipe' | 'pyramid' | 'sphinx' | 'sand_dune' | 'obelisk' | 'pharaoh_statue' | 'oasis' | 'sarcophagus' | 'ancient_columns' | 'cyber_skyscraper' | 'holo_billboard' | 'antenna_tower' | 'warp_portal' | 'reactor_core' | 'kronos_statue' | 'credits_gate' | 'travel_beacon' | 'dimensional_rift' | 'mayan_pyramid' | 'jungle_waterfall' | 'giant_ceiba' | 'mayan_temple' | 'tribal_totem' | 'jungle_ruins' | 'snow_cabin' | 'ski_jump_ramp' | 'frozen_pine' | 'glacial_peak' | 'yeti_cave' | 'ice_crystal_cluster' | 'chalet' | 'slalom_flag' | 'giant_frosted_pine' | 'frozen_pinnacle' | 'ski_lift' | 'ice_cave_entrance' | 'aurora_shrine' | 'clocktower' | 'steam_generator' | 'boiler_furnace' | 'clockwork_tower' | 'castle_keep' | 'siege_catapult' | 'throne_dais' | 'royal_banner' | 'stone_gargoyle_perch' | 'dino_fossil_ribs' | 'amber_altar' | 'volcanic_fumarole' | 'colossal_rocket_gantry' | 'launch_control_tower' | 'radar_tracking_dish' | 'cryogenic_fuel_silo' | 'lunar_biodome' | 'lunar_lander_apollo' | 'lunar_comm_relay' | 'lunar_solar_farm' | 'helium3_refinery';
  x: number;
  y?: number;
  w?: number;
  h?: number;
  scale?: number;
  label?: string;
  name?: string;
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
  damageInvTimer?: number;
  time: number;
  animState: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'block';
  characterSkin?: CharacterSkin;
  
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

  // Jungle Liana Vine Mechanics
  onVine?: boolean;
  vineId?: number;
  vineGrabY?: number;
  vineCooldown?: number;

  // Blizzard Rush Ski Mechanics
  isSkiing?: boolean;
  skiCrouch?: boolean;
  isDucking?: boolean;
  skiSpeed?: number;
  skiAirTime?: number;
  skiAirTimer?: number;
  skiTrickTimer?: number;

  // Space Flight Bionic Suit (Super Sonic / Doomsday Zone Mode)
  isFlying?: boolean;
  flightSuit?: boolean;
  flightBoost?: boolean;
  flightBoostTimer?: number;
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
  performanceMode?: boolean;
  showFps?: boolean;
}

export interface MallaMission {
  id: string;
  zoneId: ZoneId;
  missionIndex: number; // 0, 1, or 2
  title: string;
  description: string;
  objectiveText: string;
  type: 'boss' | 'time' | 'crystals';
  levelId: string;
  levelIndex: number;
  timeLimitSec?: number;
  targetCrystals?: number;
  rewardScore: number;
}

export interface MallaZoneInfo {
  id: ZoneId;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  bossName: string;
  mapCoords: { x: number; y: number }; // percentage on island (0 to 100)
  territory: { left: number; top: number; width: number; height: number }; // percentage area covered by static storm clouds
  missions: MallaMission[];
  loreCorruption: string;
}

export interface PendingMallaPuzzleData {
  mission: MallaMission;
  zoneId: ZoneId;
  missionIndex: number;
  slotId: number;
}

export type TemporalPuzzleType = 'jigsaw' | 'circuit' | 'frequency' | 'cipher';

export interface MallaProgress {
  unlocked?: boolean;
  completedMissions: Record<string, boolean[]>; // zoneId -> [boolean, boolean, boolean]
  rescuedZones: ZoneId[];
  unlockedZoneIds?: ZoneId[]; // zones available to challenge/play
  chosenStartingZone?: ZoneId; // first zone picked by the player
  islandFullyRescued: boolean;
  lastPlayedMission?: { zoneId: ZoneId; missionIndex: number };
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
  specialStagesCompleted?: number;
  specialStageUnlocked?: boolean;
  levelBestCrystals?: Record<number, number>;
  kronosPiecesPlaced?: string[];
  kronosLockerUnlocked?: boolean;
  selectedSkin?: string;
  achievements?: Record<string, { unlockedAt: number; progress: number }>;
  mallaProgress?: MallaProgress;
}

