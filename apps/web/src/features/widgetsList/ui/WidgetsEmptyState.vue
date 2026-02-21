<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import { widgetsTestIds } from '@/shared/constants/testIds';

const emit = defineEmits<{
  createWidget: [];
}>();
</script>

<template>
  <div :data-testid="widgetsTestIds.emptyState" class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
      <Icon icon="heroicons:squares-2x2" class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-medium text-foreground mb-1">No widgets yet</h3>
    <p class="text-sm text-muted-foreground mb-6 max-w-sm">
      Create your first widget to embed testimonials on your website.
    </p>
    <Button @click="emit('createWidget')" :data-testid="widgetsTestIds.emptyStateCreateButton" class="gap-2">
      <Icon icon="heroicons:plus" class="h-4 w-4" />
      Create Widget
    </Button>
  </div>
</template>
