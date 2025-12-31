import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  smartPromptFormSchema,
  smartPromptStepSchemas,
  type SmartPromptFormValues,
  type SmartPromptStepName,
} from '../schemas';
import { useMultiStepForm } from './useFormValidation';

/**
 * Smart Prompt step configuration
 */
const SMART_PROMPT_STEPS: SmartPromptStepName[] = [
  'problem',
  'solution',
  'result',
  'attribution',
];

/**
 * Step metadata for UI rendering
 */
export const STEP_METADATA: Record<
  SmartPromptStepName,
  {
    title: string;
    description: string;
    placeholder: string;
  }
> = {
  problem: {
    title: 'The Challenge',
    description: 'What challenge or problem were you facing before?',
    placeholder:
      'Before using this product, I was struggling with...',
  },
  solution: {
    title: 'The Solution',
    description: 'How did our product/service help solve your problem?',
    placeholder:
      'This product helped me by...',
  },
  result: {
    title: 'The Result',
    description: 'What results or benefits have you experienced?',
    placeholder:
      'Since using this product, I have achieved...',
  },
  attribution: {
    title: 'About You',
    description: 'Tell us a bit about yourself (optional fields are marked)',
    placeholder: '',
  },
};

/**
 * Default initial values for the smart prompt form
 */
const DEFAULT_VALUES: SmartPromptFormValues = {
  problem: '',
  solution: '',
  result: '',
  attribution: {
    name: '',
    role: '',
    company: '',
    email: '',
    avatarUrl: '',
  },
  rating: undefined,
  consent: false as unknown as true, // Will be validated on submit
};

/**
 * Composable for managing the smart prompt multi-step form
 *
 * @example
 * ```vue
 * <script setup>
 * const {
 *   currentStep,
 *   stepMeta,
 *   form,
 *   canProceed,
 *   nextStep,
 *   previousStep,
 *   handleSubmit,
 * } = useSmartPromptForm()
 * </script>
 * ```
 */
export function useSmartPromptForm(options?: {
  initialValues?: Partial<SmartPromptFormValues>;
  onSubmit?: (values: SmartPromptFormValues) => Promise<void> | void;
  onStepChange?: (from: SmartPromptStepName, to: SmartPromptStepName) => void;
}) {
  const { initialValues, onSubmit, onStepChange } = options ?? {};

  // Multi-step navigation
  const multiStep = useMultiStepForm({
    steps: SMART_PROMPT_STEPS,
    stepSchemas: smartPromptStepSchemas,
    onStepChange,
  });

  // Form instance with full schema
  const form = useForm<SmartPromptFormValues>({
    validationSchema: toTypedSchema(smartPromptFormSchema),
    initialValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
    validateOnMount: false,
  });

  // Current step metadata
  const stepMeta = computed(() => STEP_METADATA[multiStep.currentStep.value]);

  // Check if current step fields are valid
  const currentStepFields = computed((): (keyof SmartPromptFormValues)[] => {
    const step = multiStep.currentStep.value;
    switch (step) {
      case 'problem':
        return ['problem'];
      case 'solution':
        return ['solution'];
      case 'result':
        return ['result'];
      case 'attribution':
        return ['attribution', 'rating', 'consent'];
      default:
        return [];
    }
  });

  // Field paths type for VeeValidate
  type FormFieldPath = keyof SmartPromptFormValues | `attribution.${keyof SmartPromptFormValues['attribution']}`;

  // Validate only current step fields
  async function validateCurrentStep(): Promise<boolean> {
    const fields = currentStepFields.value;
    const results = await Promise.all(
      fields.map((field) => form.validateField(field as FormFieldPath))
    );
    return results.every((result) => result.valid);
  }

  // Can proceed to next step
  const canProceed = computed(() => {
    const fields = currentStepFields.value;
    const errors = form.errors.value as Record<string, string | undefined>;
    return fields.every((field) => {
      const error = errors[field];
      return !error;
    });
  });

  // Navigate to next step with validation
  async function nextStep(): Promise<boolean> {
    const isValid = await validateCurrentStep();
    if (isValid) {
      multiStep.nextStep();
      return true;
    }
    return false;
  }

  // Navigate to previous step (no validation needed)
  function previousStep() {
    multiStep.previousStep();
  }

  // Go to specific step
  function goToStep(step: SmartPromptStepName) {
    multiStep.goToStep(step);
  }

  // Handle final form submission
  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

  // Get assembled testimonial preview
  const testimonialPreview = computed(() => {
    const { problem, solution, result } = form.values;

    if (!problem && !solution && !result) {
      return '';
    }

    const parts = [problem, solution, result].filter(Boolean);
    return parts.join(' ');
  });

  return {
    // Form instance
    form,
    values: form.values,
    errors: form.errors,
    meta: form.meta,

    // Multi-step state
    currentStep: multiStep.currentStep,
    currentStepIndex: multiStep.currentStepIndex,
    steps: SMART_PROMPT_STEPS,
    totalSteps: multiStep.totalSteps,
    progress: multiStep.progress,
    isFirstStep: multiStep.isFirstStep,
    isLastStep: multiStep.isLastStep,

    // Step metadata
    stepMeta,
    stepMetadata: STEP_METADATA,

    // Navigation
    nextStep,
    previousStep,
    goToStep,
    canProceed,
    validateCurrentStep,

    // Form actions
    handleSubmit,
    resetForm: form.resetForm,
    setFieldValue: form.setFieldValue,
    setFieldError: form.setFieldError,

    // Preview
    testimonialPreview,

    // Submission state
    isSubmitting: form.isSubmitting,
    isValidating: form.isValidating,
  };
}
