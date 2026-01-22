<script setup lang="ts">
import { onMounted, watch, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@testimonials/icons';
import { useAuth } from '@/features/auth';
import { useCurrentContextStore } from '@/shared/currentContext';

const router = useRouter();
const { isAuthLoading, isAuthenticated } = useAuth();
const contextStore = useCurrentContextStore();

// Use toRefs to get proper reactive refs from Pinia store
const { currentOrganizationSlug } = toRefs(contextStore);

// Track if redirect has been initiated to prevent multiple navigations
let redirectInitiated = false;

// Helper to get the redirect path
function getRedirectPath() {
  const slug = currentOrganizationSlug.value;
  return slug ? `/${slug}/dashboard` : '/';
}

// Redirect to dashboard when auth and org context are ready
onMounted(() => {
  if (isAuthenticated.value && !isAuthLoading.value && currentOrganizationSlug.value) {
    redirectInitiated = true;
    router.push(getRedirectPath());
  }
});

// Watch for auth and org context completion
// Use array of refs for proper reactivity tracking
watch(
  [isAuthenticated, isAuthLoading, currentOrganizationSlug],
  ([authenticated, loading, slug]) => {
    if (authenticated && !loading && slug && !redirectInitiated) {
      redirectInitiated = true;
      // Small delay to show success state briefly
      setTimeout(() => {
        router.push(getRedirectPath()).catch((err) => {
          console.error('[callback.vue] router.push() failed:', err);
        });
      }, 500);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-hidden">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <!-- Radial pulse waves from center -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div class="callback-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/30" />
        <div class="callback-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/20 [animation-delay:-1s]" />
        <div class="callback-wave absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-100/15 [animation-delay:-2s]" />
      </div>

      <!-- Corner glows -->
      <div class="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />

      <!-- Center glow -->
      <div class="center-glow absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center px-8">
      <!-- Loading state -->
      <template v-if="isAuthLoading">
        <div class="mb-8 flex justify-center">
          <div class="relative animate-float-gentle">
            <!-- Pulse rings -->
            <div class="absolute -inset-3 animate-ping-slow rounded-full bg-teal-500/10" />
            <div class="absolute -inset-5 animate-ping-slower rounded-full bg-teal-500/5" />

            <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
              <Icon icon="lucide:key-round" class="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div class="text-center">
          <span class="text-lg font-medium text-foreground">
            Completing sign in
          </span>
          <p class="mt-2 text-sm text-muted-foreground">
            Processing authentication...
          </p>
        </div>
      </template>

      <!-- Success state -->
      <template v-else-if="isAuthenticated">
        <div class="mb-8 flex justify-center">
          <div class="relative animate-float-gentle">
            <!-- Pulse rings -->
            <div class="absolute -inset-3 animate-ping-slow rounded-full bg-teal-500/10" />
            <div class="absolute -inset-5 animate-ping-slower rounded-full bg-teal-500/5" />

            <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
              <Icon icon="lucide:check" class="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div class="text-center">
          <span class="text-lg font-medium text-foreground">
            Welcome back!
          </span>
          <p class="mt-2 text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>

        <!-- Manual redirect button -->
        <div class="mt-8">
          <button
            class="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
            @click="router.push(getRedirectPath())"
          >
            Go to Dashboard
          </button>
        </div>
      </template>

      <!-- Error state -->
      <template v-else>
        <div class="mb-8 flex justify-center">
          <div class="relative">
            <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive to-destructive/80 shadow-lg shadow-destructive/25">
              <Icon icon="lucide:x" class="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div class="text-center">
          <span class="text-lg font-medium text-foreground">
            Authentication Failed
          </span>
          <p class="mt-2 text-sm text-muted-foreground">
            Something went wrong. Please try again.
          </p>
        </div>

        <div class="mt-8">
          <button
            class="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
            @click="router.push('/auth/login')"
          >
            Back to Login
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Expanding radial waves */
.callback-wave {
  animation: callback-expand-wave 3s ease-out infinite;
}

@keyframes callback-expand-wave {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Center glow pulse */
.center-glow {
  background: radial-gradient(circle, rgba(204, 251, 241, 0.5) 0%, rgba(204, 251, 241, 0.2) 40%, transparent 70%);
  animation: center-glow-pulse 3s ease-in-out infinite;
}

@keyframes center-glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

</style>
