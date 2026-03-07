<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Badge, Button } from '@testimonials/ui';
import type { WidgetListItem } from '../models';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  widget: WidgetListItem;
}>();

const emit = defineEmits<{
  edit: [widget: WidgetListItem];
  delete: [widget: WidgetListItem];
}>();

const widgetTypeConfig = computed(() => {
  const configs: Record<string, { label: string; icon: string; colorClass: string }> = {
    wall_of_love: {
      label: 'Wall of Love',
      icon: 'heroicons:squares-2x2',
      colorClass: 'bg-violet-100 text-violet-600',
    },
    carousel: {
      label: 'Carousel',
      icon: 'heroicons:rectangle-stack',
      colorClass: 'bg-blue-100 text-blue-600',
    },
    single_quote: {
      label: 'Single Quote',
      icon: 'heroicons:chat-bubble-bottom-center-text',
      colorClass: 'bg-emerald-100 text-emerald-600',
    },
    marquee: {
      label: 'Marquee Strip',
      icon: 'heroicons:arrows-right-left',
      colorClass: 'bg-amber-100 text-amber-600',
    },
    rating_badge: {
      label: 'Rating Badge',
      icon: 'heroicons:star',
      colorClass: 'bg-yellow-100 text-yellow-600',
    },
    avatars_bar: {
      label: 'Avatars Bar',
      icon: 'heroicons:user-group',
      colorClass: 'bg-pink-100 text-pink-600',
    },
    toast_popup: {
      label: 'Toast Popup',
      icon: 'heroicons:bell-alert',
      colorClass: 'bg-indigo-100 text-indigo-600',
    },
  };
  return configs[props.widget.type] ?? configs.wall_of_love;
});

const createdDate = computed(() => {
  return new Date(props.widget.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});
</script>

<template>
  <div
    :data-testid="widgetsTestIds.widgetCard"
    :data-widget-id="widget.id"
    class="group relative rounded-lg border border-border bg-card p-5 transition-all hover:shadow-md hover:border-border/80 cursor-pointer"
    @click="emit('edit', widget)"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg"
          :class="widgetTypeConfig.colorClass"
        >
          <Icon :icon="widgetTypeConfig.icon" class="h-5 w-5" />
        </div>
        <div>
          <h3 class="font-medium text-foreground leading-tight" :data-testid="widgetsTestIds.widgetCardName">{{ widget.name }}</h3>
          <p class="text-xs text-muted-foreground mt-0.5">{{ createdDate }}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        :data-testid="widgetsTestIds.widgetCardDeleteButton"
        @click.stop="emit('delete', widget)"
      >
        <Icon icon="heroicons:trash" class="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <Badge variant="secondary" class="text-xs" :data-testid="widgetsTestIds.widgetCardType">
        {{ widgetTypeConfig.label }}
      </Badge>
      <Badge v-if="!widget.is_active" variant="outline" class="text-xs text-muted-foreground">
        Inactive
      </Badge>
      <Badge variant="outline" class="text-xs">
        {{ widget.theme }}
      </Badge>
    </div>
  </div>
</template>
