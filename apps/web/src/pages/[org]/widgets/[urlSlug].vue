<script setup lang="ts">
/**
 * Widget editor page
 * Route: /:org/widgets/:urlSlug
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { extractEntityIdFromSlug } from '@/shared/urls'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()

const urlSlug = computed(() => route.params.urlSlug as string)
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const widgetId = computed(() => entityInfo.value?.entityId ?? null)
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div v-if="!entityInfo?.isValid" class="text-red-600">
        Invalid widget URL
      </div>
      <div v-else>
        <h1 class="text-2xl font-semibold text-gray-900">Widget Editor</h1>
        <p class="mt-2 text-gray-600">Widget ID: {{ widgetId }}</p>
        <!-- TODO: Add WidgetEditorFeature component -->
      </div>
    </div>
  </AuthLayout>
</template>
