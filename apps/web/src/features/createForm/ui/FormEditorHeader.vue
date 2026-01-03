<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

interface Props {
  formName: string;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  canPublish: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  back: [];
  preview: [];
  publish: [];
  'update:formName': [value: string];
}>();

function handleBack() {
  // TODO: Check for unsaved changes
  emit('back');
}
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4">
    <!-- Left: Back button + Title -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" @click="handleBack">
        <Icon icon="heroicons:arrow-left" class="mr-2 size-4" />
        Back to Forms
      </Button>

      <div class="flex items-center gap-2">
        <input
          :value="formName"
          class="border-0 bg-transparent text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
          @input="emit('update:formName', ($event.target as HTMLInputElement).value)"
        />

        <!-- Save status indicator -->
        <span
          v-if="saveStatus === 'saving'"
          class="text-xs text-muted-foreground"
        >
          Saving...
        </span>
        <span
          v-else-if="saveStatus === 'saved'"
          class="text-xs text-emerald-600"
        >
          Saved
        </span>
        <span
          v-else-if="saveStatus === 'unsaved'"
          class="text-xs text-amber-600"
        >
          Unsaved changes
        </span>
        <span
          v-else-if="saveStatus === 'error'"
          class="text-xs text-red-600"
        >
          Error saving
        </span>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" @click="emit('preview')">
        <Icon icon="heroicons:eye" class="mr-2 size-4" />
        Preview
      </Button>
      <Button
        size="sm"
        :disabled="!canPublish"
        @click="emit('publish')"
      >
        Publish
      </Button>
    </div>
  </div>
</template>
