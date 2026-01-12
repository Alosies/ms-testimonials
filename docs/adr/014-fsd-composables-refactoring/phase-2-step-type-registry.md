# Phase 2: Add stepTypeRegistry

## Overview

**Effort:** Low
**Risk:** Low
**Dependencies:** None (can run parallel with Phase 1)

Create a centralized step type configuration registry to fix OCP violations.

---

## Problem Statement

Currently, adding a new step type requires modifying 5+ files:
- `useTimelineStepCrud.ts` - Add case in `createStep()`
- `useStepQuestionService.ts` - Add question creation logic
- UI components - Add rendering case
- `wizardConfig.ts` - Add default content
- Constants - Add to step type lists

This violates the **Open-Closed Principle** (OCP): software should be open for extension but closed for modification.

---

## Solution

Create a `stepTypeRegistry` in the entity layer that centralizes all step type configuration.

---

## Tasks

### Task 2.1: Define Registry Interface

**Goal:** Design the registry type structure

**File:** `apps/web/src/entities/formStep/config/stepTypeRegistry.ts`

```typescript
// Step type configuration interface
export interface StepTypeConfig {
  /** Unique identifier for this step type */
  type: string;

  /** Human-readable label */
  label: string;

  /** Icon name from icon library */
  icon: string;

  /** Whether this step type requires a question */
  requiresQuestion: boolean;

  /** The question type to create (if requiresQuestion is true) */
  defaultQuestionType?: string;

  /** Flow memberships this step can appear in */
  allowedFlows: FlowMembership[];

  /** Default content structure for new steps */
  defaultContent: Record<string, unknown>;

  /** Whether this step type supports branching */
  canBranch: boolean;

  /** Whether multiple of this type are allowed per flow */
  allowMultiple: boolean;

  /** Display order in "Add Step" menu */
  menuOrder: number;

  /** Category for grouping in menu */
  category: 'core' | 'question' | 'flow-control';
}

// Registry type
export type StepTypeRegistry = Map<string, StepTypeConfig>;
```

---

### Task 2.2: Create Initial Registry

**Goal:** Populate registry with current step types

**File:** `apps/web/src/entities/formStep/config/stepTypeRegistry.ts`

```typescript
import type { FlowMembership } from '@/entities/flow';

// ... interface definitions from Task 2.1

// Initialize registry with all current step types
const registry: StepTypeRegistry = new Map();

// Core steps
registry.set('welcome', {
  type: 'welcome',
  label: 'Welcome',
  icon: 'hand-wave',
  requiresQuestion: false,
  allowedFlows: ['shared'],
  defaultContent: {
    title: 'Welcome!',
    subtitle: 'We\'d love to hear about your experience.',
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 1,
  category: 'core',
});

registry.set('thank_you', {
  type: 'thank_you',
  label: 'Thank You',
  icon: 'check-circle',
  requiresQuestion: false,
  allowedFlows: ['shared', 'testimonial', 'improvement'],
  defaultContent: {
    title: 'Thank you!',
    subtitle: 'Your feedback means a lot to us.',
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 100,
  category: 'core',
});

// Question steps
registry.set('question', {
  type: 'question',
  label: 'Question',
  icon: 'message-circle',
  requiresQuestion: true,
  defaultQuestionType: 'long_text',
  allowedFlows: ['shared', 'testimonial', 'improvement'],
  defaultContent: {},
  canBranch: false,
  allowMultiple: true,
  menuOrder: 10,
  category: 'question',
});

registry.set('rating', {
  type: 'rating',
  label: 'Rating',
  icon: 'star',
  requiresQuestion: true,
  defaultQuestionType: 'rating_nps',
  allowedFlows: ['shared'],
  defaultContent: {},
  canBranch: true,
  allowMultiple: false,
  menuOrder: 5,
  category: 'question',
});

// Flow control steps
registry.set('consent', {
  type: 'consent',
  label: 'Consent',
  icon: 'shield-check',
  requiresQuestion: false,
  allowedFlows: ['testimonial'],
  defaultContent: {
    title: 'One last thing...',
    description: 'Would you like us to share your testimonial publicly?',
    options: {
      public: {
        label: 'Yes, share publicly',
        description: 'Your testimonial may be featured on our website',
      },
      private: {
        label: 'Keep it private',
        description: 'Only the team will see your feedback',
      },
    },
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 50,
  category: 'flow-control',
});

// Export frozen registry (immutable after initialization)
export const stepTypeRegistry: Readonly<StepTypeRegistry> = registry;
```

---

### Task 2.3: Create Registry Helper Functions

**Goal:** Provide convenient access functions

**File:** `apps/web/src/entities/formStep/config/stepTypeRegistry.ts` (append)

```typescript
/**
 * Get configuration for a step type
 * @throws Error if step type not found
 */
export function getStepTypeConfig(type: string): StepTypeConfig {
  const config = stepTypeRegistry.get(type);
  if (!config) {
    throw new Error(`Unknown step type: ${type}`);
  }
  return config;
}

/**
 * Get configuration safely (returns undefined if not found)
 */
export function getStepTypeConfigSafe(type: string): StepTypeConfig | undefined {
  return stepTypeRegistry.get(type);
}

/**
 * Check if step type requires a question
 */
export function stepTypeRequiresQuestion(type: string): boolean {
  return getStepTypeConfig(type).requiresQuestion;
}

/**
 * Get default content for a step type
 */
export function getStepTypeDefaultContent(type: string): Record<string, unknown> {
  return structuredClone(getStepTypeConfig(type).defaultContent);
}

/**
 * Get all step types for a given flow membership
 */
export function getStepTypesForFlow(flow: FlowMembership): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .filter(config => config.allowedFlows.includes(flow))
    .sort((a, b) => a.menuOrder - b.menuOrder);
}

/**
 * Get all step types
 */
export function getAllStepTypes(): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .sort((a, b) => a.menuOrder - b.menuOrder);
}

/**
 * Get step types by category
 */
export function getStepTypesByCategory(category: StepTypeConfig['category']): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .filter(config => config.category === category)
    .sort((a, b) => a.menuOrder - b.menuOrder);
}
```

---

### Task 2.4: Export from Entity

**Goal:** Add to entity public API

**File:** `apps/web/src/entities/formStep/index.ts`

```typescript
// Existing exports...

// Add registry exports
export {
  stepTypeRegistry,
  getStepTypeConfig,
  getStepTypeConfigSafe,
  stepTypeRequiresQuestion,
  getStepTypeDefaultContent,
  getStepTypesForFlow,
  getAllStepTypes,
  getStepTypesByCategory,
} from './config/stepTypeRegistry';

export type { StepTypeConfig, StepTypeRegistry } from './config/stepTypeRegistry';
```

---

### Task 2.5: Update Step Creation to Use Registry

**Goal:** Refactor `useTimelineStepCrud` to use registry

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineStepCrud.ts`

**Before:**
```typescript
const createStep = (type: string, flowMembership: FlowMembership) => {
  // Hardcoded switch statement for each type
  switch (type) {
    case 'welcome':
      return { content: { title: 'Welcome!', subtitle: '...' }, ... };
    case 'question':
      // Create question first
      return { ... };
    // ... more cases
  }
};
```

**After:**
```typescript
import {
  getStepTypeConfig,
  getStepTypeDefaultContent,
  stepTypeRequiresQuestion
} from '@/entities/formStep';

const createStep = async (type: string, flowMembership: FlowMembership) => {
  const config = getStepTypeConfig(type);

  // Validate flow membership
  if (!config.allowedFlows.includes(flowMembership)) {
    throw new Error(`Step type "${type}" not allowed in flow "${flowMembership}"`);
  }

  // Create question if needed
  let questionId: string | null = null;
  if (config.requiresQuestion && config.defaultQuestionType) {
    questionId = await createQuestionForStep(config.defaultQuestionType);
  }

  return {
    step_type: type,
    content: getStepTypeDefaultContent(type),
    question_id: questionId,
    flow_membership: flowMembership,
  };
};
```

---

### Task 2.6: Update UI Menu to Use Registry

**Goal:** Generate "Add Step" menu from registry

**File:** Update component that renders step type menu

```typescript
import { getStepTypesForFlow, getStepTypesByCategory } from '@/entities/formStep';

// In component setup
const stepTypesForCurrentFlow = computed(() =>
  getStepTypesForFlow(currentFlowMembership.value)
);

// Or grouped by category
const stepTypesByCategory = computed(() => ({
  core: getStepTypesByCategory('core'),
  question: getStepTypesByCategory('question'),
  flowControl: getStepTypesByCategory('flow-control'),
}));
```

---

### Task 2.7: Run Verification

**Commands:**
```bash
# Type check
pnpm typecheck

# Build
pnpm build

# Test step creation still works
# Manual test: Add a new step in Form Studio
```

---

## Acceptance Criteria

- [ ] `stepTypeRegistry` exists in `entities/formStep/config/`
- [ ] All 5 step types are configured in registry
- [ ] Helper functions are exported from entity
- [ ] At least one consumer uses registry instead of hardcoded switch
- [ ] Adding a new step type only requires adding to registry
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## Future Extension Example

To add a new "Video" step type, developer only adds:

```typescript
registry.set('video', {
  type: 'video',
  label: 'Video Response',
  icon: 'video',
  requiresQuestion: true,
  defaultQuestionType: 'video_upload',
  allowedFlows: ['shared', 'testimonial'],
  defaultContent: {
    maxDuration: 120,
    prompt: 'Record a short video testimonial',
  },
  canBranch: false,
  allowMultiple: true,
  menuOrder: 15,
  category: 'question',
});
```

No other files need modification.

---

## Next Phase

After completion, proceed to: **Phase 3: Create Focused Composables**
