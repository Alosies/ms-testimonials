// Type guards for step type narrowing - re-export from shared
export {
  isWelcomeStep,
  isQuestionStep,
  isRatingStep,
  isConsentStep,
  isContactInfoStep,
  isRewardStep,
  isThankYouStep,
} from '@/shared/stepCards/functions/typeGuards';

// Default content factories for new steps
export {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from './contentFactories';

// Re-export FormContext type from shared
export type { FormContext } from '@/shared/stepCards/models/stepContent';

// Step display helpers (labels, icons)
export { getStepLabel, getStepIcon } from './stepHelpers';

// Step data transformation
export { transformFormSteps } from './stepTransform';

// Multi-entity functions (ADR-014 Phase 4)
export {
  buildStepsFromQuestions,
  stripInternalFields,
  mapQuestionsToSteps,
  getBranchFlowUpdates,
} from './buildStepsFromQuestions';

// Step ordering functions (ADR-014 Phase 4)
export {
  calculateStepOrdering,
  recalculateFlowOrdering,
  getStepOrderUpdates,
  getAllStepOrderUpdates,
  validateStepOrders,
  normalizeStepOrders,
} from './calculateStepOrdering';

// Branching validation functions (ADR-014 Phase 4)
export {
  validateBranchingConfig,
  canBeBranchPoint,
  findPossibleBranchPoints,
  canEnableBranching,
  getRecommendedBranchPoint,
  isValidThreshold,
  clampThreshold,
  MIN_THRESHOLD,
  MAX_THRESHOLD,
} from './validateBranchingConfig';

// Question type change analysis (ADR-017)
export { analyzeQuestionTypeChange } from './analyzeQuestionTypeChange';

// Question type change field transfer (ADR-017)
export { getTransferableQuestionFields } from './getTransferableQuestionFields';

// =============================================================================
// Type Re-exports from models (FSD: types exported from models/)
// =============================================================================
export type {
  // buildStepsFromQuestions types
  BuildStepsParams,
  FormStepInput,
  BuildStepsResult,
  // calculateStepOrdering types
  OrderableStep,
  ReorderResult,
  StepOrderUpdate,
  CalculateOrderingParams,
  RecalculateFlowOrderParams,
  // validateBranchingConfig types
  ValidatableStep,
  BranchingValidationError,
  BranchingValidationWarning,
  BranchingValidationResult,
  ValidateBranchingParams,
  // analyzeQuestionTypeChange types
  TypeChangeAnalysis,
  AnalyzableQuestion,
  // getTransferableQuestionFields types
  QuestionTypeCapabilities,
  TransferableQuestionInput,
  TransferableQuestionFields,
} from '../models/functionTypes';
