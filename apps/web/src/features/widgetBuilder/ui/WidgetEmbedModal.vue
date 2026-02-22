<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@testimonials/ui';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  open: boolean;
  widgetId: string;
  widgetType: string;
}>();

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const copied = ref(false);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

const embedCode = computed(() => {
  return `<div data-testimonials-widget="${props.widgetType}" data-widget-id="${props.widgetId}" data-api-url="${apiBaseUrl}"></div>
<script src="${window.location.origin}/embed/widgets.js" async><\/script>`;
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(embedCode.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg" :data-testid="widgetsTestIds.embedModal">
      <DialogHeader>
        <DialogTitle>Embed Code</DialogTitle>
        <DialogDescription>
          Copy this code and paste it into your website where you want the widget to appear.
        </DialogDescription>
      </DialogHeader>

      <div class="relative">
        <pre
          :data-testid="widgetsTestIds.embedCode"
          class="rounded-lg bg-muted p-4 text-sm text-foreground overflow-x-auto font-mono whitespace-pre-wrap break-all"
        >{{ embedCode }}</pre>
        <Button
          variant="outline"
          size="sm"
          class="absolute top-2 right-2 gap-1.5"
          :data-testid="widgetsTestIds.embedCopyButton"
          @click="copyToClipboard"
        >
          <Icon
            :icon="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
            class="h-4 w-4"
          />
          {{ copied ? 'Copied!' : 'Copy' }}
        </Button>
      </div>

      <p class="text-xs text-muted-foreground">
        The widget will load asynchronously and render inside the div element.
      </p>
    </DialogContent>
  </Dialog>
</template>
