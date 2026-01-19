<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Button, Input, Label, Separator } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { QuestionOption } from '@/shared/stepCards';
import { studioTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  options: QuestionOption[];
  questionTypeName: string;
  /** Whether controls are disabled (e.g., during save) */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  add: [];
  update: [index: number, updates: Partial<QuestionOption>];
  remove: [index: number];
}>();

// Ref to the options container for querying inputs
const optionsContainer = ref<HTMLElement | null>(null);

const isRadio = computed(() => props.questionTypeName === 'choice_single');

// Auto-generate optionValue from label
function generateOptionValue(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || `option_${Date.now()}`
  );
}

function handleLabelChange(index: number, label: string) {
  emit('update', index, {
    optionLabel: label,
    optionValue: generateOptionValue(label),
  });
}

// Handle Enter key to add new option and focus it
async function handleEnterKey() {
  emit('add');
  await nextTick();
  const inputs = optionsContainer.value?.querySelectorAll('input');
  if (inputs?.length) {
    (inputs[inputs.length - 1] as HTMLInputElement).focus();
  }
}
</script>

<template>
  <div :data-testid="studioTestIds.questionOptionsSection">
    <Separator class="my-4" />

    <div class="rounded-lg border bg-gray-50 p-4">
      <div class="mb-3 flex items-center justify-between">
        <Label class="text-sm font-medium">Answer Options</Label>
        <Button variant="outline" size="sm" class="h-8" :disabled="disabled" @click="emit('add')">
          <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
          Add Option
        </Button>
      </div>

      <div
        v-if="!options?.length"
        class="rounded-md border-2 border-dashed border-gray-200 py-6 text-center"
      >
        <Icon icon="lucide:list" class="mx-auto h-8 w-8 text-gray-300" />
        <p class="mt-2 text-sm text-gray-500">No options added yet</p>
        <Button variant="ghost" size="sm" class="mt-2" :disabled="disabled" @click="emit('add')">
          Add your first option
        </Button>
      </div>

      <div v-else ref="optionsContainer" class="space-y-2">
        <div
          v-for="(option, optIndex) in options"
          :key="option.id"
          :data-testid="studioTestIds.questionOptionItem"
          class="flex items-center gap-2"
        >
          <!-- Visual indicator (radio or checkbox style) -->
          <div class="flex h-8 w-8 shrink-0 items-center justify-center">
            <div
              :class="[
                'h-4 w-4 border-2 border-gray-300',
                isRadio ? 'rounded-full' : 'rounded',
              ]"
            />
          </div>

          <Input
            :model-value="option.optionLabel"
            class="flex-1"
            placeholder="Enter option text..."
            :disabled="disabled"
            @update:model-value="(v) => handleLabelChange(optIndex, String(v))"
            @keydown.enter.prevent="handleEnterKey"
          />

          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
            :disabled="disabled"
            @click="emit('remove', optIndex)"
          >
            <Icon icon="lucide:x" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
