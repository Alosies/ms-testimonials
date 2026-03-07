/**
 * Carousel Widget Settings Schema
 *
 * Slideshow of testimonial cards with prev/next navigation and dots.
 * Defaults match the values in the embed renderer.
 */
import { z } from 'zod';

export const CarouselSettingsSchema = z.object({
  autoplay: z.boolean().default(false),
  autoplay_interval: z.number().min(1000).default(5000),
  transition_duration: z.number().min(100).default(300),
  show_navigation: z.boolean().default(true),
  show_dots: z.boolean().default(true),
  card_border_radius: z.number().min(0).default(12),
});

export type CarouselSettings = z.infer<typeof CarouselSettingsSchema>;

export const defaultCarouselSettings: CarouselSettings = {
  autoplay: false,
  autoplay_interval: 5000,
  transition_duration: 300,
  show_navigation: true,
  show_dots: true,
  card_border_radius: 12,
};
