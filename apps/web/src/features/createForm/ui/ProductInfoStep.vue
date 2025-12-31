<script setup lang="ts">
import { computed } from 'vue';
import { Button, Input, Textarea, Label } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormData } from '../models';

const props = defineProps<{
  canProceed: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  next: [];
}>();

const formData = defineModel<FormData>('formData', { required: true });

const characterCount = computed(() => formData.value.product_description.length);

// Focus areas helper suggestions
const focusSuggestions = [
  'Pain points solved',
  'Specific features',
  'Time/money saved',
  'Ease of use',
  'Customer support',
  'ROI & results',
  'Onboarding experience',
  'Team collaboration',
];

function addSuggestion(suggestion: string) {
  const currentFocus = formData.value.focus_areas || '';
  if (currentFocus.toLowerCase().includes(suggestion.toLowerCase())) {
    return; // Already included
  }
  formData.value.focus_areas = currentFocus
    ? `${currentFocus}, ${suggestion.toLowerCase()}`
    : suggestion.toLowerCase();
}

function handleContinue() {
  if (props.canProceed && !props.isLoading) {
    emit('next');
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">
        Tell us about your product
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        We'll use this to generate tailored questions for collecting testimonials.
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <Label for="product-name">Product Name</Label>
        <Input
          id="product-name"
          v-model="formData.product_name"
          placeholder="e.g., TaskFlow"
          class="mt-1"
        />
      </div>

      <div>
        <Label for="product-description">Brief Description</Label>
        <Textarea
          id="product-description"
          v-model="formData.product_description"
          placeholder="e.g., Project management tool for remote teams that helps track tasks, collaborate in real-time, and meet deadlines."
          :rows="4"
          class="mt-1"
        />
        <p class="mt-1 text-xs text-gray-400">
          {{ characterCount }}/1000 characters
        </p>
      </div>

      <!-- Focus Areas (Optional) -->
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div class="flex items-center gap-2">
          <Label for="focus-areas" class="text-gray-700">
            Focus Areas
          </Label>
          <span class="text-xs text-gray-400">(optional)</span>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Guide the AI to focus on specific aspects of your product when generating questions.
        </p>

        <!-- Clickable suggestions -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="suggestion in focusSuggestions"
            :key="suggestion"
            type="button"
            class="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            @click="addSuggestion(suggestion)"
          >
            + {{ suggestion }}
          </button>
        </div>

        <Textarea
          id="focus-areas"
          v-model="formData.focus_areas"
          placeholder="e.g., ease of onboarding, time saved on reporting, specific feature X, customer support quality..."
          :rows="2"
          class="mt-3"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <Button
        :disabled="!canProceed || isLoading"
        @click="handleContinue"
      >
        Generate Questions
        <Icon icon="lucide:arrow-right" class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
