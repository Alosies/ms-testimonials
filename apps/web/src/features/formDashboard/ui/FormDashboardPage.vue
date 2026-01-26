<script setup lang="ts">
/**
 * FormDashboardPage
 *
 * Main form dashboard feature component composing:
 * - Page header
 * - Share form section
 * - Quick action cards (including link to Analytics)
 */
import { computed } from 'vue';
import FormShareSection from './FormShareSection.vue';
import FormQuickActions from './FormQuickActions.vue';

interface Props {
  /** Form ID extracted from URL */
  formId: string;
  /** URL slug for generating shareable link */
  urlSlug: string;
}

const props = defineProps<Props>();

// Create FormRef for routing
const formRef = computed(() => ({
  id: props.formId,
  name: props.urlSlug.split('_')[0] ?? 'form',
}));

// Generate shareable form URL
const formUrl = computed(() => {
  return `${window.location.origin}/f/${props.urlSlug}`;
});
</script>

<template>
  <div class="min-h-full bg-background">
    <div class="mx-auto max-w-6xl px-6 py-8">
      <!-- Page Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          Form Dashboard
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage your form
        </p>
      </header>

      <!-- Share Form Section -->
      <div class="mb-8">
        <FormShareSection :form-url="formUrl" />
      </div>

      <!-- Quick Actions -->
      <FormQuickActions :form-ref="formRef" />
    </div>
  </div>
</template>
