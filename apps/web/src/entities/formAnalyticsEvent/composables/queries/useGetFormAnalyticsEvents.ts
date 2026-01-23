import { computed, type Ref } from 'vue';
import {
  useGetFormAnalyticsEventsQuery,
  type GetFormAnalyticsEventsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetFormAnalyticsEvents(variables: Ref<GetFormAnalyticsEventsQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormAnalyticsEventsQuery(variables, {
    enabled: computed(() => !!variables.value.formId),
  });

  const events = computed(() => result.value?.form_analytics_events ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    events,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
