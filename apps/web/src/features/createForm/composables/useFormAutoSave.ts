import { ref, computed, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useUpdateFormAutoSave } from '@/entities/form';
import type { FormData, SaveStatus } from '../models';

// Re-export for convenience
export type { SaveStatus } from '../models';

interface UseFormAutoSaveOptions {
  formId: Ref<string | null>;
  formData: FormData;
  debounceMs?: number;
}

/**
 * Auto-save composable for form product info.
 *
 * Uses the minimal response mutation pattern to prevent Apollo cache
 * from overwriting local state. See ADR-003 for rationale.
 *
 * Only auto-saves: name, product_name, product_description
 * Questions require explicit save via CustomizeQuestionsStep.
 */
export function useFormAutoSave(options: UseFormAutoSaveOptions) {
  const { formId, formData, debounceMs = 500 } = options;

  // Save status tracking
  const saveStatus = ref<SaveStatus>('idle');
  const lastSavedAt = ref<Date | null>(null);
  const saveError = ref<string | null>(null);

  // Track pending changes
  const hasPendingChanges = ref(false);

  // Mutation composable
  const { updateFormAutoSave, loading } = useUpdateFormAutoSave();

  // Combined saving state
  const isSaving = computed(() => loading.value);

  // Core save function (not debounced)
  async function executeSave() {
    if (!formId.value) {
      return;
    }

    saveStatus.value = 'saving';
    saveError.value = null;

    try {
      await updateFormAutoSave({
        id: formId.value,
        changes: {
          name: formData.name,
          product_name: formData.product_name,
          product_description: formData.product_description,
        },
      });

      // SUCCESS: Only update status, NOT local state
      // The mutation returns only id, status, updated_at
      // Apollo cache will not overwrite product_name or product_description
      saveStatus.value = 'saved';
      lastSavedAt.value = new Date();
      hasPendingChanges.value = false;

      // Auto-reset to idle after 2 seconds
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      saveStatus.value = 'error';
      saveError.value =
        error instanceof Error ? error.message : 'Failed to save';
    }
  }

  // Debounced save function
  const saveFormInfo = useDebounceFn(() => {
    executeSave();
  }, debounceMs);

  // Trigger debounced save
  function triggerSave() {
    hasPendingChanges.value = true;
    saveFormInfo();
  }

  // Retry last failed save
  function retrySave() {
    if (saveError.value) {
      executeSave();
    }
  }

  // Clear error
  function clearError() {
    saveError.value = null;
    if (saveStatus.value === 'error') {
      saveStatus.value = 'idle';
    }
  }

  return {
    // Status
    saveStatus,
    lastSavedAt,
    saveError,
    isSaving,
    hasPendingChanges,

    // Actions
    triggerSave,
    retrySave,
    clearError,
  };
}
