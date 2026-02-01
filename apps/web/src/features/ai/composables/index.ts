/**
 * AI Feature Composables
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */
export { useAIAccess } from './useAIAccess';
export type {
  AIAccessCheck,
  AIAccessCheckCapability,
  AIAccessCheckCredits,
  AIAccessCheckModel,
  AIAccessCheckQualityLevel,
  AIAccessCheckQualityLevelSummary,
  AIAccessCheckRequest,
} from './useAIAccess';

export { useAIOperationWithCredits } from './useAIOperationWithCredits';
export type {
  AICapabilityName,
  AIQualityLevel,
  ExecuteWithCreditsOptions,
  AIOperationWithCreditsResult,
  LastAIOperationResult,
} from './useAIOperationWithCredits';
