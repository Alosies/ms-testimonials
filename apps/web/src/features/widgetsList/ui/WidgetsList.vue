<script setup lang="ts">
import type { WidgetListItem } from '../models';
import WidgetCard from './WidgetCard.vue';

defineProps<{
  widgets: WidgetListItem[];
}>();

const emit = defineEmits<{
  edit: [widget: WidgetListItem];
  delete: [widget: WidgetListItem];
}>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <WidgetCard
      v-for="widget in widgets"
      :key="widget.id"
      :widget="widget"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
