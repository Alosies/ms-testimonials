<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import UnauthLayout from '@/layouts/UnauthLayout.vue';
import { SignupForm, GoogleLoginButton } from '@/features/auth';

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
          Create your account
        </h1>
        <p class="text-muted-foreground mt-1">
          Start collecting testimonials in minutes
        </p>
      </div>

      <SignupForm />

      <div class="mt-6 text-center">
        <p class="text-sm text-muted-foreground">
          Already have an account?
          <RouterLink
            to="/auth/login"
            class="text-primary font-medium hover:underline"
          >
            Sign in
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
        <GoogleLoginButton
          text="Sign up with Google"
          full-width
        />
      </div>
    </div>
  </UnauthLayout>
</template>
