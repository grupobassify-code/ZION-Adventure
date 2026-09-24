import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { LEVEL_CONFIGS } from './levelData';
import { getOnlyUpBiome } from './onlyUpGenerator';
import type { GameEngine } from './gameEngine';
import {
  Boss,
  Checkpoint,
  Collectible,
  DestructibleObject,
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
  Liana,
  Waterfall,
  ZoneId,
} from '../types';
import { EnemyRenderer } from './enemyRenderer';
import { BossRenderer } from './bossRenderer';
import type { RemotePlayerState } from '../types/multiplayer';

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

    const hasCameraY = engine.cameraY !== 0;
    if (hasCameraY) {
      this.ctx.save();
      this.ctx.translate(0, -Math.round(engine.cameraY));
    }

    // 3. World landmarks and shrines
    this.renderLandmarks(engine.landmarks, engine.cameraX, engine.time);

    // 3b. Cascading Waterfalls (Jungle Run)
    this.renderWaterfalls(engine.waterfalls, engine.cameraX, engine.time);

    // 4. Platforms & solid terrain
    this.renderPlatforms(engine.platforms, config.zone, config.act, engine.cameraX, engine.time);

    // 4b. Dynamic Trampolines (including Mayan Solar Trampoline)
    this.renderTrampolines(engine.trampolines, engine.time, engine.cameraX);

    // 4c. Jungle Lianas (Swinging Vines)
    this.renderLianas(engine.lianas, engine.cameraX, engine.time);

    // 4d. Destructible Castle Obstacles (Castle Smash)
    this.renderDestructibles(engine.destructibles, engine.cameraX, engine.time);

    // 4e. Steampunk Ascending Superheated Pressure Floor
    if (config.id === 'steampunk-3') {
      this.renderSteampunkRisingFloor(engine);
    }

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

    // 10b. Online 1v1 Rival Player
    if (engine.remotePlayer) {
      this.renderRemotePlayer(engine.remotePlayer, engine.cameraX, 0, engine.time);
    }

    // 11. Melee sword slash arcs & special energy bursts
    this.renderMeleeEffects(engine.meleeEffects, engine.cameraX);
    this.renderSpecialEffects(engine.specialEffects, engine.cameraX);

    // 12. Dynamic pixel particles & floating damage/score text
    this.renderParticles(engine.particles, engine.cameraX);
    this.renderFloatingTexts(engine.floatingTexts, engine.cameraX);

    if (hasCameraY) {
      this.ctx.restore();
    }

    // Steampunk Chimney Ascent 1000m Altimeter (Act 3)
    if (config.id === 'steampunk-3') {
      const altMeters = Math.max(0, Math.min(1000, Math.round((134 - engine.player.y) / 10)));
      const ctx = this.ctx;
      const barX = GAME_WIDTH - 28;
      const barY = 24;
      const barH = 120;

      // Victorian Brass Casing
      ctx.fillStyle = '#1c140e';
      ctx.fillRect(barX - 1, barY - 1, 14, barH + 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(barX, barY, 12, barH);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(barX + 1, barY + 1, 10, barH - 2);

      // Glass Tube
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX + 3, barY + 3, 6, barH - 6);

      // Rising Floor Steam Pressure Column (Lava/Floor Level)
      const floorMeters = Math.max(0, Math.min(1000, Math.round((134 - engine.steampunkRisingFloorY) / 10)));
      const floorFillH = Math.round((floorMeters / 1000) * (barH - 6));
      const floorMarkerY = barY + barH - 3 - floorFillH;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillRect(barX + 3, floorMarkerY, 6, Math.max(0, barH - 3 - floorMarkerY + barY));

      // Rising floor indicator arrow (red chevron on left of altimeter)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(barX - 1, floorMarkerY);
      ctx.lineTo(barX - 4, floorMarkerY - 2.5);
      ctx.lineTo(barX - 4, floorMarkerY + 2.5);
      ctx.closePath();
      ctx.fill();

      // Mercury / Steam Pressure Column (Player Level)
      const fillH = Math.round((altMeters / 1000) * (barH - 6));
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(barX + 3, barY + barH - 3 - fillH, 6, fillH);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(barX + 4, barY + barH - 3 - fillH, 2, fillH);

      // Summit Boss Marker
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX - 1, barY + 2, 14, 3);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('1000m ⚙', barX - 3, barY + 6);

      // Current Height Label
      const playerMarkerY = barY + barH - 3 - fillH;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(barX - 1, playerMarkerY);
      ctx.lineTo(barX - 5, playerMarkerY - 3);
      ctx.lineTo(barX - 5, playerMarkerY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText(`${altMeters}m`, barX - 6, playerMarkerY + 2.5);

      // Proximity Warning Alert if rising floor is close to player
      const distFromFloor = engine.steampunkRisingFloorY - (engine.player.y + engine.player.h);
      if (distFromFloor < 85 && distFromFloor > -30 && engine.steampunkRisingFloorActive) {
        const pulse = 0.6 + Math.sin(engine.time * 0.25) * 0.4;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse.toFixed(2)})`;
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ ¡PISO SUBIENDO! ¡CUIDADO CON EL APLASTE!', GAME_WIDTH / 2, 38);
      }
    }

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

    // Gb. Online 1v1 Rival Player in Only Up
    if (engine.remotePlayer) {
      this.renderRemotePlayer(engine.remotePlayer, 0, 0, engine.time);
    }

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

  public renderWaterfalls(waterfalls: Waterfall[], cameraX: number, time: number) {
    if (!waterfalls || waterfalls.length === 0) return;
    const ctx = this.ctx;

    for (const wf of waterfalls) {
      const rx = Math.round(wf.x - cameraX);
      if (rx + wf.w < -20 || rx > GAME_WIDTH + 20) continue;

      // Mossy Rock Overhang at top
      ctx.fillStyle = '#14532d';
      ctx.fillRect(rx - 2, wf.y - 3, wf.w + 4, 4);
      ctx.fillStyle = '#166534';
      ctx.fillRect(rx - 1, wf.y - 2, wf.w + 2, 2);

      // Translucent cascading waterfall body
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(rx, wf.y, wf.w, wf.h);

      // Deep cyan inner flow
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(rx + 2, wf.y, wf.w - 4, wf.h);

      // Rapidly flowing white water foam and highlight streaks
      const flowOffset = (time * (wf.flowSpeed || 2.4)) % 14;
      ctx.fillStyle = '#e0f2fe';
      for (let y = wf.y + flowOffset; y < wf.y + wf.h; y += 14) {
        ctx.fillRect(rx + 2, y, 2, 6);
        ctx.fillRect(rx + Math.floor(wf.w / 2) - 1, (y + 7) % (wf.y + wf.h), 3, 5);
        ctx.fillRect(rx + wf.w - 4, (y + 3) % (wf.y + wf.h), 2, 7);
      }

      // Foamy bubbling splash pool at base
      const splashPulse = Math.sin(time * 0.2 + wf.id) * 1.5;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(rx - 3, wf.y + wf.h - 3 + splashPulse, wf.w + 6, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx - 1, wf.y + wf.h - 2, wf.w + 2, 2);
      ctx.restore();
    }
  }

  public renderLianas(lianas: Liana[], cameraX: number, time: number) {
    if (!lianas || lianas.length === 0) return;
    const ctx = this.ctx;

    for (const liana of lianas) {
      const rx = Math.round(liana.x - cameraX);
      if (rx < -60 || rx > GAME_WIDTH + 60) continue;

      const angle = liana.angle || 0;
      const tipX = rx + Math.sin(angle) * liana.length;
      const tipY = liana.y + Math.cos(angle) * liana.length;

      // Anchor branch/stone ring at top
      ctx.fillStyle = '#1e3a1e';
      ctx.fillRect(rx - 3, liana.y - 3, 6, 4);
      ctx.fillStyle = '#166534';
      ctx.fillRect(rx - 2, liana.y - 2, 4, 2);

      // Braided natural rope vine
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, liana.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Inner lighter vine fiber
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, liana.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Hanging foliage leaves along vine length
      const segments = 4;
      for (let i = 1; i <= segments; i++) {
        const segT = i / (segments + 1);
        const segX = rx + Math.sin(angle) * liana.length * segT;
        const segY = liana.y + Math.cos(angle) * liana.length * segT;
        const leafSide = i % 2 === 0 ? 1 : -1;

        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(segX + leafSide * 2, segY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#86efac';
        ctx.fillRect(segX + leafSide * 1.5, segY - 1, 1.5, 1.5);
      }

      // Grab loop / orchid blossom at the hanging tip
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden solar blossom knot indicator for Zion to grasp
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tipX - 0.5, tipY - 0.5, 1, 1);
    }
  }

  public renderTrampolines(trampolines: Trampoline[], time: number, cameraX = 0) {
    if (!trampolines || trampolines.length === 0) return;
    const ctx = this.ctx;
    for (const t of trampolines) {
      const rx = Math.round(t.x - cameraX);
      if (rx + t.w < -20 || rx > GAME_WIDTH + 20) continue;

      const isMega = t.type === 'mega';
      const isSuper = t.type === 'super';
      const compression = t.springAnim > 0 ? (t.springAnim / 16) * 3 : 0;
      const padY = t.y + compression;
      const padH = Math.max(3, t.h - compression);

      if (isMega) {
        // Ancient Mayan Solar Super Launch Trampoline
        // Base: Heavy stepped stone altar with golden Aztec glyphs
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(rx - 2, t.y + t.h - 3, t.w + 4, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx, t.y + t.h - 2, t.w, 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx + 2, t.y + t.h - 1, 3, 2);
        ctx.fillRect(rx + t.w - 5, t.y + t.h - 1, 3, 2);

        // Mayan Solar Central Core Pillar
        ctx.fillStyle = '#d97706';
        ctx.fillRect(rx + t.w / 2 - 3, padY + 3, 6, Math.max(1, padH - 2));
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx + t.w / 2 - 1, padY + 3, 2, Math.max(1, padH - 2));

        // Golden Solar Plate
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rx, padY, t.w, 5);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx, padY, t.w, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx + 2, padY, t.w - 4, 1.5);

        // Aztec Sun Disk Emblem in center
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        const mcx = rx + t.w / 2;
        ctx.arc(mcx, padY + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Solar Rays
        const pulse = 0.5 + Math.sin(time * 0.15) * 0.4;
        ctx.strokeStyle = `rgba(250, 204, 21, ${pulse.toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx - 2, padY - 2, t.w + 4, 8);

        // Triple Gold Launch Chevrons
        const arrowBob = t.springAnim > 0 ? 0 : Math.sin(time * 0.2) * 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(mcx, padY - 4 + arrowBob);
        ctx.lineTo(mcx - 4, padY + arrowBob);
        ctx.lineTo(mcx + 4, padY + arrowBob);
        ctx.closePath();
        ctx.fill();
        continue;
      }

      if (t.type === 'steam_boost') {
        // Steampunk Brass Pneumatic Catapult Pad
        // Base mount: Heavy riveted iron flange
        ctx.fillStyle = '#1c140e';
        ctx.fillRect(rx - 1, t.y + t.h - 3, t.w + 2, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx, t.y + t.h - 2, t.w, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(rx + 2, t.y + t.h - 1, 2, 2);
        ctx.fillRect(rx + t.w - 4, t.y + t.h - 1, 2, 2);

        // High-pressure brass piston cylinder
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rx + t.w / 2 - 3, padY + 2, 6, Math.max(1, padH - 1));
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx + t.w / 2 - 1, padY + 2, 2, Math.max(1, padH - 1));

        // Brass pneumatic catapult pad
        ctx.fillStyle = '#d97706';
        ctx.fillRect(rx, padY, t.w, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx, padY, t.w, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx + 2, padY, t.w - 4, 1.5);

        // Animated steam vent puff
        const steamPulse = t.springAnim > 0 ? 3 : Math.sin(time * 0.2 + rx) * 1.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        const mcx = rx + t.w / 2;
        ctx.arc(mcx, padY - 2 + steamPulse, 3, 0, Math.PI * 2);
        ctx.fill();

        // Glowing white upward chevron indicating catapult direction
        const arrowBob = t.springAnim > 0 ? 0 : Math.sin(time * 0.18) * 1.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(mcx, padY - 3 + arrowBob);
        ctx.lineTo(mcx - 3, padY + arrowBob);
        ctx.lineTo(mcx + 3, padY + arrowBob);
        ctx.closePath();
        ctx.fill();
        continue;
      }

      // Base mount anchored securely to platform
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rx, t.y + t.h - 2, t.w, 3);
      ctx.fillStyle = isSuper ? '#fbbf24' : '#475569';
      ctx.fillRect(rx + 2, t.y + t.h - 1, 2, 2);
      ctx.fillRect(rx + t.w - 4, t.y + t.h - 1, 2, 2);

      // Central Hydraulic Spring Piston
      ctx.fillStyle = isSuper ? '#e879f9' : '#38bdf8';
      ctx.fillRect(rx + t.w / 2 - 2, padY + 3, 4, Math.max(1, padH - 2));

      // Bouncy Launch Pad Body
      ctx.fillStyle = isSuper ? '#db2777' : '#0284c7';
      ctx.fillRect(rx, padY, t.w, 4);

      // High-Energy Elastic Surface
      ctx.fillStyle = isSuper ? '#f472b6' : '#38bdf8';
      ctx.fillRect(rx, padY, t.w, 2);

      // Bright Impulse Glow Line
      ctx.fillStyle = isSuper ? '#fde047' : '#67e8f9';
      ctx.fillRect(rx + 3, padY, t.w - 6, 1);

      // Upward Arrow Icon indicating instant impulse! (▲)
      const arrowBob = t.springAnim > 0 ? 0 : Math.sin(time * 0.16) * 1.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = rx + t.w / 2;
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
        ctx.strokeRect(rx - 1, padY - 1, t.w + 2, 6);
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
    } else if (zone === 'jungle') {
      // Jungle Run: Lush Tropical Rainforest with Ancient Mayan Pyramids
      if (act === 1) {
        // Vibrant Rainforest Canopy at Golden Dawn
        grad.addColorStop(0, '#022c22');
        grad.addColorStop(0.32, '#064e3b');
        grad.addColorStop(0.62, '#047857');
        grad.addColorStop(0.85, '#10b981');
        grad.addColorStop(1, '#a7f3d0');
      } else if (act === 2) {
        // Deep Cenote Twilight & Humid Jungle Mist
        grad.addColorStop(0, '#021815');
        grad.addColorStop(0.35, '#06392c');
        grad.addColorStop(0.7, '#0f5132');
        grad.addColorStop(0.9, '#15803d');
        grad.addColorStop(1, '#6ee7b7');
      } else {
        // Mystical Jaguar Temple Night
        grad.addColorStop(0, '#01120f');
        grad.addColorStop(0.35, '#04221b');
        grad.addColorStop(0.7, '#064e3b');
        grad.addColorStop(1, '#0f766e');
      }
    } else if (zone === 'blizzard') {
      // Blizzard Rush: High-Altitude Alpine Mountain Descent
      grad.addColorStop(0, '#0284c7');    // Deep alpine cerulean blue
      grad.addColorStop(0.32, '#38bdf8'); // Crisp mountain sky
      grad.addColorStop(0.65, '#bae6fd'); // Glistening ice mist
      grad.addColorStop(0.88, '#e0f2fe'); // Mountain snow reflection
      grad.addColorStop(1, '#f8fafc');    // Pure snow white baseline
    } else if (zone === 'steampunk') {
      // Steampunk Industrial Factory: Victorian Amber Morning (Act 1), Rusted Verdigris Decay (Act 2), Only Up 1000m Steam Furnace (Act 3)
      if (act === 1) {
        grad.addColorStop(0, '#1c1208');    // Smoked coal sky
        grad.addColorStop(0.35, '#78350f'); // Warm copper industrial smog
        grad.addColorStop(0.65, '#b45309'); // Polished brass amber
        grad.addColorStop(0.88, '#f59e0b'); // Golden steam glare
        grad.addColorStop(1, '#fef08a');    // Hearth glow
      } else if (act === 2) {
        grad.addColorStop(0, '#091c16');    // Toxic corroded verdigris sky
        grad.addColorStop(0.35, '#291508'); // Rusted dark brick
        grad.addColorStop(0.65, '#78350f'); // Iron oxide amber
        grad.addColorStop(0.88, '#ca8a04'); // Peeling sulfur yellow
        grad.addColorStop(1, '#fef08a');    // Acidic haze
      } else {
        grad.addColorStop(0, '#0a0303');    // 1000m Colossal Steam Core Void
        grad.addColorStop(0.3, '#450a0a');  // High-pressure boiler red
        grad.addColorStop(0.6, '#991b1b');  // Superheated furnace orange
        grad.addColorStop(0.85, '#ea580c'); // Intense steam flame
        grad.addColorStop(1, '#fed7aa');    // Blinding steam vent light
      }
    } else if (zone === 'castlesmash') {
      // Medieval Castle Smash:
      // Act 1: Gloomy Storm Over Outer Moat & Siege Camp
      // Act 2: Crimson Twilight Over Inner Courtyard & Armory
      // Act 3: Royal Gothic Vault & Throne Room of Lord Malakar
      if (act === 1) {
        grad.addColorStop(0, '#0a0f1d');    // Stormy dark navy sky
        grad.addColorStop(0.35, '#1e293b'); // Thundercloud charcoal
        grad.addColorStop(0.65, '#334155'); // Wet castle stone grey
        grad.addColorStop(0.88, '#475569'); // Mist horizon
        grad.addColorStop(1, '#64748b');
      } else if (act === 2) {
        grad.addColorStop(0, '#1c1917');    // Dark gothic stone
        grad.addColorStop(0.35, '#450a0a'); // Blood red castle twilight
        grad.addColorStop(0.65, '#7f1d1d'); // Siege torch glow
        grad.addColorStop(0.88, '#b45309'); // Warm ember horizon
        grad.addColorStop(1, '#f59e0b');
      } else {
        grad.addColorStop(0, '#09050d');    // Royal gothic vault shadows
        grad.addColorStop(0.35, '#3b0764'); // Imperial purple banners
        grad.addColorStop(0.7, '#7f1d1d');  // Crimson heraldry
        grad.addColorStop(0.9, '#b45309');  // Golden candlelight glow
        grad.addColorStop(1, '#fef08a');
      }
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

    // Distant Celestial Body / Cyber Matrix Ring / Volcano Crater / Desert Sun & Moon / Tropical Mayan Sun
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
    } else if (zone === 'jungle') {
      // Jungle Run: Golden Sol Maya & Distant Tropical Quetzal Birds
      if (act === 1) {
        // Warm Radiant Solar Disc with Tropical Crepuscular Sunbeams
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.beginPath();
        ctx.arc(245, 36, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.beginPath();
        ctx.arc(245, 36, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(245, 36, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(245, 36, 8, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric Jungle Sunbeams streaming through the canopy
        ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
        ctx.beginPath();
        ctx.moveTo(245, 36);
        ctx.lineTo(150, GAME_HEIGHT);
        ctx.lineTo(205, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(245, 36);
        ctx.lineTo(260, GAME_HEIGHT);
        ctx.lineTo(315, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();
      } else {
        // Mystical Jade Cenote Moon in Twilight Sky
        ctx.fillStyle = '#a7f3d0';
        ctx.beginPath();
        ctx.arc(245, 34, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(239, 32, 16, 0, Math.PI * 2);
        ctx.fill();

        // Emerald firefly stars in upper sky
        ctx.fillStyle = '#6ee7b7';
        for (let s = 0; s < 10; s++) {
          const sx = (s * 33 + 15) % GAME_WIDTH;
          const sy = (s * 17 + 8) % 65;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }

      // Distant Tropical Quetzal Birds Gliding over the Canopy
      for (let b = 0; b < 3; b++) {
        const bSpeed = 0.7 + b * 0.35;
        const bx = ((time * bSpeed * 22 + b * 115) % (GAME_WIDTH + 80)) - 30;
        const flap = Math.sin(time * 0.18 + b * 1.8) * 3;
        const by = 18 + b * 14 + Math.cos(time * 0.06 + b) * 3;

        ctx.fillStyle = b % 2 === 0 ? '#10b981' : '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 4, by - 3 + flap);
        ctx.lineTo(bx + 8, by);
        ctx.lineTo(bx + 4, by + 1);
        ctx.closePath();
        ctx.fill();

        // Long emerald/golden tail streamer feather
        ctx.strokeStyle = b % 2 === 0 ? '#34d399' : '#facc15';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - 7, by + 2 - flap * 0.5);
        ctx.stroke();
      }
    } else if (zone === 'blizzard') {
      // Blizzard Rush: Radiant Alpine Winter Sun, Solar Halo, and Frosted Clouds
      const sunX = 245;
      const sunY = 32;

      // 1. Ice Crystal Solar Halo Ring (22° Alpine Halo Phenomenon)
      const haloPulse = 0.35 + Math.sin(time * 0.04) * 0.1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${haloPulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Outer rainbow refraction rim
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
      ctx.stroke();

      // Parhelia / Sun Dogs (brilliant twin ice prism spots on the halo)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX - 32, sunY, 3, 0, Math.PI * 2);
      ctx.arc(sunX + 32, sunY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(sunX - 32, sunY, 5, 0, Math.PI * 2);
      ctx.arc(sunX + 32, sunY, 5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Solar Corona & Brilliant Core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
      ctx.fill();

      // 4-Point Alpine Solar Cross Glare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(sunX - 18, sunY - 0.5, 36, 1);
      ctx.fillRect(sunX - 0.5, sunY - 18, 1, 36);

      // 3. Drifting High-Altitude Alpine Cirrus Clouds
      for (let c = 0; c < 4; c++) {
        const cloudSpeed = 0.25 + c * 0.1;
        const cx = ((c * 95 + time * cloudSpeed - cameraX * 0.03) % (GAME_WIDTH + 80) + GAME_WIDTH + 80) % (GAME_WIDTH + 80) - 40;
        const cy = 12 + c * 10;
        const cw = 36 + c * 12;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(224, 242, 254, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy - 2, cw / 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone === 'steampunk') {
      // Steampunk Factory: Giant Revolving Brass Clockwork Gear-Sun & Billowing Industrial Chimneys
      const isRusted = act === 2;
      const isOnlyUp = act === 3;
      const gearSunX = 245;
      const gearSunY = 36;
      const radius = 24;

      // 1. Rotating Clockwork Brass Gear-Sun in the Industrial Smog
      ctx.save();
      ctx.translate(gearSunX, gearSunY);
      ctx.rotate(time * 0.015);

      // Gear teeth perimeter
      const teeth = 10;
      ctx.fillStyle = isRusted ? '#7c2d12' : '#b45309';
      for (let t = 0; t < teeth; t++) {
        ctx.save();
        ctx.rotate((t / teeth) * Math.PI * 2);
        ctx.fillRect(-2.5, -radius - 4, 5, 5);
        ctx.restore();
      }

      // Outer bronze ring
      ctx.fillStyle = isRusted ? '#431407' : '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing inner brass dial
      ctx.fillStyle = isRusted ? '#ca8a04' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.fill();

      // Mechanical central core
      ctx.fillStyle = isRusted ? '#1c1917' : '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
      ctx.fill();

      // Clockwork pointer needles
      ctx.strokeStyle = isRusted ? '#ea580c' : '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radius + 8);
      ctx.moveTo(0, 0);
      ctx.lineTo(radius - 10, 0);
      ctx.stroke();

      ctx.restore();

      // 2. Colossal Victorian Chimneys Billowing Plumes of Pure Steam
      for (let i = 0; i < 4; i++) {
        const stackX = 35 + i * 72;
        const stackH = 38 + ((i * 19) % 22);
        const stackY = 115 - stackH;
        // Brick stack body
        ctx.fillStyle = isRusted ? '#1c140e' : '#291508';
        ctx.fillRect(stackX, stackY, 14, stackH + 25);
        ctx.fillStyle = isRusted ? '#78350f' : '#78350f';
        ctx.fillRect(stackX + 2, stackY, 4, stackH + 25);
        // Smokestack flanged brass ring
        ctx.fillStyle = isRusted ? '#431407' : '#b45309';
        ctx.fillRect(stackX - 2, stackY - 2, 18, 3.5);

        // Billowing steam puffs rising upwards
        for (let s = 0; s < 5; s++) {
          const plumeY = stackY - 6 - s * 9;
          const puffR = 5 + s * 3.5;
          const plumeWiggle = Math.sin(time * 0.08 + s * 0.7 + i) * (3 + s * 2);
          const alpha = Math.max(0.12, 0.6 - s * 0.1);
          ctx.fillStyle = isRusted
            ? `rgba(217, 249, 157, ${alpha * 0.55})`
            : isOnlyUp
            ? `rgba(254, 215, 170, ${alpha})`
            : `rgba(255, 247, 237, ${alpha})`;
          ctx.beginPath();
          ctx.arc(stackX + 7 + plumeWiggle, plumeY, puffR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (zone === 'castlesmash') {
      // Medieval Castle Smash Celestial / Fortress Backdrop
      if (act === 1) {
        // Stormy blood moon peeking through dark clouds
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(245, 36, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fee2e2';
        ctx.beginPath();
        ctx.arc(245, 36, 12, 0, Math.PI * 2);
        ctx.fill();
        // Storm lightning flicker
        if (Math.sin(time * 0.15) > 0.94) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
      } else if (act === 2) {
        // Fiery siege sun & distant catapult trails
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(245, 42, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(245, 42, 14, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Act 3: Stained Glass Rose Window in Throne Room
        const rwX = 240;
        const rwY = 40;
        const rRad = 26;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rwX, rwY, rRad, 0, Math.PI * 2);
        ctx.stroke();
        // Rose window glass
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(rwX, rwY, rRad - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.beginPath();
        ctx.arc(rwX, rwY, 12, 0, Math.PI * 2);
        ctx.fill();
        // Vault light shaft
        ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
        ctx.beginPath();
        ctx.moveTo(rwX - 18, rwY);
        ctx.lineTo(rwX + 18, rwY);
        ctx.lineTo(rwX + 45, 140);
        ctx.lineTo(rwX - 45, 140);
        ctx.closePath();
        ctx.fill();
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

    // Parallax Layer 1: Distant Mountains / Cyber Skyscraper Skylines / Basalt Spires / Golden Pyramids / Jungle Canopy Ridges
    if (zone === 'jungle') {
      const p1Offset = (cameraX * 0.08) % 180;
      // Distant rolling emerald mountain ridges covered in lush rainforest canopy
      ctx.fillStyle = act === 1 ? '#042e22' : '#021c15';
      ctx.beginPath();
      ctx.moveTo(0, 115);
      for (let x = -p1Offset - 180; x <= GAME_WIDTH + 180; x += 25) {
        const h = Math.sin(x * 0.03 + cameraX * 0.0008) * 16 + Math.cos(x * 0.05) * 8;
        ctx.lineTo(x, 68 + h);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // Distant cascading jungle waterfalls pouring from high cliff ravines
      for (let wx = -p1Offset - 180; wx <= GAME_WIDTH + 180; wx += 160) {
        const fallX = wx + 85;
        const fallTopY = 64 + Math.sin(fallX * 0.03 + cameraX * 0.0008) * 16;
        ctx.fillStyle = '#38bdf8aa';
        ctx.fillRect(fallX, fallTopY, 3, 40);
        ctx.fillStyle = '#ffffffcc';
        ctx.fillRect(fallX + 1, fallTopY, 1, 38);
        // Foaming mist at the base
        ctx.fillStyle = 'rgba(167, 243, 208, 0.4)';
        ctx.beginPath();
        ctx.arc(fallX + 1.5, fallTopY + 40, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Mayan temple cresterías & stelae on mountain peaks
      ctx.fillStyle = act === 1 ? '#063f2f' : '#03261d';
      for (let rx = -p1Offset - 180; rx <= GAME_WIDTH + 180; rx += 140) {
        const crestX = rx + 30;
        const crestY = 62 + Math.sin(crestX * 0.03 + cameraX * 0.0008) * 16;
        // Distant stone temple sanctuary with crown
        ctx.fillRect(crestX - 10, crestY - 14, 20, 14);
        ctx.fillRect(crestX - 6, crestY - 22, 12, 8);
        ctx.fillRect(crestX - 2, crestY - 28, 4, 6);
        ctx.fillStyle = '#facc15aa';
        ctx.fillRect(crestX - 1, crestY - 26, 2, 2);
        ctx.fillStyle = act === 1 ? '#063f2f' : '#03261d';
      }
    } else if (zone === 'blizzard') {
      // Blizzard Rush: High Alpine Jagged Mountain Peaks with Glaciers & Snow Caps
      const p1Offset = (cameraX * 0.05) % 240;

      // 1. Far jagged mountain silhouette
      ctx.fillStyle = '#0c2238';
      ctx.beginPath();
      ctx.moveTo(0, 120);
      for (let x = -p1Offset - 240; x <= GAME_WIDTH + 240; x += 25) {
        const peak = Math.sin(x * 0.018) * 22 + Math.cos(x * 0.04 + 1.2) * 12;
        ctx.lineTo(x, 62 + peak);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // 2. Majestic Alpine Peak Triangles with Crisp Snow Facets
      for (let px = -p1Offset - 240; px <= GAME_WIDTH + 240; px += 65) {
        const peakY = 46 + Math.sin(px * 0.02) * 16;
        const peakW = 44;
        const peakH = 48;

        // Left lit face (Pristine alpine snow)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(px, peakY);
        ctx.lineTo(px - peakW * 0.6, peakY + peakH);
        ctx.lineTo(px, peakY + peakH * 0.68);
        ctx.closePath();
        ctx.fill();

        // Right shaded face (Cold alpine glacier cyan shadow)
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.moveTo(px, peakY);
        ctx.lineTo(px + peakW * 0.6, peakY + peakH);
        ctx.lineTo(px, peakY + peakH * 0.68);
        ctx.closePath();
        ctx.fill();

        // Deep granite crevasse shadow
        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.moveTo(px, peakY);
        ctx.lineTo(px + 4, peakY + peakH * 0.68);
        ctx.lineTo(px - 2, peakY + peakH * 0.85);
        ctx.closePath();
        ctx.fill();

        // Razor summit peak accent
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px - 1, peakY - 3, 2, 4);
      }
    } else if (zone === 'steampunk') {
      // Steampunk Far Layer: Victorian Industrial Factory Silhouettes, Sawtooth Gables, Clock Towers
      const p1Offset = (cameraX * 0.06) % 200;
      const isRusted = act === 2;
      const isOnlyUp = act === 3;

      ctx.fillStyle = isRusted ? '#140c06' : isOnlyUp ? '#200505' : '#1e0f06';
      ctx.beginPath();
      ctx.moveTo(0, 130);
      for (let x = -p1Offset - 200; x <= GAME_WIDTH + 200; x += 36) {
        // Industrial Sawtooth rooflines
        ctx.lineTo(x, 96);
        ctx.lineTo(x + 22, 72);
        ctx.lineTo(x + 22, 96);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // Factory brickwork & illuminated arched windows
      ctx.fillStyle = isRusted ? 'rgba(120, 53, 15, 0.4)' : isOnlyUp ? 'rgba(234, 88, 12, 0.45)' : 'rgba(245, 158, 11, 0.4)';
      for (let x = -p1Offset - 200; x <= GAME_WIDTH + 200; x += 36) {
        ctx.fillRect(x + 4, 84, 5, 8);
        ctx.fillRect(x + 13, 84, 5, 8);
      }
    } else if (zone === 'castlesmash') {
      // Parallax Layer 1: Distant Gothic Castle Fortress, Towers & Spires
      const p1Offset = (cameraX * 0.06) % 220;
      ctx.fillStyle = act === 1 ? '#0f172a' : act === 2 ? '#291206' : '#1c0a2b';
      ctx.beginPath();
      ctx.moveTo(0, 135);
      for (let x = -p1Offset - 220; x <= GAME_WIDTH + 220; x += 44) {
        // Castle towers with peaked roofs & crenels
        ctx.lineTo(x, 110);
        ctx.lineTo(x, 70);
        ctx.lineTo(x + 8, 48); // Tower conical spire
        ctx.lineTo(x + 16, 70);
        ctx.lineTo(x + 16, 92);
        ctx.lineTo(x + 44, 92);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // Flying Banners / Pennants atop spires
      ctx.fillStyle = act === 2 ? '#ef4444' : '#f59e0b';
      for (let x = -p1Offset - 220; x <= GAME_WIDTH + 220; x += 44) {
        const flagWave = Math.sin(time * 0.2 + x) * 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, 48);
        ctx.lineTo(x + 16 + flagWave, 51);
        ctx.lineTo(x + 8, 54);
        ctx.closePath();
        ctx.fill();
      }
    } else if (zone === 'sakura') {
      // Sacred Sakura Mountain Ridge (Layer 1: Distant Misty Peaks & Mount Fuji)
      const p1Offset = (cameraX * 0.06) % 220;
      ctx.fillStyle = isNight ? '#180e2b' : '#5a1d41';
      ctx.beginPath();
      ctx.moveTo(0, 118);
      for (let x = -p1Offset - 220; x <= GAME_WIDTH + 220; x += 30) {
        const h = Math.sin(x * 0.025 + cameraX * 0.0006) * 15 + Math.cos(x * 0.04) * 8;
        ctx.lineTo(x, 74 + h);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // Distant Sacred Snow-Capped Mountain Peak (Mount Fuji silhouette)
      for (let px = -p1Offset - 220; px <= GAME_WIDTH + 220; px += 210) {
        const fujiX = px + 95;
        const fujiY = 52;
        ctx.fillStyle = isNight ? '#26143e' : '#752554';
        ctx.beginPath();
        ctx.moveTo(fujiX - 38, 92);
        ctx.lineTo(fujiX - 8, fujiY);
        ctx.lineTo(fujiX + 8, fujiY);
        ctx.lineTo(fujiX + 38, 92);
        ctx.closePath();
        ctx.fill();

        // Snow cap atop Fuji
        ctx.fillStyle = isNight ? '#ddd6fe' : '#fdf2f8';
        ctx.beginPath();
        ctx.moveTo(fujiX - 14, 66);
        ctx.lineTo(fujiX - 8, fujiY);
        ctx.lineTo(fujiX + 8, fujiY);
        ctx.lineTo(fujiX + 14, 66);
        ctx.lineTo(fujiX + 7, 68);
        ctx.lineTo(fujiX, 65);
        ctx.lineTo(fujiX - 7, 68);
        ctx.closePath();
        ctx.fill();

        // Distant Pagoda Spire silhouette on the ridge
        const pagodaX = px + 25;
        const pagodaY = 70;
        ctx.fillStyle = isNight ? '#10091c' : '#451231';
        ctx.fillRect(pagodaX - 1, pagodaY - 14, 2, 7);
        ctx.fillRect(pagodaX - 5, pagodaY - 7, 10, 2);
        ctx.fillRect(pagodaX - 3, pagodaY - 5, 6, 2);
        ctx.fillRect(pagodaX - 7, pagodaY - 3, 14, 2);
        ctx.fillRect(pagodaX - 4, pagodaY - 1, 8, 3);
        ctx.fillRect(pagodaX - 9, pagodaY + 2, 18, 2);
        ctx.fillRect(pagodaX - 5, pagodaY + 4, 10, 6);
      }
    } else {
      const p1Offset = (cameraX * 0.08) % 140;
      ctx.fillStyle = zone === 'neon'
        ? (act === 1 ? '#0f2b35' : '#11172e')
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
    }

    // Parallax Layer 2: Midground Silhouettes & Ancient Architecture
    if (zone === 'jungle') {
      // JUNGLE RUN: LUSH TROPICAL RAINFOREST WITH MAYAN PYRAMIDS DOWN BELOW ("pirámides abajo")
      const p2Offset = (cameraX * 0.22) % 180;
      for (let x = -p2Offset - 180; x < GAME_WIDTH + 180; x += 170) {
        const pyrX = x + 40;
        const pyrBaseY = 146; // Base of the pyramid sits right above the lower horizon line

        // 1. EXTENDED STONE FOUNDATION IN GAPS/CHASMS (descends all the way to bottom of abyss)
        ctx.fillStyle = act === 1 ? '#05291d' : '#031a12';
        ctx.fillRect(pyrX - 44, pyrBaseY, 88, GAME_HEIGHT - pyrBaseY);
        // Mayan carved stone blocks in foundation
        ctx.fillStyle = act === 1 ? '#042217' : '#02140d';
        for (let fy = pyrBaseY + 6; fy < GAME_HEIGHT; fy += 8) {
          ctx.fillRect(pyrX - 42, fy, 84, 1);
        }

        // 2. PRIMARY STEPPED MAYAN PYRAMID ("PIRÁMIDE MAYA ABAJO")
        // Tier 5 (Base platform with ancient hieroglyphic carved border)
        ctx.fillStyle = act === 1 ? '#083a29' : '#04241a';
        ctx.fillRect(pyrX - 40, pyrBaseY - 14, 80, 14);
        ctx.fillStyle = act === 1 ? '#0b4a35' : '#063022';
        ctx.fillRect(pyrX - 38, pyrBaseY - 14, 76, 3);

        // Tier 4
        ctx.fillStyle = act === 1 ? '#0d4a34' : '#063022';
        ctx.fillRect(pyrX - 32, pyrBaseY - 26, 64, 12);
        ctx.fillStyle = act === 1 ? '#105a40' : '#083c2b';
        ctx.fillRect(pyrX - 30, pyrBaseY - 26, 60, 2.5);

        // Tier 3
        ctx.fillStyle = act === 1 ? '#125a3f' : '#093d2b';
        ctx.fillRect(pyrX - 25, pyrBaseY - 38, 50, 12);
        ctx.fillStyle = act === 1 ? '#166c4c' : '#0c4a35';
        ctx.fillRect(pyrX - 23, pyrBaseY - 38, 46, 2.5);

        // Tier 2
        ctx.fillStyle = act === 1 ? '#176c4c' : '#0d4a35';
        ctx.fillRect(pyrX - 18, pyrBaseY - 50, 36, 12);
        ctx.fillStyle = act === 1 ? '#1d825c' : '#105a40';
        ctx.fillRect(pyrX - 16, pyrBaseY - 50, 32, 2.5);

        // Tier 1 (Upper temple terrace)
        ctx.fillStyle = act === 1 ? '#1c7e59' : '#10563d';
        ctx.fillRect(pyrX - 12, pyrBaseY - 60, 24, 10);
        ctx.fillStyle = act === 1 ? '#22976b' : '#14684a';
        ctx.fillRect(pyrX - 11, pyrBaseY - 60, 22, 2);

        // Summit Temple Sanctuary (Templo Mayor)
        ctx.fillStyle = act === 1 ? '#135c41' : '#0a3c2a';
        ctx.fillRect(pyrX - 9, pyrBaseY - 72, 18, 12);
        // Roof cornice
        ctx.fillStyle = act === 1 ? '#187050' : '#0e4a34';
        ctx.fillRect(pyrX - 10, pyrBaseY - 73, 20, 3);
        // Mayan Crestería / Roof Comb
        ctx.fillStyle = act === 1 ? '#1c7e59' : '#10563d';
        ctx.fillRect(pyrX - 7, pyrBaseY - 80, 14, 7);
        ctx.fillRect(pyrX - 4, pyrBaseY - 84, 8, 4);
        ctx.fillRect(pyrX - 2, pyrBaseY - 87, 4, 3);
        // Inner Sanctuary Dark Portal
        ctx.fillStyle = '#01150c';
        ctx.fillRect(pyrX - 3, pyrBaseY - 69, 6, 9);
        // Lintel stone over doorway
        ctx.fillStyle = '#22c55e99';
        ctx.fillRect(pyrX - 4, pyrBaseY - 70, 8, 1.5);

        // Golden / Jade Solar Relic atop Crestería
        const relicPulse = Math.sin(time * 0.1 + x) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(250, 204, 21, ${relicPulse})`;
        ctx.fillRect(pyrX - 2, pyrBaseY - 88, 4, 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${relicPulse * 0.8})`;
        ctx.fillRect(pyrX - 1, pyrBaseY - 87, 2, 1);

        // Grand Central Staircase (Escalinata Maya) running all the way down
        ctx.fillStyle = act === 1 ? '#207857' : '#11543d';
        ctx.fillRect(pyrX - 5, pyrBaseY - 60, 10, 60);
        // Individual stone steps
        ctx.fillStyle = act === 1 ? '#34d39966' : '#2dd4bf55';
        for (let st = pyrBaseY - 58; st < pyrBaseY; st += 3.5) {
          ctx.fillRect(pyrX - 4, st, 8, 1);
        }
        // Kukulcán Feathered Serpent Head Balustrades at base
        ctx.fillStyle = '#facc15';
        ctx.fillRect(pyrX - 7, pyrBaseY - 5, 2.5, 5);
        ctx.fillRect(pyrX + 4.5, pyrBaseY - 5, 2.5, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(pyrX - 6.5, pyrBaseY - 4, 1.5, 1.5);
        ctx.fillRect(pyrX + 5, pyrBaseY - 4, 1.5, 1.5);

        // Ancient Jungle Vines & Epiphytes Clinging to Stone Tiers
        ctx.fillStyle = '#22c55e99';
        ctx.fillRect(pyrX - 28, pyrBaseY - 24, 3, 10);
        ctx.fillRect(pyrX - 26, pyrBaseY - 18, 5, 2);
        ctx.fillRect(pyrX + 22, pyrBaseY - 34, 3, 12);
        ctx.fillRect(pyrX + 24, pyrBaseY - 26, 4, 2);
        ctx.fillRect(pyrX - 15, pyrBaseY - 46, 2, 8);
        ctx.fillRect(pyrX + 11, pyrBaseY - 56, 2, 7);

        // 3. SECONDARY STEPPED PYRAMID IN THE VALLEY DEPTH (Adds majestic ancient city scale)
        const twinX = x + 112;
        const twinBaseY = 142;
        ctx.fillStyle = act === 1 ? '#063324' : '#032017';
        ctx.fillRect(twinX - 20, twinBaseY - 8, 40, 8);
        ctx.fillStyle = act === 1 ? '#083e2c' : '#04281d';
        ctx.fillRect(twinX - 16, twinBaseY - 16, 32, 8);
        ctx.fillStyle = act === 1 ? '#0b4a35' : '#063022';
        ctx.fillRect(twinX - 12, twinBaseY - 24, 24, 8);
        ctx.fillStyle = act === 1 ? '#0e563e' : '#083827';
        ctx.fillRect(twinX - 8, twinBaseY - 30, 16, 6);
        // Small sanctuary
        ctx.fillStyle = act === 1 ? '#0a4230' : '#052a1e';
        ctx.fillRect(twinX - 5, twinBaseY - 38, 10, 8);
        ctx.fillRect(twinX - 3, twinBaseY - 43, 6, 5);
        // Doorway
        ctx.fillStyle = '#01120a';
        ctx.fillRect(twinX - 1.5, twinBaseY - 36, 3, 6);
        // Mini stairs
        ctx.fillStyle = act === 1 ? '#146046' : '#0a3d2c';
        ctx.fillRect(twinX - 2.5, twinBaseY - 30, 5, 30);

        // 4. LUSH TROPICAL TREES FRAMING THE PYRAMIDS BELOW
        // Sacred Giant Ceiba Tree (Yaxché)
        const ceibaX = pyrX + 54;
        ctx.fillStyle = '#032116';
        ctx.fillRect(ceibaX - 3, pyrBaseY - 68, 6, 68);
        // Flared buttress roots at base
        ctx.beginPath();
        ctx.moveTo(ceibaX - 7, pyrBaseY);
        ctx.lineTo(ceibaX - 3, pyrBaseY - 16);
        ctx.lineTo(ceibaX + 3, pyrBaseY - 16);
        ctx.lineTo(ceibaX + 7, pyrBaseY);
        ctx.closePath();
        ctx.fill();

        // Expansive Ceiba Canopy Layers
        ctx.fillStyle = act === 1 ? '#15803d' : '#064e3b';
        ctx.beginPath();
        ctx.arc(ceibaX, pyrBaseY - 70, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = act === 1 ? '#16a34a' : '#047857';
        ctx.beginPath();
        ctx.arc(ceibaX - 10, pyrBaseY - 74, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ceibaX + 10, pyrBaseY - 72, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = act === 1 ? '#22c55e' : '#10b981';
        ctx.beginPath();
        ctx.arc(ceibaX, pyrBaseY - 79, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hanging lianas / tropical jungle vines
        ctx.strokeStyle = '#22c55e88';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ceibaX - 8, pyrBaseY - 65);
        ctx.lineTo(ceibaX - 8, pyrBaseY - 42);
        ctx.moveTo(ceibaX + 11, pyrBaseY - 66);
        ctx.lineTo(ceibaX + 12, pyrBaseY - 46);
        ctx.stroke();

        // Tropical Palm Tree on the left of the pyramid
        const palmX = pyrX - 48;
        ctx.strokeStyle = '#04271b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(palmX, pyrBaseY);
        ctx.quadraticCurveTo(palmX - 6, pyrBaseY - 26, palmX - 4, pyrBaseY - 50);
        ctx.stroke();
        // Radiating palm fronds
        const palmTopX = palmX - 4;
        const palmTopY = pyrBaseY - 50;
        ctx.fillStyle = act === 1 ? '#15803d' : '#065f46';
        for (let fa = 0; fa < 6; fa++) {
          const fAngle = (fa * Math.PI) / 3.2 - Math.PI / 1.6;
          const fx = palmTopX + Math.cos(fAngle) * 14;
          const fy = palmTopY + Math.sin(fAngle) * 9;
          ctx.beginPath();
          ctx.moveTo(palmTopX, palmTopY);
          ctx.lineTo(fx, fy);
          ctx.lineTo(fx - 2, fy + 4);
          ctx.closePath();
          ctx.fill();
        }

        // 5. JUNGLE CENOTE WATERFALL & BASIN DOWN BELOW
        const cX = pyrX + 78;
        // Waterfall streaming down into cenote
        ctx.fillStyle = '#38bdf8cc';
        ctx.fillRect(cX, pyrBaseY - 28, 5, 28);
        ctx.fillStyle = '#a7f3d0dd';
        ctx.fillRect(cX + 1.5, pyrBaseY - 28, 2, 27);
        // Crystal Turquoise Cenote Pool
        ctx.fillStyle = '#06b6d4ee';
        ctx.fillRect(cX - 12, pyrBaseY - 3, 26, 4);
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(cX - 1, pyrBaseY - 4, 5, 2);
        // Floating water lily pads
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cX - 8, pyrBaseY - 4, 3, 1.5);
        ctx.fillRect(cX + 8, pyrBaseY - 4, 3, 1.5);
      }
    } else if (zone === 'blizzard') {
      // Blizzard Rush: Downhill Mountain Ridge, Alpine Evergreen Forest, Ski Lift, and Mountain Chalets
      const p2Offset = (cameraX * 0.16) % 200;

      // 1. Midground Sloping Alpine Mountain Ridge Line
      ctx.fillStyle = '#0f2744';
      ctx.beginPath();
      ctx.moveTo(0, 148);
      for (let x = -p2Offset - 200; x <= GAME_WIDTH + 200; x += 25) {
        // Continuous mountain flank descending towards the right
        const slopeY = 82 + ((x + cameraX * 0.16) % 260) * 0.08 + Math.sin(x * 0.03) * 6;
        ctx.lineTo(x, slopeY);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();

      // Frosted snow line on top of the midground ridge
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = -p2Offset - 200; x <= GAME_WIDTH + 200; x += 25) {
        const slopeY = 82 + ((x + cameraX * 0.16) % 260) * 0.08 + Math.sin(x * 0.03) * 6;
        if (x === -p2Offset - 200) ctx.moveTo(x, slopeY);
        else ctx.lineTo(x, slopeY);
      }
      ctx.stroke();

      // 2. Dense Alpine Pine & Spruce Trees on the Mountain Flank
      for (let x = -p2Offset - 200; x < GAME_WIDTH + 200; x += 40) {
        const treeBaseY = 94 + Math.sin(x * 0.03) * 5;
        // Trunk
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 5, treeBaseY - 6, 3, 6);
        // 3 Tiers of snow-laden pine foliage
        for (let tier = 0; tier < 3; tier++) {
          const tw = 15 - tier * 4;
          const ty = treeBaseY - 6 - tier * 6;
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(x + 6.5, ty - 6);
          ctx.lineTo(x + 6.5 - tw / 2, ty);
          ctx.lineTo(x + 6.5 + tw / 2, ty);
          ctx.closePath();
          ctx.fill();

          // Snow blanket on each tier
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 6.5 - tw / 2 + 1, ty - 2, tw - 2, 2);
        }
      }

      // 3. Cozy Alpine Mountain Chalet (Nestled on the slope with smoking chimney)
      for (let cx = -p2Offset - 200; cx < GAME_WIDTH + 200; cx += 220) {
        const chaletX = cx + 70;
        const chaletBaseY = 95;
        // Timber log walls
        ctx.fillStyle = '#451a03';
        ctx.fillRect(chaletX - 12, chaletBaseY - 14, 24, 14);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(chaletX - 11, chaletBaseY - 13, 22, 12);
        // Glowing warm amber windows
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(chaletX - 7, chaletBaseY - 10, 4, 4);
        ctx.fillRect(chaletX + 3, chaletBaseY - 10, 4, 4);
        // Steep snow-covered A-frame roof
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(chaletX, chaletBaseY - 24);
        ctx.lineTo(chaletX - 16, chaletBaseY - 13);
        ctx.lineTo(chaletX + 16, chaletBaseY - 13);
        ctx.closePath();
        ctx.fill();
        // Stone chimney with curling smoke
        ctx.fillStyle = '#475569';
        ctx.fillRect(chaletX + 6, chaletBaseY - 24, 4, 8);
        for (let s = 0; s < 3; s++) {
          const smokeX = chaletX + 8 + Math.sin(time * 0.08 + s) * 3 - s * 2;
          const smokeY = chaletBaseY - 26 - s * 5;
          ctx.fillStyle = `rgba(224, 242, 254, ${0.6 - s * 0.18})`;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 2 + s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Overhead Working Alpine Ski Lift (Telesilla alpino)
      const cableY1 = 36;
      const cableY2 = 54;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cableY1);
      ctx.lineTo(GAME_WIDTH, cableY2);
      ctx.stroke();

      // Steel Lift Pylons
      for (let px = -p2Offset - 200; px < GAME_WIDTH + 200; px += 130) {
        const pylonTopY = cableY1 + ((px / GAME_WIDTH) * (cableY2 - cableY1));
        // Steel Mast
        ctx.fillStyle = '#475569';
        ctx.fillRect(px - 2, pylonTopY, 4, 55);
        // Crossbar
        ctx.fillStyle = '#64748b';
        ctx.fillRect(px - 10, pylonTopY - 2, 20, 3);
        // Pulley wheels
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px - 7, pylonTopY, 2.5, 0, Math.PI * 2);
        ctx.arc(px + 7, pylonTopY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moving Ski Chairs suspended on the cable
      for (let c = 0; c < 5; c++) {
        const chairX = ((time * 0.45 + c * 85 - cameraX * 0.16) % (GAME_WIDTH + 120) + GAME_WIDTH + 120) % (GAME_WIDTH + 120) - 60;
        const chairY = cableY1 + ((chairX / GAME_WIDTH) * (cableY2 - cableY1));
        // Hanger Arm
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chairX, chairY);
        ctx.lineTo(chairX, chairY + 11);
        ctx.stroke();
        // Orange alpine chair seat
        ctx.fillStyle = '#f97316';
        ctx.fillRect(chairX - 4, chairY + 11, 8, 2);
        ctx.fillRect(chairX - 4, chairY + 7, 2, 5);
        // Skier silhouette on the chair with blue beanie
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(chairX - 2, chairY + 6, 4, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(chairX - 2, chairY + 4, 4, 2);
        // Skis hanging down
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chairX - 3, chairY + 12);
        ctx.lineTo(chairX + 3, chairY + 14);
        ctx.stroke();
      }
    } else if (zone === 'steampunk') {
      // Steampunk Midground Layer: Interconnected Industrial Copper Pipes, Rotating Bronze Cogwheels, Gauges & Catwalks
      const p2Offset = (cameraX * 0.16) % 180;
      const isRusted = act === 2;
      const isOnlyUp = act === 3;

      for (let x = -p2Offset - 180; x < GAME_WIDTH + 180; x += 150) {
        // 1. Horizontal Industrial Steam Conduit
        ctx.fillStyle = isRusted ? '#381608' : '#7c2d12';
        ctx.fillRect(x, 92, 150, 7);
        ctx.fillStyle = isRusted ? '#63280c' : '#c2410c';
        ctx.fillRect(x, 93.5, 150, 2);

        // 2. Vertical Feeder Pipe & Flanged Coupling Joints
        ctx.fillStyle = isRusted ? '#291206' : '#5c1d0a';
        ctx.fillRect(x + 45, 92, 9, 48);
        ctx.fillStyle = isRusted ? '#52220b' : '#9a3412';
        ctx.fillRect(x + 46, 92, 3, 48);

        // Brass Pipe Flanges
        ctx.fillStyle = isRusted ? '#1c140e' : '#fbbf24';
        ctx.fillRect(x + 43, 90, 13, 3);
        ctx.fillRect(x + 43, 118, 13, 3);

        // Steam Pressure Dial / Manometer
        ctx.fillStyle = isRusted ? '#451a03' : '#d97706';
        ctx.beginPath();
        ctx.arc(x + 49.5, 85, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 49.5, 85, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Needle
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 49.5, 85);
        ctx.lineTo(x + 49.5 + Math.cos(time * 0.1 + x) * 2.5, 85 + Math.sin(time * 0.1 + x) * 2.5);
        ctx.stroke();

        // 3. Rotating Bronze Industrial Cogwheels
        const cogX = x + 95;
        const cogY = 82;
        const cogR = 15;
        ctx.save();
        ctx.translate(cogX, cogY);
        ctx.rotate(-time * 0.035);

        // Teeth
        const teethCount = 8;
        ctx.fillStyle = isRusted ? '#431407' : '#9a3412';
        for (let t = 0; t < teethCount; t++) {
          ctx.save();
          ctx.rotate((t / teethCount) * Math.PI * 2);
          ctx.fillRect(-2, -cogR - 3.5, 4, 4);
          ctx.restore();
        }

        // Cog Body
        ctx.fillStyle = isRusted ? '#52220b' : '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, cogR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isRusted ? '#78350f' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, cogR - 3, 0, Math.PI * 2);
        ctx.fill();

        // Center Axle Hole
        ctx.fillStyle = isRusted ? '#1c140e' : '#291508';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Second Interlocking Smaller Cog (Rotates in reverse!)
        const cog2X = cogX + 22;
        const cog2Y = cogY + 12;
        const cog2R = 10;
        ctx.save();
        ctx.translate(cog2X, cog2Y);
        ctx.rotate(time * 0.05 + 0.3);
        ctx.fillStyle = isRusted ? '#431407' : '#9a3412';
        for (let t = 0; t < 6; t++) {
          ctx.save();
          ctx.rotate((t / 6) * Math.PI * 2);
          ctx.fillRect(-1.5, -cog2R - 2.5, 3, 3);
          ctx.restore();
        }
        ctx.fillStyle = isRusted ? '#63280c' : '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, cog2R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isRusted ? '#1c140e' : '#291508';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Hanging Factory Lantern with Warm Amber Spill
        const lampX = x + 15;
        const lampY = 99;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lampX, 92);
        ctx.lineTo(lampX, lampY);
        ctx.stroke();

        ctx.fillStyle = isRusted ? '#1c140e' : '#b45309';
        ctx.fillRect(lampX - 3, lampY, 6, 2);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(lampX - 2, lampY + 2, 4, 4);
        ctx.fillStyle = isRusted ? '#1c140e' : '#78350f';
        ctx.fillRect(lampX - 3, lampY + 6, 6, 1.5);

        // Lantern Warm Ambient Glow
        ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
        ctx.beginPath();
        ctx.arc(lampX, lampY + 4, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone === 'castlesmash') {
      // Medieval Castle Midground Layer: Stone Ramparts, Barbican Arches, Torchlight Sconces & Hanging Banners
      const p2Offset = (cameraX * 0.18) % 180;
      for (let x = -p2Offset - 180; x < GAME_WIDTH + 180; x += 140) {
        // 1. Heavy Stone Barbican Archway & Rampart
        ctx.fillStyle = act === 1 ? '#1e293b' : act === 2 ? '#3b1206' : '#2e1065';
        ctx.fillRect(x, 82, 140, 68);

        // Crenellations atop wall
        ctx.fillStyle = act === 1 ? '#334155' : act === 2 ? '#5c1d0a' : '#4c1d95';
        for (let cx = x + 4; cx < x + 136; cx += 16) {
          ctx.fillRect(cx, 74, 8, 8);
        }

        // Fortified Arched Gateway
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(x + 70, 114, 18, Math.PI, 0);
        ctx.rect(x + 52, 114, 36, 36);
        ctx.fill();

        // 2. Iron Torch Sconces with Animated Flickering Flames
        const torchX = x + 35;
        const torchY = 100;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(torchX - 1, torchY, 3, 10);
        ctx.fillRect(torchX - 3, torchY + 1, 7, 3);
        // Flickering Torch Flame
        const flameBob = Math.sin(time * 0.3 + x) * 1.5;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(torchX + 0.5, torchY - 2 + flameBob, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(torchX + 0.5, torchY - 2 + flameBob, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(torchX, torchY - 3 + flameBob, 1.5, 2);

        // Torchlight Warm Halos
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.beginPath();
        ctx.arc(torchX + 0.5, torchY - 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // 3. Heraldic Tapestry / Banner hanging on rampart
        ctx.fillStyle = act === 2 ? '#991b1b' : '#1d4ed8';
        ctx.beginPath();
        ctx.moveTo(x + 105, 88);
        ctx.lineTo(x + 125, 88);
        ctx.lineTo(x + 125, 118);
        ctx.lineTo(x + 115, 126);
        ctx.lineTo(x + 105, 118);
        ctx.closePath();
        ctx.fill();
        // Golden Lion Sigil
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 112, 94, 6, 8);
        ctx.fillRect(x + 110, 97, 10, 2);
      }
    } else {
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
          // Midground Graceful Cherry Blossom Trees & Shinto Stone Lanterns
          const trunkX = x + 34;
          // Curved gnarled trunk
          ctx.fillStyle = isNight ? '#140c20' : '#42162e';
          ctx.beginPath();
          ctx.moveTo(trunkX - 4, 150);
          ctx.quadraticCurveTo(trunkX - 1, 95, trunkX - 2, 68);
          ctx.lineTo(trunkX + 4, 68);
          ctx.quadraticCurveTo(trunkX + 5, 95, trunkX + 5, 150);
          ctx.closePath();
          ctx.fill();

          // Tree branches
          ctx.beginPath();
          ctx.moveTo(trunkX, 74);
          ctx.quadraticCurveTo(trunkX - 12, 66, trunkX - 18, 58);
          ctx.lineTo(trunkX - 16, 56);
          ctx.quadraticCurveTo(trunkX - 10, 63, trunkX + 2, 70);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(trunkX + 1, 72);
          ctx.quadraticCurveTo(trunkX + 14, 65, trunkX + 20, 56);
          ctx.lineTo(trunkX + 18, 54);
          ctx.quadraticCurveTo(trunkX + 12, 62, trunkX - 1, 68);
          ctx.fill();

          // Layered Blossom Foliage Canopies
          const blossomDeep = isNight ? '#3b1652' : '#9d2f6c';
          const blossomMid = isNight ? '#5b217c' : '#c04a88';
          const blossomLight = isNight ? '#7c3aed88' : '#e879a8aa';

          // Base canopy puff
          ctx.fillStyle = blossomDeep;
          ctx.beginPath();
          ctx.arc(trunkX - 12, 56, 18, 0, Math.PI * 2);
          ctx.arc(trunkX + 14, 54, 19, 0, Math.PI * 2);
          ctx.arc(trunkX, 48, 22, 0, Math.PI * 2);
          ctx.fill();

          // Mid highlight blossom puffs
          ctx.fillStyle = blossomMid;
          ctx.beginPath();
          ctx.arc(trunkX - 8, 50, 14, 0, Math.PI * 2);
          ctx.arc(trunkX + 10, 48, 15, 0, Math.PI * 2);
          ctx.arc(trunkX, 42, 16, 0, Math.PI * 2);
          ctx.fill();

          // Top light petal highlight
          ctx.fillStyle = blossomLight;
          ctx.beginPath();
          ctx.arc(trunkX - 3, 38, 11, 0, Math.PI * 2);
          ctx.arc(trunkX + 5, 38, 10, 0, Math.PI * 2);
          ctx.fill();

          // Stone Shrine Lantern (Tōrō) nestled beside tree
          const tX = x + 10;
          ctx.fillStyle = isNight ? '#1e1b2e' : '#4c2e42';
          ctx.fillRect(tX - 3, 106, 6, 2);
          ctx.fillRect(tX - 1.5, 96, 3, 10);
          ctx.fillRect(tX - 3.5, 94, 7, 2);
          // Fire chamber with warm flame glow
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(tX - 2, 90, 4, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(tX - 1, 91, 2, 2);
          // Lantern roof & jewel finial
          ctx.fillStyle = isNight ? '#1e1b2e' : '#4c2e42';
          ctx.fillRect(tX - 5, 88, 10, 2);
          ctx.fillRect(tX - 1, 86, 2, 2);
          ctx.fillStyle = act === 1 ? '#15414d' : '#192247';
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
          // Ancient Sandstone Obelisks & Ruined Temples (Desert)
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
    }

    // =========================================================================
    // Parallax Layer 3: Near Forest & Canopy Depth Layer (p3Offset)
    // Dynamic near-depth multi-layered scrolling based on camera position (0.36x - 0.42x)
    // providing rich organic depth to forest environments (Sakura & Jungle)
    // =========================================================================
    if (zone === 'sakura') {
      // Near Forest Layer: Ancient Flowering Cherry Trees, Cascading Blossoms, Bamboo Thickets, Shinto Shide
      const p3Offset = (cameraX * 0.38) % 220;
      for (let x = -p3Offset - 220; x < GAME_WIDTH + 220; x += 190) {
        const treeX = x + 55;
        const groundY = 155;

        // 1. Ancient Gnarled Sakura Trunk (near depth silhouette)
        const trunkCol = isNight ? '#0d0716' : '#2b0c1e';
        const barkShade = isNight ? '#160b24' : '#3f132c';
        ctx.fillStyle = trunkCol;
        // Flared roots
        ctx.beginPath();
        ctx.moveTo(treeX - 10, groundY);
        ctx.quadraticCurveTo(treeX - 3, groundY - 25, treeX - 3, 75);
        ctx.lineTo(treeX + 5, 75);
        ctx.quadraticCurveTo(treeX + 5, groundY - 25, treeX + 12, groundY);
        ctx.closePath();
        ctx.fill();

        // Bark texture streak
        ctx.fillStyle = barkShade;
        ctx.fillRect(treeX - 1, 80, 2, groundY - 82);

        // Sweeping arching branch extending across the upper foreground
        ctx.fillStyle = trunkCol;
        ctx.beginPath();
        ctx.moveTo(treeX, 82);
        ctx.quadraticCurveTo(treeX - 22, 70, treeX - 45, 58);
        ctx.lineTo(treeX - 42, 54);
        ctx.quadraticCurveTo(treeX - 18, 66, treeX + 3, 76);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(treeX + 2, 78);
        ctx.quadraticCurveTo(treeX + 28, 64, treeX + 52, 52);
        ctx.lineTo(treeX + 50, 48);
        ctx.quadraticCurveTo(treeX + 24, 60, treeX - 1, 72);
        ctx.closePath();
        ctx.fill();

        // 2. Near Depth Blooming Sakura Blossom Clusters
        const pDeep = isNight ? '#4c1d68' : '#b81e6c';
        const pMid = isNight ? '#7e22ce' : '#ec4899';
        const pLight = isNight ? '#a855f7' : '#f472b6';
        const pGlaze = isNight ? '#c084fcaa' : '#fbcfe8cc';

        // Left branch blossom cluster
        ctx.fillStyle = pDeep;
        ctx.beginPath();
        ctx.arc(treeX - 38, 54, 16, 0, Math.PI * 2);
        ctx.arc(treeX - 24, 48, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pMid;
        ctx.beginPath();
        ctx.arc(treeX - 35, 50, 13, 0, Math.PI * 2);
        ctx.arc(treeX - 22, 44, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pLight;
        ctx.beginPath();
        ctx.arc(treeX - 33, 46, 9, 0, Math.PI * 2);
        ctx.arc(treeX - 20, 40, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pGlaze;
        ctx.beginPath();
        ctx.arc(treeX - 22, 38, 6, 0, Math.PI * 2);
        ctx.fill();

        // Right branch blossom cluster
        ctx.fillStyle = pDeep;
        ctx.beginPath();
        ctx.arc(treeX + 36, 48, 17, 0, Math.PI * 2);
        ctx.arc(treeX + 50, 46, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pMid;
        ctx.beginPath();
        ctx.arc(treeX + 38, 44, 14, 0, Math.PI * 2);
        ctx.arc(treeX + 48, 42, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pLight;
        ctx.beginPath();
        ctx.arc(treeX + 40, 40, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pGlaze;
        ctx.beginPath();
        ctx.arc(treeX + 42, 38, 6, 0, Math.PI * 2);
        ctx.fill();

        // Crown central canopy
        ctx.fillStyle = pDeep;
        ctx.beginPath();
        ctx.arc(treeX + 5, 42, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pMid;
        ctx.beginPath();
        ctx.arc(treeX + 6, 37, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pLight;
        ctx.beginPath();
        ctx.arc(treeX + 6, 32, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pGlaze;
        ctx.beginPath();
        ctx.arc(treeX + 7, 28, 7, 0, Math.PI * 2);
        ctx.fill();

        // 3. Sacred Shinto Paper Streamers (Shide) hanging from branch
        const shideFlutter = Math.sin(time * 0.12 + x) * 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(treeX - 18 + shideFlutter * 0.4, 66, 3, 3);
        ctx.fillRect(treeX - 16 + shideFlutter * 0.6, 69, 3, 3);
        ctx.fillRect(treeX - 18 + shideFlutter * 0.8, 72, 3, 3);
        ctx.fillRect(treeX - 16 + shideFlutter, 75, 2.5, 3);
        ctx.fillRect(treeX + 22 - shideFlutter * 0.4, 64, 3, 3);
        ctx.fillRect(treeX + 24 - shideFlutter * 0.6, 67, 3, 3);
        ctx.fillRect(treeX + 22 - shideFlutter * 0.8, 70, 3, 3);

        // 4. Dense Bamboo Grove Cluster standing beside the Sakura Tree
        const bambooBaseX = treeX + 85;
        const bambooStalkCol = isNight ? '#052317' : '#064e3b';
        const bambooRingCol = isNight ? '#10b98166' : '#34d39988';
        const bambooLeafCol = isNight ? '#065f46' : '#10b981';

        for (let b = 0; b < 4; b++) {
          const bx = bambooBaseX + b * 11;
          const bh = 58 + ((b * 17) % 18);
          const by = groundY - bh;

          // Bamboo culm
          ctx.fillStyle = bambooStalkCol;
          ctx.fillRect(bx, by, 3.5, bh);

          // Bamboo node rings
          ctx.fillStyle = bambooRingCol;
          for (let ny = by + 8; ny < groundY; ny += 11) {
            ctx.fillRect(bx - 0.5, ny, 4.5, 1.5);
          }

          // Bamboo leaf sprays
          ctx.fillStyle = bambooLeafCol;
          const leafSway = Math.sin(time * 0.1 + b * 1.5) * 2;
          ctx.beginPath();
          ctx.moveTo(bx + 3, by + 12);
          ctx.lineTo(bx + 11 + leafSway, by + 9);
          ctx.lineTo(bx + 4, by + 15);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(bx, by + 22);
          ctx.lineTo(bx - 9 + leafSway, by + 20);
          ctx.lineTo(bx - 1, by + 25);
          ctx.closePath();
          ctx.fill();
        }
      }
    } else if (zone === 'jungle') {
      // Near Forest Layer: Towering Ceiba Giants, Sprawling Palm Fronds, Hanging Lianas & Epiphytes
      const p3Offset = (cameraX * 0.40) % 240;
      for (let x = -p3Offset - 240; x < GAME_WIDTH + 240; x += 180) {
        const trunkX = x + 70;
        const groundY = 152;

        // 1. Towering Jungle Giant Tree with Buttressed Roots & Aerial Drop Roots
        const trunkDark = act === 1 ? '#031c14' : '#01120d';
        const mossHighlight = act === 1 ? '#15803d' : '#047857';
        ctx.fillStyle = trunkDark;

        // Wide flared buttress root base
        ctx.beginPath();
        ctx.moveTo(trunkX - 16, groundY);
        ctx.quadraticCurveTo(trunkX - 4, groundY - 30, trunkX - 4, 60);
        ctx.lineTo(trunkX + 6, 60);
        ctx.quadraticCurveTo(trunkX + 6, groundY - 30, trunkX + 18, groundY);
        ctx.closePath();
        ctx.fill();

        // Mossy bark highlight streak
        ctx.fillStyle = mossHighlight;
        ctx.fillRect(trunkX, 65, 2.5, groundY - 68);

        // Aerial drop roots winding down to ground
        ctx.fillStyle = trunkDark;
        ctx.fillRect(trunkX - 9, groundY - 38, 2, 38);
        ctx.fillRect(trunkX + 11, groundY - 44, 2, 44);

        // 2. Hanging Jungle Lianas with Tropical Orchid Blossoms
        const vineWave = Math.sin(time * 0.08 + x) * 3;
        ctx.strokeStyle = act === 1 ? '#166534' : '#064e3b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(trunkX - 22, 45);
        ctx.quadraticCurveTo(trunkX - 24 + vineWave, 85, trunkX - 20 + vineWave * 1.5, 115);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(trunkX + 28, 48);
        ctx.quadraticCurveTo(trunkX + 32 - vineWave, 90, trunkX + 26 - vineWave * 1.3, 122);
        ctx.stroke();

        // Exotic Orchid Blossoms on Vines
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(trunkX - 21 + vineWave * 1.3, 98, 3, 0, Math.PI * 2);
        ctx.arc(trunkX + 28 - vineWave, 105, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(trunkX - 21.5 + vineWave * 1.3, 97.5, 1.5, 1.5);
        ctx.fillRect(trunkX + 27.5 - vineWave, 104.5, 1.5, 1.5);

        // 3. Sprawling Near Tropical Palm Fronds (Palmeras Tropicales en Primer Plano)
        const palmCenter = trunkX - 35;
        const palmY = 100;
        ctx.fillStyle = act === 1 ? '#047857' : '#064e3b';
        for (let a = 0; a < 5; a++) {
          const angle = -Math.PI * 0.85 + a * (Math.PI * 0.38);
          const frondLen = 28;
          const fx = palmCenter + Math.cos(angle) * frondLen;
          const fy = palmY + Math.sin(angle) * (frondLen * 0.65);
          const midX = palmCenter + Math.cos(angle) * (frondLen * 0.5);
          const midY = palmY + Math.sin(angle) * (frondLen * 0.35) - 4;

          ctx.beginPath();
          ctx.moveTo(palmCenter, palmY);
          ctx.quadraticCurveTo(midX - 3, midY, fx, fy);
          ctx.quadraticCurveTo(midX + 3, midY + 4, palmCenter, palmY);
          ctx.closePath();
          ctx.fill();

          // Leaf frond spine
          ctx.strokeStyle = act === 1 ? '#10b981' : '#0f766e';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(palmCenter, palmY);
          ctx.quadraticCurveTo(midX, midY, fx, fy);
          ctx.stroke();
        }

        // 4. Monstera & Giant Jungle Fern Leaves
        const fernX = trunkX + 38;
        const fernY = 112;
        ctx.fillStyle = act === 1 ? '#059669' : '#047857';
        ctx.beginPath();
        ctx.ellipse(fernX, fernY, 14, 22, Math.PI * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = trunkDark;
        ctx.fillRect(fernX + 4, fernY - 6, 5, 2);
        ctx.fillRect(fernX + 2, fernY + 3, 6, 2);
        ctx.fillRect(fernX - 8, fernY - 2, 5, 2);

        // 5. Overhead Rainforest Canopy Layer (Frames the top with dense foliage)
        ctx.fillStyle = act === 1 ? '#064e3b' : '#022c22';
        ctx.beginPath();
        ctx.arc(trunkX - 15, 22, 28, 0, Math.PI * 2);
        ctx.arc(trunkX + 25, 20, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = act === 1 ? '#047857' : '#033f30';
        ctx.beginPath();
        ctx.arc(trunkX - 10, 26, 22, 0, Math.PI * 2);
        ctx.arc(trunkX + 22, 24, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = act === 1 ? '#10b981' : '#065f46';
        ctx.beginPath();
        ctx.arc(trunkX - 6, 30, 15, 0, Math.PI * 2);
        ctx.arc(trunkX + 18, 28, 17, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone === 'blizzard') {
      // Near Frost Layer: Close Snow-Laden Spruce Pines & Ice Spires
      const p3Offset = (cameraX * 0.36) % 220;
      for (let x = -p3Offset - 220; x < GAME_WIDTH + 220; x += 190) {
        const treeX = x + 60;
        const groundY = 152;
        // Trunk
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(treeX - 2, groundY - 20, 4, 20);
        // Near snow pine foliage
        for (let t = 0; t < 4; t++) {
          const tw = 26 - t * 5;
          const ty = groundY - 18 - t * 10;
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(treeX, ty - 10);
          ctx.lineTo(treeX - tw / 2, ty);
          ctx.lineTo(treeX + tw / 2, ty);
          ctx.closePath();
          ctx.fill();
          // Snow blanket
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(treeX - tw / 2 + 2, ty - 3, tw - 4, 3);
        }
        // Glacial Ice Stalagmite
        const iceX = treeX + 50;
        ctx.fillStyle = '#7dd3fc88';
        ctx.beginPath();
        ctx.moveTo(iceX, groundY - 26);
        ctx.lineTo(iceX - 5, groundY);
        ctx.lineTo(iceX + 5, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffffbb';
        ctx.fillRect(iceX - 1, groundY - 24, 2, 8);
      }
    } else if (zone === 'steampunk') {
      // Near Industrial Layer: Close Flanged Steam Pipelines & Brass Valves
      const p3Offset = (cameraX * 0.36) % 200;
      for (let x = -p3Offset - 200; x < GAME_WIDTH + 200; x += 170) {
        // Heavy foreground pipe
        ctx.fillStyle = act === 2 ? '#241006' : '#451a03';
        ctx.fillRect(x, 122, 170, 8);
        ctx.fillStyle = act === 2 ? '#451a03' : '#78350f';
        ctx.fillRect(x, 123.5, 170, 2);
        // Pipe coupling
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 50, 120, 8, 12);
        // Valve wheel
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(x + 54, 114, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone === 'castlesmash') {
      // Near Castle Layer: Stone battlements, arrow slits, and wooden scaffolding
      const p3Offset = (cameraX * 0.36) % 180;
      for (let x = -p3Offset - 180; x < GAME_WIDTH + 180; x += 160) {
        // Wooden siege scaffolding
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 20, 110, 4, 38);
        ctx.fillRect(x + 60, 110, 4, 38);
        ctx.fillRect(x + 18, 122, 48, 3);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 22, 112);
        ctx.lineTo(x + 62, 146);
        ctx.stroke();
      }
    } else if (zone === 'desert') {
      // Near Desert Layer: Wind-sculpted sand dunes & ancient column ruins
      const p3Offset = (cameraX * 0.36) % 180;
      ctx.fillStyle = act === 1 ? '#b45309' : '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(0, 145);
      for (let x = -p3Offset - 180; x <= GAME_WIDTH + 180; x += 40) {
        const h = Math.sin(x * 0.03 + cameraX * 0.002) * 10;
        ctx.lineTo(x, 130 + h);
      }
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT);
      ctx.fill();
    }
    const count = zone === 'blizzard' ? 44 : zone === 'steampunk' ? 38 : zone === 'castlesmash' ? 36 : zone === 'lavacliff' ? 32 : zone === 'krono' ? 30 : zone === 'desert' ? 28 : zone === 'jungle' ? 30 : isNight ? 26 : 18;
    for (let i = 0; i < count; i++) {
      const px = ((i * 47 - cameraX * (zone === 'blizzard' ? 0.45 : zone === 'desert' ? 0.35 : zone === 'castlesmash' ? 0.3 : zone === 'krono' ? 0.28 : zone === 'jungle' ? 0.25 : zone === 'steampunk' ? 0.2 : 0.15) + (time * (zone === 'blizzard' ? 3.5 : zone === 'lavacliff' ? -0.6 : zone === 'desert' ? 1.2 : zone === 'steampunk' ? 0.4 : 0.65))) % (GAME_WIDTH + 40)) - 20;
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
      } else if (zone === 'castlesmash') {
        // Floating torch sparks and castle dust motes
        if (i % 2 === 0) {
          ctx.fillStyle = i % 4 === 0 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(px, py, 1.5, 1.5);
        } else {
          ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
          ctx.fillRect(px, py, 1.5, 1.5);
        }
      } else if (zone === 'jungle') {
        // Glowing bioluminescent fireflies (luciérnagas) and drifting jungle spores
        const fireflyPulse = 0.4 + Math.sin(time * 0.12 + i * 1.4) * 0.45;
        if (i % 2 === 0) {
          // Firefly glowing halo
          ctx.fillStyle = `rgba(74, 222, 128, ${fireflyPulse * 0.35})`;
          ctx.beginPath();
          ctx.arc(px + 1, py + 1, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = i % 3 === 0
          ? `rgba(250, 204, 21, ${fireflyPulse})`
          : i % 2 === 0
          ? `rgba(74, 222, 128, ${fireflyPulse})`
          : '#34d399cc';
        ctx.fillRect(px, py, i % 2 === 0 ? 2.5 : 1.5, i % 2 === 0 ? 2.5 : 1.5);
      } else if (zone === 'blizzard') {
        // High-Speed Swirling Alpine Blizzard Snowflakes & Frost Crystals
        const flakeSize = i % 3 === 0 ? 2.5 : 1.5;
        ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#bae6fd';
        ctx.fillRect(px, py, flakeSize, flakeSize);
        if (i % 5 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.arc(px + 1, py + 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (zone === 'steampunk') {
        // Soft rising steam clouds and fiery furnace sparks
        if (i % 3 === 0) {
          // Fiery furnace spark
          ctx.fillStyle = i % 6 === 0 ? '#fef08a' : '#fbbf24';
          ctx.fillRect(px, py, 1.5, 1.5);
        } else {
          // Billowing steam vapor puff
          const puffRadius = i % 2 === 0 ? 3.5 : 2.5;
          ctx.fillStyle = act === 2 ? 'rgba(217, 249, 157, 0.25)' : 'rgba(255, 237, 213, 0.35)';
          ctx.beginPath();
          ctx.arc(px, py, puffRadius, 0, Math.PI * 2);
          ctx.fill();
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
      } else if (lm.type === 'mayan_pyramid') {
        // Grand Mayan Stepped Pyramid Landmark
        const sc = lm.scale || 1.5;
        const baseY = 148;
        const pyrW = Math.round(130 * sc);
        const halfW = Math.round(pyrW / 2);
        const cx = x + halfW;

        // Tier 4 (Bottom-most platform)
        ctx.fillStyle = '#062d20';
        ctx.fillRect(cx - Math.round(62 * sc), baseY - Math.round(20 * sc), Math.round(124 * sc), Math.round(20 * sc));
        // Tier 3
        ctx.fillStyle = '#083c2b';
        ctx.fillRect(cx - Math.round(50 * sc), baseY - Math.round(38 * sc), Math.round(100 * sc), Math.round(18 * sc));
        // Tier 2
        ctx.fillStyle = '#0a4a35';
        ctx.fillRect(cx - Math.round(38 * sc), baseY - Math.round(54 * sc), Math.round(76 * sc), Math.round(16 * sc));
        // Tier 1 (Upper platform)
        ctx.fillStyle = '#0f5c42';
        ctx.fillRect(cx - Math.round(26 * sc), baseY - Math.round(68 * sc), Math.round(52 * sc), Math.round(14 * sc));

        // Summit Temple Sanctuary
        ctx.fillStyle = '#093a2a';
        ctx.fillRect(cx - Math.round(16 * sc), baseY - Math.round(84 * sc), Math.round(32 * sc), Math.round(16 * sc));
        // Temple Roof Crestería (Carved Stone Comb)
        ctx.fillStyle = '#0f5c42';
        ctx.fillRect(cx - Math.round(14 * sc), baseY - Math.round(92 * sc), Math.round(28 * sc), Math.round(8 * sc));
        ctx.fillRect(cx - Math.round(8 * sc), baseY - Math.round(98 * sc), Math.round(16 * sc), Math.round(6 * sc));
        // Temple Doorways
        ctx.fillStyle = '#021810';
        ctx.fillRect(cx - Math.round(11 * sc), baseY - Math.round(78 * sc), Math.round(6 * sc), Math.round(10 * sc));
        ctx.fillRect(cx - Math.round(3 * sc), baseY - Math.round(80 * sc), Math.round(6 * sc), Math.round(12 * sc));
        ctx.fillRect(cx + Math.round(5 * sc), baseY - Math.round(78 * sc), Math.round(6 * sc), Math.round(10 * sc));

        // Grand Central Stairway with stone step highlights
        ctx.fillStyle = '#11684c';
        ctx.fillRect(cx - Math.round(8 * sc), baseY - Math.round(68 * sc), Math.round(16 * sc), Math.round(68 * sc));
        ctx.fillStyle = '#34d39966';
        for (let st = baseY - Math.round(66 * sc); st < baseY; st += 4) {
          ctx.fillRect(cx - Math.round(7 * sc), st, Math.round(14 * sc), 1);
        }

        // Feathered Serpent / Kukulcán Balustrades at base of stairs
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - Math.round(10 * sc), baseY - 4, 3, 4);
        ctx.fillRect(cx + Math.round(7 * sc), baseY - 4, 3, 4);

        // Hanging jungle vines & moss on limestone blocks
        ctx.fillStyle = '#22c55e99';
        ctx.fillRect(cx - Math.round(45 * sc), baseY - Math.round(34 * sc), 4, 12);
        ctx.fillRect(cx + Math.round(38 * sc), baseY - Math.round(32 * sc), 5, 14);
        ctx.fillRect(cx - Math.round(22 * sc), baseY - Math.round(50 * sc), 3, 10);
      } else if (lm.type === 'jungle_waterfall') {
        // Cascading Rainforest Waterfall Landmark
        const sc = lm.scale || 1.2;
        const wfW = lm.w || 60;
        // Rocky mountain cliff frame
        ctx.fillStyle = '#062d20';
        ctx.fillRect(x - 10, 30, Math.round(wfW + 20), 118);
        ctx.fillStyle = '#0b4a35';
        ctx.fillRect(x - 5, 30, 8, 118);
        ctx.fillRect(x + wfW - 3, 30, 8, 118);

        // Rushing cascading water stream
        const flowShift = (time * 1.8) % 12;
        ctx.fillStyle = '#06b6d4cc';
        ctx.fillRect(x + 3, 35, wfW - 6, 110);
        ctx.fillStyle = '#38bdf8ee';
        ctx.fillRect(x + 8, 35, wfW - 16, 110);
        ctx.fillStyle = '#ffffffdd';
        // Foaming water streaks
        for (let fy = 35 + flowShift; fy < 145; fy += 12) {
          ctx.fillRect(x + 12, fy, wfW - 24, 2);
        }

        // Frothing splash mist at pool base
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x + Math.round(wfW / 2), 145, Math.round(wfW * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a7f3d0bb';
        ctx.beginPath();
        ctx.arc(x + Math.round(wfW / 2), 146, Math.round(wfW * 0.3), 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'giant_ceiba') {
        // Sacred Mayan Ceiba Tree (Yaxché)
        const sc = lm.scale || 1.3;
        const trunkW = Math.round(24 * sc);
        const trunkH = Math.round(90 * sc);
        const treeBaseY = 148;
        const treeTopY = Math.max(10, treeBaseY - trunkH);

        // Buttress Roots (Raíces tabulares)
        ctx.fillStyle = '#042217';
        ctx.beginPath();
        ctx.moveTo(x + Math.round(12 * sc), treeBaseY - Math.round(30 * sc));
        ctx.lineTo(x - Math.round(14 * sc), treeBaseY);
        ctx.lineTo(x + trunkW + Math.round(14 * sc), treeBaseY);
        ctx.lineTo(x + trunkW - Math.round(4 * sc), treeBaseY - Math.round(30 * sc));
        ctx.closePath();
        ctx.fill();

        // Massive Trunk
        ctx.fillStyle = '#083827';
        ctx.fillRect(x + 2, treeTopY + Math.round(20 * sc), trunkW, trunkH - Math.round(20 * sc));
        // Bark texture
        ctx.fillStyle = '#0d4a35';
        for (let by = treeTopY + Math.round(25 * sc); by < treeBaseY - 5; by += 10) {
          ctx.fillRect(x + 4, by, trunkW - 8, 2);
        }

        // Expansive Layered Jungle Canopy
        const canX = x + Math.round(trunkW / 2);
        const canY = treeTopY + Math.round(15 * sc);
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(canX, canY, Math.round(48 * sc), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(canX - Math.round(20 * sc), canY - Math.round(10 * sc), Math.round(32 * sc), 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canX + Math.round(22 * sc), canY - Math.round(8 * sc), Math.round(34 * sc), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(canX, canY - Math.round(16 * sc), Math.round(26 * sc), 0, Math.PI * 2);
        ctx.fill();

        // Hanging lianas / epiphytes
        ctx.strokeStyle = '#86efac99';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canX - Math.round(30 * sc), canY);
        ctx.lineTo(canX - Math.round(28 * sc), canY + Math.round(45 * sc));
        ctx.moveTo(canX + Math.round(32 * sc), canY);
        ctx.lineTo(canX + Math.round(34 * sc), canY + Math.round(50 * sc));
        ctx.stroke();
      } else if (lm.type === 'tribal_totem') {
        // Carved Stone Mayan Stela / Feathered Totem
        const sc = lm.scale || 1.2;
        const totW = Math.round(20 * sc);
        const totH = Math.round(70 * sc);
        const totBaseY = 148;

        // Base altar pedestal
        ctx.fillStyle = '#062d20';
        ctx.fillRect(x - Math.round(4 * sc), totBaseY - 10, totW + Math.round(8 * sc), 10);

        // Stone pillar
        ctx.fillStyle = '#0a4a35';
        ctx.fillRect(x, totBaseY - totH, totW, totH - 10);

        // Carved hieroglyphic glyph panels
        ctx.fillStyle = '#10b981';
        for (let gy = totBaseY - totH + 10; gy < totBaseY - 14; gy += 12) {
          ctx.fillRect(x + 3, gy, totW - 6, 2);
          ctx.fillRect(x + Math.round(totW / 2) - 1, gy + 3, 2, 4);
        }

        // Totem Face / Mask with Glowing Jade Eyes
        ctx.fillStyle = '#052e16';
        ctx.fillRect(x + 2, totBaseY - totH + 4, totW - 4, 14);
        const eyeGlow = 0.6 + Math.sin(time * 0.1) * 0.35;
        ctx.fillStyle = `rgba(52, 211, 153, ${eyeGlow})`;
        ctx.fillRect(x + 4, totBaseY - totH + 8, 3, 3);
        ctx.fillRect(x + totW - 7, totBaseY - totH + 8, 3, 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + 5, totBaseY - totH + 9, 1, 1);
        ctx.fillRect(x + totW - 6, totBaseY - totH + 9, 1, 1);
      } else if (lm.type === 'jungle_ruins') {
        // Overgrown Mayan Arch & Megalithic Ruins
        const sc = lm.scale || 1.2;
        ctx.fillStyle = '#062d20';
        // Left pillar
        ctx.fillRect(x, 70, Math.round(16 * sc), 78);
        // Right pillar
        ctx.fillRect(x + Math.round(38 * sc), 70, Math.round(16 * sc), 78);
        // Mayan Corbelled Arch Cap
        ctx.fillStyle = '#0a4a35';
        ctx.fillRect(x - 4, 60, Math.round(62 * sc), 12);
        ctx.fillRect(x + 4, 52, Math.round(46 * sc), 8);
        ctx.fillRect(x + 12, 46, Math.round(30 * sc), 6);

        // Overgrown vines
        ctx.fillStyle = '#22c55e99';
        ctx.fillRect(x + 2, 65, 3, 22);
        ctx.fillRect(x + Math.round(44 * sc), 64, 4, 28);
      } else if (lm.type === 'slalom_flag') {
        // Alpine Ski Race Slalom Gate / Flag
        const flagBaseY = lm.y || 148;
        const flagH = lm.h || 36;
        const isRed = (lm.name && lm.name.includes('Roja')) || (lm.x % 500 === 0);
        const poleColor = '#cbd5e1';
        const flagColor = isRed ? '#ef4444' : '#3b82f6';
        const flagTrim = isRed ? '#fee2e2' : '#dbeafe';

        // 1. Snow drift mound at base
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x + 8, flagBaseY, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Flexible slalom racing pole
        ctx.fillStyle = poleColor;
        ctx.fillRect(x + 7, flagBaseY - flagH, 2, flagH);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 6, flagBaseY - flagH - 1, 4, 2); // Pole top cap

        // 3. Dynamic fluttering cloth race flag
        const flutter = Math.sin(time * 0.2 + x * 0.05) * 3;
        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(x + 9, flagBaseY - flagH + 2);
        ctx.lineTo(x + 22 + flutter, flagBaseY - flagH + 8);
        ctx.lineTo(x + 9, flagBaseY - flagH + 16);
        ctx.closePath();
        ctx.fill();

        // Racing chevron stripe on flag
        ctx.fillStyle = flagTrim;
        ctx.beginPath();
        ctx.moveTo(x + 13, flagBaseY - flagH + 5);
        ctx.lineTo(x + 17 + flutter * 0.6, flagBaseY - flagH + 8);
        ctx.lineTo(x + 13, flagBaseY - flagH + 12);
        ctx.closePath();
        ctx.fill();
      } else if (lm.type === 'frozen_pine' || lm.type === 'giant_frosted_pine') {
        // Towering Snow-Draped Alpine Pine Tree
        const sc = lm.scale || 1.1;
        const treeBaseY = lm.y || 148;
        const trunkW = Math.round(6 * sc);
        const treeH = Math.round(70 * sc);

        // Snow base
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x + Math.round(trunkW / 2), treeBaseY, 14 * sc, 4 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sturdy pine trunk
        ctx.fillStyle = '#331800';
        ctx.fillRect(x, treeBaseY - treeH, trunkW, treeH);
        ctx.fillStyle = '#5c2c00';
        ctx.fillRect(x + 1, treeBaseY - treeH, Math.max(1, trunkW - 2), treeH);

        // 4 Dense Tiers of snow-cushioned evergreen boughs
        const tiers = 4;
        for (let t = 0; t < tiers; t++) {
          const tierW = Math.round((46 - t * 9) * sc);
          const tierY = treeBaseY - Math.round((22 + t * 14) * sc);
          const cx = x + Math.round(trunkW / 2);

          // Dark pine needles underneath
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(cx, tierY - Math.round(14 * sc));
          ctx.lineTo(cx - Math.round(tierW / 2), tierY);
          ctx.lineTo(cx + Math.round(tierW / 2), tierY);
          ctx.closePath();
          ctx.fill();

          // Fluffy snow mantle on top of the tier
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(cx, tierY - Math.round(14 * sc));
          ctx.lineTo(cx - Math.round(tierW / 2), tierY);
          ctx.lineTo(cx + Math.round(tierW / 2), tierY);
          ctx.lineTo(cx, tierY - Math.round(9 * sc));
          ctx.closePath();
          ctx.fill();

          // Ice fringe trim
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(cx - Math.round(tierW / 2) + 2, tierY - 1, tierW - 4, 1.5);
        }
      } else if (lm.type === 'chalet' || lm.type === 'snow_cabin') {
        // Alpine Ski Lodge / Mountain Chalet
        const baseY = lm.y || 148;
        const w = lm.w || 64;
        const h = lm.h || 48;
        const cx = x + Math.round(w / 2);

        // Snow base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 6, baseY - 4, w + 12, 6);

        // Log timber structure
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x, baseY - h + 16, w, h - 16);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 2, baseY - h + 18, w - 4, h - 20);

        // Horizontal log siding grooves
        ctx.fillStyle = '#331800';
        for (let gy = baseY - h + 22; gy < baseY - 4; gy += 6) {
          ctx.fillRect(x + 2, gy, w - 4, 1);
        }

        // Warm Glowing Amber Windows with Cross Mullions
        const winGlow = 0.8 + Math.sin(time * 0.08) * 0.15;
        ctx.fillStyle = `rgba(251, 191, 36, ${winGlow})`;
        ctx.fillRect(x + 8, baseY - 24, 12, 12);
        ctx.fillRect(x + w - 20, baseY - 24, 12, 12);
        ctx.fillStyle = '#451a03';
        // Cross mullions
        ctx.fillRect(x + 13, baseY - 24, 2, 12);
        ctx.fillRect(x + 8, baseY - 19, 12, 2);
        ctx.fillRect(x + w - 15, baseY - 24, 2, 12);
        ctx.fillRect(x + w - 20, baseY - 19, 12, 2);

        // Front Wooden Door
        ctx.fillStyle = '#331800';
        ctx.fillRect(cx - 6, baseY - 18, 12, 18);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx + 2, baseY - 10, 2, 2); // Brass door handle

        // Steep Snow-Covered Alpine A-Frame Roof
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx, baseY - h - 8);
        ctx.lineTo(x - 8, baseY - h + 18);
        ctx.lineTo(x + w + 8, baseY - h + 18);
        ctx.closePath();
        ctx.fill();

        // Shaded under-eaves
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(cx, baseY - h - 4);
        ctx.lineTo(x + w + 8, baseY - h + 18);
        ctx.lineTo(cx, baseY - h + 18);
        ctx.closePath();
        ctx.fill();

        // Hanging Icicles from eaves
        ctx.fillStyle = '#e0f2fe';
        for (let ix = x - 6; ix <= x + w + 6; ix += 6) {
          ctx.beginPath();
          ctx.moveTo(ix, baseY - h + 18);
          ctx.lineTo(ix + 2, baseY - h + 18);
          ctx.lineTo(ix + 1, baseY - h + 24 + ((ix * 7) % 5));
          ctx.closePath();
          ctx.fill();
        }

        // Stone Chimney with Smoke
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx + 10, baseY - h - 14, 8, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 9, baseY - h - 15, 10, 2); // Chimney snow cap

        // Drifting chimney smoke
        for (let s = 0; s < 4; s++) {
          const smX = cx + 14 + Math.sin(time * 0.08 + s) * 4 - s * 3;
          const smY = baseY - h - 18 - s * 6;
          ctx.fillStyle = `rgba(224, 242, 254, ${0.55 - s * 0.12})`;
          ctx.beginPath();
          ctx.arc(smX, smY, 3 + s * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (lm.type === 'ski_jump_ramp') {
        // Red-and-White Alpine Ski Launch Ramp
        const rampBaseY = lm.y || 148;
        const rampW = lm.w || 48;
        const rampH = lm.h || 18;

        // Wooden scaffolding foundation
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 4, rampBaseY - rampH, rampW - 4, rampH);

        // Angled launch ramp surface
        ctx.beginPath();
        ctx.moveTo(x, rampBaseY);
        ctx.lineTo(x + rampW, rampBaseY - rampH);
        ctx.lineTo(x + rampW, rampBaseY);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Crisp white racing launch stripe
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, rampBaseY);
        ctx.lineTo(x + rampW, rampBaseY - rampH);
        ctx.stroke();

        // Launch edge warning marker flag
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + rampW - 1, rampBaseY - rampH - 12, 2, 12);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x + rampW + 1, rampBaseY - rampH - 12);
        ctx.lineTo(x + rampW + 8, rampBaseY - rampH - 9);
        ctx.lineTo(x + rampW + 1, rampBaseY - rampH - 6);
        ctx.closePath();
        ctx.fill();
      } else if (lm.type === 'castle_keep') {
        // Grand Medieval Fortress Keep / Bastion
        const baseY = lm.y || 148;
        const w = lm.w || 96;
        const h = lm.h || 110;
        const cx = x + w / 2;

        // Main Keep Stone Tower Body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, baseY - h, w, h);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 2, baseY - h + 2, w - 4, h - 2);

        // Stone Brick Details
        ctx.fillStyle = '#475569';
        for (let row = 0; row < 12; row++) {
          const by = baseY - h + 10 + row * 8;
          const off = (row % 2) * 10;
          for (let bx = x + 4 - off; bx < x + w - 4; bx += 20) {
            const rx = Math.max(x + 4, bx);
            const rw = Math.min(16, x + w - 4 - rx);
            if (rw > 4) ctx.fillRect(rx, by, rw, 6);
          }
        }

        // Crenellations & Machicolations atop Keep
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 4, baseY - h - 4, w + 8, 6);
        ctx.fillStyle = '#64748b';
        for (let c = x - 4; c < x + w + 8; c += 16) {
          ctx.fillRect(c, baseY - h - 14, 10, 10);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(c, baseY - h - 14, 10, 2);
          ctx.fillStyle = '#64748b';
        }

        // Arrow Slit Windows
        ctx.fillStyle = '#020617';
        ctx.fillRect(cx - 16, baseY - h + 30, 4, 16);
        ctx.fillRect(cx + 12, baseY - h + 30, 4, 16);
        ctx.fillRect(cx - 2, baseY - h + 54, 4, 18);

        // Heavy Fortified Arched Oak Gate
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx, baseY - 24, 14, Math.PI, 0);
        ctx.rect(cx - 14, baseY - 24, 28, 24);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(cx, baseY - 24, 12, Math.PI, 0);
        ctx.rect(cx - 12, baseY - 24, 24, 24);
        ctx.fill();
        // Iron gate studs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 1, baseY - 24, 2, 24); // Center seam
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 8, baseY - 14, 2, 2);
        ctx.fillRect(cx + 6, baseY - 14, 2, 2);

        // Flying Tower Banner
        const flagWave = Math.sin(time * 0.2 + x * 0.1) * 3;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - 1, baseY - h - 28, 2, 16); // Flagpole
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx + 1, baseY - h - 28);
        ctx.lineTo(cx + 18 + flagWave, baseY - h - 22);
        ctx.lineTo(cx + 1, baseY - h - 16);
        ctx.closePath();
        ctx.fill();
      } else if (lm.type === 'siege_catapult') {
        // Medieval Heavy Siege Trebuchet / Catapult
        const baseY = lm.y || 148;
        const w = lm.w || 44;
        const h = lm.h || 36;

        // Heavy Timber A-Frame Chassis
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 2, baseY - 6, w - 4, 6); // Base sled
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(x + 6, baseY - 6);
        ctx.lineTo(x + w * 0.45, baseY - h);
        ctx.lineTo(x + w * 0.55, baseY - h);
        ctx.lineTo(x + w - 6, baseY - 6);
        ctx.closePath();
        ctx.fill();

        // Iron Pivot Axle & Winch
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(x + w / 2, baseY - h + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + w / 2 - 1, baseY - h + 3, 2, 2);

        // Throwing Arm (Dynamic angle with gentle ready tension)
        const armAngle = -0.55 + Math.sin(time * 0.05) * 0.06;
        ctx.save();
        ctx.translate(x + w / 2, baseY - h + 4);
        ctx.rotate(armAngle);
        // Long throwing beam
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-6, -2, 28, 4);
        // Short counterweight arm
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, -2, 8, 4);
        // Heavy Lead / Stone Counterweight Bucket
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, 2, 10, 8);
        // Boulder Sling Basket & Flaming Rock
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(22, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(20, -2, 3, 3);
        ctx.restore();

        // Spoke Wheels
        ctx.fillStyle = '#291206';
        ctx.beginPath();
        ctx.arc(x + 8, baseY - 4, 5, 0, Math.PI * 2);
        ctx.arc(x + w - 8, baseY - 4, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'throne_dais') {
        // High Gothic Throne of Bastion Malakar
        const baseY = lm.y || 148;
        const w = lm.w || 64;
        const cx = x + w / 2;

        // Tiered Marble / Granite Dais Steps
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, baseY - 4, w, 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, baseY - 8, w - 12, 4);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 12, baseY - 12, w - 24, 4);

        // Crimson Throne Carpet Runner
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx - 8, baseY - 12, 16, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 9, baseY - 12, 1, 12);
        ctx.fillRect(cx + 8, baseY - 12, 1, 12);

        // High Backed Gothic Throne Seat
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cx - 10, baseY - 40, 20, 28);
        ctx.fillStyle = '#b91c1c'; // Velvet back cushion
        ctx.fillRect(cx - 7, baseY - 38, 14, 20);

        // Golden Spire Finials & Lion Heads
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 11, baseY - 46, 3, 8);
        ctx.fillRect(cx + 8, baseY - 46, 3, 8);
        ctx.beginPath();
        ctx.moveTo(cx, baseY - 48);
        ctx.lineTo(cx + 4, baseY - 40);
        ctx.lineTo(cx - 4, baseY - 40);
        ctx.closePath();
        ctx.fill();

        // Velvet Armrests
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 12, baseY - 22, 4, 3);
        ctx.fillRect(cx + 8, baseY - 22, 4, 3);

        // Flanking Braziers with Fire
        for (const bx of [x + 4, x + w - 8]) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, baseY - 18, 4, 10);
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(bx - 3, baseY - 18);
          ctx.lineTo(bx + 7, baseY - 18);
          ctx.lineTo(bx + 5, baseY - 14);
          ctx.lineTo(bx - 1, baseY - 14);
          ctx.closePath();
          ctx.fill();
          // Animated Brazier Fire
          const flameH = 4 + Math.sin(time * 0.3 + bx) * 2;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(bx - 1, baseY - 18);
          ctx.lineTo(bx + 2, baseY - 18 - flameH);
          ctx.lineTo(bx + 5, baseY - 18);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(bx + 1, baseY - 18 - flameH * 0.6, 2, 2);
        }
      } else if (lm.type === 'royal_banner') {
        // Embroidered Wall Hanging Royal Bastion Banner
        const baseY = lm.y || 80;
        const w = lm.w || 20;
        const h = lm.h || 42;

        // Ornate Brass Hanging Rod
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x - 2, baseY, w + 4, 3);
        ctx.beginPath();
        ctx.arc(x - 2, baseY + 1.5, 3, 0, Math.PI * 2);
        ctx.arc(x + w + 2, baseY + 1.5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Rich Royal Blue & Crimson Velvet Tapestry
        const wave = Math.sin(time * 0.15 + x * 0.1) * 2;
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(x, baseY + 3);
        ctx.lineTo(x + w, baseY + 3);
        ctx.lineTo(x + w + wave, baseY + h - 8);
        ctx.lineTo(x + w / 2 + wave * 0.5, baseY + h);
        ctx.lineTo(x, baseY + h - 8);
        ctx.closePath();
        ctx.fill();

        // Crimson Split
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x + 2, baseY + 6, w / 2 - 2, h - 18);

        // Golden Embroidered Lion Sigil
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + w / 2 - 4 + wave * 0.3, baseY + 12, 8, 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + w / 2 - 2 + wave * 0.3, baseY + 14, 4, 6);

        // Golden Fringe at Bottom
        ctx.fillStyle = '#facc15';
        for (let fx = x; fx <= x + w; fx += 3) {
          ctx.fillRect(fx, baseY + h - 6, 1.5, 3);
        }
      } else if (lm.type === 'stone_gargoyle_perch') {
        // Carved Stone Gargoyle Sentinel Perch
        const baseY = lm.y || 110;
        // Stone corbel bracket jutting from wall
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + 20, baseY);
        ctx.lineTo(x + 4, baseY + 16);
        ctx.lineTo(x, baseY + 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, baseY, 20, 3);

        // Crouching stone gargoyle demon
        const gx = x + 10;
        const gy = baseY - 6;
        ctx.fillStyle = '#475569';
        // Body & Haunches
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.fill();
        // Carved Wings
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(gx - 2, gy - 2);
        ctx.lineTo(gx - 8, gy - 12);
        ctx.lineTo(gx + 2, gy - 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(gx + 2, gy - 2);
        ctx.lineTo(gx + 8, gy - 12);
        ctx.lineTo(gx - 2, gy - 6);
        ctx.closePath();
        ctx.fill();
        // Head & Horns
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gx - 2, gy - 8, 5, 4);
        ctx.fillRect(gx - 3, gy - 11, 2, 4); // Left Horn
        ctx.fillRect(gx + 2, gy - 11, 2, 4); // Right Horn
        // Glowing ruby eyes
        const eyePulse = 0.6 + Math.sin(time * 0.1) * 0.4;
        ctx.fillStyle = `rgba(239, 68, 68, ${eyePulse})`;
        ctx.fillRect(gx - 1, gy - 7, 1.5, 1.5);
        ctx.fillRect(gx + 1.5, gy - 7, 1.5, 1.5);
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
    const isJungle = zone === 'jungle';
    const isBlizzard = zone === 'blizzard';
    const isCastle = zone === 'castlesmash';

    for (const p of platforms) {
      if (p.hidden) continue;
      const x = Math.round(p.x - cameraX);
      const y = Math.round(p.y);
      if (x + p.w < -10 || x > GAME_WIDTH + 10) continue;

      if (p.slopeEndY !== undefined) {
        // Downhill or Uphill Ski Slope Platform
        const endY = Math.round(p.slopeEndY);
        // Deep Mountain Granite Bedrock Base Polygon
        ctx.fillStyle = '#0f2744';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + p.w, endY);
        ctx.lineTo(x + p.w, Math.max(y, endY) + p.h + 20);
        ctx.lineTo(x, Math.max(y, endY) + p.h + 20);
        ctx.closePath();
        ctx.fill();

        // Layered Frozen Blue Ice Strata
        ctx.strokeStyle = '#0284c755';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + p.w, endY + 4);
        ctx.stroke();

        // Pristine White Snow Top Mantle on the Slope
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + p.w, endY);
        ctx.stroke();

        // Neon Cyan Glaze Sheen Line
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 1);
        ctx.lineTo(x + p.w, endY + 1);
        ctx.stroke();

        // Carved Ski Tracks carved into the snow slope
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x + p.w, endY + 2);
        ctx.stroke();

        continue;
      }

      if (p.kind === 'snow' || p.kind === 'ice' || p.kind === 'ski_slope' || (isBlizzard && (p.kind === 'ground' || p.kind === 'arena' || p.kind === 'ledge'))) {
        // Alpine Granite Bedrock Base
        ctx.fillStyle = '#0f2744';
        ctx.fillRect(x, y, p.w, p.h);

        // Glacier Ice Strata
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(x, y + 3, p.w, 4);

        // Pristine White Snow Top Mantle (3px deep)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, p.w, 3);

        // Ice Glaze Highlight
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(x, y + 3, p.w, 1);

        // Parallel Ski Track Grooves in the snow surface
        ctx.fillStyle = '#cbd5e1';
        for (let tx = x + 12; tx < x + p.w - 12; tx += 28) {
          ctx.fillRect(tx, y + 1, 16, 1);
          ctx.fillRect(tx + 2, y + 2, 12, 1);
        }

        // Hanging Icicles from ledge undersides
        if (p.kind === 'ledge') {
          ctx.fillStyle = '#e0f2fe';
          for (let ix = x + 6; ix < x + p.w - 6; ix += 10) {
            ctx.beginPath();
            ctx.moveTo(ix, y + p.h);
            ctx.lineTo(ix + 3, y + p.h);
            ctx.lineTo(ix + 1.5, y + p.h + 4 + ((ix * 7) % 4));
            ctx.closePath();
            ctx.fill();
          }
        }
        continue;
      }

      if (p.kind === 'castle_stone' || p.kind === 'castle_parapet' || p.kind === 'castle_bridge' || p.kind === 'castle_iron' || p.kind === 'crumbling_floor' || (isCastle && (p.kind === 'ground' || p.kind === 'arena'))) {
        // Medieval Castle Stone Masonry & Parapets
        const isParapet = p.kind === 'castle_parapet';
        const isBridge = p.kind === 'castle_bridge';
        const isCrumbling = p.kind === 'crumbling_floor';
        const isIron = p.kind === 'castle_iron';

        if (isBridge) {
          // Timber drawbridge with iron cross-braces & studs
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x, y + 2, p.w, p.h - 4);
          // Vertical planks
          ctx.fillStyle = '#291206';
          for (let px = x + 10; px < x + p.w; px += 12) {
            ctx.fillRect(px, y, 1.5, p.h);
          }
          // Iron edge bands & studs
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillRect(x, y + p.h - 2, p.w, 2);
          ctx.fillStyle = '#cbd5e1';
          for (let sx = x + 4; sx < x + p.w; sx += 16) {
            ctx.fillRect(sx, y + 1, 1.5, 1.5);
            ctx.fillRect(sx, y + p.h - 3, 1.5, 1.5);
          }
        } else if (isIron) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, p.w, 1);
        } else {
          // Ashlar Castle Stone Blocks
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Brick courses pattern
          const rowH = 6;
          let r = 0;
          for (let by = y; by < y + p.h; by += rowH) {
            const h = Math.min(rowH, y + p.h - by);
            const offset = (r % 2) * 8;
            ctx.fillStyle = '#334155';
            for (let bx = x - offset; bx < x + p.w; bx += 16) {
              const rx = Math.max(x + 1, bx);
              const rw = Math.min(14, x + p.w - rx - 1);
              if (rw > 0) {
                ctx.fillRect(rx, by + 1, rw, h - 2);
              }
            }
            r++;
          }

          // Top Stone Curb Lip & Weathered Highlights
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, p.w, 1);

          // Crenellations on parapets
          if (isParapet) {
            ctx.fillStyle = '#475569';
            for (let cx = x + 4; cx < x + p.w - 8; cx += 16) {
              ctx.fillRect(cx, y - 5, 8, 5);
              ctx.fillStyle = '#94a3b8';
              ctx.fillRect(cx, y - 5, 8, 1);
              ctx.fillStyle = '#475569';
            }
          }

          // Cracks for crumbling floor
          if (isCrumbling) {
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 1.5;
            for (let cx = x + 12; cx < x + p.w; cx += 22) {
              ctx.beginPath();
              ctx.moveTo(cx, y);
              ctx.lineTo(cx + 3, y + 4);
              ctx.lineTo(cx - 2, y + p.h - 1);
              ctx.stroke();
            }
          }
        }
        continue;
      }

      if (p.kind === 'ground' || p.kind === 'arena' || p.kind === 'jungle_stone') {
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
          : isJungle
          ? '#052e16'
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
        } else if (zone === 'jungle') {
          // Lush ancient Mayan stone carved glyphs and moss veins
          ctx.fillStyle = '#22c55e33';
          for (let jx = x + 10; jx < x + p.w - 10; jx += 26) {
            ctx.fillRect(jx, y + 4, 12, 2);
            ctx.fillRect(jx + 4, y + 6, 4, 6);
            ctx.fillRect(jx + 2, y + 9, 8, 1);
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
          : isJungle
          ? '#16a34a'
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
          : isJungle
          ? '#86efac'
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
      } else if (p.kind === 'gear_rotating' || p.kind === 'steampunk_gear') {
        // Rotating Steampunk Brass Cogwheel Platform
        const gearR = (p.gearRadius || Math.min(p.w, p.h) / 2) || 35;
        const gcx = x + p.w / 2;
        const gcy = y + p.h / 2;
        const rot = time * (p.rotationSpeed || 0.02);

        ctx.save();
        ctx.translate(gcx, gcy);
        ctx.rotate(rot);

        // Gear Teeth (12 industrial rectangular teeth)
        const teeth = 12;
        ctx.fillStyle = '#78350f';
        for (let t = 0; t < teeth; t++) {
          ctx.save();
          ctx.rotate((t / teeth) * Math.PI * 2);
          ctx.fillRect(-3.5, -gearR - 4, 7, 6);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-2.5, -gearR - 4, 5, 4);
          ctx.restore();
        }

        // Outer Bronze Rim
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, gearR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, gearR - 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, gearR - 5, 0, Math.PI * 2);
        ctx.fill();

        // Inner Recessed Cast Iron Well
        ctx.fillStyle = '#1c140e';
        ctx.beginPath();
        ctx.arc(0, 0, gearR - 8, 0, Math.PI * 2);
        ctx.fill();

        // 4 Curved Brass Spoke Arms
        for (let s = 0; s < 4; s++) {
          ctx.save();
          ctx.rotate((s / 4) * Math.PI * 2);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-3, -gearR + 8, 6, (gearR - 8) * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-1, -gearR + 8, 2, (gearR - 8) * 2);
          ctx.restore();
        }

        // Heavy Central Axle Hub & Hex Nut
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-3, -3, 6, 6);
        ctx.fillStyle = '#1c140e';
        ctx.fillRect(-1, -1, 2, 2);

        ctx.restore();

        // Solid standing platform bar across top rim so player has clear footing
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 4, y, p.w - 8, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 6, y, p.w - 12, 1);
      } else if (p.kind === 'steampunk_brass') {
        // Heavy Riveted Victorian Brass & Bronze Factory Bedplate
        ctx.fillStyle = '#1c1208'; // Cast iron base
        ctx.fillRect(x, y, p.w, p.h);

        ctx.fillStyle = '#78350f'; // Bronze body
        ctx.fillRect(x, y + 2, p.w, p.h - 4);

        // Polished Brass Center Inlay
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + 3, p.w - 4, p.h - 7);

        // Golden Rivet Rows on top and bottom
        ctx.fillStyle = '#fbbf24';
        for (let rx = x + 6; rx < x + p.w - 6; rx += 14) {
          ctx.fillRect(rx, y + 4, 2, 2);
          if (p.h > 14) {
            ctx.fillRect(rx, y + p.h - 6, 2, 2);
          }
        }

        // Small Steam Vent Slits
        ctx.fillStyle = '#180903';
        for (let vx = x + 16; vx < x + p.w - 16; vx += 36) {
          ctx.fillRect(vx, y + 7, 8, 2);
          // Faint steam puff from vent
          if (Math.sin(time * 0.1 + vx) > 0.7) {
            ctx.fillStyle = 'rgba(255, 247, 237, 0.4)';
            ctx.fillRect(vx + 2, y - 2, 4, 2);
            ctx.fillStyle = '#180903';
          }
        }

        // Polished Brass Top Lip
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, y, p.w, 2);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 2, y, p.w - 4, 1);
      } else if (p.kind === 'steampunk_pipe') {
        // Industrial Copper Steam Pipe / Conduit Catwalk
        ctx.fillStyle = '#431407'; // Deep shadow
        ctx.fillRect(x, y, p.w, p.h);

        // Copper pipe cylindrical gradient
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(x, y + 1, p.w, p.h - 2);
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x, y + 1, p.w, Math.max(2, Math.floor(p.h / 3)));
        ctx.fillStyle = '#fed7aa'; // Glistening copper specular highlight
        ctx.fillRect(x, y, p.w, 1);

        // Brass Pipe Flange Collars every 28px
        ctx.fillStyle = '#fbbf24';
        for (let fx = x + 8; fx < x + p.w; fx += 28) {
          ctx.fillRect(fx - 1, y - 1, 3, p.h + 2);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(fx, y, 1, p.h);
          ctx.fillStyle = '#fbbf24';
        }
      } else if (p.kind === 'steampunk_rust') {
        // Corroded Oxidized Iron & Verdigris Slag Platform
        ctx.fillStyle = '#140c06'; // Slag iron core
        ctx.fillRect(x, y, p.w, p.h);

        ctx.fillStyle = '#451a03'; // Heavy rust
        ctx.fillRect(x, y + 2, p.w, p.h - 4);

        // Toxic Green Verdigris Oxidized Patches
        ctx.fillStyle = '#115e59';
        for (let ox = x + 8; ox < x + p.w - 8; ox += 24) {
          ctx.fillRect(ox, y + 3, 10, 4);
          ctx.fillRect(ox + 2, y + 2, 6, 1);
        }

        // Corroded Pitted Metal Texture
        ctx.fillStyle = '#0f172a';
        for (let px = x + 4; px < x + p.w - 4; px += 16) {
          ctx.fillRect(px, y + 4, 3, 2);
        }

        // Chipped Orange Rust Top
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x, y, p.w, 2);
        ctx.fillStyle = '#ea580c';
        for (let cx = x + 2; cx < x + p.w - 2; cx += 8) {
          ctx.fillRect(cx, y, 4, 1);
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
          : isJungle
          ? '#064e3b'
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
          : isJungle
          ? '#22c55e33'
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
          : isJungle
          ? '#22c55e'
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

      if (h.type === 'snow_branch') {
        // Alpine Fallen Pine Branch with Heavy Snow Cap
        const branchBaseY = h.y + h.h;
        // Wood Branch Core
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(x, branchBaseY - 2);
        ctx.quadraticCurveTo(x + h.w / 2, h.y + 4, x + h.w, h.y);
        ctx.lineTo(x + h.w, h.y + 3);
        ctx.quadraticCurveTo(x + h.w / 2, h.y + 7, x, branchBaseY);
        ctx.closePath();
        ctx.fill();

        // Evergreen Pine Needles Fan
        ctx.fillStyle = '#166534';
        for (let bx = x + 3; bx < x + h.w - 3; bx += 5) {
          ctx.beginPath();
          ctx.moveTo(bx, h.y + 6);
          ctx.lineTo(bx - 3, h.y + 11);
          ctx.lineTo(bx + 4, h.y + 10);
          ctx.closePath();
          ctx.fill();
        }

        // Fluffy Snow Mantle on Top
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x + 2, branchBaseY - 3);
        ctx.quadraticCurveTo(x + h.w / 2, h.y + 2, x + h.w - 2, h.y - 1);
        ctx.quadraticCurveTo(x + h.w / 2, h.y + 5, x + 2, branchBaseY - 1);
        ctx.closePath();
        ctx.fill();

        // Cyan Ice Highlight
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 4, h.y + 4, h.w - 8, 1);
      } else if (h.type === 'fallen_log') {
        // Alpine Cut Pine Trunk / Log Obstacle
        const logBaseY = h.y + h.h;
        // Shadow on snow
        ctx.fillStyle = 'rgba(15, 39, 68, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x + h.w / 2, logBaseY, h.w / 2 + 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Bark Body
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 4, h.y + 4, h.w - 8, h.h - 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 4, h.y + 6, h.w - 8, h.h - 8);

        // Bark grooves
        ctx.fillStyle = '#331800';
        ctx.fillRect(x + 6, h.y + 8, h.w - 12, 1);
        ctx.fillRect(x + 8, h.y + 12, h.w - 16, 1);

        // Circular Log Ends (Annual Rings)
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(x + 4, h.y + h.h / 2 + 2, 4, h.h / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(x + 4, h.y + h.h / 2 + 2, 2, (h.h / 2 - 2) * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thick Pristine Snow Cushion on Top
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x + h.w / 2, h.y + 4, h.w / 2 - 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 5, h.y + 5, h.w - 10, 1.5);
      } else if (h.type === 'rolling_snowball') {
        // Giant Rolling Snowball with Rotation & Snow Dust
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const radius = Math.min(h.w, h.h) / 2;

        // Shadow on snow
        ctx.fillStyle = 'rgba(15, 39, 68, 0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, h.y + h.h, radius * 0.9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snowball sphere
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glacier ice shaded side
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(cx + 2, cy + 2, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, radius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Rotating snow swirls
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(h.spinAngle || 0);
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, 0.4, 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.4, 3.2, 5.2);
        ctx.stroke();
        ctx.restore();
      } else if (h.type === 'spike' || h.type === 'sandSpike') {
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
      } else if (h.type === 'steam_jet' || h.type === 'steam_pipe_burst') {
        // High-Pressure Victorian Steam Jet Hazard (Fully Telegraphed & Highly Visible)
        const nozzleX = x + h.w / 2;
        const nozzleY = h.y + h.h;
        const cycle = h.cycleTimer !== undefined ? (h.cycleTimer % (h.maxCycle || 100)) : (Math.floor(time * 2) % 100);
        const isWarning = cycle >= 25 && cycle < 50; // Extended 25-frame warning hiss
        const isErupting = cycle >= 50;              // Active scalding eruption

        // 1. High-Visibility Hazard Base Mount with Warning Chevrons & Heavy Brass Flange
        ctx.fillStyle = '#1c140e';
        ctx.fillRect(x, nozzleY - 8, h.w, 8);

        // Yellow and dark hazard stripes across the nozzle base
        const stripeW = 6;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 1, nozzleY - 7, h.w - 2, 6);
        ctx.clip();
        for (let sx = x - 6; sx < x + h.w + 6; sx += stripeW) {
          ctx.fillStyle = ((sx / stripeW) | 0) % 2 === 0 ? '#eab308' : '#18181b';
          ctx.beginPath();
          ctx.moveTo(sx, nozzleY - 1);
          ctx.lineTo(sx + 5, nozzleY - 1);
          ctx.lineTo(sx + 9, nozzleY - 7);
          ctx.lineTo(sx + 4, nozzleY - 7);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Polished brass rim and nozzle mouth
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 1, nozzleY - 9, h.w - 2, 2);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nozzleX - 4, nozzleY - 11, 8, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(nozzleX - 3, nozzleY - 11, 6, 2);

        // 2. Brass Pressure Gauge with Needle
        const gaugeX = x + (h.w > 20 ? 5 : nozzleX - 7);
        const gaugeY = nozzleY - 13;
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Red danger slice on gauge
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(gaugeX, gaugeY);
        ctx.arc(gaugeX, gaugeY, 3.5, -Math.PI * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        // Needle vibrating with pressure
        const needleAngle = isErupting ? -0.1 : isWarning ? -0.6 + Math.sin(time * 0.8) * 0.25 : -1.8;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gaugeX, gaugeY);
        ctx.lineTo(gaugeX + Math.cos(needleAngle) * 3, gaugeY + Math.sin(needleAngle) * 3);
        ctx.stroke();

        // 3. Status Strobe LED Light
        const ledColor = isErupting ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
        const ledX = x + h.w - 5;
        const ledY = nozzleY - 13;
        ctx.fillStyle = ledColor;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (isWarning || isErupting) {
          ctx.fillStyle = isErupting ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.45)';
          ctx.beginPath();
          ctx.arc(ledX, ledY, 5 + Math.sin(time * 0.5) * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Telegraphed Danger Area Box (Always visible so players can anticipate!)
        const plumeH = h.h || 48;
        if (!isErupting) {
          // Semi-transparent danger zone bounds
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = isWarning
            ? (Math.floor(time * 0.3) % 2 === 0 ? '#ef4444' : '#f59e0b')
            : 'rgba(245, 158, 11, 0.35)';
          ctx.lineWidth = isWarning ? 1.5 : 1;
          ctx.strokeRect(x, h.y, h.w, plumeH);

          if (isWarning) {
            // Warning diagonal wash inside danger box
            ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
            ctx.fillRect(x, h.y, h.w, plumeH);

            // Warning Banner Icon above nozzle
            const warnPulse = Math.sin(time * 0.4) * 2;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(nozzleX - 10, h.y - 12 + warnPulse, 20, 9);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ VAPOR', nozzleX, h.y - 5 + warnPulse);

            // Thin hissing steam wisps and orange embers
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let w = 0; w < 4; w++) {
              const wy = nozzleY - 12 - w * (plumeH / 5);
              const wx = nozzleX + Math.sin(time * 0.5 + w) * 4;
              ctx.fillRect(wx - 1, wy, 2, 5);
            }
          }
          ctx.restore();
        }

        // 5. Scalding High-Velocity Eruption Plume
        if (isErupting) {
          // Intense background danger wash
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.fillRect(x - 2, h.y, h.w + 4, plumeH);

          // Hot pressure orange core at nozzle
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(nozzleX - 4, nozzleY - 16, 8, 8);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(nozzleX - 2, nozzleY - 14, 4, 6);

          // Dense billowing steam clouds
          const puffs = 7;
          for (let p = 0; p < puffs; p++) {
            const py = h.y + (p / puffs) * (plumeH - 8);
            const pr = 6 + (puffs - p) * 2.8;
            const pxOffset = Math.sin(time * 0.3 + p * 1.2) * 5;
            const alpha = 0.75 + Math.sin(time * 0.4 + p) * 0.2;

            // Outer boiling vapor cloud
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(nozzleX + pxOffset, py, pr, 0, Math.PI * 2);
            ctx.fill();

            // Superheated orange center
            if (p >= puffs - 3) {
              ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
              ctx.beginPath();
              ctx.arc(nozzleX + pxOffset * 0.5, py + 3, pr * 0.65, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (h.type === 'scalding_steam') {
        // Boiling Condensation Basin Hazard
        const basinY = h.y + h.h - 6;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, basinY, h.w, 6);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, basinY + 1, h.w - 4, 4);

        // Scalding bubbling liquid surface
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 2, basinY + 1, h.w - 4, 3);
        ctx.fillStyle = '#fef08a';
        for (let bx = x + 4; bx < x + h.w - 4; bx += 7) {
          const bubbleY = basinY + 1 - Math.sin(time * 0.2 + bx) * 2;
          ctx.fillRect(bx, bubbleY, 2, 2);
        }

        // Steaming clouds rising from puddle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let s = 0; s < 3; s++) {
          const sy = h.y + 4 + s * 6;
          const sx = x + 6 + s * 8 + Math.sin(time * 0.25 + s) * 3;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'rotating_gear_hazard') {
        // Razor-Edged Industrial Serrated Cogwheel Hazard (High-Contrast Danger)
        const gcx = x + h.w / 2;
        const gcy = h.y + h.h / 2;
        const radius = Math.min(h.w, h.h) / 2;
        const rot = time * (h.bladeSpeed || 0.08);

        // Mounting Iron Bracket
        ctx.fillStyle = '#1c140e';
        ctx.fillRect(gcx - 2, h.y, 4, h.h);

        ctx.save();
        ctx.translate(gcx, gcy);
        ctx.rotate(rot);

        // Serrated triangular teeth (8 razor saw teeth)
        const teeth = 8;
        ctx.fillStyle = '#dc2626';
        for (let t = 0; t < teeth; t++) {
          ctx.save();
          ctx.rotate((t / teeth) * Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(-3, -radius + 2);
          ctx.lineTo(0, -radius - 6);
          ctx.lineTo(4, -radius + 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Blade Disc Body
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
        ctx.fill();

        // Center Rivet Hub with Caution Yellow
        ctx.fillStyle = '#1c140e';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-1.5, -1.5, 3, 3);

        ctx.restore();
      } else if (h.type === 'swinging_mace') {
        // Medieval Castle Giant Iron Swinging Spiked Mace
        const pivotX = x + h.w / 2;
        const pivotY = h.y;
        const length = h.chainLength || 52;
        const angle = h.bladeAngle || 0;
        const maceX = pivotX + Math.sin(angle) * length;
        const maceY = pivotY + Math.cos(angle) * length;

        // Ceiling Mount Iron Ring
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pivotX - 5, pivotY, 10, 4);
        ctx.fillStyle = '#475569';
        ctx.fillRect(pivotX - 4, pivotY + 1, 8, 2);

        // Heavy Iron Chain Links
        const links = 9;
        for (let l = 1; l <= links; l++) {
          const t = l / links;
          const lx = pivotX + (maceX - pivotX) * t;
          const ly = pivotY + (maceY - pivotY) * t;
          ctx.fillStyle = (l % 2 === 0) ? '#334155' : '#64748b';
          ctx.fillRect(lx - 2, ly - 2, 4, 4);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(lx - 1, ly - 1, 2, 2);
        }

        // Spiked Iron Morningstar Mace Head
        ctx.save();
        ctx.translate(maceX, maceY);
        ctx.rotate(angle * 2.5);

        // 8 Razor Spikes radiating outward
        const spikes = 8;
        ctx.fillStyle = '#94a3b8';
        for (let s = 0; s < spikes; s++) {
          ctx.save();
          ctx.rotate((s / spikes) * Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(-2, -9);
          ctx.lineTo(0, -17);
          ctx.lineTo(2, -9);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Central Spiked Heavy Iron Sphere
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(-2, -2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (h.type === 'portcullis') {
        // Heavy Iron Spiked Drop-Gate Portcullis
        ctx.fillStyle = '#020617';
        ctx.fillRect(x, h.y, h.w, h.h);

        // Vertical Iron Bars with Sharp Spikes
        const barSpacing = 6;
        for (let bx = x + 3; bx < x + h.w; bx += barSpacing) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx, h.y, 2, h.h);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(bx, h.y, 1, h.h);
          // Sharp Bottom Spike
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(bx - 1, h.y + h.h - 1);
          ctx.lineTo(bx + 1, h.y + h.h + 4);
          ctx.lineTo(bx + 3, h.y + h.h - 1);
          ctx.closePath();
          ctx.fill();
        }

        // Horizontal Iron Cross-Braces & Rivets
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, h.y + 4, h.w, 3);
        ctx.fillRect(x, h.y + h.h - 7, h.w, 3);
        ctx.fillStyle = '#f59e0b';
        for (let rx = x + 4; rx < x + h.w; rx += 12) {
          ctx.fillRect(rx, h.y + 5, 1.5, 1.5);
          ctx.fillRect(rx, h.y + h.h - 6, 1.5, 1.5);
        }
      } else if (h.type === 'catapult_boulder') {
        // Giant Flaming Catapult Boulder
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const rad = h.w / 2;

        // Fiery Ember Aura
        const aura = ctx.createRadialGradient(cx, cy, rad * 0.5, cx, cy, rad + 4);
        aura.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
        ctx.fill();

        // Stone Core
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.arc(cx, cy, rad - 2, 0, Math.PI * 2);
        ctx.fill();

        // Magma Fissures
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx - 3, cy - 2, 6, 2);
        ctx.fillRect(cx - 1, cy - 4, 2, 8);
      }
    }
  }

  // =========================================================================
  // DESTRUCTIBLE CASTLE OBJECTS RENDERING (CASTLE SMASH BASTION MECHANICS)
  // =========================================================================
  public renderDestructibles(destructibles: DestructibleObject[], cameraX: number, time: number) {
    if (!destructibles || destructibles.length === 0) return;
    const ctx = this.ctx;

    for (const d of destructibles) {
      if (d.destroyed) continue;
      const shakeOffset = d.shake ? (Math.random() - 0.5) * d.shake * 0.6 : 0;
      const x = Math.round(d.x - cameraX + shakeOffset);
      const y = Math.round(d.y);
      if (x + d.w < -20 || x > GAME_WIDTH + 20) continue;

      const hpPercent = Math.max(0, d.hp / d.maxHp);
      const isDamaged = d.hp < d.maxHp;

      ctx.save();

      // Hit flash white
      if (d.hitFlash && d.hitFlash > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, d.w, d.h);
        ctx.restore();
        continue;
      }

      switch (d.type) {
        case 'wooden_barricade': {
          // Heavy fortified wooden timber palisade with sharpened stake heads & iron bands
          const logW = 6;
          for (let lx = x; lx < x + d.w; lx += logW) {
            const w = Math.min(logW, x + d.w - lx);
            ctx.fillStyle = (lx % 12 === 0) ? '#451a03' : '#78350f';
            ctx.fillRect(lx, y, w, d.h);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(lx + 1, y, 1, d.h);
            // Sharpened stake tops
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(lx, y);
            ctx.lineTo(lx + w / 2, y - 3);
            ctx.lineTo(lx + w, y);
            ctx.closePath();
            ctx.fill();
          }

          // Horizontal reinforcing iron bands
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y + 4, d.w, 3);
          ctx.fillRect(x, y + d.h - 7, d.w, 3);
          ctx.fillStyle = '#cbd5e1';
          for (let rx = x + 3; rx < x + d.w; rx += 8) {
            ctx.fillRect(rx, y + 5, 1.5, 1.5);
            ctx.fillRect(rx, y + d.h - 6, 1.5, 1.5);
          }

          // Cross-brace timber
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 2, y + 6);
          ctx.lineTo(x + d.w - 2, y + d.h - 6);
          ctx.stroke();

          // Damage cracks
          if (hpPercent < 0.6) {
            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + d.w * 0.3, y + 2);
            ctx.lineTo(x + d.w * 0.5, y + d.h * 0.6);
            ctx.lineTo(x + d.w * 0.4, y + d.h - 2);
            ctx.stroke();
          }
          break;
        }

        case 'stone_wall': {
          // Thick Ashlar Fortress Masonry Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, d.w, d.h);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 1, y + 1, d.w - 2, d.h - 2);

          // Stone brick courses
          ctx.fillStyle = '#475569';
          const rowH = 6;
          let row = 0;
          for (let by = y; by < y + d.h; by += rowH) {
            const h = Math.min(rowH, y + d.h - by);
            const offset = (row % 2) * 8;
            for (let bx = x - offset; bx < x + d.w; bx += 16) {
              const rx = Math.max(x + 1, bx);
              const rw = Math.min(14, x + d.w - rx - 1);
              if (rw > 0) {
                ctx.fillRect(rx, by + 1, rw, h - 2);
              }
            }
            row++;
          }

          // Iron reinforced corner plates
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, 3, d.h);
          ctx.fillRect(x + d.w - 3, y, 3, d.h);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 1, y + 4, 1.5, 1.5);
          ctx.fillRect(x + 1, y + d.h - 6, 1.5, 1.5);
          ctx.fillRect(x + d.w - 2.5, y + 4, 1.5, 1.5);
          ctx.fillRect(x + d.w - 2.5, y + d.h - 6, 1.5, 1.5);

          // Deep fractures if low HP
          if (hpPercent < 0.65) {
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + d.w / 2, y + 1);
            ctx.lineTo(x + d.w * 0.4, y + d.h * 0.5);
            ctx.lineTo(x + d.w * 0.6, y + d.h - 2);
            ctx.stroke();
          }
          break;
        }

        case 'drawbridge_chain': {
          // Colossal Fortified Drawbridge Chain & Pulley Winch
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + d.w / 2 - 4, y, 8, 8);
          // Iron winch gears
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(x + d.w / 2, y + 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + d.w / 2 - 1, y + 3, 2, 2);

          // Massive Heavy Chain Links
          const numLinks = Math.max(3, Math.floor(d.h / 8));
          for (let li = 0; li < numLinks; li++) {
            const ly = y + 8 + li * 8;
            ctx.fillStyle = li % 2 === 0 ? '#334155' : '#64748b';
            ctx.fillRect(x + d.w / 2 - 3, ly, 6, 6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + d.w / 2 - 1, ly + 1, 2, 4);
          }
          break;
        }

        case 'siege_core': {
          // Magical bastion protective core (powers Malakar's shield)
          // Heavy stone pedestal
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + d.h - 6, d.w, 6);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 2, y + d.h - 5, d.w - 4, 4);

          // Iron armature containment brackets
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, y + 4, 3, d.h - 10);
          ctx.fillRect(x + d.w - 5, y + 4, 3, d.h - 10);
          ctx.fillRect(x + 2, y + 2, d.w - 4, 3);

          // Floating pulsating magic crystal
          const pulse = Math.sin(time * 0.15) * 2;
          const glow = ctx.createRadialGradient(
            x + d.w / 2, y + d.h / 2, 2,
            x + d.w / 2, y + d.h / 2, 14
          );
          glow.addColorStop(0, '#fef08a');
          glow.addColorStop(0.5, '#f59e0b');
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x + d.w / 2, y + d.h / 2, 14, 0, Math.PI * 2);
          ctx.fill();

          // Crystal diamond
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(x + d.w / 2, y + 4 + pulse);
          ctx.lineTo(x + d.w - 5, y + d.h / 2);
          ctx.lineTo(x + d.w / 2, y + d.h - 6 - pulse);
          ctx.lineTo(x + 5, y + d.h / 2);
          ctx.closePath();
          ctx.fill();

          // Shield beam tether
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + d.w / 2, y + 4);
          ctx.lineTo(x + d.w / 2, y - 8 + Math.sin(time * 0.3) * 3);
          ctx.stroke();
          break;
        }

        case 'iron_gate': {
          // Portcullis-style heavy barred iron gate with cross-bracing
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, d.w, d.h);

          // Vertical iron bars
          const barSpacing = 5;
          ctx.fillStyle = '#475569';
          for (let bx = x + 3; bx < x + d.w; bx += barSpacing) {
            ctx.fillRect(bx, y + 2, 2, d.h - 4);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(bx, y + d.h - 3, 2, 3);
          }

          // Horizontal cross-beams
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 1, y + 6, d.w - 2, 3);
          ctx.fillRect(x + 1, y + d.h - 8, d.w - 2, 3);

          // Heavy padlock
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + d.w / 2 - 3, y + d.h / 2 - 3, 6, 6);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + d.w / 2 - 1, y + d.h / 2, 2, 2);
          break;
        }
      }

      // Floating HP gauge if damaged
      if (isDamaged) {
        const barW = Math.max(16, d.w);
        const barX = x + (d.w - barW) / 2;
        const barY = y - 6;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, Math.round(barW * hpPercent), 2);
      }

      ctx.restore();
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

    // Goal Portal (Always active in exploration acts, and after boss defeat in boss acts)
    if (goal && (act !== 3 || bossDefeated)) {
      const x = Math.round(goal.x - cameraX);
      if (x >= -80 && x <= GAME_WIDTH + 80) {
        const bob = Math.sin(time * 0.08) * 2.5;

        // Zone-specific portal color palettes
        let outerGlow = 'rgba(34, 211, 238, 0.35)';
        let frameDark = '#0f172a';
        let frameTrim = '#38bdf8';
        let vortexC1 = '#06b6d4';
        let vortexC2 = '#a855f7';
        let vortexCore = '#ffffff';
        let beaconText = 'PORTAL NEÓN';

        if (zone === 'sakura') {
          outerGlow = 'rgba(244, 114, 182, 0.38)';
          frameDark = '#2a0815';
          frameTrim = '#f472b6';
          vortexC1 = '#fb7185';
          vortexC2 = '#c084fc';
          vortexCore = '#fff1f2';
          beaconText = 'PORTAL TORII';
        } else if (zone === 'lavacliff') {
          outerGlow = 'rgba(249, 115, 22, 0.42)';
          frameDark = '#1c0a06';
          frameTrim = '#f97316';
          vortexC1 = '#ea580c';
          vortexC2 = '#facc15';
          vortexCore = '#fffbeb';
          beaconText = 'PORTAL ÍGNEO';
        } else if (zone === 'desert') {
          outerGlow = 'rgba(251, 191, 36, 0.38)';
          frameDark = '#291804';
          frameTrim = '#fbbf24';
          vortexC1 = '#d97706';
          vortexC2 = '#34d399';
          vortexCore = '#fefce8';
          beaconText = 'PORTAL SOLAR';
        } else if (zone === 'krono') {
          outerGlow = 'rgba(99, 102, 241, 0.42)';
          frameDark = '#090d16';
          frameTrim = '#818cf8';
          vortexC1 = '#06b6d4';
          vortexC2 = '#ec4899';
          vortexCore = '#e0e7ff';
          beaconText = 'PORTAL CUÁNTICO';
        } else if (zone === 'travel') {
          outerGlow = 'rgba(168, 85, 247, 0.45)';
          frameDark = '#050510';
          frameTrim = '#c084fc';
          vortexC1 = '#38bdf8';
          vortexC2 = '#f43f5e';
          vortexCore = '#fef08a';
          beaconText = 'FISURA DIMENSIONAL';
        }

        // 1. Radiant Outer Energy Aura
        ctx.fillStyle = outerGlow;
        ctx.fillRect(x - 6 - bob, goal.y - 6 - bob, goal.w + 12 + bob * 2, goal.h + 12 + bob * 2);

        // 2. Heavy Architectural Pillar Frame (Torii / Monolith / Pylon)
        ctx.fillStyle = frameDark;
        ctx.fillRect(x - 2, goal.y, goal.w + 4, goal.h);

        // Frame High-contrast Neon Trim
        ctx.fillStyle = frameTrim;
        ctx.fillRect(x - 2, goal.y, goal.w + 4, 3); // Top arch
        ctx.fillRect(x - 2, goal.y, 4, goal.h); // Left pillar
        ctx.fillRect(x + goal.w - 2, goal.y, 4, goal.h); // Right pillar
        ctx.fillRect(x - 4, goal.y + goal.h - 4, goal.w + 8, 4); // Base pedestal

        // Inner Portal Opening
        const innerX = x + 3;
        const innerY = goal.y + 4;
        const innerW = goal.w - 6;
        const innerH = goal.h - 8;

        // 3. Swirling Plasma Gradient
        const pGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
        pGrad.addColorStop(0, vortexC1);
        pGrad.addColorStop(0.5, vortexC2);
        pGrad.addColorStop(1, vortexC1);
        ctx.fillStyle = pGrad;
        ctx.fillRect(innerX, innerY, innerW, innerH);

        // 4. Moving Plasma Bands / Vortex Current
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        for (let bIdx = 0; bIdx < 4; bIdx++) {
          const bandOffset = ((time * 0.9 + bIdx * (innerH / 4)) % innerH);
          const by = innerY + bandOffset;
          const bandThickness = 2 + (bIdx % 2);
          ctx.fillRect(innerX + 1, by, innerW - 2, bandThickness);
        }

        // 5. Pulsing Core Star / Singularity
        const coreBob = Math.sin(time * 0.12) * 2;
        const coreSize = 6 + Math.round(Math.sin(time * 0.15) * 2);
        ctx.fillStyle = vortexCore;
        ctx.fillRect(
          Math.round(innerX + innerW / 2 - coreSize / 2),
          Math.round(innerY + innerH / 2 - coreSize / 2 + coreBob),
          coreSize,
          coreSize
        );

        // 6. Orbiting Celestial Sparkles
        for (let sp = 0; sp < 3; sp++) {
          const angle = time * 0.09 + (sp * (Math.PI * 2 / 3));
          const sx = innerX + innerW / 2 + Math.cos(angle) * (innerW * 0.35);
          const sy = innerY + innerH / 2 + Math.sin(angle) * (innerH * 0.35);
          ctx.fillStyle = vortexCore;
          ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
        }

        // 7. Floating Animated Beacon above Portal (Clear visual cue)
        const arrowBob = Math.sin(time * 0.1) * 3;
        const arrowY = goal.y - 14 + arrowBob;
        const beaconMidX = x + Math.round(goal.w / 2);

        // Pulsing glowing down-arrow
        ctx.fillStyle = frameTrim;
        ctx.beginPath();
        ctx.moveTo(beaconMidX, arrowY + 8);
        ctx.lineTo(beaconMidX - 5, arrowY + 2);
        ctx.lineTo(beaconMidX + 5, arrowY + 2);
        ctx.closePath();
        ctx.fill();

        // Mini Label Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(beaconMidX - 32, arrowY - 10, 64, 10);
        ctx.strokeStyle = frameTrim;
        ctx.lineWidth = 1;
        ctx.strokeRect(beaconMidX - 32, arrowY - 10, 64, 10);

        ctx.font = '600 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(beaconText, beaconMidX, arrowY - 3);
      }
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
        // Ground impact hazard warning marker so player can anticipate where meteors land
        if (p.vy > 0 && p.y < 144) {
          ctx.save();
          const groundY = 146;
          const distToGround = Math.max(0, groundY - p.y);
          const shadowRadius = Math.max(3, 10 - distToGround * 0.05);
          const alpha = Math.min(0.7, Math.max(0.2, 1 - distToGround / 160));
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.ellipse(x + p.w / 2, groundY, shadowRadius, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(251, 191, 36, ${(alpha * 0.8).toFixed(2)})`;
          ctx.fillRect(x + p.w / 2 - 1, groundY - 1, 2, 2);
          ctx.restore();
        }

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
      } else if (p.kind === 'coconut') {
        // Jungle Coconut Projectile
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle || 0);
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(-1.5, -1, 1, 0, Math.PI * 2);
        ctx.arc(1.5, -1, 1, 0, Math.PI * 2);
        ctx.arc(0, 1.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.kind === 'stinger') {
        // Giant Hornet Toxic Stinger
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(x + (p.vx > 0 ? p.w - 3 : 0), p.y + 1, 3, p.h - 2);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + (p.vx > 0 ? p.w - 1 : 0), p.y + 1.5, 1.5, 1);
      } else if (p.kind === 'jaguarClawSlash') {
        // Balam Emerald Claw Crescent
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        if (p.vx > 0) {
          ctx.arc(x + 2, p.y + p.h / 2, p.h / 2, -Math.PI / 2, Math.PI / 2, false);
          ctx.lineTo(x + p.w, p.y + p.h / 2);
        } else {
          ctx.arc(x + p.w - 2, p.y + p.h / 2, p.h / 2, Math.PI / 2, -Math.PI / 2, false);
          ctx.lineTo(x, p.y + p.h / 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(x + 2, p.y + 3, p.w - 4, p.h - 6);
      } else if (p.kind === 'jaguarRoarWave') {
        // Ancient Solar Roar Wave Ring
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, Math.max(1, p.w / 2 - 3), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'snowball') {
        // Rolling crystalline snowball
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle || 0);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(-2, -2, p.w / 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -1, 3, 3);
        ctx.restore();
      } else if (p.kind === 'iceShard' || p.kind === 'iceSpikeBlast') {
        // Glacial Ice Shard Crystal
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        const shardAngle = Math.atan2(p.vy, p.vx);
        ctx.rotate(shardAngle);
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(p.w / 2, 0);
        ctx.lineTo(-p.w / 2, -p.h / 2);
        ctx.lineTo(-p.w / 3, 0);
        ctx.lineTo(-p.w / 2, p.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -1, p.w / 2, 2);
        ctx.restore();
      } else if (p.kind === 'blizzardRoarWave' || p.kind === 'yetiSlamWave') {
        // Expanding glacial frost wave
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + p.w / 2, p.y + p.h / 2, Math.max(1, p.w / 2 - 3), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'steam_fireball') {
        // Superheated Thermal Steam Blast from Vulkan-Ω
        const cx = x + p.w / 2;
        const cy = p.y + p.h / 2;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(cx, cy, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(cx, cy, p.w * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, cy, p.w * 0.2, 0, Math.PI * 2);
        ctx.fill();
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

    // Lean slightly forward when running, dashing, or downhill skiing
    if (player.isSkiing) {
      ctx.rotate(player.skiCrouch ? 0.22 : 0.08);
    } else if (isDashing) {
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
    
    if (player.isSkiing) {
      // Downhill skiing stance
      const crouchY = player.skiCrouch ? 2 : 0;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 2 + crouchY, 3, 5);
      ctx.fillRect(1, 1 + crouchY, 3, 5);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, 4 + crouchY, 3, 2);
      ctx.fillRect(1, 3 + crouchY, 3, 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, 6 + crouchY, 3, 2);
      ctx.fillRect(1, 5 + crouchY, 3, 2);

      // Long high-speed skis with curved tips
      const skiTilt = isJumping ? -0.15 : isFalling ? 0.12 : 0;
      ctx.save();
      ctx.translate(0, 8 + crouchY);
      ctx.rotate(skiTilt);

      // Bottom ski edge
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-12, 0, 24, 2);
      // Neon ski top
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-11, -1, 22, 1);
      // Front curved ski tip
      ctx.fillStyle = '#facc15';
      ctx.fillRect(12, -2, 2, 2);
      ctx.fillRect(13, -3, 1, 2);

      ctx.restore();

      // Ski poles in Zion's hands
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, 1 + crouchY);
      ctx.lineTo(-5, 9 + crouchY);
      ctx.moveTo(-1, 0 + crouchY);
      ctx.lineTo(-9, 8 + crouchY);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, 7 + crouchY, 2, 2);
      ctx.fillRect(-10, 6 + crouchY, 2, 2);
    } else if (isDashing) {
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

  public renderRemotePlayer(remote: RemotePlayerState, cameraX: number, cameraY: number = 0, time: number) {
    const ctx = this.ctx;
    const x = Math.round(remote.x - cameraX);
    const y = Math.round(remote.y - cameraY);

    if (x < -40 || x > GAME_WIDTH + 40) return;

    ctx.save();

    // 1. If opponent is eliminated/dead
    if (remote.isDead) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('💀 CAÍDO', x + 7, y - 10);
      ctx.restore();
      return;
    }

    const isGhost = remote.id === 'ghost_player';
    const isAiBot = remote.id === 'ai_bot';

    // 2. Overhead Rival Name Tag & Trophies Badge
    const tagY = y - 12;
    ctx.save();
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    
    // Background pill
    const displayName = remote.name || 'Rival';
    const icon = isGhost ? '👻' : isAiBot ? '🤖' : '⚔️';
    const tagText = `${icon} ${displayName}`;
    const textMetrics = ctx.measureText(tagText);
    const pillW = Math.max(34, textMetrics.width + 8);
    const pillH = 9;

    ctx.fillStyle = isGhost ? 'rgba(8, 47, 73, 0.85)' : 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x + 7 - pillW / 2, tagY - 7, pillW, pillH);
    ctx.strokeStyle = isGhost ? '#38bdf8' : isAiBot ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 7 - pillW / 2, tagY - 7, pillW, pillH);

    // Text with glowing highlight
    ctx.fillStyle = isGhost ? '#bae6fd' : isAiBot ? '#a7f3d0' : '#fecdd3';
    ctx.fillText(tagText, x + 7, tagY);
    ctx.restore();

    if (isGhost) {
      ctx.globalAlpha = 0.55;
    }

    // 3. Dash Ghost / Movement Afterimages
    if (remote.isDashing) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + (remote.facing > 0 ? -6 : 6), y, 14, 16);
      ctx.restore();
    }

    // 4. Shield Barrier if blocking
    if (remote.isBlocking) {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Opponent Rival Sprite (Cyber Crimson Shinobi)
    const isMoving = Math.abs(remote.vx) > 0.2;
    const isGrounded = remote.animState === 'idle' || remote.animState === 'run';
    const bobY = isGrounded && isMoving ? Math.sin(time * 0.55) * 1.5 : 0;

    ctx.save();
    ctx.translate(x + 7, y + 8 + bobY);
    if (remote.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Crimson Flowing Scarf
    for (let i = 4; i >= 1; i--) {
      const sx = -4 - (i * 2.8);
      const sy = -3 + Math.sin(time * 0.3 - i * 0.8) * 1.8;
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#dc2626';
      ctx.fillRect(sx, sy, Math.max(2, 4 - i * 0.5), Math.max(1.5, 3 - i * 0.4));
    }

    // Legs / Greaves (Dark Charcoal with Crimson Accents)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, 3, 3, 6);
    ctx.fillRect(1, 3, 3, 6);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-3, 6, 2, 2);
    ctx.fillRect(2, 6, 2, 2);

    // Torso & Chestplate
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-4, -3, 8, 6);
    ctx.fillStyle = '#f43f5e'; // Rival Core (Crimson Reactor)
    ctx.fillRect(-1, -1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -0.5, 1, 1);

    // Shinobi Belt (Crimson & Gold)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-4, 2, 8, 1.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-1, 2, 2, 1.5);

    // Masked Head & Cowl
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -9, 8, 6);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(-3, -5, 6, 2);

    // Rival Optic Eyes (Glowing Ruby Slits)
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(0, -7, 2, 1.5);
    ctx.fillRect(3, -7, 2, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -7, 1, 1);

    // Ninja Hair (Crimson / Flame Tipped)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-5, -11, 8, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -12, 6, 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, -12, 3, 1.5);

    // Katana / Scabbard on Back
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-5, -6, 2, 10);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-6, -7, 3, 2);

    ctx.restore();
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

  public renderSteampunkRisingFloor(engine: GameEngine) {
    const ctx = this.ctx;
    const floorY = Math.round(engine.steampunkRisingFloorY);
    const cameraX = engine.cameraX;
    const time = engine.time;

    // Only render if floor is in or near visible viewport
    if (floorY < engine.cameraY - 40 || floorY > engine.cameraY + GAME_HEIGHT + 100) {
      return;
    }

    const startX = Math.round(180 - cameraX);
    const endX = Math.round(1020 - cameraX);
    const w = endX - startX;

    ctx.save();

    // 1. Scalding Steam Vapor Plumes rising above the plate
    for (let i = 0; i < 8; i++) {
      const vx = startX + 20 + ((i * 97 + time * 1.2) % (w - 40));
      const vPulse = Math.sin(time * 0.18 + i * 2) * 6;
      const vHeight = 22 + ((i * 13) % 18) + vPulse;
      const vAlpha = 0.35 + Math.sin(time * 0.15 + i) * 0.2;

      const grad = ctx.createLinearGradient(vx, floorY, vx, floorY - vHeight);
      grad.addColorStop(0, `rgba(234, 88, 12, ${vAlpha})`);
      grad.addColorStop(0.4, `rgba(251, 191, 36, ${vAlpha * 0.8})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(vx - 8, floorY - vHeight, 16, vHeight);
    }

    // 2. Heavy Pneumatic Crushing Floor Plate
    // Base dark cast iron
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(startX, floorY, w, 24);

    // Superheated brass rim
    ctx.fillStyle = '#78350f';
    ctx.fillRect(startX, floorY, w, 6);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(startX, floorY, w, 2);

    // Hazard warning diagonal stripes (amber & charcoal)
    for (let sx = startX; sx < endX; sx += 20) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(sx, floorY + 2);
      ctx.lineTo(sx + 10, floorY + 2);
      ctx.lineTo(sx + 6, floorY + 10);
      ctx.lineTo(sx - 4, floorY + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing heating core grate
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(startX + 4, floorY + 10, w - 8, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(startX + 6, floorY + 11, w - 12, 2);

    // Steam vents along the plate with red warning indicators
    for (let vx = startX + 16; vx < endX; vx += 36) {
      ctx.fillStyle = '#1c140e';
      ctx.fillRect(vx, floorY + 3, 12, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(vx + 4, floorY + 4, 4, 2);
    }

    // 3. Dense Superheated Furnace Sea underneath
    const seaGrad = ctx.createLinearGradient(startX, floorY + 24, startX, floorY + 140);
    seaGrad.addColorStop(0, '#991b1b');
    seaGrad.addColorStop(0.3, '#7f1d1d');
    seaGrad.addColorStop(0.7, '#450a0a');
    seaGrad.addColorStop(1, '#1c0505');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(startX, floorY + 24, w, 140);

    // Heavy hydraulic piston columns extending down
    for (let px = startX + 60; px < endX; px += 140) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(px - 6, floorY + 24, 12, 100);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px - 4, floorY + 24, 4, 100);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 7, floorY + 24, 14, 4);
    }

    ctx.restore();
  }
}
