/**
 * Device detection utilities for Zion Adventure.
 * Accurately differentiates between:
 * - Celular (Mobile smartphones: iPhone, Android mobile)
 * - iPad / Tablets (iPad, iPad Pro, Android tablets)
 * - Desktop / PC / Mac
 */

export const checkIsIPad = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  
  // 1. Explicit iPad in UA (older iOS or custom webview)
  const isExplicitIPad = /iPad/i.test(ua);
  
  // 2. Modern iPadOS reports as "Macintosh" with multi-touch points
  const isMacTouch = /Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  
  // 3. Tablet screen dimensions with touch support (e.g. iPad Mini 768x1024, iPad 810x1080, iPad Air 820x1180, iPad Pro 1024x1366, Android tablets)
  const hasTouch = (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  const isTabletDimensions = hasTouch && minDim >= 600 && maxDim >= 850;

  return isExplicitIPad || isMacTouch || isTabletDimensions;
};

export const checkIsMobilePhone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Rule out iPad and tablets first
  if (checkIsIPad()) return false;

  const ua = navigator.userAgent || '';
  
  // Standard mobile phone UA strings
  const isMobileUA = /iPhone|iPod|Android.*Mobile|Mobile.*Android|Windows Phone|BlackBerry|webOS|IEMobile|Opera Mini/i.test(ua);
  if (isMobileUA) return true;

  const hasTouch = (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const maxDim = Math.max(window.innerWidth, window.innerHeight);

  // Phone screen dimensions (portrait or landscape, min dimension < 600px)
  const isPhoneDimensions = minDim < 600 && maxDim < 1000;
  if (hasTouch && isPhoneDimensions) return true;

  // Responsive emulation in dev tools (viewport width <= 500 or small height in landscape with small width)
  if (window.innerWidth <= 500 || (window.innerHeight <= 500 && window.innerWidth <= 950 && hasTouch)) {
    return true;
  }

  return false;
};
