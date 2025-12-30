import type {
  FindFreePlanQuery,
  CreateOrganizationPlanMutation,
} from '@/graphql/generated/operations';

export type Plan = NonNullable<FindFreePlanQuery['plans'][0]>;
export type OrganizationPlan = NonNullable<
  CreateOrganizationPlanMutation['insert_organization_plans_one']
>;
