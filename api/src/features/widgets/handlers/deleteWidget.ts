/**
 * DELETE /widgets/:id - Delete a widget
 */

import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetWidgetByIdDocument,
  type GetWidgetByIdQuery,
  DeleteWidgetDocument,
  type DeleteWidgetMutation,
} from '@/graphql/generated/operations';
import {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalErrorResponseSchema,
  NanoIDParamSchema,
  EmptyResponseSchema,
} from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const deleteWidgetRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Widgets'],
  summary: 'Delete a widget',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: NanoIDParamSchema }),
  },
  responses: {
    200: {
      description: 'Widget deleted successfully',
      content: {
        'application/json': { schema: EmptyResponseSchema },
      },
    },
    403: {
      description: 'Organization context required',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    404: {
      description: 'Widget not found',
      content: {
        'application/json': { schema: NotFoundResponseSchema },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': { schema: InternalErrorResponseSchema },
      },
    },
  },
});

export async function deleteWidgetHandler(c: Context): Promise<Response> {
  const auth = c.get('auth') as AuthContext;
  const widgetId = c.req.param('id');

  if (!auth.organizationId) {
    return c.json({ error: 'Organization context required', code: 'FORBIDDEN' }, 403);
  }

  // Verify widget belongs to org
  const { data: existing } = await executeGraphQLAsAdmin<GetWidgetByIdQuery>(
    GetWidgetByIdDocument,
    { widgetId, organizationId: auth.organizationId }
  );

  if (!existing?.widgets_by_pk || existing.widgets_by_pk.organization_id !== auth.organizationId) {
    return c.json({ error: 'Widget not found', code: 'NOT_FOUND' }, 404);
  }

  try {
    const { data, error } = await executeGraphQLAsAdmin<DeleteWidgetMutation>(
      DeleteWidgetDocument,
      { widgetId }
    );

    if (error || !data?.delete_widgets_by_pk) {
      console.error('deleteWidget GraphQL error:', error);
      return c.json({ error: 'Failed to delete widget' }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (err) {
    console.error('deleteWidget error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
