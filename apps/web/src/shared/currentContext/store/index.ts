import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { CurrentUser, CurrentOrganization } from '../models';

// ============================================================================
// Module-level context readiness promise
// This allows router guards to await context initialization (auth + org)
// ============================================================================

let contextReadyResolve: (() => void) | null = null;
let contextReadyPromise: Promise<void> = new Promise(resolve => {
  contextReadyResolve = resolve;
});

// Track if context has been resolved
let contextResolved = false;

/**
 * Get the promise that resolves when context is fully initialized
 * (auth checked AND organization loaded)
 *
 * This can be awaited in router guards to defer route decisions
 * until we have the full context (user + org slug).
 */
export function getContextReadyPromise(): Promise<void> {
  if (contextResolved) {
    return Promise.resolve();
  }
  return contextReadyPromise;
}

/**
 * Reset the context ready promise (used for testing or logout)
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
    isReady.value = true;
    // Resolve the module-level promise for router guards
    if (contextReadyResolve) {
      contextReadyResolve();
      contextResolved = true;
    }
  }

  function reset() {
    user.value = null;
    organization.value = null;
    isLoading.value = false;
    isReady.value = false;
    // Reset the module-level promise for next auth cycle
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
