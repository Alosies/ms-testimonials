import { z } from 'zod';

/**
 * Device and browser information collected from the client.
 *
 * Captured on `form_started` and `form_resumed` events.
 * All data is available without requiring user permission prompts.
 *
 * @see README.md for migration planning
 */
export const DeviceInfoSchema = z.object({
  // Screen & Display
  screenWidth: z.number().int().positive(),
  screenHeight: z.number().int().positive(),
  viewportWidth: z.number().int().positive(),
  viewportHeight: z.number().int().positive(),
  devicePixelRatio: z.number().positive(),
  colorDepth: z.number().int().positive(),

  // Device Detection
  isTouchDevice: z.boolean(),
  isMobile: z.boolean(),

  // Locale & Region
  language: z.string(),
  languages: z.array(z.string()),
  timezone: z.string(),
  timezoneOffset: z.number().int(),

  // Browser Features
  cookiesEnabled: z.boolean(),
  doNotTrack: z.boolean(),

  // Traffic Source
  referrer: z.string(),

  // Connection (Network Information API - optional, not all browsers support)
  connectionType: z.string().optional(),
  connectionEffectiveType: z.string().optional(),
  connectionDownlink: z.number().optional(),
});

/**
 * Device info type inferred from schema.
 * Single source of truth - do not manually define this interface elsewhere.
 */
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;
