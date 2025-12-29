# Widget Customization

How customers can customize the appearance of embedded testimonial widgets.

## Design Decision

**Date:** December 2024

**Decision:** Offer two customization paths:
1. **Standard variants** - Fully customizable colors via CSS variables
2. **Glass variants** - Fixed styling, works on any gradient background

### Rationale

Glass variants use transparent white/black overlays (`bg-white/20`, `bg-black/20`) that naturally adapt to any background. Allowing color customization would break the glassmorphism effect and add unnecessary complexity.

Standard variants already use CSS custom properties, making them inherently customizable without additional work.

---

## Customization Options

### Standard Variants (Customizable)

Customers can override these CSS variables to match their brand:

```css
:root {
  --widget-primary: 175 84% 32%;      /* Primary color (HSL) */
  --widget-primary-foreground: 0 0% 100%;
  --widget-background: 0 0% 100%;     /* Card background */
  --widget-foreground: 240 10% 3.9%;  /* Text color */
  --widget-border: 240 5.9% 90%;      /* Border color */
  --widget-radius: 0.75rem;           /* Border radius */
}
```

**Available for customization:**
- Primary/accent colors
- Background colors
- Text colors
- Border colors
- Border radius

### Glass Variants (Fixed)

Glass variants are not customizable - they work universally on gradient backgrounds.

| Variant | Appearance | Best For |
|---------|------------|----------|
| `glass` | White frosted | Colorful gradient backgrounds |
| `glass-dark` | Dark frosted | Dark/slate backgrounds |
| `glass-teal` | Teal-tinted | Teal/cyan gradients |

**Customer workflow:**
1. Choose a gradient background for their embed section
2. Select a glass variant that complements their gradient
3. Widget automatically looks premium without configuration

---

## Widget Configuration Schema

```typescript
interface WidgetConfig {
  // Layout
  type: 'wall-of-love' | 'carousel' | 'single-quote'

  // Theming
  theme: 'light' | 'dark' | 'glass' | 'glass-dark' | 'glass-teal'

  // Custom colors (only applied for light/dark themes)
  colors?: {
    primary?: string      // Hex color "#0D9488"
    background?: string   // Hex color "#ffffff"
    text?: string         // Hex color "#1f2937"
    border?: string       // Hex color "#e5e7eb"
  }

  // Style options
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  showRatings?: boolean
  showAvatar?: boolean
  showCompany?: boolean
}
```

---

## Implementation Notes

### Embed Script Behavior

When generating embed code, the script injects CSS variables based on config:

```html
<!-- Standard theme with custom colors -->
<div
  class="testimonials-widget"
  style="
    --widget-primary: 175 84% 32%;
    --widget-background: 0 0% 100%;
    --widget-foreground: 240 10% 3.9%;
  "
>
  <!-- Widget content -->
</div>

<!-- Glass theme (no custom colors needed) -->
<div class="testimonials-widget testimonials-glass">
  <!-- Widget content with glass styling -->
</div>
```

### Color Format

- Store colors as hex in database (`#0D9488`)
- Convert to HSL for CSS variables at embed time
- HSL enables opacity modifiers in Tailwind (`bg-primary/50`)

---

## Customer UX

### Theme Selection Flow

1. **Choose base theme:**
   - Light (customizable)
   - Dark (customizable)
   - Glass (fixed, premium look)

2. **If Light/Dark selected:**
   - Show color picker for primary color
   - Optional: Advanced options for background, text, border

3. **If Glass selected:**
   - Show gradient background picker
   - Preview widget on selected gradient
   - No color customization needed

### Preview

Always show live preview of widget with:
- Sample testimonial content
- Selected theme/colors
- Actual gradient background (for glass variants)

---

## Future Considerations

- **Theme presets:** Pre-built color combinations (e.g., "Ocean", "Sunset", "Forest")
- **CSS export:** Allow advanced users to download CSS for self-hosting
- **Font customization:** Match customer's brand typography
- **Animation options:** Carousel speed, entrance animations
