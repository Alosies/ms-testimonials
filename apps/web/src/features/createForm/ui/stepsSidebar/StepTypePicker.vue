<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@testimonials/ui';
import type { StepType } from '../../models/stepContent';
import { getStepIcon } from '../../functions';

interface Props {
  open?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select', type: StepType): void;
}>();

interface StepOption {
  type: StepType;
  label: string;
  description: string;
}

const options: StepOption[] = [
  { type: 'welcome', label: 'Welcome', description: 'Introduce your form' },
  { type: 'question', label: 'Question', description: 'Text or video response' },
  { type: 'rating', label: 'Rating', description: 'Star or scale rating' },
  { type: 'consent', label: 'Consent', description: 'Public/private choice' },
  { type: 'contact_info', label: 'Contact Info', description: 'Name, email, company' },
  { type: 'reward', label: 'Reward', description: 'Coupon or download' },
  { type: 'thank_you', label: 'Thank You', description: 'Confirmation message' },
];

function handleSelect(type: StepType) {
  emit('select', type);
  emit('update:open', false);
}
</script>

<template>
  <DropdownMenu :open="open" @update:open="emit('update:open', $event)">
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-64" side="right" align="start">
      <div class="text-sm font-medium px-2 py-1.5 text-muted-foreground">Add Step</div>
      <DropdownMenuItem
        v-for="option in options"
        :key="option.type"
        class="flex items-start gap-3 p-2 cursor-pointer"
        @click="handleSelect(option.type)"
      >
        <Icon :icon="getStepIcon(option.type)" class="w-5 h-5 mt-0.5 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ option.label }}</div>
          <div class="text-xs text-muted-foreground">{{ option.description }}</div>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
