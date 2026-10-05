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
import { drawAILevelBackground } from './aiBackgroundManager';
import { getProcessedLandmarkCanvas } from './landmarkAssets';
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
    this.renderLandmarks(engine.landmarks, engine.cameraX, engine.time, engine.platforms);

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
    drawAILevelBackground(this.ctx, zone, act, cameraX, worldWidth, time);
  }

  public renderLandmarks(landmarks: Landmark[], cameraX: number, time: number, platforms: Platform[] = []) {
    const ctx = this.ctx;

    // Helper to find the exact solid platform ground underneath any landmark
    const getGroundFloorY = (worldX: number, fallbackY = 148): number => {
      let bestFloorY = fallbackY;
      let minFloorDiff = Infinity;
      for (const p of platforms) {
        if (p.hidden) continue;
        if (worldX >= p.x - 30 && worldX <= p.x + p.w + 30) {
          // If platform is ground, arena, or solid base floor
          if (p.kind === 'ground' || p.kind === 'arena' || p.kind === 'snow' || p.kind === 'ice' || p.kind === 'castle_stone') {
            const diff = Math.abs(p.y - fallbackY);
            if (diff < minFloorDiff) {
              minFloorDiff = diff;
              bestFloorY = p.y;
            }
          }
        }
      }
      return bestFloorY;
    };

    for (const lm of landmarks) {
      const x = Math.round(lm.x - cameraX);
      if (x < -160 || x > GAME_WIDTH + 160) continue;

      // Ensure the landmark stands firmly rooted on the actual terrain ground floor
      const groundY = getGroundFloorY(lm.x, 148);

      if (lm.type === 'torii') {
        const sc = lm.scale || 1.15;
        const toriiCanvas = getProcessedLandmarkCanvas('torii');
        if (toriiCanvas) {
          // Render beautiful AI Japanese Torii Shrine with transparent backdrop (no hitboxes, background element)
          const targetW = Math.round(92 * sc);
          const targetH = Math.round(98 * sc);
          const drawX = Math.round(x - 12 * sc);
          // Root pillars flush onto the ground floor (no floating in the air)
          const drawY = Math.round(groundY - targetH + 3);
          ctx.save();
          ctx.globalAlpha = 0.94;
          ctx.drawImage(toriiCanvas, drawX, drawY, targetW, targetH);
          // Subtle warm shrine lantern glow at base
          const glowGrad = ctx.createRadialGradient(drawX + targetW / 2, groundY, 2, drawX + targetW / 2, groundY, 26 * sc);
          glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
          glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(drawX - 10, groundY - 14, targetW + 20, 16);
          ctx.restore();
        } else {
          // Authentic procedural fallback
          const pillarH = 78;
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(x, groundY - pillarH, Math.round(9 * sc), pillarH);
          ctx.fillRect(x + Math.round(52 * sc), groundY - pillarH, Math.round(9 * sc), pillarH);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(x - Math.round(8 * sc), groundY - pillarH - 4, Math.round(78 * sc), Math.round(11 * sc));
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(x - Math.round(12 * sc), groundY - pillarH - 10, Math.round(86 * sc), Math.round(7 * sc));
          // Golden plaque
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + Math.round(27 * sc), groundY - pillarH, Math.round(8 * sc), Math.round(12 * sc));
        }
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
        const pyramidCanvas = getProcessedLandmarkCanvas('pyramid');
        if (pyramidCanvas) {
          // Render beautiful AI Desert Pyramid with transparent background (pure scenery, no hitboxes)
          const targetW = Math.round(195 * sc);
          const targetH = Math.round(128 * sc);
          const drawX = Math.round(x - targetW / 2);
          // Grounded directly on the sand floor
          const drawY = Math.round(groundY - targetH + 4);
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(pyramidCanvas, drawX, drawY, targetW, targetH);

          // Subtle sun-kissed golden ambient haze around the pyramidion capstone
          const apexX = drawX + targetW / 2;
          const apexY = drawY + Math.round(18 * sc);
          const sunGlow = ctx.createRadialGradient(apexX, apexY, 2, apexX, apexY, 28 * sc);
          sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
          sunGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
          sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = sunGlow;
          ctx.beginPath();
          ctx.arc(apexX, apexY, 28 * sc, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          const w = Math.round(180 * sc);
          const h = Math.round(110 * sc);
          const baseY = groundY;
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
        }
      } else if (lm.type === 'sphinx') {
        // Monumental Sphinx Guardian
        const sc = lm.scale || 1.1;
        const sphinxCanvas = getProcessedLandmarkCanvas('sphinx');
        if (sphinxCanvas) {
          const targetW = Math.round(112 * sc);
          const targetH = Math.round(82 * sc);
          const drawX = Math.round(x);
          // Grounded flush on the desert floor
          const drawY = Math.round(groundY - targetH + 3);
          ctx.save();
          ctx.globalAlpha = 0.96;
          ctx.drawImage(sphinxCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();
        } else {
          ctx.fillStyle = '#78350f';
          // Body & Paws
          ctx.fillRect(x, groundY - 43, Math.round(90 * sc), 43);
          ctx.fillRect(x + Math.round(75 * sc), groundY - 23, Math.round(35 * sc), 23);
          // Head & Nemes Crown
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + Math.round(15 * sc), groundY - 73, Math.round(34 * sc), 32);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x + Math.round(12 * sc), groundY - 76, Math.round(40 * sc), 8);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x + Math.round(16 * sc), groundY - 74, Math.round(6 * sc), 4);
          ctx.fillRect(x + Math.round(38 * sc), groundY - 74, Math.round(6 * sc), 4);
          // Eyes
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(x + Math.round(38 * sc), groundY - 62, 4, 3);
        }
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
        const sc = lm.scale || 1.15;
        const cyberCanvas = getProcessedLandmarkCanvas('cyber_skyscraper');
        if (cyberCanvas) {
          const targetW = Math.round(w * sc);
          const targetH = Math.round(h * sc);
          const drawX = Math.round(x);
          const drawY = Math.round(groundY - targetH + 2);
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(cyberCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();
        } else {
          ctx.fillStyle = '#090e1f';
          ctx.fillRect(x, groundY - h, w, h);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 4, groundY - h + 4, w - 8, h - 4);

          // Antenna with pulsating beacon
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x + w / 2 - 2, groundY - h - 18, 4, 18);
          ctx.fillStyle = Math.floor(time / 15) % 2 === 0 ? '#f43f5e' : '#fbbf24';
          ctx.fillRect(x + w / 2 - 3, groundY - h - 22, 6, 4);

          // Glowing Window Grids & Neon Circuit Strips
          for (let wy = groundY - h + 12; wy < groundY - 4; wy += 16) {
            ctx.fillStyle = (wy + x) % 2 === 0 ? '#38bdf888' : '#a855f788';
            ctx.fillRect(x + 8, wy, 8, 8);
            ctx.fillRect(x + 22, wy, 8, 8);
            ctx.fillRect(x + w - 30, wy, 8, 8);
            ctx.fillRect(x + w - 16, wy, 8, 8);
          }
          // Vertical Neon Conduit
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x + w / 2 - 1, groundY - h + 4, 2, h - 4);
        }
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
        const mayanCanvas = getProcessedLandmarkCanvas('mayan_pyramid');
        if (mayanCanvas) {
          const targetW = Math.round(145 * sc);
          const targetH = Math.round(112 * sc);
          const drawX = Math.round(x);
          const drawY = Math.round(groundY - targetH + 3);
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(mayanCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();
        } else {
          const baseY = groundY;
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
        }
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
        const baseY = lm.y ? Math.min(lm.y, groundY) : groundY;
        const w = lm.w || 64;
        const h = lm.h || 48;
        const sc = lm.scale || 1.15;
        const chaletCanvas = getProcessedLandmarkCanvas('chalet');
        if (chaletCanvas) {
          const targetW = Math.round(w * sc * 1.3);
          const targetH = Math.round(h * sc * 1.3);
          const drawX = Math.round(x);
          const drawY = Math.round(baseY - targetH + 3);
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(chaletCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();
        } else {
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
        const baseY = lm.y ? Math.min(lm.y, groundY) : groundY;
        const w = lm.w || 96;
        const h = lm.h || 110;
        const sc = lm.scale || 1.15;
        const castleCanvas = getProcessedLandmarkCanvas('castle_keep');
        if (castleCanvas) {
          const targetW = Math.round(w * sc * 1.15);
          const targetH = Math.round(h * sc * 1.05);
          const drawX = Math.round(x);
          const drawY = Math.round(baseY - targetH + 2);
          ctx.save();
          ctx.globalAlpha = 0.96;
          ctx.drawImage(castleCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();
        } else {
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
        }
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
      } else if (lm.type === 'dino_fossil_ribs') {
        // Colossal Dinosaur Ribcage Cathedral Arch
        const baseY = lm.y || 148;
        const archW = lm.w || 90;
        const archH = lm.h || 85;
        // Ivory fossil bone ribs
        for (let rib = 0; rib < 4; rib++) {
          const rx = x + rib * 24;
          ctx.strokeStyle = '#fef3c7';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(rx, baseY);
          ctx.quadraticCurveTo(rx + 8, baseY - archH * 0.85, rx + 22, baseY - archH);
          ctx.stroke();
          // Rib bone texture & amber resin droplet
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rx + 1, baseY);
          ctx.quadraticCurveTo(rx + 9, baseY - archH * 0.85, rx + 23, baseY - archH);
          ctx.stroke();
          // Amber resin nodule
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(rx + 6, baseY - 35, 3, 3);
        }
      } else if (lm.type === 'amber_altar') {
        // Prehistoric Primordial Amber Altar Monolith
        const baseY = lm.y || 148;
        // Carved basalt pedestal
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x - 16, baseY - 32, 32, 32);
        ctx.fillStyle = '#292524';
        ctx.fillRect(x - 14, baseY - 30, 28, 30);
        // Primitive claw mark engravings
        ctx.fillStyle = '#78716c';
        ctx.fillRect(x - 8, baseY - 22, 2, 10);
        ctx.fillRect(x - 4, baseY - 24, 2, 14);
        ctx.fillRect(x, baseY - 22, 2, 10);
        // Huge glowing Golden Amber Gemstone
        const aPulse = 0.85 + Math.sin(time * 0.08) * 0.15;
        ctx.fillStyle = `rgba(245, 158, 11, ${aPulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, baseY - 44, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, baseY - 44, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x - 2, baseY - 46, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'volcanic_fumarole') {
        // High-pressure Mesozoic Sulfur Fumarole
        const baseY = lm.y || 148;
        ctx.fillStyle = '#260a0a';
        ctx.beginPath();
        ctx.moveTo(x - 14, baseY);
        ctx.lineTo(x - 8, baseY - 28);
        ctx.lineTo(x + 8, baseY - 28);
        ctx.lineTo(x + 14, baseY);
        ctx.closePath();
        ctx.fill();
        // Magma glow in vent
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x - 6, baseY - 28, 12, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - 3, baseY - 27, 6, 2);
        // Sulfur smoke puffs rising
        for (let sp = 0; sp < 3; sp++) {
          const sy = (baseY - 32) - ((time * 0.4 + sp * 14) % 38);
          const sx = x + Math.sin(time * 0.1 + sp) * 4;
          ctx.fillStyle = 'rgba(254, 215, 170, 0.3)';
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + sp * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (lm.type === 'colossal_rocket_gantry') {
        // Colosal Cohete Lunar Apolo-Ω & Torre de Lanzamiento Umbilical
        const baseY = lm.y || 148;
        const rx = x;

        // 1. Red Umbilical Service Tower (Gantry) alongside rocket
        const towerX = rx + 22;
        const towerW = 16;
        const towerH = 118;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(towerX, baseY - towerH, towerW, towerH);
        // White truss horizontal bands & diagonals
        ctx.fillStyle = '#f8fafc';
        for (let ty = baseY - towerH + 6; ty < baseY; ty += 14) {
          ctx.fillRect(towerX, ty, towerW, 2);
          ctx.fillRect(towerX + 7, ty - 12, 2, 12);
        }
        // Top yellow crane boom
        ctx.fillStyle = '#eab308';
        ctx.fillRect(towerX - 6, baseY - towerH - 4, towerW + 12, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(towerX + towerW / 2 - 1.5, baseY - towerH - 8, 3, 4); // Red beacon

        // Digital Launch Countdown LED Board on tower
        ctx.fillStyle = '#020617';
        ctx.fillRect(towerX + 2, baseY - 60, towerW - 4, 10);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('T-03', towerX + towerW / 2, baseY - 53);

        // Umbilical Swing Arms connecting tower to rocket
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx + 8, baseY - 88, 16, 3);
        ctx.fillRect(rx + 8, baseY - 58, 16, 3);
        ctx.fillRect(rx + 10, baseY - 28, 14, 3);
        // Fuel pipe couplings
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(rx + 8, baseY - 59, 3, 5);

        // 2. Colossal Apollo-Omega Lunar Rocket Body
        // Stage 1 (Booster with black/white roll pattern)
        const rocketW = 18;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(rx - rocketW / 2, baseY - 48, rocketW, 44);
        ctx.fillStyle = '#090d16'; // Roll stripes
        ctx.fillRect(rx - rocketW / 2, baseY - 44, rocketW / 2, 16);
        ctx.fillRect(rx, baseY - 24, rocketW / 2, 16);

        // Stage 1 Engine bells & flame trench mount
        ctx.fillStyle = '#334155';
        ctx.fillRect(rx - 8, baseY - 4, 6, 4);
        ctx.fillRect(rx + 2, baseY - 4, 6, 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx - 12, baseY, 24, 4);

        // Interstage Corrugated Ring
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - rocketW / 2 + 1, baseY - 52, rocketW - 2, 4);

        // Stage 2 (Second Stage with mission insignia)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(rx - (rocketW - 2) / 2, baseY - 84, rocketW - 2, 32);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(rx - (rocketW - 2) / 2, baseY - 76, rocketW - 2, 2); // Cyan stripe
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx - 3, baseY - 72, 6, 4); // Mission patch emblem

        // Stage 3 & Command Module Cone
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(rx - (rocketW - 4) / 2, baseY - 100, rocketW - 4, 16);
        // Conical Command Capsule
        ctx.beginPath();
        ctx.moveTo(rx - (rocketW - 4) / 2, baseY - 100);
        ctx.lineTo(rx, baseY - 114);
        ctx.lineTo(rx + (rocketW - 4) / 2, baseY - 100);
        ctx.closePath();
        ctx.fill();

        // Launch Escape Tower (LES) with escape rocket motor
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(rx - 1, baseY - 124, 2, 10);
        ctx.fillRect(rx - 2.5, baseY - 126, 5, 2.5); // Escape nozzles

        // Cryogenic venting frost vapor wisps from rocket
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
        const rVaporY = baseY - 58 + Math.sin(time * 0.2) * 3;
        ctx.beginPath();
        ctx.arc(rx - 10, rVaporY, 3, 0, Math.PI * 2);
        ctx.arc(rx + 10, rVaporY + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'launch_control_tower') {
        // Torre de Control de Vuelo Aeroespacial Cabo Kronos
        const baseY = lm.y || 148;
        // Reinforced concrete bunker body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 14, baseY - 48, 28, 48);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x - 12, baseY - 46, 24, 46);

        // Angled Green Panoramic Observation Windows
        ctx.fillStyle = '#065f46';
        ctx.fillRect(x - 16, baseY - 38, 32, 10);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x - 14, baseY - 37, 28, 8);
        ctx.fillStyle = '#6ee7b7';
        for (let wx = x - 12; wx < x + 12; wx += 6) {
          ctx.fillRect(wx, baseY - 36, 1, 6);
        }

        // Roof Radar Radome Dome
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x, baseY - 50, 7, Math.PI, 0);
        ctx.fill();
        // Red flashing obstruction beacon
        const beacon = Math.floor(time / 8) % 2 === 0 ? '#ef4444' : '#7f1d1d';
        ctx.fillStyle = beacon;
        ctx.fillRect(x - 1, baseY - 59, 2, 2);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x - 0.5, baseY - 57, 1, 7);
      } else if (lm.type === 'radar_tracking_dish') {
        // Gran Antena Parabólica de Telemetría y Rastreo Lunar
        const baseY = lm.y || 148;
        // Concrete foundation & steel pylon
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 6, baseY - 24, 12, 24);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 4, baseY - 22, 8, 22);

        // Parabolic Dish (Oriented towards the Moon)
        const dishTilt = -0.4;
        ctx.save();
        ctx.translate(x, baseY - 28);
        ctx.rotate(dishTilt);

        // Dish mesh bowl
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Feed horn tripod & receiver
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(-1.5, -12, 3, 4);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(0, -10);
        ctx.lineTo(10, 0);
        ctx.stroke();

        ctx.restore();
      } else if (lm.type === 'cryogenic_fuel_silo') {
        // Silo Esférico Criogénico de Hidrógeno / Oxígeno Líquido
        const baseY = lm.y || 148;
        // Heavy steel tripod support legs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 14, baseY);
        ctx.lineTo(x - 8, baseY - 16);
        ctx.moveTo(x + 14, baseY);
        ctx.lineTo(x + 8, baseY - 16);
        ctx.stroke();

        // Giant Insulated White Sphere
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x, baseY - 28, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cyan Hazard Warning Ring
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - 17, baseY - 30, 34, 4);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LH2', x, baseY - 27);

        // Safety Relief Vent with condensation vapor puff
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x - 1.5, baseY - 49, 3, 4);
        const puff = (time * 0.3) % 24;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
        ctx.beginPath();
        ctx.arc(x, baseY - 50 - puff * 0.5, 3 + puff * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else if (lm.type === 'lunar_biodome') {
        // Monumental Cúpula Biosférica Geodésica de la Base Lunar
        const baseY = lm.y || 148;
        const radius = 34;

        // Interior Hydroponic Lighting Glow (Lush Green & Gold)
        const domeGlow = ctx.createRadialGradient(x, baseY, 4, x, baseY, radius);
        domeGlow.addColorStop(0, 'rgba(74, 222, 128, 0.7)');
        domeGlow.addColorStop(0.6, 'rgba(16, 185, 129, 0.4)');
        domeGlow.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
        ctx.fillStyle = domeGlow;
        ctx.beginPath();
        ctx.arc(x, baseY, radius, Math.PI, 0);
        ctx.fill();

        // Internal Oxygen Tree & Hydroponic Plant Silhouettes
        ctx.fillStyle = '#14532d';
        ctx.fillRect(x - 2, baseY - 24, 4, 24); // Tree trunk
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, baseY - 26, 10, 0, Math.PI * 2);
        ctx.arc(x - 7, baseY - 22, 7, 0, Math.PI * 2);
        ctx.arc(x + 7, baseY - 22, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#86efac';
        ctx.fillRect(x - 2, baseY - 28, 4, 3); // Solar grow lamp

        // Translucent Geodesic Glass Hexagonal Framework
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, baseY, radius, Math.PI, 0);
        ctx.stroke();

        // Geodesic strut ribs
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1;
        for (let a = 1; a < 5; a++) {
          const angle = Math.PI + (a * Math.PI) / 5;
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.lineTo(x + Math.cos(angle) * radius, baseY + Math.sin(angle) * radius);
          ctx.stroke();
        }

        // Reinforced Airlock Entrance at base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 8, baseY - 12, 16, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - 6, baseY - 10, 12, 10);
        ctx.fillStyle = '#22c55e'; // Green pressurized airlock light
        ctx.fillRect(x - 1, baseY - 12, 2, 2);
      } else if (lm.type === 'lunar_lander_apollo') {
        // Módulo de Descenso Lunar Histórico (Apolo Relic con Lámina de Oro)
        const baseY = lm.y ? Math.min(lm.y, groundY) : groundY;
        const lx = x;
        const sc = lm.scale || 1.15;
        const landerCanvas = getProcessedLandmarkCanvas('lunar_lander_apollo');
        if (landerCanvas) {
          const targetW = Math.round(58 * sc);
          const targetH = Math.round(48 * sc);
          const drawX = Math.round(lx - targetW / 2);
          const drawY = Math.round(baseY - targetH + 2);
          ctx.save();
          ctx.globalAlpha = 0.96;
          ctx.drawImage(landerCanvas, drawX, drawY, targetW, targetH);
          ctx.restore();

          // Commemorative Mission Flag planted on lunar surface beside lander
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(drawX + targetW + 6, baseY - 20, 1.5, 20); // Staff
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(drawX + targetW + 6, baseY - 20, 9, 6);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(drawX + targetW + 6, baseY - 17, 9, 1.5);
        } else {
          // 4 Articulated Spider Landing Legs & Footpads
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lx - 8, baseY - 16);
          ctx.lineTo(lx - 20, baseY);
          ctx.moveTo(lx + 8, baseY - 16);
          ctx.lineTo(lx + 20, baseY);
          ctx.moveTo(lx - 4, baseY - 16);
          ctx.lineTo(lx - 10, baseY);
          ctx.moveTo(lx + 4, baseY - 16);
          ctx.lineTo(lx + 10, baseY);
          ctx.stroke();

          // Circular footpads on regolith
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(lx - 23, baseY - 2, 6, 2.5);
          ctx.fillRect(lx + 17, baseY - 2, 6, 2.5);
          ctx.fillRect(lx - 12, baseY - 2, 4, 2);
          ctx.fillRect(lx + 8, baseY - 2, 4, 2);

          // Gold Mylar Thermal Foil Insulated Octagonal Body
          ctx.fillStyle = '#b45309';
          ctx.fillRect(lx - 12, baseY - 22, 24, 14);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(lx - 10, baseY - 20, 20, 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(lx - 6, baseY - 18, 12, 6);

          // Ascent Stage Silhouette & VHF Antenna on top
          ctx.fillStyle = '#334155';
          ctx.fillRect(lx - 8, baseY - 32, 16, 10);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(lx - 6, baseY - 30, 12, 6);
          // Rendezvous radar dish
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(lx - 2, baseY - 36, 4, 4);

          // Commemorative Mission Flag planted on lunar surface beside lander
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(lx + 26, baseY - 20, 1.5, 20); // Staff
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(lx + 26, baseY - 20, 9, 6);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(lx + 26, baseY - 17, 9, 1.5);
        }
      } else if (lm.type === 'lunar_comm_relay') {
        // Torre de Retransmisión Láser Espacio Profundo
        const baseY = lm.y || 148;
        // Pylon structure
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 3, baseY - 50, 6, 50);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 2, baseY - 48, 4, 48);

        // Optical laser transceiver head
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(x, baseY - 54, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing cyan laser beam firing upward toward Earth
        const laserPulse = 0.5 + Math.sin(time * 0.2) * 0.4;
        ctx.fillStyle = `rgba(56, 189, 248, ${laserPulse})`;
        ctx.fillRect(x - 1, 0, 2, baseY - 54);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 0.5, 0, 1, baseY - 54);
      } else if (lm.type === 'lunar_solar_farm') {
        // Granja de Paneles Solares Fotovoltaicos de Alta Eficiencia
        const baseY = lm.y || 148;
        for (let p = 0; p < 3; p++) {
          const px = x + p * 22 - 22;
          // Pylon
          ctx.fillStyle = '#334155';
          ctx.fillRect(px - 1, baseY - 14, 2, 14);
          // Blue photovoltaic collector plate
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(px - 8, baseY - 24, 16, 10);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - 8, baseY - 24, 16, 10);
          // Silicon grid lines
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(px - 8, baseY - 19, 16, 1);
          ctx.fillRect(px, baseY - 24, 1, 10);
        }
      } else if (lm.type === 'helium3_refinery') {
        // Refinería y Extractor Minero de Helio-3
        const baseY = lm.y || 148;
        // Heavy industrial plant housing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 22, baseY - 36, 44, 36);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 20, baseY - 34, 40, 34);

        // Yellow caution stripes
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x - 18, baseY - 10, 36, 3);
        ctx.fillStyle = '#0f172a';
        for (let sx = x - 18; sx < x + 18; sx += 6) {
          ctx.fillRect(sx, baseY - 10, 3, 3);
        }

        // 3 Glowing Cyan Helium-3 Pressurized Storage Canisters
        for (let c = 0; c < 3; c++) {
          const cx = x - 12 + c * 12;
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(cx - 3, baseY - 28, 6, 14);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(cx - 2, baseY - 27, 4, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 1, baseY - 25, 2, 4);
        }

        // Vacuum extraction intake funnel
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(x - 6, baseY - 36);
        ctx.lineTo(x + 6, baseY - 36);
        ctx.lineTo(x + 10, baseY - 44);
        ctx.lineTo(x - 10, baseY - 44);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x - 4, baseY - 44, 8, 2);
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
    const isPirate = zone === 'piratestreasure';
    const isJurassic = zone === 'jurasicdraft';
    const isMoon = zone === 'themoon';

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

      if (p.kind === 'palm_wood' || p.kind === 'coral' || p.kind === 'sand' || p.kind === 'shipwreck_hull' || p.kind === 'sunken_deck' || (isPirate && (p.kind === 'ground' || p.kind === 'arena'))) {
        // Pirates Treasure Themed Platforms
        if (p.kind === 'sand' || (isPirate && act === 1 && p.kind === 'ground')) {
          // Golden Tropical Sand Dunes
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x, y + 2, p.w, p.h - 2);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x, y, p.w, 1);
          // Small seashells and beach pebbles
          ctx.fillStyle = '#ffffff';
          for (let sx = x + 12; sx < x + p.w - 8; sx += 28) {
            ctx.fillRect(sx, y + 1, 2, 2);
            ctx.fillStyle = '#fed7aa';
            ctx.fillRect(sx + 8, y + 2, 2, 1.5);
            ctx.fillStyle = '#ffffff';
          }
        } else if (p.kind === 'coral') {
          // Living Coral Reef Shelves (Vibrant pink, purple & orange coral)
          ctx.fillStyle = '#4c0519';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#9f1239';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 2);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#fda4af';
          ctx.fillRect(x, y, p.w, 1);
          // Coral polyps & sea anemone buds
          for (let cx = x + 6; cx < x + p.w - 6; cx += 14) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(cx, y - 2, 3, 2);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(cx + 6, y - 3, 3, 3);
          }
        } else if (p.kind === 'shipwreck_hull') {
          // Sunken Ship Hull & Ribs (Weathered dark oak with iron bolts)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x, y, p.w, 2);
          // Barnacles encrusted on hull
          ctx.fillStyle = '#64748b';
          for (let bx = x + 8; bx < x + p.w - 6; bx += 18) {
            ctx.fillRect(bx, y + 1, 3, 3);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(bx + 1, y + 1, 1, 1);
            ctx.fillStyle = '#64748b';
          }
        } else {
          // Palm Wood / Sunken Wooden Galleon Decking (Planks with brass nails)
          ctx.fillStyle = '#291206';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x, y, p.w, 1);
          // Wood grain planks & brass nails
          for (let px = x + 16; px < x + p.w; px += 24) {
            ctx.fillStyle = '#1c0a00';
            ctx.fillRect(px, y + 1, 1, p.h - 1);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(px - 6, y + 2, 1.5, 1.5);
            ctx.fillRect(px + 4, y + 2, 1.5, 1.5);
          }
        }
        continue;
      }

      if (
        p.kind === 'prehistoric_earth' ||
        p.kind === 'petrified_wood' ||
        p.kind === 'dino_fossil_rock' ||
        p.kind === 'volcanic_basalt' ||
        (isJurassic && (p.kind === 'ground' || p.kind === 'arena'))
      ) {
        // Prehistoric Dinosaur Era Platforms
        if (p.kind === 'petrified_wood') {
          // Ancient Petrified Wood Trunk
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          // Concentric growth rings & amber bands
          ctx.fillStyle = '#d97706';
          for (let rx = x + 12; rx < x + p.w; rx += 20) {
            ctx.fillRect(rx, y + 2, 2, p.h - 4);
          }
          // Ancient moss cap
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'dino_fossil_rock') {
          // Sedimentary Rock with Embedded Dinosaur Bones & Fossils
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#44403c';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          ctx.fillStyle = '#78716c';
          ctx.fillRect(x, y, p.w, 2);

          // Embedded Dinosaur Fossil Bones (Ribs, vertebrae, teeth)
          ctx.fillStyle = '#fef3c7';
          for (let fx = x + 10; fx < x + p.w - 10; fx += 26) {
            // Fossil rib curve
            ctx.fillRect(fx, y + 4, 6, 2);
            ctx.fillRect(fx + 5, y + 6, 2, 4);
            ctx.fillRect(fx + 2, y + 7, 2, 2);
            // Amber resin droplet
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(fx + 14, y + 4, 3, 3);
            ctx.fillStyle = '#fef3c7';
          }
        } else if (p.kind === 'volcanic_basalt' || (isJurassic && act >= 2 && p.kind === 'ground')) {
          // Dark Volcanic Basalt with Molten Magma Veins
          ctx.fillStyle = '#0c0a09';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Glowing magma fissures between rock plates
          ctx.fillStyle = '#ea580c';
          for (let vx = x + 14; vx < x + p.w - 14; vx += 30) {
            ctx.fillRect(vx, y + 3, 10, 1.5);
            ctx.fillRect(vx + 4, y + 4.5, 2, 6);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(vx + 3, y + 3, 3, 1);
            ctx.fillStyle = '#ea580c';
          }

          // Chiseled obsidian edge highlight
          ctx.fillStyle = '#57534e';
          ctx.fillRect(x, y, p.w, 1.5);
        } else {
          // Prehistoric Earth: Primordial soil, moss & ferns
          ctx.fillStyle = '#052e16';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Lush emerald moss and tiny fern shoots along top surface
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x, y, p.w, 1.5);
          for (let tx = x + 6; tx < x + p.w - 6; tx += 12) {
            ctx.fillRect(tx, y - 2, 2, 2);
            ctx.fillRect(tx + 1, y - 4, 1.5, 2);
          }
        }
        continue;
      }

      if (
        isMoon ||
        p.kind === 'space_chassis' ||
        p.kind === 'launch_gantry' ||
        p.kind === 'rocket_scaffold' ||
        p.kind === 'lunar_regolith' ||
        p.kind === 'lunar_base_habitat' ||
        p.kind === 'solar_deck' ||
        p.kind === 'biodome_catwalk' ||
        p.kind === 'pressurized_conduit'
      ) {
        // =====================================================================
        // ZONA 12: THE MOON PLATFORMS (ZONA DE LANZAMIENTO & BASE LUNAR)
        // =====================================================================
        if (p.kind === 'lunar_regolith' || (isMoon && act === 2 && (p.kind === 'ground' || p.kind === 'arena'))) {
          // Lunar Regolith & Basalt Crater Terrain (Airless stark contrast)
          ctx.fillStyle = '#060a12'; // Deep basalt shadow
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b'; // Powdery silver-grey lunar regolith
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Impact Crater Depressions & Micro-bowls
          for (let cx = x + 16; cx < x + p.w - 16; cx += 36) {
            ctx.fillStyle = '#0a0f1d';
            ctx.beginPath();
            ctx.ellipse(cx, y + 7, 7, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Sharp sunlight rim on crater lip
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(cx - 5, y + 5, 10, 1);
          }

          // Astronaut Apollo Boot-Tread Imprints in dust
          ctx.fillStyle = '#334155';
          for (let tx = x + 8; tx < x + p.w - 8; tx += 28) {
            ctx.fillRect(tx, y + 2, 6, 1.5);
            ctx.fillRect(tx + 1, y + 4, 4, 1);
          }

          // Sparkling Crystalline Anorthosite Mineral Flecks
          ctx.fillStyle = '#f8fafc';
          for (let fx = x + 4; fx < x + p.w - 4; fx += 18) {
            ctx.fillRect(fx, y + 3, 1, 1);
          }

          // Stark Solar White Top Mantle & Specular Edge
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'lunar_base_habitat' || p.kind === 'pressurized_conduit') {
          // Pressurized Lunar Base Habitat Module & Air-Lock Catwalk
          ctx.fillStyle = '#090d16'; // Vacuum shadow
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b'; // Titanium alloy plate
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);
          ctx.fillStyle = '#334155'; // Inner panel recessed tier
          ctx.fillRect(x + 3, y + 3, p.w - 6, p.h - 6);

          // Ceramic Thermal Shield Rivets & Hermetic Seams
          ctx.fillStyle = '#64748b';
          for (let rx = x + 6; rx < x + p.w - 6; rx += 16) {
            ctx.fillRect(rx, y + 4, 1.5, 1.5);
            ctx.fillRect(rx, y + p.h - 5, 1.5, 1.5);
          }

          // Glowing Cyan Pressurized Conduit / Airlock Status Line
          const pulse = 0.7 + Math.sin(time * 0.15) * 0.3;
          ctx.fillStyle = `rgba(6, 182, 212, ${pulse})`;
          ctx.fillRect(x + 2, y + p.h / 2 - 1, p.w - 4, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 4, y + p.h / 2 - 0.5, p.w - 8, 1);

          // Top Sleek Silver Trim
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'solar_deck') {
          // Photovoltaic High-Efficiency Blue Silicon Solar Panel Deck
          ctx.fillStyle = '#020617';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e3a8a'; // Deep blue photovoltaic cells
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Silicon Grid Matrix Lines
          ctx.fillStyle = '#38bdf8';
          for (let gx = x + 10; gx < x + p.w - 10; gx += 14) {
            ctx.fillRect(gx, y + 2, 1, p.h - 4);
          }
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(x + 2, y + Math.floor(p.h / 2), p.w - 4, 1);

          // Electric Energy Top Trim
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'biodome_catwalk') {
          // Translucent Hydroponic Biodome Maintenance Walkway
          ctx.fillStyle = '#022c22';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'; // Hydroponic green glaze
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Non-Slip Diamond Walkway Grid
          ctx.fillStyle = '#34d399';
          for (let mx = x + 8; mx < x + p.w - 8; mx += 16) {
            ctx.fillRect(mx, y + 3, 2, 2);
            ctx.fillRect(mx + 4, y + 6, 2, 2);
          }

          // Luminescent Growth-LED Emerald Edge
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'space_chassis' || (isMoon && act === 1 && (p.kind === 'ground' || p.kind === 'arena'))) {
          // Launch Complex Tarmac Foundation & Blast Trench Plates
          ctx.fillStyle = '#050b14';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b'; // Heavy blast steel
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Diagonal Safety Warning Hazard Stripes (Yellow / Black / Dark Grey)
          for (let sx = x + 8; sx < x + p.w - 8; sx += 24) {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(sx, y + 3, 8, 3);
            ctx.fillStyle = '#090d16';
            ctx.fillRect(sx + 4, y + 3, 4, 3);
          }

          // High-Voltage Cryo Power Conduit
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(x + 4, y + p.h - 4, p.w - 8, 2);

          // Metallic Top Trim
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, y, p.w, 1);
        } else if (p.kind === 'launch_gantry' || p.kind === 'rocket_scaffold') {
          // Aerospace Red & White Structural Lattice Truss Scaffold
          ctx.fillStyle = '#1e293b'; // Core
          ctx.fillRect(x, y, p.w, p.h);

          // Red Gantry Girder Band
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x, y + 2, p.w, p.h - 4);

          // White diagonal truss braces
          ctx.fillStyle = '#f8fafc';
          for (let gx = x + 4; gx < x + p.w - 4; gx += 16) {
            ctx.fillRect(gx, y + 3, 3, p.h - 6);
            ctx.fillRect(gx + 6, y + 4, 4, 2);
          }

          // Perforated Steel Walkway Deck on top
          ctx.fillStyle = '#475569';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(x, y, p.w, 1);

          // Red Aviation Safety Warning Beacon at ends
          const beacon = Math.floor(time / 8) % 2 === 0 ? '#ef4444' : '#7f1d1d';
          ctx.fillStyle = beacon;
          ctx.fillRect(x + 1, y - 2, 2, 2);
          ctx.fillRect(x + p.w - 3, y - 2, 2, 2);
        } else {
          // Elevated Titanium Space Ledge
          ctx.fillStyle = '#090e1f';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 1, p.w - 2, p.h - 2);

          // Glowing Cyan Surface Guide
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, y, p.w, 1);
        }
        continue;
      }

      if (p.kind === 'ground' || p.kind === 'arena' || p.kind === 'jungle_stone') {
        // Base foundation drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.fillRect(x, y + p.h, p.w, 4);

        if (isNeon) {
          // --- NEON FOREST: High-Tech Cyber Stone with Luminous Fiber-Optics ---
          ctx.fillStyle = '#080e18';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#0f1d2e';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Fiber-optic data conduits
          ctx.fillStyle = '#06b6d433';
          for (let cx = x + 10; cx < x + p.w - 10; cx += 28) {
            ctx.fillRect(cx, y + 6, 16, 2);
            ctx.fillRect(cx + 8, y + 8, 2, 8);
          }
          // Luminous node dots
          ctx.fillStyle = '#22d3ee';
          for (let nx = x + 14; nx < x + p.w - 10; nx += 28) {
            ctx.fillRect(nx, y + 6, 2, 2);
          }

          // Top rail & glowing laser lip
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#a5f3fc';
          ctx.fillRect(x, y, p.w, 1);
        } else if (isSakura) {
          // --- SPIRIT BLOSSOM: Polished Japanese Lacquered Timber & Gold Crests ---
          ctx.fillStyle = isNight ? '#12081f' : '#260a1d';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = isNight ? '#1e0f33' : '#3d1230';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Golden floral crest engravings
          ctx.fillStyle = '#f43f5e33';
          for (let sx = x + 12; sx < x + p.w - 12; sx += 32) {
            ctx.fillRect(sx, y + 5, 12, 2);
            ctx.fillRect(sx + 5, y + 4, 2, 4);
          }

          // Fallen cherry blossom petals on floor surface
          for (let px = x + 8; px < x + p.w - 8; px += 24) {
            ctx.fillStyle = '#fda4af';
            ctx.fillRect(px, y, 3, 1.5);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(px + 1, y + 1, 1.5, 1);
          }

          // Top lacquer rim
          ctx.fillStyle = isNight ? '#9333ea' : '#e11d48';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = isNight ? '#c084fc' : '#fb7185';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#fff1f2';
          ctx.fillRect(x, y, p.w, 1);
        } else if (isLava) {
          // --- LAVA CLIFFS: Fractured Volcanic Basalt with Molten Magma Veins ---
          ctx.fillStyle = '#0f0404';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1c0707';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Subterranean glowing magma fissures
          const emberPulse = Math.sin(time * 0.1) * 0.15 + 0.85;
          ctx.fillStyle = `rgba(234, 88, 12, ${emberPulse})`;
          for (let lx = x + 8; lx < x + p.w - 8; lx += 26) {
            ctx.fillRect(lx, y + 5, 14, 2);
            ctx.fillRect(lx + 4, y + 7, 2, 7);
            ctx.fillRect(lx + 10, y + 7, 3, 5);
          }
          ctx.fillStyle = '#fbbf24';
          for (let lx = x + 12; lx < x + p.w - 8; lx += 26) {
            ctx.fillRect(lx, y + 5, 4, 1.5);
          }

          // Smoldering basalt lip
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x, y, p.w, 1);
        } else if (zone === 'desert') {
          // --- DESERT SANCTUARY: Monumental Egyptian Sandstone & Gold Hieroglyphs ---
          ctx.fillStyle = '#1c1106';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#2d1b09';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Carved hieroglyphic cartouches
          ctx.fillStyle = '#f59e0b44';
          for (let dx = x + 12; dx < x + p.w - 12; dx += 30) {
            ctx.fillRect(dx, y + 5, 12, 2);
            ctx.fillRect(dx + 3, y + 7, 6, 2);
            ctx.fillRect(dx + 5, y + 9, 2, 5);
          }
          // Lapis lazuli and gold inlays
          for (let lx = x + 6; lx < x + p.w - 6; lx += 30) {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(lx, y + 5, 2, 2);
          }

          // Wind-rippled golden sand mantle & pyramid gold trim
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x, y, p.w, 1);
        } else if (isKrono || isTravel) {
          // --- KRONO CITY / QUANTUM TRAVEL: Brushed Titanium Chassis & Cyber Buses ---
          ctx.fillStyle = '#060a14';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Running cybernetic data pulses
          const pulseOffset = Math.floor((time * 0.8) % 24);
          ctx.fillStyle = isTravel ? '#f43f5e44' : '#0284c744';
          for (let kx = x + 6; kx < x + p.w - 6; kx += 24) {
            ctx.fillRect(kx, y + 5, 14, 2);
            ctx.fillRect(kx + 4, y + 7, 2, 7);
          }
          ctx.fillStyle = isTravel ? '#fda4af' : '#38bdf8';
          for (let kx = x + 6 + pulseOffset; kx < x + p.w - 6; kx += 24) {
            ctx.fillRect(kx, y + 5, 4, 2);
          }

          // High-frequency neon rail lip
          ctx.fillStyle = isTravel ? '#e11d48' : '#0284c7';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = isTravel ? '#f43f5e' : '#06b6d4';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, p.w, 1);
        } else if (isJungle) {
          // --- JUNGLE RUN: Monumental Carved Mayan Stone with Emerald Jade Runes ---
          ctx.fillStyle = '#031a10';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Ancient Mayan solar glyph reliefs
          ctx.fillStyle = '#10b98144';
          for (let jx = x + 10; jx < x + p.w - 10; jx += 26) {
            ctx.fillRect(jx, y + 5, 12, 2);
            ctx.fillRect(jx + 4, y + 7, 4, 6);
            ctx.fillRect(jx + 2, y + 10, 8, 1);
          }
          // Hanging micro-ivy moss
          ctx.fillStyle = '#059669';
          for (let mx = x + 4; mx < x + p.w - 4; mx += 18) {
            ctx.fillRect(mx, y + p.h, 2, 3);
          }

          // Polished jade stone coping & gold sun glints
          ctx.fillStyle = '#047857';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#facc15';
          for (let gx = x + 12; gx < x + p.w - 12; gx += 26) {
            ctx.fillRect(gx, y, 4, 1);
          }
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(x, y, p.w, 1);
        } else if (isJurassic) {
          // --- JURASSIC DRAFT: Prehistoric Fossil Limestone & Amber Strata ---
          ctx.fillStyle = '#18120a';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#291e10';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);

          // Embedded prehistoric fossil spirals & amber crystals
          ctx.fillStyle = '#d9770655';
          for (let fx = x + 10; fx < x + p.w - 10; fx += 28) {
            ctx.fillRect(fx, y + 5, 10, 2);
            ctx.fillRect(fx + 6, y + 7, 3, 5);
          }
          ctx.fillStyle = '#f59e0b';
          for (let ax = x + 14; ax < x + p.w - 10; ax += 28) {
            ctx.fillRect(ax, y + 5, 2, 2);
          }

          // Primordial stone shelf & mossy crest
          ctx.fillStyle = '#15803d';
          ctx.fillRect(x, y, p.w, 3);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x, y, p.w, 1);
        } else {
          // Default robust textured bedrock
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, p.w, p.h);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 2, p.w - 2, p.h - 4);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x, y, p.w, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(x, y, p.w, 1);
        }
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
        ctx.fillRect(x + 1, y + p.h, p.w, 4);

        ctx.fillStyle = isNeon
          ? '#0d1e2e'
          : isSakura
          ? (isNight ? '#220c38' : '#450f28')
          : isLava
          ? '#220707'
          : isKrono
          ? '#0c1322'
          : isTravel
          ? '#130d24'
          : isJungle
          ? '#04351d'
          : isJurassic
          ? '#241a0d'
          : zone === 'desert'
          ? '#261708'
          : (act === 1 ? '#78350f' : '#3b0764');
        ctx.fillRect(x, y, p.w, p.h);

        // Biome inner texture & bracket
        ctx.fillStyle = isNeon
          ? '#06b6d433'
          : isSakura
          ? (isNight ? '#c084fc33' : '#f472b633')
          : isLava
          ? '#ef444444'
          : isKrono
          ? '#38bdf833'
          : isTravel
          ? '#f43f5e44'
          : isJungle
          ? '#22c55e33'
          : isJurassic
          ? '#d9770644'
          : zone === 'desert'
          ? '#f59e0b44'
          : '#f59e0b33';
        ctx.fillRect(x + 3, y + 2, p.w - 6, p.h - 4);

        // Glowing Surface Trim
        ctx.fillStyle = isNeon
          ? '#06b6d4'
          : isSakura
          ? (isNight ? '#d8b4fe' : '#fb7185')
          : isLava
          ? '#ea580c'
          : isKrono
          ? '#0284c7'
          : isTravel
          ? '#e11d48'
          : isJungle
          ? '#059669'
          : isJurassic
          ? '#15803d'
          : zone === 'desert'
          ? '#d97706'
          : '#f59e0b';
        ctx.fillRect(x, y, p.w, 2);

        // Specular highlight line
        ctx.fillStyle = isNeon
          ? '#a5f3fc'
          : isSakura
          ? '#fff1f2'
          : isLava
          ? '#fde047'
          : isKrono
          ? '#e0f2fe'
          : isTravel
          ? '#ffe4e6'
          : isJungle
          ? '#a7f3d0'
          : isJurassic
          ? '#fef08a'
          : '#fef3c7';
        ctx.fillRect(x + 2, y, p.w - 4, 1);

        // Metallic corner brackets
        ctx.fillStyle = '#ffffff88';
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
      } else if (h.type === 'bubble_geyser') {
        // Effervescent deep-sea hydrothermal bubble vent
        const ventBaseY = h.y + h.h;
        // Volcanic coral vent chimney
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(x + 2, ventBaseY);
        ctx.lineTo(x + 6, h.y + h.h - 10);
        ctx.lineTo(x + h.w - 6, h.y + h.h - 10);
        ctx.lineTo(x + h.w - 2, ventBaseY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 6, h.y + h.h - 12, h.w - 12, 3);

        // Translucent ascending bubble column
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(x + 4, h.y, h.w - 8, h.h - 10);

        // Rising water bubbles
        ctx.fillStyle = '#ffffff';
        for (let b = 0; b < 6; b++) {
          const by = (h.y + h.h - 12) - ((time * 2.5 + b * 20) % (h.h - 12));
          const bx = x + h.w / 2 + Math.sin(time * 0.2 + b) * 5;
          ctx.beginPath();
          ctx.arc(bx, by, b % 2 === 0 ? 2 : 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'sea_mine') {
        // Floating spiked naval sea-mine tethered with an iron chain
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const radius = Math.min(h.w, h.h) / 2;

        // Sea floor anchor & chain
        if (h.floorY) {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy + radius);
          ctx.lineTo(cx, h.floorY);
          ctx.stroke();
        }

        // Spikes projecting outwards in 8 directions
        ctx.fillStyle = '#0f172a';
        for (let a = 0; a < 8; a++) {
          const angle = (a * Math.PI) / 4;
          const sx = cx + Math.cos(angle) * (radius + 4);
          const sy = cy + Math.sin(angle) * (radius + 4);
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Heavy dark naval iron hull
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Flashing blinking red pressure fuse beacon
        const beaconPulse = Math.sin(time * 0.3) > 0 ? '#ef4444' : '#7f1d1d';
        ctx.fillStyle = beaconPulse;
        ctx.beginPath();
        ctx.arc(cx, cy - radius * 0.4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'falling_coconut') {
        // Tropical palm coconut with fibrous husk
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 2, cy - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx, cy + 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'coral_spikes' || h.type === 'sea_urchin') {
        // Toxic sharp purple coral spikes or sea urchin spines
        const count = Math.max(3, Math.floor(h.w / 8));
        const step = h.w / count;
        ctx.fillStyle = h.type === 'sea_urchin' ? '#581c87' : '#e11d48';
        for (let i = 0; i < count; i++) {
          const sx = x + i * step;
          ctx.beginPath();
          ctx.moveTo(sx, h.y + h.h);
          ctx.lineTo(sx + step / 2, h.y);
          ctx.lineTo(sx + step, h.y + h.h);
          ctx.closePath();
          ctx.fill();
          // Glowing poison tip
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(sx + step / 2 - 1, h.y, 2, 3);
          ctx.fillStyle = h.type === 'sea_urchin' ? '#581c87' : '#e11d48';
        }
      } else if (h.type === 'tar_pit') {
        // Prehistoric Bubbling Tar Pit Hazard with Fossilized Bones
        ctx.fillStyle = '#09090b';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 1, h.y + 1, h.w - 2, h.h - 1);

        // Viscous pitch ripples & rainbow hydrocarbon sheen
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x, h.y, h.w, 2);
        for (let bx = x + 4; bx < x + h.w - 4; bx += 10) {
          const bWave = Math.sin(time * 0.1 + bx * 0.3) * 1.5;
          ctx.fillStyle = (bx % 20 === 0) ? '#15803d44' : '#eab30833';
          ctx.fillRect(bx, h.y + 1 + bWave, 6, 1.5);
        }

        // Bubbling tar blisters rising & bursting
        for (let b = 0; b < 3; b++) {
          const bPhase = (time * 0.15 + b * 2) % 3;
          const bX = x + 8 + (b * (h.w / 3.2));
          const bY = h.y + 2;
          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.arc(bX, bY - bPhase * 1.2, 2.5 + bPhase, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#71717a';
          ctx.fillRect(bX - 1, bY - bPhase * 1.2 - 1, 1, 1);
        }

        // Protruding fossilized dinosaur ribs & bone spikes
        ctx.fillStyle = '#fef3c7';
        for (let fx = x + 6; fx < x + h.w - 6; fx += 18) {
          ctx.beginPath();
          ctx.moveTo(fx - 2, h.y + 6);
          ctx.lineTo(fx, h.y - 4);
          ctx.lineTo(fx + 2, h.y + 6);
          ctx.closePath();
          ctx.fill();
        }
      } else if (h.type === 'pterodactyl_nest') {
        // Prehistoric Dinosaur Nest with Speckled Eggs & Sharp Bone Spikes
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(x + h.w / 2, h.y + h.h - 2, h.w / 2, h.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(x + h.w / 2, h.y + h.h - 3, h.w / 2 - 2, h.h / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Speckled Dinosaur Eggs nestled inside
        const eggX = x + h.w / 2;
        const eggY = h.y + h.h / 2 + 1;
        // Egg 1 (Golden raptor egg)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(eggX - 4, eggY, 3, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(eggX - 5, eggY - 1, 1, 1);
        ctx.fillRect(eggX - 3, eggY + 1, 1, 1);

        // Egg 2 (Teal pterosaur egg)
        ctx.fillStyle = '#99f6e4';
        ctx.beginPath();
        ctx.ellipse(eggX + 4, eggY, 3.2, 4.2, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(eggX + 3, eggY - 1, 1, 1);

        // Sharp defensive thorn/bone perimeter spikes
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(x + 1, h.y + h.h - 2);
        ctx.lineTo(x - 2, h.y);
        ctx.lineTo(x + 4, h.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + h.w - 1, h.y + h.h - 2);
        ctx.lineTo(x + h.w + 2, h.y);
        ctx.lineTo(x + h.w - 4, h.y + 4);
        ctx.closePath();
        ctx.fill();
      } else if (h.type === 'lava_fissure') {
        // Glowing Volcanic Basalt Magma Fissure Hazard
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#292524';
        ctx.fillRect(x + 1, h.y + 1, h.w - 2, h.h - 1);

        // Incandescent molten magma pit
        const magPulse = 0.8 + Math.sin(time * 0.15) * 0.2;
        const fGrad = ctx.createLinearGradient(x, h.y, x, h.y + h.h);
        fGrad.addColorStop(0, '#fef08a');
        fGrad.addColorStop(0.3, '#f97316');
        fGrad.addColorStop(0.8, '#ef4444');
        fGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = fGrad;
        ctx.fillRect(x + 2, h.y + 2, h.w - 4, h.h - 2);

        // Lava crust bubbling
        ctx.fillStyle = '#451a03';
        for (let cx = x + 4; cx < x + h.w - 4; cx += 8) {
          const crustWave = Math.sin(time * 0.2 + cx) * 1.5;
          ctx.fillRect(cx, h.y + 2 + crustWave, 4, 1.5);
        }

        // Floating magma embers
        ctx.fillStyle = '#ffffff';
        const emberX = x + h.w / 2 + Math.sin(time * 0.3) * (h.w / 3);
        ctx.fillRect(emberX, h.y - 1 - (Math.floor(time * 0.6) % 6), 1.5, 1.5);
      } else if (h.type === 'rolling_boulder') {
        // Giant Rolling Basalt Volcano Boulder Hazard
        const cx = x + h.w / 2;
        const cy = h.y + h.h / 2;
        const rad = Math.min(h.w, h.h) / 2;
        const spin = (h.x || x) * 0.08;

        // Ground shadow
        ctx.fillStyle = 'rgba(12, 10, 9, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, h.y + h.h, rad * 0.9, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);

        // Rough jagged stone body
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.arc(-1, -1, rad - 2, 0, Math.PI * 2);
        ctx.fill();

        // Craggy basalt rock fissures
        ctx.strokeStyle = '#0c0a09';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-rad * 0.6, -rad * 0.3);
        ctx.lineTo(0, 0);
        ctx.lineTo(rad * 0.5, -rad * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(-rad * 0.2, rad * 0.6);
        ctx.stroke();

        // Glowing magma fissure in rock
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-rad * 0.3, -rad * 0.1);
        ctx.lineTo(rad * 0.2, rad * 0.2);
        ctx.stroke();

        ctx.restore();
      } else if (h.type === 'cryo_steam_vent') {
        // Válvula Criogénica de Vapor Espacial a Presión (Zona 12)
        const baseY = h.y + h.h;
        // Heavy insulated cryogenic valve base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, baseY - 6, h.w, 6);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 2, baseY - 5, h.w - 4, 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 4, baseY - 4, h.w - 8, 1);

        // Freezing condensation vapor jet surging upward
        const ventPulse = Math.sin(time * 0.2 + x) * 0.5 + 0.5;
        const jetHeight = 28 + ventPulse * 16;
        const grad = ctx.createLinearGradient(x + h.w / 2, baseY - 6, x + h.w / 2, baseY - 6 - jetHeight);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x + 2, baseY - 6);
        ctx.lineTo(x + h.w / 2, baseY - 6 - jetHeight);
        ctx.lineTo(x + h.w - 2, baseY - 6);
        ctx.closePath();
        ctx.fill();

        // Sub-zero ice crystals rising
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
          const cy = baseY - 6 - ((time * 0.6 + i * 10) % jetHeight);
          const cx = x + h.w / 2 + Math.sin(time * 0.2 + i) * 3;
          ctx.fillRect(cx, cy, 1.5, 1.5);
        }
      } else if (h.type === 'electrified_gantry_rail') {
        // Barandilla Electrificada de Alta Tensión (Zona 12)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, h.y, h.w, h.h);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 1, h.y + 1, h.w - 2, h.h - 2);

        // Ceramic Insulator Pylons
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 2, h.y + 2, 2, h.h - 4);
        ctx.fillRect(x + h.w - 4, h.y + 2, 2, h.h - 4);

        // Glowing Blue Plasma Energy Bar
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 4, h.y + 3, h.w - 8, h.h - 6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 4, h.y + 4, h.w - 8, 2);

        // Electric lightning sparks flashing
        if (Math.sin(time * 0.3 + x) > 0.3) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 4, h.y + h.h / 2);
          ctx.lineTo(x + h.w / 2 + (Math.random() - 0.5) * 6, h.y - 2);
          ctx.lineTo(x + h.w - 4, h.y + h.h / 2);
          ctx.stroke();
        }
      } else if (h.type === 'laser_barrier') {
        // Barrera Láser de Seguridad Perimetral Lunar (Zona 12)
        // Left emitter pylon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, h.y, 4, h.h);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 1, h.y + 2, 2, 2); // Red status LED

        // Right emitter pylon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + h.w - 4, h.y, 4, h.h);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + h.w - 3, h.y + 2, 2, 2);

        // Pulsing intense laser beam between emitters
        const laserPulse = 0.7 + Math.sin(time * 0.25) * 0.3;
        ctx.fillStyle = `rgba(239, 68, 68, ${laserPulse * 0.35})`;
        ctx.fillRect(x + 4, h.y + h.h / 2 - 2, h.w - 8, 4);

        ctx.fillStyle = `rgba(248, 113, 113, ${laserPulse})`;
        ctx.fillRect(x + 4, h.y + h.h / 2 - 1, h.w - 8, 2);

        // Brilliant White Laser Core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, h.y + h.h / 2 - 0.5, h.w - 8, 1);
      } else if (h.type === 'cosmic_geyser') {
        // Géiser Cósmico de Nitrógeno / Metano en Cráter de Regolito (Zona 12)
        const baseY = h.y + h.h;
        // Crater fissure basin
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.ellipse(x + h.w / 2, baseY - 2, h.w / 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Erupting cold gas plume
        const geyserPulse = Math.sin(time * 0.18 + x) * 0.5 + 0.5;
        const plumeH = 34 + geyserPulse * 20;

        const gGrad = ctx.createLinearGradient(x + h.w / 2, baseY - 2, x + h.w / 2, baseY - 2 - plumeH);
        gGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        gGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.6)');
        gGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.moveTo(x + 3, baseY - 2);
        ctx.quadraticCurveTo(x + h.w / 2 - 6, baseY - 2 - plumeH * 0.5, x + h.w / 2, baseY - 2 - plumeH);
        ctx.quadraticCurveTo(x + h.w / 2 + 6, baseY - 2 - plumeH * 0.5, x + h.w - 3, baseY - 2);
        ctx.closePath();
        ctx.fill();

        // Crystalline regolith dust motes suspended in low gravity
        ctx.fillStyle = '#ffffff';
        for (let d = 0; d < 4; d++) {
          const dy = baseY - 4 - ((time * 0.5 + d * 12) % plumeH);
          const dx = x + h.w / 2 + Math.sin(time * 0.2 + d * 2) * 5;
          ctx.fillRect(dx, dy, 1.5, 1.5);
        }
      } else if (h.type === 'rocket_thruster_plume') {
        // Tobera de Motor Cohete con Ignición Cíclica (Zona 12)
        const baseY = h.y + h.h;
        // Heavy titanium engine bell base
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(x + 2, baseY);
        ctx.lineTo(x + 5, baseY - 8);
        ctx.lineTo(x + h.w - 5, baseY - 8);
        ctx.lineTo(x + h.w - 2, baseY);
        ctx.closePath();
        ctx.fill();

        // Warning pre-ignition amber flare or active supersonic exhaust
        const cycle = (time * 0.1 + (x * 0.05)) % 6;
        if (cycle > 2.5) {
          // ACTIVE INFERNO PLUME!
          const flameH = 45 + Math.sin(time * 0.4) * 8;
          const pGrad = ctx.createLinearGradient(x + h.w / 2, baseY, x + h.w / 2, baseY + flameH);
          pGrad.addColorStop(0, '#ffffff');
          pGrad.addColorStop(0.2, '#fde047');
          pGrad.addColorStop(0.6, '#ea580c');
          pGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.moveTo(x + 3, baseY);
          ctx.lineTo(x + h.w / 2, baseY + flameH);
          ctx.lineTo(x + h.w - 3, baseY);
          ctx.closePath();
          ctx.fill();

          // Shock diamond white ellipses in supersonic exhaust
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + h.w / 2 - 2, baseY + 8, 4, 3);
          ctx.fillRect(x + h.w / 2 - 1.5, baseY + 20, 3, 2.5);
        } else {
          // Pre-ignition ignition pilot spark
          const blink = Math.floor(time / 4) % 2 === 0;
          ctx.fillStyle = blink ? '#facc15' : '#ea580c';
          ctx.beginPath();
          ctx.arc(x + h.w / 2, baseY - 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
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
        } else if (zone === 'steampunk') {
          outerGlow = 'rgba(245, 158, 11, 0.48)';
          frameDark = '#1c1208';
          frameTrim = '#f59e0b';
          vortexC1 = '#ea580c';
          vortexC2 = '#38bdf8';
          vortexCore = '#fef08a';
          beaconText = '🌀 PORTAL DE VAPOR';
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
        const dir = p.vx >= 0 ? 1 : -1;
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        if (dir < 0) ctx.scale(-1, 1);

        if (p.kind === 'sakuraShuriken' || p.kind === 'sakuraKunai') {
          // Zizz: Spinning Astral Sakura Shuriken
          const rot = (p.life * 0.35) % (Math.PI * 2);
          ctx.rotate(rot);

          ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#db2777';
          ctx.fillRect(-4, -4, 8, 8);
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(-3, -3, 6, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-1.5, -1.5, 3, 3);
        } else if (p.kind === 'magmaDart') {
          // Kael: Heavy Molten Magma Dart
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.fillRect(-8, -1.5, 6, 3);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.fillRect(-3, -1, 4, 2);

          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-2, -2.5, 7, 5);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(0, -1.5, 6, 3);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(4, -1, 3, 2);
        } else if (p.kind === 'sandDart') {
          // Anuk: Solar Desert Crystal Feather Dart
          ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
          ctx.fillRect(-8, -1, 6, 2.5);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.fillRect(-3, -0.5, 4, 1.5);

          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(-2, -2, 6, 4);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(0, -1.5, 5, 3);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(4, -0.5, 3, 1.5);
        } else if (p.kind === 'empDisc') {
          // Vector: Spinning Holographic EMP Disc
          const rot = (p.life * 0.4) % (Math.PI * 2);
          ctx.rotate(rot);

          ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#4338ca';
          ctx.fillRect(-4, -4, 8, 8);
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(-3, -3, 6, 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-1.5, -1.5, 3, 3);
        } else if (p.kind === 'jadeDart') {
          // Balam: Sacred Mayan Jade Needle Dart
          ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.fillRect(-8, -1, 6, 2.5);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.fillRect(-3, -0.5, 4, 1.5);

          ctx.fillStyle = '#047857';
          ctx.fillRect(-2, -2, 6, 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(0, -1.5, 5, 3);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(4, -0.5, 3, 1.5);
        } else {
          // Zion: Classic Cyan/Purple Cyber Dagger
          ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
          ctx.fillRect(-7, -1, 5, 2);
          ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
          ctx.fillRect(-3, -0.5, 3, 1);

          ctx.fillStyle = '#6b21a8';
          ctx.fillRect(-2, -2, 6, 4);
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(0, -1.5, 5, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(4, -0.5, 3, 1);

          ctx.fillStyle = '#475569';
          ctx.fillRect(-4, -1, 2, 2);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(-6, -1.5, 2, 3);
        }
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
      } else if (p.kind === 'space_missile') {
        // Space Dreadnought Homing Missile (Sonic 3 Doomsday Style)
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        const mAngle = Math.atan2(p.vy, p.vx);
        ctx.rotate(mAngle);
        // Rocket exhaust plume
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-p.w / 2 - 4, -1.5, 4, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-p.w / 2 - 2, -1, 2, 2);
        // Rocket body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w - 3, p.h);
        // Fins
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-p.w / 2, -p.h / 2 - 2, 3, p.h + 4);
        // Red warhead tip
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(p.w / 2 - 3, -p.h / 2);
        ctx.lineTo(p.w / 2 + 2, 0);
        ctx.lineTo(p.w / 2 - 3, p.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.kind === 'doomsday_laser') {
        // Colossal Doomsday Mega Laser Beam
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(x - 2, p.y - 3, p.w + 4, p.h + 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, p.y + p.h * 0.25, p.w, p.h * 0.5);
      } else if (p.kind === 'asteroid_debris') {
        // Tumbling Asteroid Rock in Space
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.angle || 0) + (p.life || 0) * 0.08);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(-1, -1, p.w / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 2, 2);
        ctx.restore();
      } else if (p.kind === 'bionic_burst') {
        // Zion Bionic Photon Blast
        ctx.save();
        ctx.translate(x + p.w / 2, p.y + p.h / 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    const skin = player.characterSkin || 'zion';

    // 1. Dynamic Contact Ground Shadow
    if (player.ground) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      ctx.beginPath();
      ctx.ellipse(x + 7, y + 16, 7.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Soft fading air shadow
      const airDist = Math.min(30, Math.max(4, Math.abs(player.vy * 4)));
      const shadowAlpha = Math.max(0.1, 0.35 - airDist * 0.008);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(x + 7, y + 16 + airDist * 0.3, Math.max(4, 7 - airDist * 0.1), 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Dash Ghost Afterimages with Chromatic Cyber-Trail
    for (let idx = 0; idx < player.dashTrail.length; idx++) {
      const trail = player.dashTrail[idx];
      const tx = Math.round(trail.x - cameraX);
      const ty = Math.round(trail.y);
      ctx.save();
      ctx.translate(tx + 7, ty + 8);
      if (trail.facing < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = trail.alpha * 0.48;

      // Chromatic ghost hue: Cyan shifting to Electric Magenta
      const ghostColor =
        skin === 'zizz' ? (idx % 2 === 0 ? '#f472b6' : '#c084fc') :
        skin === 'kael' ? (idx % 2 === 0 ? '#f97316' : '#ea580c') :
        skin === 'anuk' ? (idx % 2 === 0 ? '#eab308' : '#0284c7') :
        skin === 'vector' ? (idx % 2 === 0 ? '#6366f1' : '#38bdf8') :
        skin === 'balam' ? (idx % 2 === 0 ? '#10b981' : '#f59e0b') :
        (idx % 2 === 0 ? '#06b6d4' : '#c084fc');
      const ghostRim =
        skin === 'zizz' ? (idx % 2 === 0 ? '#fbcfe8' : '#e879f9') :
        skin === 'kael' ? (idx % 2 === 0 ? '#fef08a' : '#fb923c') :
        skin === 'anuk' ? (idx % 2 === 0 ? '#fef08a' : '#38bdf8') :
        skin === 'vector' ? (idx % 2 === 0 ? '#a5b4fc' : '#7dd3fc') :
        skin === 'balam' ? (idx % 2 === 0 ? '#6ee7b7' : '#fde047') :
        (idx % 2 === 0 ? '#67e8f9' : '#e879f9');

      // Streamlined ninja silhouette
      ctx.fillStyle = ghostColor;
      ctx.fillRect(-6, -4, 12, 3); // Pauldrons
      ctx.fillRect(-4, -1, 8, 6);  // Torso
      ctx.fillRect(-4, -10, 8, 7); // Masked head
      ctx.fillRect(-3, 5, 3, 5);   // Legs
      ctx.fillRect(1, 5, 3, 5);

      // Neon optic trail slit & energy hair
      ctx.fillStyle = ghostRim;
      ctx.fillRect(0, -8, 5, 1.5);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-6, -13, 9, 4);

      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // 3. Invulnerability flashing (damage flicker)
    if (player.inv > 0 && Math.floor(player.inv / 4) % 2 === 0) return;

    const isMoving = Math.abs(player.vx) > 0.2;
    const isGrounded = player.ground;
    const isJumping = !isGrounded && player.vy < 0;
    const isFalling = !isGrounded && player.vy >= 0;
    const isDashing = player.isDashing;
    const isAttacking = player.isAttacking;
    const isBlocking = player.isBlocking;

    // Organic idle breathing & running rhythm bob
    const bobY = isGrounded && isMoving ? Math.sin(t * 0.55) * 1.5 : (isGrounded ? Math.sin(t * 0.1) * 0.7 : 0);

    // 4. Special Ready / Showdown Radiant Cyber Aura
    if (player.energy >= 70 || player.showdownReady || player.showdownActive) {
      ctx.save();
      const auraPulse = 0.22 + Math.sin(t * 0.18) * 0.14;
      ctx.globalAlpha = auraPulse;
      ctx.fillStyle = player.showdownActive ? '#c084fc' : '#22d3ee';
      ctx.beginPath();
      ctx.arc(x + 7, y + 8 + bobY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Ambient radial sparks
      const sparkA = (t * 0.12) % (Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        Math.round(x + 7 + Math.cos(sparkA) * 12),
        Math.round(y + 8 + bobY + Math.sin(sparkA) * 12),
        1.5,
        1.5
      );
      ctx.restore();
    }

    // 5. Shield Defense Barrier (Hexagonal Cyber-Barrier with Parry Pulse)
    if (isBlocking) {
      ctx.save();
      const isParry = player.perfectParryTimer > 0;
      const shieldGlow = isParry ? '#facc15' : '#38bdf8';
      const shieldFill = isParry ? 'rgba(250, 204, 21, 0.32)' : 'rgba(56, 189, 248, 0.24)';

      ctx.fillStyle = shieldFill;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = shieldGlow;
      ctx.lineWidth = isParry ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Cyber crosshair / hex shield grid
      ctx.strokeStyle = isParry ? '#ffffff' : '#67e8f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 7, y + 8, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // --- MAIN ZION SPRITE (MODERN CYBER SHINOBI HERO) ---
    ctx.save();
    ctx.translate(x + 7, y + 8 + bobY);

    if (player.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Bionic Space Flight Suit Check
    if (player.isFlying || player.flightSuit) {
      this.renderBionicFlightZion(player, x, y, t);
      ctx.restore();
      return;
    }

    // Aerodynamic lean based on state
    if (player.isSkiing) {
      ctx.rotate(player.skiCrouch ? 0.22 : 0.08);
    } else if (isDashing) {
      ctx.rotate(0.20);
    } else if (isMoving && isGrounded) {
      ctx.rotate(0.08);
    }

    // =========================================================================
    // DYNAMIC CHARACTER SKIN PALETTES & TRAITS (100% UNIQUE PER HERO - ALL 12 ZONES)
    // =========================================================================
    const isZion = skin === 'zion';
    const isZizz = skin === 'zizz';
    const isKael = skin === 'kael';
    const isAnuk = skin === 'anuk';
    const isVector = skin === 'vector';
    const isBalam = skin === 'balam';
    const isBlizzard = skin === 'blizzard';
    const isSteampunk = skin === 'steampunk';
    const isCastle = skin === 'castlesmash';
    const isPirate = skin === 'pirate';
    const isJurassic = skin === 'jurassic';
    const isMoon = skin === 'moon';

    // 1. Cape / Scarf Colors
    const scarfColor1 =
      isZizz ? '#f472b6' :
      isKael ? '#ea580c' :
      isAnuk ? '#eab308' :
      isVector ? '#6366f1' :
      isBalam ? '#10b981' :
      isBlizzard ? '#38bdf8' :
      isSteampunk ? '#f59e0b' :
      isCastle ? '#3b82f6' :
      isPirate ? '#14b8a6' :
      isJurassic ? '#84cc16' :
      isMoon ? '#a855f7' :
      '#22d3ee';

    const scarfColor2 =
      isZizz ? '#db2777' :
      isKael ? '#c2410c' :
      isAnuk ? '#ca8a04' :
      isVector ? '#4f46e5' :
      isBalam ? '#047857' :
      isBlizzard ? '#0284c7' :
      isSteampunk ? '#b45309' :
      isCastle ? '#1d4ed8' :
      isPirate ? '#0f766e' :
      isJurassic ? '#4d7c0f' :
      isMoon ? '#7e22ce' :
      '#06b6d4';

    const scarfRim =
      isZizz ? '#fbcfe8' :
      isKael ? '#fef08a' :
      isAnuk ? '#facc15' :
      isVector ? '#38bdf8' :
      isBalam ? '#fbbf24' :
      isBlizzard ? '#e0f2fe' :
      isSteampunk ? '#fef08a' :
      isCastle ? '#bfdbfe' :
      isPirate ? '#99f6e4' :
      isJurassic ? '#d9f99d' :
      isMoon ? '#f3e8ff' :
      '#e0f2fe';

    // 2. Armor & Clothing Palette
    const bootsBase =
      isZizz ? '#1e1b4b' :
      isKael ? '#1c1917' :
      isAnuk ? '#0f172a' :
      isVector ? '#09090b' :
      isBalam ? '#1c1917' :
      isBlizzard ? '#0f172a' :
      isSteampunk ? '#292524' :
      isCastle ? '#334155' :
      isPirate ? '#1e1b4b' :
      isJurassic ? '#1c1917' :
      isMoon ? '#0f172a' :
      '#0a0f1d';

    const bootsSole =
      isZizz ? '#f472b6' :
      isKael ? '#ea580c' :
      isAnuk ? '#eab308' :
      isVector ? '#6366f1' :
      isBalam ? '#10b981' :
      isBlizzard ? '#38bdf8' :
      isSteampunk ? '#f59e0b' :
      isCastle ? '#3b82f6' :
      isPirate ? '#14b8a6' :
      isJurassic ? '#84cc16' :
      isMoon ? '#a855f7' :
      '#06b6d4';

    const bootsTrim =
      isZizz ? '#fbcfe8' :
      isKael ? '#fef08a' :
      isAnuk ? '#38bdf8' :
      isVector ? '#38bdf8' :
      isBalam ? '#fbbf24' :
      isBlizzard ? '#ffffff' :
      isSteampunk ? '#fde047' :
      isCastle ? '#93c5fd' :
      isPirate ? '#5eead4' :
      isJurassic ? '#bef264' :
      isMoon ? '#e879f9' :
      '#a5f3fc';

    const pantsBase =
      isZizz ? '#2e1065' :
      isKael ? '#1c1917' :
      isAnuk ? '#f8fafc' :
      isVector ? '#09090b' :
      isBalam ? '#1c1917' :
      isBlizzard ? '#0f172a' :
      isSteampunk ? '#1c1917' :
      isCastle ? '#1e293b' :
      isPirate ? '#0f172a' :
      isJurassic ? '#292524' :
      isMoon ? '#1e1b4b' :
      '#0a0f1d';

    const pantsAccent =
      isZizz ? '#db2777' :
      isKael ? '#78350f' :
      isAnuk ? '#eab308' :
      isVector ? '#18181b' :
      isBalam ? '#b45309' :
      isBlizzard ? '#38bdf8' :
      isSteampunk ? '#78350f' :
      isCastle ? '#3b82f6' :
      isPirate ? '#0f766e' :
      isJurassic ? '#4d7c0f' :
      isMoon ? '#7e22ce' :
      '#1e293b';

    const torsoBase =
      isZizz ? '#fdf2f8' :
      isKael ? '#1c1917' :
      isAnuk ? '#f8fafc' :
      isVector ? '#18181b' :
      isBalam ? '#b45309' :
      isBlizzard ? '#0f172a' :
      isSteampunk ? '#78350f' :
      isCastle ? '#475569' :
      isPirate ? '#1e1b4b' :
      isJurassic ? '#451a03' :
      isMoon ? '#f8fafc' :
      '#070b14';

    const torsoArmor =
      isZizz ? '#f472b6' :
      isKael ? '#292524' :
      isAnuk ? '#eab308' :
      isVector ? '#312e81' :
      isBalam ? '#10b981' :
      isBlizzard ? '#38bdf8' :
      isSteampunk ? '#b45309' :
      isCastle ? '#3b82f6' :
      isPirate ? '#14b8a6' :
      isJurassic ? '#84cc16' :
      isMoon ? '#a855f7' :
      '#1e293b';

    const pauldronBase =
      isZizz ? '#f472b6' :
      isKael ? '#78350f' :
      isAnuk ? '#eab308' :
      isVector ? '#312e81' :
      isBalam ? '#10b981' :
      isBlizzard ? '#f8fafc' :
      isSteampunk ? '#b45309' :
      isCastle ? '#64748b' :
      isPirate ? '#0f766e' :
      isJurassic ? '#713f12' :
      isMoon ? '#ffffff' :
      '#1e293b';

    const pauldronTrim =
      isZizz ? '#fbcfe8' :
      isKael ? '#f97316' :
      isAnuk ? '#0284c7' :
      isVector ? '#38bdf8' :
      isBalam ? '#fbbf24' :
      isBlizzard ? '#38bdf8' :
      isSteampunk ? '#f59e0b' :
      isCastle ? '#93c5fd' :
      isPirate ? '#facc15' :
      isJurassic ? '#bef264' :
      isMoon ? '#a855f7' :
      '#06b6d4';

    const beltBase =
      isZizz ? '#be185d' :
      isKael ? '#78350f' :
      isAnuk ? '#eab308' :
      isVector ? '#312e81' :
      isBalam ? '#047857' :
      isBlizzard ? '#0284c7' :
      isSteampunk ? '#78350f' :
      isCastle ? '#1e3a8a' :
      isPirate ? '#dc2626' :
      isJurassic ? '#713f12' :
      isMoon ? '#4c1d95' :
      '#0284c7';

    const beltBuckle =
      isZizz ? '#facc15' :
      isKael ? '#ea580c' :
      isAnuk ? '#0284c7' :
      isVector ? '#38bdf8' :
      isBalam ? '#fbbf24' :
      isBlizzard ? '#ffffff' :
      isSteampunk ? '#f59e0b' :
      isCastle ? '#facc15' :
      isPirate ? '#facc15' :
      isJurassic ? '#a3e635' :
      isMoon ? '#facc15' :
      '#f59e0b';

    // =========================================================================
    // A. WAVING SCARF / CAPE / MANTLE PHYSICS
    // =========================================================================
    const scarfSegments = isKael || isCastle ? 7 : 6;
    for (let i = scarfSegments; i >= 1; i--) {
      const waveSpeed = isMoving ? 0.50 : 0.18;
      const waveAmp = isMoving ? 2.6 : 1.2;
      const sx = -4 - (i * (isKael || isCastle ? 3.6 : 3.2)) - (isMoving ? 1.6 * i : 0);
      const sy = -3 + Math.sin(t * waveSpeed - i * 0.75) * waveAmp + (isJumping ? i * 0.9 : isFalling ? -i * 0.6 : 0);
      const sw = Math.max(1.8, (isKael || isCastle ? 5.2 : 4.4) - i * 0.6);
      const sh = Math.max(1.2, (isKael || isCastle ? 3.8 : 3.2) - i * 0.35);

      // Glow edge
      ctx.fillStyle = scarfColor2;
      ctx.fillRect(Math.floor(sx) - 0.5, Math.floor(sy) - 0.5, Math.ceil(sw) + 1, Math.ceil(sh) + 1);

      // Scarf core
      ctx.fillStyle = i % 2 === 0 ? scarfColor1 : scarfColor2;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), Math.ceil(sh));

      // Luminous highlight line
      ctx.fillStyle = scarfRim;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), 1);

      // Trailing thematic particles at scarf tip
      if (i === scarfSegments && isMoving) {
        ctx.fillStyle = scarfRim;
        ctx.fillRect(Math.floor(sx) - 2, Math.floor(sy) + 1, 1.5, 1.5);
      }
    }

    // A2. Character-Specific Head Accessories Behind Head
    if (isZion) {
      for (let k = 3; k >= 1; k--) {
        const rx = -5 - (k * 2.6);
        const ry = -9 + Math.sin(t * 0.32 - k * 0.85) * 1.5;
        ctx.fillStyle = k === 1 ? '#0891b2' : '#06b6d4';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 1.5);
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 0.7);
      }
    } else if (isZizz) {
      for (let k = 3; k >= 1; k--) {
        const rx = -6 - (k * 2.8);
        const ry = -10 + Math.sin(t * 0.35 - k * 0.8) * 2;
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 1.5);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 0.7);
      }
    } else if (isBalam) {
      for (let k = 2; k >= 1; k--) {
        const rx = -5 - (k * 2.2);
        const ry = -13 + Math.sin(t * 0.25 - k * 0.7) * 1.2;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 2.5, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 2.5, 0.8);
      }
    } else if (isPirate) {
      // Crimson Pirate Bandana tail
      for (let k = 2; k >= 1; k--) {
        const rx = -5 - (k * 2.5);
        const ry = -8 + Math.sin(t * 0.3 - k * 0.7) * 1.5;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 3, 1.5);
      }
    }

    // =========================================================================
    // B. LEGS & FOOTWEAR (Skin-Themed Articulation)
    // =========================================================================
    const legPhase = isGrounded && isMoving ? Math.sin(t * 0.48) : 0;

    if (player.isSkiing) {
      const crouchY = player.skiCrouch ? 2 : 0;
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-4, 2 + crouchY, 3, 5);
      ctx.fillRect(1, 1 + crouchY, 3, 5);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-4, 4 + crouchY, 3, 2);
      ctx.fillRect(1, 3 + crouchY, 3, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-4, 6 + crouchY, 3, 2);
      ctx.fillRect(1, 5 + crouchY, 3, 2);

      const skiTilt = isJumping ? -0.15 : isFalling ? 0.12 : 0;
      ctx.save();
      ctx.translate(0, 8 + crouchY);
      ctx.rotate(skiTilt);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-12, 0, 24, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-11, -1, 22, 1);
      ctx.restore();
    } else if (isDashing) {
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-6, 2, 5, 4);
      ctx.fillRect(0, 1, 5, 4);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-6, 4, 5, 2.5);
      ctx.fillRect(1, 3, 4, 2.5);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-7, 6, 6, 2);
      ctx.fillRect(1, 5, 5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-7, 7, 6, 1);
      ctx.fillRect(1, 6, 5, 1);
    } else if (isJumping) {
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-4, 2, 3.5, 4);
      ctx.fillRect(1, 1, 3.5, 4);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-4, 3, 3.5, 2);
      ctx.fillRect(1, 2, 3.5, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-4, 5, 3.5, 2);
      ctx.fillRect(1, 4, 3.5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-4, 6, 3.5, 1);
      ctx.fillRect(1, 5, 3.5, 1);
    } else if (isFalling) {
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-4, 3, 3.5, 5);
      ctx.fillRect(1, 3, 3.5, 5);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-4, 5, 3.5, 2);
      ctx.fillRect(1, 5, 3.5, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-4, 7, 3.5, 2);
      ctx.fillRect(1, 7, 3.5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-4, 8, 3.5, 1);
      ctx.fillRect(1, 8, 3.5, 1);
    } else if (isMoving) {
      const l1 = Math.round(legPhase * 2.8);
      const l2 = Math.round(-legPhase * 2.8);
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-3 + l1, 3, 3.5, 4);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-3 + l1, 4, 3.5, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-3 + l1, 6, 3.5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-3 + l1, 7, 3.5, 1);

      ctx.fillStyle = pantsAccent;
      ctx.fillRect(1 + l2, 3, 3.5, 4);
      ctx.fillStyle = pantsBase;
      ctx.fillRect(1 + l2, 4, 3.5, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(1 + l2, 6, 3.5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(1 + l2, 7, 3.5, 1);
    } else {
      ctx.fillStyle = pantsBase;
      ctx.fillRect(-3.5, 3, 3.5, 4);
      ctx.fillRect(1, 3, 3.5, 4);
      ctx.fillStyle = pantsAccent;
      ctx.fillRect(-3.5, 4, 3.5, 2);
      ctx.fillRect(1, 4, 3.5, 2);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(-3.5, 6, 3.5, 2);
      ctx.fillRect(1, 6, 3.5, 2);
      ctx.fillStyle = bootsTrim;
      ctx.fillRect(-3.5, 7, 3.5, 1);
      ctx.fillRect(1, 7, 3.5, 1);
    }

    // =========================================================================
    // C. TORSO, ARMOR & CHEST CORE (SKIN-CUSTOMIZED)
    // =========================================================================
    ctx.fillStyle = torsoBase;
    ctx.fillRect(-4.5, -4, 9, 8);

    // Pauldrons (Shoulders)
    const pWidth = isKael || isCastle ? 4 : 3;
    ctx.fillStyle = pauldronBase;
    ctx.fillRect(-4.5 - pWidth + 1, -4, pWidth, isKael || isCastle ? 4.5 : 3.5);
    ctx.fillRect(3.5, -4, pWidth, isKael || isCastle ? 4.5 : 3.5);
    ctx.fillStyle = pauldronTrim;
    ctx.fillRect(-4.5 - pWidth + 1, -4, pWidth, 1);
    ctx.fillRect(3.5, -4, pWidth, 1);

    // Chestplate / Kimono / Vest
    ctx.fillStyle = torsoArmor;
    ctx.fillRect(-3.5, -3, 7, 4.5);

    // Core / Amulet / Medallion
    const corePulse = Math.sin(t * 0.22) * 0.25 + 0.75;
    const coreColor =
      isZizz ? `rgba(244, 114, 182, ${corePulse})` :
      isKael ? `rgba(249, 115, 22, ${corePulse})` :
      isAnuk ? `rgba(250, 204, 21, ${corePulse})` :
      isVector ? `rgba(99, 102, 241, ${corePulse})` :
      isBalam ? `rgba(16, 185, 129, ${corePulse})` :
      isBlizzard ? `rgba(56, 189, 248, ${corePulse})` :
      isSteampunk ? `rgba(245, 158, 11, ${corePulse})` :
      isCastle ? `rgba(59, 130, 246, ${corePulse})` :
      isPirate ? `rgba(20, 184, 166, ${corePulse})` :
      isJurassic ? `rgba(132, 204, 22, ${corePulse})` :
      isMoon ? `rgba(168, 85, 247, ${corePulse})` :
      `rgba(34, 211, 238, ${corePulse})`;
    ctx.fillStyle = coreColor;
    ctx.fillRect(-1.5, -1.5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -0.5, 1, 1);

    // Belt / Sash
    ctx.fillStyle = beltBase;
    ctx.fillRect(-4, 2, 8, 1.5);
    ctx.fillStyle = beltBuckle;
    ctx.fillRect(-1, 1.8, 2, 1.8);

    // =========================================================================
    // D. HEAD, HELMET, HAIR & VISOR (DISTINCT ARCHITECTURE PER HERO)
    // =========================================================================
    if (isAnuk) {
      // --- ANUK: PHARAOH NEMES HEADDRESS & EYE OF HORUS ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -11, 10, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4.5, -10, 9, 1.5);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -7, 1.5, 5);
      ctx.fillRect(3.5, -7, 1.5, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-0.5, -12.5, 1.5, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, -12, 1, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, -7.5, 3, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
    } else if (isBalam) {
      // --- BALAM: JADE JAGUAR SKULL HELMET & QUETZAL CREST ---
      ctx.fillStyle = '#059669';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-4.5, -11, 9, 3);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-3, -13, 6, 2.5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1, -13.5, 2, 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -5, 1.2, 2);
      ctx.fillRect(2, -5, 1.2, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, -7.5, 2.5, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
    } else if (isKael) {
      // --- KAEL: VOLCANIC HORNED GLADIATOR HELMET ---
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-4.5, -10, 9, 6.5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-4, -11, 8, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-5.5, -12.5, 2, 3);
      ctx.fillRect(3.5, -12.5, 2, 3);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-5, -13, 1.5, 1.5);
      ctx.fillRect(3.5, -13, 1.5, 1.5);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-0.5, -7.5, 4, 1.6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0.5, -7.5, 2, 1);
    } else if (isVector) {
      // --- VECTOR: CYBERPUNK HUD SCANNER & TACTICAL HELM ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(-4.5, -11, 9, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -13, 1.5, 3);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(1, -12, 2.5, 1.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-0.5, -7.5, 4, 1.8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1.5, 1);
    } else if (isZizz) {
      // --- ZIZZ: KUNOICHI SILK COWL & SAKURA HAIR ---
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4.5, -12, 8, 3);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(2.5, -11.5, 2, 2);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(3, -11, 1, 1);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(0, -7.5, 2, 1.6);
      ctx.fillRect(3, -7.5, 2, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
      ctx.fillRect(4, -7.5, 1, 1);
    } else if (isBlizzard) {
      // --- BLIZZARD: GLACIAL FROST HOOD WITH FUR ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#f8fafc'; // White fur trim
      ctx.fillRect(-5, -11, 10, 3);
      ctx.fillRect(-5, -6, 2, 4);
      ctx.fillRect(3, -6, 2, 4);
      // Cyan Frost Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, -7.5, 3, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1.5, 1);
    } else if (isSteampunk) {
      // --- STEAMPUNK: BRASS GEAR HELMET & GOGGLES ---
      ctx.fillStyle = '#292524';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-4.5, -11.5, 9, 3);
      // Goggles
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -8, 3, 2.5);
      ctx.fillRect(2, -8, 3, 2.5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-1, -7.5, 1.5, 1.5);
      ctx.fillRect(3, -7.5, 1.5, 1.5);
    } else if (isCastle) {
      // --- CASTLE: ROYAL KNIGHT HELMET ---
      ctx.fillStyle = '#334155';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-4.5, -11.5, 9, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-1, -13, 2, 2.5); // Crest
      // Blue visor slit
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(0, -7.5, 3, 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
    } else if (isPirate) {
      // --- PIRATE: TRICORN HAT & EYEPATCH ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -10, 8, 6.5);
      // Tricorn hat
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-6, -12, 12, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1, -12, 2, 1.5); // Gold emblem
      // Eyepatch & Teal Eye
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(1, -7.5, 2, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1.5, -7.5, 1, 1);
    } else if (isJurassic) {
      // --- JURASSIC: RAPTOR BONE MASK ---
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#fef08a'; // Bone crown
      ctx.fillRect(-4.5, -11.5, 9, 3);
      // Amber slit
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(0, -7.5, 3, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
    } else if (isMoon) {
      // --- MOON: ASTRONAUT CHROME HELMET ---
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-4.5, -10.5, 9, 7);
      // Gold Solar Visor
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1, -8, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -7.5, 2, 1.5);
    } else {
      // --- ZION: ORIGINAL CYBER SHINOBI ---
      ctx.fillStyle = '#070b14';
      ctx.fillRect(-4, -10, 8, 6.5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, -10, 8, 2.2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1, -10, 2, 1.8);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, -7.5, 2, 1.6);
      ctx.fillRect(3, -7.5, 2, 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, -7.5, 1, 1);
      ctx.fillRect(4, -7.5, 1, 1);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-5.5, -12, 9, 3);
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(-4.5, -13.5, 7, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1, -14, 1.5, 1);
    }

    // Shinobi Scarf Collar Wrap
    ctx.fillStyle = scarfColor2;
    ctx.fillRect(-4.5, -4.5, 9, 2);
    ctx.fillStyle = scarfColor1;
    ctx.fillRect(-3.5, -3.5, 7, 1);

    // =========================================================================
    // E. ARMS & DISTINCT WEAPONS PER CHARACTER
    // =========================================================================
    if (isAttacking) {
      const combo = player.comboStep || 1;

      // Off-hand guard
      ctx.fillStyle = pauldronBase;
      ctx.fillRect(-5.5, -2, 2.5, 4.5);

      // Sword-wielding arm
      ctx.fillStyle = pauldronBase;
      ctx.fillRect(2, -3.5, 4.5, 3.5);
      ctx.fillStyle = bootsSole;
      ctx.fillRect(4.5, -4.5, 2, 2);

      // Grip / Hilt
      ctx.fillStyle = beltBuckle;
      ctx.fillRect(6.5, -3.5, 2.5, 2.5);

      const bladeLen = combo === 3 ? 17 : combo === 2 ? 14 : 12;
      const bladeY = combo === 2 ? -6.5 : combo === 3 ? -4.5 : -3.5;

      if (isAnuk) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
        ctx.fillRect(7.5, bladeY - 2, bladeLen + 2, 5);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(7.5, bladeY, bladeLen, 2.5);
        ctx.fillRect(7.5 + bladeLen - 2, bladeY - 3, 3, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else if (isBalam) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(7.5, bladeY - 1, bladeLen, 3.5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7.5, bladeY - 2.5, bladeLen, 1.5);
        ctx.fillRect(7.5, bladeY + 2.5, bladeLen, 1.5);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(9, bladeY, 2, 1.5);
        ctx.fillRect(13, bladeY, 2, 1.5);
      } else if (isKael) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.fillRect(7.5, bladeY - 2.5, bladeLen + 3, 6);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(7.5, bladeY - 1, bladeLen + 1, 3.5);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(8.5, bladeY, bladeLen - 2, 1.5);
      } else if (isZizz) {
        ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
        ctx.fillRect(7.5, bladeY - 1.5, bladeLen + 2, 4);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(7.5, bladeY, bladeLen, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.5, bladeY, bladeLen - 2, 1);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(6, bladeY + 3, bladeLen - 2, 1.5);
      } else if (isVector) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.fillRect(7.5, bladeY - 1.5, bladeLen + 2, 4);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(7.5, bladeY, bladeLen, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(8.5, bladeY, bladeLen - 2, 1);
      } else if (isBlizzard) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.fillRect(7.5, bladeY - 1.5, bladeLen + 2, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7.5, bladeY, bladeLen, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.5, bladeY, bladeLen - 2, 1);
      } else if (isSteampunk) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.fillRect(7.5, bladeY - 2, bladeLen + 2, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(7.5, bladeY, bladeLen, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else if (isCastle) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(7.5, bladeY - 2, bladeLen + 2, 5);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(7.5, bladeY, bladeLen, 3);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else if (isPirate) {
        ctx.fillStyle = 'rgba(20, 184, 166, 0.5)';
        ctx.fillRect(7.5, bladeY - 1.5, bladeLen + 2, 4);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(7.5, bladeY, bladeLen, 2.5);
        ctx.fillStyle = '#5eead4';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else if (isJurassic) {
        ctx.fillStyle = 'rgba(132, 204, 22, 0.5)';
        ctx.fillRect(7.5, bladeY - 2, bladeLen + 2, 5);
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(7.5, bladeY, bladeLen, 3);
        ctx.fillStyle = '#bef264';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else if (isMoon) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.55)';
        ctx.fillRect(7.5, bladeY - 2, bladeLen + 3, 5);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(7.5, bladeY, bladeLen, 2.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.5, bladeY + 0.5, bladeLen - 2, 1);
      } else {
        ctx.fillStyle = combo === 3 ? 'rgba(250, 204, 21, 0.65)' : 'rgba(34, 211, 238, 0.60)';
        ctx.fillRect(7.5, bladeY - 1.5, bladeLen + 2, 4.5);
        ctx.fillStyle = combo === 3 ? '#facc15' : '#22d3ee';
        ctx.fillRect(7.5, bladeY, bladeLen, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.5, bladeY, bladeLen - 2, 1);
      }
        } else if (isBlocking) {
      // Guard stance with crossed gauntlets
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, -3.5, 4.5, 5.5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(1, -2.5, 3.5, 3.5);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(2, -2.5, 2.5, 1.5);
    } else {
      // Idle / Running Stance — Ninjato Sheathed Diagonally on Back (Saya)
      // Left arm in athletic sprint swing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5.5, -2, 2.5, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-5.5, 1, 2.5, 2);

      // Right arm
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -2, 2.5, 5);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(2, 1, 2.5, 2);

      // Sleek Magnetic Scabbard (Saya) slung across back
      ctx.save();
      ctx.translate(-4, -6);
      ctx.rotate(-0.42); // 24 degree diagonal katana sling
      // Scabbard matte carbon body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1.2, -4, 3, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-0.8, -4, 2, 14);

      // Gold Sageo cord bindings
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-1.5, -2, 3.5, 1.2);
      ctx.fillRect(-1.5, 1.2, 3.5, 1.2);

      // Tsuba (Guard) & Tsuka (Hilt)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -5.2, 4.5, 1.4); // Gold tsuba disc
      ctx.fillStyle = '#475569';
      ctx.fillRect(-0.8, -8.2, 2.2, 3.2); // Wrapped grip
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-0.5, -9.2, 1.6, 1.4); // Cyan energy pommel
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -9.2, 0.8, 0.8);
      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // ZION: TRAJE BIÓNICO ORBITAL DE VUELO LIBRE (DOOMSDAY FLIGHT SUIT)
  // Masterpiece Super Sonic / Doomsday inspired omnidirectional space flight
  // =========================================================================
  private renderBionicFlightZion(player: Player, x: number, y: number, t: number) {
    const ctx = this.ctx;
    const isBoosting = player.isDashing || player.flightBoost;
    const isAttacking = player.isAttacking;
    const isBlocking = player.isBlocking;

    // Supersonic banking tilt based on vertical movement
    const bankAngle = (player.vy * 0.05) + (isBoosting ? 0.04 : 0.08);
    ctx.rotate(bankAngle);

    // 1. RADIANT SUPER DOOMSDAY ENERGY AURA (Pulsating Golden / Cyan Sphere)
    ctx.save();
    const auraPulse = Math.sin(t * 0.25) * 3;
    const auraR = (isBoosting ? 24 : 17) + auraPulse;
    const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, auraR);
    auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    auraGrad.addColorStop(0.3, isBoosting ? 'rgba(250, 204, 21, 0.65)' : 'rgba(56, 189, 248, 0.55)');
    auraGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.35)');
    auraGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, auraR, 0, Math.PI * 2);
    ctx.fill();

    // Supersonic Shockwave Cone Ring when boosting
    if (isBoosting) {
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(-4, 0, 8, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-10, 0, 12, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. DUAL BIONIC ION THRUSTERS (Mounted to back, firing backward)
    const flameLen = isBoosting ? 26 + Math.sin(t * 0.6) * 6 : 14 + Math.sin(t * 0.4) * 4;
    const thrusterOffset = 4;

    for (const dir of [-1, 1]) {
      const ty = dir * thrusterOffset;
      // Ion Jet Nozzle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, ty - 2.5, 4, 5);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-7, ty - 2, 2, 4);

      // Plasma Flame Plume
      const flameGrad = ctx.createLinearGradient(-8, ty, -8 - flameLen, ty);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.2, '#fde047');
      flameGrad.addColorStop(0.5, '#0ea5e9');
      flameGrad.addColorStop(0.85, isBoosting ? '#f43f5e' : '#a855f7');
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-8, ty - 2);
      ctx.lineTo(-8 - flameLen, ty);
      ctx.lineTo(-8, ty + 2);
      ctx.closePath();
      ctx.fill();
    }

    // 3. PHOTON ENERGY WINGS / BIONIC FINS (Extending from Jetpack)
    const wingSweep = isBoosting ? 0.35 : 0.2;
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.scale(1, dir);
      ctx.rotate(-wingSweep);

      // Main photon wing blade
      ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(-14, -18);
      ctx.lineTo(-6, -14);
      ctx.lineTo(-2, -4);
      ctx.closePath();
      ctx.fill();

      // Wing energy edge
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-12, -16, 2, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-13, -17, 1, 6);
      ctx.restore();
    }

    // 4. AERODYNAMIC STREAMLINED BIONIC FLIGHT SUIT (Horizontal Torso)
    // Dark Carbon Base Undersuit
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-6, -3, 14, 6);

    // Gleaming Golden Bionic Armor Plates (Chest & Pauldrons)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -4, 9, 3); // Upper chestplate
    ctx.fillRect(-3, 1, 9, 3);  // Lower armor plate
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-2, -3, 7, 1.5); // Golden metallic highlight
    ctx.fillRect(-2, 1.5, 7, 1.5);

    // Glowing Bionic Micro-Reactor Core
    const corePulse = Math.sin(t * 0.3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(56, 189, 248, ${corePulse})`;
    ctx.fillRect(1, -1.5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -0.5, 1, 1);

    // 5. AERODYNAMIC LEGS (Trailing Streamlined Behind)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, -2, 5, 2); // Left leg
    ctx.fillRect(-9, 0.5, 5, 2); // Right leg
    // Golden Tabi Boot Thrusters
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-11, -2, 2.5, 2);
    ctx.fillRect(-11, 0.5, 2.5, 2);
    // Micro thruster flame sparks from boots
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-13, -1.5, 2, 1);
    ctx.fillRect(-13, 1, 2, 1);

    // 6. FLIGHT HELMET & HOLOGRAPHIC CYAN VISOR
    // Golden flight cowl
    ctx.fillStyle = '#facc15';
    ctx.fillRect(3, -4, 6, 8);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(4, -5, 4, 1.5); // Aerodynamic crown crest
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(3, 2, 4, 2);   // Chin guard

    // Full Holographic HUD Visor (Glowing Cyan Wrap-around)
    const visorGlow = Math.sin(t * 0.2) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(34, 211, 238, ${visorGlow})`;
    ctx.fillRect(6, -3, 4, 4);
    // Reticle HUD glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, -2, 2, 2);

    // 7. ARMS & ENERGIZED BIONIC BLADE
    if (isAttacking) {
      // Forward thrusting / slashing bionic ninjato
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 1, 4, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(7, 2, 2, 2);

      // Massive Photonic Beam Blade
      const bladeLen = 18;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillRect(9, 1, bladeLen + 2, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(9, 2, bladeLen, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 2.5, bladeLen - 2, 1);

      // Forward Energy Arc shockwave
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(9 + bladeLen, 3, 6, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (isBlocking) {
      // Defensive gauntlet crossed barrier
      ctx.fillStyle = '#facc15';
      ctx.fillRect(5, -2, 3, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, -1, 2, 3);
    } else {
      // Sleek forward flight stance: right arm forward, blade charged alongside body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 1, 4, 2.5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(6, 1.5, 2, 2);

      // Charged Beam Blade running parallel forward
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(8, 2, 12, 2.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 2.5, 10, 1);
    }
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

      if (m.skin === 'zizz') {
        // Zizz: Dual Twin Astral Sakura Slashes
        ctx.fillStyle = m.combo === 3 ? '#ec4899' : '#f472b6';
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x, m.y + 8, 17, -Math.PI * 0.45, Math.PI * 0.45);
        } else {
          ctx.arc(x + 14, m.y + 8, 17, Math.PI * 0.55, Math.PI * 1.45);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbcfe8';
        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x - 3, m.y + 8, 12, -Math.PI * 0.35, Math.PI * 0.35);
        } else {
          ctx.arc(x + 17, m.y + 8, 12, Math.PI * 0.65, Math.PI * 1.35);
        }
        ctx.stroke();
      } else if (m.skin === 'kael') {
        // Kael: Heavy Volcanic Magma Eruption Cleave
        ctx.fillStyle = m.combo === 3 ? '#ef4444' : '#f97316';
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x, m.y + 8, 20, -Math.PI * 0.5, Math.PI * 0.5);
        } else {
          ctx.arc(x + 16, m.y + 8, 20, Math.PI * 0.5, Math.PI * 1.5);
        }
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + (m.facing > 0 ? 12 : -12), m.y + 4, 3, 3);
        ctx.fillRect(x + (m.facing > 0 ? 16 : -16), m.y + 12, 2.5, 2.5);
      } else if (m.skin === 'anuk') {
        // Anuk: Golden Solar Khopesh Arc
        ctx.fillStyle = m.combo === 3 ? '#ca8a04' : '#eab308';
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x, m.y + 8, 18, -Math.PI * 0.45, Math.PI * 0.45);
        } else {
          ctx.arc(x + 14, m.y + 8, 18, Math.PI * 0.55, Math.PI * 1.45);
        }
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();
        ctx.fill();

        // Golden sand dust sparks
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + (m.facing > 0 ? 14 : -14), m.y + 5, 2.5, 2.5);
      } else if (m.skin === 'vector') {
        // Vector: Electric Indigo Ion Nano-Blade Arc
        ctx.fillStyle = m.combo === 3 ? '#4338ca' : '#6366f1';
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x, m.y + 8, 17, -Math.PI * 0.4, Math.PI * 0.4);
        } else {
          ctx.arc(x + 14, m.y + 8, 17, Math.PI * 0.6, Math.PI * 1.4);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
        ctx.fill();

        // Digital data glitch sparks
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + (m.facing > 0 ? 13 : -13), m.y + 6, 2, 2);
      } else if (m.skin === 'balam') {
        // Balam: Emerald Jade Macuahuitl Cleave
        ctx.fillStyle = m.combo === 3 ? '#047857' : '#10b981';
        ctx.beginPath();
        if (m.facing > 0) {
          ctx.arc(x, m.y + 8, 19, -Math.PI * 0.48, Math.PI * 0.48);
        } else {
          ctx.arc(x + 15, m.y + 8, 19, Math.PI * 0.52, Math.PI * 1.48);
        }
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#34d399';
        ctx.stroke();
        ctx.fill();

        // Jungle leaves and amber sparks
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + (m.facing > 0 ? 14 : -14), m.y + 4, 3, 3);
      } else {
        // Zion default cyber plasma slash
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
      }
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
      ctx.globalAlpha = alpha * 0.8;

      if (s.skin === 'zizz') {
        // Astral Lotus Petal Burst (Expanding floral rings)
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fbcfe8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4 + s.radius * 0.05;
          const px = x + Math.cos(ang) * s.radius;
          const py = s.y + Math.sin(ang) * s.radius;
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(px - 2, py - 2, 4, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
        ctx.fillStyle = 'rgba(244, 114, 182, 0.16)';
        ctx.fill();
      } else if (s.skin === 'kael') {
        // Tectonic Magma Eruption Shockwave
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        const colH = s.radius * 0.9;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.fillRect(x - 14, s.y - colH, 28, colH * 2);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.fillRect(x - 5, s.y - colH, 10, colH * 2);
      } else if (s.skin === 'anuk') {
        // Anuk: Swirling Solar Sandstorm of Ra
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4 + s.radius * 0.08;
          const px = x + Math.cos(ang) * s.radius;
          const py = s.y + Math.sin(ang) * s.radius;
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
        ctx.fill();
      } else if (s.skin === 'vector') {
        // Vector: High-Voltage EMP Quantum Shockwave
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3 + s.radius * 0.06;
          const px = x + Math.cos(ang) * s.radius;
          const py = s.y + Math.sin(ang) * s.radius;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        ctx.fillStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.fill();
      } else if (s.skin === 'balam') {
        // Balam: Sacred Kukulkán Quetzal Cyclone
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4 + s.radius * 0.07;
          const px = x + Math.cos(ang) * s.radius;
          const py = s.y + Math.sin(ang) * s.radius;
          ctx.fillStyle = '#34d399';
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fill();
      } else {
        // Zion default cyber temporal sphere
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = s.color + '22';
        ctx.fill();
      }
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
