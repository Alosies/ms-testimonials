<script setup lang="ts">
/**
 * Timeline Canvas - Senja-inspired scroll-snap timeline
 *
 * Orchestrates the display of step cards or empty state.
 * Conditionally renders branched view when branching is enabled.
 * Uses shared timeline editor composable for state.
 */
import { computed } from 'vue';
import { useTimelineEditor } from '../../composables/timeline';
import { hexToHslCssVar } from '@/entities/form';
import type { FormStep } from '../../models';
import type { StepType } from '@/shared/stepCards';
import TimelineStepCard from './TimelineStepCard.vue';
import TimelineEmptyState from './TimelineEmptyState.vue';
import BranchedTimelineCanvas from './BranchedTimelineCanvas.vue';
import { studioTestIds } from '@/shared/constants/testIds';

const editor = useTimelineEditor();

// Custom content styles for step cards (applies custom primary color)
const cardContentStyles = computed(() => {
  const primaryColor = editor.primaryColor.value;
  if (!primaryColor) return {};
  return {
    '--primary': hexToHslCssVar(primaryColor),
  };
});

async function handleInsert(afterIndex: number, type: StepType) {
  // ADR-011: Use persisting handler for immediate save
  await editor.handleAddStepWithPersist(type, afterIndex);
}
</script>

<template>
  <!-- Branched view when branching is enabled -->
  <BranchedTimelineCanvas v-if="editor.isBranchingEnabled.value" />

  <!-- Standard linear view -->
  <div v-else :data-testid="studioTestIds.canvas" class="timeline-container">
    <div v-if="editor.steps.value.length > 0" class="timeline-spacer" />

    <TimelineStepCard
      v-for="(step, index) in editor.steps.value"
      :key="step.id"
      :step="(step as FormStep)"
      :index="index"
      :is-active="index === editor.selectedIndex.value"
      :is-last="index === editor.steps.value.length - 1"
      :content-styles="cardContentStyles"
      :logo-url="editor.effectiveLogo.value"
      @select="editor.selectStep"
      @edit="editor.handleEditStep"
      @remove="editor.handleRemoveStepWithPersist"
      @insert="handleInsert"
    />

    <div v-if="editor.steps.value.length > 0" class="timeline-spacer" />

    <TimelineEmptyState
      v-if="editor.steps.value.length === 0"
      @add-step="editor.handleAddStepWithPersist"
    />
  </div>
</template>

<style scoped>
.timeline-container {
  padding: 0 2rem;
  max-width: 990px;
  margin: 0 auto;
}

.timeline-spacer {
  height: 15vh;
  scroll-snap-align: start;
}
</style>
