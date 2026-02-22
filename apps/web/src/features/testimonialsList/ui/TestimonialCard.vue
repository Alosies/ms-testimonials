<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import type { TestimonialWithFormItem } from '@/entities/testimonial';

interface Props {
  testimonial: TestimonialWithFormItem;
  isSelected?: boolean;
  showFormAttribution?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [id: string];
  approve: [id: string];
  reject: [id: string];
}>();

const initials = computed(() =>
  props.testimonial.customer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2),
);

const statusConfig = computed(() => {
  switch (props.testimonial.status) {
    case 'approved':
      return { icon: 'heroicons:check-circle', label: 'Approved', classes: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40' };
    case 'rejected':
      return { icon: 'heroicons:x-circle', label: 'Rejected', classes: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40' };
    default:
      return { icon: 'heroicons:clock', label: 'Pending', classes: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40' };
  }
});

const relativeTime = computed(() => {
  const date = new Date(props.testimonial.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

const formName = computed(() => props.testimonial.submission?.form?.name ?? null);
</script>

<template>
  <div
    class="rounded-xl border bg-card p-4 cursor-pointer transition-colors hover:border-primary/50"
    :class="[
      isSelected
        ? 'border-primary ring-1 ring-primary/20'
        : 'border-border',
    ]"
    @click="emit('select', testimonial.id)"
  >
    <!-- Top row: Rating + Status badge -->
    <div class="flex items-center justify-between mb-2">
      <!-- Rating stars -->
      <div v-if="testimonial.rating" class="flex items-center gap-0.5">
        <Icon
          v-for="star in 5"
          :key="star"
          :icon="star <= testimonial.rating ? 'heroicons:star-solid' : 'heroicons:star'"
          class="h-3.5 w-3.5"
          :class="star <= testimonial.rating ? 'text-amber-400' : 'text-muted-foreground/30'"
        />
      </div>
      <div v-else />

      <!-- Status badge -->
      <span
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        :class="statusConfig.classes"
      >
        <Icon :icon="statusConfig.icon" class="h-3 w-3" />
        {{ statusConfig.label }}
      </span>
    </div>

    <!-- Content excerpt -->
    <p class="text-sm text-foreground line-clamp-3 mb-3">
      {{ testimonial.content || 'No content' }}
    </p>

    <!-- Customer info -->
    <div class="flex items-center gap-3 mb-3">
      <div
        v-if="testimonial.customer_avatar_url"
        class="h-8 w-8 rounded-full bg-cover bg-center flex-shrink-0"
        :style="{ backgroundImage: `url(${testimonial.customer_avatar_url})` }"
      />
      <div
        v-else
        class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0"
      >
        {{ initials }}
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-foreground truncate">{{ testimonial.customer_name }}</p>
        <p
          v-if="testimonial.customer_title || testimonial.customer_company"
          class="text-xs text-muted-foreground truncate"
        >
          {{ [testimonial.customer_title, testimonial.customer_company].filter(Boolean).join(' at ') }}
        </p>
      </div>
    </div>

    <!-- Bottom row: Form attribution + time -->
    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span v-if="showFormAttribution && formName" class="truncate max-w-[60%]">
        via {{ formName }}
      </span>
      <span v-else />
      <span class="flex-shrink-0">{{ relativeTime }}</span>
    </div>

    <!-- Quick actions for pending -->
    <div
      v-if="testimonial.status === 'pending'"
      class="flex items-center gap-2 mt-3 pt-3 border-t border-border"
    >
      <Button
        variant="outline"
        size="sm"
        class="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
        @click.stop="emit('approve', testimonial.id)"
      >
        <Icon icon="heroicons:check" class="h-3.5 w-3.5 mr-1" />
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        @click.stop="emit('reject', testimonial.id)"
      >
        <Icon icon="heroicons:x-mark" class="h-3.5 w-3.5 mr-1" />
        Reject
      </Button>
    </div>
  </div>
</template>
