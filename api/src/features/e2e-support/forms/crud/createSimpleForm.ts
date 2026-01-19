/**
 * Create a simple test form with a flow, steps, and questions.
 *
 * Creates a complete form structure suitable for E2E testing:
 * - 1 form with "E2E Test Form" prefix
 * - 1 primary flow
 * - 5 steps with different types for comprehensive testing
 */
import type { TestQuestion, TestStep, TestFormResult } from '../types';
import { QUESTION_TYPE_IDS } from '../constants';
import {
  createTestForm,
  createPrimaryFlow,
  createStep,
  createQuestion,
} from './shared';

/**
 * Step configuration for simple form
 */
const STEP_CONFIGS: Array<{
  stepType: TestStep['stepType'];
  question?: { text: string; key: string; typeId: string };
}> = [
  { stepType: 'welcome' },
  {
    stepType: 'question',
    question: {
      text: 'What challenges did you face before using our product?',
      key: 'challenges',
      typeId: QUESTION_TYPE_IDS.TEXT_LONG,
    },
  },
  {
    stepType: 'rating',
    question: {
      text: 'How would you rate your experience?',
      key: 'experience_rating',
      typeId: QUESTION_TYPE_IDS.RATING_STAR,
    },
  },
  { stepType: 'contact_info' },
  { stepType: 'thank_you' },
];

/**
 * Create a test form with a flow, steps, and questions.
 *
 * @param organizationId - Organization ID (from E2E_ORGANIZATION_ID env var)
 * @param name - Form name (will be prefixed with "E2E Test Form - ")
 * @param createdBy - User ID (from E2E_USER_ID env var)
 * @returns Full form data including steps and questions for test assertions
 */
export async function createTestFormWithSteps(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<TestFormResult> {
  // 1. Create form
  const { formId, formName } = await createTestForm({ organizationId, name, createdBy });

  // 2. Create primary flow
  const flowId = await createPrimaryFlow({ formId, organizationId, name: 'Main Flow' });

  // 3. Create steps
  const steps: TestStep[] = [];

  for (let stepOrder = 0; stepOrder < STEP_CONFIGS.length; stepOrder++) {
    const config = STEP_CONFIGS[stepOrder];
    const step = await createStep(flowId, organizationId, config.stepType, stepOrder);
    const questions: TestQuestion[] = [];

    if (config.question) {
      const question = await createQuestion(
        step.id,
        organizationId,
        config.question.text,
        config.question.key,
        config.question.typeId
      );
      questions.push(question);
    }

    steps.push({
      id: step.id,
      stepType: config.stepType,
      stepOrder,
      questions,
    });
  }

  return {
    formId,
    formName,
    flowId,
    steps,
  };
}
