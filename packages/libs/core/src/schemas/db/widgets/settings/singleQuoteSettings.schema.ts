/**
 * Single Quote Widget Settings Schema
 *
 * Featured testimonial with auto-rotation through multiple quotes.
 * Defaults match the values in the embed renderer.
 */
import { z } from 'zod';

export const SingleQuoteSettingsSchema = z.object({
  rotation_interval: z.number().min(1000).default(5000),
  transition_duration: z.number().min(100).default(400),
  card_border_radius: z.number().min(0).default(12),
});

export type SingleQuoteSettings = z.infer<typeof SingleQuoteSettingsSchema>;

export const defaultSingleQuoteSettings: SingleQuoteSettings = {
  rotation_interval: 5000,
  transition_duration: 400,
  card_border_radius: 12,
};
