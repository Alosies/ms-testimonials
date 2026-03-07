/**
 * Widget Entity Types for E2E Tests
 *
 * Type definitions for widget-related test data.
 * Matches the structure returned by the E2E API.
 */
import type { WidgetType } from '@testimonials/core';

/**
 * Response from E2E API widget creation.
 */
export interface CreateWidgetResponse {
  widgetId: string;
  widgetName: string;
  type: WidgetType;
  testimonialIds: string[];
  testimonialCount: number;
}

/**
 * Full widget data available in test fixtures.
 */
export interface TestWidgetData {
  id: string;
  name: string;
  type: WidgetType;
  /** Builder URL: /{orgSlug}/widgets/{urlSlug} */
  builderUrl: string;
  orgSlug: string;
  /** IDs of testimonials attached to this widget */
  testimonialIds: string[];
  testimonialCount: number;
}
