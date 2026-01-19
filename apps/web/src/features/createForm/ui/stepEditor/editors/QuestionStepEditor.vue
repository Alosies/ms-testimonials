<script setup lang="ts">
import { computed, toRefs } from 'vue';
import {
  Input,
  Textarea,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Button,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep, LinkedQuestion, QuestionOption } from '@/shared/stepCards';
import { useOrganizationStore } from '@/entities/organization';
import { useGetQuestionResponseCount } from '@/entities/formQuestion';
import { useQuestionSettings, useQuestionOptions, useSaveLock, useQuestionTypeChange } from '../../../composables';
import { analyzeQuestionTypeChange } from '../../../functions';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useToast } from '@testimonials/ui';
import { studioTestIds } from '@/shared/constants/testIds';
import QuestionOptionsSection from './childComponents/QuestionOptionsSection.vue';
import RatingScaleSection from './childComponents/RatingScaleSection.vue';
import { useConfirmationModal } from '@/shared/widgets';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:question', question: Partial<LinkedQuestion>): void;
}>();

// Get allowed question types from organization's plan
const organizationStore = useOrganizationStore();
const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

// ADR-011: Immediate save for discrete question settings
const { setRequired, setQuestionType } = useQuestionSettings();
const { addOption: addOptionToDb, removeOption: removeOptionFromDb } = useQuestionOptions();
const { deleteQuestionResponses } = useQuestionTypeChange();
const { isLocked } = useSaveLock();
const { toast } = useToast();
const { showConfirmation } = useConfirmationModal();

// Get organization and user context for option operations
const contextStore = useCurrentContextStore();

// ADR-017: Fetch response count to determine if type change is blocked
const questionIdRef = computed(() => ({
  questionId: props.step.question?.id ?? '',
}));
const { responseCount, refetch: refetchResponseCount } = useGetQuestionResponseCount(questionIdRef);
const hasResponses = computed(() => responseCount.value > 0);

// Get current question data
const question = computed(() => props.step.question);

// Get current question type details
const currentQuestionType = computed(() =>
  questionTypes.value.find((t) => t.uniqueName === question.value?.questionType?.uniqueName)
);

const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');

const supportsOptions = computed(() => {
  const typeName = question.value?.questionType?.uniqueName;
  return typeName === 'choice_single' || typeName === 'choice_multiple';
});

const isRatingScale = computed(() => {
  return question.value?.questionType?.uniqueName === 'rating_scale';
});

// Map icon names to iconify format
function getHeroIconName(iconName: string | null | undefined): string {
  if (!iconName) return 'heroicons:minus';
  if (iconName.includes(':')) return iconName;
  return `heroicons:${iconName}`;
}

// Update a field on the question
function updateField<K extends keyof LinkedQuestion>(field: K, value: LinkedQuestion[K]) {
  if (!question.value) return;
  emit('update:question', { [field]: value });
}

/**
 * ADR-011: Handle required toggle with immediate persistence.
 * Updates local state immediately for responsive UI, then persists to DB.
 */
async function handleRequiredChange(value: boolean) {
  if (!question.value?.id) return;

  // Update local state immediately for responsive UI
  emit('update:question', { isRequired: value });

  // Persist to database
  try {
    await setRequired(question.value.id, value);
  } catch (error) {
    // Revert local state on failure
    emit('update:question', { isRequired: !value });
    toast({ title: 'Failed to update required setting', variant: 'destructive' });
    console.error('[QuestionStepEditor] Failed to set required:', error);
  }
}

/**
 * ADR-017: Handle question type change with analysis for data loss warnings.
 *
 * Workflow:
 * 1. Analyze what data will be lost by changing types
 * 2. If options will be lost, show warning dialog before proceeding
 * 3. On confirmation, call replaceQuestionWithNewType
 * 4. On cancel, dropdown selection stays unchanged (no local state update until confirmed)
 */
async function handleQuestionTypeChange(value: unknown) {
  if (!value || typeof value !== 'string') return;
  if (!question.value?.id) return;

  const currentTypeId = question.value.questionType?.uniqueName;
  if (currentTypeId === value) return; // No change

  const typeInfo = questionTypes.value.find((t) => t.uniqueName === value);
  if (!typeInfo) return;

  // Analyze what data will be lost
  const analysis = analyzeQuestionTypeChange(
    currentTypeId ?? '',
    value,
    { options: question.value.options }
  );

  // If options will be lost, show warning dialog using shared ConfirmationModal
  if (analysis.requiresWarning) {
    showConfirmation({
      actionType: 'change_question_type',
      entityName: `${analysis.optionCount} option${analysis.optionCount !== 1 ? 's' : ''}`,
      customMessage: {
        message: `Changing to ${typeInfo.name} will permanently delete all options from this question. This action cannot be undone.`,
      },
      onConfirm: () => executeTypeChange(value, typeInfo.name),
    });
    return; // Don't proceed until user confirms
  }

  // No warning needed - proceed with type change directly
  await executeTypeChange(value, typeInfo.name);
}

/**
 * ADR-017: Execute the type change after confirmation (or when no warning needed).
 * Uses replaceQuestionWithNewType for full field transfer and question replacement.
 */
async function executeTypeChange(newTypeId: string, newTypeName: string) {
  if (!question.value?.id) return;

  const organizationId = contextStore.currentOrganizationId;
  if (!organizationId) {
    toast({ title: 'Cannot change type: missing organization context', variant: 'destructive' });
    return;
  }

  // Get the database ID for the new type (needed for mutation)
  const typeInfo = questionTypes.value.find((t) => t.uniqueName === newTypeId);
  if (!typeInfo?.id) {
    toast({ title: 'Cannot change type: type not found', variant: 'destructive' });
    return;
  }

  const previousType = question.value.questionType;

  // Update local state immediately for responsive UI
  emit('update:question', {
    questionType: {
      id: typeInfo.id,
      uniqueName: newTypeId,
      name: newTypeName,
      category: previousType?.category ?? 'custom',
      inputComponent: newTypeId,
    },
    // Clear options when switching away from choice types
    options: [],
  });

  // Persist to database using the actual database ID
  try {
    await setQuestionType(question.value.id, typeInfo.id);
    toast({
      title: `Changed to ${newTypeName}`,
      description: 'Question type updated successfully.',
    });
  } catch (error) {
    // Revert local state on failure
    emit('update:question', { questionType: previousType });
    toast({ title: 'Failed to update question type', variant: 'destructive' });
    console.error('[QuestionStepEditor] Failed to set question type:', error);
  }
}

/**
 * ADR-011: Add option with immediate persistence.
 */
async function handleAddOption() {
  if (!question.value?.id) return;

  const organizationId = contextStore.currentOrganizationId;
  const userId = contextStore.currentUserId;
  if (!organizationId || !userId) {
    toast({ title: 'Cannot add option: missing context', variant: 'destructive' });
    return;
  }

  const currentOptions = question.value.options ?? [];
  const displayOrder = currentOptions.length + 1;
  const optionValue = `option_${displayOrder}`;

  // Create temporary option for immediate UI feedback
  const tempOption: QuestionOption = {
    id: `temp_${Date.now()}`,
    optionValue,
    optionLabel: '',
    displayOrder,
    isDefault: false,
  };

  // Update local state immediately
  emit('update:question', { options: [...currentOptions, tempOption] });

  // Persist to database
  try {
    const result = await addOptionToDb({
      questionId: question.value.id,
      organizationId,
      userId,
      label: '',
      value: optionValue,
      displayOrder,
    });

    // Replace temp option with real one
    if (result) {
      const updatedOptions = [...currentOptions, {
        id: result.id,
        optionValue: result.option_value,
        optionLabel: result.option_label ?? '',
        displayOrder: result.display_order,
        isDefault: result.is_default ?? false,
      }];
      emit('update:question', { options: updatedOptions });
    }
  } catch (error) {
    // Remove temp option on failure
    emit('update:question', { options: currentOptions });
    toast({ title: 'Failed to add option', variant: 'destructive' });
    console.error('[QuestionStepEditor] Failed to add option:', error);
  }
}

/**
 * Update option label/value - handled by auto-save (text input debouncing)
 */
function handleUpdateOption(index: number, updates: Partial<QuestionOption>) {
  if (!question.value) return;
  const currentOptions = question.value.options ?? [];
  const updatedOptions = currentOptions.map((opt, idx) =>
    idx === index ? { ...opt, ...updates } : opt
  );
  emit('update:question', { options: updatedOptions });
}

/**
 * ADR-011: Remove option with immediate persistence.
 */
async function handleRemoveOption(index: number) {
  if (!question.value) return;
  const currentOptions = question.value.options ?? [];
  const optionToRemove = currentOptions[index];

  if (!optionToRemove) return;

  // Update local state immediately
  const updatedOptions = currentOptions
    .filter((_, idx) => idx !== index)
    .map((opt, idx) => ({ ...opt, displayOrder: idx + 1 }));
  emit('update:question', { options: updatedOptions.length > 0 ? updatedOptions : [] });

  // Only persist if option has a real ID (not temp)
  if (optionToRemove.id.startsWith('temp_')) {
    return; // No need to delete from DB
  }

  // Persist to database
  try {
    await removeOptionFromDb(optionToRemove.id);
  } catch (error) {
    // Revert local state on failure
    emit('update:question', { options: currentOptions });
    toast({ title: 'Failed to remove option', variant: 'destructive' });
    console.error('[QuestionStepEditor] Failed to remove option:', error);
  }
}

/**
 * ADR-017: Handle delete responses button click - shows confirmation dialog using shared ConfirmationModal.
 */
function handleDeleteResponsesClick() {
  if (!question.value?.id) return;

  const questionId = question.value.id;

  showConfirmation({
    actionType: 'delete_responses',
    entityName: `${responseCount.value}`,
    onConfirm: async () => {
      const deletedCount = await deleteQuestionResponses(questionId);
      toast({
        title: `Deleted ${deletedCount} response${deletedCount !== 1 ? 's' : ''}`,
        description: 'You can now change the question type.',
      });
      // Refetch to update the response count
      await refetchResponseCount();
    },
  });
}
</script>

<template>
  <div v-if="question" class="space-y-6">
    <!-- Question Text -->
    <div>
      <Label for="questionText" class="text-sm font-medium">Question Text</Label>
      <Textarea
        id="questionText"
        :model-value="question.questionText"
        class="mt-1.5"
        rows="3"
        placeholder="Enter your question..."
        @update:model-value="(v) => updateField('questionText', String(v))"
      />
    </div>

    <!-- Type and Required Row -->
    <div class="flex items-end gap-4">
      <!-- Question Type -->
      <div class="flex-1">
        <Label class="text-sm font-medium">Question Type</Label>
        <Select
          :model-value="question.questionType?.uniqueName"
          :disabled="isLocked || hasResponses"
          @update:model-value="handleQuestionTypeChange"
        >
          <SelectTrigger class="mt-1.5" :data-testid="studioTestIds.questionTypeDropdown">
            <div class="flex items-center gap-2">
              <Icon
                :icon="getHeroIconName(questionTypeIcon)"
                class="h-4 w-4 text-gray-500"
              />
              <SelectValue placeholder="Select type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="type in questionTypes" :key="type.uniqueName" :value="type.uniqueName">
              <div class="flex items-center gap-2">
                <Icon :icon="getHeroIconName(type.icon)" class="h-4 w-4 text-gray-500" />
                <span>{{ type.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Required Toggle -->
      <div class="flex h-9 items-center gap-3 rounded-lg border bg-gray-50 px-4">
        <Label class="text-sm">Required</Label>
        <Switch
          :model-value="question.isRequired"
          :disabled="isLocked"
          @update:model-value="handleRequiredChange"
        />
      </div>
    </div>

    <!-- ADR-017: Response blocking warning message -->
    <div
      v-if="hasResponses"
      class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
      :data-testid="studioTestIds.questionTypeResponsesBlockMessage"
    >
      <Icon icon="lucide:alert-triangle" class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div class="flex-1 space-y-2">
        <p class="text-sm text-amber-800">
          Type cannot be changed: {{ responseCount }} response{{ responseCount !== 1 ? 's' : '' }} exist{{ responseCount === 1 ? 's' : '' }}
        </p>
        <Button
          variant="outline"
          size="sm"
          class="h-7 border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
          :data-testid="studioTestIds.deleteQuestionResponsesButton"
          @click="handleDeleteResponsesClick"
        >
          <Icon icon="lucide:trash-2" class="mr-1.5 h-3.5 w-3.5" />
          Delete responses to change type
        </Button>
      </div>
    </div>

    <!-- Options Section for Choice Questions -->
    <QuestionOptionsSection
      v-if="supportsOptions"
      :options="question.options ?? []"
      :question-type-name="question.questionType?.uniqueName ?? ''"
      :disabled="isLocked"
      @add="handleAddOption"
      @update="handleUpdateOption"
      @remove="handleRemoveOption"
    />

    <!-- Scale Settings for Rating Scale -->
    <RatingScaleSection
      v-if="isRatingScale"
      :min-value="question.minValue ?? null"
      :max-value="question.maxValue ?? null"
      :min-label="question.scaleMinLabel ?? null"
      :max-label="question.scaleMaxLabel ?? null"
      @update:min-value="(v) => updateField('minValue', v)"
      @update:max-value="(v) => updateField('maxValue', v)"
      @update:min-label="(v) => updateField('scaleMinLabel', v)"
      @update:max-label="(v) => updateField('scaleMaxLabel', v)"
    />

    <Separator class="my-4" />

    <!-- Placeholder Text -->
    <div>
      <Label for="placeholder" class="text-sm font-medium">Placeholder Text</Label>
      <Input
        id="placeholder"
        :model-value="question.placeholder ?? ''"
        class="mt-1.5"
        placeholder="Hint text shown in the input..."
        @update:model-value="(v) => updateField('placeholder', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Displayed as a hint inside the input field</p>
    </div>

    <!-- Help Text -->
    <div>
      <Label for="helpText" class="text-sm font-medium">Help Text</Label>
      <Input
        id="helpText"
        :model-value="question.helpText ?? ''"
        class="mt-1.5"
        placeholder="Additional guidance for respondents..."
        @update:model-value="(v) => updateField('helpText', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Shown below the question to provide context</p>
    </div>
  </div>

  <!-- Empty state when no question is linked -->
  <div v-else class="space-y-4">
    <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <Icon icon="heroicons:question-mark-circle" class="mx-auto h-12 w-12 text-gray-300" />
      <h3 class="mt-4 text-sm font-medium text-gray-900">No question linked</h3>
      <p class="mt-2 text-sm text-gray-500">
        This step doesn't have a question associated with it yet.
      </p>
    </div>
  </div>

</template>
