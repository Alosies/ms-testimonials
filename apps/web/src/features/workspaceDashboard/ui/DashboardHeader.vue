<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useCurrentContextStore } from '@/shared/currentContext';

const contextStore = useCurrentContextStore();
const { user, organization } = toRefs(contextStore);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const displayName = computed(() => {
  if (user.value?.name) return user.value.name;
  if (user.value?.email) return user.value.email.split('@')[0];
  return '';
});
</script>

<template>
  <section class="relative bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30"
          >
            <Icon icon="heroicons:chat-bubble-bottom-center-text" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl lg:text-2xl font-bold text-white tracking-tight">
              {{ greeting }}{{ displayName ? `, ${displayName}` : '' }}!
            </h1>
            <p class="text-sm text-white/80 mt-1">
              {{ organization?.name ?? 'Your Testimonials Dashboard' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
