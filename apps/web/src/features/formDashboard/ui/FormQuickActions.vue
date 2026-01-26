<script setup lang="ts">
/**
 * FormQuickActions
 *
 * Quick action cards for navigating to form sub-pages.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { useRouting } from '@/shared/routing';
import type { FormRef } from '@/shared/routing';

interface Props {
  formRef: FormRef;
}

const props = defineProps<Props>();

const {
  goToFormStudio,
  goToFormResponses,
  goToFormWidgets,
  goToFormSettings,
  goToFormAnalytics,
  goToFormTestimonials,
} = useRouting();

const quickActions = computed(() => [
  {
    title: 'Studio',
    description: 'Edit form steps and design',
    icon: 'heroicons:paint-brush',
    onClick: () => goToFormStudio(props.formRef),
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600',
    hoverBg: 'group-hover:bg-violet-200',
  },
  {
    title: 'Responses',
    description: 'View submission sessions',
    icon: 'heroicons:inbox-stack',
    onClick: () => goToFormResponses(props.formRef),
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBg: 'group-hover:bg-blue-200',
  },
  {
    title: 'Analytics',
    description: 'View form performance metrics',
    icon: 'heroicons:chart-bar',
    onClick: () => goToFormAnalytics(props.formRef),
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    hoverBg: 'group-hover:bg-emerald-200',
  },
  {
    title: 'Testimonials',
    description: 'View approved testimonials',
    icon: 'heroicons:chat-bubble-bottom-center-text',
    onClick: () => goToFormTestimonials(props.formRef),
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
    hoverBg: 'group-hover:bg-pink-200',
  },
  {
    title: 'Widgets',
    description: 'Embed testimonials on your site',
    icon: 'heroicons:squares-2x2',
    onClick: () => goToFormWidgets(props.formRef),
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hoverBg: 'group-hover:bg-amber-200',
  },
  {
    title: 'Settings',
    description: 'Configure form options',
    icon: 'heroicons:cog-6-tooth',
    onClick: () => goToFormSettings(props.formRef),
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-600',
    hoverBg: 'group-hover:bg-slate-200',
  },
]);
</script>

<template>
  <section>
    <div class="grid gap-4 sm:grid-cols-2">
      <button
        v-for="(action, index) in quickActions"
        :key="action.title"
        @click="action.onClick"
        class="group flex items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-border/80 hover:shadow-md"
        :class="{ 'sm:col-span-2 sm:max-w-md sm:mx-auto': index === quickActions.length - 1 && quickActions.length % 2 === 1 }"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors"
          :class="[action.bgColor, action.hoverBg]"
        >
          <Icon :icon="action.icon" class="h-6 w-6" :class="action.iconColor" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-medium text-foreground">
            {{ action.title }}
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ action.description }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>
