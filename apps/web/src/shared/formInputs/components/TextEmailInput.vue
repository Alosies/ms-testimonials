<script setup lang="ts">
import { Input } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

defineProps<QuestionInputProps>();
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <Input
    v-model="modelValue"
    type="email"
    :placeholder="placeholder ?? 'you@example.com'"
    :disabled="disabled"
    :required="is_required"
  />
</template>
