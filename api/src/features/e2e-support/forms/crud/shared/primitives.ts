/**
 * Low-level primitives for creating test form entities.
 * These are the building blocks used by higher-level builders.
 */
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateTestFormStepDocument,
  CreateTestFormQuestionDocument,
  CreateTestQuestionOptionDocument,
  GetQuestionTypeByNameDocument,
  type CreateTestFormStepMutation,
  type CreateTestFormQuestionMutation,
  type CreateTestQuestionOptionMutation,
  type GetQuestionTypeByNameQuery,
} from '@/graphql/generated/operations';
import type { TestStep, TestQuestion, TestQuestionOption } from '../../types';

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
  testimonial_write: {
    enableAIPath: true,
    title: 'Share your testimonial',
    subtitle: 'Write your experience in your own words',
    placeholder: 'Describe how our product helped you...',
    minLength: 50,
    maxLength: 1000,
    showPreviousAnswers: true,
    previousAnswersLabel: 'Your responses for reference',
    aiPathTitle: 'Let AI craft your story',
    aiPathDescription: "We'll transform your answers into a testimonial. You review and edit before submit.",
    manualPathTitle: 'Write it yourself',
    manualPathDescription: 'Write your own testimonial in your words.',
  },
};

/**
 * Create a step
 */
export async function createStep(
  flowId: string,
  organizationId: string,
  stepType: TestStep['stepType'],
  stepOrder: number,
  contentOverride?: object,
  flowMembership: string = 'shared'
): Promise<TestStep> {
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
 * Create a question
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

/**
 * Create a question option
 */
export async function createQuestionOption(
  questionId: string,
  organizationId: string,
  createdBy: string,
  optionValue: string,
  optionLabel: string,
  displayOrder: number,
  isDefault: boolean = false
): Promise<TestQuestionOption> {
  const { data, error } = await executeGraphQLAsAdmin<CreateTestQuestionOptionMutation>(
    CreateTestQuestionOptionDocument,
    {
      organization_id: organizationId,
      question_id: questionId,
      option_value: optionValue,
      option_label: optionLabel,
      display_order: displayOrder,
      is_default: isDefault,
      created_by: createdBy,
    }
  );

  if (error || !data?.insert_question_options_one?.id) {
    throw new Error(`Failed to create question option: ${error?.message || 'No option ID returned'}`);
  }

  return {
    id: data.insert_question_options_one.id,
    questionId,
    optionValue,
    optionLabel,
    displayOrder,
    isDefault,
  };
}

/**
 * Get question type ID by unique_name.
 * Caches results to avoid repeated DB calls.
 */
const questionTypeCache = new Map<string, string>();

export async function getQuestionTypeId(uniqueName: string): Promise<string> {
  if (questionTypeCache.has(uniqueName)) {
    return questionTypeCache.get(uniqueName)!;
  }

  const { data, error } = await executeGraphQLAsAdmin<GetQuestionTypeByNameQuery>(
    GetQuestionTypeByNameDocument,
    { unique_name: uniqueName }
  );

  if (error || !data?.question_types?.[0]?.id) {
    throw new Error(`Failed to find question type "${uniqueName}": ${error?.message || 'Not found'}`);
  }

  const typeId = data.question_types[0].id;
  questionTypeCache.set(uniqueName, typeId);
  return typeId;
}
