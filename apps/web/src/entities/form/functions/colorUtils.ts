/**
 * Color Utility Functions
 * Handles color conversion for form theming
 */

/**
 * Convert hex color to HSL CSS variable format
 * Input: "#0d9488" -> Output: "175 84% 32%"
 *
 * @param hex - Hex color string (with or without #)
 * @returns HSL values as space-separated string for CSS variables
 */
export function hexToHslCssVar(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Parse RGB values
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Validate hex color format
 * Accepts 3, 4, 6, or 8 character hex codes (with or without #)
 *
 * @param color - Color string to validate
 * @returns true if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  // Match 3, 4, 6, or 8 hex digits with optional #
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Normalize hex color to 6-digit format with #
 *
 * @param hex - Hex color string
 * @returns Normalized 6-digit hex with #
 */
export function normalizeHexColor(hex: string): string {
  let cleanHex = hex.replace(/^#/, '');

  // Expand 3-digit hex to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // Take first 6 characters (ignore alpha if present)
  cleanHex = cleanHex.slice(0, 6);

  return `#${cleanHex.toLowerCase()}`;
}
