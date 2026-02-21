/**
 * Zod schemas for widget API endpoints
 */

import { z } from '@hono/zod-openapi';

// =========================================================================
// Enums
// =========================================================================

export const WidgetTypeSchema = z.enum(['wall_of_love', 'carousel', 'single_quote']).openapi({
  example: 'wall_of_love',
  description: 'Widget layout type',
});

export const WidgetThemeSchema = z.enum(['light', 'dark']).openapi({
  example: 'light',
  description: 'Widget color scheme',
});

// =========================================================================
// Response schemas
// =========================================================================

const TestimonialInWidgetSchema = z.object({
  id: z.string(),
  content: z.string().nullable(),
  customer_name: z.string().nullable(),
  customer_company: z.string().nullable(),
  customer_title: z.string().nullable(),
  customer_avatar_url: z.string().nullable(),
  rating: z.number().nullable(),
  created_at: z.string(),
}).openapi('TestimonialInWidget');

const WidgetPlacementSchema = z.object({
  testimonial_id: z.string(),
  display_order: z.number(),
  is_featured: z.boolean(),
  testimonial: TestimonialInWidgetSchema,
}).openapi('WidgetPlacement');

export const WidgetResponseSchema = z.object({
  id: z.string().openapi({ example: 'GspfE8jECdU4' }),
  organization_id: z.string(),
  created_by: z.string(),
  name: z.string().openapi({ example: 'Homepage Wall of Love' }),
  type: WidgetTypeSchema,
  theme: WidgetThemeSchema,
  show_ratings: z.boolean(),
  show_dates: z.boolean(),
  show_company: z.boolean(),
  show_avatar: z.boolean(),
  max_display: z.number().nullable(),
  settings: z.any(),
  form_id: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  updated_by: z.string().nullable().optional(),
}).openapi('WidgetResponse');

export const WidgetListItemSchema = WidgetResponseSchema.extend({
  testimonial_placements_aggregate: z.object({
    aggregate: z.object({
      count: z.number(),
    }).nullable(),
  }).optional(),
}).openapi('WidgetListItem');

export const WidgetListResponseSchema = z.object({
  widgets: z.array(WidgetListItemSchema),
}).openapi('WidgetListResponse');

export const PublicWidgetResponseSchema = z.object({
  widget: z.object({
    id: z.string(),
    name: z.string(),
    type: WidgetTypeSchema,
    theme: WidgetThemeSchema,
    show_ratings: z.boolean(),
    show_dates: z.boolean(),
    show_company: z.boolean(),
    show_avatar: z.boolean(),
    max_display: z.number().nullable(),
    settings: z.any(),
  }),
  testimonials: z.array(z.object({
    id: z.string(),
    content: z.string().nullable(),
    customer_name: z.string().nullable(),
    customer_company: z.string().nullable(),
    customer_title: z.string().nullable(),
    customer_avatar_url: z.string().nullable(),
    rating: z.number().nullable(),
    created_at: z.string(),
    display_order: z.number(),
    is_featured: z.boolean(),
  })),
}).openapi('PublicWidgetResponse');

// =========================================================================
// Request schemas
// =========================================================================

export const CreateWidgetRequestSchema = z.object({
  name: z.string().min(1).max(100).openapi({ example: 'Homepage Wall of Love' }),
  type: WidgetTypeSchema,
  theme: WidgetThemeSchema.optional().default('light'),
  form_id: z.string().nullable().optional().openapi({
    example: 'GspfE8jECdU4',
    description: 'Optional form ID to scope testimonials. NULL = org-wide.',
  }),
  show_ratings: z.boolean().optional().default(true),
  show_dates: z.boolean().optional().default(false),
  show_company: z.boolean().optional().default(true),
  show_avatar: z.boolean().optional().default(true),
  max_display: z.number().int().positive().nullable().optional().default(null),
  settings: z.record(z.any()).optional().default({}),
}).openapi('CreateWidgetRequest');

export const UpdateWidgetRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: WidgetTypeSchema.optional(),
  theme: WidgetThemeSchema.optional(),
  form_id: z.string().nullable().optional(),
  show_ratings: z.boolean().optional(),
  show_dates: z.boolean().optional(),
  show_company: z.boolean().optional(),
  show_avatar: z.boolean().optional(),
  max_display: z.number().int().positive().nullable().optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
}).openapi('UpdateWidgetRequest');
