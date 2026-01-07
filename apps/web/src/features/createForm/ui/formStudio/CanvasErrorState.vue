<script setup lang="ts">
/**
 * Canvas Error State
 *
 * Displays a user-friendly error/loading message in the canvas area when
 * Form Studio fails to load steps data. Shown inline within the
 * studio layout rather than replacing the entire page.
 *
 * Design: Clean, minimal, non-alarming
 */
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';

defineProps<{
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="flex items-center justify-center h-full p-8">
    <div class="max-w-md w-full text-center">
      <!-- Simple icon -->
      <div class="flex justify-center mb-5">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          :class="isLoading ? 'bg-primary/10' : 'bg-destructive/10'"
        >
          <Icon
            v-if="isLoading"
            icon="heroicons:arrow-path"
            class="w-6 h-6 text-primary animate-spin"
          />
          <Icon
            v-else
            icon="heroicons:x-circle"
            class="w-6 h-6 text-destructive"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-1.5 mb-5">
        <h3 class="text-base font-medium text-foreground">
          {{ isLoading ? 'Loading form steps...' : 'Unable to load steps' }}
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{
            isLoading
              ? 'Please wait while we fetch your form data.'
              : 'Something went wrong. Please try again.'
          }}
        </p>
      </div>

      <!-- Action button -->
      <Button
        v-if="!isLoading"
        variant="outline"
        size="sm"
        @click="emit('retry')"
      >
        <Icon icon="heroicons:arrow-path" class="w-4 h-4 mr-2" />
        Try Again
      </Button>

      <!-- Help callout -->
      <div
        v-if="!isLoading"
        class="mt-8 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center gap-2"
      >
        <Icon icon="heroicons:information-circle" class="w-4 h-4 text-primary shrink-0" />
        <p class="text-xs text-muted-foreground text-left">
          This is likely a temporary issue and our support team is probably already on it. If it persists, please contact support.
        </p>
      </div>
    </div>
  </div>
</template>
