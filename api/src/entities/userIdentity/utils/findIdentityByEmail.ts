import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FindIdentityByEmailDocument } from '@/graphql/generated/operations';
import type { UserIdentity } from '../models';

/**
 * Find an identity by provider and email
 * Used for account linking scenarios
 */
export async function findIdentityByEmail(
  provider: string,
  email: string
): Promise<UserIdentity | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { user_identities: UserIdentity[] },
    { provider: string; email: string }
  >(FindIdentityByEmailDocument, { provider, email });

  if (error) {
    console.error('Error finding identity by email:', error);
    return null;
  }

  return data?.user_identities[0] || null;
}
