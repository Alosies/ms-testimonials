<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth } from '@/features/auth';
import { useCurrentContext } from '@/shared/currentContext';

const { initialize } = useAuth();

// Initialize current context (will sync with auth state)
useCurrentContext();

// Initialize auth on app mount
onMounted(() => {
  initialize();
});
</script>

<template>
  <RouterView />
</template>
