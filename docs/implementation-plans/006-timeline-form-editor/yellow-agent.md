# Yellow Agent: Foundation + State Management

**Branch**: `yellow/timeline-foundation`
**Worktree**: `ms-testimonials-yellow`

---

## Overview

Yellow agent owns the foundation layer: TypeScript types, layout infrastructure, and state management composables. Other agents depend on your work, so **Y1 is blocking** for everyone.

### Your Deliverables

| Category | Files |
|----------|-------|
| **Types** | `models/stepContent.ts` |
| **Layout** | `layouts/FormEditorLayout.vue` |
| **Header** | `ui/FormEditorHeader.vue` |
| **Composables** | `composables/timeline/*.ts` |
| **Page** | `pages/[org]/forms/[urlSlug]/edit.vue` |

---

## Architecture Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR SCOPE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  FormEditorLayout.vue (Y2)                                          │   │
│   │  ┌─────────┬─────────────────────────────────┬─────────────────┐   │   │
│   │  │         │                                 │                 │   │   │
│   │  │  SLOT:  │         SLOT:                   │     SLOT:       │   │   │
│   │  │ sidebar │        timeline                 │   properties    │   │   │
│   │  │         │                                 │                 │   │   │
│   │  │ (Green) │        (Green)                  │     (Blue)      │   │   │
│   │  │         │                                 │                 │   │   │
│   │  └─────────┴─────────────────────────────────┴─────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Composables (Y4, Y5)                                               │   │
│   │                                                                      │   │
│   │  useTimelineEditor ─┬─► useStepState                                │   │
│   │                     ├─► useStepOperations                           │   │
│   │                     ├─► useStepNavigation                           │   │
│   │                     └─► useStepReorder                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tasks

### Y1: Create Data Models and TypeScript Interfaces
**Priority**: CRITICAL (Blocking)
**Depends On**: None
**Blocks**: Everything

Create the shared type definitions that all agents will import.

**File**: `apps/web/src/features/createForm/models/stepContent.ts`

```typescript
// Re-export generated types (will exist after DB migration)
// For now, define placeholders that match expected schema
export type { Form_Steps, Contacts } from '@/shared/graphql/generated/operations';

// Step type literal union
export type StepType =
  | 'welcome'
  | 'question'
  | 'rating'
  | 'consent'
  | 'contact_info'
  | 'reward'
  | 'thank_you';

// Contact field options
export type ContactField =
  | 'name'
  | 'email'
  | 'photo'
  | 'jobTitle'
  | 'company'
  | 'website'
  | 'linkedin'
  | 'twitter';

// =================================================================
// JSONB Content Interfaces (can't be generated)
// =================================================================

export interface WelcomeContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface ConsentContent {
  title: string;
  description: string;
  options: {
    public: { label: string; description: string };
    private: { label: string; description: string };
  };
  defaultOption: 'public' | 'private';
  required: boolean;
}

export interface ContactInfoContent {
  title: string;
  subtitle?: string;
  enabledFields: ContactField[];
  requiredFields: ContactField[];
}

export interface RewardContent {
  title: string;
  description: string;
  rewardType: 'coupon' | 'download' | 'link' | 'custom';
  couponCode?: string;
  couponDescription?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  linkUrl?: string;
  linkLabel?: string;
  customHtml?: string;
}

export interface ThankYouContent {
  title: string;
  message: string;
  showSocialShare: boolean;
  socialShareMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

// Union type
export type StepContent =
  | WelcomeContent
  | ConsentContent
  | ContactInfoContent
  | RewardContent
  | ThankYouContent
  | Record<string, never>; // Empty for question/rating (data in form_questions)

// =================================================================
// Form Step Interface (local state representation)
// =================================================================

export interface FormStep {
  id: string;
  formId: string;
  stepType: StepType;
  stepOrder: number;
  questionId?: string | null;
  content: StepContent;
  tips: string[];
  isActive: boolean;
  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}

// =================================================================
// Type Guards
// =================================================================

export function isWelcomeStep(step: FormStep): step is FormStep & { stepType: 'welcome'; content: WelcomeContent } {
  return step.stepType === 'welcome';
}

export function isQuestionStep(step: FormStep): step is FormStep & { stepType: 'question' } {
  return step.stepType === 'question';
}

export function isRatingStep(step: FormStep): step is FormStep & { stepType: 'rating' } {
  return step.stepType === 'rating';
}

export function isConsentStep(step: FormStep): step is FormStep & { stepType: 'consent'; content: ConsentContent } {
  return step.stepType === 'consent';
}

export function isContactInfoStep(step: FormStep): step is FormStep & { stepType: 'contact_info'; content: ContactInfoContent } {
  return step.stepType === 'contact_info';
}

export function isRewardStep(step: FormStep): step is FormStep & { stepType: 'reward'; content: RewardContent } {
  return step.stepType === 'reward';
}

export function isThankYouStep(step: FormStep): step is FormStep & { stepType: 'thank_you'; content: ThankYouContent } {
  return step.stepType === 'thank_you';
}

// =================================================================
// Default Content Factories
// =================================================================

export function createDefaultWelcomeContent(): WelcomeContent {
  return {
    title: 'Share your experience',
    subtitle: 'Your feedback helps others make better decisions.',
    buttonText: 'Get Started',
  };
}

export function createDefaultThankYouContent(): ThankYouContent {
  return {
    title: 'Thank you!',
    message: 'Your testimonial has been submitted successfully.',
    showSocialShare: false,
  };
}

export function createDefaultContactInfoContent(): ContactInfoContent {
  return {
    title: 'About You',
    subtitle: 'Tell us a bit about yourself',
    enabledFields: ['name', 'email'],
    requiredFields: ['email'],
  };
}

export function createDefaultConsentContent(): ConsentContent {
  return {
    title: 'How can we share your testimonial?',
    description: 'Choose how you\'d like your feedback to be used.',
    options: {
      public: { label: 'Public', description: 'Display on our website and marketing materials' },
      private: { label: 'Private', description: 'For internal use only' },
    },
    defaultOption: 'public',
    required: true,
  };
}

export function createDefaultRewardContent(): RewardContent {
  return {
    title: 'Thank you for your feedback!',
    description: 'Here\'s a small token of our appreciation.',
    rewardType: 'coupon',
    couponCode: '',
    couponDescription: '',
  };
}

// =================================================================
// Step Label Helpers
// =================================================================

export function getStepLabel(step: FormStep): string {
  switch (step.stepType) {
    case 'welcome': return 'Welcome';
    case 'question': return `Q${step.stepOrder}`;
    case 'rating': return 'Rating';
    case 'consent': return 'Consent';
    case 'contact_info': return 'Contact';
    case 'reward': return 'Reward';
    case 'thank_you': return 'Thanks';
    default: return 'Step';
  }
}

export function getStepIcon(stepType: StepType): string {
  switch (stepType) {
    case 'welcome': return '👋';
    case 'question': return '❓';
    case 'rating': return '⭐';
    case 'consent': return '✅';
    case 'contact_info': return '👤';
    case 'reward': return '🎁';
    case 'thank_you': return '🎉';
    default: return '📄';
  }
}
```

**Acceptance Criteria**:
- [ ] All interfaces compile without errors
- [ ] Type guards work correctly
- [ ] Default factories return valid content
- [ ] Export from `features/createForm/models/index.ts`

---

### Y2: Create FormEditorLayout.vue
**Priority**: High
**Depends On**: None (can start immediately)
**Blocks**: Y6

Create the three-panel layout shell with slots.

**File**: `apps/web/src/layouts/FormEditorLayout.vue`

```vue
<script setup lang="ts">
// Minimal layout - just structure
</script>

<template>
  <div class="flex h-screen flex-col bg-background">
    <!-- Header slot -->
    <header class="shrink-0 border-b border-border">
      <slot name="header" />
    </header>

    <!-- Three-panel body -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Steps Sidebar (80px) -->
      <aside class="w-20 shrink-0 border-r border-border bg-muted/30 overflow-y-auto">
        <slot name="sidebar" />
      </aside>

      <!-- Center: Timeline Canvas (fluid) -->
      <main class="flex-1 overflow-y-auto bg-muted/10">
        <slot name="timeline" />
      </main>

      <!-- Right: Properties Panel (280px) -->
      <aside class="w-72 shrink-0 border-l border-border overflow-y-auto">
        <slot name="properties" />
      </aside>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Three-panel layout renders correctly
- [ ] All three slots accept content
- [ ] Panels have correct widths (80px, fluid, 280px)
- [ ] Overflow scroll works in each panel

---

### Y3: Create FormEditorHeader.vue
**Priority**: High
**Depends On**: None
**Blocks**: Y6

Create the header with back button, title, save status, and actions.

**File**: `apps/web/src/features/createForm/ui/FormEditorHeader.vue`

```vue
<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

interface Props {
  formName: string;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  canPublish: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'preview'): void;
  (e: 'publish'): void;
  (e: 'update:formName', value: string): void;
}>();

function handleBack() {
  // TODO: Check for unsaved changes
  emit('back');
}
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4">
    <!-- Left: Back button + Title -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" @click="handleBack">
        <Icon name="arrow-left" class="mr-2 h-4 w-4" />
        Back to Forms
      </Button>

      <div class="flex items-center gap-2">
        <input
          :value="formName"
          class="border-0 bg-transparent text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
          @input="emit('update:formName', ($event.target as HTMLInputElement).value)"
        />

        <!-- Save status indicator -->
        <span
          v-if="saveStatus === 'saving'"
          class="text-xs text-muted-foreground"
        >
          Saving...
        </span>
        <span
          v-else-if="saveStatus === 'saved'"
          class="text-xs text-emerald-600"
        >
          Saved
        </span>
        <span
          v-else-if="saveStatus === 'unsaved'"
          class="text-xs text-amber-600"
        >
          Unsaved changes
        </span>
        <span
          v-else-if="saveStatus === 'error'"
          class="text-xs text-red-600"
        >
          Error saving
        </span>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" @click="emit('preview')">
        <Icon name="eye" class="mr-2 h-4 w-4" />
        Preview
      </Button>
      <Button
        size="sm"
        :disabled="!canPublish"
        @click="emit('publish')"
      >
        Publish
      </Button>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Back button navigates with unsaved changes warning
- [ ] Form name is editable inline
- [ ] Save status shows correct state
- [ ] Preview and Publish buttons work

---

### Y4: Create Core Composables
**Priority**: High
**Depends On**: Y1
**Blocks**: G4-G8, B4-B7

Create the small, single-responsibility composables.

#### Y4a: useStepState.ts (~80 lines)

**File**: `apps/web/src/features/createForm/composables/timeline/useStepState.ts`

```typescript
import { ref, computed, type Ref } from 'vue';
import type { FormStep } from '../../models/stepContent';

export function useStepState() {
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);

  const isDirty = computed(() => {
    return JSON.stringify(steps.value) !== JSON.stringify(originalSteps.value);
  });

  const hasSteps = computed(() => steps.value.length > 0);

  function setSteps(newSteps: FormStep[]) {
    steps.value = [...newSteps];
    originalSteps.value = JSON.parse(JSON.stringify(newSteps));
  }

  function markClean() {
    originalSteps.value = JSON.parse(JSON.stringify(steps.value));
  }

  function getStepById(id: string): FormStep | undefined {
    return steps.value.find(s => s.id === id);
  }

  function getStepByIndex(index: number): FormStep | undefined {
    return steps.value[index];
  }

  return {
    steps,
    isDirty,
    hasSteps,
    setSteps,
    markClean,
    getStepById,
    getStepByIndex,
  };
}
```

#### Y4b: useStepNavigation.ts (~100 lines)

**File**: `apps/web/src/features/createForm/composables/timeline/useStepNavigation.ts`

```typescript
import { ref, computed, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormStep } from '../../models/stepContent';

export function useStepNavigation(steps: Ref<FormStep[]>) {
  const route = useRoute();
  const router = useRouter();

  const selectedIndex = ref(0);

  const selectedStep = computed(() => {
    return steps.value[selectedIndex.value] ?? null;
  });

  const canGoNext = computed(() => {
    return selectedIndex.value < steps.value.length - 1;
  });

  const canGoPrev = computed(() => {
    return selectedIndex.value > 0;
  });

  function selectStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      selectedIndex.value = index;
      syncToUrl();
    }
  }

  function selectStepById(id: string) {
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      selectStep(index);
    }
  }

  function goNext() {
    if (canGoNext.value) {
      selectStep(selectedIndex.value + 1);
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      selectStep(selectedIndex.value - 1);
    }
  }

  function scrollToStep(index: number) {
    const element = document.querySelector(`[data-step-index="${index}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // URL sync
  function syncToUrl() {
    const step = steps.value[selectedIndex.value];
    if (step) {
      router.replace({ query: { ...route.query, step: step.id } });
    }
  }

  function syncFromUrl() {
    const stepId = route.query.step as string;
    if (stepId) {
      selectStepById(stepId);
    }
  }

  // Initialize from URL
  watch(() => steps.value.length, () => {
    if (steps.value.length > 0) {
      syncFromUrl();
    }
  }, { immediate: true });

  return {
    selectedIndex,
    selectedStep,
    canGoNext,
    canGoPrev,
    selectStep,
    selectStepById,
    goNext,
    goPrev,
    scrollToStep,
  };
}
```

#### Y4c: useStepOperations.ts (~120 lines)

**File**: `apps/web/src/features/createForm/composables/timeline/useStepOperations.ts`

```typescript
import { type Ref } from 'vue';
import type { FormStep, StepType } from '../../models/stepContent';
import {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from '../../models/stepContent';

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useStepOperations(steps: Ref<FormStep[]>, formId: Ref<string>) {

  function createStep(type: StepType, order: number): FormStep {
    const baseStep: FormStep = {
      id: generateTempId(),
      formId: formId.value,
      stepType: type,
      stepOrder: order,
      questionId: null,
      content: {},
      tips: [],
      isActive: true,
      isNew: true,
      isModified: false,
    };

    // Set default content based on type
    switch (type) {
      case 'welcome':
        baseStep.content = createDefaultWelcomeContent();
        break;
      case 'thank_you':
        baseStep.content = createDefaultThankYouContent();
        break;
      case 'contact_info':
        baseStep.content = createDefaultContactInfoContent();
        break;
      case 'consent':
        baseStep.content = createDefaultConsentContent();
        break;
      case 'reward':
        baseStep.content = createDefaultRewardContent();
        break;
      case 'question':
      case 'rating':
        // These need question_id, handled separately
        break;
    }

    return baseStep;
  }

  function addStep(type: StepType, afterIndex?: number): FormStep {
    const insertIndex = afterIndex !== undefined
      ? afterIndex + 1
      : steps.value.length;

    const newStep = createStep(type, insertIndex);

    // Insert and reorder
    steps.value.splice(insertIndex, 0, newStep);
    reorderSteps();

    return newStep;
  }

  function removeStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      steps.value.splice(index, 1);
      reorderSteps();
    }
  }

  function updateStep(index: number, updates: Partial<FormStep>) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index] = {
        ...steps.value[index],
        ...updates,
        isModified: true,
      };
    }
  }

  function updateStepContent(index: number, content: FormStep['content']) {
    updateStep(index, { content });
  }

  function updateStepTips(index: number, tips: string[]) {
    updateStep(index, { tips });
  }

  function reorderSteps() {
    steps.value.forEach((step, index) => {
      step.stepOrder = index;
    });
  }

  function moveStep(fromIndex: number, toIndex: number) {
    if (
      fromIndex >= 0 && fromIndex < steps.value.length &&
      toIndex >= 0 && toIndex < steps.value.length
    ) {
      const [removed] = steps.value.splice(fromIndex, 1);
      steps.value.splice(toIndex, 0, removed);
      reorderSteps();
    }
  }

  function duplicateStep(index: number): FormStep | null {
    const original = steps.value[index];
    if (!original) return null;

    const duplicate = createStep(original.stepType, index + 1);
    duplicate.content = JSON.parse(JSON.stringify(original.content));
    duplicate.tips = [...original.tips];

    steps.value.splice(index + 1, 0, duplicate);
    reorderSteps();

    return duplicate;
  }

  return {
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep,
  };
}
```

**Acceptance Criteria**:
- [ ] All composables are under 120 lines
- [ ] Each has single responsibility
- [ ] Types are correct
- [ ] Export from `composables/timeline/index.ts`

---

### Y5: Create useTimelineEditor Orchestrator
**Priority**: High
**Depends On**: Y4
**Blocks**: G4-G8, B4-B7

Compose the smaller composables into the main interface.

**File**: `apps/web/src/features/createForm/composables/timeline/useTimelineEditor.ts`

```typescript
import { ref, computed, readonly, type Ref } from 'vue';
import { useStepState } from './useStepState';
import { useStepNavigation } from './useStepNavigation';
import { useStepOperations } from './useStepOperations';
import type { FormStep, StepType } from '../../models/stepContent';

export function useTimelineEditor(formId: Ref<string>) {
  // Compose from smaller composables
  const { steps, isDirty, hasSteps, setSteps, markClean, getStepById } = useStepState();
  const {
    selectedIndex,
    selectedStep,
    canGoNext,
    canGoPrev,
    selectStep,
    goNext,
    goPrev,
    scrollToStep
  } = useStepNavigation(steps);
  const {
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep
  } = useStepOperations(steps, formId);

  // Editor panel state
  const isEditorOpen = ref(false);
  const editorMode = ref<'edit' | 'add'>('edit');

  // Actions that coordinate multiple composables
  function handleAddStep(type: StepType, afterIndex?: number) {
    const newStep = addStep(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    scrollToStep(newIndex);

    // Open editor for new step
    editorMode.value = 'add';
    isEditorOpen.value = true;
  }

  function handleEditStep(index: number) {
    selectStep(index);
    editorMode.value = 'edit';
    isEditorOpen.value = true;
  }

  function handleRemoveStep(index: number) {
    removeStep(index);
    // Select previous step if possible
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  function handleCloseEditor() {
    isEditorOpen.value = false;
  }

  function handleNavigateEditor(direction: 'prev' | 'next') {
    if (direction === 'prev' && canGoPrev.value) {
      goPrev();
    } else if (direction === 'next' && canGoNext.value) {
      goNext();
    }
  }

  return {
    // State (readonly where appropriate)
    steps: readonly(steps),
    selectedIndex,
    selectedStep,
    isDirty,
    hasSteps,
    isEditorOpen,
    editorMode,

    // Navigation
    canGoNext,
    canGoPrev,
    selectStep,
    scrollToStep,

    // Operations
    setSteps,
    markClean,
    getStepById,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep,

    // Coordinated actions
    handleAddStep,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,
    handleNavigateEditor,
  };
}

// Export type for consumers
export type TimelineEditorContext = ReturnType<typeof useTimelineEditor>;
```

**Acceptance Criteria**:
- [ ] Orchestrator composes smaller composables
- [ ] Returns unified interface
- [ ] Handles coordinated actions
- [ ] Under 150 lines

---

### Y6: Update Page to Use New Layout
**Priority**: Medium
**Depends On**: Y2, Y3, Y5
**Blocks**: None

Update the edit page to use the new layout.

**File**: `apps/web/src/pages/[org]/forms/[urlSlug]/edit.vue`

```vue
<script setup lang="ts">
import { computed, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '@/features/createForm/ui/FormEditorHeader.vue';
import { useTimelineEditor } from '@/features/createForm/composables/timeline/useTimelineEditor';
// TODO: Import actual components when ready
// import StepsSidebar from '@/features/createForm/ui/stepsSidebar/StepsSidebar.vue';
// import TimelineCanvas from '@/features/createForm/ui/timelineCanvas/TimelineCanvas.vue';
// import PropertiesPanel from '@/features/createForm/ui/propertiesPanel/PropertiesPanel.vue';

const route = useRoute();
const router = useRouter();

const formId = computed(() => {
  // Extract form ID from URL slug (format: name_id)
  const slug = route.params.urlSlug as string;
  const parts = slug.split('_');
  return parts[parts.length - 1];
});

const editor = useTimelineEditor(formId);

// Provide editor context to child components
provide('timelineEditor', editor);

// Header handlers
function handleBack() {
  router.push({ name: 'forms' });
}

function handlePreview() {
  // TODO: Open preview mode
}

function handlePublish() {
  // TODO: Publish form
}

// Mock data for testing
const mockFormName = 'My Test Form';
const mockSaveStatus = 'saved';
</script>

<template>
  <FormEditorLayout>
    <template #header>
      <FormEditorHeader
        :form-name="mockFormName"
        :save-status="mockSaveStatus"
        :can-publish="true"
        @back="handleBack"
        @preview="handlePreview"
        @publish="handlePublish"
      />
    </template>

    <template #sidebar>
      <!-- TODO: Replace with StepsSidebar when Green completes G4 -->
      <div class="p-2 text-xs text-muted-foreground">
        <div class="mb-2 font-semibold">STEPS</div>
        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          class="mb-2 p-2 bg-background rounded cursor-pointer"
          :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
          @click="editor.selectStep(index)"
        >
          {{ index + 1 }}. {{ step.stepType }}
        </div>
        <button
          class="w-full p-2 border border-dashed rounded text-center"
          @click="editor.handleAddStep('question')"
        >
          + Add
        </button>
      </div>
    </template>

    <template #timeline>
      <!-- TODO: Replace with TimelineCanvas when Green completes G8 -->
      <div class="p-8">
        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          :data-step-index="index"
          class="mb-8"
        >
          <div
            class="max-w-md mx-auto p-6 bg-background rounded-lg border shadow-sm cursor-pointer"
            :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
            @click="editor.handleEditStep(index)"
          >
            <div class="text-sm text-muted-foreground mb-2">
              Step {{ index + 1 }}: {{ step.stepType }}
            </div>
            <div class="font-medium">
              {{ (step.content as any).title || 'Untitled' }}
            </div>
          </div>
          <!-- Connector -->
          <div v-if="index < editor.steps.value.length - 1" class="flex justify-center my-4">
            <div class="w-0.5 h-8 bg-border" />
          </div>
        </div>
      </div>
    </template>

    <template #properties>
      <!-- TODO: Replace with PropertiesPanel when Blue completes B4 -->
      <div class="p-4">
        <div v-if="editor.selectedStep.value">
          <h3 class="font-semibold mb-2">Properties</h3>
          <div class="text-sm text-muted-foreground">
            Selected: {{ editor.selectedStep.value.stepType }}
          </div>
          <div class="mt-4">
            <h4 class="text-sm font-medium mb-2">Tips</h4>
            <div
              v-for="(tip, i) in editor.selectedStep.value.tips"
              :key="i"
              class="text-sm p-2 bg-muted rounded mb-1"
            >
              {{ tip }}
            </div>
            <button
              class="text-sm text-primary"
              @click="editor.updateStepTips(editor.selectedIndex.value, [...editor.selectedStep.value.tips, 'New tip'])"
            >
              + Add tip
            </button>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          Select a step to see properties
        </div>
      </div>
    </template>
  </FormEditorLayout>
</template>
```

**Acceptance Criteria**:
- [ ] Page renders with new layout
- [ ] Mock content shows in all three panels
- [ ] Navigation between steps works
- [ ] Back button works
- [ ] Editor context is provided

---

### Y7: Integration Testing
**Priority**: Medium
**Depends On**: Y6, G8, B7
**Blocks**: None

Test the full integration with actual Green and Blue components.

**Tasks**:
- [ ] Replace mock sidebar with StepsSidebar
- [ ] Replace mock timeline with TimelineCanvas
- [ ] Replace mock properties with PropertiesPanel
- [ ] Test step selection flow
- [ ] Test add/remove step flow
- [ ] Test editor open/close flow
- [ ] Test keyboard navigation
- [ ] Test URL sync

---

## Barrel Exports

Update these files to export your new code:

### models/index.ts

```typescript
// Existing exports...

// Step types
export * from './stepContent';
```

### composables/timeline/index.ts (new file)

```typescript
export { useStepState } from './useStepState';
export { useStepNavigation } from './useStepNavigation';
export { useStepOperations } from './useStepOperations';
export { useTimelineEditor, type TimelineEditorContext } from './useTimelineEditor';
```

### composables/index.ts

```typescript
// Existing exports...

// Timeline editor
export * from './timeline';
```

---

## Coordination Notes

### What Green and Blue Need From You

| Agent | Needs | When |
|-------|-------|------|
| Green | `FormStep`, `StepType`, type guards, label helpers | After Y1 |
| Green | `TimelineEditorContext` type | After Y5 |
| Blue | Same as Green | Same timing |

### Interface Contract

```typescript
// This is what Green and Blue will import
import type {
  FormStep,
  StepType,
  TimelineEditorContext,
} from '@/features/createForm/models';

import {
  getStepLabel,
  getStepIcon,
  isWelcomeStep,
  isQuestionStep,
  // ... etc
} from '@/features/createForm/models';
```

### Communication Protocol

1. After completing Y1, announce in shared channel
2. Push your branch so Green/Blue can pull types
3. If you change interfaces after Y1, notify immediately
