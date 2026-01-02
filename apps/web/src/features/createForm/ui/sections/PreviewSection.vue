<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, Input } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import FormSectionHeader from '../FormSectionHeader.vue';
import FormPreview from '../formPreview/FormPreview.vue';
import type { FormData, QuestionData } from '../../models';
import type { SectionStatus } from '../FormSectionHeader.vue';

const props = defineProps<{
  expanded: boolean;
  disabled: boolean;
  formData: FormData;
  questions: QuestionData[];
  formId: string | null;
  publishing: boolean;
}>();

const emit = defineEmits<{
  'update:expanded': [value: boolean];
  publish: [];
}>();

const copied = ref(false);

// Section status
const sectionStatus = computed<SectionStatus>(() => {
  if (props.publishing) return 'in-progress';
  if (props.questions.length > 0) return 'complete';
  return 'incomplete';
});

const formLink = computed(() => {
  const baseUrl = window.location.origin;
  const slug = props.formData.product_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseUrl}/f/${slug}`;
});

function handleToggle() {
  if (!props.disabled) {
    emit('update:expanded', !props.expanded);
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(formLink.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

function openPreviewInNewTab() {
  window.open(formLink.value, '_blank');
}

function handlePublish() {
  emit('publish');
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <FormSectionHeader
      title="Preview & Publish"
      subtitle="Review your form and make it live"
      icon="lucide:send"
      :expanded="expanded"
      :disabled="disabled"
      :status="sectionStatus"
      @toggle="handleToggle"
    />

    <div
      v-show="expanded && !disabled"
      class="border-t border-gray-100 p-4"
    >
      <div class="space-y-6">
        <!-- Form Link -->
        <div class="rounded-lg bg-gray-50 p-4">
          <label class="block text-sm font-medium text-gray-700">
            Shareable Link
          </label>
          <div class="mt-2 flex">
            <Input :model-value="formLink" readonly class="flex-1 rounded-r-none" />
            <Button class="rounded-l-none" @click="copyLink">
              <Icon
                :icon="copied ? 'lucide:check' : 'lucide:copy'"
                class="mr-2 h-4 w-4"
              />
              {{ copied ? 'Copied!' : 'Copy' }}
            </Button>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="overflow-hidden rounded-lg border">
          <div class="flex items-center justify-between border-b bg-gray-100 px-4 py-2">
            <span class="text-sm text-gray-500">Form Preview</span>
            <Button variant="ghost" size="sm" @click="openPreviewInNewTab">
              <Icon icon="lucide:external-link" class="mr-1.5 h-3.5 w-3.5" />
              Open in new tab
            </Button>
          </div>
          <div class="bg-white p-4">
            <FormPreview :form-data="formData" :questions="questions" />
          </div>
        </div>

        <!-- Publish Button -->
        <div class="flex justify-end">
          <Button
            size="lg"
            :disabled="publishing || questions.length === 0"
            @click="handlePublish"
          >
            <template v-if="publishing">
              <Icon icon="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </template>
            <template v-else>
              <Icon icon="lucide:rocket" class="mr-2 h-4 w-4" />
              Publish Form
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
