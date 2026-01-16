<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { definePage } from 'unplugin-vue-router/runtime';
import { useAuth } from '@/features/auth';

definePage({
  meta: {
    public: true,
  },
});

const router = useRouter();
const { logout, isAuthenticated } = useAuth();

const isLoggingOut = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  // If not authenticated, redirect to login immediately
  if (!isAuthenticated.value) {
    window.location.href = '/auth/login';
    return;
  }

  try {
    await logout();
    // Use window.location for clean redirect (clears all Vue state)
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to sign out';
    isLoggingOut.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <!-- Loading state -->
      <template v-if="isLoggingOut && !error">
        <div class="mb-6">
          <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
        <h1 class="text-xl font-bold text-foreground mb-2">
          Signing out...
        </h1>
        <p class="text-muted-foreground">
          Please wait while we sign you out.
        </p>
      </template>

      <!-- Error state -->
      <template v-else-if="error">
        <div class="mb-6">
          <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              class="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-xl font-bold text-foreground mb-2">
          Sign Out Failed
        </h1>
        <p class="text-muted-foreground mb-6">
          {{ error }}
        </p>

        <button
          class="text-primary hover:underline text-sm font-medium"
          @click="router.push('/auth/login')"
        >
          Go to Login
        </button>
      </template>
    </div>
  </div>
</template>
