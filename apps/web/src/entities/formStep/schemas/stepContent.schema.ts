/**
 * Step Content Schema - Union and Parse Functions
 *
 * Provides runtime validation for JSONB step content.
 * This is the ONLY client-side validation for content structure.
 *
 * IMPORTANT: All content must pass through these parse functions
 * when reading from or writing to the database.
 *
 * @see ADR-011: Immediate Save Actions
 */
import { z } from 'zod';
import {
  WelcomeContentSchema,
  defaultWelcomeContent,
  type WelcomeContent,
} from './welcomeContent.schema';
import {
  ConsentContentSchema,
  defaultConsentContent,
  type ConsentContent,
} from './consentContent.schema';
import {
  ContactInfoContentSchema,
  defaultContactInfoContent,
  type ContactInfoContent,
} from './contactInfoContent.schema';
import {
  RewardContentSchema,
  defaultRewardContent,
  type RewardContent,
} from './rewardContent.schema';
import {
  ThankYouContentSchema,
  defaultThankYouContent,
  type ThankYouContent,
} from './thankYouContent.schema';
import {
  TestimonialWriteContentSchema,
  defaultTestimonialWriteContent,
  type TestimonialWriteContent,
} from './testimonialWriteContent.schema';

// Re-export individual content types
export type { WelcomeContent } from './welcomeContent.schema';
export type { ConsentContent } from './consentContent.schema';
export type { ContactInfoContent, ContactField } from './contactInfoContent.schema';
export type { RewardContent, RewardType } from './rewardContent.schema';
export type { ThankYouContent } from './thankYouContent.schema';
export type { TestimonialWriteContent } from './testimonialWriteContent.schema';

/**
 * Empty content schema for question/rating steps
 * These step types store their data in form_questions table, not content
 */
export const EmptyContentSchema = z.object({}).strict();
export type EmptyContent = z.infer<typeof EmptyContentSchema>;

/**
 * Union type for all step content types
 */
export type StepContent =
  | WelcomeContent
  | ConsentContent
  | ContactInfoContent
  | RewardContent
  | ThankYouContent
  | TestimonialWriteContent
  | EmptyContent;

/**
 * Step type literal
 */
export type StepType =
  | 'welcome'
  | 'question'
  | 'rating'
  | 'consent'
  | 'contact_info'
  | 'reward'
  | 'thank_you'
  | 'testimonial_write';

/**
 * Map of step types to their content schemas
 */
const stepContentSchemas: Record<StepType, z.ZodSchema> = {
  welcome: WelcomeContentSchema,
  question: EmptyContentSchema,
  rating: EmptyContentSchema,
  consent: ConsentContentSchema,
  contact_info: ContactInfoContentSchema,
  reward: RewardContentSchema,
  thank_you: ThankYouContentSchema,
  testimonial_write: TestimonialWriteContentSchema,
};

/**
 * Map of step types to their default content
 */
const defaultContentByType: Record<StepType, StepContent> = {
  welcome: defaultWelcomeContent,
  question: {},
  rating: {},
  consent: defaultConsentContent,
  contact_info: defaultContactInfoContent,
  reward: defaultRewardContent,
  thank_you: defaultThankYouContent,
  testimonial_write: defaultTestimonialWriteContent,
};

/**
 * Parse result type for safe parsing
 */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Parse step content with runtime validation.
 * Use this when reading content from the database.
 *
 * @param stepType - The step type determines which schema to use
 * @param content - Raw content from database (unknown type)
 * @returns Validated and typed content
 * @throws ZodError if content doesn't match expected schema
 *
 * @example
 * ```ts
 * // In stepTransform.ts
 * content: parseStepContent(step.step_type, step.content),
 * ```
 */
export function parseStepContent(stepType: StepType, content: unknown): StepContent {
  const schema = stepContentSchemas[stepType];
  if (!schema) {
    throw new Error(`Unknown step type: ${stepType}`);
  }
  return schema.parse(content);
}

/**
 * Safely parse step content without throwing.
 * Returns a result object indicating success or failure.
 *
 * @param stepType - The step type determines which schema to use
 * @param content - Raw content from database (unknown type)
 * @returns Parse result with typed data or error
 *
 * @example
 * ```ts
 * const result = safeParseStepContent('consent', rawContent);
 * if (result.success) {
 *   console.log(result.data.required);
 * } else {
 *   console.error(result.error.issues);
 * }
 * ```
 */
export function safeParseStepContent(
  stepType: StepType,
  content: unknown,
): ParseResult<StepContent> {
  const schema = stepContentSchemas[stepType];
  if (!schema) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: 'custom',
          path: ['stepType'],
          message: `Unknown step type: ${stepType}`,
        },
      ]),
    };
  }
  return schema.safeParse(content);
}

/**
 * Parse step content with fallback to defaults.
 * Use this for graceful degradation when content may be malformed.
 *
 * @param stepType - The step type determines which schema to use
 * @param content - Raw content from database (unknown type)
 * @returns Validated content, or default content if validation fails
 *
 * @example
 * ```ts
 * // Graceful parsing that won't crash on bad data
 * content: parseStepContentWithDefaults(step.step_type, step.content),
 * ```
 */
export function parseStepContentWithDefaults(
  stepType: StepType,
  content: unknown,
): StepContent {
  const result = safeParseStepContent(stepType, content);
  if (result.success) {
    return result.data;
  }
  console.warn(
    `[parseStepContent] Invalid content for ${stepType}, using defaults:`,
    result.error.issues,
  );
  return defaultContentByType[stepType];
}

/**
 * Get default content for a step type.
 *
 * @param stepType - The step type
 * @returns Default content for that step type
 */
export function getDefaultContent(stepType: StepType): StepContent {
  return defaultContentByType[stepType];
}

/**
 * Validate content before saving to database.
 * Use this in save operations to ensure data integrity.
 *
 * @param stepType - The step type determines which schema to use
 * @param content - Content to validate
 * @throws ZodError if content is invalid
 *
 * @example
 * ```ts
 * // In useStepContentSettings.ts
 * validateStepContent('consent', updatedContent);
 * await updateFormStepAutoSave({ ... });
 * ```
 */
export function validateStepContent(stepType: StepType, content: StepContent): void {
  const schema = stepContentSchemas[stepType];
  if (!schema) {
    throw new Error(`Unknown step type: ${stepType}`);
  }
  schema.parse(content);
}

// Re-export schemas for direct access if needed
// Note: EmptyContentSchema is defined in this file, so not re-exported here
export {
  WelcomeContentSchema,
  ConsentContentSchema,
  ContactInfoContentSchema,
  RewardContentSchema,
  ThankYouContentSchema,
  TestimonialWriteContentSchema,
};

// Re-export defaults
export {
  defaultWelcomeContent,
  defaultConsentContent,
  defaultContactInfoContent,
  defaultRewardContent,
  defaultThankYouContent,
  defaultTestimonialWriteContent,
};
