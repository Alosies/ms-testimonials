/**
 * Thank You Step Content Schema
 *
 * Validates the JSONB content for thank_you step type.
 * The completion screen shown after form submission.
 *
 * @see DB migration: 1767425106405_form_steps__create_table
 */
import { z } from 'zod';

export const ThankYouContentSchema = z.object({
  title: z.string(),
  message: z.string(),
  showSocialShare: z.boolean(),
  socialShareMessage: z.string().optional(),
  redirectUrl: z.string().optional(),
  redirectDelay: z.number().optional(),
});

export type ThankYouContent = z.infer<typeof ThankYouContentSchema>;

/**
 * Default content for new thank_you steps
 */
export const defaultThankYouContent: ThankYouContent = {
  title: 'Thank you!',
  message: 'We really appreciate you taking the time to share your experience.',
  showSocialShare: false,
};
