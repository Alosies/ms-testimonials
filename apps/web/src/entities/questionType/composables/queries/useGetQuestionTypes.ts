import { computed } from 'vue';
import { useGetQuestionTypesQuery } from '@/shared/graphql/generated/operations';

/**
 * Fetches all active question types from the database.
 *
 * Note: For plan-based filtering, use the organization store's
 * `allowedQuestionTypes` computed property instead, which returns
 * question types allowed by the organization's current plan.
 *
 * @example
 * ```ts
 * // To get all question types (admin/system use)
 * const { questionTypes } = useGetQuestionTypes();
 *
 * // To get allowed types for current org (user-facing components)
 * const { allowedQuestionTypes } = toRefs(useOrganizationStore());
 * ```
 */
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
