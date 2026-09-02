/**
 * Orientation helper utility to lock and maintain landscape mode across all devices.
 */

export async function lockLandscapeOrientation(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;

    // Modern standard Screen Orientation API
    const orientation = screen.orientation as unknown as {
      lock?: (orientation: string) => Promise<void>;
    };

    if (orientation && typeof orientation.lock === 'function') {
      try {
        await orientation.lock('landscape');
        return true;
      } catch {
        try {
          await orientation.lock('landscape-primary');
          return true;
        } catch {
          // Fall through to legacy check
        }
      }
    }

    // Vendor-prefixed legacy Screen Orientation APIs
    const screenAny = screen as unknown as {
      lockOrientation?: (orientation: string) => boolean;
      mozLockOrientation?: (orientation: string) => boolean;
      msLockOrientation?: (orientation: string) => boolean;
      webkitLockOrientation?: (orientation: string) => boolean;
    };

    if (screenAny.lockOrientation) {
      return screenAny.lockOrientation('landscape');
    }
    if (screenAny.mozLockOrientation) {
      return screenAny.mozLockOrientation('landscape');
    }
    if (screenAny.msLockOrientation) {
      return screenAny.msLockOrientation('landscape');
    }
    if (screenAny.webkitLockOrientation) {
      return screenAny.webkitLockOrientation('landscape');
    }
  } catch {
    // Browsers require user gesture or fullscreen to lock orientation
    return false;
  }
  return false;
}

export async function requestFullscreenAndLockLandscape(element?: HTMLElement | null): Promise<void> {
  try {
    const target = element || document.documentElement;

    const docWithFullscreen = target as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (document.fullscreenElement) {
      // Already in fullscreen, try locking orientation directly
      await lockLandscapeOrientation();
      return;
    }

    if (docWithFullscreen.requestFullscreen) {
      await docWithFullscreen.requestFullscreen();
    } else if (docWithFullscreen.webkitRequestFullscreen) {
      await docWithFullscreen.webkitRequestFullscreen();
    } else if (docWithFullscreen.mozRequestFullScreen) {
      await docWithFullscreen.mozRequestFullScreen();
    } else if (docWithFullscreen.msRequestFullscreen) {
      await docWithFullscreen.msRequestFullscreen();
    }

    // After entering fullscreen, lock orientation to landscape
    await lockLandscapeOrientation();
  } catch (err) {
    console.warn('Could not auto-lock fullscreen landscape:', err);
  }
}
