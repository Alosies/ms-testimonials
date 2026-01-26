import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';

/**
 * Minimal form data needed for testimonial assembly
 */
export interface FormData {
  id: string;
  name: string;
  product_name: string | null;
  is_active: boolean;
}

/**
 * Result type for getFormById
 */
export type GetFormByIdResult =
  | { success: true; form: FormData }
  | { success: false; error: string };

/**
 * GraphQL query to fetch form by ID
 */
const GET_FORM_BY_ID_QUERY = `
  query GetFormById($id: String!) {
    forms_by_pk(id: $id) {
      id
      name
      product_name
      is_active
    }
  }
`;

/**
 * Fetch form by ID for testimonial assembly
 *
 * This is a public-safe query that returns only minimal data
 * needed for AI testimonial generation.
 */
export async function getFormById(id: string): Promise<GetFormByIdResult> {
  const { data, error } = await executeGraphQLAsAdmin<
    { forms_by_pk: FormData | null },
    { id: string }
  >(GET_FORM_BY_ID_QUERY, { id });

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
