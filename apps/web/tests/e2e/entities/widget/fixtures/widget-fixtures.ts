/**
 * Widget Playwright Fixtures
 *
 * Provides test fixtures for creating and cleaning up test widgets.
 */
import { test as appTest } from '../../../app/fixtures';
import { createTestWidget, deleteTestWidget } from './widget-api';
import type { TestWidgetData } from '../types';

export interface WidgetFixtures {
  /** Widget created via E2E API — default type: wall_of_love */
  widgetViaApi: TestWidgetData;
  /** Marquee widget via E2E API */
  marqueeWidgetViaApi: TestWidgetData;
  /** Toast popup widget via E2E API */
  toastWidgetViaApi: TestWidgetData;
}

export const test = appTest.extend<WidgetFixtures>({
  widgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug);
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup widget ${widget.id}:`, error);
    }
  },

  marqueeWidgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug, { type: 'marquee' });
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup marquee widget ${widget.id}:`, error);
    }
  },

  toastWidgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug, { type: 'toast_popup' });
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup toast widget ${widget.id}:`, error);
    }
  },
});

export { expect } from '@playwright/test';
