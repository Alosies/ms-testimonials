<script setup lang="ts">
/**
 * Form Settings Panel
 *
 * Modern, minimal design with efficient horizontal space usage.
 */
import { computed } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { useToast } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { usePlatform } from '@/shared/composables/usePlatform';
import type { FormBasicFragment } from '@/shared/graphql/generated/operations';
import type { FormRef } from '@/shared/routing';
import { useFormSettings, type FormStatus } from '../composables';
import GeneralSettingsSection from './GeneralSettingsSection.vue';
import StatusSection from './StatusSection.vue';
import DesignSection from './DesignSection.vue';
import SharingSection from './SharingSection.vue';
import AISection from './AISection.vue';

interface Props {
  form: FormBasicFragment;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saved: [];
}>();

const { toast } = useToast();
const { modifierKey } = usePlatform();

const formRef = computed(() => props.form);
const settings = useFormSettings({ form: formRef });

const formNavRef = computed((): FormRef => ({
  id: props.form.id,
  name: props.form.name,
}));

const canSave = computed(() => {
  return settings.hasChanges.value && !settings.isSaving.value;
});

function handleStatusChange(newStatus: FormStatus) {
  settings.status.value = newStatus;
}


async function handleSave() {
  if (!canSave.value) return;

  const success = await settings.save();

  if (success) {
    toast({
      title: 'Settings saved',
      description: 'Your form settings have been updated.',
    });
    emit('saved');
  } else if (settings.saveError.value) {
    toast({
      title: 'Error',
      description: settings.saveError.value,
      variant: 'destructive',
    });
  }
}

// Keyboard shortcut: Cmd+S / Ctrl+S
onKeyStroke('s', (e) => {
  if (e.metaKey || e.ctrlKey) {
    e.preventDefault();
    handleSave();
  }
});

</script>

<template>
  <div class="space-y-10">
    <!-- Floating save bar -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="settings.hasChanges.value"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div class="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-border/60 rounded-2xl shadow-lg shadow-black/5">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span class="text-sm text-muted-foreground">Unsaved changes</span>
          </div>
          <div class="w-px h-4 bg-border/60" />
          <button
            type="button"
            class="group flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!canSave"
            @click="handleSave"
          >
            <Icon
              v-if="settings.isSaving.value"
              icon="heroicons:arrow-path"
              class="w-4 h-4 animate-spin"
            />
            <span class="text-sm font-medium">{{ settings.isSaving.value ? 'Saving...' : 'Save changes' }}</span>
            <kbd
              v-if="!settings.isSaving.value"
              class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-primary-foreground/80 rounded"
            >
              {{ modifierKey }}S
            </kbd>
          </button>
        </div>
      </div>
    </Transition>

    <!-- General Section -->
    <section>
      <GeneralSettingsSection
        v-model:name="settings.name.value"
        v-model:product-name="settings.productName.value"
        v-model:product-description="settings.productDescription.value"
        :form-ref="formNavRef"
      />
    </section>

    <!-- Quick Settings Row -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StatusSection
        :status="settings.status.value"
        @update:status="handleStatusChange"
      />
      <DesignSection
        v-model:primary-color="settings.primaryColor.value"
        :has-custom-color="settings.hasCustomColor.value"
        @reset-color="settings.resetColor"
      />
      <SharingSection
        :form-id="form.id"
        :form-name="form.name"
      />
      <AISection
        v-model:ai-generation-limit="settings.aiGenerationLimit.value"
      />
    </section>
  </div>
</template>
