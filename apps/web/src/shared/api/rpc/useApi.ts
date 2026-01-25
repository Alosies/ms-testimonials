/**
 * useApi Composable
 *
 * Provides a singleton instance of the Hono RPC API clients.
 * Must be called at setup-time (not inside async callbacks).
 */

import { createApiClients, type ApiClients } from './client';
import { useTokenManager } from '@/shared/authorization/composables/useTokenManager';

let apiClients: ApiClients | null = null;

/**
 * Get the singleton API clients instance.
 *
 * This composable follows Vue's composition API rules:
 * - Call at the root of setup() or <script setup>
 * - The returned clients can be used anywhere (event handlers, async code, etc.)
 *
 * @returns Type-safe API clients for auth, ai, media, and analytics routes
 */
export function useApi(): ApiClients {
  if (!apiClients) {
    const { getValidEnhancedToken } = useTokenManager();
    apiClients = createApiClients(getValidEnhancedToken);
  }
  return apiClients;
}

/**
 * Reset the API clients (useful for testing or logout)
 */
export function resetApiClients(): void {
  apiClients = null;
}
