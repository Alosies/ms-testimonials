/**
 * useAIOperationWithCredits Composable
 *
 * Wraps AI operations with credit pre-checking, access validation, and
 * result handling. Provides a unified interface for integrating AI features
 * with the credit system.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 *
 * @example
 * ```typescript
 * const {
 *   executeWithCredits,
 *   lastResult,
 *   isExecuting,
 *   accessDenied,
 *   upgradeRequired,
 *   topupRequired,
 * } = useAIOperationWithCredits();
 *
 * // Execute AI operation with automatic credit handling
 * const result = await executeWithCredits({
 *   capability: 'question_generation',
 *   qualityLevel: 'standard',
 *   execute: async () => {
 *     return await aiApi.suggestQuestions(request);
 *   },
 * });
 *
 * if (result.success) {
 *   // Operation succeeded, credits were consumed
 *   console.log('Credits used:', result.creditsUsed);
 *   console.log('Balance remaining:', result.balanceRemaining);
 * } else if (result.accessDenied) {
 *   // Show upgrade or topup prompt
 * }
 * ```
 */

import { ref, computed } from 'vue';
import { useAIAccess, type AIAccessCheck } from './useAIAccess';

// ============================================================================
// Types
// ============================================================================

/**
 * Capability unique names for AI operations
 */
export type AICapabilityName = 'question_generation' | 'testimonial_assembly' | 'testimonial_polish';

/**
 * Quality level unique names
 */
export type AIQualityLevel = 'fast' | 'enhanced' | 'premium';

/**
 * Options for executing an AI operation with credits
 */
export interface ExecuteWithCreditsOptions<T> {
  /** The capability being used */
  capability: AICapabilityName;
  /** Optional quality level (defaults to cheapest available) */
  qualityLevel?: AIQualityLevel;
  /** The actual AI operation to execute */
  execute: () => Promise<T>;
  /** Optional idempotency key to prevent duplicate charges */
  idempotencyKey?: string;
}

/**
 * Result of an AI operation with credits
 */
export interface AIOperationWithCreditsResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** Credits consumed by the operation */
  creditsUsed?: number;
  /** Remaining balance after the operation */
  balanceRemaining?: number;
  /** Error message if failed */
  error?: string;
  /** Whether access was denied (needs upgrade or topup) */
  accessDenied?: boolean;
  /** The access check result (for detailed info) */
  accessCheck?: AIAccessCheck;
}

/**
 * Stored result of the last AI operation
 */
export interface LastAIOperationResult {
  capability: AICapabilityName;
  qualityLevel?: AIQualityLevel;
  success: boolean;
  creditsUsed?: number;
  balanceRemaining?: number;
  error?: string;
  accessDenied?: boolean;
  timestamp: Date;
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Composable for executing AI operations with automatic credit handling.
 *
 * Provides pre-checking of access permissions and credits, execution wrapper,
 * and result tracking for UI feedback.
 */
export function useAIOperationWithCredits() {
  // Initialize useAIAccess at setup time (per Vue composable rules)
  const aiAccess = useAIAccess();

  // Reactive state
  const isExecuting = ref(false);
  const lastResult = ref<LastAIOperationResult | null>(null);

  // ============================================================================
  // Computed helpers
  // ============================================================================

  /**
   * Whether the last operation was denied due to access restrictions
   */
  const accessDenied = computed(() => lastResult.value?.accessDenied ?? false);

  /**
   * Whether an upgrade is required (from the last access check)
   */
  const upgradeRequired = computed(() => aiAccess.upgradeRequired.value);

  /**
   * Whether a credit topup is required (from the last access check)
   */
  const topupRequired = computed(() => aiAccess.topupRequired.value);

  /**
   * Available quality levels from the last access check
   */
  const availableQualityLevels = computed(
    () => aiAccess.lastCheck.value?.availableQualityLevels ?? []
  );

  /**
   * Estimated credit cost from the last access check
   */
  const estimatedCredits = computed(
    () => aiAccess.lastCheck.value?.credits?.required ?? 0
  );

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Pre-check access for an AI capability without executing.
   *
   * Use this to show credit estimates and quality level options before
   * the user commits to an operation.
   *
   * @param capability - The capability to check
   * @param qualityLevel - Optional specific quality level to check
   * @returns The access check result
   */
  async function preCheckAccess(
    capability: AICapabilityName,
    qualityLevel?: AIQualityLevel
  ): Promise<AIAccessCheck> {
    return aiAccess.checkAccess(capability, qualityLevel);
  }

  /**
   * Execute an AI operation with automatic credit handling.
   *
   * This method:
   * 1. Pre-checks access permissions and credit availability
   * 2. Executes the operation if access is granted
   * 3. Tracks credits used from the response
   * 4. Updates lastResult for UI feedback
   *
   * @param options - Execution options including the operation to run
   * @returns Result with success status, data, and credit info
   */
  async function executeWithCredits<T>(
    options: ExecuteWithCreditsOptions<T>
  ): Promise<AIOperationWithCreditsResult<T>> {
    const { capability, qualityLevel, execute } = options;

    isExecuting.value = true;

    try {
      // Pre-check access
      const accessCheck = await aiAccess.checkAccess(capability, qualityLevel);

      if (!accessCheck.canProceed) {
        // Access denied - record and return
        const result: AIOperationWithCreditsResult<T> = {
          success: false,
          accessDenied: true,
          accessCheck,
          error: accessCheck.upgradeHint || accessCheck.topupHint || 'Access denied',
        };

        lastResult.value = {
          capability,
          qualityLevel,
          success: false,
          accessDenied: true,
          error: result.error,
          timestamp: new Date(),
        };

        return result;
      }

      // Execute the operation
      const data = await execute();

      // Extract credits info from response if available
      // The API endpoints return credits_used and balance_remaining in the response
      const responseWithCredits = data as T & {
        credits_used?: number;
        balance_remaining?: number;
      };

      const creditsUsed = responseWithCredits.credits_used;
      const balanceRemaining = responseWithCredits.balance_remaining;

      // Record successful result
      lastResult.value = {
        capability,
        qualityLevel,
        success: true,
        creditsUsed,
        balanceRemaining,
        timestamp: new Date(),
      };

      return {
        success: true,
        data,
        creditsUsed,
        balanceRemaining,
        accessCheck,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if error is an access denied error from API
      const isAccessError =
        errorMessage.includes('insufficient') ||
        errorMessage.includes('access denied') ||
        errorMessage.includes('upgrade');

      lastResult.value = {
        capability,
        qualityLevel,
        success: false,
        accessDenied: isAccessError,
        error: errorMessage,
        timestamp: new Date(),
      };

      return {
        success: false,
        error: errorMessage,
        accessDenied: isAccessError,
      };
    } finally {
      isExecuting.value = false;
    }
  }

  /**
   * Clear the last result and reset state.
   */
  function reset() {
    lastResult.value = null;
    aiAccess.reset();
  }

  return {
    // State
    isExecuting,
    lastResult,
    lastAccessCheck: aiAccess.lastCheck,

    // Computed helpers
    accessDenied,
    upgradeRequired,
    topupRequired,
    availableQualityLevels,
    estimatedCredits,

    // Methods
    preCheckAccess,
    executeWithCredits,
    reset,
  };
}
