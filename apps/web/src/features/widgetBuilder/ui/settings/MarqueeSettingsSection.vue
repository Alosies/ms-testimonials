<script setup lang="ts">
import { computed } from 'vue';
import { Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../../models';
import type { MarqueeSettings } from '@/entities/widget';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  state: WidgetFormState;
}>();

const emit = defineEmits<{
  'update:state': [state: WidgetFormState];
}>();

const settings = computed(() => props.state.settings as MarqueeSettings);

function updateSetting(patch: Partial<MarqueeSettings>) {
  emit('update:state', {
    ...props.state,
    settings: { ...settings.value, ...patch },
  });
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-sm font-medium block" :data-testid="widgetsTestIds.settingsHeading">Marquee Settings</Label>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Direction</Label>
      <div class="flex gap-1.5">
        <button
          v-for="dir in (['left', 'right'] as const)"
          :key="dir"
          type="button"
          :data-testid="widgetsTestIds.marqueeDirection"
          class="rounded-md border px-3 py-1 text-xs transition-all capitalize"
          :class="settings.direction === dir ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="settings.direction === dir ? 'true' : undefined"
          @click="updateSetting({ direction: dir })"
        >
          {{ dir }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Card style</Label>
      <div class="flex gap-1.5">
        <button
          v-for="style in (['compact', 'full'] as const)"
          :key="style"
          type="button"
          :data-testid="widgetsTestIds.marqueeCardStyle"
          class="rounded-md border px-3 py-1 text-xs transition-all capitalize"
          :class="settings.card_style === style ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="settings.card_style === style ? 'true' : undefined"
          @click="updateSetting({ card_style: style })"
        >
          {{ style }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Label class="text-sm text-muted-foreground">Pause on hover</Label>
      <Switch
        :model-value="settings.pause_on_hover"
        @update:model-value="updateSetting({ pause_on_hover: $event })"
      />
    </div>

    <div>
      <Label class="text-sm text-muted-foreground">Speed (px/sec)</Label>
      <input
        type="range"
        :value="settings.speed"
        min="10"
        max="100"
        step="5"
        class="w-full mt-1"
        @input="updateSetting({ speed: parseInt(($event.target as HTMLInputElement).value) })"
      />
      <p class="text-xs text-muted-foreground text-right">{{ settings.speed }} px/s</p>
    </div>
  </div>
</template>
