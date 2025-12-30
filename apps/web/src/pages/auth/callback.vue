<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/features/auth';

const router = useRouter();
const { isAuthLoading, isAuthenticated } = useAuth();

// Redirect to dashboard when auth is complete
onMounted(() => {
  // If already authenticated and not loading, redirect immediately
  if (isAuthenticated.value && !isAuthLoading.value) {
    router.push('/dashboard');
  }
});

// Watch for auth completion
watch([isAuthenticated, isAuthLoading], ([authenticated, loading]) => {
  if (authenticated && !loading) {
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <!-- Loading state -->
      <template v-if="isAuthLoading">
        <div class="mb-6">
          <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
        <h1 class="text-xl font-bold text-foreground mb-2">
          Authenticating...
        </h1>
        <p class="text-muted-foreground">
          Please wait while we complete your sign in.
        </p>
      </template>

      <!-- Success state -->
      <template v-else-if="isAuthenticated">
        <div class="mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              class="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-xl font-bold text-foreground mb-2">
          Welcome!
        </h1>
        <p class="text-muted-foreground mb-6">
          Authentication successful. Redirecting to your dashboard...
        </p>

        <!-- Loading indicator -->
        <div class="flex items-center justify-center gap-1 text-primary">
          <div class="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div
            class="w-2 h-2 bg-primary rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          />
          <div
            class="w-2 h-2 bg-primary rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          />
        </div>

        <!-- Manual redirect button -->
        <div class="mt-6">
          <button
            class="text-primary hover:underline text-sm font-medium"
            @click="router.push('/dashboard')"
          >
            Go to Dashboard
          </button>
        </div>
      </template>

      <!-- Error state -->
      <template v-else>
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
          Authentication Failed
        </h1>
        <p class="text-muted-foreground mb-6">
          Something went wrong. Please try again.
        </p>

        <button
          class="text-primary hover:underline text-sm font-medium"
          @click="router.push('/auth/login')"
        >
          Back to Login
        </button>
      </template>
    </div>
  </div>
</template>
