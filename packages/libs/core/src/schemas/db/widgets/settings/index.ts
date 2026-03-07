/**
 * Schemas for widgets.settings JSONB column
 *
 * Single source of truth — all consumers import from here.
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
} from './widgetSettings.schema';
