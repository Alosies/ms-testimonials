<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import { useRouter } from 'vue-router';
import { Button } from '@testimonials/ui';
import { useAuth } from '@/features/auth';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const router = useRouter();
const { currentUser, logout } = useAuth();

async function handleLogout() {
  try {
    await logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-white border-b shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg
              class="w-5 h-5 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span class="text-lg font-semibold text-foreground">
            Testimonials
          </span>
        </div>

        <div class="flex items-center gap-4">
          <span
            v-if="currentUser"
            class="text-sm text-muted-foreground"
          >
            {{ currentUser.email }}
          </span>
          <Button
            variant="outline"
            size="sm"
            @click="handleLogout"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              class="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-foreground mb-2">
            Welcome to your Dashboard!
          </h1>
          <p class="text-muted-foreground">
            You're all set. Your testimonial collection journey starts here.
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border p-8">
          <h2 class="text-lg font-semibold text-foreground mb-4">
            Coming Soon
          </h2>
          <ul class="text-left space-y-3 text-muted-foreground">
            <li class="flex items-center gap-3">
              <span class="w-2 h-2 bg-primary rounded-full" />
              Create collection forms with smart AI prompts
            </li>
            <li class="flex items-center gap-3">
              <span class="w-2 h-2 bg-primary rounded-full" />
              Manage and approve testimonials
            </li>
            <li class="flex items-center gap-3">
              <span class="w-2 h-2 bg-primary rounded-full" />
              Generate beautiful embeddable widgets
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>
