<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import StepCard from './StepCard.vue';
import TimelineConnector from './TimelineConnector.vue';
import WelcomeStepCard from './stepCards/WelcomeStepCard.vue';
import QuestionStepCard from './stepCards/QuestionStepCard.vue';
import RatingStepCard from './stepCards/RatingStepCard.vue';
import ConsentStepCard from './stepCards/ConsentStepCard.vue';
import ContactInfoStepCard from './stepCards/ContactInfoStepCard.vue';
import RewardStepCard from './stepCards/RewardStepCard.vue';
import ThankYouStepCard from './stepCards/ThankYouStepCard.vue';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';
import type { TimelineEditorContext } from '../../composables/timeline/useTimelineEditor';
import type { StepType, FormStep } from '../../models/stepContent';

const editor = inject<TimelineEditorContext>('timelineEditor')!;

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
          <StepCard
            :is-selected="index === editor.selectedIndex.value"
            :step-number="index + 1"
            :step-type="step.stepType"
            @select="editor.selectStep(index)"
            @edit="editor.handleEditStep(index)"
            @delete="editor.handleRemoveStep(index)"
            @reorder="handleReorder(index, $event)"
          >
            <component
              :is="stepCardComponents[step.stepType]"
              :step="step as FormStep"
            />
          </StepCard>
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
