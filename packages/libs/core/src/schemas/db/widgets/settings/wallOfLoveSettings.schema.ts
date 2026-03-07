/**
 * Wall of Love Widget Settings Schema
 *
 * Masonry grid layout showing multiple testimonial cards.
 * Defaults match the values in the embed renderer.
 */
import { z } from 'zod';

export const WallOfLoveSettingsSchema = z.object({
  columns: z.number().int().min(1).max(6).default(3),
  column_gap: z.number().min(0).default(16),
  card_border_radius: z.number().min(0).default(12),
});

export type WallOfLoveSettings = z.infer<typeof WallOfLoveSettingsSchema>;

export const defaultWallOfLoveSettings: WallOfLoveSettings = {
  columns: 3,
  column_gap: 16,
  card_border_radius: 12,
};
