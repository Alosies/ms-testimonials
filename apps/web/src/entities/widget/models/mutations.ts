import type {
  CreateWidgetMutation,
  CreateWidgetMutationVariables,
  UpdateWidgetMutation,
  UpdateWidgetMutationVariables,
  DeleteWidgetMutation,
  DeleteWidgetMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateWidgetVariables = CreateWidgetMutationVariables;
export type UpdateWidgetVariables = UpdateWidgetMutationVariables;
export type DeleteWidgetVariables = DeleteWidgetMutationVariables;

// Extract Mutation Result Types
export type WidgetCreateResult = NonNullable<CreateWidgetMutation['insert_widgets_one']>;
export type WidgetUpdateResult = NonNullable<UpdateWidgetMutation['update_widgets_by_pk']>;
export type WidgetDeleteResult = NonNullable<DeleteWidgetMutation['delete_widgets_by_pk']>;
