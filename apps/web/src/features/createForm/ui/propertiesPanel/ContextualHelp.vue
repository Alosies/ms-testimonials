<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import type { StepType } from '../../models';
import { STEP_HELP_CONTENT } from '../../constants';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  stepType: StepType | null;
}

const props = defineProps<Props>();

const isOpen = ref(true);

const content = computed(() => {
  if (!props.stepType) return null;
  return STEP_HELP_CONTENT[props.stepType];
});
</script>

<template>
  <div v-if="content" class="border-b pb-4" :data-testid="studioTestIds.propertiesContextualHelp">
    <Button
      variant="ghost"
      class="flex items-center gap-2 w-full justify-start px-0 hover:bg-transparent"
      @click="isOpen = !isOpen"
    >
      <Icon icon="heroicons:book-open" class="w-4 h-4 text-primary" />
      <span class="text-sm font-medium">What's this?</span>
      <Icon
        icon="heroicons:chevron-down"
        class="w-4 h-4 ml-auto transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </Button>
    <div v-show="isOpen" class="pt-3">
      <h4 class="font-medium text-sm mb-1" :data-testid="studioTestIds.propertiesStepTypeHeading">{{ content.title }}</h4>
      <p class="text-sm text-muted-foreground mb-3">
        {{ content.description }}
      </p>
      <ul class="space-y-1.5">
        <li
          v-for="(tip, i) in content.tips"
          :key="i"
          class="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <Icon icon="heroicons:light-bulb" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>{{ tip }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
