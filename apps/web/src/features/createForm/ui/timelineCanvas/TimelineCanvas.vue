<script setup lang="ts">
import { ref, watch } from 'vue';
import TimelineConnector from './TimelineConnector.vue';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';
import { useTimelineEditor } from '../../composables/timeline';
import type { StepType, FormStep } from '@/shared/stepCards';
import {
  StepCardContainer,
  WelcomeStepCard,
  QuestionStepCard,
  RatingStepCard,
  ConsentStepCard,
  ContactInfoStepCard,
  RewardStepCard,
  ThankYouStepCard,
} from '@/shared/stepCards';

// Direct import - fully typed, no inject needed
const editor = useTimelineEditor();

const scrollContainer = ref<HTMLElement | null>(null);
const pickerOpen = ref(false);
const insertAfterIndex = ref<number | null>(null);

function handleInsert(afterIndex: number) {
  insertAfterIndex.value = afterIndex;
  pickerOpen.value = true;
}

function handleSelectType(type: StepType) {
  editor.handleAddStep(type, insertAfterIndex.value ?? undefined);
  pickerOpen.value = false;
}

function handleReorder(index: number, direction: 'up' | 'down') {
  const toIndex = direction === 'up' ? index - 1 : index + 1;
  if (toIndex >= 0 && toIndex < editor.steps.value.length) {
    editor.moveStep(index, toIndex);
  }
}

// Scroll to selected step when it changes
watch(() => editor.selectedIndex.value, (index) => {
  const element = scrollContainer.value?.querySelector(`[data-step-index="${index}"]`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const stepCardComponents: Record<string, unknown> = {
  welcome: WelcomeStepCard,
  question: QuestionStepCard,
  rating: RatingStepCard,
  consent: ConsentStepCard,
  contact_info: ContactInfoStepCard,
  reward: RewardStepCard,
  thank_you: ThankYouStepCard,
};
</script>

<template>
  <div ref="scrollContainer" class="h-full overflow-y-auto py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <template v-for="(step, index) in editor.steps.value" :key="step.id">
        <!-- Step Card -->
        <div :data-step-index="index">
          <StepCardContainer
            mode="edit"
            :is-selected="index === editor.selectedIndex.value"
            :step-type="step.stepType"
            @select="editor.selectStep(index)"
            @edit="editor.handleEditStep(index)"
            @delete="editor.handleRemoveStep(index)"
            @reorder="handleReorder(index, $event)"
          >
            <component
              :is="stepCardComponents[step.stepType]"
              :step="step as FormStep"
              mode="edit"
            />
          </StepCardContainer>
        </div>

        <!-- Connector between steps -->
        <StepTypePicker
          v-if="index < editor.steps.value.length - 1"
          v-model:open="pickerOpen"
          @select="handleSelectType"
        >
          <TimelineConnector
            :after-index="index"
            @insert="handleInsert(index)"
          />
        </StepTypePicker>
      </template>

      <!-- Empty state -->
      <div v-if="editor.steps.value.length === 0" class="text-center py-12">
        <p class="text-muted-foreground mb-4">No steps yet. Add your first step!</p>
      </div>
    </div>
  </div>
</template>
