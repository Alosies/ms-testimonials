import type {
  GetPlansQuery,
  GetPlanQuery,
  GetPlanQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetPlanVariables = GetPlanQueryVariables;

// Extract Data Types from Queries
export type Plan = NonNullable<GetPlanQuery['plans_by_pk']>;
export type PlansData = GetPlansQuery['plans'];
export type PlanItem = GetPlansQuery['plans'][number];
