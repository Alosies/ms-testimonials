# Validation Module

Quick reference for form validation using **VeeValidate + Zod**.

## Overview

This module provides type-safe form validation with:
- **Zod schemas** for validation rules and TypeScript inference
- **VeeValidate composables** for form state management
- **Multi-step form support** for guided flows like Smart Prompts

---

## Quick Start

### Basic Form with Schema

```typescript
import { useTypedForm, z, emailSchema, nameSchema } from '@/shared/validation'

// Define schema
const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Create form
const { values, errors, handleSubmit, isValid } = useTypedForm({
  schema,
  initialValues: { name: '', email: '', message: '' },
})

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  await api.submit(formValues)
})
```

### Using Fields in Templates

```vue
<script setup lang="ts">
import { useTypedForm, useTypedField, z } from '@/shared/validation'

const schema = z.object({
  email: z.string().email(),
})

const { handleSubmit } = useTypedForm({ schema })
const { value: email, errorMessage, hasError } = useTypedField<string>('email')
</script>

<template>
  <form @submit="handleSubmit(onSubmit)">
    <Input v-model="email" :invalid="hasError" />
    <span v-if="errorMessage">{{ errorMessage }}</span>
  </form>
</template>
```

---

## Composables Reference

### `useTypedForm<TSchema>`

Creates a form with Zod schema validation.

```typescript
const {
  // State
  values,           // Reactive form values
  errors,           // Field errors object
  meta,             // Form metadata (dirty, touched, valid)
  isSubmitting,     // Submission in progress
  isValidating,     // Validation in progress

  // Computed
  isValid,          // All fields valid
  isDirty,          // Any field changed
  isTouched,        // Any field touched

  // Actions
  handleSubmit,     // Wrap submit handler
  validate,         // Validate entire form
  validateField,    // Validate single field
  resetForm,        // Reset to initial values
  setFieldValue,    // Set field value programmatically
  setFieldError,    // Set field error manually
  setErrors,        // Set multiple errors
  setValues,        // Set multiple values
} = useTypedForm({
  schema: myZodSchema,
  initialValues: { ... },
  validateOnMount: false,  // Optional
})
```

### `useTypedField<TValue>`

Creates a single field with validation.

```typescript
const {
  value,            // v-model compatible ref
  errorMessage,     // First error message
  errors,           // All error messages
  meta,             // Field metadata

  // Computed
  isValid,
  isDirty,
  isTouched,
  hasError,

  // Actions
  validate,
  resetField,
  setValue,
  setTouched,
  setErrors,

  // Template helpers
  attrs,            // Spread on input: { name, aria-invalid, aria-describedby }
} = useTypedField<string>('fieldName')
```

### `useTypedFieldArray<TValue>`

Manages dynamic field arrays.

```typescript
const {
  fields,           // Array of { key, value, ... }
  push,             // Add item at end
  remove,           // Remove by index
  insert,           // Insert at index
  update,           // Update at index
  replace,          // Replace entire array
  prepend,          // Add at start
  move,             // Move item
  swap,             // Swap two items
} = useTypedFieldArray<{ email: string }>('invitations')
```

### `useMultiStepForm`

Generic multi-step form navigation.

```typescript
const {
  currentStep,      // Current step name
  currentStepIndex, // Current step index (0-based)
  steps,            // All step names
  totalSteps,       // Number of steps
  progress,         // Completion percentage (0-100)
  isFirstStep,
  isLastStep,

  goToStep,         // Navigate to step by name or index
  nextStep,         // Go to next step
  previousStep,     // Go to previous step
  validateCurrentStep,  // Validate current step fields
} = useMultiStepForm({
  steps: ['step1', 'step2', 'step3'],
  stepSchemas: {
    step1: schema1,
    step2: schema2,
    step3: schema3,
  },
  onStepChange: (from, to) => { ... },  // Optional callback
})
```

### `useSmartPromptForm`

Pre-configured 4-step testimonial collection form.

```typescript
const {
  // Form
  form,
  values,
  errors,

  // Multi-step
  currentStep,      // 'problem' | 'solution' | 'result' | 'attribution'
  currentStepIndex,
  steps,
  totalSteps,       // 4
  progress,
  isFirstStep,
  isLastStep,

  // Step info
  stepMeta,         // { title, description, placeholder } for current step
  stepMetadata,     // All step metadata

  // Navigation
  nextStep,         // Validates before proceeding, returns Promise<boolean>
  previousStep,
  goToStep,
  canProceed,       // Current step is valid
  validateCurrentStep,

  // Submit
  handleSubmit,
  resetForm,

  // Preview
  testimonialPreview,  // Combined problem + solution + result text

  // State
  isSubmitting,
  isValidating,
} = useSmartPromptForm({
  initialValues: { ... },  // Optional
  onSubmit: async (values) => { ... },
  onStepChange: (from, to) => { ... },  // Optional
})
```

### `useAsyncValidation`

Debounced async validation (e.g., checking slug availability).

```typescript
const {
  validate,         // Trigger validation
  reset,            // Clear state
  isValidating,     // Loading state
  error,            // Error message or null
} = useAsyncValidation({
  validate: async (value: string) => {
    const available = await checkSlugAvailability(value)
    return available ? true : 'Slug is already taken'
  },
  debounceMs: 300,  // Default: 300
})

// Usage
watch(slug, async (newSlug) => {
  const isValid = await validate(newSlug)
})
```

---

## Schemas Reference

### Common Schemas

```typescript
import {
  // Strings
  nonEmptyString,       // Required, trimmed
  nameSchema,           // 2-100 chars
  optionalNameSchema,   // Optional name
  emailSchema,          // Valid email
  optionalEmailSchema,  // Optional email
  urlSchema,            // Valid URL
  optionalUrlSchema,    // Optional URL
  slugSchema,           // URL-safe slug (3-50 chars)
  nanoIdSchema,         // 12-char ID

  // Numbers
  ratingSchema,         // 1-5 integer
  optionalRatingSchema,

  // Boolean
  consentSchema,        // Must be true

  // Helpers
  textWithMinLength(10, 'Field name'),
  textWithLength(10, 500, 'Field name'),
} from '@/shared/validation'
```

### Testimonial Schemas

```typescript
import {
  // Step schemas
  problemStepSchema,
  solutionStepSchema,
  resultStepSchema,
  attributionStepSchema,

  // Complete schemas
  smartPromptFormSchema,      // All steps combined
  directTestimonialSchema,    // Simple testimonial
  testimonialReviewSchema,    // Admin approval

  // Step map
  smartPromptStepSchemas,     // { problem, solution, result, attribution }
} from '@/shared/validation'

// Types are auto-inferred
import type {
  SmartPromptFormValues,
  ProblemStepValues,
  SolutionStepValues,
  ResultStepValues,
  AttributionStepValues,
  DirectTestimonialValues,
  TestimonialReviewValues,
  SmartPromptStepName,
} from '@/shared/validation'
```

---

## Custom Rules Reference

```typescript
import {
  // Content
  noProfanity(),
  noHtml(),
  stripHtml(),
  minWords(5),

  // URLs
  urlWithDomain(['example.com', 'trusted.com']),
  imageUrl(),

  // Identifiers
  slug({ minLength: 3, maxLength: 50 }),
  toSlug(),  // Transform to slug format

  // Phone
  phoneNumber(),
  optionalPhoneNumber(),

  // Dates
  isoDate(),
  futureDate(),
  pastDate(),

  // Other
  hexColor(),
  jsonString(),
  parseJson<MyType>(),
} from '@/shared/validation'
```

---

## Patterns

### Creating Entity-Specific Schemas

```typescript
// entities/widget/models/schemas.ts
import { z, slugSchema, nonEmptyString } from '@/shared/validation'

export const widgetFormSchema = z.object({
  name: nonEmptyString,
  slug: slugSchema,
  type: z.enum(['wall_of_love', 'carousel', 'single_quote']),
  theme: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }),
})

export type WidgetFormValues = z.infer<typeof widgetFormSchema>
```

### Form with Async Validation

```typescript
import { useTypedForm, useTypedField, useAsyncValidation } from '@/shared/validation'

const { handleSubmit } = useTypedForm({ schema })
const { value: slug, setErrors } = useTypedField<string>('slug')

const asyncSlugValidation = useAsyncValidation({
  validate: async (value) => {
    const available = await api.checkSlugAvailability(value)
    return available ? true : 'This slug is already taken'
  },
})

// Validate on blur
async function onSlugBlur() {
  const isValid = await asyncSlugValidation.validate(slug.value)
  if (!isValid && asyncSlugValidation.error.value) {
    setErrors(asyncSlugValidation.error.value)
  }
}
```

### Multi-Step Form with Custom Steps

```typescript
import { useMultiStepForm, z } from '@/shared/validation'

const stepSchemas = {
  details: z.object({ title: z.string().min(1) }),
  settings: z.object({ isPublic: z.boolean() }),
  review: z.object({}),  // No validation needed
}

const multiStep = useMultiStepForm({
  steps: ['details', 'settings', 'review'] as const,
  stepSchemas,
})
```

### Conditional Validation

```typescript
const schema = z.object({
  contactMethod: z.enum(['email', 'phone']),
  email: z.string().optional(),
  phone: z.string().optional(),
}).refine(
  (data) => {
    if (data.contactMethod === 'email') return !!data.email
    if (data.contactMethod === 'phone') return !!data.phone
    return true
  },
  { message: 'Please provide your contact information' }
)
```

---

## File Structure

```
shared/validation/
├── composables/
│   ├── useFormValidation.ts    # useTypedForm, useTypedField, etc.
│   ├── useSmartPromptForm.ts   # Smart prompt 4-step form
│   └── index.ts
├── schemas/
│   ├── common.ts               # Reusable base schemas
│   ├── testimonial.ts          # Testimonial-specific schemas
│   └── index.ts
├── rules/
│   └── index.ts                # Custom Zod refinements
├── models/
│   └── index.ts                # Type definitions
├── index.ts                    # Public API (import from here)
└── CLAUDE.md                   # This file
```

---

## Import Pattern

Always import from the module root:

```typescript
// Good
import { useTypedForm, emailSchema, z } from '@/shared/validation'

// Avoid deep imports
import { useTypedForm } from '@/shared/validation/composables/useFormValidation'
```
