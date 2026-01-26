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
 * Flow membership for conditional branching
 * - 'shared': Steps visible in all flows (both intro AND ending)
 * - 'testimonial': Steps for positive ratings (rating >= threshold)
 * - 'improvement': Steps for negative ratings (rating < threshold)
 *
 * ADR-009: Position (intro vs ending) is determined by the flow's display_order,
 * not by a separate membership value.
 */
export type FlowMembership = 'shared' | 'testimonial' | 'improvement';

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
  flow_membership: FlowMembership;    // Which flow this question belongs to
  is_branch_point: boolean;           // True only for the rating question that determines flow branch
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
 * Form structure recommendations from AI
 */
export interface FormStructure {
  branching_recommended: boolean;     // Whether rating-based branching is recommended
  rating_question_index: number;      // 0-indexed position of the rating (branch point) question
}

/**
 * Testimonial write step content for testimonial flow
 * This step allows users to either let AI assemble their testimonial or write it manually
 */
export interface TestimonialWriteContent {
  title: string;
  subtitle: string;
  ai_path_title: string;
  ai_path_description: string;
  manual_path_title: string;
  manual_path_description: string;
}

/**
 * Consent step content for testimonial flow
 */
export interface ConsentContent {
  title: string;
  description: string;
  public_label: string;
  public_description: string;
  private_label: string;
  private_description: string;
}

/**
 * ADR-018: Shared thank you content for ALL users in outro flow
 */
export interface ThankYou {
  title: string;
  message: string;
}

/**
 * Improvement flow thank you content
 * @deprecated Use shared thank_you in outro flow instead (ADR-018)
 */
export interface ImprovementThankYou {
  title: string;
  message: string;
}

/**
 * Step content suggestions for system-generated steps
 */
export interface StepContent {
  testimonial_write: TestimonialWriteContent; // Content for testimonial write step in testimonial flow
  consent: ConsentContent;                   // Content for consent step in testimonial flow
  thank_you: ThankYou;                       // ADR-018: Shared thank you for ALL users in outro flow
  improvement_thank_you: ImprovementThankYou; // DEPRECATED: kept for backward compatibility
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
  form_structure: FormStructure;
  questions: AIQuestion[];
  step_content: StepContent;
}
