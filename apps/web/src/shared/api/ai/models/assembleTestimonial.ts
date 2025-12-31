/**
 * Assemble Testimonial Endpoint
 * POST /ai/assemble
 *
 * Contract with API schema: api/src/shared/schemas/ai.ts
 */

/**
 * Question-answer pair for testimonial assembly
 */
export interface QuestionAnswerPair {
  question: string;
  answer: string;
}

/**
 * Request schema for /ai/assemble
 * Matches: AssembleTestimonialRequestSchema
 */
export interface AssembleTestimonialRequest {
  product_name: string;
  answers: QuestionAnswerPair[];
}

/**
 * Response schema for /ai/assemble
 * Matches: AssembleTestimonialResponseSchema
 */
export interface AssembleTestimonialResponse {
  testimonial: string;
}
