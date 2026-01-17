import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateTestFormStepDocument,
  CreateTestFormQuestionDocument,
  type CreateTestFormStepMutation,
  type CreateTestFormQuestionMutation,
} from '@/graphql/generated/operations';
import type { TestStep, TestQuestion } from '../types';

/**
 * Default content for step types that require it
 */
export const DEFAULT_STEP_CONTENT: Partial<Record<TestStep['stepType'], object>> = {
  welcome: {
    title: 'Share your experience with us',
    subtitle: 'It only takes a couple of minutes',
    buttonText: 'Get Started',
  },
  consent: {
    title: 'One last thing...',
    description: 'Can we share your feedback?',
    options: {
      public: {
        label: 'Share publicly',
        description: 'Your testimonial may be featured on our website and marketing materials.',
      },
      private: {
        label: 'Keep private',
        description: 'Your feedback will be used internally to improve our product.',
      },
    },
  },
  thank_you: {
    title: 'Thank you!',
    subtitle: 'We really appreciate your feedback',
  },
};

/**
 * Helper: Create a step
 */
export async function createStep(
  flowId: string,
  organizationId: string,
  stepType: TestStep['stepType'],
  stepOrder: number,
  contentOverride?: object,
  flowMembership: string = 'shared'
): Promise<TestStep> {
  // Use provided content, or default content for step types that need it
  const content = contentOverride ?? DEFAULT_STEP_CONTENT[stepType] ?? {};

  const { data, error } = await executeGraphQLAsAdmin<CreateTestFormStepMutation>(
    CreateTestFormStepDocument,
    {
      flow_id: flowId,
      organization_id: organizationId,
      step_type: stepType,
      step_order: stepOrder,
      is_active: true,
      content,
      flow_membership: flowMembership,
    }
  );

  if (error || !data?.insert_form_steps_one?.id) {
    throw new Error(`Failed to create step: ${error?.message || 'No step ID returned'}`);
  }

  return {
    id: data.insert_form_steps_one.id,
    stepType,
    stepOrder,
    questions: [],
  };
}

/**
 * Helper: Create a question
 */
export async function createQuestion(
  stepId: string,
  organizationId: string,
  questionText: string,
  questionKey: string,
  questionTypeId: string
): Promise<TestQuestion> {
  const { data, error } = await executeGraphQLAsAdmin<CreateTestFormQuestionMutation>(
    CreateTestFormQuestionDocument,
    {
      step_id: stepId,
      organization_id: organizationId,
      question_type_id: questionTypeId,
      question_text: questionText,
      question_key: questionKey,
      display_order: 1,
      is_required: true,
      is_active: true,
    }
  );

  if (error || !data?.insert_form_questions_one?.id) {
    throw new Error(`Failed to create question: ${error?.message || 'No question ID returned'}`);
  }

  return {
    id: data.insert_form_questions_one.id,
    stepId,
    questionText,
    questionKey,
    questionTypeId,
    displayOrder: 1,
    isRequired: true,
  };
}
