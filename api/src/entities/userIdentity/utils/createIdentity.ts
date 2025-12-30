import { executeGraphQL } from '@/shared/libs/hasura';
import { CreateIdentityDocument } from '@/graphql/generated/operations';
import type { CreateIdentityInput } from '../models';

interface CreateIdentityResult {
  id: string;
  user_id: string;
  provider: string;
}

/**
 * Create a new user identity (link auth provider to user)
 */
export async function createIdentity(
  input: CreateIdentityInput
): Promise<CreateIdentityResult | null> {
  const { data, error } = await executeGraphQL<
    { insert_user_identities_one: CreateIdentityResult | null },
    {
      user_id: string;
      provider: string;
      provider_user_id: string;
      provider_email: string | null;
      provider_metadata: Record<string, unknown> | null;
      is_primary: boolean;
    }
  >(CreateIdentityDocument, {
    user_id: input.user_id,
    provider: input.provider,
    provider_user_id: input.provider_user_id,
    provider_email: input.provider_email || null,
    provider_metadata: input.provider_metadata || null,
    is_primary: input.is_primary,
  });

  if (error) {
    console.error('Error creating identity:', error);
    return null;
  }

  return data?.insert_user_identities_one || null;
}
