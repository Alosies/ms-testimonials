/**
 * Branch step builders - creates steps for testimonial and improvement flows.
 */
import type { TestStep } from '../../types';
import { createStep, createQuestion } from './primitives';

export interface CreateBranchStepsParams {
  flowId: string;
  organizationId: string;
  questionTypeId: string;
}

/**
 * Create testimonial flow steps (for rating >= 4).
 *
 * Creates:
 * - Question step: recommendation
 * - Consent step
 * - Thank you step
 */
export async function createTestimonialSteps(params: CreateBranchStepsParams): Promise<TestStep[]> {
  const { flowId, organizationId, questionTypeId } = params;
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Question step: recommendation
  const questionStep = await createStep(flowId, organizationId, 'question', stepOrder++, undefined, 'testimonial');
  const question = await createQuestion(
    questionStep.id,
    organizationId,
    'What would you tell someone considering using our product?',
    'recommendation',
    questionTypeId
  );
  questionStep.questions.push(question);
  steps.push({ ...questionStep, flowMembership: 'testimonial', flowId });

  // Consent step
  const consentStep = await createStep(flowId, organizationId, 'consent', stepOrder++, undefined, 'testimonial');
  steps.push({ ...consentStep, flowMembership: 'testimonial', flowId });

  // Thank you step
  const thankYouStep = await createStep(flowId, organizationId, 'thank_you', stepOrder++, undefined, 'testimonial');
  steps.push({ ...thankYouStep, flowMembership: 'testimonial', flowId });

  return steps;
}

/**
 * Create improvement flow steps (for rating < 4).
 *
 * Creates:
 * - Question step: improvement feedback
 * - Thank you step (with different message)
 */
export async function createImprovementSteps(params: CreateBranchStepsParams): Promise<TestStep[]> {
  const { flowId, organizationId, questionTypeId } = params;
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Question step: improvement feedback
  const questionStep = await createStep(flowId, organizationId, 'question', stepOrder++, undefined, 'improvement');
  const question = await createQuestion(
    questionStep.id,
    organizationId,
    'What could we do to improve your experience?',
    'improvement_feedback',
    questionTypeId
  );
  questionStep.questions.push(question);
  steps.push({ ...questionStep, flowMembership: 'improvement', flowId });

  // Thank you step with different message
  const thankYouStep = await createStep(flowId, organizationId, 'thank_you', stepOrder++, {
    title: 'Thank you for your honest feedback.',
    subtitle: 'We take your feedback seriously and will use it to improve our product.',
  }, 'improvement');
  steps.push({ ...thankYouStep, flowMembership: 'improvement', flowId });

  return steps;
}
