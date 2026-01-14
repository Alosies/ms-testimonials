import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FindIdentityDocument } from '@/graphql/generated/operations';
import type { UserIdentity } from '../models';

/**
 * Find an identity by provider and provider user ID
 */
export async function findIdentity(
  provider: string,
  providerUserId: string
): Promise<UserIdentity | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { user_identities: UserIdentity[] },
    { provider: string; providerUserId: string }
  >(FindIdentityDocument, { provider, providerUserId });

  if (error) {
    console.error('Error finding identity:', error);
    return null;
  }

  return data?.user_identities[0] || null;
}
