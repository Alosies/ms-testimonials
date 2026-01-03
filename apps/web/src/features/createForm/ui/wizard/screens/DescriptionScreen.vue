<script setup lang="ts">
/**
 * Screen 2: Description
 *
 * User describes their product/service/event in detail.
 * This context is used by AI to generate relevant questions.
 */
import { inject, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext } from '../../../composables/useFormWizard';
import { CONCEPT_TYPE_CONFIG, WIZARD_VALIDATION } from '../../../constants/wizardConfig';

const wizard = inject<FormWizardContext>('wizardContext')!;

const descriptionPrompt = computed(() => {
  if (!wizard.conceptType.value) return '';
  return CONCEPT_TYPE_CONFIG[wizard.conceptType.value].descriptionPrompt;
});

const charCount = computed(() => wizard.description.value.length);
const isUnderMinimum = computed(
  () => charCount.value > 0 && charCount.value < WIZARD_VALIDATION.description.minLength
);
const isOverLimit = computed(
  () => charCount.value > WIZARD_VALIDATION.description.maxLength
);

function handleBack() {
  wizard.goBack();
}

function handleContinue() {
  if (wizard.canProceedToScreen3.value) {
    wizard.goNext();
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-semibold text-gray-900">
        Tell us about {{ wizard.conceptName.value }}
      </h1>
      <p class="mt-2 text-gray-500">
        {{ descriptionPrompt }}
      </p>
    </div>

    <!-- Description Textarea -->
    <div class="space-y-2">
      <label for="description" class="block text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        id="description"
        v-model="wizard.description.value"
        rows="5"
        placeholder="Describe what it does, who it's for, and what makes it valuable to your customers..."
        class="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        :class="{
          'border-red-300 focus:border-red-500 focus:ring-red-500/20': isOverLimit,
          'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20': isUnderMinimum && !isOverLimit
        }"
      />
      <div class="flex items-center justify-between">
        <span
          v-if="isUnderMinimum"
          class="text-xs text-amber-600"
        >
          Minimum {{ WIZARD_VALIDATION.description.minLength }} characters
        </span>
        <span v-else />
        <span
          class="text-xs"
          :class="isOverLimit ? 'text-red-500' : 'text-gray-400'"
        >
          {{ charCount }}/{{ WIZARD_VALIDATION.description.maxLength }}
        </span>
      </div>
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
        :disabled="!wizard.canProceedToScreen3.value"
        class="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleContinue"
      >
        Continue
        <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
