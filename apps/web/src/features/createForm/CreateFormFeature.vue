<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';
import { useFormEditor } from './composables/useFormEditor';
import {
  ProductInfoStep,
  AISuggestionsStep,
  CustomizeQuestionsStep,
  PreviewPublishStep,
} from './ui';
import SaveStatusIndicator from './ui/SaveStatusIndicator.vue';

const props = defineProps<{
  /**
   * If provided, load existing form for editing.
   * If not provided, create a new draft form on mount.
   */
  existingFormId?: string;
}>();

const {
  // Wizard state
  currentStep,
  currentStepIndex,
  formData,
  questions,
  aiContext,
  formId,
  isLoading,
  error,
  nextStep,
  prevStep,
  goToStep,
  setAIQuestions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
  canProceedFromProductInfo,
  canProceedFromCustomize,
  setFormId,
  setLoading,
  setError,

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

// Show loading during initialization or form loading
const isPageLoading = computed(
  () => isInitializing.value || loadingForm.value
);

// Inline title editing
const isEditingTitle = ref(false);
const titleInputRef = ref<HTMLInputElement | null>(null);

// Display title - use form name or fallback
const displayTitle = computed(() => formData.name || 'Untitled Form');

async function startEditingTitle() {
  isEditingTitle.value = true;
  await nextTick();
  titleInputRef.value?.focus();
  titleInputRef.value?.select();
}

function finishEditingTitle() {
  isEditingTitle.value = false;
  // Trim whitespace and ensure we have a name
  formData.name = formData.name.trim() || 'Untitled Form';
}

function handleTitleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    finishEditingTitle();
  } else if (event.key === 'Escape') {
    isEditingTitle.value = false;
  }
}

const steps = [
  { id: 'product-info', label: 'Product Info', number: 1 },
  { id: 'ai-suggestions', label: 'AI Suggestions', number: 2 },
  { id: 'customize', label: 'Customize', number: 3 },
  { id: 'preview', label: 'Preview', number: 4 },
];
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <!-- Header with Editable Title and Save Status -->
    <div class="mb-6 flex items-center justify-between">
      <!-- Inline Editable Title -->
      <div class="group flex items-center gap-2">
        <input
          v-if="isEditingTitle"
          ref="titleInputRef"
          v-model="formData.name"
          type="text"
          class="rounded-md border border-gray-300 px-2 py-1 text-2xl font-semibold text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Untitled Form"
          @blur="finishEditingTitle"
          @keydown="handleTitleKeydown"
        />
        <button
          v-else
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-gray-100"
          @click="startEditingTitle"
        >
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ displayTitle }}
          </h1>
          <Icon
            icon="lucide:pencil"
            class="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>
      <SaveStatusIndicator
        :status="saveStatus"
        :last-saved-at="lastSavedAt"
        :error="saveError"
        @retry="retrySave"
      />
    </div>

    <!-- Initialization Loading -->
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

    <!-- Initialization Error -->
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

    <!-- Main Content -->
    <template v-else>
      <!-- Progress Steps -->
      <nav class="mb-8" aria-label="Progress">
      <ol class="flex items-center justify-between">
        <li
          v-for="step in steps"
          :key="step.id"
          class="flex items-center"
          :class="{ 'flex-1': step.number < 4 }"
        >
          <button
            type="button"
            class="flex items-center"
            :class="{
              'cursor-not-allowed': step.number > currentStepIndex + 1,
              'cursor-pointer': step.number <= currentStepIndex + 1,
            }"
            :disabled="step.number > currentStepIndex + 1"
            @click="step.number <= currentStepIndex + 1 && goToStep(step.id as typeof currentStep.value)"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
              :class="{
                'bg-primary text-white': step.number <= currentStepIndex + 1,
                'bg-gray-200 text-gray-500': step.number > currentStepIndex + 1,
              }"
            >
              {{ step.number }}
            </span>
            <span
              class="ml-2 text-sm font-medium"
              :class="{
                'text-gray-900': step.number <= currentStepIndex + 1,
                'text-gray-400': step.number > currentStepIndex + 1,
              }"
            >
              {{ step.label }}
            </span>
          </button>
          <div
            v-if="step.number < 4"
            class="mx-4 h-0.5 flex-1"
            :class="{
              'bg-primary': step.number <= currentStepIndex,
              'bg-gray-200': step.number > currentStepIndex,
            }"
          />
        </li>
      </ol>
    </nav>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Step Content -->
    <div class="rounded-lg border bg-white p-6 shadow-sm">
      <ProductInfoStep
        v-if="currentStep === 'product-info'"
        v-model:formData="formData"
        :can-proceed="canProceedFromProductInfo"
        :is-loading="isLoading"
        @next="nextStep"
      />

      <AISuggestionsStep
        v-else-if="currentStep === 'ai-suggestions'"
        :form-data="formData"
        :questions="questions"
        :ai-context="aiContext"
        :is-loading="isLoading"
        @set-questions="setAIQuestions"
        @set-loading="setLoading"
        @set-error="setError"
        @next="nextStep"
        @prev="prevStep"
      />

      <CustomizeQuestionsStep
        v-else-if="currentStep === 'customize'"
        :questions="questions"
        :form-data="formData"
        :form-id="formId"
        :can-proceed="canProceedFromCustomize"
        :is-loading="isLoading"
        @update-question="updateQuestion"
        @remove-question="removeQuestion"
        @add-question="addQuestion"
        @reorder-questions="reorderQuestions"
        @set-form-id="setFormId"
        @set-loading="setLoading"
        @set-error="setError"
        @next="nextStep"
        @prev="prevStep"
      />

      <PreviewPublishStep
        v-else-if="currentStep === 'preview'"
        :form-data="formData"
        :questions="questions"
        :form-id="formId"
        :publishing="publishing"
        @prev="prevStep"
        @publish="handlePublish"
      />
    </div>
    </template>
  </div>
</template>
