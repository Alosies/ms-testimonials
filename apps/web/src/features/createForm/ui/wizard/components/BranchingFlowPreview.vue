<script setup lang="ts">
/**
 * Branching Flow Preview
 *
 * Visualizes the conditional branching flow with:
 * - Branch point indicator with connecting lines
 * - Side-by-side flow columns for testimonial/improvement paths
 */
import { Icon } from '@testimonials/icons';
import { FLOW_METADATA, type FlowMembership } from '@/entities/form';
import PreviewStepCard from './PreviewStepCard.vue';

interface PreviewStep {
  type: 'welcome' | 'question' | 'rating' | 'thank_you' | 'consent';
  title: string;
  subtitle?: string;
  flowMembership: FlowMembership;
  isBranchPoint?: boolean;
}

defineProps<{
  /** Number of shared steps (for step numbering offset) */
  sharedStepsCount: number;
  /** Steps for testimonial flow (rating >= threshold) */
  testimonialSteps: PreviewStep[];
  /** Steps for improvement flow (rating < threshold) */
  improvementSteps: PreviewStep[];
}>();
</script>

<template>
  <!-- Branch Point Indicator -->
  <div class="branch-point">
    <div class="branch-indicator">
      <div class="branch-line branch-line-left" />
      <div class="branch-node">
        <Icon icon="mdi:source-branch" class="h-5 w-5 text-primary" />
      </div>
      <div class="branch-line branch-line-right" />
    </div>
    <div class="branch-labels">
      <div class="branch-label">
        <Icon :icon="FLOW_METADATA.testimonial.icon" class="h-4 w-4" :class="FLOW_METADATA.testimonial.colorClass" />
        <span :class="FLOW_METADATA.testimonial.colorClass">Rating ≥ 4</span>
      </div>
      <div class="branch-label">
        <Icon :icon="FLOW_METADATA.improvement.icon" class="h-4 w-4" :class="FLOW_METADATA.improvement.colorClass" />
        <span :class="FLOW_METADATA.improvement.colorClass">Rating &lt; 4</span>
      </div>
    </div>
  </div>

  <!-- Branched Flows (side by side) -->
  <div class="branch-flows">
    <!-- Testimonial Flow (Left - Emerald) -->
    <div class="flow-column" :class="`flow-column-${FLOW_METADATA.testimonial.id}`">
      <div class="flow-header" :class="[FLOW_METADATA.testimonial.bgClass, FLOW_METADATA.testimonial.colorClass]">
        <Icon :icon="FLOW_METADATA.testimonial.icon" class="h-4 w-4" />
        <span>{{ FLOW_METADATA.testimonial.label }}</span>
      </div>
      <div class="flow-content">
        <PreviewStepCard
          v-for="(step, index) in testimonialSteps"
          :key="`testimonial-${index}`"
          :step-number="sharedStepsCount + index + 1"
          :step-type="step.type"
          :title="step.title"
          :subtitle="step.subtitle"
          :flow-membership="step.flowMembership"
        />
      </div>
    </div>

    <!-- Improvement Flow (Right - Sky) -->
    <div class="flow-column" :class="`flow-column-${FLOW_METADATA.improvement.id}`">
      <div class="flow-header" :class="[FLOW_METADATA.improvement.bgClass, FLOW_METADATA.improvement.colorClass]">
        <Icon :icon="FLOW_METADATA.improvement.icon" class="h-4 w-4" />
        <span>{{ FLOW_METADATA.improvement.label }}</span>
      </div>
      <div class="flow-content">
        <PreviewStepCard
          v-for="(step, index) in improvementSteps"
          :key="`improvement-${index}`"
          :step-number="sharedStepsCount + index + 1"
          :step-type="step.type"
          :title="step.title"
          :subtitle="step.subtitle"
          :flow-membership="step.flowMembership"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Branch Point */
.branch-point {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.branch-indicator {
  display: flex;
  align-items: center;
  width: 100%;
}

.branch-line {
  flex: 1;
  height: 2px;
}

.branch-line-left {
  background: linear-gradient(to right, theme('colors.gray.200'), theme('colors.emerald.500'));
}

.branch-line-right {
  background: linear-gradient(to right, theme('colors.emerald.500'), theme('colors.gray.200'));
}

.branch-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  border: 2px solid theme('colors.teal.500');
  box-shadow: 0 4px 12px -2px theme('colors.teal.500 / 0.25');
  flex-shrink: 0;
}

.branch-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 1rem;
}

.branch-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Branch Flows */
.branch-flows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.flow-column {
  border-radius: 0.75rem;
  border: 2px solid;
  overflow: hidden;
}

/* Flow column borders - matches FLOW_METADATA borderClass colors */
.flow-column-testimonial {
  border-color: theme('colors.emerald.400');
}

.flow-column-improvement {
  border-color: theme('colors.sky.400');
}

.flow-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid theme('colors.gray.200');
}

.flow-content {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: white;
}

/* Responsive */
@media (max-width: 768px) {
  .branch-flows {
    grid-template-columns: 1fr;
  }
}
</style>
