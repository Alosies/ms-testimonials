<script setup lang="ts">
/**
 * Timeline Sidebar - Step list for the form editor
 *
 * Displays list of steps with selection and add functionality.
 * Uses shared timeline editor composable for state.
 */
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { STEP_TYPE_CONFIGS } from '../../constants';

const editor = useTimelineEditor();

function handleStepClick(index: number) {
  editor.selectStep(index);
  editor.scrollToStep(index);
}
</script>

<template>
  <div class="p-2 text-xs text-muted-foreground">
    <div class="mb-2 font-semibold">STEPS</div>
    <div
      v-for="(step, index) in editor.steps.value"
      :key="step.id"
      class="mb-2 p-2 bg-background rounded cursor-pointer flex items-center gap-2"
      :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
      @click="handleStepClick(index)"
    >
      <span>{{ index + 1 }}.</span>
      <Icon :icon="STEP_TYPE_CONFIGS[step.stepType].icon" class="w-4 h-4" />
      <span>{{ STEP_TYPE_CONFIGS[step.stepType].label }}</span>
    </div>
    <button
      class="w-full p-2 border border-dashed rounded text-center hover:bg-muted/50 flex items-center justify-center gap-2"
      @click="editor.handleAddStep('question')"
    >
      <span>Add new</span>
      <Kbd size="sm">N</Kbd>
    </button>
  </div>
</template>
