import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FindUserByIdDocument } from '@/graphql/generated/operations';
import type { User } from '../models';

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { users_by_pk: User | null },
    { id: string }
  >(FindUserByIdDocument, { id });

  if (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }

  return data?.users_by_pk || null;
}
