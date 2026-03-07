/**
 * Avatars Bar Widget Settings Schema
 *
 * Overlapping customer profile photos with a trust statement.
 *
 * @see ADR-027: Widget Types Expansion
 */
import { z } from 'zod';

export const AvatarsBarSettingsSchema = z.object({
  max_avatars: z.number().int().min(1).default(5),
  overlap_px: z.number().min(0).default(8),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  label_template: z.string().default('Trusted by {count} happy customers'),
  show_rating: z.boolean().default(true),
});

export type AvatarsBarSettings = z.infer<typeof AvatarsBarSettingsSchema>;

export const defaultAvatarsBarSettings: AvatarsBarSettings = {
  max_avatars: 5,
  overlap_px: 8,
  size: 'medium',
  label_template: 'Trusted by {count} happy customers',
  show_rating: true,
};
