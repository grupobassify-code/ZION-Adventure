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
    } else if (boss.name.includes('Balam') || boss.name.includes('Jaguar')) {
      this.renderBalamJaguar(boss, x, y, time);
    } else if (boss.name.includes('Yeti') || boss.name.includes('Blizzard') || boss.name.includes('Glacial')) {
      this.renderYetiBoss(boss, x, y, time);
    } else if (boss.name.includes('Vulkan') || boss.name.includes('Reactor') || boss.name.includes('Vapor')) {
      this.renderVulkanSteamColossus(boss, x, y, time);
    } else if (boss.name.includes('Malakar') || boss.name.includes('Rompemuros') || boss.name.includes('Castillo')) {
      this.renderLordMalakar(boss, x, y, time);
    } else if (boss.name.includes('Cofre') || boss.name.includes('Tesoro') || boss.name.includes('Maldito') || boss.name.includes('Pirata') || boss.name.includes('Corsario')) {
      this.renderCursedChest(boss, x, y, time);
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
      const beamCenterY = boss.name.includes('Kronos') ? y + 29 : y + 12;

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 2;
      ctx.beginPath();
      ctx.moveTo(startX, beamCenterY);
      ctx.lineTo(targetX, beamCenterY);
      ctx.stroke();

      // Laser charge sparks at emitter muzzle
      const sparkPulse = Math.sin(time * 0.4) * 3 + 4;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(startX, beamCenterY, sparkPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX - 1, beamCenterY - 1, 2, 2);
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

  // ---------------------------------------------------------------------------
  // BOSS 6: BALAM, JAGUAR GIGANTE ANCESTRAL (Jungle Run Boss)
  // ---------------------------------------------------------------------------
  private renderBalamJaguar(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const facing = boss.facing || 1;
    const isAttacking = boss.state === 'charging' || boss.state === 'slamming' || (boss.state as string) === 'roaring';
    const isPhase3 = boss.phase === 3;
    const breathe = Math.sin(time * 0.12) * 1.5;

    ctx.save();
    ctx.translate(x + boss.w / 2, y + boss.h / 2);
    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    // 1. Phase 3 Spiritual Emerald Aura & Energy Flames
    if (isPhase3 || isAttacking) {
      const auraPulse = 0.35 + Math.sin(time * 0.2) * 0.25;
      ctx.fillStyle = `rgba(16, 185, 129, ${auraPulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(0, 2, boss.w * 0.55, boss.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spectral spirit embers
      for (let i = 0; i < 6; i++) {
        const px = Math.sin(time * 0.15 + i * 1.1) * (boss.w * 0.4);
        const py = -boss.h * 0.35 + Math.sin(time * 0.25 + i * 1.7) * 8 - (time * 0.8 + i * 5) % 16;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#facc15';
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // 2. Long Predatory Tail with Mayan Jade Ring
    ctx.save();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    const tailWhip = Math.sin(time * 0.16) * 7;
    ctx.quadraticCurveTo(-26, -10 + tailWhip, -30, 2 + tailWhip * 0.5);
    ctx.quadraticCurveTo(-34, 14, -28, 16 + tailWhip * 0.2);
    ctx.stroke();

    // Dark spots on tail
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-22, -3 + tailWhip * 0.4, 2, 2);
    ctx.fillRect(-27, 4 + tailWhip * 0.5, 2, 2);

    // Ancient Jade Bead Ring near tail tip
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(-29, 15 + tailWhip * 0.2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-30, 14 + tailWhip * 0.2, 2, 2);
    ctx.restore();

    // 3. Powerful Hind Legs & Haunches
    ctx.fillStyle = '#b45309';
    // Back left haunch
    ctx.beginPath();
    ctx.ellipse(-14, 4, 7, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Back paw
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-17, 13, 8, 5);
    // Sharp claws
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, 16, 2, 2);
    ctx.fillRect(-15, 16, 2, 2);

    // 4. Heavy Muscular Torso & Amber Coat
    // Lower body
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(-4, 2 + breathe * 0.5, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper Tawny Amber Coat
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-3, 0 + breathe * 0.5, 17, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Sunlight Highlights along muscular spine
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-2, -6 + breathe * 0.5, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Authentic Jaguar Rosette Patterns (Black rings with amber center)
    const rosettes = [
      { x: -12, y: -2 },
      { x: -6, y: -4 },
      { x: 0, y: -1 },
      { x: -8, y: 3 },
      { x: 4, y: -3 },
      { x: -14, y: 5 },
    ];
    for (const r of rosettes) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(r.x - 1.5, r.y - 1.5 + breathe * 0.4, 4, 4);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(r.x - 0.5, r.y - 0.5 + breathe * 0.4, 2, 2);
    }

    // 5. Forelegs & Front Massive Claws
    // Front shoulder
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(8, 3, 7, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Front paw planted firmly
    ctx.fillStyle = '#d97706';
    ctx.fillRect(7, 12, 10, 6);

    // Glowing Razor Talons
    ctx.fillStyle = isAttacking || isPhase3 ? '#34d399' : '#ffffff';
    ctx.fillRect(14, 15, 3, 3);
    ctx.fillRect(11, 16, 2, 2);
    ctx.fillRect(8, 16, 2, 2);

    // 6. Sacred Mayan Jade Ceremonial Collar & Sun Medallion
    ctx.fillStyle = '#047857';
    ctx.fillRect(5, -4 + breathe * 0.5, 5, 12);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(6, -3 + breathe * 0.5, 3, 10);
    // Beaten Gold Solar Disc Medallion
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(8, 3 + breathe * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(7.5, 2.5 + breathe * 0.5, 1.5, 1.5);

    // 7. Jaguar Head, Snarl & Headdress
    const headX = 16;
    const headY = -5 + breathe * 0.5;

    // Muscular neck & jowls
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(headX - 2, headY + 3, 7, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cranium
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(headX + 2, headY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(headX + 2, headY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Feline Rounded Ears with dark trim
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX - 1, headY - 8, 3, 3);
    ctx.fillRect(headX + 4, headY - 8, 3, 3);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX, headY - 7, 1.5, 2);
    ctx.fillRect(headX + 5, headY - 7, 1.5, 2);

    // Mayan Jade Ceremonial Headdress Plume
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(headX, headY - 6);
    ctx.lineTo(headX + 2, headY - 14);
    ctx.lineTo(headX + 5, headY - 6);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(headX + 1, headY - 11, 2, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX + 1.5, headY - 13, 1.5, 2);

    // Muzzle & Whiskers
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(headX + 7, headY + 2, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black feline nose
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX + 9, headY, 2, 2);

    // Glowing Spiritual Emerald Eyes
    ctx.fillStyle = '#065f46';
    ctx.fillRect(headX + 3, headY - 2, 3, 3);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(headX + 4, headY - 1.5, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + 5, headY - 1.5, 1, 1);

    // Open Roaring Snarl with Razor Fangs
    if (isAttacking || (boss.state as string) === 'roaring') {
      // Open mouth interior
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(headX + 6, headY + 3, 5, 4);
      // Long sharp upper and lower fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 7, headY + 2, 1.5, 3);
      ctx.fillRect(headX + 10, headY + 2, 1.5, 2);
      ctx.fillRect(headX + 8, headY + 5, 1.5, 2);
    } else {
      // Closed predatory snarl
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + 6, headY + 3);
      ctx.lineTo(headX + 10, headY + 3);
      ctx.stroke();
      // Peeking fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 8, headY + 3, 1, 2);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // YETI · COLOSO DE LAS CUMBRES GLACIALES (BLIZZARD RUSH FINAL BOSS)
  // ---------------------------------------------------------------------------
  private renderYetiBoss(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const facing = boss.facing ?? 1;
    const phase = boss.phase || 1;
    const isAttacking = boss.state === 'attack' || boss.state === 'slash' || boss.state === 'slam' || boss.state === 'roar';
    const isEnraged = phase === 3;
    const breathing = Math.sin(time * 0.08) * 2;

    ctx.save();
    ctx.translate(x + boss.w / 2, y + boss.h / 2);
    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    // 1. Enraged Blizzard Aura in Phase 3
    if (isEnraged) {
      const auraPulse = 0.5 + Math.sin(time * 0.2) * 0.3;
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${auraPulse.toFixed(2)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, boss.w * 0.65 + Math.sin(time * 0.15) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling snowflakes around Yeti
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.12 + (i * Math.PI) / 3;
        const dist = boss.w * 0.55 + Math.sin(time * 0.1 + i) * 6;
        const fx = Math.cos(angle) * dist;
        const fy = Math.sin(angle) * dist;
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx - 0.5, fy - 0.5, 1.5, 1.5);
      }
      ctx.restore();
    }

    // 2. Colossal Muscular Legs & Claws
    const legOffset = boss.state === 'run' ? Math.sin(time * 0.25) * 5 : 0;
    
    // Left / Back Leg
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-18 - legOffset, 12, 14, 18);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-18 - legOffset, 24, 16, 6);
    // Dark claws
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-19 - legOffset, 28, 3, 3);
    ctx.fillRect(-15 - legOffset, 28, 3, 3);
    ctx.fillRect(-11 - legOffset, 28, 3, 3);

    // Right / Front Leg
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(4 + legOffset, 12, 16, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(4 + legOffset, 24, 18, 6);
    // Dark claws
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5 + legOffset, 28, 3, 3);
    ctx.fillRect(10 + legOffset, 28, 3, 3);
    ctx.fillRect(15 + legOffset, 28, 3, 3);

    // 3. Massive Torso & Chest with Thick Fur Coat
    // Base shadow fur
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(0, breathing, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dense snowy white coat
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, breathing - 2, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Muscular chest pecs (bluish tint skin peeking through)
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(-7, breathing - 3, 6.5, 0, Math.PI * 2);
    ctx.arc(7, breathing - 3, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Abdominal fur tufts
    ctx.fillStyle = '#e2e8f0';
    for (let f = -12; f <= 12; f += 6) {
      ctx.beginPath();
      ctx.moveTo(f, breathing + 6);
      ctx.lineTo(f + 3, breathing + 12);
      ctx.lineTo(f + 6, breathing + 6);
      ctx.fill();
    }

    // 4. Glacial Ice Crystals on Shoulders
    ctx.fillStyle = '#38bdf8';
    // Left shoulder crystal
    ctx.beginPath();
    ctx.moveTo(-22, breathing - 14);
    ctx.lineTo(-18, breathing - 26);
    ctx.lineTo(-14, breathing - 12);
    ctx.closePath();
    ctx.fill();
    // Right shoulder crystal
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(14, breathing - 12);
    ctx.lineTo(19, breathing - 28);
    ctx.lineTo(24, breathing - 14);
    ctx.closePath();
    ctx.fill();

    // 5. Massive Yeti Arms & Hands
    const slamPose = boss.state === 'slam' || (boss.state === 'attack' && (boss.stateTimer || 0) < 15);
    const armY = slamPose ? breathing + 8 : breathing - 2;

    // Left Arm (Raised or slamming)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(-24, armY, 9, 15, slamPose ? -0.3 : 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-27, armY + 10, 8, 8); // Heavy paw
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-28, armY + 16, 3, 3);
    ctx.fillRect(-24, armY + 16, 3, 3);

    // Right Arm (Forward / Clenched Boulder Fist)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(22, armY, 10, 16, slamPose ? 0.3 : -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(18, armY + 10, 10, 9);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(19, armY + 17, 3, 4);
    ctx.fillRect(23, armY + 17, 3, 4);
    ctx.fillRect(27, armY + 17, 3, 4);

    // 6. Colossal Yeti Head & Face
    const headY = breathing - 16;
    // Head fur base
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cheek tufts
    ctx.beginPath();
    ctx.moveTo(-14, headY);
    ctx.lineTo(-21, headY + 5);
    ctx.lineTo(-12, headY + 8);
    ctx.moveTo(14, headY);
    ctx.lineTo(21, headY + 5);
    ctx.lineTo(12, headY + 8);
    ctx.fill();

    // Glacial Ice Horns on Brow
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(-11, headY - 10);
    ctx.lineTo(-17, headY - 24);
    ctx.lineTo(-6, headY - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(6, headY - 12);
    ctx.lineTo(17, headY - 24);
    ctx.lineTo(11, headY - 10);
    ctx.closePath();
    ctx.fill();

    // Dark Blue Face Plate / Muzzle
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(2, headY + 2, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yeti Eyes (Cyan normal, Flaming Red when enraged!)
    const eyeColor = isEnraged ? '#ef4444' : '#38bdf8';
    const eyePupil = isEnraged ? '#fef08a' : '#ffffff';
    // Left eye
    ctx.fillStyle = eyeColor;
    ctx.fillRect(-4, headY - 2, 4, 3);
    ctx.fillStyle = eyePupil;
    ctx.fillRect(-2, headY - 2, 2, 2);
    // Right eye
    ctx.fillStyle = eyeColor;
    ctx.fillRect(4, headY - 2, 4, 3);
    ctx.fillStyle = eyePupil;
    ctx.fillRect(6, headY - 2, 2, 2);

    // Broad black nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, headY + 1);
    ctx.lineTo(4, headY + 1);
    ctx.lineTo(2, headY + 3);
    ctx.fill();

    // Snarl / Roaring Jaw with Giant Fangs
    if (isAttacking || boss.state === 'roar' || boss.state === 'slam') {
      // Wide open roaring mouth
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-5, headY + 4, 12, 7);
      // Top fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, headY + 4);
      ctx.lineTo(-2, headY + 8);
      ctx.lineTo(0, headY + 4);
      ctx.moveTo(2, headY + 4);
      ctx.lineTo(4, headY + 8);
      ctx.lineTo(6, headY + 4);
      ctx.fill();
      // Bottom fangs
      ctx.beginPath();
      ctx.moveTo(-3, headY + 11);
      ctx.lineTo(-1, headY + 7);
      ctx.lineTo(1, headY + 11);
      ctx.moveTo(3, headY + 11);
      ctx.lineTo(5, headY + 7);
      ctx.lineTo(7, headY + 11);
      ctx.fill();

      // Frost breath vapor puff from mouth
      const breathAlpha = 0.4 + Math.sin(time * 0.3) * 0.3;
      ctx.fillStyle = `rgba(186, 230, 253, ${breathAlpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(8, headY + 8, 4 + Math.sin(time * 0.2) * 2, 0, Math.PI * 2);
      ctx.arc(14, headY + 7, 6 + Math.cos(time * 0.25) * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Stoic sneer with visible bottom fangs
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, headY + 5);
      ctx.lineTo(6, headY + 5);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, headY + 4, 2, 3);
      ctx.fillRect(4, headY + 4, 2, 3);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 7. VULKAN-Ω, COLOSO DEL REACTOR DE VAPOR (STEAMPUNK ONLY UP 1000M BOSS)
  // ---------------------------------------------------------------------------
  private renderVulkanSteamColossus(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const cx = x + boss.w / 2;
    const cy = y + boss.h / 2;
    const isFacingLeft = boss.facing < 0;
    const isOverheated = boss.phase >= 2;
    const isSuperHeated = boss.phase >= 3;
    const bob = Math.sin(time * 0.1) * 2;

    ctx.save();
    ctx.translate(cx, cy + bob);
    if (isFacingLeft) {
      ctx.scale(-1, 1);
    }

    // 1. Dual Shoulder Steam Exhaust Smokestacks
    for (const sx of [-18, 14]) {
      // Chimney base
      ctx.fillStyle = '#451a03';
      ctx.fillRect(sx, -28, 7, 12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx + 1, -27, 5, 10);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(sx - 1, -30, 9, 3); // Flanged lip

      // Billowing rhythmic steam exhaust puffs
      const puffRate = isSuperHeated ? 0.35 : 0.2;
      const puffWave = Math.sin(time * puffRate + (sx > 0 ? 1 : 0)) * 3;
      const steamAlpha = isSuperHeated ? 0.75 : 0.55;
      ctx.fillStyle = isSuperHeated ? `rgba(254, 215, 170, ${steamAlpha})` : `rgba(241, 245, 249, ${steamAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + 3.5, -34 + puffWave, 4, 0, Math.PI * 2);
      ctx.arc(sx + 2 + puffWave, -40 + puffWave * 1.5, 6, 0, Math.PI * 2);
      ctx.arc(sx + 5 - puffWave, -47 + puffWave * 2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Heavy Riveted Boiler Torso
    ctx.fillStyle = '#1c1208'; // Cast iron base
    ctx.fillRect(-22, -18, 44, 36);

    // Bronze Boiler Hull
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-20, -16, 40, 32);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-18, -14, 36, 28);

    // Boiler Rivet Bands
    ctx.fillStyle = '#f59e0b';
    for (let rx = -16; rx <= 16; rx += 8) {
      ctx.fillRect(rx, -15, 2, 2);
      ctx.fillRect(rx, 11, 2, 2);
    }

    // 3. Glowing Firebox Belly Furnace with Cast-Iron Grate
    ctx.fillStyle = '#180903';
    ctx.fillRect(-12, -4, 24, 16);

    // Interior Furnace Fire / Superheated Plasma
    const fireGrad = ctx.createLinearGradient(0, 12, 0, -4);
    if (isSuperHeated) {
      fireGrad.addColorStop(0, '#ffffff');
      fireGrad.addColorStop(0.3, '#fef08a');
      fireGrad.addColorStop(0.7, '#f97316');
      fireGrad.addColorStop(1, '#dc2626');
    } else if (isOverheated) {
      fireGrad.addColorStop(0, '#fef08a');
      fireGrad.addColorStop(0.5, '#f97316');
      fireGrad.addColorStop(1, '#991b1b');
    } else {
      fireGrad.addColorStop(0, '#fde047');
      fireGrad.addColorStop(0.6, '#ea580c');
      fireGrad.addColorStop(1, '#7c2d12');
    }
    ctx.fillStyle = fireGrad;
    ctx.fillRect(-11, -3, 22, 14);

    // Heavy Iron Furnace Grating Bars
    ctx.fillStyle = '#29180c';
    for (let gx = -9; gx <= 9; gx += 5) {
      ctx.fillRect(gx, -3, 2, 14);
    }
    ctx.fillRect(-11, 3, 22, 2);

    // 4. Steam Pressure Manometer Gauge (Center Chest / Heart)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -9, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -9, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Pressure Needle Dial
    const dialAngle = isSuperHeated ? Math.PI * 0.85 : isOverheated ? Math.PI * 0.6 : (time * 0.1) % Math.PI;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(Math.cos(dialAngle) * 3, -9 + Math.sin(dialAngle) * 3);
    ctx.stroke();

    // 5. Heavy Armored Steampunk Head / Furnace Dome
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, -18, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, -18, 10, Math.PI, 0);
    ctx.fill();

    // Glowing Optical Furnace Visor / Goggles
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-8, -22, 16, 5);
    ctx.fillStyle = isSuperHeated ? '#ffffff' : isOverheated ? '#fef08a' : '#f97316';
    ctx.fillRect(-6, -21, 5, 3);
    ctx.fillRect(1, -21, 5, 3);
    // Glowing eye shine
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(-5, -21, 2, 2);
    ctx.fillRect(2, -21, 2, 2);

    // 6. Hydraulic Piston Arms with Spinning Brass Gear Elbows
    const armSwing = Math.sin(time * 0.15) * 4;
    // Left / Back Arm
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-26, -12 + armSwing, 7, 18);
    // Left Gear Elbow
    const gearRot = time * 0.08;
    ctx.save();
    ctx.translate(-22, -2 + armSwing);
    ctx.rotate(gearRot);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
    // Left Iron Piston Fist
    ctx.fillStyle = '#29180c';
    ctx.fillRect(-28, 6 + armSwing, 9, 10);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-27, 7 + armSwing, 7, 3);

    // Right / Front Arm (Heavy Steam Hammer Piston)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(19, -12 - armSwing, 8, 18);
    // Right Gear Elbow
    ctx.save();
    ctx.translate(23, -2 - armSwing);
    ctx.rotate(-gearRot);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
    // Right Iron Piston Fist
    ctx.fillStyle = '#1c1208';
    ctx.fillRect(18, 6 - armSwing, 11, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(19, 7 - armSwing, 9, 3);

    // 7. Heavy Mechanical Leg Bases / Caterpillar Tracks
    ctx.fillStyle = '#29180c';
    ctx.fillRect(-18, 18, 14, 12);
    ctx.fillRect(4, 18, 14, 12);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-17, 26, 12, 4);
    ctx.fillRect(5, 26, 12, 4);
    // Brass rollers
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-15, 27, 3, 2);
    ctx.fillRect(-9, 27, 3, 2);
    ctx.fillRect(7, 27, 3, 2);
    ctx.fillRect(13, 27, 3, 2);

    ctx.restore();
  }

  // =========================================================================
  // LORD MALAKAR · COLOSO ROMPEMUROS (CASTLE SMASH ACT 3 BOSS)
  // =========================================================================
  private renderLordMalakar(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const cx = x + boss.w / 2;
    const cy = y + boss.h / 2;
    const isFacingLeft = boss.facing < 0;
    const isPhase2 = boss.phase >= 2;
    const isPhase3 = boss.phase >= 3;
    const bob = Math.sin(time * 0.12) * 1.5;

    ctx.save();
    ctx.translate(cx, cy + bob);
    if (isFacingLeft) {
      ctx.scale(-1, 1);
    }

    // 0. Enraged Molten Aura (Phase 2 & 3)
    if (isPhase2) {
      const auraPulse = Math.sin(time * 0.25) * 4;
      const auraGrad = ctx.createRadialGradient(0, 0, 16, 0, 0, 36 + auraPulse);
      auraGrad.addColorStop(0, isPhase3 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.25)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 36 + auraPulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Tattered Royal Cloak (Fluttering behind back)
    const cloakFlap = Math.sin(time * 0.2) * 3;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(-24 + cloakFlap, 18);
    ctx.lineTo(-14, 22);
    ctx.lineTo(-4, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-10, -16);
    ctx.lineTo(-20 + cloakFlap, 16);
    ctx.lineTo(-12, 20);
    ctx.lineTo(-4, -14);
    ctx.closePath();
    ctx.fill();

    // 2. Heavy Gothic Sabatons & Greaves (Legs)
    const walkStance = boss.state === 'charging' ? Math.sin(time * 0.4) * 4 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14 + walkStance, 14, 10, 12);
    ctx.fillRect(4 - walkStance, 14, 10, 12);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-13 + walkStance, 15, 8, 10);
    ctx.fillRect(5 - walkStance, 15, 8, 10);
    // Gilded Knee Cops
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-14 + walkStance, 13, 10, 3);
    ctx.fillRect(4 - walkStance, 13, 10, 3);

    // 3. Blackened Steel Torso Plate & Lion Crest
    ctx.fillStyle = '#020617';
    ctx.fillRect(-18, -16, 36, 30);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-16, -14, 32, 26);
    // Gilded Armor Trims
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-16, -14, 32, 2);
    ctx.fillRect(-16, 10, 32, 2);
    ctx.fillRect(-16, -14, 2, 26);
    ctx.fillRect(14, -14, 2, 26);
    // Heraldic Imperial Lion Sigil
    ctx.fillStyle = isPhase3 ? '#ef4444' : '#fbbf24';
    ctx.fillRect(-5, -8, 10, 12);
    ctx.fillRect(-7, -4, 14, 4);

    // 4. Spiked Gothic Pauldrons (Shoulders)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-24, -22, 12, 12);
    ctx.fillRect(12, -22, 12, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-22, -20, 8, 8);
    ctx.fillRect(14, -20, 8, 8);
    // Steel Pauldron Spikes
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-20, -26, 4, 4);
    ctx.fillRect(16, -26, 4, 4);

    // 5. Great Helm with Horned Crest & Visor Slit
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-10, -28, 20, 14);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, -26, 16, 10);
    // Gilded Helm Brow
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-9, -24, 18, 2);
    // Horned Crest
    ctx.fillStyle = '#475569';
    ctx.fillRect(-14, -34, 4, 8);
    ctx.fillRect(10, -34, 4, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-12, -38, 2, 5);
    ctx.fillRect(10, -38, 2, 5);
    // Piercing Glowing Visor Slit
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6, -20, 13, 3);
    ctx.fillStyle = isPhase3 ? '#ef4444' : '#f97316';
    ctx.fillRect(-4, -20, 10, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(isFacingLeft ? -3 : 2, -19.5, 3, 1);

    // 6. Giant Tower Pavise Shield (Left Arm / Front Defense)
    ctx.save();
    ctx.translate(-22, -4);
    // Shield Body
    ctx.fillStyle = '#020617';
    ctx.fillRect(-6, -18, 12, 38);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -16, 8, 34);
    // Reinforced Gilded Cross & Iron Boss
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-1, -16, 2, 34);
    ctx.fillRect(-4, 0, 8, 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, -2, 6, 6);
    // Active Bastion Shield Aura
    if (boss.shield) {
      const shieldPulse = Math.sin(time * 0.2) * 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-9 - shieldPulse, -22 - shieldPulse, 18 + shieldPulse * 2, 46 + shieldPulse * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(-9 - shieldPulse, -22 - shieldPulse, 18 + shieldPulse * 2, 46 + shieldPulse * 2);
    }
    ctx.restore();

    // 7. Colossal Siege Warhammer (Right Arm / Attack Hand)
    ctx.save();
    let hammerAngle = 0.2;
    if (boss.state === 'attack') {
      hammerAngle = boss.stateTimer > 20 ? -0.8 : 0.9;
    } else if (boss.state === 'charging') {
      hammerAngle = -0.4;
    }
    ctx.translate(18, -4);
    ctx.rotate(hammerAngle);
    // Shaft (Reinforced Oak & Iron)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-2, -34, 4, 46);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3, -30, 6, 3);
    ctx.fillRect(-3, 6, 6, 3);
    // Colossal Stone & Steel Hammer Head
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -46, 28, 16);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-12, -44, 24, 12);
    // Fiery Rune Cracks on Hammer (Phase 2+)
    if (isPhase2) {
      ctx.fillStyle = isPhase3 ? '#ef4444' : '#f59e0b';
      ctx.fillRect(-8, -41, 16, 2);
      ctx.fillRect(-2, -44, 4, 12);
    }
    // Hammer Back-Spike
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(14, -42);
    ctx.lineTo(24, -38);
    ctx.lineTo(14, -34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ===========================================================================
  // 10. EL COFRE MALDITO DEL NAUFRAGIO (PIRATE'S TREASURE ACT 3 BOSS)
  // Masterpiece Pixel-Art Animated Mimic Treasure Chest:
  // - Weathered pirate oak wood & forged brass bands with rivets
  // - Hinged animated jaw lid opening with razor gold teeth & glowing red ruby eyes
  // - Abyssal water bubbles, spectral tentacle aura, and flying cursed doubloons
  // - Animated mimic crab/skeleton legs in Phase 3
  // ===========================================================================
  private renderCursedChest(boss: Boss, x: number, y: number, time: number) {
    const ctx = this.ctx;
    const isPhase2 = boss.phase >= 2;
    const isPhase3 = boss.phase === 3;
    const isStaggered = boss.isStaggered;
    const facing = boss.facing;
    const cx = x + boss.w / 2;
    const cy = y + boss.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(facing, 1);

    // Underwater ambient float bobbing
    const waterBob = Math.sin(time * 0.12) * 2;
    ctx.translate(0, waterBob);

    // 1. Abyssal / Cursed Water Aura (Phase 2 & 3)
    if (isPhase2) {
      const auraR = 34 + Math.sin(time * 0.2) * 4;
      const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraR);
      auraGrad.addColorStop(0, isPhase3 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(168, 85, 247, 0.22)');
      auraGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Spectral floating cursed runes/bubbles around chest
      for (let i = 0; i < 4; i++) {
        const bubbleAngle = time * 0.08 + (i * Math.PI) / 2;
        const bx = Math.cos(bubbleAngle) * (26 + i * 2);
        const by = Math.sin(bubbleAngle * 1.2) * 18 - 8;
        ctx.fillStyle = isPhase3 ? '#facc15' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Animated Mimic Legs / Skeletal Claws (Phase 3 Frenzy or leaping)
    if (isPhase3 || boss.state === 'jumping' || boss.state === 'charging') {
      const legWalk = Math.sin(time * 0.35) * 6;
      ctx.fillStyle = '#f59e0b'; // Gilded crab/skeletal claws
      // Left Front Leg
      ctx.beginPath();
      ctx.moveTo(-18, 14);
      ctx.lineTo(-26, 22 + legWalk);
      ctx.lineTo(-22, 26 + legWalk);
      ctx.lineTo(-14, 18);
      ctx.fill();
      // Right Front Leg
      ctx.beginPath();
      ctx.moveTo(18, 14);
      ctx.lineTo(26, 22 - legWalk);
      ctx.lineTo(22, 26 - legWalk);
      ctx.lineTo(14, 18);
      ctx.fill();
      // Mid claw tips
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-27, 21 + legWalk, 3, 3);
      ctx.fillRect(25, 21 - legWalk, 3, 3);
    }

    // 3. Lower Chest Base (Body / Jaw)
    const baseW = 44;
    const baseH = 22;
    const baseX = -baseW / 2;
    const baseY = -2;

    // Dark Sunken Oak Wood Body
    ctx.fillStyle = '#2d1808';
    ctx.fillRect(baseX, baseY, baseW, baseH);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(baseX + 2, baseY + 2, baseW - 4, baseH - 4);

    // Weathered Wood Horizontal Planks
    ctx.fillStyle = '#1c0e04';
    ctx.fillRect(baseX + 2, baseY + 8, baseW - 4, 1.5);
    ctx.fillRect(baseX + 2, baseY + 15, baseW - 4, 1.5);

    // Heavy Forged Brass / Tarnished Gold Corner Bands
    ctx.fillStyle = '#d97706';
    ctx.fillRect(baseX, baseY, 6, baseH);
    ctx.fillRect(baseX + baseW - 6, baseY, 6, baseH);
    ctx.fillRect(baseX + baseW / 2 - 3, baseY, 6, baseH);
    // Golden Highlight on bands
    ctx.fillStyle = '#facc15';
    ctx.fillRect(baseX + 1, baseY + 1, 3, baseH - 2);
    ctx.fillRect(baseX + baseW - 4, baseY + 1, 3, baseH - 2);
    ctx.fillRect(baseX + baseW / 2 - 1, baseY + 1, 2, baseH - 2);

    // Iron Rivets on bands
    ctx.fillStyle = '#78350f';
    ctx.fillRect(baseX + 2, baseY + 4, 2, 2);
    ctx.fillRect(baseX + 2, baseY + 12, 2, 2);
    ctx.fillRect(baseX + baseW - 4, baseY + 4, 2, 2);
    ctx.fillRect(baseX + baseW - 4, baseY + 12, 2, 2);

    // Barnacles & Deep-Sea Seaweed clinging to wood
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect(baseX + 8, baseY + 13, 3, 3);
    ctx.fillRect(baseX + 13, baseY + 16, 2, 2);
    ctx.fillRect(baseX + 28, baseY + 14, 3, 2);

    // 4. Mimic Mouth & Teeth (Inside the Chest)
    // Lid open angle depends on state:
    let openHeight = 3;
    if (isStaggered) {
      openHeight = 16;
    } else if (boss.state === 'attack' || boss.state === 'charging') {
      openHeight = 18;
    } else if (boss.state === 'shooting' || isPhase3) {
      openHeight = 12 + Math.sin(time * 0.3) * 4;
    } else if (isPhase2) {
      openHeight = 6 + Math.sin(time * 0.15) * 3;
    }

    // Abyssal Dark Maw Void Inside
    if (openHeight > 2) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(baseX + 4, baseY - openHeight + 4, baseW - 8, openHeight);
      // Cursed Void Glow
      ctx.fillStyle = isPhase3 ? '#ef4444' : '#a855f7';
      ctx.fillRect(baseX + 8, baseY - openHeight / 2, baseW - 16, Math.max(2, openHeight * 0.4));

      // Razor Sharp Golden / Bone Teeth (Lower Jaw)
      ctx.fillStyle = '#fef08a';
      for (let tx = baseX + 7; tx < baseX + baseW - 8; tx += 5) {
        ctx.beginPath();
        ctx.moveTo(tx, baseY + 2);
        ctx.lineTo(tx + 2.5, baseY - 3);
        ctx.lineTo(tx + 5, baseY + 2);
        ctx.fill();
      }

      // Upper Jaw Teeth (Hanging from lid)
      for (let tx = baseX + 7; tx < baseX + baseW - 8; tx += 5) {
        ctx.beginPath();
        ctx.moveTo(tx, baseY - openHeight + 2);
        ctx.lineTo(tx + 2.5, baseY - openHeight + 7);
        ctx.lineTo(tx + 5, baseY - openHeight + 2);
        ctx.fill();
      }

      // Glowing Cursed Ruby Eyes inside the open maw!
      const eyeBob = Math.sin(time * 0.25) * 1.5;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-8, baseY - openHeight / 2 + eyeBob, 2.8, 0, Math.PI * 2);
      ctx.arc(8, baseY - openHeight / 2 + eyeBob, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-9, baseY - openHeight / 2 + eyeBob - 1, 1.5, 2);
      ctx.fillRect(7, baseY - openHeight / 2 + eyeBob - 1, 1.5, 2);

      // Gold Doubloons spilling / hovering in mouth
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-14, baseY - openHeight / 3, 2, 0, Math.PI * 2);
      ctx.arc(14, baseY - openHeight / 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Upper Chest Hinged Lid
    ctx.save();
    ctx.translate(0, baseY - openHeight);
    const lidW = 46;
    const lidH = 14;
    const lidX = -lidW / 2;
    const lidY = -lidH;

    // Arched Lid Top
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(lidX, lidY + lidH);
    ctx.lineTo(lidX, lidY + 4);
    ctx.quadraticCurveTo(0, lidY - 4, lidX + lidW, lidY + 4);
    ctx.lineTo(lidX + lidW, lidY + lidH);
    ctx.closePath();
    ctx.fill();

    // Dark Oak Rim
    ctx.fillStyle = '#2d1808';
    ctx.fillRect(lidX, lidY + lidH - 2, lidW, 2);

    // Brass Arch Straps & Rivets on Lid
    ctx.fillStyle = '#d97706';
    ctx.fillRect(lidX, lidY + 2, 6, lidH - 2);
    ctx.fillRect(lidX + lidW - 6, lidY + 2, 6, lidH - 2);
    ctx.fillRect(lidX + lidW / 2 - 3, lidY, 6, lidH);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(lidX + 1, lidY + 2, 3, lidH - 3);
    ctx.fillRect(lidX + lidW - 4, lidY + 2, 3, lidH - 3);
    ctx.fillRect(lidX + lidW / 2 - 1, lidY, 2, lidH);

    // 6. Cursed Pirate Skull & Crossbones Keyhole Lock Plate
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, lidY + lidH - 5, 12, 10);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-5, lidY + lidH - 4, 10, 8);
    // Skull Emblem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, lidY + lidH - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1.5, lidY + lidH + 1, 3, 2);
    // Skull glowing red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-1.2, lidY + lidH - 1.5, 1, 1);
    ctx.fillRect(0.4, lidY + lidH - 1.5, 1, 1);

    ctx.restore(); // Lid

    // 7. Water Bubble Exhalations (Rising from chest seams)
    if (Math.random() < 0.35) {
      const bubbleX = (Math.random() - 0.5) * 36;
      const bubbleY = -12 - Math.random() * 10;
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, 1.5 + Math.random() * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore(); // Base transform
  }
}

