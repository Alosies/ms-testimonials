import { computed } from 'vue';
import {
  useUpdateWidgetMutation,
  type UpdateWidgetMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateWidget() {
  const { mutate, loading, error, onDone, onError } = useUpdateWidgetMutation();

  const hasError = computed(() => error.value !== null);

  const updateWidget = async (variables: UpdateWidgetMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_widgets_by_pk ?? null;
  };

  return {
    mutate,
    updateWidget,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
