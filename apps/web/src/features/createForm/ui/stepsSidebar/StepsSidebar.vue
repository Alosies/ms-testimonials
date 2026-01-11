<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';
import StepThumbnail from './StepThumbnail.vue';
import InsertStepButton from './InsertStepButton.vue';
import StepTypePicker from './StepTypePicker.vue';
import { useTimelineEditor } from '../../composables/timeline';
import type { StepType, FormStep } from '@/shared/stepCards';

// Direct import - fully typed, no inject needed
const editor = useTimelineEditor();

const pickerOpen = ref(false);
const insertAfterIndex = ref<number | null>(null);

function handleInsert(afterIndex: number) {
  insertAfterIndex.value = afterIndex;
  pickerOpen.value = true;
}

function handleAddAtEnd() {
  insertAfterIndex.value = null;
  pickerOpen.value = true;
}

async function handleSelectType(type: StepType) {
  pickerOpen.value = false;
  await editor.handleAddStepAsync(type, insertAfterIndex.value ?? undefined);
}
</script>

<template>
  <div class="flex flex-col h-full py-4">
    <!-- Header -->
    <div class="px-4 mb-4">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Steps
      </span>
    </div>

    <!-- Step list -->
    <div class="flex-1 overflow-y-auto px-3 space-y-1">
      <template v-for="(step, index) in editor.steps.value" :key="step.id">
        <!-- Step thumbnail -->
        <StepThumbnail
          :step="step as FormStep"
          :index="index"
          :is-selected="index === editor.selectedIndex.value"
          :is-modified="step.isModified"
          @select="editor.selectStep(index)"
        />

        <!-- Insert button between steps -->
        <InsertStepButton
          v-if="index < editor.steps.value.length - 1"
          :after-index="index"
          @insert="handleInsert(index)"
        />
      </template>
    </div>

    <!-- Add button at bottom -->
    <div class="px-3 mt-4">
      <StepTypePicker
        v-model:open="pickerOpen"
        @select="handleSelectType"
      >
        <button
          class="w-full h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
          @click="handleAddAtEnd"
        >
          <Icon icon="heroicons:plus" class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm text-muted-foreground">Add Step</span>
        </button>
      </StepTypePicker>
    </div>
  </div>
</template>
