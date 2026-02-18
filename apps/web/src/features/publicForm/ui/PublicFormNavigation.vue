<script setup lang="ts">
/**
 * Public Form Navigation — back/next/submit buttons and step indicator dots.
 */
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { publicFormTestIds } from '@/shared/constants/testIds';
import type { FormStep } from '@/shared/stepCards';

defineProps<{
  showBack: boolean;
  showNext: boolean;
  showSubmit: boolean;
  isNextDisabled: boolean;
  visibleSteps: FormStep[];
  currentStepIndex: number;
}>();

defineEmits<{
  back: [];
  next: [];
  submit: [];
  goToStep: [index: number];
}>();
</script>

<template>
  <!-- Navigation buttons -->
  <div class="mt-8 flex justify-between items-center">
    <Button
      v-if="showBack"
      variant="outline"
      class="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
      :data-testid="publicFormTestIds.backButton"
      @click="$emit('back')"
    >
      <Icon icon="heroicons:arrow-left" class="w-4 h-4 mr-2" />
      Back
    </Button>
    <div v-else />

    <Button
      v-if="showSubmit"
      :disabled="isNextDisabled"
      :data-testid="publicFormTestIds.submitButton"
      @click="$emit('submit')"
    >
      Submit
      <Icon icon="heroicons:check" class="w-4 h-4 ml-2" />
    </Button>

    <Button
      v-else-if="showNext"
      :disabled="isNextDisabled"
      :data-testid="publicFormTestIds.continueButton"
      @click="$emit('next')"
    >
      Continue
      <Icon icon="heroicons:arrow-right" class="w-4 h-4 ml-2" />
    </Button>
  </div>

  <!-- Step indicator -->
  <div
    class="mt-6 flex justify-center gap-2"
    :data-testid="publicFormTestIds.stepIndicator"
  >
    <button
      v-for="(step, index) in visibleSteps"
      :key="step.id"
      class="w-2 h-2 rounded-full transition-colors"
      :class="{
        'bg-primary': index === currentStepIndex,
        'bg-gray-300': index !== currentStepIndex,
      }"
      :data-testid="publicFormTestIds.stepDot"
      :data-step-index="index"
      :data-active="index === currentStepIndex"
      @click="$emit('goToStep', index)"
    />
  </div>
</template>
