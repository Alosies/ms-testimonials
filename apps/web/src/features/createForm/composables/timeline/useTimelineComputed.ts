/**
 * Timeline Computed - Derived computations composable (ADR-014 Phase 5)
 *
 * Single-responsibility composable for computed step groupings.
 * Composes from useTimelineState.
 */
import { computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useTimelineState } from './useTimelineState';
import type { TimelineComputed } from '../../models/timeline';

// Re-export type for consumers (CR-002: types from models/)
export type { TimelineComputed } from '../../models/timeline';

// =============================================================================
// Composable Implementation
// =============================================================================

export const useTimelineComputed = createSharedComposable((): TimelineComputed => {
  const state = useTimelineState();

  // Flow-based groupings
  const sharedSteps = computed(() =>
    state.steps.value.filter(s => s.flowMembership === 'shared')
  );

  const testimonialSteps = computed(() =>
    state.steps.value.filter(s => s.flowMembership === 'testimonial')
  );

  const improvementSteps = computed(() =>
    state.steps.value.filter(s => s.flowMembership === 'improvement')
  );

  // Step type lookups
  const welcomeStep = computed(() =>
    state.steps.value.find(s => s.stepType === 'welcome') ?? null
  );

  const ratingStep = computed(() =>
    state.steps.value.find(s => s.stepType === 'rating') ?? null
  );

  const thankYouSteps = computed(() =>
    state.steps.value.filter(s => s.stepType === 'thank_you')
  );

  // Counts and flags
  const stepCount = computed(() => state.steps.value.length);

  const hasRatingStep = computed(() => ratingStep.value !== null);

  const hasMultipleFlows = computed(() =>
    testimonialSteps.value.length > 0 || improvementSteps.value.length > 0
  );

  return {
    sharedSteps,
    testimonialSteps,
    improvementSteps,
    welcomeStep,
    ratingStep,
    thankYouSteps,
    stepCount,
    hasRatingStep,
    hasMultipleFlows,
  };
});
