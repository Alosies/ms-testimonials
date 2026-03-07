/**
 * E2E Widgets Module
 *
 * Route handlers and CRUD operations for test widgets.
 */

export { createWidget, deleteWidget } from './routes';
export { createTestWidget, deleteTestWidget } from './crud';
export type { CreateTestWidgetInput, TestWidgetResult } from './types';
export { DEFAULT_WIDGET_SETTINGS, MOCK_TESTIMONIALS } from './constants';
