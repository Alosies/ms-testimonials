/**
 * POST /widgets - Create a new widget
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  CreateWidgetDocument,
  type CreateWidgetMutation,
} from '@/graphql/generated/operations';
import { CreateWidgetRequestSchema, WidgetResponseSchema } from '../schemas/widget';
import {
  ErrorResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const createWidgetRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Widgets'],
  summary: 'Create a new widget',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: CreateWidgetRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Widget created successfully',
      content: {
        'application/json': { schema: WidgetResponseSchema },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': { schema: ErrorResponseSchema },
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

export async function createWidgetHandler(c: Context): Promise<Response> {
  const auth = c.get('auth') as AuthContext;

  if (!auth.organizationId) {
    return c.json({ error: 'Organization context required', code: 'FORBIDDEN' }, 403);
  }

  const body = await c.req.json();

  try {
    const { data, error } = await executeGraphQLAsAdmin<CreateWidgetMutation>(
      CreateWidgetDocument,
      {
        object: {
          name: body.name,
          type: body.type,
          theme: body.theme ?? 'light',
          organization_id: auth.organizationId,
          created_by: auth.userId,
          form_id: body.form_id ?? null,
          show_ratings: body.show_ratings ?? true,
          show_dates: body.show_dates ?? false,
          show_company: body.show_company ?? true,
          show_avatar: body.show_avatar ?? true,
          max_display: body.max_display ?? null,
          settings: body.settings ?? {},
          is_active: true,
        },
      }
    );

    if (error || !data?.insert_widgets_one) {
      console.error('createWidget GraphQL error:', error);
      return c.json({ error: 'Failed to create widget' }, 500);
    }

    return c.json(data.insert_widgets_one, 201);
  } catch (err) {
    console.error('createWidget error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
