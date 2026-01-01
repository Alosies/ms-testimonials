/**
 * Suggest Questions Endpoint
 * POST /ai/suggest-questions
 *
 * Contract with API schema: api/src/shared/schemas/ai.ts
 */

/**
 * MVP Question Types for AI-generated forms
 * Maps to: question_types.unique_name in database
 *
 * Free plan types: text_short, text_long, rating_star, input_checkbox
 * Pro plan adds: text_email, choice_single, choice_multiple, rating_scale, input_switch
 */
export type QuestionTypeId =
  | 'text_short'      // Name, company, title fields
  | 'text_long'       // Testimonial answers (problem, solution, result)
  | 'text_email'      // Email address with validation
  | 'rating_star'     // Overall satisfaction rating (1-5)
  | 'rating_scale'    // Linear scale (1-10)
  | 'choice_single'   // Single choice (radio buttons)
  | 'choice_multiple' // Multiple choice (checkboxes)
  | 'input_checkbox'  // Agreement/consent checkbox (boolean)
  | 'input_switch';   // On/Off toggle switch (boolean)

/**
 * Question option for choice_single and choice_multiple questions
 * Maps to: question_options table
 */
export interface AIQuestionOption {
  option_value: string;   // Snake_case stored value (e.g., "yes", "no")
  option_label: string;   // Display text (e.g., "Yes, definitely!")
  display_order: number;  // Order in list (1-indexed)
}

/**
 * AI-suggested question structure
 * Matches: AIQuestionSchema
 */
export interface AIQuestion {
  question_text: string;
  question_key: string;
  question_type_id: QuestionTypeId;
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  display_order: number;
  options: AIQuestionOption[] | null; // Required for choice_single/choice_multiple, null for others
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
