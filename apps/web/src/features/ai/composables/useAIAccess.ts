/**
 * useAIAccess Composable
 *
 * Pre-check AI capability access before performing AI operations.
 * Validates that the user has access to the requested capability and
 * sufficient credits to perform the operation.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */
import { ref, computed } from 'vue';
import { useApi } from '@/shared/api/rest';

// ============================================================================
// Types
// ============================================================================

export interface AIAccessCheckModel {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface AIAccessCheckQualityLevel {
  id: string;
  name: string;
  creditCost: number;
  allowedModels: AIAccessCheckModel[];
}

export interface AIAccessCheckQualityLevelSummary {
  id: string;
  name: string;
  creditCost: number;
}

export interface AIAccessCheckCapability {
  id: string;
  name: string;
  hasAccess: boolean;
}

export interface AIAccessCheckCredits {
  available: number;
  required: number;
  hasEnough: boolean;
}

export interface AIAccessCheck {
  canProceed: boolean;
  capability: AIAccessCheckCapability;
  credits: AIAccessCheckCredits;
  selectedQualityLevel: AIAccessCheckQualityLevel | null;
  availableQualityLevels: AIAccessCheckQualityLevelSummary[];
  upgradeHint?: string;
  topupHint?: string;
}

export interface AIAccessCheckRequest {
  capabilityUniqueName: string;
  qualityLevelUniqueName?: string;
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Composable for checking AI capability access before performing AI operations.
 *
 * @example
 * ```typescript
 * const {
 *   checkAccess,
 *   lastCheck,
 *   loading,
 *   error,
 *   canProceed,
 *   upgradeRequired,
 *   topupRequired,
 * } = useAIAccess();
 *
 * // Check access before calling AI endpoint
 * const result = await checkAccess('testimonial_assembly');
 * if (result.canProceed) {
 *   // Proceed with AI operation
 * } else if (upgradeRequired.value) {
 *   // Show upgrade prompt
 * } else if (topupRequired.value) {
 *   // Show credit topup prompt
 * }
 * ```
 */
export function useAIAccess() {
  // Get API client at setup time (per Vue composable rules)
  const api = useApi();

  // Reactive state
  const lastCheck = ref<AIAccessCheck | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // ============================================================================
  // Computed helpers
  // ============================================================================

  /**
   * Whether the user can proceed with the AI operation.
   * True if capability is allowed AND credits are sufficient.
   */
  const canProceed = computed(() => lastCheck.value?.canProceed ?? false);

  /**
   * Whether the capability is allowed for the user's plan.
   */
  const capabilityAllowed = computed(
    () => lastCheck.value?.capability?.hasAccess ?? false
  );

  /**
   * Whether the user has enough credits for the operation.
   */
  const hasEnoughCredits = computed(
    () => lastCheck.value?.credits?.hasEnough ?? false
  );

  /**
   * Whether the user needs to upgrade their plan to access this capability.
   * True when capability is denied.
   */
  const upgradeRequired = computed(
    () => lastCheck.value !== null && !lastCheck.value.capability.hasAccess
  );

  /**
   * Whether the user needs to purchase more credits.
   * True when capability is allowed but credits are insufficient.
   */
  const topupRequired = computed(
    () =>
      lastCheck.value !== null &&
      lastCheck.value.capability.hasAccess &&
      !lastCheck.value.credits.hasEnough
  );

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Check access for an AI capability.
   *
   * @param capabilityUniqueName - The unique name of the AI capability (e.g., 'testimonial_assembly')
   * @param qualityLevelUniqueName - Optional quality level to check (e.g., 'standard', 'premium')
   * @returns The access check result
   * @throws Error if the API call fails
   */
  async function checkAccess(
    capabilityUniqueName: string,
    qualityLevelUniqueName?: string
  ): Promise<AIAccessCheck> {
    loading.value = true;
    error.value = null;

    try {
      const requestBody: AIAccessCheckRequest = {
        capabilityUniqueName,
      };

      if (qualityLevelUniqueName) {
        requestBody.qualityLevelUniqueName = qualityLevelUniqueName;
      }

      const response = await api.fetch('/ai/access-check', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to check access (${response.status})`
        );
      }

      const result: AIAccessCheck = await response.json();
      lastCheck.value = result;
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error');
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear the last check result and error state.
   */
  function reset() {
    lastCheck.value = null;
    error.value = null;
  }

  return {
    // State
    lastCheck,
    loading,
    error,

    // Computed helpers
    canProceed,
    capabilityAllowed,
    hasEnoughCredits,
    upgradeRequired,
    topupRequired,

    // Methods
    checkAccess,
    reset,
  };
}
