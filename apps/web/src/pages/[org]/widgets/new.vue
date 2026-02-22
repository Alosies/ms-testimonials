<script setup lang="ts">
/**
 * Create new widget page
 * Route: /:org/widgets/new
 * Query params:
 *   - formId: optional form ID to scope the widget to a specific form
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { WidgetBuilder } from '@/features/widgetBuilder'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()
const lockedFormId = computed(() => {
  const formId = route.query.formId
  return typeof formId === 'string' ? formId : null
})
</script>

<template>
  <AuthLayout>
    <WidgetBuilder :locked-form-id="lockedFormId" />
  </AuthLayout>
</template>
