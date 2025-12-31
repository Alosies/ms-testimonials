<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useApiForAI, getErrorMessage } from '@/shared/api';
import type { AIContext, AIQuestion } from '@/shared/api';
import type { FormData, QuestionData } from '../models';
import QuestionCard from './QuestionCard.vue';
import AIThinkingLoader from './AIThinkingLoader.vue';

const props = defineProps<{
  formData: FormData;
  questions: QuestionData[];
  aiContext: AIContext | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  setQuestions: [questions: AIQuestion[], context: AIContext | null];
  setLoading: [loading: boolean];
  setError: [error: string | null];
  next: [];
  prev: [];
}>();

const aiApi = useApiForAI();
const isGenerating = ref(false);

// Animation states
const showSuccess = ref(false);
const revealQuestions = ref(false);
const visibleCards = ref<number[]>([]);

async function generateQuestions() {
  if (isGenerating.value) return;

  isGenerating.value = true;
  showSuccess.value = false;
  revealQuestions.value = false;
  visibleCards.value = [];
  emit('setLoading', true);
  emit('setError', null);

  try {
    const result = await aiApi.suggestQuestions({
      product_name: props.formData.product_name,
      product_description: props.formData.product_description,
      focus_areas: props.formData.focus_areas || undefined,
    });

    emit('setQuestions', result.questions, result.inferred_context);

    // Trigger success animation sequence
    await nextTick();
    showSuccess.value = true;

    // After success animation, reveal questions
    setTimeout(() => {
      showSuccess.value = false;
      revealQuestions.value = true;

      // Stagger reveal each card
      result.questions.forEach((_, index) => {
        setTimeout(() => {
          visibleCards.value = [...visibleCards.value, index];
        }, index * 120); // 120ms stagger between cards
      });
    }, 800); // Show success for 800ms

  } catch (error) {
    emit('setError', getErrorMessage(error));
  } finally {
    isGenerating.value = false;
    emit('setLoading', false);
  }
}

async function regenerate() {
  await generateQuestions();
}

// Generate questions on mount if none exist
onMounted(async () => {
  if (props.questions.length === 0) {
    await generateQuestions();
  } else {
    // If questions already exist (coming back to this step), show them immediately
    revealQuestions.value = true;
    visibleCards.value = props.questions.map((_, i) => i);
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <AIThinkingLoader
      v-if="isLoading"
      :product-name="formData.product_name"
    />

    <!-- Success celebration (brief moment) -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showSuccess"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="relative">
          <!-- Success ring animation -->
          <div class="absolute inset-0 animate-success-ring rounded-full bg-green-500/20" />
          <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
            <Icon icon="lucide:sparkles" class="h-10 w-10 animate-success-icon" />
          </div>
        </div>
        <p class="mt-4 text-lg font-medium text-gray-900">Questions ready!</p>
        <p class="text-sm text-gray-500">Tailored for {{ formData.product_name }}</p>
      </div>
    </Transition>

    <!-- Results -->
    <template v-if="revealQuestions && !isLoading">
      <div class="flex gap-6">
        <!-- Main Content -->
        <div class="flex-1 space-y-4">
          <!-- Questions Header -->
          <Transition
            appear
            enter-active-class="transition-all duration-500 ease-out delay-100"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Suggested Questions</h2>
              <p class="mt-1 text-sm text-gray-500">
                Review the AI-generated questions. You can customize them in the next step.
              </p>
            </div>
          </Transition>

          <!-- Questions List with staggered reveal -->
          <div class="space-y-3">
            <div
              v-for="(question, index) in questions"
              :key="index"
              class="question-card-wrapper"
              :class="{
                'question-card-visible': visibleCards.includes(index),
                'question-card-hidden': !visibleCards.includes(index)
              }"
              :style="{ transitionDelay: `${index * 50}ms` }"
            >
              <QuestionCard
                :question="question"
                :index="index"
                readonly
              />
            </div>
          </div>

          <!-- Actions -->
          <Transition
            appear
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="visibleCards.length === questions.length"
              class="flex justify-between pt-2"
            >
              <Button variant="outline" size="sm" @click="regenerate">
                <Icon icon="lucide:refresh-cw" class="mr-2 h-3.5 w-3.5" />
                Regenerate
              </Button>
              <div class="space-x-3">
                <Button variant="outline" size="sm" @click="emit('prev')">Back</Button>
                <Button size="sm" :disabled="questions.length === 0" @click="emit('next')">
                  Customize
                  <Icon icon="lucide:arrow-right" class="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Sidebar: AI Analysis -->
        <Transition
          appear
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
        >
          <aside v-if="aiContext" class="hidden w-48 shrink-0 lg:block">
            <div class="sticky top-4 space-y-3 rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3">
              <div class="flex items-center gap-1.5 text-xs font-medium text-teal-700">
                <Icon icon="lucide:sparkles" class="h-3.5 w-3.5" />
                AI Analysis
              </div>

              <div class="space-y-2">
                <div>
                  <p class="text-[10px] uppercase tracking-wide text-teal-400">Industry</p>
                  <p class="text-xs font-medium text-teal-900">{{ aiContext.industry }}</p>
                </div>

                <div>
                  <p class="text-[10px] uppercase tracking-wide text-teal-400">Audience</p>
                  <p class="text-xs font-medium text-teal-900">{{ aiContext.audience }}</p>
                </div>

                <div>
                  <p class="text-[10px] uppercase tracking-wide text-teal-400">Tone</p>
                  <p class="text-xs font-medium text-teal-900">{{ aiContext.tone }}</p>
                </div>
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Question card reveal animation */
.question-card-wrapper {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.question-card-hidden {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.question-card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Success animations */
@keyframes success-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes success-icon {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-success-ring {
  animation: success-ring 0.8s ease-out forwards;
}

.animate-success-icon {
  animation: success-icon 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
