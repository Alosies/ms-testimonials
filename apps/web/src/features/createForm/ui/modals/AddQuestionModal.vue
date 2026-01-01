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
const questionKey = ref('');
const questionTypeId = ref<QuestionTypeId>('text_long');
const placeholder = ref('');
const helpText = ref('');
const isRequired = ref(true);

const isOpen = ref(true);

// Generate key from question text
function generateKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
}

// Auto-generate key when question text changes
function updateQuestionText(value: string | number) {
  const strValue = String(value);
  questionText.value = strValue;
  if (!questionKey.value || questionKey.value === generateKey(questionText.value.slice(0, -1))) {
    questionKey.value = generateKey(strValue);
  }
}

const isValid = computed(() => {
  return (
    questionText.value.trim().length > 0 &&
    questionKey.value.trim().length > 0 &&
    /^[a-z][a-z0-9_]*$/.test(questionKey.value)
  );
});

function handleAdd() {
  if (!isValid.value) return;

  emit('add', {
    question_text: questionText.value.trim(),
    question_key: questionKey.value.trim(),
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
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Custom Question</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Question Text -->
        <div>
          <Label for="question-text">Question Text</Label>
          <Textarea
            id="question-text"
            :model-value="questionText"
            class="mt-1"
            rows="2"
            placeholder="What would you like to ask?"
            @update:model-value="updateQuestionText"
          />
        </div>

        <!-- Question Key -->
        <div>
          <Label for="question-key">Question Key</Label>
          <Input
            id="question-key"
            v-model="questionKey"
            class="mt-1 font-mono text-sm"
            placeholder="e.g., custom_question"
          />
          <p class="mt-1 text-xs text-gray-500">
            Lowercase letters, numbers, and underscores only
          </p>
        </div>

        <!-- Question Type -->
        <div>
          <Label>Question Type</Label>
          <Select v-model="questionTypeId">
            <SelectTrigger class="mt-1">
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

        <!-- Placeholder -->
        <div>
          <Label for="placeholder">Placeholder Text (optional)</Label>
          <Input
            id="placeholder"
            v-model="placeholder"
            class="mt-1"
            placeholder="Enter placeholder text..."
          />
        </div>

        <!-- Help Text -->
        <div>
          <Label for="help-text">Help Text (optional)</Label>
          <Input
            id="help-text"
            v-model="helpText"
            class="mt-1"
            placeholder="Enter help text..."
          />
        </div>

        <!-- Required Toggle -->
        <div class="flex items-center justify-between">
          <Label>Required</Label>
          <Switch v-model:checked="isRequired" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button :disabled="!isValid" @click="handleAdd">Add Question</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
