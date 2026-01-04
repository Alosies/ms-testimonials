<script setup lang="ts">
import { computed } from 'vue';
import ContextualHelp from './ContextualHelp.vue';
import QuestionTips from './QuestionTips.vue';
import BranchingSettings from './BranchingSettings.vue';
import DesignSettings from './DesignSettings.vue';
import { useTimelineEditor } from '../../composables/timeline';

// Direct import - fully typed, no inject needed
const editor = useTimelineEditor();

const selectedStep = computed(() => editor.selectedStep.value);
const showTips = computed(() => {
  const stepType = selectedStep.value?.stepType;
  return stepType === 'question' || stepType === 'rating';
});

function handleUpdateTips(tips: string[]) {
  if (editor.selectedIndex.value !== null) {
    editor.updateStepTips(editor.selectedIndex.value, tips);
  }
}
</script>

<template>
  <div class="h-full p-4 overflow-y-auto">
    <!-- No selection state -->
    <div v-if="!selectedStep" class="text-center py-12">
      <p class="text-sm text-muted-foreground">
        Select a step to see its properties
      </p>
    </div>

    <!-- Selected step properties -->
    <div v-else class="space-y-4">
      <!-- Contextual help -->
      <ContextualHelp :step-type="selectedStep.stepType" />

      <!-- Tips (only for question/rating steps) -->
      <QuestionTips
        v-if="showTips"
        :tips="selectedStep.tips"
        @update="handleUpdateTips"
      />

      <!-- Branching settings (only for rating steps) -->
      <BranchingSettings />

      <!-- Design settings -->
      <DesignSettings />
    </div>
  </div>
</template>
