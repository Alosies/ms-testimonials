<script setup lang="ts">
/**
 * Status Section - Modern minimal card
 */
import { computed } from 'vue';
import { Switch } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStatus } from '../composables';

interface Props {
  status: FormStatus;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:status': [value: FormStatus];
}>();

const isPublished = computed(() => props.status === 'published');

function onCheckedChange(checked: boolean) {
  emit('update:status', checked ? 'published' : 'draft');
}
</script>

<template>
  <div class="group p-5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/50 transition-all">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <Icon
            :icon="isPublished ? 'heroicons:signal' : 'heroicons:eye-slash'"
            :class="['w-4 h-4', isPublished ? 'text-emerald-500' : 'text-muted-foreground']"
          />
          <h3 class="text-sm font-medium text-foreground">Status</h3>
        </div>
        <p class="text-xs text-muted-foreground">
          {{ isPublished ? 'Live and collecting' : 'Hidden from public' }}
        </p>
      </div>
      <Switch
        id="form-status"
        :model-value="isPublished"
        @update:model-value="onCheckedChange"
      />
    </div>
    <div
      :class="[
        'mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
        isPublished
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      ]"
    >
      <span
        :class="[
          'w-1.5 h-1.5 rounded-full',
          isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
        ]"
      />
      {{ isPublished ? 'Published' : 'Draft' }}
    </div>
  </div>
</template>
