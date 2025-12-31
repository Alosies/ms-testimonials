/**
 * Zod schemas for AI-related endpoints
 */

import { z } from '@hono/zod-openapi';

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
    description: 'Question type ID (text_long, text_short, rating_star, etc.)',
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
 * Response schema for /ai/suggest-questions
 */
export const SuggestQuestionsResponseSchema = z.object({
  inferred_context: AIContextSchema,
  questions: z.array(AIQuestionSchema),
}).openapi('SuggestQuestionsResponse');

/**
 * Request schema for /ai/assemble (testimonial assembly)
 */
export const AssembleTestimonialRequestSchema = z.object({
  product_name: z.string().min(1).max(100).openapi({
    example: 'TaskFlow',
    description: 'Name of the product',
  }),
  answers: z.array(z.object({
    question: z.string().openapi({
      example: 'What was your biggest challenge before using TaskFlow?',
      description: 'The question that was asked',
    }),
    answer: z.string().openapi({
      example: 'I was spending hours manually tracking project updates across multiple spreadsheets.',
      description: 'The customer\'s answer',
    }),
  })).min(1).openapi({
    description: 'Array of question-answer pairs from the customer',
  }),
}).openapi('AssembleTestimonialRequest');

/**
 * Response schema for /ai/assemble (testimonial assembly)
 */
export const AssembleTestimonialResponseSchema = z.object({
  testimonial: z.string().openapi({
    example: 'Before TaskFlow, I was spending hours manually tracking project updates across multiple spreadsheets. Now, my team collaborates in real-time and we\'ve cut our meeting time in half. I couldn\'t imagine going back to the old way.',
    description: 'The AI-assembled testimonial text',
  }),
}).openapi('AssembleTestimonialResponse');

// Type exports
export type AIQuestion = z.infer<typeof AIQuestionSchema>;
export type AIContext = z.infer<typeof AIContextSchema>;
export type SuggestQuestionsRequest = z.infer<typeof SuggestQuestionsRequestSchema>;
export type SuggestQuestionsResponse = z.infer<typeof SuggestQuestionsResponseSchema>;
export type AssembleTestimonialRequest = z.infer<typeof AssembleTestimonialRequestSchema>;
export type AssembleTestimonialResponse = z.infer<typeof AssembleTestimonialResponseSchema>;
