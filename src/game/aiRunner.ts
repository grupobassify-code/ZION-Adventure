import { Platform, Hazard, Enemy, Checkpoint } from '../types';
import { RemotePlayerState } from '../types/multiplayer';
import {
  GAME_HEIGHT,
  GRAVITY,
  MAX_FALL_SPEED,
  PLAYER_ACCEL,
  PLAYER_MAX_SPEED,
  JUMP_FORCE,
  DASH_SPEED,
  DASH_DURATION,
  DASH_COOLDOWN,
} from './constants';

export interface AiRunnerOptions {
  name?: string;
  speedMultiplier?: number;
  startX?: number;
  startY?: number;
}

export class AiRunner {
  public x: number = 35;
  public y: number = 100;
  public w: number = 14;
  public h: number = 16;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = false;
  public isDashing: boolean = false;
  public isAttacking: boolean = false;
  public hasWon: boolean = false;

  public name: string = 'Krono-Bot IA';
  public speedMultiplier: number = 1.0;

  private dashTimer: number = 0;
  private dashCooldown: number = 0;
  private attackTimer: number = 0;
  private jumpCooldown: number = 0;
  private invTimer: number = 0;
  private stuckTimer: number = 0;
  private lastX: number = 35;
  private startX: number = 35;
  private startY: number = 100;
  private lastCheckpointSpawn: { x: number; y: number } = { x: 35, y: 100 };
  private respawnPauseTimer: number = 0;
  private goalX: number = 2000;

  constructor(options: AiRunnerOptions = {}) {
    this.name = options.name || 'Krono-Bot IA';
    this.speedMultiplier = options.speedMultiplier || 1.0;
    this.startX = options.startX ?? 35;
    this.startY = options.startY ?? 100;
    this.x = this.startX;
    this.y = this.startY;
    this.lastCheckpointSpawn = { x: this.startX, y: this.startY };
    this.lastX = this.x;
  }

  public reset(startX = 35, startY = 100) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.isGrounded = false;
    this.isDashing = false;
    this.isAttacking = false;
    this.hasWon = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.attackTimer = 0;
    this.jumpCooldown = 0;
    this.invTimer = 0;
    this.stuckTimer = 0;
    this.lastCheckpointSpawn = { x: startX, y: startY };
    this.lastX = startX;
    this.respawnPauseTimer = 0;
  }

  private triggerDeath(onDie?: (deathX: number, deathY: number, cpX: number, cpY: number) => void) {
    const deathX = this.x;
    const deathY = this.y;
    const cpX = this.lastCheckpointSpawn.x;
    const cpY = this.lastCheckpointSpawn.y;

    // Respawn strictly at the last reached checkpoint (or start point if none reached)
    this.x = cpX;
    this.y = cpY;
    this.vx = 0;
    this.vy = 0;
    this.isDashing = false;
    this.isAttacking = false;
    this.dashTimer = 0;
    this.dashCooldown = DASH_COOLDOWN;
    this.jumpCooldown = 20;
    this.isGrounded = true;
    this.invTimer = 90; // Invulnerability window
    this.respawnPauseTimer = 22; // Brief pause before sprinting again

    if (onDie) {
      onDie(deathX, deathY, cpX, cpY);
    }
  }

  public update(
    platforms: Platform[],
    hazards: Hazard[],
    enemies: Enemy[],
    goal: { x: number; y: number; w?: number; h?: number },
    checkpoints: Checkpoint[] = [],
    onDie?: (deathX: number, deathY: number, cpX: number, cpY: number) => void
  ) {
    if (this.hasWon) return;

    this.goalX = goal.x;

    // Check if goal reached
    if (this.x >= goal.x - 15) {
      this.hasWon = true;
      this.vx = 0;
      this.isDashing = false;
      return;
    }

    // Update last checkpoint reached along the route
    for (const cp of checkpoints) {
      if (this.x >= cp.x - 5) {
        if (cp.spawn.x > this.lastCheckpointSpawn.x) {
          this.lastCheckpointSpawn = { x: cp.spawn.x, y: cp.spawn.y };
        }
      }
    }

    // Respawn recovery pause
    if (this.respawnPauseTimer > 0) {
      this.respawnPauseTimer--;
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);
      this.y += this.vy;
      this.handlePlatformCollisions(platforms);
      return;
    }

    // Timers decrement
    if (this.jumpCooldown > 0) this.jumpCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.invTimer > 0) this.invTimer--;

    if (this.dashTimer > 0) {
      this.dashTimer--;
      if (this.dashTimer === 0) this.isDashing = false;
    }
    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) this.isAttacking = false;
    }

    // 1. HORIZONTAL VELOCITY & ACCELERATION (Exact same speed & acceleration as player)
    const baseSpeed = PLAYER_MAX_SPEED * this.speedMultiplier;
    this.facing = 1;

    if (this.isDashing) {
      // Dash speed & gravity suspension exactly identical to player
      this.vx = DASH_SPEED * this.speedMultiplier;
      this.vy = 0;
    } else {
      // Accelerate forward with player's exact acceleration
      this.vx += (baseSpeed - this.vx) * PLAYER_ACCEL;
      if (this.vx > baseSpeed) {
        this.vx = baseSpeed;
      }
      // Gravity matches player
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);
    }

    // 2. SENSING & PROACTIVE OBSTACLE LOOK-AHEAD (Simulated player reflexes)
    const lookAheadNear = this.x + 18;
    const lookAheadMid = this.x + 36;
    const lookAheadFar = this.x + 60;

    // Check for ground ahead
    const hasGroundUnderneathAhead = platforms.some((p) => {
      if (p.hidden) return false;
      const platTop = p.slopeEndY !== undefined ? Math.min(p.y, p.slopeEndY) : p.y;
      return p.x <= lookAheadMid && p.x + p.w >= lookAheadNear && platTop >= this.y + 4 && platTop <= this.y + 70;
    });

    // Check for hazards in path
    const hasHazardAhead = hazards.some((h) => {
      if (h.active === false || h.type === 'bamboo' || h.type === 'branch' || h.type === 'rock') return false;
      return h.x < lookAheadFar && h.x + h.w > lookAheadNear && Math.abs(h.y - this.y) < 36;
    });

    // Check for wall or elevated step ahead
    const hasStepAhead = platforms.some((p) => {
      if (p.hidden || p.slopeEndY !== undefined) return false;
      return p.x <= lookAheadNear + 6 && p.x + p.w >= this.x + 10 && p.y < this.y + 12 && p.y > this.y - 50;
    });

    // Check for enemy ahead
    const enemyAhead = enemies.find(
      (e) => e.alive && e.x > this.x && e.x < this.x + 40 && Math.abs(e.y - this.y) < 30
    );

    // 3. ACTION EXECUTION (Jump & Dash with identical forces and durations as player)
    if (this.isGrounded && this.jumpCooldown <= 0) {
      if (hasHazardAhead || !hasGroundUnderneathAhead || hasStepAhead) {
        // Perform Jump with exact player JUMP_FORCE!
        this.vy = JUMP_FORCE;
        this.isGrounded = false;
        this.jumpCooldown = 18;

        // Aerial dash over wide gap or wide hazard when available
        if ((hasHazardAhead || !hasGroundUnderneathAhead) && this.dashCooldown <= 0 && Math.random() < 0.5) {
          this.isDashing = true;
          this.dashTimer = DASH_DURATION;
          this.dashCooldown = DASH_COOLDOWN;
          this.vx = DASH_SPEED;
          this.vy = 0;
        }
      } else if (enemyAhead) {
        // Attack enemy with light blade and jump
        this.isAttacking = true;
        this.attackTimer = 16;
        if (Math.random() < 0.65) {
          this.vy = JUMP_FORCE * 0.75;
          this.isGrounded = false;
          this.jumpCooldown = 20;
        }
      } else if (Math.random() < 0.008 && this.dashCooldown <= 0 && !this.isDashing) {
        // Straight sprint burst dash on clear ground
        this.isDashing = true;
        this.dashTimer = DASH_DURATION;
        this.dashCooldown = DASH_COOLDOWN;
        this.vx = DASH_SPEED;
        this.vy = 0;
      }
    }

    // 4. APPLY MOVEMENT
    this.x += this.vx;
    this.y += this.vy;

    // 5. PLATFORM COLLISIONS
    this.handlePlatformCollisions(platforms);

    // 6. DEATH CONDITION 1: PIT FALL
    if (this.y > GAME_HEIGHT + 25) {
      this.triggerDeath(onDie);
      return;
    }

    // 7. DEATH CONDITION 2: LETHAL HAZARDS (Protected by Dash dodge & invulnerability)
    if (!this.isDashing && this.invTimer <= 0) {
      for (const h of hazards) {
        if (h.active === false || h.type === 'bamboo' || h.type === 'branch' || h.type === 'rock') continue;
        if (
          this.x < h.x + h.w &&
          this.x + this.w > h.x &&
          this.y < h.y + h.h &&
          this.y + this.h > h.y
        ) {
          this.triggerDeath(onDie);
          return;
        }
      }
    }

    // 8. DEATH CONDITION 3: ENEMY CONTACT (Defeated by attacking, stomp or dash)
    if (!this.isDashing && this.invTimer <= 0) {
      for (const e of enemies) {
        if (!e.alive) continue;

        // Check if landing on top (stomp) or attacking with sword
        const isStomp = this.vy > 0 && this.y + this.h <= e.y + 8 && this.x + this.w > e.x && this.x < e.x + e.w;
        if (isStomp || (this.isAttacking && Math.abs(e.x - this.x) < 28 && Math.abs(e.y - this.y) < 24)) {
          if (isStomp) {
            this.vy = JUMP_FORCE * 0.7;
            this.isGrounded = false;
          }
          continue;
        }

        if (
          this.x < e.x + e.w &&
          this.x + this.w > e.x &&
          this.y < e.y + e.h &&
          this.y + this.h > e.y
        ) {
          this.triggerDeath(onDie);
          return;
        }
      }
    }

    // 9. ANTI-STUCK WATCHDOG
    if (Math.abs(this.x - this.lastX) < 0.5) {
      this.stuckTimer++;
      if (this.stuckTimer > 35) {
        this.vy = JUMP_FORCE;
        this.isGrounded = false;
        this.jumpCooldown = 15;
        if (this.dashCooldown <= 0) {
          this.isDashing = true;
          this.dashTimer = DASH_DURATION;
          this.dashCooldown = DASH_COOLDOWN;
          this.vx = DASH_SPEED;
          this.vy = 0;
        }
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
      this.lastX = this.x;
    }
  }

  private handlePlatformCollisions(platforms: Platform[]) {
    this.isGrounded = false;
    const footX = this.x + this.w / 2;
    const footY = this.y + this.h;

    for (const p of platforms) {
      if (p.hidden) continue;

      // Handle downhill/uphill slopes
      if (p.slopeEndY !== undefined) {
        if (footX >= p.x && footX <= p.x + p.w) {
          const progress = (footX - p.x) / p.w;
          const surfaceY = p.y + progress * (p.slopeEndY - p.y);
          if (footY >= surfaceY - 6 && footY <= surfaceY + 12 && this.vy >= -1.0) {
            this.y = surfaceY - this.h;
            this.vy = 0;
            this.isGrounded = true;
          }
        }
        continue;
      }

      // Flat platforms
      if (footX >= p.x && footX <= p.x + p.w) {
        if (footY >= p.y && footY - this.vy <= p.y + 8) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.isGrounded = true;
          break;
        }
      }
    }
  }

  public getState(): RemotePlayerState {
    const progress = Math.min(100, Math.max(0, Math.round((this.x / Math.max(1, this.goalX)) * 100)));

    let animState: RemotePlayerState['animState'] = 'run';
    if (this.isAttacking) animState = 'attack';
    else if (this.isDashing) animState = 'dash';
    else if (this.vy < -0.5) animState = 'jump';
    else if (this.vy > 0.5) animState = 'fall';
    else if (Math.abs(this.vx) < 0.2) animState = 'idle';

    return {
      id: 'ai_bot',
      name: this.name,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      facing: this.facing,
      animState,
      isDashing: this.isDashing,
      isAttacking: this.isAttacking,
      progressPercent: progress,
      isWon: this.hasWon,
      skin: 'cyber',
      timestamp: Date.now(),
    };
  }
}
