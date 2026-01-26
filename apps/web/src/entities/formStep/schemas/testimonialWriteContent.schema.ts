/**
 * Testimonial Write Step Content Schema
 *
 * Validates the JSONB content for testimonial_write step type.
 * This step enables customers to write their testimonial either
 * manually or with AI assistance.
 *
 * @see PRD-005: AI Testimonial Generation
 * @see DB migration: 1769334538375_form_steps__add_testimonial_write_step_type
 */
import { z } from 'zod';

export const TestimonialWriteContentSchema = z.object({
  // Path selection
  enableAIPath: z.boolean().default(true),

  // Manual path config
  title: z.string().default('Share your testimonial'),
  subtitle: z.string().default('Write your experience in your own words'),
  placeholder: z.string().default('Describe how our product helped you...'),
  minLength: z.number().int().min(0).default(50),
  maxLength: z.number().int().min(1).default(1000),

  // Previous answers reference
  showPreviousAnswers: z.boolean().default(true),
  previousAnswersLabel: z.string().default('Your responses for reference'),

  // AI path labels
  aiPathTitle: z.string().default('Let AI craft your story'),
  aiPathDescription: z
    .string()
    .default(
      "We'll transform your answers into a testimonial. You review and edit before submit.",
    ),
  manualPathTitle: z.string().default('Write it yourself'),
  manualPathDescription: z
    .string()
    .default('Write your own testimonial in your words.'),
});

export type TestimonialWriteContent = z.infer<
  typeof TestimonialWriteContentSchema
>;

/**
 * Default content for new testimonial_write steps
 */
export const defaultTestimonialWriteContent: TestimonialWriteContent = {
  enableAIPath: true,
  title: 'Share your testimonial',
  subtitle: 'Write your experience in your own words',
  placeholder: 'Describe how our product helped you...',
  minLength: 50,
  maxLength: 1000,
  showPreviousAnswers: true,
  previousAnswersLabel: 'Your responses for reference',
  aiPathTitle: 'Let AI craft your story',
  aiPathDescription:
    "We'll transform your answers into a testimonial. You review and edit before submit.",
  manualPathTitle: 'Write it yourself',
  manualPathDescription: 'Write your own testimonial in your words.',
};
