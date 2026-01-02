<script setup lang="ts">
import { ref, toRefs, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@testimonials/ui';
import { useOrganizationStore } from '@/entities/organization';
import type { QuestionTypeId } from '@/shared/api';
import type { QuestionData } from '../../models';

const emit = defineEmits<{
  add: [question: Partial<QuestionData>];
  close: [];
}>();

// Get allowed question types from organization's plan (pre-formatted for select)
const organizationStore = useOrganizationStore();
const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

// Form state
const questionText = ref('');
const questionTypeId = ref<QuestionTypeId>('text_long');
const placeholder = ref('');
const helpText = ref('');
const isRequired = ref(true);

const isOpen = ref(true);

// Generate key from question text (for internal use)
function generateKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
}

const isValid = computed(() => questionText.value.trim().length > 0);

function handleAdd() {
  if (!isValid.value) return;

  emit('add', {
    question_text: questionText.value.trim(),
    question_key: generateKey(questionText.value.trim()),
    question_type_id: questionTypeId.value,
    placeholder: placeholder.value.trim() || null,
    help_text: helpText.value.trim() || null,
    is_required: isRequired.value,
  });
}

function handleClose() {
  isOpen.value = false;
  emit('close');
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>Add Custom Question</DialogTitle>
        <p class="text-sm text-gray-500">
          Create a custom question for your testimonial form
        </p>
      </DialogHeader>

      <div class="space-y-6 py-2">
        <!-- Question Text -->
        <div>
          <Label for="question-text" class="text-sm font-medium">Question Text</Label>
          <Textarea
            id="question-text"
            v-model="questionText"
            class="mt-2"
            rows="3"
            placeholder="What would you like to ask?"
          />
        </div>

        <!-- Question Type -->
        <div>
          <Label class="text-sm font-medium">Question Type</Label>
          <Select v-model="questionTypeId">
            <SelectTrigger class="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="type in questionTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Placeholder & Help Text Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="placeholder" class="text-sm font-medium">
              Placeholder
              <span class="font-normal text-gray-400">(optional)</span>
            </Label>
            <Input
              id="placeholder"
              v-model="placeholder"
              class="mt-2"
              placeholder="Hint text..."
            />
          </div>
          <div>
            <Label for="help-text" class="text-sm font-medium">
              Help Text
              <span class="font-normal text-gray-400">(optional)</span>
            </Label>
            <Input
              id="help-text"
              v-model="helpText"
              class="mt-2"
              placeholder="Additional guidance..."
            />
          </div>
        </div>

        <!-- Required Toggle -->
        <div class="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
          <div>
            <Label class="text-sm font-medium">Required</Label>
            <p class="text-xs text-gray-500">Respondents must answer this question</p>
          </div>
          <Switch v-model:checked="isRequired" />
        </div>
      </div>

      <DialogFooter class="gap-2 pt-2">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button :disabled="!isValid" @click="handleAdd">Add Question</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
