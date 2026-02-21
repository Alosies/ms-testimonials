/**
 * GET /widgets/:id - Get a single widget (authenticated, for builder)
 */

import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetWidgetByIdDocument,
  type GetWidgetByIdQuery,
} from '@/graphql/generated/operations';
import { WidgetResponseSchema } from '../schemas/widget';
import {
  ErrorResponseSchema,
  NotFoundResponseSchema,
  InternalErrorResponseSchema,
  NanoIDParamSchema,
} from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const getWidgetRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Widgets'],
  summary: 'Get a widget by ID',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: NanoIDParamSchema }),
  },
  responses: {
    200: {
      description: 'Widget retrieved successfully',
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

export async function getWidgetHandler(c: Context): Promise<Response> {
  const auth = c.get('auth') as AuthContext;
  const widgetId = c.req.param('id');

  if (!auth.organizationId) {
    return c.json({ error: 'Organization context required', code: 'FORBIDDEN' }, 403);
  }

  try {
    const { data, error } = await executeGraphQLAsAdmin<GetWidgetByIdQuery>(
      GetWidgetByIdDocument,
      { widgetId, organizationId: auth.organizationId }
    );

    if (error) {
      console.error('getWidget GraphQL error:', error);
      return c.json({ error: 'Failed to retrieve widget' }, 500);
    }

    const widget = data?.widgets_by_pk;

    if (!widget || widget.organization_id !== auth.organizationId) {
      return c.json({ error: 'Widget not found', code: 'NOT_FOUND' }, 404);
    }

    return c.json(widget, 200);
  } catch (err) {
    console.error('getWidget error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
