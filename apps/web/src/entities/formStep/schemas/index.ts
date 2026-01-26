/**
 * Step Content Schemas
 *
 * Zod schemas for runtime validation of JSONB step content.
 * Types are inferred from schemas - single source of truth.
 *
 * @example
 * ```ts
 * import {
 *   parseStepContent,
 *   validateStepContent,
 *   type ConsentContent,
 * } from '@/entities/formStep/schemas';
 * ```
 */
export {
  // Parse functions
  parseStepContent,
  safeParseStepContent,
  parseStepContentWithDefaults,
  validateStepContent,
  getDefaultContent,
  // Types
  type StepContent,
  type StepType,
  type WelcomeContent,
  type ConsentContent,
  type ContactInfoContent,
  type ContactField,
  type RewardContent,
  type RewardType,
  type ThankYouContent,
  type TestimonialWriteContent,
  type EmptyContent,
  type ParseResult,
  // Schemas (for advanced use cases)
  WelcomeContentSchema,
  ConsentContentSchema,
  ContactInfoContentSchema,
  RewardContentSchema,
  ThankYouContentSchema,
  TestimonialWriteContentSchema,
  EmptyContentSchema,
  // Defaults
  defaultWelcomeContent,
  defaultConsentContent,
  defaultContactInfoContent,
  defaultRewardContent,
  defaultThankYouContent,
  defaultTestimonialWriteContent,
} from './stepContent.schema';
