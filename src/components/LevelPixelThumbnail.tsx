import React, { useState } from 'react';
import { ZoneId } from '../types';

// Direct, statically analyzed ESM imports - 100% reliable across Vite dev and production bundles
import kronoCityThumb from '../assets/images/krono_city_thumb_1790820471461.jpg';
import kronoBossThumb from '../assets/images/krono_boss_thumb_1790821933692.jpg';
import kronoTravelThumb from '../assets/images/krono_travel_thumb_1790900450654.jpg';
import neonForestThumb from '../assets/images/neon_forest_thumb_1790820483120.jpg';
import sakuraPagodaThumb from '../assets/images/sakura_pagoda_thumb_1790820493019.jpg';
import lavacliffMagmaThumb from '../assets/images/lavacliff_magma_thumb_1790820502527.jpg';
import desertPyramidThumb from '../assets/images/desert_pyramid_thumb_1790821852802.jpg';
import jungleTempleThumb from '../assets/images/jungle_temple_thumb_1790821867498.jpg';
import blizzardPeakThumb from '../assets/images/blizzard_peak_thumb_1790821880471.jpg';
import steampunkGearThumb from '../assets/images/steampunk_gear_thumb_1790821890653.jpg';
import castlesmashThumb from '../assets/images/castlesmash_thumb_1790821901642.jpg';
import pirateIslandThumb from '../assets/images/pirate_island_thumb_1790821911759.jpg';
import jurasicValleyThumb from '../assets/images/jurasic_valley_thumb_1790821921565.jpg';
import themoonSpaceThumb from '../assets/images/themoon_space_thumb_1790820511073.jpg';

// Backup landscape artwork
import bgNeonCyber from '../assets/images/bg_neon_cyber_1790898886818.jpg';
import bgSakuraTwilight from '../assets/images/bg_sakura_twilight_1790898899520.jpg';
import bgVolcanoMagma from '../assets/images/bg_volcano_magma_1790898909182.jpg';
import bgDesertDunes from '../assets/images/bg_desert_dunes_1790898918595.jpg';
import bgKronoMetropolis from '../assets/images/bg_krono_metropolis_1790898928103.jpg';
import bgTravelNexus from '../assets/images/bg_travel_nexus_day_1790900463291.jpg';
import bgJungleCanopy from '../assets/images/bg_jungle_canopy_1790898939546.jpg';
import bgBlizzardGlacier from '../assets/images/bg_blizzard_glacier_1790898948969.jpg';
import bgSteampunkSky from '../assets/images/bg_steampunk_sky_1790898958682.jpg';
import bgCastleSky from '../assets/images/bg_castle_sky_1791237648357.jpg';
import bgCastleNight from '../assets/images/bg_castle_night_1791237660330.jpg';
import bgPirateOcean from '../assets/images/bg_pirate_ocean_1790898978282.jpg';
import bgPirateUnderwater from '../assets/images/bg_pirate_underwater_1791237672072.jpg';
import bgJurassicNight from '../assets/images/bg_jungle_night_1790899908919.jpg';
import bgSpaceCosmic from '../assets/images/bg_space_cosmic_1790898968219.jpg';

// Map each Zone and Act directly to guaranteed image assets
export const LEVEL_AI_THUMBNAILS: Record<string, string> = {
  // Krono City
  'krono-1': kronoCityThumb,
  'krono-2': kronoCityThumb,
  'krono-3': kronoBossThumb || kronoCityThumb,
  'krono-travel': kronoTravelThumb,
  'travel-1': kronoTravelThumb,
  'travel-2': kronoTravelThumb,
  'travel-3': kronoTravelThumb,

  // Neon Forest
  'neon-1': neonForestThumb,
  'neon-2': neonForestThumb,
  'neon-3': neonForestThumb,

  // Sakura
  'sakura-1': sakuraPagodaThumb,
  'sakura-2': sakuraPagodaThumb,
  'sakura-3': sakuraPagodaThumb,

  // Lava Cliff
  'lavacliff-1': lavacliffMagmaThumb,
  'lavacliff-2': lavacliffMagmaThumb,
  'lavacliff-3': lavacliffMagmaThumb,

  // Egyptian Desert
  'desert-1': desertPyramidThumb,
  'desert-2': desertPyramidThumb,
  'desert-3': desertPyramidThumb,

  // Jungle Run
  'jungle-1': jungleTempleThumb,
  'jungle-2': jungleTempleThumb,
  'jungle-3': jungleTempleThumb,

  // Blizzard Peak
  'blizzard-1': blizzardPeakThumb,
  'blizzard-2': blizzardPeakThumb,
  'blizzard-3': blizzardPeakThumb,

  // Steampunk
  'steampunk-1': steampunkGearThumb,
  'steampunk-2': steampunkGearThumb,
  'steampunk-3': steampunkGearThumb,

  // Castle Smash
  'castlesmash-1': castlesmashThumb,
  'castlesmash-2': bgCastleNight,
  'castlesmash-3': castlesmashThumb,

  // Pirate's Treasure
  'piratestreasure-1': pirateIslandThumb,
  'piratestreasure-2': bgPirateUnderwater,
  'piratestreasure-3': pirateIslandThumb,

  // Jurassic Draft
  'jurasicdraft-1': jurasicValleyThumb,
  'jurasicdraft-2': jurasicValleyThumb,
  'jurasicdraft-3': jurasicValleyThumb,

  // The Moon
  'themoon-1': themoonSpaceThumb,
  'themoon-2': themoonSpaceThumb,
  'themoon-3': themoonSpaceThumb,
};

// Reliable secondary fallbacks by zone
const ZONE_FALLBACK_IMAGES: Record<string, string> = {
  krono: bgKronoMetropolis,
  travel: bgTravelNexus,
  neon: bgNeonCyber,
  sakura: bgSakuraTwilight,
  lavacliff: bgVolcanoMagma,
  desert: bgDesertDunes,
  jungle: bgJungleCanopy,
  blizzard: bgBlizzardGlacier,
  steampunk: bgSteampunkSky,
  castlesmash: bgCastleSky,
  piratestreasure: bgPirateOcean,
  jurasicdraft: bgJurassicNight,
  themoon: bgSpaceCosmic,
};

export function getLevelImageUrl(zone: ZoneId, act: number): string {
  const specificKey = `${zone}-${act}`;
  if (LEVEL_AI_THUMBNAILS[specificKey]) return LEVEL_AI_THUMBNAILS[specificKey];
  const genericKey = `${zone}-1`;
  if (LEVEL_AI_THUMBNAILS[genericKey]) return LEVEL_AI_THUMBNAILS[genericKey];
  if (ZONE_FALLBACK_IMAGES[zone]) return ZONE_FALLBACK_IMAGES[zone];
  return neonForestThumb;
}

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
  className = '',
}) => {
  const primaryImageUrl = getLevelImageUrl(zone, act);
  const fallbackImageUrl = ZONE_FALLBACK_IMAGES[zone] || neonForestThumb;
  const [imgSrc, setImgSrc] = useState<string>(primaryImageUrl);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);

  // If under construction, show blueprint styling
  if (isUnderConstruction) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-sky-500/40 bg-[#060e1e] flex flex-col items-center justify-center p-3 select-none ${className}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf812_1px,transparent_1px),linear-gradient(to_bottom,#38bdf812_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md mb-1.5 animate-pulse">
            <span className="text-base">🚧</span>
          </div>
          <span className="text-[11px] font-black font-heading tracking-wider text-amber-300 uppercase">
            EN CONSTRUCCIÓN
          </span>
          <span className="text-[9px] font-mono text-cyan-300/80 mt-0.5">
            PLANO ARQUITECTÓNICO
          </span>
        </div>

        <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 text-cyan-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/40">
          ACTO {act}
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    if (!triedFallback && fallbackImageUrl && imgSrc !== fallbackImageUrl) {
      setImgSrc(fallbackImageUrl);
      setTriedFallback(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/80 shadow-lg select-none bg-slate-950 transition-all duration-300 group-hover:border-cyan-500/60 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] ${className}`}
    >
      {/* 100% Reliable AI-Generated Level Scenery Image with automatic fallback */}
      <img
        src={imgSrc || primaryImageUrl}
        alt={`Nivel ${zone} Acto ${act}`}
        loading="eager"
        decoding="async"
        onError={handleImageError}
        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
      />

      {/* Atmospheric Vignette & Contrast Shading */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent pointer-events-none" />

      {/* Retro Pixel CRT Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 3px, rgba(0, 0, 0, 0.5) 4px)',
        }}
      />

      {/* Boss Stage Badge */}
      {isBoss && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-rose-950/90 text-rose-300 font-mono text-[9px] font-black px-2 py-0.5 rounded-md border border-rose-500/70 shadow-lg shadow-rose-950/60 animate-pulse">
          <span>⚔️ JEFE</span>
        </div>
      )}

      {/* Act Number Badge */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-slate-950/90 text-cyan-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border border-cyan-500/50 backdrop-blur-sm shadow-md">
        <span>ACTO {act}</span>
      </div>

      {/* Locked Stage Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[2px]">
          <div className="w-9 h-9 rounded-full bg-slate-900/95 border border-amber-500/50 flex items-center justify-center shadow-lg mb-1">
            <span className="text-amber-400 text-sm">🔒</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300/90 tracking-wider">
            BLOQUEADO
          </span>
        </div>
      )}
    </div>
  );
};
