<script setup lang="ts">
/**
 * Create new widget page
 * Route: /:org/widgets/new
 */
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { WidgetBuilder } from '@/features/widgetBuilder'

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <AuthLayout>
    <WidgetBuilder />
  </AuthLayout>
</template>
