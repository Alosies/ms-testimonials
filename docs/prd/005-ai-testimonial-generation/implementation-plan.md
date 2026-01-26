# PRD-005 Implementation Plan: Testimonial Writing Step

## Overview

Implement the testimonial writing step from PRD-005, enabling customers to create their testimonial after answering guided questions. This includes:
- **Path Selection**: Choose between Manual or AI-Assisted
- **Manual Path**: Write testimonial in a textarea
- **AI-Assisted Path**: Google OAuth → AI generates testimonial → Review/Edit

## Architecture Context

Per ADR-021 (API Service Data Layer):
- API uses OpenAPIHono with Zod schemas in `api/src/shared/schemas/`
- Frontend imports types from `@api/shared/schemas/` (not duplicated)
- Use `createRoute()` pattern for endpoints
- Typed fetch helpers in `apps/web/src/shared/api/rest/`

Per ADR-012 (AI Service Infrastructure):
- AI endpoint: `POST /ai/assemble-testimonial`
- Google OAuth required for AI path (abuse prevention)
- Credit reservation pattern for AI calls

---

## Implementation Phases

### Phase 1: Database Migration

**File**: `db/hasura/migrations/default/{timestamp}__form_steps__add_testimonial_write_step_type/up.sql`

Update CHECK constraint to include `testimonial_write`:

```sql
-- Add testimonial_write step type
ALTER TABLE public.form_steps DROP CONSTRAINT form_steps_step_type_check;
ALTER TABLE public.form_steps ADD CONSTRAINT form_steps_step_type_check
  CHECK (step_type IN ('welcome','question','rating','consent','contact_info','reward','thank_you','testimonial_write'));

COMMENT ON COLUMN public.form_steps.step_type IS
  'Step type enum: welcome, question, rating, consent, contact_info, reward, thank_you, testimonial_write (manual or AI testimonial entry)';
```

**Down migration**:
```sql
DELETE FROM public.form_steps WHERE step_type = 'testimonial_write';

ALTER TABLE public.form_steps DROP CONSTRAINT form_steps_step_type_check;
ALTER TABLE public.form_steps ADD CONSTRAINT form_steps_step_type_check
  CHECK (step_type IN ('welcome','question','rating','consent','contact_info','reward','thank_you'));
```

**Skill**: Use `hasura-migrations` skill for proper naming convention.

---

### Phase 2: Step Schema & Types

#### 2.1 Create TestimonialWriteContent Schema

**File**: `apps/web/src/entities/formStep/schemas/testimonialWriteContent.schema.ts` (NEW)

```typescript
import { z } from 'zod';

/**
 * Testimonial Write Step Content Schema
 *
 * Validates the JSONB content for testimonial_write step type.
 * This step allows customers to write their testimonial manually or use AI assistance.
 */
export const TestimonialWriteContentSchema = z.object({
  // Path selection
  enableAIPath: z.boolean().default(true),

  // Manual path config
  title: z.string().default('Share your testimonial'),
  subtitle: z.string().default('Write your experience in your own words'),
  placeholder: z.string().default('Describe how our product helped you...'),
  minLength: z.number().int().min(0).default(50),
  maxLength: z.number().int().min(1).default(1000),

  // Previous answers reference
  showPreviousAnswers: z.boolean().default(true),
  previousAnswersLabel: z.string().default('Your responses for reference'),

  // AI path labels
  aiPathTitle: z.string().default('Let AI craft your story'),
  aiPathDescription: z.string().default('We\'ll transform your answers into a testimonial. You review and edit before submit.'),
  manualPathTitle: z.string().default('Write it yourself'),
  manualPathDescription: z.string().default('Write your own testimonial in your words.'),
});

export type TestimonialWriteContent = z.infer<typeof TestimonialWriteContentSchema>;

export const defaultTestimonialWriteContent: TestimonialWriteContent = {
  enableAIPath: true,
  title: 'Share your testimonial',
  subtitle: 'Write your experience in your own words',
  placeholder: 'Describe how our product helped you...',
  minLength: 50,
  maxLength: 1000,
  showPreviousAnswers: true,
  previousAnswersLabel: 'Your responses for reference',
  aiPathTitle: 'Let AI craft your story',
  aiPathDescription: 'We\'ll transform your answers into a testimonial. You review and edit before submit.',
  manualPathTitle: 'Write it yourself',
  manualPathDescription: 'Write your own testimonial in your words.',
};
```

#### 2.2 Update stepContent.schema.ts

**File**: `apps/web/src/entities/formStep/schemas/stepContent.schema.ts`

Changes:
- Import new schema and types
- Add `'testimonial_write'` to `StepType` union
- Add `TestimonialWriteContent` to `StepContent` union
- Add entry to `stepContentSchemas` map
- Add entry to `defaultContentByType` map
- Re-export schema and defaults

---

### Phase 3: Path Selection Component

**File**: `apps/web/src/shared/stepCards/ui/TestimonialPathSelector.vue` (NEW)

Two-card layout for path selection:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { TestimonialWriteContent } from '@/entities/formStep';

interface Props {
  content: TestimonialWriteContent;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [path: 'manual' | 'ai'];
  googleAuth: [];
}>();

const handleAISelect = () => {
  emit('googleAuth');
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-gray-900">How would you like to share?</h3>
      <p class="text-gray-600 mt-2">Choose how you'd like to create your testimonial</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Manual Path Card -->
      <button
        class="p-6 border-2 rounded-xl text-left hover:border-primary transition-colors"
        @click="emit('select', 'manual')"
      >
        <div class="text-lg font-semibold text-gray-900">{{ content.manualPathTitle }}</div>
        <p class="text-gray-600 mt-1">{{ content.manualPathDescription }}</p>
      </button>

      <!-- AI-Assisted Path Card -->
      <button
        v-if="content.enableAIPath"
        class="p-6 border-2 border-primary/50 rounded-xl text-left bg-primary/5 hover:border-primary transition-colors"
        @click="handleAISelect"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold text-gray-900">{{ content.aiPathTitle }}</span>
          <span class="px-2 py-0.5 text-xs bg-primary text-white rounded">Recommended</span>
        </div>
        <p class="text-gray-600 mt-1">{{ content.aiPathDescription }}</p>
        <p class="text-sm text-gray-500 mt-2">Requires Google sign-in</p>
      </button>
    </div>
  </div>
</template>
```

---

### Phase 4: Manual Path Component

**File**: `apps/web/src/shared/stepCards/ui/TestimonialWriteStepCard.vue` (NEW)

Features:
- Textarea with v-model binding via `defineModel<string>()`
- Character count with min/max validation
- Collapsible previous answers section
- Props: `step`, `mode`, `previousAnswers`

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Textarea } from '@testimonials/ui';
import type { FormStep, TestimonialWriteContent, StepCardMode } from '../models';
import { isTestimonialWriteStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  previousAnswers?: Array<{ question: string; answer: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  previousAnswers: () => [],
});

const modelValue = defineModel<string>({ default: '' });

const content = computed((): TestimonialWriteContent | null => {
  if (isTestimonialWriteStep(props.step)) {
    return props.step.content;
  }
  return null;
});

const characterCount = computed(() => modelValue.value.length);
const isUnderMinimum = computed(() =>
  content.value && characterCount.value < content.value.minLength
);
const isOverMaximum = computed(() =>
  content.value && characterCount.value > content.value.maxLength
);
const isValid = computed(() =>
  content.value &&
  characterCount.value >= content.value.minLength &&
  characterCount.value <= content.value.maxLength
);

const showPreviousAnswers = computed(() =>
  content.value?.showPreviousAnswers &&
  props.previousAnswers.length > 0 &&
  props.mode === 'preview'
);
</script>

<template>
  <div v-if="content" class="w-full max-w-2xl mx-auto">
    <!-- Title and subtitle -->
    <div class="text-center mb-6">
      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        {{ content.title }}
      </h3>
      <p class="text-gray-600">{{ content.subtitle }}</p>
    </div>

    <!-- Previous answers reference (collapsible) -->
    <div
      v-if="showPreviousAnswers"
      class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      <details class="group">
        <summary class="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
          <span class="transition-transform group-open:rotate-90">▶</span>
          {{ content.previousAnswersLabel }}
        </summary>
        <div class="mt-3 space-y-3 pl-4">
          <div
            v-for="(item, index) in previousAnswers"
            :key="index"
            class="text-sm"
          >
            <p class="font-medium text-gray-600">{{ item.question }}</p>
            <p class="text-gray-800 mt-0.5">{{ item.answer }}</p>
          </div>
        </div>
      </details>
    </div>

    <!-- Testimonial textarea -->
    <div class="space-y-2">
      <Textarea
        v-model="modelValue"
        :placeholder="content.placeholder"
        :disabled="mode === 'edit'"
        class="min-h-[200px] w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50/50 px-5 py-4 text-base leading-relaxed shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-primary focus:bg-white focus:shadow-md focus:ring-4 focus:ring-primary/10 disabled:bg-gray-100 disabled:opacity-60"
        :class="{
          'border-red-300 focus:border-red-500': isOverMaximum,
          'border-amber-300': isUnderMinimum && characterCount > 0,
        }"
        data-testid="testimonial-write-textarea"
      />

      <!-- Character count -->
      <div class="flex justify-between text-sm">
        <span
          :class="{
            'text-red-500': isOverMaximum,
            'text-amber-500': isUnderMinimum && characterCount > 0,
            'text-gray-400': !isUnderMinimum && !isOverMaximum,
          }"
        >
          {{ characterCount }} / {{ content.maxLength }} characters
        </span>
        <span v-if="content.minLength > 0" class="text-gray-400">
          Minimum: {{ content.minLength }}
        </span>
      </div>
    </div>
  </div>
</template>
```

---

### Phase 5: AI Review Component

**File**: `apps/web/src/shared/stepCards/ui/TestimonialReviewStepCard.vue` (NEW)

Features:
- Display AI-generated testimonial
- Edit button to switch to editing mode
- Suggestion chips (Make it briefer, More enthusiastic, etc.)
- Regenerate button (limited to 3)
- Accept button

---

### Phase 6: API Endpoint - Assemble Testimonial

**Skill**: Use `api-creator` skill patterns.

#### 6.1 Create Zod Schema

**File**: `api/src/shared/schemas/testimonial.ts` (NEW)

```typescript
import { z } from '@hono/zod-openapi';

// Request schema
export const AssembleTestimonialRequestSchema = z.object({
  form_id: z.string().min(1).openapi({
    description: 'ID of the form being submitted',
    example: 'form_abc123',
  }),
  answers: z.array(z.object({
    question_text: z.string().openapi({
      description: 'The question text shown to the customer',
    }),
    question_key: z.string().openapi({
      description: 'Key identifying the question (e.g., problem, solution, result)',
    }),
    answer: z.string().openapi({
      description: 'Customer\'s answer to the question',
    }),
  })).min(1).openapi({
    description: 'Array of Q&A pairs from the form',
  }),
  rating: z.number().int().min(1).max(5).optional().openapi({
    description: 'Star rating 1-5 if provided',
  }),
  quality: z.enum(['fast', 'enhanced', 'premium']).default('enhanced').openapi({
    description: 'AI quality tier - affects output quality and credit cost',
  }),
  modification: z.object({
    type: z.enum(['suggestion']),
    suggestion_id: z.string(),
    previous_testimonial: z.string(),
  }).optional().openapi({
    description: 'For applying suggestions to regenerate',
  }),
}).openapi('AssembleTestimonialRequest');

// Suggestion schema
export const TestimonialSuggestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  applicability: z.number().min(0).max(1).openapi({
    description: 'How applicable this suggestion is (0-1)',
  }),
});

// Tone metadata schema
export const ToneMetadataSchema = z.object({
  formality: z.enum(['formal', 'neutral', 'casual']),
  energy: z.enum(['enthusiastic', 'neutral', 'reserved']),
  confidence: z.enum(['assertive', 'neutral', 'humble']),
});

// Response schema
export const AssembleTestimonialResponseSchema = z.object({
  testimonial: z.string().openapi({
    description: 'The AI-generated testimonial text',
  }),
  suggestions: z.array(TestimonialSuggestionSchema).openapi({
    description: 'Available modifications the customer can apply',
  }),
  metadata: z.object({
    word_count: z.number().int(),
    reading_time_seconds: z.number(),
    tone: ToneMetadataSchema,
    key_themes: z.array(z.string()),
  }),
}).openapi('AssembleTestimonialResponse');

// Export inferred types
export type AssembleTestimonialRequest = z.infer<typeof AssembleTestimonialRequestSchema>;
export type AssembleTestimonialResponse = z.infer<typeof AssembleTestimonialResponseSchema>;
export type TestimonialSuggestion = z.infer<typeof TestimonialSuggestionSchema>;
export type ToneMetadata = z.infer<typeof ToneMetadataSchema>;
```

#### 6.2 Create Route

**File**: `api/src/routes/ai.ts` (UPDATE existing)

Add new route using `createRoute()`:

```typescript
import {
  AssembleTestimonialRequestSchema,
  AssembleTestimonialResponseSchema,
} from '@/shared/schemas/testimonial';
import { assembleTestimonial } from '@/features/ai/assembleTestimonial';

const assembleTestimonialRoute = createRoute({
  method: 'post',
  path: '/assemble-testimonial',
  tags: ['AI'],
  summary: 'Assemble testimonial from Q&A responses',
  description: 'Transforms customer Q&A responses into a coherent first-person testimonial using AI.',
  request: {
    body: {
      content: {
        'application/json': { schema: AssembleTestimonialRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: AssembleTestimonialResponseSchema },
      },
      description: 'Testimonial generated successfully',
    },
    400: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Invalid request - form not found or inactive',
    },
    429: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Rate limited - too many requests',
    },
  },
});

ai.openapi(assembleTestimonialRoute, async (c) => {
  const body = c.req.valid('json');
  const result = await assembleTestimonial(body);
  return c.json(result);
});
```

#### 6.3 Implement Handler

**File**: `api/src/features/ai/assembleTestimonial/index.ts` (NEW)

Following existing `suggestQuestions` pattern:
- Validate form exists and is active
- Get product_name from form (not from request)
- Build prompt with XML-wrapped answers
- Call AI provider with fallback
- Parse and validate response
- Return testimonial + suggestions

---

### Phase 7: Frontend API Integration

**File**: `apps/web/src/features/publicForm/api/useApiForTestimonial.ts` (NEW)

```typescript
import { useApi } from '@/shared/api/rest';
import type {
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from '@api/shared/schemas/testimonial';

export function useApiForTestimonial() {
  const api = useApi();

  async function assembleTestimonial(
    request: AssembleTestimonialRequest
  ): Promise<AssembleTestimonialResponse> {
    return api.post<AssembleTestimonialRequest, AssembleTestimonialResponse>(
      '/ai/assemble-testimonial',
      request
    );
  }

  return { assembleTestimonial };
}
```

---

### Phase 8: Flow Integration

**File**: `apps/web/src/features/publicForm/ui/PublicFormFlow.vue` (UPDATE)

Changes:
1. Import new step card components
2. Add to `stepCardComponents` map
3. Add computed for detecting `testimonial_write` step
4. Add state for selected path (`manual` | `ai` | `null`)
5. Add state for AI generation (`generating`, `generated`, `error`)
6. Add computed for `previousAnswersForReference`
7. Handle path-specific rendering:
   - No path selected → TestimonialPathSelector
   - Manual path → TestimonialWriteStepCard
   - AI path + generating → Loading state
   - AI path + generated → TestimonialReviewStepCard

---

### Phase 9: Google OAuth for Customers (AI Path)

**File**: `apps/web/src/features/publicForm/composables/useCustomerGoogleAuth.ts` (NEW)

Lightweight auth for customers (not full account creation):
- Initialize Google Sign-In SDK
- Handle OAuth callback
- Store token in session (not localStorage)
- Return google_id for API calls

---

## Critical Files Summary

| File | Action | Skill |
|------|--------|-------|
| `db/hasura/migrations/.../up.sql` | CREATE | hasura-migrations |
| `entities/formStep/schemas/testimonialWriteContent.schema.ts` | CREATE | - |
| `entities/formStep/schemas/stepContent.schema.ts` | EDIT | - |
| `entities/formStep/schemas/index.ts` | EDIT | - |
| `shared/stepCards/ui/TestimonialPathSelector.vue` | CREATE | - |
| `shared/stepCards/ui/TestimonialWriteStepCard.vue` | CREATE | - |
| `shared/stepCards/ui/TestimonialReviewStepCard.vue` | CREATE | - |
| `shared/stepCards/ui/index.ts` | EDIT | - |
| `shared/stepCards/functions/typeGuards.ts` | EDIT | - |
| `api/src/shared/schemas/testimonial.ts` | CREATE | api-creator |
| `api/src/routes/ai.ts` | EDIT | api-creator |
| `api/src/features/ai/assembleTestimonial/index.ts` | CREATE | - |
| `features/publicForm/ui/PublicFormFlow.vue` | EDIT | - |
| `features/publicForm/api/useApiForTestimonial.ts` | CREATE | - |
| `features/publicForm/composables/useCustomerGoogleAuth.ts` | CREATE | - |

---

## Data Flow

```
Customer answers questions → responses stored by step ID
         ↓
Reaches testimonial_write step
         ↓
Path Selection UI shown
         ↓
┌────────────────────────────────────────────────────┐
│                                                    │
│  MANUAL PATH                    AI-ASSISTED PATH   │
│  ────────────                   ─────────────────  │
│  1. Show textarea               1. Google OAuth    │
│  2. Customer writes             2. API call        │
│  3. Store in responses          3. Show review UI  │
│                                 4. Edit/Regenerate │
│                                 5. Accept          │
│                                 6. Store in resp.  │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
Submit → API maps testimonial_write response to testimonials.content
```

---

## Verification Checklist

1. **Schema validation**: `pnpm typecheck` - no errors in api and web
2. **Migration**: `hasura migrate apply --database-name default`
3. **API**: Test `/ai/assemble-testimonial` in Swagger UI at `/docs`
4. **Visual test**: Navigate public form flow
   - Path selection appears after rating step (in testimonial flow)
   - Manual path: textarea works, character count, validation
   - AI path: Google OAuth flow, generation, suggestions, editing
5. **Persistence**: Responses saved in localStorage during flow
6. **Submit**: Testimonial content flows to `testimonials.content` on form submit

---

## Implementation Order

| Order | Phase | Description | Can Test Independently |
|-------|-------|-------------|----------------------|
| 1 | Phase 1 | Database migration | Yes (migration status) |
| 2 | Phase 2 | Step schema | Yes (typecheck) |
| 3 | Phase 4 | Manual path component | Yes (Storybook) |
| 4 | Phase 3 | Path selector | Yes (Storybook) |
| 5 | Phase 8 | Flow integration (manual) | Yes (public form) |
| 6 | Phase 6 | API endpoint | Yes (Swagger) |
| 7 | Phase 7 | Frontend API integration | Yes (dev tools) |
| 8 | Phase 5 | AI review component | Yes (Storybook) |
| 9 | Phase 9 | Google OAuth | Yes (auth flow) |
| 10 | Phase 8 | Complete flow (AI path) | Yes (E2E test) |

This order allows incremental testing - manual path works first, then AI path is added.

---

## References

- [PRD-005: AI Testimonial Generation](./prd.md)
- [ADR-012: AI Service Infrastructure](../../adr/012-ai-service-infrastructure.md)
- [ADR-021: API Service Data Layer](../../adr/021-api-service-data-layer-architecture/adr.md)
- [Testimonial Question Framework](../../testimonial-question-framework.md)
- [AI Input Security](../../security/ai-input-security.md)
