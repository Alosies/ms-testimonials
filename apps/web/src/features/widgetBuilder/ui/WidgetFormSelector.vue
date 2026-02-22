<script setup lang="ts">
import { computed, toRefs } from 'vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@testimonials/ui';
import { useGetForms } from '@/entities/form';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useRouting } from '@/shared/routing';

const props = defineProps<{
  lockedFormId?: string | null;
}>();

const modelValue = defineModel<string | null>({ required: true });

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);
const { widgetsPath } = useRouting();

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { forms } = useGetForms(variables);

const ALL_FORMS_VALUE = '__all__';

const isLocked = computed(() => !!props.lockedFormId);

const lockedFormName = computed(() => {
  if (!props.lockedFormId) return null;
  const form = forms.value.find((f) => f.id === props.lockedFormId);
  return form?.name ?? null;
});

const selectValue = computed({
  get: () => modelValue.value ?? ALL_FORMS_VALUE,
  set: (val: string) => {
    if (isLocked.value) return;
    modelValue.value = val === ALL_FORMS_VALUE ? null : val;
  },
});
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-2 block">Form</label>

    <!-- Locked: form-level widget creation -->
    <template v-if="isLocked">
      <div class="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <span class="text-sm text-foreground">{{ lockedFormName ?? 'Loading...' }}</span>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        This widget is scoped to this form's testimonials. To create widgets from testimonials across multiple forms,
        <RouterLink :to="widgetsPath" class="text-primary hover:underline">visit the org-level widgets page</RouterLink>.
      </p>
    </template>

    <!-- Unlocked: org-level widget creation -->
    <template v-else>
      <p class="text-xs text-muted-foreground mb-2">
        Scope testimonials to a specific form, or show from all forms.
      </p>
      <Select v-model="selectValue">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="All forms (org-wide)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="ALL_FORMS_VALUE">All forms (org-wide)</SelectItem>
          <SelectItem v-for="form in forms" :key="form.id" :value="form.id">
            {{ form.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
  </div>
</template>
