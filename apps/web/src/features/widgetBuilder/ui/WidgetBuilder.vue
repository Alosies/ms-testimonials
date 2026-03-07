<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@testimonials/ui';
import { Skeleton } from '@testimonials/ui';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';
import { useGetTestimonials } from '@/entities/testimonial';
import { useWidgetBuilder } from '../composables/useWidgetBuilder';
import type { WidgetFormState } from '../models';
import WidgetTypeSelector from './WidgetTypeSelector.vue';
import WidgetFormSelector from './WidgetFormSelector.vue';
import WidgetSettingsPanel from './WidgetSettingsPanel.vue';
import WidgetTestimonialSelector from './WidgetTestimonialSelector.vue';
import WidgetPreview from './WidgetPreview.vue';
import WidgetEmbedModal from './WidgetEmbedModal.vue';
import { widgetsTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  widgetId?: string | null;
  lockedFormId?: string | null;
}>();

const contextStore = useCurrentContextStore();
const { currentOrganizationId, currentUserId } = toRefs(contextStore);
const { goToWidgets, goToWidget } = useRouting();

const widgetIdRef = computed(() => props.widgetId ?? null);
const { state, selectedTestimonialIds, isEditMode, isLoading, isSaving, savedWidgetId, save } =
  useWidgetBuilder(widgetIdRef);

// Fetch approved testimonials for preview (Apollo cache deduplicates with selector query)
const testimonialVars = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { testimonials: allTestimonials } = useGetTestimonials(testimonialVars);

// When creating from a form context, lock the form_id
if (props.lockedFormId && !props.widgetId) {
  state.value.form_id = props.lockedFormId;
}

const showEmbedModal = ref(false);

const previewTestimonials = computed(() => {
  if (selectedTestimonialIds.value.length === 0) return [];
  return allTestimonials.value
    .filter((t) => t.status === 'approved' && selectedTestimonialIds.value.includes(t.id))
    .map((t) => ({
      id: t.id,
      content: t.content ?? null,
      customer_name: t.customer_name ?? null,
      customer_company: t.customer_company ?? null,
      customer_avatar_url: t.customer_avatar_url ?? null,
      rating: t.rating ?? null,
      status: t.status,
    }));
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
          <!-- Always visible: type + name -->
          <WidgetTypeSelector v-model="state.type" />
          <div>
            <Label for="widget-name" class="text-sm font-medium">Widget Name</Label>
            <Input
              id="widget-name"
              :data-testid="widgetsTestIds.nameInput"
              :model-value="state.name"
              @update:model-value="state.name = ($event as string)"
              placeholder="e.g., Homepage Wall of Love"
              class="mt-1.5"
            />
          </div>

          <!-- Tabbed sections -->
          <Tabs default-value="content">
            <TabsList class="w-full">
              <TabsTrigger value="content" class="flex-1 gap-1.5" :data-testid="widgetsTestIds.tabContent">
                Content
                <span
                  v-if="selectedTestimonialIds.length > 0"
                  class="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground leading-none"
                >
                  {{ selectedTestimonialIds.length }}
                </span>
              </TabsTrigger>
              <TabsTrigger value="design" class="flex-1" :data-testid="widgetsTestIds.tabDesign">Design</TabsTrigger>
            </TabsList>
            <TabsContent value="content" class="space-y-6 mt-4">
              <WidgetFormSelector v-model="state.form_id" :locked-form-id="lockedFormId" />
              <WidgetTestimonialSelector v-model:selected-ids="selectedTestimonialIds" />
            </TabsContent>
            <TabsContent value="design" class="mt-4">
              <WidgetSettingsPanel :state="state" @update:state="handleUpdateState" />
            </TabsContent>
          </Tabs>
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
