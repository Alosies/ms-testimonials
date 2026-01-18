/**
 * Contact Info Step Content Schema
 *
 * Validates the JSONB content for contact_info step type.
 * Collects submitter details like name, email, company, etc.
 *
 * @see DB migration: 1767425106405_form_steps__create_table
 */
import { z } from 'zod';

/**
 * Available contact fields that can be enabled/required
 */
export const ContactFieldSchema = z.enum([
  'name',
  'email',
  'photo',
  'jobTitle',
  'company',
  'website',
  'linkedin',
  'twitter',
]);

export type ContactField = z.infer<typeof ContactFieldSchema>;

export const ContactInfoContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  enabledFields: z.array(ContactFieldSchema),
  requiredFields: z.array(ContactFieldSchema),
});

export type ContactInfoContent = z.infer<typeof ContactInfoContentSchema>;

/**
 * Default content for new contact_info steps
 */
export const defaultContactInfoContent: ContactInfoContent = {
  title: 'Tell us about yourself',
  subtitle: 'This helps us personalize your testimonial.',
  enabledFields: ['name', 'email', 'jobTitle', 'company'],
  requiredFields: ['name', 'email'],
};
