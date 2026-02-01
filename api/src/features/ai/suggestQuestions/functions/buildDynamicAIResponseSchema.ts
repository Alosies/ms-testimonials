import { z } from 'zod';
import {
  AIQuestionOptionSchema,
  FlowMembershipSchema,
  InferredContextSchema,
  FormStructureSchema,
  StepContentSchema,
  type AIResponseSchema,
} from '../schemas';

/**
 * Builds the dynamic Zod schema for AI response based on allowed question types.
 *
 * Pure function: input → output with no side effects.
 *
 * @param allowedTypeIds - Array of allowed question type unique_names
 * @returns Zod schema for validating AI response
 * @throws Error if no question types are provided
 */
export function buildDynamicAIResponseSchema(allowedTypeIds: string[]): AIResponseSchema {
  // Create dynamic enum from allowed type IDs
  // Zod requires at least one element for enum
  if (allowedTypeIds.length === 0) {
    throw new Error('No question types available for schema');
  }

  const questionTypeEnum = z.enum(allowedTypeIds as [string, ...string[]]);

  return z.object({
    inferred_context: InferredContextSchema,
    form_structure: FormStructureSchema,
    questions: z.array(z.object({
      question_text: z.string().describe('The question to display to customers'),
      question_key: z.string().describe('Unique snake_case identifier for the question'),
      question_type_id: questionTypeEnum.describe('Question input type'),
      placeholder: z.string().nullable().describe('Placeholder text for the input field'),
      help_text: z.string().nullable().describe('Help text displayed below the input'),
      is_required: z.boolean().describe('Whether the question is required'),
      display_order: z.number().int().describe('Display order of the question (1-indexed)'),
      options: z.array(AIQuestionOptionSchema).nullable().describe('Required for choice_single/choice_multiple, null for other types'),
      flow_membership: FlowMembershipSchema.describe('Which flow this question belongs to: shared (before rating), testimonial (positive path), or improvement (negative path)'),
      is_branch_point: z.boolean().describe('True only for the rating question that determines the flow branch'),
    })).min(4).max(6).describe('4-6 questions: shared questions (1-3), rating branch point (4), and improvement flow question (5). Testimonial flow uses testimonial_write step instead of a question.'),
    step_content: StepContentSchema,
  }) as AIResponseSchema;
}
