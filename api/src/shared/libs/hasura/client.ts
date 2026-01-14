import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/config/env';

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
 * Execute a GraphQL query/mutation with admin privileges
 * Bypasses RLS for server-side operations
 *
 * @param document - GraphQL query or mutation string
 * @param variables - Optional variables for the operation
 * @returns Promise with { data, error } object
 */
export async function executeGraphQLAsAdmin<TData, TVariables = Record<string, unknown>>(
  document: string,
  variables?: TVariables
): Promise<{ data: TData | null; error: Error | null }> {
  try {
    const data = await hasuraAdminClient.request<TData>(document, variables as Record<string, unknown>);
    return { data, error: null };
  } catch (error) {
    console.error('[Hasura Admin] GraphQL execution error:', error);
    return { data: null, error: error as Error };
  }
}
