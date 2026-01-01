<script setup lang="ts">
import { Textarea } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

defineProps<QuestionInputProps>();
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <Textarea
    v-model="modelValue"
    :placeholder="placeholder ?? 'Long answer'"
    :disabled="disabled"
    :required="is_required"
    class="min-h-[100px]"
  />
</template>
