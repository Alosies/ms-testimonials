import type {
  CreateFlowsMutation,
  CreateFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateFlowsVariables = CreateFlowsMutationVariables;

// Extract Mutation Result Types
export type FlowCreateResult = NonNullable<
  CreateFlowsMutation['insert_flows']
>['returning'][number];
