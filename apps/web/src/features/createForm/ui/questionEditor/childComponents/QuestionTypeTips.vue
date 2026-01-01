<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { QuestionTypeId } from '@/shared/api';

const props = defineProps<{
  questionTypeId: QuestionTypeId | null;
}>();

// Tips configuration for each question type
const tipsConfig: Record<
  string,
  {
    title: string;
    description: string;
    bestFor: string[];
    proTip?: string;
    examples?: string[];
  }
> = {
  text_short: {
    title: 'Short answer',
    description: 'Single-line text input for brief responses.',
    bestFor: ['Names and titles', 'Job roles', 'Company names', 'One-liner quotes'],
    proTip: 'Use placeholder text to show the expected format or length.',
    examples: ['What is your job title?', "What's your company name?"],
  },
  text_long: {
    title: 'Paragraph',
    description: 'Multi-line textarea for detailed, open-ended responses.',
    bestFor: [
      'Detailed feedback',
      'Story-based testimonials',
      'Problem/solution narratives',
      'Feature suggestions',
    ],
    proTip:
      'Add help text with prompts like "Be specific about results" to encourage quality responses.',
    examples: [
      'What specific results have you achieved?',
      'Describe your experience before and after using our product.',
    ],
  },
  rating_star: {
    title: 'Star rating',
    description: '5-star rating familiar from reviews and e-commerce.',
    bestFor: [
      'Overall satisfaction',
      'Product quality ratings',
      'Service experience',
      'Recommendation likelihood',
    ],
    proTip:
      '5 stars is the most universally recognized scale. Pair with a follow-up text question to understand the "why".',
  },
  rating_scale: {
    title: 'Linear scale',
    description: 'Numeric scale for precise measurement and benchmarking.',
    bestFor: [
      'NPS surveys (0-10)',
      'Satisfaction scores (1-5)',
      'Likelihood to recommend',
      'Agreement scales',
    ],
    proTip:
      'Odd-numbered scales (5, 7) allow a neutral midpoint. Even scales (1-10) force a directional choice.',
    examples: [
      'How likely are you to recommend us? (0-10)',
      'Rate your satisfaction with our support (1-5)',
    ],
  },
  input_switch: {
    title: 'Switch',
    description: 'Binary choice for simple yes/no or true/false questions.',
    bestFor: [
      'Permission questions',
      'Simple confirmations',
      'Feature usage checks',
      'Consent collection',
    ],
    proTip: 'Use for questions with clear binary answers. Avoid for nuanced opinions.',
    examples: [
      'Would you recommend us to a colleague?',
      'Can we use your testimonial on our website?',
    ],
  },
  input_checkbox: {
    title: 'Checkbox',
    description: 'Single checkbox for agreement or opt-in.',
    bestFor: ['Terms acceptance', 'Newsletter opt-in', 'Permission grants', 'Single confirmations'],
    proTip: 'Great for compliance-related questions or optional permissions.',
    examples: [
      'I agree to share my testimonial publicly',
      'Keep me updated on new features',
    ],
  },
  choice_single: {
    title: 'Multiple choice',
    description: 'Radio buttons for selecting one option from a list.',
    bestFor: [
      'Categorical selection',
      'Experience level',
      'Primary use case',
      'Demographic questions',
    ],
    proTip: 'Limit to 5-7 options for best UX. Use "Other" option if answers might vary.',
    examples: ['How did you hear about us?', 'What best describes your role?'],
  },
  choice_multiple: {
    title: 'Checkboxes',
    description: 'Checkboxes for selecting multiple options from a list.',
    bestFor: [
      'Features used',
      'Benefits experienced',
      'Multiple pain points',
      'Interest areas',
    ],
    proTip: 'Consider adding "Select all that apply" in the question or help text.',
    examples: [
      'Which features do you use most? (Select all that apply)',
      'What benefits have you experienced?',
    ],
  },
};

const currentTips = computed(() => {
  if (!props.questionTypeId) return null;
  return tipsConfig[props.questionTypeId] || null;
});
</script>

<template>
  <aside class="h-full border-l bg-slate-50/50">
    <div class="p-5">
      <!-- Header -->
      <div class="mb-4 flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
          <Icon icon="lucide:lightbulb" class="h-4 w-4 text-amber-600" />
        </div>
        <span class="text-sm font-semibold text-slate-700">Tips</span>
      </div>

      <div v-if="currentTips" class="space-y-4">
        <!-- Type Title & Description -->
        <div>
          <h3 class="text-sm font-medium text-slate-900">{{ currentTips.title }}</h3>
          <p class="mt-1 text-xs leading-relaxed text-slate-500">
            {{ currentTips.description }}
          </p>
        </div>

        <!-- Best For -->
        <div>
          <h4 class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Best for
          </h4>
          <ul class="space-y-1.5">
            <li
              v-for="item in currentTips.bestFor"
              :key="item"
              class="flex items-start gap-2 text-xs text-slate-600"
            >
              <Icon icon="lucide:check" class="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Pro Tip -->
        <div v-if="currentTips.proTip" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div class="flex gap-2">
            <Icon icon="lucide:sparkles" class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
            <div>
              <span class="text-xs font-medium text-amber-700">Pro tip</span>
              <p class="mt-0.5 text-xs leading-relaxed text-amber-600">
                {{ currentTips.proTip }}
              </p>
            </div>
          </div>
        </div>

        <!-- Example Questions -->
        <div v-if="currentTips.examples?.length">
          <h4 class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Example questions
          </h4>
          <ul class="space-y-2">
            <li
              v-for="example in currentTips.examples"
              :key="example"
              class="rounded border border-slate-200 bg-white px-2.5 py-2 text-xs italic text-slate-600"
            >
              "{{ example }}"
            </li>
          </ul>
        </div>
      </div>

      <!-- Fallback when no type selected -->
      <div v-else class="py-8 text-center">
        <Icon icon="lucide:info" class="mx-auto h-8 w-8 text-slate-300" />
        <p class="mt-2 text-xs text-slate-400">
          Select a question type to see helpful tips
        </p>
      </div>
    </div>
  </aside>
</template>
