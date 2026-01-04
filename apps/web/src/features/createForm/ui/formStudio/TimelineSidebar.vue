<script setup lang="ts">
/**
 * Timeline Sidebar - Step list for Form Studio
 *
 * Displays list of steps with selection and add functionality.
 * Emits navigate event for parent to handle scroll navigation.
 * Shows visual indicators for flow membership (testimonial/improvement).
 *
 * @see FormStudioPage.vue - Handles navigate event with useScrollSnapNavigation
 */
import { ref, computed, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { STEP_TYPE_CONFIGS } from '../../constants';
import { FLOW_METADATA } from '@/entities/form';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';
import type { StepType, FlowMembership } from '@/shared/stepCards';

const editor = useTimelineEditor();

const emit = defineEmits<{
  /** Emitted when user clicks a step - parent should scroll to this index */
  navigate: [index: number];
}>();

// Track which insert picker is open (null = none, number = index after which to insert)
const openPickerIndex = ref<number | null>(null);
const addAtEndPickerOpen = ref(false);

// Branching state
const isBranchingEnabled = computed(() => editor.isBranchingEnabled.value);

// Get flow indicator styles for a step
function getFlowIndicator(flowMembership: FlowMembership | undefined) {
  if (!isBranchingEnabled.value || !flowMembership || flowMembership === 'shared') {
    return null;
  }
  return FLOW_METADATA[flowMembership];
}

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
        class="step-item p-2 bg-background rounded cursor-pointer flex items-center gap-2 border-l-2 transition-colors"
        :class="[
          index === editor.selectedIndex.value ? 'ring-2 ring-primary' : '',
          step.isModified && !getFlowIndicator(step.flowMembership)
            ? 'border-l-amber-400 bg-amber-50/50'
            : getFlowIndicator(step.flowMembership)?.borderClass ?? 'border-l-transparent',
        ]"
        :style="getFlowIndicator(step.flowMembership) ? 'border-left-width: 3px' : ''"
        @click="handleStepClick(index)"
      >
        <span class="shrink-0">{{ index + 1 }}.</span>
        <Icon :icon="STEP_TYPE_CONFIGS[step.stepType].icon" class="w-4 h-4 shrink-0" />
        <span class="truncate flex-1">{{ STEP_TYPE_CONFIGS[step.stepType].label }}</span>
        <!-- Show flow icon on the right for branch steps -->
        <Icon
          v-if="getFlowIndicator(step.flowMembership)"
          :icon="getFlowIndicator(step.flowMembership)!.icon"
          class="w-3.5 h-3.5 shrink-0"
          :class="getFlowIndicator(step.flowMembership)?.colorClass"
          :title="getFlowIndicator(step.flowMembership)?.label"
        />
        <!-- Unsaved indicator dot (only if not a flow step) -->
        <span
          v-else-if="step.isModified"
          class="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"
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
