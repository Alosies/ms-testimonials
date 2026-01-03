<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, type Component } from 'vue';
import { Sheet, SheetContent, SheetHeader, SheetTitle, Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import WelcomeStepEditor from './editors/WelcomeStepEditor.vue';
import QuestionStepEditor from './editors/QuestionStepEditor.vue';
import RatingStepEditor from './editors/RatingStepEditor.vue';
import ConsentStepEditor from './editors/ConsentStepEditor.vue';
import ContactInfoStepEditor from './editors/ContactInfoStepEditor.vue';
import RewardStepEditor from './editors/RewardStepEditor.vue';
import ThankYouStepEditor from './editors/ThankYouStepEditor.vue';
import type { TimelineEditorContext } from '../../composables/timeline';
import type { StepContent } from '../../models/stepContent';
import { getStepLabel, getStepIcon } from '../../functions';

const editor = inject<TimelineEditorContext>('timelineEditor')!;

const selectedStep = computed(() => editor.selectedStep.value);
const stepLabel = computed(() => selectedStep.value ? getStepLabel(selectedStep.value) : '');
const stepIcon = computed(() => selectedStep.value ? getStepIcon(selectedStep.value.stepType) : '');

const editorComponents: Record<string, Component> = {
  welcome: WelcomeStepEditor,
  question: QuestionStepEditor,
  rating: RatingStepEditor,
  consent: ConsentStepEditor,
  contact_info: ContactInfoStepEditor,
  reward: RewardStepEditor,
  thank_you: ThankYouStepEditor,
};

const currentEditor = computed(() => {
  if (!selectedStep.value) return null;
  return editorComponents[selectedStep.value.stepType];
});

function handleContentUpdate(content: StepContent) {
  if (editor.selectedIndex.value !== null) {
    editor.updateStepContent(editor.selectedIndex.value, content);
  }
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!editor.isEditorOpen.value) return;

  if (event.key === 'Escape') {
    editor.handleCloseEditor();
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowUp') {
    event.preventDefault();
    editor.handleNavigateEditor('prev');
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowDown') {
    event.preventDefault();
    editor.handleNavigateEditor('next');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Sheet :open="editor.isEditorOpen.value" @update:open="editor.handleCloseEditor">
    <SheetContent side="right" class="w-[400px] sm:w-[540px] overflow-y-auto">
      <SheetHeader class="border-b pb-4">
        <div class="flex items-center justify-between">
          <SheetTitle class="flex items-center gap-2">
            <Icon :icon="stepIcon" class="w-5 h-5" />
            <span>Edit {{ stepLabel }}</span>
          </SheetTitle>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              :disabled="!editor.canGoPrev.value"
              @click="editor.handleNavigateEditor('prev')"
            >
              <Icon icon="heroicons:chevron-up" class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="!editor.canGoNext.value"
              @click="editor.handleNavigateEditor('next')"
            >
              <Icon icon="heroicons:chevron-down" class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          Step {{ (editor.selectedIndex.value ?? 0) + 1 }} of {{ editor.steps.value.length }}
        </p>
      </SheetHeader>

      <div class="py-4">
        <component
          v-if="currentEditor && selectedStep"
          :is="currentEditor"
          :step="selectedStep"
          @update="handleContentUpdate"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
