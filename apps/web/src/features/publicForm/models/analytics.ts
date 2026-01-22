import type { Ref } from 'vue';

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'form_started'
  | 'step_completed'
  | 'step_skipped'
  | 'form_submitted'
  | 'form_abandoned'
  | 'form_resumed';

/**
 * Current step context for abandonment tracking
 */
export interface CurrentStepContext {
  index: number;
  id: string;
  type: string;
}

/**
 * Options for the useFormAnalytics composable
 */
export interface UseFormAnalyticsOptions {
  formId: Ref<string>;
  organizationId: Ref<string>;
  sessionId: Ref<string>;
}

/**
 * Track event request body
 */
export interface TrackEventRequest {
  formId: string;
  organizationId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  stepIndex?: number;
  stepId?: string;
  stepType?: string;
  eventData?: Record<string, unknown>;
}
