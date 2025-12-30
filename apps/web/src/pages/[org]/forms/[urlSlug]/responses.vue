<script setup lang="ts">
/**
 * Form responses page
 * Route: /:org/forms/:urlSlug/responses
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
const formId = computed(() => entityInfo.value?.entityId ?? null)
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div v-if="!entityInfo?.isValid" class="text-red-600">
        Invalid form URL
      </div>
      <div v-else>
        <h1 class="text-2xl font-semibold text-gray-900">Form Responses</h1>
        <p class="mt-2 text-gray-600">View submissions for form: {{ formId }}</p>
        <!-- TODO: Add FormResponsesFeature component -->
      </div>
    </div>
  </AuthLayout>
</template>
