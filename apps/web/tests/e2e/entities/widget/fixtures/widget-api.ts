/**
 * Widget API Fixtures
 *
 * CRUD operations for test widgets via the E2E API.
 */
import { testApiRequest } from '../../../shared';
import { createEntityUrlSlug } from '@/shared/urls';
import type { CreateWidgetResponse, TestWidgetData } from '../types';
import type { WidgetType } from '@testimonials/core';

/**
 * Create a test widget via E2E API.
 *
 * Fast path (~200ms) — bypasses UI builder entirely.
 * Creates widget + attaches approved testimonials.
 */
export async function createTestWidget(
  orgSlug: string,
  options?: {
    type?: WidgetType;
    name?: string;
    testimonialCount?: number;
    settings?: Record<string, unknown>;
  }
): Promise<TestWidgetData> {
  const widgetName = options?.name || `E2E Widget ${Date.now()}`;
  const widgetType = options?.type || 'wall_of_love';

  const result = await testApiRequest<CreateWidgetResponse>('POST', '/widgets', {
    name: widgetName,
    type: widgetType,
    testimonialCount: options?.testimonialCount ?? 3,
    settings: options?.settings,
  });

  const urlSlug = createEntityUrlSlug(result.widgetName, result.widgetId);
  const builderUrl = `/${orgSlug}/widgets/${urlSlug}`;

  return {
    id: result.widgetId,
    name: result.widgetName,
    type: result.type as WidgetType,
    builderUrl,
    orgSlug,
    testimonialIds: result.testimonialIds,
    testimonialCount: result.testimonialCount,
  };
}

/**
 * Delete a test widget via E2E API.
 */
export async function deleteTestWidget(widgetId: string): Promise<void> {
  await testApiRequest('DELETE', `/widgets/${widgetId}`);
}
