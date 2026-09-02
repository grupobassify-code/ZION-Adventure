import React, { useEffect, useRef } from 'react';

interface PixelCharacterProps {
  scale?: number;
  interactive?: boolean;
  actionPose?: boolean;
  className?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  scale = 4,
  interactive = true,
  actionPose = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    tick: 0,
    isHovered: false,
    slashAnim: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      stateRef.current.tick++;
      const t = stateRef.current.tick;
      const isHovered = stateRef.current.isHovered || actionPose;
      if (stateRef.current.slashAnim > 0) stateRef.current.slashAnim--;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Disable image smoothing for pure retro pixel crispness
      ctx.imageSmoothingEnabled = false;

      // Base coordinate center
      const cx = Math.floor(width / 2);
      const cy = Math.floor(height / 2) + 12;

      // Breathing bounce
      const bounce = Math.floor(Math.sin(t * 0.08) * 1.8);
      const sc = scale;

      // Energy Aura Glow behind character
      const auraPulse = 0.4 + Math.sin(t * 0.1) * 0.2;
      const auraGrad = ctx.createRadialGradient(cx, cy - 20 * sc, 10 * sc, cx, cy - 20 * sc, 45 * sc);
      auraGrad.addColorStop(0, `rgba(34, 211, 238, ${auraPulse * 0.7})`);
      auraGrad.addColorStop(0.5, `rgba(168, 85, 247, ${auraPulse * 0.35})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 20 * sc, 45 * sc, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Cyber Scarf Waving Physics (Long trailing scarf)
      const scarfSegments = 8;
      for (let i = scarfSegments; i >= 0; i--) {
        const sx = cx - (14 + i * 4) * sc + Math.sin(t * 0.12 - i * 0.5) * (3 + i * 1.5) * sc;
        const sy = cy + bounce - (26 - i * 1.8) * sc + Math.cos(t * 0.15 - i * 0.4) * (2 + i * 1.2) * sc;
        const sw = Math.max(2, (8 - i * 0.7)) * sc;
        const sh = (5 + (scarfSegments - i) * 0.4) * sc;

        ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#06b6d4';
        ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));

        // Glow edge on scarf
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
      }

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12 * sc, 18 * sc, 6 * sc, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- ZION PIXEL SPRITE ---
      const py = cy + bounce;

      // 1. Legs / Boots
      // Left leg
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 7 * sc, py + 4 * sc, 5 * sc, 6 * sc); // Boot trim
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 7 * sc, py + 8 * sc, 5 * sc, 2 * sc); // Neon light stripe

      // Right leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx + 2 * sc, py + 4 * sc, 5 * sc, 6 * sc);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx + 2 * sc, py + 8 * sc, 5 * sc, 2 * sc);

      // 2. Torso / Cyber Armor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 9 * sc, py - 20 * sc, 18 * sc, 18 * sc);

      // Chestplate armor plating
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 7 * sc, py - 18 * sc, 14 * sc, 12 * sc);

      // Cyber Reactor Core (Glowing Diamond in Center of Chest)
      const corePulse = Math.sin(t * 0.15) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(34, 211, 238, ${corePulse})`;
      ctx.fillRect(cx - 2 * sc, py - 14 * sc, 4 * sc, 5 * sc);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1 * sc, py - 13 * sc, 2 * sc, 3 * sc);

      // Belt & Energy pouches
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 8 * sc, py - 5 * sc, 16 * sc, 3 * sc);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 6 * sc, py - 4 * sc, 3 * sc, 3 * sc);
      ctx.fillRect(cx + 3 * sc, py - 4 * sc, 3 * sc, 3 * sc);

      // 3. Head & Helmet / Visor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 8 * sc, py - 35 * sc, 16 * sc, 15 * sc); // Helmet base

      // Cyber Hair / Helmet crest (Spiky Futuristic)
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(cx - 7 * sc, py - 40 * sc, 14 * sc, 6 * sc);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(cx - 9 * sc, py - 38 * sc, 5 * sc, 4 * sc);
      ctx.fillRect(cx + 4 * sc, py - 38 * sc, 5 * sc, 4 * sc);

      // Face Visor (Glowing Cyan/Gold Neon)
      const visorGlow = Math.sin(t * 0.1) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(34, 211, 238, ${visorGlow})`;
      ctx.fillRect(cx - 6 * sc, py - 30 * sc, 12 * sc, 5 * sc);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 1 * sc, py - 29 * sc, 4 * sc, 3 * sc); // Visor eye gleam

      // Scarf collar around neck
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 9 * sc, py - 23 * sc, 18 * sc, 5 * sc);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 8 * sc, py - 22 * sc, 16 * sc, 3 * sc);

      // 4. Arms & Light Sword (Saber de Luz de Zion)
      if (isHovered || stateRef.current.slashAnim > 0) {
        // Dynamic Attack / Ready Stance
        // Left arm holding guard
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 14 * sc, py - 18 * sc, 6 * sc, 12 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 14 * sc, py - 10 * sc, 5 * sc, 4 * sc); // Gauntlet

        // Right arm raised with glowing Energy Blade
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + 8 * sc, py - 24 * sc, 7 * sc, 14 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx + 10 * sc, py - 27 * sc, 5 * sc, 5 * sc); // Hand/Hilt

        // Sword Hilt
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx + 11 * sc, py - 30 * sc, 3 * sc, 6 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + 8 * sc, py - 29 * sc, 9 * sc, 2 * sc); // Crossguard

        // Energy Blade (Long, Glowing Beam)
        const bladePulse = Math.sin(t * 0.2) * 0.15 + 0.85;
        // Outer blade glow
        ctx.fillStyle = `rgba(34, 211, 238, ${bladePulse * 0.6})`;
        ctx.fillRect(cx + 9 * sc, py - 62 * sc, 7 * sc, 33 * sc);

        // Core sharp blade
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx + 10 * sc, py - 60 * sc, 5 * sc, 31 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 11 * sc, py - 58 * sc, 3 * sc, 28 * sc); // White hot center

        // Energy Sparkles around blade
        for (let p = 0; p < 4; p++) {
          const px = cx + (8 + (p * 3) % 7) * sc + Math.sin(t * 0.3 + p) * 4 * sc;
          const py_spark = py - (35 + p * 7) * sc;
          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#facc15';
          ctx.fillRect(Math.floor(px), Math.floor(py_spark), Math.floor(2 * sc), Math.floor(2 * sc));
        }

        // Sword Slash Arc Effect if clicking / hover
        if (stateRef.current.slashAnim > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4 * sc;
          ctx.beginPath();
          ctx.arc(cx + 5 * sc, py - 35 * sc, 38 * sc, -Math.PI * 0.8, -Math.PI * 0.1);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * sc;
          ctx.beginPath();
          ctx.arc(cx + 5 * sc, py - 35 * sc, 38 * sc, -Math.PI * 0.7, -Math.PI * 0.2);
          ctx.stroke();
        }
      } else {
        // Idle Resting Stance (Sword rested on shoulder/back)
        // Arms
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 13 * sc, py - 18 * sc, 5 * sc, 14 * sc);
        ctx.fillRect(cx + 8 * sc, py - 18 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 13 * sc, py - 8 * sc, 5 * sc, 4 * sc);
        ctx.fillRect(cx + 8 * sc, py - 8 * sc, 5 * sc, 4 * sc);

        // Sword sheathed on back angled
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx + 10 * sc, py - 42 * sc, 3 * sc, 8 * sc); // Hilt
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx + 9 * sc, py - 34 * sc, 5 * sc, 22 * sc); // Blade edge
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 10 * sc, py - 33 * sc, 2 * sc, 20 * sc);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [scale, interactive, actionPose]);

  const handleClick = () => {
    if (!interactive) return;
    stateRef.current.slashAnim = 16;
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-200 active:scale-95 ${className}`}
      onMouseEnter={() => {
        if (interactive) stateRef.current.isHovered = true;
      }}
      onMouseLeave={() => {
        if (interactive) stateRef.current.isHovered = false;
      }}
      onClick={handleClick}
      title="Zion — Héroe del Espacio-Tiempo"
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full h-full object-contain image-rendering-pixelated drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
