/**
 * Assemble Testimonial Endpoint
 * POST /ai/assemble-testimonial
 *
 * Contract with API schema: api/src/shared/schemas/ai.ts
 *
 * @see PRD-005: AI Testimonial Generation
 */

/**
 * Answer input for testimonial assembly
 */
export interface TestimonialAnswer {
  question_text: string;
  question_key: string;
  answer: string;
}

/**
 * Modification request for refining a testimonial
 */
export interface TestimonialModification {
  type: 'suggestion';
  suggestion_id: string;
  suggestion_label?: string;
  suggestion_description?: string;
  previous_testimonial: string;
}

/**
 * Quality tier for AI generation
 */
export type TestimonialQuality = 'fast' | 'enhanced' | 'premium';

/**
 * Request schema for /ai/assemble-testimonial
 * Matches: AssembleTestimonialRequestSchema
 */
export interface AssembleTestimonialRequest {
  form_id: string;
  answers: TestimonialAnswer[];
  rating?: number;
  quality?: TestimonialQuality;
  modification?: TestimonialModification;
  customer_credential?: string;
}

/**
 * Suggestion for testimonial modifications
 */
export interface TestimonialSuggestion {
  id: string;
  label: string;
  description: string;
  applicability: number;
}

/**
 * Tone analysis for the generated testimonial
 */
export interface TestimonialTone {
  formality: 'formal' | 'neutral' | 'casual';
  energy: 'enthusiastic' | 'neutral' | 'reserved';
  confidence: 'assertive' | 'neutral' | 'humble';
}

/**
 * Metadata about the generated testimonial
 */
export interface TestimonialMetadata {
  word_count: number;
  reading_time_seconds: number;
  tone: TestimonialTone;
  key_themes: string[];
}

/**
 * Response schema for /ai/assemble-testimonial
 * Matches: AssembleTestimonialResponseSchema
 */
export interface AssembleTestimonialResponse {
  testimonial: string;
  suggestions: TestimonialSuggestion[];
  metadata: TestimonialMetadata;
  generations_remaining?: number | null;
}
