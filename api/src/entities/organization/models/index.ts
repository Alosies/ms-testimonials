import type {
  FindOrganizationByIdQuery,
  CreateOrganizationMutationVariables,
} from '@/graphql/generated/operations';

// Organization type extracted from FindOrganizationById query
export type Organization = NonNullable<FindOrganizationByIdQuery['organizations_by_pk']>;

// Input type extracted from CreateOrganization mutation variables
export type CreateOrganizationInput = Omit<CreateOrganizationMutationVariables, '__typename'>;
