<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
</script>

<template>
  <div class="pt-4">
    <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
      <Icon icon="heroicons:paint-brush" class="w-4 h-4 text-primary" />
      Design
    </h4>

    <div class="space-y-3">
      <!-- Theme selector placeholder -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Theme</span>
        <Button variant="outline" size="sm" disabled>
          Light
          <Icon icon="heroicons:chevron-down" class="w-4 h-4 ml-1" />
        </Button>
      </div>

      <!-- Color selector placeholder -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Accent Color</span>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground" />
          <span class="text-sm">Blue</span>
        </div>
      </div>

      <!-- Logo placeholder -->
      <div>
        <span class="text-sm text-muted-foreground block mb-2">Logo</span>
        <Button variant="outline" size="sm" class="w-full" disabled>
          <Icon icon="heroicons:arrow-up-tray" class="w-4 h-4 mr-2" />
          Upload Logo
        </Button>
      </div>

      <p class="text-xs text-muted-foreground italic">
        Branding customization coming soon.
      </p>
    </div>
  </div>
</template>
