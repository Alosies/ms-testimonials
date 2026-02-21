/**
 * PUT /widgets/:id - Update an existing widget
 */

import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetWidgetByIdDocument,
  type GetWidgetByIdQuery,
  UpdateWidgetDocument,
  type UpdateWidgetMutation,
} from '@/graphql/generated/operations';
import { UpdateWidgetRequestSchema, WidgetResponseSchema } from '../schemas/widget';
import {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalErrorResponseSchema,
  NanoIDParamSchema,
} from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const updateWidgetRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Widgets'],
  summary: 'Update a widget',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: NanoIDParamSchema }),
    body: {
      content: {
        'application/json': { schema: UpdateWidgetRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Widget updated successfully',
      content: {
        'application/json': { schema: WidgetResponseSchema },
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

export async function updateWidgetHandler(c: Context): Promise<Response> {
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

  const body = await c.req.json();

  try {
    const { data, error } = await executeGraphQLAsAdmin<UpdateWidgetMutation>(
      UpdateWidgetDocument,
      {
        widgetId,
        set: {
          ...body,
          updated_by: auth.userId,
        },
      }
    );

    if (error || !data?.update_widgets_by_pk) {
      console.error('updateWidget GraphQL error:', error);
      return c.json({ error: 'Failed to update widget' }, 500);
    }

    return c.json(data.update_widgets_by_pk, 200);
  } catch (err) {
    console.error('updateWidget error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
