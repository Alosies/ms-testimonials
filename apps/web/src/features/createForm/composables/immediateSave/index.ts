/**
 * Immediate Save Composables (ADR-011)
 *
 * Small, focused composables for discrete actions that require immediate persistence.
 * Each wraps entity mutations with useSaveLock to coordinate with auto-save.
 *
 * - useQuestionSettings - Toggle required, change type, set validation
 * - useQuestionOptions - Add/remove/reorder question options
 * - useQuestionTypeChange - Replace question with new type (ADR-017)
 * - useFlowSettings - Update flow properties, clear branching
 *
 * @see docs/adr/011-immediate-save-actions/adr.md
 */

export { useQuestionSettings } from './useQuestionSettings';
export { useQuestionOptions } from './useQuestionOptions';
export { useQuestionTypeChange } from './useQuestionTypeChange';
export type { ReplaceQuestionParams, ReplaceQuestionResult } from './useQuestionTypeChange';
export { useFlowSettings } from './useFlowSettings';
export { useStepContentSettings } from './useStepContentSettings';
