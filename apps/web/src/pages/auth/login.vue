<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import UnauthLayout from '@/layouts/UnauthLayout.vue';
import { LoginForm, GoogleLoginButton } from '@/features/auth';

definePage({
  meta: {
    guestOnly: true,
  },
});
</script>

<template>
  <UnauthLayout>
    <div class="w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-xl">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-foreground">
          Welcome back
        </h1>
        <p class="text-muted-foreground mt-1">
          Sign in to your account
        </p>
      </div>

      <LoginForm />

      <div class="mt-6 text-center">
        <p class="text-sm text-muted-foreground">
          Don't have an account?
          <RouterLink
            to="/auth/signup"
            class="text-primary font-medium hover:underline"
          >
            Sign up
          </RouterLink>
        </p>
      </div>

      <!-- Divider -->
      <div class="my-6 flex items-center">
        <div class="flex-grow h-px bg-border" />
        <span class="mx-4 text-sm text-muted-foreground">or</span>
        <div class="flex-grow h-px bg-border" />
      </div>

      <!-- Google Login -->
      <div class="flex justify-center">
        <GoogleLoginButton full-width />
      </div>
    </div>
  </UnauthLayout>
</template>
