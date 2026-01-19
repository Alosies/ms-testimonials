/**
 * Flow builder - creates flow entities (primary and branch flows).
 */
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateTestFlowDocument,
  CreateBranchFlowDocument,
  UpdateFormBranchingConfigDocument,
  type CreateTestFlowMutation,
  type CreateBranchFlowMutation,
  type UpdateFormBranchingConfigMutation,
} from '@/graphql/generated/operations';

export interface CreatePrimaryFlowParams {
  formId: string;
  organizationId: string;
  name?: string;
}

export interface CreateBranchFlowsParams {
  formId: string;
  organizationId: string;
  branchQuestionId: string;
  ratingStepId: string;
}

export interface BranchFlowsResult {
  testimonialFlowId: string;
  improvementFlowId: string;
}

/**
 * Create the primary (shared) flow for a form.
 */
export async function createPrimaryFlow(params: CreatePrimaryFlowParams): Promise<string> {
  const { data, error } = await executeGraphQLAsAdmin<CreateTestFlowMutation>(
    CreateTestFlowDocument,
    {
      form_id: params.formId,
      organization_id: params.organizationId,
      name: params.name ?? 'Shared Steps',
      flow_type: 'shared',
      is_primary: true,
      display_order: 0,
    }
  );

  if (error || !data?.insert_flows_one?.id) {
    throw new Error(`Failed to create primary flow: ${error?.message || 'No flow ID returned'}`);
  }

  return data.insert_flows_one.id;
}

/**
 * Create branch flows (testimonial and improvement) with branching configuration.
 *
 * Creates:
 * - Testimonial flow (rating >= 4)
 * - Improvement flow (rating < 4)
 * - Updates form's branching_config
 */
export async function createBranchFlows(params: CreateBranchFlowsParams): Promise<BranchFlowsResult> {
  const { formId, organizationId, branchQuestionId, ratingStepId } = params;

  // Update form's branching_config
  const { error: branchingConfigError } = await executeGraphQLAsAdmin<UpdateFormBranchingConfigMutation>(
    UpdateFormBranchingConfigDocument,
    {
      id: formId,
      branching_config: {
        enabled: true,
        threshold: 4,
        ratingStepId,
      },
    }
  );

  if (branchingConfigError) {
    throw new Error(`Failed to update branching config: ${branchingConfigError.message}`);
  }

  // Create testimonial flow (rating >= 4)
  const { data: testimonialData, error: testimonialError } = await executeGraphQLAsAdmin<CreateBranchFlowMutation>(
    CreateBranchFlowDocument,
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Testimonial Flow',
      flow_type: 'branch',
      is_primary: false,
      display_order: 1,
      branch_question_id: branchQuestionId,
      branch_field: 'answer_integer',
      branch_operator: 'greater_than_or_equal_to',
      branch_value: { type: 'number', value: 4 },
    }
  );

  if (testimonialError || !testimonialData?.insert_flows_one?.id) {
    throw new Error(`Failed to create testimonial flow: ${testimonialError?.message || 'No flow ID returned'}`);
  }

  // Create improvement flow (rating < 4)
  const { data: improvementData, error: improvementError } = await executeGraphQLAsAdmin<CreateBranchFlowMutation>(
    CreateBranchFlowDocument,
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Improvement Flow',
      flow_type: 'branch',
      is_primary: false,
      display_order: 2,
      branch_question_id: branchQuestionId,
      branch_field: 'answer_integer',
      branch_operator: 'less_than',
      branch_value: { type: 'number', value: 4 },
    }
  );

  if (improvementError || !improvementData?.insert_flows_one?.id) {
    throw new Error(`Failed to create improvement flow: ${improvementError?.message || 'No flow ID returned'}`);
  }

  return {
    testimonialFlowId: testimonialData.insert_flows_one.id,
    improvementFlowId: improvementData.insert_flows_one.id,
  };
}
