/**
 * Widget Settings Schema — Re-export from @testimonials/core
 *
 * The single source of truth lives in @testimonials/core/schemas/db/widgets.
 * This file re-exports everything for the web app's entity layer.
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
  // Registries
  widgetSettingsSchemas,
  defaultSettingsByType,
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
  // Schemas
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
} from '@testimonials/core/schemas/db/widgets';
