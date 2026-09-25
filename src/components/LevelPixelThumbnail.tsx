import React, { useEffect, useRef } from 'react';
import { ZoneId } from '../types';

interface LevelPixelThumbnailProps {
  zone: ZoneId;
  act: number;
  isLocked?: boolean;
  isBoss?: boolean;
  isUnderConstruction?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const LevelPixelThumbnail: React.FC<LevelPixelThumbnailProps> = ({
  zone,
  act,
  isLocked = false,
  isBoss = false,
  isUnderConstruction = false,
  width = 280,
  height = 150,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    // Deterministic random seed per zone/act for consistent natural details
    const seed = (zone.charCodeAt(0) * 17 + act * 31) % 1000;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;

      const underConstruction = isUnderConstruction || ['jurasicdraft', 'themoon'].includes(zone);

      // ========================================================
      // SPECIAL MODE: UNDER CONSTRUCTION / EN CONSTRUCCIÓN SCENE
      // ========================================================
      if (underConstruction) {
        // 1. Deep Blueprint Navy Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#09152b');
        bgGrad.addColorStop(0.6, '#060e1e');
        bgGrad.addColorStop(1, '#03070f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Blueprint Grid Lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        const gridSize = 14;
        for (let gx = 0; gx < w; gx += gridSize) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
          ctx.stroke();
        }
        for (let gy = 0; gy < h; gy += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }

        // 3. Construction Scaffolding (Left & Right Towers)
        const drawScaffold = (sx: number, sw: number) => {
          ctx.fillStyle = '#334155';
          ctx.fillRect(sx, 16, 4, h - 32);
          ctx.fillRect(sx + sw - 4, 16, 4, h - 32);
          // Horizontal platforms
          for (let py = 30; py < h - 20; py += 26) {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(sx - 2, py, sw + 4, 3);
            // Cross bracing
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx + 2, py);
            ctx.lineTo(sx + sw - 2, py + 26);
            ctx.moveTo(sx + sw - 2, py);
            ctx.lineTo(sx + 2, py + 26);
            ctx.stroke();
          }
        };
        drawScaffold(8, 36);
        drawScaffold(w - 44, 36);

        // 4. Heavy Construction Crane (Top Right)
        const craneX = w - 55;
        const craneY = 14;
        // Crane Vertical Mast
        ctx.fillStyle = '#eab308';
        ctx.fillRect(craneX, craneY, 8, 48);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(craneX + 2, craneY + 2, 4, 44);
        // Horizontal Jib Arm
        ctx.fillStyle = '#eab308';
        ctx.fillRect(craneX - 70, craneY, 90, 5);
        // Diagonal Cable
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(craneX + 4, craneY - 8);
        ctx.lineTo(craneX - 60, craneY + 2);
        ctx.moveTo(craneX + 4, craneY - 8);
        ctx.lineTo(craneX + 18, craneY + 2);
        ctx.stroke();
        // Crane Top Peak & Flashing Red Warning Light
        ctx.fillStyle = '#eab308';
        ctx.fillRect(craneX + 2, craneY - 8, 4, 8);
        const craneBeaconOn = Math.floor(tick / 15) % 2 === 0;
        ctx.fillStyle = craneBeaconOn ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(craneX + 4, craneY - 9, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Hanging Hoist Cable & Hook (sways slightly)
        const sway = Math.sin(tick * 0.05) * 4;
        const hookX = craneX - 45 + sway;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(craneX - 45, craneY + 5);
        ctx.lineTo(hookX, craneY + 36);
        ctx.stroke();
        // Steel Hook
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(hookX - 2, craneY + 36, 4, 4);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hookX, craneY + 42, 3.5, 0, Math.PI);
        ctx.stroke();

        // 5. Ground Foundation & Construction Site Terrain
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h - 22, w, 22);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h - 22, w, 2);

        // Stacked I-Beams on ground
        ctx.fillStyle = '#b45309';
        ctx.fillRect(20, h - 14, 28, 4);
        ctx.fillRect(22, h - 18, 24, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(20, h - 13, 28, 1);

        // Traffic Safety Cones
        const drawCone = (cx: number) => {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(cx, h - 20);
          ctx.lineTo(cx - 5, h - 8);
          ctx.lineTo(cx + 5, h - 8);
          ctx.closePath();
          ctx.fill();
          // White reflective band
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cx - 3, h - 15, 6, 2.5);
          // Black base
          ctx.fillStyle = '#18181b';
          ctx.fillRect(cx - 6, h - 8, 12, 2);
        };
        drawCone(62);
        drawCone(w - 68);

        // 6. Centered Heavy Industrial Hazard Barrier
        const bx = Math.floor(w / 2 - 58);
        const by = Math.floor(h / 2 - 18);
        const bw = 116;
        const bh = 34;

        // Wooden Support Legs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx + 12, by + bh - 2, 6, 18);
        ctx.fillRect(bx + bw - 18, by + bh - 2, 6, 18);

        // Main Barrier Plaque Backdrop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Diagonal Yellow & Black Warning Stripes (Hazard Tape)
        const stripeW = 8;
        ctx.save();
        ctx.beginPath();
        ctx.rect(bx + 1, by + 1, bw - 2, bh - 2);
        ctx.clip();
        for (let sx = bx - 20; sx < bx + bw + 20; sx += stripeW * 2) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.22)';
          ctx.beginPath();
          ctx.moveTo(sx, by);
          ctx.lineTo(sx + stripeW, by);
          ctx.lineTo(sx + stripeW - 14, by + bh);
          ctx.lineTo(sx - 14, by + bh);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Pulsing Warning Beacon on Top of Barrier
        const beaconPulsing = Math.sin(tick * 0.12) > -0.2;
        const beaconX = Math.floor(w / 2);
        const beaconY = by - 5;
        // Mount
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(beaconX - 4, beaconY + 1, 8, 4);
        // Amber Lamp
        ctx.fillStyle = beaconPulsing ? '#fbbf24' : '#b45309';
        ctx.beginPath();
        ctx.arc(beaconX, beaconY - 1, 4.5, 0, Math.PI * 2);
        ctx.fill();
        if (beaconPulsing) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
          ctx.beginPath();
          ctx.arc(beaconX, beaconY - 1, 11, 0, Math.PI * 2);
          ctx.fill();
        }

        // Text Badge inside Barrier
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EN CONSTRUCCIÓN', Math.floor(w / 2), by + 15);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('ZONA EN DESARROLLO', Math.floor(w / 2), by + 26);

        // 7. Top & Bottom Caution Hazard Border Stripes
        const tapeH = 4;
        const drawHazardTape = (ty: number) => {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, ty, w, tapeH);
          ctx.fillStyle = '#eab308';
          for (let tx = -tapeH; tx < w + tapeH; tx += tapeH * 2) {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + tapeH, ty);
            ctx.lineTo(tx + tapeH - 4, ty + tapeH);
            ctx.lineTo(tx - 4, ty + tapeH);
            ctx.closePath();
            ctx.fill();
          }
        };
        drawHazardTape(0);
        drawHazardTape(h - tapeH);

        // Request next animation frame for the under-construction preview
        animId = requestAnimationFrame(render);
        return;
      }

      // ==========================================
      // 1. SKY & ATMOSPHERE GRADIENTS
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (zone === 'neon') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#020617');
          skyGrad.addColorStop(0.35, '#082f49');
          skyGrad.addColorStop(0.75, '#0e7490');
          skyGrad.addColorStop(1, '#06b6d4');
        } else if (act === 2) {
          skyGrad.addColorStop(0, '#021812');
          skyGrad.addColorStop(0.4, '#064e3b');
          skyGrad.addColorStop(0.75, '#059669');
          skyGrad.addColorStop(1, '#10b981');
        } else {
          skyGrad.addColorStop(0, '#0f051d');
          skyGrad.addColorStop(0.4, '#2e1065');
          skyGrad.addColorStop(0.75, '#581c87');
          skyGrad.addColorStop(1, '#06b6d4');
        }
      } else if (zone === 'sakura') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#2b0629');
          skyGrad.addColorStop(0.4, '#701a75');
          skyGrad.addColorStop(0.75, '#be185d');
          skyGrad.addColorStop(1, '#fb7185');
        } else if (act === 2) {
          skyGrad.addColorStop(0, '#0f0c29');
          skyGrad.addColorStop(0.4, '#302b63');
          skyGrad.addColorStop(0.75, '#4c1d95');
          skyGrad.addColorStop(1, '#c084fc');
        } else {
          skyGrad.addColorStop(0, '#180512');
          skyGrad.addColorStop(0.4, '#4c0519');
          skyGrad.addColorStop(0.8, '#9f1239');
          skyGrad.addColorStop(1, '#fda4af');
        }
      } else if (zone === 'lavacliff') {
        skyGrad.addColorStop(0, '#150202');
        skyGrad.addColorStop(0.35, '#450a0a');
        skyGrad.addColorStop(0.7, '#991b1b');
        skyGrad.addColorStop(1, '#ea580c');
      } else if (zone === 'desert') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#451a03');
          skyGrad.addColorStop(0.35, '#9a3412');
          skyGrad.addColorStop(0.7, '#d97706');
          skyGrad.addColorStop(1, '#fde047');
        } else if (act === 2) {
          skyGrad.addColorStop(0, '#1c1917');
          skyGrad.addColorStop(0.35, '#78350f');
          skyGrad.addColorStop(0.7, '#b45309');
          skyGrad.addColorStop(1, '#fbbf24');
        } else {
          skyGrad.addColorStop(0, '#1e1b4b');
          skyGrad.addColorStop(0.4, '#3b0764');
          skyGrad.addColorStop(0.75, '#9a3412');
          skyGrad.addColorStop(1, '#f59e0b');
        }
      } else if (zone === 'krono') {
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.35, '#090d24');
        skyGrad.addColorStop(0.7, '#1e1b4b');
        skyGrad.addColorStop(1, '#3b0764');
      } else if (zone === 'jungle') {
        skyGrad.addColorStop(0, '#0369a1');
        skyGrad.addColorStop(0.35, '#0284c7');
        skyGrad.addColorStop(0.65, '#059669');
        skyGrad.addColorStop(1, '#34d399');
      } else if (zone === 'blizzard') {
        skyGrad.addColorStop(0, '#082f49');
        skyGrad.addColorStop(0.35, '#0c4a6e');
        skyGrad.addColorStop(0.7, '#0284c7');
        skyGrad.addColorStop(1, '#e0f2fe');
      } else if (zone === 'steampunk') {
        skyGrad.addColorStop(0, '#1c1208');
        skyGrad.addColorStop(0.35, '#78350f');
        skyGrad.addColorStop(0.65, '#b45309');
        skyGrad.addColorStop(0.88, '#f59e0b');
        skyGrad.addColorStop(1, '#fef08a');
      } else if (zone === 'castlesmash') {
        if (act === 1) {
          // Act 1: Dusky Twilight Siege Sky with Amber Torch Fire Horizon
          skyGrad.addColorStop(0, '#090d16');
          skyGrad.addColorStop(0.32, '#1e1b4b');
          skyGrad.addColorStop(0.65, '#451a03');
          skyGrad.addColorStop(0.85, '#9a3412');
          skyGrad.addColorStop(1, '#f59e0b');
        } else if (act === 2) {
          // Act 2: Midnight Thunder Fortress Sky with Iron Blue Slate
          skyGrad.addColorStop(0, '#020617');
          skyGrad.addColorStop(0.35, '#0f172a');
          skyGrad.addColorStop(0.7, '#1e293b');
          skyGrad.addColorStop(1, '#475569');
        } else {
          // Act 3: Warlord Throne Keep with Apocalyptic Crimson & Molten Gold
          skyGrad.addColorStop(0, '#18040a');
          skyGrad.addColorStop(0.35, '#4c0519');
          skyGrad.addColorStop(0.7, '#881337');
          skyGrad.addColorStop(0.9, '#b45309');
          skyGrad.addColorStop(1, '#f59e0b');
        }
      } else if (zone === 'piratestreasure') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#0284c7');
          skyGrad.addColorStop(0.4, '#38bdf8');
          skyGrad.addColorStop(0.75, '#7dd3fc');
          skyGrad.addColorStop(1, '#fde047');
        } else if (act === 2) {
          skyGrad.addColorStop(0, '#0369a1');
          skyGrad.addColorStop(0.35, '#075985');
          skyGrad.addColorStop(0.7, '#0c4a6e');
          skyGrad.addColorStop(1, '#021e30');
        } else {
          skyGrad.addColorStop(0, '#021e30');
          skyGrad.addColorStop(0.4, '#082f49');
          skyGrad.addColorStop(0.75, '#042f2e');
          skyGrad.addColorStop(1, '#020617');
        }
      } else {
        // travel
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.3, '#1e1b4b');
        skyGrad.addColorStop(0.65, '#4338ca');
        skyGrad.addColorStop(1, '#06b6d4');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // ==========================================
      // 2. CELESTIAL BODIES & ATMOSPHERIC PHENOMENA
      // ==========================================
      if (zone === 'neon') {
        // Neon Horizon Synth Grid
        const gridY = h - 45;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= w; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(gx, gridY);
          ctx.lineTo(w / 2 + (gx - w / 2) * 1.8, h);
          ctx.stroke();
        }
        for (let gy = gridY; gy <= h; gy += 8) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }

        // Cyber Crescent Moon with Glowing Rings
        const moonX = w - 48;
        const moonY = 32;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#082f49';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 3, 13, 0, Math.PI * 2);
        ctx.fill();

        // Neon star sparkles
        for (let i = 0; i < 6; i++) {
          const sx = (i * 45 + 15) % (w - 70);
          const sy = (i * 18 + 10) % 40;
          const sPulse = Math.sin(tick * 0.1 + i) > 0.3;
          ctx.fillStyle = sPulse ? '#67e8f9' : 'rgba(103, 232, 249, 0.3)';
          ctx.fillRect(sx, sy, 2, 2);
        }
      } else if (zone === 'sakura') {
        // Blood Moon / Golden Full Moon
        const moonX = w - 50;
        const moonY = 36;
        const moonColor = act === 1 ? '#fecdd3' : '#f43f5e';

        // Outer glow
        ctx.fillStyle = `${moonColor}25`;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Moon disk
        ctx.fillStyle = moonColor;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters
        ctx.fillStyle = act === 1 ? '#fda4af' : '#be123c';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 4, 5, 0, Math.PI * 2);
        ctx.arc(moonX + 7, moonY + 3, 3.5, 0, Math.PI * 2);
        ctx.arc(moonX - 2, moonY + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Distant stars
        for (let i = 0; i < 8; i++) {
          const sx = (i * 37 + seed) % (w - 80);
          const sy = (i * 14 + 8) % 45;
          ctx.fillStyle = 'rgba(254, 205, 211, 0.7)';
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      } else if (zone === 'lavacliff') {
        // Red giant sun half obscured by volcanic smoke
        ctx.fillStyle = 'rgba(234, 88, 12, 0.25)';
        ctx.beginPath();
        ctx.arc(w / 2, 45, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(w / 2, 45, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w / 2, 45, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'desert') {
        // Radiant Blazing Sun with Solar Ray Prisms
        const sunX = 52;
        const sunY = 32;

        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
        ctx.fill();

        // Solar flare rays
        const rLen = 28 + Math.sin(tick * 0.08) * 4;
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(a) * 22, sunY + Math.sin(a) * 22);
          ctx.lineTo(sunX + Math.cos(a) * rLen, sunY + Math.sin(a) * rLen);
          ctx.stroke();
        }
      } else if (zone === 'krono') {
        // Holographic Chrono Matrix Clock Gear in Sky
        const gearX = w - 55;
        const gearY = 38;
        const gearRot = tick * 0.02;

        ctx.save();
        ctx.translate(gearX, gearY);
        ctx.rotate(gearRot);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        // Gear cogs
        for (let g = 0; g < 8; g++) {
          const ang = (g * Math.PI) / 4;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.fillRect(Math.cos(ang) * 23 - 2, Math.sin(ang) * 23 - 2, 4, 4);
        }

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (zone === 'jungle') {
        // Tropical Golden Sunbeam
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w - 50, 30, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.beginPath();
        ctx.arc(w - 50, 30, 30, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'blizzard') {
        // Aurora Borealis multi-band ribbon waves
        const aWave1 = Math.sin(tick * 0.04) * 6;
        const aWave2 = Math.cos(tick * 0.05) * 5;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, 20 + aWave1);
        ctx.bezierCurveTo(w * 0.35, 8 - aWave2, w * 0.65, 28 + aWave1, w, 14 - aWave2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 28 - aWave2);
        ctx.bezierCurveTo(w * 0.3, 16 + aWave1, w * 0.7, 34 - aWave2, w, 22 + aWave1);
        ctx.stroke();

        // Pale Winter Moon
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w - 44, 25, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(w - 44, 25, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'steampunk') {
        // Rotating Clockwork Brass Gear-Sun & Victorian Chimney Steam
        const gSunX = w - 46;
        const gSunY = 26;
        const radius = 15;
        ctx.save();
        ctx.translate(gSunX, gSunY);
        ctx.rotate(tick * 0.02);
        // Teeth
        ctx.fillStyle = '#b45309';
        for (let t = 0; t < 8; t++) {
          ctx.save();
          ctx.rotate((t / 8) * Math.PI * 2);
          ctx.fillRect(-2, -radius - 3, 4, 4);
          ctx.restore();
        }
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Smokestack & Steam
        ctx.fillStyle = '#291508';
        ctx.fillRect(26, 34, 12, 40);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(24, 32, 16, 3);
        // Steam clouds
        for (let s = 0; s < 4; s++) {
          const sy = 26 - s * 8;
          ctx.fillStyle = `rgba(255, 247, 237, ${0.7 - s * 0.15})`;
          ctx.beginPath();
          ctx.arc(32 + Math.sin(tick * 0.08 + s) * 3, sy, 4 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (zone === 'castlesmash') {
        // Medieval Fortress Harvest / Blood Moon
        const cMoonX = w - 44;
        const cMoonY = 25;
        const isAct3 = act === 3;
        // Moon Outer Radiant Aura
        ctx.fillStyle = isAct3 ? 'rgba(239, 68, 68, 0.22)' : 'rgba(245, 158, 11, 0.2)';
        ctx.beginPath();
        ctx.arc(cMoonX, cMoonY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Moon Body
        ctx.fillStyle = isAct3 ? '#fca5a5' : '#fef08a';
        ctx.beginPath();
        ctx.arc(cMoonX, cMoonY, 13, 0, Math.PI * 2);
        ctx.fill();

        // Moon Shadow / Lunar Maria Craters
        ctx.fillStyle = isAct3 ? '#b91c1c' : '#d97706';
        ctx.fillRect(cMoonX - 5, cMoonY - 3, 3, 3);
        ctx.fillRect(cMoonX + 2, cMoonY + 1, 4, 3);
        ctx.fillRect(cMoonX - 2, cMoonY + 4, 2, 2);

        // Flapping Bats silhouettes drifting across the dusky sky
        for (let b = 0; b < 3; b++) {
          const bx = 36 + b * 48 + Math.sin(tick * 0.05 + b) * 8;
          const by = 20 + b * 10 + Math.cos(tick * 0.07 + b) * 4;
          const wing = (tick + b * 4) % 12 < 6 ? -1 : 1;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx, by, 3, 2);
          ctx.fillRect(bx - 2, by + wing, 2, 1);
          ctx.fillRect(bx + 3, by + wing, 2, 1);
        }

        // Distant siege catapult fiery smoke streak in Act 1 & 3
        if (act !== 2) {
          const smokeX = ((tick * 1.2) % (w + 40)) - 20;
          const arcY = 16 + Math.sin((smokeX / w) * Math.PI) * -10;
          ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
          ctx.fillRect(smokeX, arcY, 3, 3);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
          ctx.fillRect(smokeX + 1, arcY + 1, 1.5, 1.5);
        }
      } else if (zone === 'piratestreasure') {
        if (act === 1) {
          // Caribbean Golden Sun
          const sunX = w - 44;
          const sunY = 24;
          ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
          ctx.beginPath();
          ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
          ctx.fill();
        } else if (act === 2) {
          // Underwater light shafts & bubbles
          ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
          ctx.beginPath();
          ctx.moveTo(w - 60, 0);
          ctx.lineTo(w - 30, 0);
          ctx.lineTo(w - 10, h);
          ctx.lineTo(w - 50, h);
          ctx.closePath();
          ctx.fill();
        } else {
          // Bioluminescent ocean abyss glow
          ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
          ctx.beginPath();
          ctx.arc(w - 40, 30, 22, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Quantum Hyperspace Spiral Void (Travel)
        const rot = tick * 0.03;
        ctx.save();
        ctx.translate(w / 2, 40);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 1.6);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI * 0.5, Math.PI * 2.2);
        ctx.stroke();
        ctx.restore();
      }

      // ==========================================
      // 3. DETAILED BACKGROUND SILHOUETTES & STRUCTURES
      // ==========================================
      if (zone === 'neon') {
        // Distant Cyber Mountains
        ctx.fillStyle = '#051824';
        ctx.beginPath();
        ctx.moveTo(0, h - 45);
        ctx.lineTo(35, h - 82);
        ctx.lineTo(80, h - 48);
        ctx.lineTo(135, h - 96);
        ctx.lineTo(190, h - 45);
        ctx.lineTo(240, h - 80);
        ctx.lineTo(w, h - 50);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Neon Digital Pine Forest (Midground)
        ctx.fillStyle = '#082f49';
        for (let px = 15; px < w; px += 32) {
          const treeH = 34 + ((px * 7) % 20);
          ctx.fillRect(px + 4, h - 45 - treeH, 3, treeH);
          // Foliage tiers
          ctx.fillRect(px - 4, h - 45 - treeH + 6, 11, 4);
          ctx.fillRect(px - 7, h - 45 - treeH + 13, 17, 4);
          ctx.fillRect(px - 9, h - 45 - treeH + 20, 21, 4);

          // Glowing tip
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(px + 4, h - 45 - treeH - 1, 3, 2);
          ctx.fillStyle = '#082f49';
        }

        // Holographic Cyber Billboard ("KRONO")
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(20, h - 86, 42, 18);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, h - 86, 42, 18);
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('NEO-0' + act, 24, h - 74);
      } else if (zone === 'sakura') {
        // Distant Mountains & Pagoda
        ctx.fillStyle = '#240822';
        // Mountains
        ctx.beginPath();
        ctx.moveTo(0, h - 45);
        ctx.lineTo(40, h - 80);
        ctx.lineTo(95, h - 45);
        ctx.lineTo(160, h - 90);
        ctx.lineTo(220, h - 45);
        ctx.lineTo(w, h - 65);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Traditional Japanese Pagoda
        const pagX = 35;
        const pagBase = h - 46;
        ctx.fillStyle = '#1c051a';
        ctx.fillRect(pagX + 8, pagBase - 52, 14, 52); // Pagoda tower

        // Pagoda roofs with upturned curved eaves
        ctx.fillStyle = '#831843';
        ctx.fillRect(pagX + 2, pagBase - 50, 26, 4);
        ctx.fillRect(pagX + 4, pagBase - 36, 22, 4);
        ctx.fillRect(pagX + 6, pagBase - 22, 18, 4);
        ctx.fillRect(pagX + 13, pagBase - 58, 4, 8); // Finial spire

        // Shoji Windows with warm glow
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(pagX + 11, pagBase - 45, 3, 4);
        ctx.fillRect(pagX + 16, pagBase - 45, 3, 4);
        ctx.fillRect(pagX + 11, pagBase - 31, 3, 4);
        ctx.fillRect(pagX + 16, pagBase - 31, 3, 4);

        // Crimson Torii Gate (Right)
        const toriiX = w - 62;
        const toriiY = h - 46;
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(toriiX, toriiY - 42, 5, 42); // Left pillar
        ctx.fillRect(toriiX + 28, toriiY - 42, 5, 42); // Right pillar
        // Top lintels with traditional curved roof beam
        ctx.fillRect(toriiX - 7, toriiY - 44, 47, 5);
        ctx.fillStyle = '#1e1b4b'; // Black top trim
        ctx.fillRect(toriiX - 8, toriiY - 46, 49, 2);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(toriiX - 3, toriiY - 36, 39, 3); // Secondary beam

        // Cherry Blossom Branch (Top Left Corner)
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(28, 12, 55, 18);
        ctx.stroke();

        ctx.fillStyle = '#fbcfe8';
        for (let b = 0; b < 10; b++) {
          const bx = 12 + b * 5;
          const by = 8 + (b % 3) * 4;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Drifting Sakura Petals in Wind
        for (let p = 0; p < 9; p++) {
          const px = (tick * 0.9 + p * 34) % (w + 20);
          const py = (tick * 0.6 + p * 21 + Math.sin(tick * 0.05 + p) * 8) % (h - 35);
          ctx.fillStyle = p % 2 === 0 ? '#fbcfe8' : '#fda4af';
          ctx.fillRect(px, py, 3, 2);
        }
      } else if (zone === 'lavacliff') {
        // Volcanic Caldera & Ash Smoke
        ctx.fillStyle = '#1c0505';
        ctx.beginPath();
        ctx.moveTo(0, h - 45);
        ctx.lineTo(60, h - 88);
        ctx.lineTo(100, h - 72); // Crater throat
        ctx.lineTo(140, h - 92);
        ctx.lineTo(210, h - 48);
        ctx.lineTo(w, h - 55);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Molten Magma in crater
        ctx.fillStyle = '#f97316';
        ctx.fillRect(82, h - 75, 36, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(92, h - 73, 16, 4);

        // Lava river cascading down obsidian rocks
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(98, h - 67, 5, 24);
        ctx.fillRect(95, h - 55, 10, 4);

        // Rising Eruption Smoke Puffs
        for (let sm = 0; sm < 4; sm++) {
          const smX = 100 + Math.sin(tick * 0.06 + sm) * 12;
          const smY = h - 85 - ((tick * 0.8 + sm * 18) % 65);
          const smSize = 8 + sm * 3;
          ctx.fillStyle = 'rgba(69, 10, 10, 0.65)';
          ctx.beginPath();
          ctx.arc(smX, smY, smSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fire sparks floating upward
        for (let sp = 0; sp < 8; sp++) {
          const sx = 70 + ((tick * 1.2 + sp * 24) % 90);
          const sy = h - 45 - ((tick * 1.4 + sp * 19) % 75);
          ctx.fillStyle = sp % 2 === 0 ? '#fde047' : '#ea580c';
          ctx.fillRect(sx, sy, 2, 2);
        }
      } else if (zone === 'desert') {
        // Sand Dunes & Egyptian Pyramids
        ctx.fillStyle = '#5c2204'; // Distant dunes
        ctx.beginPath();
        ctx.moveTo(0, h - 45);
        ctx.quadraticCurveTo(w * 0.25, h - 65, w * 0.55, h - 45);
        ctx.quadraticCurveTo(w * 0.8, h - 60, w, h - 45);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Great Pyramid (with lit side and shaded side)
        const pyrX = 115;
        const pyrPeakY = h - 88;
        const pyrBaseY = h - 45;

        // Shaded side
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(pyrX, pyrPeakY);
        ctx.lineTo(pyrX + 62, pyrBaseY);
        ctx.lineTo(pyrX + 12, pyrBaseY);
        ctx.fill();

        // Sunlit side
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(pyrX, pyrPeakY);
        ctx.lineTo(pyrX - 52, pyrBaseY);
        ctx.lineTo(pyrX + 12, pyrBaseY);
        ctx.fill();

        // Gleaming Gold Capstone (Electrum)
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(pyrX, pyrPeakY);
        ctx.lineTo(pyrX - 10, pyrPeakY + 12);
        ctx.lineTo(pyrX + 11, pyrPeakY + 12);
        ctx.fill();

        // Capstone gleam sparkle
        if ((tick % 40) < 15) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pyrX - 1, pyrPeakY + 2, 3, 3);
        }

        // Distant Second Pyramid (Smaller)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(w - 75, h - 72);
        ctx.lineTo(w - 110, h - 45);
        ctx.lineTo(w - 40, h - 45);
        ctx.fill();

        // Ancient Obelisk on left
        ctx.fillStyle = '#92400e';
        ctx.fillRect(22, h - 74, 7, 29);
        // Pyramidion top
        ctx.beginPath();
        ctx.moveTo(25.5, h - 80);
        ctx.lineTo(22, h - 74);
        ctx.lineTo(29, h - 74);
        ctx.fill();
        // Glowing glyph on obelisk
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(24, h - 68, 3, 4);
        ctx.fillRect(24, h - 60, 3, 4);

        // Drifting Sand Grains
        for (let d = 0; d < 7; d++) {
          const dx = (tick * 1.2 + d * 40) % w;
          const dy = h - 48 - (d * 5) % 35;
          ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
          ctx.fillRect(dx, dy, 2, 1.5);
        }
      } else if (zone === 'krono') {
        // Multi-layered Cyberpunk Skyscraper Skyline
        const towers = [
          { x: 12, w: 28, h: 76, color: '#0f172a' },
          { x: 46, w: 36, h: 96, color: '#111827' },
          { x: 88, w: 26, h: 68, color: '#0f172a' },
          { x: 120, w: 42, h: 104, color: '#1e1b4b' },
          { x: 168, w: 32, h: 84, color: '#0f172a' },
          { x: 206, w: 48, h: 92, color: '#111827' },
        ];

        for (const t of towers) {
          ctx.fillStyle = t.color;
          ctx.fillRect(t.x, h - t.h, t.w, t.h);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(t.x, h - t.h, t.w, t.h);

          // Roof antenna with flashing light
          ctx.strokeStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(t.x + t.w / 2, h - t.h);
          ctx.lineTo(t.x + t.w / 2, h - t.h - 10);
          ctx.stroke();

          ctx.fillStyle = (tick + t.x) % 30 < 15 ? '#ef4444' : '#06b6d4';
          ctx.fillRect(t.x + t.w / 2 - 1, h - t.h - 11, 3, 3);

          // Grid of Lit Windows
          for (let wy = h - t.h + 8; wy < h - 46; wy += 9) {
            for (let wx = t.x + 4; wx < t.x + t.w - 5; wx += 6) {
              if ((wx * 3 + wy + tick * 0.05) % 5 > 1.8) {
                ctx.fillStyle = (wx + wy) % 2 === 0 ? '#38bdf8' : '#e879f9';
                ctx.fillRect(wx, wy, 3, 4);
              }
            }
          }
        }
      } else if (zone === 'jungle') {
        // Layer 1: Dense Rainforest Canopy
        ctx.fillStyle = '#064e3b';
        for (let j = -10; j <= w + 20; j += 28) {
          ctx.beginPath();
          ctx.arc(j, h - 45, 24, Math.PI, 0);
          ctx.fill();
        }

        // Layer 2: Ancient Stepped Mayan Temple
        const pyrX = Math.round(w * 0.52);
        ctx.fillStyle = '#047857';
        ctx.fillRect(pyrX - 42, h - 60, 84, 15);
        ctx.fillRect(pyrX - 32, h - 74, 64, 15);
        ctx.fillRect(pyrX - 22, h - 87, 44, 14);
        ctx.fillRect(pyrX - 12, h - 98, 24, 12); // Top shrine

        // Temple shrine entrance with warm torchlight
        ctx.fillStyle = '#022c22';
        ctx.fillRect(pyrX - 5, h - 94, 10, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pyrX - 3, h - 92, 6, 6);

        // Ancient Mayan Staircase running down the center
        ctx.fillStyle = '#065f46';
        ctx.fillRect(pyrX - 6, h - 87, 12, 42);

        // Cascading Waterfall (Right)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(w - 48, h - 68, 12, 24);
        ctx.fillStyle = '#e0f2fe';
        for (let wf = 0; wf < 3; wf++) {
          const wfy = h - 68 + ((tick * 1.5 + wf * 8) % 24);
          ctx.fillRect(w - 47 + wf * 3, wfy, 2, 4);
        }

        // Glowing Jungle Fireflies
        for (let f = 0; f < 6; f++) {
          const fx = (f * 45 + Math.sin(tick * 0.08 + f) * 12) % w;
          const fy = h - 50 - ((f * 15 + Math.cos(tick * 0.07 + f) * 10) % 45);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(fx, fy, 2, 2);
        }
      } else if (zone === 'blizzard') {
        // Jagged Snow-capped Alpine Mountain Ridges
        ctx.fillStyle = '#075985';
        ctx.beginPath();
        ctx.moveTo(0, h - 45);
        ctx.lineTo(45, h - 85);
        ctx.lineTo(95, h - 52);
        ctx.lineTo(155, h - 98);
        ctx.lineTo(215, h - 48);
        ctx.lineTo(w, h - 75);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Pristine White Snow Caps
        ctx.fillStyle = '#f8fafc';
        // Mountain 1 cap
        ctx.beginPath();
        ctx.moveTo(35, h - 75);
        ctx.lineTo(45, h - 85);
        ctx.lineTo(55, h - 75);
        ctx.closePath();
        ctx.fill();
        // Mountain 2 cap
        ctx.beginPath();
        ctx.moveTo(142, h - 86);
        ctx.lineTo(155, h - 98);
        ctx.lineTo(168, h - 86);
        ctx.closePath();
        ctx.fill();

        // Snow-covered Pine Trees (Midground)
        ctx.fillStyle = '#0369a1';
        for (let sp = 20; sp < w; sp += 36) {
          ctx.beginPath();
          ctx.moveTo(sp, h - 72);
          ctx.lineTo(sp - 8, h - 46);
          ctx.lineTo(sp + 8, h - 46);
          ctx.fill();

          // Snow on branches
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sp - 6, h - 52, 12, 2);
          ctx.fillRect(sp - 4, h - 60, 8, 2);
          ctx.fillStyle = '#0369a1';
        }

        // Swirling Snowfall Particles
        for (let s = 0; s < 14; s++) {
          const sx = (s * 22 + tick * 1.1) % (w + 10);
          const sy = (s * 13 + tick * 1.5) % (h - 20);
          ctx.fillStyle = s % 3 === 0 ? '#ffffff' : '#bae6fd';
          ctx.fillRect(sx, sy, 2, 2);
        }
      } else if (zone === 'steampunk') {
        // Victorian Industrial Factory Gables, Sawtooth Rooflines, Interlocking Cogs
        ctx.fillStyle = '#1e0f06';
        ctx.beginPath();
        ctx.moveTo(0, h - 34);
        for (let gx = 0; gx <= w + 30; gx += 26) {
          ctx.lineTo(gx, h - 52);
          ctx.lineTo(gx + 16, h - 70);
          ctx.lineTo(gx + 16, h - 52);
        }
        ctx.lineTo(w, h - 34);
        ctx.fill();

        // Factory Glowing Arched Windows
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
        for (let wx = 12; wx < w; wx += 26) {
          ctx.fillRect(wx, h - 48, 5, 8);
        }

        // Copper Conduit Pipe & Rotating Cog
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(0, h - 42, w, 4);
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(0, h - 41, w, 1.5);
      } else if (zone === 'castlesmash') {
        // Grand Gothic Bastion, Watchtowers, Conical Spired Roofs & Crenellated Parapets
        ctx.fillStyle = '#0b0f19'; // Deep stone silhouette

        // Distant Curtain Wall with Crenellations
        ctx.fillRect(0, h - 56, w, 22);
        for (let cx = 0; cx < w; cx += 14) {
          ctx.fillRect(cx, h - 61, 7, 5); // Crenels
        }

        // Left Watchtower with Conical Spire
        const tw1X = 22;
        ctx.fillRect(tw1X, h - 78, 22, 44);
        // Conical roof
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(tw1X - 2, h - 78);
        ctx.lineTo(tw1X + 11, h - 96);
        ctx.lineTo(tw1X + 24, h - 78);
        ctx.closePath();
        ctx.fill();
        // Spire flag / pennant flapping
        const fWave1 = Math.sin(tick * 0.15) * 3;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(tw1X + 11, h - 96);
        ctx.lineTo(tw1X + 22 + fWave1, h - 94);
        ctx.lineTo(tw1X + 11, h - 90);
        ctx.closePath();
        ctx.fill();

        // Central Mighty Keep (Throne Tower)
        const keepX = Math.floor(w * 0.44);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(keepX - 25, h - 86, 50, 52);
        // Keep Crenellations
        for (let kx = keepX - 25; kx < keepX + 25; kx += 10) {
          ctx.fillRect(kx, h - 91, 5, 5);
        }
        // Grand Royal Keep Banner
        const fWave2 = Math.sin(tick * 0.15 + 1) * 4;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(keepX - 1, h - 104, 2, 18); // Pole
        ctx.fillStyle = act === 3 ? '#ef4444' : '#f59e0b'; // Heraldic lion banner
        ctx.beginPath();
        ctx.moveTo(keepX + 1, h - 104);
        ctx.lineTo(keepX + 16 + fWave2, h - 99);
        ctx.lineTo(keepX + 1, h - 94);
        ctx.closePath();
        ctx.fill();

        // Right Sentry Tower with Arched Machicolations
        const tw2X = w - 46;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(tw2X, h - 74, 24, 40);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(tw2X - 2, h - 74);
        ctx.lineTo(tw2X + 12, h - 92);
        ctx.lineTo(tw2X + 26, h - 74);
        ctx.closePath();
        ctx.fill();

        // Glowing Gothic Stained-Glass & Arrow-Slit Windows
        ctx.fillStyle = act === 3 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.65)';
        // Keep large central arched window
        ctx.fillRect(keepX - 5, h - 74, 10, 16);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(keepX - 2, h - 70, 4, 8);

        // Arrow slits on towers
        ctx.fillStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.fillRect(tw1X + 9, h - 70, 3, 9);
        ctx.fillRect(tw2X + 10, h - 66, 3, 9);

        // Timber Scaffolding / Drawbridge Winch Posts
        ctx.fillStyle = '#78350f';
        ctx.fillRect(keepX + 28, h - 58, 2, 24);
        ctx.fillRect(keepX + 40, h - 58, 2, 24);
        ctx.fillRect(keepX + 26, h - 54, 16, 2);
      } else if (zone === 'piratestreasure') {
        if (act === 1) {
          // Tropical Beach: Distant palm silhouettes & pirate galleon
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(0, h - 50, w, 20);
          const sx = w * 0.7;
          ctx.fillStyle = '#0c4a6e';
          ctx.fillRect(sx - 10, h - 54, 20, 5);
          ctx.fillRect(sx - 2, h - 66, 2, 12);
          ctx.fillRect(sx + 4, h - 68, 2, 14);
        } else if (act === 2) {
          // Coral Reef Arch & Kelp
          ctx.fillStyle = '#075985';
          ctx.beginPath();
          ctx.arc(w * 0.45, h - 45, 26, Math.PI, 0);
          ctx.fill();
        } else {
          // Sunken Galleon Hull & Broken Mast
          ctx.fillStyle = '#021e30';
          ctx.beginPath();
          ctx.moveTo(w * 0.2, h - 40);
          ctx.lineTo(w * 0.35, h - 75);
          ctx.lineTo(w * 0.8, h - 75);
          ctx.lineTo(w * 0.95, h - 40);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#082f49';
          ctx.fillRect(w * 0.55, h - 92, 3, 22);
          ctx.fillRect(w * 0.45, h - 84, 24, 2);
        }
      } else {
        // Quantum Space Shards (Travel)
        for (let i = 0; i < 6; i++) {
          const colors = ['#22d3ee', '#f472b6', '#ea580c', '#f59e0b', '#8b5cf6'];
          ctx.fillStyle = colors[i % colors.length];
          const px = 25 + i * 42;
          const py = h - 65 - Math.sin(tick * 0.08 + i) * 10;
          ctx.fillRect(px, py, 24, 6);
          ctx.fillRect(px + 6, py - 12, 12, 12);
        }
      }

      // ==========================================
      // 4. MAIN PLATFORM & FOREGROUND TERRAIN
      // ==========================================
      const groundY = h - 34;

      // Platform Base Material Fill
      let platBaseColor = '#0f172a';
      let platTrimColor = '#22d3ee';
      let platHighlight = '#67e8f9';

      if (zone === 'neon') {
        platBaseColor = '#061a29';
        platTrimColor = '#06b6d4';
        platHighlight = '#67e8f9';
      } else if (zone === 'sakura') {
        platBaseColor = '#260a22';
        platTrimColor = '#f43f5e';
        platHighlight = '#fecdd3';
      } else if (zone === 'lavacliff') {
        platBaseColor = '#1c0505';
        platTrimColor = '#ea580c';
        platHighlight = '#fde047';
      } else if (zone === 'desert') {
        platBaseColor = '#451a03';
        platTrimColor = '#d97706';
        platHighlight = '#fef08a';
      } else if (zone === 'krono') {
        platBaseColor = '#090e24';
        platTrimColor = '#06b6d4';
        platHighlight = '#a855f7';
      } else if (zone === 'jungle') {
        platBaseColor = '#064e3b';
        platTrimColor = '#10b981';
        platHighlight = '#86efac';
      } else if (zone === 'blizzard') {
        platBaseColor = '#0f172a';
        platTrimColor = '#38bdf8';
        platHighlight = '#ffffff';
      } else if (zone === 'steampunk') {
        platBaseColor = '#1c1208';
        platTrimColor = '#b45309';
        platHighlight = '#fbbf24';
      } else if (zone === 'castlesmash') {
        platBaseColor = '#0f172a';
        platTrimColor = '#64748b';
        platHighlight = '#cbd5e1';
      } else if (zone === 'piratestreasure') {
        platBaseColor = act === 1 ? '#b45309' : act === 2 ? '#4c0519' : '#0f172a';
        platTrimColor = act === 1 ? '#d97706' : act === 2 ? '#9f1239' : '#1e293b';
        platHighlight = act === 1 ? '#fde047' : act === 2 ? '#f43f5e' : '#38bdf8';
      }

      // Draw Main Ground Block
      ctx.fillStyle = platBaseColor;
      ctx.fillRect(0, groundY, w, 34);

      // Distinct platform brick/circuit seams
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let bx = 0; bx < w; bx += 24) {
        ctx.fillRect(bx, groundY + 4, 1, 30);
      }
      ctx.fillRect(0, groundY + 16, w, 1);

      // Glowing Platform Top Trim
      ctx.fillStyle = platTrimColor;
      ctx.fillRect(0, groundY, w, 4);

      ctx.fillStyle = platHighlight;
      ctx.fillRect(0, groundY, w, 1.5);

      // Specific Foreground Accents
      if (zone === 'blizzard') {
        // Hanging Icicles
        ctx.fillStyle = '#bae6fd';
        for (let ic = 10; ic < w; ic += 18) {
          ctx.beginPath();
          ctx.moveTo(ic, groundY + 4);
          ctx.lineTo(ic + 5, groundY + 4);
          ctx.lineTo(ic + 2.5, groundY + 11 + ((ic * 3) % 7));
          ctx.fill();
        }
      } else if (zone === 'lavacliff') {
        // Glowing magma fissure lines in stone
        ctx.fillStyle = '#f97316';
        for (let vx = 20; vx < w; vx += 35) {
          ctx.fillRect(vx, groundY + 8, 8, 2);
          ctx.fillRect(vx + 4, groundY + 10, 2, 8);
        }
      } else if (zone === 'jungle') {
        // Hanging moss and jungle grass tufts
        ctx.fillStyle = '#34d399';
        for (let gx = 8; gx < w; gx += 16) {
          ctx.fillRect(gx, groundY - 3, 3, 3);
          ctx.fillRect(gx + 2, groundY - 5, 2, 5);
        }
      } else if (zone === 'steampunk') {
        // Golden Rivets & Steam Vents
        ctx.fillStyle = '#fbbf24';
        for (let rx = 10; rx < w; rx += 18) {
          ctx.fillRect(rx, groundY + 8, 2, 2);
        }
        ctx.fillStyle = '#180903';
        for (let vx = 28; vx < w; vx += 44) {
          ctx.fillRect(vx, groundY + 6, 8, 2);
          if (Math.sin(tick * 0.1 + vx) > 0.4) {
            ctx.fillStyle = 'rgba(255, 247, 237, 0.45)';
            ctx.fillRect(vx + 2, groundY - 2, 4, 3);
            ctx.fillStyle = '#180903';
          }
        }
      } else if (zone === 'castlesmash') {
        // Carved Ashlar Mortar Joints & Castle Crenel Lip
        ctx.fillStyle = '#334155';
        for (let bx = 0; bx < w; bx += 20) {
          ctx.fillRect(bx, groundY + 4, 1, 30);
          ctx.fillRect(bx + 10, groundY + 16, 1, 18);
        }
        // Wall Torch Sconces with flickering fire
        const torches = [18, w - 24];
        for (const tx of torches) {
          // Iron sconce bracket
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(tx, groundY + 4, 4, 10);
          ctx.fillRect(tx - 2, groundY + 4, 8, 2);
          // Fire flame
          const flameY = Math.sin(tick * 0.25 + tx) * 2;
          ctx.fillStyle = '#f97316';
          ctx.fillRect(tx - 1, groundY - 4 + flameY, 6, 7);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(tx, groundY - 2 + flameY, 4, 4);
          // Warm ambient aura
          ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
          ctx.beginPath();
          ctx.arc(tx + 2, groundY, 11, 0, Math.PI * 2);
          ctx.fill();
        }

        // Iron Portcullis Spikes / Studs on platform edge
        ctx.fillStyle = '#94a3b8';
        for (let sx = 8; sx < w; sx += 16) {
          ctx.fillRect(sx, groundY + 1, 2, 2);
        }
      } else if (zone === 'piratestreasure') {
        if (act === 1) {
          // Golden sand grains, driftwood texture & crimson starfish
          ctx.fillStyle = '#fef08a';
          for (let sx = 12; sx < w; sx += 26) {
            ctx.fillRect(sx, groundY + 1, 2, 2);
          }
          // Crimson Starfish on beach rock
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(22, groundY + 1, 3, 3);
          ctx.fillRect(21, groundY + 2, 5, 1);
          ctx.fillRect(23, groundY, 1, 5);
          // Sea shell
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(w - 36, groundY + 1, 4, 3);
        } else if (act === 2) {
          // Submerged coral branches & rising luminous bubbles
          ctx.fillStyle = '#f43f5e';
          for (let cx = 14; cx < w; cx += 38) {
            ctx.fillRect(cx, groundY - 4, 3, 6);
            ctx.fillRect(cx - 2, groundY - 2, 7, 2);
          }
          // Rising bubbles stream
          ctx.fillStyle = '#bae6fd';
          for (let bx = 26; bx < w; bx += 32) {
            const bY = groundY - 6 - ((tick * 1.2 + bx * 2) % 44);
            ctx.fillRect(bx, bY, 2, 2);
          }
        } else {
          // Sunken Gold Doubloons & Barnacles on wrecked galleon planks
          ctx.fillStyle = '#facc15';
          for (let gx = 16; gx < w; gx += 26) {
            ctx.fillRect(gx, groundY + 1, 3, 2);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(gx + 1, groundY + 1, 1, 1);
            ctx.fillStyle = '#facc15';
          }
          // Deep sea barnacles
          ctx.fillStyle = '#38bdf8';
          for (let bx = 30; bx < w; bx += 36) {
            ctx.fillRect(bx, groundY + 6, 3, 3);
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(bx + 1, groundY + 7, 1, 1);
          }
        }
      }

      // Floating Ledges
      ctx.fillStyle = platBaseColor;
      ctx.fillRect(32, groundY - 34, 52, 7);
      ctx.fillRect(w - 92, groundY - 28, 54, 7);

      ctx.fillStyle = platTrimColor;
      ctx.fillRect(32, groundY - 34, 52, 2.5);
      ctx.fillRect(w - 92, groundY - 28, 54, 2.5);

      // ==========================================
      // 5. ANIMATED HERO RUNNER (KRONO) ON PLATFORM
      // ==========================================
      const heroX = 48;
      const heroY = groundY - 34 - 16;
      const heroBreath = Math.sin(tick * 0.12) > 0 ? 0 : 1;

      // Scarf animation flapping in wind
      const scarfWave = Math.sin(tick * 0.25) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(heroX - 5, heroY + 6 + scarfWave, 6, 3);
      ctx.fillRect(heroX - 9, heroY + 7 - scarfWave, 5, 2);

      // Hero Body (Krono Armor)
      ctx.fillStyle = '#0284c7'; // Blue cyber armor
      ctx.fillRect(heroX, heroY + 5 - heroBreath, 9, 7);

      // Hero Head / Helmet
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(heroX + 1, heroY - 1 - heroBreath, 8, 7);

      // Glowing Cyan Cyber Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(heroX + 5, heroY + 1 - heroBreath, 4, 2);

      // Legs / Boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(heroX + 1, heroY + 12, 3, 4);
      ctx.fillRect(heroX + 5, heroY + 12, 3, 4);

      // Sword Hilt on back
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(heroX + 2, heroY + 2, 2, 4);

      // ==========================================
      // 6. COLLECTIBLE SHARD OR BOSS SIGIL
      // ==========================================
      const itemX = w - 65;
      const itemY = groundY - 28 - 20;

      if (isBoss) {
        if (zone === 'castlesmash') {
          // Lord Malakar: Warlord Horned Helm & Spiked Iron Tower Shield
          const bossPulse = Math.sin(tick * 0.15) * 2;
          // Outer Heraldic Crimson & Molten Gold Aura
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.beginPath();
          ctx.arc(itemX, itemY + bossPulse, 16, 0, Math.PI * 2);
          ctx.fill();

          // Spiked Tower Shield Body
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(itemX - 10, itemY - 11 + bossPulse, 20, 22);
          ctx.fillStyle = '#334155';
          ctx.fillRect(itemX - 8, itemY - 9 + bossPulse, 16, 18);

          // Golden Lion Crest / Cross
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(itemX - 2, itemY - 7 + bossPulse, 4, 14);
          ctx.fillRect(itemX - 6, itemY - 3 + bossPulse, 12, 4);

          // Warlord Horns / Steel Spikes
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(itemX - 11, itemY - 13 + bossPulse, 3, 5);
          ctx.fillRect(itemX + 8, itemY - 13 + bossPulse, 3, 5);
          ctx.fillRect(itemX - 2, itemY - 14 + bossPulse, 4, 3); // Top central spike

          // Glowing Fiery Orange Eyes / Slit
          ctx.fillStyle = '#f97316';
          ctx.fillRect(itemX - 5, itemY - 1 + bossPulse, 4, 2);
          ctx.fillRect(itemX + 1, itemY - 1 + bossPulse, 4, 2);

          // Orbiting ember sparks
          const orbAng = tick * 0.12;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(itemX + Math.cos(orbAng) * 15 - 1, itemY + Math.sin(orbAng) * 15 - 1, 2.5, 2.5);
          ctx.fillRect(itemX - Math.cos(orbAng) * 15 - 1, itemY - Math.sin(orbAng) * 15 - 1, 2.5, 2.5);
        } else if (zone === 'piratestreasure') {
          // El Cofre Maldito: Sunken Cursed Mimic Chest with gold trim, fangs and tentacles
          const bossPulse = Math.sin(tick * 0.15) * 2;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
          ctx.beginPath();
          ctx.arc(itemX, itemY + bossPulse, 16, 0, Math.PI * 2);
          ctx.fill();

          // Wooden chest body
          ctx.fillStyle = '#78350f';
          ctx.fillRect(itemX - 10, itemY - 6 + bossPulse, 20, 14);
          // Gold iron trim
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(itemX - 8, itemY - 6 + bossPulse, 3, 14);
          ctx.fillRect(itemX + 5, itemY - 6 + bossPulse, 3, 14);
          ctx.fillRect(itemX - 10, itemY - 1 + bossPulse, 20, 2);

          // Glowing red demonic eyes & sharp fangs
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(itemX - 5, itemY - 4 + bossPulse, 3, 2);
          ctx.fillRect(itemX + 2, itemY - 4 + bossPulse, 3, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(itemX - 6, itemY + 1 + bossPulse, 2, 3);
          ctx.fillRect(itemX - 2, itemY + 1 + bossPulse, 2, 3);
          ctx.fillRect(itemX + 2, itemY + 1 + bossPulse, 2, 3);

          // Bubbles rising from chest
          const bAng = tick * 0.1;
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(itemX + Math.cos(bAng) * 13 - 1, itemY + Math.sin(bAng) * 13 - 1, 2, 2);
        } else {
          // Pulsing Demonic Boss Core / Skull Sigil
          const bossPulse = Math.sin(tick * 0.15) * 2;
          // Outer aura
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(itemX, itemY + bossPulse, 14, 0, Math.PI * 2);
          ctx.fill();

          // Boss Skull Core
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(itemX, itemY + bossPulse, 9, 0, Math.PI * 2);
          ctx.fill();

          // Horns / Spikes
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(itemX - 8, itemY - 6 + bossPulse, 3, 4);
          ctx.fillRect(itemX + 5, itemY - 6 + bossPulse, 3, 4);

          // Glowing Eyes
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(itemX - 4, itemY - 2 + bossPulse, 3, 3);
          ctx.fillRect(itemX + 1, itemY - 2 + bossPulse, 3, 3);

          // Orbiting energy sparks
          const orbAng = tick * 0.1;
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(itemX + Math.cos(orbAng) * 14 - 1.5, itemY + Math.sin(orbAng) * 14 - 1.5, 3, 3);
          ctx.fillRect(itemX - Math.cos(orbAng) * 14 - 1.5, itemY - Math.sin(orbAng) * 14 - 1.5, 3, 3);
        }
      } else {
        // Rotating 3D Chrono Diamond / Energy Gem
        const cBob = Math.sin(tick * 0.12) * 3;
        const gemPhase = Math.sin(tick * 0.1);
        const gemW = Math.max(2, Math.abs(gemPhase) * 7);

        // Halo
        ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
        ctx.beginPath();
        ctx.arc(itemX, itemY + cBob, 12, 0, Math.PI * 2);
        ctx.fill();

        // Diamond Upper & Lower Polygons
        ctx.fillStyle = gemPhase > 0 ? '#22d3ee' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(itemX, itemY - 8 + cBob);
        ctx.lineTo(itemX + gemW, itemY + cBob);
        ctx.lineTo(itemX, itemY + 8 + cBob);
        ctx.lineTo(itemX - gemW, itemY + cBob);
        ctx.closePath();
        ctx.fill();

        // Inner Facet Reflection
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(itemX, itemY - 7 + cBob);
        ctx.lineTo(itemX + gemW * 0.5, itemY + cBob);
        ctx.lineTo(itemX, itemY + cBob);
        ctx.fill();

        // Orbiting Sparkle Star
        if ((tick % 24) < 12) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(itemX + 7, itemY - 7 + cBob, 2, 2);
        }
      }

      // ==========================================
      // 7. VIGNETTE & SCANLINE POLISH
      // ==========================================
      // Subtle top and bottom cinematic gradient
      const vigGrad = ctx.createLinearGradient(0, 0, 0, h);
      vigGrad.addColorStop(0, 'rgba(2, 6, 23, 0.45)');
      vigGrad.addColorStop(0.15, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.6)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // ==========================================
      // 8. LOCKED OVERLAY (HEAVY PADLOCK & FROST)
      // ==========================================
      if (isLocked) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
        ctx.fillRect(0, 0, w, h);

        const lx = Math.floor(w / 2);
        const ly = Math.floor(h / 2);

        // Glowing Chains Across
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, h);
        ctx.moveTo(w, 0);
        ctx.lineTo(0, h);
        ctx.stroke();

        // Lock Shackle
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(lx, ly - 9, 9, Math.PI, 0);
        ctx.stroke();

        // Lock Body
        ctx.fillStyle = '#334155';
        ctx.fillRect(lx - 14, ly - 7, 28, 22);
        ctx.fillStyle = '#475569';
        ctx.fillRect(lx - 12, ly - 5, 24, 18);

        // Golden Keyhole
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(lx, ly + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(lx - 1.5, ly + 2, 3, 6);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [zone, act, isLocked, isBoss, isUnderConstruction]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/80 shadow-md transition-transform group-hover:scale-102 ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-cover image-rendering-pixelated block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
