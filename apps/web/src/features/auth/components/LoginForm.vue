<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input, Label } from '@testimonials/ui';
import { useAuth } from '../composables/useAuth';

defineOptions({
  name: 'LoginForm',
});

const router = useRouter();
const { login, isAuthLoading, error, clearError } = useAuth();

const email = ref('');
const password = ref('');

async function handleSubmit() {
  clearError();

  try {
    await login({
      email: email.value,
      password: password.value,
    });

    // Redirect to dashboard on success
    router.push('/dashboard');
  } catch (err) {
    // Error is handled in the useAuth composable
    console.error('Login failed:', err);
  }
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="password">Password</Label>
      <Input
        id="password"
        v-model="password"
        type="password"
        placeholder="Enter your password"
        autocomplete="current-password"
        required
      />
    </div>

    <div
      v-if="error"
      class="text-sm text-destructive"
    >
      {{ error }}
    </div>

    <Button
      type="submit"
      class="w-full"
      :disabled="isAuthLoading"
    >
      {{ isAuthLoading ? 'Signing in...' : 'Sign in' }}
    </Button>
  </form>
</template>
