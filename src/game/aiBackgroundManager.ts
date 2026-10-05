import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { ZoneId } from '../types';
import { renderDynamicWeather } from './weatherEngine';

export interface ActBackdrops {
  act1: string;
  act2: string;
}

// Eagerly import all background images through Vite asset bundler
const bgModules: Record<string, string> = (import.meta as any).glob(
  '../assets/images/bg_*.jpg',
  { eager: true, import: 'default' }
);

function getBgUrl(fragment: string): string {
  for (const [path, mod] of Object.entries(bgModules)) {
    if (path.includes(fragment)) {
      return typeof mod === 'string' ? mod : (mod as { default: string })?.default || '';
    }
  }
  return '';
}

export const STAGE_BACKDROPS: Record<ZoneId, ActBackdrops> = {
  neon: {
    act1: getBgUrl('bg_neon_cyber'),
    act2: getBgUrl('bg_neon_midnight'),
  },
  sakura: {
    act1: getBgUrl('bg_sakura_twilight'),
    act2: getBgUrl('bg_sakura_night'),
  },
  lavacliff: {
    act1: getBgUrl('bg_volcano_magma'),
    act2: getBgUrl('bg_volcano_eruption'),
  },
  desert: {
    act1: getBgUrl('bg_desert_dunes'),
    act2: getBgUrl('bg_desert_night'),
  },
  krono: {
    act1: getBgUrl('bg_krono_metropolis'),
    act2: getBgUrl('bg_krono_midnight'),
  },
  travel: {
    act1: getBgUrl('bg_travel_nexus_day'),
    act2: getBgUrl('bg_travel_nexus_night'),
  },
  jungle: {
    act1: getBgUrl('bg_jungle_canopy'),
    act2: getBgUrl('bg_jungle_night'),
  },
  jurasicdraft: {
    act1: getBgUrl('bg_jungle_canopy'),
    act2: getBgUrl('bg_jungle_night'),
  },
  blizzard: {
    act1: getBgUrl('bg_blizzard_glacier'),
    act2: getBgUrl('bg_blizzard_night'),
  },
  steampunk: {
    act1: getBgUrl('bg_steampunk_sky'),
    act2: getBgUrl('bg_steampunk_night'),
  },
  castlesmash: {
    act1: getBgUrl('bg_steampunk_sky'),
    act2: getBgUrl('bg_steampunk_night'),
  },
  piratestreasure: {
    act1: getBgUrl('bg_pirate_ocean'),
    act2: getBgUrl('bg_pirate_night'),
  },
  themoon: {
    act1: getBgUrl('bg_space_cosmic'),
    act2: getBgUrl('bg_space_eclipse'),
  },
};

// Global image cache for instant zero-latency canvas blitting
const backdropCache = new Map<string, HTMLImageElement>();

// Eager preload of all stage backdrops across all acts
if (typeof window !== 'undefined') {
  Object.values(STAGE_BACKDROPS).forEach((pair) => {
    [pair.act1, pair.act2].forEach((src) => {
      if (src && !backdropCache.has(src)) {
        const img = new Image();
        img.src = src;
        backdropCache.set(src, img);
      }
    });
  });
}

export function getStageBackdropImage(zone: ZoneId, act: number = 1): HTMLImageElement | null {
  const pair = STAGE_BACKDROPS[zone] || STAGE_BACKDROPS.krono;
  const src = (act >= 2 ? pair.act2 : pair.act1) || pair.act1;
  if (!src) return null;

  let img = backdropCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    backdropCache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/**
 * Renders the stage backdrop with natural aspect ratio and parallax scrolling.
 */
export function drawAILevelBackground(
  ctx: CanvasRenderingContext2D,
  zone: ZoneId,
  act: number,
  cameraX: number,
  _worldWidth: number,
  time: number
): void {
  const img = getStageBackdropImage(zone, act);

  // 1. Deep slate-dark foundation base
  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (img) {
    const imgAspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 16 / 9;
    const bgH = GAME_HEIGHT;
    const bgW = Math.round(bgH * imgAspect);

    const parallaxSpeed = 0.08;
    const scrollPos = cameraX * parallaxSpeed;

    const firstTile = Math.floor(scrollPos / bgW) - 1;
    const lastTile = Math.floor((scrollPos + GAME_WIDTH) / bgW) + 1;

    for (let t = firstTile; t <= lastTile; t++) {
      const tileScreenX = Math.round(t * bgW - scrollPos);
      if (tileScreenX + bgW < -20 || tileScreenX > GAME_WIDTH + 20) continue;

      ctx.save();
      ctx.globalAlpha = 0.82;

      const isMirrored = Math.abs(t) % 2 === 1;

      if (isMirrored) {
        ctx.translate(tileScreenX + bgW, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, bgW, bgH);
      } else {
        ctx.drawImage(img, tileScreenX, 0, bgW, bgH);
      }
      ctx.restore();
    }

    // 2. Soft edge dissolve blend at tile boundaries
    for (let t = firstTile; t <= lastTile; t++) {
      const seamX = Math.round(t * bgW - scrollPos);
      if (seamX > -30 && seamX < GAME_WIDTH + 30) {
        const seamGrad = ctx.createLinearGradient(seamX - 16, 0, seamX + 16, 0);
        seamGrad.addColorStop(0, 'rgba(5, 7, 15, 0)');
        seamGrad.addColorStop(0.5, 'rgba(5, 7, 15, 0.14)');
        seamGrad.addColorStop(1, 'rgba(5, 7, 15, 0)');
        ctx.fillStyle = seamGrad;
        ctx.fillRect(seamX - 16, 0, 32, GAME_HEIGHT);
      }
    }

    // 3. Subtle Act tinting for narrative progression
    if (act === 3) {
      const tension = Math.sin(time * 0.002) * 0.02 + 0.05;
      ctx.fillStyle = `rgba(220, 38, 38, ${tension})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // 4. Contrast & Depth Gradient
    const depthGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    depthGrad.addColorStop(0, 'rgba(3, 6, 16, 0.35)');
    depthGrad.addColorStop(0.20, 'rgba(3, 6, 16, 0.05)');
    depthGrad.addColorStop(0.70, 'rgba(3, 6, 16, 0.05)');
    depthGrad.addColorStop(1, 'rgba(3, 6, 16, 0.45)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 5. Dynamic Procedural Weather System
    renderDynamicWeather(ctx, zone, act, cameraX, time);
  }
}
