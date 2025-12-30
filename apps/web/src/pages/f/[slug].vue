<script setup lang="ts">
/**
 * Public form collection page
 * Route: /f/:slug
 *
 * This is the customer-facing page where testimonials are submitted.
 * Uses simple slug (not slug_id pattern) for shorter, memorable URLs.
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

definePage({
  meta: {
    public: true,
  },
})

const route = useRoute()
const formSlug = computed(() => route.params.slug as string)

// TODO: Fetch form by slug
// const { data: form, loading, error } = useGetPublicForm({ slug: formSlug })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto py-12 px-4">
      <h1 class="text-2xl font-semibold text-gray-900">Testimonial Form</h1>
      <p class="mt-2 text-gray-600">Form slug: {{ formSlug }}</p>
      <!-- TODO: Add PublicFormFeature component -->
    </div>
  </div>
</template>
