import type { AIContext } from '@/shared/api';
import type { QuestionData } from '@/entities/formQuestion';
import type { FormData } from '@/entities/form';

// Step types - re-export from shared (which re-exports from entities/formStep)
export * from '@/shared/stepCards/models/stepContent';

// Entity types - re-export for backward compatibility (ADR-014 Phase 1)
export type { QuestionData };
export type { FormData };

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

// Form Editor State (multi-entity workflow state - stays in feature layer)
export interface FormEditorState {
  formData: FormData;
  questions: QuestionData[];
  aiContext: AIContext | null;
  formId: string | null;
  isLoading: boolean;
  error: string | null;
}
