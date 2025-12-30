import { GraphQLClient } from 'graphql-request';
import { env } from '@/shared/config/env';

/**
 * GraphQL client configured with Hasura admin secret
 * Used for server-side operations that bypass row-level security
 */
export function getHasuraClient(): GraphQLClient {
  return new GraphQLClient(env.HASURA_URL, {
    headers: {
      'x-hasura-admin-secret': env.HASURA_ADMIN_SECRET,
    },
  });
}

/**
 * Execute a GraphQL operation with admin privileges
 */
export async function executeGraphQL<TData, TVariables = Record<string, unknown>>(
  document: string,
  variables?: TVariables
): Promise<{ data: TData | null; error: Error | null }> {
  try {
    const client = getHasuraClient();
    const data = await client.request<TData>(document, variables as Record<string, unknown>);
    return { data, error: null };
  } catch (error) {
    console.error('GraphQL execution error:', error);
    return { data: null, error: error as Error };
  }
}
