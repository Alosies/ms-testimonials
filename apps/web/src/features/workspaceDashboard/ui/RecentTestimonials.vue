<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useGetTestimonials } from '@/entities/testimonial';
import { useCurrentContextStore } from '@/shared/currentContext';

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
  limit: 5,
}));

const { testimonials, isLoading } = useGetTestimonials(variables);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getRatingStars = (rating: number | null | undefined) => {
  if (!rating) return [];
  return Array.from({ length: 5 }, (_, i) => i < rating);
};

const truncateContent = (content: string | null | undefined, length = 100) => {
  if (!content) return 'No content';
  return content.length > length ? `${content.slice(0, length)}...` : content;
};
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
        <h2 class="text-lg font-semibold text-gray-900">Recent Testimonials</h2>
      </div>
      <RouterLink
        to="/testimonials"
        class="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
      >
        View All
        <Icon icon="heroicons:arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse p-4 border border-gray-100 rounded-lg">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full" />
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div class="h-3 bg-gray-100 rounded w-full mb-2" />
            <div class="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="testimonials.length === 0"
      class="text-center py-8 border border-dashed border-gray-200 rounded-xl"
    >
      <Icon icon="heroicons:chat-bubble-left-right" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm mb-2">No testimonials yet</p>
      <p class="text-gray-400 text-xs">Create a form to start collecting testimonials</p>
    </div>

    <!-- Testimonials List -->
    <div v-else class="space-y-4">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.id"
        class="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span class="text-sm font-medium text-violet-600">
              {{ testimonial.customer_name?.charAt(0)?.toUpperCase() || '?' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-gray-900 truncate">{{ testimonial.customer_name }}</p>
              <span
                :class="['px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(testimonial.status)]"
              >
                {{ testimonial.status }}
              </span>
            </div>
            <p v-if="testimonial.customer_company" class="text-xs text-gray-500 mb-2">
              {{ testimonial.customer_title ? `${testimonial.customer_title} at ` : '' }}{{ testimonial.customer_company }}
            </p>
            <div v-if="testimonial.rating" class="flex items-center gap-0.5 mb-2">
              <Icon
                v-for="(filled, i) in getRatingStars(testimonial.rating)"
                :key="i"
                :icon="filled ? 'heroicons:star-solid' : 'heroicons:star'"
                :class="['w-4 h-4', filled ? 'text-amber-400' : 'text-gray-300']"
              />
            </div>
            <p class="text-sm text-gray-600 line-clamp-2">
              {{ truncateContent(testimonial.content) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
