/**
 * Widget Settings Schema — Union and Utilities
 *
 * Single source of truth for the JSONB `settings` column on the widgets table.
 * All consumers (web app, API, widget-embed) should derive types from here.
 *
 * @see ADR-027: Widget Types Expansion
 */
import { z } from 'zod';
import {
  WallOfLoveSettingsSchema,
  defaultWallOfLoveSettings,
  type WallOfLoveSettings,
} from './wallOfLoveSettings.schema';
import {
  CarouselSettingsSchema,
  defaultCarouselSettings,
  type CarouselSettings,
} from './carouselSettings.schema';
import {
  SingleQuoteSettingsSchema,
  defaultSingleQuoteSettings,
  type SingleQuoteSettings,
} from './singleQuoteSettings.schema';
import {
  MarqueeSettingsSchema,
  defaultMarqueeSettings,
  type MarqueeSettings,
} from './marqueeSettings.schema';
import {
  RatingBadgeSettingsSchema,
  defaultRatingBadgeSettings,
  type RatingBadgeSettings,
} from './ratingBadgeSettings.schema';
import {
  AvatarsBarSettingsSchema,
  defaultAvatarsBarSettings,
  type AvatarsBarSettings,
} from './avatarsBarSettings.schema';
import {
  ToastPopupSettingsSchema,
  defaultToastPopupSettings,
  type ToastPopupSettings,
} from './toastPopupSettings.schema';

// Re-export individual types
export type { WallOfLoveSettings } from './wallOfLoveSettings.schema';
export type { CarouselSettings } from './carouselSettings.schema';
export type { SingleQuoteSettings } from './singleQuoteSettings.schema';
export type { MarqueeSettings } from './marqueeSettings.schema';
export type { RatingBadgeSettings } from './ratingBadgeSettings.schema';
export type { AvatarsBarSettings } from './avatarsBarSettings.schema';
export type { ToastPopupSettings } from './toastPopupSettings.schema';

/**
 * Canonical widget type literal union.
 */
export type WidgetType =
  | 'wall_of_love'
  | 'carousel'
  | 'single_quote'
  | 'marquee'
  | 'rating_badge'
  | 'avatars_bar'
  | 'toast_popup';

/**
 * Union of all widget settings types.
 */
export type WidgetSettings =
  | WallOfLoveSettings
  | CarouselSettings
  | SingleQuoteSettings
  | MarqueeSettings
  | RatingBadgeSettings
  | AvatarsBarSettings
  | ToastPopupSettings;

/**
 * Type-safe mapping from WidgetType to its specific settings type.
 */
export interface WidgetSettingsMap {
  wall_of_love: WallOfLoveSettings;
  carousel: CarouselSettings;
  single_quote: SingleQuoteSettings;
  marquee: MarqueeSettings;
  rating_badge: RatingBadgeSettings;
  avatars_bar: AvatarsBarSettings;
  toast_popup: ToastPopupSettings;
}

/**
 * Schema registry — maps widget type to its Zod schema.
 */
export const widgetSettingsSchemas: Record<WidgetType, z.ZodSchema> = {
  wall_of_love: WallOfLoveSettingsSchema,
  carousel: CarouselSettingsSchema,
  single_quote: SingleQuoteSettingsSchema,
  marquee: MarqueeSettingsSchema,
  rating_badge: RatingBadgeSettingsSchema,
  avatars_bar: AvatarsBarSettingsSchema,
  toast_popup: ToastPopupSettingsSchema,
};

/**
 * Default settings registry — maps widget type to its defaults.
 */
export const defaultSettingsByType: Record<WidgetType, WidgetSettings> = {
  wall_of_love: defaultWallOfLoveSettings,
  carousel: defaultCarouselSettings,
  single_quote: defaultSingleQuoteSettings,
  marquee: defaultMarqueeSettings,
  rating_badge: defaultRatingBadgeSettings,
  avatars_bar: defaultAvatarsBarSettings,
  toast_popup: defaultToastPopupSettings,
};

/**
 * Parse result type for safe parsing.
 */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Parse widget settings with runtime validation. Throws on invalid data.
 */
export function parseWidgetSettings(widgetType: WidgetType, settings: unknown): WidgetSettings {
  const schema = widgetSettingsSchemas[widgetType];
  if (!schema) {
    throw new Error(`Unknown widget type: ${widgetType}`);
  }
  return schema.parse(settings);
}

/**
 * Safely parse widget settings without throwing.
 */
export function safeParseWidgetSettings(
  widgetType: WidgetType,
  settings: unknown,
): ParseResult<WidgetSettings> {
  const schema = widgetSettingsSchemas[widgetType];
  if (!schema) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: 'custom',
          path: ['widgetType'],
          message: `Unknown widget type: ${widgetType}`,
        },
      ]),
    };
  }
  return schema.safeParse(settings);
}

/**
 * Parse widget settings with fallback to defaults.
 */
export function parseWidgetSettingsWithDefaults(
  widgetType: WidgetType,
  settings: unknown,
): WidgetSettings {
  const result = safeParseWidgetSettings(widgetType, settings);
  if (result.success) {
    return result.data;
  }
  return defaultSettingsByType[widgetType];
}

/**
 * Type-safe parse that returns the specific settings type for a known widget type.
 */
export function parseWidgetSettingsTyped<T extends WidgetType>(
  widgetType: T,
  settings: unknown,
): WidgetSettingsMap[T] {
  return parseWidgetSettings(widgetType, settings) as WidgetSettingsMap[T];
}

/**
 * Get default settings for a widget type.
 */
export function getDefaultSettings(widgetType: WidgetType): WidgetSettings {
  return defaultSettingsByType[widgetType];
}

/**
 * Get type-safe default settings for a known widget type.
 */
export function getDefaultSettingsTyped<T extends WidgetType>(
  widgetType: T,
): WidgetSettingsMap[T] {
  return defaultSettingsByType[widgetType] as WidgetSettingsMap[T];
}

/**
 * Validate settings before saving to database. Throws on invalid data.
 */
export function validateWidgetSettings(widgetType: WidgetType, settings: WidgetSettings): void {
  const schema = widgetSettingsSchemas[widgetType];
  if (!schema) {
    throw new Error(`Unknown widget type: ${widgetType}`);
  }
  schema.parse(settings);
}

// Re-export schemas
export {
  WallOfLoveSettingsSchema,
  CarouselSettingsSchema,
  SingleQuoteSettingsSchema,
  MarqueeSettingsSchema,
  RatingBadgeSettingsSchema,
  AvatarsBarSettingsSchema,
  ToastPopupSettingsSchema,
};

// Re-export defaults
export {
  defaultWallOfLoveSettings,
  defaultCarouselSettings,
  defaultSingleQuoteSettings,
  defaultMarqueeSettings,
  defaultRatingBadgeSettings,
  defaultAvatarsBarSettings,
  defaultToastPopupSettings,
};
