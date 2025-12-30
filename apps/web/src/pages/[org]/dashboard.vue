<script setup lang="ts">
/**
 * Organization dashboard page
 * Route: /:org/dashboard
 */
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { WorkspaceDashboard } from '@/features/workspaceDashboard'

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <AuthLayout>
    <WorkspaceDashboard />
  </AuthLayout>
</template>
