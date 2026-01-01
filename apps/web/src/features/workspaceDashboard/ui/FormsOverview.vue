<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useGetForms } from '@/entities/form';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);
const { formsPath, getFormPath } = useRouting();

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));

const { forms, isLoading } = useGetForms(variables);

const displayForms = computed(() => forms.value.slice(0, 5));
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
        <h2 class="text-lg font-semibold text-gray-900">Recent Forms</h2>
      </div>
      <RouterLink
        :to="formsPath"
        class="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
      >
        View All
        <Icon icon="heroicons:arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-4 p-3">
        <div class="w-10 h-10 bg-gray-200 rounded-lg" />
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div class="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="forms.length === 0"
      class="text-center py-8 border border-dashed border-gray-200 rounded-xl"
    >
      <Icon icon="heroicons:document-text" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm mb-4">No forms yet</p>
      <RouterLink
        :to="`${formsPath}/new`"
        class="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
      >
        <Icon icon="heroicons:plus" class="w-4 h-4" />
        Create Your First Form
      </RouterLink>
    </div>

    <!-- Forms List -->
    <div v-else class="space-y-3">
      <RouterLink
        v-for="form in displayForms"
        :key="form.id"
        :to="getFormPath({ name: form.name, id: form.id })"
        class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <div
          class="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center"
        >
          <Icon icon="heroicons:document-text" class="w-5 h-5 text-violet-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate group-hover:text-violet-600 transition-colors">
            {{ form.name }}
          </p>
          <p class="text-xs text-gray-500">{{ form.product_name || 'No product name' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Draft status badge -->
          <span
            v-if="form.status === 'draft'"
            class="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
          >
            Draft
          </span>
          <!-- Published forms show Active/Inactive -->
          <span
            v-else
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600',
            ]"
          >
            {{ form.is_active ? 'Active' : 'Inactive' }}
          </span>
          <Icon
            icon="heroicons:chevron-right"
            class="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors"
          />
        </div>
      </RouterLink>
    </div>
  </div>
</template>
