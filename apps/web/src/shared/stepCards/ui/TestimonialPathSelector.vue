<script setup lang="ts">
/**
 * Testimonial Path Selector
 *
 * Two-card layout for selecting between manual and AI-assisted testimonial writing.
 * AI path requires Google OAuth authentication for abuse prevention.
 *
 * @see PRD-005: AI Testimonial Generation
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, TestimonialWriteContent, StepCardMode } from '../models';
import { isTestimonialWriteStep } from '../functions';

export type TestimonialPath = 'manual' | 'ai';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  isGoogleAuthLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  isGoogleAuthLoading: false,
});

const emit = defineEmits<{
  (e: 'select', path: TestimonialPath): void;
  (e: 'googleAuth'): void;
}>();

const content = computed((): TestimonialWriteContent | null => {
  if (isTestimonialWriteStep(props.step)) {
    return props.step.content;
  }
  return null;
});

// Check if AI path is enabled
const isAIPathEnabled = computed(() => content.value?.enableAIPath ?? true);

function handleManualSelect() {
  emit('select', 'manual');
}

function handleAISelect() {
  emit('googleAuth');
}
</script>

<template>
  <div v-if="content" class="w-full max-w-3xl mx-auto">
    <!-- Title -->
    <div class="text-center mb-8">
      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
        {{ content.title }}
      </h3>
      <p class="text-gray-600">
        How would you like to create your testimonial?
      </p>
    </div>

    <!-- Path selection cards -->
    <div
      class="grid gap-4"
      :class="isAIPathEnabled ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'"
    >
      <!-- AI-Assisted Path Card (Recommended) -->
      <button
        v-if="isAIPathEnabled"
        type="button"
        class="relative flex flex-col items-start p-6 text-left bg-white border-2 border-primary/30 rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all group"
        :disabled="isGoogleAuthLoading"
        @click="handleAISelect"
      >
        <!-- Recommended badge -->
        <div class="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded">
          Recommended
        </div>

        <!-- Icon and title -->
        <div class="flex items-center gap-3 mb-3 mt-1">
          <div class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon icon="heroicons:sparkles" class="w-6 h-6 text-primary" />
          </div>
          <h4 class="text-lg font-semibold text-gray-900">
            {{ content.aiPathTitle }}
          </h4>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 mb-4">
          {{ content.aiPathDescription }}
        </p>

        <!-- Google sign-in note -->
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon icon="logos:google-icon" class="w-4 h-4" />
          <span>Requires Google sign-in</span>
        </div>

        <!-- Loading state -->
        <div
          v-if="isGoogleAuthLoading"
          class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"
        >
          <Icon icon="svg-spinners:90-ring-with-bg" class="w-6 h-6 text-primary" />
        </div>
      </button>

      <!-- Manual Path Card -->
      <button
        type="button"
        class="flex flex-col items-start p-6 text-left bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group"
        @click="handleManualSelect"
      >
        <!-- Icon and title -->
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
            <Icon icon="heroicons:pencil-square" class="w-6 h-6 text-gray-600" />
          </div>
          <h4 class="text-lg font-semibold text-gray-900">
            {{ content.manualPathTitle }}
          </h4>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600">
          {{ content.manualPathDescription }}
        </p>
      </button>
    </div>

    <!-- Preview mode note -->
    <div
      v-if="mode === 'edit'"
      class="mt-6 text-center text-sm text-muted-foreground"
    >
      <Icon icon="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
      Path selection is shown to customers in the live form
    </div>
  </div>
</template>
