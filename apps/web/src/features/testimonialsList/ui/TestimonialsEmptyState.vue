<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';

interface Props {
  context: 'org' | 'form';
}

defineProps<Props>();

const emit = defineEmits<{
  navigateToForms: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <!-- Decorative icon -->
    <div class="relative mb-6">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl" />
      <div class="relative bg-card rounded-2xl p-6 shadow-sm border">
        <Icon icon="heroicons:chat-bubble-bottom-center-text" class="h-12 w-12 text-primary" />
      </div>
    </div>

    <template v-if="context === 'org'">
      <h2 class="text-lg font-medium text-foreground mb-2">No testimonials yet</h2>
      <p class="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Share your collection forms to start receiving testimonials from your customers.
      </p>
      <Button @click="emit('navigateToForms')" class="gap-2">
        <Icon icon="heroicons:document-text" class="h-4 w-4" />
        View Forms
      </Button>
    </template>

    <template v-else>
      <h2 class="text-lg font-medium text-foreground mb-2">No testimonials from this form yet</h2>
      <p class="text-sm text-muted-foreground text-center max-w-sm">
        Share the form link to start collecting testimonials from your customers.
      </p>
    </template>
  </div>
</template>
