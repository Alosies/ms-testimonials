<script setup lang="ts">
/**
 * Timeline Sidebar - Step list for the form editor
 *
 * Displays list of steps with selection and add functionality.
 * Emits navigate event for parent to handle scroll navigation.
 *
 * @see FormEditPage.vue - Handles navigate event with useScrollSnapNavigation
 */
import { ref, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { STEP_TYPE_CONFIGS } from '../../constants';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';
import type { StepType } from '@/shared/stepCards';

const editor = useTimelineEditor();

const emit = defineEmits<{
  /** Emitted when user clicks a step - parent should scroll to this index */
  navigate: [index: number];
}>();

// Track which insert picker is open (null = none, number = index after which to insert)
const openPickerIndex = ref<number | null>(null);
const addAtEndPickerOpen = ref(false);

function handleStepClick(index: number) {
  emit('navigate', index);
}

function handleInsertAt(afterIndex: number, type: StepType) {
  const newIndex = editor.handleAddStep(type, afterIndex);
  openPickerIndex.value = null;
  // Scroll to new step after DOM updates
  nextTick(() => emit('navigate', newIndex));
}

function handleAddAtEnd(type: StepType) {
  const newIndex = editor.handleAddStep(type);
  addAtEndPickerOpen.value = false;
  // Scroll to new step after DOM updates
  nextTick(() => emit('navigate', newIndex));
}
</script>

<template>
  <div class="p-2 text-xs text-muted-foreground">
    <div class="mb-2 font-semibold">STEPS</div>

    <template v-for="(step, index) in editor.steps.value" :key="step.id">
      <!-- Step item -->
      <div
        class="p-2 bg-background rounded cursor-pointer flex items-center gap-2 border-l-2 transition-colors"
        :class="[
          index === editor.selectedIndex.value
            ? 'ring-2 ring-primary'
            : '',
          step.isModified
            ? 'border-l-amber-400 bg-amber-50/50'
            : 'border-l-transparent',
        ]"
        @click="handleStepClick(index)"
      >
        <span>{{ index + 1 }}.</span>
        <Icon :icon="STEP_TYPE_CONFIGS[step.stepType].icon" class="w-4 h-4" />
        <span class="flex-1">{{ STEP_TYPE_CONFIGS[step.stepType].label }}</span>
        <!-- Unsaved indicator dot -->
        <span
          v-if="step.isModified"
          class="h-2 w-2 rounded-full bg-amber-400 animate-pulse"
          title="Unsaved changes"
        />
      </div>

      <!-- Insert button between steps (not after last step) -->
      <StepTypePicker
        v-if="index < editor.steps.value.length - 1"
        :open="openPickerIndex === index"
        @update:open="(val: boolean) => openPickerIndex = val ? index : null"
        @select="(type: StepType) => handleInsertAt(index, type)"
      >
        <div class="group flex items-center justify-center h-4 my-1">
          <button
            class="flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-transparent hover:border-primary/50 hover:bg-primary/5 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Icon icon="heroicons:plus" class="w-3 h-3 text-primary" />
          </button>
        </div>
      </StepTypePicker>

      <!-- Spacer after last step -->
      <div v-else class="h-2" />
    </template>

    <!-- Add at end button with picker -->
    <StepTypePicker
      :open="addAtEndPickerOpen"
      @update:open="(val: boolean) => addAtEndPickerOpen = val"
      @select="handleAddAtEnd"
    >
      <button
        class="w-full p-2 border border-dashed rounded text-center hover:bg-muted/50 flex items-center justify-center gap-2"
      >
        <span>Add new</span>
        <Kbd size="sm">N</Kbd>
      </button>
    </StepTypePicker>
  </div>
</template>
