<script setup lang="ts">
import { ref, computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Separator } from '@testimonials/ui';
import { Skeleton } from '@testimonials/ui';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';
import { useWidgetBuilder } from '../composables/useWidgetBuilder';
import type { WidgetFormState, TestimonialForSelector } from '../models';
import WidgetTypeSelector from './WidgetTypeSelector.vue';
import WidgetFormSelector from './WidgetFormSelector.vue';
import WidgetSettingsPanel from './WidgetSettingsPanel.vue';
import WidgetTestimonialSelector from './WidgetTestimonialSelector.vue';
import WidgetPreview from './WidgetPreview.vue';
import WidgetEmbedModal from './WidgetEmbedModal.vue';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  widgetId?: string | null;
}>();

const contextStore = useCurrentContextStore();
const { currentOrganizationId, currentUserId } = toRefs(contextStore);
const { goToWidgets, goToWidget } = useRouting();

const widgetIdRef = computed(() => props.widgetId ?? null);
const { state, isEditMode, isLoading, isSaving, savedWidgetId, save } =
  useWidgetBuilder(widgetIdRef);

const selectedTestimonialIds = ref<string[]>([]);
const showEmbedModal = ref(false);

const previewTestimonials = computed<TestimonialForSelector[]>(() => {
  // In a full implementation, this would filter from the testimonial selector
  // For now, return empty — the preview will show the placeholder
  return [];
});

const canSave = computed(() => {
  return state.value.name.trim().length > 0 && !isSaving.value;
});

async function handleSave() {
  if (!currentOrganizationId.value || !currentUserId.value) return;
  const result = await save(currentOrganizationId.value, currentUserId.value);
  if (result && !isEditMode.value) {
    goToWidget({ name: result.name, id: result.id });
  }
}

function handleUpdateState(newState: WidgetFormState) {
  state.value = newState;
}
</script>

<template>
  <div class="min-h-full bg-background" :data-testid="widgetsTestIds.builderPage">
    <div class="mx-auto max-w-6xl px-6 py-8">
      <!-- Header -->
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="goToWidgets" :data-testid="widgetsTestIds.builderBackButton">
            <Icon icon="heroicons:arrow-left" class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-xl font-semibold tracking-tight text-foreground" :data-testid="widgetsTestIds.builderTitle">
              {{ isEditMode ? 'Edit Widget' : 'Create Widget' }}
            </h1>
            <p v-if="isEditMode && state.name" class="text-sm text-muted-foreground">
              {{ state.name }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="savedWidgetId"
            variant="outline"
            class="gap-2"
            :data-testid="widgetsTestIds.builderEmbedButton"
            @click="showEmbedModal = true"
          >
            <Icon icon="heroicons:code-bracket" class="h-4 w-4" />
            Embed Code
          </Button>
          <Button :disabled="!canSave" class="gap-2" :data-testid="widgetsTestIds.builderSaveButton" @click="handleSave">
            <Icon
              v-if="isSaving"
              icon="heroicons:arrow-path"
              class="h-4 w-4 animate-spin"
            />
            <Icon v-else icon="heroicons:check" class="h-4 w-4" />
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </div>
      </header>

      <!-- Loading skeleton -->
      <div v-if="isEditMode && isLoading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <Skeleton class="h-8 w-48" />
          <Skeleton class="h-32 w-full" />
          <Skeleton class="h-48 w-full" />
        </div>
        <Skeleton class="h-96 w-full" />
      </div>

      <!-- Builder -->
      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Left: Settings -->
        <div class="space-y-6">
          <WidgetTypeSelector v-model="state.type" />
          <Separator />
          <WidgetSettingsPanel :state="state" @update:state="handleUpdateState" />
          <Separator />
          <WidgetFormSelector v-model="state.form_id" />
          <Separator />
          <WidgetTestimonialSelector v-model:selected-ids="selectedTestimonialIds" />
        </div>

        <!-- Right: Preview -->
        <div class="lg:sticky lg:top-8 lg:self-start">
          <WidgetPreview :state="state" :testimonials="previewTestimonials" />
        </div>
      </div>
    </div>
  </div>

  <!-- Embed Code Modal -->
  <WidgetEmbedModal
    v-if="savedWidgetId"
    v-model:open="showEmbedModal"
    :widget-id="savedWidgetId"
    :widget-type="state.type"
  />
</template>
