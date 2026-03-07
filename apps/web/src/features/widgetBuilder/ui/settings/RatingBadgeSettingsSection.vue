<script setup lang="ts">
import { computed } from 'vue';
import { Input, Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../../models';
import type { RatingBadgeSettings } from '@/entities/widget';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  state: WidgetFormState;
}>();

const emit = defineEmits<{
  'update:state': [state: WidgetFormState];
}>();

const settings = computed(() => props.state.settings as RatingBadgeSettings);

function updateSetting(patch: Partial<RatingBadgeSettings>) {
  emit('update:state', {
    ...props.state,
    settings: { ...settings.value, ...patch },
  });
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-sm font-medium block" :data-testid="widgetsTestIds.settingsHeading">Rating Badge Settings</Label>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Style</Label>
      <div class="flex gap-1.5">
        <button
          v-for="s in (['inline', 'card'] as const)"
          :key="s"
          type="button"
          class="rounded-md border px-3 py-1 text-xs transition-all capitalize"
          :class="settings.style === s ? 'ring-2 ring-primary border-primary' : 'border-border'"
          @click="updateSetting({ style: s })"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Show average</Label>
      <Switch
        :model-value="settings.show_average"
        @update:model-value="updateSetting({ show_average: $event })"
      />
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Show count</Label>
      <Switch
        :model-value="settings.show_count"
        @update:model-value="updateSetting({ show_count: $event })"
      />
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Link URL (optional)</Label>
      <Input
        :model-value="settings.link_to_wall ?? ''"
        @update:model-value="updateSetting({ link_to_wall: ($event as string) || null })"
        placeholder="https://..."
        class="mt-1"
      />
      <p class="text-xs text-muted-foreground mt-0.5">Badge will link to this URL when clicked</p>
    </div>
  </div>
</template>
