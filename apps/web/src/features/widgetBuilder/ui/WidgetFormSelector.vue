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

const modelValue = defineModel<string | null>({ required: true });

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { forms } = useGetForms(variables);

const ALL_FORMS_VALUE = '__all__';

const selectValue = computed({
  get: () => modelValue.value ?? ALL_FORMS_VALUE,
  set: (val: string) => {
    modelValue.value = val === ALL_FORMS_VALUE ? null : val;
  },
});
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-2 block">Form (optional)</label>
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
  </div>
</template>
