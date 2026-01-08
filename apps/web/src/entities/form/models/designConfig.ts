/**
 * Form Design Configuration Types
 * Defines the structure for form visual customization (colors, branding)
 * Stored in forms.settings JSONB column
 */

/**
 * Configuration for form visual customization
 */
export interface FormDesignConfig {
  /** Primary accent color in hex format (e.g., "#0d9488"). Null uses app default. */
  primaryColor: string | null;
  /** Form-specific logo URL/path. Falls back to organization.logo.storage_path if null. */
  logoUrl: string | null;
}

/**
 * Default design configuration
 */
export const DEFAULT_DESIGN_CONFIG: FormDesignConfig = {
  primaryColor: null,
  logoUrl: null,
};

/**
 * Default primary color hex value (teal from index.css)
 */
export const DEFAULT_PRIMARY_COLOR_HEX = '#0d9488';

/**
 * Parse design config from JSONB
 */
export function parseDesignConfig(raw: unknown): FormDesignConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_DESIGN_CONFIG;
  }

  const config = raw as Record<string, unknown>;

  return {
    primaryColor:
      typeof config.primaryColor === 'string' && config.primaryColor
        ? config.primaryColor
        : null,
    logoUrl:
      typeof config.logoUrl === 'string' && config.logoUrl ? config.logoUrl : null,
  };
}

/**
 * Serialize design config to JSONB format for DB
 */
export function serializeDesignConfig(config: FormDesignConfig): Record<string, unknown> {
  return {
    primaryColor: config.primaryColor,
    logoUrl: config.logoUrl,
  };
}
