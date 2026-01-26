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

import type { AIQuestion, StepContent as AIStepContent } from '@/shared/api';
import type { DeepReadonly } from 'vue';
import {
  getDefaultWelcomeContent,
  getDefaultThankYouContent,
  getDefaultTestimonialWriteContent,
} from '../constants/wizardConfig';

// =============================================================================
// Types
// =============================================================================

/**
 * Parameters for building form steps from AI-generated questions
 */
export interface BuildStepsParams {
  /** Organization ID for the form owner */
  organizationId: string;
  /** User ID of the form creator */
  userId: string;
  /** Concept/product name for default content */
  conceptName: string;
  /** AI-generated questions to build steps from */
  questions: DeepReadonly<AIQuestion[]>;
  /** AI-generated step content for system steps */
  stepContent: DeepReadonly<AIStepContent> | null;
  /** Shared flow ID - all steps point here initially */
  sharedFlowId: string;
}

/**
 * Flow position for internal tracking
 * Maps to display_order in the flows table:
 * - 'intro': shared flow at display_order=0 (before branches)
 * - 'testimonial': branch flow at display_order=1
 * - 'improvement': branch flow at display_order=2
 * - 'ending': shared flow at display_order=3 (after branches)
 */
export type FlowPosition = 'intro' | 'testimonial' | 'improvement' | 'ending';

/**
 * Form step input for database insertion
 *
 * ADR-013: No question_id - questions reference steps via step_id
 * ADR-009: No flow_membership - flow identity derived from flow.flow_type + flow.branch_operator
 *
 * Internal tracking fields (_prefixed) are stripped before API calls:
 * - _originalQuestionIndex: Maps step to original question for question creation
 * - _flowPosition: Target flow by position (intro/testimonial/improvement/ending)
 * - _intendedStepOrder: Step order within actual flow after updates
 */
export interface FormStepInput {
  organization_id: string;
  created_by: string;
  step_type: string;
  step_order: number;
  content: Record<string, unknown>;
  flow_id: string;
  is_active: boolean;
  /** Internal: original question index for mapping after question creation */
  _originalQuestionIndex?: number;
  /** Internal: target flow position for flow assignment (ADR-009 display_order based) */
  _flowPosition?: FlowPosition;
  /** Internal: step_order within intended flow for branch flow updates */
  _intendedStepOrder?: number;
}

/**
 * Result of building steps from questions
 */
export interface BuildStepsResult {
  /** Step inputs ready for database insertion */
  steps: FormStepInput[];
  /** Whether any questions are testimonial-flow specific */
  hasTestimonialSteps: boolean;
  /** Whether any questions are improvement-flow specific */
  hasImprovementSteps: boolean;
}

// =============================================================================
// Implementation
// =============================================================================


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
  // ADR-018: Uses Map for dynamic flow membership support (no hardcoded values)
  const flowStepOrder = new Map<string, number>();

  // Track flow membership for result
  let hasTestimonialSteps = false;
  let hasImprovementSteps = false;

  /**
   * Helper to create a step input
   * Uses global order for initial creation, stores intended flow order for later update
   *
   * @param stepType - Type of step (welcome, question, rating, etc.)
   * @param flowPosition - Target flow position (intro, testimonial, improvement, ending)
   * @param content - Step content object
   * @param originalQuestionIndex - Index in original questions array (for question/rating steps)
   */
  const createStep = (
    stepType: string,
    flowPosition: FlowPosition,
    content: Record<string, unknown>,
    originalQuestionIndex?: number
  ): FormStepInput => {
    // Initialize counter for this flow position if not exists
    if (!flowStepOrder.has(flowPosition)) {
      flowStepOrder.set(flowPosition, 0);
    }
    const intendedOrder = flowStepOrder.get(flowPosition)!;
    flowStepOrder.set(flowPosition, intendedOrder + 1);

    if (flowPosition === 'testimonial') hasTestimonialSteps = true;
    if (flowPosition === 'improvement') hasImprovementSteps = true;

    // ADR-009: No flow_membership - flow identity derived from flow relationship
    return {
      organization_id: organizationId,
      created_by: userId,
      step_type: stepType,
      step_order: globalStepOrder++, // Use global order for shared flow
      content,
      flow_id: sharedFlowId, // All go to intro shared flow initially
      is_active: true,
      _originalQuestionIndex: originalQuestionIndex,
      _flowPosition: flowPosition, // Track target flow position for later assignment
      _intendedStepOrder: intendedOrder, // Track intended order within target flow
    };
  };

  // =========================================================================
  // 1. Welcome step (intro - shared flow at display_order=0)
  // =========================================================================
  const welcomeContent = getDefaultWelcomeContent(conceptName);
  steps.push(createStep('welcome', 'intro', welcomeContent));

  // =========================================================================
  // 2. Question/Rating steps grouped by flow_membership
  // =========================================================================

  // 2a. Intro questions (including branch point)
  // These are questions marked as 'shared' in AI output - they go to intro flow
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.flow_membership !== 'shared') continue;

    const isRating = question.question_type_id.startsWith('rating');
    const stepType = isRating ? 'rating' : 'question';

    steps.push(createStep(stepType, 'intro', {}, i));
  }

  // =========================================================================
  // 3. Testimonial flow steps
  // =========================================================================

  // 3a. Testimonial Write step (AI assembles testimonial or user writes manually)
  const defaultTestimonialWrite = getDefaultTestimonialWriteContent();
  const testimonialWriteContent = stepContent?.testimonial_write
    ? {
        title: stepContent.testimonial_write.title,
        subtitle: stepContent.testimonial_write.subtitle,
        enableAIPath: defaultTestimonialWrite.enableAIPath,
        aiPathTitle: stepContent.testimonial_write.ai_path_title,
        aiPathDescription: stepContent.testimonial_write.ai_path_description,
        manualPathTitle: stepContent.testimonial_write.manual_path_title,
        manualPathDescription: stepContent.testimonial_write.manual_path_description,
        showPreviousAnswers: defaultTestimonialWrite.showPreviousAnswers,
      }
    : defaultTestimonialWrite;
  steps.push(createStep('testimonial_write', 'testimonial', testimonialWriteContent));

  // 3b. Consent step (testimonial flow only - privacy: improvement feedback stays private)
  // Note: Testimonial questions are no longer generated by AI - the testimonial_write step
  // above handles collecting the testimonial via AI assembly or manual writing
  // Schema: ConsentContentSchema requires title, description, options, defaultOption, required
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
        defaultOption: 'public' as const,
        required: true,
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
        defaultOption: 'public' as const,
        required: true,
      };
  steps.push(createStep('consent', 'testimonial', consentContent));

  // =========================================================================
  // 4. Improvement flow steps
  // =========================================================================

  // 4a. Improvement questions
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.flow_membership !== 'improvement') continue;

    steps.push(createStep('question', 'improvement', {}, i));
  }

  // =========================================================================
  // 5. Ending flow steps (ADR-009: shared flow at display_order=3 for ALL users)
  // =========================================================================

  // 5a. Contact Info step (ending - everyone provides contact info)
  // Schema: ContactInfoContentSchema requires title, enabledFields[], requiredFields[]
  const contactInfoContent = {
    title: 'A little about you',
    subtitle: 'Help us put a face to your feedback',
    enabledFields: ['name', 'email', 'jobTitle', 'company'] as const,
    requiredFields: ['name', 'email'] as const,
  };
  steps.push(createStep('contact_info', 'ending', contactInfoContent));

  // 5b. Thank you step (ending - shared ending for everyone)
  // Schema: ThankYouContentSchema requires title, message, showSocialShare
  const sharedThankYouContent = stepContent?.thank_you
    ? {
        title: stepContent.thank_you.title,
        message: stepContent.thank_you.message,
        showSocialShare: false,
      }
    : getDefaultThankYouContent();
  steps.push(createStep('thank_you', 'ending', sharedThankYouContent));

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
): Omit<FormStepInput, '_originalQuestionIndex' | '_flowPosition' | '_intendedStepOrder'>[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return steps.map(({ _originalQuestionIndex, _flowPosition, _intendedStepOrder, ...rest }) => rest);
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
 * Get steps that need flow reassignment after initial creation
 *
 * ADR-009: Steps are initially created in the intro flow (display_order=0).
 * This function identifies steps that need to be moved to their target flows:
 * - testimonial: branch flow at display_order=1
 * - improvement: branch flow at display_order=2
 * - ending: shared flow at display_order=3
 *
 * Intro steps (display_order=0) stay in the initial flow and are NOT included.
 *
 * @param stepInputs - Original step inputs with tracking fields
 * @param createdSteps - Steps returned from database with IDs
 * @param testimonialFlowId - ID of testimonial branch flow (null if branching disabled)
 * @param improvementFlowId - ID of improvement branch flow (null if branching disabled)
 * @param endingFlowId - ID of ending shared flow
 * @returns Array of step updates for flow assignment
 */
export function getFlowReassignments(
  stepInputs: FormStepInput[],
  createdSteps: { id: string }[],
  testimonialFlowId: string | null,
  improvementFlowId: string | null,
  endingFlowId: string
): { stepId: string; flowId: string; stepOrder: number }[] {
  const updates: { stepId: string; flowId: string; stepOrder: number }[] = [];

  for (let stepIdx = 0; stepIdx < stepInputs.length; stepIdx++) {
    const stepInput = stepInputs[stepIdx];
    const createdStep = createdSteps[stepIdx];

    // Map flow position to target flow ID
    // 'intro' steps stay in the initial flow - no update needed
    if (stepInput._flowPosition === 'testimonial' && testimonialFlowId) {
      updates.push({
        stepId: createdStep.id,
        flowId: testimonialFlowId,
        stepOrder: stepInput._intendedStepOrder ?? 0,
      });
    } else if (stepInput._flowPosition === 'improvement' && improvementFlowId) {
      updates.push({
        stepId: createdStep.id,
        flowId: improvementFlowId,
        stepOrder: stepInput._intendedStepOrder ?? 0,
      });
    } else if (stepInput._flowPosition === 'ending') {
      // Ending steps go to the shared ending flow (display_order=3)
      updates.push({
        stepId: createdStep.id,
        flowId: endingFlowId,
        stepOrder: stepInput._intendedStepOrder ?? 0,
      });
    }
  }

  return updates;
}

/**
 * @deprecated Use getFlowReassignments instead
 * Kept for backward compatibility during migration
 */
export const getBranchFlowUpdates = getFlowReassignments;
