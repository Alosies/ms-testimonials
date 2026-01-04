<script setup lang="ts">
/**
 * Step Editor Slide-in Panel
 *
 * Allows editing individual step content. Emits navigate events
 * for parent to handle with scroll-snap navigation.
 *
 * @see FormEditPage.vue - Handles navigate events
 */
import { computed, onMounted, onUnmounted, toRef, type Component } from 'vue';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import WelcomeStepEditor from './editors/WelcomeStepEditor.vue';
import QuestionStepEditor from './editors/QuestionStepEditor.vue';
import RatingStepEditor from './editors/RatingStepEditor.vue';
import ConsentStepEditor from './editors/ConsentStepEditor.vue';
import ContactInfoStepEditor from './editors/ContactInfoStepEditor.vue';
import RewardStepEditor from './editors/RewardStepEditor.vue';
import ThankYouStepEditor from './editors/ThankYouStepEditor.vue';
import { useTimelineEditor, useStepSave } from '../../composables/timeline';
import { SaveStatusPill, useSaveStatus } from '@/shared/widgets';
import type { StepContent, StepType, LinkedQuestion } from '@/shared/stepCards';
import { getStepLabel } from '../../functions';
import { STEP_TYPE_OPTIONS, STEP_TYPE_CONFIGS } from '../../constants';

const emit = defineEmits<{
  /** Emitted when navigating to a different step - parent should scroll to this index */
  navigate: [index: number];
}>();

// Direct import - fully typed, no inject needed
const editor = useTimelineEditor();
const stepSave = useStepSave();

const selectedStep = computed(() => editor.selectedStep.value);
const stepLabel = computed(() => selectedStep.value ? getStepLabel(selectedStep.value) : '');
const stepConfig = computed(() => selectedStep.value ? STEP_TYPE_CONFIGS[selectedStep.value.stepType] : null);

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

// Determine if the current step needs a wider panel (question/rating steps)
const needsWiderPanel = computed(() => {
  const stepType = selectedStep.value?.stepType;
  return stepType === 'question' || stepType === 'rating';
});

// Check if current step has unsaved changes
const isCurrentStepDirty = computed(() => {
  if (!selectedStep.value) return false;
  return selectedStep.value.isModified ?? false;
});

// Use the save status composable for state transitions
const { status: saveStatus } = useSaveStatus({
  isDirty: isCurrentStepDirty,
  isSaving: toRef(() => stepSave.isSaving.value),
});

// Handle save
async function handleSave() {
  await stepSave.saveCurrentStep();
}

function handleContentUpdate(content: StepContent) {
  if (editor.selectedIndex.value !== null) {
    editor.updateStepContent(editor.selectedIndex.value, content);
  }
}

function handleQuestionUpdate(questionUpdates: Partial<LinkedQuestion>) {
  if (editor.selectedIndex.value !== null) {
    editor.updateStepQuestion(editor.selectedIndex.value, questionUpdates);
  }
}

function handleStepTypeChange(newType: StepType) {
  if (editor.selectedIndex.value !== null) {
    editor.changeStepType(editor.selectedIndex.value, newType);
  }
}

/**
 * Navigate to previous or next step.
 * Emits navigate event for parent to handle with scroll-snap.
 */
function navigateToStep(direction: 'prev' | 'next') {
  const currentIndex = editor.selectedIndex.value;
  if (direction === 'prev' && editor.canGoPrev.value) {
    emit('navigate', currentIndex - 1);
  } else if (direction === 'next' && editor.canGoNext.value) {
    emit('navigate', currentIndex + 1);
  }
}

// Keyboard navigation and shortcuts
function handleKeydown(event: KeyboardEvent) {
  if (!editor.isEditorOpen.value) return;

  if (event.key === 'Escape') {
    editor.handleCloseEditor();
  }
  // Cmd/Ctrl + S to save
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault();
    if (saveStatus.value === 'unsaved') {
      handleSave();
    }
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowUp') {
    event.preventDefault();
    navigateToStep('prev');
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowDown') {
    event.preventDefault();
    navigateToStep('next');
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
    <SheetContent
      side="right"
      :class="`overflow-y-auto transition-all duration-200 ${needsWiderPanel ? 'w-[500px] sm:w-[640px]' : 'w-[400px] sm:w-[540px]'}`"
    >
      <SheetHeader class="border-b pb-4">
        <div class="flex items-center justify-between">
          <SheetTitle class="flex items-center gap-2">
            <Icon v-if="stepConfig" :icon="stepConfig.icon" class="w-5 h-5" />
            <span>Edit {{ stepLabel }}</span>
          </SheetTitle>
          <div class="flex items-center gap-2">
            <!-- Save status pill -->
            <SaveStatusPill
              :status="saveStatus"
              @save="handleSave"
            />

            <!-- Divider when status is visible -->
            <div
              v-if="saveStatus !== 'idle'"
              class="h-6 w-px bg-gray-200"
            />

            <!-- Navigation buttons -->
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!editor.canGoPrev.value"
                @click="navigateToStep('prev')"
              >
                <Icon icon="heroicons:chevron-up" class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!editor.canGoNext.value"
                @click="navigateToStep('next')"
              >
                <Icon icon="heroicons:chevron-down" class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          Step {{ (editor.selectedIndex.value ?? 0) + 1 }} of {{ editor.steps.value.length }}
        </p>
      </SheetHeader>

      <div class="py-4 space-y-6">
        <!-- Step Type Selector -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">Step Type</Label>
          <Select
            :model-value="selectedStep?.stepType"
            @update:model-value="handleStepTypeChange($event as StepType)"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select step type">
                <div v-if="stepConfig" class="flex items-center gap-2">
                  <Icon :icon="stepConfig.icon" class="h-4 w-4" />
                  <span>{{ stepConfig.label }}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in STEP_TYPE_OPTIONS"
                :key="option.type"
                :value="option.type"
                class="cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <Icon :icon="option.icon" class="h-4 w-4" />
                  <div>
                    <div class="font-medium">{{ option.label }}</div>
                    <div class="text-xs text-muted-foreground">{{ option.description }}</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Step Content Editor -->
        <component
          v-if="currentEditor && selectedStep"
          :is="currentEditor"
          :step="selectedStep"
          @update="handleContentUpdate"
          @update:question="handleQuestionUpdate"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
