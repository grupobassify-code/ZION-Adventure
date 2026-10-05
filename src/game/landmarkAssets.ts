// Landmark asset loader with chroma-key black transparency processing

import toriiImgUrl from '../assets/images/torii_gate_shrine_1791130272996.jpg';
import pyramidImgUrl from '../assets/images/desert_pyramid_asset_1791130283479.jpg';
import sphinxImgUrl from '../assets/images/pixel_sphinx_asset_1791130629825.jpg';
import mayanTempleImgUrl from '../assets/images/pixel_mayan_temple_1791130639918.jpg';
import castleKeepImgUrl from '../assets/images/pixel_castle_keep_1791130650250.jpg';
import cyberTowerImgUrl from '../assets/images/pixel_cyber_tower_1791130661262.jpg';
import lunarLanderImgUrl from '../assets/images/pixel_lunar_lander_1791130672897.jpg';
import chaletImgUrl from '../assets/images/pixel_alpine_chalet_1791130683899.jpg';

export type LandmarkAssetKey =
  | 'torii'
  | 'pyramid'
  | 'sphinx'
  | 'mayan_pyramid'
  | 'castle_keep'
  | 'cyber_skyscraper'
  | 'lunar_lander_apollo'
  | 'chalet';

interface ProcessedLandmarkImage {
  canvas: HTMLCanvasElement | null;
  loaded: boolean;
}

const landmarkCache: Record<string, ProcessedLandmarkImage> = {
  torii: { canvas: null, loaded: false },
  pyramid: { canvas: null, loaded: false },
  sphinx: { canvas: null, loaded: false },
  mayan_pyramid: { canvas: null, loaded: false },
  castle_keep: { canvas: null, loaded: false },
  cyber_skyscraper: { canvas: null, loaded: false },
  lunar_lander_apollo: { canvas: null, loaded: false },
  chalet: { canvas: null, loaded: false },
};

function processBlackTransparency(rawImage: HTMLImageElement, darkCutoff = 35): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = rawImage.naturalWidth || rawImage.width;
  canvas.height = rawImage.naturalHeight || rawImage.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(rawImage, 0, 0);
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Perceptual brightness / maximum color component
      const maxChannel = Math.max(r, g, b);

      if (maxChannel < darkCutoff) {
        // Completely transparent outside border
        data[i + 3] = 0;
      } else if (maxChannel < darkCutoff + 35) {
        // Smooth anti-aliased alpha falloff
        const factor = (maxChannel - darkCutoff) / 35;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('[LandmarkAssets] Fallback to raw canvas', err);
  }
  return canvas;
}

function initLandmarkAsset(key: LandmarkAssetKey, url: string, darkCutoff: number) {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = url;
  img.onload = () => {
    try {
      const canvas = processBlackTransparency(img, darkCutoff);
      landmarkCache[key] = { canvas, loaded: true };
    } catch {
      landmarkCache[key] = { canvas: null, loaded: false };
    }
  };
}

// Initialize eager loading of high-fidelity scenery landmarks across zones
initLandmarkAsset('torii', toriiImgUrl, 42);
initLandmarkAsset('pyramid', pyramidImgUrl, 38);
initLandmarkAsset('sphinx', sphinxImgUrl, 40);
initLandmarkAsset('mayan_pyramid', mayanTempleImgUrl, 40);
initLandmarkAsset('castle_keep', castleKeepImgUrl, 40);
initLandmarkAsset('cyber_skyscraper', cyberTowerImgUrl, 40);
initLandmarkAsset('lunar_lander_apollo', lunarLanderImgUrl, 40);
initLandmarkAsset('chalet', chaletImgUrl, 40);

export function getProcessedLandmarkCanvas(key: LandmarkAssetKey): HTMLCanvasElement | null {
  const entry = landmarkCache[key];
  return entry && entry.loaded ? entry.canvas : null;
}
