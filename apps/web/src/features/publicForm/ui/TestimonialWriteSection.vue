<script setup lang="ts">
/**
 * Testimonial Write Section — multi-state UI for the testimonial write step.
 * Renders path selection, manual writing, AI generating, and AI review states.
 */
import { Icon } from '@testimonials/icons';
import type { FormStep } from '@/shared/stepCards';
import {
  TestimonialWriteStepCard,
  TestimonialPathSelector,
  TestimonialReviewStepCard,
  type TestimonialPath,
} from '@/shared/stepCards';
import type { TestimonialSuggestion, TestimonialMetadata } from '@/shared/api/ai';

defineProps<{
  step: FormStep;
  state: string;
  isGoogleAuthLoading: boolean;
  isAiAvailable: boolean;
  aiCreditsError: string | null;
  previousAnswers: { questionText: string; answer: string }[];
  generatedTestimonial: string | null;
  suggestions: TestimonialSuggestion[];
  metadata: TestimonialMetadata | null;
  regenerationsRemaining: number;
  isGenerating: boolean;
}>();

const testimonialResponse = defineModel<string>({ default: '' });

defineEmits<{
  selectPath: [path: TestimonialPath];
  googleAuth: [];
  accept: [testimonial: string];
  regenerate: [];
  applySuggestion: [suggestionId: string];
}>();
</script>

<template>
  <!-- Path Selection -->
  <TestimonialPathSelector
    v-if="state === 'path_selection'"
    :step="step"
    mode="preview"
    :is-google-auth-loading="isGoogleAuthLoading"
    :is-ai-available="isAiAvailable"
    @select="$emit('selectPath', $event)"
    @google-auth="$emit('googleAuth')"
  />

  <!-- Manual Path -->
  <div v-else-if="state === 'manual'">
    <div
      v-if="aiCreditsError"
      class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700"
      data-testid="ai-credits-error-notice"
    >
      <p>{{ aiCreditsError }}</p>
    </div>
    <TestimonialWriteStepCard
      v-model="testimonialResponse"
      :step="step"
      mode="preview"
      :previous-answers="previousAnswers"
    />
  </div>

  <!-- Generating State -->
  <div
    v-else-if="state === 'generating'"
    class="text-center py-12"
  >
    <Icon
      icon="svg-spinners:90-ring-with-bg"
      class="w-12 h-12 text-primary mx-auto mb-4"
    />
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      Crafting your testimonial...
    </h3>
    <p class="text-gray-600">
      Our AI is transforming your answers into a compelling story.
    </p>
  </div>

  <!-- Review State -->
  <TestimonialReviewStepCard
    v-else-if="state === 'review'"
    :step="step"
    mode="preview"
    :testimonial="generatedTestimonial || ''"
    :suggestions="suggestions"
    :metadata="metadata || undefined"
    :regenerations-remaining="regenerationsRemaining"
    :is-regenerating="isGenerating"
    @accept="$emit('accept', $event)"
    @regenerate="$emit('regenerate')"
    @apply-suggestion="$emit('applySuggestion', $event)"
  />
</template>
