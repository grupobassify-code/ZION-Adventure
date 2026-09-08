// =============================================================================
// ZION ADVENTURE - MASTERPIECE BOSS PIXEL ART RENDERER
// Complete handcrafted pixel-art rendering for all 5 boss guardians:
// 1. Guardián Neón MK-IV (Zone 1 - Neon Forest)
// 2. Maestra Kunoichi Rosa (Zone 2 - Sakura Forest)
// 3. Ignis, Coloso de Magma Primordial (Zone 3 - Fire Caverns)
// 4. Faraón Akhen'Ra, La Momia Eterna (Zone 4 - Ancient Temple)
// 5. Titán Mecánico Kronos-Ω (Zone 5 - Temporal Citadel Final Boss)
// Features multi-layer armor plates, reactive glowing optics, particle steam,
// animated weapons, combat auras, shield forcefields, and telegraph cues.
// =============================================================================

import { Boss } from '../types';
import { GAME_WIDTH } from './constants';

export class BossRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(boss: Boss | null, cameraX: number, time: number) {
    if (!boss || !boss.alive) return;
    const ctx = this.ctx;
    const x = Math.round(boss.x - cameraX);
    const y = Math.round(boss.y);

    // Invulnerability flashing when taking damage
    if (boss.inv > 0 && Math.floor(boss.inv / 3) % 2 === 0) return;

    // 1. Ground Shadow
    this.renderGroundShadow(boss, x, y, time);

    // 2. Boss Shield Forcefield (if active)
    if (boss.shield) {
      this.renderShieldForcefield(boss, x, y, time);
    }

    // 3. Phase 3 Boss Clones (Illusionary afterimages)
    if (boss.clones && boss.clones.length > 0) {
      this.renderClones(boss.clones, cameraX, time);
    }

    // 4. Boss Shockwaves
    if (boss.shockwaves && boss.shockwaves.length > 0) {
      this.renderShockwaves(boss.shockwaves, cameraX);
    }

    // 5. Laser Beam & Telegraph Warning
    this.renderLaserAndTelegraph(boss, x, y, cameraX, time);

    // 6. Thruster Flames (when jumping or slamming)
    if (boss.thrusterFlame && boss.thrusterFlame > 0) {
      this.renderThrusters(boss, x, y, time);
    }

    // 7. Render Handcrafted Pixel Art by Boss Type
    ctx.save();
    if (boss.name.includes('Guardián')) {
      this.renderGuardianNeon(boss, x, y, time);
    } else if (boss.name.includes('Kunoichi')) {
      this.renderKunoichiRosa(boss, x, y, time);
    } else if (boss.name.includes('Ignis')) {
      this.renderIgnisMagma(boss, x, y, time);
    } else if (boss.name.includes('Akhen') || boss.name.includes('Faraón') || boss.name.includes('Momia')) {
      this.renderAkhenRa(boss, x, y, time);
    } else if (boss.name.includes('Kronos')) {
      this.renderKronosOmega(boss, x, y, time);
    } else {
      // Fallback aesthetic mech
      this.renderGuardianNeon(boss, x, y, time);
    }
    ctx.restore();

    // 8. Staggered Dizzy Stars
    if (boss.isStaggered) {
      this.renderStaggerStars(boss, x, y, time);
    }

    // 9. Boss Top HUD Bar (HP, Stagger & Phase Indicator)
    this.renderBossHUD(boss, time);
  }

  // ---------------------------------------------------------------------------
  // GROUND SHADOW
  // ---------------------------------------------------------------------------
  private renderGroundShadow(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const shadowW = boss.w * 0.75;
    const shadowH = Math.max(3, boss.w * 0.2);
    const shadowY = y + boss.h + 1;
    const pulse = Math.sin(time * 0.1) * 1.5;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x + boss.w / 2, shadowY, shadowW / 2 + pulse, shadowH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // SHIELD FORCEFIELD (HEXAGONAL CYBER MATRIX)
  // ---------------------------------------------------------------------------
  private renderShieldForcefield(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const cx = x + boss.w / 2;
    const cy = y + boss.h / 2;
    const r = Math.max(boss.w, boss.h) * 0.65;
    const pulse = Math.sin(time * 0.18) * 2;

    ctx.save();
    // Outer atmospheric shield glow
    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r + pulse + 4);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
    grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.22)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.35)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Shield perimeter ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.lineDashOffset = -time * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hexagonal matrix accents
    for (let h = 0; h < 6; h++) {
      const angle = (h * Math.PI) / 3 + time * 0.05;
      const hx = cx + Math.cos(angle) * (r * 0.75);
      const hy = cy + Math.sin(angle) * (r * 0.75);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(Math.round(hx - 1.5), Math.round(hy - 1.5), 3, 3);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // BOSS CLONES (KUNOICHI ILLUSIONS)
  // ---------------------------------------------------------------------------
  private renderClones(clones: Boss['clones'], cameraX: number, time: number) {
    if (!clones) return;
    const ctx = this.ctx;
    for (const clone of clones) {
      const cx = Math.round(clone.x - cameraX);
      const cy = Math.round(clone.y);
      ctx.save();
      ctx.globalAlpha = clone.alpha * 0.65;

      // Hologram ghost silhouette
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(cx + 4, cy + 4, clone.w - 8, clone.h - 8);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(cx + 6, cy + 2, clone.w - 12, 6);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(cx + 2, cy + 8, 4, clone.h - 12);
      ctx.fillRect(cx + clone.w - 6, cy + 8, 4, clone.h - 12);

      // Shimmer scanline
      const scanY = cy + (Math.floor(time * 2) % clone.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx, scanY, clone.w, 1);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // SHOCKWAVES
  // ---------------------------------------------------------------------------
  private renderShockwaves(shockwaves: Boss['shockwaves'], cameraX: number) {
    const ctx = this.ctx;
    for (const sw of shockwaves) {
      const swX = Math.round(sw.x - cameraX);
      ctx.save();
      ctx.fillStyle = sw.color || '#38bdf8';
      ctx.fillRect(swX, sw.y, sw.w, sw.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(swX + 2, sw.y + 1, sw.w - 4, Math.max(1, sw.h - 2));
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // LASER BEAM & TELEGRAPH WARNING
  // ---------------------------------------------------------------------------
  private renderLaserAndTelegraph(boss: Boss, x: number, y: number, cameraX: number, time: number) {
    const ctx = this.ctx;

    // Laser active
    if (boss.laser && boss.laser.active) {
      const l = boss.laser;
      const lx = Math.round(l.x - cameraX);
      ctx.save();
      // Outer beam bloom
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.fillRect(lx, l.y - 5, l.length, l.thickness + 10);
      // Secondary aura
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(lx, l.y - 2, l.length, l.thickness + 4);
      // Core beam
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(lx, l.y, l.length, l.thickness);
      // White-hot plasma laser center
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx, l.y + Math.floor(l.thickness / 3), l.length, Math.max(2, Math.floor(l.thickness / 3)));
      ctx.restore();
    }

    // Laser charging warning telegraph line
    if (boss.state === 'charging' && (boss.name.includes('Guardián') || boss.name.includes('Kronos'))) {
      const lx = Math.round(boss.x - cameraX);
      const isRight = boss.facing > 0;
      const startX = lx + (isRight ? boss.w : 0);
      const targetX = startX + (isRight ? 320 : -320);

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 2;
      ctx.beginPath();
      ctx.moveTo(startX, y + Math.floor(boss.h * 0.35));
      ctx.lineTo(targetX, y + Math.floor(boss.h * 0.35));
      ctx.stroke();

      // Laser charge sparks at emitter muzzle
      const sparkPulse = Math.sin(time * 0.4) * 3 + 4;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(startX, y + Math.floor(boss.h * 0.35), sparkPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX - 1, y + Math.floor(boss.h * 0.35) - 1, 2, 2);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // THRUSTER FLAMES
  // ---------------------------------------------------------------------------
  private renderThrusters(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isIgnis = boss.name.includes('Ignis');
    const colorOuter = isIgnis ? '#ea580c' : '#06b6d4';
    const colorMid = isIgnis ? '#f97316' : '#22d3ee';
    const flameL = 8 + Math.floor(Math.sin(time * 0.6) * 3);

    ctx.save();
    // Left thruster
    ctx.fillStyle = colorOuter;
    ctx.fillRect(x + 4, y + boss.h, 6, flameL);
    ctx.fillStyle = colorMid;
    ctx.fillRect(x + 5, y + boss.h, 4, flameL - 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + boss.h, 2, flameL - 4);

    // Right thruster
    ctx.fillStyle = colorOuter;
    ctx.fillRect(x + boss.w - 10, y + boss.h, 6, flameL);
    ctx.fillStyle = colorMid;
    ctx.fillRect(x + boss.w - 9, y + boss.h, 4, flameL - 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + boss.w - 8, y + boss.h, 2, flameL - 4);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 1. GUARDIÁN NEÓN MK-IV (ZONE 1 BOSS)
  // Handcrafted Heavy Autonomous Combat Sentinel
  // ---------------------------------------------------------------------------
  private renderGuardianNeon(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isFacingLeft = boss.facing < 0;
    const eyeColor = boss.phase === 3 ? '#ef4444' : boss.phase === 2 ? '#f59e0b' : '#22d3ee';
    const coreColor = boss.phase === 3 ? '#dc2626' : boss.phase === 2 ? '#ea580c' : '#0891b2';
    const armorBase = '#090d16';
    const armorPlate = '#1e293b';
    const armorHighlight = '#334155';
    const neonCyan = '#06b6d4';
    const neonBright = '#22d3ee';

    // Idle hydraulic breathing
    const bob = Math.floor(Math.sin(time * 0.12) * 1.5);

    ctx.save();
    // A. Main Torso Exoskeleton
    ctx.fillStyle = armorBase;
    ctx.fillRect(x + 2, y + 6 + bob, boss.w - 4, boss.h - 8);

    // Armor plating segments
    ctx.fillStyle = armorPlate;
    ctx.fillRect(x + 3, y + 8 + bob, boss.w - 6, boss.h - 12);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(x + 4, y + 8 + bob, boss.w - 8, 3); // Upper chest ridge
    ctx.fillRect(x + 4, y + boss.h - 7 + bob, boss.w - 8, 2); // Abdominal plating

    // B. Glowing Energy Reactor Core (Center of Chest)
    const corePulse = 0.7 + Math.sin(time * 0.25) * 0.3;
    ctx.fillStyle = coreColor;
    ctx.fillRect(x + 6, y + 13 + bob, boss.w - 12, 9);
    ctx.fillStyle = eyeColor;
    ctx.fillRect(x + 7, y + 14 + bob, boss.w - 14, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + boss.w / 2 - 2, y + 16 + bob, 4, 3); // White-hot reactor core

    // Reactive Chevron Hazard Trims
    ctx.fillStyle = neonCyan;
    ctx.fillRect(x + 4, y + 7 + bob, 2, 8);
    ctx.fillRect(x + boss.w - 6, y + 7 + bob, 2, 8);

    // C. Heavy Armored Head & Cyclops Optical Visor
    ctx.fillStyle = armorBase;
    ctx.fillRect(x + 5, y + bob, boss.w - 10, 7);
    ctx.fillStyle = armorPlate;
    ctx.fillRect(x + 6, y + 1 + bob, boss.w - 12, 5);

    // Heavy Forehead Crest
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(x + 7, y + bob, boss.w - 14, 2);
    ctx.fillStyle = neonBright;
    ctx.fillRect(x + boss.w / 2 - 1, y - 2 + bob, 2, 3); // Sensor antenna

    // Cyclops Optic Slit (Moves with facing)
    const eyeOffset = isFacingLeft ? 7 : boss.w - 13;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(x + eyeOffset, y + 3 + bob, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + eyeOffset + (isFacingLeft ? 1 : 3), y + 3 + bob, 2, 2); // Pupil spark

    // D. Shoulder Rocket Launchers / Armor Pauldrons
    ctx.fillStyle = armorPlate;
    ctx.fillRect(x - 3, y + 4 + bob, 6, 8); // Left shoulder
    ctx.fillRect(x + boss.w - 3, y + 4 + bob, 6, 8); // Right shoulder
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(x - 3, y + 4 + bob, 6, 2);
    ctx.fillRect(x + boss.w - 3, y + 4 + bob, 6, 2);

    // Pauldron Neon Edge
    ctx.fillStyle = neonCyan;
    ctx.fillRect(x - 3, y + 11 + bob, 6, 1);
    ctx.fillRect(x + boss.w - 3, y + 11 + bob, 6, 1);

    // E. Heavy Hydraulic Fist Cannons
    const armX = isFacingLeft ? x - 4 : x + boss.w - 4;
    const armOtherX = isFacingLeft ? x + boss.w - 2 : x - 6;

    // Rear arm
    ctx.fillStyle = armorBase;
    ctx.fillRect(armOtherX, y + 10 + bob, 6, 14);
    ctx.fillStyle = armorPlate;
    ctx.fillRect(armOtherX + 1, y + 12 + bob, 4, 10);

    // Front arm (plasma cannon fist)
    ctx.fillStyle = armorPlate;
    ctx.fillRect(armX, y + 11 + bob, 8, 15);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(armX + (isFacingLeft ? 0 : 4), y + 13 + bob, 4, 11);
    // Plasma Cannon Muzzle
    ctx.fillStyle = eyeColor;
    ctx.fillRect(armX + (isFacingLeft ? -2 : 6), y + 18 + bob, 3, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(armX + (isFacingLeft ? -1 : 7), y + 19 + bob, 1, 3);

    // F. Reinforced Tread / Cyber Piston Legs
    ctx.fillStyle = armorBase;
    ctx.fillRect(x + 4, y + boss.h - 4 + bob, 5, 5);
    ctx.fillRect(x + boss.w - 9, y + boss.h - 4 + bob, 5, 5);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(x + 3, y + boss.h - 1 + bob, 7, 2); // Left footpad
    ctx.fillRect(x + boss.w - 10, y + boss.h - 1 + bob, 7, 2); // Right footpad
    ctx.fillStyle = neonCyan;
    ctx.fillRect(x + 4, y + boss.h + bob, 5, 1);
    ctx.fillRect(x + boss.w - 9, y + boss.h + bob, 5, 1);

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2. MAESTRA KUNOICHI ROSA (ZONE 2 BOSS)
  // Handcrafted Master Shinobi with Flowing Sakura Haori & Dual Plasma Ninjato
  // ---------------------------------------------------------------------------
  private renderKunoichiRosa(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isFacingLeft = boss.facing < 0;
    const bob = Math.floor(Math.sin(time * 0.16) * 1.5);

    ctx.save();
    // A. Flowing Sakura Scarf Physics (Windblown behind kunoichi)
    const scarfSegments = 6;
    for (let i = scarfSegments; i >= 1; i--) {
      const wave = Math.sin(time * 0.35 - i * 0.7) * 3;
      const sx = isFacingLeft ? x + boss.w + (i * 3.5) - 2 : x - (i * 3.5) - 3;
      const sy = y + 4 + bob + wave;
      const sw = Math.max(2, 6 - i * 0.6);
      const sh = Math.max(2, 4 - i * 0.4);

      ctx.fillStyle = i % 2 === 0 ? '#f43f5e' : '#fb7185';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), Math.ceil(sh));
      ctx.fillStyle = '#fecdd3';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), 1);
    }

    // B. Athletic Shinobi Undersuit & Violet Armor Plating
    ctx.fillStyle = '#0f172a'; // Stealth undersuit
    ctx.fillRect(x + 5, y + 8 + bob, 14, 18);

    // Kunoichi Crimson/Rose Haori Overgarment
    ctx.fillStyle = '#831843';
    ctx.fillRect(x + 4, y + 9 + bob, 16, 14);
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x + 6, y + 10 + bob, 12, 12);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 8, y + 10 + bob, 8, 10); // Rose silk lapels

    // Golden Obi Belt & Cherry Blossom Crest
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 4, y + 17 + bob, 16, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 10, y + 17 + bob, 4, 3); // White sakura blossom knot

    // C. Kitsune Mask & Violet Shinobi Cowl
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 6, y + bob, 12, 8); // Head base

    // Porcelain Kitsune Battle Mask
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + (isFacingLeft ? 5 : 9), y + 1 + bob, 10, 7);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + (isFacingLeft ? 6 : 10), y + 5 + bob, 8, 3);

    // Crimson Fox Whiskers on Mask
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(x + (isFacingLeft ? 5 : 15), y + 4 + bob, 3, 1);
    ctx.fillRect(x + (isFacingLeft ? 5 : 15), y + 6 + bob, 3, 1);

    // Slit Optic Eyes (Glowing Ruby)
    const eyeX = isFacingLeft ? x + 7 : x + 13;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(eyeX, y + 3 + bob, 3, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX + (isFacingLeft ? 0 : 1), y + 3 + bob, 1, 1);

    // Kitsune Mask Pointed Fox Ears
    ctx.fillStyle = '#831843';
    ctx.fillRect(x + 7, y - 3 + bob, 3, 4);
    ctx.fillRect(x + 14, y - 3 + bob, 3, 4);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 8, y - 2 + bob, 1, 2);
    ctx.fillRect(x + 15, y - 2 + bob, 1, 2);

    // D. Dual High-Frequency Plasma Ninjato Blades
    const sword1X = isFacingLeft ? x - 4 : x + boss.w + 2;
    const sword2X = isFacingLeft ? x + boss.w - 2 : x - 6;

    // Blade 1 (Raised Guard)
    ctx.fillStyle = '#475569';
    ctx.fillRect(sword1X, y + 6 + bob, 2, 4); // Hilt
    ctx.fillStyle = '#facc15';
    ctx.fillRect(sword1X - 1, y + 5 + bob, 4, 2); // Tsuba guard
    // Plasma Edge (Rose/Cyan)
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(sword1X, y - 10 + bob, 2, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sword1X + (isFacingLeft ? 0 : 1), y - 8 + bob, 1, 13); // Sharp core

    // Blade 2 (Reverse Low Grip)
    ctx.fillStyle = '#475569';
    ctx.fillRect(sword2X, y + 14 + bob, 2, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(sword2X - 1, y + 13 + bob, 4, 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(sword2X, y + 17 + bob, 2, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sword2X, y + 18 + bob, 1, 10);

    // E. Ninja Tabi Boots & Dynamic Stance
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 6, y + 24 + bob, 4, 6);
    ctx.fillRect(x + 14, y + 24 + bob, 4, 6);
    ctx.fillStyle = '#831843';
    ctx.fillRect(x + 6, y + 25 + bob, 4, 2); // Shin guards
    ctx.fillRect(x + 14, y + 25 + bob, 4, 2);
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(x + (isFacingLeft ? 5 : 6), y + 28 + bob, 5, 2); // Tabi footpad
    ctx.fillRect(x + (isFacingLeft ? 13 : 14), y + 28 + bob, 5, 2);

    // F. Swirling Sakura Petals (Phase 2 & 3 aura)
    if (boss.phase >= 2) {
      for (let p = 0; p < 5; p++) {
        const pAngle = time * 0.2 + (p * Math.PI * 2) / 5;
        const px = x + boss.w / 2 + Math.cos(pAngle) * 18;
        const py = y + boss.h / 2 + Math.sin(pAngle) * 14;
        ctx.fillStyle = p % 2 === 0 ? '#fecdd3' : '#fb7185';
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 3. IGNIS, COLOSO DE MAGMA PRIMORDIAL (ZONE 3 BOSS)
  // Handcrafted Volcanic Basalt Titan with Blazing Molten Core & Fumarole Chimneys
  // ---------------------------------------------------------------------------
  private renderIgnisMagma(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isFacingLeft = boss.facing < 0;
    const bob = Math.floor(Math.sin(time * 0.1) * 1.2);
    const coreColor = boss.phase === 3 ? '#fef08a' : boss.phase === 2 ? '#f97316' : '#ea580c';

    ctx.save();
    // A. Massive Obsidian Basalt Torso
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(x + 2, y + 6 + bob, boss.w - 4, boss.h - 6);
    ctx.fillStyle = '#1c0a0a';
    ctx.fillRect(x + 4, y + 8 + bob, boss.w - 8, boss.h - 10);

    // B. Churning Molten Magma Core (Behind Armor Ribs)
    const heatGlow = Math.sin(time * 0.2) * 0.25 + 0.75;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x + 6, y + 11 + bob, boss.w - 12, boss.h - 18);
    ctx.fillStyle = coreColor;
    ctx.fillRect(x + 7, y + 12 + bob, boss.w - 14, boss.h - 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + boss.w / 2 - 2, y + 16 + bob, 5, 5); // White-hot lava core

    // Basalt Ribs over Core
    ctx.fillStyle = '#1c0a0a';
    ctx.fillRect(x + 5, y + 14 + bob, boss.w - 10, 2);
    ctx.fillRect(x + 5, y + 19 + bob, boss.w - 10, 2);

    // Glowing Magma Fissures across Basalt Skin
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 4, y + 9 + bob, 3, 2);
    ctx.fillRect(x + boss.w - 7, y + 10 + bob, 3, 2);
    ctx.fillRect(x + 5, y + 25 + bob, 4, 1);
    ctx.fillRect(x + boss.w - 9, y + 25 + bob, 4, 1);

    // C. Obsidian Horned Skull & Brimstone Eyes
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(x + 5, y + bob, boss.w - 10, 8);
    ctx.fillStyle = '#1c0a0a';
    ctx.fillRect(x + 6, y + 1 + bob, boss.w - 12, 6);

    // Volcanic Horns
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(x + 3, y - 4 + bob, 4, 6); // Left horn
    ctx.fillRect(x + boss.w - 7, y - 4 + bob, 4, 6); // Right horn
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x + 4, y - 3 + bob, 2, 2); // Glowing horn tip
    ctx.fillRect(x + boss.w - 6, y - 3 + bob, 2, 2);

    // Glowing Brimstone Eyes
    const eyeOffset = isFacingLeft ? 7 : boss.w - 12;
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + eyeOffset, y + 3 + bob, 5, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + eyeOffset + (isFacingLeft ? 1 : 3), y + 3 + bob, 2, 2);

    // D. Shoulder Fumarole Chimneys & Smoke Puffs
    ctx.fillStyle = '#291010';
    ctx.fillRect(x - 2, y + 4 + bob, 6, 8); // Left chimney
    ctx.fillRect(x + boss.w - 4, y + 4 + bob, 6, 8); // Right chimney
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x - 1, y + 3 + bob, 4, 2); // Molten rim
    ctx.fillRect(x + boss.w - 3, y + 3 + bob, 4, 2);

    // Smoke / Ember sparks from chimneys
    const smokeY1 = y - 2 + Math.sin(time * 0.3) * 2;
    const smokeY2 = y - 4 + Math.cos(time * 0.25) * 2;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x, smokeY1 + bob, 2, 2);
    ctx.fillRect(x + boss.w - 2, smokeY2 + bob, 2, 2);

    // E. Colossal Magma Boulder Fists
    const fistX = isFacingLeft ? x - 6 : x + boss.w - 2;
    const fistOtherX = isFacingLeft ? x + boss.w - 1 : x - 7;

    // Front Fist
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(fistX, y + 12 + bob, 8, 16);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(fistX + 1, y + 14 + bob, 6, 12);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(fistX + (isFacingLeft ? 0 : 4), y + 17 + bob, 3, 7); // Molten knuckles
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(fistX + (isFacingLeft ? 1 : 5), y + 19 + bob, 1, 3);

    // Rear Fist
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(fistOtherX, y + 10 + bob, 7, 14);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(fistOtherX + 1, y + 12 + bob, 5, 10);

    // F. Heavy Volcanic Pillar Legs
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(x + 4, y + boss.h - 4 + bob, 7, 5);
    ctx.fillRect(x + boss.w - 11, y + boss.h - 4 + bob, 7, 5);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x + 5, y + boss.h - 1 + bob, 5, 2); // Basalt lava boots
    ctx.fillRect(x + boss.w - 10, y + boss.h - 1 + bob, 5, 2);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 4. FARAÓN AKHEN'RA, LA MOMIA ETERNA (ZONE 4 BOSS)
  // Handcrafted Ancient Pharaoh God-Mummy with Royal Nemes, Cobra Crown & Scepters
  // ---------------------------------------------------------------------------
  private renderAkhenRa(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isFacingLeft = boss.facing < 0;
    const bob = Math.floor(Math.sin(time * 0.14) * 1.5);

    ctx.save();
    // A. Swirling Desert Sandstorm Aura (Phase 2 & 3)
    if (boss.phase >= 2) {
      for (let s = 0; s < 6; s++) {
        const sAngle = time * 0.22 + (s * Math.PI) / 3;
        const sx = x + boss.w / 2 + Math.cos(sAngle) * 22;
        const sy = y + boss.h / 2 + Math.sin(sAngle) * 18;
        ctx.fillStyle = s % 2 === 0 ? '#f59e0b' : '#fde68a';
        ctx.fillRect(Math.round(sx), Math.round(sy), 3, 2);
      }
    }

    // B. Ancient Bandaged Mummy Body & Golden Chest Armor
    ctx.fillStyle = '#451a03'; // Ancient dry linen wrap base
    ctx.fillRect(x + 3, y + 8 + bob, boss.w - 6, boss.h - 10);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 4, y + 9 + bob, boss.w - 8, boss.h - 12);

    // Detailed Mummy Bandages
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 5, y + 10 + bob, boss.w - 10, 3);
    ctx.fillRect(x + 4, y + 16 + bob, boss.w - 8, 3);
    ctx.fillRect(x + 5, y + 22 + bob, boss.w - 10, 3);

    // Royal Golden Pectoral Collar (Usekh)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 4, y + 8 + bob, boss.w - 8, 5);
    ctx.fillStyle = '#0284c7'; // Lapis-lazuli gemstones
    ctx.fillRect(x + 6, y + 9 + bob, 3, 3);
    ctx.fillRect(x + boss.w - 9, y + 9 + bob, 3, 3);
    ctx.fillStyle = '#ef4444'; // Carnelian center jewel
    ctx.fillRect(x + boss.w / 2 - 1, y + 9 + bob, 3, 3);

    // Golden Ankh Amulet on Belt
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 4, y + 19 + bob, boss.w - 8, 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + boss.w / 2 - 2, y + 19 + bob, 4, 4);

    // C. Royal Nemes Headdress (Gold and Lapis Lazuli Striped Headdress)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 2, y - 1 + bob, boss.w - 4, 10);
    // Lapis Lazuli Stripes
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 4, y + 1 + bob, 3, 8);
    ctx.fillRect(x + boss.w - 7, y + 1 + bob, 3, 8);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 2, y + 5 + bob, 2, 6); // Hanging Nemes lappets
    ctx.fillRect(x + boss.w - 4, y + 5 + bob, 2, 6);

    // Golden Uraeus Cobra on Forehead
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + boss.w / 2 - 1, y - 5 + bob, 3, 5);
    ctx.fillStyle = '#ef4444'; // Cobra hood & ruby eye
    ctx.fillRect(x + boss.w / 2 - 2, y - 4 + bob, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + boss.w / 2, y - 4 + bob, 1, 1);

    // Ancient Golden Death Mask & Spectral Turquoise Eyes
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 6, y + 3 + bob, boss.w - 12, 6);
    // Spectral Glowing Eyes
    const eyeOffset = isFacingLeft ? 7 : boss.w - 11;
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x + eyeOffset, y + 4 + bob, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + eyeOffset + (isFacingLeft ? 1 : 2), y + 4 + bob, 1, 1);

    // D. Sacred Royal Regalia: Golden Crook & Solar Flail
    const scepterX = isFacingLeft ? x - 4 : x + boss.w;
    const flailX = isFacingLeft ? x + boss.w - 2 : x - 6;

    // Scepter (Crook)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(scepterX, y + 2 + bob, 3, 26);
    ctx.fillRect(scepterX - (isFacingLeft ? 3 : 0), y + 2 + bob, 6, 3); // Curved crook hook
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(scepterX + 1, y + 8 + bob, 1, 16);

    // Flail (Solar whip)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(flailX, y + 8 + bob, 3, 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(flailX - 1, y + 20 + bob, 5, 8); // Golden beads

    // E. Mummy Leg Wraps
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 5, y + boss.h - 4 + bob, 6, 5);
    ctx.fillRect(x + boss.w - 11, y + boss.h - 4 + bob, 6, 5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 5, y + boss.h - 2 + bob, 6, 2);
    ctx.fillRect(x + boss.w - 11, y + boss.h - 2 + bob, 6, 2);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 5. TITÁN MECÁNICO KRONOS-Ω (ZONE 5 FINAL BOSS)
  // Handcrafted Monumental Chronos Mech Titan with Rotating Gear Core & Holographic Wings
  // ---------------------------------------------------------------------------
  private renderKronosOmega(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isOverheated = boss.state === 'overheat';
    const isFacingLeft = boss.facing < 0;
    const bob = Math.floor(Math.sin(time * 0.12) * 1.5);

    ctx.save();
    // A. Phase 3: Grand Chrono-Temporal Hologram Wings
    if (boss.phase === 3) {
      for (let w = 0; w < 3; w++) {
        const wingSpread = 24 + w * 12;
        const wingFlap = Math.sin(time * 0.18 + w * 0.8) * 5;
        const wingAlpha = 0.45 - w * 0.08;

        ctx.fillStyle = w % 2 === 0 ? `rgba(6, 182, 212, ${wingAlpha})` : `rgba(168, 85, 247, ${wingAlpha})`;
        // Left Wing Shard
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 18 + bob);
        ctx.lineTo(x - wingSpread, y - 10 + wingFlap + bob);
        ctx.lineTo(x - wingSpread + 10, y + 14 + wingFlap + bob);
        ctx.fill();

        // Right Wing Shard
        ctx.beginPath();
        ctx.moveTo(x + boss.w - 12, y + 18 + bob);
        ctx.lineTo(x + boss.w + wingSpread, y - 10 + wingFlap + bob);
        ctx.lineTo(x + boss.w + wingSpread - 10, y + 14 + wingFlap + bob);
        ctx.fill();
      }
    }

    // B. Monumental Armored Exoskeleton (Heavy Titanium & Gold Accents)
    const baseColor = isOverheated ? '#3f1d1d' : '#090d16';
    const plateColor = isOverheated ? '#7f1d1d' : '#1e293b';
    const ridgeColor = isOverheated ? '#ea580c' : '#334155';
    const goldTrim = '#f59e0b';

    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 4, y + 10 + bob, boss.w - 8, boss.h - 12);
    ctx.fillStyle = plateColor;
    ctx.fillRect(x + 6, y + 12 + bob, boss.w - 12, boss.h - 16);

    // Titanium Armor Ridges
    ctx.fillStyle = ridgeColor;
    ctx.fillRect(x + 8, y + 12 + bob, boss.w - 16, 4);
    ctx.fillRect(x + 8, y + boss.h - 10 + bob, boss.w - 16, 3);

    // C. Chrono-Quantum Reactor Core (Rotating Clock Gear Core)
    const corePulse = Math.sin(time * (isOverheated ? 0.5 : 0.2)) * 0.4 + 0.6;
    const coreColor = isOverheated
      ? '#ea580c'
      : boss.phase === 3
      ? '#c084fc'
      : boss.phase === 2
      ? '#38bdf8'
      : '#06b6d4';

    const cx = x + boss.w / 2;
    const cy = y + 26 + bob;

    // Core housing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 10, cy - 10, 20, 20);
    ctx.fillStyle = coreColor;
    ctx.fillRect(cx - 8, cy - 8, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, cy - 3, 6, 6); // Singularity core

    // Orbiting Chrono Light Rings & Gear Cogs
    ctx.strokeStyle = isOverheated ? '#facc15' : '#67e8f9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 9, time * 0.08, 0, Math.PI * 2);
    ctx.stroke();

    // Four Gear Teeth on Housing
    ctx.fillStyle = goldTrim;
    ctx.fillRect(cx - 11, cy - 2, 2, 4);
    ctx.fillRect(cx + 9, cy - 2, 2, 4);
    ctx.fillRect(cx - 2, cy - 11, 4, 2);
    ctx.fillRect(cx - 2, cy + 9, 4, 2);

    // D. Heavy Mecha Head & Dual Visor Array
    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 12, y + bob, boss.w - 24, 12);
    ctx.fillStyle = plateColor;
    ctx.fillRect(x + 14, y + 2 + bob, boss.w - 28, 8);

    // Mecha Crown Antenna Crest
    ctx.fillStyle = goldTrim;
    ctx.fillRect(cx - 4, y - 6 + bob, 8, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 1, y - 8 + bob, 2, 3); // Signal mast

    // Glowing Optical Visor (Twin Angular Visors)
    const eyeColor = isOverheated ? '#facc15' : boss.phase === 3 ? '#a855f7' : '#22d3ee';
    const eyeX = isFacingLeft ? x + 16 : x + boss.w - 26;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(eyeX, y + 5 + bob, 10, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX + (isFacingLeft ? 2 : 5), y + 5 + bob, 3, 2);

    // E. Heavy Twin Shoulder Missile Racks / Thruster Pods
    ctx.fillStyle = plateColor;
    ctx.fillRect(x - 4, y + 4 + bob, 10, 14); // Left pod
    ctx.fillRect(x + boss.w - 6, y + 4 + bob, 10, 14); // Right pod
    ctx.fillStyle = ridgeColor;
    ctx.fillRect(x - 4, y + 4 + bob, 10, 3);
    ctx.fillRect(x + boss.w - 6, y + 4 + bob, 10, 3);

    // Missile Tubes (Open warning glow during barrage)
    const tubeGlow = boss.state === 'missileBarrage' ? '#ea580c' : '#334155';
    ctx.fillStyle = tubeGlow;
    ctx.fillRect(x - 2, y + 8 + bob, 3, 3);
    ctx.fillRect(x + 2, y + 8 + bob, 3, 3);
    ctx.fillRect(x + boss.w - 4, y + 8 + bob, 3, 3);
    ctx.fillRect(x + boss.w, y + 8 + bob, 3, 3);

    // F. Massive Articulated Hydraulic Pincer Cannon Arms
    const armX = isFacingLeft ? x - 10 : x + boss.w - 4;
    const armOtherX = isFacingLeft ? x + boss.w - 2 : x - 12;

    // Front Cannon Arm
    ctx.fillStyle = plateColor;
    ctx.fillRect(armX, y + 16 + bob, 14, 24);
    ctx.fillStyle = ridgeColor;
    ctx.fillRect(armX + 2, y + 18 + bob, 10, 18);
    // Double Barrel Chrono-Beam
    ctx.fillStyle = isOverheated ? '#ea580c' : '#0891b2';
    ctx.fillRect(armX + (isFacingLeft ? -4 : 10), y + 26 + bob, 6, 12);
    ctx.fillStyle = eyeColor;
    ctx.fillRect(armX + (isFacingLeft ? -3 : 11), y + 28 + bob, 4, 3);
    ctx.fillRect(armX + (isFacingLeft ? -3 : 11), y + 33 + bob, 4, 3);

    // Rear Arm
    ctx.fillStyle = baseColor;
    ctx.fillRect(armOtherX, y + 14 + bob, 12, 22);

    // G. Heavy Quad-Piston Legs & Ground Tread Stabilizers
    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 8, y + boss.h - 6 + bob, 10, 7);
    ctx.fillRect(x + boss.w - 18, y + boss.h - 6 + bob, 10, 7);
    ctx.fillStyle = ridgeColor;
    ctx.fillRect(x + 6, y + boss.h - 2 + bob, 14, 4); // Left tread
    ctx.fillRect(x + boss.w - 20, y + boss.h - 2 + bob, 14, 4); // Right tread
    ctx.fillStyle = isOverheated ? '#facc15' : '#06b6d4';
    ctx.fillRect(x + 8, y + boss.h + bob, 10, 1);
    ctx.fillRect(x + boss.w - 18, y + boss.h + bob, 10, 1);

    // Overheat warning vents
    if (isOverheated) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(x + 8, y + boss.h - 8 + bob, boss.w - 16, 2);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // STAGGER STARS (DIZZY ORBIT)
  // ---------------------------------------------------------------------------
  private renderStaggerStars(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    for (let s = 0; s < 4; s++) {
      const angle = time * 0.15 + (s * Math.PI) / 2;
      const starX = x + boss.w / 2 + Math.cos(angle) * (boss.w * 0.6);
      const starY = y - 8 + Math.sin(angle) * 6;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(Math.round(starX - 2), Math.round(starY - 2), 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(starX - 1), Math.round(starY - 1), 2, 2);
    }
  }

  // ---------------------------------------------------------------------------
  // BOSS TOP HUD BAR
  // ---------------------------------------------------------------------------
  private renderBossHUD(boss: Boss, time: number) {
    const ctx = this.ctx;
    const hpW = 110;
    const hpH = 6;
    const hpX = Math.round((GAME_WIDTH - hpW) / 2);
    const hpY = 14;

    ctx.save();
    // HP Bar Frame with metallic bevel
    ctx.fillStyle = '#090d16';
    ctx.fillRect(hpX - 2, hpY - 2, hpW + 4, hpH + 4);

    // HP Bar Fill with multi-stage gradient
    const hpRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
    const barFillW = Math.round(hpRatio * hpW);

    if (boss.shield) {
      // Blue Energy Shield
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(hpX, hpY, barFillW, hpH);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hpX, hpY, barFillW, 2);
    } else {
      // Health Fill: Crimson to Coral
      const isLow = hpRatio < 0.25;
      const barColor = isLow && Math.floor(time / 10) % 2 === 0 ? '#fbbf24' : '#ef4444';
      ctx.fillStyle = barColor;
      ctx.fillRect(hpX, hpY, barFillW, hpH);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(hpX, hpY, barFillW, 2); // Highlight line
    }

    // Outer border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpX - 1.5, hpY - 1.5, hpW + 3, hpH + 3);

    // Posture / Stagger Bar directly underneath
    const stagH = 3;
    const stagY = hpY + hpH + 3;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(hpX - 1, stagY - 1, hpW + 2, stagH + 2);
    ctx.fillStyle = boss.isStaggered ? '#facc15' : '#eab308';
    const stagRatio = Math.min(1, boss.stagger / boss.maxStagger);
    ctx.fillRect(hpX, stagY, Math.round(stagRatio * hpW), stagH);

    // Boss Name & Phase Label
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${boss.title || boss.name} [FASE ${boss.phase}]`, GAME_WIDTH / 2, hpY - 4);
    ctx.restore();
  }
}
