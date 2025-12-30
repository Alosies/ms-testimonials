<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth } from '@/features/auth';

const { initialize } = useAuth();

// Initialize auth on app mount
onMounted(() => {
  initialize();
});
</script>

<template>
  <RouterView />
</template>
