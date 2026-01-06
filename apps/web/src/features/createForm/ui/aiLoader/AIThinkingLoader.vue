<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { useTypingEffect, type TypingStage } from '../../composables/useTypingEffect';
import GlassmorphicBackground from './childComponents/GlassmorphicBackground.vue';
import SkeletonQuestionCard from './childComponents/SkeletonQuestionCard.vue';

const props = defineProps<{
  productName: string;
}>();

// Stage variants for variety - randomly selected on each load
const stageVariants = {
  // Step 1: Understanding context
  context: [
    { text: 'Analyzing your product context', detail: (name: string) => `Identifying transformation story for ${name}` },
    { text: 'Understanding your context', detail: (name: string) => `Mapping value propositions for ${name}` },
    { text: 'Processing product details', detail: (name: string) => `Extracting key differentiators from ${name}` },
  ],
  // Step 2: Narrative framework application
  framework: [
    { text: 'Applying narrative framework', detail: () => 'Positioning customer as the hero of the story' },
    { text: 'Structuring transformation arc', detail: () => 'Before → During → After story flow' },
    { text: 'Building story structure', detail: () => 'Mapping the customer journey narrative' },
  ],
  // Step 3: Psychology/methodology
  methodology: [
    { text: 'Applying social proof principles', detail: () => 'Optimizing for authentic persuasion' },
    { text: 'Calibrating response methodology', detail: () => 'Voice of Customer best practices' },
    { text: 'Applying testimonial psychology', detail: () => 'Struggle → Discovery → Transformation sequence' },
  ],
  // Step 4: AI generation
  generation: [
    { text: 'Generating your questions', detail: () => 'Crafting for maximum response quality' },
    { text: 'Finalizing question sequence', detail: () => 'Fine-tuning for authentic responses' },
    { text: 'Assembling your questions', detail: () => 'Optimizing for compelling testimonials' },
  ],
};

// Pick random variant from each stage
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const stages: TypingStage[] = [
  { icon: 'lucide:scan-search', ...pickRandom(stageVariants.context) },
  { icon: 'lucide:book-open', ...pickRandom(stageVariants.framework) },
  { icon: 'lucide:brain', ...pickRandom(stageVariants.methodology) },
  { icon: 'lucide:sparkles', ...pickRandom(stageVariants.generation) },
];

const {
  currentStageIndex,
  displayedText,
  displayedDetail,
  showDetail,
  isTypingDetail,
  start,
} = useTypingEffect(stages, props.productName);

const currentStage = computed(() => stages[currentStageIndex.value]);
const isLastStage = computed(() => currentStageIndex.value >= 3);

onMounted(start);
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <!-- Animated gradient background - fills entire viewport -->
    <GlassmorphicBackground class="absolute inset-0" />

    <!-- Main content area - centered -->
    <div class="relative z-10 w-full max-w-2xl px-8 py-8">

      <div class="relative z-10">
        <!-- AI Status Indicator - Above icon -->
        <div class="mb-6 flex items-center justify-center gap-2">
          <Icon icon="lucide:sparkles" class="h-5 w-5 text-teal-500 drop-shadow-[0_0_6px_rgba(20,184,166,0.4)]" />
          <span class="text-lg font-medium text-gray-700">Generating with AI</span>
          <div class="flex gap-1">
            <span class="ai-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span class="ai-dot h-1.5 w-1.5 rounded-full bg-teal-500 [animation-delay:0.2s]" />
            <span class="ai-dot h-1.5 w-1.5 rounded-full bg-teal-500 [animation-delay:0.4s]" />
          </div>
        </div>

        <!-- Icon with pulse effect - Main focus -->
        <div class="mb-6 flex justify-center">
          <div class="relative animate-float-gentle">
            <!-- Pulse rings -->
            <div class="absolute -inset-4 animate-ping-slow rounded-full bg-teal-500/10" />
            <div class="absolute -inset-6 animate-ping-slower rounded-full bg-teal-500/5" />

            <!-- Icon box - slides right to left on stage change -->
            <Transition
              enter-active-class="transition-all duration-400 ease-out"
              enter-from-class="opacity-0 translate-x-6"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-6"
              mode="out-in"
            >
              <div
                :key="currentStageIndex"
                class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl shadow-teal-500/25"
              >
                <Icon
                  :icon="currentStage.icon"
                  class="h-10 w-10 text-white"
                />
              </div>
            </Transition>
          </div>
        </div>

        <!-- Stage dots - positioned below icon -->
        <div class="mb-6 flex items-center justify-center gap-2.5">
          <div
            v-for="(_, index) in stages"
            :key="index"
            class="relative h-1.5 rounded-full transition-all duration-500"
            :class="[
              index === currentStageIndex
                ? 'w-5 bg-teal-500 shadow-sm shadow-teal-500/30'
                : index < currentStageIndex
                  ? 'w-1.5 bg-teal-500/60'
                  : 'w-1.5 bg-gray-300/60'
            ]"
          />
        </div>

        <!-- Text content with horizontal slide transitions -->
        <div class="text-center">
          <!-- Main text - slides left/right on change -->
          <div class="min-h-[32px] overflow-hidden">
            <Transition
              enter-active-class="transition-all duration-400 ease-out"
              enter-from-class="opacity-0 translate-x-12"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-12"
              mode="out-in"
            >
              <span :key="currentStageIndex" class="inline-block text-xl font-medium text-gray-800">
                {{ displayedText }}
              </span>
            </Transition>
          </div>

          <!-- Detail text - slides left/right with typing effect -->
          <div class="mt-3 min-h-[24px] overflow-hidden">
            <Transition
              enter-active-class="transition-all duration-300 ease-out delay-75"
              enter-from-class="opacity-0 translate-x-8"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-8"
              mode="out-in"
            >
              <p v-if="showDetail" :key="currentStageIndex" class="text-sm text-gray-500">
                {{ displayedDetail }}
                <span
                  v-if="isTypingDetail"
                  class="ml-0.5 inline-block h-3.5 w-0.5 animate-blink rounded-full bg-teal-500"
                />
              </p>
            </Transition>
          </div>
        </div>

        <!-- Skeleton cards - reduced to 3 for better visual balance -->
        <div class="mt-12 space-y-2.5 opacity-80">
          <SkeletonQuestionCard
            v-for="i in 3"
            :key="i"
            :index="i - 1"
            :is-revealed="isLastStage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animated loading dots - requires scale+opacity which Tailwind can't combine */
.ai-dot {
  animation: dot-pulse 1.4s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

