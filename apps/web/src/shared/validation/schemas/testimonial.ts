import { z } from 'zod';
import {
  textWithMinLength,
  nameSchema,
  optionalNameSchema,
  optionalEmailSchema,
  optionalUrlSchema,
  optionalRatingSchema,
  consentSchema,
} from './common';

/**
 * Minimum character count for testimonial content fields
 */
const MIN_CONTENT_LENGTH = 10;

/**
 * Smart Prompt Step Schemas
 * Each step of the guided testimonial collection flow
 */

/**
 * Step 1: Problem - What challenge were you facing?
 */
export const problemStepSchema = z.object({
  problem: textWithMinLength(MIN_CONTENT_LENGTH, 'Your answer').describe(
    'What challenge or problem were you facing before?'
  ),
});

/**
 * Step 2: Solution - How did our product help?
 */
export const solutionStepSchema = z.object({
  solution: textWithMinLength(MIN_CONTENT_LENGTH, 'Your answer').describe(
    'How did our product/service help solve your problem?'
  ),
});

/**
 * Step 3: Result - What outcome did you achieve?
 */
export const resultStepSchema = z.object({
  result: textWithMinLength(MIN_CONTENT_LENGTH, 'Your answer').describe(
    'What results or benefits have you experienced?'
  ),
});

/**
 * Step 4: Attribution - Who are you?
 */
export const attributionStepSchema = z.object({
  attribution: z.object({
    name: nameSchema.describe('Your full name'),
    role: optionalNameSchema.describe('Your job title or role'),
    company: optionalNameSchema.describe('Your company or organization'),
    email: optionalEmailSchema.describe('Your email address'),
    avatarUrl: optionalUrlSchema.describe('URL to your profile photo'),
  }),
  rating: optionalRatingSchema.describe('Overall rating (1-5 stars)'),
  consent: consentSchema.describe('Permission to use this testimonial'),
});

/**
 * Complete Smart Prompt Form Schema
 * Combines all steps into a single validation schema
 */
export const smartPromptFormSchema = z.object({
  problem: problemStepSchema.shape.problem,
  solution: solutionStepSchema.shape.solution,
  result: resultStepSchema.shape.result,
  ...attributionStepSchema.shape,
});

/**
 * Type inference for smart prompt form values
 */
export type SmartPromptFormValues = z.infer<typeof smartPromptFormSchema>;
export type ProblemStepValues = z.infer<typeof problemStepSchema>;
export type SolutionStepValues = z.infer<typeof solutionStepSchema>;
export type ResultStepValues = z.infer<typeof resultStepSchema>;
export type AttributionStepValues = z.infer<typeof attributionStepSchema>;

/**
 * Direct testimonial submission schema
 * For simple text-only testimonial submission (non-guided)
 */
export const directTestimonialSchema = z.object({
  content: textWithMinLength(20, 'Testimonial').describe(
    'Your testimonial message'
  ),
  attribution: z.object({
    name: nameSchema,
    role: optionalNameSchema,
    company: optionalNameSchema,
    email: optionalEmailSchema,
  }),
  rating: optionalRatingSchema,
  consent: consentSchema,
});

export type DirectTestimonialValues = z.infer<typeof directTestimonialSchema>;

/**
 * Testimonial approval/rejection schema (admin action)
 */
export const testimonialReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  internalNotes: z.string().optional(),
});

export type TestimonialReviewValues = z.infer<typeof testimonialReviewSchema>;

/**
 * Step schemas map for multi-step form validation
 */
export const smartPromptStepSchemas = {
  problem: problemStepSchema,
  solution: solutionStepSchema,
  result: resultStepSchema,
  attribution: attributionStepSchema,
} as const;

export type SmartPromptStepName = keyof typeof smartPromptStepSchemas;
