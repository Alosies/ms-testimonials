/**
 * Build Steps From Questions - Multi-Entity Function
 *
 * ADR-014 Phase 4: Extract multi-entity logic from useCreateFormWithSteps.
 * This pure function builds form step inputs from AI-generated questions.
 *
 * Ownership Chain (ADR-013):
 * - form → flow → step → question
 * - Steps point to flows via flow_id
 * - Questions point to steps via step_id (created after steps)
 */

import type { FlowMembership as EntityFlowMembership } from '@/entities/formStep';
import type {
  BuildStepsParams,
  FormStepInput,
  BuildStepsResult,
} from '../models/functionTypes';
import {
  getDefaultWelcomeContent,
  getDefaultThankYouContent,
} from '../constants/wizardConfig';

/**
 * Build form steps array from AI-generated questions
 *
 * Creates steps for:
 * 1. Welcome step (shared flow)
 * 2. Question/Rating steps grouped by flow_membership
 * 3. Consent step (testimonial flow only)
 * 4. Thank you steps (one per branch flow)
 *
 * ADR-013 Constraint Handling:
 * - All steps initially point to sharedFlowId
 * - Branch steps are updated to actual flows AFTER branch flows are created
 * - Step order uses global counter for uniqueness constraint
 * - _intendedStepOrder stores per-flow order for final update
 *
 * @param params - Build configuration and input data
 * @returns Step inputs with internal tracking fields for orchestration
 *
 * @example
 * ```ts
 * const { steps } = buildStepsFromQuestions({
 *   organizationId: 'org123',
 *   userId: 'user456',
 *   conceptName: 'My Product',
 *   questions: aiQuestions,
 *   stepContent: aiStepContent,
 *   sharedFlowId: 'flow789',
 * });
 *
 * // Strip internal fields before API call
 * const apiInputs = steps.map(({ _originalQuestionIndex, _flowMembership, _intendedStepOrder, ...rest }) => rest);
 * await createFormSteps({ inputs: apiInputs });
 * ```
 */
export function buildStepsFromQuestions(params: BuildStepsParams): BuildStepsResult {
  const {
    organizationId,
    userId,
    conceptName,
    questions,
    stepContent,
    sharedFlowId,
  } = params;

  const steps: FormStepInput[] = [];

  // Global step order counter - ALL steps go to shared flow initially
  // so we need unique step_order values across the entire form
  let globalStepOrder = 0;

  // Per-flow ordering for when steps get moved to their actual flows
  const flowStepOrder: Record<EntityFlowMembership, number> = {
    shared: 0,
    testimonial: 0,
    improvement: 0,
  };

  // Track flow membership for result
  let hasTestimonialSteps = false;
  let hasImprovementSteps = false;

  /**
   * Helper to create a step input
   * Uses global order for initial creation, stores intended flow order for later update
   */
  const createStep = (
    stepType: string,
    flowMembership: EntityFlowMembership,
    content: Record<string, unknown>,
    originalQuestionIndex?: number
  ): FormStepInput => {
    const intendedOrder = flowStepOrder[flowMembership]++;

    if (flowMembership === 'testimonial') hasTestimonialSteps = true;
    if (flowMembership === 'improvement') hasImprovementSteps = true;

    return {
      organization_id: organizationId,
      created_by: userId,
      step_type: stepType,
      step_order: globalStepOrder++, // Use global order for shared flow
      content,
      flow_id: sharedFlowId, // All go to shared initially
      flow_membership: flowMembership,
      is_active: true,
      _originalQuestionIndex: originalQuestionIndex,
      _flowMembership: flowMembership, // Track actual intended flow
      _intendedStepOrder: intendedOrder, // Track intended order within actual flow
    };
  };

  // =========================================================================
  // 1. Welcome step (shared)
  // =========================================================================
  const welcomeContent = getDefaultWelcomeContent(conceptName);
  steps.push(createStep('welcome', 'shared', welcomeContent));

  // =========================================================================
  // 2. Question/Rating steps grouped by flow_membership
  // =========================================================================

  // 2a. Shared questions (including branch point)
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.flow_membership !== 'shared') continue;

    const isRating = question.question_type_id.startsWith('rating');
    const stepType = isRating ? 'rating' : 'question';

    steps.push(createStep(stepType, 'shared', {}, i));
  }

  // =========================================================================
  // 3. Testimonial flow steps
  // =========================================================================

  // 3a. Testimonial questions
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.flow_membership !== 'testimonial') continue;

    steps.push(createStep('question', 'testimonial', {}, i));
  }

  // 3b. Consent step (testimonial flow only)
  const consentContent = stepContent?.consent
    ? {
        title: stepContent.consent.title,
        description: stepContent.consent.description,
        options: {
          public: {
            label: stepContent.consent.public_label,
            description: stepContent.consent.public_description,
          },
          private: {
            label: stepContent.consent.private_label,
            description: stepContent.consent.private_description,
          },
        },
      }
    : {
        title: 'One last thing...',
        description: 'Would you like us to share your testimonial publicly?',
        options: {
          public: {
            label: 'Yes, share publicly',
            description: 'Your testimonial may be featured on our website',
          },
          private: {
            label: 'Keep it private',
            description: 'Only the team will see your feedback',
          },
        },
      };
  steps.push(createStep('consent', 'testimonial', consentContent));

  // 3c. Thank you step (testimonial flow)
  const testimonialThankYouContent = getDefaultThankYouContent();
  steps.push(createStep('thank_you', 'testimonial', testimonialThankYouContent));

  // =========================================================================
  // 4. Improvement flow steps
  // =========================================================================

  // 4a. Improvement questions
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.flow_membership !== 'improvement') continue;

    steps.push(createStep('question', 'improvement', {}, i));
  }

  // 4b. Thank you step (improvement flow)
  const improvementThankYouContent = stepContent?.improvement_thank_you
    ? {
        title: stepContent.improvement_thank_you.title,
        subtitle: stepContent.improvement_thank_you.message,
      }
    : {
        title: 'Thank you for your feedback',
        subtitle: 'We take your feedback seriously and will work to improve.',
      };
  steps.push(createStep('thank_you', 'improvement', improvementThankYouContent));

  return {
    steps,
    hasTestimonialSteps,
    hasImprovementSteps,
  };
}

/**
 * Strip internal tracking fields from step inputs for API calls
 *
 * @param steps - Step inputs with internal tracking fields
 * @returns Clean step inputs ready for database insertion
 */
export function stripInternalFields(
  steps: FormStepInput[]
): Omit<FormStepInput, '_originalQuestionIndex' | '_flowMembership' | '_intendedStepOrder'>[] {
  return steps.map(({ _originalQuestionIndex, _flowMembership, _intendedStepOrder, ...rest }) => rest);
}

/**
 * Get step IDs that need question creation based on step type
 *
 * @param stepInputs - Original step inputs with tracking fields
 * @param createdSteps - Steps returned from database with IDs
 * @returns Map of original question index to created step ID
 */
export function mapQuestionsToSteps(
  stepInputs: FormStepInput[],
  createdSteps: { id: string }[]
): Map<number, string> {
  const questionStepMap = new Map<number, string>();

  for (let stepIdx = 0; stepIdx < stepInputs.length; stepIdx++) {
    const stepInput = stepInputs[stepIdx];
    if (stepInput.step_type === 'question' || stepInput.step_type === 'rating') {
      const originalQuestionIdx = stepInput._originalQuestionIndex;
      if (originalQuestionIdx !== undefined) {
        questionStepMap.set(originalQuestionIdx, createdSteps[stepIdx].id);
      }
    }
  }

  return questionStepMap;
}

/**
 * Get steps that need branch flow updates
 *
 * @param stepInputs - Original step inputs with tracking fields
 * @param createdSteps - Steps returned from database with IDs
 * @param testimonialFlowId - ID of testimonial branch flow
 * @param improvementFlowId - ID of improvement branch flow
 * @returns Array of step updates for branch flow assignment
 */
export function getBranchFlowUpdates(
  stepInputs: FormStepInput[],
  createdSteps: { id: string }[],
  testimonialFlowId: string,
  improvementFlowId: string
): { stepId: string; flowId: string; stepOrder: number }[] {
  const updates: { stepId: string; flowId: string; stepOrder: number }[] = [];

  for (let stepIdx = 0; stepIdx < stepInputs.length; stepIdx++) {
    const stepInput = stepInputs[stepIdx];
    const createdStep = createdSteps[stepIdx];

    if (stepInput._flowMembership === 'testimonial') {
      updates.push({
        stepId: createdStep.id,
        flowId: testimonialFlowId,
        stepOrder: stepInput._intendedStepOrder ?? 0,
      });
    } else if (stepInput._flowMembership === 'improvement') {
      updates.push({
        stepId: createdStep.id,
        flowId: improvementFlowId,
        stepOrder: stepInput._intendedStepOrder ?? 0,
      });
    }
  }

  return updates;
}
