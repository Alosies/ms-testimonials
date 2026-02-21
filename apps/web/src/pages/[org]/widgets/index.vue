<script setup lang="ts">
/**
 * Widgets list page
 * Route: /:org/widgets
 */
import { computed, toRefs } from 'vue';
import { definePage } from 'unplugin-vue-router/runtime';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { WidgetsList, WidgetsEmptyState, WidgetsListSkeleton } from '@/features/widgetsList';
import { useGetWidgets, useDeleteWidget } from '@/entities/widget';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';
import { useConfirmationModal } from '@/shared/widgets/ConfirmationModal';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const contextStore = useCurrentContextStore();
const { currentOrganizationId, isReady } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { widgets, isLoading, refetch } = useGetWidgets(variables);
const { deleteWidget } = useDeleteWidget();
const { showConfirmation } = useConfirmationModal();
const { goToNewWidget, goToWidget } = useRouting();

const showLoading = computed(() => !isReady.value || isLoading.value);
const hasWidgets = computed(() => widgets.value.length > 0);
const showList = computed(() => !showLoading.value && hasWidgets.value);
const showEmptyState = computed(() => !showLoading.value && !hasWidgets.value);

function handleEdit(widget: { name: string; id: string }) {
  goToWidget(widget);
}

function handleDelete(widget: { name: string; id: string }) {
  showConfirmation({
    actionType: 'delete_widget',
    entityName: widget.name,
    onConfirm: async () => {
      await deleteWidget({ widgetId: widget.id });
      await refetch();
    },
  });
}
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-background">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <header class="flex items-start justify-between mb-8">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight text-foreground">Widgets</h1>
            <p class="text-sm text-muted-foreground">
              Create and manage embeddable testimonial widgets.
            </p>
          </div>
          <Button v-if="hasWidgets" @click="goToNewWidget" class="gap-2">
            <Icon icon="heroicons:plus" class="h-4 w-4" />
            Create Widget
          </Button>
        </header>

        <WidgetsListSkeleton v-if="showLoading" />
        <WidgetsEmptyState v-else-if="showEmptyState" @create-widget="goToNewWidget" />
        <WidgetsList
          v-else-if="showList"
          :widgets="widgets"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </AuthLayout>
</template>
