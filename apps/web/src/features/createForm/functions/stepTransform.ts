/**
 * Step Transformation Functions
 *
 * Pure functions for transforming GraphQL step data to internal types.
 *
 * @see ADR-011: Immediate Save Actions - uses Zod for JSONB content validation
 */
import type { FormStep, StepType, FlowMembership } from '@/shared/stepCards';
import { parseStepContentWithDefaults, getStepTypeConfigSafe } from '@/entities/formStep';
import type { GetFormStepsQuery } from '@/shared/graphql/generated/operations';

/**
 * Validate and correct flowMembership based on step type registry.
 * If the database value is not allowed for this step type, use the first allowed flow.
 */
function validateFlowMembership(stepType: StepType, dbFlowMembership: string | null): FlowMembership {
  const membership = (dbFlowMembership as FlowMembership) ?? 'shared';
  const config = getStepTypeConfigSafe(stepType);

  if (!config) {
    // Unknown step type - keep database value
    return membership;
  }

  if (config.allowedFlows.includes(membership)) {
    // Database value is valid
    return membership;
  }

  // Database value not allowed - use first allowed flow
  const correctedMembership = config.allowedFlows[0] ?? 'shared';
  console.warn(
    `[stepTransform] Step type "${stepType}" has invalid flow_membership "${membership}", correcting to "${correctedMembership}"`,
  );
  return correctedMembership;
}

// Type for a single step from the GraphQL query
type GraphQLFormStep = GetFormStepsQuery['form_steps'][number];

/**
 * Transform GraphQL form steps to internal FormStep type
 * ADR-013: Steps belong to flows (not forms), questions reference steps via step_id
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
      // flowMembership - validate against registry and correct if invalid
      flowMembership: validateFlowMembership(step.step_type as StepType, step.flow_membership),
      isActive: step.is_active,
      isNew: false,
      isModified: false,
    };
  });
}
