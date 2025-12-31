# Form Creator Flow - Implementation Plan

Version: 1.0
Date: December 31, 2025

---

## Overview

Implement the form creator flow as defined in MVP spec:

**User Flow:** `Sign Up → Create Form → AI Suggests Questions → Customize → Copy Form Link → Share`

**Key Differentiator:** User enters just 2 fields (product name + description), AI generates tailored questions, user customizes, and gets a shareable link in under 2 minutes.

---

## Current State

### Already Built ✓

| Layer | What Exists |
|-------|-------------|
| **Database** | `forms`, `form_questions`, `question_types` (15 seeded), `form_submissions`, `form_question_responses` tables |
| **Form Entity** | `useGetForm`, `useGetForms`, `useCreateForm`, `useUpdateForm` composables |
| **QuestionType Entity** | `useGetQuestionTypes` composable with all 15 types |
| **Pages** | Route scaffolds at `/:org/forms/new`, `/:org/forms/:urlSlug/` |
| **Hasura** | Permissions configured for forms table |

### Needs to Be Built

| Layer | What's Missing |
|-------|----------------|
| **Backend API** | AI question suggestions endpoint |
| **GraphQL** | Form questions CRUD mutations |
| **FormQuestion Entity** | Composables for question management |
| **CreateFormFeature** | Multi-step wizard UI |
| **Shared Components** | Question card, sortable list, form preview |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CREATE FORM WIZARD                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Product Info    →  Step 2: AI Suggestions              │
│  (name + description)       (generated questions)               │
│           ↓                         ↓                           │
│  Step 3: Customize       →  Step 4: Preview & Publish           │
│  (edit/reorder/add)         (shareable link)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  Hasura  │        │  Hono    │        │  OpenAI  │
   │ GraphQL  │        │   API    │        │   API    │
   └──────────┘        └──────────┘        └──────────┘
   Form CRUD           AI Suggestions      GPT-4o-mini
   Question CRUD       Token enhancement   Question gen
```

---

## Backend Tasks

### B1. AI Question Suggestions Endpoint

**File:** `/api/src/routes/ai.ts`

**Endpoint:** `POST /api/ai/suggest-questions`

**Request:**
```json
{
  "product_name": "TaskFlow",
  "product_description": "Project management tool for remote teams"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inferred_context": {
      "industry": "SaaS/B2B",
      "audience": "Remote teams, project managers",
      "tone": "Professional",
      "value_props": ["Collaboration", "Time management"]
    },
    "questions": [
      {
        "question_text": "What was your biggest project management challenge before using TaskFlow?",
        "question_key": "problem_before",
        "question_type_id": "text_long",
        "placeholder": "Describe the challenges you faced...",
        "help_text": "Think about the frustrations or inefficiencies you experienced",
        "is_required": true,
        "display_order": 1
      },
      {
        "question_text": "How has TaskFlow improved your team's workflow?",
        "question_key": "solution_impact",
        "question_type_id": "text_long",
        "placeholder": "Share how things changed after using TaskFlow...",
        "help_text": null,
        "is_required": true,
        "display_order": 2
      },
      {
        "question_text": "What specific results have you achieved?",
        "question_key": "specific_results",
        "question_type_id": "text_long",
        "placeholder": "e.g., hours saved, projects completed faster...",
        "help_text": "Concrete numbers or outcomes help make testimonials more compelling",
        "is_required": true,
        "display_order": 3
      },
      {
        "question_text": "How would you rate your overall experience?",
        "question_key": "rating",
        "question_type_id": "rating_star",
        "placeholder": null,
        "help_text": null,
        "is_required": true,
        "display_order": 4
      },
      {
        "question_text": "Would you recommend TaskFlow to others? Why?",
        "question_key": "recommendation",
        "question_type_id": "text_long",
        "placeholder": "Share why you would (or wouldn't) recommend us...",
        "help_text": null,
        "is_required": false,
        "display_order": 5
      }
    ]
  }
}
```

**Implementation Details:**

```typescript
// Prompt template for GPT-4o-mini
const QUESTION_SUGGESTION_PROMPT = `
Generate 5 testimonial collection questions for this product.

Product: {product_name}
Description: {product_description}

First, infer from the description:
- Industry/category (SaaS, course, ecommerce, service, etc.)
- Target audience (who uses this product)
- Key value propositions (what problems it solves)
- Appropriate tone (professional, casual, technical, friendly)

Then generate questions following these guidelines:
- Question 1: Ask about the problem/challenge BEFORE using the product
- Question 2: Ask about HOW the product helped solve it
- Question 3: Ask about specific RESULTS or outcomes
- Question 4: A rating question (use rating_star type)
- Question 5: Ask for recommendation or additional thoughts

Keep questions conversational and specific to the product context.
Do not use generic placeholder text like "[Product]" - use the actual product name.

Output as JSON with this structure:
{
  "inferred_context": {
    "industry": "string",
    "audience": "string",
    "tone": "string",
    "value_props": ["string"]
  },
  "questions": [
    {
      "question_text": "string",
      "question_key": "snake_case_key",
      "question_type_id": "text_long|text_short|rating_star|rating_nps",
      "placeholder": "string or null",
      "help_text": "string or null",
      "is_required": true|false,
      "display_order": number
    }
  ]
}
`;
```

**Validation:**
- `product_name`: Required, 1-100 characters
- `product_description`: Required, 10-1000 characters
- Rate limit: 10 requests per minute per user

**Error Responses:**
- `400` - Invalid input
- `429` - Rate limit exceeded
- `500` - AI service error

---

### B2. GraphQL Mutations for Form Questions

**Location:** `/db/hasura/metadata/`

Add these operations to Hasura:

#### Create Form Question

```graphql
mutation CreateFormQuestion($input: form_questions_insert_input!) {
  insert_form_questions_one(object: $input) {
    id
    form_id
    question_type_id
    question_key
    question_text
    placeholder
    help_text
    display_order
    is_required
    is_active
    created_at
  }
}
```

#### Create Multiple Form Questions (Batch)

```graphql
mutation CreateFormQuestions($inputs: [form_questions_insert_input!]!) {
  insert_form_questions(objects: $inputs) {
    returning {
      id
      form_id
      question_type_id
      question_key
      question_text
      placeholder
      help_text
      display_order
      is_required
      is_active
      created_at
    }
  }
}
```

#### Update Form Question

```graphql
mutation UpdateFormQuestion($id: String!, $input: form_questions_set_input!) {
  update_form_questions_by_pk(pk_columns: { id: $id }, _set: $input) {
    id
    question_text
    placeholder
    help_text
    display_order
    is_required
    updated_at
  }
}
```

#### Delete Form Question (Soft Delete)

```graphql
mutation DeleteFormQuestion($id: String!) {
  update_form_questions_by_pk(
    pk_columns: { id: $id }
    _set: { is_active: false }
  ) {
    id
    is_active
  }
}
```

#### Reorder Form Questions (Batch Update)

```graphql
mutation ReorderFormQuestions($updates: [form_questions_updates!]!) {
  update_form_questions_many(updates: $updates) {
    returning {
      id
      display_order
    }
  }
}
```

#### Get Form with Questions

```graphql
query GetFormWithQuestions($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    slug
    product_name
    product_description
    settings
    is_active
    organization_id
    created_at
    updated_at
    form_questions(
      where: { is_active: { _eq: true } }
      order_by: { display_order: asc }
    ) {
      id
      question_type_id
      question_key
      question_text
      placeholder
      help_text
      display_order
      is_required
      min_length
      max_length
      min_value
      max_value
      validation_pattern
      question_type {
        id
        unique_name
        name
        category
        input_component
        answer_data_type
      }
    }
  }
}
```

---

### B3. Hasura Permissions for Form Questions

**Table:** `form_questions`

| Role | Select | Insert | Update | Delete |
|------|--------|--------|--------|--------|
| `user` | Own org | Own org | Own org | Soft delete only |
| `anonymous` | Active only (for public forms) | None | None | None |

**Row-level security:**
```yaml
# Select permission for user role
filter:
  organization_id:
    _eq: X-Hasura-Org-Id

# Insert permission for user role
check:
  organization_id:
    _eq: X-Hasura-Org-Id
columns:
  - form_id
  - organization_id
  - question_type_id
  - question_key
  - question_text
  - placeholder
  - help_text
  - display_order
  - is_required
  - min_length
  - max_length
  - min_value
  - max_value
  - validation_pattern
  - allowed_file_types
  - max_file_size_kb
```

---

## Frontend Tasks

### F1. FormQuestion Entity

**Location:** `/apps/web/src/entities/formQuestion/`

**Structure:**
```
formQuestion/
├── index.ts
├── models/
│   ├── index.ts
│   ├── queries.ts
│   └── mutations.ts
├── composables/
│   ├── index.ts
│   ├── queries/
│   │   ├── index.ts
│   │   └── useGetFormQuestions.ts
│   └── mutations/
│       ├── index.ts
│       ├── useCreateFormQuestion.ts
│       ├── useCreateFormQuestions.ts
│       ├── useUpdateFormQuestion.ts
│       ├── useDeleteFormQuestion.ts
│       └── useReorderFormQuestions.ts
└── graphql/
    ├── fragments/
    │   └── FormQuestionBasic.gql
    ├── queries/
    │   └── getFormQuestions.gql
    └── mutations/
        ├── createFormQuestion.gql
        ├── createFormQuestions.gql
        ├── updateFormQuestion.gql
        ├── deleteFormQuestion.gql
        └── reorderFormQuestions.gql
```

**Fragment:**
```graphql
# FormQuestionBasic.gql
fragment FormQuestionBasic on form_questions {
  id
  form_id
  organization_id
  question_type_id
  question_key
  question_text
  placeholder
  help_text
  display_order
  is_required
  min_length
  max_length
  min_value
  max_value
  validation_pattern
  allowed_file_types
  max_file_size_kb
  is_active
  created_at
  updated_at
  question_type {
    id
    unique_name
    name
    category
    input_component
  }
}
```

---

### F2. AI Service Composable

**Location:** `/apps/web/src/shared/api/useAISuggestQuestions.ts`

```typescript
import { ref } from 'vue'
import { useApi } from '@/shared/api'

interface AIQuestion {
  question_text: string
  question_key: string
  question_type_id: string
  placeholder: string | null
  help_text: string | null
  is_required: boolean
  display_order: number
}

interface AIContext {
  industry: string
  audience: string
  tone: string
  value_props: string[]
}

interface AISuggestResponse {
  inferred_context: AIContext
  questions: AIQuestion[]
}

export function useAISuggestQuestions() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function suggestQuestions(
    productName: string,
    productDescription: string
  ): Promise<AISuggestResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AISuggestResponse>(
        '/ai/suggest-questions',
        {
          product_name: productName,
          product_description: productDescription
        }
      )
      return response.data
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    suggestQuestions,
    loading,
    error
  }
}
```

---

### F3. CreateFormFeature

**Location:** `/apps/web/src/features/createForm/`

**Structure:**
```
createForm/
├── index.ts
├── CreateFormFeature.vue          # Main wizard container
├── composables/
│   ├── index.ts
│   ├── useCreateFormWizard.ts     # Wizard state management
│   └── useQuestionEditor.ts       # Question editing logic
└── ui/
    ├── index.ts
    ├── ProductInfoStep.vue        # Step 1: Name + description
    ├── AISuggestionsStep.vue      # Step 2: AI-generated questions
    ├── CustomizeQuestionsStep.vue # Step 3: Edit/reorder/add
    ├── PreviewPublishStep.vue     # Step 4: Preview + link
    ├── QuestionCard.vue           # Single question display/edit
    ├── QuestionList.vue           # Sortable question list
    ├── QuestionTypeSelector.vue   # Type dropdown
    └── FormPreview.vue            # Live form preview
```

---

### F4. Wizard State Management

**File:** `/apps/web/src/features/createForm/composables/useCreateFormWizard.ts`

```typescript
import { ref, computed, reactive } from 'vue'
import type { AIQuestion } from '@/shared/api'

export type WizardStep = 'product-info' | 'ai-suggestions' | 'customize' | 'preview'

interface FormData {
  name: string
  slug: string
  product_name: string
  product_description: string
}

interface QuestionData extends AIQuestion {
  id?: string        // Set after saving
  isNew?: boolean    // True for user-added questions
  isModified?: boolean
}

export function useCreateFormWizard() {
  // Current step
  const currentStep = ref<WizardStep>('product-info')

  // Form data
  const formData = reactive<FormData>({
    name: '',
    slug: '',
    product_name: '',
    product_description: ''
  })

  // Questions (AI-generated + user modifications)
  const questions = ref<QuestionData[]>([])

  // AI inferred context
  const aiContext = ref<{
    industry: string
    audience: string
    tone: string
    value_props: string[]
  } | null>(null)

  // Created form ID (set after Step 1 save)
  const formId = ref<string | null>(null)

  // Step navigation
  const steps: WizardStep[] = ['product-info', 'ai-suggestions', 'customize', 'preview']

  const currentStepIndex = computed(() => steps.indexOf(currentStep.value))
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)

  function nextStep() {
    if (!isLastStep.value) {
      currentStep.value = steps[currentStepIndex.value + 1]
    }
  }

  function prevStep() {
    if (!isFirstStep.value) {
      currentStep.value = steps[currentStepIndex.value - 1]
    }
  }

  function goToStep(step: WizardStep) {
    currentStep.value = step
  }

  // Question management
  function setAIQuestions(aiQuestions: AIQuestion[], context: typeof aiContext.value) {
    questions.value = aiQuestions.map(q => ({ ...q, isNew: false, isModified: false }))
    aiContext.value = context
  }

  function addQuestion(question: Partial<QuestionData>) {
    const newQuestion: QuestionData = {
      question_text: question.question_text || '',
      question_key: question.question_key || `custom_${Date.now()}`,
      question_type_id: question.question_type_id || 'text_long',
      placeholder: question.placeholder || null,
      help_text: question.help_text || null,
      is_required: question.is_required ?? false,
      display_order: questions.value.length + 1,
      isNew: true,
      isModified: false
    }
    questions.value.push(newQuestion)
  }

  function updateQuestion(index: number, updates: Partial<QuestionData>) {
    if (questions.value[index]) {
      Object.assign(questions.value[index], updates, { isModified: true })
    }
  }

  function removeQuestion(index: number) {
    questions.value.splice(index, 1)
    // Reorder remaining questions
    questions.value.forEach((q, i) => {
      q.display_order = i + 1
    })
  }

  function reorderQuestions(fromIndex: number, toIndex: number) {
    const [moved] = questions.value.splice(fromIndex, 1)
    questions.value.splice(toIndex, 0, moved)
    // Update display_order
    questions.value.forEach((q, i) => {
      q.display_order = i + 1
      q.isModified = true
    })
  }

  // Validation
  const canProceedFromProductInfo = computed(() => {
    return formData.product_name.trim().length >= 2 &&
           formData.product_description.trim().length >= 10
  })

  const canProceedFromAISuggestions = computed(() => {
    return questions.value.length > 0
  })

  const canProceedFromCustomize = computed(() => {
    return questions.value.length >= 1 &&
           questions.value.every(q => q.question_text.trim().length > 0)
  })

  return {
    // State
    currentStep,
    formData,
    questions,
    aiContext,
    formId,

    // Navigation
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    currentStepIndex,

    // Questions
    setAIQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,

    // Validation
    canProceedFromProductInfo,
    canProceedFromAISuggestions,
    canProceedFromCustomize
  }
}
```

---

### F5. Step Components

#### Step 1: ProductInfoStep.vue

```vue
<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Tell us about your product</h2>
      <p class="mt-1 text-sm text-gray-500">
        We'll use this to generate tailored questions for collecting testimonials.
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label for="product-name" class="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <Input
          id="product-name"
          v-model="formData.product_name"
          placeholder="e.g., TaskFlow"
          class="mt-1"
        />
      </div>

      <div>
        <label for="product-description" class="block text-sm font-medium text-gray-700">
          Brief Description
        </label>
        <Textarea
          id="product-description"
          v-model="formData.product_description"
          placeholder="e.g., Project management tool for remote teams that helps track tasks, collaborate in real-time, and meet deadlines."
          rows="3"
          class="mt-1"
        />
        <p class="mt-1 text-xs text-gray-400">
          {{ formData.product_description.length }}/1000 characters
        </p>
      </div>
    </div>

    <div class="flex justify-end">
      <Button
        @click="handleContinue"
        :disabled="!canProceed"
      >
        Generate Questions
        <ArrowRightIcon class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
```

#### Step 2: AISuggestionsStep.vue

```vue
<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p class="mt-4 text-sm text-gray-500">Generating tailored questions...</p>
      <p class="text-xs text-gray-400 mt-1">This usually takes a few seconds</p>
    </div>

    <!-- Results -->
    <template v-else>
      <!-- AI Context Display -->
      <div v-if="aiContext" class="bg-blue-50 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-800">AI Analysis</h3>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
            {{ aiContext.industry }}
          </span>
          <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
            {{ aiContext.audience }}
          </span>
          <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
            {{ aiContext.tone }} tone
          </span>
        </div>
      </div>

      <!-- Questions List -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Suggested Questions</h2>
        <p class="mt-1 text-sm text-gray-500">
          Review the AI-generated questions. You can customize them in the next step.
        </p>
      </div>

      <div class="space-y-3">
        <QuestionCard
          v-for="(question, index) in questions"
          :key="index"
          :question="question"
          :index="index"
          readonly
        />
      </div>

      <div class="flex justify-between">
        <Button variant="outline" @click="regenerate">
          <RefreshIcon class="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        <div class="space-x-3">
          <Button variant="outline" @click="prevStep">Back</Button>
          <Button @click="nextStep" :disabled="questions.length === 0">
            Customize Questions
            <ArrowRightIcon class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
```

#### Step 3: CustomizeQuestionsStep.vue

```vue
<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Customize Your Questions</h2>
      <p class="mt-1 text-sm text-gray-500">
        Edit, reorder, or add questions. Drag to reorder.
      </p>
    </div>

    <!-- Sortable Question List -->
    <QuestionList
      :questions="questions"
      @update="updateQuestion"
      @remove="removeQuestion"
      @reorder="reorderQuestions"
    />

    <!-- Add Question Button -->
    <Button variant="outline" @click="showAddQuestion = true">
      <PlusIcon class="mr-2 h-4 w-4" />
      Add Custom Question
    </Button>

    <!-- Add Question Modal -->
    <AddQuestionModal
      v-if="showAddQuestion"
      @add="handleAddQuestion"
      @close="showAddQuestion = false"
    />

    <div class="flex justify-between">
      <Button variant="outline" @click="prevStep">Back</Button>
      <Button @click="handleSaveAndContinue" :disabled="!canProceed || saving">
        {{ saving ? 'Saving...' : 'Preview Form' }}
        <ArrowRightIcon class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
```

#### Step 4: PreviewPublishStep.vue

```vue
<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Preview & Publish</h2>
      <p class="mt-1 text-sm text-gray-500">
        Your form is ready! Preview it and copy the shareable link.
      </p>
    </div>

    <!-- Form Link -->
    <div class="bg-gray-50 rounded-lg p-4">
      <label class="block text-sm font-medium text-gray-700">Shareable Link</label>
      <div class="mt-2 flex">
        <Input
          :model-value="formLink"
          readonly
          class="flex-1 rounded-r-none"
        />
        <Button
          @click="copyLink"
          class="rounded-l-none"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </Button>
      </div>
    </div>

    <!-- Live Preview -->
    <div class="border rounded-lg overflow-hidden">
      <div class="bg-gray-100 px-4 py-2 border-b">
        <span class="text-sm text-gray-500">Form Preview</span>
      </div>
      <div class="p-4 bg-white">
        <FormPreview :form-data="formData" :questions="questions" />
      </div>
    </div>

    <div class="flex justify-between">
      <Button variant="outline" @click="prevStep">Back</Button>
      <div class="space-x-3">
        <Button variant="outline" @click="openPreviewInNewTab">
          <ExternalLinkIcon class="mr-2 h-4 w-4" />
          Open Preview
        </Button>
        <Button @click="finish">
          Done
          <CheckIcon class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
```

---

### F6. Shared UI Components

#### QuestionCard.vue

Displays a single question with edit capabilities.

**Props:**
- `question: QuestionData` - The question object
- `index: number` - Question index
- `readonly: boolean` - If true, no editing allowed
- `questionTypes: QuestionType[]` - Available question types

**Emits:**
- `update(index, updates)` - When question is edited
- `remove(index)` - When delete is clicked

**Features:**
- Inline editing of question text
- Question type selector dropdown
- Required toggle
- Placeholder/help text editing
- Delete button
- Drag handle for reordering

---

#### QuestionList.vue

Sortable list of questions using `@vueuse/integrations/useSortable` or `vuedraggable`.

**Props:**
- `questions: QuestionData[]`
- `questionTypes: QuestionType[]`

**Emits:**
- `update(index, updates)`
- `remove(index)`
- `reorder(fromIndex, toIndex)`

---

#### FormPreview.vue

Live preview of how the form will look to customers.

**Props:**
- `formData: FormData`
- `questions: QuestionData[]`

**Features:**
- Renders each question with appropriate input component
- Shows product name as header
- Mobile-responsive preview
- Matches actual public form styling

---

## Implementation Order

### Phase 1: Backend Foundation (Parallel Track A)

| Order | Task | Estimated Effort |
|-------|------|------------------|
| B1.1 | Create AI route file `/api/src/routes/ai.ts` | Small |
| B1.2 | Implement `POST /ai/suggest-questions` endpoint | Medium |
| B1.3 | Add OpenAI client configuration | Small |
| B1.4 | Add rate limiting middleware | Small |
| B2.1 | Create form_questions GraphQL mutations in Hasura | Medium |
| B2.2 | Create GetFormWithQuestions query | Small |
| B3.1 | Configure Hasura permissions for form_questions | Small |

### Phase 2: Frontend Foundation (Parallel Track B)

| Order | Task | Estimated Effort |
|-------|------|------------------|
| F1.1 | Create FormQuestion entity structure | Small |
| F1.2 | Add GraphQL operations (.gql files) | Small |
| F1.3 | Run codegen, create composables | Medium |
| F2.1 | Create `useAISuggestQuestions` composable | Small |
| F3.1 | Scaffold CreateFormFeature folder structure | Small |

### Phase 3: UI Components (After Phase 2)

| Order | Task | Estimated Effort |
|-------|------|------------------|
| F4.1 | Implement `useCreateFormWizard` composable | Medium |
| F5.1 | Build ProductInfoStep component | Small |
| F5.2 | Build AISuggestionsStep component | Medium |
| F5.3 | Build CustomizeQuestionsStep component | Medium |
| F5.4 | Build PreviewPublishStep component | Medium |
| F6.1 | Build QuestionCard component | Medium |
| F6.2 | Build QuestionList with drag-and-drop | Medium |
| F6.3 | Build FormPreview component | Small |

### Phase 4: Integration (After Phase 1 & 3)

| Order | Task | Estimated Effort |
|-------|------|------------------|
| I1 | Wire up CreateFormFeature to page | Small |
| I2 | Connect AI suggestions to backend | Small |
| I3 | Connect form save to GraphQL mutations | Medium |
| I4 | Test end-to-end flow | Medium |
| I5 | Error handling and edge cases | Medium |

---

## Dependencies Between Tracks

```
Backend Track A                 Frontend Track B
     │                               │
     ▼                               ▼
[B1] AI Endpoint ──────────────► [F2] useAISuggestQuestions
     │                               │
     ▼                               ▼
[B2] GraphQL Mutations ────────► [F1] FormQuestion Entity
     │                               │
     ▼                               ▼
[B3] Permissions ──────────────► [F3-F6] UI Components
                                     │
                                     ▼
                              [Integration Phase]
```

**Critical Path:**
1. Backend AI endpoint must be ready before AISuggestionsStep can be fully tested
2. GraphQL mutations must exist before form saving works
3. UI components can be built with mock data while waiting for backend

---

## Testing Checklist

### Backend Tests
- [ ] AI endpoint returns valid question structure
- [ ] AI endpoint handles missing/invalid inputs
- [ ] Rate limiting works correctly
- [ ] GraphQL mutations create/update/delete questions
- [ ] Permissions block unauthorized access

### Frontend Tests
- [ ] Wizard navigation works correctly
- [ ] Form validation prevents invalid data
- [ ] AI suggestions load and display
- [ ] Questions can be edited/reordered/deleted
- [ ] Form saves correctly to database
- [ ] Shareable link is generated correctly

### E2E Tests
- [ ] Complete flow: create account → create form → get link
- [ ] Form is accessible at shareable link
- [ ] Questions appear in correct order

---

## Open Questions

1. **Slug generation:** Auto-generate from product name or let user choose?
   - Recommendation: Auto-generate with edit option

2. **Draft saving:** Save form as draft between steps or only at the end?
   - Recommendation: Save after Step 1, update after Step 3

3. **Question limits:** Maximum questions per form?
   - Recommendation: 10 for free tier, 20 for paid

4. **Regenerate behavior:** Replace all questions or add to existing?
   - Recommendation: Replace with confirmation dialog

---

## Success Criteria

1. User can create a form in under 2 minutes
2. AI generates relevant, product-specific questions
3. Questions are customizable (edit, reorder, add, remove)
4. Shareable link works immediately after creation
5. No errors or failed states in happy path
