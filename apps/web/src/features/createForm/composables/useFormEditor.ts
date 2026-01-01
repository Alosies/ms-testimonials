import { ref, computed, watch, toRefs, onMounted } from 'vue';
import { useCreateForm, usePublishForm, useGetForm } from '@/entities/form';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';
import { createSlugFromString } from '@/shared/urls';
import { useCreateFormWizard } from './useCreateFormWizard';
import { useFormAutoSave } from './useFormAutoSave';

interface UseFormEditorOptions {
  /**
   * If provided, load existing form for editing.
   * If not provided, create a new draft form on mount.
   */
  existingFormId?: string;
}

/**
 * Orchestrates the form editing experience.
 *
 * - For new forms: Creates a draft immediately and redirects to edit URL
 * - For existing forms: Loads form data and enables auto-save
 * - Integrates wizard state with auto-save and publish functionality
 */
export function useFormEditor(options: UseFormEditorOptions = {}) {
  const { existingFormId } = options;

  const contextStore = useCurrentContextStore();
  const { currentOrganizationId, currentUserId } = toRefs(contextStore);
  const { goToFormEdit, goToForms } = useRouting();

  // Core wizard state
  const wizard = useCreateFormWizard();
  const { formData, formId } = wizard;

  // Draft creation state
  const isInitializing = ref(false);
  const initError = ref<string | null>(null);

  // Mutations
  const { createForm, loading: creatingDraft } = useCreateForm();
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
   * Create a new draft form and redirect to edit URL.
   * Called on mount when no existingFormId is provided.
   */
  async function initializeDraftForm() {
    if (formId.value) return; // Already have a form
    if (!currentOrganizationId.value) return;
    if (!currentUserId.value) return;

    isInitializing.value = true;
    initError.value = null;

    try {
      // Generate a temporary slug (can be updated later)
      const tempSlug = createSlugFromString(`draft-${Date.now()}`);

      const result = await createForm({
        form: {
          name: 'Untitled Form',
          slug: tempSlug,
          product_name: '',
          product_description: '',
          organization_id: currentOrganizationId.value,
          created_by: currentUserId.value,
          // status defaults to 'draft' in database
        },
      });

      if (result) {
        wizard.setFormId(result.id);

        // Redirect to edit URL using centralized routing
        goToFormEdit(
          { name: result.name || 'untitled', id: result.id },
          { replace: true }
        );
      } else {
        throw new Error('Failed to create draft form');
      }
    } catch (error) {
      initError.value =
        error instanceof Error ? error.message : 'Failed to create draft';
      console.error('Draft creation failed:', error);
    } finally {
      isInitializing.value = false;
    }
  }

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
    () => [formData.product_name, formData.product_description],
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
      // Create mode: create draft immediately
      initializeDraftForm();
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

    // Draft & publish
    initializeDraftForm,
    creatingDraft,
    handlePublish,
    publishing,

    // Edit mode
    isEditMode: computed(() => !!existingFormId),
    existingForm,
  };
}
