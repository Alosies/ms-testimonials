import { z } from 'zod';

/**
 * Flow membership enum for conditional branching
 * - 'shared': Steps visible in all flows (before branch point)
 * - 'testimonial': Steps for positive ratings (rating >= threshold)
 * - 'improvement': Steps for negative ratings (rating < threshold)
 */
export const FlowMembershipSchema = z.enum(['shared', 'testimonial', 'improvement']);

/**
 * Schema for AI question options (for choice_single/choice_multiple)
 */
export const AIQuestionOptionSchema = z.object({
  option_value: z.string().describe('Snake_case stored value (e.g., "yes", "no", "maybe")'),
  option_label: z.string().describe('Display text shown to customer (e.g., "Yes, definitely!")'),
  display_order: z.number().int().describe('Order in option list (1-indexed)'),
});

/**
 * Schema for inferred context from product analysis
 */
export const InferredContextSchema = z.object({
  industry: z.string().describe('The inferred industry/category (e.g., SaaS, e-commerce, course, agency)'),
  audience: z.string().describe('The target audience (e.g., Remote teams, project managers)'),
  tone: z.string().describe('Recommended tone (Professional, Casual, Technical, Friendly)'),
  value_props: z.array(z.string()).describe('Key value propositions inferred from description'),
});

/**
 * Schema for form structure recommendations
 */
export const FormStructureSchema = z.object({
  branching_recommended: z.boolean().describe('Whether rating-based branching is recommended for this form'),
  rating_question_index: z.number().int().describe('0-indexed position of the rating question that serves as the branch point'),
});

/**
 * Schema for consent step content (testimonial flow only)
 */
export const ConsentContentSchema = z.object({
  title: z.string().describe('Title for the consent step (e.g., "One last thing...")'),
  description: z.string().describe('Description explaining what consent means'),
  public_label: z.string().describe('Label for public sharing option'),
  public_description: z.string().describe('Description of what public means'),
  private_label: z.string().describe('Label for private/anonymous option'),
  private_description: z.string().describe('Description of what private means'),
});

/**
 * Schema for testimonial_write step content (testimonial flow only)
 * This step allows users to either let AI assemble their testimonial or write it manually
 */
export const TestimonialWriteContentSchema = z.object({
  title: z.string().describe('Title for the testimonial write step (e.g., "Your testimonial")'),
  subtitle: z.string().describe('Subtitle explaining the purpose (e.g., "Let us craft your story or write it yourself")'),
  ai_path_title: z.string().describe('Title for AI-assisted path (e.g., "Let AI craft your story")'),
  ai_path_description: z.string().describe('Description of what AI path does (e.g., "We\'ll transform your answers into a testimonial you can review and edit")'),
  manual_path_title: z.string().describe('Title for manual writing path (e.g., "Write it yourself")'),
  manual_path_description: z.string().describe('Description of manual path (e.g., "Compose your own testimonial from scratch")'),
});

/**
 * ADR-018: Schema for shared thank you content in outro flow (shown to ALL users)
 */
export const ThankYouSchema = z.object({
  title: z.string().describe('Thank you title for all users (e.g., "Thank you!")'),
  message: z.string().describe('Grateful closing message for all users'),
});

/**
 * Schema for improvement flow thank you content
 * @deprecated Use shared thank_you in outro flow instead (ADR-018)
 * Kept for backward compatibility with existing forms
 */
export const ImprovementThankYouSchema = z.object({
  title: z.string().describe('Thank you title for improvement flow'),
  message: z.string().describe('Thank you message acknowledging their feedback'),
});

/**
 * Schema for step content suggestions
 */
export const StepContentSchema = z.object({
  testimonial_write: TestimonialWriteContentSchema.describe('Content for the testimonial write step in testimonial flow'),
  consent: ConsentContentSchema.describe('Content for the consent step in testimonial flow'),
  thank_you: ThankYouSchema.describe('ADR-018: Shared thank you for ALL users in outro flow'),
  improvement_thank_you: ImprovementThankYouSchema.describe('DEPRECATED: kept for backward compatibility'),
});

/**
 * Type for the AI response schema
 */
export type AIResponseSchema = z.ZodObject<{
  inferred_context: typeof InferredContextSchema;
  form_structure: typeof FormStructureSchema;
  questions: z.ZodArray<z.ZodObject<{
    question_text: z.ZodString;
    question_key: z.ZodString;
    question_type_id: z.ZodEnum<[string, ...string[]]>;
    placeholder: z.ZodNullable<z.ZodString>;
    help_text: z.ZodNullable<z.ZodString>;
    is_required: z.ZodBoolean;
    display_order: z.ZodNumber;
    options: z.ZodNullable<z.ZodArray<typeof AIQuestionOptionSchema>>;
    flow_membership: typeof FlowMembershipSchema;
    is_branch_point: z.ZodBoolean;
  }>>;
  step_content: typeof StepContentSchema;
}>;
