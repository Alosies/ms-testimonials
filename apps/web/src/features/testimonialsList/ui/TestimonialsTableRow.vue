<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { testimonialsTestIds } from '@/shared/constants/testIds';
import type { TestimonialWithFormItem } from '@/entities/testimonial';

const props = defineProps<{
  testimonial: TestimonialWithFormItem;
  isSelected?: boolean;
  showFormAttribution?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
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
      return { label: 'Approved', dotClass: 'bg-emerald-500', textClass: 'text-emerald-600' };
    case 'rejected':
      return { label: 'Rejected', dotClass: 'bg-red-500', textClass: 'text-red-600' };
    default:
      return { label: 'Pending', dotClass: 'bg-amber-500', textClass: 'text-amber-600' };
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

const formName = computed(() => props.testimonial.submission?.form?.name ?? null);
</script>

<template>
  <tr
    :data-testid="testimonialsTestIds.testimonialsTableRow"
    :data-testimonial-id="testimonial.id"
    class="group transition-colors cursor-pointer"
    :class="[
      isSelected
        ? 'bg-primary/5 border-l-2 border-l-primary'
        : 'hover:bg-muted/30 border-l-2 border-l-transparent',
    ]"
    @click="emit('select', testimonial.id)"
  >
    <!-- Customer -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-3">
        <div
          v-if="testimonial.customer_avatar_url"
          class="flex-shrink-0 w-8 h-8 rounded-full bg-cover bg-center"
          :style="{ backgroundImage: `url(${testimonial.customer_avatar_url})` }"
        />
        <div
          v-else
          class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium"
        >
          {{ initials }}
        </div>
        <div class="min-w-0">
          <p :data-testid="testimonialsTestIds.rowCustomerName" class="text-sm font-medium text-foreground truncate max-w-[160px] group-hover:text-primary transition-colors">
            {{ testimonial.customer_name }}
          </p>
          <p
            v-if="testimonial.customer_company"
            class="text-xs text-muted-foreground truncate max-w-[140px]"
          >
            at {{ testimonial.customer_company }}
          </p>
          <p
            v-if="showFormAttribution && formName"
            class="text-xs text-muted-foreground/70 truncate max-w-[140px] sm:hidden"
          >
            via {{ formName }}
          </p>
        </div>
      </div>
    </td>

    <!-- Content -->
    <td class="py-3 px-4 hidden sm:table-cell">
      <p class="text-sm text-muted-foreground truncate max-w-[300px]">
        {{ testimonial.content || 'No content' }}
      </p>
    </td>

    <!-- Rating -->
    <td class="py-3 px-4 hidden md:table-cell">
      <div v-if="testimonial.rating" class="flex items-center gap-0.5">
        <Icon
          v-for="star in 5"
          :key="star"
          :icon="star <= testimonial.rating ? 'heroicons:star-solid' : 'heroicons:star'"
          class="h-3.5 w-3.5"
          :class="star <= testimonial.rating ? 'text-amber-400' : 'text-muted-foreground/30'"
        />
      </div>
      <span v-else class="text-xs text-muted-foreground">—</span>
    </td>

    <!-- Status -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full" :class="statusConfig.dotClass" />
        <span class="text-xs font-medium" :class="statusConfig.textClass">
          {{ statusConfig.label }}
        </span>
      </div>
    </td>

    <!-- Date -->
    <td class="py-3 px-4 hidden lg:table-cell">
      <p class="text-sm text-muted-foreground">
        {{ relativeTime }}
      </p>
    </td>
  </tr>
</template>
