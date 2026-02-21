/**
 * GET /public/widgets/:id - Get widget data for embed (no auth required)
 */

import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetPublicWidgetDocument,
  type GetPublicWidgetQuery,
} from '@/graphql/generated/operations';
import { PublicWidgetResponseSchema } from '../schemas/widget';
import {
  NotFoundResponseSchema,
  InternalErrorResponseSchema,
  NanoIDParamSchema,
} from '@/shared/schemas/common';

export const getPublicWidgetRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Widgets'],
  summary: 'Get widget data for embed (public, no auth)',
  description: 'Returns widget configuration and testimonials for rendering in an embed script. No authentication required.',
  request: {
    params: z.object({ id: NanoIDParamSchema }),
  },
  responses: {
    200: {
      description: 'Widget data retrieved successfully',
      content: {
        'application/json': { schema: PublicWidgetResponseSchema },
      },
    },
    404: {
      description: 'Widget not found or inactive',
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

export async function getPublicWidgetHandler(c: Context): Promise<Response> {
  const widgetId = c.req.param('id');

  try {
    const { data, error } = await executeGraphQLAsAdmin<GetPublicWidgetQuery>(
      GetPublicWidgetDocument,
      { widgetId }
    );

    if (error) {
      console.error('getPublicWidget GraphQL error:', error);
      return c.json({ error: 'Failed to retrieve widget' }, 500);
    }

    const widget = data?.widgets_by_pk;

    if (!widget || !widget.is_active) {
      return c.json({ error: 'Widget not found', code: 'NOT_FOUND' }, 404);
    }

    // Flatten testimonial placements into a clean array
    const testimonials = (widget.testimonial_placements ?? []).map((p) => ({
      id: p.testimonial.id,
      content: p.testimonial.content,
      customer_name: p.testimonial.customer_name,
      customer_company: p.testimonial.customer_company,
      customer_title: p.testimonial.customer_title,
      customer_avatar_url: p.testimonial.customer_avatar_url,
      rating: p.testimonial.rating,
      created_at: p.testimonial.created_at,
      display_order: p.display_order,
      is_featured: p.is_featured,
    }));

    // Apply max_display limit
    const limited = widget.max_display
      ? testimonials.slice(0, widget.max_display)
      : testimonials;

    return c.json(
      {
        widget: {
          id: widget.id,
          name: widget.name,
          type: widget.type,
          theme: widget.theme,
          show_ratings: widget.show_ratings,
          show_dates: widget.show_dates,
          show_company: widget.show_company,
          show_avatar: widget.show_avatar,
          max_display: widget.max_display,
          settings: widget.settings,
        },
        testimonials: limited,
      },
      200,
      {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      }
    );
  } catch (err) {
    console.error('getPublicWidget error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
