/**
 * Shared builders and primitives for E2E form creation.
 *
 * Structure:
 * - primitives: Low-level functions (createStep, createQuestion, etc.)
 * - formBuilder: Form entity creation
 * - flowBuilder: Flow entity creation (primary and branch)
 * - branchSteps: Branch flow step creation (testimonial/improvement)
 */

// Primitives (low-level building blocks)
export {
  createStep,
  createQuestion,
  createQuestionOption,
  getQuestionTypeId,
  DEFAULT_STEP_CONTENT,
} from './primitives';

// Form builder
export { createTestForm, type CreateFormParams, type CreateFormResult } from './formBuilder';

// Flow builder
export {
  createPrimaryFlow,
  createBranchFlows,
  type CreatePrimaryFlowParams,
  type CreateBranchFlowsParams,
  type BranchFlowsResult,
} from './flowBuilder';

// Branch steps builder
export {
  createTestimonialSteps,
  createImprovementSteps,
  type CreateBranchStepsParams,
} from './branchSteps';
