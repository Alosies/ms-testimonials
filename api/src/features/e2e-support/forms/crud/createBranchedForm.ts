/**
 * Create a test form with branching (shared + testimonial + improvement + outro flows).
 *
 * Creates a complete branched form structure for E2E testing:
 * - 1 form with "E2E Branched Form" prefix
 * - 1 shared flow with: welcome, 3 questions, rating steps (branch point)
 * - 1 testimonial flow (rating >= 4): testimonial_write, consent
 * - 1 improvement flow (rating < 4): question
 * - 1 outro flow (shared): contact_info, thank_you
 */
import type { TestStep, TestFlow, TestBranchedFormResult } from '../types';
import { QUESTION_TYPE_IDS } from '../constants';
import {
  createTestForm,
  createPrimaryFlow,
  createBranchFlows,
  createTestimonialStepsWithoutThankYou,
  createImprovementStepsWithoutThankYou,
  createStep,
  createQuestion,
} from './shared';

/**
 * Create a test form with branching.
 *
 * @param organizationId - Organization ID (from E2E_ORGANIZATION_ID env var)
 * @param name - Form name (will be prefixed with "E2E Branched Form - ")
 * @param createdBy - User ID (from E2E_USER_ID env var)
 * @returns Full branched form data including all flows and steps
 */
export async function createTestFormWithBranching(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<TestBranchedFormResult> {
  // 1. Create form
  const { formId, formName } = await createTestForm(
    { organizationId, name, createdBy, productDescription: 'A test product for E2E branching tests' },
    'E2E Branched Form'
  );

  // 2. Create primary flow
  const sharedFlowId = await createPrimaryFlow({ formId, organizationId });

  // 3. Create shared steps
  const { steps: sharedSteps, branchQuestionId, ratingStepId } = await createSharedSteps(sharedFlowId, organizationId);

  // 4. Create branch flows
  const { testimonialFlowId, improvementFlowId } = await createBranchFlows({
    formId,
    organizationId,
    branchQuestionId,
    ratingStepId,
  });

  // 5. Create branch flow steps (without thank_you - that's in outro)
  const testimonialSteps = await createTestimonialStepsWithoutThankYou({
    flowId: testimonialFlowId,
    organizationId,
    questionTypeId: QUESTION_TYPE_IDS.TEXT_LONG,
  });

  const improvementSteps = await createImprovementStepsWithoutThankYou({
    flowId: improvementFlowId,
    organizationId,
    questionTypeId: QUESTION_TYPE_IDS.TEXT_LONG,
  });

  // 6. Create outro steps (shared steps after branches)
  const outroSteps = await createOutroSteps(sharedFlowId, organizationId, sharedSteps.length);

  // Build result
  const sharedFlow: TestFlow = {
    id: sharedFlowId,
    name: 'Shared Steps',
    flowType: 'shared',
    isPrimary: true,
    displayOrder: 0,
    steps: sharedSteps,
  };

  const testimonialFlow: TestFlow = {
    id: testimonialFlowId,
    name: 'Testimonial Flow',
    flowType: 'branch',
    isPrimary: false,
    displayOrder: 1,
    steps: testimonialSteps,
  };

  const improvementFlow: TestFlow = {
    id: improvementFlowId,
    name: 'Improvement Flow',
    flowType: 'branch',
    isPrimary: false,
    displayOrder: 2,
    steps: improvementSteps,
  };

  const outroFlow: TestFlow = {
    id: sharedFlowId, // Outro uses the shared flow ID
    name: 'Outro Steps',
    flowType: 'shared',
    isPrimary: false,
    displayOrder: 3,
    steps: outroSteps,
  };

  return {
    formId,
    formName,
    sharedFlow,
    testimonialFlow,
    improvementFlow,
    outroFlow,
    allSteps: [...sharedSteps, ...testimonialSteps, ...improvementSteps, ...outroSteps],
    branchQuestionId,
  };
}

/**
 * Create shared steps for branched form.
 * Steps: welcome, problem_before, solution_experience, specific_results, rating
 */
async function createSharedSteps(
  flowId: string,
  organizationId: string
): Promise<{ steps: TestStep[]; branchQuestionId: string; ratingStepId: string }> {
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Welcome step
  const welcomeStep = await createStep(flowId, organizationId, 'welcome', stepOrder++);
  steps.push({ ...welcomeStep, flowMembership: 'shared', flowId });

  // Question steps
  const questionConfigs = [
    { text: 'Before using our product, what challenges did you face?', key: 'problem_before' },
    { text: 'Can you describe your experience using our product? What features stood out?', key: 'solution_experience' },
    { text: 'What specific results have you seen? Please share any metrics or examples.', key: 'specific_results' },
  ];

  for (const config of questionConfigs) {
    const step = await createStep(flowId, organizationId, 'question', stepOrder++);
    const question = await createQuestion(step.id, organizationId, config.text, config.key, QUESTION_TYPE_IDS.TEXT_LONG);
    step.questions.push(question);
    steps.push({ ...step, flowMembership: 'shared', flowId });
  }

  // Rating step (branch point)
  const ratingStep = await createStep(flowId, organizationId, 'rating', stepOrder++);
  const ratingQuestion = await createQuestion(
    ratingStep.id,
    organizationId,
    'Overall, how satisfied are you with our product?',
    'rating',
    QUESTION_TYPE_IDS.RATING_STAR
  );
  ratingStep.questions.push(ratingQuestion);
  steps.push({ ...ratingStep, flowMembership: 'shared', flowId });

  return {
    steps,
    branchQuestionId: ratingQuestion.id,
    ratingStepId: ratingStep.id,
  };
}

/**
 * Create outro steps (shared steps after branches).
 * Steps: contact_info, thank_you
 */
async function createOutroSteps(
  flowId: string,
  organizationId: string,
  startOrder: number
): Promise<TestStep[]> {
  const steps: TestStep[] = [];
  let stepOrder = startOrder;

  // Contact info step
  const contactInfoStep = await createStep(flowId, organizationId, 'contact_info', stepOrder++);
  steps.push({ ...contactInfoStep, flowMembership: 'shared', flowId });

  // Thank you step
  const thankYouStep = await createStep(flowId, organizationId, 'thank_you', stepOrder++);
  steps.push({ ...thankYouStep, flowMembership: 'shared', flowId });

  return steps;
}
