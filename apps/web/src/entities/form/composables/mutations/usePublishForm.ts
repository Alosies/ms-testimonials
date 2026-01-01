import { computed } from 'vue';
import { usePublishFormMutation } from '@/shared/graphql/generated/operations';

export function usePublishForm() {
  const { mutate, loading, error, onDone, onError } = usePublishFormMutation();

  const hasError = computed(() => error.value !== null);

  const publishForm = async (formId: string) => {
    const result = await mutate({ id: formId });
    return result?.data?.update_forms_by_pk ?? null;
  };

  return {
    mutate,
    publishForm,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
