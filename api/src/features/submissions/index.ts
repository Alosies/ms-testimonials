/**
 * Submissions Feature - Public API
 *
 * Persists form submissions with contacts, question responses, and testimonials.
 * Uses Drizzle transactions for atomic multi-table writes.
 *
 * ADR Reference: ADR-025 Testimonials Display (Phase 5a)
 */

// Types
export type {
  SubmitFormRequest,
  SubmitFormResponse,
  ContactInput,
  QuestionResponseInput,
} from './schemas';

export type {
  SubmitFormResult,
  ContactRow,
  SubmissionRow,
  TestimonialRow,
} from './types';

// Schemas
export { SubmitFormRequestSchema, SubmitFormResponseSchema } from './schemas';

// Operations
export { submitForm } from './operations/submitForm';
