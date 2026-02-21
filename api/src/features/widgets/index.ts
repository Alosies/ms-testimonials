/**
 * Widgets Feature
 *
 * CRUD endpoints for widget management and public widget data endpoint
 * for embed script consumption.
 *
 * Part of ADR-024 Widgets v1
 */

// =========================================================================
// Handlers
// =========================================================================

export { listWidgetsRoute, listWidgetsHandler } from './handlers/listWidgets';
export { getWidgetRoute, getWidgetHandler } from './handlers/getWidget';
export { createWidgetRoute, createWidgetHandler } from './handlers/createWidget';
export { updateWidgetRoute, updateWidgetHandler } from './handlers/updateWidget';
export { deleteWidgetRoute, deleteWidgetHandler } from './handlers/deleteWidget';
export { getPublicWidgetRoute, getPublicWidgetHandler } from './handlers/getPublicWidget';

// =========================================================================
// Schemas
// =========================================================================

export {
  WidgetTypeSchema,
  WidgetThemeSchema,
  CreateWidgetRequestSchema,
  UpdateWidgetRequestSchema,
  WidgetResponseSchema,
  PublicWidgetResponseSchema,
} from './schemas/widget';
