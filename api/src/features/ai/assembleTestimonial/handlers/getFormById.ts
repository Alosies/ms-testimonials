import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetFormByIdForAssemblyDocument,
  type GetFormByIdForAssemblyQuery,
} from '@/graphql/generated/operations';

/**
 * Minimal form data needed for testimonial assembly
 */
export type FormData = NonNullable<GetFormByIdForAssemblyQuery['forms_by_pk']>;

/**
 * Result type for getFormById
 */
export type GetFormByIdResult =
  | { success: true; form: FormData }
  | { success: false; error: string };

/**
 * Fetch form by ID for testimonial assembly.
 *
 * This is a public-safe query that returns only minimal data
 * needed for AI testimonial generation.
 */
export async function getFormById(id: string): Promise<GetFormByIdResult> {
  const { data, error } = await executeGraphQLAsAdmin<
    GetFormByIdForAssemblyQuery,
    { id: string }
  >(GetFormByIdForAssemblyDocument, { id });

  if (error) {
    console.error('Error fetching form:', error);
    return { success: false, error: 'Failed to fetch form' };
  }

  if (!data?.forms_by_pk) {
    return { success: false, error: 'Form not found' };
  }

  if (!data.forms_by_pk.is_active) {
    return { success: false, error: 'Form is not active' };
  }

  return { success: true, form: data.forms_by_pk };
}
