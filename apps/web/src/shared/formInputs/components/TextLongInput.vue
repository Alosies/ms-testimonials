<script setup lang="ts">
/**
 * TextLongInput - Modern styled textarea for long-form responses
 *
 * Features a clean, spacious design with subtle shadows and smooth transitions.
 */
import { Textarea } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

defineProps<QuestionInputProps>();
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <Textarea
    v-model="modelValue"
    :placeholder="placeholder ?? 'Share your thoughts...'"
    :disabled="disabled"
    :required="is_required"
    class="min-h-[140px] w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50/50 px-5 py-4 text-base leading-relaxed shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-primary focus:bg-white focus:shadow-md focus:ring-4 focus:ring-primary/10 disabled:bg-gray-100 disabled:opacity-60"
  />
</template>
