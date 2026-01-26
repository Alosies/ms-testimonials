<script setup lang="ts">
/**
 * Form Dashboard page
 * Route: /:org/forms/:urlSlug
 *
 * Thin wrapper that extracts route params and renders the feature component.
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { FormDashboardPage } from '@/features/formDashboard'

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
    <div v-if="!entityInfo?.isValid" class="p-6 text-destructive">
      Invalid form URL
    </div>
    <FormDashboardPage
      v-else-if="formId"
      :form-id="formId"
      :url-slug="urlSlug"
    />
  </AuthLayout>
</template>
