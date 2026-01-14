import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { UpdateIdentityDocument } from '@/graphql/generated/operations';
import type { UpdateIdentityInput, UserIdentity } from '../models';

/**
 * Update an existing identity (e.g., when Supabase ID changes)
 */
export async function updateIdentity(
  input: UpdateIdentityInput
): Promise<Pick<UserIdentity, 'id' | 'user_id' | 'provider'> | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { update_user_identities_by_pk: { id: string; user_id: string; provider: string } | null },
    { id: string; provider_user_id: string; provider_metadata: Record<string, unknown> | null }
  >(UpdateIdentityDocument, {
    id: input.id,
    provider_user_id: input.provider_user_id,
    provider_metadata: input.provider_metadata || null,
  });

  if (error) {
    console.error('Error updating identity:', error);
    return null;
  }

  return data?.update_user_identities_by_pk || null;
}
