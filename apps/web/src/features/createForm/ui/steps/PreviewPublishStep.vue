<script setup lang="ts">
import { ref, computed, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useCurrentContextStore } from '@/shared/currentContext';
import type { FormData, QuestionData } from '../../models';
import FormPreview from '../formPreview/FormPreview.vue';

const props = defineProps<{
  formData: FormData;
  questions: QuestionData[];
  formId: string | null;
}>();

const emit = defineEmits<{
  prev: [];
}>();

const router = useRouter();
const contextStore = useCurrentContextStore();
const { organization: currentOrganization } = toRefs(contextStore);
const copied = ref(false);

const formLink = computed(() => {
  const baseUrl = window.location.origin;
  const slug = props.formData.product_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseUrl}/f/${slug}`;
});

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

function finish() {
  const orgSlug = currentOrganization.value?.slug;
  if (orgSlug) {
    router.push(`/${orgSlug}/forms`);
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Preview & Publish</h2>
      <p class="mt-1 text-sm text-gray-500">
        Your form is ready! Preview it and copy the shareable link.
      </p>
    </div>

    <!-- Form Link -->
    <div class="rounded-lg bg-gray-50 p-4">
      <label class="block text-sm font-medium text-gray-700"
        >Shareable Link</label
      >
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
      <div class="border-b bg-gray-100 px-4 py-2">
        <span class="text-sm text-gray-500">Form Preview</span>
      </div>
      <div class="bg-white p-4">
        <FormPreview :form-data="formData" :questions="questions" />
      </div>
    </div>

    <div class="flex justify-between">
      <Button variant="outline" @click="emit('prev')">Back</Button>
      <div class="space-x-3">
        <Button variant="outline" @click="openPreviewInNewTab">
          <Icon icon="lucide:external-link" class="mr-2 h-4 w-4" />
          Open Preview
        </Button>
        <Button @click="finish">
          Done
          <Icon icon="lucide:check" class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
