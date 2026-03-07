/**
 * Rating Badge Widget Settings Schema
 *
 * Compact badge showing aggregate star rating and review count.
 *
 * @see ADR-027: Widget Types Expansion
 */
import { z } from 'zod';

export const RatingBadgeSettingsSchema = z.object({
  style: z.enum(['inline', 'card']).default('card'),
  show_count: z.boolean().default(true),
  show_average: z.boolean().default(true),
  link_to_wall: z.string().nullable().default(null),
});

export type RatingBadgeSettings = z.infer<typeof RatingBadgeSettingsSchema>;

export const defaultRatingBadgeSettings: RatingBadgeSettings = {
  style: 'card',
  show_count: true,
  show_average: true,
  link_to_wall: null,
};
