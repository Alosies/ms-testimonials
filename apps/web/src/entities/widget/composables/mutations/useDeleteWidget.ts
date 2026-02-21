import { computed } from 'vue';
import {
  useDeleteWidgetMutation,
  type DeleteWidgetMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteWidget() {
  const { mutate, loading, error, onDone, onError } = useDeleteWidgetMutation();

  const hasError = computed(() => error.value !== null);

  const deleteWidget = async (variables: DeleteWidgetMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_widgets_by_pk ?? null;
  };

  return {
    mutate,
    deleteWidget,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
