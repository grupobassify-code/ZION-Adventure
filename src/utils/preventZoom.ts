/**
 * Double-Tap & Pinch-to-Zoom Prevention Utility
 * 
 * Prevents unwanted browser zooming (double tap zoom, pinch zoom, gesture zoom)
 * across iOS Safari, Android Chrome, Samsung Internet, and PWAs during gameplay,
 * while allowing fluid multi-touch gaming (joystick + jump simultaneously)
 * and smooth touch scrolling in menus and modals.
 */

export function initPreventZoom(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let lastTouchEnd = 0;

  // 1. Intercept double-tap to zoom on non-interactive elements
  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();
    const target = event.target as HTMLElement | null;

    // Do NOT interfere if user is tapping inside a scrollable menu, button, or input
    const isInteractive = target && (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('[data-scrollable="true"]') ||
      target.closest('.overflow-y-auto')
    );

    if (!isInteractive && now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };

  // 2. Prevent iOS Safari pinch/rotation gesture zoom
  const handleGesture = (event: Event) => {
    event.preventDefault();
  };

  // 3. Prevent Ctrl + Wheel zoom on desktop and trackpads
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  };

  // 4. Prevent double click zoom on body
  const handleDblClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const isInteractive = target && (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button')
    );
    if (!isInteractive) {
      event.preventDefault();
    }
  };

  // Attach listeners
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });
  window.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('dblclick', handleDblClick, { passive: false });

  // Return cleanup function
  return () => {
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('dblclick', handleDblClick);
  };
}
