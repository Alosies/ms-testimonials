<script setup lang="ts">
/**
 * Edit form page - Timeline Editor
 * Route: /:org/forms/:urlSlug/edit
 *
 * Uses Notion-inspired URL pattern: {readable-slug}_{entity_id}
 * The slug is cosmetic; only the entity_id is used for data fetching.
 */
import { computed, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { definePage } from 'unplugin-vue-router/runtime';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '@/features/createForm/ui/FormEditorHeader.vue';
import { useTimelineEditor } from '@/features/createForm/composables/timeline/useTimelineEditor';
import { extractEntityIdFromSlug } from '@/shared/urls';
// TODO: Import actual components when ready
// import StepsSidebar from '@/features/createForm/ui/stepsSidebar/StepsSidebar.vue';
// import TimelineCanvas from '@/features/createForm/ui/timelineCanvas/TimelineCanvas.vue';
// import PropertiesPanel from '@/features/createForm/ui/propertiesPanel/PropertiesPanel.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();
const router = useRouter();

const urlSlug = computed(() => route.params.urlSlug as string);

const formId = computed(() => {
  const result = extractEntityIdFromSlug(urlSlug.value);
  // If extraction succeeds, use the entityId; otherwise treat the whole slug as an ID
  return result?.isValid ? result.entityId : urlSlug.value;
});

const editor = useTimelineEditor(formId);

// Provide editor context to child components
provide('timelineEditor', editor);

// Header state
const formName = ref('My Test Form');
const saveStatus = ref<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

// Header handlers
function handleBack() {
  router.push({ name: '/[org]/forms/', params: { org: route.params.org } });
}

function handlePreview() {
  // TODO: Open preview mode
}

function handlePublish() {
  // TODO: Publish form
}

function handleFormNameUpdate(name: string) {
  formName.value = name;
  saveStatus.value = 'unsaved';
}
</script>

<template>
  <FormEditorLayout>
    <template #header>
      <FormEditorHeader
        :form-name="formName"
        :save-status="saveStatus"
        :can-publish="true"
        @back="handleBack"
        @preview="handlePreview"
        @publish="handlePublish"
        @update:form-name="handleFormNameUpdate"
      />
    </template>

    <template #sidebar>
      <!-- TODO: Replace with StepsSidebar when Green completes G4 -->
      <div class="p-2 text-xs text-muted-foreground">
        <div class="mb-2 font-semibold">STEPS</div>
        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          class="mb-2 p-2 bg-background rounded cursor-pointer"
          :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
          @click="editor.selectStep(index)"
        >
          {{ index + 1 }}. {{ step.stepType }}
        </div>
        <button
          class="w-full p-2 border border-dashed rounded text-center hover:bg-muted/50"
          @click="editor.handleAddStep('question')"
        >
          + Add
        </button>
      </div>
    </template>

    <template #timeline>
      <!-- TODO: Replace with TimelineCanvas when Green completes G8 -->
      <div class="p-8">
        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          :data-step-index="index"
          class="mb-8"
        >
          <div
            class="max-w-md mx-auto p-6 bg-background rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md"
            :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
            @click="editor.handleEditStep(index)"
          >
            <div class="text-sm text-muted-foreground mb-2">
              Step {{ index + 1 }}: {{ step.stepType }}
            </div>
            <div class="font-medium">
              {{ (step.content as Record<string, unknown>).title || 'Untitled' }}
            </div>
          </div>
          <!-- Connector -->
          <div v-if="index < editor.steps.value.length - 1" class="flex justify-center my-4">
            <div class="w-0.5 h-8 bg-border" />
          </div>
        </div>
        <!-- Empty state -->
        <div v-if="editor.steps.value.length === 0" class="text-center py-12 text-muted-foreground">
          <p class="mb-4">No steps yet. Add your first step to get started.</p>
          <button
            class="px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50"
            @click="editor.handleAddStep('welcome')"
          >
            + Add Welcome Step
          </button>
        </div>
      </div>
    </template>

    <template #properties>
      <!-- TODO: Replace with PropertiesPanel when Blue completes B4 -->
      <div class="p-4">
        <div v-if="editor.selectedStep.value">
          <h3 class="font-semibold mb-2">Properties</h3>
          <div class="text-sm text-muted-foreground">
            Selected: {{ editor.selectedStep.value.stepType }}
          </div>
          <div class="mt-4">
            <h4 class="text-sm font-medium mb-2">Tips</h4>
            <div
              v-for="(tip, i) in editor.selectedStep.value.tips"
              :key="i"
              class="text-sm p-2 bg-muted rounded mb-1"
            >
              {{ tip }}
            </div>
            <button
              class="text-sm text-primary hover:underline"
              @click="editor.updateStepTips(editor.selectedIndex.value, [...editor.selectedStep.value.tips, 'New tip'])"
            >
              + Add tip
            </button>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          Select a step to see properties
        </div>
      </div>
    </template>
  </FormEditorLayout>
</template>
