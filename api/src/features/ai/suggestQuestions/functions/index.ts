// =============================================================================
// Pure Functions
// =============================================================================

export { buildUserMessage } from './buildUserMessage';
export { buildAvailableTypesSection } from './buildAvailableTypesSection';
export { buildDynamicAIResponseSchema } from './buildDynamicAIResponseSchema';

// =============================================================================
// Zod Schemas (Pure, no side effects)
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
} from './schemas';
