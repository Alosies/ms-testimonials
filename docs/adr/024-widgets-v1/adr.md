# ADR-024: Widgets v1

## Doc Connections
**ID**: `adr-024-widgets-v1`

2026-02-02 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-testimonials-mvp` - MVP feature requirements (Widget types: Wall of Love, Carousel, Single Quote)

---

## Status

**Proposed** - 2026-02-02

- 2026-02-02: Research completed, initial proposal

---

## Context

### The Problem

After collecting testimonials, users need a way to display them on their websites. Currently, there is no widget system to:
1. Embed testimonials on external websites
2. Customize the appearance to match brand identity
3. Select which testimonials to display
4. Choose from different display formats (grid, carousel, single)

### Business Value

Widgets are a core monetization driver for testimonial platforms:

| Value | Description |
|-------|-------------|
| **Social proof display** | Convert website visitors with visible testimonials |
| **No-code embedding** | Non-technical users can add testimonials anywhere |
| **Brand consistency** | Customizable to match customer branding |
| **Premium features** | Branding removal, advanced customization as upsells |

### Competitive Analysis

We researched 4 major competitors (see `research.md`):

| Platform | Widget Count | Differentiator |
|----------|--------------|----------------|
| Testimonial.to | 7 | Simple, credit-based pricing |
| Senja.io | 23+ | Most variety, creator-focused |
| Famewall.io | 10 | Affordable, no-code focus |
| Shoutout.io | 5 | Video-first approach |

**Key Finding:** All competitors offer Wall of Love (Masonry), Carousel, and Single Quote as core widgets. These are the "must-have" basics.

---

## Decision

### Widget Types for MVP

Implement **three core widget types** that cover 90% of use cases:

#### 1. Wall of Love (Masonry Grid)

**Use case:** Dedicated testimonial pages, landing page sections

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ★★★★★       │ │ ★★★★☆       │ │ ★★★★★       │
│             │ │             │ │             │
│ "Great      │ │ "Changed    │ │ "Best tool  │
│  product!"  │ │  my life"   │ │  ever!"     │
│             │ └─────────────┘ │             │
│ [Avatar]    │ ┌─────────────┐ │ [Avatar]    │
│ John D.     │ │ ★★★★★       │ │ Jane S.     │
│ CEO, Acme   │ │             │ │ Founder     │
└─────────────┘ │ "Highly     │ └─────────────┘
┌─────────────┐ │  recommend" │ ┌─────────────┐
│ [Video]     │ │             │ │ ★★★★★       │
│             │ │ [Avatar]    │ │             │
│ ▶ Play      │ │ Mike R.     │ │ "Amazing!"  │
│             │ └─────────────┘ │             │
└─────────────┘                 └─────────────┘
```

**Features:**
- Pinterest-style masonry layout
- Responsive columns (1-4 based on viewport)
- Video testimonial thumbnails with play button
- Source platform icons (Twitter, LinkedIn, etc.)
- "Load more" pagination or infinite scroll

#### 2. Carousel

**Use case:** Hero sections, product pages, above-the-fold placements

```
┌──────────────────────────────────────────────────────┐
│  ←  ★★★★★                                         →  │
│                                                      │
│      "This product changed how we do business.       │
│       The support team is incredible and the         │
│       features are exactly what we needed."          │
│                                                      │
│      [Avatar] Sarah Johnson                          │
│               VP Marketing, TechCorp                 │
│                                                      │
│                    ● ○ ○ ○ ○                         │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Auto-advance with configurable interval
- Manual navigation (arrows + dots)
- Pause on hover
- Touch/swipe support on mobile
- Single or multi-card view options

#### 3. Single Quote

**Use case:** CTAs, pricing pages, email signatures, minimal footprint areas

```
┌──────────────────────────────────────────┐
│  ★★★★★                                   │
│                                          │
│  "Best investment we've made this year." │
│                                          │
│  [Avatar] Tom Wilson                     │
│           CEO, StartupXYZ                │
└──────────────────────────────────────────┘
```

**Features:**
- Highlight a single best testimonial
- Minimal footprint
- Optional rotation (show random on each load)
- Perfect for email embeds

---

### Customization Options

#### MVP Customizations

| Category | Options |
|----------|---------|
| **Theme** | Light / Dark / Auto (inherit from site) |
| **Colors** | Background color, Card color, Text color, Accent color |
| **Content** | Show/hide: Stars, Avatar, Date, Company, Source icon |
| **Layout** | Max items, Columns (grid), Card spacing |
| **Typography** | Font size (S/M/L), Font family (inherit/system/custom) |

#### Premium Customizations (Post-MVP)

| Category | Options |
|----------|---------|
| **Branding** | Remove "Powered by" badge |
| **Filtering** | Filter by tags, rating, date range |
| **Animation** | Carousel speed, hover effects |
| **Advanced** | Custom CSS injection |

---

### Embed Implementation

Use **div + script approach with Shadow DOM**:

```html
<!-- User copies this to their site -->
<div
  data-testimonials-widget="wall-of-love"
  data-widget-id="wgt_abc123xyz"
></div>
<script async src="https://widget.testimonials.app/v1/embed.js"></script>
```

**Why this approach:**
- Simple copy-paste for users
- Shadow DOM isolates widget styles from host site
- No iframe restrictions
- Content is SEO-indexable
- Automatic height adjustment
- Dynamic updates without re-embedding

**Technical flow:**
1. Script loads and finds all `[data-testimonials-widget]` elements
2. Fetches widget config + testimonials from API
3. Renders widget inside Shadow DOM
4. Applies user's customization settings

---

### Widget Data Model

```typescript
interface Widget {
  id: string;                    // wgt_nanoid12
  form_id: string;               // Associated form
  organization_id: string;       // Owner org
  name: string;                  // User-friendly name
  type: 'wall_of_love' | 'carousel' | 'single_quote';

  // Content selection
  testimonial_ids: string[];     // Manually selected (if empty, use all approved)
  filter_tags: string[];         // Filter by tags
  filter_min_rating: number;     // Minimum star rating
  max_items: number;             // Limit displayed

  // Display settings
  settings: WidgetSettings;

  // Metadata
  created_at: Date;
  updated_at: Date;
}

interface WidgetSettings {
  theme: 'light' | 'dark' | 'auto';
  background_color: string;
  card_color: string;
  text_color: string;
  accent_color: string;

  show_rating: boolean;
  show_avatar: boolean;
  show_date: boolean;
  show_company: boolean;
  show_source_icon: boolean;

  font_size: 'small' | 'medium' | 'large';
  font_family: 'inherit' | 'system' | string;

  // Type-specific settings
  columns?: number;              // Wall of Love
  card_gap?: number;             // Wall of Love
  autoplay?: boolean;            // Carousel
  autoplay_interval?: number;    // Carousel (ms)
  show_navigation?: boolean;     // Carousel
  rotate?: boolean;              // Single Quote
}
```

---

### API Endpoints

```
POST   /widgets                  # Create widget
GET    /widgets                  # List org widgets
GET    /widgets/:id              # Get widget details
PUT    /widgets/:id              # Update widget
DELETE /widgets/:id              # Delete widget

# Public endpoint for embed
GET    /public/widgets/:id       # Get widget data for embedding
```

---

### Widget Builder UI

Located at `/:org/widgets/new` and `/:org/widgets/:id/edit`:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Widgets                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Widget Name: [My Wall of Love_________]                    │
│                                                             │
│  Widget Type:                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ ▦▦▦▦     │  │ ← ▢ →    │  │   ▢      │                  │
│  │ Wall of  │  │ Carousel │  │  Single  │                  │
│  │ Love ✓   │  │          │  │  Quote   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
├───────────────────────┬─────────────────────────────────────┤
│  Settings             │                                     │
│                       │     LIVE PREVIEW                    │
│  Theme                │                                     │
│  [Light ▼]            │  ┌─────────┐ ┌─────────┐           │
│                       │  │ ★★★★★   │ │ ★★★★☆   │           │
│  Background           │  │ "Great!"│ │ "Nice"  │           │
│  [#ffffff ■]          │  │ John D. │ │ Jane S. │           │
│                       │  └─────────┘ └─────────┘           │
│  Show Ratings  [✓]    │  ┌─────────┐                       │
│  Show Avatar   [✓]    │  │ ★★★★★   │                       │
│  Show Date     [ ]    │  │ "Wow!"  │                       │
│  Show Company  [✓]    │  │ Bob K.  │                       │
│                       │  └─────────┘                       │
│  Max Items     [12]   │                                     │
│  Columns       [3 ▼]  │                                     │
│                       │                                     │
├───────────────────────┴─────────────────────────────────────┤
│  Testimonials                                               │
│  ○ All approved testimonials                                │
│  ● Select specific testimonials                             │
│    [✓] "Great product!" - John D.                          │
│    [✓] "Changed my life" - Jane S.                         │
│    [ ] "Good service" - Bob K.                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                               [Cancel]  [Save & Get Code]   │
└─────────────────────────────────────────────────────────────┘
```

---

### Embed Code Modal

After saving widget:

```
┌─────────────────────────────────────────────────────────────┐
│  Embed Your Widget                                     [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Copy this code and paste it into your website:             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ <div                                                │   │
│  │   data-testimonials-widget="wall-of-love"           │   │
│  │   data-widget-id="wgt_abc123xyz"                    │   │
│  │ ></div>                                             │   │
│  │ <script async                                       │   │
│  │   src="https://widget.testimonials.app/v1/embed.js" │   │
│  │ ></script>                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                              [Copy Code]    │
│                                                             │
│  Works with: Webflow, WordPress, Squarespace, Wix,          │
│              Framer, Notion, Carrd, and more                │
│                                                             │
│  [View Integration Guides]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Alternatives Considered

### Alternative 1: iframe-based Embedding

**Approach:** Serve widgets via iframes like Testimonial.to

**Rejected because:**
- Requires iframe resizer script for dynamic height
- SEO implications (content not indexable)
- Some platforms restrict iframes
- Less seamless integration with host site

### Alternative 2: React/Vue Component Library

**Approach:** Publish npm package for framework users

**Deferred because:**
- Limits audience to developers
- Multiple framework versions to maintain
- Simple script embed covers 95% of use cases
- Can add later for advanced integrations

### Alternative 3: More Widget Types in MVP

**Approach:** Launch with 6+ widget types

**Rejected because:**
- Delays MVP launch
- Core 3 widgets cover most needs
- Can iterate based on user feedback
- Competitors confirm these 3 are most used

### Alternative 4: No Shadow DOM (Direct DOM)

**Approach:** Inject styles directly into host page

**Rejected because:**
- Style conflicts with host site CSS
- Unpredictable appearance
- Hard to debug customer issues
- Shadow DOM provides clean isolation

---

## Implementation Plan

### Phase 1: Data Layer

1. Create `widgets` table migration
2. Add Hasura metadata (permissions, relationships)
3. Create widget CRUD API endpoints
4. Create public widget data endpoint

### Phase 2: Widget Builder UI

1. Create widget list page (`/:org/widgets`)
2. Create widget builder page (`/:org/widgets/new`)
3. Implement live preview component
4. Add testimonial selection UI
5. Implement embed code generation modal

### Phase 3: Embed Script & Rendering

1. Build embed.js script (Vite library mode)
2. Implement Shadow DOM rendering
3. Create Wall of Love component
4. Create Carousel component
5. Create Single Quote component
6. Add responsive behavior

### Phase 4: Polish

1. Loading states and skeletons
2. Error handling for embed failures
3. Widget analytics (impressions, optional)
4. Integration guides documentation

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Core feature complete** | Users can display testimonials anywhere |
| **Revenue enabler** | Premium features (branding removal) drive upgrades |
| **Market parity** | Matches competitor offerings |
| **Extensible foundation** | Easy to add more widget types later |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **Script maintenance** | Version the embed script, graceful degradation |
| **Cross-origin complexity** | Proper CORS setup, CDN for reliability |
| **Style isolation limits** | Document known edge cases, provide CSS escape hatch |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance on slow sites | Medium | Medium | Async loading, lazy images |
| Browser compatibility | Low | High | Test major browsers, polyfills |
| Widget abuse/hotlinking | Low | Low | Rate limiting, referrer checks |

---

## File Structure

### Database

```
db/hasura/migrations/default/
└── XXXXXX_create_widgets_table/
    └── up.sql

db/hasura/metadata/databases/default/tables/
└── public_widgets.yaml
```

### API

```
api/src/features/widgets/
├── routes.ts                    # CRUD endpoints
├── getWidget.ts                 # Get widget by ID
├── listWidgets.ts               # List org widgets
├── createWidget.ts              # Create widget
├── updateWidget.ts              # Update widget
├── deleteWidget.ts              # Delete widget
├── getPublicWidget.ts           # Public endpoint for embed
├── types.ts                     # Widget types
└── __tests__/
    └── routes.test.ts
```

### Web App

```
apps/web/src/
├── entities/widget/
│   ├── composables/
│   │   ├── useWidgets.ts        # List widgets
│   │   ├── useWidget.ts         # Get single widget
│   │   └── useWidgetMutations.ts
│   └── models/
│       └── index.ts             # Widget types
│
├── features/widgetBuilder/
│   ├── ui/
│   │   ├── WidgetBuilder.vue
│   │   ├── WidgetTypeSelector.vue
│   │   ├── WidgetSettingsPanel.vue
│   │   ├── WidgetPreview.vue
│   │   ├── WidgetTestimonialSelector.vue
│   │   └── WidgetEmbedModal.vue
│   ├── composables/
│   │   └── useWidgetBuilder.ts
│   └── index.ts
│
└── pages/[org]/widgets/
    ├── index.vue                # Widget list
    ├── new.vue                  # Create widget
    └── [id]/
        └── edit.vue             # Edit widget
```

### Embed Script

```
packages/widget-embed/
├── src/
│   ├── index.ts                 # Entry point
│   ├── loader.ts                # Find & init widgets
│   ├── api.ts                   # Fetch widget data
│   ├── renderer.ts              # Shadow DOM setup
│   ├── components/
│   │   ├── WallOfLove.ts
│   │   ├── Carousel.ts
│   │   └── SingleQuote.ts
│   └── styles/
│       └── base.css
├── vite.config.ts               # Library build
└── package.json
```

---

## References

### Internal
- `research/research.md` - Competitor analysis and screenshots

### External
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Senja Widgets](https://senja.io/testimonial-widgets) - Competitor reference
- [Testimonial.to Widgets](https://testimonial.to/widgets) - Competitor reference
