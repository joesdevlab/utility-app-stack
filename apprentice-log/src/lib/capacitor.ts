/**
 * Capacitor platform detection utilities
 */

/**
 * Check if the app is running as a native app (Android/iOS via Capacitor)
 * This must be called on the client side only
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Capacitor
  const win = window as Window & { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } };

  if (win.Capacitor?.isNativePlatform) {
    return win.Capacitor.isNativePlatform();
  }

  // Fallback: check for Capacitor platform
  if (win.Capacitor?.getPlatform) {
    const platform = win.Capacitor.getPlatform();
    return platform === 'android' || platform === 'ios';
  }

  return false;
}

/**
 * Get the current platform
 */
export function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';

  const win = window as Window & { Capacitor?: { getPlatform?: () => string } };

  if (win.Capacitor?.getPlatform) {
    const platform = win.Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      return platform;
    }
  }

  return 'web';
}
