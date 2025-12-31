import { ref } from 'vue';
import {
  useCheckSlugAvailabilityLazyQuery,
} from '@/shared/graphql/generated/operations';

/**
 * Composable for checking if an organization slug is available.
 * Uses a lazy query that can be triggered on demand (e.g., on blur).
 */
export function useCheckSlugAvailability() {
  const isAvailable = ref<boolean | null>(null);
  const isChecking = ref(false);
  const checkError = ref<string | null>(null);
  const hasLoaded = ref(false);

  const { load, refetch, loading } = useCheckSlugAvailabilityLazyQuery();

  /**
   * Check if a slug is available for use.
   * @param slug - The slug to check
   * @param excludeOrganizationId - The current organization ID to exclude from the check
   * @returns Promise<boolean> - true if available, false if taken
   */
  async function checkAvailability(
    slug: string,
    excludeOrganizationId: string,
  ): Promise<boolean> {
    if (!slug.trim()) {
      isAvailable.value = null;
      return false;
    }

    isChecking.value = true;
    checkError.value = null;

    const variables = {
      slug: slug.trim().toLowerCase(),
      excludeOrganizationId,
    };

    try {
      let result;

      // Use load() for first call, refetch() for subsequent calls
      if (!hasLoaded.value) {
        result = await load(null, variables);
        if (result !== false) {
          hasLoaded.value = true;
        }
      } else {
        const refetchResult = await refetch(variables);
        result = refetchResult?.data;
      }

      // If result is false/null, query wasn't executed properly
      if (!result) {
        isAvailable.value = null;
        return false;
      }

      // If no organizations found with this slug, it's available
      const available = !result.organizations?.length;
      isAvailable.value = available;
      return available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      checkError.value = 'Failed to check slug availability';
      isAvailable.value = null;
      return false;
    } finally {
      isChecking.value = false;
    }
  }

  /**
   * Reset the availability state
   */
  function resetAvailability() {
    isAvailable.value = null;
    checkError.value = null;
  }

  return {
    isAvailable,
    isChecking,
    checkError,
    loading,
    checkAvailability,
    resetAvailability,
  };
}
