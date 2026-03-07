/**
 * Marquee Widget Settings Schema
 *
 * Auto-scrolling horizontal strip of testimonial cards.
 *
 * @see ADR-027: Widget Types Expansion
 */
import { z } from 'zod';

export const MarqueeSettingsSchema = z.object({
  speed: z.number().default(30),
  direction: z.enum(['left', 'right']).default('left'),
  pause_on_hover: z.boolean().default(true),
  card_style: z.enum(['compact', 'full']).default('compact'),
});

export type MarqueeSettings = z.infer<typeof MarqueeSettingsSchema>;

export const defaultMarqueeSettings: MarqueeSettings = {
  speed: 30,
  direction: 'left',
  pause_on_hover: true,
  card_style: 'compact',
};
