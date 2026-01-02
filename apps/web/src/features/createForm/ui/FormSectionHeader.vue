<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';

export type SectionStatus = 'incomplete' | 'complete' | 'in-progress';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon: string;
    expanded: boolean;
    disabled?: boolean;
    status?: SectionStatus;
    badge?: string | number;
  }>(),
  {
    disabled: false,
    status: 'incomplete',
  }
);

const emit = defineEmits<{
  toggle: [];
}>();

const canExpand = computed(() => !props.disabled);

function handleClick() {
  if (canExpand.value) {
    emit('toggle');
  }
}

const statusIcon = computed(() => {
  switch (props.status) {
    case 'complete':
      return 'lucide:check-circle-2';
    case 'in-progress':
      return 'lucide:loader-2';
    default:
      return null;
  }
});

const statusColor = computed(() => {
  switch (props.status) {
    case 'complete':
      return 'text-green-500';
    case 'in-progress':
      return 'text-primary animate-spin';
    default:
      return 'text-gray-400';
  }
});
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left transition-colors"
    :class="{
      'cursor-pointer hover:bg-gray-50': canExpand,
      'cursor-not-allowed opacity-60': disabled,
      'border-primary/20 bg-primary/5': expanded && !disabled,
      'border-gray-200': !expanded || disabled,
    }"
    :disabled="disabled"
    @click="handleClick"
  >
    <div class="flex items-center gap-3">
      <!-- Expand/Collapse Chevron -->
      <Icon
        icon="lucide:chevron-right"
        class="h-5 w-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-90': expanded }"
      />

      <!-- Section Icon -->
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg"
        :class="{
          'bg-primary/10 text-primary': !disabled,
          'bg-gray-100 text-gray-400': disabled,
        }"
      >
        <Icon :icon="icon" class="h-4 w-4" />
      </div>

      <!-- Title and Subtitle -->
      <div>
        <h3
          class="text-sm font-medium"
          :class="{
            'text-gray-900': !disabled,
            'text-gray-400': disabled,
          }"
        >
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-xs text-gray-500">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Badge (e.g., question count) -->
      <span
        v-if="badge !== undefined && !expanded"
        class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
      >
        {{ badge }}
      </span>

      <!-- Status Icon -->
      <Icon
        v-if="statusIcon && !disabled"
        :icon="statusIcon"
        class="h-5 w-5"
        :class="statusColor"
      />

      <!-- Lock Icon for Disabled -->
      <Icon
        v-if="disabled"
        icon="lucide:lock"
        class="h-4 w-4 text-gray-400"
      />
    </div>
  </button>
</template>
