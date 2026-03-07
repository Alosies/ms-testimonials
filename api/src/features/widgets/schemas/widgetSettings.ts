/**
 * Widget Settings — Re-export from @testimonials/core
 *
 * The single source of truth lives in @testimonials/core/schemas/db/widgets.
 * This file creates the combined WidgetSettingsSchema union for OpenAPI use.
 */
import { z } from 'zod';
import {
  WallOfLoveSettingsSchema,
  CarouselSettingsSchema,
  SingleQuoteSettingsSchema,
  MarqueeSettingsSchema,
  RatingBadgeSettingsSchema,
  AvatarsBarSettingsSchema,
  ToastPopupSettingsSchema,
} from '@testimonials/core/schemas/db/widgets';

export {
  type WidgetType,
  type WidgetSettings,
  type WidgetSettingsMap,
  widgetSettingsSchemas,
  defaultSettingsByType,
  getDefaultSettings as getDefaultSettingsForType,
  parseWidgetSettings as parseSettingsForType,
} from '@testimonials/core/schemas/db/widgets';

/**
 * Combined schema that accepts any valid widget settings object.
 * Used in API response/request schemas where the widget type is
 * already present as a sibling field.
 */
export const WidgetSettingsSchema = z.union([
  WallOfLoveSettingsSchema,
  CarouselSettingsSchema,
  SingleQuoteSettingsSchema,
  MarqueeSettingsSchema,
  RatingBadgeSettingsSchema,
  AvatarsBarSettingsSchema,
  ToastPopupSettingsSchema,
]);
