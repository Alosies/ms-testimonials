import type { Ref } from 'vue';
import type { FlowMembership } from '@/shared/stepCards';

/**
 * Persisted form state stored in localStorage
 */
export interface PersistedFormState {
  formId: string;
  answers: Record<string, unknown>;
  currentStepIndex: number;
  determinedFlow: FlowMembership | null;
  sessionId: string;
  savedAt: number;
}

/**
 * Options for the useFormPersistence composable
 */
export interface UseFormPersistenceOptions {
  formId: Ref<string>;
  answers: Ref<Record<string, unknown>>;
  currentStepIndex: Ref<number>;
  determinedFlow: Ref<FlowMembership | null>;
}
