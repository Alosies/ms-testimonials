import { executeGraphQL } from '@/shared/libs/hasura';
import { CreateUserDocument } from '@/graphql/generated/operations';
import type { User, CreateUserInput } from '../models';

interface CreateUserVariables {
  email: string;
  email_verified: boolean;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
}

export async function createUser(input: CreateUserInput): Promise<User | null> {
  const { data, error } = await executeGraphQL<
    { insert_users_one: User | null },
    CreateUserVariables
  >(CreateUserDocument, {
    email: input.email,
    email_verified: input.email_verified,
    display_name: input.display_name || null,
    avatar_url: input.avatar_url || null,
    locale: input.locale || 'en',
  });

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data?.insert_users_one || null;
}
