/**
 * Check AI Access
 *
 * Combined function that verifies both capability access and credit balance
 * for AI operations. This is the primary entry point for determining whether
 * an organization can execute an AI operation.
 *
 * Flow:
 * 1. Check capability access (plan includes feature, quality level available)
 * 2. If denied, return early with capability denial info
 * 3. Calculate estimated credits for the operation
 * 4. Check credit balance against estimated cost
 * 5. Return unified AIAccessResult
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T3.3)
 */

import { checkCapabilityAccess } from './checkCapabilityAccess';
import {
  checkCreditBalance,
  type CreditBalanceCheck,
} from '@/features/credits';
import type {
  AICapabilityId,
  QualityLevelId,
  AIAccessResult,
  AICapabilityAccessResult,
  QualityLevelInfo,
} from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Parameters for checking AI access.
 */
export interface CheckAIAccessParams {
  /** The organization ID to check */
  organizationId: string;

  /** The unique name of the AI capability (e.g., 'question_generation') */
  capabilityUniqueName: AICapabilityId;

  /** Optional: specific quality level to use. If not provided, uses the first available. */
  qualityLevelUniqueName?: QualityLevelId;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Check if an organization can execute an AI operation.
 *
 * This function performs a comprehensive access check:
 * 1. Verifies the plan includes the requested capability
 * 2. Validates the requested quality level is available
 * 3. Checks sufficient credits are available
 *
 * Use this function before executing any AI operation to ensure access
 * and prevent insufficient credit scenarios.
 *
 * @param params - The access check parameters
 * @returns AIAccessResult with canProceed flag and detailed information
 *
 * @example
 * ```typescript
 * const access = await checkAIAccess({
 *   organizationId: 'org_123',
 *   capabilityUniqueName: 'testimonial_assembly',
 *   qualityLevelUniqueName: 'enhanced',
 * });
 *
 * if (!access.canProceed) {
 *   return c.json({ error: access.reason }, 402);
 * }
 *
 * // Proceed with AI operation using access.selectedQualityLevel
 * const modelId = access.selectedQualityLevel.defaultModelId;
 * ```
 */
export async function checkAIAccess(
  params: CheckAIAccessParams
): Promise<AIAccessResult> {
  const { organizationId, capabilityUniqueName, qualityLevelUniqueName } =
    params;

  // Step 1: Check capability access
  const capabilityAccess = await checkCapabilityAccess(
    organizationId,
    capabilityUniqueName,
    qualityLevelUniqueName
  );

  // Step 2: If capability denied, return early
  if (!capabilityAccess.hasAccess) {
    return createCapabilityDeniedResult(capabilityAccess, qualityLevelUniqueName);
  }

  // Step 3: Select the quality level to use
  const selectedQualityLevel = selectQualityLevel(
    capabilityAccess.availableQualityLevels,
    qualityLevelUniqueName
  );

  // This should not happen if hasAccess is true, but TypeScript doesn't know that
  if (!selectedQualityLevel) {
    return createCapabilityDeniedResult(capabilityAccess, qualityLevelUniqueName);
  }

  // Step 4: Get estimated credits for this operation
  const estimatedCredits = selectedQualityLevel.creditCost;

  // Step 5: Check credit balance
  const creditCheck = await checkCreditBalance(organizationId, estimatedCredits);

  // Step 6: Build and return the result
  if (!creditCheck.canProceed) {
    return createInsufficientCreditsResult(
      capabilityAccess,
      creditCheck,
      selectedQualityLevel
    );
  }

  return createSuccessResult(
    capabilityAccess,
    creditCheck,
    selectedQualityLevel
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Select the quality level to use for the operation.
 *
 * If a specific quality level is requested, returns that level (if available).
 * Otherwise, returns the first available quality level (typically 'fast').
 */
function selectQualityLevel(
  availableQualityLevels: QualityLevelInfo[],
  requestedQuality?: QualityLevelId
): QualityLevelInfo | undefined {
  if (requestedQuality) {
    return availableQualityLevels.find(
      (ql) => ql.uniqueName === requestedQuality
    );
  }

  // Default to first available (usually 'fast')
  return availableQualityLevels[0];
}

/**
 * Create a denial result when capability access is denied.
 */
function createCapabilityDeniedResult(
  capabilityAccess: AICapabilityAccessResult,
  requestedQuality?: QualityLevelId
): AIAccessResult {
  // Generate helpful reason message
  let reason: string;
  switch (capabilityAccess.reason) {
    case 'plan_not_active':
      reason = 'Your subscription is not active. Please renew to use AI features.';
      break;
    case 'capability_not_included':
      reason = `The '${capabilityAccess.capabilityName}' feature is not included in your current plan.`;
      break;
    case 'rate_limit_exceeded':
      // Determine which limit was hit for better messaging
      if (
        capabilityAccess.hourlyLimit !== null &&
        capabilityAccess.usedThisHour >= capabilityAccess.hourlyLimit
      ) {
        reason = `You've reached the hourly limit (${capabilityAccess.hourlyLimit} requests) for '${capabilityAccess.capabilityName}'. Try again in a few minutes.`;
      } else {
        reason = `You've reached the daily limit (${capabilityAccess.dailyLimit} requests) for '${capabilityAccess.capabilityName}'. Your limit resets at midnight UTC.`;
      }
      break;
    default:
      reason = 'Access to this AI capability is not available.';
  }

  // If a specific quality level was requested but not available
  if (
    requestedQuality &&
    capabilityAccess.hasAccess === false &&
    capabilityAccess.availableQualityLevels.length > 0
  ) {
    reason = `The '${requestedQuality}' quality level is not available on your plan. Available: ${capabilityAccess.availableQualityLevels.map((ql) => ql.uniqueName).join(', ')}`;
  }

  return {
    canProceed: false,
    capability: capabilityAccess,
    credits: {
      available: 0,
      required: 0,
      afterOperation: 0,
    },
    selectedQualityLevel: createEmptyQualityLevel(),
    reason,
  };
}

/**
 * Create a denial result when credits are insufficient.
 */
function createInsufficientCreditsResult(
  capabilityAccess: AICapabilityAccessResult,
  creditCheck: CreditBalanceCheck,
  selectedQualityLevel: QualityLevelInfo
): AIAccessResult {
  const shortfall = creditCheck.estimatedCost - creditCheck.spendable;

  // Generate helpful reason message with topup suggestion
  let reason = `Insufficient credits: need ${creditCheck.estimatedCost}, have ${creditCheck.spendable} available.`;

  // Add suggestion based on context
  if (creditCheck.periodEndsAt) {
    const daysUntilReset = Math.ceil(
      (creditCheck.periodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilReset <= 7) {
      reason += ` Your credits reset in ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'}.`;
    }
  }

  reason += ` You need ${shortfall.toFixed(1)} more credits to proceed.`;

  return {
    canProceed: false,
    capability: capabilityAccess,
    credits: {
      available: creditCheck.spendable,
      required: creditCheck.estimatedCost,
      afterOperation: creditCheck.afterOperation,
    },
    selectedQualityLevel,
    reason,
  };
}

/**
 * Create a successful access result.
 */
function createSuccessResult(
  capabilityAccess: AICapabilityAccessResult,
  creditCheck: CreditBalanceCheck,
  selectedQualityLevel: QualityLevelInfo
): AIAccessResult {
  return {
    canProceed: true,
    capability: capabilityAccess,
    credits: {
      available: creditCheck.spendable,
      required: creditCheck.estimatedCost,
      afterOperation: creditCheck.afterOperation,
    },
    selectedQualityLevel,
  };
}

/**
 * Create an empty quality level for denied results.
 */
function createEmptyQualityLevel(): QualityLevelInfo {
  return {
    id: '',
    uniqueName: 'fast',
    name: '',
    creditCost: 0,
    defaultModelId: '',
    allowedModelIds: [],
  };
}
