/**
 * Welcome Step Content Schema
 *
 * Validates the JSONB content for welcome step type.
 * This is the intro screen shown at the start of a form.
 *
 * @see DB migration: 1767425106405_form_steps__create_table
 */
import { z } from 'zod';

export const WelcomeContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  buttonText: z.string(),
});

export type WelcomeContent = z.infer<typeof WelcomeContentSchema>;

/**
 * Default content for new welcome steps
 */
export const defaultWelcomeContent: WelcomeContent = {
  title: 'Share Your Experience',
  subtitle: 'We\'d love to hear about your experience with our product.',
  buttonText: 'Get Started',
};
