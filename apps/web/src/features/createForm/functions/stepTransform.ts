/**
 * Step Transformation Functions
 *
 * Pure functions for transforming GraphQL step data to internal types.
 *
 * @see ADR-011: Immediate Save Actions - uses Zod for JSONB content validation
 * @see ADR-009: Flow identity derived from flow.flow_type + flow.branch_operator
 */
import type { FormStep, StepType, FlowMembership } from '@/shared/stepCards';
import { parseStepContentWithDefaults } from '@/entities/formStep';
import type { GetFormStepsQuery } from '@/shared/graphql/generated/operations';

// Type for a single step from the GraphQL query
type GraphQLFormStep = GetFormStepsQuery['form_steps'][number];

/**
 * Derive flow membership from the flow relationship.
 * ADR-009: Flow identity is determined by flow_type + branch_operator, not a separate column.
 *
 * - flow_type='shared' → 'shared' (both intro and ending flows)
 * - flow_type='branch' + branch_operator='greater_than_or_equal_to' → 'testimonial'
 * - flow_type='branch' + branch_operator='less_than' → 'improvement'
 */
function deriveFlowMembership(flow: GraphQLFormStep['flow']): FlowMembership {
  if (flow.flow_type === 'shared') {
    return 'shared';
  }
  // Branch flows: use branch_operator to determine testimonial vs improvement
  if (flow.branch_operator === 'greater_than_or_equal_to') {
    return 'testimonial';
  }
  if (flow.branch_operator === 'less_than') {
    return 'improvement';
  }
  // Fallback for unexpected operators (shouldn't happen in practice)
  return 'shared';
}

/**
 * Transform GraphQL form steps to internal FormStep type
 * ADR-013: Steps belong to flows (not forms), questions reference steps via step_id
 * ADR-009: Flow membership derived from flow relationship (not deprecated column)
 */
export function transformFormSteps(steps: GraphQLFormStep[]): FormStep[] {
  return steps.map((step) => {
    // ADR-013: Access question via questions[0] array relationship (inverted ownership)
    const question = step.questions?.[0];
    return {
      id: step.id,
      // ADR-013: flowId is required, formId removed
      flowId: step.flow_id,
      stepType: step.step_type as StepType,
      stepOrder: step.step_order,
      // ADR-013: Transform first question from array, or null if no questions
      question: question
        ? {
            id: question.id,
            questionText: question.question_text,
            placeholder: question.placeholder,
            helpText: question.help_text,
            isRequired: question.is_required,
            minValue: question.min_value,
            maxValue: question.max_value,
            minLength: question.min_length,
            maxLength: question.max_length,
            scaleMinLabel: question.scale_min_label,
            scaleMaxLabel: question.scale_max_label,
            questionType: {
              id: question.question_type.id,
              uniqueName: question.question_type.unique_name,
              name: question.question_type.name,
              category: question.question_type.category,
              inputComponent: question.question_type.input_component,
            },
            options: question.options.map((opt) => ({
              id: opt.id,
              optionValue: opt.option_value,
              optionLabel: opt.option_label,
              displayOrder: opt.display_order,
              isDefault: opt.is_default,
            })),
          }
        : null,
      // Zod validation with graceful fallback to defaults
      content: parseStepContentWithDefaults(step.step_type as StepType, step.content),
      tips: (step.tips as string[]) ?? [],
      // ADR-009: Derived from flow relationship (not deprecated flow_membership column)
      flowMembership: deriveFlowMembership(step.flow),
      isActive: step.is_active,
      isNew: false,
      isModified: false,
    };
  });
}
