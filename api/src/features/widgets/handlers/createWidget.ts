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
import { getDefaultSettingsForType } from '../schemas/widgetSettings';
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

  const rawBody = await c.req.json();
  const parsed = CreateWidgetRequestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return c.json({ error: 'Invalid request', code: 'VALIDATION_ERROR', details: parsed.error.flatten() }, 400);
  }

  const body = parsed.data;

  try {
    const { data, error } = await executeGraphQLAsAdmin<CreateWidgetMutation>(
      CreateWidgetDocument,
      {
        object: {
          name: body.name,
          type: body.type,
          theme: body.theme,
          organization_id: auth.organizationId,
          created_by: auth.userId,
          form_id: body.form_id ?? null,
          show_ratings: body.show_ratings,
          show_dates: body.show_dates,
          show_company: body.show_company,
          show_avatar: body.show_avatar,
          max_display: body.max_display,
          settings: body.settings ?? getDefaultSettingsForType(body.type),
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
