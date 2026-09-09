export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

// Refined physics for ultra-smooth movement & dynamic deliberate pacing
export const GRAVITY = 0.30;
export const MAX_FALL_SPEED = 7.2;
export const PLAYER_ACCEL = 0.28;
export const PLAYER_DECEL = 0.26;
export const PLAYER_MAX_SPEED = 2.25;
export const JUMP_FORCE = -6.0;
export const VARIABLE_JUMP_FALL_MULTIPLIER = 0.55;

export const COYOTE_FRAMES = 7;
export const JUMP_BUFFER_FRAMES = 6;

// Dash / Dodge Mechanics
export const DASH_SPEED = 5.4;
export const DASH_DURATION = 12; // frames (~0.2s of rapid invulnerable glide)
export const DASH_COOLDOWN = 32; // frames (~0.53s - snappy combat evasion)

// Melee Combat
export const MELEE_RANGE = 24;
export const MELEE_DURATION = 10;
export const MELEE_BASE_DAMAGE = 2;

// Dagger Throwing
export const DAGGER_MAX_AMMO = 3;
export const DAGGER_RECHARGE_TIME = 120; // frames (~2.0s recharge)
export const DAGGER_SPEED = 5.2;
export const DAGGER_LIFETIME = 75;
export const DAGGER_BASE_DAMAGE = 1;

// Defense / Shield & Showdown
export const PERFECT_PARRY_WINDOW = 10; // frames of initial block that triggers showdown parry
export const SHOWDOWN_SLOWMO_DURATION = 45; // Slow motion bullet-time counter window
export const SHOWDOWN_COUNTER_DAMAGE = 10; // Devastating critical counter attack
export const SHOWDOWN_CHARGE_PER_BLOCK = 25; // Meter gained on blocking
export const SHOWDOWN_CHARGE_ON_PARRY = 100; // Instantly fills on perfect parry

// Special Ability (Balanced: Recharges passively over time and through combat)
export const SPECIAL_ENERGY_COST = 70;
export const SPECIAL_BURST_RADIUS = 68;
export const SPECIAL_BASE_DAMAGE = 2.2;
export const SPECIAL_PASSIVE_REGEN = 0.08; // Passive SP charge over time (~4.8 SP/sec)
export const SPECIAL_HIT_SP_GAIN = 3.2; // SP gained per sword hit
export const SPECIAL_PARRY_SP_GAIN = 25.0; // SP gained on perfect parry

// Player Progression & Health
export const MAX_LIVES_BASE = 3;
export const INVULNERABILITY_FRAMES = 80;
export const BASE_XP_NEEDED = 100;
export const MAX_PLAYER_LEVEL = 10;
export const MAX_ENERGY_BASE = 100;
