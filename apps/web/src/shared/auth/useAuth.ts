import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

const currentUser = ref<AuthUser | null>(null);
const supabaseUser = ref<User | null>(null);
const enhancedToken = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const isAuthenticated = computed(() => !!currentUser.value);

/**
 * Initialize auth state from Supabase session
 */
async function initialize() {
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
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      supabaseUser.value = session.user;
      await enhanceTokenFromSession(session.access_token);
    } else if (event === 'SIGNED_OUT') {
      currentUser.value = null;
      supabaseUser.value = null;
      enhancedToken.value = null;
    }
  });
}

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
 * Sign in with email and password
 */
async function signIn(email: string, password: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign in failed';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Sign up with email and password
 */
async function signUp(email: string, password: string, name?: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      throw signUpError;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign up failed';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Sign out
 */
async function signOut() {
  isLoading.value = true;
  error.value = null;

  try {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw signOutError;
    }

    currentUser.value = null;
    supabaseUser.value = null;
    enhancedToken.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign out failed';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Get the enhanced token for API calls
 */
function getToken(): string | null {
  return enhancedToken.value;
}

export function useAuth() {
  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    initialize,
    signIn,
    signUp,
    signOut,
    getToken,
  };
}
