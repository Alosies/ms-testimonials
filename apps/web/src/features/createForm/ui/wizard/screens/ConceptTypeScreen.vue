<script setup lang="ts">
/**
 * Screen 1: Concept Type
 *
 * User selects what they're collecting testimonials for:
 * - Product (apps, tools, physical goods)
 * - Service (consulting, agencies, freelance)
 * - Event (conferences, workshops, webinars)
 *
 * And enters the name of their product/service/event.
 */
import { inject, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext, ConceptType } from '../../../composables/useFormWizard';
import {
  CONCEPT_TYPE_CONFIG,
  CONCEPT_TYPES,
  WIZARD_VALIDATION,
} from '../../../constants/wizardConfig';
import ConceptTypeCard from '../components/ConceptTypeCard.vue';

const wizard = inject<FormWizardContext>('wizardContext')!;

const namePlaceholder = computed(() => {
  if (!wizard.conceptType.value) {
    return 'Enter a name...';
  }
  return CONCEPT_TYPE_CONFIG[wizard.conceptType.value].namePlaceholder;
});

const nameCharCount = computed(() => wizard.conceptName.value.length);
const isNameOverLimit = computed(
  () => nameCharCount.value > WIZARD_VALIDATION.conceptName.maxLength
);

function selectType(type: ConceptType) {
  wizard.conceptType.value = type;
}

function handleContinue() {
  if (wizard.canProceedToScreen2.value) {
    wizard.goNext();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && wizard.canProceedToScreen2.value) {
    handleContinue();
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-semibold text-gray-900">
        What are you collecting testimonials for?
      </h1>
      <p class="mt-2 text-gray-500">
        Select the type that best describes what you offer
      </p>
    </div>

    <!-- Concept Type Cards -->
    <div class="grid grid-cols-3 gap-4">
      <ConceptTypeCard
        v-for="type in CONCEPT_TYPES"
        :key="type"
        :type="type"
        :config="CONCEPT_TYPE_CONFIG[type]"
        :is-selected="wizard.conceptType.value === type"
        @select="selectType(type)"
      />
    </div>

    <!-- Name Input -->
    <div class="space-y-2">
      <label for="concept-name" class="block text-sm font-medium text-gray-700">
        Name
      </label>
      <input
        id="concept-name"
        v-model="wizard.conceptName.value"
        type="text"
        :placeholder="namePlaceholder"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/20': isNameOverLimit }"
        @keydown="handleKeydown"
      />
      <div class="flex justify-end">
        <span
          class="text-xs"
          :class="isNameOverLimit ? 'text-red-500' : 'text-gray-400'"
        >
          {{ nameCharCount }}/{{ WIZARD_VALIDATION.conceptName.maxLength }}
        </span>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="flex justify-end">
      <button
        type="button"
        :disabled="!wizard.canProceedToScreen2.value"
        class="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleContinue"
      >
        Continue
        <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
