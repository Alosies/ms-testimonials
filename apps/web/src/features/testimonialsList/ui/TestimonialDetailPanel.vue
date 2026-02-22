<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import type { TestimonialWithFormItem, Testimonial } from '@/entities/testimonial';

interface Props {
  testimonial: TestimonialWithFormItem | Testimonial | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  approve: [id: string];
  reject: [id: string];
}>();

const initials = computed(() => {
  if (!props.testimonial) return '';
  return props.testimonial.customer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const statusConfig = computed(() => {
  switch (props.testimonial?.status) {
    case 'approved':
      return { icon: 'heroicons:check-circle', label: 'Approved', classes: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40' };
    case 'rejected':
      return { icon: 'heroicons:x-circle', label: 'Rejected', classes: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40' };
    default:
      return { icon: 'heroicons:clock', label: 'Pending', classes: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40' };
  }
});

const formName = computed(() => {
  if (!props.testimonial) return null;
  if ('submission' in props.testimonial && props.testimonial.submission) {
    return (props.testimonial.submission as { form?: { name?: string } }).form?.name ?? null;
  }
  return null;
});

const sourceLabel = computed(() => {
  switch (props.testimonial?.source) {
    case 'form':
      return 'Form Submission';
    case 'import':
      return 'Imported';
    case 'manual':
      return 'Manual Entry';
    default:
      return 'Unknown';
  }
});

const formattedDate = computed(() => {
  if (!props.testimonial) return '';
  return new Date(props.testimonial.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const formattedApprovedAt = computed(() => {
  if (!props.testimonial?.approved_at) return null;
  return new Date(props.testimonial.approved_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const formattedRejectedAt = computed(() => {
  if (!props.testimonial?.rejected_at) return null;
  return new Date(props.testimonial.rejected_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});
</script>

<template>
  <!-- Empty state -->
  <div v-if="!testimonial" class="flex flex-col items-center justify-center py-12 text-center">
    <Icon icon="heroicons:chat-bubble-bottom-center-text" class="h-10 w-10 text-muted-foreground/40 mb-3" />
    <p class="text-sm text-muted-foreground">Select a testimonial to view details</p>
  </div>

  <!-- Detail content -->
  <div v-else class="space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
    <!-- Customer profile -->
    <div class="flex items-start gap-4">
      <div
        v-if="testimonial.customer_avatar_url"
        class="h-12 w-12 rounded-full bg-cover bg-center flex-shrink-0"
        :style="{ backgroundImage: `url(${testimonial.customer_avatar_url})` }"
      />
      <div
        v-else
        class="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0"
      >
        {{ initials }}
      </div>
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-foreground">{{ testimonial.customer_name }}</h3>
        <p
          v-if="testimonial.customer_title || testimonial.customer_company"
          class="text-sm text-muted-foreground"
        >
          {{ [testimonial.customer_title, testimonial.customer_company].filter(Boolean).join(' at ') }}
        </p>
        <!-- Social links -->
        <div class="flex items-center gap-2 mt-1">
          <a
            v-if="testimonial.customer_email"
            :href="`mailto:${testimonial.customer_email}`"
            class="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="heroicons:envelope" class="h-4 w-4" />
          </a>
          <a
            v-if="testimonial.customer_linkedin_url"
            :href="testimonial.customer_linkedin_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="mdi:linkedin" class="h-4 w-4" />
          </a>
          <a
            v-if="testimonial.customer_twitter_url"
            :href="testimonial.customer_twitter_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="mdi:twitter" class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>

    <!-- Rating -->
    <div v-if="testimonial.rating" class="flex items-center gap-1">
      <Icon
        v-for="star in 5"
        :key="star"
        :icon="star <= testimonial.rating ? 'heroicons:star-solid' : 'heroicons:star'"
        class="h-4 w-4"
        :class="star <= testimonial.rating ? 'text-amber-400' : 'text-muted-foreground/30'"
      />
    </div>

    <!-- Content -->
    <div>
      <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Testimonial</h4>
      <p class="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {{ testimonial.content || 'No content provided.' }}
      </p>
    </div>

    <!-- Source info -->
    <div class="space-y-2">
      <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</h4>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
          <Icon icon="heroicons:document-text" class="h-3 w-3" />
          {{ sourceLabel }}
        </span>
        <span v-if="formName" class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
          <Icon icon="heroicons:clipboard-document-list" class="h-3 w-3" />
          {{ formName }}
        </span>
      </div>
      <p class="text-xs text-muted-foreground">Submitted {{ formattedDate }}</p>
    </div>

    <!-- Status & Audit -->
    <div class="space-y-2">
      <h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        :class="statusConfig.classes"
      >
        <Icon :icon="statusConfig.icon" class="h-3.5 w-3.5" />
        {{ statusConfig.label }}
      </span>
      <p v-if="formattedApprovedAt" class="text-xs text-muted-foreground">
        Approved on {{ formattedApprovedAt }}
      </p>
      <p v-if="formattedRejectedAt" class="text-xs text-muted-foreground">
        Rejected on {{ formattedRejectedAt }}
      </p>
      <div v-if="testimonial.rejection_reason" class="mt-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
        <p class="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Rejection Reason</p>
        <p class="text-xs text-red-600 dark:text-red-300">{{ testimonial.rejection_reason }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="testimonial.status === 'pending'" class="flex items-center gap-2 pt-2 border-t border-border">
      <Button
        class="flex-1 gap-1.5"
        variant="outline"
        @click="emit('approve', testimonial.id)"
      >
        <Icon icon="heroicons:check" class="h-4 w-4 text-green-600" />
        <span class="text-green-600">Approve</span>
      </Button>
      <Button
        class="flex-1 gap-1.5"
        variant="outline"
        @click="emit('reject', testimonial.id)"
      >
        <Icon icon="heroicons:x-mark" class="h-4 w-4 text-red-600" />
        <span class="text-red-600">Reject</span>
      </Button>
    </div>

    <!-- Re-approve/re-reject for already-actioned testimonials -->
    <div v-else class="flex items-center gap-2 pt-2 border-t border-border">
      <Button
        v-if="testimonial.status === 'rejected'"
        class="flex-1 gap-1.5"
        variant="outline"
        @click="emit('approve', testimonial.id)"
      >
        <Icon icon="heroicons:check" class="h-4 w-4 text-green-600" />
        <span class="text-green-600">Approve</span>
      </Button>
      <Button
        v-if="testimonial.status === 'approved'"
        class="flex-1 gap-1.5"
        variant="outline"
        @click="emit('reject', testimonial.id)"
      >
        <Icon icon="heroicons:x-mark" class="h-4 w-4 text-red-600" />
        <span class="text-red-600">Reject</span>
      </Button>
    </div>
  </div>
</template>
