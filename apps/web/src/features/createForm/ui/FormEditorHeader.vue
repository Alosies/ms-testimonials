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
  save: [];
  'update:formName': [value: string];
}>();

function handleBack() {
  // TODO: Check for unsaved changes
  emit('back');
}

function handleSave() {
  emit('save');
}
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4 bg-background">
    <!-- Left: Back button + Divider + Title -->
    <div class="flex items-center">
      <!-- Back button -->
      <button
        class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 -ml-2 rounded-md hover:bg-muted/50"
        @click="handleBack"
      >
        <Icon icon="heroicons:arrow-left" class="size-4" />
        <span>Forms</span>
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

        <!-- Status Pill - Modern pattern from UX philosophy -->
        <!-- Saved state (green pill, will disappear) -->
        <div
          v-if="saveStatus === 'saved'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium transition-all"
        >
          <Icon icon="heroicons:check" class="size-3.5" />
          <span>Saved</span>
        </div>

        <!-- Saving state (amber pill with spinner) -->
        <div
          v-else-if="saveStatus === 'saving'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium"
        >
          <Icon icon="heroicons:arrow-path" class="size-3.5 animate-spin" />
          <span>Saving</span>
        </div>

        <!-- Unsaved state (amber pill with dot + keyboard hint) -->
        <button
          v-else-if="saveStatus === 'unsaved'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
          @click="handleSave"
        >
          <span class="size-1.5 rounded-full bg-amber-500" />
          <span>Unsaved</span>
          <kbd class="ml-0.5 rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px] text-amber-600">
            ⌘S
          </kbd>
        </button>

        <!-- Error state (red pill) -->
        <div
          v-else-if="saveStatus === 'error'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium"
        >
          <Icon icon="heroicons:exclamation-circle" class="size-3.5" />
          <span>Error saving</span>
        </div>
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
