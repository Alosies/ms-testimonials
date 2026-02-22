<script setup lang="ts">
/**
 * Consent Step Card — Allows customer to choose public or private consent.
 *
 * In preview mode (public form), radio buttons are interactive via v-model.
 * In edit mode (form studio), shows static preview.
 *
 * ADR-025: Phase 5b — Added v-model for consent selection.
 */
import { computed } from 'vue';
import type { FormStep, ConsentContent, StepCardMode } from '../models';
import { isConsentStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const modelValue = defineModel<string>({ default: 'public' });

const content = computed((): ConsentContent | null => {
  if (isConsentStep(props.step)) {
    return props.step.content;
  }
  return null;
});

function selectOption(option: 'public' | 'private') {
  modelValue.value = option;
}
</script>

<template>
  <div v-if="content" class="text-center w-full">
    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
      {{ content.title }}
    </h3>
    <p class="text-base text-gray-500 mb-8 max-w-lg mx-auto">
      {{ content.description }}
    </p>

    <div class="w-full max-w-md mx-auto space-y-3">
      <button
        type="button"
        class="w-full flex items-center gap-3 p-4 rounded-lg border cursor-pointer text-left transition-colors"
        :class="modelValue === 'public'
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:bg-gray-50'"
        @click="selectOption('public')"
      >
        <div
          class="w-4 h-4 rounded-full border-2 flex-shrink-0"
          :class="modelValue === 'public'
            ? 'border-primary bg-primary'
            : 'border-gray-300'"
        />
        <div>
          <div class="font-medium text-sm">
            {{ content.options.public.label }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ content.options.public.description }}
          </div>
        </div>
      </button>

      <button
        type="button"
        class="w-full flex items-center gap-3 p-4 rounded-lg border cursor-pointer text-left transition-colors"
        :class="modelValue === 'private'
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:bg-gray-50'"
        @click="selectOption('private')"
      >
        <div
          class="w-4 h-4 rounded-full border-2 flex-shrink-0"
          :class="modelValue === 'private'
            ? 'border-primary bg-primary'
            : 'border-gray-300'"
        />
        <div>
          <div class="font-medium text-sm">
            {{ content.options.private.label }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ content.options.private.description }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
