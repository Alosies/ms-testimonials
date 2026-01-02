<script setup lang="ts">
import { Icon } from '@testimonials/icons'
import { Button } from '@testimonials/ui'

defineProps<{
  searchQuery: string
}>()

const emit = defineEmits<{
  clearSearch: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="relative mb-6">
      <div class="relative bg-card rounded-2xl p-6 shadow-sm border">
        <Icon icon="heroicons:magnifying-glass" class="h-12 w-12 text-muted-foreground" />
      </div>
    </div>

    <h2 class="text-lg font-medium text-foreground mb-2">
      No forms found
    </h2>
    <p class="text-sm text-muted-foreground text-center max-w-sm mb-6">
      No forms match "{{ searchQuery }}". Try a different search term.
    </p>

    <Button variant="outline" @click="emit('clearSearch')" class="gap-2">
      <Icon icon="heroicons:x-mark" class="h-4 w-4" />
      Clear Search
    </Button>
  </div>
</template>
