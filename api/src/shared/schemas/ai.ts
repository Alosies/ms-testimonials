/**
 * Zod schemas for AI-related endpoints
 */

import { z } from '@hono/zod-openapi';

/**
 * Question option for choice_single and choice_multiple questions
 */
export const AIQuestionOptionSchema = z.object({
  option_value: z.string().openapi({
    example: 'yes',
    description: 'Snake_case stored value (saved in database)',
  }),
  option_label: z.string().openapi({
    example: 'Yes, definitely!',
    description: 'Display text shown to customer',
  }),
  display_order: z.number().int().openapi({
    example: 1,
    description: 'Order in option list (1-indexed)',
  }),
}).openapi('AIQuestionOption');

/**
 * Flow membership for conditional branching
 */
export const FlowMembershipSchema = z.enum(['shared', 'testimonial', 'improvement']).openapi({
  example: 'shared',
  description: 'Which flow this question belongs to: shared (before rating), testimonial (positive path), or improvement (negative path)',
});

/**
 * AI-suggested question structure
 */
export const AIQuestionSchema = z.object({
  question_text: z.string().openapi({
    example: 'What was your biggest challenge before using TaskFlow?',
    description: 'The question text to display to customers',
  }),
  question_key: z.string().openapi({
    example: 'problem_before',
    description: 'Unique key identifier for the question (snake_case)',
  }),
  question_type_id: z.string().openapi({
    example: 'text_long',
    description: 'Question type ID (text_short, text_long, text_email, rating_star, rating_scale, choice_single, choice_multiple, input_checkbox, input_switch)',
  }),
  placeholder: z.string().nullable().openapi({
    example: 'Describe the challenges you faced...',
    description: 'Placeholder text for the input field',
  }),
  help_text: z.string().nullable().openapi({
    example: 'Think about the frustrations or inefficiencies you experienced',
    description: 'Help text displayed below the input',
  }),
  is_required: z.boolean().openapi({
    example: true,
    description: 'Whether the question is required',
  }),
  display_order: z.number().int().openapi({
    example: 1,
    description: 'Display order of the question',
  }),
  options: z.array(AIQuestionOptionSchema).nullable().openapi({
    description: 'Options for choice_single/choice_multiple questions. Null for other types.',
  }),
  flow_membership: FlowMembershipSchema.openapi({
    example: 'shared',
    description: 'Which flow this question belongs to',
  }),
  is_branch_point: z.boolean().openapi({
    example: false,
    description: 'True only for the rating question that determines the flow branch',
  }),
}).openapi('AIQuestion');

/**
 * AI inferred context from product description
 */
export const AIContextSchema = z.object({
  industry: z.string().openapi({
    example: 'SaaS/B2B',
    description: 'Inferred industry or category',
  }),
  audience: z.string().openapi({
    example: 'Remote teams, project managers',
    description: 'Inferred target audience',
  }),
  tone: z.string().openapi({
    example: 'Professional',
    description: 'Recommended tone for questions',
  }),
  value_props: z.array(z.string()).openapi({
    example: ['Collaboration', 'Time management'],
    description: 'Key value propositions inferred from description',
  }),
}).openapi('AIContext');

/**
 * Request schema for /ai/suggest-questions
 */
export const SuggestQuestionsRequestSchema = z.object({
  product_name: z.string().min(1).max(100).openapi({
    example: 'TaskFlow',
    description: 'Name of the product',
  }),
  product_description: z.string().min(10).max(1000).openapi({
    example: 'Project management tool for remote teams that helps track tasks, collaborate in real-time, and meet deadlines.',
    description: 'Brief description of the product (10-1000 characters)',
  }),
  focus_areas: z.string().max(500).optional().openapi({
    example: 'ease of onboarding, time saved on reporting, customer support quality',
    description: 'Optional guidance for question generation - specific aspects to focus on',
  }),
}).openapi('SuggestQuestionsRequest');

/**
 * Form structure recommendations
 */
export const FormStructureSchema = z.object({
  branching_recommended: z.boolean().openapi({
    example: true,
    description: 'Whether rating-based branching is recommended for this form',
  }),
  rating_question_index: z.number().int().openapi({
    example: 3,
    description: '0-indexed position of the rating question that serves as the branch point',
  }),
}).openapi('FormStructure');

/**
 * Testimonial write step content for testimonial flow
 * This step allows users to either let AI assemble their testimonial or write it manually
 */
export const TestimonialWriteContentSchema = z.object({
  title: z.string().openapi({
    example: 'Your testimonial',
    description: 'Title for the testimonial write step',
  }),
  subtitle: z.string().openapi({
    example: 'Let us craft your story or write it yourself',
    description: 'Subtitle explaining the purpose',
  }),
  ai_path_title: z.string().openapi({
    example: 'Let AI craft your story',
    description: 'Title for AI-assisted path',
  }),
  ai_path_description: z.string().openapi({
    example: "We'll transform your answers into a testimonial you can review and edit",
    description: 'Description of what AI path does',
  }),
  manual_path_title: z.string().openapi({
    example: 'Write it yourself',
    description: 'Title for manual writing path',
  }),
  manual_path_description: z.string().openapi({
    example: 'Compose your own testimonial from scratch',
    description: 'Description of manual path',
  }),
}).openapi('TestimonialWriteContent');

/**
 * Consent step content for testimonial flow
 */
export const ConsentContentSchema = z.object({
  title: z.string().openapi({
    example: 'One last thing...',
    description: 'Title for the consent step',
  }),
  description: z.string().openapi({
    example: 'Would you like us to share your testimonial publicly?',
    description: 'Description explaining what consent means',
  }),
  public_label: z.string().openapi({
    example: 'Share publicly',
    description: 'Label for public sharing option',
  }),
  public_description: z.string().openapi({
    example: 'Your testimonial may be featured on our website and marketing materials',
    description: 'Description of what public means',
  }),
  private_label: z.string().openapi({
    example: 'Keep private',
    description: 'Label for private/anonymous option',
  }),
  private_description: z.string().openapi({
    example: 'Your feedback stays internal - we will only use it to improve our service',
    description: 'Description of what private means',
  }),
}).openapi('ConsentContent');

/**
 * Improvement flow thank you content
 */
export const ImprovementThankYouSchema = z.object({
  title: z.string().openapi({
    example: 'Thank you for your honest feedback',
    description: 'Thank you title for improvement flow',
  }),
  message: z.string().openapi({
    example: 'We take your feedback seriously and will work to improve.',
    description: 'Thank you message acknowledging their concerns',
  }),
}).openapi('ImprovementThankYou');

/**
 * Step content suggestions for system-generated steps
 */
export const StepContentSchema = z.object({
  testimonial_write: TestimonialWriteContentSchema.openapi({
    description: 'Content for the testimonial write step in testimonial flow',
  }),
  consent: ConsentContentSchema.openapi({
    description: 'Content for the consent step in testimonial flow',
  }),
  improvement_thank_you: ImprovementThankYouSchema.openapi({
    description: 'Content for thank you step in improvement flow',
  }),
}).openapi('StepContent');

/**
 * Response schema for /ai/suggest-questions
 */
export const SuggestQuestionsResponseSchema = z.object({
  inferred_context: AIContextSchema,
  form_structure: FormStructureSchema,
  questions: z.array(AIQuestionSchema),
  step_content: StepContentSchema,
}).openapi('SuggestQuestionsResponse');

/**
 * Suggestion schema for testimonial modifications
 */
export const TestimonialSuggestionSchema = z.object({
  id: z.string().openapi({
    example: 'make_briefer',
    description: 'Unique identifier for the suggestion',
  }),
  label: z.string().openapi({
    example: 'Make it briefer',
    description: 'Short label for the suggestion chip',
  }),
  description: z.string().openapi({
    example: 'Reduce the length while keeping the key points',
    description: 'Longer description of what this suggestion does',
  }),
  applicability: z.number().min(0).max(1).openapi({
    example: 0.8,
    description: 'How applicable this suggestion is (0-1 score)',
  }),
}).openapi('TestimonialSuggestion');

/**
 * Tone analysis for the generated testimonial
 */
export const TestimonialToneSchema = z.object({
  formality: z.enum(['formal', 'neutral', 'casual']).openapi({
    example: 'neutral',
    description: 'Level of formality in the testimonial',
  }),
  energy: z.enum(['enthusiastic', 'neutral', 'reserved']).openapi({
    example: 'enthusiastic',
    description: 'Energy level of the testimonial',
  }),
  confidence: z.enum(['assertive', 'neutral', 'humble']).openapi({
    example: 'assertive',
    description: 'Confidence level expressed in the testimonial',
  }),
}).openapi('TestimonialTone');

/**
 * Metadata about the generated testimonial
 */
export const TestimonialMetadataSchema = z.object({
  word_count: z.number().int().openapi({
    example: 85,
    description: 'Number of words in the testimonial',
  }),
  reading_time_seconds: z.number().int().openapi({
    example: 25,
    description: 'Estimated reading time in seconds',
  }),
  tone: TestimonialToneSchema.openapi({
    description: 'Analysis of the testimonial tone',
  }),
  key_themes: z.array(z.string()).openapi({
    example: ['time-saving', 'collaboration', 'efficiency'],
    description: 'Key themes identified in the testimonial',
  }),
}).openapi('TestimonialMetadata');

/**
 * Modification request for refining a testimonial
 */
export const TestimonialModificationSchema = z.object({
  type: z.enum(['suggestion']).openapi({
    example: 'suggestion',
    description: 'Type of modification',
  }),
  suggestion_id: z.string().openapi({
    example: 'make_briefer',
    description: 'ID of the suggestion to apply',
  }),
  previous_testimonial: z.string().openapi({
    example: 'Before TaskFlow, I was spending hours...',
    description: 'The previous testimonial text to modify',
  }),
}).openapi('TestimonialModification');

/**
 * Answer input for testimonial assembly
 */
export const TestimonialAnswerSchema = z.object({
  question_text: z.string().openapi({
    example: 'What was your biggest challenge before using TaskFlow?',
    description: 'The question text that was shown to the customer',
  }),
  question_key: z.string().openapi({
    example: 'problem_before',
    description: 'Unique key identifier for the question',
  }),
  answer: z.string().openapi({
    example: 'I was spending hours manually tracking project updates across multiple spreadsheets.',
    description: 'The customer\'s answer to the question',
  }),
}).openapi('TestimonialAnswer');

/**
 * Request schema for /ai/assemble-testimonial (enhanced testimonial assembly)
 */
export const AssembleTestimonialRequestSchema = z.object({
  form_id: z.string().min(1).openapi({
    example: 'frm_abc123xyz',
    description: 'ID of the form (used to fetch product_name)',
  }),
  answers: z.array(TestimonialAnswerSchema).min(1).openapi({
    description: 'Array of question-answer pairs from the customer',
  }),
  rating: z.number().int().min(1).max(5).optional().openapi({
    example: 5,
    description: 'Customer rating (1-5 stars)',
  }),
  quality: z.enum(['fast', 'enhanced', 'premium']).optional().openapi({
    example: 'enhanced',
    description: 'Quality tier affecting model selection and processing',
  }),
  modification: TestimonialModificationSchema.optional().openapi({
    description: 'Optional modification to apply to a previous testimonial',
  }),
}).openapi('AssembleTestimonialRequest');

/**
 * Response schema for /ai/assemble-testimonial (enhanced testimonial assembly)
 */
export const AssembleTestimonialResponseSchema = z.object({
  testimonial: z.string().openapi({
    example: 'Before TaskFlow, I was spending hours manually tracking project updates across multiple spreadsheets. Now, my team collaborates in real-time and we\'ve cut our meeting time in half. I couldn\'t imagine going back to the old way.',
    description: 'The AI-assembled testimonial text',
  }),
  suggestions: z.array(TestimonialSuggestionSchema).openapi({
    description: 'Suggested modifications the customer can apply',
  }),
  metadata: TestimonialMetadataSchema.openapi({
    description: 'Metadata about the generated testimonial',
  }),
}).openapi('AssembleTestimonialResponse');

// Type exports
export type FlowMembership = z.infer<typeof FlowMembershipSchema>;
export type AIQuestionOption = z.infer<typeof AIQuestionOptionSchema>;
export type AIQuestion = z.infer<typeof AIQuestionSchema>;
export type AIContext = z.infer<typeof AIContextSchema>;
export type FormStructure = z.infer<typeof FormStructureSchema>;
export type TestimonialWriteContent = z.infer<typeof TestimonialWriteContentSchema>;
export type ConsentContent = z.infer<typeof ConsentContentSchema>;
export type ImprovementThankYou = z.infer<typeof ImprovementThankYouSchema>;
export type StepContent = z.infer<typeof StepContentSchema>;
export type SuggestQuestionsRequest = z.infer<typeof SuggestQuestionsRequestSchema>;
export type SuggestQuestionsResponse = z.infer<typeof SuggestQuestionsResponseSchema>;
export type TestimonialAnswer = z.infer<typeof TestimonialAnswerSchema>;
export type TestimonialSuggestion = z.infer<typeof TestimonialSuggestionSchema>;
export type TestimonialTone = z.infer<typeof TestimonialToneSchema>;
export type TestimonialMetadata = z.infer<typeof TestimonialMetadataSchema>;
export type TestimonialModification = z.infer<typeof TestimonialModificationSchema>;
export type AssembleTestimonialRequest = z.infer<typeof AssembleTestimonialRequestSchema>;
export type AssembleTestimonialResponse = z.infer<typeof AssembleTestimonialResponseSchema>;
