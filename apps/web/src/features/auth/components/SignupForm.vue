<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input, Label } from '@testimonials/ui';
import { useAuth } from '../composables/useAuth';

defineOptions({
  name: 'SignupForm',
});

const router = useRouter();
const { register, isAuthLoading, error, clearError } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const validationError = ref('');

function validateForm(): boolean {
  validationError.value = '';

  if (password.value.length < 6) {
    validationError.value = 'Password must be at least 6 characters';
    return false;
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match';
    return false;
  }

  return true;
}

async function handleSubmit() {
  clearError();

  if (!validateForm()) {
    return;
  }

  try {
    await register({
      email: email.value,
      password: password.value,
      name: name.value || undefined,
    });

    // Redirect to dashboard on success
    // Note: Some setups require email verification first
    router.push('/dashboard');
  } catch (err) {
    // Error is handled in the useAuth composable
    console.error('Signup failed:', err);
  }
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-2">
      <Label for="name">Name (optional)</Label>
      <Input
        id="name"
        v-model="name"
        type="text"
        placeholder="Your name"
        autocomplete="name"
      />
    </div>

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
        placeholder="At least 6 characters"
        autocomplete="new-password"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="confirmPassword">Confirm Password</Label>
      <Input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        autocomplete="new-password"
        required
      />
    </div>

    <div
      v-if="validationError || error"
      class="text-sm text-destructive"
    >
      {{ validationError || error }}
    </div>

    <Button
      type="submit"
      class="w-full"
      :disabled="isAuthLoading"
    >
      {{ isAuthLoading ? 'Creating account...' : 'Create account' }}
    </Button>
  </form>
</template>
