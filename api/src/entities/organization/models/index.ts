import type {
  FindOrganizationByIdQuery,
  CreateOrganizationMutationVariables,
  GetOrganizationPlanQuestionTypesQuery,
} from '@/graphql/generated/operations';

// Organization type extracted from FindOrganizationById query
export type Organization = NonNullable<FindOrganizationByIdQuery['organizations_by_pk']>;

// Input type extracted from CreateOrganization mutation variables
export type CreateOrganizationInput = Omit<CreateOrganizationMutationVariables, '__typename'>;

// Organization with plan and question types
type OrganizationWithPlan = NonNullable<GetOrganizationPlanQuestionTypesQuery['organizations_by_pk']>;
type OrganizationPlan = OrganizationWithPlan['plans'][number];
type PlanQuestionTypeEntry = OrganizationPlan['plan']['question_types'][number];

// Question type allowed by an organization's plan
export type AllowedQuestionType = PlanQuestionTypeEntry['question_type'];
