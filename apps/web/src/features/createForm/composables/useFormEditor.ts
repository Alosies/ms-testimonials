import { ref, computed, watch, onMounted } from 'vue';
import { usePublishForm, useGetForm } from '@/entities/form';
import { useRouting } from '@/shared/routing';
import { useCreateFormWizard } from './useCreateFormWizard';
import { useFormAutoSave } from './useFormAutoSave';

interface UseFormEditorOptions {
  /**
   * Form ID to load for editing.
   * Required - form creation is handled by the /forms/creating page.
   */
  existingFormId?: string;
}

/**
 * Orchestrates the form editing experience.
 *
 * - Loads existing form data and enables auto-save
 * - Integrates wizard state with auto-save and publish functionality
 * - If no existingFormId, redirects to the form creation page
 */
export function useFormEditor(options: UseFormEditorOptions = {}) {
  const { existingFormId } = options;

  const { goToNewForm, goToForms } = useRouting();

  // Core wizard state
  const wizard = useCreateFormWizard();
  const { formData, formId } = wizard;

  // Loading state
  const isInitializing = ref(false);
  const initError = ref<string | null>(null);

  // Mutations
  const { publishForm: publishFormMutation, loading: publishing } =
    usePublishForm();

  // Query for existing form (edit mode)
  const formQueryVariables = computed(() => ({
    formId: existingFormId ?? '',
  }));
  const { form: existingForm, loading: loadingForm } =
    useGetForm(formQueryVariables);

  // Auto-save integration (only enabled when we have a formId)
  const autoSave = useFormAutoSave({
    formId: computed(() => formId.value),
    formData,
    debounceMs: 500,
  });

  /**
   * Load existing form data into wizard state.
   * Called when editing an existing form.
   */
  function loadExistingFormData() {
    if (!existingForm.value) return;

    const form = existingForm.value;

    // Populate form data
    formData.product_name = form.product_name || '';
    formData.product_description = form.product_description || '';
    formData.name = form.name || '';
    formData.slug = form.slug || '';

    // Set the form ID
    wizard.setFormId(form.id);
  }

  /**
   * Publish the form (change status from draft to published).
   */
  async function handlePublish() {
    if (!formId.value) return;

    try {
      const result = await publishFormMutation(formId.value);
      if (result) {
        // Navigate to forms list
        goToForms();
      }
    } catch (error) {
      console.error('Publish failed:', error);
      throw error;
    }
  }

  // Watch for form data changes to trigger auto-save
  watch(
    () => [formData.name, formData.product_name, formData.product_description],
    () => {
      // Only auto-save if we have a form ID (not during initial creation)
      if (formId.value) {
        autoSave.triggerSave();
      }
    }
  );

  // Load existing form when query completes (only once on initial load)
  // Using { once: true } prevents reloading after Apollo cache updates from mutations
  watch(
    existingForm,
    (form) => {
      if (form) {
        loadExistingFormData();
      }
    },
    { once: true }
  );

  // Initialize on mount
  onMounted(() => {
    if (existingFormId) {
      // Edit mode: form will be loaded by the query
      wizard.setFormId(existingFormId);
    } else {
      // No form ID - redirect to the form creation page
      goToNewForm();
    }
  });

  return {
    // Wizard state & methods
    ...wizard,

    // Initialization state
    isInitializing,
    initError,
    loadingForm,

    // Auto-save status
    saveStatus: autoSave.saveStatus,
    lastSavedAt: autoSave.lastSavedAt,
    saveError: autoSave.saveError,
    isSaving: autoSave.isSaving,
    hasPendingChanges: autoSave.hasPendingChanges,
    retrySave: autoSave.retrySave,

    // Publish
    handlePublish,
    publishing,

    // Edit mode
    isEditMode: computed(() => !!existingFormId),
    existingForm,
  };
}
