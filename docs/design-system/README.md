# Testimonials Design System

A minimal, trust-inspiring design system inspired by Notion's clarity and Linear's refinement.

## Philosophy

- **Content-First**: UI serves the testimonials, never competes with them
- **Clean & Minimal**: Reduce visual noise, maximize readability
- **Trust-Inspiring**: Professional aesthetics that build confidence
- **Accessible**: WCAG 2.1 AA compliant, works for everyone

## Quick Reference

| Element | Pattern |
|---------|---------|
| Page titles | `text-2xl font-semibold text-foreground` |
| Section headers | `text-lg font-medium text-foreground` |
| Card titles | `text-base font-medium text-foreground` |
| Body text | `text-sm text-muted-foreground` |
| Captions | `text-xs text-muted-foreground` |

## Design Guides

1. [UX Philosophy](./ux-philosophy.md) - Interaction patterns and principles
2. [Color System](./colors.md) - Palette and usage rules
3. [Typography](./typography.md) - Font scales and hierarchy
4. [Spacing](./spacing.md) - Layout rhythm and density
5. [Components](./components.md) - UI component guidelines

## Key Principles

### 1. Semantic Colors Only
Never use raw Tailwind colors. Always use semantic names:
```vue
<!-- Correct -->
<div class="bg-background text-foreground">Content</div>
<button class="bg-primary text-primary-foreground">Action</button>

<!-- Wrong -->
<div class="bg-gray-100 text-gray-900">Content</div>
<button class="bg-blue-500 text-white">Action</button>
```

### 2. Minimal Hierarchy Levels
- Maximum 3 levels of visual hierarchy per section
- Use spacing and typography, not color weight

### 3. Consistent Spacing
- Use Tailwind spacing scale: `4, 6, 8, 12, 16, 24`
- Gaps between items: `gap-2`, `gap-3`, `gap-4`
- Section padding: `p-4`, `p-6`, `p-8`

## File Structure

```
docs/design-system/
├── README.md          # This file
├── ux-philosophy.md   # Interaction patterns and principles
├── colors.md          # Color palette and usage
├── typography.md      # Font scales and rules
├── spacing.md         # Layout and spacing
└── components.md      # Component guidelines
```
