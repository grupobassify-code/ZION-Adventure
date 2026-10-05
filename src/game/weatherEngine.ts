import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { ZoneId } from '../types';

export type WeatherType =
  | 'sakura_petals'
  | 'snow'
  | 'cyber_rain'
  | 'jungle_leaves'
  | 'magma_embers'
  | 'sand_dust'
  | 'biolum_spores'
  | 'sea_spray'
  | 'cosmic_stardust'
  | 'quantum_prism';

/**
 * Returns the appropriate atmospheric weather type for a given Zone and Act.
 */
export function getWeatherForZone(zone: ZoneId, act: number): WeatherType {
  switch (zone) {
    case 'sakura':
      return 'sakura_petals';
    case 'blizzard':
      return 'snow';
    case 'krono':
      return act >= 2 ? 'cyber_rain' : 'cyber_rain';
    case 'steampunk':
      return act >= 2 ? 'cyber_rain' : 'biolum_spores';
    case 'jungle':
    case 'jurasicdraft':
      return 'jungle_leaves';
    case 'lavacliff':
      return 'magma_embers';
    case 'desert':
      return 'sand_dust';
    case 'piratestreasure':
      return act >= 2 ? 'sea_spray' : 'sea_spray';
    case 'neon':
      return 'biolum_spores';
    case 'themoon':
      return 'cosmic_stardust';
    case 'travel':
      return 'quantum_prism';
    default:
      return 'biolum_spores';
  }
}

/**
 * High-performance, zero-allocation procedural weather renderer.
 * Overlays smoothly over background scenery without cluttering platforms or Zion.
 */
export function renderDynamicWeather(
  ctx: CanvasRenderingContext2D,
  zone: ZoneId,
  act: number,
  cameraX: number,
  time: number
): void {
  const weather = getWeatherForZone(zone, act);

  ctx.save();

  switch (weather) {
    case 'sakura_petals':
      renderSakuraPetals(ctx, cameraX, time);
      break;
    case 'snow':
      renderSnow(ctx, cameraX, time);
      break;
    case 'cyber_rain':
      renderCyberRain(ctx, cameraX, time);
      break;
    case 'jungle_leaves':
      renderJungleLeaves(ctx, cameraX, time, act >= 2);
      break;
    case 'magma_embers':
      renderMagmaEmbers(ctx, cameraX, time);
      break;
    case 'sand_dust':
      renderDesertDust(ctx, cameraX, time);
      break;
    case 'biolum_spores':
      renderBiolumSpores(ctx, cameraX, time);
      break;
    case 'sea_spray':
      renderSeaSpray(ctx, cameraX, time);
      break;
    case 'cosmic_stardust':
      renderCosmicStardust(ctx, cameraX, time);
      break;
    case 'quantum_prism':
      renderQuantumPrism(ctx, cameraX, time);
      break;
  }

  ctx.restore();
}

/**
 * 1. SAKURA PETALS (Spirit Blossom)
 * Delicate cherry blossom petals drifting diagonally with sinusoidal wind flutter.
 */
function renderSakuraPetals(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 38;
  const parallax = 0.12;

  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random seed per petal
    const seed = i * 197.31;
    const speedY = 0.45 + (i % 5) * 0.12;
    const speedX = 0.55 + (i % 4) * 0.15;
    const waveFreq = 0.04 + (i % 3) * 0.02;

    const rawY = (time * speedY + seed * 3) % (GAME_HEIGHT + 30);
    const y = rawY - 15;

    const wave = Math.sin(time * waveFreq + seed) * 12;
    const rawX = (seed * 11 + time * speedX + wave - cameraX * parallax) % (GAME_WIDTH + 40);
    const x = ((rawX + GAME_WIDTH + 40) % (GAME_WIDTH + 40)) - 20;

    const rot = (time * 0.03 + seed) % (Math.PI * 2);
    const size = 2 + (i % 3);
    const isPale = i % 2 === 0;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(rot);
    ctx.globalAlpha = 0.42 + (i % 4) * 0.08; // 0.42 - 0.66 subtle transparency

    ctx.fillStyle = isPale ? '#fbcfe8' : '#f472b6';
    // Petal ellipse / diamond
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Petal heart shadow glint
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(0, 0, 1, 1);

    ctx.restore();
  }
}

/**
 * 2. SNOW (Blizzard Rush)
 * Multi-layer crystalline snowfall with wind gusts.
 */
function renderSnow(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 52;
  const parallax = 0.15;

  for (let i = 0; i < count; i++) {
    const seed = i * 131.73;
    const layer = i % 3; // 0 = far small, 1 = mid, 2 = near fluffy
    const speedY = layer === 0 ? 0.45 : layer === 1 ? 0.75 : 1.1;
    const speedX = 0.35 + layer * 0.2;
    const waveFreq = 0.03 + layer * 0.015;

    const rawY = (time * speedY + seed * 5) % (GAME_HEIGHT + 20);
    const y = rawY - 10;

    const wave = Math.sin(time * waveFreq + seed) * (6 + layer * 4);
    const rawX = (seed * 7 + time * speedX + wave - cameraX * parallax * (0.8 + layer * 0.4)) % (GAME_WIDTH + 30);
    const x = ((rawX + GAME_WIDTH + 30) % (GAME_WIDTH + 30)) - 15;

    ctx.save();
    if (layer === 0) {
      // Far tiny snowflakes
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(Math.round(x), Math.round(y), 1.2, 1.2);
    } else if (layer === 1) {
      // Mid soft snowflakes
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(x), Math.round(y), 1.8, 1.8);
    } else {
      // Near fluffy flakes with crystalline glow
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.round(x), Math.round(y), 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * 3. CYBER RAIN (Krono City & Steampunk)
 * Fast, sleek slanted neon rainfall with subtle splash particles.
 */
function renderCyberRain(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 48;
  const parallax = 0.10;
  const angle = 0.22; // ~12 degree wind tilt

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)'; // Soft neon cyan rain line
  ctx.lineWidth = 1;

  for (let i = 0; i < count; i++) {
    const seed = i * 89.41;
    const speed = 4.2 + (i % 4) * 0.8;
    const len = 7 + (i % 5) * 2.5;

    const rawY = (time * speed + seed * 9) % (GAME_HEIGHT + 40);
    const y = rawY - 20;

    const rawX = (seed * 13 + time * 1.2 - cameraX * parallax) % (GAME_WIDTH + 40);
    const x = ((rawX + GAME_WIDTH + 40) % (GAME_WIDTH + 40)) - 20;

    const endX = x - Math.sin(angle) * len;
    const endY = y + Math.cos(angle) * len;

    ctx.beginPath();
    ctx.moveTo(Math.round(x), Math.round(y));
    ctx.lineTo(Math.round(endX), Math.round(endY));
    ctx.stroke();

    // Occasional tiny puddle splash ring on the lower screen horizon
    if (i % 6 === 0 && y > GAME_HEIGHT - 35) {
      ctx.fillStyle = 'rgba(103, 232, 249, 0.22)';
      ctx.fillRect(Math.round(x - 1), Math.round(endY), 3, 1);
    }
  }
}

/**
 * 4. JUNGLE LEAVES & BIOLUMINESCENT FIREFLIES (Jungle Run & Jurassic Draft)
 */
function renderJungleLeaves(ctx: CanvasRenderingContext2D, cameraX: number, time: number, isNight: boolean) {
  const count = 28;
  const parallax = 0.14;

  for (let i = 0; i < count; i++) {
    const seed = i * 163.53;
    const speedY = 0.40 + (i % 3) * 0.15;
    const speedX = 0.35 + (i % 3) * 0.12;

    const rawY = (time * speedY + seed * 4) % (GAME_HEIGHT + 30);
    const y = rawY - 15;

    const sway = Math.sin(time * 0.035 + seed) * 14;
    const rawX = (seed * 17 + time * speedX + sway - cameraX * parallax) % (GAME_WIDTH + 40);
    const x = ((rawX + GAME_WIDTH + 40) % (GAME_WIDTH + 40)) - 20;

    if (isNight && i % 2 === 0) {
      // Nighttime: Glowing jade firefly
      const pulse = Math.sin(time * 0.1 + seed) * 0.25 + 0.55;
      ctx.globalAlpha = pulse * 0.65;
      ctx.fillStyle = i % 4 === 0 ? '#34d399' : '#a7f3d0';
      ctx.beginPath();
      ctx.arc(Math.round(x), Math.round(y), 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Drifting tropical canopy leaf
      const rot = (time * 0.02 + seed) % (Math.PI * 2);
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(rot);
      ctx.globalAlpha = 0.38 + (i % 3) * 0.08;
      ctx.fillStyle = i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#059669' : '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/**
 * 5. MAGMA EMBERS (Lava Cliffs)
 * Rising incandescent volcanic embers with thermal drafts.
 */
function renderMagmaEmbers(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 36;
  const parallax = 0.10;

  for (let i = 0; i < count; i++) {
    const seed = i * 149.27;
    const speedY = 0.55 + (i % 4) * 0.2;

    // Embers float UPWARDS
    const rawY = GAME_HEIGHT + 15 - ((time * speedY + seed * 6) % (GAME_HEIGHT + 30));
    const y = rawY;

    const sway = Math.sin(time * 0.05 + seed) * 8;
    const rawX = (seed * 19 + sway - cameraX * parallax) % (GAME_WIDTH + 30);
    const x = ((rawX + GAME_WIDTH + 30) % (GAME_WIDTH + 30)) - 15;

    const flicker = Math.sin(time * 0.15 + seed) * 0.2 + 0.6;
    ctx.globalAlpha = flicker * 0.52;

    // Color gradient from hot white/yellow to blazing orange/crimson
    const color = i % 3 === 0 ? '#fef08a' : i % 3 === 1 ? '#f97316' : '#ef4444';
    ctx.fillStyle = color;
    const size = 1 + (i % 3) * 0.6;
    ctx.fillRect(Math.round(x), Math.round(y), size, size);
  }
}

/**
 * 6. DESERT DUST & HEAT HAZE (Desert Sanctuary)
 * Fine horizontal sand drift blowing over dunes.
 */
function renderDesertDust(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 30;
  const parallax = 0.18;

  for (let i = 0; i < count; i++) {
    const seed = i * 211.19;
    const speedX = 1.2 + (i % 3) * 0.4;
    const y = (seed * 7) % GAME_HEIGHT;

    const rawX = (seed * 23 + time * speedX - cameraX * parallax) % (GAME_WIDTH + 50);
    const x = ((rawX + GAME_WIDTH + 50) % (GAME_WIDTH + 50)) - 25;

    ctx.globalAlpha = 0.28 + (i % 3) * 0.08;
    ctx.fillStyle = i % 2 === 0 ? '#fde68a' : '#f59e0b';
    const len = 3 + (i % 4) * 2;
    ctx.fillRect(Math.round(x), Math.round(y), len, 1);
  }
}

/**
 * 7. BIOLUMINESCENT SPORES (Neon Forest)
 * Floating ambient particles with cybernetic glow.
 */
function renderBiolumSpores(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 34;
  const parallax = 0.12;

  for (let i = 0; i < count; i++) {
    const seed = i * 181.43;
    const speedY = 0.25 + (i % 3) * 0.1;
    const rawY = (time * speedY + seed * 5) % (GAME_HEIGHT + 20);
    const y = rawY - 10;

    const sway = Math.sin(time * 0.04 + seed) * 10;
    const rawX = (seed * 13 + sway - cameraX * parallax) % (GAME_WIDTH + 30);
    const x = ((rawX + GAME_WIDTH + 30) % (GAME_WIDTH + 30)) - 15;

    const glow = Math.sin(time * 0.08 + seed) * 0.25 + 0.55;
    ctx.globalAlpha = glow * 0.50;

    ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#a855f7';
    ctx.beginPath();
    ctx.arc(Math.round(x), Math.round(y), 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 8. SEA SPRAY & MIST (Pirate's Treasure)
 */
function renderSeaSpray(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 32;
  const parallax = 0.16;

  for (let i = 0; i < count; i++) {
    const seed = i * 173.21;
    const speedX = 0.8 + (i % 3) * 0.3;
    const speedY = 0.35 + (i % 3) * 0.12;

    const rawY = (time * speedY + seed * 4) % (GAME_HEIGHT + 20);
    const y = rawY - 10;

    const wave = Math.sin(time * 0.03 + seed) * 8;
    const rawX = (seed * 11 + time * speedX + wave - cameraX * parallax) % (GAME_WIDTH + 30);
    const x = ((rawX + GAME_WIDTH + 30) % (GAME_WIDTH + 30)) - 15;

    ctx.globalAlpha = 0.32 + (i % 3) * 0.08;
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(Math.round(x), Math.round(y), 1.5, 1.5);
  }
}

/**
 * 9. COSMIC STARDUST & SOLAR WIND (The Moon)
 */
function renderCosmicStardust(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 35;
  const parallax = 0.06; // Very slow space drift

  for (let i = 0; i < count; i++) {
    const seed = i * 223.81;
    const speedX = 0.25 + (i % 3) * 0.1;
    const y = (seed * 5) % GAME_HEIGHT;

    const rawX = (seed * 29 + time * speedX - cameraX * parallax) % (GAME_WIDTH + 20);
    const x = ((rawX + GAME_WIDTH + 20) % (GAME_WIDTH + 20)) - 10;

    const twinkle = Math.sin(time * 0.06 + seed) * 0.3 + 0.5;
    ctx.globalAlpha = twinkle * 0.45;
    ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#c084fc' : '#ffffff';
    ctx.fillRect(Math.round(x), Math.round(y), 1.2, 1.2);
  }

  // Occasional fast celestial micro-meteor passing through
  const meteorCycle = (time * 0.015) % 1;
  if (meteorCycle < 0.25) {
    const meteorProgress = meteorCycle / 0.25;
    const mx = GAME_WIDTH * (1 - meteorProgress * 1.4);
    const my = GAME_HEIGHT * 0.15 + meteorProgress * 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + 18, my - 9);
    ctx.stroke();
  }
}

/**
 * 10. QUANTUM PRISM PARTICLES (Kronos Travel)
 * Shifting multi-chromatic particles pulsing between all historical eras.
 */
function renderQuantumPrism(ctx: CanvasRenderingContext2D, cameraX: number, time: number) {
  const count = 42;
  const parallax = 0.14;

  const colors = ['#22d3ee', '#f472b6', '#fb923c', '#4ade80', '#c084fc', '#facc15'];

  for (let i = 0; i < count; i++) {
    const seed = i * 157.67;
    const speedY = 0.40 + (i % 4) * 0.15;
    const speedX = 0.50 + (i % 3) * 0.15;

    const rawY = (time * speedY + seed * 6) % (GAME_HEIGHT + 30);
    const y = rawY - 15;

    const sway = Math.sin(time * 0.045 + seed) * 12;
    const rawX = (seed * 23 + time * speedX + sway - cameraX * parallax) % (GAME_WIDTH + 40);
    const x = ((rawX + GAME_WIDTH + 40) % (GAME_WIDTH + 40)) - 20;

    const pulse = Math.sin(time * 0.12 + seed) * 0.25 + 0.6;
    ctx.globalAlpha = pulse * 0.55;

    const color = colors[i % colors.length];
    ctx.fillStyle = color;

    // Prismatic diamond shape
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate((time * 0.04 + seed) % (Math.PI * 2));
    ctx.fillRect(-1, -1, 2.2, 2.2);
    ctx.restore();
  }
}
