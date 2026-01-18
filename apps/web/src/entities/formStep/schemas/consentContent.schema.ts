/**
 * Consent Step Content Schema
 *
 * Validates the JSONB content for consent step type.
 * Allows customers to choose public or private sharing of their testimonial.
 *
 * @see DB migration: 1767425106405_form_steps__create_table
 */
import { z } from 'zod';

const ConsentOptionSchema = z.object({
  label: z.string(),
  description: z.string(),
});

export const ConsentContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  options: z.object({
    public: ConsentOptionSchema,
    private: ConsentOptionSchema,
  }),
  defaultOption: z.enum(['public', 'private']),
  required: z.boolean(),
});

export type ConsentContent = z.infer<typeof ConsentContentSchema>;

/**
 * Default content for new consent steps
 */
export const defaultConsentContent: ConsentContent = {
  title: 'One last thing...',
  description: 'How would you like us to use your feedback?',
  options: {
    public: {
      label: 'Share publicly',
      description: 'Your testimonial may be featured on our website and marketing materials.',
    },
    private: {
      label: 'Keep private',
      description: 'Your feedback will be used internally to improve our product.',
    },
  },
  defaultOption: 'public',
  required: true,
};
