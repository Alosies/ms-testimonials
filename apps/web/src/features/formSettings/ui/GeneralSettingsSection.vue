<script setup lang="ts">
/**
 * General Settings Section - Modern inline editing style
 */
import { Icon } from '@testimonials/icons';
import { useRouting } from '@/shared/routing';
import type { FormRef } from '@/shared/routing';

interface Props {
  formRef: FormRef;
}

defineProps<Props>();

const name = defineModel<string>('name', { required: true });
const productName = defineModel<string>('productName', { required: true });
const productDescription = defineModel<string>('productDescription', { required: true });

const { goToFormStudio } = useRouting();
</script>

<template>
  <div class="space-y-1">
    <!-- Form Name Row -->
    <div class="group grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 py-3 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div class="flex items-center">
        <label class="text-sm text-muted-foreground">Form name</label>
      </div>
      <div class="md:col-span-2">
        <input
          v-model="name"
          type="text"
          placeholder="Enter form name"
          class="w-full px-3 py-2 text-sm bg-muted/30 border border-border/60 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-border"
        />
      </div>
    </div>

    <!-- Product Name Row -->
    <div class="group grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 py-3 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground">Product name</label>
        <span class="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted rounded">AI</span>
      </div>
      <div class="md:col-span-2">
        <input
          v-model="productName"
          type="text"
          placeholder="e.g., Acme Widget"
          class="w-full px-3 py-2 text-sm bg-muted/30 border border-border/60 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-border"
        />
      </div>
    </div>

    <!-- Description Row -->
    <div class="group grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 py-3 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div class="flex items-start pt-1 gap-2">
        <label class="text-sm text-muted-foreground">Description</label>
        <span class="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted rounded">AI</span>
      </div>
      <div class="md:col-span-2">
        <textarea
          v-model="productDescription"
          placeholder="What does your product do?"
          rows="2"
          class="w-full px-3 py-2 text-sm bg-muted/30 border border-border/60 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-border resize-none"
        />
      </div>
    </div>

    <!-- Info callout -->
    <div class="flex items-start gap-3 mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
      <Icon icon="heroicons:information-circle" class="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
      <p class="text-sm text-amber-900 dark:text-amber-200">
        <span class="font-medium">Product info changes won't update existing questions.</span>
        This info is only used when generating new questions.
        <button
          type="button"
          class="text-amber-700 dark:text-amber-400 font-medium hover:underline"
          @click="goToFormStudio(formRef)"
        >
          Edit questions in Studio →
        </button>
      </p>
    </div>
  </div>
</template>
