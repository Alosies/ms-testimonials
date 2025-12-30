import type {
  FindIdentityQuery,
  CreateIdentityMutationVariables,
  UpdateIdentityMutationVariables,
} from '@/graphql/generated/operations';

// UserIdentity type extracted from FindIdentity query
export type UserIdentity = FindIdentityQuery['user_identities'][0];

// Input types extracted from mutation variables
export type CreateIdentityInput = Omit<CreateIdentityMutationVariables, '__typename'>;
export type UpdateIdentityInput = Omit<UpdateIdentityMutationVariables, '__typename'>;
