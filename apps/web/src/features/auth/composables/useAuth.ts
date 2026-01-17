/**
 * Auth composable - Main authentication state and methods
 *
 * Uses useTokenManager for token management (singleton pattern).
 */
import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { promiseTimeout } from '@vueuse/core';
import { supabase } from '@/shared/auth/supabase';
import { useTokenManager } from '@/shared/authorization';
import * as authApi from '../api';
import type { AuthCredentials, RegisterCredentials } from '../models';
import { createSharedComposable } from '@vueuse/core';

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

  // Auth state
  const supabaseUser = ref<User | null>(null);
  const isLoading = ref(true);
  const isAuthenticating = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Computed properties
  const isAuthenticated = computed(() => !!currentUser.value);
  const isAuthLoading = computed(() => isLoading.value || isAuthenticating.value);

  /**
   * Handle signed out state
   */
  function handleSignedOut() {
    supabaseUser.value = null;
    clearEnhancedToken();
    error.value = null;
  }

  /**
   * Process a session - enhance token and update state
   * This is extracted to be called from deferred callbacks safely
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
   * Mark initialization as complete
   */
  function markInitialized() {
    if (isInitialized.value) return;

    isLoading.value = false;
    isInitialized.value = true;

    if (authReadyResolve) {
      authReadyResolve();
      authReadyResolve = null;
    }
  }

  /**
   * Initialize auth state from Supabase session
   *
   * This directly restores the session using getSession() and then sets up
   * listeners for future auth changes. Token enhancement is done AFTER
   * getting the session (outside any Supabase callbacks).
   */
  async function initialize() {
    if (isInitialized.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 1. Get stored session directly
      console.log('[Auth] Getting stored session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth] Error getting session:', sessionError);
        error.value = sessionError.message;
      } else if (session?.user) {
        // 2. Session exists - enhance token for Hasura
        console.log('[Auth] Found session for:', session.user.email);
        await processSession({ user: session.user, access_token: session.access_token });
      } else {
        console.log('[Auth] No stored session');
      }
    } catch (err) {
      console.error('[Auth] Error during initialization:', err);
      error.value = err instanceof Error ? err.message : 'Failed to initialize auth';
    }

    // 3. Always mark as initialized
    markInitialized();

    // 4. Set up listener for future auth changes (not initial session)
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', event, session?.user?.email);

      // Skip INITIAL_SESSION since we already handled the initial session above
      if (event === 'INITIAL_SESSION') {
        return;
      }

      // Defer async operations to avoid Supabase callback deadlocks
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          processSession({ user: session.user, access_token: session.access_token });
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        handleSignedOut();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setTimeout(() => {
          processSession({ user: session.user, access_token: session.access_token });
        }, 0);
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async function login(credentials: AuthCredentials) {
    isAuthenticating.value = true;
    error.value = null;

    try {
      await authApi.login(credentials);
      // Auth state change listener will handle the rest
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed';
      throw err;
    } finally {
      isAuthenticating.value = false;
    }
  }

  /**
   * Sign up with email and password
   */
  async function register(credentials: RegisterCredentials) {
    isAuthenticating.value = true;
    error.value = null;

    try {
      await authApi.register(credentials);
      // Auth state change listener will handle the rest
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed';
      throw err;
    } finally {
      isAuthenticating.value = false;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async function loginWithGoogle() {
    isAuthenticating.value = true;
    error.value = null;

    try {
      await authApi.loginWithGoogle();
      // This will redirect to Google, then back to /auth/callback
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google sign in failed';
      isAuthenticating.value = false;
      throw err;
    }
  }

  /**
   * Sign out
   */
  async function logout() {
    isAuthenticating.value = true;
    error.value = null;

    try {
      await authApi.logout();
      handleSignedOut();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed';
      throw err;
    } finally {
      isAuthenticating.value = false;
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null;
  }

  return {
    // State (readonly)
    currentUser,
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    isAuthLoading,
    error: computed(() => error.value),
    isInitialized: computed(() => isInitialized.value),

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
