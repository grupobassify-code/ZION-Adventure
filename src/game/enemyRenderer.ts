// =============================================================================
// ZION ADVENTURE - DETAILED ENEMY PIXEL ART RENDERER
// Complete handcrafted pixel-art rendering for all 23 enemy types across all 5 zones.
// Features multi-layer shading, directional mirroring, ground shadows,
// walk/hover/flight animations, animated glowing optics, and stylish HUD bars.
// =============================================================================

import { Enemy } from '../types';

export class EnemyRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(e: Enemy, cameraX: number, time: number) {
    const ctx = this.ctx;
    const x = Math.round(e.x - cameraX);
    const y = Math.round(e.y);

    // Off-screen culling
    if (x < -40 || x > 360) return;

    const facing = e.facing ?? 1;
    const anim = e.animTimer || Math.floor(time);
    const isFlashing = (e.hitFlash || 0) > 0 && Math.floor((e.hitFlash || 0) / 2) % 2 === 0;

    // 1. Subtle Soft Ground Shadow (for ground & hovering units)
    this.renderGroundShadow(e, x, y, time);

    // 2. Set up local coordinate space centered on enemy
    ctx.save();
    ctx.translate(x + e.w / 2, y + e.h / 2);
    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    // Hit Flash Brightness Overlay
    if (isFlashing) {
      ctx.filter = 'brightness(2.2) drop-shadow(0 0 4px #ffffff)';
    }

    // 3. Render Zone-Specific Enemy Sprite
    switch (e.type) {
      // --- ZONA 1: BOSQUE NEÓN ---
      case 'patrol':
        this.renderPatrolDroid(anim, e);
        break;
      case 'sentinel':
        this.renderSentinel(anim, time, e);
        break;
      case 'hopper':
        this.renderCyberHopper(anim, e);
        break;
      case 'charger':
        this.renderCyberCharger(anim, time, e);
        break;
      case 'sphere':
        this.renderPlasmaSphere(anim, time, e);
        break;

      // --- ZONA 2: BOSQUE DE CEREZO ---
      case 'kitsune':
        this.renderKitsune(anim, time, e);
        break;
      case 'kage':
        this.renderKageShinobi(anim, time, e, false);
        break;
      case 'kagered':
        this.renderKageShinobi(anim, time, e, true);
        break;
      case 'kodama':
        this.renderKodamaSpirit(anim, time, e);
        break;
      case 'yurei':
        this.renderYureiPhantom(anim, time, e);
        break;
      case 'butterfly':
        this.renderSakuraButterfly(anim, time, e);
        break;

      // --- ZONA 3: CAVERNAS DE FUEGO & ACANTILADO DE LAVA ---
      case 'salamander':
        this.renderMagmaSalamander(anim, time, e);
        break;
      case 'magma_golem':
        this.renderMagmaGolem(anim, time, e);
        break;
      case 'flame_wisp':
        this.renderFlameWisp(anim, time, e);
        break;
      case 'fire_hopper':
        this.renderFireHopper(anim, time, e);
        break;

      // --- ZONA 4: SANTUARIO DEL DESIERTO ---
      case 'scarab':
        this.renderJeweledScarab(anim, time, e);
        break;
      case 'mummy_warrior':
        this.renderMummyWarrior(anim, time, e);
        break;
      case 'sand_serpent':
        this.renderSandCobra(anim, time, e);
        break;
      case 'anubis_statue':
        this.renderAnubisStatue(anim, time, e);
        break;
      case 'desert_vulture':
        this.renderDesertVulture(anim, time, e);
        break;

      // --- ZONA 5: KRONO CITY METRÓPOLIS ---
      case 'cyber_drone':
        this.renderCyberDrone(anim, time, e);
        break;
      case 'cyberturret':
        this.renderCyberTurret(anim, time, e);
        break;
      case 'cyber_hound':
        this.renderCyberHound(anim, time, e);
        break;
      case 'plasma_trooper':
        this.renderPlasmaTrooper(anim, time, e);
        break;
      case 'gravity_orb':
        this.renderGravityOrb(anim, time, e);
        break;

      default:
        this.renderPatrolDroid(anim, e);
        break;
    }

    ctx.restore();

    // 4. Attack Warning Indicator '!'
    if (e.alertTimer && e.alertTimer > 0) {
      this.renderAlertIndicator(x + e.w / 2, y - 10, time);
    }

    // 5. Stylized Mini Health Bar
    if (e.hp < e.maxHp && e.maxHp > 1) {
      this.renderHealthBar(x, y - 6, e.w, e.hp, e.maxHp);
    }
  }

  // ===========================================================================
  // COMMON HUD & SHADOWS
  // ===========================================================================
  private renderGroundShadow(e: Enemy, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isAirborne =
      e.type === 'sphere' ||
      e.type === 'yurei' ||
      e.type === 'butterfly' ||
      e.type === 'flame_wisp' ||
      e.type === 'desert_vulture' ||
      e.type === 'cyber_drone' ||
      e.type === 'gravity_orb';

    const shadowY = isAirborne ? y + e.h + 14 : y + e.h;
    const shadowW = isAirborne ? e.w * 0.75 : e.w * 0.9;
    const shadowAlpha = isAirborne ? 0.2 : 0.35;

    ctx.save();
    ctx.fillStyle = `rgba(3, 7, 18, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x + e.w / 2, shadowY, shadowW / 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderAlertIndicator(cx: number, cy: number, time: number) {
    const ctx = this.ctx;
    const bob = Math.sin(time * 0.25) * 1.5;
    ctx.save();
    ctx.translate(cx, cy + bob);

    // Glowing diamond badge
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(3.5, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(-3.5, 0);
    ctx.closePath();
    ctx.fill();

    // Sharp white exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -3, 2, 3.5);
    ctx.fillRect(-1, 1.5, 2, 1.5);

    ctx.restore();
  }

  private renderHealthBar(x: number, y: number, enemyW: number, hp: number, maxHp: number) {
    const ctx = this.ctx;
    const barW = Math.max(16, enemyW + 2);
    const barH = 3;
    const barX = Math.round(x + (enemyW - barW) / 2);
    const barY = Math.round(y);
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    const fillW = Math.round(ratio * (barW - 2));

    // Outer dark bezel
    ctx.fillStyle = '#090d16';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // Background track
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    // Health color gradient
    let fillColor = '#ef4444'; // Red < 35%
    if (ratio > 0.6) fillColor = '#22c55e'; // Green > 60%
    else if (ratio > 0.3) fillColor = '#f59e0b'; // Amber 30-60%

    ctx.fillStyle = fillColor;
    ctx.fillRect(barX + 1, barY + 1, fillW, barH - 1);

    // Top glint highlight
    if (fillW > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.45;
      ctx.fillRect(barX + 1, barY + 0.5, fillW, 0.75);
      ctx.globalAlpha = 1;
    }
  }

  // ===========================================================================
  // ZONA 1: BOSQUE NEÓN (CYBERNETIC ROBOTS & PLASMA ENERGY)
  // ===========================================================================

  // 1. Patrol Scout Droid (Bipedal articulated walker with glowing optic & antenna)
  private renderPatrolDroid(anim: number, e: Enemy) {
    const ctx = this.ctx;
    const walk = Math.sin(anim * 0.25);
    const leg1 = walk * 3;
    const leg2 = -walk * 3;

    // Legs (Articulated hydraulic struts)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4 + leg1 * 0.5, 3, 2.5, 4);
    ctx.fillRect(2 + leg2 * 0.5, 3, 2.5, 4);
    // Metallic footpads
    ctx.fillStyle = '#334155';
    ctx.fillRect(-5 + leg1 * 0.5, 6, 4, 1.5);
    ctx.fillRect(1 + leg2 * 0.5, 6, 4, 1.5);

    // Main Torso Chassis (Dark slate with neon cyan plates)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-6, -4, 12, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-5, -3, 10, 6);
    // Cyan Accent circuit plate
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -1, 8, 2);

    // Head Unit
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -7, 8, 4);
    // Glowing Neon Visor Eye (Pulsing cybernetic optic)
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(0, -6, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -6, 2, 1);

    // Top Comms Antenna & Blinking Beacon
    ctx.fillStyle = '#475569';
    ctx.fillRect(-2, -9, 1.5, 3);
    const beacon = anim % 20 < 10 ? '#ef4444' : '#22d3ee';
    ctx.fillStyle = beacon;
    ctx.fillRect(-2.5, -10.5, 2.5, 2);

    // Rear Thruster / Battery
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-7, -3, 2, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, -1, 1, 1.5);
  }

  // 2. Tactical Laser Sentinel (Heavy bipedal robot with laser targeting arm)
  private renderSentinel(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const idleBob = Math.sin(time * 0.1) * 0.8;

    // Heavy Legs
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-5, 2, 3, 5);
    ctx.fillRect(2, 2, 3, 5);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(-6, 5, 4, 2);
    ctx.fillRect(1, 5, 4, 2);

    // Heavy Armored Torso (Indigo & Violet)
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-6, -5 + idleBob, 12, 8);
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(-5, -4 + idleBob, 10, 6);

    // Pulsing Plasma Reactor Core
    const corePulse = (Math.sin(time * 0.2) + 1) * 0.5;
    ctx.fillStyle = corePulse > 0.5 ? '#c084fc' : '#818cf8';
    ctx.fillRect(-2, -2 + idleBob, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -1.5 + idleBob, 2, 1.5);

    // Armored Head & Cyber Visor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -8 + idleBob, 8, 4);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(0, -7 + idleBob, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -7 + idleBob, 2, 1);

    // Shoulder Laser Cannon with Red Aim Diode
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-2, -10 + idleBob, 8, 3);
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(3, -9.5 + idleBob, 4, 2);
    // Red laser lens
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(6, -9 + idleBob, 1.5, 1.5);

    // Rear Exhaust Capacitor
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(-7, -4 + idleBob, 2, 4);
  }

  // 3. Cyber Hopper (Spring-loaded hydraulic jumper)
  private renderCyberHopper(anim: number, e: Enemy) {
    const ctx = this.ctx;
    const isAirborne = (e.vy || 0) !== 0;
    const springCompress = isAirborne ? 1.5 : 0.8;

    // High-tech Spring Coil Leg
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2, 1, 4, 4 * springCompress);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-2.5, 2 * springCompress, 5, 1.5);
    ctx.fillRect(-2.5, 4 * springCompress, 5, 1.5);
    // Shock Absorber Foot
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, 5 * springCompress, 8, 2);

    // Aerodynamic Magenta Hopper Chassis
    ctx.fillStyle = '#500724';
    ctx.fillRect(-6, -6, 12, 8);
    ctx.fillStyle = '#be185d';
    ctx.fillRect(-5, -5, 10, 6);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-4, -4, 8, 4);

    // Optical Sensor Clusters
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(1, -4, 3, 2);
    ctx.fillRect(1, -1, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -3.5, 1.5, 1);

    // Hydraulic Ear Fin Stabilizers
    ctx.fillStyle = '#9d174d';
    ctx.fillRect(-5, -8, 2, 3);
    ctx.fillRect(-1, -9, 2, 4);
  }

  // 4. Cyber Charger (Armored kinetic ram droid with energy horns)
  private renderCyberCharger(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const isCharging = (e.charge || 0) > 0;
    const gallop = Math.sin(anim * 0.4) * 2;

    // 4 Sturdy Piston Legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6 + gallop, 2, 3, 5);
    ctx.fillRect(-2 - gallop, 2, 3, 5);
    ctx.fillRect(2 + gallop, 2, 3, 5);
    ctx.fillRect(5 - gallop, 2, 3, 5);

    // Heavy Plated Body (Crimson & Charcoal)
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-7, -4, 14, 7);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-6, -3, 12, 5);

    // Reinforced Wedge Ram Shield / Prow
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(3, -5, 5, 9);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, -4, 4, 7);

    // Energized Ram Horns (Glow orange/yellow)
    ctx.fillStyle = isCharging ? '#fde047' : '#f97316';
    ctx.fillRect(6, -7, 3, 3);
    ctx.fillRect(8, -9, 2, 3);
    ctx.fillRect(6, -1, 3, 2);

    // Menacing Red Visor Slit
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(5, -3, 2, 2);

    // Back Exhaust Stack with Sparks during Charge
    ctx.fillStyle = '#292524';
    ctx.fillRect(-6, -7, 2.5, 4);
    if (isCharging) {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-7, -9, 4, 2);
    }
  }

  // 5. Plasma Sphere (Levitating gravitational plasma orb with gyro-rings)
  private renderPlasmaSphere(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const rot = (e.angle || 0) + time * 0.05;

    // Glowing Radial Corona
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Outer Gyroscope Rings (At dynamic 3D angle)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4.5, rot, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4, -rot * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    // Core Plasma Ball
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -1, 2, 2);

    // Orbiting Satellite Node
    const orbX = Math.cos(rot * 1.5) * 8;
    const orbY = Math.sin(rot * 1.5) * 6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(orbX - 1, orbY - 1, 2, 2);
    ctx.restore();
  }

  // ===========================================================================
  // ZONA 2: BOSQUE DE CEREZO (SPIRITS, MYTHICAL FOX & SHINOBI)
  // ===========================================================================

  // 6. Sacred Kitsune (Mystical spirit fox with animated tails & ritual mask)
  private renderKitsune(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const legWalk = Math.sin(anim * 0.3) * 2;
    const tailSway = Math.sin(time * 0.18) * 3;

    // Multi-tail Fan (Sinusoidal swaying tails)
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-9, -2 + tailSway, 5, 3);
    ctx.fillRect(-8, 1 - tailSway * 0.7, 4, 3);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-10, -4 + tailSway, 6, 3);
    ctx.fillStyle = '#ffedd5'; // White tail tips
    ctx.fillRect(-12, -4 + tailSway, 3, 2.5);
    ctx.fillRect(-10, 1 - tailSway * 0.7, 3, 2);

    // 4 Paws / Legs
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(-4 + legWalk, 3, 2.5, 4);
    ctx.fillRect(1 - legWalk, 3, 2.5, 4);
    ctx.fillRect(-2 - legWalk, 3, 2.5, 4);
    ctx.fillRect(4 + legWalk, 3, 2.5, 4);

    // Fox Torso (Golden-orange with white chest fur)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-6, -3, 11, 7);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-5, -2, 9, 5);
    ctx.fillStyle = '#fff7ed'; // Fluffy ruff
    ctx.fillRect(1, -2, 4, 4);

    // Kitsune Head & Porcelain Mask
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(2, -6, 7, 6);
    // Ears with dark tips
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(3, -9, 2.5, 4);
    ctx.fillRect(7, -9, 2.5, 4);
    ctx.fillStyle = '#fbcfe8'; // Pink inner ear
    ctx.fillRect(3.5, -8, 1.5, 2);

    // Porcelain Mask Faceplate
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -5, 5, 4);
    // Red Ritual Markings & Eye Slit
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, -5, 2, 1);
    ctx.fillRect(7, -5, 2, 1);
    ctx.fillRect(6, -4, 2, 1.5);
    // Black fox nose
    ctx.fillStyle = '#000000';
    ctx.fillRect(8.5, -3, 1.5, 1.5);

    // Dancing Foxfire Wisp above head
    const wispBob = Math.sin(time * 0.25) * 2;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillRect(0, -10 + wispBob, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0.5, -9.5 + wispBob, 2, 2);
  }

  // 7. Kage Shadow Shinobi & Kagered Crimson Ronin
  private renderKageShinobi(anim: number, time: number, e: Enemy, isRed: boolean) {
    const ctx = this.ctx;
    const walk = Math.sin(anim * 0.3);
    const scarfWave = Math.sin(time * 0.22) * 2.5;

    // Colors
    const giDark = isRed ? '#4c0519' : '#020617';
    const giMid = isRed ? '#881337' : '#0f172a';
    const giAccent = isRed ? '#e11d48' : '#2e1065';
    const scarfColor = isRed ? '#fb7185' : '#a855f7';
    const eyeColor = isRed ? '#facc15' : '#22d3ee';

    // Flowing Ninja Scarf trailing behind
    ctx.fillStyle = scarfColor;
    ctx.fillRect(-8, -4 + scarfWave, 5, 2.5);
    ctx.fillRect(-11, -3 + scarfWave * 1.3, 4, 2);
    ctx.fillRect(-13, -2 + scarfWave * 1.6, 3, 1.5);

    // Ninja Legs & Tabi Boots
    ctx.fillStyle = giDark;
    ctx.fillRect(-4 + walk * 2, 3, 3, 5);
    ctx.fillRect(1 - walk * 2, 3, 3, 5);
    ctx.fillStyle = '#f8fafc'; // White foot wraps
    ctx.fillRect(-4 + walk * 2, 6.5, 3.5, 1.5);
    ctx.fillRect(1 - walk * 2, 6.5, 3.5, 1.5);

    // Torso with Shinobi Vest & Obi Sash
    ctx.fillStyle = giMid;
    ctx.fillRect(-5, -4, 10, 8);
    ctx.fillStyle = giAccent;
    ctx.fillRect(-4, -3, 8, 6);
    // Obi Sash
    ctx.fillStyle = scarfColor;
    ctx.fillRect(-5, 0, 10, 2);

    // Masked Ninja Head
    ctx.fillStyle = giDark;
    ctx.fillRect(-3.5, -8, 7, 5);
    // Sharp Optical Slit Eyes
    ctx.fillStyle = eyeColor;
    ctx.fillRect(0, -6.5, 3.5, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -6.5, 1.5, 1);

    // Weapon: Dual Kunai or Gleaming Katana
    if (isRed) {
      // Samurai Ronin Katana Blade
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(5, -9, 2, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5.5, -8, 1, 12);
      ctx.fillStyle = '#f59e0b'; // Gold Tsuba Guard
      ctx.fillRect(4, -2, 4, 1.5);
      ctx.fillStyle = '#881337'; // Tsuka grip
      ctx.fillRect(5, 0, 2, 4);
    } else {
      // Reverse-Grip Shinobi Kunai
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, -1, 5, 2);
      ctx.fillRect(8, -1.5, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9.5, -0.5, 1.5, 1);
    }
  }

  // 8. Kodama Tree Spirit (Ancient mossy spirit with sacred shide charms & leaf crown)
  private renderKodamaSpirit(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const wobble = Math.sin(anim * 0.2) * 1.2;

    // Mossy Bark Body
    ctx.fillStyle = '#14532d';
    ctx.fillRect(-5, -2 + wobble, 10, 8);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-4, -1 + wobble, 8, 6);

    // Stubby root feet
    ctx.fillStyle = '#14532d';
    ctx.fillRect(-4, 5, 3, 2.5);
    ctx.fillRect(1, 5, 3, 2.5);

    // Sacred Shinto Shimenawa Rope & White Paper Shide Charms
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-5, 1 + wobble, 10, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 2.5 + wobble, 2, 2.5);
    ctx.fillRect(1, 2.5 + wobble, 2, 2.5);

    // Round Head
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-4.5, -7 + wobble, 9, 6);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(-3.5, -6 + wobble, 7, 4);

    // Large Mysterious Spirit Eyes
    ctx.fillStyle = '#052e16';
    ctx.fillRect(-2, -5 + wobble, 2.5, 2.5);
    ctx.fillRect(1.5, -5 + wobble, 2.5, 2.5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1.5, -4.5 + wobble, 1.5, 1.5);
    ctx.fillRect(2, -4.5 + wobble, 1.5, 1.5);

    // Leaf Crown Sprout on Head
    const leafSway = Math.sin(time * 0.25) * 1.5;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-1, -9 + wobble, 2, 3);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-3 + leafSway, -11 + wobble, 4, 3);
    ctx.fillRect(0 - leafSway, -12 + wobble, 4, 3);
    // Dew Drop
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(2, -10 + wobble, 1.5, 1.5);
  }

  // 9. Yurei Spectral Phantom (Translucent white shroud with orbiting hitodama wisps)
  private renderYureiPhantom(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const floatBob = Math.sin(time * 0.15) * 2;
    const trail = Math.sin(time * 0.25) * 2;

    ctx.save();
    // Ethereal Spectral Transparency
    ctx.globalAlpha = 0.85;

    // Wispy Ghost Shroud Body (Tapering downward into mist)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-5, -4 + floatBob, 10, 8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-4, 3 + floatBob, 8, 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-3 + trail, 6 + floatBob, 6, 3);
    ctx.fillRect(-1 + trail * 1.5, 8 + floatBob, 3, 2);

    // Long Cascading Midnight Hair
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-5, -8 + floatBob, 10, 5);
    ctx.fillRect(-5, -4 + floatBob, 3, 6);
    ctx.fillRect(2, -4 + floatBob, 3, 6);

    // Pale Spectral Face
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-2, -5 + floatBob, 4, 4);

    // Glowing Lilac/Violet Eyes
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(-1.5, -4 + floatBob, 1.5, 1.5);
    ctx.fillRect(1, -4 + floatBob, 1.5, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -4 + floatBob, 1, 1);
    ctx.fillRect(1.5, -4 + floatBob, 1, 1);

    // Orbiting Hitodama Spirit Wisps (Figure-eight path)
    const wisp1X = Math.cos(time * 0.2) * 9;
    const wisp1Y = Math.sin(time * 0.4) * 5 + floatBob;
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(wisp1X, wisp1Y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wisp1X - 0.5, wisp1Y - 0.5, 1, 1);

    ctx.restore();
  }

  // 10. Sakura Ether Butterfly (Stained-glass pink wings with animated flapping)
  private renderSakuraButterfly(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const flap = Math.abs(Math.cos(time * 0.35)); // 0 to 1 wing span

    ctx.save();
    // Glowing Abdomen
    ctx.fillStyle = '#831843';
    ctx.fillRect(-1, -4, 2, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -2, 1, 4);

    // Upper Wings (Scaled by flap horizontally)
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-8 * flap, -8, 8 * flap, 7);
    ctx.fillRect(0, -8, 8 * flap, 7);
    // Wing filigree highlights
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(-6 * flap, -7, 5 * flap, 4);
    ctx.fillRect(1 * flap, -7, 5 * flap, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4 * flap, -6, 2 * flap, 2);
    ctx.fillRect(2 * flap, -6, 2 * flap, 2);

    // Lower Wings
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-6 * flap, -1, 6 * flap, 6);
    ctx.fillRect(0, -1, 6 * flap, 6);

    // Delicate Antennae
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-2, -10, 1, 3);
    ctx.fillRect(1, -10, 1, 3);
    ctx.restore();
  }

  // ===========================================================================
  // ZONA 3: CAVERNAS DE FUEGO (MAGMA BEASTS, GOLEMS & INCANDESCENT FIRE)
  // ===========================================================================

  // 11. Magma Salamander (Obsidian-scaled volcanic reptile with flame spine)
  private renderMagmaSalamander(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const crawl = Math.sin(anim * 0.3) * 2;
    const tailSway = Math.sin(time * 0.25) * 2;

    // Crawling Claws
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-6 + crawl, 3, 3, 4);
    ctx.fillRect(3 - crawl, 3, 3, 4);
    ctx.fillRect(-3 - crawl, 3, 3, 4);
    ctx.fillRect(6 + crawl, 3, 3, 4);

    // Long Volcanic Tail with Flame Tip
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-10, 1 + tailSway, 5, 3);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-13, 0 + tailSway * 1.3, 4, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-15, 0 + tailSway * 1.6, 3, 2);

    // Basalt-Armored Low Torso
    ctx.fillStyle = '#292524';
    ctx.fillRect(-7, -2, 13, 6);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-6, -1, 11, 4);

    // Molten Magma Vein along Spine
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-5, -2, 9, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -2, 5, 1);

    // Spiky Flaming Crest on Back
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-4, -4, 2.5, 3);
    ctx.fillRect(-1, -5, 2.5, 4);
    ctx.fillRect(2, -4, 2.5, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-0.5, -4.5, 1.5, 2);

    // Reptilian Head & Snout
    ctx.fillStyle = '#451a03';
    ctx.fillRect(5, -3, 6, 5);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(6, -2, 4, 3);

    // Glowing Yellow Reptile Eye
    ctx.fillStyle = '#fde047';
    ctx.fillRect(7, -2, 2, 1.5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, -2, 1, 1.5);
  }

  // 12. Armored Basalt & Magma Golem (Massive stone colossus with molten core)
  private renderMagmaGolem(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const stomp = Math.sin(anim * 0.2) * 1.5;

    // Heavy Boulder Stone Legs
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-6 + stomp, 4, 5, 5);
    ctx.fillRect(1 - stomp, 4, 5, 5);
    ctx.fillStyle = '#292524';
    ctx.fillRect(-7 + stomp, 7, 6, 3);
    ctx.fillRect(0 - stomp, 7, 6, 3);

    // Massive Stone Shoulder Fist Gauntlets
    ctx.fillStyle = '#292524';
    ctx.fillRect(-9, -2 - stomp, 4, 8);
    ctx.fillRect(6, -2 + stomp, 4, 8);
    // Molten knuckles
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-9, 4 - stomp, 3, 2);
    ctx.fillRect(7, 4 + stomp, 3, 2);

    // Heavy Basalt Torso Slabs
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-7, -6, 14, 11);
    ctx.fillStyle = '#292524';
    ctx.fillRect(-6, -5, 12, 9);

    // Radiating Molten Magma Core Fissure
    const coreGlow = (Math.sin(time * 0.2) + 1) * 0.5;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-3, -2, 6, 6);
    ctx.fillStyle = coreGlow > 0.4 ? '#fde047' : '#f59e0b';
    ctx.fillRect(-2, -1, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, 0, 2, 2);

    // Head Unit with Glowing Coal Eyes
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-4, -9, 8, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, -8, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -7.5, 1.5, 1);

    // Volcanic Smoke Vents on Shoulders
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-7, -8, 2.5, 3);
    ctx.fillRect(5, -8, 2.5, 3);
    if (Math.floor(time) % 12 < 6) {
      ctx.fillStyle = '#78716c';
      ctx.fillRect(-7, -10, 2, 2);
    }
  }

  // 13. Flame Wisp (Multi-layered living fireball with revolving embers)
  private renderFlameWisp(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const flicker = Math.sin(time * 0.35) * 1.5;
    const rot = time * 0.15;

    ctx.save();
    // Outer Fire Halo
    ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 9 + flicker * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Medium Flame Body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Flickering Teardrop Flame Tip
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -9 + flicker);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();

    // White-Hot Incandescent Core
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -1, 2, 2);

    // Revolving Ember Motes
    for (let i = 0; i < 3; i++) {
      const a = rot + (i * Math.PI * 2) / 3;
      const ex = Math.cos(a) * 8;
      const ey = Math.sin(a) * 6;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(ex - 1, ey - 1, 2, 2);
    }
    ctx.restore();
  }

  // 14. Fire Hopper Imp (Gargoyle imp with curved horns & volcanic jump jets)
  private renderFireHopper(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const isAirborne = (e.vy || 0) !== 0;

    // Muscular Coiled Hind Legs
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-5, 2, 4, isAirborne ? 5 : 3);
    ctx.fillRect(1, 2, 4, isAirborne ? 5 : 3);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-6, isAirborne ? 6 : 4, 5, 2);
    ctx.fillRect(0, isAirborne ? 6 : 4, 5, 2);

    // Crimson Scaly Torso
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-6, -4, 11, 7);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-5, -3, 9, 5);

    // Curved Obsidian Horns
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-4, -9, 2.5, 4);
    ctx.fillRect(-6, -11, 3, 3);
    ctx.fillRect(1, -9, 2.5, 4);
    ctx.fillRect(3, -11, 3, 3);

    // Impish Head & Glowing Sulfurous Eyes
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-3, -7, 7, 5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -6, 3, 2);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(1, -5.5, 1, 1);

    // Sharp Bat-Wings / Spines on Back
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-8, -5, 3, 4);
  }

  // ===========================================================================
  // ZONA 4: SANTUARIO DEL DESIERTO (PHARAOH GUARDS, JEWELED SCARABS & ANUBIS)
  // ===========================================================================

  // 15. Jeweled Desert Scarab (Gold carapace with emerald gemstones & skittering legs)
  private renderJeweledScarab(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const legCycle = Math.sin(anim * 0.4);

    // 6 Articulated Skittering Insectoid Legs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-7 + legCycle * 1.5, 1, 3, 4);
    ctx.fillRect(-7 - legCycle * 1.5, 4, 3, 4);
    ctx.fillRect(5 + legCycle * 1.5, 1, 3, 4);
    ctx.fillRect(5 - legCycle * 1.5, 4, 3, 4);
    ctx.fillRect(-1 - legCycle * 1.5, 4, 3, 4);
    ctx.fillRect(2 + legCycle * 1.5, 4, 3, 4);

    // Heavy Golden-Bronze Carapace
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7, -4, 14, 7);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-6, -3, 12, 5);
    ctx.fillStyle = '#f59e0b'; // Gold wing case
    ctx.fillRect(-5, -2, 10, 3);

    // Inlaid Royal Emerald Gemstones
    ctx.fillStyle = '#059669';
    ctx.fillRect(-2, -2, 4, 3);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-1, -1.5, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -1, 1, 1);

    // Excavation Horns / Mandibles
    ctx.fillStyle = '#78350f';
    ctx.fillRect(5, -2, 4, 2);
    ctx.fillRect(7, -4, 2, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(8, -4, 1.5, 2);
  }

  // 16. Ancient Mummy Warrior (Ceremonial wraps, turquoise soul eyes & gold Khopesh)
  private renderMummyWarrior(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const walk = Math.sin(anim * 0.25) * 2;
    const wrapFlutter = Math.sin(time * 0.2) * 1.5;

    // Bandaged Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4 + walk, 3, 3, 5);
    ctx.fillRect(1 - walk, 3, 3, 5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4 + walk, 4, 3, 1.5);
    ctx.fillRect(1 - walk, 5.5, 3, 1.5);

    // Frayed Loose Bandages fluttering in the wind
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-7, 0 + wrapFlutter, 4, 1.5);
    ctx.fillRect(-9, 2 + wrapFlutter * 1.3, 3, 1.5);

    // Torso with Linen Wraps & Royal Golden Pectoral Collar
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-5, -4, 10, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -3, 8, 6);
    // Bandage crossing stripes
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-4, -2, 8, 1);
    ctx.fillRect(-4, 1, 8, 1);

    // Golden Pectoral Collar
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-4, -4, 8, 2);
    ctx.fillStyle = '#06b6d4'; // Turquoise center stone
    ctx.fillRect(-1, -3.5, 2, 1.5);

    // Head & Royal Nemes Headdress Stripes
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-3.5, -8, 7, 5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3, -7, 6, 4);

    // Burning Turquoise Soul-Fire Eyes
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(0, -6, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -5.5, 1.5, 1);

    // Curved Golden Khopesh Sickle-Sword
    ctx.fillStyle = '#facc15';
    ctx.fillRect(5, -6, 2, 7);
    ctx.fillRect(7, -8, 3, 3);
    ctx.fillRect(8, -10, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8.5, -9, 1, 2);
  }

  // 17. Sand Cobra / Serpent (Flared cobra hood with Eye of Horus & venom fangs)
  private renderSandCobra(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const undulate = Math.sin(anim * 0.3) * 1.5;
    const tongueFlick = Math.floor(time * 0.3) % 4 === 0;

    // Coiled Desert Snake Body
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, 3, 14, 5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-7, 4, 12, 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-6, 4.5, 10, 1.5);

    // Upright Neck & Flared Cobra Hood
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-3 + undulate * 0.5, -3, 6, 7);
    // Broad Flared Hood Wings
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-6 + undulate * 0.5, -5, 12, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-4 + undulate * 0.5, -4, 8, 3);

    // Sacred Eye of Horus Symbol on Hood
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-1.5 + undulate * 0.5, -3.5, 3, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-0.5 + undulate * 0.5, -3, 1, 1);

    // Serpent Head & Menacing Ruby Eyes
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0 + undulate, -8, 6, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(1 + undulate, -7, 4, 3);

    // Ruby Red Slit Eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2.5 + undulate, -6.5, 2, 1.5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(3 + undulate, -6.5, 1, 1.5);

    // Flickering Red Bifurcated Tongue
    if (tongueFlick) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6 + undulate, -5, 3, 1);
      ctx.fillRect(8 + undulate, -6, 1, 1);
      ctx.fillRect(8 + undulate, -4, 1, 1);
    }
  }

  // 18. Anubis Guardian Statue (Black basalt jackal colossus with Was-scepter)
  private renderAnubisStatue(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const idleGlow = Math.sin(time * 0.2) * 0.5 + 0.5;

    // Basalt Pedestal Legs
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-6, 3, 5, 5);
    ctx.fillRect(1, 3, 5, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-7, 6, 6, 2.5);
    ctx.fillRect(0, 6, 6, 2.5);

    // Polished Black Granite Torso
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-7, -4, 13, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -3, 11, 6);

    // Golden Royal Sash & Collar
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-7, -4, 13, 2);
    ctx.fillRect(-3, 0, 6, 2);
    ctx.fillStyle = '#c084fc'; // Amethyst jewel
    ctx.fillRect(-1, -3.5, 2, 1.5);

    // Sleek Jackal Head with Long Muzzle
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-4, -9, 10, 6);
    ctx.fillRect(4, -8, 4, 3); // Snout
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -8, 8, 4);

    // Tall Pointed Jackal Ears with Gold Trim
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-3, -14, 2.5, 6);
    ctx.fillRect(1, -14, 2.5, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-2.5, -13, 1.5, 4);
    ctx.fillRect(1.5, -13, 1.5, 4);

    // Glowing Amethyst Curse Eyes
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(1, -7.5, 3.5, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -7, 1.5, 1);

    // Tall Was-Scepter with Pulsing Curse Orb
    ctx.fillStyle = '#facc15';
    ctx.fillRect(7, -12, 2, 18);
    // Scepter Forked Base
    ctx.fillRect(6, 4, 4, 2);
    // Top Pulsing Orb
    ctx.fillStyle = idleGlow > 0.4 ? '#c084fc' : '#9333ea';
    ctx.beginPath();
    ctx.arc(8, -13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7.5, -13.5, 1.5, 1.5);
  }

  // 19. Desert Vulture (Raptor bird with realistic wing flapping & hooked beak)
  private renderDesertVulture(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const flap = Math.sin(time * 0.28);
    const wingAngle = flap * 4;

    ctx.save();
    // Dark Feathered Raptor Body
    ctx.fillStyle = '#3e2312';
    ctx.fillRect(-5, -3, 10, 6);
    ctx.fillStyle = '#5f370e';
    ctx.fillRect(-4, -2, 8, 4);

    // Tucked Talons
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, 3, 2.5, 2.5);
    ctx.fillRect(1, 3, 2.5, 2.5);

    // Broad Flapping Wings (Left & Right)
    ctx.fillStyle = '#271406';
    ctx.fillRect(-10, -5 + wingAngle, 6, 4);
    ctx.fillRect(4, -5 - wingAngle, 6, 4);
    // Sandy Feather Tips
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-12, -4 + wingAngle, 3, 3);
    ctx.fillRect(9, -4 - wingAngle, 3, 3);

    // Feathered Tail Fan
    ctx.fillStyle = '#3e2312';
    ctx.fillRect(-8, -1, 4, 3);

    // Vulture Head with Hooked Raptor Beak
    ctx.fillStyle = '#a16207';
    ctx.fillRect(3, -5, 4, 4);
    // Golden Hooked Beak
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(6, -4, 3, 2.5);
    ctx.fillRect(8, -3, 1.5, 2);

    // Piercing Red/Yellow Eye
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, -4.5, 1.5, 1.5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(4.5, -4.5, 1, 1);
    ctx.restore();
  }

  // ===========================================================================
  // ZONA 5: KRONO CITY METRÓPOLIS (CYBER ENFORCERS, DRONES, MECHS & WARHOUNDS)
  // ===========================================================================

  // 20. Tactical Cyber Drone (Autonomous quadcopter with spinning neon rotors & laser scanner)
  private renderCyberDrone(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const hoverBob = Math.sin(time * 0.22) * 1.5;
    const rotorSpin = Math.floor(time * 1.5) % 2 === 0;

    // Aerodynamic Carbon Chassis
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -4 + hoverBob, 12, 7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-5, -3 + hoverBob, 10, 5);

    // 4 Rotor Struts & Spinning Propellers
    ctx.fillStyle = '#334155';
    ctx.fillRect(-9, -6 + hoverBob, 4, 2);
    ctx.fillRect(5, -6 + hoverBob, 4, 2);

    // Spinning Blurred Rotor Discs (Cyan Neon)
    ctx.fillStyle = rotorSpin ? 'rgba(6, 182, 212, 0.8)' : 'rgba(34, 211, 238, 0.4)';
    ctx.fillRect(-11, -7 + hoverBob, 7, 1.5);
    ctx.fillRect(4, -7 + hoverBob, 7, 1.5);

    // Panoramic Glowing Cyan Scanning Visor with Sweep Line
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-1, -2 + hoverBob, 6, 3);
    const sweep = Math.floor((time * 0.4) % 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1 + sweep, -2 + hoverBob, 1.5, 3);

    // Underslung Dual Miniature Laser Blasters
    ctx.fillStyle = '#475569';
    ctx.fillRect(2, 2 + hoverBob, 4, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(5.5, 2.5 + hoverBob, 1.5, 1);
  }

  // 21. Automated Cyber Turret (Armored base with swiveling dual laser barrels)
  private renderCyberTurret(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;

    // Heavy Fortified Base with Hazard Stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7, 2, 14, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 3, 12, 4);
    // Yellow/Black Hazard Stripes
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-5, 4, 2, 3);
    ctx.fillRect(-1, 4, 2, 3);
    ctx.fillRect(3, 4, 2, 3);

    // Swiveling Armored Turret Dome
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -4, 10, 7);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-4, -3, 8, 5);

    // Heavy Dual Laser Barrels
    ctx.fillStyle = '#334155';
    ctx.fillRect(3, -3, 6, 2.5);
    ctx.fillRect(3, 0, 6, 2.5);

    // Glowing Laser Apertures & Targeting Diode
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(7.5, -2.5, 2, 1.5);
    ctx.fillRect(7.5, 0.5, 2, 1.5);

    // Red Aim Diode / Targeting Sensor
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, -5, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2.5, -4.5, 1, 1);
  }

  // 22. Cyber Warhound (High-speed robotic hound with glowing spine rail)
  private renderCyberHound(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const gallop = Math.sin(anim * 0.45) * 3;

    // 4 Articulated Hydraulic Sprinting Legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7 + gallop, 2, 3, 6);
    ctx.fillRect(-3 - gallop, 2, 3, 6);
    ctx.fillRect(2 + gallop, 2, 3, 6);
    ctx.fillRect(6 - gallop, 2, 3, 6);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-7 + gallop, 6, 3.5, 2);
    ctx.fillRect(6 - gallop, 6, 3.5, 2);

    // Sleek Titanium Warhound Chassis
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-8, -4, 15, 7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-7, -3, 13, 5);

    // Neon Spine Rail with Traveling Energy Pulse
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-7, -4.5, 12, 1.5);
    const pulsePos = Math.floor((time * 0.4) % 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7 + pulsePos, -5, 3, 2);

    // Predatory Robotic Head & Jaw
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -6, 7, 6);
    ctx.fillStyle = '#334155';
    ctx.fillRect(5, -5, 5, 4);

    // Razor-Sharp Optical Visor
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(7, -4.5, 3.5, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, -4.5, 1.5, 1);

    // Electric Shock Tines on Jaws
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(10, -3, 2, 1);
    ctx.fillRect(9, -1.5, 2, 1);
  }

  // 23. Elite Plasma Shock Trooper (Heavy exosuit armor, HUD visor & heavy plasma cannon)
  private renderPlasmaTrooper(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const march = Math.sin(anim * 0.22) * 2;

    // Heavy Ballistic Armored Greaves
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-5 + march, 3, 3.5, 5);
    ctx.fillRect(1 - march, 3, 3.5, 5);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-5.5 + march, 6, 4.5, 2);
    ctx.fillRect(0.5 - march, 6, 4.5, 2);

    // Heavy Tactical Exosuit Torso
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -5, 12, 9);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-5, -4, 10, 7);

    // Energy Shield Shoulder Pauldron
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-7, -6, 4, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, -4, 1.5, 2);

    // Back Capacitor Heatsink Pack
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -5, 3, 6);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-8, -3, 1.5, 3);

    // Helmet with HUD Tactical Visor
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-4, -9, 8, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, -7.5, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -7.5, 2, 1);

    // Heavy Plasma Assault Rifle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, -2, 8, 4);
    // Glowing plasma barrel
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(8, -1.5, 3, 2.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, -1, 1.5, 1.5);
  }

  // 24. Gravitational Distortion Singularity (Warped spacetime rings & lightning arcs)
  private renderGravityOrb(anim: number, time: number, e: Enemy) {
    const ctx = this.ctx;
    const rot = (e.angle || 0) + time * 0.08;

    ctx.save();
    // Dark Matter Event Horizon Glow
    ctx.fillStyle = 'rgba(88, 28, 135, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Spacetime Acceleration Rings
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4, rot, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 3.5, -rot * 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Singularity Core (Deep void with violet corona)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -1, 2, 2);

    // Spacetime Quantum Lightning Arc
    if (Math.floor(time) % 5 === 0) {
      const a = Math.random() * Math.PI * 2;
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.stroke();
    }
    ctx.restore();
  }
}
