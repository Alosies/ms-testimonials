<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@testimonials/ui';
import type { StepType } from '@/shared/stepCards';
import { STEP_TYPE_OPTIONS } from '../../constants';

interface Props {
  open?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select', type: StepType): void;
}>();

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
        v-for="option in STEP_TYPE_OPTIONS"
        :key="option.type"
        class="flex items-start gap-3 p-2 cursor-pointer"
        @click="handleSelect(option.type)"
      >
        <Icon :icon="option.icon" class="w-5 h-5 mt-0.5 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ option.label }}</div>
          <div class="text-xs text-muted-foreground">{{ option.description }}</div>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
