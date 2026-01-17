import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateTestFormDocument,
  CreateTestFlowDocument,
  CreateBranchFlowDocument,
  UpdateFormBranchingConfigDocument,
  type CreateTestFormMutation,
  type CreateTestFlowMutation,
  type CreateBranchFlowMutation,
  type UpdateFormBranchingConfigMutation,
} from '@/graphql/generated/operations';
import type { TestStep, TestFlow, TestBranchedFormResult } from '../types';
import { QUESTION_TYPE_IDS } from '../constants';
import { createStep, createQuestion } from './helpers';

/**
 * Create a test form with branching (shared + testimonial + improvement flows)
 *
 * Creates a complete branched form structure for E2E testing that mimics
 * the Taskflow form pattern:
 * - 1 form with "E2E Branched Form" prefix
 * - 1 shared flow with: welcome, 3 questions, rating steps (5 total, rating last)
 * - 1 testimonial flow (rating >= 4) with: question, consent, thank_you steps
 * - 1 improvement flow (rating < 4) with: question, thank_you steps
 *
 * Structure mirrors production form patterns:
 * - Shared flow: welcome(0), problem_before(1), solution_experience(2), specific_results(3), rating(4)
 * - Testimonial flow: recommendation(0), consent(1), thank_you(2)
 * - Improvement flow: improvement_feedback(0), thank_you(1)
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
  const formName = `E2E Branched Form - ${name}`;

  // 1. Create the form
  const { data: formData, error: formError } = await executeGraphQLAsAdmin<CreateTestFormMutation>(
    CreateTestFormDocument,
    {
      organization_id: organizationId,
      name: formName,
      status: 'draft',
      created_by: createdBy,
      product_name: 'Test Product',
      product_description: 'A test product for E2E branching tests',
    }
  );

  if (formError || !formData?.insert_forms_one?.id) {
    throw new Error(`Failed to create test form: ${formError?.message || 'No form ID returned'}`);
  }

  const formId = formData.insert_forms_one.id;

  // 2. Create the shared flow (primary)
  const { data: sharedFlowData, error: sharedFlowError } = await executeGraphQLAsAdmin<CreateTestFlowMutation>(
    CreateTestFlowDocument,
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Shared Steps',
      flow_type: 'shared',
      is_primary: true,
      display_order: 0,
    }
  );

  if (sharedFlowError || !sharedFlowData?.insert_flows_one?.id) {
    throw new Error(`Failed to create shared flow: ${sharedFlowError?.message || 'No flow ID returned'}`);
  }

  const sharedFlowId = sharedFlowData.insert_flows_one.id;

  // 3. Create shared steps: welcome, 3 questions, rating (5 total, rating last)
  const sharedSteps = await createSharedSteps(sharedFlowId, organizationId);
  const branchQuestionId = sharedSteps.branchQuestionId;
  const ratingStepId = sharedSteps.ratingStepId;

  // Update form's branching_config with enabled=true and ratingStepId
  const { error: branchingConfigError } = await executeGraphQLAsAdmin<UpdateFormBranchingConfigMutation>(
    UpdateFormBranchingConfigDocument,
    {
      id: formId,
      branching_config: {
        enabled: true,
        threshold: 4,
        ratingStepId: ratingStepId,
      },
    }
  );

  if (branchingConfigError) {
    throw new Error(`Failed to update branching config: ${branchingConfigError.message}`);
  }

  // 4. Create testimonial flow (rating >= 4)
  const { data: testimonialFlowData, error: testimonialFlowError } = await executeGraphQLAsAdmin<CreateBranchFlowMutation>(
    CreateBranchFlowDocument,
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Testimonial Flow',
      flow_type: 'branch',
      is_primary: false,
      display_order: 1,
      branch_question_id: branchQuestionId,
      branch_field: 'answer_integer',
      branch_operator: 'greater_than_or_equal_to',
      branch_value: { type: 'number', value: 4 },
    }
  );

  if (testimonialFlowError || !testimonialFlowData?.insert_flows_one?.id) {
    throw new Error(`Failed to create testimonial flow: ${testimonialFlowError?.message || 'No flow ID returned'}`);
  }

  const testimonialFlowId = testimonialFlowData.insert_flows_one.id;

  // 5. Create testimonial steps (for rating >= 4)
  const testimonialSteps = await createTestimonialSteps(testimonialFlowId, organizationId);

  // 6. Create improvement flow (rating < 4)
  const { data: improvementFlowData, error: improvementFlowError } = await executeGraphQLAsAdmin<CreateBranchFlowMutation>(
    CreateBranchFlowDocument,
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Improvement Flow',
      flow_type: 'branch',
      is_primary: false,
      display_order: 2,
      branch_question_id: branchQuestionId,
      branch_field: 'answer_integer',
      branch_operator: 'less_than',
      branch_value: { type: 'number', value: 4 },
    }
  );

  if (improvementFlowError || !improvementFlowData?.insert_flows_one?.id) {
    throw new Error(`Failed to create improvement flow: ${improvementFlowError?.message || 'No flow ID returned'}`);
  }

  const improvementFlowId = improvementFlowData.insert_flows_one.id;

  // 7. Create improvement steps (for rating < 4)
  const improvementSteps = await createImprovementSteps(improvementFlowId, organizationId);

  // Build result
  const sharedFlow: TestFlow = {
    id: sharedFlowId,
    name: 'Shared Steps',
    flowType: 'shared',
    isPrimary: true,
    displayOrder: 0,
    steps: sharedSteps.steps,
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
    allSteps: [...sharedSteps.steps, ...testimonialSteps, ...improvementSteps],
    branchQuestionId,
  };
}

/**
 * Create shared steps for branched form
 */
async function createSharedSteps(
  sharedFlowId: string,
  organizationId: string
): Promise<{ steps: TestStep[]; branchQuestionId: string; ratingStepId: string }> {
  const steps: TestStep[] = [];
  let stepOrder = 0;
  let branchQuestionId = '';
  let ratingStepId = '';

  // Welcome step (step_order: 0)
  const welcomeStep = await createStep(sharedFlowId, organizationId, 'welcome', stepOrder++);
  steps.push({ ...welcomeStep, flowMembership: 'shared', flowId: sharedFlowId });

  // Question step 1: Problem before (step_order: 1)
  const problemStep = await createStep(sharedFlowId, organizationId, 'question', stepOrder++);
  const problemQuestion = await createQuestion(
    problemStep.id,
    organizationId,
    'Before using our product, what challenges did you face?',
    'problem_before',
    QUESTION_TYPE_IDS.TEXT_LONG
  );
  problemStep.questions.push(problemQuestion);
  steps.push({ ...problemStep, flowMembership: 'shared', flowId: sharedFlowId });

  // Question step 2: Solution experience (step_order: 2)
  const solutionStep = await createStep(sharedFlowId, organizationId, 'question', stepOrder++);
  const solutionQuestion = await createQuestion(
    solutionStep.id,
    organizationId,
    'Can you describe your experience using our product? What features stood out?',
    'solution_experience',
    QUESTION_TYPE_IDS.TEXT_LONG
  );
  solutionStep.questions.push(solutionQuestion);
  steps.push({ ...solutionStep, flowMembership: 'shared', flowId: sharedFlowId });

  // Question step 3: Specific results (step_order: 3)
  const resultsStep = await createStep(sharedFlowId, organizationId, 'question', stepOrder++);
  const resultsQuestion = await createQuestion(
    resultsStep.id,
    organizationId,
    'What specific results have you seen? Please share any metrics or examples.',
    'specific_results',
    QUESTION_TYPE_IDS.TEXT_LONG
  );
  resultsStep.questions.push(resultsQuestion);
  steps.push({ ...resultsStep, flowMembership: 'shared', flowId: sharedFlowId });

  // Rating step - branch point (step_order: 4) - LAST step in shared flow
  const ratingStep = await createStep(sharedFlowId, organizationId, 'rating', stepOrder++);
  const ratingQuestion = await createQuestion(
    ratingStep.id,
    organizationId,
    'Overall, how satisfied are you with our product?',
    'rating',
    QUESTION_TYPE_IDS.RATING_STAR
  );
  ratingStep.questions.push(ratingQuestion);
  steps.push({ ...ratingStep, flowMembership: 'shared', flowId: sharedFlowId });
  branchQuestionId = ratingQuestion.id;
  ratingStepId = ratingStep.id;

  return { steps, branchQuestionId, ratingStepId };
}

/**
 * Create testimonial flow steps (rating >= 4)
 */
async function createTestimonialSteps(
  testimonialFlowId: string,
  organizationId: string
): Promise<TestStep[]> {
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Question step: recommendation (step_order: 0 within testimonial flow)
  const questionStep = await createStep(testimonialFlowId, organizationId, 'question', stepOrder++, undefined, 'testimonial');
  const question = await createQuestion(
    questionStep.id,
    organizationId,
    'What would you tell someone considering using our product?',
    'recommendation',
    QUESTION_TYPE_IDS.TEXT_LONG
  );
  questionStep.questions.push(question);
  steps.push({ ...questionStep, flowMembership: 'testimonial', flowId: testimonialFlowId });

  // Consent step (step_order: 1 within testimonial flow)
  const consentStep = await createStep(testimonialFlowId, organizationId, 'consent', stepOrder++, undefined, 'testimonial');
  steps.push({ ...consentStep, flowMembership: 'testimonial', flowId: testimonialFlowId });

  // Thank you step (step_order: 2 within testimonial flow)
  const thankYouStep = await createStep(testimonialFlowId, organizationId, 'thank_you', stepOrder++, undefined, 'testimonial');
  steps.push({ ...thankYouStep, flowMembership: 'testimonial', flowId: testimonialFlowId });

  return steps;
}

/**
 * Create improvement flow steps (rating < 4)
 */
async function createImprovementSteps(
  improvementFlowId: string,
  organizationId: string
): Promise<TestStep[]> {
  const steps: TestStep[] = [];
  let stepOrder = 0;

  // Question step: improvement feedback (step_order: 0 within improvement flow)
  const questionStep = await createStep(improvementFlowId, organizationId, 'question', stepOrder++, undefined, 'improvement');
  const question = await createQuestion(
    questionStep.id,
    organizationId,
    'What could we do to improve your experience?',
    'improvement_feedback',
    QUESTION_TYPE_IDS.TEXT_LONG
  );
  questionStep.questions.push(question);
  steps.push({ ...questionStep, flowMembership: 'improvement', flowId: improvementFlowId });

  // Thank you step (step_order: 1 within improvement flow) - with different message
  const thankYouStep = await createStep(improvementFlowId, organizationId, 'thank_you', stepOrder++, {
    title: 'Thank you for your honest feedback.',
    subtitle: 'We take your feedback seriously and will use it to improve our product.',
  }, 'improvement');
  steps.push({ ...thankYouStep, flowMembership: 'improvement', flowId: improvementFlowId });

  return steps;
}
