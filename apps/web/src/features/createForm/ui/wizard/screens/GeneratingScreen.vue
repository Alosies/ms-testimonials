<script setup lang="ts">
/**
 * Screen 4: Generating
 *
 * Shows the AI thinking loader while generating questions.
 * Handles error state with retry option.
 */
import { inject } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext } from '../../../composables/useFormWizard';
import AIThinkingLoader from '../../aiLoader/AIThinkingLoader.vue';

const wizard = inject<FormWizardContext>('wizardContext')!;
</script>

<template>
  <div>
    <!-- Error State -->
    <div
      v-if="wizard.generationError.value"
      class="text-center"
    >
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <Icon icon="heroicons:exclamation-triangle" class="h-8 w-8 text-red-500" />
      </div>

      <h2 class="text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p class="mt-2 text-gray-500">
        {{ wizard.generationError.value }}
      </p>

      <div class="mt-8 flex justify-center gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          @click="wizard.goBackFromError()"
        >
          <Icon icon="heroicons:arrow-left" class="h-4 w-4" />
          Go Back
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-all hover:bg-teal-600"
          @click="wizard.retryGeneration()"
        >
          <Icon icon="heroicons:arrow-path" class="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <AIThinkingLoader
      v-else
      :product-name="wizard.conceptName.value"
    />
  </div>
</template>
