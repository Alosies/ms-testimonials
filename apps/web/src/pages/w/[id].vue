<script setup lang="ts">
/**
 * Public widget preview page
 * Route: /w/:id
 *
 * Preview page for embeddable widgets.
 * Uses ID-only URL for brevity in embed codes.
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
const widgetId = computed(() => route.params.id as string)

// TODO: Fetch widget by ID
// const { data: widget, loading, error } = useGetPublicWidget({ id: widgetId })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
      <h1 class="text-2xl font-semibold text-gray-900">Widget Preview</h1>
      <p class="mt-2 text-gray-600">Widget ID: {{ widgetId }}</p>
      <!-- TODO: Add WidgetPreviewFeature component -->
    </div>
  </div>
</template>
