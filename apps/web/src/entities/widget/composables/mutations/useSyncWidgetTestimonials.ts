import {
  useSyncWidgetTestimonialsMutation,
  type Widget_Testimonials_Insert_Input,
} from '@/shared/graphql/generated/operations';

export function useSyncWidgetTestimonials() {
  const { mutate, loading, error, onDone, onError } = useSyncWidgetTestimonialsMutation();

  const syncWidgetTestimonials = async (
    widgetId: string,
    testimonialIds: string[],
    organizationId: string,
    userId: string,
  ) => {
    const objects: Widget_Testimonials_Insert_Input[] = testimonialIds.map((tid, index) => ({
      widget_id: widgetId,
      testimonial_id: tid,
      organization_id: organizationId,
      display_order: index,
      added_by: userId,
    }));

    const result = await mutate({ widgetId, objects });
    return result?.data?.insert_widget_testimonials?.returning ?? [];
  };

  return {
    syncWidgetTestimonials,
    loading,
    error,
    onDone,
    onError,
  };
}
