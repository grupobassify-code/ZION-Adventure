import React, { useEffect, useRef } from 'react';
import { CharacterSkin } from '../types';

interface PixelCharacterProps {
  scale?: number;
  interactive?: boolean;
  actionPose?: boolean;
  characterId?: CharacterSkin | 'zyssa' | string;
  className?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  scale = 4,
  interactive = true,
  actionPose = false,
  characterId = 'zion',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    tick: 0,
    isHovered: false,
    slashAnim: 0,
  });

  const skin: CharacterSkin =
    characterId === 'zizz' || characterId === 'zyssa'
      ? 'zizz'
      : characterId === 'kael'
      ? 'kael'
      : characterId === 'anuk'
      ? 'anuk'
      : characterId === 'vector'
      ? 'vector'
      : characterId === 'balam'
      ? 'balam'
      : characterId === 'blizzard'
      ? 'blizzard'
      : characterId === 'steampunk'
      ? 'steampunk'
      : characterId === 'castlesmash'
      ? 'castlesmash'
      : characterId === 'pirate'
      ? 'pirate'
      : characterId === 'jurassic'
      ? 'jurassic'
      : characterId === 'moon'
      ? 'moon'
      : 'zion';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      stateRef.current.tick++;
      const t = stateRef.current.tick;
      if (stateRef.current.slashAnim > 0) stateRef.current.slashAnim--;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Pure retro pixel sharpness
      ctx.imageSmoothingEnabled = false;

      const cx = Math.floor(width / 2);
      const cy = Math.floor(height / 2) + 12;
      const bounce = Math.floor(Math.sin(t * 0.08) * 1.8);
      const sc = scale;

      // 1. Energy Aura Glow behind character
      const auraPulse = 0.4 + Math.sin(t * 0.1) * 0.2;
      const auraGrad = ctx.createRadialGradient(cx, cy - 20 * sc, 10 * sc, cx, cy - 20 * sc, 45 * sc);

      if (skin === 'zizz') {
        auraGrad.addColorStop(0, `rgba(244, 114, 182, ${auraPulse * 0.75})`);
        auraGrad.addColorStop(0.5, `rgba(192, 132, 252, ${auraPulse * 0.35})`);
      } else if (skin === 'kael') {
        auraGrad.addColorStop(0, `rgba(249, 115, 22, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(239, 68, 68, ${auraPulse * 0.4})`);
      } else if (skin === 'anuk') {
        auraGrad.addColorStop(0, `rgba(234, 179, 8, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(2, 132, 199, ${auraPulse * 0.4})`);
      } else if (skin === 'vector') {
        auraGrad.addColorStop(0, `rgba(99, 102, 241, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(56, 189, 248, ${auraPulse * 0.4})`);
      } else if (skin === 'balam') {
        auraGrad.addColorStop(0, `rgba(16, 185, 129, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(245, 158, 11, ${auraPulse * 0.4})`);
      } else if (skin === 'blizzard') {
        auraGrad.addColorStop(0, `rgba(56, 189, 248, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(224, 242, 254, ${auraPulse * 0.4})`);
      } else if (skin === 'steampunk') {
        auraGrad.addColorStop(0, `rgba(245, 158, 11, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(180, 83, 9, ${auraPulse * 0.4})`);
      } else if (skin === 'castlesmash') {
        auraGrad.addColorStop(0, `rgba(59, 130, 246, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(147, 197, 253, ${auraPulse * 0.4})`);
      } else if (skin === 'pirate') {
        auraGrad.addColorStop(0, `rgba(20, 184, 166, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(244, 63, 94, ${auraPulse * 0.4})`);
      } else if (skin === 'jurassic') {
        auraGrad.addColorStop(0, `rgba(132, 204, 22, ${auraPulse * 0.85})`);
        auraGrad.addColorStop(0.5, `rgba(250, 204, 21, ${auraPulse * 0.4})`);
      } else if (skin === 'moon') {
        auraGrad.addColorStop(0, `rgba(168, 85, 247, ${auraPulse * 0.9})`);
        auraGrad.addColorStop(0.5, `rgba(232, 121, 249, ${auraPulse * 0.45})`);
      } else {
        auraGrad.addColorStop(0, `rgba(34, 211, 238, ${auraPulse * 0.7})`);
        auraGrad.addColorStop(0.5, `rgba(168, 85, 247, ${auraPulse * 0.35})`);
      }
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 20 * sc, 45 * sc, 0, Math.PI * 2);
      ctx.fill();

      // 2. Waving Scarf / Cape Physics
      const scarfSegments = 8;
      for (let i = scarfSegments; i >= 0; i--) {
        const sx = cx - (14 + i * 4) * sc + Math.sin(t * 0.12 - i * 0.5) * (3 + i * 1.5) * sc;
        const sy = cy + bounce - (26 - i * 1.8) * sc + Math.cos(t * 0.15 - i * 0.4) * (2 + i * 1.2) * sc;
        const sw = Math.max(2, (8 - i * 0.7)) * sc;
        const sh = (5 + (scarfSegments - i) * 0.4) * sc;

        if (skin === 'zizz') {
          // Flowing Sakura Ribbon
          ctx.fillStyle = i % 2 === 0 ? '#f472b6' : '#ec4899';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        } else if (skin === 'kael') {
          // Fiery Magma Plume Cape
          ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#c2410c';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(sh * 1.2));
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(2 * sc));
        } else if (skin === 'anuk') {
          // Desert Solar Gold & Lapis Mantle
          ctx.fillStyle = i % 2 === 0 ? '#eab308' : '#ca8a04';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        } else if (skin === 'vector') {
          // Digital Data Stream Scarf
          ctx.fillStyle = i % 2 === 0 ? '#6366f1' : '#4f46e5';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        } else if (skin === 'balam') {
          ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#047857';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(sh * 1.1));
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(2 * sc));
        } else if (skin === 'blizzard') {
          ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#0284c7';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        } else if (skin === 'steampunk') {
          ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#b45309';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(sh * 1.1));
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(2 * sc));
        } else if (skin === 'castlesmash') {
          ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#1d4ed8';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(sh * 1.2));
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(2 * sc));
        } else if (skin === 'pirate') {
          ctx.fillStyle = i % 2 === 0 ? '#14b8a6' : '#0f766e';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#facc15';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        } else if (skin === 'jurassic') {
          ctx.fillStyle = i % 2 === 0 ? '#84cc16' : '#4d7c0f';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(sh * 1.1));
          ctx.fillStyle = '#bef264';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.1), Math.floor(2 * sc));
        } else if (skin === 'moon') {
          ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#7e22ce';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(sh * 1.2));
          ctx.fillStyle = '#facc15';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw * 1.2), Math.floor(2 * sc));
        } else {
          // Cyan Cyber Scarf
          ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#06b6d4';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(sh));
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.floor(sw), Math.floor(2 * sc));
        }
      }

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12 * sc, 18 * sc, 6 * sc, 0, 0, Math.PI * 2);
      ctx.fill();

      const py = cy + bounce;

      // =======================================================================
      // CHARACTER SPRITE DRAWING PER SKIN
      // =======================================================================

      if (skin === 'anuk') {
        // --- ANUK: PHARAOH SOLAR SENTINEL (DESERT ZONE 4) ---
        // Legs & Golden Greaves
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 4 * sc);
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 4 * sc);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 7 * sc, py + 6 * sc, 5 * sc, 4 * sc);
        ctx.fillRect(cx + 2 * sc, py + 6 * sc, 5 * sc, 4 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 7 * sc, py + 10 * sc, 5 * sc, 2 * sc);
        ctx.fillRect(cx + 2 * sc, py + 10 * sc, 5 * sc, 2 * sc);

        // Torso: Royal Shendyt Kilt & Gold Sun Amulet
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - 7 * sc, py - 20 * sc, 14 * sc, 17 * sc);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx - 8 * sc, py - 21 * sc, 4 * sc, 5 * sc);
        ctx.fillRect(cx + 4 * sc, py - 21 * sc, 4 * sc, 5 * sc);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 6 * sc, py - 19 * sc, 12 * sc, 4 * sc);

        // Solar Core / Eye of Horus Brooch
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 3 * sc, py - 15 * sc, 6 * sc, 6 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 1.5 * sc, py - 13.5 * sc, 3 * sc, 3 * sc);

        // Golden Belt & Lapis Sash
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx - 8 * sc, py - 6 * sc, 16 * sc, 4 * sc);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 8 * sc);

        // Head: Nemes Headdress (Striped Gold & Lapis)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx - 8 * sc, py - 37 * sc, 16 * sc, 6 * sc);
        ctx.fillRect(cx - 8 * sc, py - 31 * sc, 3 * sc, 10 * sc);
        ctx.fillRect(cx + 5 * sc, py - 31 * sc, 3 * sc, 10 * sc);

        // Golden Cobra Uraeus Crest
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 1.5 * sc, py - 39 * sc, 3 * sc, 3 * sc);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 0.5 * sc, py - 38 * sc, 1 * sc, 1 * sc);

        // Glowing Blue Eye of Horus Visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 5 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);
        ctx.fillRect(cx + 1 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4 * sc, py - 29.5 * sc, 2 * sc, 1.5 * sc);
        ctx.fillRect(cx + 2 * sc, py - 29.5 * sc, 2 * sc, 1.5 * sc);

        // Curved Golden Khopesh Sword
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx + 8 * sc, py - 28 * sc, 3 * sc, 26 * sc);
        ctx.fillRect(cx + 10 * sc, py - 34 * sc, 4 * sc, 10 * sc); // Khopesh curve hook
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + 9 * sc, py - 32 * sc, 1.5 * sc, 24 * sc);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx + 7 * sc, py - 3 * sc, 5 * sc, 2 * sc);
      } else if (skin === 'vector') {
        // --- VECTOR: CYBER FUSION SPECIALIST (KRONO CITY ZONE 5) ---
        // High-density Exo-Legs in Graphite & Indigo
        ctx.fillStyle = '#09090b';
        ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 7 * sc, py + 8 * sc, 5 * sc, 2 * sc);
        ctx.fillRect(cx + 2 * sc, py + 8 * sc, 5 * sc, 2 * sc);

        // Torso: Carbon Nano-Armor & Fusion Reactor
        ctx.fillStyle = '#18181b';
        ctx.fillRect(cx - 8 * sc, py - 20 * sc, 16 * sc, 17 * sc);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(cx - 11 * sc, py - 21 * sc, 4 * sc, 5 * sc);
        ctx.fillRect(cx + 7 * sc, py - 21 * sc, 4 * sc, 5 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 11 * sc, py - 21 * sc, 4 * sc, 1.5 * sc);
        ctx.fillRect(cx + 7 * sc, py - 21 * sc, 4 * sc, 1.5 * sc);

        // Indigo Fusion Core
        const corePulse = Math.sin(t * 0.2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(99, 102, 241, ${corePulse})`;
        ctx.fillRect(cx - 2.5 * sc, py - 16 * sc, 5 * sc, 5 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1 * sc, py - 14.5 * sc, 2 * sc, 2 * sc);

        // Belt & Data Modules
        ctx.fillStyle = '#312e81';
        ctx.fillRect(cx - 8 * sc, py - 6 * sc, 16 * sc, 3.5 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 3.5 * sc);

        // Head: Tactical Stealth Cowl & Angular HUD Visor
        ctx.fillStyle = '#09090b';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(cx - 8 * sc, py - 37 * sc, 16 * sc, 5 * sc);

        // Angular Electric Cyan HUD Scanner Slit
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 6 * sc, py - 30 * sc, 12 * sc, 3 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2 * sc, py - 29.5 * sc, 4 * sc, 2 * sc);

        // Dual Ion Nano-Blades
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(cx + 8 * sc, py - 32 * sc, 2.5 * sc, 30 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx + 9 * sc, py - 34 * sc, 1.5 * sc, 28 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 9 * sc, py - 34 * sc, 1.5 * sc, 10 * sc);

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(cx - 10 * sc, py - 24 * sc, 2.5 * sc, 22 * sc);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 9 * sc, py - 26 * sc, 1.5 * sc, 20 * sc);
      } else if (skin === 'balam') {
        // --- BALAM: MAYAN SUN JAGUAR WARRIOR (JUNGLE ZONE 6) ---
        // Tribal Legs with Jade Bindings & Jaguar Claw Soles
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 4 * sc);
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 4 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 7 * sc, py + 7 * sc, 5 * sc, 2 * sc);
        ctx.fillRect(cx + 2 * sc, py + 7 * sc, 5 * sc, 2 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 7 * sc, py + 10 * sc, 5 * sc, 2 * sc); // Claw trim
        ctx.fillRect(cx + 2 * sc, py + 10 * sc, 5 * sc, 2 * sc);

        // Torso: Jaguar Pelt Vest & Jade Pectoral
        ctx.fillStyle = '#b45309'; // Spotted tawny pelt
        ctx.fillRect(cx - 8 * sc, py - 20 * sc, 16 * sc, 17 * sc);
        ctx.fillStyle = '#451a03'; // Jaguar spots
        ctx.fillRect(cx - 6 * sc, py - 17 * sc, 2 * sc, 2 * sc);
        ctx.fillRect(cx + 4 * sc, py - 16 * sc, 2 * sc, 2 * sc);
        ctx.fillRect(cx - 5 * sc, py - 11 * sc, 2 * sc, 2 * sc);

        // Sacred Jade Collar & Solar Medallion
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 7 * sc, py - 20 * sc, 14 * sc, 5 * sc);
        ctx.fillStyle = '#f59e0b'; // Gold solar medallion
        ctx.fillRect(cx - 3 * sc, py - 15 * sc, 6 * sc, 6 * sc);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 1.5 * sc, py - 13.5 * sc, 3 * sc, 3 * sc);

        // Mayan Belt & Jade Tassels
        ctx.fillStyle = '#047857';
        ctx.fillRect(cx - 8 * sc, py - 6 * sc, 16 * sc, 4 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 7 * sc);

        // Head: Carved Jade Jaguar Helmet & Quetzal Headdress
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);
        // Jaguar Jade Jaws
        ctx.fillStyle = '#059669';
        ctx.fillRect(cx - 8 * sc, py - 37 * sc, 16 * sc, 8 * sc);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - 7 * sc, py - 38 * sc, 14 * sc, 4 * sc);
        // Fangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 6 * sc, py - 28 * sc, 2 * sc, 3 * sc);
        ctx.fillRect(cx + 4 * sc, py - 28 * sc, 2 * sc, 3 * sc);

        // Piercing Amber Jaguar Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 5 * sc, py - 31 * sc, 4 * sc, 2.5 * sc);
        ctx.fillRect(cx + 1 * sc, py - 31 * sc, 4 * sc, 2.5 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4 * sc, py - 30.5 * sc, 2 * sc, 1.5 * sc);
        ctx.fillRect(cx + 2 * sc, py - 30.5 * sc, 2 * sc, 1.5 * sc);

        // Mayan Obsidian Macuahuitl War Club
        ctx.fillStyle = '#78350f'; // Hardwood shaft
        ctx.fillRect(cx + 8 * sc, py - 36 * sc, 4 * sc, 34 * sc);
        // Obsidian & Jade blades on sides
        ctx.fillStyle = '#0f172a'; // Black obsidian blades
        ctx.fillRect(cx + 6.5 * sc, py - 34 * sc, 1.5 * sc, 26 * sc);
        ctx.fillRect(cx + 12 * sc, py - 34 * sc, 1.5 * sc, 26 * sc);
        ctx.fillStyle = '#10b981'; // Inlaid jade stones
        ctx.fillRect(cx + 9 * sc, py - 32 * sc, 2 * sc, 3 * sc);
        ctx.fillRect(cx + 9 * sc, py - 24 * sc, 2 * sc, 3 * sc);
        ctx.fillRect(cx + 9 * sc, py - 16 * sc, 2 * sc, 3 * sc);
      } else if (skin === 'zizz') {
        // --- ZIZZ: ASTRAL SAKURA KUNOICHI (SAKURA ZONE 2) ---
        for (let k = 4; k >= 1; k--) {
          const rx = cx - (8 + k * 3.5) * sc;
          const ry = py - (34 - Math.sin(t * 0.18 - k * 0.8) * 3) * sc;
          ctx.fillStyle = k % 2 === 0 ? '#db2777' : '#f472b6';
          ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(2.5 * sc));
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(1 * sc));
        }

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#db2777';
        ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx - 7 * sc, py + 5 * sc, 5 * sc, 5 * sc);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(cx - 7 * sc, py + 9 * sc, 5 * sc, 2 * sc);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#db2777';
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx + 2 * sc, py + 5 * sc, 5 * sc, 5 * sc);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(cx + 2 * sc, py + 9 * sc, 5 * sc, 2 * sc);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(cx - 7 * sc, py - 20 * sc, 14 * sc, 17 * sc);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - 6 * sc, py - 19 * sc, 12 * sc, 12 * sc);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx - 6 * sc, py - 19 * sc, 3 * sc, 12 * sc);
        ctx.fillRect(cx + 3 * sc, py - 19 * sc, 3 * sc, 12 * sc);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 2 * sc, py - 15 * sc, 4 * sc, 4 * sc);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx - 1 * sc, py - 14 * sc, 2 * sc, 2 * sc);

        ctx.fillStyle = '#be185d';
        ctx.fillRect(cx - 7 * sc, py - 6 * sc, 14 * sc, 3.5 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 3.5 * sc);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);
        ctx.fillStyle = '#312e81';
        ctx.fillRect(cx - 8 * sc, py - 38 * sc, 16 * sc, 6 * sc);

        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx + 5 * sc, py - 37 * sc, 4 * sc, 4 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 6.5 * sc, py - 35.5 * sc, 1.5 * sc, 1.5 * sc);

        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(cx - 6 * sc, py - 27 * sc, 12 * sc, 6 * sc);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(cx - 5 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);
        ctx.fillRect(cx + 1 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);

        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx + 8 * sc, py - 30 * sc, 2.5 * sc, 28 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 9 * sc, py - 32 * sc, 1.5 * sc, 26 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 7 * sc, py - 4 * sc, 4.5 * sc, 2 * sc);

        ctx.fillStyle = '#f472b6';
        ctx.fillRect(cx - 10 * sc, py - 24 * sc, 2.5 * sc, 22 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 9 * sc, py - 26 * sc, 1.5 * sc, 20 * sc);
      } else if (skin === 'kael') {
        // --- KAEL: SOLAR MAGMA PALADIN (LAVA CLIFF ZONE 3) ---
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx - 8 * sc, py - 4 * sc, 6 * sc, 14 * sc);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx - 8 * sc, py + 2 * sc, 6 * sc, 3 * sc);
        ctx.fillRect(cx - 8 * sc, py + 8 * sc, 6 * sc, 3 * sc);

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 6 * sc, 14 * sc);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 6 * sc, 3 * sc);
        ctx.fillRect(cx + 2 * sc, py + 8 * sc, 6 * sc, 3 * sc);

        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(cx - 9 * sc, py - 22 * sc, 18 * sc, 19 * sc);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 14 * sc, py - 23 * sc, 6 * sc, 8 * sc);
        ctx.fillRect(cx + 8 * sc, py - 23 * sc, 6 * sc, 8 * sc);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx - 14 * sc, py - 23 * sc, 6 * sc, 2.5 * sc);
        ctx.fillRect(cx + 8 * sc, py - 23 * sc, 6 * sc, 2.5 * sc);

        ctx.fillStyle = '#292524';
        ctx.fillRect(cx - 7 * sc, py - 20 * sc, 14 * sc, 12 * sc);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx - 3 * sc, py - 16 * sc, 6 * sc, 6 * sc);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx - 1.5 * sc, py - 14.5 * sc, 3 * sc, 3 * sc);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 9 * sc, py - 6 * sc, 18 * sc, 4 * sc);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx - 3 * sc, py - 6 * sc, 6 * sc, 4 * sc);

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx - 8 * sc, py - 36 * sc, 16 * sc, 14 * sc);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 3 * sc, py - 39 * sc, 6 * sc, 5 * sc);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx - 2 * sc, py - 40 * sc, 4 * sc, 2 * sc);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx - 6 * sc, py - 29 * sc, 12 * sc, 3 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2 * sc, py - 28.5 * sc, 4 * sc, 2 * sc);

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx + 9 * sc, py - 38 * sc, 4 * sc, 36 * sc);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx + 10 * sc, py - 36 * sc, 3 * sc, 32 * sc);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + 11 * sc, py - 34 * sc, 1.5 * sc, 28 * sc);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx + 7 * sc, py - 3 * sc, 8 * sc, 3 * sc);
      } else {
        // --- ZION: ORIGINAL CYBER SHINOBI (NEON FOREST ZONE 1) ---
        for (let k = 4; k >= 1; k--) {
          const rx = cx - (8 + k * 3.5) * sc;
          const ry = py - (34 - Math.sin(t * 0.18 - k * 0.8) * 3) * sc;
          ctx.fillStyle = k % 2 === 0 ? '#0891b2' : '#06b6d4';
          ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(2.5 * sc));
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(4 * sc), Math.ceil(1 * sc));
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 7 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 7 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 7 * sc, py + 5 * sc, 5 * sc, 5 * sc);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx - 7 * sc, py + 9 * sc, 5 * sc, 2 * sc);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + 2 * sc, py - 4 * sc, 5 * sc, 14 * sc);
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + 2 * sc, py + 2 * sc, 5 * sc, 3 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx + 2 * sc, py + 5 * sc, 5 * sc, 5 * sc);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx + 2 * sc, py + 9 * sc, 5 * sc, 2 * sc);

        ctx.fillStyle = '#090d16';
        ctx.fillRect(cx - 8 * sc, py - 20 * sc, 16 * sc, 17 * sc);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 12 * sc, py - 21 * sc, 5 * sc, 6 * sc);
        ctx.fillRect(cx + 7 * sc, py - 21 * sc, 5 * sc, 6 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 12 * sc, py - 21 * sc, 5 * sc, 2 * sc);
        ctx.fillRect(cx + 7 * sc, py - 21 * sc, 5 * sc, 2 * sc);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 6 * sc, py - 19 * sc, 12 * sc, 11 * sc);
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx - 4 * sc, py - 19 * sc, 8 * sc, 3 * sc);

        const corePulse = Math.sin(t * 0.15) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(34, 211, 238, ${corePulse})`;
        ctx.fillRect(cx - 2 * sc, py - 15 * sc, 4 * sc, 5 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1 * sc, py - 14 * sc, 2 * sc, 3 * sc);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 8 * sc, py - 6 * sc, 16 * sc, 3.5 * sc);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 2 * sc, py - 6 * sc, 4 * sc, 3.5 * sc);

        ctx.fillStyle = '#090d16';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 14 * sc);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 6 * sc, py - 27 * sc, 12 * sc, 6 * sc);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 2 * sc, py - 26 * sc, 4 * sc, 2 * sc);

        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 7 * sc, py - 35 * sc, 14 * sc, 4 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 2 * sc, py - 35 * sc, 4 * sc, 3 * sc);

        const eyeGlow = Math.sin(t * 0.12) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(34, 211, 238, ${eyeGlow})`;
        ctx.fillRect(cx - 5 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);
        ctx.fillRect(cx + 1 * sc, py - 30 * sc, 4 * sc, 2.5 * sc);

        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx + 8 * sc, py - 32 * sc, 2.5 * sc, 30 * sc);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 9 * sc, py - 34 * sc, 1.5 * sc, 28 * sc);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 7 * sc, py - 4 * sc, 4.5 * sc, 2 * sc);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [scale, interactive, actionPose, skin]);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => {
        if (interactive) stateRef.current.isHovered = true;
      }}
      onMouseLeave={() => {
        if (interactive) stateRef.current.isHovered = false;
      }}
    >
      <canvas
        ref={canvasRef}
        width={180 * (scale / 4)}
        height={220 * (scale / 4)}
        className="block cursor-pointer select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
};
