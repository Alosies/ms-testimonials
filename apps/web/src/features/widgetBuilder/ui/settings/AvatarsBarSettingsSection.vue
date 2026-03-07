<script setup lang="ts">
import { computed } from 'vue';
import { Input, Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../../models';
import type { AvatarsBarSettings } from '@/entities/widget';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  state: WidgetFormState;
}>();

const emit = defineEmits<{
  'update:state': [state: WidgetFormState];
}>();

const settings = computed(() => props.state.settings as AvatarsBarSettings);

function updateSetting(patch: Partial<AvatarsBarSettings>) {
  emit('update:state', {
    ...props.state,
    settings: { ...settings.value, ...patch },
  });
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-sm font-medium block" :data-testid="widgetsTestIds.settingsHeading">Avatars Bar Settings</Label>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Avatar size</Label>
      <div class="flex gap-1.5">
        <button
          v-for="s in (['small', 'medium', 'large'] as const)"
          :key="s"
          type="button"
          class="rounded-md border px-3 py-1 text-xs transition-all capitalize"
          :class="settings.size === s ? 'ring-2 ring-primary border-primary' : 'border-border'"
          @click="updateSetting({ size: s })"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Max avatars</Label>
      <Input
        type="number"
        :model-value="settings.max_avatars.toString()"
        @update:model-value="updateSetting({ max_avatars: parseInt($event as string) || 5 })"
        class="w-20 mt-1"
        min="1"
        max="10"
      />
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Overlap (px)</Label>
      <input
        type="range"
        :value="settings.overlap_px"
        min="0"
        max="20"
        step="2"
        class="w-full mt-1"
        @input="updateSetting({ overlap_px: parseInt(($event.target as HTMLInputElement).value) })"
      />
      <p class="text-xs text-muted-foreground text-right">{{ settings.overlap_px }}px</p>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Show rating</Label>
      <Switch
        :model-value="settings.show_rating"
        @update:model-value="updateSetting({ show_rating: $event })"
      />
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Label template</Label>
      <Input
        :model-value="settings.label_template"
        @update:model-value="updateSetting({ label_template: $event as string })"
        class="mt-1"
      />
      <p class="text-xs text-muted-foreground mt-0.5">Use {count} for the total number</p>
    </div>
  </div>
</template>
