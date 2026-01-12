/**
 * Form Creation Wizard Composables
 *
 * Handles the AI-powered form creation flow:
 * 1. useFormWizard - 5-screen wizard state machine (concept → description → focus → generate → preview)
 * 2. useCreateFormWizard - Core state management (formData, questions, aiContext)
 * 3. useQuestionGeneration - AI question generation with animations
 * 4. useQuestionSave - Persist generated questions to database
 * 5. useCreateFormWithSteps - Final form creation from wizard output
 * 6. useTypingEffect - Staged text animation for AI generation UX
 */

// Wizard state machine
export {
  useFormWizard,
  type FormWizardContext,
  type ConceptType,
  type WizardScreen,
  type WizardAIContext,
} from './useFormWizard';

// Core wizard state
export { useCreateFormWizard } from './useCreateFormWizard';

// AI generation
export { useQuestionGeneration } from './useQuestionGeneration';
export { useQuestionSave } from './useQuestionSave';

// Final form creation
export {
  useCreateFormWithSteps,
  type CreateFormWithStepsParams,
  type CreateFormWithStepsResult,
} from './useCreateFormWithSteps';

// UI effects
export { useTypingEffect, type TypingStage } from './useTypingEffect';
