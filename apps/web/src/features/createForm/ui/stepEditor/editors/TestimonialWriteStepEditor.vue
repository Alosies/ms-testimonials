<script setup lang="ts">
/**
 * Testimonial Write Step Editor
 *
 * Editor for configuring the testimonial write step, including:
 * - Enable/disable AI-assisted path
 * - Title and subtitle text
 * - Manual path settings (placeholder, min/max length)
 * - AI path labels
 *
 * Save patterns:
 * - Text fields: Debounced auto-save via useStepContentWatcher
 * - Toggle switches: Immediate save via useStepContentSettings
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-011: Immediate Save Actions
 */
import { computed } from 'vue';
import { Input, Textarea, Label, Switch, useToast } from '@testimonials/ui';
import type { FormStep, TestimonialWriteContent } from '@/shared/stepCards';
import { isTestimonialWriteStep } from '../../../functions';
import { useStepContentSettings, useSaveLock } from '../../../composables';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: TestimonialWriteContent): void;
}>();

// ADR-011: Immediate save for toggle switches
const { setTestimonialEnableAIPath, setTestimonialShowPreviousAnswers } = useStepContentSettings();
const { isLocked } = useSaveLock();
const { toast } = useToast();

const content = computed((): TestimonialWriteContent => {
  if (isTestimonialWriteStep(props.step)) {
    return props.step.content;
  }
  // Fallback defaults (should never be reached if step type is correct)
  return {
    enableAIPath: true,
    title: 'Share your testimonial',
    subtitle: 'Write your experience in your own words',
    placeholder: 'Describe how our product helped you...',
    minLength: 50,
    maxLength: 1000,
    showPreviousAnswers: true,
    previousAnswersLabel: 'Your responses for reference',
    aiPathTitle: 'Let AI craft your story',
    aiPathDescription:
      "We'll transform your answers into a testimonial. You review and edit before submit.",
    manualPathTitle: 'Write it yourself',
    manualPathDescription: 'Write your own testimonial in your words.',
  };
});

function update(updates: Partial<TestimonialWriteContent>) {
  emit('update', { ...content.value, ...updates });
}

function updateString(
  field: keyof Pick<TestimonialWriteContent, 'title' | 'subtitle' | 'placeholder' | 'previousAnswersLabel' | 'aiPathTitle' | 'aiPathDescription' | 'manualPathTitle' | 'manualPathDescription'>,
  value: string | number,
) {
  update({ [field]: String(value) });
}

function updateNumber(field: 'minLength' | 'maxLength', value: string | number) {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  if (!isNaN(numValue)) {
    update({ [field]: numValue });
  }
}

/**
 * ADR-011: Handle enableAIPath toggle with immediate persistence.
 */
async function handleEnableAIPathChange(value: boolean) {
  // Update local state immediately for responsive UI
  emit('update', { ...content.value, enableAIPath: value });

  // Persist to database
  try {
    await setTestimonialEnableAIPath(props.step.id, content.value, value);
  } catch (error) {
    // Revert local state on failure
    emit('update', { ...content.value, enableAIPath: !value });
    toast({ title: 'Failed to update AI path setting', variant: 'destructive' });
    console.error('[TestimonialWriteStepEditor] Failed to set enableAIPath:', error);
  }
}

/**
 * ADR-011: Handle showPreviousAnswers toggle with immediate persistence.
 */
async function handleShowPreviousAnswersChange(value: boolean) {
  // Update local state immediately for responsive UI
  emit('update', { ...content.value, showPreviousAnswers: value });

  // Persist to database
  try {
    await setTestimonialShowPreviousAnswers(props.step.id, content.value, value);
  } catch (error) {
    // Revert local state on failure
    emit('update', { ...content.value, showPreviousAnswers: !value });
    toast({ title: 'Failed to update previous answers setting', variant: 'destructive' });
    console.error('[TestimonialWriteStepEditor] Failed to set showPreviousAnswers:', error);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- AI Path Toggle - Featured at top -->
    <div class="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
      <div>
        <Label class="font-medium text-base">Enable AI-Assisted Path</Label>
        <p class="text-sm text-muted-foreground mt-1">
          Let customers generate testimonials using AI from their answers
        </p>
      </div>
      <Switch
        :data-testid="studioTestIds.testimonialWriteEnableAiPathSwitch"
        :model-value="content.enableAIPath"
        :disabled="isLocked"
        @update:model-value="handleEnableAIPathChange"
      />
    </div>

    <!-- Basic Settings -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Settings</h4>

      <div>
        <Label for="title">Title</Label>
        <Input
          id="title"
          :data-testid="studioTestIds.testimonialWriteTitleInput"
          :model-value="content.title"
          placeholder="Share your testimonial"
          @update:model-value="updateString('title', $event)"
        />
      </div>

      <div>
        <Label for="subtitle">Subtitle</Label>
        <Textarea
          id="subtitle"
          :data-testid="studioTestIds.testimonialWriteSubtitleInput"
          :model-value="content.subtitle"
          placeholder="Write your experience in your own words"
          :rows="2"
          @update:model-value="updateString('subtitle', $event)"
        />
      </div>
    </div>

    <!-- Manual Path Settings -->
    <div class="space-y-4 border-t pt-4">
      <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Manual Writing</h4>

      <div>
        <Label for="placeholder">Placeholder Text</Label>
        <Input
          id="placeholder"
          :data-testid="studioTestIds.testimonialWritePlaceholderInput"
          :model-value="content.placeholder"
          placeholder="Describe how our product helped you..."
          @update:model-value="updateString('placeholder', $event)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <Label for="minLength">Minimum Characters</Label>
          <Input
            id="minLength"
            :data-testid="studioTestIds.testimonialWriteMinLengthInput"
            type="number"
            :model-value="content.minLength"
            min="0"
            @update:model-value="updateNumber('minLength', $event)"
          />
        </div>
        <div>
          <Label for="maxLength">Maximum Characters</Label>
          <Input
            id="maxLength"
            :data-testid="studioTestIds.testimonialWriteMaxLengthInput"
            type="number"
            :model-value="content.maxLength"
            min="1"
            @update:model-value="updateNumber('maxLength', $event)"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <Label>Show Previous Answers</Label>
          <p class="text-xs text-muted-foreground">Display earlier responses for reference</p>
        </div>
        <Switch
          :data-testid="studioTestIds.testimonialWriteShowPrevAnswersSwitch"
          :model-value="content.showPreviousAnswers"
          :disabled="isLocked"
          @update:model-value="handleShowPreviousAnswersChange"
        />
      </div>

      <div v-if="content.showPreviousAnswers">
        <Label for="prevAnswersLabel">Previous Answers Label</Label>
        <Input
          id="prevAnswersLabel"
          :data-testid="studioTestIds.testimonialWritePrevAnswersLabelInput"
          :model-value="content.previousAnswersLabel"
          placeholder="Your responses for reference"
          @update:model-value="updateString('previousAnswersLabel', $event)"
        />
      </div>
    </div>

    <!-- AI Path Labels (only shown when AI path is enabled) -->
    <template v-if="content.enableAIPath">
      <div class="space-y-4 border-t pt-4">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Path Labels</h4>

        <div>
          <Label for="aiTitle">AI Option Title</Label>
          <Input
            id="aiTitle"
            :data-testid="studioTestIds.testimonialWriteAiTitleInput"
            :model-value="content.aiPathTitle"
            placeholder="Let AI craft your story"
            @update:model-value="updateString('aiPathTitle', $event)"
          />
        </div>

        <div>
          <Label for="aiDesc">AI Option Description</Label>
          <Textarea
            id="aiDesc"
            :data-testid="studioTestIds.testimonialWriteAiDescriptionInput"
            :model-value="content.aiPathDescription"
            placeholder="We'll transform your answers into a testimonial..."
            :rows="2"
            @update:model-value="updateString('aiPathDescription', $event)"
          />
        </div>
      </div>

      <div class="space-y-4 border-t pt-4">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Manual Path Labels</h4>

        <div>
          <Label for="manualTitle">Manual Option Title</Label>
          <Input
            id="manualTitle"
            :data-testid="studioTestIds.testimonialWriteManualTitleInput"
            :model-value="content.manualPathTitle"
            placeholder="Write it yourself"
            @update:model-value="updateString('manualPathTitle', $event)"
          />
        </div>

        <div>
          <Label for="manualDesc">Manual Option Description</Label>
          <Textarea
            id="manualDesc"
            :data-testid="studioTestIds.testimonialWriteManualDescriptionInput"
            :model-value="content.manualPathDescription"
            placeholder="Write your own testimonial in your words."
            :rows="2"
            @update:model-value="updateString('manualPathDescription', $event)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
