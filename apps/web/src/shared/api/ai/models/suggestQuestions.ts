/**
 * Suggest Questions Endpoint
 * POST /ai/suggest-questions
 *
 * Contract with API schema: api/src/shared/schemas/ai.ts
 */

/**
 * AI-suggested question structure
 * Matches: AIQuestionSchema
 */
export interface AIQuestion {
  question_text: string;
  question_key: string;
  question_type_id: string;
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  display_order: number;
}

/**
 * AI inferred context from product description
 * Matches: AIContextSchema
 */
export interface AIContext {
  industry: string;
  audience: string;
  tone: string;
  value_props: string[];
}

/**
 * Request schema for /ai/suggest-questions
 * Matches: SuggestQuestionsRequestSchema
 */
export interface SuggestQuestionsRequest {
  product_name: string;
  product_description: string;
  focus_areas?: string; // Optional guidance for question generation
}

/**
 * Response schema for /ai/suggest-questions
 * Matches: SuggestQuestionsResponseSchema
 */
export interface SuggestQuestionsResponse {
  inferred_context: AIContext;
  questions: AIQuestion[];
}
