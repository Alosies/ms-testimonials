<script setup lang="ts">
/**
 * FormShareSection
 *
 * Displays form URL with copy and preview actions.
 */
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';

interface Props {
  formUrl: string;
}

const props = defineProps<Props>();

const linkCopied = ref(false);

function handleCopyLink() {
  navigator.clipboard.writeText(props.formUrl);
  linkCopied.value = true;
  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}

function handlePreview() {
  window.open(props.formUrl, '_blank');
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-sm font-medium text-foreground mb-1">Share Form</h2>
        <p
          class="text-xs text-muted-foreground truncate"
          :title="formUrl"
        >
          {{ formUrl }}
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <Button
          variant="default"
          size="sm"
          @click="handleCopyLink"
          class="gap-1.5"
        >
          <Icon
            :icon="linkCopied ? 'heroicons:check' : 'heroicons:document-duplicate'"
            class="h-4 w-4"
          />
          {{ linkCopied ? 'Copied!' : 'Copy Link' }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="handlePreview"
          class="gap-1.5"
        >
          <Icon icon="heroicons:eye" class="h-4 w-4" />
          Preview
        </Button>
      </div>
    </div>
  </section>
</template>
