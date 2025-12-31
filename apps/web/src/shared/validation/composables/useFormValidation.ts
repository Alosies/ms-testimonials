import { computed, ref, type Ref } from 'vue';
import { useForm, useField, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { z } from 'zod';
import type { GenericObject } from 'vee-validate';

/**
 * Create a typed form with Zod schema validation
 *
 * @example
 * ```ts
 * const { form, handleSubmit, errors } = useTypedForm({
 *   schema: myZodSchema,
 *   initialValues: { name: '' },
 * })
 * ```
 */
export function useTypedForm<TSchema extends z.ZodType>(options: {
  schema: TSchema;
  initialValues?: Partial<z.infer<TSchema>>;
  validateOnMount?: boolean;
}) {
  const { schema, initialValues, validateOnMount = false } = options;

  const typedSchema = toTypedSchema(schema);

  const form = useForm<z.infer<TSchema>>({
    validationSchema: typedSchema,
    initialValues: initialValues as z.infer<TSchema>,
    validateOnMount,
  });

  return {
    // Form instance
    form,

    // Form state
    values: form.values,
    errors: form.errors,
    meta: form.meta,
    isSubmitting: form.isSubmitting,
    isValidating: form.isValidating,

    // Form actions
    handleSubmit: form.handleSubmit,
    validate: form.validate,
    validateField: form.validateField,
    resetForm: form.resetForm,
    setFieldValue: form.setFieldValue,
    setFieldError: form.setFieldError,
    setErrors: form.setErrors,
    setValues: form.setValues,

    // Computed helpers
    isValid: computed(() => form.meta.value.valid),
    isDirty: computed(() => form.meta.value.dirty),
    isTouched: computed(() => form.meta.value.touched),
  };
}

/**
 * Create a typed field with automatic error handling
 *
 * @example
 * ```ts
 * const { value, errorMessage, attrs } = useTypedField<string>('email')
 * ```
 */
export function useTypedField<TValue = unknown>(
  name: string,
  options?: {
    validateOnValueUpdate?: boolean;
    validateOnMount?: boolean;
  }
) {
  const field = useField<TValue>(name, undefined, {
    validateOnValueUpdate: options?.validateOnValueUpdate ?? true,
    validateOnMount: options?.validateOnMount ?? false,
  });

  return {
    // Field value (v-model compatible)
    value: field.value,

    // Field state
    errorMessage: field.errorMessage,
    errors: field.errors,
    meta: field.meta,

    // Field actions
    validate: field.validate,
    resetField: field.resetField,
    setValue: field.setValue,
    setTouched: field.setTouched,
    setErrors: field.setErrors,

    // Computed helpers
    isValid: computed(() => field.meta.valid),
    isDirty: computed(() => field.meta.dirty),
    isTouched: computed(() => field.meta.touched),
    hasError: computed(() => !!field.errorMessage.value),

    // Props to spread on input elements
    attrs: computed(() => ({
      name,
      'aria-invalid': !!field.errorMessage.value,
      'aria-describedby': field.errorMessage.value
        ? `${name}-error`
        : undefined,
    })),
  };
}

/**
 * Create a typed field array for dynamic form fields
 *
 * @example
 * ```ts
 * const { fields, push, remove } = useTypedFieldArray<{ email: string }>('emails')
 * ```
 */
export function useTypedFieldArray<TValue = unknown>(name: string) {
  const fieldArray = useFieldArray<TValue>(name);

  return {
    // Array of field entries
    fields: fieldArray.fields,

    // Array actions
    push: fieldArray.push,
    remove: fieldArray.remove,
    insert: fieldArray.insert,
    update: fieldArray.update,
    replace: fieldArray.replace,
    prepend: fieldArray.prepend,
    move: fieldArray.move,
    swap: fieldArray.swap,
  };
}

/**
 * Multi-step form validation helper
 *
 * @example
 * ```ts
 * const { currentStep, goToStep, validateCurrentStep } = useMultiStepForm({
 *   steps: ['step1', 'step2', 'step3'],
 *   stepSchemas: { step1: schema1, step2: schema2, step3: schema3 },
 * })
 * ```
 */
export function useMultiStepForm<
  TSteps extends string,
  TSchemas extends Record<TSteps, z.ZodType>,
>(options: {
  steps: TSteps[];
  stepSchemas: TSchemas;
  initialStep?: TSteps;
  onStepChange?: (from: TSteps, to: TSteps) => void;
}) {
  const { steps, stepSchemas, initialStep, onStepChange } = options;

  const currentStepIndex = ref(
    initialStep ? steps.indexOf(initialStep) : 0
  ) as Ref<number>;

  const currentStep = computed(() => steps[currentStepIndex.value]);

  const currentSchema = computed(() => stepSchemas[currentStep.value]);

  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(
    () => currentStepIndex.value === steps.length - 1
  );

  const progress = computed(
    () => ((currentStepIndex.value + 1) / steps.length) * 100
  );

  function goToStep(step: TSteps | number) {
    const targetIndex = typeof step === 'number' ? step : steps.indexOf(step);

    if (targetIndex >= 0 && targetIndex < steps.length) {
      const from = currentStep.value;
      currentStepIndex.value = targetIndex;
      onStepChange?.(from, steps[targetIndex]);
    }
  }

  function nextStep() {
    if (!isLastStep.value) {
      goToStep(currentStepIndex.value + 1);
    }
  }

  function previousStep() {
    if (!isFirstStep.value) {
      goToStep(currentStepIndex.value - 1);
    }
  }

  async function validateCurrentStep(
    values: GenericObject
  ): Promise<{ valid: boolean; errors: Record<string, string> }> {
    const schema = currentSchema.value;
    const result = schema.safeParse(values);

    if (result.success) {
      return { valid: true, errors: {} };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });

    return { valid: false, errors };
  }

  return {
    // Current state
    currentStep,
    currentStepIndex,
    currentSchema,

    // Step info
    steps,
    totalSteps: steps.length,
    progress,
    isFirstStep,
    isLastStep,

    // Navigation
    goToStep,
    nextStep,
    previousStep,

    // Validation
    validateCurrentStep,
  };
}

/**
 * Async field validation helper
 * Useful for server-side validation like checking slug availability
 *
 * @example
 * ```ts
 * const { validate, isValidating, error } = useAsyncValidation({
 *   validate: async (value) => {
 *     const available = await checkSlugAvailability(value)
 *     return available ? true : 'Slug is already taken'
 *   },
 *   debounceMs: 300,
 * })
 * ```
 */
export function useAsyncValidation<T>(options: {
  validate: (value: T) => Promise<string | true>;
  debounceMs?: number;
}) {
  const { validate: validateFn, debounceMs = 300 } = options;

  const isValidating = ref(false);
  const error = ref<string | null>(null);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  async function validate(value: T): Promise<boolean> {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        isValidating.value = true;
        error.value = null;

        try {
          const result = await validateFn(value);
          if (result === true) {
            error.value = null;
            resolve(true);
          } else {
            error.value = result;
            resolve(false);
          }
        } catch (e) {
          error.value = 'Validation failed';
          resolve(false);
        } finally {
          isValidating.value = false;
        }
      }, debounceMs);
    });
  }

  function reset() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    isValidating.value = false;
    error.value = null;
  }

  return {
    validate,
    reset,
    isValidating: computed(() => isValidating.value),
    error: computed(() => error.value),
  };
}
