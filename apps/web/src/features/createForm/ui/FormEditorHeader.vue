<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { SaveStatusPill, type SaveStatus } from '@/shared/widgets';

interface Props {
  formName: string;
  saveStatus: SaveStatus;
  canPublish: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  back: [];
  preview: [];
  publish: [];
  save: [];
  'update:formName': [value: string];
}>();

function handleBack() {
  // TODO: Check for unsaved changes
  emit('back');
}
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4 bg-background">
    <!-- Left: Back button + Divider + Title -->
    <div class="flex items-center">
      <!-- Exit Studio button -->
      <button
        class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 -ml-2 rounded-md hover:bg-muted/50"
        @click="handleBack"
      >
        <Icon icon="heroicons:arrow-left" class="size-4" />
        <span>Exit Studio</span>
      </button>

      <!-- Divider -->
      <div class="mx-3 h-5 w-px bg-border" />

      <!-- Form name input -->
      <div class="flex items-center gap-3">
        <input
          :value="formName"
          class="border-0 bg-transparent text-base font-medium text-foreground focus:outline-none focus:ring-0 min-w-[200px] max-w-[300px] truncate hover:bg-muted/30 rounded px-2 py-1 -ml-2 transition-colors"
          @input="emit('update:formName', ($event.target as HTMLInputElement).value)"
        />

        <!-- Status Pill -->
        <SaveStatusPill
          :status="saveStatus"
          @save="emit('save')"
        />
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        class="text-muted-foreground hover:text-foreground"
        @click="emit('preview')"
      >
        <Icon icon="heroicons:eye" class="mr-1.5 size-4" />
        Preview
      </Button>
      <Button
        size="sm"
        :disabled="!canPublish"
        @click="emit('publish')"
      >
        <Icon icon="heroicons:rocket-launch" class="mr-1.5 size-4" />
        Publish
      </Button>
    </div>
  </div>
</template>
