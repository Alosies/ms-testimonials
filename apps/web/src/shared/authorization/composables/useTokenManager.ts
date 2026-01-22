import { ref, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { supabase } from '@/shared/auth/supabase';

/**
 * Enhanced Token Manager Composable (Internal)
 *
 * Provides centralized token management with automatic token refresh.
 * Features:
 * - Automatic token refresh with 5-minute buffer
 * - Concurrency control to prevent multiple simultaneous refresh requests
 * - Memory-only token storage for security
 * - True singleton pattern via createSharedComposable
 */
function _useTokenManager() {
  // Enhanced token management state
  const enhancedTokenState = ref<{
    token: string | null;
    expiresAt: number | null;
    refreshPromise: Promise<string | null> | null;
  }>({
    token: null,
    expiresAt: null,
    refreshPromise: null,
  });

  // User state
  const currentUser = ref<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  // Current organization state
  const currentOrganization = ref<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);

  /**
   * Enhance the Supabase token via API
   */
  const _enhanceToken = async (supabaseToken: string): Promise<string | null> => {
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

      // Store the enhanced token
      enhancedTokenState.value.token = data.access_token;
      enhancedTokenState.value.expiresAt = data.expires_at;

      // Store user info
      currentUser.value = data.user;

      // Store organization info (if available)
      if (data.organization) {
        currentOrganization.value = data.organization;
      }

      return data.access_token;
    } catch (error) {
      console.error('Error enhancing token:', error);
      throw error;
    }
  };

  /**
   * Get valid enhanced token (async)
   * This is called by Apollo client for every GraphQL request
   */
  const getValidEnhancedToken = async (): Promise<string | null> => {
    // Step 1: Check if we have a valid token that hasn't expired
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    // Step 2: Validate existing token
    if (
      enhancedTokenState.value.token &&
      enhancedTokenState.value.expiresAt &&
      enhancedTokenState.value.expiresAt - now > fiveMinutes
    ) {
      return enhancedTokenState.value.token;
    }

    // Step 3: Handle concurrent refresh attempts
    if (enhancedTokenState.value.refreshPromise) {
      try {
        return await enhancedTokenState.value.refreshPromise;
      } catch (error) {
        console.error('Error waiting for token refresh:', error);
        enhancedTokenState.value.refreshPromise = null;
        return null;
      }
    }

    // Step 4: Start a new token refresh process
    enhancedTokenState.value.refreshPromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          // No session available - user is not logged in
          enhancedTokenState.value.refreshPromise = null;
          return null;
        }

        const enhancedToken = await _enhanceToken(session.access_token);
        enhancedTokenState.value.refreshPromise = null;
        return enhancedToken;
      } catch (error) {
        enhancedTokenState.value.refreshPromise = null;
        console.error('Error refreshing token:', error);
        return null;
      }
    })();

    return enhancedTokenState.value.refreshPromise;
  };

  /**
   * Clear the enhanced token (on logout)
   */
  const clearEnhancedToken = () => {
    enhancedTokenState.value.token = null;
    enhancedTokenState.value.expiresAt = null;
    enhancedTokenState.value.refreshPromise = null;
    currentUser.value = null;
    currentOrganization.value = null;
  };

  /**
   * Handle auth callback (called when Supabase auth state changes)
   * This directly enhances the provided token instead of calling getSession() again
   */
  const handleAuthCallback = async (access_token: string | undefined): Promise<string | null> => {
    if (!access_token) {
      console.warn('No access token available for enhancement');
      return null;
    }

    // Check if we have a valid cached token
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    if (
      enhancedTokenState.value.token &&
      enhancedTokenState.value.expiresAt &&
      enhancedTokenState.value.expiresAt - now > fiveMinutes
    ) {
      return enhancedTokenState.value.token;
    }

    // Handle concurrent refresh attempts
    if (enhancedTokenState.value.refreshPromise) {
      try {
        return await enhancedTokenState.value.refreshPromise;
      } catch (error) {
        console.error('Error waiting for token refresh:', error);
        enhancedTokenState.value.refreshPromise = null;
        return null;
      }
    }

    // Directly enhance the provided token (don't call getSession again)
    enhancedTokenState.value.refreshPromise = (async () => {
      try {
        const enhancedToken = await _enhanceToken(access_token);
        enhancedTokenState.value.refreshPromise = null;
        return enhancedToken;
      } catch (error) {
        enhancedTokenState.value.refreshPromise = null;
        console.error('Error enhancing token:', error);
        return null;
      }
    })();

    return enhancedTokenState.value.refreshPromise;
  };

  return {
    // State (readonly)
    enhancedTokenState: readonly(enhancedTokenState),
    currentUser: readonly(currentUser),
    currentOrganization: readonly(currentOrganization),
    // Core methods
    getValidEnhancedToken,
    clearEnhancedToken,
    handleAuthCallback,
  };
}

/**
 * Enhanced Token Manager Composable (Shared)
 *
 * Creates a true singleton instance of the token manager that is shared
 * across the entire application.
 */
export const useTokenManager = createSharedComposable(_useTokenManager);
