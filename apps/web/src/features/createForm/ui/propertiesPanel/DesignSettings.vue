<script setup lang="ts">
/**
 * Design Settings - Form branding customization
 *
 * Allows customization of:
 * - Primary accent color (buttons, links, highlights)
 * - Displays organization logo (read-only, set in Settings)
 */
import { ref, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Label } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { isValidHexColor, normalizeHexColor } from '@/entities/form';
import { OrganizationLogo } from '@/entities/organization';

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

      <!-- Logo -->
      <div>
        <Label class="text-sm mb-2 block">Logo</Label>

        <!-- Organization Logo Preview -->
        <div
          v-if="editor.orgLogoUrl.value"
          class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
        >
          <OrganizationLogo
            :logo-url="editor.orgLogoUrl.value"
            size="md"
            :show-placeholder="false"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground">
              Organization Logo
            </p>
            <p class="text-xs text-muted-foreground">
              Displayed on all form steps
            </p>
          </div>
        </div>

        <!-- No logo message -->
        <p
          v-else
          class="text-xs text-muted-foreground"
        >
          Set your organization logo in Settings to display it on forms.
        </p>
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
