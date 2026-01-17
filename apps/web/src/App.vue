<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth } from '@/features/auth';
import { useCurrentContext } from '@/shared/currentContext';
import { ConfirmationModal } from '@/shared/widgets';

const { initialize } = useAuth();

// Initialize auth IMMEDIATELY in setup (not onMounted)
// This must happen before router guards run to avoid timeout
initialize();

// Initialize current context (will sync with auth state)
useCurrentContext();
</script>

<template>
  <RouterView />
  <!-- Global confirmation modal -->
  <ConfirmationModal />
</template>
