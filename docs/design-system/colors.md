# Color System

Teal - Trustworthy, modern, and differentiated from typical SaaS blues.

## Design Philosophy

- **Trustworthy & Modern**: Teal conveys reliability while standing out
- **Neutral Foundation**: 90% of UI uses the neutral palette
- **Purposeful Accents**: Color draws attention to what matters
- **Dark Mode Ready**: Designed to look great in both modes
- **Semantic Naming**: Colors describe purpose, not appearance

---

## Core Palette

### Neutral (Primary UI)
The backbone of the interface. Used for backgrounds, text, borders.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | `#ffffff` | `#030712` | Page backgrounds |
| `foreground` | `#030712` | `#fafafa` | Primary text |
| `card` | `#ffffff` | `#040a14` | Card backgrounds |
| `card-foreground` | `#030712` | `#fafafa` | Card text |
| `muted` | `#f3f4f6` | `#1c2433` | Subtle backgrounds |
| `muted-foreground` | `#6b7280` | `#8b949e` | Secondary text |
| `border` | `#e5e7eb` | `#212c3d` | Dividers, borders |
| `input` | `#e5e7eb` | `#212c3d` | Input borders |

### Brand (Primary)
Teal - fresh, modern, trustworthy. Differentiates from typical SaaS blues.

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0D9488` | Primary buttons, links, CTAs |
| `primary-foreground` | `#ffffff` | Text on primary |
| `accent` | `#14B8A6` | Hover states, highlights |
| `ring` | `#0D9488` | Focus rings |

### Semantic Colors
Purpose-driven colors for feedback and status.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `success` | `#16a34a` | `#22c55e` | Approved testimonials |
| `success-foreground` | `#ffffff` | `#ffffff` | Text on success |
| `warning` | `#f59e0b` | `#f59e0b` | Pending review |
| `warning-foreground` | `#ffffff` | `#000000` | Text on warning |
| `destructive` | `#ef4444` | `#dc2626` | Rejected, errors |
| `destructive-foreground` | `#ffffff` | `#ffffff` | Text on destructive |

---

## Extended Palette

For nuanced UI elements like charts, badges, and highlights.

### Primary Scale (Teal)
```
teal-50:  #f0fdfa
teal-100: #ccfbf1
teal-200: #99f6e4
teal-300: #5eead4
teal-400: #2dd4bf
teal-500: #14b8a6
teal-600: #0D9488  ← Primary
teal-700: #0f766e
teal-800: #115e59
teal-900: #134e4a
teal-950: #042f2e
```

### Neutral Scale (Slate)
```
neutral-50:  #f8fafc
neutral-100: #f1f5f9
neutral-200: #e2e8f0
neutral-300: #cbd5e1
neutral-400: #94a3b8
neutral-500: #64748b
neutral-600: #475569
neutral-700: #334155
neutral-800: #1e293b
neutral-900: #0f172a
neutral-950: #020617
```

---

## Usage Guidelines

### Do's
```vue
<!-- Semantic backgrounds -->
<div class="bg-background">Page content</div>
<div class="bg-card">Card content</div>
<div class="bg-muted">Subtle section</div>

<!-- Semantic text -->
<h1 class="text-foreground">Main heading</h1>
<p class="text-muted-foreground">Supporting text</p>

<!-- Status colors -->
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>

<!-- Primary actions -->
<Button>Submit Testimonial</Button>
<a class="text-primary hover:underline">Learn more</a>
```

### Don'ts
```vue
<!-- Never use raw Tailwind colors -->
<div class="bg-gray-100">Wrong</div>
<p class="text-gray-600">Wrong</p>
<button class="bg-blue-500">Wrong</button>

<!-- Never use hex values directly -->
<div style="background: #f4f4f5">Wrong</div>
```

---

## Testimonial-Specific Colors

### Status Colors
| Status | Token | Background | Text |
|--------|-------|------------|------|
| Pending | `warning` | `bg-warning/10` | `text-warning` |
| Approved | `success` | `bg-success/10` | `text-success` |
| Rejected | `destructive` | `bg-destructive/10` | `text-destructive` |

### Widget Themes
Embeddable widgets support custom theming:
- `--widget-bg`: Widget background
- `--widget-text`: Widget text
- `--widget-accent`: Widget accent color
- `--widget-border`: Widget borders

---

## CSS Variables

All colors are defined as CSS variables in `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71% 4%;
  --primary: 175 84% 32%;        /* Teal - fresh and modern */
  --primary-foreground: 0 0% 100%;
  --accent: 175 77% 40%;         /* Lighter teal for hover */
  --success: 142 76% 36%;        /* Green for approved */
  --warning: 38 92% 50%;         /* Amber for pending */
  --destructive: 0 84% 60%;      /* Red for rejected */
  /* ... */
}

.dark {
  --background: 224 71% 4%;
  --foreground: 0 0% 98%;
  --primary: 175 77% 40%;        /* Teal - vibrant on dark */
  /* ... */
}
```

Colors use HSL format for easy manipulation (opacity, tinting).
