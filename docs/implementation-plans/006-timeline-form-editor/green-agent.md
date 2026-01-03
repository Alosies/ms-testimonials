# Green Agent: Sidebar + Canvas Components

**Branch**: `green/timeline-ui`
**Worktree**: `ms-testimonials-green`

---

## Overview

Green agent owns the visual UI components for the left sidebar and center timeline canvas. You build the step navigation and step preview cards that users interact with.

### Your Deliverables

| Category | Files |
|----------|-------|
| **Sidebar** | `ui/stepsSidebar/*.vue` |
| **Canvas** | `ui/timelineCanvas/*.vue` |
| **Step Cards** | `ui/timelineCanvas/stepCards/*.vue` |

---

## Architecture Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR SCOPE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐         ┌─────────────────────────────────────────┐   │
│   │ StepsSidebar    │         │ TimelineCanvas                          │   │
│   │ ┌─────────────┐ │         │                                         │   │
│   │ │StepThumbnail│ │         │  ┌─────────────────────────────────┐   │   │
│   │ │   (G1)      │ │         │  │  StepCard (G6)                  │   │   │
│   │ └─────────────┘ │         │  │  ┌─────────────────────────┐   │   │   │
│   │ ┌─────────────┐ │         │  │  │ WelcomeStepCard (G7)    │   │   │   │
│   │ │InsertStep   │ │         │  │  │ QuestionStepCard (G7)   │   │   │   │
│   │ │Button (G2)  │ │         │  │  │ ...etc                  │   │   │   │
│   │ └─────────────┘ │         │  │  └─────────────────────────┘   │   │   │
│   │ ┌─────────────┐ │         │  └─────────────────────────────────┘   │   │
│   │ │StepType     │ │         │        │                                │   │
│   │ │Picker (G3)  │ │         │  ┌─────┴─────┐                          │   │
│   │ └─────────────┘ │         │  │TimelineConnector (G5)               │   │
│   │       (G4)      │         │  └───────────┘                          │   │
│   └─────────────────┘         │                         (G8)            │   │
│                               └─────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tasks

### G1: Create StepThumbnail.vue
**Priority**: High
**Depends On**: Y1 (types)
**Blocks**: G4

Create the individual step button for the sidebar.

**File**: `apps/web/src/features/createForm/ui/stepsSidebar/StepThumbnail.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { FormStep } from '../../models/stepContent';
import { getStepLabel, getStepIcon } from '../../models/stepContent';

interface Props {
  step: FormStep;
  index: number;
  isSelected: boolean;
  isModified?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select'): void;
}>();

const label = computed(() => getStepLabel(props.step));
const icon = computed(() => getStepIcon(props.step.stepType));

const stepNumber = computed(() => props.index + 1);
</script>

<template>
  <button
    class="relative flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border transition-all"
    :class="{
      'border-primary bg-primary/5 ring-2 ring-primary': isSelected,
      'border-border bg-background hover:border-primary/50 hover:bg-muted/50': !isSelected,
    }"
    @click="emit('select')"
  >
    <!-- Step number badge -->
    <span
      class="absolute -top-1 -left-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center"
      :class="{
        'bg-primary text-primary-foreground': isSelected,
        'bg-muted text-muted-foreground': !isSelected,
      }"
    >
      {{ stepNumber }}
    </span>

    <!-- Icon -->
    <span class="text-lg mb-0.5">{{ icon }}</span>

    <!-- Label -->
    <span class="text-[10px] font-medium text-muted-foreground truncate max-w-full px-1">
      {{ label }}
    </span>

    <!-- Modified indicator -->
    <span
      v-if="isModified"
      class="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"
    />
  </button>
</template>
```

**Acceptance Criteria**:
- [ ] Shows step number badge
- [ ] Shows icon and abbreviated label
- [ ] Selected state has ring and background
- [ ] Modified indicator shows amber dot
- [ ] Under 80 lines

---

### G2: Create InsertStepButton.vue
**Priority**: High
**Depends On**: None
**Blocks**: G4

Create the hover-reveal button for inserting steps between existing ones.

**File**: `apps/web/src/features/createForm/ui/stepsSidebar/InsertStepButton.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';

interface Props {
  afterIndex: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'insert'): void;
}>();

const isHovered = ref(false);
</script>

<template>
  <div
    class="relative h-6 flex items-center justify-center"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Collapsed state: just a small line -->
    <div
      v-if="!isHovered"
      class="w-0.5 h-full bg-border/50"
    />

    <!-- Expanded state: insert button -->
    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="isHovered"
        class="absolute flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-primary/50 bg-background hover:border-primary hover:bg-primary/5 transition-colors"
        @click="emit('insert')"
      >
        <Icon name="plus" class="w-3 h-3 text-primary" />
      </button>
    </Transition>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows thin line when not hovered
- [ ] Shows insert button on hover
- [ ] Smooth transition animation
- [ ] Under 60 lines

---

### G3: Create StepTypePicker.vue
**Priority**: High
**Depends On**: Y1 (StepType)
**Blocks**: G4

Create the popover for selecting step type when adding.

**File**: `apps/web/src/features/createForm/ui/stepsSidebar/StepTypePicker.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger, Button } from '@testimonials/ui';
import type { StepType } from '../../models/stepContent';
import { getStepIcon } from '../../models/stepContent';

interface Props {
  open: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select', type: StepType): void;
}>();

interface StepOption {
  type: StepType;
  label: string;
  description: string;
}

const options: StepOption[] = [
  { type: 'welcome', label: 'Welcome', description: 'Introduce your form' },
  { type: 'question', label: 'Question', description: 'Text or video response' },
  { type: 'rating', label: 'Rating', description: 'Star or scale rating' },
  { type: 'consent', label: 'Consent', description: 'Public/private choice' },
  { type: 'contact_info', label: 'Contact Info', description: 'Name, email, company' },
  { type: 'reward', label: 'Reward', description: 'Coupon or download' },
  { type: 'thank_you', label: 'Thank You', description: 'Confirmation message' },
];

function handleSelect(type: StepType) {
  emit('select', type);
  emit('update:open', false);
}
</script>

<template>
  <Popover :open="open" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent class="w-64 p-2" side="right" align="start">
      <div class="text-sm font-medium mb-2 px-2">Add Step</div>
      <div class="space-y-1">
        <button
          v-for="option in options"
          :key="option.type"
          class="w-full flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
          @click="handleSelect(option.type)"
        >
          <span class="text-lg">{{ getStepIcon(option.type) }}</span>
          <div>
            <div class="text-sm font-medium">{{ option.label }}</div>
            <div class="text-xs text-muted-foreground">{{ option.description }}</div>
          </div>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
```

**Acceptance Criteria**:
- [ ] Shows all 7 step types
- [ ] Each option has icon, label, description
- [ ] Closes on selection
- [ ] Under 80 lines

---

### G4: Create StepsSidebar.vue
**Priority**: High
**Depends On**: G1, G2, G3, Y4/Y5 (composables)
**Blocks**: G9

Container component that assembles the sidebar.

**File**: `apps/web/src/features/createForm/ui/stepsSidebar/StepsSidebar.vue`

```vue
<script setup lang="ts">
import { ref, inject } from 'vue';
import { Icon } from '@testimonials/icons';
import StepThumbnail from './StepThumbnail.vue';
import InsertStepButton from './InsertStepButton.vue';
import StepTypePicker from './StepTypePicker.vue';
import type { TimelineEditorContext } from '../../composables/timeline/useTimelineEditor';
import type { StepType } from '../../models/stepContent';

// Inject editor context from page
const editor = inject<TimelineEditorContext>('timelineEditor')!;

const pickerOpen = ref(false);
const insertAfterIndex = ref<number | null>(null);

function handleInsert(afterIndex: number) {
  insertAfterIndex.value = afterIndex;
  pickerOpen.value = true;
}

function handleAddAtEnd() {
  insertAfterIndex.value = null;
  pickerOpen.value = true;
}

function handleSelectType(type: StepType) {
  editor.handleAddStep(type, insertAfterIndex.value ?? undefined);
  pickerOpen.value = false;
}
</script>

<template>
  <div class="flex flex-col h-full py-4">
    <!-- Header -->
    <div class="px-2 mb-4">
      <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Steps
      </span>
    </div>

    <!-- Step list -->
    <div class="flex-1 overflow-y-auto px-2 space-y-1">
      <template v-for="(step, index) in editor.steps.value" :key="step.id">
        <!-- Step thumbnail -->
        <StepThumbnail
          :step="step"
          :index="index"
          :is-selected="index === editor.selectedIndex.value"
          :is-modified="step.isModified"
          @select="editor.selectStep(index)"
        />

        <!-- Insert button between steps -->
        <InsertStepButton
          v-if="index < editor.steps.value.length - 1"
          :after-index="index"
          @insert="handleInsert(index)"
        />
      </template>
    </div>

    <!-- Add button at bottom -->
    <div class="px-2 mt-4">
      <StepTypePicker
        v-model:open="pickerOpen"
        @select="handleSelectType"
      >
        <button
          class="w-14 h-14 mx-auto flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
          @click="handleAddAtEnd"
        >
          <Icon name="plus" class="w-5 h-5 text-muted-foreground" />
          <span class="text-[10px] text-muted-foreground mt-1">Add</span>
        </button>
      </StepTypePicker>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows all steps as thumbnails
- [ ] Insert buttons appear between steps
- [ ] Add button at bottom opens picker
- [ ] Selection syncs with editor context
- [ ] Under 100 lines

---

### G5: Create TimelineConnector.vue
**Priority**: Medium
**Depends On**: None
**Blocks**: G8

Create the vertical line and connection dot between step cards.

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/TimelineConnector.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';

interface Props {
  afterIndex: number;
  showInsert?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showInsert: true,
});

const emit = defineEmits<{
  (e: 'insert'): void;
}>();

const isHovered = ref(false);
</script>

<template>
  <div
    class="flex flex-col items-center py-2"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Top line -->
    <div class="w-0.5 h-4 bg-border" />

    <!-- Connection dot / Insert button -->
    <div class="relative">
      <!-- Default dot -->
      <div
        v-if="!isHovered || !showInsert"
        class="w-2 h-2 rounded-full bg-border"
      />

      <!-- Insert button on hover -->
      <Transition
        enter-active-class="transition-all duration-150"
        enter-from-class="opacity-0 scale-75"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-75"
      >
        <button
          v-if="isHovered && showInsert"
          class="absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 border-dashed border-primary/50 bg-background hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
          @click="emit('insert')"
        >
          <Icon name="plus" class="w-3 h-3 text-primary" />
        </button>
      </Transition>
    </div>

    <!-- Bottom line -->
    <div class="w-0.5 h-4 bg-border" />
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows vertical line with dot
- [ ] Dot becomes insert button on hover
- [ ] Smooth transition
- [ ] Under 60 lines

---

### G6: Create StepCard.vue Base Component
**Priority**: High
**Depends On**: Y1 (types)
**Blocks**: G7, G8

Create the base card wrapper that step card variants use.

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/StepCard.vue`

```vue
<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

interface Props {
  isSelected: boolean;
  stepNumber: number;
  stepType: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'reorder', direction: 'up' | 'down'): void;
}>();
</script>

<template>
  <div
    class="max-w-lg mx-auto rounded-xl border bg-background shadow-sm transition-all cursor-pointer"
    :class="{
      'ring-2 ring-primary border-primary': isSelected,
      'hover:border-primary/50 hover:shadow-md': !isSelected,
    }"
    @click="emit('select')"
  >
    <!-- Card content (slot for variants) -->
    <div class="p-6">
      <slot />
    </div>

    <!-- Card footer with actions -->
    <div class="flex items-center justify-between px-4 py-3 border-t bg-muted/30 rounded-b-xl">
      <Button variant="ghost" size="sm" @click.stop="emit('edit')">
        <Icon name="pencil" class="mr-2 h-4 w-4" />
        Edit Content
      </Button>

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click.stop="emit('reorder', 'up')"
        >
          <Icon name="chevron-up" class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click.stop="emit('reorder', 'down')"
        >
          <Icon name="chevron-down" class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-destructive hover:text-destructive"
          @click.stop="emit('delete')"
        >
          <Icon name="trash-2" class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Selected state has ring
- [ ] Footer has Edit, reorder, delete buttons
- [ ] Slot for variant content
- [ ] Under 80 lines

---

### G7: Create Step Card Variants
**Priority**: High
**Depends On**: G6, Y1 (types)
**Blocks**: G8

Create preview cards for each step type.

#### G7a: WelcomeStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/WelcomeStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@testimonials/ui';
import type { FormStep, WelcomeContent } from '../../../models/stepContent';
import { isWelcomeStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): WelcomeContent => {
  if (isWelcomeStep(props.step)) {
    return props.step.content;
  }
  return { title: '', subtitle: '', buttonText: 'Get Started' };
});
</script>

<template>
  <div class="text-center">
    <h2 class="text-xl font-semibold mb-2">
      {{ content.title || 'Welcome' }}
    </h2>
    <p class="text-muted-foreground mb-4">
      {{ content.subtitle || 'Add a subtitle...' }}
    </p>
    <Button>
      {{ content.buttonText || 'Get Started' }}
    </Button>
  </div>
</template>
```

#### G7b: QuestionStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/QuestionStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
  questionText?: string;
  questionType?: string;
}

const props = defineProps<Props>();

// TODO: Fetch question details from form_questions via relationship
const displayText = computed(() => props.questionText || 'Question text...');
const displayType = computed(() => props.questionType || 'text');

const typeIcon = computed(() => {
  switch (displayType.value) {
    case 'rating': return 'star';
    case 'video': return 'video';
    default: return 'message-square';
  }
});
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon :name="typeIcon" class="w-5 h-5 text-primary" />
      </div>
      <div class="flex-1">
        <p class="font-medium">{{ displayText }}</p>
        <p class="text-sm text-muted-foreground mt-1">
          {{ displayType }} response
        </p>
      </div>
    </div>

    <!-- Tips preview -->
    <div v-if="step.tips.length > 0" class="mt-4 pl-13">
      <div class="text-xs font-medium text-muted-foreground mb-1">Tips:</div>
      <ul class="text-sm text-muted-foreground space-y-1">
        <li v-for="(tip, i) in step.tips.slice(0, 2)" :key="i" class="flex items-start gap-2">
          <span>💡</span>
          <span>{{ tip }}</span>
        </li>
        <li v-if="step.tips.length > 2" class="text-xs">
          +{{ step.tips.length - 2 }} more
        </li>
      </ul>
    </div>
  </div>
</template>
```

#### G7c: RatingStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/RatingStepCard.vue`

```vue
<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { FormStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
  questionText?: string;
  minValue?: number;
  maxValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  minValue: 1,
  maxValue: 5,
});
</script>

<template>
  <div class="text-center">
    <p class="font-medium mb-4">
      {{ props.questionText || 'How would you rate your experience?' }}
    </p>
    <div class="flex justify-center gap-2">
      <div
        v-for="n in (maxValue - minValue + 1)"
        :key="n"
        class="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted cursor-pointer"
      >
        <Icon name="star" class="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  </div>
</template>
```

#### G7d: ConsentStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/ConsentStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { FormStep, ConsentContent } from '../../../models/stepContent';
import { isConsentStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): ConsentContent | null => {
  if (isConsentStep(props.step)) {
    return props.step.content;
  }
  return null;
});
</script>

<template>
  <div v-if="content">
    <h3 class="font-medium mb-2">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground mb-4">{{ content.description }}</p>
    <div class="space-y-2">
      <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
        <div class="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
        <div>
          <div class="font-medium text-sm">{{ content.options.public.label }}</div>
          <div class="text-xs text-muted-foreground">{{ content.options.public.description }}</div>
        </div>
      </label>
      <label class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
        <div class="w-4 h-4 rounded-full border-2" />
        <div>
          <div class="font-medium text-sm">{{ content.options.private.label }}</div>
          <div class="text-xs text-muted-foreground">{{ content.options.private.description }}</div>
        </div>
      </label>
    </div>
  </div>
</template>
```

#### G7e: ContactInfoStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/ContactInfoStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { FormStep, ContactInfoContent } from '../../../models/stepContent';
import { isContactInfoStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): ContactInfoContent | null => {
  if (isContactInfoStep(props.step)) {
    return props.step.content;
  }
  return null;
});

const fieldLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  photo: 'Photo',
  jobTitle: 'Job Title',
  company: 'Company',
  website: 'Website',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
};
</script>

<template>
  <div v-if="content">
    <h3 class="font-medium mb-2">{{ content.title }}</h3>
    <p v-if="content.subtitle" class="text-sm text-muted-foreground mb-4">
      {{ content.subtitle }}
    </p>
    <div class="space-y-2">
      <div
        v-for="field in content.enabledFields"
        :key="field"
        class="flex items-center gap-2"
      >
        <div class="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span class="text-sm">
          {{ fieldLabels[field] }}
          <span v-if="content.requiredFields.includes(field)" class="text-destructive">*</span>
        </span>
      </div>
    </div>
  </div>
</template>
```

#### G7f: RewardStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/RewardStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, RewardContent } from '../../../models/stepContent';
import { isRewardStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): RewardContent | null => {
  if (isRewardStep(props.step)) {
    return props.step.content;
  }
  return null;
});

const rewardIcon = computed(() => {
  if (!content.value) return 'gift';
  switch (content.value.rewardType) {
    case 'coupon': return 'ticket';
    case 'download': return 'download';
    case 'link': return 'link';
    default: return 'gift';
  }
});
</script>

<template>
  <div v-if="content" class="text-center">
    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
      <Icon :name="rewardIcon" class="w-6 h-6 text-primary" />
    </div>
    <h3 class="font-medium mb-1">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground">{{ content.description }}</p>
    <div v-if="content.couponCode" class="mt-3 p-2 bg-muted rounded-lg font-mono text-sm">
      {{ content.couponCode }}
    </div>
  </div>
</template>
```

#### G7g: ThankYouStepCard.vue

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/stepCards/ThankYouStepCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, ThankYouContent } from '../../../models/stepContent';
import { isThankYouStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): ThankYouContent | null => {
  if (isThankYouStep(props.step)) {
    return props.step.content;
  }
  return null;
});
</script>

<template>
  <div v-if="content" class="text-center">
    <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
      <Icon name="check" class="w-6 h-6 text-emerald-600" />
    </div>
    <h3 class="font-medium mb-1">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground">{{ content.message }}</p>
    <div v-if="content.showSocialShare" class="mt-4 flex justify-center gap-2">
      <Icon name="twitter" class="w-5 h-5 text-muted-foreground" />
      <Icon name="linkedin" class="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] All 7 step card variants created
- [ ] Each uses type guards for content access
- [ ] Each under 80 lines
- [ ] Consistent visual style

---

### G8: Create TimelineCanvas.vue
**Priority**: High
**Depends On**: G5, G6, G7, Y4/Y5 (composables)
**Blocks**: G9

Container component for the scrollable timeline.

**File**: `apps/web/src/features/createForm/ui/timelineCanvas/TimelineCanvas.vue`

```vue
<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import StepCard from './StepCard.vue';
import TimelineConnector from './TimelineConnector.vue';
import WelcomeStepCard from './stepCards/WelcomeStepCard.vue';
import QuestionStepCard from './stepCards/QuestionStepCard.vue';
import RatingStepCard from './stepCards/RatingStepCard.vue';
import ConsentStepCard from './stepCards/ConsentStepCard.vue';
import ContactInfoStepCard from './stepCards/ContactInfoStepCard.vue';
import RewardStepCard from './stepCards/RewardStepCard.vue';
import ThankYouStepCard from './stepCards/ThankYouStepCard.vue';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';
import type { TimelineEditorContext } from '../../composables/timeline/useTimelineEditor';
import type { FormStep, StepType } from '../../models/stepContent';

const editor = inject<TimelineEditorContext>('timelineEditor')!;

const scrollContainer = ref<HTMLElement | null>(null);
const pickerOpen = ref(false);
const insertAfterIndex = ref<number | null>(null);

function handleInsert(afterIndex: number) {
  insertAfterIndex.value = afterIndex;
  pickerOpen.value = true;
}

function handleSelectType(type: StepType) {
  editor.handleAddStep(type, insertAfterIndex.value ?? undefined);
  pickerOpen.value = false;
}

function handleReorder(index: number, direction: 'up' | 'down') {
  const toIndex = direction === 'up' ? index - 1 : index + 1;
  if (toIndex >= 0 && toIndex < editor.steps.value.length) {
    editor.moveStep(index, toIndex);
  }
}

// Scroll to selected step when it changes
watch(() => editor.selectedIndex.value, (index) => {
  const element = scrollContainer.value?.querySelector(`[data-step-index="${index}"]`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const stepCardComponents: Record<string, any> = {
  welcome: WelcomeStepCard,
  question: QuestionStepCard,
  rating: RatingStepCard,
  consent: ConsentStepCard,
  contact_info: ContactInfoStepCard,
  reward: RewardStepCard,
  thank_you: ThankYouStepCard,
};
</script>

<template>
  <div ref="scrollContainer" class="h-full overflow-y-auto py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <template v-for="(step, index) in editor.steps.value" :key="step.id">
        <!-- Step Card -->
        <div :data-step-index="index">
          <StepCard
            :is-selected="index === editor.selectedIndex.value"
            :step-number="index + 1"
            :step-type="step.stepType"
            @select="editor.selectStep(index)"
            @edit="editor.handleEditStep(index)"
            @delete="editor.handleRemoveStep(index)"
            @reorder="handleReorder(index, $event)"
          >
            <component
              :is="stepCardComponents[step.stepType]"
              :step="step"
            />
          </StepCard>
        </div>

        <!-- Connector between steps -->
        <StepTypePicker
          v-if="index < editor.steps.value.length - 1"
          v-model:open="pickerOpen"
          @select="handleSelectType"
        >
          <TimelineConnector
            :after-index="index"
            @insert="handleInsert(index)"
          />
        </StepTypePicker>
      </template>

      <!-- Empty state -->
      <div v-if="editor.steps.value.length === 0" class="text-center py-12">
        <p class="text-muted-foreground mb-4">No steps yet. Add your first step!</p>
      </div>
    </div>
  </div>
</template>
```

**Acceptance Criteria**:
- [ ] Shows all steps with appropriate card variants
- [ ] Connectors appear between steps
- [ ] Insert works via connector
- [ ] Scroll to step on selection
- [ ] Under 120 lines

---

### G9: Integration Testing
**Priority**: Medium
**Depends On**: G8, Y6
**Blocks**: None

Test the full sidebar and canvas integration.

**Tasks**:
- [ ] Verify step selection syncs between sidebar and canvas
- [ ] Test add step flow (sidebar button + connector insert)
- [ ] Test reorder buttons
- [ ] Test delete button
- [ ] Test scroll behavior
- [ ] Verify keyboard navigation works
- [ ] Test with many steps (15+) for performance

---

## Barrel Exports

### ui/stepsSidebar/index.ts

```typescript
export { default as StepsSidebar } from './StepsSidebar.vue';
export { default as StepThumbnail } from './StepThumbnail.vue';
export { default as InsertStepButton } from './InsertStepButton.vue';
export { default as StepTypePicker } from './StepTypePicker.vue';
```

### ui/timelineCanvas/index.ts

```typescript
export { default as TimelineCanvas } from './TimelineCanvas.vue';
export { default as TimelineConnector } from './TimelineConnector.vue';
export { default as StepCard } from './StepCard.vue';

// Step card variants
export { default as WelcomeStepCard } from './stepCards/WelcomeStepCard.vue';
export { default as QuestionStepCard } from './stepCards/QuestionStepCard.vue';
export { default as RatingStepCard } from './stepCards/RatingStepCard.vue';
export { default as ConsentStepCard } from './stepCards/ConsentStepCard.vue';
export { default as ContactInfoStepCard } from './stepCards/ContactInfoStepCard.vue';
export { default as RewardStepCard } from './stepCards/RewardStepCard.vue';
export { default as ThankYouStepCard } from './stepCards/ThankYouStepCard.vue';
```

---

## Development Tips

### Mock Data for Development

Before Yellow completes Y4/Y5, use mock data:

```typescript
// Mock editor context for development
const mockSteps = ref<FormStep[]>([
  {
    id: 'step-1',
    formId: 'form-1',
    stepType: 'welcome',
    stepOrder: 0,
    questionId: null,
    content: { title: 'Welcome!', subtitle: 'Share your experience', buttonText: 'Get Started' },
    tips: [],
    isActive: true,
  },
  {
    id: 'step-2',
    formId: 'form-1',
    stepType: 'question',
    stepOrder: 1,
    questionId: 'q-1',
    content: {},
    tips: ['Be specific', 'Include metrics'],
    isActive: true,
  },
  // ... more steps
]);

const mockEditor = {
  steps: mockSteps,
  selectedIndex: ref(0),
  selectStep: (i: number) => { mockEditor.selectedIndex.value = i; },
  handleEditStep: (i: number) => { console.log('Edit step', i); },
  handleAddStep: (type: StepType) => { console.log('Add step', type); },
  handleRemoveStep: (i: number) => { mockSteps.value.splice(i, 1); },
  moveStep: (from: number, to: number) => { /* ... */ },
};

provide('timelineEditor', mockEditor);
```

### Icons Used

Make sure these icons exist in `@testimonials/icons`:
- `arrow-left`, `plus`, `pencil`, `trash-2`
- `chevron-up`, `chevron-down`
- `star`, `video`, `message-square`
- `check`, `gift`, `ticket`, `download`, `link`
- `twitter`, `linkedin`
