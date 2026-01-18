<script setup lang="ts">
import { computed } from 'vue';
import {
  Input,
  Textarea,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  useToast,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep, LinkedQuestion } from '@/shared/stepCards';
import { FLOW_METADATA } from '@/entities/form';
import { studioTestIds } from '@/shared/constants/testIds';
import { useDisableBranchingModal } from '@/shared/widgets';
import { useTimelineEditor } from '../../../composables/timeline';
import { useQuestionSettings, useSaveLock } from '../../../composables';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:question', question: Partial<LinkedQuestion>): void;
}>();

const editor = useTimelineEditor();
const { showDisableBranchingModal } = useDisableBranchingModal();

// ADR-011: Immediate save for discrete question settings
const { setRequired, setValidation } = useQuestionSettings();
const { isLocked } = useSaveLock();
const { toast } = useToast();

// Get current question data
const question = computed(() => props.step.question);

// Update a field on the question
function updateField<K extends keyof LinkedQuestion>(field: K, value: LinkedQuestion[K]) {
  if (!question.value) return;
  emit('update:question', { [field]: value });
}

/**
 * ADR-011: Handle required toggle with immediate persistence.
 */
async function handleRequiredChange(value: boolean) {
  if (!question.value?.id) return;

  // Update local state immediately for responsive UI
  emit('update:question', { isRequired: value });

  // Persist to database
  try {
    await setRequired(question.value.id, value);
  } catch (error) {
    // Revert local state on failure
    emit('update:question', { isRequired: !value });
    toast({ title: 'Failed to update required setting', variant: 'destructive' });
    console.error('[RatingStepEditor] Failed to set required:', error);
  }
}

/**
 * ADR-011: Handle scale value changes with immediate persistence.
 */
async function handleScaleValueChange(field: 'minValue' | 'maxValue', value: number) {
  if (!question.value?.id) return;

  const previousValue = question.value[field];

  // Update local state immediately for responsive UI
  emit('update:question', { [field]: value });

  // Persist to database
  try {
    const validation = field === 'minValue'
      ? { min_value: value }
      : { max_value: value };
    await setValidation(question.value.id, validation);
  } catch (error) {
    // Revert local state on failure
    emit('update:question', { [field]: previousValue });
    toast({ title: 'Failed to update scale settings', variant: 'destructive' });
    console.error('[RatingStepEditor] Failed to set scale value:', error);
  }
}

// Branching state
const isBranchingEnabled = computed(() => editor.isBranchingEnabled.value);
const isThisStepBranchPoint = computed(() =>
  editor.branchingConfig.value.ratingStepId === props.step.id,
);
const threshold = computed(() => editor.branchingConfig.value.threshold);

function handleBranchingToggle(enabled: boolean) {
  if (enabled) {
    editor.enableBranching(props.step.id, 4);
  } else {
    // Check if there are any branched steps
    const testimonialCount = editor.testimonialSteps.value.length;
    const improvementCount = editor.improvementSteps.value.length;

    if (testimonialCount === 0 && improvementCount === 0) {
      // No branched steps, disable directly
      editor.disableBranching();
      return;
    }

    // Show confirmation modal
    showDisableBranchingModal({
      context: {
        testimonialStepCount: testimonialCount,
        improvementStepCount: improvementCount,
      },
      // ADR-011: Use async persistence methods for immediate save
      onChoice: async (choice) => {
        switch (choice) {
          case 'keep-testimonial':
            await editor.disableBranchingKeepTestimonialWithPersist();
            break;
          case 'keep-improvement':
            await editor.disableBranchingKeepImprovementWithPersist();
            break;
          case 'delete-all':
            await editor.disableBranchingDeleteAllWithPersist();
            break;
          case 'cancel':
            // Do nothing
            break;
        }
      },
    });
  }
}

function handleThresholdChange(value: unknown) {
  if (typeof value === 'string') {
    editor.setBranchingThreshold(parseInt(value, 10));
  }
}
</script>

<template>
  <div v-if="question" class="space-y-6">
    <!-- Question Text -->
    <div>
      <Label class="text-sm font-medium">Rating Question</Label>
      <Textarea
        :model-value="question.questionText"
        :data-testid="studioTestIds.ratingQuestionInput"
        class="mt-1.5"
        rows="2"
        placeholder="How would you rate your experience?"
        @update:model-value="(v) => updateField('questionText', String(v))"
      />
    </div>

    <!-- Scale Settings -->
    <div class="space-y-4 rounded-lg border bg-gray-50 p-4">
      <div class="flex items-center gap-2">
        <Icon icon="lucide:star" class="h-4 w-4 text-gray-500" />
        <Label class="text-sm font-medium">Rating Scale</Label>
      </div>

      <!-- Scale Range -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="text-xs text-gray-500">Start Value</Label>
          <Select
            :model-value="String(question.minValue ?? 1)"
            :disabled="isLocked"
            @update:model-value="(v) => handleScaleValueChange('minValue', Number(v))"
          >
            <SelectTrigger class="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-xs text-gray-500">End Value</Label>
          <Select
            :model-value="String(question.maxValue ?? 5)"
            :disabled="isLocked"
            @update:model-value="(v) => handleScaleValueChange('maxValue', Number(v))"
          >
            <SelectTrigger class="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Scale Labels -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="text-xs text-gray-500">Low Label</Label>
          <Input
            :model-value="question.scaleMinLabel ?? ''"
            :data-testid="studioTestIds.ratingLowLabelInput"
            class="mt-1"
            placeholder="Poor"
            @update:model-value="(v) => updateField('scaleMinLabel', String(v) || null)"
          />
        </div>
        <div>
          <Label class="text-xs text-gray-500">High Label</Label>
          <Input
            :model-value="question.scaleMaxLabel ?? ''"
            :data-testid="studioTestIds.ratingHighLabelInput"
            class="mt-1"
            placeholder="Excellent"
            @update:model-value="(v) => updateField('scaleMaxLabel', String(v) || null)"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500">
        Labels help respondents understand what each end of the scale means
      </p>
    </div>

    <!-- Required Toggle -->
    <div class="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
      <div>
        <Label class="text-sm font-medium">Required</Label>
        <p class="text-xs text-gray-500">Respondent must provide a rating</p>
      </div>
      <Switch
        :model-value="question.isRequired"
        :data-testid="studioTestIds.ratingRequiredSwitch"
        :disabled="isLocked"
        @update:model-value="handleRequiredChange"
      />
    </div>

    <Separator class="my-4" />

    <!-- Help Text -->
    <div>
      <Label class="text-sm font-medium">Help Text</Label>
      <Input
        :model-value="question.helpText ?? ''"
        :data-testid="studioTestIds.ratingHelpTextInput"
        class="mt-1.5"
        placeholder="Additional guidance for respondents..."
        @update:model-value="(v) => updateField('helpText', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Shown below the rating to provide context</p>
    </div>

    <Separator class="my-4" />

    <!-- Conditional Branching Section -->
    <div>
      <div class="flex items-center justify-between">
        <div>
          <Label class="flex items-center gap-2">
            <Icon icon="mdi:source-branch" class="w-4 h-4 text-primary" />
            Conditional Branching
          </Label>
          <p class="text-xs text-muted-foreground">
            Route respondents to different paths based on their rating
          </p>
        </div>
        <Switch
          :model-value="isBranchingEnabled && isThisStepBranchPoint"
          :disabled="isLocked || (isBranchingEnabled && !isThisStepBranchPoint)"
          @update:model-value="handleBranchingToggle"
        />
      </div>

      <!-- Branching is enabled on different step warning -->
      <div
        v-if="isBranchingEnabled && !isThisStepBranchPoint"
        class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md"
      >
        <p class="text-sm text-amber-700">
          Branching is already enabled on another rating step.
          Disable it there first to use branching on this step.
        </p>
      </div>

      <!-- Branching configuration -->
      <div
        v-if="isBranchingEnabled && isThisStepBranchPoint"
        class="mt-4 space-y-4"
      >
        <div>
          <Label>Threshold Rating</Label>
          <p class="text-xs text-muted-foreground mb-3">
            Ratings at or above this value go to the testimonial flow
          </p>
          <Select
            :model-value="String(threshold)"
            :disabled="isLocked"
            @update:model-value="handleThresholdChange"
          >
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="String(threshold)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 (lenient)</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4 (default)</SelectItem>
              <SelectItem value="5">5 (strict)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Flow preview -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div class="p-3 rounded-lg" :class="[FLOW_METADATA.testimonial.bgClass, FLOW_METADATA.testimonial.borderClass]" style="border-width: 1px;">
            <div class="flex items-center gap-2 mb-1">
              <Icon :icon="FLOW_METADATA.testimonial.icon" class="w-4 h-4" :class="FLOW_METADATA.testimonial.colorClass" />
              <span class="font-medium text-sm" :class="FLOW_METADATA.testimonial.colorClass">
                Testimonial
              </span>
            </div>
            <p class="text-xs text-muted-foreground">
              Rating {{ threshold }}+
            </p>
          </div>

          <div class="p-3 rounded-lg" :class="[FLOW_METADATA.improvement.bgClass, FLOW_METADATA.improvement.borderClass]" style="border-width: 1px;">
            <div class="flex items-center gap-2 mb-1">
              <Icon :icon="FLOW_METADATA.improvement.icon" class="w-4 h-4" :class="FLOW_METADATA.improvement.colorClass" />
              <span class="font-medium text-sm" :class="FLOW_METADATA.improvement.colorClass">
                Improvement
              </span>
            </div>
            <p class="text-xs text-muted-foreground">
              Rating {{ threshold - 1 }} or below
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty state when no question is linked -->
  <div v-else class="space-y-4">
    <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <Icon icon="heroicons:star" class="mx-auto h-12 w-12 text-gray-300" />
      <h3 class="mt-4 text-sm font-medium text-gray-900">No rating question linked</h3>
      <p class="mt-2 text-sm text-gray-500">
        This step doesn't have a rating question associated with it yet.
      </p>
    </div>
  </div>
</template>
