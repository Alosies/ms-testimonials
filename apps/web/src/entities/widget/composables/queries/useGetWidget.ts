import { computed, type Ref } from 'vue';
import {
  useGetWidgetQuery,
  type GetWidgetQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetWidget(variables: Ref<GetWidgetQueryVariables>) {
  const { result, loading, error, refetch } = useGetWidgetQuery(variables, {
    enabled: computed(() => !!variables.value.widgetId),
  });

  const widget = computed(() => result.value?.widgets_by_pk ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    widget,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
