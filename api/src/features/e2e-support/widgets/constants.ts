/**
 * E2E Widget Constants
 */
import type { WidgetType } from '@testimonials/core';
import { defaultSettingsByType } from '@testimonials/core/schemas/db/widgets';

/**
 * Default settings per widget type for E2E fixtures.
 * Uses the same defaults as the production code.
 */
export const DEFAULT_WIDGET_SETTINGS: Record<WidgetType, Record<string, unknown>> =
  defaultSettingsByType as Record<WidgetType, Record<string, unknown>>;

/**
 * Mock testimonial data for realistic test fixtures.
 * Rotates through these when creating multiple testimonials.
 */
export const MOCK_TESTIMONIALS = [
  {
    customer_name: 'Alice Johnson',
    customer_email: 'alice@e2e-test.com',
    content: 'This product completely transformed our workflow. Highly recommend!',
    rating: 5,
  },
  {
    customer_name: 'Bob Smith',
    customer_email: 'bob@e2e-test.com',
    content: 'Great experience from start to finish. The support team was incredible.',
    rating: 4,
  },
  {
    customer_name: 'Carol Williams',
    customer_email: 'carol@e2e-test.com',
    content: 'Simple to set up and the results speak for themselves.',
    rating: 5,
  },
  {
    customer_name: 'David Chen',
    customer_email: 'david@e2e-test.com',
    content: 'Exactly what we needed. Clean interface and powerful features.',
    rating: 4,
  },
  {
    customer_name: 'Eva Martinez',
    customer_email: 'eva@e2e-test.com',
    content: 'Been using it for months now. Best decision we made this year.',
    rating: 5,
  },
];
