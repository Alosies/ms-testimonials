import type { AIQuestion, AIContext } from '@/shared/api';

// Wizard Step Types
export type WizardStep = 'product-info' | 'ai-suggestions' | 'customize' | 'preview';

// Form Data (collected in Step 1)
export interface FormData {
  name: string;
  slug: string;
  product_name: string;
  product_description: string;
  focus_areas?: string; // Optional guidance for AI question generation
}

// Question Data (with local editing state)
export interface QuestionData extends AIQuestion {
  id?: string;
  isNew?: boolean;
  isModified?: boolean;
}

// Wizard State
export interface WizardState {
  currentStep: WizardStep;
  formData: FormData;
  questions: QuestionData[];
  aiContext: AIContext | null;
  formId: string | null;
  isLoading: boolean;
  error: string | null;
}
