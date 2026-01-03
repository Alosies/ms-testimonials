# UX Philosophy

Core interaction principles inspired by Linear, Notion, and Figma.

## Guiding Principle: Progressive Disclosure

> Show just enough information at the right moment, then clean up the UI when the user no longer needs it.

The interface should feel **helpful but not intrusive**. Information appears when relevant and disappears when resolved.

---

## 1. Status Indicators

### The Modern Status Pill Pattern

Use subtle, contextual status pills instead of traditional buttons or text labels.

```
┌─────────────────────────────────────────────────────┐
│  ● 2 unsaved  ⌘S     →     ◌ Saving...     →     ✓ Saved     →     (hidden)
│  (amber pill)              (amber pill)          (green pill)
└─────────────────────────────────────────────────────┘
```

**Elements:**

| Component | Purpose |
|-----------|---------|
| Dot indicator (●) | Minimal, non-intrusive status signal |
| Pill shape | Modern, approachable - less aggressive than buttons |
| Inline `<kbd>` | Teaches shortcuts in-context |
| State transitions | Clear feedback loop |

### State Flow

```
Dirty State  →  Action State  →  Success State  →  Clean State
(Unsaved)       (Saving...)       (Saved ✓)         (Hidden)
```

**Implementation:**
```vue
<script setup>
import { Kbd } from '@testimonials/ui';
</script>

<template>
  <!-- Saved state (green) - disappears after 1.5s -->
  <div v-if="justSaved" class="... bg-emerald-50 text-emerald-700">
    <Icon icon="lucide:check" />
    Saved
  </div>

  <!-- Unsaved state (amber) - clickable -->
  <button v-else class="... bg-amber-50 text-amber-700">
    <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
    {{ count }} unsaved
    <Kbd size="sm">⌘S</Kbd>
  </button>
</template>
```

---

## 2. Color Psychology for States

| State | Color | Meaning |
|-------|-------|---------|
| Attention needed | Amber (`amber-50/500/700`) | "Look at this, but no rush" |
| Success/Complete | Emerald (`emerald-50/700`) | "All good, I'll disappear soon" |
| Danger/Destructive | Red (`red-50/500/700`) | "Are you sure?" |
| Neutral/Info | Gray (`gray-50/500`) | Background information |

**Key insight:** Amber is "attention" without the urgency of red. Use it for draft states, unsaved changes, and pending actions.

---

## 3. Keyboard Shortcut Discovery

### The Kbd Component

Use the standardized `Kbd` component from `@testimonials/ui` for all keyboard shortcut hints.

```vue
<script setup>
import { Kbd } from '@testimonials/ui';
</script>

<template>
  <!-- Default size - for standalone hints -->
  <div class="flex items-center gap-2">
    <Kbd>↑</Kbd>
    <Kbd>↓</Kbd>
    <span>to navigate</span>
  </div>

  <!-- Small size - for inline with icons/buttons -->
  <button class="flex items-center gap-1.5">
    <Icon icon="heroicons:pencil" />
    <Kbd size="sm">E</Kbd>
  </button>
</template>
```

### Size Variants

| Size | Use Case | Example |
|------|----------|---------|
| `default` | Standalone navigation hints, prominent shortcuts | `<Kbd>↑</Kbd>` |
| `sm` | Inline with icons, action buttons, compact UI | `<Kbd size="sm">E</Kbd>` |

### Inline Shortcut Hints

Display shortcuts directly in the UI to train power users.

```vue
<button class="...">
  Save
  <Kbd size="sm" class="ml-1">⌘S</Kbd>
</button>
```

**Rules:**
- Always use the `Kbd` component (never inline `<kbd>` styling)
- Show shortcuts for frequent actions (save, submit, navigate)
- Use `size="sm"` when inline with other elements
- Use default size for standalone hint chips
- Hide during action state (e.g., hide ⌘S while saving)
- Use platform-appropriate symbols (⌘ for Mac, Ctrl for Windows)

---

## 4. Disappearing Confirmation Pattern

Inspired by Google Docs, Figma, and iCloud.

> "I know it saved, now get out of my way."

**Pattern:**
1. Action completes successfully
2. Show brief success state (1-2 seconds)
3. Element fades/disappears
4. UI returns to clean state

```typescript
// Watch for save completion
watch([isSaving, hasUnsavedChanges], ([saving, unsaved], [wasSaving]) => {
  if (wasSaving && !saving && !unsaved) {
    justSaved.value = true;
    setTimeout(() => { justSaved.value = false; }, 1500);
  }
});
```

---

## 5. Visual Hierarchy for Dirty States

When content has unsaved changes, use layered visual cues:

### Level 1: Subtle Indicator
- Dot in status pill
- Amber tint in section header

### Level 2: Border Accent
- Left border on affected items
- Background tint

```vue
<!-- Card with unsaved changes -->
<Card :class="isDirty && 'border-l-4 border-l-amber-400 bg-amber-50/30'">
```

### Level 3: Section-Level Badge
- Count in collapsed section header
- Amber pill styling

```vue
<span v-if="hasUnsaved" class="... bg-amber-50 text-amber-700">
  <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
  {{ count }} unsaved
</span>
```

---

## 6. Navigation Safeguards

Protect users from losing unsaved work.

### Browser Warning
```typescript
watch(hasUnsavedChanges, (hasChanges) => {
  if (hasChanges) {
    window.addEventListener('beforeunload', handleBeforeUnload);
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }
});
```

### In-App Confirmation
Use confirmation modals for destructive actions when unsaved changes exist.

---

## Quick Reference

| Scenario | Pattern |
|----------|---------|
| Unsaved changes | Amber pill with dot + keyboard hint |
| Saving in progress | Amber pill with spinner |
| Save complete | Green pill with check, disappears after 1.5s |
| Dirty item in list | Left amber border + subtle bg tint |
| Section with dirty items | Amber badge in header |
| Leaving with unsaved | Browser beforeunload warning |

---

## Inspirations

- **Linear** - Inline keyboard shortcuts, minimal status indicators
- **Notion** - Contextual UI that appears/disappears as needed
- **Figma** - Brief "Saved" confirmation that fades away
- **Google Docs** - Auto-save status that stays out of the way
