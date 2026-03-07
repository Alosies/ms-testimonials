/**
 * E2E Widget CRUD Operations
 *
 * Creates and deletes test widgets with testimonials.
 * All operations use admin client to bypass RLS.
 */
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { env } from '@/shared/config/env';
import {
  CreateTestTestimonialDocument,
  CreateTestWidgetDocument,
  InsertWidgetTestimonialsDocument,
  GetWidgetTestimonialIdsDocument,
  DeleteTestWidgetDocument,
  DeleteTestTestimonialsDocument,
  type CreateTestTestimonialMutation,
  type CreateTestWidgetMutation,
  type InsertWidgetTestimonialsMutation,
  type GetWidgetTestimonialIdsQuery,
  type DeleteTestWidgetMutation,
  type DeleteTestTestimonialsMutation,
} from '@/graphql/generated/operations';
import { DEFAULT_WIDGET_SETTINGS, MOCK_TESTIMONIALS } from './constants';
import type { CreateTestWidgetInput, TestWidgetResult } from './types';

/**
 * Create a test widget with approved testimonials.
 *
 * Steps:
 * 1. Create approved testimonials (cycling through MOCK_TESTIMONIALS)
 * 2. Create the widget
 * 3. Attach testimonials via junction table
 * 4. Return result with all created IDs
 */
export async function createTestWidget(
  input: CreateTestWidgetInput
): Promise<TestWidgetResult> {
  const count = input.testimonialCount ?? 3;
  const testimonialIds: string[] = [];

  // 1. Create approved testimonials
  for (let i = 0; i < count; i++) {
    const mockData = MOCK_TESTIMONIALS[i % MOCK_TESTIMONIALS.length];

    const { data, error } = await executeGraphQLAsAdmin<CreateTestTestimonialMutation>(
      CreateTestTestimonialDocument,
      {
        object: {
          organization_id: env.E2E_ORGANIZATION_ID,
          customer_name: mockData.customer_name,
          customer_email: mockData.customer_email,
          content: mockData.content,
          rating: mockData.rating,
          status: 'approved',
          source: 'manual',
        },
      }
    );

    if (error || !data?.insert_testimonials_one?.id) {
      throw new Error(`Failed to create testimonial: ${error?.message || 'No ID returned'}`);
    }

    testimonialIds.push(data.insert_testimonials_one.id);
  }

  // 2. Create the widget
  const settings = input.settings ?? DEFAULT_WIDGET_SETTINGS[input.type] ?? {};

  const { data: widgetData, error: widgetError } = await executeGraphQLAsAdmin<CreateTestWidgetMutation>(
    CreateTestWidgetDocument,
    {
      object: {
        organization_id: env.E2E_ORGANIZATION_ID,
        created_by: env.E2E_USER_ID,
        name: input.name,
        type: input.type,
        theme: 'light',
        settings,
        form_id: null,
        is_active: true,
        show_ratings: true,
        show_dates: true,
        show_company: true,
        show_avatar: true,
        max_display: 10,
      },
    }
  );

  if (widgetError || !widgetData?.insert_widgets_one?.id) {
    throw new Error(`Failed to create widget: ${widgetError?.message || 'No ID returned'}`);
  }

  const widgetId = widgetData.insert_widgets_one.id;

  // 3. Attach testimonials via junction table
  if (testimonialIds.length > 0) {
    const junctionObjects = testimonialIds.map((testimonialId, index) => ({
      organization_id: env.E2E_ORGANIZATION_ID,
      widget_id: widgetId,
      testimonial_id: testimonialId,
      display_order: index + 1,
      added_by: env.E2E_USER_ID,
    }));

    const { error: junctionError } = await executeGraphQLAsAdmin<InsertWidgetTestimonialsMutation>(
      InsertWidgetTestimonialsDocument,
      { objects: junctionObjects }
    );

    if (junctionError) {
      throw new Error(`Failed to attach testimonials: ${junctionError.message}`);
    }
  }

  return {
    widgetId,
    widgetName: input.name,
    type: input.type,
    testimonialIds,
    testimonialCount: count,
  };
}

/**
 * Hard-delete a test widget AND its created testimonials.
 *
 * Deletion order:
 * 1. Fetch testimonial IDs from widget_testimonials junction
 * 2. Delete widget (CASCADE removes junction rows)
 * 3. Delete the testimonials by IDs
 */
export async function deleteTestWidget(widgetId: string): Promise<boolean> {
  // 1. Get testimonial IDs before deleting widget
  const { data: junctionData } = await executeGraphQLAsAdmin<GetWidgetTestimonialIdsQuery>(
    GetWidgetTestimonialIdsDocument,
    { widget_id: widgetId }
  );

  const testimonialIds = junctionData?.widget_testimonials?.map(
    (row) => row.testimonial_id
  ) ?? [];

  // 2. Delete widget (cascade deletes junction rows)
  const { data: deleteData, error: deleteError } = await executeGraphQLAsAdmin<DeleteTestWidgetMutation>(
    DeleteTestWidgetDocument,
    { widgetId }
  );

  if (deleteError || !deleteData?.delete_widgets_by_pk?.id) {
    return false;
  }

  // 3. Delete testimonials
  if (testimonialIds.length > 0) {
    await executeGraphQLAsAdmin<DeleteTestTestimonialsMutation>(
      DeleteTestTestimonialsDocument,
      { ids: testimonialIds }
    );
  }

  return true;
}
