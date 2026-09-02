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
  ZoneId,
} from '../types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
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
    this.renderBackground(config.zone, config.act, engine.cameraX, config.worldWidth, engine.time);

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
      engine.time
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

    // Lava Proximity Indicator on bottom left
    const dist = Math.max(0, Math.round(engine.onlyUpLavaY - engine.player.y));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(8, GAME_HEIGHT - 22, 60, 14);
    ctx.strokeStyle = dist < 70 ? '#ef4444' : '#f97316';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, GAME_HEIGHT - 22, 60, 14);

    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = dist < 70 ? '#f87171' : '#fdba74';
    ctx.textAlign = 'center';
    ctx.fillText(`LAVA: ${dist}px`, 38, GAME_HEIGHT - 13);

    ctx.restore();
  }

  public beginFrame(screenShake = 0) {
    this.ctx.save();
    if (screenShake > 0) {
      const sx = (Math.random() - 0.5) * screenShake * 1.8;
      const sy = (Math.random() - 0.5) * screenShake * 1.8;
      this.ctx.translate(sx, sy);
    }
  }

  public endFrame() {
    this.ctx.restore();
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
        ctx.fillStyle = '#ffffffaa';
        ctx.fillRect(x + 2, y, p.w - 4, 1);
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
    time: number
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

    // Checkpoints
    for (const cp of checkpoints) {
      const x = Math.round(cp.x - cameraX);
      if (x < -30 || x > GAME_WIDTH + 30) continue;

      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 4, cp.y, 2, 40);
      ctx.fillStyle = cp.active ? '#22c55e' : '#94a3b8';
      ctx.fillRect(x + 6, cp.y + 4, 10, 8);
      if (cp.active) {
        ctx.fillStyle = '#86efac44';
        ctx.fillRect(x - 4, cp.y - 4, 20, 20);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(x + 8, cp.y + 6, 6, 4);
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
  }

  public renderEnemies(enemies: Enemy[], cameraX: number, time: number) {
    const ctx = this.ctx;

    for (const e of enemies) {
      if (!e.alive) continue;
      const x = Math.round(e.x - cameraX);
      const y = Math.round(e.y);
      if (x < -30 || x > GAME_WIDTH + 30) continue;

      const isFlashing = (e.hitFlash || 0) > 0 && Math.floor((e.hitFlash || 0) / 2) % 2 === 0;

      if (isFlashing) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 1, e.w + 2, e.h + 2);
      } else {
        if (e.type === 'sphere') {
          const bob = Math.sin((e.angle || 0)) * 3;
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(x + 7, y + 7 + bob, 9, 4, (e.angle || 0), 0, Math.PI * 2);
          ctx.stroke();
        } else if (e.type === 'kitsune') {
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x + 2, y + 4, 10, 10);
          ctx.fillRect(x + 3, y, 8, 6);
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(x + 2, y - 2, 3, 3);
          ctx.fillRect(x + 9, y - 2, 3, 3);
          ctx.fillStyle = '#f97316';
          const tailSway = Math.sin(time * 0.15) * 2;
          ctx.fillRect(x + (e.facing > 0 ? -4 : 12), y + 4 + tailSway, 4, 6);
          ctx.fillStyle = '#ffedd5';
          ctx.fillRect(x + 4, y + 8, 6, 5);
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + (e.facing > 0 ? 8 : 4), y + 3, 2, 2);
        } else if (e.type === 'kage' || e.type === 'kagered') {
          const isRed = e.type === 'kagered';
          ctx.fillStyle = isRed ? '#9f1239' : '#1e1b4b';
          ctx.fillRect(x + 2, y + 4, 10, 12);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 3, y, 8, 6);
          ctx.fillStyle = isRed ? '#fb7185' : '#a855f7';
          ctx.fillRect(x + 4, y + 3, 6, 2);
          const scarfWave = Math.sin(time * 0.2) * 2;
          ctx.fillRect(x + (e.facing > 0 ? -3 : 11), y + 3 + scarfWave, 4, 2);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x + (e.facing > 0 ? 12 : -3), y + 6, 2, 8);
        } else if (e.type === 'kodama') {
          ctx.fillStyle = '#166534';
          ctx.fillRect(x + 3, y + 4, 8, 10);
          ctx.fillStyle = '#bbf7d0';
          ctx.fillRect(x + 2, y, 10, 6);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(x + 4, y + 2, 2, 2);
          ctx.fillRect(x + 8, y + 2, 2, 2);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + 6, y - 3, 2, 3);
          ctx.fillRect(x + 4, y - 4, 6, 2);
        } else if (e.type === 'yurei') {
          ctx.fillStyle = '#c084fc77';
          ctx.beginPath();
          ctx.arc(x + 7, y + 6, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f3e8ff';
          ctx.fillRect(x + 4, y + 2, 6, 5);
          ctx.fillStyle = '#581c87';
          ctx.fillRect(x + 5, y + 3, 1, 2);
          ctx.fillRect(x + 8, y + 3, 1, 2);
        } else if (e.type === 'butterfly') {
          const flap = Math.sin(time * 0.3) * 3;
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(x, y + 2 + flap, 5, 8 - flap);
          ctx.fillRect(x + 9, y + 2 + flap, 5, 8 - flap);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 6, y + 4, 2, 6);
        } else if (e.type === 'salamander') {
          // Magma Salamander: fire reptile with flaming crest
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(x + 2, y + 5, 12, 8);
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x + (e.facing > 0 ? 8 : 0), y + 2, 8, 6);
          // Flaming back spikes
          ctx.fillStyle = '#f97316';
          ctx.fillRect(x + 4, y + 2, 3, 3);
          ctx.fillRect(x + 9, y + 2, 3, 3);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + (e.facing > 0 ? 12 : 2), y + 3, 2, 2);
          // Tail
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(x + (e.facing > 0 ? -3 : 13), y + 7, 4, 4);
        } else if (e.type === 'magma_golem') {
          // Armored Basalt & Magma Golem
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(x + 2, y + 4, 14, 14);
          // Molten Magma Core
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x + 5, y + 6, 8, 8);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x + 7, y + 8, 4, 4);
          // Glowing Eyes
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + (e.facing > 0 ? 10 : 4), y + 2, 3, 2);
          // Stone Shoulder Fists
          ctx.fillStyle = '#292524';
          ctx.fillRect(x - 1, y + 5, 4, 10);
          ctx.fillRect(x + 15, y + 5, 4, 10);
        } else if (e.type === 'flame_wisp') {
          // Floating Incandescent Flame Wisp
          const bob = Math.sin(time * 0.2 + (e.angle || 0)) * 3;
          ctx.fillStyle = '#f9731699';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 6, y + 6 + bob, 2, 2);
        } else if (e.type === 'fire_hopper') {
          // Fire Hopper Imp
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(x + 2, y + 4, 10, 10);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(x + 4, y + 2, 6, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + (e.facing > 0 ? 7 : 3), y + 3, 2, 2);
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x + 2, y + 12, 4, 2);
          ctx.fillRect(x + 8, y + 12, 4, 2);
        } else if (e.type === 'scarab') {
          // Armored Desert Scarab Beetle
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 2, y + 4, 12, 8);
          // Jeweled Carapace
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 3, y + 2, 10, 6);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x + 6, y + 3, 4, 4);
          // Legs
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x, y + 8, 2, 4);
          ctx.fillRect(x + 14, y + 8, 2, 4);
          ctx.fillRect(x + (e.facing > 0 ? 12 : 2), y + 3, 2, 2);
        } else if (e.type === 'mummy_warrior') {
          // Ancient Mummy Warrior with Golden Khopesh
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 2, y + 4, 10, 12);
          // Bandages Wrap Texture
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x + 2, y + 6, 10, 2);
          ctx.fillRect(x + 2, y + 10, 10, 2);
          // Head
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 3, y, 8, 6);
          // Glowing Eyes
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x + (e.facing > 0 ? 7 : 3), y + 2, 2, 2);
          // Golden Khopesh Sword
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + (e.facing > 0 ? 12 : -4), y + 2, 4, 10);
        } else if (e.type === 'sand_serpent') {
          // Golden Desert Sand Serpent / Cobra
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + 2, y + 6, 10, 10);
          // Flared Hood
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 1, y + 2, 12, 6);
          // Glowing Eyes
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x + (e.facing > 0 ? 9 : 3), y + 3, 2, 2);
          // Tongue
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x + (e.facing > 0 ? 13 : -1), y + 4, 2, 1);
        } else if (e.type === 'anubis_statue') {
          // Jackal-Headed Stone Anubis Statue
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(x + 2, y + 6, 12, 12);
          // Jackal Head & Ears
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(x + 3, y, 10, 7);
          ctx.fillRect(x + 3, y - 4, 3, 5);
          ctx.fillRect(x + 10, y - 4, 3, 5);
          // Golden Collar & Staff
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + 2, y + 6, 12, 2);
          ctx.fillRect(x + (e.facing > 0 ? 14 : 0), y, 2, 18);
          // Glowing Purple Eyes
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(x + (e.facing > 0 ? 8 : 4), y + 3, 3, 2);
        } else if (e.type === 'desert_vulture') {
          // Soaring Desert Vulture
          const flap = Math.sin(time * 0.25) * 3;
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x + 2, y + 2 + flap, 12, 6);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x, y + flap, 4, 6 - flap);
          ctx.fillRect(x + 12, y + flap, 4, 6 - flap);
          // Beak
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + (e.facing > 0 ? 14 : 0), y + 3 + flap, 3, 2);
        } else if (e.type === 'cyber_drone') {
          // Aerial Cyber Drone with pulsing scanning eye
          const bob = Math.sin(time * 0.2 + (e.angle || 0)) * 2;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 2, y + 2 + bob, 10, 8);
          // Rotor wings
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x - 2, y + bob, 6, 2);
          ctx.fillRect(x + 10, y + bob, 6, 2);
          // Glowing Neon Cyan Visor
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(x + (e.facing > 0 ? 8 : 2), y + 4 + bob, 4, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + (e.facing > 0 ? 9 : 3), y + 5 + bob, 2, 1);
        } else if (e.type === 'cyberturret') {
          // Wall / Ground Laser Turret
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 4, 12, 10);
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(x + 3, y + 2, 8, 4);
          // Laser Barrel
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x + (e.facing > 0 ? 10 : -2), y + 3, 6, 3);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + (e.facing > 0 ? 14 : -2), y + 4, 2, 1);
        } else if (e.type === 'cyber_hound') {
          // Cyber Hound / Quadruped
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 2, y + 4, 12, 8);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x + (e.facing > 0 ? 9 : 0), y + 1, 6, 5);
          // Cyber optics
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + (e.facing > 0 ? 12 : 1), y + 2, 2, 2);
          // Legs
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 2, y + 11, 2, 4);
          ctx.fillRect(x + 10, y + 11, 2, 4);
        } else if (e.type === 'plasma_trooper') {
          // Heavy armored plasma soldier
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 2, y + 4, 12, 12);
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(x + 3, y, 8, 6);
          // Visor
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + (e.facing > 0 ? 7 : 3), y + 2, 4, 2);
          // Heavy Plasma Blaster
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(x + (e.facing > 0 ? 12 : -3), y + 5, 5, 5);
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(x + (e.facing > 0 ? 15 : -3), y + 6, 3, 3);
        } else if (e.type === 'gravity_orb') {
          // Floating Gravity Disruption Sphere
          const bob = Math.sin(time * 0.15) * 2;
          ctx.fillStyle = '#581c87aa';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(x + 7, y + 7 + bob, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f3e8ff';
          ctx.fillRect(x + 6, y + 6 + bob, 2, 2);
        } else {
          // Cyber Rogues / Sentinels
          const colorMap: Record<string, string> = {
            patrol: '#0284c7',
            sentinel: '#7c3aed',
            hopper: '#db2777',
            charger: '#dc2626',
          };
          const color = colorMap[e.type] || '#64748b';
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + 8, 14, 6);
          ctx.fillStyle = color;
          ctx.fillRect(x + 1, y + 2, 12, 8);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 3, y, 8, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + (e.facing > 0 ? 8 : 4), y + 3, 2, 2);
        }
      }

      // Attack Alert Warning Indicator '!'
      if (e.alertTimer && e.alertTimer > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + e.w / 2 - 3, y - 10, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + e.w / 2 - 1, y - 9, 2, 3);
        ctx.fillRect(x + e.w / 2 - 1, y - 5, 2, 1);
      }

      // Small Health Bar above enemy if damaged
      if (e.hp < e.maxHp && e.maxHp > 1) {
        const barW = 16;
        const barH = 2;
        const barX = x + (e.w - barW) / 2;
        const barY = y - 5;
        const fillW = Math.max(0, (e.hp / e.maxHp) * barW);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barX, barY, fillW, barH);
      }
    }
  }

  public renderBoss(boss: Boss | null, cameraX: number, time: number) {
    if (!boss || !boss.alive) return;
    const ctx = this.ctx;
    const x = Math.round(boss.x - cameraX);
    const y = Math.round(boss.y);

    if (boss.inv > 0 && Math.floor(boss.inv / 3) % 2 === 0) return;

    // Render Boss Shield Forcefield
    if (boss.shield) {
      ctx.fillStyle = '#06b6d433';
      ctx.beginPath();
      ctx.arc(x + boss.w / 2, y + boss.h / 2, boss.w * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Render Boss Clones (Phase 3 Illusion)
    if (boss.clones) {
      for (const clone of boss.clones) {
        const cx = Math.round(clone.x - cameraX);
        const cy = Math.round(clone.y);
        ctx.save();
        ctx.globalAlpha = clone.alpha * 0.65;
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(cx, cy, clone.w, clone.h);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx + 4, cy + 4, clone.w - 8, clone.h - 8);
        ctx.restore();
      }
    }

    // Render Boss Shockwaves
    for (const sw of boss.shockwaves) {
      const swX = Math.round(sw.x - cameraX);
      ctx.fillStyle = sw.color;
      ctx.fillRect(swX, sw.y, sw.w, sw.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(swX + 2, sw.y + 2, sw.w - 4, sw.h - 4);
    }

    // Render Boss Cyber Laser Beam
    if (boss.laser && boss.laser.active) {
      const l = boss.laser;
      const lx = Math.round(l.x - cameraX);
      ctx.save();
      ctx.fillStyle = '#06b6d444';
      ctx.fillRect(lx, l.y - 4, l.length, l.thickness + 8);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(lx, l.y, l.length, l.thickness);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx, l.y + 3, l.length, l.thickness - 6);
      ctx.restore();
    }

    // Render Laser Charging Warning Line
    if (boss.state === 'charging' && boss.name.includes('Guardián')) {
      const lx = Math.round(boss.x - cameraX);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lx + (boss.facing > 0 ? boss.w : 0), y + 10);
      ctx.lineTo(lx + (boss.facing > 0 ? 300 : -300), y + 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Thruster Flame when jumping/slamming
    if (boss.thrusterFlame && boss.thrusterFlame > 0) {
      ctx.fillStyle = boss.name.includes('Ignis') ? '#f97316' : '#06b6d4';
      ctx.fillRect(x + 4, y + boss.h, 6, 8);
      ctx.fillRect(x + boss.w - 10, y + boss.h, 6, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + boss.h, 2, 5);
      ctx.fillRect(x + boss.w - 8, y + boss.h, 2, 5);
    }

    if (boss.name.includes('Guardián')) {
      // Boss 1: Guardián Neón MK-IV
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 2, y + 4, boss.w - 4, boss.h - 4);
      
      const coreColor = boss.phase === 3 ? '#ef4444' : boss.phase === 2 ? '#f59e0b' : '#06b6d4';
      ctx.fillStyle = coreColor;
      ctx.fillRect(x + 4, y + 6, boss.w - 8, boss.h - 10);
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 6, y, 12, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 8, y + 2, 8, 2);

      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 3, y + 6, 5, 14);
      ctx.fillRect(x + boss.w - 2, y + 6, 5, 14);
    } else if (boss.name.includes('Kunoichi')) {
      // Boss 2: Maestra Kunoichi Rosa
      ctx.fillStyle = '#831843';
      ctx.fillRect(x + 3, y + 6, 18, 24);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + 5, y + 8, 14, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 5, y, 14, 8);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(x + 6, y + 3, 12, 2);
      ctx.fillStyle = '#f43f5e';
      const scarfWave = Math.sin(time * 0.25) * 3;
      ctx.fillRect(x + (boss.facing > 0 ? -5 : 19), y + 4 + scarfWave, 6, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y + 4, 2, 18);
      ctx.fillRect(x + boss.w, y + 4, 2, 18);
    } else if (boss.name.includes('Ignis')) {
      // Boss 3: Ignis, Coloso de Magma Primordial
      // Massive Basalt Titan Body
      ctx.fillStyle = '#1c0a0a';
      ctx.fillRect(x + 2, y + 6, boss.w - 4, boss.h - 6);

      // Molten Fiery Heart & Armor Fissures
      const coreColor = boss.phase === 3 ? '#fbbf24' : boss.phase === 2 ? '#f97316' : '#ea580c';
      ctx.fillStyle = coreColor;
      ctx.fillRect(x + 6, y + 10, boss.w - 12, boss.h - 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + boss.w / 2 - 3, y + 14, 6, 8);

      // Obsidian Crown Horns & Glowing Fiery Eyes
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(x + 4, y, boss.w - 8, 8);
      // Horns
      ctx.fillRect(x + 2, y - 4, 4, 6);
      ctx.fillRect(x + boss.w - 6, y - 4, 4, 6);
      // Fiery Eyes
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 8, y + 3, 3, 2);
      ctx.fillRect(x + boss.w - 11, y + 3, 3, 2);

      // Massive Molten Fists
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x - 5, y + 8, 7, 16);
      ctx.fillRect(x + boss.w - 2, y + 8, 7, 16);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x - 4, y + 12, 5, 8);
      ctx.fillRect(x + boss.w - 1, y + 12, 5, 8);
    } else if (boss.name.includes('Akhen') || boss.name.includes('Faraón') || boss.name.includes('Momia')) {
      // Boss 4: Faraón Akhen'Ra, La Momia Eterna
      // Ancient Bandaged Golden Mummy Body
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 2, y + 6, boss.w - 4, boss.h - 6);

      // Mummy Bandages and Golden Armor
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 4, y + 8, boss.w - 8, boss.h - 12);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 4, y + 12, boss.w - 8, 3);
      ctx.fillRect(x + 4, y + 20, boss.w - 8, 3);
      ctx.fillRect(x + 4, y + 28, boss.w - 8, 3);

      // Royal Nemes Crown (Gold & Lapis Blue)
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 2, y, boss.w - 4, 10);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 5, y + 2, 4, 8);
      ctx.fillRect(x + boss.w - 9, y + 2, 4, 8);

      // Royal Golden Cobra Uraeus on forehead
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + boss.w / 2 - 1, y - 3, 3, 3);

      // Glowing Spectral Turquoise Eyes
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x + (boss.facing > 0 ? boss.w - 10 : 6), y + 4, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (boss.facing > 0 ? boss.w - 8 : 7), y + 4, 1, 1);

      // Golden Ankh Scepter / Flail
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + (boss.facing > 0 ? boss.w : -4), y + 4, 3, 24);
      ctx.fillRect(x + (boss.facing > 0 ? boss.w - 2 : -6), y + 4, 7, 3);

      // Swirling Sandstorm Aura in Phase 2 & 3
      if (boss.phase >= 2) {
        for (let sa = 0; sa < 6; sa++) {
          const sAngle = time * 0.2 + (sa * Math.PI) / 3;
          const sX = x + boss.w / 2 + Math.cos(sAngle) * 20;
          const sY = y + boss.h / 2 + Math.sin(sAngle) * 16;
          ctx.fillStyle = '#f59e0bcc';
          ctx.fillRect(sX, sY, 3, 3);
        }
      }
    } else if (boss.name.includes('Kronos')) {
      // --- BOSS 5: TITÁN MECÁNICO KRONOS-Ω (JEFE FINAL) ---
      const isOverheated = boss.state === 'overheat';

      // Phase 3: Chrono-Temporal Hologram Wings & Aegis Arcs
      if (boss.phase === 3) {
        for (let w = 0; w < 3; w++) {
          const wingSpread = 18 + w * 10;
          const wingFlap = Math.sin(time * 0.15 + w) * 4;
          ctx.fillStyle = w % 2 === 0 ? '#06b6d444' : '#f43f5e44';
          // Left Wing Blade
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 10);
          ctx.lineTo(x - wingSpread, y - 6 + wingFlap);
          ctx.lineTo(x - wingSpread + 8, y + 12 + wingFlap);
          ctx.fill();
          // Right Wing Blade
          ctx.beginPath();
          ctx.moveTo(x + boss.w - 8, y + 10);
          ctx.lineTo(x + boss.w + wingSpread, y - 6 + wingFlap);
          ctx.lineTo(x + boss.w + wingSpread - 8, y + 12 + wingFlap);
          ctx.fill();
        }
      }

      // Heavy Reinforced Mech Chassis
      ctx.fillStyle = isOverheated ? '#3f1d1d' : '#090d16';
      ctx.fillRect(x + 2, y + 6, boss.w - 4, boss.h - 6);

      // Cybernetic Titanium Armor Plating
      ctx.fillStyle = isOverheated ? '#7f1d1d' : '#1e293b';
      ctx.fillRect(x + 4, y + 8, boss.w - 8, boss.h - 14);

      // Quantum Chrono Fusion Reactor (Chest Core)
      const corePulse = Math.sin(time * (isOverheated ? 0.4 : 0.15)) * 0.5 + 0.5;
      const coreColor = isOverheated
        ? '#f97316'
        : boss.phase === 3
        ? '#f43f5e'
        : boss.phase === 2
        ? '#38bdf8'
        : '#06b6d4';
      ctx.fillStyle = coreColor;
      ctx.fillRect(x + boss.w / 2 - 6, y + 10, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + boss.w / 2 - 2, y + 14, 4, 4);

      // Orbiting Fusion Energy Rings around core
      ctx.strokeStyle = isOverheated ? '#fbbf24' : '#67e8f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + boss.w / 2, y + 16, 14, 7, time * 0.1, 0, Math.PI * 2);
      ctx.stroke();

      // Cyber Armor Neon Trim Lines
      ctx.fillStyle = isOverheated ? '#fbbf24' : '#06b6d4';
      ctx.fillRect(x + 4, y + 6, boss.w - 8, 2);
      ctx.fillRect(x + 4, y + 26, boss.w - 8, 2);

      // Mecha Head & Dual Visor Array
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 6, y, boss.w - 12, 8);
      // Cyber Crest
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + boss.w / 2 - 2, y - 4, 4, 5);
      // Glowing Optical Visor Eyes
      ctx.fillStyle = isOverheated ? '#facc15' : boss.phase === 3 ? '#f43f5e' : '#22d3ee';
      ctx.fillRect(x + (boss.facing > 0 ? boss.w - 12 : 8), y + 3, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (boss.facing > 0 ? boss.w - 10 : 10), y + 3, 2, 1);

      // Shoulder Rocket Launchers / Thrusters & Missile Pods
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 4, y + 2, 6, 8);
      ctx.fillRect(x + boss.w - 2, y + 2, 6, 8);

      if (boss.state === 'missileBarrage') {
        // Open Missile Hatch warning glow
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x - 4, y, 6, 3);
        ctx.fillRect(x + boss.w - 2, y, 6, 3);
      }

      if (boss.state === 'slamming' || (boss.thrusterFlame && boss.thrusterFlame > 0)) {
        // Rocket Thruster Fire
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x - 3, y + 10, 4, 10);
        ctx.fillRect(x + boss.w - 1, y + 10, 4, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y + 10, 2, 6);
        ctx.fillRect(x + boss.w, y + 10, 2, 6);
      }

      // Massive Twin Chrono-Beam Arm Cannons
      ctx.fillStyle = '#1e293b';
      const armX = boss.facing > 0 ? x + boss.w - 3 : x - 7;
      ctx.fillRect(armX, y + 8, 10, 14);
      ctx.fillStyle = isOverheated ? '#ea580c' : '#0891b2';
      ctx.fillRect(armX + (boss.facing > 0 ? 6 : 0), y + 10, 4, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(armX + (boss.facing > 0 ? 8 : 0), y + 12, 2, 4);

      // Overheat Vents & Steam Effects
      if (isOverheated) {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 2, y + boss.h - 4, boss.w - 4, 2);
        // Warning Hazard Stripes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + 6, y + 8, 3, 3);
        ctx.fillRect(x + 14, y + 8, 3, 3);
      }
    }

    // Stagger / Stun Animation (Dizzy stars orbiting head)
    if (boss.isStaggered) {
      for (let s = 0; s < 4; s++) {
        const angle = time * 0.15 + (s * Math.PI) / 2;
        const starX = x + boss.w / 2 + Math.cos(angle) * 16;
        const starY = y - 6 + Math.sin(angle) * 5;
        ctx.fillStyle = '#facc15';
        ctx.fillRect(starX - 2, starY - 2, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(starX - 1, starY - 1, 2, 2);
      }
    }

    // Boss Boss HP & Posture Stagger Bar
    const hpW = 100;
    const hpH = 5;
    const hpX = (GAME_WIDTH - hpW) / 2;
    const hpY = 14;

    // HP Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
    ctx.fillStyle = boss.shield ? '#0284c7' : '#ef4444';
    ctx.fillRect(hpX, hpY, Math.max(0, (boss.hp / boss.maxHp) * hpW), hpH);
    ctx.strokeStyle = '#ffffff88';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);

    // Stagger Posture Bar
    const stagH = 3;
    const stagY = hpY + hpH + 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(hpX - 1, stagY - 1, hpW + 2, stagH + 2);
    ctx.fillStyle = boss.isStaggered ? '#facc15' : '#eab308';
    const stagRatio = Math.min(1, boss.stagger / boss.maxStagger);
    ctx.fillRect(hpX, stagY, stagRatio * hpW, stagH);

    // Boss Name Label
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.title || boss.name} [Fase ${boss.phase}]`, GAME_WIDTH / 2, hpY - 4);
    ctx.textAlign = 'left';
  }

  public renderProjectiles(projectiles: Projectile[], cameraX: number) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      const x = Math.round(p.x - cameraX);
      if (x < -10 || x > GAME_WIDTH + 10) continue;

      if (p.isHero) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + (p.vx > 0 ? p.w - 3 : 0), p.y - 1, 3, p.h + 2);
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

    // 1. Render Dash Ghost Afterimages with cyber neon effect
    for (const trail of player.dashTrail) {
      const tx = Math.round(trail.x - cameraX);
      const ty = Math.round(trail.y);
      ctx.save();
      ctx.translate(tx + 7, ty + 8);
      if (trail.facing < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = trail.alpha * 0.45;

      // Silhouette with glowing cyan & rose accents
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, -8, 8, 16);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-2, -6, 5, 2); // Visor trail
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-4, -9, 7, 2); // Hair crest trail
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
      ctx.fillStyle = player.showdownActive ? '#f43f5e' : '#22d3ee';
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

    // --- MAIN ZION SPRITE RENDERING ---
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

    // A. Waving Cyber Scarf (Flows undulating behind Zion)
    const scarfSegments = 4;
    for (let i = scarfSegments; i >= 1; i--) {
      const waveSpeed = isMoving ? 0.45 : 0.18;
      const waveAmp = isMoving ? 2.5 : 1.2;
      const sx = -4 - (i * 3) - (isMoving ? 1.5 * i : 0);
      const sy = -3 + Math.sin(t * waveSpeed - i * 0.8) * waveAmp + (isJumping ? i * 0.8 : isFalling ? -i * 0.5 : 0);
      const sw = Math.max(2, 4 - i * 0.6);
      const sh = Math.max(1.5, 3 - i * 0.3);

      ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#06b6d4';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), Math.ceil(sh));

      // Neon cyan scarf trim
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), 1);
    }

    // B. Legs & Boots Animation
    const legPhase = isGrounded && isMoving ? Math.sin(t * 0.45) : 0;
    
    if (isDashing) {
      // Dashing pose (aerodynamic back kick)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 2, 4, 5);
      ctx.fillRect(0, 1, 5, 5);
      // Cyan boot tips
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-5, 5, 4, 3);
      ctx.fillRect(2, 4, 4, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-5, 7, 4, 1);
      ctx.fillRect(2, 6, 4, 1);
    } else if (isJumping) {
      // Jumping pose (tucked legs)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, 2, 3, 4);
      ctx.fillRect(1, 1, 3, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, 4, 3, 3);
      ctx.fillRect(1, 3, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3, 6, 3, 1);
      ctx.fillRect(1, 5, 3, 1);
    } else if (isFalling) {
      // Falling pose (extended legs)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, 3, 3, 5);
      ctx.fillRect(1, 3, 3, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, 6, 3, 3);
      ctx.fillRect(1, 6, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3, 8, 3, 1);
      ctx.fillRect(1, 8, 3, 1);
    } else if (isMoving) {
      // Running cycle (scissor legs)
      const l1 = Math.round(legPhase * 2.5);
      const l2 = Math.round(-legPhase * 2.5);
      
      // Left leg
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3 + l1, 3, 3, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3 + l1, 5, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3 + l1, 7, 3, 1);

      // Right leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1 + l2, 3, 3, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(1 + l2, 5, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(1 + l2, 7, 3, 1);
    } else {
      // Idle standing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, 3, 3, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 3, 3, 4);

      // Boots with cyan trim & neon stripe
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, 5, 3, 3);
      ctx.fillRect(1, 5, 3, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-3, 7, 3, 1);
      ctx.fillRect(1, 7, 3, 1);
    }

    // C. Torso & Cyber Armor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -3, 8, 7); // Base torso

    // Chestplate plating
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -2, 6, 5);

    // Cyber Reactor Core (Pulsing Diamond in chest center)
    const coreGlow = Math.sin(t * 0.2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(34, 211, 238, ${coreGlow})`;
    ctx.fillRect(-1, -1, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -1, 1, 1); // Hot center

    // Tech Belt & Gold Energy Pouches
    ctx.fillStyle = '#334155';
    ctx.fillRect(-4, 3, 8, 1);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-4, 2, 1, 2);
    ctx.fillRect(3, 2, 1, 2);

    // D. Head, Cyber Crest & Glowing Visor (Matching Main Menu)
    // Helmet base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -9, 8, 6);

    // Futuristic Cyber Spiky Crest / Hair in Rose/Crimson
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-4, -11, 7, 3);
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(-5, -10, 3, 2); // Side spike
    ctx.fillRect(1, -10, 3, 2);  // Top spike

    // High-Tech Glowing Visor (Cyan with white gleam)
    const visorGlow = Math.sin(t * 0.15) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(34, 211, 238, ${visorGlow})`;
    ctx.fillRect(-1, -8, 6, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -8, 2, 2); // Visor eye gleam

    // Scarf Collar around neck
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-4, -4, 8, 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(-3, -3, 6, 1);

    // E. Arms & Light Sword (Saber de Luz de Zion)
    if (isAttacking) {
      // Dynamic Combat Attack Stance
      const combo = player.comboStep || 1;
      
      // Left arm guard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, -2, 2, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, 0, 2, 2);

      // Right arm thrusting / slashing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -3, 4, 3);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(4, -4, 2, 2); // Gauntlet

      // Sword Hilt & Gold Crossguard
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, -3, 2, 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -5, 1, 5); // Crossguard

      // Glowing Beam Energy Blade
      const bladeLen = combo === 3 ? 14 : 11;
      const bladeY = combo === 2 ? -6 : -3;
      
      // Outer blade glow
      ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
      ctx.fillRect(7, bladeY - 1, bladeLen + 2, 4);
      
      // Core sharp beam
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(7, bladeY, bladeLen, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, bladeY, bladeLen - 2, 1); // White hot center

      // Combat energy sparks
      if (combo === 3) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(7 + bladeLen, bladeY - 1, 2, 2);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(7 + bladeLen - 3, bladeY - 3, 2, 2);
      }
    } else if (isBlocking) {
      // Defensive stance with crossed gauntlets
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, -3, 4, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(1, -2, 3, 3); // Gauntlets with power cuffs
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(2, -2, 2, 1);
    } else {
      // Idle / Running Stance — Sword stylishly slung over back
      // Left arm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, -2, 2, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, 1, 2, 2);

      // Right arm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -2, 2, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(2, 1, 2, 2);

      // Energy Blade Sheathed on Back (Angled)
      ctx.fillStyle = '#475569';
      ctx.fillRect(-5, -10, 2, 3); // Hilt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-6, -8, 4, 1);  // Gold Crossguard
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-4, -7, 2, 9);  // Glowing Beam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -6, 1, 7);  // White hot core
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
