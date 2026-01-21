<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '../composables';

const { isAuthenticating, isAuthorizing } = useAuth();

const message = computed(() => {
  if (isAuthorizing.value) {
    return 'Setting up your session...';
  }
  if (isAuthenticating.value) {
    return 'Signing in...';
  }
  return 'Loading...';
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4">
      <!-- Animated spinner -->
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      <!-- Loading message -->
      <p class="text-sm text-gray-500">{{ message }}</p>
    </div>
  </div>
</template>
