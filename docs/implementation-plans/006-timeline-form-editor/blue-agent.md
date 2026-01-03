# Blue Agent: Properties + Editor Panels

**Branch**: `blue/timeline-panels`
**Worktree**: `ms-testimonials-blue`

---

## Overview

Blue agent owns the right properties panel and the step editor slide-in. You build the contextual help, tips editor, and all step-specific editor forms.

### Your Deliverables

| Category | Files |
|----------|-------|
| **Properties** | `ui/propertiesPanel/*.vue` |
| **Editor** | `ui/stepEditor/*.vue` |
| **Step Editors** | `ui/stepEditor/editors/*.vue` |
| **Composables** | `composables/stepEditor/*.ts` |

---

## Architecture Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR SCOPE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ PropertiesPanel (B4)                                                │   │
│   │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │ │ ContextualHelp (B1) - "What's this?" explanations               │ │   │
│   │ └─────────────────────────────────────────────────────────────────┘ │   │
│   │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │ │ QuestionTips (B2) - Tips CRUD list                              │ │   │
│   │ └─────────────────────────────────────────────────────────────────┘ │   │
│   │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │ │ DesignSettings (B3) - Theme/branding (placeholder)              │ │   │
│   │ └─────────────────────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ StepEditorSlideIn (B6) - Slide-in panel container                   │   │
│   │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │ │ editors/ (B7)                                                    │ │   │
│   │ │ ├── WelcomeStepEditor.vue                                        │ │   │
│   │ │ ├── QuestionStepEditor.vue                                       │ │   │
│   │ │ ├── RatingStepEditor.vue                                         │ │   │
│   │ │ ├── ConsentStepEditor.vue                                        │ │   │
│   │ │ ├── ContactInfoStepEditor.vue                                    │ │   │
│   │ │ ├── RewardStepEditor.vue                                         │ │   │
│   │ │ └── ThankYouStepEditor.vue                                       │ │   │
│   │ └─────────────────────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tasks

### B1: Create ContextualHelp.vue
**Priority**: High
**Depends On**: Y1 (StepType)
**Blocks**: B4

Create the "What's this?" section that explains each step type.

**File**: `apps/web/src/features/createForm/ui/propertiesPanel/ContextualHelp.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@testimonials/ui';
import type { StepType } from '../../models/stepContent';

interface Props {
  stepType: StepType | null;
}

const props = defineProps<Props>();

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
}

const helpContent: Record<StepType, HelpContent> = {
  welcome: {
    title: 'Welcome Step',
    description: 'Introduce your form and set expectations. This is the first thing customers see.',
    tips: [
      'Keep the title short and compelling',
      'Explain why their feedback matters',
      'Set expectations for time required',
    ],
  },
  question: {
    title: 'Question Step',
    description: 'Collect testimonial content with guided prompts. Customers can respond with text or video.',
    tips: [
      'Ask open-ended questions',
      'Focus on outcomes and results',
      'Add tips to guide better responses',
    ],
  },
  rating: {
    title: 'Rating Step',
    description: 'Gauge customer satisfaction before collecting their testimonial.',
    tips: [
      'Place early in the form',
      'Use to filter negative feedback',
      'Keep the scale simple (1-5)',
    ],
  },
  consent: {
    title: 'Consent Step',
    description: 'Let customers choose how their testimonial is shared - publicly or privately.',
    tips: [
      'Be transparent about usage',
      'Explain the difference clearly',
      'Default to public for more content',
    ],
  },
  contact_info: {
    title: 'Contact Info Step',
    description: 'Collect customer details for attribution on their testimonial.',
    tips: [
      'Only ask for what you need',
      'Email should usually be required',
      'Photo adds credibility',
    ],
  },
  reward: {
    title: 'Reward Step',
    description: 'Incentivize testimonials with coupons, downloads, or special offers.',
    tips: [
      'Mention the reward upfront',
      'Make it genuinely valuable',
      'Set clear redemption instructions',
    ],
  },
  thank_you: {
    title: 'Thank You Step',
    description: 'Thank customers and optionally encourage social sharing.',
    tips: [
      'Express genuine gratitude',
      'Consider social sharing prompts',
      'Optional redirect to your site',
    ],
  },
};

const content = computed(() => {
  if (!props.stepType) return null;
  return helpContent[props.stepType];
});
</script>

<template>
  <Collapsible v-if="content" :default-open="true" class="border-b pb-4">
    <CollapsibleTrigger class="flex items-center gap-2 w-full text-left group">
      <Icon name="book-open" class="w-4 h-4 text-primary" />
      <span class="text-sm font-medium">What's this?</span>
      <Icon
        name="chevron-down"
        class="w-4 h-4 ml-auto transition-transform group-data-[state=open]:rotate-180"
      />
    </CollapsibleTrigger>
    <CollapsibleContent class="pt-3">
      <h4 class="font-medium text-sm mb-1">{{ content.title }}</h4>
      <p class="text-sm text-muted-foreground mb-3">
        {{ content.description }}
      </p>
      <ul class="space-y-1.5">
        <li
          v-for="(tip, i) in content.tips"
          :key="i"
          class="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <Icon name="lightbulb" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>{{ tip }}</span>
        </li>
      </ul>
    </CollapsibleContent>
  </Collapsible>
</template>
```

**Acceptance Criteria**:
- [ ] Shows help for all 7 step types
- [ ] Collapsible section
- [ ] Under 100 lines

---

### B2: Create QuestionTips.vue
**Priority**: High
**Depends On**: None
**Blocks**: B4

Create the tips editor with add/edit/delete/reorder.

**File**: `apps/web/src/features/createForm/ui/propertiesPanel/QuestionTips.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

interface Props {
  tips: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', tips: string[]): void;
}>();

const editingIndex = ref<number | null>(null);
const editingValue = ref('');
const newTipValue = ref('');

function startEdit(index: number) {
  editingIndex.value = index;
  editingValue.value = props.tips[index];
}

function saveEdit() {
  if (editingIndex.value !== null && editingValue.value.trim()) {
    const newTips = [...props.tips];
    newTips[editingIndex.value] = editingValue.value.trim();
    emit('update', newTips);
  }
  cancelEdit();
}

function cancelEdit() {
  editingIndex.value = null;
  editingValue.value = '';
}

function addTip() {
  if (newTipValue.value.trim()) {
    emit('update', [...props.tips, newTipValue.value.trim()]);
    newTipValue.value = '';
  }
}

function removeTip(index: number) {
  const newTips = props.tips.filter((_, i) => i !== index);
  emit('update', newTips);
}

function moveTip(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= props.tips.length) return;

  const newTips = [...props.tips];
  [newTips[index], newTips[newIndex]] = [newTips[newIndex], newTips[index]];
  emit('update', newTips);
}
</script>

<template>
  <div class="border-b pb-4">
    <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
      <Icon name="lightbulb" class="w-4 h-4 text-amber-500" />
      Question Tips
    </h4>
    <p class="text-xs text-muted-foreground mb-3">
      Help customers leave better testimonials with example prompts.
    </p>

    <!-- Tips list -->
    <div class="space-y-2 mb-3">
      <div
        v-for="(tip, index) in tips"
        :key="index"
        class="group flex items-start gap-2 p-2 rounded-md bg-muted/50"
      >
        <!-- Editing mode -->
        <template v-if="editingIndex === index">
          <Input
            v-model="editingValue"
            class="flex-1 text-sm"
            @keyup.enter="saveEdit"
            @keyup.escape="cancelEdit"
          />
          <Button size="icon" variant="ghost" class="h-7 w-7" @click="saveEdit">
            <Icon name="check" class="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" class="h-7 w-7" @click="cancelEdit">
            <Icon name="x" class="w-4 h-4" />
          </Button>
        </template>

        <!-- Display mode -->
        <template v-else>
          <span class="flex-1 text-sm">💡 {{ tip }}</span>
          <div class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <Button size="icon" variant="ghost" class="h-6 w-6" @click="moveTip(index, 'up')">
              <Icon name="chevron-up" class="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" class="h-6 w-6" @click="moveTip(index, 'down')">
              <Icon name="chevron-down" class="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" class="h-6 w-6" @click="startEdit(index)">
              <Icon name="pencil" class="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              class="h-6 w-6 text-destructive"
              @click="removeTip(index)"
            >
              <Icon name="trash-2" class="w-3 h-3" />
            </Button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add new tip -->
    <div class="flex gap-2">
      <Input
        v-model="newTipValue"
        placeholder="Add a tip..."
        class="flex-1 text-sm"
        @keyup.enter="addTip"
      />
      <Button size="sm" variant="outline" @click="addTip">
        <Icon name="plus" class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Display list of tips
- [ ] Inline edit on click
- [ ] Add new tip with input
- [ ] Remove tip with button
- [ ] Reorder with up/down
- [ ] Under 120 lines

---

### B3: Create DesignSettings.vue
**Priority**: Low
**Depends On**: None
**Blocks**: B4

Create placeholder for theme/branding settings.

**File**: `apps/web/src/features/createForm/ui/propertiesPanel/DesignSettings.vue`

```vue
<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
</script>

<template>
  <div class="pt-4">
    <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
      <Icon name="palette" class="w-4 h-4 text-primary" />
      Design
    </h4>

    <div class="space-y-3">
      <!-- Theme selector placeholder -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Theme</span>
        <Button variant="outline" size="sm" disabled>
          Light
          <Icon name="chevron-down" class="w-4 h-4 ml-1" />
        </Button>
      </div>

      <!-- Color selector placeholder -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Accent Color</span>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground" />
          <span class="text-sm">Blue</span>
        </div>
      </div>

      <!-- Logo placeholder -->
      <div>
        <span class="text-sm text-muted-foreground block mb-2">Logo</span>
        <Button variant="outline" size="sm" class="w-full" disabled>
          <Icon name="upload" class="w-4 h-4 mr-2" />
          Upload Logo
        </Button>
      </div>

      <p class="text-xs text-muted-foreground italic">
        Branding customization coming soon.
      </p>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows placeholder UI
- [ ] Disabled state for future feature
- [ ] Under 60 lines

---

### B4: Create PropertiesPanel.vue
**Priority**: High
**Depends On**: B1, B2, B3, Y4/Y5
**Blocks**: B8

Container that shows contextual content based on selected step.

**File**: `apps/web/src/features/createForm/ui/propertiesPanel/PropertiesPanel.vue`

```vue
<script setup lang="ts">
import { inject, computed } from 'vue';
import ContextualHelp from './ContextualHelp.vue';
import QuestionTips from './QuestionTips.vue';
import DesignSettings from './DesignSettings.vue';
import type { TimelineEditorContext } from '../../composables/timeline/useTimelineEditor';

const editor = inject<TimelineEditorContext>('timelineEditor')!;

const selectedStep = computed(() => editor.selectedStep.value);
const showTips = computed(() => {
  return selectedStep.value?.stepType === 'question' || selectedStep.value?.stepType === 'rating';
});

function handleUpdateTips(tips: string[]) {
  if (selectedStep.value) {
    editor.updateStepTips(editor.selectedIndex.value, tips);
  }
}
</script>

<template>
  <div class="h-full p-4">
    <!-- No selection state -->
    <div v-if="!selectedStep" class="text-center py-12">
      <p class="text-sm text-muted-foreground">
        Select a step to see its properties
      </p>
    </div>

    <!-- Selected step properties -->
    <div v-else class="space-y-4">
      <!-- Contextual help -->
      <ContextualHelp :step-type="selectedStep.stepType" />

      <!-- Tips (only for question/rating steps) -->
      <QuestionTips
        v-if="showTips"
        :tips="selectedStep.tips"
        @update="handleUpdateTips"
      />

      <!-- Design settings -->
      <DesignSettings />
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows empty state when no selection
- [ ] Shows contextual help for selected step
- [ ] Shows tips editor for question/rating steps
- [ ] Shows design settings
- [ ] Under 60 lines

---

### B5: Create useStepEditorPanel.ts
**Priority**: High
**Depends On**: Y4/Y5
**Blocks**: B6

Composable for step editor panel state.

**File**: `apps/web/src/features/createForm/composables/stepEditor/useStepEditorPanel.ts`

```typescript
import { ref, computed, watch, type Ref } from 'vue';
import type { FormStep, StepContent } from '../../models/stepContent';

export function useStepEditorPanel(
  selectedStep: Ref<FormStep | null>,
  onSave: (content: StepContent) => void
) {
  const isOpen = ref(false);
  const localContent = ref<StepContent>({});
  const isDirty = ref(false);

  // Sync local content when step changes
  watch(selectedStep, (step) => {
    if (step) {
      localContent.value = JSON.parse(JSON.stringify(step.content));
      isDirty.value = false;
    }
  }, { immediate: true });

  function open() {
    isOpen.value = true;
  }

  function close() {
    if (isDirty.value) {
      // Could add confirmation dialog here
    }
    isOpen.value = false;
  }

  function updateContent(updates: Partial<StepContent>) {
    localContent.value = { ...localContent.value, ...updates };
    isDirty.value = true;
  }

  function save() {
    onSave(localContent.value);
    isDirty.value = false;
  }

  function saveAndClose() {
    save();
    close();
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      save();
    }
  }

  return {
    isOpen,
    localContent,
    isDirty,
    open,
    close,
    updateContent,
    save,
    saveAndClose,
    handleKeydown,
  };
}
```

**Acceptance Criteria**:
- [ ] Manages local editing state
- [ ] Tracks dirty state
- [ ] Keyboard shortcuts
- [ ] Under 80 lines

---

### B6: Create StepEditorSlideIn.vue
**Priority**: High
**Depends On**: B5
**Blocks**: B7, B8

The slide-in panel container for editing steps.

**File**: `apps/web/src/features/createForm/ui/stepEditor/StepEditorSlideIn.vue`

```vue
<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@testimonials/ui';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import WelcomeStepEditor from './editors/WelcomeStepEditor.vue';
import QuestionStepEditor from './editors/QuestionStepEditor.vue';
import RatingStepEditor from './editors/RatingStepEditor.vue';
import ConsentStepEditor from './editors/ConsentStepEditor.vue';
import ContactInfoStepEditor from './editors/ContactInfoStepEditor.vue';
import RewardStepEditor from './editors/RewardStepEditor.vue';
import ThankYouStepEditor from './editors/ThankYouStepEditor.vue';
import type { TimelineEditorContext } from '../../composables/timeline/useTimelineEditor';
import { getStepLabel, getStepIcon } from '../../models/stepContent';

const editor = inject<TimelineEditorContext>('timelineEditor')!;

const selectedStep = computed(() => editor.selectedStep.value);
const stepLabel = computed(() => selectedStep.value ? getStepLabel(selectedStep.value) : '');
const stepIcon = computed(() => selectedStep.value ? getStepIcon(selectedStep.value.stepType) : '');

const editorComponents: Record<string, any> = {
  welcome: WelcomeStepEditor,
  question: QuestionStepEditor,
  rating: RatingStepEditor,
  consent: ConsentStepEditor,
  contact_info: ContactInfoStepEditor,
  reward: RewardStepEditor,
  thank_you: ThankYouStepEditor,
};

const currentEditor = computed(() => {
  if (!selectedStep.value) return null;
  return editorComponents[selectedStep.value.stepType];
});

function handleContentUpdate(content: any) {
  editor.updateStepContent(editor.selectedIndex.value, content);
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!editor.isEditorOpen.value) return;

  if (event.key === 'Escape') {
    editor.handleCloseEditor();
  }
  if (event.key === 'ArrowUp' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    editor.handleNavigateEditor('prev');
  }
  if (event.key === 'ArrowDown' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    editor.handleNavigateEditor('next');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Sheet :open="editor.isEditorOpen.value" @update:open="editor.handleCloseEditor">
    <SheetContent side="right" class="w-[400px] sm:w-[540px] overflow-y-auto">
      <SheetHeader class="border-b pb-4">
        <div class="flex items-center justify-between">
          <SheetTitle class="flex items-center gap-2">
            <span class="text-xl">{{ stepIcon }}</span>
            <span>Edit {{ stepLabel }}</span>
          </SheetTitle>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              :disabled="!editor.canGoPrev.value"
              @click="editor.handleNavigateEditor('prev')"
            >
              <Icon name="chevron-up" class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="!editor.canGoNext.value"
              @click="editor.handleNavigateEditor('next')"
            >
              <Icon name="chevron-down" class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          Step {{ (editor.selectedIndex.value ?? 0) + 1 }} of {{ editor.steps.value.length }}
        </p>
      </SheetHeader>

      <div class="py-4">
        <component
          v-if="currentEditor && selectedStep"
          :is="currentEditor"
          :step="selectedStep"
          @update="handleContentUpdate"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
```

**Acceptance Criteria**:
- [ ] Slide-in from right
- [ ] Shows correct editor for step type
- [ ] Navigation buttons work
- [ ] Keyboard shortcuts work
- [ ] Under 120 lines

---

### B7: Create Step Editor Variants
**Priority**: High
**Depends On**: B6, Y1
**Blocks**: B8

Create editor forms for each step type.

#### B7a: WelcomeStepEditor.vue

**File**: `apps/web/src/features/createForm/ui/stepEditor/editors/WelcomeStepEditor.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label } from '@testimonials/ui';
import type { FormStep, WelcomeContent } from '../../../models/stepContent';
import { isWelcomeStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: WelcomeContent): void;
}>();

const content = computed((): WelcomeContent => {
  if (isWelcomeStep(props.step)) {
    return props.step.content;
  }
  return { title: '', subtitle: '', buttonText: 'Get Started' };
});

function update(field: keyof WelcomeContent, value: string) {
  emit('update', { ...content.value, [field]: value });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="Share your experience"
        @update:model-value="update('title', $event)"
      />
    </div>

    <div>
      <Label for="subtitle">Subtitle</Label>
      <Textarea
        id="subtitle"
        :model-value="content.subtitle"
        placeholder="Your feedback helps others make better decisions."
        rows="3"
        @update:model-value="update('subtitle', $event)"
      />
    </div>

    <div>
      <Label for="buttonText">Button Text</Label>
      <Input
        id="buttonText"
        :model-value="content.buttonText"
        placeholder="Get Started"
        @update:model-value="update('buttonText', $event)"
      />
    </div>
  </div>
</template>
```

#### B7b: QuestionStepEditor.vue

**File**: `apps/web/src/features/createForm/ui/stepEditor/editors/QuestionStepEditor.vue`

```vue
<script setup lang="ts">
import { Input, Textarea, Label, Switch } from '@testimonials/ui';
import type { FormStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

// TODO: This needs to edit form_questions data, not step content
// For now, show placeholder
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">
      Question editing coming soon. This will edit the linked form_question record.
    </p>

    <div>
      <Label>Question Text</Label>
      <Textarea
        placeholder="What problem were you trying to solve?"
        rows="3"
        disabled
      />
    </div>

    <div>
      <Label>Placeholder</Label>
      <Input
        placeholder="Tell us about your experience..."
        disabled
      />
    </div>

    <div class="flex items-center justify-between">
      <Label>Required</Label>
      <Switch disabled />
    </div>
  </div>
</template>
```

#### B7c: ContactInfoStepEditor.vue

**File**: `apps/web/src/features/createForm/ui/stepEditor/editors/ContactInfoStepEditor.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Input, Label, Switch, Textarea } from '@testimonials/ui';
import type { FormStep, ContactInfoContent, ContactField } from '../../../models/stepContent';
import { isContactInfoStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: ContactInfoContent): void;
}>();

const content = computed((): ContactInfoContent => {
  if (isContactInfoStep(props.step)) {
    return props.step.content;
  }
  return { title: '', enabledFields: ['email'], requiredFields: ['email'] };
});

const allFields: { key: ContactField; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'photo', label: 'Photo' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'company', label: 'Company' },
  { key: 'website', label: 'Website' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter/X' },
];

function toggleField(field: ContactField) {
  const enabled = content.value.enabledFields.includes(field);
  let newEnabled: ContactField[];
  let newRequired = [...content.value.requiredFields];

  if (enabled) {
    newEnabled = content.value.enabledFields.filter(f => f !== field);
    newRequired = newRequired.filter(f => f !== field);
  } else {
    newEnabled = [...content.value.enabledFields, field];
  }

  emit('update', {
    ...content.value,
    enabledFields: newEnabled,
    requiredFields: newRequired,
  });
}

function toggleRequired(field: ContactField) {
  const required = content.value.requiredFields.includes(field);
  const newRequired = required
    ? content.value.requiredFields.filter(f => f !== field)
    : [...content.value.requiredFields, field];

  emit('update', { ...content.value, requiredFields: newRequired });
}

function updateTitle(value: string) {
  emit('update', { ...content.value, title: value });
}

function updateSubtitle(value: string) {
  emit('update', { ...content.value, subtitle: value });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="About You"
        @update:model-value="updateTitle"
      />
    </div>

    <div>
      <Label for="subtitle">Subtitle</Label>
      <Textarea
        id="subtitle"
        :model-value="content.subtitle ?? ''"
        placeholder="Tell us a bit about yourself"
        rows="2"
        @update:model-value="updateSubtitle"
      />
    </div>

    <div>
      <Label class="mb-3 block">Fields to collect</Label>
      <div class="space-y-3">
        <div
          v-for="field in allFields"
          :key="field.key"
          class="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div class="flex items-center gap-3">
            <Switch
              :checked="content.enabledFields.includes(field.key)"
              @update:checked="toggleField(field.key)"
            />
            <span class="text-sm">{{ field.label }}</span>
          </div>
          <div
            v-if="content.enabledFields.includes(field.key)"
            class="flex items-center gap-2"
          >
            <span class="text-xs text-muted-foreground">Required</span>
            <Switch
              :checked="content.requiredFields.includes(field.key)"
              @update:checked="toggleRequired(field.key)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### B7d: ThankYouStepEditor.vue

**File**: `apps/web/src/features/createForm/ui/stepEditor/editors/ThankYouStepEditor.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label, Switch } from '@testimonials/ui';
import type { FormStep, ThankYouContent } from '../../../models/stepContent';
import { isThankYouStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: ThankYouContent): void;
}>();

const content = computed((): ThankYouContent => {
  if (isThankYouStep(props.step)) {
    return props.step.content;
  }
  return { title: '', message: '', showSocialShare: false };
});

function update(field: keyof ThankYouContent, value: any) {
  emit('update', { ...content.value, [field]: value });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="Thank you!"
        @update:model-value="update('title', $event)"
      />
    </div>

    <div>
      <Label for="message">Message</Label>
      <Textarea
        id="message"
        :model-value="content.message"
        placeholder="Your testimonial has been submitted successfully."
        rows="3"
        @update:model-value="update('message', $event)"
      />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Enable Social Sharing</Label>
        <p class="text-xs text-muted-foreground">
          Show social share buttons after submission
        </p>
      </div>
      <Switch
        :checked="content.showSocialShare"
        @update:checked="update('showSocialShare', $event)"
      />
    </div>

    <div v-if="content.showSocialShare">
      <Label for="shareMessage">Share Message</Label>
      <Textarea
        id="shareMessage"
        :model-value="content.socialShareMessage ?? ''"
        placeholder="I just left a testimonial for..."
        rows="2"
        @update:model-value="update('socialShareMessage', $event)"
      />
    </div>

    <div>
      <Label for="redirectUrl">Redirect URL (optional)</Label>
      <Input
        id="redirectUrl"
        :model-value="content.redirectUrl ?? ''"
        placeholder="https://yoursite.com"
        @update:model-value="update('redirectUrl', $event)"
      />
      <p class="text-xs text-muted-foreground mt-1">
        Redirect to this URL after a few seconds
      </p>
    </div>
  </div>
</template>
```

**Additional editors to create** (following same pattern):
- `RatingStepEditor.vue`
- `ConsentStepEditor.vue`
- `RewardStepEditor.vue`

**Acceptance Criteria**:
- [ ] All 7 editor variants created
- [ ] Each emits update event with content
- [ ] Each under 120 lines
- [ ] Consistent form patterns

---

### B8: Integration Testing
**Priority**: Medium
**Depends On**: B6, B7, Y6, G8
**Blocks**: None

Test the full properties panel and editor integration.

**Tasks**:
- [ ] Verify contextual help shows for each step type
- [ ] Test tips add/edit/remove/reorder
- [ ] Test editor opens for each step type
- [ ] Test editor navigation (prev/next)
- [ ] Test keyboard shortcuts (Escape, ⌘S, ⌘↑/↓)
- [ ] Test content updates persist

---

## Barrel Exports

### ui/propertiesPanel/index.ts

```typescript
export { default as PropertiesPanel } from './PropertiesPanel.vue';
export { default as ContextualHelp } from './ContextualHelp.vue';
export { default as QuestionTips } from './QuestionTips.vue';
export { default as DesignSettings } from './DesignSettings.vue';
```

### ui/stepEditor/index.ts

```typescript
export { default as StepEditorSlideIn } from './StepEditorSlideIn.vue';
export { default as WelcomeStepEditor } from './editors/WelcomeStepEditor.vue';
export { default as QuestionStepEditor } from './editors/QuestionStepEditor.vue';
export { default as RatingStepEditor } from './editors/RatingStepEditor.vue';
export { default as ConsentStepEditor } from './editors/ConsentStepEditor.vue';
export { default as ContactInfoStepEditor } from './editors/ContactInfoStepEditor.vue';
export { default as RewardStepEditor } from './editors/RewardStepEditor.vue';
export { default as ThankYouStepEditor } from './editors/ThankYouStepEditor.vue';
```

### composables/stepEditor/index.ts

```typescript
export { useStepEditorPanel } from './useStepEditorPanel';
```
