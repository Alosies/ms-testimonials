import { computed } from 'vue';
import {
  useCreateWidgetMutation,
  type CreateWidgetMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateWidget() {
  const { mutate, loading, error, onDone, onError } = useCreateWidgetMutation();

  const hasError = computed(() => error.value !== null);

  const createWidget = async (variables: CreateWidgetMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_widgets_one ?? null;
  };

  return {
    mutate,
    createWidget,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
