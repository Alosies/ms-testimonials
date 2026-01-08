<script setup lang="ts">
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useDisableBranchingModal } from '../composables';
import type { DisableBranchingChoice } from '../models';
import { FLOW_METADATA } from '@/shared/stepCards';

const {
  modalState,
  setSelectedChoice,
  handleConfirm,
  handleCancel,
  handleUpdateVisible,
} = useDisableBranchingModal();

const hasTestimonialSteps = computed(() => modalState.context.testimonialStepCount > 0);
const hasImprovementSteps = computed(() => modalState.context.improvementStepCount > 0);

interface RadioOption {
  value: DisableBranchingChoice;
  label: string;
  description: string;
  disabled: boolean;
  recommended?: boolean;
}

const radioOptions = computed<RadioOption[]>(() => [
  {
    value: 'keep-testimonial',
    label: 'Keep Testimonial Steps',
    description: 'Convert testimonial steps to shared, remove improvement steps',
    disabled: !hasTestimonialSteps.value,
    recommended: true,
  },
  {
    value: 'keep-improvement',
    label: 'Keep Improvement Steps',
    description: 'Convert improvement steps to shared, remove testimonial steps',
    disabled: !hasImprovementSteps.value,
  },
  {
    value: 'delete-all',
    label: 'Delete All Branch Steps',
    description: 'Remove all steps in both flows',
    disabled: false,
  },
]);

function selectOption(option: RadioOption) {
  if (option.disabled) return;
  setSelectedChoice(option.value);
}

function isSelected(value: DisableBranchingChoice) {
  return modalState.selectedChoice === value;
}
</script>

<template>
  <Dialog :open="modalState.visible" @update:open="handleUpdateVisible">
    <DialogContent class="z-[60] sm:max-w-md" overlay-class="z-[60]">
      <DialogHeader>
        <!-- Icon -->
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100"
        >
          <Icon icon="mdi:source-branch" class="h-6 w-6 text-amber-600" />
        </div>

        <DialogTitle class="text-center">Disable Branching</DialogTitle>
        <DialogDescription class="text-center">
          You have steps in both branching flows. Choose how to handle them.
        </DialogDescription>
      </DialogHeader>

      <!-- Flow counts summary -->
      <div class="mt-2 rounded-lg border bg-gray-50 p-3">
        <div class="flex items-center justify-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <Icon
              :icon="FLOW_METADATA.testimonial.icon"
              class="h-4 w-4"
              :class="FLOW_METADATA.testimonial.colorClass"
            />
            <span class="font-medium">Testimonial:</span>
            <span class="text-muted-foreground">
              {{ modalState.context.testimonialStepCount }} step{{
                modalState.context.testimonialStepCount !== 1 ? 's' : ''
              }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Icon
              :icon="FLOW_METADATA.improvement.icon"
              class="h-4 w-4"
              :class="FLOW_METADATA.improvement.colorClass"
            />
            <span class="font-medium">Improvement:</span>
            <span class="text-muted-foreground">
              {{ modalState.context.improvementStepCount }} step{{
                modalState.context.improvementStepCount !== 1 ? 's' : ''
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Radio options -->
      <div class="mt-4 space-y-2">
        <button
          v-for="option in radioOptions"
          :key="option.value"
          type="button"
          class="w-full rounded-lg border p-3 text-left transition-colors"
          :class="[
            isSelected(option.value)
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          ]"
          :disabled="option.disabled"
          @click="selectOption(option)"
        >
          <div class="flex items-start gap-3">
            <!-- Radio circle -->
            <div
              class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
              :class="
                isSelected(option.value)
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              "
            >
              <div
                v-if="isSelected(option.value)"
                class="h-1.5 w-1.5 rounded-full bg-white"
              />
            </div>

            <!-- Label and description -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ option.label }}</span>
                <span
                  v-if="option.recommended"
                  class="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
                >
                  Recommended
                </span>
              </div>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ option.description }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <DialogFooter class="mt-4 flex gap-3 sm:justify-center">
        <Button
          variant="outline"
          class="flex-1"
          :disabled="modalState.isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          class="flex-1 bg-amber-600 text-white hover:bg-amber-700"
          :disabled="modalState.isLoading || !modalState.selectedChoice"
          @click="handleConfirm"
        >
          <Icon
            v-if="modalState.isLoading"
            icon="lucide:loader-2"
            class="mr-1.5 h-4 w-4 animate-spin"
          />
          {{ modalState.isLoading ? 'Processing...' : 'Confirm' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
