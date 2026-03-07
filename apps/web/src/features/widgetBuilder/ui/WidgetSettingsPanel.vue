<script setup lang="ts">
import { Input, Label, Switch } from '@testimonials/ui';
import type { WidgetFormState } from '../models';
import { widgetsTestIds } from '@/shared/constants/testIds';
import MarqueeSettingsSection from './settings/MarqueeSettingsSection.vue';
import RatingBadgeSettingsSection from './settings/RatingBadgeSettingsSection.vue';
import AvatarsBarSettingsSection from './settings/AvatarsBarSettingsSection.vue';
import ToastPopupSettingsSection from './settings/ToastPopupSettingsSection.vue';

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
      <Label class="text-sm font-medium mb-3 block">Theme</Label>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg border p-3 text-center text-sm transition-all"
          :class="state.theme === 'light' ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="state.theme === 'light' ? 'true' : undefined"
          :data-testid="widgetsTestIds.themeLight"
          @click="update({ theme: 'light' })"
        >
          <div class="mx-auto mb-1 h-6 w-6 rounded-full border border-gray-200 bg-white" />
          Light
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg border p-3 text-center text-sm transition-all"
          :class="state.theme === 'dark' ? 'ring-2 ring-primary border-primary' : 'border-border'"
          :data-selected="state.theme === 'dark' ? 'true' : undefined"
          :data-testid="widgetsTestIds.themeDark"
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
          :data-testid="widgetsTestIds.switchShowRatings"
          :model-value="state.show_ratings"
          @update:model-value="update({ show_ratings: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-dates" class="text-sm text-muted-foreground">Show dates</Label>
        <Switch
          id="show-dates"
          :data-testid="widgetsTestIds.switchShowDates"
          :model-value="state.show_dates"
          @update:model-value="update({ show_dates: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-company" class="text-sm text-muted-foreground">Show company</Label>
        <Switch
          id="show-company"
          :data-testid="widgetsTestIds.switchShowCompany"
          :model-value="state.show_company"
          @update:model-value="update({ show_company: $event })"
        />
      </div>

      <div class="flex items-center justify-between">
        <Label for="show-avatar" class="text-sm text-muted-foreground">Show avatar</Label>
        <Switch
          id="show-avatar"
          :data-testid="widgetsTestIds.switchShowAvatar"
          :model-value="state.show_avatar"
          @update:model-value="update({ show_avatar: $event })"
        />
      </div>
    </div>

    <div>
      <Label for="max-display" class="text-sm font-medium">Max testimonials</Label>
      <p class="text-xs text-muted-foreground mb-1.5">Leave empty to show all</p>
      <Input
        id="max-display"
        :data-testid="widgetsTestIds.maxDisplayInput"
        type="number"
        :model-value="state.max_display?.toString() ?? ''"
        @update:model-value="update({ max_display: $event ? parseInt($event as string) : null })"
        placeholder="All"
        class="w-24"
        min="1"
      />
    </div>

    <!-- Type-specific settings -->
    <MarqueeSettingsSection
      v-if="state.type === 'marquee'"
      :state="state"
      @update:state="emit('update:state', $event)"
    />
    <RatingBadgeSettingsSection
      v-if="state.type === 'rating_badge'"
      :state="state"
      @update:state="emit('update:state', $event)"
    />
    <AvatarsBarSettingsSection
      v-if="state.type === 'avatars_bar'"
      :state="state"
      @update:state="emit('update:state', $event)"
    />
    <ToastPopupSettingsSection
      v-if="state.type === 'toast_popup'"
      :state="state"
      @update:state="emit('update:state', $event)"
    />

    <div class="flex items-center justify-between">
      <div>
        <Label for="is-active" class="text-sm font-medium">Active</Label>
        <p class="text-xs text-muted-foreground">Inactive widgets won't render on your site</p>
      </div>
      <Switch
        id="is-active"
        :data-testid="widgetsTestIds.switchIsActive"
        :model-value="state.is_active"
        @update:model-value="update({ is_active: $event })"
      />
    </div>
  </div>
</template>
