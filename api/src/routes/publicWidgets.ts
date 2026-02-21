/**
 * Public Widget Routes (no authentication)
 *
 * Provides widget data for embed scripts. No auth middleware applied.
 *
 * Part of ADR-024 Widgets v1
 */

import { OpenAPIHono } from '@hono/zod-openapi';

import {
  getPublicWidgetRoute,
  getPublicWidgetHandler,
} from '@/features/widgets';

const publicWidgets = new OpenAPIHono();

// No auth middleware — public endpoint for embed scripts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
publicWidgets.openapi(getPublicWidgetRoute, getPublicWidgetHandler as any);

export { publicWidgets };
export type PublicWidgetsRoutes = typeof publicWidgets;
