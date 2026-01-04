<script setup lang="ts">
/**
 * Branched Timeline Canvas - Side-by-side flow columns
 *
 * Displays shared steps at top, then splits into two columns:
 * - Left: Testimonial flow (positive rating path)
 * - Right: Improvement flow (negative rating path)
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import { FLOW_METADATA } from '@/entities/form';
import { useTimelineEditor } from '../../composables/timeline';
import type { FormStep } from '../../models';
import type { StepType } from '@/shared/stepCards';
import TimelineStepCard from './TimelineStepCard.vue';
import FlowColumn from './FlowColumn.vue';

const editor = useTimelineEditor();

const threshold = computed(() => editor.branchingConfig.value.threshold);

// The branch point is the rating step
const branchPointStep = computed(() => editor.branchPointStep.value);

function handleInsert(afterIndex: number, type: StepType) {
  editor.handleAddStep(type, afterIndex);
}

function handleFocusTestimonial() {
  editor.focusFlow('testimonial');
}

function handleFocusImprovement() {
  editor.focusFlow('improvement');
}
</script>

<template>
  <div class="branched-timeline">
    <!-- Shared Steps (before branch point) -->
    <div class="shared-section">
      <div class="shared-spacer" />

      <template v-for="(step, index) in editor.stepsBeforeBranch.value" :key="step.id">
        <TimelineStepCard
          :step="(step as FormStep)"
          :index="index"
          :is-active="index === editor.selectedIndex.value"
          :is-last="false"
          @select="editor.selectStep"
          @edit="editor.handleEditStep"
          @remove="editor.handleRemoveStep"
          @insert="handleInsert"
        />
      </template>
    </div>

    <!-- Branch Point Indicator -->
    <div v-if="branchPointStep" class="branch-point">
      <div class="branch-indicator">
        <div class="branch-line branch-line-left" />
        <div class="branch-node">
          <Icon icon="heroicons:arrows-pointing-out" class="w-5 h-5 text-primary" />
        </div>
        <div class="branch-line branch-line-right" />
      </div>

      <div class="branch-labels">
        <div class="branch-label branch-label-left">
          <Icon :icon="FLOW_METADATA.testimonial.icon" class="w-4 h-4" :class="FLOW_METADATA.testimonial.colorClass" />
          <span :class="FLOW_METADATA.testimonial.colorClass">Rating ≥ {{ threshold }}</span>
        </div>
        <div class="branch-label branch-label-right">
          <Icon :icon="FLOW_METADATA.improvement.icon" class="w-4 h-4" :class="FLOW_METADATA.improvement.colorClass" />
          <span :class="FLOW_METADATA.improvement.colorClass">Rating &lt; {{ threshold }}</span>
        </div>
      </div>

      <!-- Keyboard hints -->
      <div class="branch-kbd-hints">
        <Kbd size="sm">←</Kbd>
        <span class="text-xs text-muted-foreground mx-1">testimonial</span>
        <span class="text-muted-foreground/50">·</span>
        <span class="text-xs text-muted-foreground mx-1">improvement</span>
        <Kbd size="sm">→</Kbd>
      </div>
    </div>

    <!-- Flow Columns -->
    <div class="flow-columns">
      <FlowColumn
        flow-type="testimonial"
        :steps="editor.testimonialSteps.value"
        :is-focused="editor.currentFlowFocus.value === 'testimonial'"
        @focus="handleFocusTestimonial"
      />

      <div class="column-divider" />

      <FlowColumn
        flow-type="improvement"
        :steps="editor.improvementSteps.value"
        :is-focused="editor.currentFlowFocus.value === 'improvement'"
        @focus="handleFocusImprovement"
      />
    </div>
  </div>
</template>

<style scoped>
.branched-timeline {
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.shared-section {
  max-width: 990px;
  margin: 0 auto;
  padding: 0 1rem;
}

.shared-spacer {
  height: 10vh;
}

/* Branch Point */
.branch-point {
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.branch-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.branch-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(
    to right,
    hsl(var(--border)),
    hsl(var(--primary) / 0.5)
  );
}

.branch-line-right {
  background: linear-gradient(
    to right,
    hsl(var(--primary) / 0.5),
    hsl(var(--border))
  );
}

.branch-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: hsl(var(--background));
  border: 2px solid hsl(var(--primary));
  box-shadow: 0 4px 12px -2px hsl(var(--primary) / 0.2);
}

.branch-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  padding: 0 1rem;
}

.branch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.branch-kbd-hints {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 0.5rem;
}

/* Flow Columns */
.flow-columns {
  display: flex;
  gap: 1rem;
  min-height: 60vh;
  scroll-snap-align: start;
  padding-bottom: 20vh;
}

.column-divider {
  width: 1px;
  background: hsl(var(--border));
  margin: 1rem 0;
}
</style>
