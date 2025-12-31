// Common schemas
export {
  nonEmptyString,
  emailSchema,
  optionalEmailSchema,
  urlSchema,
  optionalUrlSchema,
  slugSchema,
  nanoIdSchema,
  ratingSchema,
  optionalRatingSchema,
  consentSchema,
  textWithMinLength,
  textWithLength,
  nameSchema,
  optionalNameSchema,
} from './common';

// Testimonial schemas
export {
  // Step schemas
  problemStepSchema,
  solutionStepSchema,
  resultStepSchema,
  attributionStepSchema,
  // Complete form schemas
  smartPromptFormSchema,
  directTestimonialSchema,
  testimonialReviewSchema,
  // Step schemas map
  smartPromptStepSchemas,
} from './testimonial';

// Type exports
export type {
  SmartPromptFormValues,
  ProblemStepValues,
  SolutionStepValues,
  ResultStepValues,
  AttributionStepValues,
  DirectTestimonialValues,
  TestimonialReviewValues,
  SmartPromptStepName,
} from './testimonial';
