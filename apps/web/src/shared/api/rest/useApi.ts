/**
 * useApi Composable
 *
 * Provides a singleton instance of the REST API client.
 * Must be called at setup-time (not inside async callbacks).
 */

import { createApiClients, type ApiClients } from './client';
import { useTokenManager } from '@/shared/authorization/composables/useTokenManager';

let apiClients: ApiClients | null = null;

/**
 * Get the singleton API client instance.
 *
 * This composable follows Vue's composition API rules:
 * - Call at the root of setup() or <script setup>
 * - The returned client can be used anywhere (event handlers, async code, etc.)
 *
 * @returns Type-safe API client with fetch, post, and get methods
 */
export function useApi(): ApiClients {
  if (!apiClients) {
    const { getValidEnhancedToken } = useTokenManager();
    apiClients = createApiClients(getValidEnhancedToken);
  }
  return apiClients;
}

/**
 * Reset the API client (useful for testing or logout)
 */
export function resetApiClients(): void {
  apiClients = null;
}
