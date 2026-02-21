<script setup lang="ts">
import { Input, Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../models';

const props = defineProps<{
  state: WidgetFormState;
}>();

const emit = defineEmits<{
  'update:state': [state: WidgetFormState];
}>();

function update(patch: Partial<WidgetFormState>) {
  emit('update:state', { ...props.state, ...patch });
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <Label for="widget-name" class="text-sm font-medium">Widget Name</Label>
      <Input
        id="widget-name"
        :model-value="state.name"
        @update:model-value="update({ name: $event as string })"
        placeholder="e.g., Homepage Wall of Love"
        class="mt-1.5"
      />
    </div>

    <div>
      <Label class="text-sm font-medium mb-3 block">Theme</Label>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg border p-3 text-center text-sm transition-all"
          :class="state.theme === 'light' ? 'ring-2 ring-primary border-primary' : 'border-border'"
          @click="update({ theme: 'light' })"
        >
          <div class="mx-auto mb-1 h-6 w-6 rounded-full border border-gray-200 bg-white" />
          Light
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg border p-3 text-center text-sm transition-all"
          :class="state.theme === 'dark' ? 'ring-2 ring-primary border-primary' : 'border-border'"
          @click="update({ theme: 'dark' })"
        >
          <div class="mx-auto mb-1 h-6 w-6 rounded-full bg-gray-900" />
          Dark
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <Label class="text-sm font-medium block">Display Options</Label>

      <div class="flex items-center justify-between">
        <Label for="show-ratings" class="text-sm text-muted-foreground">Show ratings</Label>
        <Switch
          id="show-ratings"
          :checked="state.show_ratings"
          @update:checked="update({ show_ratings: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-dates" class="text-sm text-muted-foreground">Show dates</Label>
        <Switch
          id="show-dates"
          :checked="state.show_dates"
          @update:checked="update({ show_dates: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-company" class="text-sm text-muted-foreground">Show company</Label>
        <Switch
          id="show-company"
          :checked="state.show_company"
          @update:checked="update({ show_company: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-avatar" class="text-sm text-muted-foreground">Show avatar</Label>
        <Switch
          id="show-avatar"
          :checked="state.show_avatar"
          @update:checked="update({ show_avatar: $event })"
        />
      </div>
    </div>

    <div>
      <Label for="max-display" class="text-sm font-medium">Max testimonials</Label>
      <p class="text-xs text-muted-foreground mb-1.5">Leave empty to show all</p>
      <Input
        id="max-display"
        type="number"
        :model-value="state.max_display?.toString() ?? ''"
        @update:model-value="update({ max_display: $event ? parseInt($event as string) : null })"
        placeholder="All"
        class="w-24"
        min="1"
      />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label for="is-active" class="text-sm font-medium">Active</Label>
        <p class="text-xs text-muted-foreground">Inactive widgets won't render on your site</p>
      </div>
      <Switch
        id="is-active"
        :checked="state.is_active"
        @update:checked="update({ is_active: $event })"
      />
    </div>
  </div>
</template>
