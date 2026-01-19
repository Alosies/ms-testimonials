/**
 * Create a test form with a choice_single question.
 *
 * Creates a branched form structure with a choice question in the shared flow:
 * - 1 form with "E2E Choice Question Form" prefix
 * - 1 shared flow with: welcome, choice question, rating steps
 * - 1 testimonial flow (rating >= 4)
 * - 1 improvement flow (rating < 4)
 */
import type { TestStep, TestFlow, TestChoiceQuestionFormResult, TestQuestionOption } from '../types';
import {
  createTestForm,
  createPrimaryFlow,
  createBranchFlows,
  createTestimonialSteps,
  createImprovementSteps,
  createStep,
  createQuestion,
  createQuestionOption,
  getQuestionTypeId,
} from './shared';

/**
 * Default options for choice_single question
 */
const DEFAULT_CHOICE_OPTIONS = [
  { value: 'excellent', label: 'Excellent - exceeded expectations' },
  { value: 'good', label: 'Good - met expectations' },
  { value: 'average', label: 'Average - somewhat satisfied' },
  { value: 'poor', label: 'Poor - needs improvement' },
];

/**
 * Create a test form with a choice_single question.
 *
 * @param organizationId - Organization ID (from E2E_ORGANIZATION_ID env var)
 * @param name - Form name (will be prefixed with "E2E Choice Question Form - ")
 * @param createdBy - User ID (from E2E_USER_ID env var)
 * @returns Full form data including choice question with options
 */
export async function createTestFormWithChoiceQuestion(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<TestChoiceQuestionFormResult> {
  // Get question type IDs
  const choiceSingleTypeId = await getQuestionTypeId('choice_single');
  const ratingStarTypeId = await getQuestionTypeId('rating_star');
  const textLongTypeId = await getQuestionTypeId('text_long');

  // 1. Create form
  const { formId, formName } = await createTestForm(
    { organizationId, name, createdBy, productDescription: 'A test product for E2E choice question tests' },
    'E2E Choice Question Form'
  );

  // 2. Create primary flow
  const sharedFlowId = await createPrimaryFlow({ formId, organizationId });

  // 3. Create shared steps with choice question
  const { steps: sharedSteps, choiceQuestionId, branchQuestionId, ratingStepId } = await createSharedStepsWithChoice({
    flowId: sharedFlowId,
    organizationId,
    createdBy,
    choiceSingleTypeId,
    ratingStarTypeId,
  });

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
    questionTypeId: textLongTypeId,
  });

  const improvementSteps = await createImprovementSteps({
    flowId: improvementFlowId,
    organizationId,
    questionTypeId: textLongTypeId,
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
    choiceQuestionId,
  };
}

interface CreateSharedStepsWithChoiceParams {
  flowId: string;
  organizationId: string;
  createdBy: string;
  choiceSingleTypeId: string;
  ratingStarTypeId: string;
}

interface SharedStepsWithChoiceResult {
  steps: TestStep[];
  choiceQuestionId: string;
  branchQuestionId: string;
  ratingStepId: string;
}

/**
 * Create shared steps with a choice question.
 * Steps: welcome, choice question, rating
 */
async function createSharedStepsWithChoice(
  params: CreateSharedStepsWithChoiceParams
): Promise<SharedStepsWithChoiceResult> {
  const { flowId, organizationId, createdBy, choiceSingleTypeId, ratingStarTypeId } = params;
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Welcome step
  const welcomeStep = await createStep(flowId, organizationId, 'welcome', stepOrder++);
  steps.push({ ...welcomeStep, flowMembership: 'shared', flowId });

  // Choice question step
  const choiceStep = await createStep(flowId, organizationId, 'question', stepOrder++);
  const choiceQuestion = await createQuestion(
    choiceStep.id,
    organizationId,
    'How would you rate our product quality?',
    'product_quality',
    choiceSingleTypeId
  );

  // Create options
  const options: TestQuestionOption[] = [];
  for (let i = 0; i < DEFAULT_CHOICE_OPTIONS.length; i++) {
    const option = await createQuestionOption(
      choiceQuestion.id,
      organizationId,
      createdBy,
      DEFAULT_CHOICE_OPTIONS[i].value,
      DEFAULT_CHOICE_OPTIONS[i].label,
      i + 1,
      i === 0
    );
    options.push(option);
  }

  choiceQuestion.options = options;
  choiceQuestion.questionType = 'choice_single';
  choiceStep.questions.push(choiceQuestion);
  choiceStep.question = choiceQuestion;
  steps.push({ ...choiceStep, flowMembership: 'shared', flowId });

  // Rating step (branch point)
  const ratingStep = await createStep(flowId, organizationId, 'rating', stepOrder++);
  const ratingQuestion = await createQuestion(
    ratingStep.id,
    organizationId,
    'Overall, how satisfied are you with our product?',
    'rating',
    ratingStarTypeId
  );
  ratingStep.questions.push(ratingQuestion);
  steps.push({ ...ratingStep, flowMembership: 'shared', flowId });

  return {
    steps,
    choiceQuestionId: choiceQuestion.id,
    branchQuestionId: ratingQuestion.id,
    ratingStepId: ratingStep.id,
  };
}
