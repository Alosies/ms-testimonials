<script setup lang="ts">
import { Icon } from '@testimonials/icons'
import { Button } from '@testimonials/ui'
import { formsTestIds } from '@/shared/constants/testIds'

const emit = defineEmits<{
  createForm: []
}>()
</script>

<template>
  <div :data-testid="formsTestIds.formsEmptyState" class="flex flex-col items-center justify-center py-16 px-4">
    <!-- Decorative Icon Background -->
    <div class="relative mb-6">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl transform rotate-6 scale-110" />
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl transform -rotate-3 scale-105" />
      <div class="relative bg-card rounded-2xl p-6 shadow-sm border">
        <Icon icon="heroicons:document-plus" class="h-12 w-12 text-primary" />
      </div>
    </div>

    <h2 class="text-lg font-medium text-foreground mb-2">
      No forms yet
    </h2>
    <p class="text-sm text-muted-foreground text-center max-w-sm mb-6">
      Create your first form to start collecting testimonials from your customers.
    </p>

    <Button :data-testid="formsTestIds.formsCreateButton" @click="emit('createForm')" class="gap-2">
      <Icon icon="heroicons:plus" class="h-4 w-4" />
      Create Your First Form
    </Button>
  </div>
</template>
