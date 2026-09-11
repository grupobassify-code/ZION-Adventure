import { RemotePlayerState } from '../types/multiplayer';

export interface GhostFrame {
  t: number; // Elapsed milliseconds from start
  x: number;
  y: number;
  facing: 1 | -1;
  animState: RemotePlayerState['animState'];
  isDashing?: boolean;
}

const GHOST_STORAGE_PREFIX = 'zion_time_attack_ghost_';

export function saveGhostRecording(slotId: number, levelIndex: number, frames: GhostFrame[]): void {
  try {
    // Compress/downsample frames if too large (> 1200 frames)
    let framesToSave = frames;
    if (frames.length > 1200) {
      framesToSave = frames.filter((_, idx) => idx % 2 === 0);
    }
    const key = `${GHOST_STORAGE_PREFIX}s${slotId}_lvl${levelIndex}`;
    localStorage.setItem(key, JSON.stringify(framesToSave));
  } catch (err) {
    console.warn('Could not save ghost replay:', err);
  }
}

export function loadGhostRecording(slotId: number, levelIndex: number): GhostFrame[] | null {
  try {
    const key = `${GHOST_STORAGE_PREFIX}s${slotId}_lvl${levelIndex}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not load ghost replay:', err);
  }
  return null;
}

export function sampleGhostAtTime(
  frames: GhostFrame[],
  currentMs: number,
  goalX: number = 2000
): RemotePlayerState | null {
  if (!frames || frames.length === 0) return null;

  // If time exceeds last frame, keep ghost at last position
  const lastFrame = frames[frames.length - 1];
  if (currentMs >= lastFrame.t) {
    return {
      id: 'ghost_player',
      name: 'Tu Mejor Fantasma',
      x: lastFrame.x,
      y: lastFrame.y,
      vx: 0,
      vy: 0,
      facing: lastFrame.facing,
      animState: 'idle',
      isWon: true,
      progressPercent: 100,
      skin: 'ninja',
      timestamp: Date.now(),
    };
  }

  // Binary search for closest frames
  let low = 0;
  let high = frames.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (frames[mid].t === currentMs) {
      low = mid;
      break;
    } else if (frames[mid].t < currentMs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx2 = Math.min(frames.length - 1, Math.max(0, low));
  const idx1 = Math.max(0, idx2 - 1);

  const f1 = frames[idx1];
  const f2 = frames[idx2];

  let x = f1.x;
  let y = f1.y;
  let facing = f1.facing;
  let animState = f1.animState;
  let isDashing = f1.isDashing;

  if (f2.t > f1.t && currentMs >= f1.t && currentMs <= f2.t) {
    const alpha = (currentMs - f1.t) / (f2.t - f1.t);
    x = f1.x + (f2.x - f1.x) * alpha;
    y = f1.y + (f2.y - f1.y) * alpha;
    facing = alpha > 0.5 ? f2.facing : f1.facing;
    animState = alpha > 0.5 ? f2.animState : f1.animState;
    isDashing = alpha > 0.5 ? f2.isDashing : f1.isDashing;
  }

  const progress = Math.min(100, Math.max(0, Math.round((x / Math.max(1, goalX)) * 100)));

  return {
    id: 'ghost_player',
    name: 'Tu Mejor Fantasma',
    x,
    y,
    vx: 2.8,
    vy: 0,
    facing,
    animState,
    isDashing,
    progressPercent: progress,
    skin: 'ninja',
    timestamp: Date.now(),
  };
}

export function formatTimeMs(ms: number): string {
  if (ms <= 0 || !isFinite(ms)) return '00:00.00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const hStr = hundredths.toString().padStart(2, '0');

  return `${mStr}:${sStr}.${hStr}`;
}

export function formatDeltaMs(deltaMs: number): { text: string; isFaster: boolean } {
  const isFaster = deltaMs <= 0;
  const absMs = Math.abs(deltaMs);
  const sec = (absMs / 1000).toFixed(2);
  const prefix = isFaster ? '-' : '+';
  return {
    text: `${prefix}${sec}s`,
    isFaster,
  };
}
