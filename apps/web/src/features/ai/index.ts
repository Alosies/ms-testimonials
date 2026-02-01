/**
 * AI Feature
 *
 * Provides AI capability access checking and credit management.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */

// Composables
export { useAIAccess, useAIOperationWithCredits } from './composables';

// Types (exported from models per FSD guidelines)
export type {
  AIAccessCheck,
  AIAccessCheckCapability,
  AIAccessCheckCredits,
  AIAccessCheckModel,
  AIAccessCheckQualityLevel,
  AIAccessCheckQualityLevelSummary,
  AIAccessCheckRequest,
  AICapabilityName,
  AIQualityLevel,
  ExecuteWithCreditsOptions,
  AIOperationWithCreditsResult,
  LastAIOperationResult,
} from './models';

// UI Components
export * from './ui';
