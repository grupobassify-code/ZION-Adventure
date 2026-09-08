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

      // --- ZION PIXEL SPRITE (CYBER SHINOBI HERO) ---
      const py = cy + bounce;

      // 0. Shinobi Headband Ribbons (Flowing behind from back of metal forehead protector)
      for (let k = 4; k >= 1; k--) {
        const rx = cx - (8 + k * 3.5) * sc;
        const ry = py - (34 - Math.sin(t * 0.18 - k * 0.8) * 3) * sc;
        ctx.fillStyle = k % 2 === 0 ? '#0891b2' : '#06b6d4';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(2.5 * sc));
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(1 * sc));
      }

      // 1. Legs & Cyber-Ninja Tabi Boots
      // Left leg
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 3 * sc); // Knee armor
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 7 * sc, py + 5 * sc, 5 * sc, 5 * sc); // Tabi boot trim
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 7 * sc, py + 9 * sc, 5 * sc, 2 * sc); // Cyan split sole neon

      // Right leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 3 * sc);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx + 2 * sc, py + 5 * sc, 5 * sc, 5 * sc);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx + 2 * sc, py + 9 * sc, 5 * sc, 2 * sc);

      // 2. Torso, V-Taper Shinobi Armor & Pauldrons
      // Undersuit base
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx - 8 * sc, py - 20 * sc, 16 * sc, 17 * sc);

      // Pauldrons (Angular cyber shoulder plates extending outward)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 12 * sc, py - 21 * sc, 5 * sc, 6 * sc); // Left shoulder
      ctx.fillRect(cx + 7 * sc, py - 21 * sc, 5 * sc, 6 * sc);  // Right shoulder
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 12 * sc, py - 21 * sc, 5 * sc, 2 * sc); // Cyan shoulder trims
      ctx.fillRect(cx + 7 * sc, py - 21 * sc, 5 * sc, 2 * sc);

      // Chestplate armor plating
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 6 * sc, py - 19 * sc, 12 * sc, 11 * sc);
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 4 * sc, py - 19 * sc, 8 * sc, 3 * sc);

      // Cyber Reactor Core (Glowing Diamond in Center of Chest)
      const corePulse = Math.sin(t * 0.15) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(34, 211, 238, ${corePulse})`;
      ctx.fillRect(cx - 2 * sc, py - 15 * sc, 4 * sc, 5 * sc);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1 * sc, py - 14 * sc, 2 * sc, 3 * sc);

      // Shinobi Obi / Azure Utility Sash & Gold Buckle
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - 8 * sc, py - 6 * sc, 16 * sc, 3.5 * sc);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 3.5 * sc); // Gold central buckle
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 8 * sc, py - 7 * sc, 3 * sc, 4 * sc); // Left kunai pouch
      ctx.fillRect(cx + 5 * sc, py - 7 * sc, 3 * sc, 4 * sc); // Right pouch

      // 3. Head: Shinobi Mask, Forehead Protector, Optic Eyes & Hair
      // Ninja cowl & angular jawline
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);

      // Mouth mask cover
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 6 * sc, py - 27 * sc, 12 * sc, 6 * sc);
      // Cyber breather vents on mask
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 2 * sc, py - 26 * sc, 4 * sc, 2 * sc);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 1 * sc, py - 25 * sc, 2 * sc, 1 * sc);

      // Shinobi Forehead Protector (Metallic band with Gold Crest)
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 4 * sc);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 6 * sc, py - 35 * sc, 12 * sc, 1.5 * sc); // Metallic reflection
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 2 * sc, py - 35 * sc, 4 * sc, 3 * sc); // Gold ninja crest emblem

      // Cyber-Shinobi Twin Sharp Optic Eyes
      const eyeGlow = Math.sin(t * 0.12) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(34, 211, 238, ${eyeGlow})`;
      ctx.fillRect(cx - 5 * sc, py - 30 * sc, 4 * sc, 2.5 * sc); // Left sharp eye
      ctx.fillRect(cx + 1 * sc, py - 30 * sc, 4 * sc, 2.5 * sc); // Right sharp eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3 * sc, py - 30 * sc, 1.8 * sc, 2 * sc); // White hot pupil sparks
      ctx.fillRect(cx + 3 * sc, py - 30 * sc, 1.8 * sc, 2 * sc);

      // Spiky Anime Ninja Hair (Cyberpunk Royal Violet / Electric Purple Gradient)
      ctx.fillStyle = '#6b21a8'; // Deep royal violet base
      ctx.fillRect(cx - 8 * sc, py - 40 * sc, 16 * sc, 6 * sc);
      ctx.fillStyle = '#9333ea'; // Electric cyber purple midtone
      ctx.fillRect(cx - 6 * sc, py - 43 * sc, 12 * sc, 4 * sc);
      ctx.fillStyle = '#c084fc'; // Vibrant radiant lilac spikes
      ctx.fillRect(cx - 9 * sc, py - 41 * sc, 4 * sc, 3 * sc); // Swept-back rear spike
      ctx.fillRect(cx + 2 * sc, py - 44 * sc, 5 * sc, 3 * sc); // Windblown top crest
      ctx.fillRect(cx + 5 * sc, py - 41 * sc, 3 * sc, 3 * sc); // Forward spike
      ctx.fillStyle = '#e9d5ff'; // Crystalline glint highlight
      ctx.fillRect(cx + 3 * sc, py - 44 * sc, 2 * sc, 1.5 * sc);

      // Shinobi Scarf Collar around neck
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 8 * sc, py - 22 * sc, 16 * sc, 4 * sc);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 7 * sc, py - 21 * sc, 14 * sc, 2 * sc);

      // 4. Arms & High-Frequency Beam Ninjato
      if (isHovered || stateRef.current.slashAnim > 0) {
        // Dynamic Attack / Combat Stance
        // Left arm holding guard
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 14 * sc, py - 19 * sc, 6 * sc, 12 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 14 * sc, py - 11 * sc, 5 * sc, 4 * sc); // Gauntlet

        // Right arm raised with glowing Ninjato Beam
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + 8 * sc, py - 24 * sc, 7 * sc, 14 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx + 10 * sc, py - 27 * sc, 5 * sc, 5 * sc);

        // Sword Hilt & Gold Tsuba
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx + 11 * sc, py - 31 * sc, 3 * sc, 6 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + 8 * sc, py - 30 * sc, 9 * sc, 2.5 * sc); // Crossguard (Tsuba)

        // Energy Blade (High Frequency Plasma Ninjato)
        const bladePulse = Math.sin(t * 0.2) * 0.15 + 0.85;
        // Outer blade glow
        ctx.fillStyle = `rgba(34, 211, 238, ${bladePulse * 0.6})`;
        ctx.fillRect(cx + 9 * sc, py - 66 * sc, 7 * sc, 36 * sc);

        // Core sharp blade
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx + 10 * sc, py - 64 * sc, 5 * sc, 34 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 11 * sc, py - 62 * sc, 3 * sc, 30 * sc); // White hot core

        // Energy Sparkles around blade
        for (let p = 0; p < 4; p++) {
          const px = cx + (8 + (p * 3) % 7) * sc + Math.sin(t * 0.3 + p) * 4 * sc;
          const py_spark = py - (37 + p * 7) * sc;
          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#facc15';
          ctx.fillRect(Math.floor(px), Math.floor(py_spark), Math.floor(2 * sc), Math.floor(2 * sc));
        }

        // Sword Slash Arc Effect if clicking / hover
        if (stateRef.current.slashAnim > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4 * sc;
          ctx.beginPath();
          ctx.arc(cx + 5 * sc, py - 35 * sc, 42 * sc, -Math.PI * 0.85, -Math.PI * 0.05);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * sc;
          ctx.beginPath();
          ctx.arc(cx + 5 * sc, py - 35 * sc, 42 * sc, -Math.PI * 0.75, -Math.PI * 0.15);
          ctx.stroke();
        }
      } else {
        // Idle Ninja Stance — Diagonal Scabbard (Saya) on Back
        // Arms resting naturally
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 12 * sc, py - 18 * sc, 5 * sc, 14 * sc);
        ctx.fillRect(cx + 7 * sc, py - 18 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 12 * sc, py - 8 * sc, 5 * sc, 4 * sc);
        ctx.fillRect(cx + 7 * sc, py - 8 * sc, 5 * sc, 4 * sc);

        // Diagonal Ninjato Scabbard (Saya) strapped across Zion's back with gold Sageo cord rings
        ctx.save();
        ctx.translate(cx + 8 * sc, py - 20 * sc);
        ctx.rotate(-0.38); // 22 degree diagonal angle matching in-game sprite
        // Scabbard body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-2 * sc, -18 * sc, 4.5 * sc, 32 * sc);
        // Gold Sageo cord rings
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-2.5 * sc, -10 * sc, 5.5 * sc, 2 * sc);
        ctx.fillRect(-2.5 * sc, -4 * sc, 5.5 * sc, 2 * sc);
        // Scabbard gold chape (tip)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-2 * sc, 12 * sc, 4.5 * sc, 2 * sc);
        // Ninjato Hilt emerging from top
        ctx.fillStyle = '#475569';
        ctx.fillRect(-1.5 * sc, -25 * sc, 3.5 * sc, 7 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-3 * sc, -19 * sc, 6.5 * sc, 1.5 * sc); // Tsuba crossguard
        ctx.restore();
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
