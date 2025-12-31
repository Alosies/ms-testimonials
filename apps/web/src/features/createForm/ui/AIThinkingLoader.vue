<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Icon } from '@testimonials/icons';

const props = defineProps<{
  productName: string;
}>();

// Thinking stages with typing effect
const stages = [
  {
    icon: 'lucide:scan-search',
    text: 'Analyzing product context...',
    detail: (name: string) => `Understanding what makes ${name} unique`
  },
  {
    icon: 'lucide:users',
    text: 'Identifying your audience...',
    detail: () => 'Detecting industry patterns and customer personas'
  },
  {
    icon: 'lucide:lightbulb',
    text: 'Mapping value propositions...',
    detail: () => 'Finding the transformation story'
  },
  {
    icon: 'lucide:message-square-plus',
    text: 'Crafting tailored questions...',
    detail: () => 'Applying testimonial psychology principles'
  },
];

const currentStageIndex = ref(0);
const displayedText = ref('');
const displayedDetail = ref('');
const isTypingMain = ref(true);
const showDetail = ref(false);

let stageInterval: ReturnType<typeof setInterval> | null = null;
let typeInterval: ReturnType<typeof setInterval> | null = null;

const currentStage = computed(() => stages[currentStageIndex.value]);

function typeText(text: string, target: 'main' | 'detail', callback?: () => void) {
  let index = 0;
  const speed = target === 'main' ? 30 : 20;

  typeInterval = setInterval(() => {
    if (index < text.length) {
      if (target === 'main') {
        displayedText.value = text.slice(0, index + 1);
      } else {
        displayedDetail.value = text.slice(0, index + 1);
      }
      index++;
    } else {
      if (typeInterval) clearInterval(typeInterval);
      callback?.();
    }
  }, speed);
}

function advanceStage() {
  // Reset for new stage
  displayedText.value = '';
  displayedDetail.value = '';
  showDetail.value = false;
  isTypingMain.value = true;

  const stage = stages[currentStageIndex.value];

  // Type main text
  typeText(stage.text, 'main', () => {
    isTypingMain.value = false;
    showDetail.value = true;

    // Type detail after short delay
    setTimeout(() => {
      typeText(stage.detail(props.productName), 'detail', () => {
        // Move to next stage after delay
        setTimeout(() => {
          if (currentStageIndex.value < stages.length - 1) {
            currentStageIndex.value++;
            advanceStage();
          }
          // Stay on last stage until loading completes
        }, 1500);
      });
    }, 300);
  });
}

onMounted(() => {
  advanceStage();
});

onUnmounted(() => {
  if (stageInterval) clearInterval(stageInterval);
  if (typeInterval) clearInterval(typeInterval);
});

// Floating particles for ambient effect
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 opacity-30">
      <div class="absolute inset-0 animate-gradient-shift bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 bg-[length:200%_100%]" />
    </div>

    <!-- Floating particles -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute rounded-full bg-primary/20 animate-float"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          left: `${particle.x}%`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
        }"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <!-- Stage indicator dots -->
      <div class="mb-6 flex items-center justify-center gap-2">
        <div
          v-for="(_, index) in stages"
          :key="index"
          class="h-2 w-2 rounded-full transition-all duration-500"
          :class="[
            index === currentStageIndex
              ? 'w-6 bg-primary'
              : index < currentStageIndex
                ? 'bg-primary/60'
                : 'bg-gray-300'
          ]"
        />
      </div>

      <!-- Main icon with pulse ring -->
      <div class="mb-6 flex justify-center">
        <div class="relative">
          <!-- Pulse rings -->
          <div class="absolute inset-0 animate-ping-slow rounded-full bg-primary/20" />
          <div class="absolute inset-0 animate-ping-slower rounded-full bg-primary/10" style="animation-delay: 0.5s" />

          <!-- Icon container -->
          <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25">
            <Icon
              :icon="currentStage.icon"
              class="h-8 w-8 transition-all duration-300"
              :class="{ 'animate-pulse': isTypingMain }"
            />
          </div>
        </div>
      </div>

      <!-- Typing text -->
      <div class="text-center">
        <div class="min-h-[28px]">
          <span class="text-lg font-medium text-gray-900">
            {{ displayedText }}
          </span>
          <span
            v-if="isTypingMain"
            class="ml-0.5 inline-block h-5 w-0.5 animate-blink bg-primary"
          />
        </div>

        <!-- Detail text -->
        <div class="mt-2 min-h-[20px]">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <p v-if="showDetail" class="text-sm text-gray-500">
              {{ displayedDetail }}
              <span
                v-if="displayedDetail && displayedDetail.length < currentStage.detail(productName).length"
                class="ml-0.5 inline-block h-3 w-0.5 animate-blink bg-gray-400"
              />
            </p>
          </Transition>
        </div>
      </div>

      <!-- Question preview skeletons -->
      <div class="mt-8 space-y-3">
        <div
          v-for="i in 5"
          :key="i"
          class="rounded-lg border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm transition-all duration-500"
          :class="{
            'opacity-60 scale-[0.98]': currentStageIndex < 3,
            'opacity-100 scale-100': currentStageIndex >= 3
          }"
          :style="{ transitionDelay: `${i * 100}ms` }"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-400">
              {{ i }}
            </div>
            <div class="flex-1 space-y-2">
              <div
                class="h-4 rounded bg-gradient-to-r from-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]"
                :style="{ width: `${70 + Math.random() * 20}%` }"
              />
              <div
                class="h-3 rounded bg-gradient-to-r from-gray-100 to-gray-50 animate-shimmer bg-[length:200%_100%]"
                :style="{ width: `${40 + Math.random() * 20}%`, animationDelay: '0.2s' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(10vh) scale(1);
  }
  100% {
    transform: translateY(0vh) scale(0);
    opacity: 0;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes ping-slow {
  0% { transform: scale(1); opacity: 0.5; }
  75%, 100% { transform: scale(1.5); opacity: 0; }
}

@keyframes ping-slower {
  0% { transform: scale(1); opacity: 0.3; }
  75%, 100% { transform: scale(1.8); opacity: 0; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-gradient-shift {
  animation: gradient-shift 3s ease infinite;
}

.animate-float {
  animation: float linear infinite;
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-ping-slower {
  animation: ping-slower 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-blink {
  animation: blink 0.8s step-end infinite;
}
</style>
