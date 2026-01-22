/**
 * Auth composable - Main authentication state and methods
 *
 * Uses useTokenManager for token management (singleton pattern).
 * Uses a state machine (AuthStep) for clear visibility into auth state.
 */
import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { promiseTimeout, createSharedComposable } from '@vueuse/core';
import { supabase } from '@/shared/auth/supabase';
import { useTokenManager } from '@/shared/authorization';
import * as authApi from '../api';
import type { AuthCredentials, RegisterCredentials } from '../models';
import { AUTH_STEPS, AUTH_STEP_GROUPS, type AuthStep } from '../constants';
import { isStepInGroup } from '../functions';

// ============================================================================
// Module-level auth readiness promise
// This allows router guards to await initialization before checking auth
// ============================================================================

let authReadyResolve: (() => void) | null = null;
let authReadyPromise: Promise<void> = new Promise(resolve => {
  authReadyResolve = resolve;
});

// Default timeout for auth initialization (5 seconds)
const DEFAULT_AUTH_TIMEOUT_MS = 5000;

// Track if auth has been resolved (to avoid spurious timeout warnings)
let authResolved = false;

/**
 * Get the promise that resolves when auth is initialized
 * This can be awaited in router guards to defer auth checks
 *
 * @param timeoutMs - Maximum time to wait for auth (default: 5000ms)
 * @returns Promise that resolves when auth is ready or timeout occurs
 *
 * On timeout, the promise resolves (not rejects) to prevent blocking navigation.
 * The guard will proceed with current auth state (likely not authenticated).
 */
export function getAuthReadyPromise(
  timeoutMs = DEFAULT_AUTH_TIMEOUT_MS
): Promise<void> {
  // If already resolved, return immediately
  if (authResolved) {
    return Promise.resolve();
  }

  return Promise.race([
    authReadyPromise.then(() => {
      authResolved = true;
    }),
    promiseTimeout(timeoutMs).then(() => {
      // Only warn if we actually timed out (auth didn't resolve first)
      if (!authResolved) {
        console.warn(
          `[Auth] Timeout after ${timeoutMs}ms waiting for auth initialization. ` +
            'Proceeding with current auth state.'
        );
        authResolved = true; // Prevent future warnings
      }
    }),
  ]);
}

/**
 * Reset the auth ready promise (used for testing or re-initialization)
 */
export function resetAuthReadyPromise(): void {
  authReadyPromise = new Promise(resolve => {
    authReadyResolve = resolve;
  });
  authResolved = false;
}

function _useAuth() {
  // Get token manager instance (singleton)
  const {
    getValidEnhancedToken,
    clearEnhancedToken,
    handleAuthCallback,
    currentUser,
  } = useTokenManager();

  // Auth state machine - single source of truth for auth state
  const authStep = ref<AuthStep>(AUTH_STEPS.UNINITIALIZED);
  const supabaseUser = ref<User | null>(null);
  const error = ref<string | null>(null);

  // Computed properties derived from authStep
  const isAuthenticated = computed(() => !!currentUser.value);
  const isInitialized = computed(() =>
    authStep.value === AUTH_STEPS.AUTH_COMPLETED_AND_IDLE
  );
  const isAuthLoading = computed(() =>
    isStepInGroup(authStep.value, AUTH_STEP_GROUPS.LOADING)
  );
  const isLoggingOut = computed(() => authStep.value === AUTH_STEPS.SUPABASE_LOGGING_OUT);

  // Legacy computed values for backwards compatibility
  const isLoading = computed(() =>
    isStepInGroup(authStep.value, AUTH_STEP_GROUPS.LOADING)
  );
  const isAuthenticating = computed(() => authStep.value === AUTH_STEPS.SUPABASE_SIGNING_IN);
  const isAuthorizing = computed(() => authStep.value === AUTH_STEPS.API_ENHANCING_TOKEN);

  /**
   * Handle signed out state - clear auth data
   */
  function handleSignedOut() {
    supabaseUser.value = null;
    
    clearEnhancedToken();
    error.value = null;
  }

  /**
   * Process a session - enhance token and update state
   */
  async function processSession(session: { user: User; access_token: string }) {
    supabaseUser.value = session.user;
    try {
      await handleAuthCallback(session.access_token);
    } catch (err) {
      console.error('[Auth] Failed to enhance token:', err);
      handleSignedOut();
    }
  }

  /**
   * Resolve the auth ready promise (allows router guards to proceed)
   */
  function resolveAuthReady() {
    if (authReadyResolve) {
      authReadyResolve();
      authReadyResolve = null;
    }
  }

  /**
   * Initialize auth state from Supabase session
   *
   * Follows Supabase's recommended Vue 3 pattern:
   * 1. Call getSession() first (awaitable, returns from cache)
   * 2. Set up onAuthStateChange for future auth events
   * 3. Skip INITIAL_SESSION since we already handled it with getSession()
   *
   * See: https://supabase.com/docs/guides/getting-started/tutorials/with-vue-3
   */
  async function initialize() {
    if (isInitialized.value) {
      return;
    }

    authStep.value = AUTH_STEPS.SUPABASE_CHECKING_SESSION;
    error.value = null;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth] Error getting session:', sessionError);
        error.value = sessionError.message;
      } else if (session?.user) {
        authStep.value = AUTH_STEPS.API_ENHANCING_TOKEN;
        await processSession({ user: session.user, access_token: session.access_token });
      }
    } catch (err) {
      console.error('[Auth] Error during initialization:', err);
      error.value = err instanceof Error ? err.message : 'Failed to initialize auth';
    }

    // Transition to idle and resolve auth promise
    authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
    resolveAuthReady();

    // Set up listener for future auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip INITIAL_SESSION since we already handled it with getSession() above
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        handleSignedOut();
        authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
        return;
      }

      // Handle SIGNED_IN and TOKEN_REFRESHED - enhance token
      if (session?.user) {
        authStep.value = AUTH_STEPS.API_ENHANCING_TOKEN;
        try {
          await processSession({
            user: session.user,
            access_token: session.access_token,
          });
        } finally {
          authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
        }
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async function login(credentials: AuthCredentials) {
    authStep.value = AUTH_STEPS.SUPABASE_SIGNING_IN;
    error.value = null;

    try {
      await authApi.login(credentials);
      // Auth state change listener will handle transition to API_ENHANCING_TOKEN → AUTH_COMPLETED_AND_IDLE
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed';
      authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
      throw err;
    }
  }

  /**
   * Sign up with email and password
   */
  async function register(credentials: RegisterCredentials) {
    authStep.value = AUTH_STEPS.SUPABASE_SIGNING_IN;
    error.value = null;

    try {
      await authApi.register(credentials);
      // Auth state change listener will handle transition to API_ENHANCING_TOKEN → AUTH_COMPLETED_AND_IDLE
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed';
      authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
      throw err;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async function loginWithGoogle() {
    authStep.value = AUTH_STEPS.SUPABASE_SIGNING_IN;
    error.value = null;

    try {
      await authApi.loginWithGoogle();
      // This will redirect to Google, then back to /auth/callback
      // authStep stays at SUPABASE_SIGNING_IN until page reloads
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google sign in failed';
      authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
      throw err;
    }
  }

  /**
   * Sign out
   */
  async function logout() {
    authStep.value = AUTH_STEPS.SUPABASE_LOGGING_OUT;
    error.value = null;

    try {
      await authApi.logout();
      handleSignedOut();
      authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed';
      authStep.value = AUTH_STEPS.AUTH_COMPLETED_AND_IDLE;
      throw err;
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null;
  }

  return {
    // State machine (single source of truth)
    authStep: computed(() => authStep.value),

    // Computed state derived from authStep
    currentUser,
    isAuthenticated,
    isInitialized,
    isAuthLoading,
    isLoggingOut,
    error: computed(() => error.value),

    // Legacy computed values (for backwards compatibility)
    isLoading,
    isAuthenticating,
    isAuthorizing,

    // Methods
    initialize,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,

    // Token management methods (from useTokenManager)
    getValidEnhancedToken,
    clearEnhancedToken,
  };
}

/**
 * Shared auth composable
 *
 * Creates a true singleton instance of the auth state that is shared
 * across the entire application.
 */
export const useAuth = createSharedComposable(_useAuth);
