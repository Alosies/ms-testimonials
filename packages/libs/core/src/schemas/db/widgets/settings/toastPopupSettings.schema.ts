/**
 * Toast Popup Widget Settings Schema
 *
 * Floating notification showing one testimonial at a time.
 *
 * @see ADR-027: Widget Types Expansion
 */
import { z } from 'zod';

export const ToastPopupSettingsSchema = z.object({
  position: z.enum(['bottom-left', 'bottom-right', 'top-left', 'top-right']).default('bottom-left'),
  display_duration: z.number().min(1000).default(8000),
  rotation_interval: z.number().min(1000).default(15000),
  delay_before_first: z.number().min(0).default(3000),
  max_per_session: z.number().int().min(1).default(5),
  show_dismiss: z.boolean().default(true),
  animate_in: z.enum(['slide', 'fade']).default('slide'),
});

export type ToastPopupSettings = z.infer<typeof ToastPopupSettingsSchema>;

export const defaultToastPopupSettings: ToastPopupSettings = {
  position: 'bottom-left',
  display_duration: 8000,
  rotation_interval: 15000,
  delay_before_first: 3000,
  max_per_session: 5,
  show_dismiss: true,
  animate_in: 'slide',
};
