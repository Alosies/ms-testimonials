<script setup lang="ts">
/**
 * Form Analytics page
 * Route: /:org/forms/:urlSlug/analytics
 *
 * Dedicated page for form analytics dashboard.
 * Separated from the main form dashboard to avoid loading
 * analytics data on every dashboard visit.
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { FormDashboard, FormSubpageHeader } from '@/features/formDashboard'
import FormSubpageLayout from '@/layouts/FormSubpageLayout.vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()

const urlSlug = computed(() => route.params.urlSlug as string)
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const formId = computed(() => entityInfo.value?.entityId ?? null)

// Create a FormRef object for navigation
const formRef = computed(() => ({
  id: formId.value ?? '',
  name: entityInfo.value?.slug ?? 'form',
}))
</script>

<template>
  <FormSubpageLayout>
    <div v-if="!entityInfo?.isValid" class="text-destructive">
      Invalid form URL
    </div>
    <template v-else-if="formId">
      <FormSubpageHeader
        :form-ref="formRef"
        title="Analytics"
        subtitle="View form performance metrics and insights"
      />

      <!-- Analytics Dashboard -->
      <FormDashboard :form-id="formId" />
    </template>
  </FormSubpageLayout>
</template>
