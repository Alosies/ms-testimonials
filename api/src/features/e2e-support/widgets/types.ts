/**
 * E2E Widget Types
 */
import type { WidgetType } from '@testimonials/core';

/**
 * Input for creating a test widget via E2E API.
 */
export interface CreateTestWidgetInput {
  name: string;
  type: WidgetType;
  /** Number of approved testimonials to create and attach (default: 3) */
  testimonialCount?: number;
  /** Override default settings for this type */
  settings?: Record<string, unknown>;
}

/**
 * Result from creating a test widget.
 */
export interface TestWidgetResult {
  widgetId: string;
  widgetName: string;
  type: WidgetType;
  /** IDs of testimonials created and attached to this widget */
  testimonialIds: string[];
  /** Number of testimonials attached */
  testimonialCount: number;
}
