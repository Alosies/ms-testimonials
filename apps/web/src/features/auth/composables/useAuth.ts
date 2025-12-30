/**
 * Auth composable - Main authentication state and methods
 *
 * Uses module-level refs for singleton state pattern.
 * This ensures all components share the same auth state.
 */
import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/auth/supabase';
import * as authApi from '../api';
import type { AuthUser, AuthCredentials, RegisterCredentials } from '../models';

// Module-level state (singleton pattern)
const currentUser = ref<AuthUser | null>(null);
const supabaseUser = ref<User | null>(null);
const enhancedToken = ref<string | null>(null);
const isLoading = ref(true);
const isAuthenticating = ref(false);
const error = ref<string | null>(null);
const isInitialized = ref(false);

// Computed properties
const isAuthenticated = computed(() => !!currentUser.value);
const isAuthLoading = computed(() => isLoading.value || isAuthenticating.value);

/**
 * Enhance Supabase token with Hasura claims
 */
async function enhanceTokenFromSession(supabaseToken: string) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  try {
    const response = await fetch(`${apiUrl}/auth/enhance-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ supabaseToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to enhance token');
    }

    const data = await response.json();
    enhancedToken.value = data.token;
    currentUser.value = data.user;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Token enhancement failed';
    throw err;
  }
}

/**
 * Handle auth state change events
 */
async function handleAuthCallback(accessToken: string) {
  try {
    await enhanceTokenFromSession(accessToken);
  } catch (err) {
    console.error('Failed to enhance token:', err);
  }
}

/**
 * Handle signed out state
 */
function handleSignedOut() {
  currentUser.value = null;
  supabaseUser.value = null;
  enhancedToken.value = null;
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
      await enhanceTokenFromSession(session.access_token);
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
 * Get the enhanced token for API calls
 */
function getToken(): string | null {
  return enhancedToken.value;
}

/**
 * Clear error state
 */
function clearError() {
  error.value = null;
}

export function useAuth() {
  return {
    // State (readonly)
    currentUser: computed(() => currentUser.value),
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
    getToken,
    clearError,
  };
}
