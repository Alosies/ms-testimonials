<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useFormEditor } from './composables/useFormEditor';
import { useFormSections } from './composables/useFormSections';
import { useQuestionGeneration } from './composables/useQuestionGeneration';
import { useConfirmationModal } from '@/shared/widgets';
import {
  ProductInfoSection,
  QuestionsSection,
  PreviewSection,
} from './ui/sections';
import EditableFormTitle from './ui/EditableFormTitle.vue';
import SaveStatusIndicator from './ui/SaveStatusIndicator.vue';

const props = defineProps<{
  existingFormId?: string;
}>();

const {
  // State
  formData,
  questions,
  aiContext,
  formId,
  error,

  // Question management
  setAIQuestions,
  setQuestions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
  setFormId,
  setError,

  // Validation
  canProceedFromProductInfo,

  // Save status
  saveStatus,
  lastSavedAt,
  saveError,
  retrySave,

  // Initialization
  isInitializing,
  initError,
  loadingForm,

  // Publish
  handlePublish,
  publishing,
} = useFormEditor({ existingFormId: props.existingFormId });

// Section management
const sections = useFormSections({
  canExpandQuestions: canProceedFromProductInfo,
  canExpandPreview: computed(() => questions.value.length > 0),
});

// Question generation
const questionGeneration = useQuestionGeneration({
  formData,
  formId,
  questions,
  onQuestionsGenerated: (newQuestions, context) => {
    setAIQuestions(newQuestions, context);
  },
  onQuestionsSaved: (updatedQuestions) => {
    setQuestions(updatedQuestions);
  },
  onFormCreated: (id) => {
    setFormId(id);
  },
  onError: (errorMsg) => {
    setError(errorMsg);
  },
});

// Confirmation modal for regenerate
const { showConfirmation: showRegenerateConfirmation } = useConfirmationModal();

// Show loading during initialization or form loading
const isPageLoading = computed(
  () => isInitializing.value || loadingForm.value
);

// Track if questions have unsaved changes
const hasUnsavedQuestionChanges = computed(() =>
  questions.value.some((q) => q.isModified || q.isNew)
);

// Scroll to an element by ID
function scrollToSection(id: string) {
  nextTick(() => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Handle generate questions
async function handleGenerateQuestions() {
  // Scroll to questions section to see the AI loader
  scrollToSection('questions');
  const success = await questionGeneration.generateQuestions();
  if (success) {
    sections.onQuestionsGenerated();
  }
}

// Handle regenerate with confirmation
function handleRegenerateQuestions() {
  // Only show confirmation if questions already exist
  if (questions.value.length > 0) {
    showRegenerateConfirmation({
      actionType: 'regenerate_questions',
      entityName: 'questions',
      onConfirm: async () => {
        // Scroll to questions section to see the AI loader
        scrollToSection('questions');
        const success = await questionGeneration.regenerateQuestions();
        if (success) {
          sections.onQuestionsGenerated();
        }
      },
    });
  } else {
    handleGenerateQuestions();
  }
}

// Handle save questions (explicit save for new/modified questions)
async function handleSaveQuestions() {
  await questionGeneration.saveQuestions();
}

// Initialize sections after form loads
watch(
  () => loadingForm.value,
  (loading) => {
    if (!loading) {
      const hasQuestions = questions.value.length > 0;
      const questionsInDb = questions.value.some((q) => q.id);
      sections.initializeSections(hasQuestions, questionsInDb);
    }
  }
);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <EditableFormTitle
        v-model="formData.name"
        placeholder="Untitled Form"
      />
      <SaveStatusIndicator
        :status="saveStatus"
        :last-saved-at="lastSavedAt"
        :error="saveError"
        @retry="retrySave"
      />
    </div>

    <div
      v-if="isPageLoading"
      class="flex min-h-[400px] items-center justify-center"
    >
      <div class="text-center">
        <div
          class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        />
        <p class="mt-4 text-sm text-gray-500">Loading form...</p>
      </div>
    </div>

    <div
      v-else-if="initError"
      class="mb-6 rounded-lg bg-red-50 p-6 text-center"
    >
      <p class="text-sm text-red-700">{{ initError }}</p>
      <button
        class="mt-3 text-sm text-red-600 underline hover:text-red-700"
        @click="$router.go(0)"
      >
        Try again
      </button>
    </div>

    <template v-else>
      <div
        v-if="error"
        class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div class="space-y-4">
        <ProductInfoSection
          id="product-info"
          v-model:form-data="formData"
          :expanded="sections.productInfoExpanded.value"
          :can-generate="canProceedFromProductInfo"
          :is-generating="questionGeneration.isGenerating.value"
          :has-questions="questions.length > 0"
          @update:expanded="sections.productInfoExpanded.value = $event"
          @generate="handleGenerateQuestions"
        />

        <QuestionsSection
          id="questions"
          :expanded="sections.questionsExpanded.value"
          :disabled="sections.questionsDisabled.value"
          :questions="questions"
          :form-data="formData"
          :form-id="formId"
          :is-generating="questionGeneration.isGenerating.value"
          :is-saving="questionGeneration.isSaving.value"
          :ai-context="aiContext"
          :has-unsaved-changes="hasUnsavedQuestionChanges"
          @update:expanded="sections.questionsExpanded.value = $event"
          @update-question="updateQuestion"
          @remove-question="removeQuestion"
          @add-question="addQuestion"
          @reorder-questions="reorderQuestions"
          @regenerate="handleRegenerateQuestions"
          @save-questions="handleSaveQuestions"
        />

        <PreviewSection
          id="preview"
          :expanded="sections.previewExpanded.value"
          :disabled="sections.previewDisabled.value"
          :form-data="formData"
          :questions="questions"
          :form-id="formId"
          :publishing="publishing"
          @update:expanded="sections.previewExpanded.value = $event"
          @publish="handlePublish"
        />
      </div>
    </template>
  </div>
</template>
