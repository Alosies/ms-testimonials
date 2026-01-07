import type { AIQuestion, AIContext } from '@/shared/api';

// Step types - re-export from shared
export * from '@/shared/stepCards/models/stepContent';

// Flow navigation types
export type {
  FlowStep,
  FlowNavigationDeps,
  FlowNavigationResult,
  BranchedNavigationDeps,
  BranchedNavigationResult,
} from './flowNavigation';

// Help content for properties panel
export interface HelpContent {
  title: string;
  description: string;
  tips: string[];
}

// Save Status Types
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Section Types (single-page layout)
export type SectionId = 'product-info' | 'questions' | 'preview';

// Form Data (collected in Step 1)
export interface FormData {
  name: string;
  product_name: string;
  product_description: string;
  focus_areas?: string; // Optional guidance for AI question generation
}

// Question Data (with local editing state)
export interface QuestionData extends AIQuestion {
  id?: string;
  isNew?: boolean;
  isModified?: boolean;
  // Rating type fields
  min_value?: number | null;
  max_value?: number | null;
  // Linear scale label customization
  scale_min_label?: string | null;
  scale_max_label?: string | null;
}

// Form Editor State
export interface FormEditorState {
  formData: FormData;
  questions: QuestionData[];
  aiContext: AIContext | null;
  formId: string | null;
  isLoading: boolean;
  error: string | null;
}
