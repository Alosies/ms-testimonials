/**
 * Execute with AI Access
 *
 * Higher-order function that wraps AI operations with the full credit flow:
 * 1. Check capability and credit access
 * 2. Reserve credits before operation
 * 3. Execute the AI operation
 * 4. Settle or release credits based on outcome
 *
 * This provides a clean API for AI operations that handles all credit
 * management concerns internally, returning structured results.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T4.5)
 */

import { checkAIAccess } from './checkAIAccess';
import { reserveCredits } from '@/features/credits/reserveCredits';
import { settleCredits } from '@/features/credits/settleCredits';
import { releaseCredits } from '@/features/credits/releaseCredits';
import { isAIAccessError } from '../errors';
import type { AICapabilityId, QualityLevelId } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Parameters for executing an AI operation with credit management.
 */
export interface ExecuteWithAIAccessParams<T> {
  /** Organization ID to check access and charge credits */
  organizationId: string;

  /** AI capability being used (e.g., 'question_generation') */
  capabilityUniqueName: AICapabilityId;

  /** Quality level for the operation (e.g., 'fast', 'enhanced') */
  qualityLevelUniqueName: QualityLevelId;

  /** Client-provided key to prevent duplicate operations */
  idempotencyKey: string;

  /** The AI operation to execute with access context */
  execute: (context: AIExecutionContext) => Promise<AIOperationResult<T>>;
}

/**
 * Context provided to the AI operation execution function.
 *
 * Contains all information needed to call the AI provider and track usage.
 */
export interface AIExecutionContext {
  /** Database ID of the AI capability */
  capabilityId: string;

  /** Database ID of the quality level */
  qualityLevelId: string;

  /** Array of LLM model IDs allowed for this operation */
  allowedModels: string[];

  /** Default LLM model ID to use */
  defaultModelId: string;

  /** Estimated credits for this operation */
  estimatedCredits: number;
}

/**
 * Result returned by the AI operation execution function.
 *
 * The execute function must return the operation result along with
 * actual credit usage information for settlement.
 */
export interface AIOperationResult<T> {
  /** The result of the AI operation */
  result: T;

  /** Actual credits consumed (may differ from estimate) */
  actualCredits: number;

  /** LLM provider used (e.g., 'openai', 'anthropic') */
  providerId?: string;

  /** Specific model used (e.g., 'gpt-4o-mini') */
  modelId?: string;

  /** Number of input tokens processed */
  inputTokens?: number;

  /** Number of output tokens generated */
  outputTokens?: number;

  /** Actual provider cost in USD */
  providerCostUsd?: number;
}

/**
 * Error information returned when an AI operation cannot proceed.
 */
export interface AIExecutionError {
  /** Error code for programmatic handling */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Result of executing an AI operation with credit management.
 */
export interface AIExecutionResult<T> {
  /** Whether the operation completed successfully */
  success: boolean;

  /** The operation result (only present on success) */
  result?: T;

  /** Credits actually consumed (only present on success) */
  creditsUsed?: number;

  /** Credit balance remaining after operation */
  balanceRemaining?: number;

  /** Error information (only present on failure) */
  error?: AIExecutionError;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Execute an AI operation with full credit management.
 *
 * This function wraps an AI operation with the complete credit flow:
 * 1. Checks capability access and credit availability
 * 2. Reserves credits before the operation starts
 * 3. Executes the provided AI operation
 * 4. Settles credits on success or releases on failure
 *
 * The function never throws - all errors are returned in the result object
 * for consistent error handling at the API layer.
 *
 * @param params - Execution parameters including the AI operation
 * @returns Structured result with operation outcome and credit info
 *
 * @example
 * ```typescript
 * const result = await executeWithAIAccess({
 *   organizationId: 'org_123',
 *   capabilityUniqueName: 'question_generation',
 *   qualityLevelUniqueName: 'enhanced',
 *   idempotencyKey: `questions-${formId}-${Date.now()}`,
 *   execute: async (context) => {
 *     const aiResponse = await callOpenAI(context.defaultModelId, prompt);
 *     return {
 *       result: aiResponse.questions,
 *       actualCredits: calculateCredits(aiResponse.usage),
 *       providerId: 'openai',
 *       modelId: context.defaultModelId,
 *       inputTokens: aiResponse.usage.prompt_tokens,
 *       outputTokens: aiResponse.usage.completion_tokens,
 *     };
 *   },
 * });
 *
 * if (!result.success) {
 *   return c.json({ error: result.error }, 402);
 * }
 *
 * return c.json({
 *   questions: result.result,
 *   creditsUsed: result.creditsUsed,
 *   balanceRemaining: result.balanceRemaining,
 * });
 * ```
 */
export async function executeWithAIAccess<T>(
  params: ExecuteWithAIAccessParams<T>
): Promise<AIExecutionResult<T>> {
  const {
    organizationId,
    capabilityUniqueName,
    qualityLevelUniqueName,
    idempotencyKey,
    execute,
  } = params;

  // Step 1: Check AI access (capability + credits)
  const accessResult = await checkAIAccess({
    organizationId,
    capabilityUniqueName,
    qualityLevelUniqueName,
  });

  // Step 2: If access denied, return error result (do not throw)
  if (!accessResult.canProceed) {
    return createAccessDeniedResult(accessResult.reason || 'Access denied');
  }

  const { selectedQualityLevel, capability, credits } = accessResult;

  // Step 3: Reserve credits for the operation
  let reservationId: string;
  try {
    const reservation = await reserveCredits({
      organizationId,
      estimatedCredits: selectedQualityLevel.creditCost,
      aiCapabilityId: capability.capabilityId,
      qualityLevelId: selectedQualityLevel.id,
      idempotencyKey,
    });
    reservationId = reservation.id;
  } catch (error) {
    // Handle reservation errors (insufficient credits, duplicate request)
    if (isAIAccessError(error)) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }
    return createUnexpectedError('Failed to reserve credits', error);
  }

  // Step 4: Build execution context
  const context: AIExecutionContext = {
    capabilityId: capability.capabilityId,
    qualityLevelId: selectedQualityLevel.id,
    allowedModels: selectedQualityLevel.allowedModelIds,
    defaultModelId: selectedQualityLevel.defaultModelId,
    estimatedCredits: selectedQualityLevel.creditCost,
  };

  // Step 5: Execute the AI operation
  let operationResult: AIOperationResult<T>;
  try {
    operationResult = await execute(context);
  } catch (error) {
    // Operation failed - release reserved credits
    await safeReleaseCredits(reservationId, formatErrorReason(error));

    return createOperationFailedResult(error);
  }

  // Step 6: Settle credits with actual usage
  try {
    await settleCredits({
      reservationId,
      actualCredits: operationResult.actualCredits,
      providerId: operationResult.providerId,
      modelId: operationResult.modelId,
      inputTokens: operationResult.inputTokens,
      outputTokens: operationResult.outputTokens,
      providerCostUsd: operationResult.providerCostUsd,
      description: `${capability.capabilityName} - ${selectedQualityLevel.name}`,
    });
  } catch (error) {
    // Settlement failed - this is a critical error but operation succeeded
    // Log the error but still return success since the AI operation worked
    console.error('Credit settlement failed:', error);
  }

  // Step 7: Calculate remaining balance
  const balanceRemaining = credits.available - operationResult.actualCredits;

  return {
    success: true,
    result: operationResult.result,
    creditsUsed: operationResult.actualCredits,
    balanceRemaining: Math.max(0, balanceRemaining),
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates an error result for access denied scenarios.
 */
function createAccessDeniedResult<T>(reason: string): AIExecutionResult<T> {
  return {
    success: false,
    error: {
      code: 'ACCESS_DENIED',
      message: reason,
    },
  };
}

/**
 * Creates an error result for operation failures.
 */
function createOperationFailedResult<T>(error: unknown): AIExecutionResult<T> {
  const message = error instanceof Error ? error.message : 'AI operation failed';

  return {
    success: false,
    error: {
      code: 'OPERATION_FAILED',
      message,
      details: error instanceof Error ? { stack: error.stack } : undefined,
    },
  };
}

/**
 * Creates an error result for unexpected errors.
 */
function createUnexpectedError<T>(
  message: string,
  error: unknown
): AIExecutionResult<T> {
  return {
    success: false,
    error: {
      code: 'UNEXPECTED_ERROR',
      message,
      details: error instanceof Error ? { originalError: error.message } : undefined,
    },
  };
}

/**
 * Safely releases credits without throwing.
 * Logs any errors but does not propagate them.
 */
async function safeReleaseCredits(
  reservationId: string,
  reason: string
): Promise<void> {
  try {
    await releaseCredits({ reservationId, reason });
  } catch (error) {
    // Log but don't throw - we don't want release failure to mask the original error
    console.error('Failed to release credits:', error);
  }
}

/**
 * Formats an error into a reason string for credit release.
 */
function formatErrorReason(error: unknown): string {
  if (error instanceof Error) {
    return `Operation failed: ${error.message}`;
  }
  return 'Operation failed: Unknown error';
}
