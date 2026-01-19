/**
 * Form builder - creates the base form entity.
 */
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateTestFormDocument,
  type CreateTestFormMutation,
} from '@/graphql/generated/operations';

export interface CreateFormParams {
  organizationId: string;
  name: string;
  createdBy: string;
  productDescription?: string;
}

export interface CreateFormResult {
  formId: string;
  formName: string;
}

/**
 * Create a test form entity.
 *
 * @param params - Form creation parameters
 * @param namePrefix - Prefix for the form name (e.g., "E2E Test Form")
 * @returns Form ID and name
 */
export async function createTestForm(
  params: CreateFormParams,
  namePrefix: string = 'E2E Test Form'
): Promise<CreateFormResult> {
  const formName = `${namePrefix} - ${params.name}`;

  const { data, error } = await executeGraphQLAsAdmin<CreateTestFormMutation>(
    CreateTestFormDocument,
    {
      organization_id: params.organizationId,
      name: formName,
      status: 'draft',
      created_by: params.createdBy,
      product_name: 'Test Product',
      product_description: params.productDescription ?? 'A test product for E2E testing',
    }
  );

  if (error || !data?.insert_forms_one?.id) {
    throw new Error(`Failed to create test form: ${error?.message || 'No form ID returned'}`);
  }

  return {
    formId: data.insert_forms_one.id,
    formName,
  };
}
