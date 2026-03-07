<script setup lang="ts">
import { computed } from 'vue';
import { Input, Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../../models';
import type { ToastPopupSettings } from '@/entities/widget';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  state: WidgetFormState;
}>();

const emit = defineEmits<{
  'update:state': [state: WidgetFormState];
}>();

const settings = computed(() => props.state.settings as ToastPopupSettings);

function updateSetting(patch: Partial<ToastPopupSettings>) {
  emit('update:state', {
    ...props.state,
    settings: { ...settings.value, ...patch },
  });
}

const positionOptions = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
] as const;

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-sm font-medium block" :data-testid="widgetsTestIds.settingsHeading">Toast Popup Settings</Label>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Position</Label>
      <div class="grid grid-cols-2 gap-1">
        <button
          v-for="pos in positionOptions"
          :key="pos.value"
          type="button"
          :data-testid="widgetsTestIds.toastPosition"
          class="rounded-md border px-2 py-1 text-[11px] transition-all"
          :class="settings.position === pos.value ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="settings.position === pos.value ? 'true' : undefined"
          @click="updateSetting({ position: pos.value })"
        >
          {{ pos.label }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Animation</Label>
      <div class="flex gap-1.5">
        <button
          v-for="anim in (['slide', 'fade'] as const)"
          :key="anim"
          type="button"
          :data-testid="widgetsTestIds.toastAnimation"
          class="rounded-md border px-3 py-1 text-xs transition-all capitalize"
          :class="settings.animate_in === anim ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="settings.animate_in === anim ? 'true' : undefined"
          @click="updateSetting({ animate_in: anim })"
        >
          {{ anim }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Show dismiss button</Label>
      <Switch
        :model-value="settings.show_dismiss"
        @update:model-value="updateSetting({ show_dismiss: $event })"
      />
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Display duration</Label>
      <input
        type="range"
        :value="settings.display_duration"
        min="3000"
        max="20000"
        step="1000"
        class="w-full mt-1"
        @input="updateSetting({ display_duration: parseInt(($event.target as HTMLInputElement).value) })"
      />
      <p class="text-xs text-muted-foreground text-right">{{ formatSeconds(settings.display_duration) }}</p>
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Initial delay</Label>
      <input
        type="range"
        :value="settings.delay_before_first"
        min="0"
        max="10000"
        step="500"
        class="w-full mt-1"
        @input="updateSetting({ delay_before_first: parseInt(($event.target as HTMLInputElement).value) })"
      />
      <p class="text-xs text-muted-foreground text-right">{{ formatSeconds(settings.delay_before_first) }}</p>
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Rotation interval</Label>
      <input
        type="range"
        :value="settings.rotation_interval"
        min="5000"
        max="60000"
        step="1000"
        class="w-full mt-1"
        @input="updateSetting({ rotation_interval: parseInt(($event.target as HTMLInputElement).value) })"
      />
      <p class="text-xs text-muted-foreground text-right">{{ formatSeconds(settings.rotation_interval) }}</p>
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Max per session</Label>
      <Input
        type="number"
        :model-value="settings.max_per_session.toString()"
        @update:model-value="updateSetting({ max_per_session: parseInt($event as string) || 5 })"
        class="w-20 mt-1"
        min="1"
        max="20"
      />
    </div>
  </div>
</template>
