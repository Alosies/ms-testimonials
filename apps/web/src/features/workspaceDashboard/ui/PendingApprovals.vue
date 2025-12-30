<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useGetTestimonials } from '@/entities/testimonial';
import { useCurrentContextStore } from '@/shared/currentContext';

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
  status: 'pending',
  limit: 5,
}));

const { testimonials: pendingTestimonials, isLoading } = useGetTestimonials(ref(variables.value));
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
      <h2 class="text-lg font-semibold text-gray-900">Pending Approvals</h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-3 p-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full" />
        <div class="flex-1">
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-1" />
          <div class="h-2 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingTestimonials.length === 0" class="text-center py-6">
      <div
        class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"
      >
        <Icon icon="heroicons:check-circle" class="w-6 h-6 text-emerald-600" />
      </div>
      <p class="text-gray-500 text-sm">All caught up!</p>
      <p class="text-gray-400 text-xs mt-1">No testimonials pending review</p>
    </div>

    <!-- Pending List -->
    <div v-else class="space-y-3">
      <RouterLink
        v-for="testimonial in pendingTestimonials"
        :key="testimonial.id"
        :to="`/testimonials/${testimonial.id}`"
        class="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors group"
      >
        <div
          class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <span class="text-xs font-medium text-amber-700">
            {{ testimonial.customer_name?.charAt(0)?.toUpperCase() || '?' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate group-hover:text-amber-700 transition-colors">
            {{ testimonial.customer_name }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ testimonial.customer_company || 'No company' }}
          </p>
        </div>
        <Icon
          icon="heroicons:chevron-right"
          class="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors"
        />
      </RouterLink>

      <RouterLink
        v-if="pendingTestimonials.length >= 5"
        to="/testimonials?status=pending"
        class="block text-center py-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
      >
        View all pending
      </RouterLink>
    </div>
  </div>
</template>
