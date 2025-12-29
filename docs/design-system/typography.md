# Typography

Clean, readable typography inspired by Notion and Linear. Prioritizes content clarity.

## Font Stack

```css
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

We use the system font stack for:
- Optimal performance (no font loading)
- Native feel across platforms
- Excellent readability

---

## Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 36px (2.25rem) | 700 | 1.1 | Landing hero only |
| `h1` | 30px (1.875rem) | 600 | 1.2 | Page titles |
| `h2` | 24px (1.5rem) | 600 | 1.25 | Major sections |
| `h3` | 20px (1.25rem) | 600 | 1.3 | Sub-sections |
| `h4` | 16px (1rem) | 500 | 1.4 | Card titles |
| `body` | 14px (0.875rem) | 400 | 1.5 | Body text |
| `small` | 13px (0.8125rem) | 400 | 1.5 | Secondary text |
| `caption` | 12px (0.75rem) | 400 | 1.4 | Labels, captions |
| `tiny` | 11px (0.6875rem) | 500 | 1.3 | Badges, tags |

---

## Tailwind Classes

### Headings
```vue
<!-- Page title -->
<h1 class="text-2xl font-semibold tracking-tight text-foreground">
  Dashboard
</h1>

<!-- Section header -->
<h2 class="text-lg font-medium text-foreground">
  Recent Testimonials
</h2>

<!-- Card title -->
<h3 class="text-base font-medium text-foreground">
  Testimonial Details
</h3>

<!-- Sub-heading -->
<h4 class="text-sm font-medium text-foreground">
  Customer Information
</h4>
```

### Body Text
```vue
<!-- Primary body -->
<p class="text-sm text-foreground">
  Main content text goes here.
</p>

<!-- Secondary body -->
<p class="text-sm text-muted-foreground">
  Supporting or less important text.
</p>

<!-- Small text -->
<p class="text-xs text-muted-foreground">
  Captions, timestamps, metadata.
</p>
```

### Special Text
```vue
<!-- Links -->
<a class="text-sm text-primary hover:underline">
  View all testimonials
</a>

<!-- Error text -->
<p class="text-sm text-destructive">
  Please enter a valid email address.
</p>

<!-- Success text -->
<p class="text-sm text-success">
  Testimonial approved successfully.
</p>
```

---

## Weight Guidelines

| Weight | Class | Usage |
|--------|-------|-------|
| 400 (Regular) | `font-normal` | Body text, descriptions |
| 500 (Medium) | `font-medium` | Card titles, labels, buttons |
| 600 (Semibold) | `font-semibold` | Page titles, section headers |
| 700 (Bold) | `font-bold` | Landing page headlines only |

### Rules
- Never use `font-bold` in the application UI
- Use `font-semibold` sparingly (titles only)
- Default to `font-medium` for emphasis
- Keep body text at `font-normal`

---

## Line Height

| Type | Line Height | Class |
|------|-------------|-------|
| Headings | 1.2 - 1.3 | `leading-tight` |
| Body | 1.5 | `leading-normal` |
| Compact UI | 1.4 | `leading-snug` |

---

## Letter Spacing

| Type | Spacing | Class |
|------|---------|-------|
| Headings | -0.025em | `tracking-tight` |
| Body | 0 | `tracking-normal` |
| All caps | 0.05em | `tracking-wide` |

---

## Common Patterns

### Page Header
```vue
<header class="space-y-1">
  <h1 class="text-2xl font-semibold tracking-tight">
    Testimonials
  </h1>
  <p class="text-sm text-muted-foreground">
    Manage and approve customer testimonials.
  </p>
</header>
```

### Card with Title
```vue
<Card>
  <CardHeader>
    <CardTitle class="text-base font-medium">
      Recent Activity
    </CardTitle>
    <CardDescription class="text-sm text-muted-foreground">
      Your latest testimonial submissions.
    </CardDescription>
  </CardHeader>
</Card>
```

### List Item
```vue
<div class="flex items-center justify-between">
  <div>
    <p class="text-sm font-medium text-foreground">
      John Smith
    </p>
    <p class="text-xs text-muted-foreground">
      Submitted 2 hours ago
    </p>
  </div>
</div>
```

---

## Don'ts

```vue
<!-- Don't use text-3xl or larger in app UI -->
<h1 class="text-4xl">Too big</h1>

<!-- Don't use font-bold for UI elements -->
<h2 class="font-bold">Too heavy</h2>

<!-- Don't mix font weights inconsistently -->
<p class="font-semibold">Some text</p>
<p class="font-bold">Other text</p>

<!-- Don't use colored text for body content -->
<p class="text-blue-600">Colored body text</p>
```
