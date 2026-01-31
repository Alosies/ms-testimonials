<script setup lang="ts">
/**
 * Branched Timeline Canvas - Side-by-side flow columns
 *
 * ADR-018: Supports segment-based rendering with optional outro section.
 *
 * Displays:
 * 1. Shared steps at top (intro)
 * 2. Branch indicator
 * 3. Two columns: Testimonial flow (left) and Improvement flow (right)
 * 4. Merge indicator (if outro exists)
 * 5. Shared steps at bottom (outro)
 *
 * Supports expanded view for detailed editing of a single flow.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd, Button } from '@testimonials/ui';
import { FLOW_METADATA, hexToHslCssVar } from '@/entities/form';
import type { FlowMembership } from '@/shared/stepCards';
import { studioTestIds } from '@/shared/constants/testIds';
import { useTimelineEditor } from '../../composables/timeline';
import type { FormStep } from '../../models';
import type { StepType } from '@/shared/stepCards';
import TimelineStepCard from './TimelineStepCard.vue';
import FlowColumn from './FlowColumn.vue';

const editor = useTimelineEditor();

// Custom content styles for step cards (applies custom primary color)
const cardContentStyles = computed(() => {
  const primaryColor = editor.primaryColor.value;
  if (!primaryColor) return {};
  return {
    '--primary': hexToHslCssVar(primaryColor),
  };
});

const threshold = computed(() => editor.branchingConfig.value.threshold);

// The branch point is the rating step
const branchPointStep = computed(() => editor.branchPointStep.value);

// ADR-018: Check if there are outro steps (shared steps after branches)
const hasOutroSection = computed(() => editor.hasOutroSegment.value);
const outroSteps = computed(() => editor.outroSteps.value);

// Get the starting index for outro steps in the main steps array
// This is needed for proper step selection/editing
const outroStartIndex = computed(() => {
  if (outroSteps.value.length === 0) return -1;
  const firstOutroStep = outroSteps.value[0];
  return editor.steps.value.findIndex(s => s.id === firstOutroStep.id);
});

// Use shared expandedFlow state from editor for keyboard navigation sync
const expandedFlow = computed(() => editor.expandedFlow.value);

// Computed for expanded flow metadata
const expandedFlowMetadata = computed(() => {
  if (!expandedFlow.value) return null;
  return FLOW_METADATA[expandedFlow.value];
});

const expandedFlowSteps = computed(() => {
  if (expandedFlow.value === 'testimonial') return editor.testimonialSteps.value;
  if (expandedFlow.value === 'improvement') return editor.improvementSteps.value;
  return [];
});

const expandedFlowDescription = computed(() => {
  if (expandedFlow.value === 'testimonial') return `Rating ≥ ${threshold.value}`;
  if (expandedFlow.value === 'improvement') return `Rating < ${threshold.value}`;
  return '';
});

async function handleInsert(afterIndex: number, type: StepType) {
  // ADR-011: Use persisting handler for immediate save
  await editor.handleAddStepWithPersist(type, afterIndex);
}

function handleFocusTestimonial() {
  // Use setFlowFocus instead of focusFlow to avoid overwriting step selection.
  // When a FlowStepCard is clicked, handleStepSelect already selects the correct step
  // via editor.selectStep(). Using focusFlow here would always select the first step.
  editor.setFlowFocus('testimonial');
}

function handleFocusImprovement() {
  // Use setFlowFocus instead of focusFlow to avoid overwriting step selection.
  editor.setFlowFocus('improvement');
}

function handleExpandFlow(flow: 'testimonial' | 'improvement') {
  editor.setExpandedFlow(flow);
}

function handleCollapseFlow() {
  editor.collapseFlow();
}

// Get main array index for operations
function getMainIndex(step: FormStep): number {
  return editor.steps.value.findIndex(s => s.id === step.id);
}

function handleExpandedStepSelect(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    editor.selectStep(mainIndex);
  }
}

function handleExpandedStepEdit(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    editor.handleEditStep(mainIndex);
  }
}

async function handleExpandedStepRemove(step: FormStep) {
  const mainIndex = getMainIndex(step);
  if (mainIndex !== -1) {
    // ADR-011: Use persisting handler for immediate save
    await editor.handleRemoveStepWithPersist(mainIndex);
  }
}

function isExpandedStepActive(step: FormStep): boolean {
  const mainIndex = getMainIndex(step);
  return mainIndex === editor.selectedIndex.value;
}

function handleExpandedInsert(afterStep: FormStep, type: StepType) {
  if (!expandedFlow.value) return;
  const flowStepIndex = expandedFlowSteps.value.findIndex(s => s.id === afterStep.id);
  editor.addStepToFlow(type, expandedFlow.value as FlowMembership, flowStepIndex);
}

// Expose for parent component access
defineExpose({
  handleExpandFlow,
  handleCollapseFlow,
});
</script>

<template>
  <div class="branched-timeline">
    <!-- Shared Steps (before branch point) - always shown -->
    <div v-if="!expandedFlow" class="shared-section">
      <div class="shared-spacer" />

      <template v-for="(step, index) in editor.stepsBeforeBranch.value" :key="step.id">
        <TimelineStepCard
          :step="(step as FormStep)"
          :index="index"
          :is-active="index === editor.selectedIndex.value"
          :is-last="false"
          :content-styles="cardContentStyles"
          :logo-url="editor.effectiveLogo.value"
          @select="editor.selectStep"
          @edit="editor.handleEditStep"
          @remove="editor.handleRemoveStepWithPersist"
          @insert="handleInsert"
        />
      </template>
    </div>

    <!-- Branch Point Indicator - hidden in expanded view -->
    <div v-if="branchPointStep && !expandedFlow" class="branch-point">
      <div class="branch-indicator">
        <div class="branch-line branch-line-left" />
        <div class="branch-node">
          <Icon icon="lucide:network" class="w-5 h-5 text-primary" />
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

    <!-- Side-by-side Flow Columns - normal view -->
    <div v-if="!expandedFlow" class="flow-columns">
      <FlowColumn
        flow-type="testimonial"
        :steps="editor.testimonialSteps.value"
        :is-focused="editor.currentFlowFocus.value === 'testimonial'"
        :is-expanded="false"
        @focus="handleFocusTestimonial"
        @expand="handleExpandFlow('testimonial')"
      />

      <div class="column-divider" />

      <FlowColumn
        flow-type="improvement"
        :steps="editor.improvementSteps.value"
        :is-focused="editor.currentFlowFocus.value === 'improvement'"
        :is-expanded="false"
        @focus="handleFocusImprovement"
        @expand="handleExpandFlow('improvement')"
      />
    </div>

    <!-- ADR-018: Merge Point Indicator - shown when outro section exists -->
    <div v-if="hasOutroSection && !expandedFlow" class="merge-point">
      <div class="merge-indicator">
        <div class="merge-line merge-line-left" />
        <div class="merge-node">
          <Icon icon="lucide:network" class="w-5 h-5 text-muted-foreground rotate-180" />
        </div>
        <div class="merge-line merge-line-right" />
      </div>

      <div class="merge-label">
        <Icon icon="heroicons:arrow-down" class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">All users continue</span>
      </div>
    </div>

    <!-- ADR-018: Outro Section - shared steps after branches -->
    <div v-if="hasOutroSection && !expandedFlow" class="outro-section" data-testid="outro-section">
      <template v-for="(step, localIndex) in outroSteps" :key="step.id">
        <TimelineStepCard
          :step="(step as FormStep)"
          :index="outroStartIndex + localIndex"
          :is-active="outroStartIndex + localIndex === editor.selectedIndex.value"
          :is-last="localIndex === outroSteps.length - 1"
          :content-styles="cardContentStyles"
          :logo-url="editor.effectiveLogo.value"
          @select="editor.selectStep"
          @edit="editor.handleEditStep"
          @remove="editor.handleRemoveStepWithPersist"
          @insert="handleInsert"
        />
      </template>

      <div class="outro-spacer" />
    </div>

    <!-- Expanded Flow View - full-size editing -->
    <div
      v-if="expandedFlow && expandedFlowMetadata"
      class="expanded-flow"
      :data-testid="studioTestIds.expandedFlow"
      :data-flow-type="expandedFlow"
    >
      <!-- Expanded Header -->
      <div
        class="expanded-header"
        :class="[expandedFlowMetadata.bgClass, expandedFlowMetadata.borderClass]"
        :data-testid="studioTestIds.expandedFlowHeader"
      >
        <div class="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            title="Back to side-by-side view (Esc)"
            @click="handleCollapseFlow"
          >
            <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
          </Button>
          <Icon :icon="expandedFlowMetadata.icon" class="w-6 h-6" :class="expandedFlowMetadata.colorClass" />
          <span class="font-semibold text-lg" :class="expandedFlowMetadata.colorClass">
            {{ expandedFlowMetadata.label }}
          </span>
          <span class="text-sm text-muted-foreground">
            {{ expandedFlowDescription }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Kbd size="sm">Esc</Kbd>
          <span class="text-xs text-muted-foreground">collapse</span>
        </div>
      </div>

      <!-- Expanded Steps - Full Size TimelineStepCard -->
      <div class="expanded-steps">
        <div class="expanded-spacer" />

        <template v-for="(step, index) in expandedFlowSteps" :key="step.id">
          <TimelineStepCard
            :step="(step as FormStep)"
            :index="index"
            :is-active="isExpandedStepActive(step)"
            :is-last="index === expandedFlowSteps.length - 1"
            :content-styles="cardContentStyles"
            :logo-url="editor.effectiveLogo.value"
            @select="handleExpandedStepSelect(step)"
            @edit="handleExpandedStepEdit(step)"
            @remove="handleExpandedStepRemove(step)"
            @insert="(_, type) => handleExpandedInsert(step, type)"
          />
        </template>

        <div class="expanded-spacer" />
      </div>
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

/* ADR-018: Merge Point */
.merge-point {
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.merge-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.merge-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(
    to right,
    hsl(var(--border)),
    hsl(var(--muted-foreground) / 0.3)
  );
}

.merge-line-right {
  background: linear-gradient(
    to right,
    hsl(var(--muted-foreground) / 0.3),
    hsl(var(--border))
  );
}

.merge-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: hsl(var(--background));
  border: 2px solid hsl(var(--border));
}

.merge-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ADR-018: Outro Section */
.outro-section {
  max-width: 990px;
  margin: 0 auto;
  padding: 0 1rem;
}

.outro-spacer {
  height: 20vh;
}

/* Expanded Flow View */
.expanded-flow {
  max-width: 990px;
  margin: 0 auto;
  padding: 0 1rem;
}

.expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border: 1px solid;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.expanded-steps {
  padding: 0 1rem;
}

.expanded-spacer {
  height: 15vh;
  scroll-snap-align: start;
}
</style>
