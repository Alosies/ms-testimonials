<script setup lang="ts">
/**
 * Form Creation Wizard Page
 * Route: /:org/forms/creating
 *
 * Multi-step wizard for creating a new testimonial collection form.
 * Guides users through:
 * 1. Concept type selection (Product/Service/Event)
 * 2. Description input
 * 3. Focus areas selection
 * 4. AI question generation
 * 5. Preview and customization
 */
import { definePage } from 'unplugin-vue-router/runtime';
import { FormWizard } from '@/features/createForm';

definePage({
  meta: {
    requiresAuth: true,
  },
});
</script>

<template>
  <FormWizard />
</template>
