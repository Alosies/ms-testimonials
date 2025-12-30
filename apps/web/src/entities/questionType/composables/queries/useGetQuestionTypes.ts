import { computed } from 'vue';
import { useGetQuestionTypesQuery } from '@/shared/graphql/generated/operations';

export function useGetQuestionTypes() {
  const { result, loading, error, refetch } = useGetQuestionTypesQuery();

  const questionTypes = computed(() => result.value?.question_types ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    questionTypes,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
