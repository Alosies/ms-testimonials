import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { promiseTimeout } from '@vueuse/core';
import type { CurrentUser, CurrentOrganization } from '../models';

// ============================================================================
// Module-level context readiness promise
// This allows router guards to await context initialization before checking org
// ============================================================================

let contextReadyResolve: (() => void) | null = null;
let contextReadyPromise: Promise<void> = new Promise(resolve => {
  contextReadyResolve = resolve;
});

// Default timeout for context initialization (10 seconds - longer than auth)
const DEFAULT_CONTEXT_TIMEOUT_MS = 10000;

// Track if context has been resolved
let contextResolved = false;

/**
 * Get the promise that resolves when context is ready (user + org loaded)
 * This can be awaited in router guards to defer org-dependent checks
 *
 * @param timeoutMs - Maximum time to wait for context (default: 10000ms)
 * @returns Promise that resolves when context is ready or timeout occurs
 */
export function getContextReadyPromise(
  timeoutMs = DEFAULT_CONTEXT_TIMEOUT_MS
): Promise<void> {
  // If already resolved, return immediately
  if (contextResolved) {
    return Promise.resolve();
  }

  return Promise.race([
    contextReadyPromise.then(() => {
      contextResolved = true;
    }),
    promiseTimeout(timeoutMs).then(() => {
      if (!contextResolved) {
        console.warn(
          `[Context] Timeout after ${timeoutMs}ms waiting for context initialization. ` +
            'Proceeding with current context state.'
        );
        contextResolved = true;
      }
    }),
  ]);
}

/**
 * Reset the context ready promise (used for testing or re-initialization)
 */
export function resetContextReadyPromise(): void {
  contextReadyPromise = new Promise(resolve => {
    contextReadyResolve = resolve;
  });
  contextResolved = false;
}

/**
 * Current Context Store
 *
 * Provides the current user and organization context that components need.
 * Integrates with the existing useAuth composable for user data.
 *
 * The `isReady` state indicates when the context has been fully initialized
 * (auth checked, organization loaded). Components should show loading states
 * until `isReady` is true to prevent flash of empty content.
 */
export const useCurrentContextStore = defineStore('currentContext', () => {
  // Core state
  const user = ref<CurrentUser | null>(null);
  const organization = ref<CurrentOrganization | null>(null);
  const isLoading = ref(false);

  // Context initialization state (follows CoursePads pattern)
  // isReady starts false and becomes true when context is fully established
  const isReady = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const currentUserId = computed(() => user.value?.id ?? null);
  const currentOrganizationId = computed(() => organization.value?.id ?? null);
  const currentOrganizationSlug = computed(() => organization.value?.slug ?? null);
  const needsSetup = computed(() => organization.value?.setupStatus === 'pending_setup');

  // Actions
  function setCurrentUser(newUser: CurrentUser | null) {
    user.value = newUser;
  }

  function setCurrentOrganization(newOrg: CurrentOrganization | null) {
    organization.value = newOrg;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  /**
   * Mark context as ready
   * Called when auth is initialized and organization data is loaded (or determined to be absent)
   * Components should wait for isReady before showing content vs empty states
   * Also resolves the module-level contextReadyPromise for router guards
   */
  function markAsReady() {
    if (isReady.value) return;

    isReady.value = true;

    // Resolve the module-level promise for router guards
    if (contextReadyResolve) {
      contextReadyResolve();
      contextReadyResolve = null;
    }
  }

  function reset() {
    user.value = null;
    organization.value = null;
    isLoading.value = false;
    isReady.value = false;
    // Reset the context ready promise for next initialization
    resetContextReadyPromise();
  }

  return {
    // State (readonly)
    user: readonly(user),
    organization: readonly(organization),
    isLoading: readonly(isLoading),
    isReady: readonly(isReady),

    // Computed
    isAuthenticated,
    currentUserId,
    currentOrganizationId,
    currentOrganizationSlug,
    needsSetup,

    // Actions
    setCurrentUser,
    setCurrentOrganization,
    setLoading,
    markAsReady,
    reset,
  };
});
