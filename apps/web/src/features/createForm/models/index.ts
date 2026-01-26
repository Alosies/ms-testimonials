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

// Timeline editor types (ADR-014 Phase 5, CR-002)
export type {
  TimelineState,
  TimelineSelection,
  TimelineSelectionReturn,
  StepAddOptions,
  TimelineStepOps,
  TimelineStepOpsLocal,
  TimelineStepOpsPersist,
  TimelinePersistence,
  TimelineComputed,
} from './timeline';

// Function types - extracted from functions/ per FSD guidelines
export type {
  // analyzeQuestionTypeChange types (ADR-017)
  TypeChangeAnalysis,
  AnalyzableQuestion,
  // getTransferableQuestionFields types (ADR-017)
  QuestionTypeCapabilities,
  TransferableQuestionInput,
  TransferableQuestionFields,
  // buildStepsFromQuestions types (ADR-014)
  BuildStepsParams,
  FormStepInput,
  BuildStepsResult,
  // calculateStepOrdering types (ADR-014)
  OrderableStep,
  ReorderResult,
  StepOrderUpdate,
  CalculateOrderingParams,
  RecalculateFlowOrderParams,
  // validateBranchingConfig types (ADR-014)
  ValidatableStep,
  BranchingValidationError,
  BranchingValidationWarning,
  BranchingValidationResult,
  ValidateBranchingParams,
} from './functionTypes';

// Help content for properties panel
export interface HelpContent {
  title: string;
  description: string;
  tips: string[];
}

// Wizard Preview Step type - shared across preview components
export type PreviewStepType = 'welcome' | 'question' | 'rating' | 'thank_you' | 'consent' | 'testimonial_write' | 'contact_info';

export interface PreviewStep {
  type: PreviewStepType;
  title: string;
  subtitle?: string;
  flowMembership: 'shared' | 'testimonial' | 'improvement';
  isBranchPoint?: boolean;
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
