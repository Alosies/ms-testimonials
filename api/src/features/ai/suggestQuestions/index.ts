/**
 * Suggest Questions Feature
 * @see PRD-005: AI Question Generation
 *
 * Generates AI-suggested questions for testimonial collection forms
 * based on product information and organization's plan capabilities.
 */

// =============================================================================
// Handlers (HTTP handlers and impure operations)
// =============================================================================

export { suggestQuestions } from './handlers';

// =============================================================================
// Functions (Pure functions)
// =============================================================================

export {
  buildUserMessage,
  buildAvailableTypesSection,
  buildDynamicAIResponseSchema,
} from './functions';

// =============================================================================
// Schemas (Zod schemas for validation)
// =============================================================================

export {
  FlowMembershipSchema,
  AIQuestionOptionSchema,
  InferredContextSchema,
  FormStructureSchema,
  ConsentContentSchema,
  TestimonialWriteContentSchema,
  ThankYouSchema,
  ImprovementThankYouSchema,
  StepContentSchema,
  type AIResponseSchema,
} from './functions';

// =============================================================================
// Prompts (AI prompt templates)
// =============================================================================

export { buildSystemPrompt } from './prompts';

// =============================================================================
// Default export (for route registration)
// =============================================================================

export { suggestQuestions as default } from './handlers';
