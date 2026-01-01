<script setup lang="ts">
/**
 * Form Creation Loading Page
 * Route: /:org/forms/creating
 *
 * Shows a polished loading animation while creating a new form in the background.
 * Once the form is created (with a minimum display time for UX), redirects to the edit page.
 */
import { ref, toRefs, onMounted } from 'vue';
import { definePage } from 'unplugin-vue-router/runtime';
import { FormCreatingLoader } from '@/features/createForm';
import { useCreateForm } from '@/entities/form';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';
import { createSlugFromString } from '@/shared/urls';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const MINIMUM_DISPLAY_TIME_MS = 2500;

const contextStore = useCurrentContextStore();
const { currentOrganizationId, currentUserId } = toRefs(contextStore);
const { goToFormEdit } = useRouting();
const { createForm } = useCreateForm();

const error = ref<string | null>(null);
// Guard against double-execution (e.g., dev mode double-mount). Not reset on
// success since navigation unmounts the component; reset on error for retry.
const isCreating = ref(false);

/**
 * Creates a delay promise for minimum display time
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates the form and redirects to edit page
 */
async function createAndRedirect() {
  if (isCreating.value) return;
  if (!currentOrganizationId.value || !currentUserId.value) {
    error.value = 'Missing organization or user context. Please try again.';
    return;
  }

  isCreating.value = true;
  error.value = null;

  try {
    // Generate a temporary slug
    const tempSlug = createSlugFromString(`draft-${Date.now()}`);

    // Run form creation and minimum delay in parallel
    const [result] = await Promise.all([
      createForm({
        form: {
          name: 'Untitled Form',
          slug: tempSlug,
          product_name: '',
          product_description: '',
          organization_id: currentOrganizationId.value,
          created_by: currentUserId.value,
        },
      }),
      delay(MINIMUM_DISPLAY_TIME_MS),
    ]);

    if (result) {
      // Navigate to edit page, replacing this route in history
      goToFormEdit(
        { name: result.name || 'untitled', id: result.id },
        { replace: true }
      );
    } else {
      throw new Error('Failed to create form. Please try again.');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
    isCreating.value = false;
  }
}

function handleRetry() {
  createAndRedirect();
}

onMounted(() => {
  createAndRedirect();
});
</script>

<template>
  <FormCreatingLoader
    :error="error"
    @retry="handleRetry"
  />
</template>
