<script setup lang="ts">
/**
 * Screen 3: Focus Areas
 *
 * User selects what their testimonials should highlight.
 * These guide the AI in generating relevant questions.
 */
import { inject, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext } from '../../../composables/useFormWizard';
import { FOCUS_AREAS_BY_TYPE, WIZARD_VALIDATION } from '../../../constants/wizardConfig';
import FocusAreaTag from '../components/FocusAreaTag.vue';

const wizard = inject<FormWizardContext>('wizardContext')!;

const focusAreas = computed(() => {
  if (!wizard.conceptType.value) return [];
  return FOCUS_AREAS_BY_TYPE[wizard.conceptType.value];
});

// Create a Set for O(1) lookups - this ensures proper reactivity tracking
const selectedAreasSet = computed(() => new Set(wizard.selectedFocusAreas.value));

function isAreaSelected(area: string): boolean {
  return selectedAreasSet.value.has(area);
}

const customCharCount = computed(() => wizard.customFocusAreas.value.length);
const isOverLimit = computed(
  () => customCharCount.value > WIZARD_VALIDATION.customFocusAreas.maxLength
);

const hasNoFocusAreas = computed(
  () => wizard.selectedFocusAreas.value.length === 0 && !wizard.customFocusAreas.value.trim()
);

function handleBack() {
  wizard.goBack();
}

function handleGenerate() {
  wizard.generateQuestions();
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-semibold text-gray-900">
        What should testimonials highlight?
      </h1>
      <p class="mt-2 text-gray-500">
        Select areas you want customers to talk about
      </p>
    </div>

    <!-- Focus Area Tags -->
    <div class="flex flex-wrap justify-center gap-2">
      <FocusAreaTag
        v-for="area in focusAreas"
        :key="area"
        :label="area"
        :is-selected="isAreaSelected(area)"
        @toggle="wizard.toggleFocusArea(area)"
      />
    </div>

    <!-- Custom Focus Areas -->
    <div class="space-y-2">
      <label for="custom-focus" class="block text-sm font-medium text-gray-700">
        Add specific areas (optional)
      </label>
      <textarea
        id="custom-focus"
        v-model="wizard.customFocusAreas.value"
        rows="2"
        placeholder="e.g., &quot;integration with Slack&quot;, &quot;pricing value&quot;"
        class="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': isOverLimit }"
      />
      <div class="flex justify-end">
        <span
          class="text-xs"
          :class="isOverLimit ? 'text-red-500' : 'text-gray-400'"
        >
          {{ customCharCount }}/{{ WIZARD_VALIDATION.customFocusAreas.maxLength }}
        </span>
      </div>
    </div>

    <!-- Hint when no focus areas selected -->
    <div
      v-if="hasNoFocusAreas"
      class="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-700"
    >
      <Icon icon="heroicons:light-bulb" class="mr-1 inline h-4 w-4" />
      Adding focus areas helps generate better questions
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="handleBack"
      >
        <Icon icon="heroicons:arrow-left" class="h-4 w-4" />
        Back
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-all hover:bg-teal-600"
        @click="handleGenerate"
      >
        <Icon icon="heroicons:sparkles" class="h-4 w-4" />
        Generate with AI
      </button>
    </div>
  </div>
</template>
