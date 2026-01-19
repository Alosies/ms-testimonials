/**
 * Create a test form with branching (shared + testimonial + improvement flows).
 *
 * Creates a complete branched form structure for E2E testing:
 * - 1 form with "E2E Branched Form" prefix
 * - 1 shared flow with: welcome, 3 questions, rating steps
 * - 1 testimonial flow (rating >= 4)
 * - 1 improvement flow (rating < 4)
 */
import type { TestStep, TestFlow, TestBranchedFormResult } from '../types';
import { QUESTION_TYPE_IDS } from '../constants';
import {
  createTestForm,
  createPrimaryFlow,
  createBranchFlows,
  createTestimonialSteps,
  createImprovementSteps,
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

  // 5. Create branch flow steps
  const testimonialSteps = await createTestimonialSteps({
    flowId: testimonialFlowId,
    organizationId,
    questionTypeId: QUESTION_TYPE_IDS.TEXT_LONG,
  });

  const improvementSteps = await createImprovementSteps({
    flowId: improvementFlowId,
    organizationId,
    questionTypeId: QUESTION_TYPE_IDS.TEXT_LONG,
  });

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

  return {
    formId,
    formName,
    sharedFlow,
    testimonialFlow,
    improvementFlow,
    allSteps: [...sharedSteps, ...testimonialSteps, ...improvementSteps],
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
