import React, { useEffect, useRef } from 'react';
import { ZoneId } from '../types';

interface LevelPixelThumbnailProps {
  zone: ZoneId;
  act: number;
  isLocked?: boolean;
  isBoss?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const LevelPixelThumbnail: React.FC<LevelPixelThumbnailProps> = ({
  zone,
  act,
  isLocked = false,
  isBoss = false,
  width = 240,
  height = 140,
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

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;

      // 1. SKY GRADIENT PER ZONE
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (zone === 'neon') {
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.5, '#082f49');
        skyGrad.addColorStop(1, '#0e7490');
      } else if (zone === 'sakura') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#4a044e');
          skyGrad.addColorStop(0.5, '#831843');
          skyGrad.addColorStop(1, '#f43f5e');
        } else {
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(0.6, '#311042');
          skyGrad.addColorStop(1, '#6b21a8');
        }
      } else if (zone === 'lavacliff') {
        skyGrad.addColorStop(0, '#1c0505');
        skyGrad.addColorStop(0.4, '#450a0a');
        skyGrad.addColorStop(0.8, '#991b1b');
        skyGrad.addColorStop(1, '#ea580c');
      } else if (zone === 'desert') {
        if (act === 1) {
          skyGrad.addColorStop(0, '#78350f');
          skyGrad.addColorStop(0.5, '#b45309');
          skyGrad.addColorStop(1, '#fbbf24');
        } else {
          skyGrad.addColorStop(0, '#1e1b4b');
          skyGrad.addColorStop(0.5, '#451a03');
          skyGrad.addColorStop(1, '#b45309');
        }
      } else if (zone === 'krono') {
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.4, '#0f172a');
        skyGrad.addColorStop(0.8, '#1e1b4b');
        skyGrad.addColorStop(1, '#3b0764');
      } else {
        // Kronos Travel
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.3, '#1e1b4b');
        skyGrad.addColorStop(0.7, '#4338ca');
        skyGrad.addColorStop(1, '#0284c7');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. CELESTIAL BODIES (Moon / Sun / Quantum Core)
      if (zone === 'neon') {
        // Cyber Neon Moon
        ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.beginPath();
        ctx.arc(w - 40, 32, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(w - 40, 32, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(w - 42, 30, 13, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'sakura') {
        // Blood Moon / Golden Sun
        const sunColor = act === 1 ? '#fecdd3' : '#f43f5e';
        ctx.fillStyle = `${sunColor}33`;
        ctx.beginPath();
        ctx.arc(w - 45, 34, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(w - 45, 34, 18, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'desert') {
        // Blazing Egyptian Sun
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(45, 30, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(45, 30, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone === 'krono') {
        // Holographic Data Matrix Ring
        const ringPulse = Math.sin(tick * 0.08) * 2;
        ctx.strokeStyle = '#06b6d488';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, 25, 24 + ringPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#a855f766';
        ctx.beginPath();
        ctx.arc(w / 2, 25, 16 - ringPulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (zone === 'travel') {
        // Cosmic Multiverse Swirl
        const s = Math.sin(tick * 0.1) * 3;
        ctx.strokeStyle = '#f43f5e88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, 35, 26 + s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#38bdf8aa';
        ctx.beginPath();
        ctx.arc(w / 2, 35, 18 - s, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. BACKGROUND SILHOUETTES & LANDMARKS
      if (zone === 'neon') {
        // Futuristic Cyber Pines & Mountains
        ctx.fillStyle = '#06202a';
        ctx.beginPath();
        ctx.moveTo(0, h - 35);
        ctx.lineTo(30, h - 70);
        ctx.lineTo(70, h - 35);
        ctx.lineTo(120, h - 85);
        ctx.lineTo(170, h - 35);
        ctx.lineTo(210, h - 65);
        ctx.lineTo(w, h - 35);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Neon Foliage Glowing Highlights
        ctx.fillStyle = '#22d3ee';
        for (let i = 20; i < w - 20; i += 30) {
          ctx.fillRect(i, h - 45 - (i % 25), 3, 15);
          ctx.fillRect(i - 4, h - 40 - (i % 25), 11, 3);
        }
      } else if (zone === 'sakura') {
        // Pagoda and Torii Gate Silhouettes
        ctx.fillStyle = '#260824';
        // Distant Pagoda
        ctx.fillRect(35, h - 75, 18, 45);
        ctx.fillRect(25, h - 70, 38, 4);
        ctx.fillRect(28, h - 60, 32, 4);
        ctx.fillRect(30, h - 50, 28, 4);

        // Torii Gate on right
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(w - 70, h - 65, 4, 35);
        ctx.fillRect(w - 45, h - 65, 4, 35);
        ctx.fillRect(w - 76, h - 68, 38, 5);
        ctx.fillRect(w - 74, h - 60, 34, 3);

        // Falling Petals
        for (let p = 0; p < 6; p++) {
          const px = (tick * 0.8 + p * 40) % w;
          const py = (tick * 0.5 + p * 25) % (h - 30);
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(px, py, 3, 2);
        }
      } else if (zone === 'lavacliff') {
        // Volcano Crater with Smoke & Magma
        ctx.fillStyle = '#260707';
        ctx.beginPath();
        ctx.moveTo(0, h - 30);
        ctx.lineTo(50, h - 80);
        ctx.lineTo(90, h - 65); // Crater dip
        ctx.lineTo(130, h - 80);
        ctx.lineTo(w, h - 30);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Magma glow in crater
        ctx.fillStyle = '#f97316';
        ctx.fillRect(75, h - 70, 30, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(85, h - 68, 12, 4);

        // Erupting fire sparks
        for (let sp = 0; sp < 5; sp++) {
          const sx = 90 + Math.sin(tick * 0.15 + sp) * 16;
          const sy = h - 75 - ((tick * 1.2 + sp * 14) % 40);
          ctx.fillStyle = sp % 2 === 0 ? '#ea580c' : '#fde047';
          ctx.fillRect(sx, sy, 3, 3);
        }
      } else if (zone === 'desert') {
        // Great Pyramids and Sphinx
        ctx.fillStyle = '#451a03';
        // Pyramid 1
        ctx.beginPath();
        ctx.moveTo(20, h - 30);
        ctx.lineTo(75, h - 85);
        ctx.lineTo(130, h - 30);
        ctx.fill();

        // Pyramid 2 (smaller)
        ctx.beginPath();
        ctx.moveTo(110, h - 30);
        ctx.lineTo(150, h - 70);
        ctx.lineTo(190, h - 30);
        ctx.fill();

        // Sphinx Silhouette
        ctx.fillRect(w - 60, h - 55, 35, 25);
        ctx.fillRect(w - 70, h - 45, 15, 15);
        ctx.fillRect(w - 55, h - 65, 16, 12); // Head
      } else if (zone === 'krono') {
        // Cyberpunk Skyscraper Skyline with lit windows
        ctx.fillStyle = '#090e1f';
        const towers = [
          { x: 10, w: 25, h: 70 },
          { x: 40, w: 32, h: 95 },
          { x: 78, w: 22, h: 60 },
          { x: 105, w: 38, h: 105 },
          { x: 150, w: 28, h: 75 },
          { x: 184, w: 45, h: 90 },
        ];

        for (const t of towers) {
          ctx.fillStyle = '#0a1026';
          ctx.fillRect(t.x, h - t.h, t.w, t.h);
          ctx.strokeStyle = '#06b6d444';
          ctx.lineWidth = 1;
          ctx.strokeRect(t.x, h - t.h, t.w, t.h);

          // Glowing windows
          for (let wy = h - t.h + 8; wy < h - 35; wy += 8) {
            for (let wx = t.x + 4; wx < t.x + t.w - 4; wx += 6) {
              if ((wx + wy + tick) % 7 === 0) {
                ctx.fillStyle = (wx * wy) % 2 === 0 ? '#38bdf8' : '#ec4899';
                ctx.fillRect(wx, wy, 3, 3);
              }
            }
          }
        }
      } else if (zone === 'travel') {
        // Dimensional Shards Convergence
        ctx.fillStyle = '#061325';
        ctx.fillRect(0, h - 35, w, 35);
        for (let i = 0; i < 5; i++) {
          const colors = ['#22d3ee', '#f472b6', '#ea580c', '#f59e0b', '#8b5cf6'];
          ctx.fillStyle = colors[i];
          const px = 20 + i * 45;
          ctx.fillRect(px, h - 55, 30, 5);
          ctx.fillRect(px + 8, h - 70, 14, 15);
        }
      }

      // 4. FOREGROUND PLATFORM & GROUND TERRAIN
      const groundY = h - 28;
      ctx.fillStyle = zone === 'neon' ? '#081726' : zone === 'sakura' ? '#1c081e' : zone === 'lavacliff' ? '#1c0606' : zone === 'desert' ? '#451a03' : zone === 'krono' ? '#080d1e' : '#0a0d1f';
      ctx.fillRect(0, groundY, w, 28);

      // Top Trim
      const trimColor = zone === 'neon' ? '#22d3ee' : zone === 'sakura' ? '#f472b6' : zone === 'lavacliff' ? '#ea580c' : zone === 'desert' ? '#f59e0b' : zone === 'krono' ? '#06b6d4' : '#38bdf8';
      ctx.fillStyle = trimColor;
      ctx.fillRect(0, groundY, w, 3);
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(0, groundY, w, 1);

      // Floating Ledges in foreground
      ctx.fillStyle = zone === 'neon' ? '#0e7490' : zone === 'sakura' ? '#db2777' : zone === 'lavacliff' ? '#b91c1c' : zone === 'desert' ? '#d97706' : zone === 'krono' ? '#4f46e5' : '#0284c7';
      ctx.fillRect(40, groundY - 32, 45, 6);
      ctx.fillRect(w - 90, groundY - 26, 50, 6);

      // Collectible Crystal / Boss Sigil in Preview
      if (isBoss) {
        // Red Skull / Boss Icon
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w / 2, groundY - 25, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w / 2 - 4, groundY - 27, 3, 3);
        ctx.fillRect(w / 2 + 1, groundY - 27, 3, 3);
      } else {
        // Glowing Energy Crystal
        const cPulse = Math.sin(tick * 0.15) * 3;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(w / 2, groundY - 28 + cPulse);
        ctx.lineTo(w / 2 + 5, groundY - 21 + cPulse);
        ctx.lineTo(w / 2, groundY - 14 + cPulse);
        ctx.lineTo(w / 2 - 5, groundY - 21 + cPulse);
        ctx.fill();
      }

      // 5. LOCKED OVERLAY
      if (isLocked) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.78)';
        ctx.fillRect(0, 0, w, h);

        // Heavy Iron Padlock Icon
        const lx = Math.floor(w / 2);
        const ly = Math.floor(h / 2);

        // Lock shackle
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(lx, ly - 8, 8, Math.PI, 0);
        ctx.stroke();

        // Lock Body
        ctx.fillStyle = '#475569';
        ctx.fillRect(lx - 12, ly - 6, 24, 18);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(lx - 10, ly - 4, 20, 14);

        // Keyhole
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(lx, ly + 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(lx - 1.5, ly + 2, 3, 5);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [zone, act, isLocked, isBoss]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-700/80 shadow-md ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-cover image-rendering-pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
