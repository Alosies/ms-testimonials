/**
 * Assemble Testimonial Feature
 *
 * AI-powered testimonial assembly from customer Q&A responses.
 * Uses the credit system for usage tracking and access control.
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-023: AI Capabilities Plan Integration
 */

// =============================================================================
// Handlers (HTTP handlers and impure operations)
// =============================================================================

export {
  // HTTP handler
  assembleTestimonial,

  // Data fetching
  getFormById,
  type FormData,
  type GetFormByIdResult,

  // AI execution
  executeAssembly,
  type AssemblyResult,
  type ExecuteAssemblyParams,
  type ExecuteAssemblyResult,
} from './handlers';

// =============================================================================
// Functions (Pure functions)
// =============================================================================

export {
  buildUserMessage,
  deriveSuggestions,
  analyzeTestimonial,
} from './functions';

// =============================================================================
// Prompts (AI prompt templates)
// =============================================================================

export { TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT } from './prompts';

// =============================================================================
// Default export (for route registration)
// =============================================================================

export { assembleTestimonial as default } from './handlers';
