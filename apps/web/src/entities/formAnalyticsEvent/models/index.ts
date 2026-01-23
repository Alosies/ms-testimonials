import type {
  GetFormAnalyticsEventsQuery,
  GetFormAnalyticsEventsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetFormAnalyticsEventsVariables = GetFormAnalyticsEventsQueryVariables;

// Extract Data Types from Queries
export type FormAnalyticsEventsData = GetFormAnalyticsEventsQuery['form_analytics_events'];
export type FormAnalyticsEventItem = GetFormAnalyticsEventsQuery['form_analytics_events'][number];

// Event types enum for type safety
export type FormAnalyticsEventType =
  | 'form_started'
  | 'step_completed'
  | 'step_skipped'
  | 'form_submitted'
  | 'form_abandoned'
  | 'form_resumed';
