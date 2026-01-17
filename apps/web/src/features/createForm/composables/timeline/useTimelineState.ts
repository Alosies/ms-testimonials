/**
 * Timeline State - Core State Singleton (ADR-014 Phase 5)
 *
 * Foundational state for timeline editing. Other composables compose from this.
 */
import { ref, computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep } from '@/entities/formStep';
import type { TimelineState } from '../../models/timeline';

// Re-export type for consumers (CR-002: types from models/)
export type { TimelineState } from '../../models/timeline';

/** Core timeline state singleton - shared state for all timeline composables */
export const useTimelineState = createSharedComposable((): TimelineState => {
  // Core state
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);
  const selectedIndex = ref(0);

  // Computed: current step
  const currentStep = computed(() => steps.value[selectedIndex.value] ?? null);

  // Computed: dirty check (structural changes only)
  const isDirty = computed(() => {
    if (steps.value.length !== originalSteps.value.length) return true;
    const current = steps.value.map(s => ({ id: s.id, stepOrder: s.stepOrder, flowId: s.flowId }));
    const original = originalSteps.value.map(s => ({ id: s.id, stepOrder: s.stepOrder, flowId: s.flowId }));
    return JSON.stringify(current) !== JSON.stringify(original);
  });

  // Computed: has steps
  const hasSteps = computed(() => steps.value.length > 0);

  // Initialize with steps (also sets originalSteps for dirty tracking)
  function initialize(newSteps: FormStep[]) {
    steps.value = [...newSteps];
    originalSteps.value = JSON.parse(JSON.stringify(newSteps));
    selectedIndex.value = 0;
  }

  // Reset all state
  function reset() {
    steps.value = [];
    originalSteps.value = [];
    selectedIndex.value = 0;
  }

  // Set steps without resetting originalSteps (for external updates)
  function setSteps(newSteps: FormStep[]) {
    steps.value = [...newSteps];
  }

  // Update a single step in state
  function updateStepInState(index: number, updates: Partial<FormStep>) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index] = { ...steps.value[index], ...updates, isModified: true };
    }
  }

  // Get step by ID
  function getStepById(id: string): FormStep | undefined {
    return steps.value.find(s => s.id === id);
  }

  // Mark current state as clean (after save)
  function markClean() {
    originalSteps.value = JSON.parse(JSON.stringify(steps.value));
  }

  return {
    steps,
    originalSteps,
    selectedIndex,
    currentStep,
    isDirty,
    hasSteps,
    initialize,
    reset,
    setSteps,
    updateStepInState,
    getStepById,
    markClean,
  };
});
