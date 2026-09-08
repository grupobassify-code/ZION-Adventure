import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { LEVEL_CONFIGS } from './levelData';
import { getOnlyUpBiome } from './onlyUpGenerator';
import type { GameEngine } from './gameEngine';
import {
  Boss,
  Checkpoint,
  Collectible,
  Enemy,
  FloatingText,
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
  ZoneId,
} from '../types';
import { EnemyRenderer } from './enemyRenderer';
import { BossRenderer } from './bossRenderer';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private enemyRenderer: EnemyRenderer;
  private bossRenderer: BossRenderer;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.enemyRenderer = new EnemyRenderer(ctx);
    this.bossRenderer = new BossRenderer(ctx);
  }

  public clear(color = '#050711') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  public render(engine: GameEngine) {
    if (engine.isOnlyUpMode) {
      this.renderOnlyUp(engine);
      return;
    }

    const config = LEVEL_CONFIGS[engine.levelIndex] || LEVEL_CONFIGS[0];

    // 1. Clear background
    this.clear();

    // 2. Parallax background scenery
    if (engine.isInSpecialStage) {
      this.renderSpecialStageBackground(engine.cameraX, engine.time);
    } else {
      this.renderBackground(config.zone, config.act, engine.cameraX, config.worldWidth, engine.time);
    }

    // 3. World landmarks and shrines
    this.renderLandmarks(engine.landmarks, engine.cameraX, engine.time);

    // 4. Platforms & solid terrain
    this.renderPlatforms(engine.platforms, config.zone, config.act, engine.cameraX, engine.time);

    // 5. Hazards & traps
    this.renderHazards(engine.hazards, engine.cameraX, engine.time);

    // 6. Collectibles, checkpoints, portals, node pillars
    this.renderCollectibles(
      engine.crystals,
      engine.secrets,
      engine.heals,
      engine.checkpoints,
      engine.nodes,
      engine.goal,
      config.zone,
      config.act,
      engine.bossDefeated,
      engine.cameraX,
      engine.time,
      engine.specialStagePortal,
      engine.specialStageExitPortal
    );

    // 7. Regular enemies
    this.renderEnemies(engine.enemies, engine.cameraX, engine.time);

    // 8. Boss guardian
    this.renderBoss(engine.boss, engine.cameraX, engine.time);

    // 9. Projectiles (daggers, enemy orbs, laser beams)
    this.renderProjectiles(engine.projectiles, engine.cameraX);

    // 10. Player Hero Zion
    this.renderZion(engine.player, engine.cameraX);

    // 11. Melee sword slash arcs & special energy bursts
    this.renderMeleeEffects(engine.meleeEffects, engine.cameraX);
    this.renderSpecialEffects(engine.specialEffects, engine.cameraX);

    // 12. Dynamic pixel particles & floating damage/score text
    this.renderParticles(engine.particles, engine.cameraX);
    this.renderFloatingTexts(engine.floatingTexts, engine.cameraX);

    // 13. Boss intro cinematic banner & combo HUD
    this.renderBossIntroBanner(engine.bossIntroBanner);
    this.renderComboHUD(engine.comboCount, engine.comboRank, engine.comboTimer);
  }

  public renderOnlyUp(engine: GameEngine) {
    const ctx = this.ctx;
    const biome = getOnlyUpBiome(engine.onlyUpAltitude);

    // 1. Vertical Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bgGrad.addColorStop(0, biome.bgGradient[0]);
    bgGrad.addColorStop(1, biome.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. Parallax vertical speed lines / floating embers
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 18; i++) {
      const px = ((i * 47 + engine.time * 0.4) % (GAME_WIDTH - 54)) + 27;
      const py = (GAME_HEIGHT + 20 - ((engine.time * (1 + (i % 3) * 0.5) + i * 29) % (GAME_HEIGHT + 40)));
      ctx.fillStyle = biome.themeColor;
      ctx.fillRect(px, py, 2, (i % 3) + 2);
    }
    ctx.restore();

    // 3. Shift canvas according to cameraY (Vertical Climbing)
    ctx.save();
    ctx.translate(0, -Math.round(engine.cameraY));

    // A. Tower Boundaries (Left: x=0..26, Right: x=294..320)
    const viewTop = engine.cameraY - 40;
    const viewBottom = engine.cameraY + GAME_HEIGHT + 40;

    // Left tower wall
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, viewTop, 26, viewBottom - viewTop);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, viewTop, 2, viewBottom - viewTop);
    ctx.fillStyle = biome.themeColor;
    ctx.fillRect(25, viewTop, 1, viewBottom - viewTop);

    // Right tower wall
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(294, viewTop, 26, viewBottom - viewTop);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(294, viewTop, 2, viewBottom - viewTop);
    ctx.fillStyle = biome.themeColor;
    ctx.fillRect(294, viewTop, 1, viewBottom - viewTop);

    // Wall altitude markers every 100px (50 meters)
    const startMarker = Math.floor(viewTop / 100) * 100;
    for (let my = startMarker; my <= viewBottom; my += 100) {
      const meters = Math.max(0, Math.floor((140 - my) / 2));
      ctx.fillStyle = `${biome.themeColor}44`;
      ctx.fillRect(18, my, 8, 1);
      ctx.fillRect(294, my, 8, 1);

      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillStyle = `${biome.themeColor}aa`;
      ctx.textAlign = 'left';
      ctx.fillText(`${meters}m`, 2, my + 3);
      ctx.textAlign = 'right';
      ctx.fillText(`${meters}m`, 318, my + 3);
    }
    ctx.textAlign = 'left';

    // B. Platforms & Solids
    this.renderPlatforms(engine.platforms, biome.zone, 1, 0, engine.time);

    // B2. Dynamic Trampolines (Bounce Pads)
    this.renderTrampolines(engine.trampolines, engine.time);

    // C. Hazards
    this.renderHazards(engine.hazards, 0, engine.time);

    // D. Collectibles (Crystals and Heals)
    this.renderCollectibles(
      engine.crystals,
      [],
      engine.heals,
      [],
      [],
      null,
      biome.zone,
      1,
      false,
      0,
      engine.time
    );

    // E. Enemies
    this.renderEnemies(engine.enemies, 0, engine.time);

    // F. Projectiles
    this.renderProjectiles(engine.projectiles, 0);

    // G. Hero Zion
    this.renderZion(engine.player, 0);

    // H. Melee and Special Effects
    this.renderMeleeEffects(engine.meleeEffects, 0);
    this.renderSpecialEffects(engine.specialEffects, 0);

    // I. Particles & Floating texts
    this.renderParticles(engine.particles, 0);
    this.renderFloatingTexts(engine.floatingTexts, 0);

    // J. LETHAL RISING LAVA
    const lavaY = engine.onlyUpLavaY;
    // Lava body
    const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, lavaY + 300);
    lavaGrad.addColorStop(0, '#f97316');
    lavaGrad.addColorStop(0.2, '#ea580c');
    lavaGrad.addColorStop(0.6, '#991b1b');
    lavaGrad.addColorStop(1, '#450a0a');

    ctx.beginPath();
    ctx.moveTo(0, lavaY + 400);
    ctx.lineTo(0, lavaY);
    for (let lx = 0; lx <= 320; lx += 8) {
      const wave = Math.sin(engine.time * 0.12 + lx * 0.08) * 3 + Math.cos(engine.time * 0.2 + lx * 0.15) * 2;
      ctx.lineTo(lx, lavaY + wave);
    }
    ctx.lineTo(320, lavaY);
    ctx.lineTo(320, lavaY + 400);
    ctx.closePath();
    ctx.fillStyle = lavaGrad;
    ctx.fill();

    // Hot boiling crest line
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let lx = 0; lx <= 320; lx += 8) {
      const wave = Math.sin(engine.time * 0.12 + lx * 0.08) * 3 + Math.cos(engine.time * 0.2 + lx * 0.15) * 2;
      if (lx === 0) ctx.moveTo(lx, lavaY + wave);
      else ctx.lineTo(lx, lavaY + wave);
    }
    ctx.stroke();

    // Rising sparks from lava
    ctx.fillStyle = '#fef08a';
    for (let s = 0; s < 12; s++) {
      const sx = ((s * 27 + engine.time * 1.5) % 300) + 10;
      const sy = lavaY - ((engine.time * 1.2 + s * 14) % 35);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    ctx.restore();

    // 4. Screen-Space Lava Proximity Warning Vignette
    const distToLava = engine.onlyUpLavaY - engine.player.y;
    if (distToLava < 90) {
      const urgency = Math.max(0, Math.min(1, (90 - distToLava) / 90));
      const pulse = 0.65 + Math.sin(engine.time * 0.28) * 0.35;
      const warnGrad = ctx.createLinearGradient(0, GAME_HEIGHT - 55, 0, GAME_HEIGHT);
      warnGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      warnGrad.addColorStop(1, `rgba(239, 68, 68, ${(urgency * pulse * 0.75).toFixed(2)})`);
      ctx.fillStyle = warnGrad;
      ctx.fillRect(0, GAME_HEIGHT - 55, GAME_WIDTH, 55);
    }

    // 5. Screen-Space HUD for Only Up Altitude
    this.renderOnlyUpHUD(engine);

    // 6. Combo HUD
    this.renderComboHUD(engine.comboCount, engine.comboRank, engine.comboTimer);
  }

  public renderOnlyUpHUD(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();

    // Top Left Agility & Jump Power Gauge
    const agility = engine.getOnlyUpAgility();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(8, 6, 88, 20);
    ctx.strokeStyle = agility.tierColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 6, 88, 20);

    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = agility.tierColor;
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${agility.tierName} · T${agility.tier}`, 52, 14);

    const speedPct = Math.round((agility.speedMultiplier - 1) * 100);
    const jumpPct = Math.round((Math.abs(agility.jumpForce) / 6.0 - 1) * 100);
    ctx.font = '4px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`VEL +${speedPct}% · SALTO +${jumpPct}%`, 52, 22);

    // Top Center Altitude Capsule
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(GAME_WIDTH / 2 - 46, 6, 92, 20);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.strokeRect(GAME_WIDTH / 2 - 46, 6, 92, 20);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${engine.onlyUpAltitude}m`, GAME_WIDTH / 2, 16);

    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`RÉCORD: ${Math.max(engine.onlyUpRecord, engine.onlyUpAltitude)}m`, GAME_WIDTH / 2, 23);

    // Top Right Survival Timer Capsule
    const mins = Math.floor(engine.onlyUpTimeSurvived / 60);
    const secs = Math.floor(engine.onlyUpTimeSurvived % 60);
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(GAME_WIDTH - 64, 6, 58, 16);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(GAME_WIDTH - 64, 6, 58, 16);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${timeStr}`, GAME_WIDTH - 35, 17);

    // 3 Seconds Head Start Advantage Banner
    if (engine.onlyUpGraceTimer > 0) {
      const secs = (engine.onlyUpGraceTimer / 60).toFixed(1);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(GAME_WIDTH / 2 - 95, 34, 190, 26);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(GAME_WIDTH / 2 - 95, 34, 190, 26);

      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`⏳ VENTAJA: ${secs}s`, GAME_WIDTH / 2, 46);

      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('¡SUBE AHORA! LAVA DETENIDA', GAME_WIDTH / 2, 54);
    }

    // Lava Proximity Indicator on bottom left (shows distance & rising acceleration speed)
    if (engine.onlyUpGraceTimer > 0) {
      const secs = (engine.onlyUpGraceTimer / 60).toFixed(1);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(8, GAME_HEIGHT - 22, 90, 14);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, GAME_HEIGHT - 22, 90, 14);

      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText(`LAVA ESPERA: ${secs}s`, 53, GAME_HEIGHT - 13);
    } else {
      const dist = Math.max(0, Math.round(engine.onlyUpLavaY - engine.player.y));
      const speedRate = (engine.onlyUpLavaSpeed * 60).toFixed(0);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(8, GAME_HEIGHT - 22, 94, 14);
      ctx.strokeStyle = dist < 70 ? '#ef4444' : '#f97316';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, GAME_HEIGHT - 22, 94, 14);

      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillStyle = dist < 70 ? '#f87171' : '#fdba74';
      ctx.textAlign = 'center';
      ctx.fillText(`LAVA: ${dist}px ▲${speedRate}p/s`, 55, GAME_HEIGHT - 13);
    }

    ctx.restore();
  }

  public renderTrampolines(trampolines: Trampoline[], time: number) {
    const ctx = this.ctx;
    for (const t of trampolines) {
      const isSuper = t.type === 'super';
      const compression = t.springAnim > 0 ? (t.springAnim / 16) * 3 : 0;
      const padY = t.y + compression;
      const padH = Math.max(3, t.h - compression);

      // Base mount anchored securely to platform
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(t.x, t.y + t.h - 2, t.w, 3);
      ctx.fillStyle = isSuper ? '#fbbf24' : '#475569';
      ctx.fillRect(t.x + 2, t.y + t.h - 1, 2, 2);
      ctx.fillRect(t.x + t.w - 4, t.y + t.h - 1, 2, 2);

      // Central Hydraulic Spring Piston
      ctx.fillStyle = isSuper ? '#e879f9' : '#38bdf8';
      ctx.fillRect(t.x + t.w / 2 - 2, padY + 3, 4, Math.max(1, padH - 2));

      // Bouncy Launch Pad Body
      ctx.fillStyle = isSuper ? '#db2777' : '#0284c7';
      ctx.fillRect(t.x, padY, t.w, 4);

      // High-Energy Elastic Surface
      ctx.fillStyle = isSuper ? '#f472b6' : '#38bdf8';
      ctx.fillRect(t.x, padY, t.w, 2);

      // Bright Impulse Glow Line
      ctx.fillStyle = isSuper ? '#fde047' : '#67e8f9';
      ctx.fillRect(t.x + 3, padY, t.w - 6, 1);

      // Upward Arrow Icon indicating instant impulse! (▲)
      const arrowBob = t.springAnim > 0 ? 0 : Math.sin(time * 0.16) * 1.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = t.x + t.w / 2;
      ctx.moveTo(cx, padY - 2 + arrowBob);
      ctx.lineTo(cx - 3, padY + 1 + arrowBob);
      ctx.lineTo(cx + 3, padY + 1 + arrowBob);
      ctx.closePath();
      ctx.fill();

      // Super Trampoline Quantum Energy Ring Effect
      if (isSuper) {
        const pulse = 0.35 + Math.sin(time * 0.12) * 0.25;
        ctx.strokeStyle = `rgba(232, 121, 249, ${pulse.toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(t.x - 1, padY - 1, t.w + 2, 6);
      }
    }
  }

  public beginFrame(screenShake = 0) {
    this.ctx.save();
    if (screenShake > 0) {
      // Subtle, controlled, damped arcade shake (max 2.0px displacement, eliminates visual disorientation/motion sickness)
      const intensity = Math.min(2.0, screenShake * 0.4);
      const angle = (performance.now() * 0.02);
      const sx = Math.sin(angle) * intensity;
      const sy = Math.cos(angle * 1.3) * (intensity * 0.6);
      this.ctx.translate(Math.round(sx * 10) / 10, Math.round(sy * 10) / 10);
    }
  }

  public endFrame() {
    this.ctx.restore();
  }

  public renderSpecialStageBackground(cameraX: number, time: number) {
    const ctx = this.ctx;
    // Deep cosmic cyber gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#090014');
    grad.addColorStop(0.45, '#1e0836');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cosmic nebula cloud
    const nebGrad = ctx.createRadialGradient(
      GAME_WIDTH * 0.5 - cameraX * 0.1, GAME_HEIGHT * 0.4, 20,
      GAME_WIDTH * 0.5 - cameraX * 0.1, GAME_HEIGHT * 0.4, 140
    );
    nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
    nebGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
    nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Far cosmic stars with parallax
    ctx.save();
    for (let i = 0; i < 45; i++) {
      const starX = ((i * 37 - cameraX * 0.2) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH;
      const starY = (i * 19 + 7) % (GAME_HEIGHT - 15);
      const twinkle = Math.sin(time * 0.05 + i) * 0.4 + 0.6;
      ctx.fillStyle = i % 3 === 0 ? `rgba(250, 204, 21, ${twinkle})` : `rgba(232, 121, 249, ${twinkle})`;
      const size = (i % 5 === 0) ? 2 : 1;
      ctx.fillRect(starX, starY, size, size);
    }

    // Distant cyber grid lines on the quantum horizon
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.2)';
    ctx.lineWidth = 1;
    const horizonY = GAME_HEIGHT - 35;
    for (let y = horizonY; y < GAME_HEIGHT; y += 7) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }
    const gridOffset = (cameraX * 0.4) % 24;
    for (let x = -gridOffset; x < GAME_WIDTH + 24; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo(x * 1.3 - GAME_WIDTH * 0.15, GAME_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();
  }

  public renderBackground(zone: ZoneId, act: number, cameraX: number, worldWidth: number, time: number) {
    const ctx = this.ctx;
    const isNight = zone === 'sakura' && act === 2;

    // Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    if (zone === 'neon') {
      if (act === 1) {
        grad.addColorStop(0, '#0a1d2e');
        grad.addColorStop(0.5, '#103748');
        grad.addColorStop(1, '#091c28');
      } else {
        grad.addColorStop(0, '#0b0f19');
        grad.addColorStop(0.5, '#161938');
        grad.addColorStop(1, '#081426');
      }
    } else if (zone === 'sakura') {
      if (act === 1) {
        // Sunset Sakura
        grad.addColorStop(0, '#4a1532');
        grad.addColorStop(0.5, '#832f58');
        grad.addColorStop(1, '#e27b9a');
      } else {
        // Night Sakura
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, '#1e1133');
        grad.addColorStop(1, '#3b1847');
      }
    } else if (zone === 'lavacliff') {
      // Lavacliff
      if (act === 1) {
        // Volcano Exterior
        grad.addColorStop(0, '#2d0606');
        grad.addColorStop(0.45, '#7c1c05');
        grad.addColorStop(0.85, '#ea580c');
        grad.addColorStop(1, '#f97316');
      } else {
        // Magma Subterranean Core
        grad.addColorStop(0, '#130404');
        grad.addColorStop(0.4, '#3b0a0a');
        grad.addColorStop(0.8, '#7f1d1d');
        grad.addColorStop(1, '#b91c1c');
      }
    } else if (zone === 'krono') {
      // Krono City: Futuristic Cyberpunk Metropolis
      if (act === 1) {
        // Upper Commercial Cyber-District
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.35, '#0b132b');
        grad.addColorStop(0.7, '#1c2541');
        grad.addColorStop(1, '#0e7490');
      } else if (act === 2) {
        // High Orbital Station & Quantum Reactor
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.4, '#0f172a');
        grad.addColorStop(0.75, '#2e1065');
        grad.addColorStop(1, '#4338ca');
      } else {
        // The Mechanical Throne of Kronos
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.35, '#1e0a38');
        grad.addColorStop(0.75, '#3b0764');
        grad.addColorStop(1, '#0284c7');
      }
    } else if (zone === 'travel') {
      // Kronos Travel: Dimensional Rift / Chrono Aurora / Cosmic Convergence
      const cycle = (time * 0.005) % (Math.PI * 2);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.3, '#1e1b4b');
      grad.addColorStop(0.6, '#312e81');
      grad.addColorStop(0.85, '#4338ca');
      grad.addColorStop(1, '#0284c7');
    } else {
      // Desert Sanctuary
      if (act === 1) {
        // Blazing Golden Egyptian Desert Morning
        grad.addColorStop(0, '#451a03');
        grad.addColorStop(0.35, '#b45309');
        grad.addColorStop(0.7, '#f59e0b');
        grad.addColorStop(1, '#fde68a');
      } else {
        // Mystical Midnight Sand Tomb / Ancient Pyramid Chamber
        grad.addColorStop(0, '#0f051d');
        grad.addColorStop(0.4, '#2e1065');
        grad.addColorStop(0.75, '#581c87');
        grad.addColorStop(1, '#b45309');
      }
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Distant Celestial Body / Cyber Matrix Ring / Volcano Crater / Desert Sun & Moon
    if (zone === 'neon') {
      ctx.strokeStyle = act === 1 ? '#06b6d433' : '#a855f733';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(240, 42, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = act === 1 ? '#22d3ee44' : '#a855f744';
      ctx.beginPath();
      ctx.arc(240, 42, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Grid Lines in Distance
      ctx.strokeStyle = '#06b6d415';
      ctx.lineWidth = 1;
      for (let gy = 70; gy < 140; gy += 14) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(GAME_WIDTH, gy);
        ctx.stroke();
      }
    } else if (zone === 'sakura') {
      ctx.fillStyle = isNight ? '#fef08a' : '#fed7aa';
      ctx.beginPath();
      ctx.arc(240, isNight ? 36 : 42, isNight ? 22 : 18, 0, Math.PI * 2);
      ctx.fill();
      if (isNight) {
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(234, 30, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone === 'lavacliff') {
      // Lavacliff: Erupting Volcano Crater or Cavern Magma Dome
      if (act === 1) {
        // Distant Smoldering Volcano Peak
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.moveTo(180, 110);
        ctx.lineTo(240, 36);
        ctx.lineTo(265, 36);
        ctx.lineTo(320, 110);
        ctx.fill();

        // Glowing Crater Rim & Smoke
        ctx.fillStyle = '#f97316';
        ctx.fillRect(240, 35, 25, 3);
        ctx.fillStyle = '#fdba7488';
        ctx.beginPath();
        ctx.arc(252, 34, 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Subterranean glowing magma stalactites & cavern ceiling arches
        ctx.fillStyle = '#1c0505';
        for (let cx = 0; cx < GAME_WIDTH + 60; cx += 50) {
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.lineTo(cx + 25, 26 + Math.sin(cx + time * 0.02) * 6);
          ctx.lineTo(cx + 50, 0);
          ctx.fill();

          // Magma vein glow
          ctx.fillStyle = '#ef444488';
          ctx.fillRect(cx + 23, 2, 4, 16);
          ctx.fillStyle = '#1c0505';
        }
      }
    } else if (zone === 'krono') {
      // Krono City: Giant Quantum Chrono-Reactor Ring in Sky & Cyber Skyways with Aerocars
      const ringPulse = Math.sin(time * 0.05) * 4;
      ctx.strokeStyle = '#06b6d444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(230, 42, 36 + ringPulse * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#a855f766';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(230, 42, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#06b6d422';
      ctx.beginPath();
      ctx.arc(230, 42, 14, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Chrono Ring Ticks
      for (let tk = 0; tk < 8; tk++) {
        const angle = time * 0.02 + (tk * Math.PI) / 4;
        const tx1 = 230 + Math.cos(angle) * 32;
        const ty1 = 42 + Math.sin(angle) * 32;
        const tx2 = 230 + Math.cos(angle) * 38;
        const ty2 = 42 + Math.sin(angle) * 38;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }

      // Matrix Perspective Cyber-Grid in Sky
      ctx.strokeStyle = '#0284c718';
      ctx.lineWidth = 1;
      for (let gy = 60; gy < 145; gy += 12) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(GAME_WIDTH, gy);
        ctx.stroke();
      }

      // Flying Aerocars / Cyber-Vehicles in skyways
      for (let v = 0; v < 4; v++) {
        const speed = 1.8 + v * 0.7;
        const dir = v % 2 === 0 ? 1 : -1;
        const carX = ((v * 110 + (time * speed * dir)) % (GAME_WIDTH + 80) + GAME_WIDTH + 80) % (GAME_WIDTH + 80) - 40;
        const carY = 24 + v * 14;

        // Vehicle Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(carX, carY, 14, 4);
        // Headlights (Cyan/White) & Taillights (Red)
        if (dir > 0) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(carX - 2, carY + 1, 3, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(carX + 13, carY + 1, 3, 2);
          // Light beam
          ctx.fillStyle = '#38bdf822';
          ctx.fillRect(carX + 16, carY, 16, 4);
        } else {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(carX + 13, carY + 1, 3, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(carX - 2, carY + 1, 3, 2);
          // Light beam
          ctx.fillStyle = '#38bdf822';
          ctx.fillRect(carX - 18, carY, 16, 4);
        }
      }
    } else {
      // Desert Sanctuary: Blazing Ra Sun (Act 1) or Mystical Khonsu Moon (Act 2)
      if (act === 1) {
        // Giant Blazing Solar Disc of Ra with Solar Corona
        ctx.fillStyle = '#fde68a33';
        ctx.beginPath();
        ctx.arc(245, 38, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b66';
        ctx.beginPath();
        ctx.arc(245, 38, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(245, 38, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(245, 38, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mystical Egyptian Crescent Moon & Starry Constellation
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(245, 34, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2e1065';
        ctx.beginPath();
        ctx.arc(240, 32, 16, 0, Math.PI * 2);
        ctx.fill();
        // Constellation stars
        ctx.fillStyle = '#fef08a';
        for (let s = 0; s < 12; s++) {
          const sx = (s * 31 + 17) % GAME_WIDTH;
          const sy = (s * 19 + 11) % 70;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }
    }

    // Parallax Layer 1: Distant Mountains / Cyber Skyscraper Skylines / Basalt Spires / Golden Pyramids
    const p1Offset = (cameraX * 0.08) % 140;
    ctx.fillStyle = zone === 'neon'
      ? (act === 1 ? '#0f2b35' : '#11172e')
      : zone === 'sakura'
      ? (isNight ? '#1b1232' : '#6b274e')
      : zone === 'lavacliff'
      ? (act === 1 ? '#330a0a' : '#220505')
      : zone === 'krono'
      ? (act === 1 ? '#091024' : '#120b29')
      : (act === 1 ? '#78350f' : '#2e1065');

    ctx.beginPath();
    ctx.moveTo(0, 115);
    for (let x = -p1Offset - 140; x <= GAME_WIDTH + 140; x += 35) {
      const h = Math.sin(x * 0.04 + cameraX * 0.001) * 18;
      ctx.lineTo(x, 80 + h);
    }
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.fill();

    // Parallax Layer 2: Midground Silhouettes (Cyber Towers / Pillars / Torii / Basalt Ridges / Ancient Ruins)
    const p2Offset = (cameraX * 0.22) % 100;
    ctx.fillStyle = zone === 'neon'
      ? (act === 1 ? '#15414d' : '#192247')
      : zone === 'sakura'
      ? (isNight ? '#281541' : '#7d335c')
      : zone === 'lavacliff'
      ? (act === 1 ? '#450e0e' : '#330808')
      : zone === 'krono'
      ? (act === 1 ? '#0f1a3a' : '#1d1242')
      : (act === 1 ? '#92400e' : '#3b0764');

    for (let x = -p2Offset - 100; x < GAME_WIDTH + 100; x += 85) {
      if (zone === 'neon') {
        ctx.fillRect(x + 20, 65, 16, 85);
        ctx.fillRect(x + 8, 45, 40, 24);
        ctx.fillStyle = act === 1 ? '#22d3ee55' : '#a855f755';
        ctx.fillRect(x + 24, 72, 4, 6);
        ctx.fillRect(x + 24, 86, 4, 6);
        ctx.fillStyle = act === 1 ? '#15414d' : '#192247';
      } else if (zone === 'sakura') {
        ctx.fillRect(x + 28, 68, 8, 80);
        ctx.beginPath();
        ctx.arc(x + 32, 58, 26, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'lavacliff') {
        // Jagged volcanic columns with glowing cracks
        ctx.fillRect(x + 18, 55, 24, 95);
        ctx.fillStyle = '#ef444455';
        ctx.fillRect(x + 28, 65, 3, 25);
        ctx.fillRect(x + 24, 95, 12, 2);
        ctx.fillStyle = act === 1 ? '#450e0e' : '#330808';
      } else if (zone === 'krono') {
        // Towering Cyber Megastructure Silhouettes with Glowing Windows
        ctx.fillRect(x + 12, 48, 38, 100);
        ctx.fillRect(x + 20, 32, 22, 16);
        // High-tech spire antenna
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + 30, 22, 2, 10);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x + 29, 20, 4, 2);

        // Illuminated Windows Matrix (Cyan / Amber / Magenta / White)
        for (let wy = 56; wy < 125; wy += 14) {
          ctx.fillStyle = (wy + x) % 3 === 0 ? '#38bdf899' : (wy + x) % 3 === 1 ? '#fbbf2499' : '#f43f5e99';
          ctx.fillRect(x + 16, wy, 6, 6);
          ctx.fillRect(x + 26, wy, 6, 6);
          ctx.fillRect(x + 36, wy, 6, 6);
        }
        ctx.fillStyle = act === 1 ? '#0f1a3a' : '#1d1242';
      } else {
        // Ancient Sandstone Obelisks & Ruined Temples
        ctx.fillRect(x + 22, 60, 16, 90);
        ctx.fillStyle = '#f59e0b55';
        ctx.fillRect(x + 26, 70, 8, 30);
        ctx.fillStyle = act === 1 ? '#92400e' : '#3b0764';
        // Stepped top
        ctx.fillRect(x + 20, 56, 20, 4);
        ctx.fillRect(x + 24, 50, 12, 6);
        ctx.fillRect(x + 27, 44, 6, 6);
      }
    }

    // Atmospheric ambient particles (digital bits / sakura petals / volcanic embers / sand dust)
    const count = zone === 'lavacliff' ? 32 : zone === 'krono' ? 30 : zone === 'desert' ? 28 : isNight ? 26 : 18;
    for (let i = 0; i < count; i++) {
      const px = ((i * 47 - cameraX * (zone === 'desert' ? 0.35 : zone === 'krono' ? 0.28 : 0.15) + (time * (zone === 'lavacliff' ? -0.6 : zone === 'desert' ? 1.2 : 0.65))) % (GAME_WIDTH + 40)) - 20;
      const py = (i * 25 + Math.sin(time * 0.05 + i) * 14) % (GAME_HEIGHT - 25);

      if (zone === 'neon') {
        ctx.fillStyle = i % 2 === 0 ? '#4ade80bb' : '#22d3eebb';
        ctx.fillRect(px, py, 2, 2);
      } else if (zone === 'sakura') {
        ctx.fillStyle = isNight ? '#f472b6cc' : '#ffd1e8dd';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'lavacliff') {
        // Floating incandescent volcanic embers rising upwards
        const emberY = (GAME_HEIGHT - ((time * 0.8 + i * 28) % (GAME_HEIGHT + 10)));
        ctx.fillStyle = i % 3 === 0 ? '#fbbf24dd' : i % 2 === 0 ? '#f97316dd' : '#ef4444dd';
        ctx.fillRect(px, emberY, i % 2 === 0 ? 2 : 1.5, i % 2 === 0 ? 2 : 1.5);
      } else if (zone === 'krono') {
        // Floating digital data bits & glowing cyber sparks
        const digitY = ((time * 0.9 + i * 24) % (GAME_HEIGHT + 10));
        ctx.fillStyle = i % 3 === 0 ? '#38bdf8dd' : i % 2 === 0 ? '#a855f7dd' : '#06b6d4ee';
        ctx.fillRect(px, digitY, i % 2 === 0 ? 2 : 1.5, i % 2 === 0 ? 2 : 1.5);
        if (i % 5 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 0.5, digitY + 0.5, 1, 1);
        }
      } else {
        // Golden swirling sand dust & hieroglyphic sparkle specks
        ctx.fillStyle = i % 3 === 0 ? '#fde68acc' : i % 2 === 0 ? '#f59e0bcc' : '#fbbf24cc';
        ctx.fillRect(px, py, i % 2 === 0 ? 2 : 1.5, i % 2 === 0 ? 2 : 1.5);
      }
    }
  }

  public renderLandmarks(landmarks: Landmark[], cameraX: number, time: number) {
    const ctx = this.ctx;
    for (const lm of landmarks) {
      const x = Math.round(lm.x - cameraX);
      if (x < -160 || x > GAME_WIDTH + 160) continue;

      if (lm.type === 'torii') {
        const sc = lm.scale || 1;
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x, 70, Math.round(9 * sc), 78);
        ctx.fillRect(x + Math.round(52 * sc), 70, Math.round(9 * sc), 78);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x - Math.round(8 * sc), 66, Math.round(78 * sc), Math.round(11 * sc));
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(x - Math.round(12 * sc), 60, Math.round(86 * sc), Math.round(7 * sc));
        // Golden plaque
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + Math.round(27 * sc), 70, Math.round(8 * sc), Math.round(12 * sc));
      } else if (lm.type === 'bridge') {
        const w = lm.w || 180;
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x, 140, w, 8);
        for (let bx = x; bx < x + w; bx += 22) {
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(bx, 126, 4, 14);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(bx - 2, 124, 8, 3);
        }
      } else if (lm.type === 'lanterns') {
        const w = lm.w || 200;
        for (let lx = x; lx < x + w; lx += 45) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(lx + 4, 116, 4, 32);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(lx, 106, 12, 11);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lx + 3, 108, 6, 7);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(lx - 2, 103, 16, 4);
        }
      } else if (lm.type === 'volcano_vent') {
        // Volcanic Smoking Fumarole Vent
        const sc = lm.scale || 1;
        ctx.fillStyle = '#260a0a';
        ctx.fillRect(x, 115, Math.round(40 * sc), 35);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x + Math.round(6 * sc), 110, Math.round(28 * sc), 6);
        // Molten core
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + Math.round(10 * sc), 112, Math.round(20 * sc), 3);
        // Rising smoke puffs
        for (let sp = 0; sp < 3; sp++) {
          const smokeY = 100 - ((time * 0.4 + sp * 18) % 45);
          const smokeX = x + Math.round(18 * sc) + Math.sin(time * 0.1 + sp) * 6;
          ctx.fillStyle = '#451a1a88';
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 5 + sp * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (lm.type === 'basalt_arch') {
        // Natural Hexagonal Basalt Monument Arch
        const w = lm.w || 180;
        ctx.fillStyle = '#180707';
        ctx.fillRect(x, 80, 24, 70);
        ctx.fillRect(x + w - 24, 80, 24, 70);
        ctx.fillStyle = '#2b0c0c';
        ctx.fillRect(x - 6, 74, w + 12, 16);
        // Magma Vein Runes
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 10, 95, 4, 30);
        ctx.fillRect(x + w - 14, 95, 4, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + w / 2 - 16, 78, 32, 4);
      } else if (lm.type === 'lava_fall') {
        // Molten Magma Waterfall
        const h = lm.h || 80;
        ctx.fillStyle = '#1c0505';
        ctx.fillRect(x - 4, lm.y || 60, 24, h);
        
        // Cascading Lava
        const lavaFlow = (time * 0.8) % 12;
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x, (lm.y || 60), 16, h);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 4, (lm.y || 60), 8, h);
        ctx.fillStyle = '#ffffff';
        for (let ly = (lm.y || 60); ly < (lm.y || 60) + h; ly += 14) {
          ctx.fillRect(x + 6, ly + lavaFlow, 4, 6);
        }
        // Bottom Splash Glow
        ctx.fillStyle = '#f9731688';
        ctx.beginPath();
        ctx.arc(x + 8, (lm.y || 60) + h, 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'obsidian_pillar') {
        // Obsidian Totem Pillar with glowing runes
        const sc = lm.scale || 1;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(x, 70, Math.round(18 * sc), 80);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 2, 70, Math.round(4 * sc), 80);
        // Runes
        ctx.fillStyle = '#ef4444';
        for (let ry = 80; ry < 140; ry += 16) {
          ctx.fillRect(x + Math.round(7 * sc), ry, 4, 6);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + Math.round(8 * sc), ry + 2, 2, 2);
          ctx.fillStyle = '#ef4444';
        }
      } else if (lm.type === 'magma_pipe') {
        // Volcanic Conduits
        const w = lm.w || 200;
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x, lm.y || 70, w, 10);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x, (lm.y || 70) + 3, w, 4);
        ctx.fillStyle = '#fbbf24';
        const pulse = Math.sin(time * 0.1) * 2;
        ctx.fillRect(x + 10, (lm.y || 70) + 4, w - 20, 2);
      } else if (lm.type === 'pyramid') {
        // Great Stepped Sandstone Pyramid with Golden Pyramidion Capstone
        const sc = lm.scale || 1.4;
        const w = Math.round(180 * sc);
        const h = Math.round(110 * sc);
        const baseY = 148;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(x - w / 2, baseY);
        ctx.lineTo(x, baseY - h);
        ctx.lineTo(x + w / 2, baseY);
        ctx.fill();

        // Shaded side
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(x, baseY - h);
        ctx.lineTo(x + w / 2, baseY);
        ctx.lineTo(x, baseY);
        ctx.fill();

        // Horizontal sandstone tier lines
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        for (let th = baseY - 12; th > baseY - h + 15; th -= 10) {
          const ratio = (baseY - th) / h;
          const curW = w * (1 - ratio);
          ctx.beginPath();
          ctx.moveTo(x - curW / 2, th);
          ctx.lineTo(x + curW / 2, th);
          ctx.stroke();
        }

        // Golden Pyramidion (Capstone)
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(x - 12, baseY - h + 14);
        ctx.lineTo(x, baseY - h);
        ctx.lineTo(x + 12, baseY - h + 14);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - 2, baseY - h + 3, 4, 4);
      } else if (lm.type === 'sphinx') {
        // Monumental Sphinx Guardian
        const sc = lm.scale || 1;
        ctx.fillStyle = '#78350f';
        // Body & Paws
        ctx.fillRect(x, 105, Math.round(90 * sc), 43);
        ctx.fillRect(x + Math.round(75 * sc), 125, Math.round(35 * sc), 23);
        // Head & Nemes Crown
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + Math.round(15 * sc), 75, Math.round(34 * sc), 32);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + Math.round(12 * sc), 72, Math.round(40 * sc), 8);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + Math.round(16 * sc), 74, Math.round(6 * sc), 4);
        ctx.fillRect(x + Math.round(38 * sc), 74, Math.round(6 * sc), 4);
        // Eyes
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x + Math.round(38 * sc), 86, 4, 3);
      } else if (lm.type === 'obelisk') {
        // Tall Egyptian Obelisk with Inscribed Glowing Hieroglyphs
        const sc = lm.scale || 1;
        const obW = Math.round(14 * sc);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, 60, obW, 88);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x + 2, 60, Math.round(4 * sc), 88);
        // Pointed pyramidion apex
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(x + obW / 2, 48);
        ctx.lineTo(x + obW, 60);
        ctx.fill();
        // Glowing Hieroglyphic symbols
        ctx.fillStyle = '#38bdf8';
        for (let gy = 72; gy < 140; gy += 14) {
          ctx.fillRect(x + Math.round(5 * sc), gy, 4, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + Math.round(6 * sc), gy + 1, 2, 2);
          ctx.fillStyle = '#38bdf8';
        }
      } else if (lm.type === 'sand_dune') {
        // Sweeping Windblown Dune
        const w = lm.w || 220;
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(x, 148);
        ctx.quadraticCurveTo(x + w * 0.4, 110, x + w, 148);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(x + 10, 148);
        ctx.quadraticCurveTo(x + w * 0.4, 114, x + w - 10, 148);
        ctx.fill();
      } else if (lm.type === 'pharaoh_statue') {
        // Colossal Seated Pharaoh Sandstone Statue
        const sc = lm.scale || 1;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, 70, Math.round(36 * sc), 78);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + Math.round(6 * sc), 52, Math.round(24 * sc), 22);
        // Crown & Beard
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + Math.round(4 * sc), 42, Math.round(28 * sc), 12);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + Math.round(14 * sc), 74, Math.round(8 * sc), 16);
      } else if (lm.type === 'sarcophagus') {
        // Royal Golden Sarcophagus
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x, 90, 20, 58);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 3, 94, 14, 50);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x + 5, 96, 10, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 7, 110, 6, 6);
      } else if (lm.type === 'oasis') {
        // Desert Oasis with palm trees and water
        const w = lm.w || 140;
        // Water pool
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 20, 140, w - 40, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 25, 142, w - 50, 4);
        // Palm Tree
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 10, 95, 6, 53);
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(x + 13, 95, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x + 13, 92, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'ancient_columns') {
        // Row of grand Egyptian Lotus Columns
        const w = lm.w || 200;
        for (let cx = x; cx < x + w; cx += 45) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(cx + 4, 70, 10, 78);
          // Capital
          ctx.fillStyle = '#b45309';
          ctx.fillRect(cx, 62, 18, 10);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx + 2, 64, 14, 3);
        }
      } else if (lm.type === 'cyber_skyscraper') {
        // Futuristic Krono Megastructure Skyscraper
        const w = lm.w || 80;
        const h = lm.h || 120;
        const sc = lm.scale || 1;
        ctx.fillStyle = '#090e1f';
        ctx.fillRect(x, 148 - h, w, h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 4, 148 - h + 4, w - 8, h - 4);

        // Antenna with pulsating beacon
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + w / 2 - 2, 148 - h - 18, 4, 18);
        ctx.fillStyle = Math.floor(time / 15) % 2 === 0 ? '#f43f5e' : '#fbbf24';
        ctx.fillRect(x + w / 2 - 3, 148 - h - 22, 6, 4);

        // Glowing Window Grids & Neon Circuit Strips
        for (let wy = 148 - h + 12; wy < 144; wy += 16) {
          ctx.fillStyle = (wy + x) % 2 === 0 ? '#38bdf888' : '#a855f788';
          ctx.fillRect(x + 8, wy, 8, 8);
          ctx.fillRect(x + 22, wy, 8, 8);
          ctx.fillRect(x + w - 30, wy, 8, 8);
          ctx.fillRect(x + w - 16, wy, 8, 8);
        }
        // Vertical Neon Conduit
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + w / 2 - 1, 148 - h + 4, 2, h - 4);
      } else if (lm.type === 'holo_billboard') {
        // Holographic Cyber Advertisement Billboard
        const w = lm.w || 70;
        const h = lm.h || 40;
        // Pylon stand
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + w / 2 - 3, 148 - 35, 6, 35);
        // Hologram screen frame
        ctx.fillStyle = '#0284c7';
        ctx.strokeRect(x, 148 - 35 - h, w, h);
        const pulse = 0.6 + Math.sin(time * 0.1) * 0.3;
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.4})`;
        ctx.fillRect(x + 1, 148 - 35 - h + 1, w - 2, h - 2);

        // Holographic Logo / Kronos Icon
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 10, 148 - 35 - h + 8, w - 20, 4);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x + 16, 148 - 35 - h + 16, w - 32, 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + 22, 148 - 35 - h + 24, w - 44, 4);
      } else if (lm.type === 'reactor_core') {
        // Massive Quantum Chrono Fusion Core
        const coreX = x + 35;
        const coreY = 100;
        const pulse = Math.sin(time * 0.1) * 6;
        // Stabilizer Pillars
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, 70, 16, 78);
        ctx.fillRect(x + 54, 70, 16, 78);
        // Plasma Containment Field
        ctx.fillStyle = '#06b6d433';
        ctx.beginPath();
        ctx.arc(coreX, coreY, 26 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(coreX, coreY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(coreX, coreY, 6, 0, Math.PI * 2);
        ctx.fill();
        // Energy arcs
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(coreX, coreY, 22, time * 0.05, time * 0.05 + Math.PI);
        ctx.stroke();
      } else if (lm.type === 'kronos_statue') {
        // Colossal Titan Kronos Mecha Monument
        ctx.fillStyle = '#090e1f';
        ctx.fillRect(x, 65, 48, 83);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 6, 50, 36, 20);
        // Glowing Chrono Core
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + 18, 75, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 22, 79, 4, 4);
        // Visor
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x + 12, 56, 24, 4);
      } else if (lm.type === 'dimensional_rift') {
        // Grand Multiverse Dimensional Rift (Swirling portal of all eras)
        const sc = lm.scale || 1.4;
        const riftX = x + 30;
        const riftY = 80;
        const pulse = Math.sin(time * 0.12) * 6;
        
        // Outer Space-Time Distortion Waves
        ctx.strokeStyle = '#f43f5e55';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(riftX, riftY, (36 + pulse) * sc, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(riftX, riftY, (26 - pulse * 0.5) * sc, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#a855f755';
        ctx.beginPath();
        ctx.arc(riftX, riftY, 18 * sc, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(riftX, riftY, 7 * sc, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Dimensional Shards
        for (let s = 0; s < 6; s++) {
          const sAngle = time * 0.08 + (s * Math.PI) / 3;
          const sx = riftX + Math.cos(sAngle) * (30 * sc);
          const sy = riftY + Math.sin(sAngle) * (20 * sc);
          ctx.fillStyle = s % 3 === 0 ? '#38bdf8' : s % 3 === 1 ? '#f43f5e' : '#fbbf24';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }
      } else if (lm.type === 'travel_beacon') {
        // Kronos Travel Grand Victory Beacon
        const sc = lm.scale || 1.5;
        // Monument Base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 5, 80, Math.round(50 * sc), 68);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 10, 60, Math.round(40 * sc), 20);

        // Eternal Chrono Beacon Core
        const bPulse = 0.6 + Math.sin(time * 0.2) * 0.4;
        ctx.fillStyle = `rgba(56, 189, 248, ${bPulse})`;
        ctx.fillRect(x + 20, 40, Math.round(20 * sc), 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 25, 45, Math.round(10 * sc), 10);

        // Vertical Light Beam Ascending into Space
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(x + 22, 0, Math.round(16 * sc), 40);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x + 26, 0, Math.round(8 * sc), 40);

        // Golden Victory Rings
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 8, 75, Math.round(44 * sc), 4);
      }
    }
  }

  public renderPlatforms(platforms: Platform[], zone: ZoneId, act: number, cameraX: number, time: number) {
    const ctx = this.ctx;
    const isNeon = zone === 'neon';
    const isSakura = zone === 'sakura';
    const isNight = isSakura && act === 2;
    const isLava = zone === 'lavacliff';
    const isKrono = zone === 'krono';
    const isTravel = zone === 'travel';

    for (const p of platforms) {
      if (p.hidden) continue;
      const x = Math.round(p.x - cameraX);
      const y = Math.round(p.y);
      if (x + p.w < -10 || x > GAME_WIDTH + 10) continue;

      if (p.kind === 'ground' || p.kind === 'arena') {
        // Base foundation
        ctx.fillStyle = isNeon
          ? '#091520'
          : isSakura
          ? (isNight ? '#160d24' : '#351428')
          : isLava
          ? '#1a0606'
          : isKrono
          ? '#090e1f'
          : isTravel
          ? '#0c0a1f'
          : (act === 1 ? '#451a03' : '#1e0a2b');
        ctx.fillRect(x, y, p.w, p.h);

        // Pattern accents (circuits / roots / magma fissures / hieroglyphs / cyber plating)
        if (isNeon) {
          ctx.fillStyle = '#06b6d422';
          for (let cx = x + 10; cx < x + p.w - 10; cx += 32) {
            ctx.fillRect(cx, y + 6, 14, 2);
            ctx.fillRect(cx + 6, y + 8, 2, 10);
          }
        } else if (isLava) {
          ctx.fillStyle = '#ef444433';
          for (let lx = x + 12; lx < x + p.w - 12; lx += 28) {
            ctx.fillRect(lx, y + 5, 12, 2);
            ctx.fillRect(lx + 4, y + 7, 2, 8);
          }
        } else if (isKrono || isTravel) {
          // Futuristic Cyber-Grid & Matrix Data Conduits
          ctx.fillStyle = isTravel ? '#f43f5e33' : '#06b6d433';
          for (let kx = x + 8; kx < x + p.w - 8; kx += 24) {
            ctx.fillRect(kx, y + 4, 12, 2);
            ctx.fillRect(kx + 4, y + 6, 2, 8);
            ctx.fillStyle = isTravel ? '#38bdf844' : '#a855f744';
            ctx.fillRect(kx + 10, y + 8, 4, 2);
            ctx.fillStyle = isTravel ? '#f43f5e33' : '#06b6d433';
          }
        } else if (zone === 'desert') {
          ctx.fillStyle = '#f59e0b33';
          for (let dx = x + 12; dx < x + p.w - 12; dx += 30) {
            ctx.fillRect(dx, y + 5, 10, 2);
            ctx.fillRect(dx + 4, y + 7, 2, 6);
          }
        }

        // Glowing Surface Trim
        ctx.fillStyle = isNeon
          ? '#06b6d4'
          : isSakura
          ? (isNight ? '#c084fc' : '#fb7185')
          : isLava
          ? '#ea580c'
          : isKrono
          ? '#06b6d4'
          : isTravel
          ? '#38bdf8'
          : '#f59e0b';
        ctx.fillRect(x, y, p.w, 3);
        ctx.fillStyle = isNeon
          ? '#67e8f9'
          : isSakura
          ? (isNight ? '#e9d5ff' : '#fecdd3')
          : isLava
          ? '#fbbf24'
          : isKrono
          ? '#67e8f9'
          : isTravel
          ? '#f43f5e'
          : '#fde68a';
        ctx.fillRect(x, y, p.w, 1);
      } else if (p.kind === 'conveyor') {
        // Cybernetic Conveyor Belt with animated chevron arrows
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, p.w, p.h);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x, y, p.w, 2);

        // Animated Moving Chevrons
        const speed = p.speed || 1.5;
        const dir = p.dir || 1;
        const offset = ((time * speed * dir) % 16 + 16) % 16;
        ctx.fillStyle = '#38bdf8';
        for (let cx = x - 16 + offset; cx < x + p.w; cx += 16) {
          if (cx >= x && cx + 8 <= x + p.w) {
            ctx.fillRect(cx, y + 4, 6, 2);
            if (dir > 0) {
              ctx.fillRect(cx + 4, y + 3, 2, 4);
            } else {
              ctx.fillRect(cx, y + 3, 2, 4);
            }
          }
        }
      } else if (p.kind === 'hologram') {
        // Translucent Hologram Platform
        const pulse = 0.5 + Math.sin(time * 0.15) * 0.3;
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.5})`;
        ctx.fillRect(x, y, p.w, p.h);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, p.w, p.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 2, y + 1, p.w - 4, 1);
      } else if (p.kind === 'quicksand') {
        // Quicksand Shifting Sands Platform
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x, y, p.w, p.h);
        ctx.fillStyle = '#d97706';
        for (let qx = x; qx < x + p.w; qx += 8) {
          const shift = Math.sin(time * 0.12 + qx * 0.15) * 1.5;
          ctx.fillRect(qx, y + shift, 6, 3);
        }
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, y, p.w, 1);
      } else if (p.kind === 'moon') {
        // Phasing Moon Platforms with Pulsing Glow
        const pulse = 0.5 + Math.sin(time * 0.1) * 0.25;
        ctx.fillStyle = `rgba(192, 132, 252, ${pulse * 0.6})`;
        ctx.fillRect(x, y, p.w, p.h);
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, p.w, p.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 2, p.w - 8, 1);
      } else if (p.kind === 'sinking' || p.kind === 'basalt') {
        // Sinking Basalt Rocks over Lava Pools
        const isSinkingType = p.kind === 'sinking';
        const sinkAmt = p.sinkOffset || 0;
        
        ctx.fillStyle = '#1c0808';
        ctx.fillRect(x, y, p.w, p.h);

        // Heat glow around sinking rock edges
        const heatColor = sinkAmt > 6 ? '#ef4444' : '#f97316';
        ctx.fillStyle = heatColor;
        ctx.fillRect(x, y, p.w, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 3, y, p.w - 6, 1);

        // Volcanic cracks on basalt block
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 6, y + 3, 6, 2);
        ctx.fillRect(x + p.w - 12, y + 4, 6, 2);

        // If sinking, show warning bubbles underneath
        if (sinkAmt > 2) {
          ctx.fillStyle = '#fb923c88';
          ctx.fillRect(x - 2, y + p.h, p.w + 4, 3);
        }
      } else {
        // Floating Ledges & Elevated Platforms
        // Drop shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(x + 1, y + p.h, p.w, 3);

        ctx.fillStyle = isNeon
          ? '#103947'
          : isSakura
          ? (isNight ? '#250d4f' : '#6b1338')
          : isLava
          ? '#2d0c0c'
          : isKrono
          ? '#0f172a'
          : (act === 1 ? '#78350f' : '#3b0764');
        ctx.fillRect(x, y, p.w, p.h);

        // Subtle textured accent / bracket
        ctx.fillStyle = isNeon
          ? '#06b6d433'
          : isSakura
          ? '#f472b633'
          : isLava
          ? '#ef444433'
          : isKrono
          ? '#38bdf833'
          : '#f59e0b33';
        ctx.fillRect(x + 4, y + 3, p.w - 8, p.h - 5);

        // Glowing Surface Trim
        ctx.fillStyle = isNeon
          ? '#22d3ee'
          : isSakura
          ? (isNight ? '#d8b4fe' : '#fda4af')
          : isLava
          ? '#f97316'
          : isKrono
          ? '#06b6d4'
          : '#f59e0b';
        ctx.fillRect(x, y, p.w, 2);

        // Highlight line
        ctx.fillStyle = '#ffffffcc';
        ctx.fillRect(x + 2, y, p.w - 4, 1);

        // Metallic corner brackets
        ctx.fillStyle = '#ffffff66';
        ctx.fillRect(x, y, 2, 2);
        ctx.fillRect(x + p.w - 2, y, 2, 2);
      }
    }
  }

  public renderHazards(hazards: Hazard[], cameraX: number, time: number) {
    const ctx = this.ctx;
    for (const h of hazards) {
      const x = Math.round(h.x - cameraX);
      if (x + h.w < -15 || x > GAME_WIDTH + 15) continue;

      if (h.type === 'spike' || h.type === 'sandSpike') {
        const isDesertSpike = h.type === 'sandSpike';
        // Metallic / Golden Desert Spikes
        for (let sx = x; sx < x + h.w; sx += 8) {
          ctx.fillStyle = isDesertSpike ? '#451a03' : '#450a0a';
          ctx.beginPath();
          ctx.moveTo(sx, h.y + h.h);
          ctx.lineTo(sx + 4, h.y);
          ctx.lineTo(sx + 8, h.y + h.h);
          ctx.fill();

          ctx.fillStyle = isDesertSpike ? '#f59e0b' : '#ef4444';
          ctx.beginPath();
          ctx.moveTo(sx + 2, h.y + h.h);
          ctx.lineTo(sx + 4, h.y + 1);
          ctx.lineTo(sx + 6, h.y + h.h);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx + 3, h.y + 2, 2, 3);
        }
      } else if (h.type === 'swingingBlade') {
        // Pendulum Bronze / Steel Razor Blade
        const pivotX = x + h.w / 2;
        const pivotY = h.y;
        const length = 55;
        const angle = h.bladeAngle || 0;
        const endX = pivotX + Math.sin(angle) * length;
        const endY = pivotY + Math.cos(angle) * length;

        // Chain
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Heavy Crescent Blade
        ctx.save();
        ctx.translate(endX, endY);
        ctx.rotate(angle);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 2, 10, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
      } else if (h.type === 'fallingBlock') {
        // Sandstone Ancient Falling Block
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, h.y + 2, h.w - 4, h.h - 4);
        // Hieroglyphic Inscription
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + h.w / 2 - 3, h.y + 4, 6, 6);
      } else if (h.type === 'curseRune') {
        // Mystical Eye of Horus Floor Trap Rune
        const pulse = 0.5 + Math.sin(time * 0.15) * 0.35;
        ctx.fillStyle = `rgba(168, 85, 247, ${pulse * 0.5})`;
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + h.w / 2 - 3, h.y + 2, 6, 4);
      } else if (h.type === 'laserGate') {
        const isActive = h.active !== false;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 2, h.y - 2, h.w + 4, 4);
        ctx.fillRect(x - 2, h.y + h.h - 2, h.w + 4, 4);

        if (isActive) {
          const pulseAlpha = 0.6 + Math.sin(time * 0.3) * 0.35;
          ctx.fillStyle = `rgba(6, 182, 212, ${pulseAlpha * 0.4})`;
          ctx.fillRect(x, h.y + 2, h.w, h.h - 4);

          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(x + h.w / 2 - 1.5, h.y + 2, 3, h.h - 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + h.w / 2 - 0.5, h.y + 2, 1, h.h - 4);
        } else {
          ctx.fillStyle = Math.floor(time / 10) % 2 === 0 ? '#f43f5e' : '#475569';
          ctx.fillRect(x + h.w / 2 - 2, h.y, 4, 3);
        }
      } else if (h.type === 'water') {
        ctx.fillStyle = '#0284c788';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#38bdf8';
        for (let wx = x; wx < x + h.w; wx += 8) {
          const waveY = h.y + Math.sin(time * 0.15 + wx * 0.1) * 2;
          ctx.fillRect(wx, waveY, 6, 2);
        }
      } else if (h.type === 'lava') {
        // Animated Molten Magma / Lava Lake
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x, h.y + 2, h.w, h.h - 2);

        // Molten lava ripples and bubbling crust
        for (let lx = x; lx < x + h.w; lx += 10) {
          const bubble = Math.sin(time * 0.18 + lx * 0.2) * 3;
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(lx, h.y + bubble, 8, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(lx + 2, h.y + bubble + 1, 4, 2);
        }
      } else if (h.type === 'geyser') {
        // Volcanic Flame Geyser
        const isErupting = h.erupting;
        const isWarning = h.warnTimer && h.warnTimer > 0;

        // Ground nozzle vent
        ctx.fillStyle = '#260a0a';
        ctx.fillRect(x, 142, h.w, 8);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 3, 144, h.w - 6, 3);

        if (isErupting) {
          // Towering Flame Column
          const fGrad = ctx.createLinearGradient(x, 148 - 60, x, 148);
          fGrad.addColorStop(0, '#fef08a');
          fGrad.addColorStop(0.3, '#f97316');
          fGrad.addColorStop(1, '#ef4444');
          ctx.fillStyle = fGrad;
          ctx.fillRect(x + 2, 148 - 60, h.w - 4, 60);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + h.w / 2 - 2, 148 - 56, 4, 50);
        } else if (isWarning) {
          // Warning Smoke Puffs
          const smokeY = 136 - ((time * 0.6) % 18);
          ctx.fillStyle = '#7f1d1d99';
          ctx.beginPath();
          ctx.arc(x + h.w / 2, smokeY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'stalactite') {
        // Jagged Volcanic Stalactite
        ctx.fillStyle = '#260a0a';
        ctx.beginPath();
        ctx.moveTo(x, h.y);
        ctx.lineTo(x + h.w, h.y);
        ctx.lineTo(x + h.w / 2, h.y + h.h);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(x + 2, h.y + 2);
        ctx.lineTo(x + h.w - 2, h.y + 2);
        ctx.lineTo(x + h.w / 2, h.y + h.h - 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + h.w / 2 - 1, h.y + 3, 2, 6);
      } else if (h.type === 'bamboo' || h.type === 'branch') {
        ctx.fillStyle = '#14532d';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 2, h.y - 2, h.w - 4, 3);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(x + 4, h.y - 4, 3, 3);
      } else if (h.type === 'empFloor') {
        // High voltage electrified neon floor
        const pulse = 0.5 + Math.sin(time * 0.25) * 0.45;
        ctx.fillStyle = '#083344';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse})`;
        ctx.fillRect(x, h.y + 1, h.w, 3);
        for (let ex = x + 4; ex < x + h.w; ex += 12) {
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(ex, h.y + 1, 2, 6);
        }
      } else if (h.type === 'plasmaBeam') {
        // High powered vertical laser column
        const pulse = 0.7 + Math.sin(time * 0.35) * 0.3;
        ctx.fillStyle = `rgba(34, 211, 238, ${pulse * 0.4})`;
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x + h.w / 2 - 2, h.y, 4, h.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + h.w / 2 - 0.5, h.y, 1, h.h);
      } else if (h.type === 'crusher') {
        // Heavy Hydraulic Crusher Piston
        const isWarning = h.crushState === 'warning';
        const isSlamming = h.crushState === 'slamming';

        // Piston Rod from ceiling
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + h.w / 2 - 3, 0, 6, Math.max(0, h.y));
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + h.w / 2 - 1, 0, 2, Math.max(0, h.y));

        // Crusher Block Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 1, h.y + 1, h.w - 2, h.h - 2);

        // Hazard Chevron Stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 2, h.y + 3, h.w - 4, 7);
        ctx.clip();
        for (let sx = x - 12; sx < x + h.w + 12; sx += 8) {
          ctx.fillStyle = isWarning ? '#ef4444' : '#eab308';
          ctx.beginPath();
          ctx.moveTo(sx, h.y + 10);
          ctx.lineTo(sx + 4, h.y + 3);
          ctx.lineTo(sx + 7, h.y + 3);
          ctx.lineTo(sx + 3, h.y + 10);
          ctx.fill();
        }
        ctx.restore();

        // Warning LED Sensor
        const ledColor = (isWarning || isSlamming)
          ? (Math.floor(time / 4) % 2 === 0 ? '#ef4444' : '#fee2e2')
          : '#22c55e';
        ctx.fillStyle = ledColor;
        ctx.fillRect(x + h.w / 2 - 2, h.y + h.h - 5, 4, 3);

        // Heavy Iron Crushing Base Plate
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, h.y + h.h - 2, h.w, 2);
      } else if (h.type === 'sawBlade') {
        // High Speed Buzzsaw Traversing Rail
        const minRx = Math.round((h.railMin ?? (h.x - 70)) - cameraX);
        const maxRx = Math.round((h.railMax ?? (h.x + 70)) - cameraX);

        // Guide Rail
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(minRx, h.y + h.h / 2 - 1.5, maxRx - minRx, 3);
        ctx.fillStyle = '#475569';
        ctx.fillRect(minRx, h.y + h.h / 2 - 0.5, maxRx - minRx, 1);
        ctx.fillRect(minRx - 2, h.y + h.h / 2 - 3, 3, 6);
        ctx.fillRect(maxRx - 1, h.y + h.h / 2 - 3, 3, 6);

        // Spinning Saw Blade
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const radius = Math.max(7, h.w / 2);
        const angle = h.bladeAngle || 0;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Serrated Teeth
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
          const a1 = (i / teeth) * Math.PI * 2;
          const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
          const a3 = ((i + 1) / teeth) * Math.PI * 2;
          ctx.lineTo(Math.cos(a1) * (radius - 2), Math.sin(a1) * (radius - 2));
          ctx.lineTo(Math.cos(a2) * (radius + 2.5), Math.sin(a2) * (radius + 2.5));
          ctx.lineTo(Math.cos(a3) * (radius - 2), Math.sin(a3) * (radius - 2));
        }
        ctx.closePath();
        ctx.fill();

        // Inner Metallic Disc & Axle Rivet
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      } else if (h.type === 'flameJet') {
        // Flame Jet Pipe Nozzle
        const isErupting = h.erupting;
        const isWarning = h.warnTimer && h.warnTimer > 0;
        const isRight = h.flameAngle === 1;

        if (isRight) {
          // Wall-mounted horizontal nozzle
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, h.y, 6, h.h);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + 6, h.y + 2, 4, h.h - 4);

          if (isErupting) {
            const fGrad = ctx.createLinearGradient(x + 10, h.y, x + 46, h.y);
            fGrad.addColorStop(0, '#ffffff');
            fGrad.addColorStop(0.25, '#fef08a');
            fGrad.addColorStop(0.65, '#f97316');
            fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.moveTo(x + 10, h.y + 2);
            ctx.lineTo(x + 46, h.y - 4);
            ctx.lineTo(x + 46, h.y + h.h + 4);
            ctx.lineTo(x + 10, h.y + h.h - 2);
            ctx.closePath();
            ctx.fill();
          } else if (isWarning) {
            ctx.fillStyle = Math.floor(time / 4) % 2 === 0 ? '#ef4444' : '#f97316';
            ctx.fillRect(x + 8, h.y + h.h / 2 - 1.5, 3, 3);
          }
        } else {
          // Ground-mounted vertical nozzle
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, h.y + h.h - 6, h.w, 6);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + 2, h.y + h.h - 9, h.w - 4, 3);

          if (isErupting) {
            const fGrad = ctx.createLinearGradient(x, h.y + h.h - 9, x, h.y - 36);
            fGrad.addColorStop(0, '#ffffff');
            fGrad.addColorStop(0.3, '#fef08a');
            fGrad.addColorStop(0.7, '#f97316');
            fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.moveTo(x + 2, h.y + h.h - 9);
            ctx.lineTo(x - 4, h.y - 36);
            ctx.lineTo(x + h.w + 4, h.y - 36);
            ctx.lineTo(x + h.w - 2, h.y + h.h - 9);
            ctx.closePath();
            ctx.fill();
          } else if (isWarning) {
            ctx.fillStyle = Math.floor(time / 4) % 2 === 0 ? '#ef4444' : '#f97316';
            ctx.fillRect(x + h.w / 2 - 1.5, h.y + h.h - 11, 3, 3);
          }
        }
      } else if (h.type === 'teslaPillar') {
        // High-Voltage Tesla Lightning Coil
        const isActive = h.active;
        const cy = h.y + 10;
        const cx = x + h.w / 2;

        // Base & Ceramic Rings
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 2, h.y + h.h - 5, h.w - 4, 5);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 4, h.y + 8, h.w - 8, h.h - 13);

        // Insulator Ribs
        ctx.fillStyle = '#78350f';
        for (let ry = h.y + 10; ry < h.y + h.h - 6; ry += 4) {
          ctx.fillRect(x + 3, ry, h.w - 6, 1.5);
        }

        // Glowing Spherical Electrode Core
        const coreColor = isActive ? '#67e8f9' : '#0369a1';
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);

        if (isActive) {
          // Pulsing Electric Field Dome
          const pulse = 0.5 + Math.sin(time * 0.3) * 0.4;
          ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, 18, 0, Math.PI * 2);
          ctx.stroke();

          // Crackling Lightning Arcs
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const arcAngle = (time * 0.4) % (Math.PI * 2);
          const midX = cx + Math.cos(arcAngle) * 9 + (Math.random() - 0.5) * 4;
          const midY = cy + Math.sin(arcAngle) * 9 + (Math.random() - 0.5) * 4;
          const endX = cx + Math.cos(arcAngle) * 18;
          const endY = cy + Math.sin(arcAngle) * 18;
          ctx.lineTo(midX, midY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      } else if (h.type === 'acidPool') {
        // Corrosive Acid Vat Container
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#052e16';
        ctx.fillRect(x + 1, h.y + 2, h.w - 2, h.h - 2);

        // Bubbling Caustic Fluid
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 1, h.y + 2, h.w - 2, h.h - 2);
        ctx.fillStyle = '#22c55e';
        for (let ax = x + 2; ax < x + h.w - 2; ax += 8) {
          const wave = Math.sin(time * 0.18 + ax * 0.25) * 2;
          ctx.fillRect(ax, h.y + 1 + wave, 6, 2);
        }
        // Glowing Acid Highlights
        ctx.fillStyle = '#86efac';
        for (let ax = x + 4; ax < x + h.w - 4; ax += 14) {
          const bubbleY = h.y + 3 + ((time * 0.4 + ax) % 6);
          ctx.fillRect(ax, bubbleY, 2, 2);
        }
      } else if (h.type === 'dartTrap') {
        // Wall Mounted Dart Launcher Sentry
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 2, h.y + 2, h.w - 4, h.h - 4);

        // Aperture Slit
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 3, h.y + h.h / 2 - 1.5, h.w - 6, 3);

        // Targeting Sensor Indicator
        const cooldown = h.shootCooldown || 0;
        ctx.fillStyle = cooldown > 65 ? '#ef4444' : '#d97706';
        ctx.fillRect(x + h.w / 2 - 1, h.y + 3, 2, 2);
      } else if (h.type === 'rotatingFireChain') {
        // Rotating Plasma Fire Chain
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const length = h.chainLength || 46;
        const orbs = h.orbCount || 4;
        const angle = h.bladeAngle || 0;

        // Pivot Hub Base
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);

        // Fiery Chain & Revolving Plasma Fire Orbs
        for (let o = 1; o <= orbs; o++) {
          const dist = (length / orbs) * o;
          const ox = cx + Math.cos(angle) * dist;
          const oy = cy + Math.sin(angle) * dist;

          // Connecting fiery plasma beam
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(ox, oy);
          ctx.stroke();

          // Fire Orb Outer Aura
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.beginPath();
          ctx.arc(ox, oy, 7, 0, Math.PI * 2);
          ctx.fill();

          // Fire Orb Core Flame
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Incandescent white center
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(ox, oy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'proximityMine') {
        const cx = x + h.w / 2;
        const cy = h.y + h.h - 4;

        if (h.detonated) {
          // Burnt detonated crater casing
          ctx.fillStyle = '#18181b';
          ctx.fillRect(x + 2, cy - 1, h.w - 4, 3);
          ctx.fillStyle = '#3f3f46';
          ctx.fillRect(cx - 2, cy - 2, 4, 1);
        } else {
          // Metallic sensor mine chassis
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(cx, cy, h.w / 2, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Armored rim
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 2, cy - 2, h.w - 4, 3);

          // Sensor Dome
          const isTriggered = h.mineTriggered;
          const warn = h.warnTimer || 0;
          const blink = isTriggered ? (Math.floor(warn / 3) % 2 === 0) : true;
          const domeColor = isTriggered ? (blink ? '#ef4444' : '#fee2e2') : '#38bdf8';

          ctx.fillStyle = domeColor;
          ctx.beginPath();
          ctx.arc(cx, cy - 2, 3, 0, Math.PI * 2);
          ctx.fill();

          // Exclamation indicator when armed/triggered
          if (isTriggered) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cx - 1, cy - 10, 2, 4);
            ctx.fillRect(cx - 1, cy - 4, 2, 1.5);
          }
        }
      } else if (h.type === 'antigravRift') {
        // Shimmering Antigravity Spatial Vortex
        const pulse = 0.6 + Math.sin(time * 0.1 + h.x) * 0.35;
        const grad = ctx.createLinearGradient(x, h.y + h.h, x, h.y);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(192, 132, 252, 0.05)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, h.y, h.w, h.h);

        // Top & Bottom Polarizer Emitters
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 2, h.y + h.h - 3, h.w + 4, 3);
        ctx.fillRect(x - 2, h.y, h.w + 4, 2);

        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x, h.y + h.h - 4, h.w, 1.5);
        ctx.fillRect(x, h.y + 1, h.w, 1);

        // Floating energy chevrons pointing up
        const chevY = (h.y + h.h - ((time * 1.4 + h.x * 2) % h.h));
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, chevY + 3);
        ctx.lineTo(x + h.w / 2, chevY - 2);
        ctx.lineTo(x + h.w - 4, chevY + 3);
        ctx.stroke();
      } else if (h.type === 'electricArc') {
        // High-Voltage Oscillating Plasma Arc
        const tx = Math.round((h.targetX ?? h.x) - cameraX);
        const ty = Math.round(h.targetY ?? (h.y + (h.beamLength || 48)));

        // Emitter Node 1 (Start)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 3, h.y - 3, 6, 6);
        ctx.fillStyle = h.active ? '#38bdf8' : (h.warnTimer && h.warnTimer > 0 ? '#facc15' : '#64748b');
        ctx.fillRect(x - 1.5, h.y - 1.5, 3, 3);

        // Emitter Node 2 (Target)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx - 3, ty - 3, 6, 6);
        ctx.fillStyle = h.active ? '#38bdf8' : (h.warnTimer && h.warnTimer > 0 ? '#facc15' : '#64748b');
        ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);

        if (h.active) {
          // Crackling high-power lightning bolt
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, h.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, h.y);
          const segments = 4;
          for (let s = 1; s < segments; s++) {
            const st = s / segments;
            const sx = x + (tx - x) * st + (Math.random() - 0.5) * 8;
            const sy = h.y + (ty - h.y) * st + (Math.random() - 0.5) * 8;
            ctx.lineTo(sx, sy);
          }
          ctx.lineTo(tx, ty);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (h.warnTimer && h.warnTimer > 0) {
          // Telegraph warning spark trail
          if (Math.floor(time / 3) % 2 === 0) {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, h.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      } else if (h.type === 'rollingSpikeBall') {
        // Heavy Armored Rolling Spike Ball
        const radius = (h.w || 16) / 2;
        const cx = x + radius;
        const cy = h.y + radius;
        const angle = h.spinAngle || 0;

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + radius - 1, radius * 0.9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // 8 Spikes protruding outwards
        const spikeCount = 8;
        const spikeLen = radius * 0.55;
        for (let s = 0; s < spikeCount; s++) {
          const sa = (s * Math.PI * 2) / spikeCount;
          ctx.save();
          ctx.rotate(sa);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(-3, -radius + 1);
          ctx.lineTo(0, -radius - spikeLen);
          ctx.lineTo(3, -radius + 1);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-1, -radius - spikeLen + 2, 2, spikeLen - 2);
          ctx.restore();
        }

        // Iron Core Ball
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Metallic reflection highlight
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Warning core beacon
        const pulse = Math.sin(time * 0.2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (h.type === 'retractableSpikes') {
        // High-Tech Retractable Floor Spikes
        // 1. Metal Base Casing embedded into platform
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, h.y + h.h - 4, h.w, 4);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 1, h.y + h.h - 3, h.w - 2, 2);

        const phase = h.spikePhase || 'retracted';

        // 2. LED Status Indicator
        if (phase === 'retracted') {
          // Safe green LED
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 2, h.y + h.h - 2, 3, 1.5);
          ctx.fillRect(x + h.w - 5, h.y + h.h - 2, 3, 1.5);
        } else if (phase === 'warning') {
          // Warning blinking amber LED + vibrating tips
          const blink = Math.floor(time / 4) % 2 === 0;
          ctx.fillStyle = blink ? '#facc15' : '#713f12';
          ctx.fillRect(x + 2, h.y + h.h - 2, 3, 1.5);
          ctx.fillRect(x + h.w - 5, h.y + h.h - 2, 3, 1.5);

          // Peeking spike tips vibrating
          const count = Math.max(2, Math.floor(h.w / 6));
          const step = h.w / count;
          const jitter = (Math.random() - 0.5) * 1;
          for (let i = 0; i < count; i++) {
            const sx = x + i * step + step / 2 + jitter;
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(sx - 2, h.y + h.h - 4);
            ctx.lineTo(sx, h.y + h.h - 7);
            ctx.lineTo(sx + 2, h.y + h.h - 4);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // Extended Deadly Red Spikes!
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x + 2, h.y + h.h - 2, 3, 1.5);
          ctx.fillRect(x + h.w - 5, h.y + h.h - 2, 3, 1.5);

          // Full razor-sharp steel spikes protruding
          const count = Math.max(2, Math.floor(h.w / 6));
          const step = h.w / count;
          for (let i = 0; i < count; i++) {
            const sx = x + i * step + step / 2;
            // Spike shadow
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.moveTo(sx - 3, h.y + h.h - 4);
            ctx.lineTo(sx, h.y - 4);
            ctx.lineTo(sx + 3, h.y + h.h - 4);
            ctx.closePath();
            ctx.fill();

            // Spike blade highlight
            ctx.fillStyle = '#f87171';
            ctx.beginPath();
            ctx.moveTo(sx - 1, h.y + h.h - 4);
            ctx.lineTo(sx, h.y - 4);
            ctx.lineTo(sx + 2, h.y + h.h - 4);
            ctx.closePath();
            ctx.fill();

            // Energy edge
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx - 0.5, h.y - 2, 1, h.h);
          }
        }
      } else if (h.type === 'plasmaTurret') {
        // Stationary Cyber Plasma Turret
        const dir = h.shootDir || h.dir || 1;
        const cd = h.shootCooldown || 0;

        // Base mount
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, h.y + h.h - 4, h.w, 4);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 2, h.y + h.h - 6, h.w - 4, 3);

        // Rotating cannon body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x + h.w / 2, h.y + h.h / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cannon barrel pointing in shoot direction
        const barrelX = dir === 1 ? x + h.w / 2 : x + h.w / 2 - 8;
        ctx.fillStyle = '#475569';
        ctx.fillRect(barrelX, h.y + h.h / 2 - 2, 8, 4);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(barrelX + (dir === 1 ? 5 : 1), h.y + h.h / 2 - 2.5, 2, 5); // Energy ring

        // Glowing core
        const charge = Math.min(1, cd / 90);
        ctx.fillStyle = charge > 0.6 ? '#22d3ee' : '#0284c7';
        ctx.beginPath();
        ctx.arc(x + h.w / 2, h.y + h.h / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Aiming laser guide line when charging
        if (cd >= 50 && cd < 95) {
          const laserStart = dir === 1 ? x + h.w + 2 : x - 2;
          const laserEnd = dir === 1 ? laserStart + 160 : laserStart - 160;
          ctx.strokeStyle = cd >= 75 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(laserStart, h.y + h.h / 2);
          ctx.lineTo(laserEnd, h.y + h.h / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (h.type === 'gravityVortex') {
        // Quantum Gravitational Singularity Vortex
        const radius = (h.w || 20) / 2;
        const cx = x + radius;
        const cy = h.y + radius;
        const spin = h.spinAngle || 0;

        // Outer swirling energy disc
        const outerPulse = Math.sin(time * 0.1) * 0.15 + 0.35;
        const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, radius * 2.2);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
        grad.addColorStop(0.4, `rgba(56, 189, 248, ${outerPulse})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 3 Curved swirling spiral arms
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);
        for (let a = 0; a < 3; a++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.strokeStyle = a % 2 === 0 ? '#c084fc' : '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 0.7);
          ctx.stroke();
        }
        ctx.restore();

        // Singularity Dark Core
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Photon ring around event horizon
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  public renderCollectibles(
    crystals: Collectible[],
    secrets: SecretItem[],
    heals: Collectible[],
    checkpoints: Checkpoint[],
    nodes: NodePillar[],
    goal: { x: number; y: number; w: number; h: number } | null,
    zone: ZoneId,
    act: number,
    bossDefeated: boolean,
    cameraX: number,
    time: number,
    specialStagePortal?: { x: number; y: number; w: number; h: number } | null,
    specialStageExitPortal?: { x: number; y: number; w: number; h: number } | null
  ) {
    const ctx = this.ctx;

    // Crystals
    for (const c of crystals) {
      if (c.taken) continue;
      const x = Math.round(c.x - cameraX);
      if (x < -20 || x > GAME_WIDTH + 20) continue;
      const bob = Math.sin(time * 0.08 + (c.t || 0)) * 2.5;

      ctx.fillStyle = zone === 'neon' ? '#0891b2' : zone === 'sakura' ? '#be185d' : '#ea580c';
      ctx.fillRect(x + 2, c.y + bob, 4, 10);
      ctx.fillStyle = zone === 'neon' ? '#22d3ee' : zone === 'sakura' ? '#f472b6' : '#fb923c';
      ctx.fillRect(x, c.y + 3 + bob, 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, c.y + 2 + bob, 2, 6);
    }

    // Heals
    for (const h of heals) {
      if (h.taken) continue;
      const x = Math.round(h.x - cameraX);
      if (x < -20 || x > GAME_WIDTH + 20) continue;
      const bob = Math.sin(time * 0.07 + h.x) * 2;

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 4, h.y + bob, 2, 10);
      ctx.fillRect(x + 1, h.y + 3 + bob, 8, 4);
      ctx.fillStyle = '#fecaca';
      ctx.fillRect(x + 4, h.y + 2 + bob, 2, 6);
    }

    // Secrets
    for (const s of secrets) {
      if (s.taken) continue;
      const x = Math.round(s.x - cameraX);
      if (x < -20 || x > GAME_WIDTH + 20) continue;
      const bob = Math.sin(time * 0.09 + s.x) * 2;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + 5, s.y + 5 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 3, s.y + 3 + bob, 4, 4);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, s.y + bob, 10, 10);
    }

    // Checkpoints & Holographic Safe Sanctuary Field
    for (const cp of checkpoints) {
      const x = Math.round(cp.x - cameraX);
      if (x < -60 || x > GAME_WIDTH + 60) continue;

      const groundY = cp.y + 40;

      // 1. Holographic Protected Sanctuary Floor Plate & Perimeter
      const sancW = 56;
      const sancX = x + 5 - sancW / 2;
      const sancPulse = 0.5 + Math.sin(time * 0.1) * 0.25;

      // Safe floor perimeter glow
      ctx.fillStyle = cp.active ? `rgba(34, 197, 94, ${sancPulse * 0.25})` : `rgba(56, 189, 248, ${sancPulse * 0.15})`;
      ctx.fillRect(sancX, groundY - 2, sancW, 4);

      // Sanctuary perimeter boundary brackets
      ctx.strokeStyle = cp.active ? '#4ade80' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Left bracket
      ctx.moveTo(sancX, groundY - 4);
      ctx.lineTo(sancX, groundY + 1);
      ctx.lineTo(sancX + 5, groundY + 1);
      // Right bracket
      ctx.moveTo(sancX + sancW, groundY - 4);
      ctx.lineTo(sancX + sancW, groundY + 1);
      ctx.lineTo(sancX + sancW - 5, groundY + 1);
      ctx.stroke();

      // Holographic sanctuary beam when activated
      if (cp.active) {
        const beamGrad = ctx.createLinearGradient(x + 5, groundY, x + 5, cp.y - 12);
        beamGrad.addColorStop(0, 'rgba(74, 222, 128, 0.22)');
        beamGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(x - 8, cp.y - 12, 26, groundY - (cp.y - 12));
      }

      // 2. Heavy Titanium Flag Base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 1, groundY - 3, 8, 3);
      ctx.fillStyle = cp.active ? '#22c55e' : '#64748b';
      ctx.fillRect(x + 3, groundY - 4, 4, 1);

      // Flagpole
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 4, cp.y, 2, 40);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 4, cp.y, 1, 40);

      // Gold/Cyan Finial Sphere at top of flagpole
      ctx.fillStyle = cp.active ? '#4ade80' : '#facc15';
      ctx.fillRect(x + 3, cp.y - 3, 4, 3);

      // Dynamic waving banner
      const wave = Math.sin(time * 0.14) * 1.5;
      const bannerColor = cp.active ? '#22c55e' : '#94a3b8';
      const bannerAccent = cp.active ? '#86efac' : '#cbd5e1';

      ctx.fillStyle = bannerColor;
      ctx.beginPath();
      ctx.moveTo(x + 6, cp.y + 2);
      ctx.lineTo(x + 20, cp.y + 3 + wave);
      ctx.lineTo(x + 16, cp.y + 8 + wave);
      ctx.lineTo(x + 20, cp.y + 13 + wave);
      ctx.lineTo(x + 6, cp.y + 12);
      ctx.closePath();
      ctx.fill();

      // Banner Crest
      ctx.fillStyle = bannerAccent;
      ctx.fillRect(x + 8, cp.y + 5 + wave * 0.5, 5, 3);

      if (cp.active) {
        // Beacon pulse ring around flag top
        ctx.strokeStyle = `rgba(74, 222, 128, ${sancPulse * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 5, cp.y + 7, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Boss Shield Nodes
    for (const node of nodes) {
      if (node.taken) continue;
      const x = Math.round(node.x - cameraX);
      if (x < -30 || x > GAME_WIDTH + 30) continue;
      const bob = Math.sin(time * 0.1 + node.x) * 2.5;

      ctx.fillStyle = '#164e63';
      ctx.fillRect(x - 2, node.y - 2, 14, 16);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x, node.y + bob, 10, 12);
      ctx.fillStyle = '#ecfeff';
      ctx.fillRect(x + 3, node.y + 2 + bob, 4, 8);
    }

    // Goal Portal
    if (goal && (act === 1 || bossDefeated)) {
      const x = Math.round(goal.x - cameraX);
      const bob = Math.sin(time * 0.08) * 3;

      const portalColor = zone === 'neon' ? '#22d3ee33' : zone === 'sakura' ? '#f472b644' : '#ea580c44';
      ctx.fillStyle = portalColor;
      ctx.fillRect(x - bob, goal.y - bob, goal.w + bob * 2, goal.h + bob * 2);

      ctx.fillStyle = zone === 'neon' ? '#1e1b4b' : zone === 'sakura' ? '#4c0519' : '#330a0a';
      ctx.fillRect(x, goal.y, goal.w, 14);
      ctx.fillRect(x, goal.y, 6, goal.h);
      ctx.fillRect(x + goal.w - 6, goal.y, 6, goal.h);

      const pGrad = ctx.createLinearGradient(x, goal.y, x, goal.y + goal.h);
      pGrad.addColorStop(0, zone === 'neon' ? '#38bdf8' : zone === 'sakura' ? '#fb7185' : '#f97316');
      pGrad.addColorStop(1, zone === 'neon' ? '#a855f7' : zone === 'sakura' ? '#9333ea' : '#dc2626');
      ctx.fillStyle = pGrad;
      ctx.fillRect(x + 6, goal.y + 14, goal.w - 12, goal.h - 14);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + goal.w / 2 - 2, goal.y + goal.h / 2 - 2 + bob, 4, 4);
    }

    // Special Stage Entrance Portal (Cosmic violet & gold shimmering vortex)
    if (specialStagePortal) {
      const sx = Math.round(specialStagePortal.x - cameraX);
      const sy = specialStagePortal.y;
      const sw = specialStagePortal.w;
      const sh = specialStagePortal.h;
      const pulse = Math.sin(time * 0.12) * 2.5;
      const rot = time * 0.08;

      ctx.save();
      // Outer ethereal aura
      ctx.fillStyle = 'rgba(192, 132, 252, 0.32)';
      ctx.beginPath();
      ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2 + 5 + pulse, sh / 2 + 5 + pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer dimensional ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2 + 1, sh / 2 + 1, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling portal core
      const coreGrad = ctx.createRadialGradient(
        sx + sw / 2, sy + sh / 2, 2,
        sx + sw / 2, sy + sh / 2, sh / 2
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, '#fbbf24');
      coreGrad.addColorStop(0.7, '#c084fc');
      coreGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2 - 1, sh / 2 - 1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Orbital cyber particles
      for (let i = 0; i < 4; i++) {
        const ang = rot + (i * Math.PI) / 2;
        const orbitR = sw / 2 + 3;
        const px = sx + sw / 2 + Math.cos(ang) * orbitR;
        const py = sy + sh / 2 + Math.sin(ang) * (orbitR * 1.25);
        ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#e879f9';
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }

      // Overhead glowing beacon label
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SPECIAL STAGE', sx + sw / 2, sy - 8 + Math.sin(time * 0.08) * 1.5);
      ctx.restore();
    }

    // Special Stage Exit Portal (Emerald & Gold Return Vortex)
    if (specialStageExitPortal) {
      const ex = Math.round(specialStageExitPortal.x - cameraX);
      const ey = specialStageExitPortal.y;
      const ew = specialStageExitPortal.w;
      const eh = specialStageExitPortal.h;
      const pulse = Math.sin(time * 0.1) * 2.5;

      ctx.save();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.32)';
      ctx.beginPath();
      ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2 + 5 + pulse, eh / 2 + 5 + pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2 + 1, eh / 2 + 1, 0, 0, Math.PI * 2);
      ctx.stroke();

      const exitGrad = ctx.createRadialGradient(
        ex + ew / 2, ey + eh / 2, 2,
        ex + ew / 2, ey + eh / 2, eh / 2
      );
      exitGrad.addColorStop(0, '#ffffff');
      exitGrad.addColorStop(0.4, '#4ade80');
      exitGrad.addColorStop(0.8, '#065f46');
      exitGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = exitGrad;
      ctx.beginPath();
      ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2 - 1, eh / 2 - 1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RETORNO AL NIVEL', ex + ew / 2, ey - 8 + Math.sin(time * 0.08) * 1.5);
      ctx.restore();
    }
  }

  public renderEnemies(enemies: Enemy[], cameraX: number, time: number) {
    for (const e of enemies) {
      if (!e.alive) continue;
      this.enemyRenderer.render(e, cameraX, time);
    }
  }

  public renderBoss(boss: Boss | null, cameraX: number, time: number) {
    this.bossRenderer.render(boss, cameraX, time);
  }

  public renderProjectiles(projectiles: Projectile[], cameraX: number) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      const x = Math.round(p.x - cameraX);
      if (x < -10 || x > GAME_WIDTH + 10) continue;

      if (p.isHero) {
        // High-frequency cyber throwing dagger / kunai
        const dir = p.vx >= 0 ? 1 : -1;
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        if (dir < 0) ctx.scale(-1, 1);
        
        // Energy vapor trail behind dagger
        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.fillRect(-7, -1, 5, 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.fillRect(-3, -0.5, 3, 1);

        // Kunai blade (pointed tip)
        ctx.fillStyle = '#6b21a8'; // Deep purple outer edge
        ctx.fillRect(-2, -2, 6, 4);
        ctx.fillStyle = '#c084fc'; // Vibrant purple core
        ctx.fillRect(0, -1.5, 5, 3);
        ctx.fillStyle = '#ffffff'; // White razor tip
        ctx.fillRect(4, -0.5, 3, 1);
        
        // Ring hilt (pommel)
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -1, 2, 2);
        ctx.fillStyle = '#facc15'; // Gold ring
        ctx.fillRect(-6, -1.5, 2, 3);
        ctx.restore();
      } else if (p.kind === 'sakuraShuriken') {
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle || 0);
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
      } else if (p.kind === 'homing') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x + 3, p.y + 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 2, p.y + 2, 2, 2);
      } else if (p.kind === 'fireball' || p.kind === 'lavaBlob') {
        // Molten Fireball
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 2 + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'magmaMeteor') {
        // Volcanic Meteor descending with trail
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 1, p.y + 1, p.w - 2, p.h - 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 2, p.y + 2, p.w - 4, p.h - 4);
      } else if (p.kind === 'sandVortex') {
        // Swirling Golden Sand Vortex
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x + 2, p.y + 2, p.w - 4, p.h - 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + p.w / 2 - 1, p.y + p.h / 2 - 1, 2, 2);
      } else if (p.kind === 'curseOrb') {
        // Mystical Purple & Gold Curse Orb
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'sandSpit') {
        // Toxic Sand Spit
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 1, p.y + 1, p.w - 2, p.h - 2);
      } else {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(x + 1, p.y + 1, p.w - 2, p.h - 2);
      }
    }
  }

  public renderZion(player: Player, cameraX: number) {
    const ctx = this.ctx;
    const x = Math.round(player.x - cameraX);
    const y = Math.round(player.y);
    const t = player.time;

    // 1. Render Dash Ghost Afterimages with cyber shinobi neon effect
    for (const trail of player.dashTrail) {
      const tx = Math.round(trail.x - cameraX);
      const ty = Math.round(trail.y);
      ctx.save();
      ctx.translate(tx + 7, ty + 8);
      if (trail.facing < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = trail.alpha * 0.45;

      // Athletic Shinobi Silhouette: broad shoulders, tapered waist, angular optic line
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-6, -3, 12, 3); // Shoulder line
      ctx.fillRect(-4, 0, 8, 5);   // Tapered torso
      ctx.fillRect(-4, -9, 8, 6);  // Masked head
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, -7, 4, 1.5); // Sharp optic slit
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-5, -11, 8, 3); // Spiky anime ninja hair (Electric Purple)
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // 2. Invulnerability flashing (flicker when taking damage)
    if (player.inv > 0 && Math.floor(player.inv / 4) % 2 === 0) return;

    const isMoving = Math.abs(player.vx) > 0.2;
    const isGrounded = player.ground;
    const isJumping = !isGrounded && player.vy < 0;
    const isFalling = !isGrounded && player.vy >= 0;
    const isDashing = player.isDashing;
    const isAttacking = player.isAttacking;
    const isBlocking = player.isBlocking;

    // Subtle run bob & idle breathing
    const bobY = isGrounded && isMoving ? Math.sin(t * 0.55) * 1.5 : (isGrounded ? Math.sin(t * 0.1) * 0.6 : 0);

    // 3. Special Ready / Showdown Ambient Cyber Aura
    if (player.energy >= 70 || player.showdownReady || player.showdownActive) {
      ctx.save();
      const auraPulse = 0.25 + Math.sin(t * 0.18) * 0.15;
      ctx.globalAlpha = auraPulse;
      ctx.fillStyle = player.showdownActive ? '#a855f7' : '#22d3ee';
      ctx.beginPath();
      ctx.arc(x + 7, y + 8 + bobY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Shield Defense Barrier (Bubble with Hexagonal Accents)
    if (isBlocking) {
      ctx.save();
      const isParry = player.perfectParryTimer > 0;
      const shieldGlow = isParry ? '#facc15' : '#38bdf8';
      const shieldFill = isParry ? 'rgba(250, 204, 21, 0.28)' : 'rgba(56, 189, 248, 0.22)';
      
      // Outer barrier
      ctx.fillStyle = shieldFill;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = shieldGlow;
      ctx.lineWidth = isParry ? 2 : 1.2;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Cyber hex / crosshair accents
      ctx.strokeStyle = isParry ? '#ffffff' : '#67e8f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing pulse particles
      const sparkAngle = (t * 0.15) % (Math.PI * 2);
      ctx.fillStyle = isParry ? '#ffffff' : '#e0f2fe';
      ctx.fillRect(
        Math.round(x + 7 + Math.cos(sparkAngle) * 14),
        Math.round(y + 8 + Math.sin(sparkAngle) * 14),
        2,
        2
      );
      ctx.restore();
    }

    // --- MAIN ZION SPRITE RENDERING (CYBER SHINOBI HERO) ---
    ctx.save();
    ctx.translate(x + 7, y + 8 + bobY);

    if (player.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Lean slightly forward when running or dashing
    if (isDashing) {
      ctx.rotate(0.18);
    } else if (isMoving && isGrounded) {
      ctx.rotate(0.06);
    }

    // A. Waving Cyber Shinobi Scarf (Aerodynamic, flowing behind Zion)
    const scarfSegments = 5;
    for (let i = scarfSegments; i >= 1; i--) {
      const waveSpeed = isMoving ? 0.45 : 0.18;
      const waveAmp = isMoving ? 2.5 : 1.2;
      const sx = -4 - (i * 3.2) - (isMoving ? 1.5 * i : 0);
      const sy = -3 + Math.sin(t * waveSpeed - i * 0.8) * waveAmp + (isJumping ? i * 0.8 : isFalling ? -i * 0.5 : 0);
      const sw = Math.max(1.8, 4.2 - i * 0.65);
      const sh = Math.max(1.2, 3 - i * 0.35);

      ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#06b6d4';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), Math.ceil(sh));

      // Neon cyan scarf trim
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), 1);
    }

    // A2. Shinobi Headband Ribbons (Flowing from the back of the metal forehead protector)
    for (let k = 3; k >= 1; k--) {
      const rx = -5 - (k * 2.5);
      const ry = -9 + Math.sin(t * 0.3 - k * 0.9) * 1.6;
      ctx.fillStyle = k === 1 ? '#0891b2' : '#06b6d4';
      ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 1.5);
    }

    // B. Legs & Cyber-Ninja Tabi Boots
    const legPhase = isGrounded && isMoving ? Math.sin(t * 0.45) : 0;
    
    if (isDashing) {
      // Dashing pose (aerodynamic back kick)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, 2, 4, 5);
      ctx.fillRect(0, 1, 5, 5);
      // Shinobi shin armor & cyber-tabi
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, 4, 4, 3);
      ctx.fillRect(1, 3, 4, 3);
      // Cyan tabi split sole
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-6, 6, 5, 2);
      ctx.fillRect(1, 5, 5, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-6, 7, 5, 1);
      ctx.fillRect(1, 6, 5, 1);
    } else if (isJumping) {
      // Jumping pose (tucked ninja legs)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 2, 3, 4);
      ctx.fillRect(1, 1, 3, 4);
      // Knee guards
      ctx.fillStyle = '#334155';
      ctx.fillRect(-4, 3, 3, 2);
      ctx.fillRect(1, 2, 3, 2);
      // Tabi boots
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, 5, 3, 2);
      ctx.fillRect(1, 4, 3, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-4, 6, 3, 1);
      ctx.fillRect(1, 5, 3, 1);
    } else if (isFalling) {
      // Falling pose (extended legs)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 3, 3, 5);
      ctx.fillRect(1, 3, 3, 5);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, 5, 3, 2);
      ctx.fillRect(1, 5, 3, 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, 7, 3, 2);
      ctx.fillRect(1, 7, 3, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-4, 8, 3, 1);
      ctx.fillRect(1, 8, 3, 1);
    } else if (isMoving) {
      // Running cycle (athletic ninja strides)
      const l1 = Math.round(legPhase * 2.6);
      const l2 = Math.round(-legPhase * 2.6);
      
      // Left leg
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3 + l1, 3, 3, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3 + l1, 4, 3, 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3 + l1, 6, 3, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3 + l1, 7, 3, 1);

      // Right leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1 + l2, 3, 3, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(1 + l2, 4, 3, 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(1 + l2, 6, 3, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(1 + l2, 7, 3, 1);
    } else {
      // Idle ninja stance
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, 3, 3, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 3, 3, 4);

      // Shin guards & cyber-tabi
      ctx.fillStyle = '#334155';
      ctx.fillRect(-3, 4, 3, 2);
      ctx.fillRect(1, 4, 3, 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, 6, 3, 2);
      ctx.fillRect(1, 6, 3, 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3, 7, 3, 1);
      ctx.fillRect(1, 7, 3, 1);
    }

    // C. Torso, V-Taper Silhouette & Shinobi Armor
    // Undersuit
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-4, -3, 8, 7);

    // Cyber Pauldrons (Shoulder Armor extending outwards to break the round bean shape!)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -3, 3, 3); // Left shoulder plate
    ctx.fillRect(3, -3, 3, 3);  // Right shoulder plate
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-6, -3, 3, 1); // Neon shoulder trims
    ctx.fillRect(3, -3, 3, 1);

    // Segmented Chestplate
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -2, 6, 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2, -2, 4, 1);

    // Cyber Shinobi Reactor Core (Glowing Chevron)
    const coreGlow = Math.sin(t * 0.2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(34, 211, 238, ${coreGlow})`;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -0.5, 1, 1);

    // Shinobi Obi / Utility Sash & Gold Buckle
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-4, 2, 8, 1.5); // Azure sash
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-1, 2, 2, 1.5); // Gold buckle
    ctx.fillStyle = '#334155';
    ctx.fillRect(-4, 1.5, 1, 2); // Kunai pouch
    ctx.fillRect(3, 1.5, 1, 2);

    // D. Head: Shinobi Mask, Forehead Protector & Cyber Eyes
    // Ninja cowl & jawline (angular, sculpted)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-4, -9, 8, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -5, 6, 2); // Mouth mask cover
    // Cyber breather vents on mask
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-1, -5, 2, 1);

    // Shinobi Forehead Protector (Metallic band with Gold Crest)
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4, -9, 8, 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3, -9, 6, 1); // Metallic sheen
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1, -9, 2, 1.5); // Gold ninja crest emblem

    // Cyber-Shinobi Eyes / Dual Optic Slits (Replacing the oblong Among Us astronaut visor!)
    const eyeGlow = Math.sin(t * 0.15) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(34, 211, 238, ${eyeGlow})`;
    // Twin sharp cybernetic eyes
    ctx.fillRect(0, -7, 2, 1.5);  // Inner eye
    ctx.fillRect(3, -7, 2, 1.5);  // Outer eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -7, 1, 1);    // Hot pupil sparks
    ctx.fillRect(4, -7, 1, 1);

    // Swept-Back Cyberpunk / Anime Ninja Hair (Royal Violet / Electric Purple Gradient)
    ctx.fillStyle = '#6b21a8'; // Deep royal violet base
    ctx.fillRect(-5, -11, 8, 3);
    ctx.fillStyle = '#9333ea'; // Electric purple midtone
    ctx.fillRect(-4, -12, 6, 2);
    ctx.fillStyle = '#c084fc'; // Vibrant radiant lilac spikes
    ctx.fillRect(-6, -10, 2, 2); // Rear flared spike
    ctx.fillRect(0, -12, 3, 2);  // Top windblown crest
    ctx.fillRect(3, -11, 2, 2);  // Forward edge highlight
    ctx.fillStyle = '#e9d5ff';   // Shimmer glint on hair tip
    ctx.fillRect(1, -12, 1, 1);

    // Shinobi Scarf Neck Wrap
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-4, -4, 8, 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(-3, -3, 6, 1);

    // E. Arms & High-Frequency Beam Ninjato
    if (isAttacking) {
      // Dynamic Combat Attack Stance
      const combo = player.comboStep || 1;
      
      // Left arm guard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -2, 2, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-5, 0, 2, 2);

      // Right arm thrusting / slashing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -3, 4, 3);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(4, -4, 2, 2);

      // Sword Hilt & Gold Tsuba
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, -3, 2, 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -5, 1, 5);

      // Glowing Beam Energy Blade
      const bladeLen = combo === 3 ? 15 : 12;
      const bladeY = combo === 2 ? -6 : -3;
      
      // Outer blade glow
      ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
      ctx.fillRect(7, bladeY - 1, bladeLen + 2, 4);
      
      // Core sharp beam
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(7, bladeY, bladeLen, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, bladeY, bladeLen - 2, 1);

      // Combat energy sparks
      if (combo === 3) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(7 + bladeLen, bladeY - 1, 2, 2);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(7 + bladeLen - 3, bladeY - 3, 2, 2);
      }
    } else if (isBlocking) {
      // Defensive ninja guard with crossed gauntlets
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, -3, 4, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(1, -2, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(2, -2, 2, 1);
    } else {
      // Idle / Running Stance — Ninjato Sheathed Diagonally on Back (Saya)
      // Left arm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -2, 2, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-5, 1, 2, 2);

      // Right arm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -2, 2, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(2, 1, 2, 2);

      // Distinctive Diagonal Scabbard (Saya) strapped across back with metallic rings
      // (Diagonal angle completely avoids looking like an astronaut backpack!)
      ctx.save();
      ctx.translate(-4, -6);
      ctx.rotate(-0.4); // 23 degree angle
      // Scabbard body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1, -4, 2.5, 13);
      // Gold Sageo cord rings
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-1.5, -2, 3.5, 1);
      ctx.fillRect(-1.5, 1, 3.5, 1);
      // Tsuka (Hilt) & Tsuba (Guard)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -5, 4.5, 1.2); // Tsuba guard
      ctx.fillStyle = '#475569';
      ctx.fillRect(-0.8, -8, 2, 3);   // Wrapped hilt
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-0.5, -9, 1.4, 1.2); // Pommel emitter
      ctx.restore();
    }

    ctx.restore();
  }

  public renderMeleeEffects(effects: MeleeSlashEffect[], cameraX: number) {
    const ctx = this.ctx;
    for (const m of effects) {
      const x = Math.round(m.x - cameraX);
      const alpha = Math.max(0, m.life / m.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = m.combo === 3 ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      if (m.facing > 0) {
        ctx.arc(x, m.y + 8, 16, -Math.PI * 0.4, Math.PI * 0.4);
      } else {
        ctx.arc(x + 14, m.y + 8, 16, Math.PI * 0.6, Math.PI * 1.4);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  public renderSpecialEffects(effects: SpecialBurstEffect[], cameraX: number) {
    const ctx = this.ctx;
    for (const s of effects) {
      const x = Math.round(s.x - cameraX);
      const alpha = Math.max(0, s.life / s.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = s.color + '22';
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  public renderParticles(particles: Particle[], cameraX: number) {
    const ctx = this.ctx;
    for (const p of particles) {
      const x = Math.round(p.x - cameraX);
      if (x < -10 || x > GAME_WIDTH + 10) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  public renderFloatingTexts(texts: FloatingText[], cameraX: number) {
    const ctx = this.ctx;
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';

    for (const t of texts) {
      const x = Math.round(t.x - cameraX);
      if (x < -50 || x > GAME_WIDTH + 50) continue;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, x, t.y);
    }
    ctx.textAlign = 'left';
  }

  public renderBossIntroBanner(banner: { active: boolean; timer: number; title: string; subtitle: string } | null) {
    if (!banner || !banner.active) return;
    const ctx = this.ctx;
    const alpha = Math.min(1, banner.timer / 30);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#050711';
    ctx.fillRect(0, 0, GAME_WIDTH, 26);
    ctx.fillRect(0, GAME_HEIGHT - 26, GAME_WIDTH, 26);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 60, GAME_WIDTH, 48);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 58, GAME_WIDTH, 2);
    ctx.fillRect(0, 108, GAME_WIDTH, 2);

    ctx.textAlign = 'center';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(banner.title, GAME_WIDTH / 2, 78);

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(banner.subtitle, GAME_WIDTH / 2, 94);
    ctx.restore();
  }

  public renderComboHUD(comboCount: number, comboRank: string, comboTimer: number) {
    if (comboCount <= 1) return;
    const ctx = this.ctx;
    ctx.save();

    const rankColors: Record<string, string> = {
      D: '#94a3b8',
      C: '#38bdf8',
      B: '#4ade80',
      A: '#facc15',
      S: '#fb923c',
      SSS: '#f43f5e',
    };

    const color = rankColors[comboRank] || '#facc15';
    const x = GAME_WIDTH - 50;
    const y = 38;

    ctx.fillStyle = '#0f172aee';
    ctx.fillRect(x - 2, y - 8, 48, 22);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 8, 48, 22);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`x${comboCount}`, x + 2, y + 2);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.fillText(comboRank, x + 42, y + 2);

    // Decay meter
    const meterW = Math.max(0, (comboTimer / 110) * 44);
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 7, meterW, 2);

    ctx.restore();
  }

  public renderFps(fps: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(GAME_WIDTH - 68, 4, 64, 12);
    ctx.strokeStyle = fps >= 55 ? '#22c55e' : fps >= 30 ? '#facc15' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(GAME_WIDTH - 68, 4, 64, 12);
    ctx.fillStyle = fps >= 55 ? '#4ade80' : fps >= 30 ? '#fde047' : '#f87171';
    ctx.textAlign = 'center';
    ctx.fillText(`${fps} FPS (60Hz)`, GAME_WIDTH - 36, 13);
    ctx.restore();
  }
}
