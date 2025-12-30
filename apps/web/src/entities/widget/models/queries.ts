import type {
  GetWidgetQuery,
  GetWidgetQueryVariables,
  GetWidgetsQuery,
  GetWidgetsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetWidgetVariables = GetWidgetQueryVariables;
export type GetWidgetsVariables = GetWidgetsQueryVariables;

// Extract Data Types from Queries
export type Widget = NonNullable<GetWidgetQuery['widgets_by_pk']>;
export type WidgetsData = GetWidgetsQuery['widgets'];
export type WidgetItem = GetWidgetsQuery['widgets'][number];
