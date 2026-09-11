import { Platform, Hazard, Enemy } from '../types';
import { RemotePlayerState } from '../types/multiplayer';

export interface AiRunnerOptions {
  name?: string;
  speedMultiplier?: number;
  startX?: number;
  startY?: number;
}

export class AiRunner {
  public x: number = 35;
  public y: number = 100;
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
  private attackTimer: number = 0;
  private jumpCooldown: number = 0;
  private stuckTimer: number = 0;
  private lastX: number = 35;
  private lastProgressCheckTime: number = 0;
  private checkpointX: number = 35;
  private checkpointY: number = 100;
  private respawnPauseTimer: number = 0;
  private goalX: number = 2000;

  constructor(options: AiRunnerOptions = {}) {
    this.name = options.name || 'Krono-Bot IA';
    this.speedMultiplier = options.speedMultiplier || 1.0;
    this.x = options.startX ?? 35;
    this.y = options.startY ?? 100;
    this.checkpointX = this.x;
    this.checkpointY = this.y;
    this.lastX = this.x;
  }

  public reset(startX = 35, startY = 100) {
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
    this.attackTimer = 0;
    this.jumpCooldown = 0;
    this.stuckTimer = 0;
    this.checkpointX = startX;
    this.checkpointY = startY;
    this.lastX = startX;
    this.respawnPauseTimer = 0;
  }

  public update(
    platforms: Platform[],
    hazards: Hazard[],
    enemies: Enemy[],
    goal: { x: number; y: number; w?: number; h?: number }
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

    // Respawn recovery pause
    if (this.respawnPauseTimer > 0) {
      this.respawnPauseTimer--;
      this.vy += 0.28;
      this.y += this.vy;
      this.handlePlatformCollisions(platforms);
      return;
    }

    // Timers decrement
    if (this.jumpCooldown > 0) this.jumpCooldown--;
    if (this.dashTimer > 0) {
      this.dashTimer--;
      if (this.dashTimer === 0) this.isDashing = false;
    }
    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) this.isAttacking = false;
    }

    // 1. HORIZONTAL VELOCITY & ACCELERATION
    const baseSpeed = 2.85 * this.speedMultiplier;
    let targetSpeed = baseSpeed;

    if (this.isDashing) {
      targetSpeed = 4.4 * this.speedMultiplier;
    }

    // Accelerate forward
    this.vx += (targetSpeed - this.vx) * 0.18;
    this.facing = 1;

    // 2. GRAVITY
    this.vy += 0.29;
    if (this.vy > 5.5) this.vy = 5.5;

    // 3. SENSING & PROACTIVE OBSTACLE LOOK-AHEAD (Raycast simulation)
    const lookAheadNear = this.x + 28;
    const lookAheadMid = this.x + 48;
    const lookAheadFar = this.x + 75;

    // Check for hazards in path
    const hasHazardAhead = hazards.some(
      (h) => h.active !== false && h.x < lookAheadFar && h.x + h.w > lookAheadNear && Math.abs(h.y - this.y) < 36
    );

    // Check for ground gap ahead (pit detection)
    const hasGroundUnderneathAhead = platforms.some(
      (p) => p.x <= lookAheadMid && p.x + p.w >= lookAheadNear && p.y >= this.y + 8 && p.y <= this.y + 60
    );

    // Check for wall or elevated step ahead
    const hasStepAhead = platforms.some(
      (p) => p.x <= lookAheadNear && p.x + p.w >= this.x + 10 && p.y < this.y + 12 && p.y > this.y - 48
    );

    // Check for enemy ahead
    const enemyAhead = enemies.find(
      (e) => e.alive && Math.abs(e.x - this.x) < 40 && Math.abs(e.y - this.y) < 30
    );

    // Action execution
    if (this.isGrounded && this.jumpCooldown <= 0) {
      if (hasHazardAhead || !hasGroundUnderneathAhead || hasStepAhead) {
        // Perform Jump!
        this.vy = -4.65;
        this.isGrounded = false;
        this.jumpCooldown = 18;

        // Occasional aerial dash over wide gap/hazard
        if ((hasHazardAhead || !hasGroundUnderneathAhead) && Math.random() < 0.45 && this.dashTimer <= 0) {
          this.isDashing = true;
          this.dashTimer = 16;
        }
      } else if (enemyAhead) {
        // Attack enemy and small hop
        this.isAttacking = true;
        this.attackTimer = 18;
        if (Math.random() < 0.6) {
          this.vy = -4.2;
          this.isGrounded = false;
          this.jumpCooldown = 20;
        }
      } else if (Math.random() < 0.008 && this.dashTimer <= 0) {
        // Random sprint burst on clear path
        this.isDashing = true;
        this.dashTimer = 22;
      }
    }

    // 4. APPLY MOVEMENT
    this.x += this.vx;
    this.y += this.vy;

    // 5. PLATFORM COLLISIONS
    this.handlePlatformCollisions(platforms);

    // 6. ANTI-PIT FALL & RESPAWN
    if (this.y > 195) {
      // Fell into bottomless pit: respawn with safe penalty
      this.x = Math.max(35, this.checkpointX - 35);
      this.y = this.checkpointY - 8;
      this.vx = 1.0;
      this.vy = -3.2;
      this.respawnPauseTimer = 25; // brief 0.4s hesitation
      this.isDashing = false;
      return;
    }

    // 7. ANTI-STUCK WATCHDOG
    if (Math.abs(this.x - this.lastX) < 1.0) {
      this.stuckTimer++;
      if (this.stuckTimer > 40) {
        // Force emergency jump + forward burst
        this.vy = -5.1;
        this.vx = 4.2;
        this.isDashing = true;
        this.dashTimer = 24;
        this.isGrounded = false;
        this.jumpCooldown = 15;
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
      this.lastX = this.x;
    }
  }

  private handlePlatformCollisions(platforms: Platform[]) {
    this.isGrounded = false;
    const footX = this.x + 8;
    const footY = this.y + 16;

    for (const p of platforms) {
      // Only collide from above
      if (footX >= p.x && footX <= p.x + p.w) {
        // If feet crossed top of platform within tolerance
        if (footY >= p.y && footY - this.vy <= p.y + 8) {
          this.y = p.y - 16;
          this.vy = 0;
          this.isGrounded = true;

          // Update safe checkpoint every ~100px
          if (this.x - this.checkpointX > 100) {
            this.checkpointX = this.x;
            this.checkpointY = this.y;
          }
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
