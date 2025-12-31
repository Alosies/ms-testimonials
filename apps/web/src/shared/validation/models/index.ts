import type { z } from 'zod';

/**
 * Generic form field state
 */
export interface FieldState {
  value: unknown;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
}

/**
 * Form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

/**
 * Multi-step form configuration
 */
export interface MultiStepFormConfig<TSteps extends string> {
  steps: TSteps[];
  initialStep: TSteps;
  validateOnStepChange: boolean;
}

/**
 * Step validation result
 */
export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Infer form values type from Zod schema
 */
export type InferFormValues<T extends z.ZodType> = z.infer<T>;

/**
 * Validation error map
 */
export type ValidationErrors = Record<string, string | undefined>;

/**
 * Async validation function type
 */
export type AsyncValidationFn<T = unknown> = (
  value: T
) => Promise<string | true>;

/**
 * Smart prompt step identifiers
 */
export type SmartPromptStep = 'problem' | 'solution' | 'result' | 'attribution';

/**
 * Smart prompt form data structure
 */
export interface SmartPromptFormData {
  problem: string;
  solution: string;
  result: string;
  attribution: {
    name: string;
    role?: string;
    company?: string;
    email?: string;
    avatarUrl?: string;
  };
  rating?: number;
  consent: boolean;
}
