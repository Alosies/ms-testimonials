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
import { WidgetBuilder } from '@/features/widgetBuilder'

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
    <div v-if="!entityInfo?.isValid" class="p-6 text-red-600">
      Invalid widget URL
    </div>
    <WidgetBuilder v-else :widget-id="widgetId" />
  </AuthLayout>
</template>
