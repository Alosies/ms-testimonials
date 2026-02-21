<script setup lang="ts">
/**
 * Testimonial Write Section — multi-state UI for the testimonial write step.
 * Renders path selection, manual writing, AI generating, and AI review states.
 */
import type { FormStep } from '@/shared/stepCards';
import {
  TestimonialWriteStepCard,
  TestimonialPathSelector,
  TestimonialReviewStepCard,
  AITestimonialAssemblyLoader,
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
  <AITestimonialAssemblyLoader v-else-if="state === 'generating'" />

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
