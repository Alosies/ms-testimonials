import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { CountUserIdentitiesDocument } from '@/graphql/generated/operations';

/**
 * Check if this will be the user's first identity (for is_primary flag)
 */
export async function isFirstIdentity(userId: string): Promise<boolean> {
  const { data, error } = await executeGraphQLAsAdmin<
    { user_identities_aggregate: { aggregate: { count: number } | null } },
    { userId: string }
  >(CountUserIdentitiesDocument, { userId });

  if (error) {
    console.error('Error counting identities:', error);
    return true; // Default to true if we can't check
  }

  const count = data?.user_identities_aggregate.aggregate?.count || 0;
  return count === 0;
}
