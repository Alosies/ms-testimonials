/**
 * TanStack Query Client Configuration
 *
 * Provides a shared QueryClient instance for Vue Query.
 * Used for caching and managing REST API data fetching.
 */

import { QueryClient } from '@tanstack/vue-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Only retry once on failure
      retry: 1,
      // Don't refetch on window focus (reduces unnecessary requests)
      refetchOnWindowFocus: false,
    },
  },
});
