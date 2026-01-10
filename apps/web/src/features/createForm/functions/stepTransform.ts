/**
 * Step Transformation Functions
 *
 * Pure functions for transforming GraphQL step data to internal types.
 */
import type { FormStep, StepType, StepContent } from '@/shared/stepCards';
import type { GetFormStepsQuery } from '@/shared/graphql/generated/operations';

// Type for a single step from the GraphQL query
type GraphQLFormStep = GetFormStepsQuery['form_steps'][number];

/**
 * Transform GraphQL form steps to internal FormStep type
 */
export function transformFormSteps(steps: GraphQLFormStep[]): FormStep[] {
  return steps.map((step) => ({
    id: step.id,
    formId: step.form_id,
    stepType: step.step_type as StepType,
    stepOrder: step.step_order,
    questionId: step.question_id ?? null,
    question: step.question
      ? {
          id: step.question.id,
          questionText: step.question.question_text,
          placeholder: step.question.placeholder,
          helpText: step.question.help_text,
          isRequired: step.question.is_required,
          minValue: step.question.min_value,
          maxValue: step.question.max_value,
          minLength: step.question.min_length,
          maxLength: step.question.max_length,
          scaleMinLabel: step.question.scale_min_label,
          scaleMaxLabel: step.question.scale_max_label,
          questionType: {
            id: step.question.question_type.id,
            uniqueName: step.question.question_type.unique_name,
            name: step.question.question_type.name,
            category: step.question.question_type.category,
            inputComponent: step.question.question_type.input_component,
          },
          options: step.question.options.map((opt) => ({
            id: opt.id,
            optionValue: opt.option_value,
            optionLabel: opt.option_label,
            displayOrder: opt.display_order,
            isDefault: opt.is_default,
          })),
        }
      : null,
    content: (step.content as StepContent) ?? {},
    tips: (step.tips as string[]) ?? [],
    // ADR-009: flowId from database, flowMembership for backward compatibility
    flowId: step.flow_id,
    flowMembership: (step.flow_membership as FormStep['flowMembership']) ?? 'shared',
    isActive: step.is_active,
    isNew: false,
    isModified: false,
  }));
}
