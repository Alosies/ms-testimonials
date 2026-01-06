import { ref, computed, watch, onMounted } from 'vue';
import { usePublishForm, useGetForm } from '@/entities/form';
import { useGetFormQuestions } from '@/entities/formQuestion';
import { useRouting } from '@/shared/routing';
import { useCreateFormWizard } from './useCreateFormWizard';
import { useFormAutoSave } from './useFormAutoSave';
import type { QuestionData } from '../models';
import type { QuestionTypeId } from '@/shared/api';

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

  // Query for existing form questions (edit mode)
  const { formQuestions: existingQuestions, loading: loadingQuestions } =
    useGetFormQuestions(formQueryVariables);

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

    // Set the form ID
    wizard.setFormId(form.id);
  }

  /**
   * Load existing questions into wizard state.
   * Called when editing a form with existing questions.
   */
  function loadExistingQuestions() {
    if (!existingQuestions.value || existingQuestions.value.length === 0) return;

    // Map DB questions to QuestionData format
    const questions: QuestionData[] = existingQuestions.value.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_key: q.question_key,
      question_type_id: (q.question_type?.unique_name || q.question_type_id) as QuestionTypeId,
      placeholder: q.placeholder ?? null,
      help_text: q.help_text ?? null,
      is_required: q.is_required,
      display_order: q.display_order,
      options: null, // TODO: Load question options if needed
      // Flow membership defaults - will be overridden by step data if available
      flow_membership: 'shared',
      is_branch_point: false,
      isNew: false,
      isModified: false,
    }));

    // Set questions in wizard (without AI context since these are loaded from DB)
    wizard.setAIQuestions(questions, null);
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

  // Load existing questions when query completes (only once on initial load)
  watch(
    existingQuestions,
    (questions) => {
      if (questions && questions.length > 0) {
        loadExistingQuestions();
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

  // Combined loading state for form and questions
  const isLoadingData = computed(
    () => loadingForm.value || loadingQuestions.value
  );

  return {
    // Wizard state & methods
    ...wizard,

    // Initialization state
    isInitializing,
    initError,
    loadingForm: isLoadingData,

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
