/**
 * Bulletproof Double-Tap & Pinch-to-Zoom Prevention Utility
 * 
 * Prevents unwanted browser zooming (double tap zoom, pinch zoom, gesture zoom)
 * across iOS Safari, Android Chrome, Samsung Internet, and PWAs during gameplay.
 */

export function initPreventZoom(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let lastTouchEnd = 0;

  // 1. Intercept double-tap on touchend
  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();
    const target = event.target as HTMLElement | null;

    // Allow normal interactions for text inputs if any
    const isTextInput = target && (
      target.tagName === 'TEXTAREA' ||
      (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text')
    );

    if (!isTextInput && now - lastTouchEnd <= 350) {
      event.preventDefault();
      // If target is a button or clickable element, trigger click so gameplay isn't dropped
      if (target && typeof target.click === 'function' && target.tagName === 'BUTTON') {
        target.click();
      }
    }
    lastTouchEnd = now;
  };

  // 2. Prevent multi-touch pinch to zoom
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  // 3. Prevent iOS Safari gesture zoom (Pinch & Rotation gestures)
  const handleGesture = (event: Event) => {
    event.preventDefault();
  };

  // 4. Prevent Ctrl + Wheel zoom on desktop and trackpads
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  };

  // 5. Prevent double click zoom
  const handleDblClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const isTextInput = target && (
      target.tagName === 'TEXTAREA' ||
      (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text')
    );
    if (!isTextInput) {
      event.preventDefault();
    }
  };

  // Attach non-passive listeners to cancel default zoom behavior
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });
  window.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('dblclick', handleDblClick, { passive: false });

  // Return cleanup function
  return () => {
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('dblclick', handleDblClick);
  };
}
