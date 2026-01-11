<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { Icon } from '@testimonials/icons';
import type { SaveStatus } from './models';

interface Props {
  /** Current save status */
  status: SaveStatus;
  /** Minimum time to show "Saving..." indicator in ms (default: 800) */
  minSavingDuration?: number;
  /** Time to show "Saved" before fading out in ms (default: 2500) */
  savedDisplayDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  minSavingDuration: 800,
  savedDisplayDuration: 2500,
});

// Track displayed status separately to enforce minimum durations
const displayedStatus = ref<SaveStatus>(props.status);
// Track last visible status for icon/label during fade-out (prevents loader flash)
const lastVisibleStatus = ref<SaveStatus>(props.status);
// Use refs for mutable timing state (Vue reactive pattern)
const savingStartTime = ref<number | null>(null);
const pendingTransition = ref<ReturnType<typeof setTimeout> | null>(null);
const savedFadeTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (pendingTransition.value) clearTimeout(pendingTransition.value);
  if (savedFadeTimeout.value) clearTimeout(savedFadeTimeout.value);
});

// Helper to check if a status should show the pill
const isVisibleStatus = (status: SaveStatus) =>
  status !== 'idle' && status !== 'unsaved';

// Helper to schedule fade-out after saved state
const scheduleSavedFadeOut = () => {
  if (savedFadeTimeout.value) clearTimeout(savedFadeTimeout.value);
  savedFadeTimeout.value = setTimeout(() => {
    displayedStatus.value = 'idle';
    savedFadeTimeout.value = null;
  }, props.savedDisplayDuration);
};

// Watch for status changes and apply minimum duration logic
watch(() => props.status, (newStatus, oldStatus) => {
  // Clear any pending transition
  if (pendingTransition.value) {
    clearTimeout(pendingTransition.value);
    pendingTransition.value = null;
  }

  // When entering "saving" state, record the start time
  if (newStatus === 'saving') {
    // Cancel any pending fade-out from previous saved state
    if (savedFadeTimeout.value) {
      clearTimeout(savedFadeTimeout.value);
      savedFadeTimeout.value = null;
    }
    savingStartTime.value = Date.now();
    displayedStatus.value = 'saving';
    lastVisibleStatus.value = 'saving';
    return;
  }

  // When leaving "saving" state, ensure minimum duration
  if (oldStatus === 'saving' && savingStartTime.value) {
    const elapsed = Date.now() - savingStartTime.value;
    const remaining = props.minSavingDuration - elapsed;

    if (remaining > 0) {
      // Delay the transition to meet minimum duration
      pendingTransition.value = setTimeout(() => {
        displayedStatus.value = newStatus;
        if (isVisibleStatus(newStatus)) {
          lastVisibleStatus.value = newStatus;
        }
        savingStartTime.value = null;
        // Schedule fade-out if transitioning to saved
        if (newStatus === 'saved') {
          scheduleSavedFadeOut();
        }
      }, remaining);
      return;
    }
    savingStartTime.value = null;
  }

  // For all other transitions, update immediately
  displayedStatus.value = newStatus;
  // Only update lastVisibleStatus if the new status is visible
  // This keeps the icon/label stable during fade-out
  if (isVisibleStatus(newStatus)) {
    lastVisibleStatus.value = newStatus;
  }

  // Schedule fade-out when entering saved state
  if (newStatus === 'saved') {
    scheduleSavedFadeOut();
  }
});

// Check if we should show any pill (not idle/unsaved)
const isVisible = computed(() =>
  displayedStatus.value !== 'idle' && displayedStatus.value !== 'unsaved'
);

// Pill styles based on last visible status (keeps content stable during fade-out)
const pillClasses = computed(() => {
  switch (lastVisibleStatus.value) {
    case 'saved':
      return 'bg-emerald-50 text-emerald-700';
    case 'saving':
      return 'bg-gray-100 text-gray-500';
    case 'error':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
});

const iconName = computed(() => {
  switch (lastVisibleStatus.value) {
    case 'saved':
      return 'lucide:check';
    case 'saving':
      return 'lucide:loader-2';
    case 'error':
      return 'lucide:alert-circle';
    default:
      return 'lucide:loader-2';
  }
});

const labelText = computed(() => {
  switch (lastVisibleStatus.value) {
    case 'saved':
      return 'Saved';
    case 'saving':
      return 'Saving...';
    case 'error':
      return 'Error saving';
    default:
      return '';
  }
});
</script>

<template>
  <!--
    Always render the pill but control visibility with opacity.
    This avoids Vue's Transition component which can cause abrupt flashes
    when elements are mounted/unmounted.
  -->
  <div
    class="save-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[
      pillClasses,
      isVisible ? 'save-pill-visible' : 'save-pill-hidden'
    ]"
  >
    <Icon
      :icon="iconName"
      class="h-3 w-3"
      :class="{ 'animate-spin': lastVisibleStatus === 'saving' }"
    />
    <span>{{ labelText }}</span>
  </div>
</template>

<style scoped>
.save-pill {
  /* All transitions in one place for smooth state changes */
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out,
    background-color 0.3s ease,
    color 0.3s ease;
}

.save-pill-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.save-pill-hidden {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
}
</style>
