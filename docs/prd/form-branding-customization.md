# Form Branding & Customization

> How users can brand their testimonial collection forms to match their company identity.

## Form Structure

The testimonial collection flow consists of three pages:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Welcome Page   │ ──▶ │   Form Steps    │ ──▶ │  Thank You Page │
│                 │     │                 │     │                 │
│ • Logo          │     │ • Smart prompts │     │ • Success msg   │
│ • Title         │     │ • Problem       │     │ • Social share? │
│ • Subtitle      │     │ • Solution      │     │ • CTA/redirect  │
│ • "Get Started" │     │ • Result        │     │                 │
│                 │     │ • Attribution   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Welcome Page
- Introduces the form with branding
- Sets expectations ("only takes 2 minutes")
- Single CTA to begin

### Form Steps (Smart Prompts)
- Multi-step guided questions
- Problem → Solution → Result → Attribution
- Progress indicator

### Review/Edit Page (Our Differentiator)
- AI assembles answers into coherent testimonial
- Customer can approve or edit before submitting

### Thank You Page
- Confirmation message
- Optional social sharing
- Optional redirect URL

---

## Competitor Analysis

### What Competitors Offer by Tier

#### Tier 1: Essential (All Plans)
| Feature | Senja | Testimonial.to | VideoAsk | Typeform |
|---------|-------|----------------|----------|----------|
| Logo upload | ✅ | ✅ | ✅ | ✅ |
| Primary/button color | ✅ | ✅ | ✅ | ✅ |
| Background color | ✅ | ✅ | ✅ | ✅ |
| Welcome page copy | ✅ | ✅ | ✅ | ✅ |
| Thank you page copy | ✅ | ✅ | ✅ | ✅ |

#### Tier 2: Paid Plans
| Feature | Senja | Testimonial.to | VideoAsk | Typeform |
|---------|-------|----------------|----------|----------|
| Remove "Powered by" | $19/mo | $25/mo | $50/mo | Plus |
| Custom domain | ✅ | ✅ | ✅ | Business |
| Secondary color | - | - | ✅ | ✅ |
| Font selection | - | - | ✅ | ✅ |
| Background image | - | - | - | ✅ |

#### Tier 3: Premium/Enterprise
| Feature | Senja | Testimonial.to | VideoAsk | Typeform |
|---------|-------|----------------|----------|----------|
| Custom fonts | - | - | - | Enterprise |
| Multiple brand kits | - | - | - | Enterprise |
| Video play button color | - | - | ✅ | - |
| Multiple endings | - | - | - | ✅ |

### Key Insights

1. **Logo + Primary Color** is table stakes - everyone offers it
2. **"Powered by" removal** is a common monetization lever ($19-50/mo)
3. **Font selection** is surprisingly rare in testimonial tools
4. **Custom domain** is expected on paid plans
5. **Background images** are rare (Typeform only)

---

## Recommended Settings Schema

### TypeScript Interface

```typescript
interface FormSettings {
  // === BRANDING ===
  branding: {
    logoUrl?: string
    logoPosition?: 'left' | 'center' | 'right'
    logoSize?: 'sm' | 'md' | 'lg'
    showPoweredBy?: boolean  // Default true, false on paid plans
    faviconUrl?: string      // Custom browser tab icon
  }

  // === COLORS ===
  colors: {
    primary: string          // Buttons, links, progress bar, accents
    background: string       // Form background color
    text?: string            // Override auto-contrast text color
    backgroundImage?: string // URL to background image (premium)
    backgroundOverlay?: number // 0-1 darkness overlay on image
  }

  // === TYPOGRAPHY ===
  typography?: {
    fontFamily?: 'inter' | 'poppins' | 'roboto' | 'open-sans' | 'lato' | 'montserrat' | 'system'
  }

  // === PAGE COPY ===
  welcomePage: {
    title?: string           // Default: "Share your experience with {product}"
    subtitle?: string        // Default: "It only takes 2 minutes"
    buttonText?: string      // Default: "Get Started"
  }

  thankYouPage: {
    title?: string           // Default: "Thank you!"
    subtitle?: string        // Default: "We really appreciate your feedback"
    showSocialShare?: boolean
    redirectUrl?: string     // Optional redirect after X seconds
    redirectDelay?: number   // Seconds before redirect (default: 5)
  }

  // === STYLE VARIANTS ===
  style?: {
    buttonRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
    cardStyle?: 'flat' | 'elevated' | 'bordered' | 'glass'
    animation?: 'none' | 'subtle' | 'playful'
  }
}
```

### Default Values

```typescript
const defaultSettings: FormSettings = {
  branding: {
    logoPosition: 'center',
    logoSize: 'md',
    showPoweredBy: true,
  },
  colors: {
    primary: '#6366f1',      // Indigo-500
    background: '#ffffff',
  },
  typography: {
    fontFamily: 'inter',
  },
  welcomePage: {
    // Defaults use {product} placeholder from form.product_name
    buttonText: 'Get Started',
  },
  thankYouPage: {
    showSocialShare: false,
  },
  style: {
    buttonRadius: 'lg',
    cardStyle: 'elevated',
    animation: 'subtle',
  },
}
```

---

## Implementation Phases

### Phase 1: MVP Launch
Core branding that every form needs:

- [ ] Logo upload with position (left/center/right)
- [ ] Primary color picker
- [ ] Background color picker
- [ ] Welcome page title & subtitle
- [ ] Thank you page title & subtitle
- [ ] Submit button text

### Phase 2: Post-Launch
Enhanced customization:

- [ ] "Powered by" toggle (tied to plan)
- [ ] Font family selection (6 options)
- [ ] Button corner radius
- [ ] Logo size options
- [ ] Custom favicon

### Phase 3: Premium Features
Advanced branding:

- [ ] Background images with overlay
- [ ] Custom domain support
- [ ] Social share on thank you page
- [ ] Redirect URL after completion
- [ ] Card style variants
- [ ] Animation options

---

## UI Patterns: How Competitors Do It

### The Standard Pattern: Settings Panel + Live Preview

Competitors do **NOT use drag-and-drop** for design/branding customization. Instead, they use a **Settings Sidebar + Live Preview** pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│  Form Editor                                              [Save]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Settings Panel  │  │                                      │ │
│  │  (Left Sidebar)  │  │         Live Preview                 │ │
│  │                  │  │         (Right/Center)               │ │
│  │  ▼ Branding      │  │                                      │ │
│  │    [Logo upload] │  │    ┌────────────────────────┐        │ │
│  │    Position: ○●○ │  │    │      [LOGO]            │        │ │
│  │                  │  │    │                        │        │ │
│  │  ▼ Colors        │  │    │  Share your experience │        │ │
│  │    Primary: [■]  │  │    │  with Acme             │        │ │
│  │    Background:[] │  │    │                        │        │ │
│  │                  │  │    │  It only takes 2 mins  │        │ │
│  │  ▼ Welcome Page  │  │    │                        │        │ │
│  │    Title: [____] │  │    │    [Get Started]       │        │ │
│  │    Subtitle:[__] │  │    │                        │        │ │
│  │                  │  │    └────────────────────────┘        │ │
│  │  ▼ Thank You     │  │                                      │ │
│  │    ...           │  │   [Welcome] [Questions] [Thank You]  │ │
│  └──────────────────┘  └──────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### How Each Competitor Implements It

#### Senja
> "On the right you will see your form. On the left you will see your customization options"

- Left sidebar with collapsible sections
- Right side shows live preview
- Sections: Welcome page, Response page, Customer details, Thank You
- Single "Save changes" button when done

#### VideoAsk
> "In the right-hand sidebar you can choose the Primary, Secondary, and Background colors... As you select colors, they will automatically update in the live preview"

- Settings icon opens right-hand sidebar
- Color pickers with hex input
- Font dropdown selector
- Changes auto-save (no save button)

#### Typeform
> "The form creation interface resembles PowerPoint, with a left panel for question preview, a middle section for editing, and a right panel for property settings"

- 3-panel layout: Questions | Editor | Settings
- "Design" button in toolbar opens theme panel
- Gallery of pre-made themes to choose from
- Separate tabs for Font, Colors, Background, Logo

### Key UI Pattern Insights

| Pattern | Used For | Not Used For |
|---------|----------|--------------|
| **Collapsible accordions** | Organizing settings sections | - |
| **Form inputs** | Colors, text, dropdowns | - |
| **Live preview** | Instant visual feedback | - |
| **Page tabs** | Switching preview screens | - |
| **Drag-and-drop** | Question reordering | Design customization |
| **Theme gallery** | Quick-start templates | Custom colors |

### What This Means for Our Implementation

**Do:**
- Use collapsible sidebar sections (not drag-drop)
- Show instant live preview as settings change
- Provide page tabs to preview Welcome/Questions/Thank You
- Use standard form controls (color picker, text input, dropdown)
- Auto-save or single "Save" button

**Don't:**
- Build a drag-and-drop interface for branding
- Require users to "apply" changes before seeing preview
- Hide the preview behind a separate "Preview" button

---

## UI/UX Implementation Details

### Recommended Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [← Back to Form]              Form Branding          [Save] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌────────────────────────────────────┐ │
│  │                 │  │  [Welcome] [Question] [Thank You]  │ │
│  │  ▼ Branding     │  ├────────────────────────────────────┤ │
│  │  ┌───────────┐  │  │                                    │ │
│  │  │  Upload   │  │  │    ╭─────────────────────────╮     │ │
│  │  │   Logo    │  │  │    │                         │     │ │
│  │  └───────────┘  │  │    │      [Company Logo]     │     │ │
│  │  Position:      │  │    │                         │     │ │
│  │  [L] [C] [R]    │  │    │   Share your experience │     │ │
│  │                 │  │    │       with Acme         │     │ │
│  │  ▼ Colors       │  │    │                         │     │ │
│  │  Primary        │  │    │   It only takes 2 mins  │     │ │
│  │  [#6366f1] [■]  │  │    │                         │     │ │
│  │                 │  │    │     ┌─────────────┐     │     │ │
│  │  Background     │  │    │     │ Get Started │     │     │ │
│  │  [#ffffff] [□]  │  │    │     └─────────────┘     │     │ │
│  │                 │  │    │                         │     │ │
│  │  ▼ Welcome Page │  │    │    Powered by Testimo   │     │ │
│  │  Title:         │  │    ╰─────────────────────────╯     │ │
│  │  [Share your__] │  │                                    │ │
│  │                 │  │         📱 Mobile Preview          │ │
│  │  Subtitle:      │  │                                    │ │
│  │  [It only____]  │  └────────────────────────────────────┘ │
│  │                 │                                         │
│  │  Button text:   │                                         │
│  │  [Get Started]  │                                         │ │
│  │                 │                                         │
│  │  ▼ Thank You    │                                         │
│  │  ...            │                                         │
│  │                 │                                         │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Settings Panel Sections

#### 1. Branding Section
```
▼ Branding
  ┌─────────────────────────────┐
  │  ┌───────┐                  │
  │  │ Upload│  company-logo.png│
  │  │ Logo  │  [Remove]        │
  │  └───────┘                  │
  │                             │
  │  Position                   │
  │  ○ Left  ● Center  ○ Right  │
  │                             │
  │  Size                       │
  │  ○ Small ● Medium ○ Large   │
  │                             │
  │  □ Show "Powered by" badge  │
  │    ⚠️ Upgrade to remove     │
  └─────────────────────────────┘
```

#### 2. Colors Section
```
▼ Colors
  ┌─────────────────────────────┐
  │  Primary (buttons, links)   │
  │  ┌──────┐ #6366f1           │
  │  │  ■■  │ [────────●──]     │
  │  └──────┘                   │
  │                             │
  │  Quick picks:               │
  │  [■][■][■][■][■][■][■][■]   │
  │                             │
  │  Background                 │
  │  ┌──────┐ #ffffff           │
  │  │  □□  │                   │
  │  └──────┘                   │
  │                             │
  │  ⚠️ Low contrast warning    │
  └─────────────────────────────┘
```

#### 3. Page Copy Sections
```
▼ Welcome Page
  ┌─────────────────────────────┐
  │  Title                      │
  │  ┌─────────────────────────┐│
  │  │Share your experience    ││
  │  │with {product}           ││
  │  └─────────────────────────┘│
  │  💡 Use {product} for name  │
  │                             │
  │  Subtitle                   │
  │  ┌─────────────────────────┐│
  │  │It only takes 2 minutes  ││
  │  └─────────────────────────┘│
  │                             │
  │  Button text                │
  │  ┌─────────────────────────┐│
  │  │Get Started              ││
  │  └─────────────────────────┘│
  └─────────────────────────────┘

▼ Thank You Page
  ┌─────────────────────────────┐
  │  Title                      │
  │  [Thank you!_____________]  │
  │                             │
  │  Subtitle                   │
  │  [We appreciate your____]   │
  │                             │
  │  □ Show social share buttons│
  │                             │
  │  Redirect URL (optional)    │
  │  [https://____________]     │
  └─────────────────────────────┘
```

### Color Picker Component

```
┌─────────────────────────────────┐
│  Primary Color                  │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │                             ││
│  │     Color gradient          ││
│  │        picker               ││
│  │           ●                 ││
│  └─────────────────────────────┘│
│  [━━━━━━━━━━━●━━━━━━] Hue      │
│                                 │
│  Hex: [#6366f1]                 │
│                                 │
│  Presets:                       │
│  [■][■][■][■][■][■][■][■]      │
│  Indigo Blue Teal Green ...     │
│                                 │
│  Recent:                        │
│  [■][■][■]                      │
└─────────────────────────────────┘
```

### Preview Panel Features

1. **Page Tabs**: Toggle between Welcome / Question / Thank You views
2. **Device Toggle**: Switch between mobile (default) and desktop preview
3. **Live Updates**: Changes reflect instantly without refresh
4. **Realistic Frame**: Show in a phone/browser frame for context

### Interaction Patterns

| Action | Behavior |
|--------|----------|
| Change color | Preview updates instantly |
| Type in text field | Preview updates on blur or after 300ms debounce |
| Upload logo | Show loading state, then update preview |
| Toggle section | Accordion expand/collapse with animation |
| Click page tab | Preview switches to that page |
| Click Save | Persist to database, show success toast |

### Accessibility Considerations

- Color pickers must have hex input for precise values
- All interactive elements need keyboard navigation
- Preview should have proper ARIA labels
- Contrast warnings for accessibility issues

---

## Database Storage

The `settings` JSONB field in `forms` table stores this configuration:

```sql
-- Example stored value
{
  "branding": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "logoPosition": "center",
    "showPoweredBy": false
  },
  "colors": {
    "primary": "#6366f1",
    "background": "#fafafa"
  },
  "welcomePage": {
    "title": "Tell us about your experience with Acme",
    "subtitle": "Your feedback helps us improve"
  },
  "thankYouPage": {
    "title": "You're awesome!",
    "subtitle": "Thanks for sharing your story"
  }
}
```

---

## Sources

### Competitor Documentation
- [Senja Form Customization](https://support.senja.io/articles/how-do-i-customize-edit-my-form-v1-design-m7yqs)
- [VideoAsk Branding & Logo](https://www.videoask.com/help/branding/360041508551-add-your-brand-and-logo-to-a-videoask)
- [VideoAsk Customize Your VideoAsk](https://www.videoask.com/help/customization/360057757011-customize-your-videoask)
- [Typeform Theme Customization](https://www.typeform.com/help/a/apply-a-theme-to-your-typeform-4404774861588/)
- [Typeform Brand Kits](https://help.typeform.com/hc/en-us/articles/6903894666004-Apply-brand-assets-and-visuals-to-your-forms-with-brand-kits)

### Comparison & Reviews
- [Top Testimonial Software Comparison](https://www.reviewflowz.com/blog/saas-testimonial-collection-software)
- [Typeform Review - Interface Layout](https://www.jodoo.com/blog/typeform-review)

### UI Patterns
- [Live Preview UI Pattern](https://ui-patterns.com/patterns/LivePreview)
