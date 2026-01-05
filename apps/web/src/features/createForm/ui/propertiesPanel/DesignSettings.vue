<script setup lang="ts">
/**
 * Design Settings - Form branding customization
 *
 * Allows customization of:
 * - Primary accent color (buttons, links, highlights)
 * - Logo URL (with fallback to organization logo)
 */
import { ref, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Input, Label } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { isValidHexColor, normalizeHexColor } from '@/entities/form';

const editor = useTimelineEditor();

// Local state for color input (to handle native color picker)
const localColor = ref(editor.effectivePrimaryColor.value);

// Sync local color with editor state
watch(
  () => editor.effectivePrimaryColor.value,
  (newColor) => {
    localColor.value = newColor;
  }
);

// Handle color change from native picker
function handleColorChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newColor = target.value;

  if (isValidHexColor(newColor)) {
    localColor.value = normalizeHexColor(newColor);
    editor.updatePrimaryColor(localColor.value);
  }
}

// Logo URL input
const logoUrlInput = ref('');

// Sync logo URL input with editor state
watch(
  () => editor.logoUrl.value,
  (newUrl) => {
    logoUrlInput.value = newUrl ?? '';
  },
  { immediate: true }
);

// Handle logo URL change
function handleLogoUrlChange() {
  const url = logoUrlInput.value.trim();
  editor.updateLogoUrl(url || null);
}

// Logo preview error handling
const logoLoadError = ref(false);

function handleLogoError() {
  logoLoadError.value = true;
}

function handleLogoLoad() {
  logoLoadError.value = false;
}

// Reset logo error when URL changes
watch(logoUrlInput, () => {
  logoLoadError.value = false;
});
</script>

<template>
  <div class="design-settings">
    <div class="flex items-center gap-2 mb-3">
      <Icon icon="heroicons:paint-brush" class="w-4 h-4 text-primary" />
      <h4 class="text-sm font-semibold">Design</h4>
    </div>

    <div class="space-y-4">
      <!-- Primary Color -->
      <div>
        <Label class="text-sm mb-2 block">Accent Color</Label>
        <div class="flex items-center gap-3">
          <!-- Color swatch with native picker -->
          <label class="relative cursor-pointer group">
            <div
              class="w-10 h-10 rounded-lg border-2 border-border shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md"
              :style="{ backgroundColor: localColor }"
            />
            <input
              type="color"
              :value="localColor"
              class="absolute inset-0 opacity-0 cursor-pointer"
              @input="handleColorChange"
            />
          </label>

          <!-- Hex value display -->
          <div class="flex-1">
            <span class="text-sm font-mono text-muted-foreground">
              {{ localColor.toUpperCase() }}
            </span>
          </div>

          <!-- Reset button -->
          <Button
            v-if="editor.hasCustomColor.value"
            variant="ghost"
            size="sm"
            class="h-8 px-2"
            @click="editor.resetPrimaryColor"
          >
            <Icon icon="heroicons:arrow-path" class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Logo URL -->
      <div>
        <Label class="text-sm mb-2 block">Logo</Label>

        <div class="space-y-2">
          <div class="flex gap-2">
            <Input
              v-model="logoUrlInput"
              type="url"
              placeholder="https://example.com/logo.png"
              class="flex-1 h-9 text-sm"
              @change="handleLogoUrlChange"
              @blur="handleLogoUrlChange"
            />
            <Button
              v-if="editor.hasCustomLogo.value"
              variant="ghost"
              size="sm"
              class="h-9 px-2"
              @click="editor.resetLogoUrl"
            >
              <Icon icon="heroicons:x-mark" class="w-4 h-4" />
            </Button>
          </div>

          <!-- Logo preview -->
          <div
            v-if="editor.effectiveLogo.value"
            class="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
          >
            <div class="w-12 h-12 flex items-center justify-center bg-white rounded border">
              <img
                v-if="!logoLoadError"
                :src="editor.effectiveLogo.value"
                alt="Logo preview"
                class="max-w-full max-h-full object-contain"
                @error="handleLogoError"
                @load="handleLogoLoad"
              />
              <Icon
                v-else
                icon="heroicons:photo"
                class="w-6 h-6 text-muted-foreground"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p
                v-if="editor.isUsingOrgLogo.value"
                class="text-xs text-muted-foreground"
              >
                Using organization logo
              </p>
              <p v-else class="text-xs text-muted-foreground truncate">
                {{ editor.effectiveLogo.value }}
              </p>
            </div>
          </div>

          <p v-else class="text-xs text-muted-foreground">
            Enter a URL to display your logo on the form.
          </p>
        </div>
      </div>

      <!-- Saving indicator -->
      <div
        v-if="editor.designSaving.value"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Icon icon="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
        Saving...
      </div>

      <!-- Error message -->
      <div
        v-if="editor.designSaveError.value"
        class="text-xs text-destructive"
      >
        {{ editor.designSaveError.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.design-settings {
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  background: hsl(var(--card));
}
</style>
