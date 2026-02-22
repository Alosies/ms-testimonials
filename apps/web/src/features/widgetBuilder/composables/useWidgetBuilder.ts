import { ref, computed, watch, type Ref } from 'vue';
import { useGetWidget, useCreateWidget, useUpdateWidget, useSyncWidgetTestimonials } from '@/entities/widget';
import type { WidgetFormState } from '../models';
import { DEFAULT_WIDGET_STATE } from '../models';

export function useWidgetBuilder(widgetId: Ref<string | null>) {
  const state = ref<WidgetFormState>({ ...DEFAULT_WIDGET_STATE });
  const isSaving = ref(false);
  const savedWidgetId = ref<string | null>(widgetId.value);
  const selectedTestimonialIds = ref<string[]>([]);

  const isEditMode = computed(() => !!widgetId.value);

  // Load existing widget in edit mode
  const queryVariables = computed(() => ({
    widgetId: widgetId.value ?? '',
  }));
  const { widget, isLoading } = useGetWidget(queryVariables);
  const { createWidget } = useCreateWidget();
  const { updateWidget } = useUpdateWidget();
  const { syncWidgetTestimonials } = useSyncWidgetTestimonials();

  // Sync loaded widget to form state
  watch(widget, (w) => {
    if (!w) return;
    state.value = {
      name: w.name,
      type: w.type as WidgetFormState['type'],
      theme: w.theme as WidgetFormState['theme'],
      form_id: w.form_id ?? null,
      show_ratings: w.show_ratings,
      show_dates: w.show_dates,
      show_company: w.show_company,
      show_avatar: w.show_avatar,
      max_display: w.max_display ?? null,
      settings: w.settings ?? {},
      is_active: w.is_active,
    };
    savedWidgetId.value = w.id;

    // Load selected testimonials from placements
    const placements = w.testimonial_placements ?? [];
    selectedTestimonialIds.value = placements.map((p) => p.testimonial_id);
  });

  async function save(organizationId: string, userId: string) {
    isSaving.value = true;
    try {
      let resultWidgetId: string | null = null;

      if (isEditMode.value && widgetId.value) {
        const result = await updateWidget({
          widgetId: widgetId.value,
          set: {
            name: state.value.name,
            type: state.value.type,
            theme: state.value.theme,
            form_id: state.value.form_id,
            show_ratings: state.value.show_ratings,
            show_dates: state.value.show_dates,
            show_company: state.value.show_company,
            show_avatar: state.value.show_avatar,
            max_display: state.value.max_display,
            settings: state.value.settings,
            is_active: state.value.is_active,
            updated_by: userId,
          },
        });
        resultWidgetId = widgetId.value;

        // Sync testimonial selections
        await syncWidgetTestimonials(
          widgetId.value,
          selectedTestimonialIds.value,
          organizationId,
          userId,
        );

        return result;
      } else {
        const result = await createWidget({
          object: {
            name: state.value.name,
            type: state.value.type,
            theme: state.value.theme,
            form_id: state.value.form_id,
            show_ratings: state.value.show_ratings,
            show_dates: state.value.show_dates,
            show_company: state.value.show_company,
            show_avatar: state.value.show_avatar,
            max_display: state.value.max_display,
            settings: state.value.settings,
            is_active: state.value.is_active,
            organization_id: organizationId,
            created_by: userId,
          },
        });
        if (result) {
          savedWidgetId.value = result.id;
          resultWidgetId = result.id;
        }

        // Sync testimonial selections for new widget
        if (resultWidgetId && selectedTestimonialIds.value.length > 0) {
          await syncWidgetTestimonials(
            resultWidgetId,
            selectedTestimonialIds.value,
            organizationId,
            userId,
          );
        }

        return result;
      }
    } finally {
      isSaving.value = false;
    }
  }

  return {
    state,
    selectedTestimonialIds,
    isEditMode,
    isLoading,
    isSaving,
    savedWidgetId,
    save,
  };
}
