<script setup lang="ts">
/**
 * AI Section - Settings card for AI generation limits
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';

const aiGenerationLimit = defineModel<number | null>('aiGenerationLimit', { required: true });

const displayValue = computed(() =>
  aiGenerationLimit.value !== null ? String(aiGenerationLimit.value) : '',
);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const raw = target.value.trim();

  if (raw === '') {
    aiGenerationLimit.value = null;
    return;
  }

  const num = parseInt(raw, 10);
  if (!isNaN(num)) {
    aiGenerationLimit.value = Math.max(1, Math.min(20, num));
  }
}
</script>

<template>
  <div class="group p-5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/50 transition-all">
    <div class="flex items-center gap-2 mb-1">
      <Icon icon="heroicons:sparkles" class="w-4 h-4 text-muted-foreground" />
      <h3 class="text-sm font-medium text-foreground">AI</h3>
    </div>
    <p class="text-xs text-muted-foreground">
      Testimonial generation settings
    </p>

    <div class="mt-4 space-y-1.5">
      <label class="text-xs font-medium text-foreground" for="ai-limit-input">
        Max generations per customer
      </label>
      <input
        id="ai-limit-input"
        type="number"
        min="1"
        max="20"
        placeholder="4"
        :value="displayValue"
        class="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
        @input="handleInput"
      />
      <p class="text-[11px] text-muted-foreground">
        Per customer, per 24 hours. Leave empty for default (4).
      </p>
    </div>
  </div>
</template>
