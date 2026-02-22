/**
 * Form Submission Schemas
 *
 * Zod schemas for validating form submission requests.
 * Used by the POST /testimonials endpoint.
 *
 * ADR Reference: ADR-025 Testimonials Display (Phase 5a)
 */

import { z } from 'zod';

/**
 * Contact information for the person submitting the testimonial
 */
export const ContactSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  companyName: z.string().max(200).optional(),
  linkedinUrl: z.string().url().max(500).optional(),
  twitterUrl: z.string().url().max(500).optional(),
  avatarUrl: z.string().url().max(2000).optional(),
});

/**
 * A single question response
 */
export const QuestionResponseSchema = z.object({
  questionId: z.string().max(50),
  answerText: z.string().max(5000).optional(),
  answerInteger: z.number().int().optional(),
  answerBoolean: z.boolean().optional(),
  answerJson: z.unknown().optional(),
  answerUrl: z.string().url().max(2000).optional(),
});

/**
 * Full form submission request body
 */
export const SubmitFormRequestSchema = z.object({
  formId: z.string().max(50),
  organizationId: z.string().max(50),
  contact: ContactSchema,
  consentType: z.enum(['public', 'private']).optional(),
  questionResponses: z.array(QuestionResponseSchema).max(50),
  testimonialContent: z.string().max(10000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export type SubmitFormRequest = z.infer<typeof SubmitFormRequestSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type QuestionResponseInput = z.infer<typeof QuestionResponseSchema>;

/**
 * Response from successful form submission
 */
export const SubmitFormResponseSchema = z.object({
  success: z.boolean(),
  submissionId: z.string(),
  testimonialId: z.string().optional(),
});

export type SubmitFormResponse = z.infer<typeof SubmitFormResponseSchema>;
