<script setup lang="ts">
/**
 * Create new form page
 * Route: /:org/forms/new
 */
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { CreateFormFeature } from '@/features/createForm'

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <AuthLayout>
    <CreateFormFeature />
  </AuthLayout>
</template>
