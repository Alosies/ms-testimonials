<script setup lang="ts">
/**
 * Flow Column - Single column in branched timeline view
 *
 * Displays steps for a specific flow (testimonial or improvement)
 * with color-coded header and step cards.
 *
 * Supports expanded view for full-size editing.
 */
import { computed, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd, Button } from '@testimonials/ui';
import { FLOW_METADATA } from '@/entities/form';
import type { FlowMembership } from '@/shared/stepCards';
import type { FormStep } from '../../models';
import type { StepType } from '@/shared/stepCards';
import { useTimelineEditor } from '../../composables/timeline';
import { studioTestIds } from '@/shared/constants/testIds';
import FlowStepCard from './FlowStepCard.vue';
import TimelineConnector from './TimelineConnector.vue';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';

const props = defineProps<{
  flowType: Exclude<FlowMembership, 'shared'>;
  steps: readonly FormStep[];
  isFocused: boolean;
  isExpanded?: boolean;
}>();

const emit = defineEmits<{
  focus: [];
  expand: [];
  collapse: [];
}>();

const editor = useTimelineEditor();

const metadata = computed(() => FLOW_METADATA[props.flowType]);

const threshold = computed(() => editor.branchingConfig.value.threshold);

const headerDescription = computed(() => {
  if (props.flowType === 'testimonial') {
    return `Rating ≥ ${threshold.value}`;
  }
  return `Rating < ${threshold.value}`;
});

// Get the index of a step in the main steps array
function getMainIndex(step: FormStep): number {
  return editor.steps.value.findIndex(s => s.id === step.id);
}

function handleStepSelect(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    editor.selectStep(mainIndex);
    emit('focus');
  }
}

function handleStepEdit(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    editor.handleEditStep(mainIndex);
  }
}

function handleStepRemove(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    editor.handleRemoveStep(mainIndex);
  }
}

function handleInsert(afterStep: FormStep, type: StepType) {
  const flowStepIndex = props.steps.findIndex(s => s.id === afterStep.id);
  editor.addStepToFlow(type, props.flowType, flowStepIndex);
}

// Empty state - add first step
const emptyStatePickerOpen = ref(false);

function handleAddFirstStep(type: StepType) {
  // Add first step to this flow (no afterIndex means insert at beginning)
  editor.addStepToFlow(type, props.flowType);
  emptyStatePickerOpen.value = false;
}

function isStepActive(step: FormStep): boolean {
  const mainIndex = getMainIndex(step);
  return mainIndex === editor.selectedIndex.value;
}

function handleHeaderDoubleClick() {
  if (props.isExpanded) {
    emit('collapse');
  } else {
    emit('expand');
  }
}

function handleExpandClick(e: Event) {
  e.stopPropagation();
  emit('expand');
}

function handleCollapseClick(e: Event) {
  e.stopPropagation();
  emit('collapse');
}
</script>

<template>
  <div
    class="flow-column"
    :class="{
      'flow-column-focused': isFocused,
      'flow-column-expanded': isExpanded,
      'flow-column-testimonial': flowType === 'testimonial',
      'flow-column-improvement': flowType === 'improvement',
    }"
    :data-testid="studioTestIds.flowColumn"
    :data-flow-type="flowType"
    :data-is-focused="isFocused"
    @click="emit('focus')"
  >
    <!-- Flow Header -->
    <div
      class="flow-header"
      :class="[metadata.bgClass, metadata.borderClass]"
      @dblclick="handleHeaderDoubleClick"
    >
      <div class="flex items-center gap-2">
        <Icon :icon="metadata.icon" class="w-5 h-5" :class="metadata.colorClass" />
        <span class="font-semibold" :class="metadata.colorClass">
          {{ metadata.label }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">
          {{ headerDescription }}
        </span>
        <!-- Expand/Collapse button -->
        <Button
          v-if="!isExpanded"
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          title="Expand flow (F)"
          @click="handleExpandClick"
        >
          <Icon icon="heroicons:arrows-pointing-out" class="w-4 h-4" :class="metadata.colorClass" />
        </Button>
        <Button
          v-else
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          title="Collapse flow (Esc)"
          @click="handleCollapseClick"
        >
          <Icon icon="heroicons:arrows-pointing-in" class="w-4 h-4" :class="metadata.colorClass" />
        </Button>
      </div>
    </div>

    <!-- Flow Steps -->
    <div class="flow-steps">
      <div v-if="steps.length > 0" class="flow-spacer" />

      <template v-for="(step, index) in steps" :key="step.id">
        <FlowStepCard
          :step="(step as FormStep)"
          :flow-index="index"
          :is-active="isStepActive(step)"
          :is-focused-flow="isFocused"
          :flow-type="flowType"
          @select="handleStepSelect(step)"
          @edit="handleStepEdit(step)"
          @remove="handleStepRemove(step)"
        />

        <TimelineConnector
          v-if="index < steps.length - 1"
          :compact="true"
          @insert="(type) => handleInsert(step, type)"
        />
      </template>

      <div v-if="steps.length > 0" class="flow-spacer" />

      <!-- Empty State -->
      <div
        v-if="steps.length === 0"
        class="flow-empty-state"
        :class="[metadata.bgClass, metadata.borderClass]"
      >
        <Icon :icon="metadata.icon" class="w-8 h-8" :class="metadata.colorClass" />
        <p class="text-sm text-muted-foreground mt-2">
          No steps in this flow yet
        </p>
        <!-- Add first step button -->
        <StepTypePicker
          v-model:open="emptyStatePickerOpen"
          @select="handleAddFirstStep"
        >
          <button
            class="mt-4 w-full p-2 border border-dashed rounded text-center hover:bg-muted/50 flex items-center justify-center gap-2 text-sm"
          >
            <span>Add new</span>
            <Kbd size="sm">N</Kbd>
          </button>
        </StepTypePicker>
      </div>
    </div>

    <!-- Keyboard hint when focused -->
    <div
      v-if="isFocused"
      class="flow-keyboard-hint"
      :class="[metadata.bgClass, metadata.borderClass]"
    >
      <Kbd size="sm">↑</Kbd>
      <Kbd size="sm">↓</Kbd>
      <span class="text-xs text-muted-foreground mx-1">navigate</span>
      <span class="text-muted-foreground/50">·</span>
      <Kbd size="sm">←</Kbd>
      <Kbd size="sm">→</Kbd>
      <span class="text-xs text-muted-foreground mx-1">switch</span>
      <span class="text-muted-foreground/50">·</span>
      <Kbd size="sm">F</Kbd>
      <span class="text-xs text-muted-foreground mx-1">expand</span>
    </div>
  </div>
</template>

<style scoped>
.flow-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  position: relative;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  transition: all 0.2s ease;
}

/* Testimonial flow specific border */
.flow-column-testimonial {
  border-color: hsl(var(--emerald-200, 167 85% 89%));
}

/* Improvement flow specific border */
.flow-column-improvement {
  border-color: hsl(var(--sky-200, 201 94% 86%));
}

.flow-column-focused {
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
}

.flow-column-focused.flow-column-testimonial {
  border-color: hsl(var(--emerald-400, 158 64% 52%));
}

.flow-column-focused.flow-column-improvement {
  border-color: hsl(var(--sky-400, 198 93% 60%));
}

.flow-column-expanded {
  flex: none;
  width: 100%;
  max-width: 990px;
  margin: 0 auto;
}

.flow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid;
  border-radius: 0.75rem 0.75rem 0 0;
  background-clip: padding-box;
}

.flow-steps {
  flex: 1;
  padding: 1rem;
  /* Remove nested scroll - let main timeline-scroll handle scrolling */
}

.flow-spacer {
  height: 10vh;
  scroll-snap-align: start;
}

.flow-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed;
  border-radius: 0.75rem;
  min-height: 200px;
}

.flow-keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid;
  border-radius: 0 0 0.75rem 0.75rem;
}
</style>
