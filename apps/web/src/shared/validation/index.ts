/**
 * Validation Module
 *
 * Provides form validation utilities using VeeValidate + Zod.
 *
 * @example
 * ```ts
 * // Using typed form with Zod schema
 * import { useTypedForm, emailSchema, nameSchema } from '@/shared/validation'
 * import { z } from 'zod'
 *
 * const schema = z.object({
 *   email: emailSchema,
 *   name: nameSchema,
 * })
 *
 * const { form, handleSubmit, errors } = useTypedForm({ schema })
 * ```
 *
 * @example
 * ```ts
 * // Using smart prompt form
 * import { useSmartPromptForm } from '@/shared/validation'
 *
 * const { currentStep, nextStep, handleSubmit } = useSmartPromptForm({
 *   onSubmit: async (values) => {
 *     await submitTestimonial(values)
 *   },
 * })
 * ```
 */

// Re-export Zod for convenience
export { z } from 'zod';

// Re-export VeeValidate core for advanced usage
export {
  useForm,
  useField,
  useFieldArray,
  useFieldValue,
  useFormErrors,
  useFormValues,
  useIsSubmitting,
  useValidateField,
  useValidateForm,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  configure,
} from 'vee-validate';

// Re-export toTypedSchema for custom schema usage
export { toTypedSchema } from '@vee-validate/zod';

// Composables
export {
  useTypedForm,
  useTypedField,
  useTypedFieldArray,
  useMultiStepForm,
  useAsyncValidation,
  useSmartPromptForm,
  STEP_METADATA,
} from './composables';

// Schemas
export * from './schemas';

// Custom rules
export * from './rules';

// Types
export type * from './models';
