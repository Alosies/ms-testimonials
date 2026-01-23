import type { DeviceInfo } from '../models';

/**
 * Network Information API types (not fully standardized)
 * Private interface - only used internally by getConnectionInfo
 */
interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
}

/**
 * Detects if the device is likely a mobile device based on screen size and touch support
 */
function detectMobile(): boolean {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const smallScreen = window.innerWidth < 768;
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return (hasTouch && smallScreen) || mobileUserAgent;
}

/**
 * Get connection information if Network Information API is available
 */
function getConnectionInfo(): Pick<
  DeviceInfo,
  'connectionType' | 'connectionEffectiveType' | 'connectionDownlink'
> {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

  if (!connection) {
    return {};
  }

  return {
    connectionType: connection.type,
    connectionEffectiveType: connection.effectiveType,
    connectionDownlink: connection.downlink,
  };
}

/**
 * Collects device and browser information that's available without user permission.
 * This data helps form creators understand their audience better.
 *
 * All collected data is:
 * - Available without permission prompts
 * - Non-PII (no personal identification)
 * - Standard browser APIs
 */
export function collectDeviceInfo(): DeviceInfo {
  return {
    // Screen & Display
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,

    // Device Detection
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isMobile: detectMobile(),

    // Locale & Region
    language: navigator.language,
    languages: [...navigator.languages],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Browser Features
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',

    // Traffic Source
    referrer: document.referrer || '',

    // Connection (if available)
    ...getConnectionInfo(),
  };
}

/**
 * Returns a simplified device summary for display purposes
 */
export function getDeviceSummary(info: DeviceInfo): string {
  const device = info.isMobile ? 'Mobile' : 'Desktop';
  const screen = `${info.screenWidth}x${info.screenHeight}`;
  return `${device} · ${screen}`;
}
