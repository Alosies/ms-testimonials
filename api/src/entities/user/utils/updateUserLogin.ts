import { executeGraphQL } from '@/shared/libs/hasura';
import { UpdateUserLoginDocument } from '@/graphql/generated/operations';

export async function updateUserLogin(id: string): Promise<boolean> {
  const { error } = await executeGraphQL<
    { update_users_by_pk: { id: string } | null },
    { id: string }
  >(UpdateUserLoginDocument, { id });

  if (error) {
    console.error('Error updating user login:', error);
    return false;
  }

  return true;
}
