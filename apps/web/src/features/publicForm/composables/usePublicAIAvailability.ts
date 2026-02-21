/**
 * Public AI Availability Composable
 *
 * Checks whether AI testimonial assembly is available for a given form
 * based on the form owner's organization plan. Used to hide the AI path
 * card when the org doesn't have the testimonial_assembly capability.
 *
 * Defaults to optimistic (available = true) — only hides AI after
 * a confirmed negative response from the API.
 */
import { ref, watch, type Ref } from 'vue';
import { useApiForAI } from '@/shared/api/ai';

export function usePublicAIAvailability(formId: Ref<string>) {
  const aiApi = useApiForAI();

  const isAIAvailable = ref(true);
  const isCheckingAI = ref(false);
  const aiUnavailableReason = ref<string | null>(null);

  async function checkAvailability(id: string) {
    if (!id) return;

    isCheckingAI.value = true;
    try {
      const result = await aiApi.checkFormAIAvailability(id);
      isAIAvailable.value = result.available;
      aiUnavailableReason.value = result.reason ?? null;
    } catch {
      // On network error, stay optimistic — let the assembly call handle it
      isAIAvailable.value = true;
      aiUnavailableReason.value = null;
    } finally {
      isCheckingAI.value = false;
    }
  }

  watch(formId, (id) => checkAvailability(id), { immediate: true });

  return {
    isAIAvailable,
    isCheckingAI,
    aiUnavailableReason,
  };
}
