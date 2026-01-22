<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth, AuthLoader } from '@/features/auth';
import { useCurrentContext, ContextLoader } from '@/shared/currentContext';
import { ConfirmationModal } from '@/shared/widgets';

const { initialize, isInitialized, isAuthenticated, isAuthLoading } = useAuth();

// Initialize current context (will sync with auth state)
const { isReady: isContextReady } = useCurrentContext();

// Initialize auth IMMEDIATELY in setup (not onMounted)
// This must happen before router guards run to avoid timeout
initialize();

// Two-stage loader pattern (following CoursePads):
// Stage 1: Show AuthLoader while auth is initializing
// Stage 2: Show ContextLoader while org/context is loading (after auth)
// Stage 3: Show app when both are ready
const showAuthLoader = computed(() => {
  return !isInitialized.value || isAuthLoading.value;
});

const showContextLoader = computed(() => {
  // Only show context loader for authenticated users
  // who are past auth loading but context not ready yet
  return (
    isInitialized.value &&
    !isAuthLoading.value &&
    isAuthenticated.value &&
    !isContextReady.value
  );
});

const showApp = computed(() => {
  // Show app when:
  // 1. Auth is initialized and not loading, AND
  // 2. Either: user is not authenticated (no context to load), OR context is ready
  return (
    isInitialized.value &&
    !isAuthLoading.value &&
    (!isAuthenticated.value || isContextReady.value)
  );
});
</script>

<template>
  <!-- Smooth fade transition between loader stages and app -->
  <Transition name="app-fade" mode="out-in" appear>
    <!-- Stage 1: Auth loading -->
    <AuthLoader v-if="showAuthLoader" key="auth-loader" />
    <!-- Stage 2: Context loading (after auth, for authenticated users) -->
    <ContextLoader v-else-if="showContextLoader" key="context-loader" />
    <!-- Stage 3: App ready -->
    <div v-else-if="showApp" key="app" class="min-h-screen">
      <RouterView />
      <!-- Global confirmation modal -->
      <ConfirmationModal />
    </div>
  </Transition>
</template>

<style>
/* App fade transition - 250ms for optimal balance between smooth and responsive */
.app-fade-enter-active,
.app-fade-leave-active {
  transition: opacity 0.25s ease-out;
}

.app-fade-enter-from,
.app-fade-leave-to {
  opacity: 0;
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-fade-enter-active,
  .app-fade-leave-active {
    transition: none;
  }
}
</style>
