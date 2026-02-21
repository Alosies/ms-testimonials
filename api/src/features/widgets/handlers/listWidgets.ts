/**
 * GET /widgets - List all widgets for the organization
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  ListWidgetsDocument,
  type ListWidgetsQuery,
} from '@/graphql/generated/operations';
import { WidgetListResponseSchema } from '../schemas/widget';
import {
  ErrorResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const listWidgetsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Widgets'],
  summary: 'List all widgets for the organization',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Widgets retrieved successfully',
      content: {
        'application/json': { schema: WidgetListResponseSchema },
      },
    },
    403: {
      description: 'Organization context required',
      content: {
        'application/json': { schema: ErrorResponseSchema },
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

export async function listWidgetsHandler(c: Context): Promise<Response> {
  const auth = c.get('auth') as AuthContext;

  if (!auth.organizationId) {
    return c.json({ error: 'Organization context required', code: 'FORBIDDEN' }, 403);
  }

  try {
    const { data, error } = await executeGraphQLAsAdmin<ListWidgetsQuery>(
      ListWidgetsDocument,
      { organizationId: auth.organizationId }
    );

    if (error) {
      console.error('listWidgets GraphQL error:', error);
      return c.json({ error: 'Failed to retrieve widgets' }, 500);
    }

    return c.json({ widgets: data?.widgets ?? [] }, 200);
  } catch (err) {
    console.error('listWidgets error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
