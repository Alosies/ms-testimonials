import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FindOrganizationByIdDocument } from '@/graphql/generated/operations';
import type { Organization } from '../models';

export async function findOrganizationById(id: string): Promise<Organization | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { organizations_by_pk: Organization | null },
    { id: string }
  >(FindOrganizationByIdDocument, { id });

  if (error) {
    console.error('Error finding organization:', error);
    return null;
  }

  return data?.organizations_by_pk || null;
}
