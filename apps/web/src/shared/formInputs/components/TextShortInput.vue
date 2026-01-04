<script setup lang="ts">
/**
 * TextShortInput - Modern styled input for short text responses
 *
 * Features a clean design with subtle shadows and smooth transitions.
 */
import { Input } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

defineProps<QuestionInputProps>();
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <Input
    v-model="modelValue"
    type="text"
    :placeholder="placeholder ?? 'Your answer...'"
    :disabled="disabled"
    :required="is_required"
    class="h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-5 text-base shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-primary focus:bg-white focus:shadow-md focus:ring-4 focus:ring-primary/10 disabled:bg-gray-100 disabled:opacity-60"
  />
</template>
