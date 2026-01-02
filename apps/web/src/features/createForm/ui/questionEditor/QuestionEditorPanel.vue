<script setup lang="ts">
import { toRef, ref, watch, nextTick } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import {
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
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  Separator,
} from '@testimonials/ui';
import { VisuallyHidden } from 'reka-ui';
import { Icon } from '@testimonials/icons';
import type { QuestionTypeId } from '@/shared/api';
import type { QuestionData } from '../../models';
import { useQuestionEditorPanel, type PanelMode } from '../../composables';
import QuestionPreview from './childComponents/QuestionPreview.vue';
import QuestionOptionsEditor from './childComponents/QuestionOptionsEditor.vue';
import QuestionTypeTips from './childComponents/QuestionTypeTips.vue';

// Template ref for auto-focus in add mode
const questionTextRef = ref<InstanceType<typeof Textarea> | null>(null);

const props = withDefaults(
  defineProps<{
    /** Panel mode: 'add' for new questions, 'edit' for existing */
    mode?: PanelMode;
    /** Question to edit (edit mode only) */
    question?: QuestionData | null;
    /** Index of question being edited (edit mode only) */
    questionIndex?: number;
    /** Total number of questions (edit mode only) */
    totalQuestions?: number;
    /** Display order for new question (add mode only) */
    nextDisplayOrder?: number;
    /** Whether panel is open */
    open: boolean;
    /** Whether current question has unsaved changes (edit mode only) */
    isDirty?: boolean;
    /** Whether save is in progress (edit mode only) */
    isSaving?: boolean;
  }>(),
  {
    mode: 'edit',
    question: null,
    questionIndex: 0,
    totalQuestions: 0,
    nextDisplayOrder: 1,
    isDirty: false,
    isSaving: false,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  /** Emitted when question is updated (edit mode) */
  update: [updates: Partial<QuestionData>];
  /** Emitted when question is deleted (edit mode) */
  remove: [];
  /** Emitted when navigating between questions (edit mode) */
  navigate: [direction: 'prev' | 'next'];
  /** Emitted when new question is added (add mode) */
  add: [question: QuestionData];
  /** Emitted when save button is clicked (edit mode) */
  save: [];
}>();

// Build composable options based on mode (called once at setup)
const composableOptions = props.mode === 'add'
  ? {
      mode: 'add' as const,
      nextDisplayOrder: props.nextDisplayOrder,
      onAdd: (question: QuestionData) => emit('add', question),
      onOpenChange: (value: boolean) => emit('update:open', value),
    }
  : {
      mode: 'edit' as const,
      question: toRef(props, 'question'),
      questionIndex: toRef(props, 'questionIndex'),
      totalQuestions: toRef(props, 'totalQuestions'),
      onUpdate: (updates: Partial<QuestionData>) => emit('update', updates),
      onRemove: () => emit('remove'),
      onNavigate: (direction: 'prev' | 'next') => emit('navigate', direction),
      onOpenChange: (value: boolean) => emit('update:open', value),
    };

// Use composable for all logic
const {
  isEditMode,
  localQuestion,
  questionTypes,
  isNavigationEnabled,
  hasKeyboard,
  isTransitioning,
  questionTypeIcon,
  supportsOptions,
  isRequired,
  isValid,
  getHeroIconName,
  updateField,
  addOption,
  updateOption,
  removeOption,
  handleHeaderKeydown,
  navigateWithTransition,
  enableNavigation,
  disableNavigation,
  handleDeleteClick,
  handleAddQuestion,
  closePanel,
} = useQuestionEditorPanel(composableOptions);

// Auto-focus question text input in add mode when panel opens
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.mode === 'add') {
      await nextTick();
      // Small delay to ensure sheet animation has started
      setTimeout(() => {
        questionTextRef.value?.$el?.focus();
      }, 100);
    }
  },
  { immediate: true }
);

// Keyboard shortcut: ⌘S / Ctrl+S to save
onKeyStroke('s', (e) => {
  if ((e.metaKey || e.ctrlKey) && props.open && props.isDirty && !props.isSaving && isEditMode) {
    e.preventDefault();
    emit('save');
  }
});

// Track "just saved" state for success feedback
const justSaved = ref(false);

watch(
  [() => props.isSaving, () => props.isDirty],
  ([newSaving, newDirty], [oldSaving]) => {
    // Save completed: was saving, now not saving, and no longer dirty
    if (oldSaving && !newSaving && !newDirty) {
      justSaved.value = true;
      setTimeout(() => {
        justSaved.value = false;
      }, 1500);
    }
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent
      side="right"
      size="wide"
      class="flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden"
    >
      <!-- Header: Different UI for Add vs Edit mode -->
      <div
        :tabindex="isEditMode && hasKeyboard ? 0 : -1"
        :class="[
          'flex items-center justify-between border-b bg-gray-50 px-6 py-4 outline-none transition-colors',
          isEditMode && hasKeyboard && 'cursor-pointer focus:bg-gray-100',
        ]"
        @keydown="handleHeaderKeydown"
        @focus="enableNavigation"
        @blur="disableNavigation"
      >
        <!-- Edit Mode Header -->
        <template v-if="isEditMode">
          <div class="flex items-center gap-3">
            <!-- Navigation Arrows -->
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                :disabled="questionIndex <= 0"
                tabindex="-1"
                @click="navigateWithTransition('prev')"
              >
                <Icon icon="lucide:chevron-up" class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                :disabled="questionIndex >= totalQuestions - 1"
                tabindex="-1"
                @click="navigateWithTransition('next')"
              >
                <Icon icon="lucide:chevron-down" class="h-4 w-4" />
              </Button>
            </div>

            <div>
              <SheetTitle class="text-base font-semibold text-gray-900">
                Question {{ questionIndex + 1 }} of {{ totalQuestions }}
              </SheetTitle>
              <VisuallyHidden>
                <SheetDescription>
                  Edit question settings including text, type, and options
                </SheetDescription>
              </VisuallyHidden>
              <!-- Keyboard navigation hint - only shown on devices with keyboards -->
              <p
                v-if="hasKeyboard"
                :class="[
                  'text-xs transition-colors',
                  isNavigationEnabled
                    ? 'font-medium text-primary'
                    : 'text-gray-500',
                ]"
              >
                <span v-if="isNavigationEnabled" class="inline-flex items-center gap-1">
                  <Icon icon="lucide:keyboard" class="h-3 w-3" />
                  Keyboard ↑↓ navigation active
                </span>
                <span v-else>Click here to enable Keyboard ↑↓ navigation</span>
              </p>
            </div>
          </div>

          <!-- Edit Mode Actions -->
          <div class="flex items-center gap-2">
            <!-- Save status pill: Unsaved → Saving → Saved -->
            <template v-if="isDirty || isSaving || justSaved">
              <!-- Saved state (green, fades out) -->
              <div
                v-if="justSaved"
                class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-all"
              >
                <Icon icon="lucide:check" class="h-3 w-3" />
                Saved
              </div>

              <!-- Unsaved/Saving state (amber, clickable) -->
              <button
                v-else
                :disabled="isSaving"
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 disabled:cursor-wait"
                @click="emit('save')"
              >
                <Icon
                  v-if="isSaving"
                  icon="lucide:loader-2"
                  class="h-3 w-3 animate-spin"
                />
                <span v-else class="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {{ isSaving ? 'Saving...' : 'Unsaved' }}
                <kbd v-if="!isSaving" class="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px] text-amber-600">
                  ⌘S
                </kbd>
              </button>
              <div class="mx-1 h-6 w-px bg-gray-200" />
            </template>

            <Button
              variant="ghost"
              size="sm"
              class="text-red-500 hover:bg-red-50 hover:text-red-600"
              @click="handleDeleteClick"
            >
              <Icon icon="lucide:trash-2" class="mr-1.5 h-4 w-4" />
              Delete
            </Button>
            <div class="mx-1 h-6 w-px bg-gray-200" />
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="closePanel">
              <Icon icon="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
        </template>

        <!-- Add Mode Header -->
        <template v-else>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Icon icon="lucide:plus" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle class="text-base font-semibold text-gray-900">
                Add New Question
              </SheetTitle>
              <VisuallyHidden>
                <SheetDescription>
                  Create a new question for your testimonial form
                </SheetDescription>
              </VisuallyHidden>
              <p class="text-xs text-gray-500">
                Create a custom question for your form
              </p>
            </div>
          </div>

          <!-- Add Mode Actions -->
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="closePanel">
              Cancel
            </Button>
            <Button size="sm" :disabled="!isValid" @click="handleAddQuestion">
              <Icon icon="lucide:plus" class="mr-1.5 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </template>
      </div>

      <!-- Two-Column Layout -->
      <div v-if="localQuestion" class="flex flex-1 overflow-hidden">
        <!-- Main Content Column with smooth transition -->
        <div
          :class="[
            'flex-1 overflow-y-auto bg-gray-50 scrollbar-subtle transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          ]"
        >
          <!-- Live Preview -->
          <QuestionPreview :question="localQuestion" />

          <!-- Editor Form Section -->
          <div class="bg-white">
          <!-- Section Header -->
          <div class="border-b bg-white px-6 py-4">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <Icon icon="lucide:settings-2" class="h-3.5 w-3.5 text-gray-600" />
              </div>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Question Settings</span>
            </div>
          </div>

          <div class="space-y-6 p-6">
            <!-- Question Text -->
            <div>
              <Label class="text-sm font-medium">Question Text</Label>
              <Textarea
                ref="questionTextRef"
                :model-value="localQuestion.question_text"
                class="mt-1.5"
                rows="3"
                placeholder="Enter your question..."
                @update:model-value="(v) => updateField('question_text', String(v))"
              />
            </div>

            <!-- Type and Required Row -->
            <div class="flex items-end gap-4">
              <!-- Question Type -->
              <div class="flex-1">
                <Label class="text-sm font-medium">Question Type</Label>
                <Select
                  :model-value="localQuestion.question_type_id"
                  @update:model-value="(v) => updateField('question_type_id', v as QuestionTypeId)"
                >
                  <SelectTrigger class="mt-1.5">
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="getHeroIconName(questionTypeIcon)"
                        class="h-4 w-4 text-gray-500"
                      />
                      <SelectValue placeholder="Select type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="type in questionTypes" :key="type.id" :value="type.id">
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
                <Switch v-model="isRequired" />
              </div>
            </div>

            <!-- Options Section for Choice Questions -->
            <QuestionOptionsEditor
              v-if="supportsOptions"
              :options="localQuestion.options"
              :question-type-id="localQuestion.question_type_id"
              @add="addOption"
              @update="updateOption"
              @remove="removeOption"
            />

            <!-- Scale Settings for Linear Scale -->
            <div
              v-if="localQuestion.question_type_id === 'rating_scale'"
              class="space-y-4 rounded-lg border bg-gray-50 p-4"
            >
              <div class="flex items-center gap-2">
                <Icon icon="lucide:sliders-horizontal" class="h-4 w-4 text-gray-500" />
                <Label class="text-sm font-medium">Scale Settings</Label>
              </div>

              <!-- Scale Range -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs text-gray-500">Start Value</Label>
                  <Select
                    :model-value="String(localQuestion.min_value ?? 1)"
                    @update:model-value="(v) => updateField('min_value', Number(v))"
                  >
                    <SelectTrigger class="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label class="text-xs text-gray-500">End Value</Label>
                  <Select
                    :model-value="String(localQuestion.max_value ?? 10)"
                    @update:model-value="(v) => updateField('max_value', Number(v))"
                  >
                    <SelectTrigger class="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <!-- Scale Labels -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs text-gray-500">Min Label</Label>
                  <Input
                    :model-value="localQuestion.scale_min_label ?? ''"
                    class="mt-1"
                    placeholder="Low"
                    @update:model-value="(v) => updateField('scale_min_label', String(v) || null)"
                  />
                </div>
                <div>
                  <Label class="text-xs text-gray-500">Max Label</Label>
                  <Input
                    :model-value="localQuestion.scale_max_label ?? ''"
                    class="mt-1"
                    placeholder="High"
                    @update:model-value="(v) => updateField('scale_max_label', String(v) || null)"
                  />
                </div>
              </div>
              <p class="text-xs text-gray-500">
                Customize the scale range and endpoint labels
              </p>
            </div>

            <Separator class="my-4" />

            <!-- Placeholder Text -->
            <div>
              <Label class="text-sm font-medium">Placeholder Text</Label>
              <Input
                :model-value="localQuestion.placeholder ?? ''"
                class="mt-1.5"
                placeholder="Hint text shown in the input..."
                @update:model-value="(v) => updateField('placeholder', String(v) || null)"
              />
              <p class="mt-1 text-xs text-gray-500">Displayed as a hint inside the input field</p>
            </div>

            <!-- Help Text -->
            <div>
              <Label class="text-sm font-medium">Help Text</Label>
              <Input
                :model-value="localQuestion.help_text ?? ''"
                class="mt-1.5"
                placeholder="Additional guidance for respondents..."
                @update:model-value="(v) => updateField('help_text', String(v) || null)"
              />
              <p class="mt-1 text-xs text-gray-500">Shown below the question to provide context</p>
            </div>
          </div>
        </div>
        </div>

        <!-- Tips Aside with smooth transition -->
        <QuestionTypeTips
          :question-type-id="localQuestion.question_type_id"
          :class="[
            'w-72 shrink-0 overflow-y-auto scrollbar-subtle transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          ]"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
