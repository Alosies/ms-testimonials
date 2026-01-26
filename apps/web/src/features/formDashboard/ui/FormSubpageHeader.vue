<script setup lang="ts">
/**
 * FormSubpageHeader
 *
 * Consistent header for form sub-pages with back navigation.
 * Used on: responses, analytics, testimonials, widgets, settings
 *
 * Design: Subtle back button (arrow only) with hover state,
 * title, subtitle, and optional action slot.
 */
import { Icon } from '@testimonials/icons';
import { useRouting } from '@/shared/routing';
import type { FormRef } from '@/shared/routing';

interface Props {
  /** Form reference for navigation */
  formRef: FormRef;
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
}

defineProps<Props>();

const { goToForm } = useRouting();
</script>

<template>
  <header class="flex items-start justify-between mb-8">
    <div>
      <div class="flex items-center gap-3">
        <!-- Back Button -->
        <button
          @click="goToForm(formRef)"
          class="group flex items-center justify-center rounded-lg p-2 -ml-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          title="Back to form dashboard"
        >
          <Icon icon="heroicons:arrow-left" class="h-5 w-5" />
        </button>

        <!-- Title -->
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ title }}
        </h1>
      </div>

      <!-- Subtitle -->
      <p v-if="subtitle" class="mt-1 ml-10 text-sm text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>

    <!-- Actions Slot -->
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
