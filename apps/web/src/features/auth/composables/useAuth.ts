/**
 * Auth composable - Main authentication state and methods
 *
 * Uses useTokenManager for token management (singleton pattern).
 */
import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/auth/supabase';
import { useTokenManager } from '@/shared/authorization';
import * as authApi from '../api';
import type { AuthCredentials, RegisterCredentials } from '../models';
import { createSharedComposable } from '@vueuse/core';

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
   * Initialize auth state from Supabase session
   */
  async function initialize() {
    if (isInitialized.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        supabaseUser.value = session.user;
        await handleAuthCallback(session.access_token);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize auth';
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        supabaseUser.value = session.user;
        await handleAuthCallback(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        handleSignedOut();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        supabaseUser.value = session.user;
        await handleAuthCallback(session.access_token);
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
