import type {
  FindUserByIdQuery,
  CreateUserMutationVariables,
} from '@/graphql/generated/operations';

// User type extracted from FindUserById query
export type User = NonNullable<FindUserByIdQuery['users_by_pk']>;

// Input type extracted from CreateUser mutation variables
export type CreateUserInput = Omit<CreateUserMutationVariables, '__typename'>;
