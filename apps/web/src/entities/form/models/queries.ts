import type {
  GetFormQuery,
  GetFormQueryVariables,
  GetFormsQuery,
  GetFormsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetFormVariables = GetFormQueryVariables;
export type GetFormsVariables = GetFormsQueryVariables;

// Extract Data Types from Queries
export type Form = NonNullable<GetFormQuery['forms_by_pk']>;
export type FormsData = GetFormsQuery['forms'];
export type FormItem = GetFormsQuery['forms'][number];
