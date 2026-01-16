<script setup lang="ts">
import { LandingPage } from '@/features/landing'
import { useAuthRedirect } from '@/shared/currentContext'

defineOptions({
  name: 'HomePage',
})

// Redirect authenticated users to dashboard
const { isRedirecting } = useAuthRedirect()
</script>

<template>
  <!-- Show loading while redirecting authenticated user -->
  <div
    v-if="isRedirecting()"
    class="min-h-screen flex items-center justify-center"
  >
    <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>

  <!-- Show landing page for unauthenticated users -->
  <LandingPage v-else />
</template>
