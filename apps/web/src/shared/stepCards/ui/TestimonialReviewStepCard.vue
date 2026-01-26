<script setup lang="ts">
/**
 * Testimonial Review Step Card - AI Path
 *
 * Displays the AI-generated testimonial for customer review.
 * Allows editing, applying suggestions, and regenerating.
 *
 * @see PRD-005: AI Testimonial Generation
 */
import { ref, computed, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import type { FormStep, TestimonialWriteContent, StepCardMode } from '../models';
import type { TestimonialSuggestion, TestimonialMetadata } from '@/shared/api/ai';
import { isTestimonialWriteStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  /** Generated testimonial text */
  testimonial: string;
  /** AI suggestions for modifications */
  suggestions?: TestimonialSuggestion[];
  /** Testimonial metadata */
  metadata?: TestimonialMetadata;
  /** Number of regenerations remaining */
  regenerationsRemaining?: number;
  /** Whether a regeneration is in progress */
  isRegenerating?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  suggestions: () => [],
  regenerationsRemaining: 3,
  isRegenerating: false,
});

const emit = defineEmits<{
  (e: 'accept', testimonial: string): void;
  (e: 'regenerate'): void;
  (e: 'applySuggestion', suggestionId: string): void;
}>();

const content = computed((): TestimonialWriteContent | null => {
  if (isTestimonialWriteStep(props.step)) {
    return props.step.content;
  }
  return null;
});

// Editing state
const isEditing = ref(false);
const editedTestimonial = ref(props.testimonial);

// Sync editedTestimonial when testimonial prop changes
watch(
  () => props.testimonial,
  (newVal) => {
    if (!isEditing.value) {
      editedTestimonial.value = newVal;
    }
  }
);

// Current testimonial (edited or original)
const currentTestimonial = computed(() =>
  isEditing.value ? editedTestimonial.value : props.testimonial
);

// Character count for editing
const characterCount = computed(() => currentTestimonial.value.length);
const maxLength = computed(() => content.value?.maxLength ?? 1000);
const isOverMax = computed(() => characterCount.value > maxLength.value);

function startEditing() {
  editedTestimonial.value = props.testimonial;
  isEditing.value = true;
}

function cancelEditing() {
  editedTestimonial.value = props.testimonial;
  isEditing.value = false;
}

function handleAccept() {
  emit('accept', currentTestimonial.value);
}

function handleRegenerate() {
  emit('regenerate');
}

function handleApplySuggestion(suggestionId: string) {
  emit('applySuggestion', suggestionId);
}

// Top suggestions (limit to 4)
const topSuggestions = computed(() =>
  props.suggestions?.slice(0, 4) ?? []
);
</script>

<template>
  <div v-if="content" class="w-full max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
        Review your testimonial
      </h3>
      <p class="text-gray-600">
        Here's what we crafted from your responses. Feel free to edit before accepting.
      </p>
    </div>

    <!-- Testimonial display/edit area -->
    <div class="relative">
      <!-- View mode -->
      <div
        v-if="!isEditing"
        class="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <!-- AI sparkle indicator -->
        <div class="absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
          <Icon icon="heroicons:sparkles" class="w-4 h-4 text-primary" />
          <span class="text-xs font-medium text-primary">AI Generated</span>
        </div>

        <!-- Testimonial text -->
        <blockquote class="text-lg text-gray-800 leading-relaxed mt-2">
          "{{ testimonial }}"
        </blockquote>

        <!-- Metadata badges -->
        <div
          v-if="metadata"
          class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"
        >
          <span class="px-2 py-1 bg-gray-100 rounded">
            {{ metadata.word_count }} words
          </span>
          <span class="px-2 py-1 bg-gray-100 rounded">
            {{ metadata.reading_time_seconds }}s read
          </span>
          <span
            v-for="theme in metadata.key_themes.slice(0, 3)"
            :key="theme"
            class="px-2 py-1 bg-primary/10 text-primary rounded"
          >
            {{ theme }}
          </span>
        </div>

        <!-- Edit button -->
        <button
          type="button"
          class="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Edit testimonial"
          @click="startEditing"
        >
          <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
        </button>
      </div>

      <!-- Edit mode -->
      <div v-else class="p-4 bg-white border border-primary rounded-xl shadow-sm">
        <textarea
          v-model="editedTestimonial"
          :maxlength="maxLength + 50"
          class="w-full min-h-[150px] p-2 text-base border-0 focus:ring-0 resize-y"
          :class="{
            'text-red-500': isOverMax,
          }"
          placeholder="Write your testimonial..."
        />

        <!-- Character count -->
        <div class="flex justify-between items-center mt-2 text-sm">
          <span :class="isOverMax ? 'text-red-500' : 'text-muted-foreground'">
            {{ characterCount }} / {{ maxLength }}
          </span>
          <div class="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              @click="cancelEditing"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              @click="isEditing = false"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggestion chips -->
    <div
      v-if="topSuggestions.length > 0 && !isEditing"
      class="mt-4"
    >
      <div class="text-sm text-muted-foreground mb-2">Try a variation:</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in topSuggestions"
          :key="suggestion.id"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          :title="suggestion.description"
          :disabled="isRegenerating"
          @click="handleApplySuggestion(suggestion.id)"
        >
          <Icon icon="heroicons:sparkles" class="w-3.5 h-3.5 text-primary" />
          {{ suggestion.label }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
      <!-- Regenerate button -->
      <Button
        v-if="regenerationsRemaining > 0"
        variant="outline"
        :disabled="isRegenerating || isEditing"
        @click="handleRegenerate"
      >
        <Icon
          :icon="isRegenerating ? 'svg-spinners:90-ring-with-bg' : 'heroicons:arrow-path'"
          class="w-4 h-4 mr-2"
        />
        {{ isRegenerating ? 'Regenerating...' : 'Regenerate' }}
        <span class="ml-1 text-xs text-muted-foreground">
          ({{ regenerationsRemaining }} left)
        </span>
      </Button>

      <!-- Accept button -->
      <Button
        :disabled="isOverMax || isEditing"
        @click="handleAccept"
      >
        <Icon icon="heroicons:check" class="w-4 h-4 mr-2" />
        Accept Testimonial
      </Button>
    </div>
  </div>
</template>
