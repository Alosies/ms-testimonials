<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useCreateForm } from '@/entities/form';
import { useCreateFormQuestions } from '@/entities/formQuestion';
import { useCurrentContextStore } from '@/shared/currentContext';
import { createSlugFromString } from '@/shared/urls';
import type { FormData, QuestionData } from '../models';
import QuestionList from './QuestionList.vue';
import AddQuestionModal from './AddQuestionModal.vue';

const props = defineProps<{
  questions: QuestionData[];
  formData: FormData;
  formId: string | null;
  canProceed: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  updateQuestion: [index: number, updates: Partial<QuestionData>];
  removeQuestion: [index: number];
  addQuestion: [question: Partial<QuestionData>];
  reorderQuestions: [fromIndex: number, toIndex: number];
  setFormId: [id: string];
  setLoading: [loading: boolean];
  setError: [error: string | null];
  next: [];
  prev: [];
}>();

const showAddQuestion = ref(false);

const { createForm } = useCreateForm();
const { createFormQuestions } = useCreateFormQuestions();
const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

async function handleSaveAndContinue() {
  if (!props.canProceed || props.isLoading) return;

  emit('setLoading', true);
  emit('setError', null);

  try {
    let formIdToUse = props.formId;

    // Create the form if not already created
    if (!formIdToUse) {
      const slug = createSlugFromString(props.formData.product_name);
      const formResult = await createForm({
        form: {
          name: props.formData.product_name,
          slug,
          product_name: props.formData.product_name,
          product_description: props.formData.product_description,
          organization_id: currentOrganizationId.value,
        },
      });

      if (!formResult) {
        throw new Error('Failed to create form');
      }

      formIdToUse = formResult.id;
      emit('setFormId', formIdToUse);
    }

    // Create the questions
    const questionInputs = props.questions.map((q, index) => ({
      form_id: formIdToUse,
      organization_id: currentOrganizationId.value,
      question_type_id: q.question_type_id,
      question_key: q.question_key,
      question_text: q.question_text,
      placeholder: q.placeholder,
      help_text: q.help_text,
      display_order: index + 1,
      is_required: q.is_required,
    }));

    const questionsResult = await createFormQuestions({
      inputs: questionInputs,
    });

    if (!questionsResult || questionsResult.length === 0) {
      throw new Error('Failed to create questions');
    }

    emit('next');
  } catch (error) {
    emit('setError', error instanceof Error ? error.message : 'An error occurred');
  } finally {
    emit('setLoading', false);
  }
}

function handleAddQuestion(question: Partial<QuestionData>) {
  emit('addQuestion', question);
  showAddQuestion.value = false;
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">
        Customize Your Questions
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Edit, reorder, or add questions. Drag to reorder.
      </p>
    </div>

    <!-- Sortable Question List -->
    <QuestionList
      :questions="questions"
      @update="(index, updates) => emit('updateQuestion', index, updates)"
      @remove="(index) => emit('removeQuestion', index)"
      @reorder="(from, to) => emit('reorderQuestions', from, to)"
    />

    <!-- Add Question Button -->
    <Button variant="outline" @click="showAddQuestion = true">
      <Icon icon="lucide:plus" class="mr-2 h-4 w-4" />
      Add Custom Question
    </Button>

    <!-- Add Question Modal -->
    <AddQuestionModal
      v-if="showAddQuestion"
      @add="handleAddQuestion"
      @close="showAddQuestion = false"
    />

    <div class="flex justify-between">
      <Button variant="outline" @click="emit('prev')">Back</Button>
      <Button
        :disabled="!canProceed || isLoading"
        @click="handleSaveAndContinue"
      >
        {{ isLoading ? 'Saving...' : 'Preview Form' }}
        <Icon icon="lucide:arrow-right" class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
