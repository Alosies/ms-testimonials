<script setup lang="ts">
import { computed } from 'vue';
import { Button, Input, Textarea, Label } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import FormSectionHeader from '../FormSectionHeader.vue';
import type { FormData } from '../../models';
import type { SectionStatus } from '../FormSectionHeader.vue';

/**
 * Input limits - must match backend validation
 * @see api/src/shared/utils/inputSanitizer.ts
 */
const INPUT_LIMITS = {
  product_name: 100,
  product_description: 1000,
  focus_areas: 500,
} as const;

const props = defineProps<{
  expanded: boolean;
  canGenerate: boolean;
  isGenerating: boolean;
  hasQuestions: boolean;
}>();

const emit = defineEmits<{
  'update:expanded': [value: boolean];
  generate: [];
}>();

const formData = defineModel<FormData>('formData', { required: true });

// Character counts for validation feedback
const nameCharCount = computed(() => formData.value.product_name.length);
const descCharCount = computed(() => formData.value.product_description.length);
const focusCharCount = computed(() => (formData.value.focus_areas || '').length);

// Validation states
const isNameOverLimit = computed(() => nameCharCount.value > INPUT_LIMITS.product_name);
const isDescOverLimit = computed(() => descCharCount.value > INPUT_LIMITS.product_description);
const isFocusOverLimit = computed(() => focusCharCount.value > INPUT_LIMITS.focus_areas);

// Section status
const sectionStatus = computed<SectionStatus>(() => {
  if (props.hasQuestions) return 'complete';
  if (props.canGenerate) return 'complete';
  return 'incomplete';
});

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

function isSuggestionSelected(suggestion: string): boolean {
  const currentFocus = formData.value.focus_areas || '';
  return currentFocus.toLowerCase().includes(suggestion.toLowerCase());
}

function toggleSuggestion(suggestion: string) {
  const currentFocus = formData.value.focus_areas || '';
  const suggestionLower = suggestion.toLowerCase();

  if (isSuggestionSelected(suggestion)) {
    const parts = currentFocus
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.toLowerCase() !== suggestionLower);
    formData.value.focus_areas = parts.join(', ');
  } else {
    formData.value.focus_areas = currentFocus
      ? `${currentFocus}, ${suggestionLower}`
      : suggestionLower;
  }
}

function handleToggle() {
  emit('update:expanded', !props.expanded);
}

function handleGenerate() {
  if (props.canGenerate && !props.isGenerating) {
    emit('generate');
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <FormSectionHeader
      title="Product Info"
      subtitle="Tell us about your product"
      icon="lucide:package"
      :expanded="expanded"
      :status="sectionStatus"
      @toggle="handleToggle"
    />

    <div
      v-show="expanded"
      class="border-t border-gray-100 px-4 py-5"
    >
      <div class="space-y-4">
        <div>
          <Label for="product-name">Product Name</Label>
          <Input
            id="product-name"
            v-model="formData.product_name"
            placeholder="e.g., TaskFlow"
            :maxlength="INPUT_LIMITS.product_name"
            class="mt-1"
            :class="{ 'border-red-500 focus:ring-red-500': isNameOverLimit }"
          />
          <p
            class="mt-1 text-xs"
            :class="isNameOverLimit ? 'text-red-500' : 'text-gray-400'"
          >
            {{ nameCharCount }}/{{ INPUT_LIMITS.product_name }} characters
          </p>
        </div>

        <div>
          <Label for="product-description">Brief Description</Label>
          <Textarea
            id="product-description"
            v-model="formData.product_description"
            placeholder="e.g., Project management tool for remote teams that helps track tasks, collaborate in real-time, and meet deadlines."
            :rows="4"
            :maxlength="INPUT_LIMITS.product_description"
            class="mt-1"
            :class="{ 'border-red-500 focus:ring-red-500': isDescOverLimit }"
          />
          <p
            class="mt-1 text-xs"
            :class="isDescOverLimit ? 'text-red-500' : 'text-gray-400'"
          >
            {{ descCharCount }}/{{ INPUT_LIMITS.product_description }} characters
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
            Guide the AI to focus on specific aspects of your product.
          </p>

          <!-- Clickable suggestions -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="suggestion in focusSuggestions"
              :key="suggestion"
              type="button"
              class="flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors"
              :class="
                isSuggestionSelected(suggestion)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-primary hover:bg-primary/5 hover:text-primary'
              "
              @click="toggleSuggestion(suggestion)"
            >
              <Icon
                :icon="
                  isSuggestionSelected(suggestion)
                    ? 'lucide:check'
                    : 'lucide:plus'
                "
                class="h-3 w-3"
              />
              {{ suggestion }}
            </button>
          </div>

          <Textarea
            id="focus-areas"
            v-model="formData.focus_areas"
            placeholder="e.g., ease of onboarding, time saved, specific features..."
            :rows="2"
            :maxlength="INPUT_LIMITS.focus_areas"
            class="mt-3"
            :class="{ 'border-red-500 focus:ring-red-500': isFocusOverLimit }"
          />
          <p
            class="mt-1 text-xs"
            :class="isFocusOverLimit ? 'text-red-500' : 'text-gray-400'"
          >
            {{ focusCharCount }}/{{ INPUT_LIMITS.focus_areas }} characters
          </p>
        </div>

        <div class="flex justify-end pt-2">
          <Button
            :disabled="!canGenerate || isGenerating"
            @click="handleGenerate"
          >
            <Icon
              v-if="isGenerating"
              icon="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            <Icon v-else icon="lucide:sparkles" class="mr-2 h-4 w-4" />
            {{ isGenerating ? 'Generating...' : 'Generate Questions' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
