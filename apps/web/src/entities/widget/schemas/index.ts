/**
 * Widget Settings Schemas
 *
 * Zod schemas for runtime validation of the JSONB settings column.
 * Types are inferred from schemas — single source of truth.
 *
 * @example
 * ```ts
 * import {
 *   parseWidgetSettingsWithDefaults,
 *   validateWidgetSettings,
 *   getDefaultSettings,
 *   type WidgetType,
 *   type MarqueeSettings,
 * } from '@/entities/widget/schemas';
 * ```
 */
export {
  // Parse functions
  parseWidgetSettings,
  safeParseWidgetSettings,
  parseWidgetSettingsWithDefaults,
  parseWidgetSettingsTyped,
  validateWidgetSettings,
  getDefaultSettings,
  getDefaultSettingsTyped,
  // Types
  type WidgetType,
  type WidgetSettings,
  type WidgetSettingsMap,
  type WallOfLoveSettings,
  type CarouselSettings,
  type SingleQuoteSettings,
  type MarqueeSettings,
  type RatingBadgeSettings,
  type AvatarsBarSettings,
  type ToastPopupSettings,
  type ParseResult,
  // Schemas (for advanced use cases)
  WallOfLoveSettingsSchema,
  CarouselSettingsSchema,
  SingleQuoteSettingsSchema,
  MarqueeSettingsSchema,
  RatingBadgeSettingsSchema,
  AvatarsBarSettingsSchema,
  ToastPopupSettingsSchema,
  // Defaults
  defaultWallOfLoveSettings,
  defaultCarouselSettings,
  defaultSingleQuoteSettings,
  defaultMarqueeSettings,
  defaultRatingBadgeSettings,
  defaultAvatarsBarSettings,
  defaultToastPopupSettings,
} from './widgetSettings.schema';
