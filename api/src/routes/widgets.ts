/**
 * Widget Routes
 *
 * CRUD endpoints (authenticated) + public widget data endpoint (unauthenticated).
 *
 * Part of ADR-024 Widgets v1
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/shared/middleware/auth';

import {
  listWidgetsRoute,
  listWidgetsHandler,
  getWidgetRoute,
  getWidgetHandler,
  createWidgetRoute,
  createWidgetHandler,
  updateWidgetRoute,
  updateWidgetHandler,
  deleteWidgetRoute,
  deleteWidgetHandler,
} from '@/features/widgets';

const widgets = new OpenAPIHono();

// Apply auth middleware to all CRUD routes
widgets.use('/*', authMiddleware);

// Register routes with handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
widgets.openapi(listWidgetsRoute, listWidgetsHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
widgets.openapi(getWidgetRoute, getWidgetHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
widgets.openapi(createWidgetRoute, createWidgetHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
widgets.openapi(updateWidgetRoute, updateWidgetHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
widgets.openapi(deleteWidgetRoute, deleteWidgetHandler as any);

export { widgets };
export type WidgetsRoutes = typeof widgets;
