<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, RewardContent } from '../../../models/stepContent';
import { isRewardStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): RewardContent | null => {
  if (isRewardStep(props.step)) {
    return props.step.content;
  }
  return null;
});

const rewardIcon = computed(() => {
  if (!content.value) return 'heroicons:gift';
  switch (content.value.rewardType) {
    case 'coupon': return 'heroicons:ticket';
    case 'download': return 'heroicons:arrow-down-tray';
    case 'link': return 'heroicons:link';
    default: return 'heroicons:gift';
  }
});
</script>

<template>
  <div v-if="content" class="text-center">
    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
      <Icon :icon="rewardIcon" class="w-6 h-6 text-primary" />
    </div>
    <h3 class="font-medium mb-1">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground">{{ content.description }}</p>
    <div v-if="content.couponCode" class="mt-3 p-2 bg-muted rounded-lg font-mono text-sm">
      {{ content.couponCode }}
    </div>
  </div>
</template>
