<script setup lang="ts">
/**
 * Sharing Section - Modern minimal card
 */
import { ref, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { createPublicFormUrl } from '@/shared/urls';

interface Props {
  formId: string;
  formName: string;
}

const props = defineProps<Props>();

const copied = ref(false);

const publicUrl = computed(() => {
  const path = createPublicFormUrl(props.formName, props.formId);
  return `${window.location.origin}${path}`;
});

const shortPath = computed(() => {
  try {
    const url = new URL(publicUrl.value);
    const path = url.pathname;
    // Truncate long paths
    if (path.length > 30) {
      return path.slice(0, 15) + '...' + path.slice(-12);
    }
    return path;
  } catch {
    return publicUrl.value;
  }
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}
</script>

<template>
  <div class="group p-5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/50 transition-all">
    <div class="flex items-start justify-between gap-4 mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="heroicons:link" class="w-4 h-4 text-muted-foreground" />
          <h3 class="text-sm font-medium text-foreground">Sharing</h3>
        </div>
        <p class="text-xs text-muted-foreground">
          Public form URL
        </p>
      </div>
    </div>

    <div
      class="flex items-center gap-2 px-3 py-2 bg-background/60 rounded-lg cursor-pointer hover:bg-background transition-colors mb-3"
      :title="publicUrl"
      @click="copyToClipboard"
    >
      <Icon icon="heroicons:globe-alt" class="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span class="flex-1 text-xs font-mono text-muted-foreground truncate">
        {{ shortPath }}
      </span>
    </div>

    <button
      type="button"
      :class="[
        'w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
        copied
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      ]"
      @click="copyToClipboard"
    >
      <Icon
        :icon="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
        class="w-4 h-4"
      />
      {{ copied ? 'Copied!' : 'Copy link' }}
    </button>
  </div>
</template>
