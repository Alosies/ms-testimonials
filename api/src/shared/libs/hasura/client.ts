import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/config/env';

const DEFAULT_MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 5000;
const RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * Hasura admin client for server-side operations
 * Uses HASURA_ADMIN_SECRET header to bypass RLS (Row Level Security)
 */
const hasuraAdminClient = new GraphQLClient(env.HASURA_URL, {
  headers: {
    'x-hasura-admin-secret': env.HASURA_ADMIN_SECRET,
  },
});

/**
 * Check if an error is retryable (network/timeout errors)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const cause = (error as Error & { cause?: { code?: string } }).cause;

    // Check for network-related errors
    if (
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      cause?.code === 'ECONNREFUSED' ||
      cause?.code === 'ECONNRESET'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a GraphQL query/mutation with admin privileges
 * Bypasses RLS for server-side operations
 * Includes retry logic for transient network errors
 *
 * @param document - GraphQL query or mutation string
 * @param variables - Optional variables for the operation
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise with { data, error } object
 */
export async function executeGraphQLAsAdmin<TData, TVariables = Record<string, unknown>>(
  document: string,
  variables?: TVariables,
  maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<{ data: TData | null; error: Error | null }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await hasuraAdminClient.request<TData>(document, variables as Record<string, unknown>);
      return { data, error: null };
    } catch (error) {
      lastError = error as Error;

      // Only retry on network/timeout errors
      if (isRetryableError(error) && attempt < maxRetries) {
        const delay = Math.min(
          RETRY_BASE_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt),
          RETRY_MAX_DELAY_MS
        );
        console.warn(
          `[Hasura Admin] Retryable error on attempt ${attempt + 1}/${maxRetries + 1}, retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }

      console.error('[Hasura Admin] GraphQL execution error:', error);
      break;
    }
  }

  return { data: null, error: lastError };
}
