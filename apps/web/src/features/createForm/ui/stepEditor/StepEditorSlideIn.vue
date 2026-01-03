<script setup lang="ts">
import { computed, onMounted, onUnmounted, type Component } from 'vue';
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
import { useTimelineEditor } from '../../composables/timeline';
import type { StepContent, StepType } from '../../models/stepContent';
import { getStepLabel, getStepIcon } from '../../functions';

interface StepTypeOption {
  type: StepType;
  label: string;
  description: string;
}

const stepTypeOptions: StepTypeOption[] = [
  { type: 'welcome', label: 'Welcome', description: 'Introduce your form' },
  { type: 'question', label: 'Question', description: 'Text or video response' },
  { type: 'rating', label: 'Rating', description: 'Star or scale rating' },
  { type: 'consent', label: 'Consent', description: 'Public/private choice' },
  { type: 'contact_info', label: 'Contact Info', description: 'Name, email, company' },
  { type: 'reward', label: 'Reward', description: 'Coupon or download' },
  { type: 'thank_you', label: 'Thank You', description: 'Confirmation message' },
];

// Direct import - fully typed, no inject needed
const editor = useTimelineEditor();

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

function handleStepTypeChange(newType: StepType) {
  if (editor.selectedIndex.value !== null) {
    editor.changeStepType(editor.selectedIndex.value, newType);
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
                <div v-if="selectedStep" class="flex items-center gap-2">
                  <Icon :icon="getStepIcon(selectedStep.stepType)" class="h-4 w-4" />
                  <span>{{ stepTypeOptions.find(o => o.type === selectedStep.stepType)?.label }}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in stepTypeOptions"
                :key="option.type"
                :value="option.type"
                class="cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <Icon :icon="getStepIcon(option.type)" class="h-4 w-4" />
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
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
