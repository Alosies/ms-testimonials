import type { FindRoleByUniqueNameQuery } from '@/graphql/generated/operations';

export type Role = NonNullable<FindRoleByUniqueNameQuery['roles'][0]>;
