import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FindUserByEmailDocument } from '@/graphql/generated/operations';
import type { User } from '../models';

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { users: User[] },
    { email: string }
  >(FindUserByEmailDocument, { email });

  if (error) {
    console.error('Error finding user by email:', error);
    return null;
  }

  return data?.users[0] || null;
}
