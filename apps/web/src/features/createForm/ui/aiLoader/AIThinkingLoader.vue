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
  <div class="relative overflow-hidden rounded-2xl">
    <!-- Animated gradient background -->
    <GlassmorphicBackground />

    <!-- Main glass container - light theme -->
    <div class="relative z-10 m-4 rounded-xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-black/5 backdrop-blur-xl">
      <!-- Inner glow - subtle teal accent -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5" />

      <div class="relative z-10">
        <!-- Stage dots -->
        <div class="mb-6 flex items-center justify-center gap-3">
          <div
            v-for="(_, index) in stages"
            :key="index"
            class="relative h-2 rounded-full transition-all duration-500"
            :class="[
              index === currentStageIndex
                ? 'w-6 bg-teal-500 shadow-md shadow-teal-500/30'
                : index < currentStageIndex
                  ? 'w-2 bg-teal-500/70'
                  : 'w-2 bg-gray-300'
            ]"
          />
        </div>

        <!-- Icon with effects -->
        <div class="mb-6 flex justify-center">
          <div class="relative">
            <!-- Orbital ring -->
            <div class="absolute -inset-4 animate-spin-slow rounded-full border border-dashed border-teal-400/40" />
            <!-- Pulse rings -->
            <div class="absolute -inset-2 animate-ping-slow rounded-full bg-teal-500/20" />
            <div class="absolute -inset-3 animate-ping-slower rounded-full bg-teal-500/10 [animation-delay:0.5s]" />

            <!-- Icon box with gradient -->
            <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
              <!-- Sparkles -->
              <div class="absolute -right-1 -top-1 h-1.5 w-1.5 animate-sparkle rounded-full bg-white" />
              <div class="absolute -bottom-1 -left-1 h-1 w-1 animate-sparkle rounded-full bg-teal-300 [animation-delay:0.5s]" />

              <Icon
                :icon="currentStage.icon"
                class="relative z-10 h-8 w-8 text-white transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <!-- Text content -->
        <div class="text-center">
          <!-- Main text - fades in -->
          <div class="min-h-[28px]">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <span :key="displayedText" class="inline-block text-lg font-medium text-gray-800">
                {{ displayedText }}
              </span>
            </Transition>
          </div>

          <!-- Detail text - typing effect -->
          <div class="mt-2 min-h-[20px]">
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
            >
              <p v-if="showDetail" class="text-sm text-gray-500">
                {{ displayedDetail }}
                <span
                  v-if="isTypingDetail"
                  class="ml-0.5 inline-block h-3 w-0.5 animate-blink rounded-full bg-teal-500"
                />
              </p>
            </Transition>
          </div>
        </div>

        <!-- Skeleton cards -->
        <div class="mt-8 space-y-3">
          <SkeletonQuestionCard
            v-for="i in 5"
            :key="i"
            :index="i - 1"
            :is-revealed="isLastStage"
          />
        </div>
      </div>
    </div>
  </div>
</template>
