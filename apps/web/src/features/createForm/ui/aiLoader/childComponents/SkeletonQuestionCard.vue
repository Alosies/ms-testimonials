<script setup lang="ts">
/**
 * Glass-styled skeleton card for question preview during loading.
 */
defineProps<{
  index: number;
  isRevealed: boolean;
}>();
</script>

<template>
  <div
    class="rounded-lg border border-gray-200/80 bg-white/60 p-3 backdrop-blur-sm transition-all duration-500"
    :class="isRevealed ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'"
    :style="{ transitionDelay: `${index * 100}ms` }"
  >
    <div class="flex items-start gap-3">
      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-400">
        {{ index + 1 }}
      </div>
      <div class="flex-1 space-y-2">
        <div class="shimmer-bar h-3 rounded" :style="{ width: `${70 + (index * 5) % 20}%` }" />
        <div class="shimmer-bar h-2 rounded" :style="{ width: `${40 + (index * 7) % 20}%` }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer-bar {
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: shimmer-glass 2s ease-in-out infinite;
}

@keyframes shimmer-glass {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
