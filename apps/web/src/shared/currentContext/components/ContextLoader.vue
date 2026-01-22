<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@testimonials/icons';

// Loading stages for context/workspace setup
const stages = [
  { icon: 'lucide:building-2', text: 'Loading your workspace', detail: 'Fetching organization data...' },
  { icon: 'lucide:folder-open', text: 'Preparing your forms', detail: 'Loading configurations...' },
  { icon: 'lucide:layout-dashboard', text: 'Building your dashboard', detail: 'Almost ready...' },
];

const currentStageIndex = ref(0);
let stageInterval: ReturnType<typeof setInterval> | null = null;

const currentStage = computed(() => stages[currentStageIndex.value]);

onMounted(() => {
  // Progress through stages every 1.5 seconds
  stageInterval = setInterval(() => {
    if (currentStageIndex.value < stages.length - 1) {
      currentStageIndex.value++;
    }
  }, 1500);
});

onUnmounted(() => {
  if (stageInterval) {
    clearInterval(stageInterval);
  }
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-hidden">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <!-- Radial pulse waves from center -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div class="context-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/30" />
        <div class="context-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/20 [animation-delay:-1s]" />
        <div class="context-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-100/15 [animation-delay:-2s]" />
      </div>

      <!-- Corner glows -->
      <div class="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />

      <!-- Center glow -->
      <div class="center-glow absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center px-8">
      <!-- Animated icon -->
      <div class="mb-8 flex justify-center">
        <div class="relative animate-float-gentle">
          <!-- Pulse rings -->
          <div class="absolute -inset-3 animate-ping-slow rounded-full bg-teal-500/10" />
          <div class="absolute -inset-5 animate-ping-slower rounded-full bg-teal-500/5" />

          <!-- Icon container with transition -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-90"
            mode="out-in"
          >
            <div
              :key="currentStageIndex"
              class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25"
            >
              <Icon
                :icon="currentStage.icon"
                class="h-8 w-8 text-white"
              />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Stage progress dots -->
      <div class="mb-6 flex items-center gap-2">
        <div
          v-for="(_, index) in stages"
          :key="index"
          class="h-1.5 rounded-full transition-all duration-500"
          :class="[
            index === currentStageIndex
              ? 'w-6 bg-teal-500 shadow-sm shadow-teal-500/30'
              : index < currentStageIndex
                ? 'w-1.5 bg-teal-500/60'
                : 'w-1.5 bg-gray-200'
          ]"
        />
      </div>

      <!-- Loading text with transition -->
      <div class="text-center">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
          mode="out-in"
        >
          <div :key="currentStageIndex" class="flex flex-col items-center gap-2">
            <span class="text-lg font-medium text-foreground">
              {{ currentStage.text }}
            </span>
            <span class="text-sm text-muted-foreground">
              {{ currentStage.detail }}
            </span>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Expanding radial waves */
.context-wave {
  animation: context-expand-wave 3s ease-out infinite;
}

@keyframes context-expand-wave {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Center glow pulse */
.center-glow {
  background: radial-gradient(circle, rgba(204, 251, 241, 0.5) 0%, rgba(204, 251, 241, 0.2) 40%, transparent 70%);
  animation: center-glow-pulse 3s ease-in-out infinite;
}

@keyframes center-glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

</style>
