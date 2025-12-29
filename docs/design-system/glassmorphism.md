# Glassmorphism Design System

Modern, translucent UI patterns for premium visual effects.

## Design Philosophy

Glassmorphism creates depth and hierarchy through:
- **Frosted glass effect** via `backdrop-blur`
- **Semi-transparent backgrounds** with white/black/color overlays
- **Subtle borders** that catch light
- **Layered depth** on gradient backgrounds

### Why Glassmorphism for Testimonials?

1. **Premium Feel**: Elevates testimonial widgets embedded on customer websites
2. **Versatility**: Works on any gradient background the customer chooses
3. **Modern Aesthetic**: Aligns with iOS, macOS, and contemporary SaaS design
4. **Content Focus**: Frosted effect draws attention to testimonial content

---

## Core CSS Properties

```css
/* Essential glassmorphism properties */
.glass {
  backdrop-blur: blur(12px);        /* Frosted effect */
  background: rgba(255,255,255,0.1); /* Semi-transparent */
  border: 1px solid rgba(255,255,255,0.2); /* Subtle border */
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* Depth */
}
```

### Tailwind Implementation

```html
<!-- Glass effect classes -->
<div class="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
  Content
</div>
```

---

## Glass Variants

### 1. Standard Glass (`glass`)
White-tinted frosted glass. Best on colorful gradients.

```css
backdrop-blur-md bg-white/20 border border-white/30 shadow-lg
```

**Use cases:**
- Testimonial cards on brand gradient backgrounds
- CTAs on hero sections
- Overlay content on images

### 2. Dark Glass (`glass-dark`)
Black-tinted frosted glass. Best on dark/slate backgrounds.

```css
backdrop-blur-md bg-black/20 border border-white/10 shadow-lg
```

**Use cases:**
- Dashboard cards in dark mode
- Settings panels
- Admin interfaces

### 3. Teal Glass (`glass-teal`)
Brand-tinted frosted glass. Reinforces teal brand color.

```css
backdrop-blur-md bg-teal-500/20 border border-teal-400/30 shadow-lg
```

**Use cases:**
- Primary action buttons on teal backgrounds
- Branded testimonial widgets
- Feature highlights

---

## Component Implementation

### Glass Card

```vue
<Card variant="glass" class="w-[400px]">
  <CardContent class="pt-6">
    <p class="text-white">Testimonial content...</p>
  </CardContent>
</Card>
```

**Available variants:**
- `default` - Standard solid card
- `glass` - White frosted glass
- `glass-dark` - Dark frosted glass
- `glass-teal` - Teal-tinted glass

### Glass Button

```vue
<Button variant="glass">Submit</Button>
<Button variant="glass-dark">Settings</Button>
<Button variant="glass-teal">Learn More</Button>
```

**Available variants:**
- `glass` - White frosted glass
- `glass-dark` - Dark frosted glass
- `glass-teal` - Teal-tinted glass

---

## Background Pairings

Glass effects require gradient or image backgrounds to be visible.

### Recommended Gradient Backgrounds

```html
<!-- Teal (Brand) -->
<div class="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600">

<!-- Purple (Premium) -->
<div class="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600">

<!-- Dark (Dashboard) -->
<div class="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">

<!-- Emerald (Success) -->
<div class="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">

<!-- Rose (Highlight) -->
<div class="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500">
```

### Pairing Guidelines

| Glass Variant | Best Backgrounds |
|---------------|------------------|
| `glass` | Teal, Purple, Rose, Emerald gradients |
| `glass-dark` | Slate, Dark blue, Black gradients |
| `glass-teal` | Teal, Cyan, Emerald gradients |

---

## Accessibility Considerations

### Text Contrast

Glass effects can reduce text readability. Always use:
- **White text** (`text-white`) on glass variants
- **Sufficient opacity** for backgrounds (minimum 10-20%)
- **Adequate blur** (`backdrop-blur-md` or higher)

### Focus States

```css
/* Glass button focus */
focus-visible:ring-white/50  /* For glass */
focus-visible:ring-white/30  /* For glass-dark */
focus-visible:ring-teal-400/50 /* For glass-teal */
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  .glass {
    backdrop-filter: none;
    background: rgba(255,255,255,0.3); /* Solid fallback */
  }
}
```

---

## Performance Notes

### Browser Support
- `backdrop-filter` is supported in all modern browsers
- Safari was first to support (iOS 9+)
- Firefox added support in v103

### Performance Tips

1. **Limit glass layers**: Don't stack multiple glass elements
2. **Avoid large areas**: Glass on full-page backgrounds can impact performance
3. **Use sparingly**: Reserve for key UI elements (cards, buttons, modals)

---

## Use Cases for Testimonials

### 1. Embeddable Widgets
Glass cards on customer-chosen gradient backgrounds.

```vue
<div :style="{ background: customerGradient }">
  <Card variant="glass">
    <TestimonialContent />
  </Card>
</div>
```

### 2. Wall of Love
Grid of glass testimonial cards on brand gradient.

```vue
<div class="bg-gradient-to-br from-violet-500 to-indigo-600 p-8">
  <div class="grid grid-cols-3 gap-4">
    <Card variant="glass" v-for="testimonial in testimonials">
      ...
    </Card>
  </div>
</div>
```

### 3. Collection Form
Glass-styled form container for premium feel.

```vue
<div class="bg-gradient-to-br from-teal-500 to-cyan-600 min-h-screen">
  <Card variant="glass" class="max-w-md mx-auto">
    <TestimonialForm />
  </Card>
</div>
```

### 4. Hero CTAs
Glass buttons on landing page hero sections.

```vue
<section class="bg-gradient-to-br from-teal-500 to-cyan-600">
  <h1 class="text-white">Collect Testimonials</h1>
  <Button variant="glass" size="lg">Get Started Free</Button>
</section>
```

---

## Storybook Reference

View live examples in Storybook:

**Cards:**
- `Components/Card/Glass Card`
- `Components/Card/Glass Dark Card`
- `Components/Card/Glass Teal Card`
- `Components/Card/Glass Card Grid`

**Buttons:**
- `Components/Button/Glass Button`
- `Components/Button/Glass Dark Button`
- `Components/Button/Glass Teal Button`
- `Components/Button/Glass Buttons Showcase`

---

*Glassmorphism adds premium visual polish while maintaining usability. Use it strategically to elevate key UI elements without overwhelming the interface.*
