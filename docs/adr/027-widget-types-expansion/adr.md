# ADR-027: Widget Types Expansion

## Doc Connections
**ID**: `adr-027-widget-types-expansion`

2026-02-23 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-024-widgets-v1` - Widgets v1 (current 3 widget types, data model, embed architecture)
- `prd-testimonials-mvp` - MVP feature requirements

---

## Status

**Implemented** - 2026-03-07

- 2026-02-23: Competitive research completed, 4 new widget types proposed
- 2026-03-07: All 5 phases complete — DB, embed components, builder UI, E2E tests

---

## Context

### The Problem

We currently offer 3 widget types: **Wall of Love**, **Carousel**, and **Single Quote**. While these cover the core use cases, competitors offer significantly more variety:

| Platform | Widget Count | Notable Extras |
|----------|--------------|----------------|
| Senja.io | 23+ | Avatars grid, toast popups, quote grid, avatars pro (hero) |
| Famewall.io | 10 | Award-style badges, dual slider, social proof avatars, popup |
| Shapo.io | 8 | Marquee, floating toast, rating badge, review list |
| Endorsal | 5 | FOMO popup notifications, badge |

### Gap Analysis

Our 3 widgets all serve the same use case: **dedicated testimonial sections** (a block of space on a page reserved for testimonials). We're missing two categories that competitors universally offer:

| Category | Description | Our Coverage |
|----------|-------------|--------------|
| **Section widgets** | Dedicated page sections for testimonials | Wall of Love, Carousel, Single Quote |
| **Micro-widgets** | Small, lightweight social proof elements alongside other content | None |
| **Ambient widgets** | Passive background notifications that appear automatically | None |

### Business Value

| Value | Description |
|-------|-------------|
| **Competitive parity** | All 4 major competitors offer toast/popup and badge-style widgets |
| **New placement opportunities** | Micro-widgets go in hero sections, CTAs, pricing — places our current widgets can't |
| **Higher embed density** | More widget types = more embeds per customer = stickier product |
| **Premium differentiation** | Some new types (toast, avatars) are premium-only in competitor plans |

### Existing Infrastructure

From ADR-024, the following is already in place:
- **`widgets` table** with `type` CHECK constraint (`wall_of_love`, `carousel`, `single_quote`)
- **`widget_testimonials` junction table** for testimonial selection and ordering
- **`settings` JSONB column** for type-specific configuration (already extensible)
- **Embed script architecture** with Shadow DOM isolation and type-based rendering
- **Widget builder UI** with type selector, preview, and testimonial picker
- **Public API endpoint** (`GET /public/widgets/:id`) returning widget config + testimonials

The `settings` JSONB column and the embed script's component-per-type architecture make adding new types straightforward — no schema redesign needed, just a migration to expand the CHECK constraint and new render components.

---

## Decision

### Add 4 New Widget Types

Expand from 3 to 7 widget types, organized into three categories:

#### Category 1: Section Widgets (existing)
Already implemented — Wall of Love, Carousel, Single Quote.

#### Category 2: Micro-Widgets (new)

##### 4. Marquee Strip

**Use case:** Between-section dividers, footer area, logo-bar replacement

A continuously auto-scrolling horizontal strip of testimonial cards. Think "logo bar" but with testimonial quotes instead. Minimal vertical height, infinite horizontal loop.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ★★★★★ "Great product!" — John D.  │  ★★★★☆ "Changed my life" — J… │
│ ◀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ auto-scroll ━━ │
└──────────────────────────────────────────────────────────────────────┘
```

**Type-specific settings:**
```typescript
interface MarqueeSettings {
  speed: number;              // default: 30 (px/sec)
  direction: 'left' | 'right'; // default: 'left'
  pause_on_hover: boolean;    // default: true
  card_style: 'compact' | 'full'; // default: 'compact'
}
```

**Why this widget:**
- Offered by Shapo (Reviews Marquee), Famewall (Dual Slider)
- Very popular on modern SaaS landing pages — familiar UX pattern
- Low vertical footprint — fits anywhere without layout commitment
- Pure CSS animation possible — no JS overhead at runtime

##### 5. Rating Badge

**Use case:** Near CTAs, pricing tables, checkout pages, headers

A compact, self-contained badge showing aggregate star rating and review count. Designed to sit inline with other content, not as a standalone section.

```
┌─────────────────────────────────┐
│  ★★★★★  4.8/5 from 47 reviews  │
└─────────────────────────────────┘

  — or —

┌──────────────────────────────┐
│  ⭐ 4.8  •  47 reviews       │
│  Powered by Testimonials     │
└──────────────────────────────┘
```

**Type-specific settings:**
```typescript
interface RatingBadgeSettings {
  style: 'inline' | 'card';     // default: 'card'
  show_count: boolean;           // default: true
  show_average: boolean;         // default: true
  link_to_wall: string | null;   // default: null (optional URL to full Wall of Love)
}
```

**Data behavior:** Unlike other widgets which display selected testimonials, the badge **aggregates** data:
- Average rating computed from all selected testimonials (or all approved if none explicitly selected)
- Count = number of testimonials included
- No individual testimonial content displayed

**Why this widget:**
- Offered by Shapo (Review Badge), Famewall (Award Style)
- Smallest possible embed — fits inline in a sentence
- High conversion impact near purchase decisions
- Simplest to implement — no card rendering, just numbers

##### 6. Avatars Bar

**Use case:** Hero sections, above-the-fold social proof, signup forms

A row of overlapping customer profile photos with a trust statement. Ultra-lightweight social proof designed for hero sections.

```
┌────────────────────────────────────────┐
│  [😊][😊][😊][😊][😊] +42 more        │
│  Trusted by 47 happy customers         │
└────────────────────────────────────────┘
```

**Type-specific settings:**
```typescript
interface AvatarsBarSettings {
  max_avatars: number;            // default: 5
  overlap_px: number;             // default: 8
  size: 'small' | 'medium' | 'large'; // default: 'medium'
  label_template: string;         // default: 'Trusted by {count} happy customers'
  show_rating: boolean;           // default: true
}
```

**Data behavior:**
- Shows avatars from selected testimonials (falls back to initials when no photo)
- Count includes all selected/approved testimonials, even beyond `max_avatars`
- Clicking can optionally link to a full Wall of Love page

**Why this widget:**
- Offered by Senja (Avatars Grid, Avatars Pro), Famewall (Social Proof Avatars)
- The single most common social proof element on SaaS landing pages today
- Extremely small footprint — can go literally anywhere
- High perceived value despite simplicity

#### Category 3: Ambient Widgets (new)

##### 7. Toast Popup

**Use case:** Site-wide social proof, FOMO-style notifications, conversion nudging

A small floating notification that appears in a corner of the page, showing one testimonial at a time. Rotates through testimonials at a configurable interval. Clicking opens a modal with the full testimonial.

```
                                    ┌──────────────────────────┐
                                    │  ★★★★★                   │
                                    │  "Best investment we've  │
                                    │   made this year."       │
                                    │                          │
                                    │  — Tom W., CEO           │
                                    │         [Read more]  [×] │
                                    └──────────────────────────┘
```

**Type-specific settings:**
```typescript
interface ToastPopupSettings {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'; // default: 'bottom-left'
  display_duration: number;   // default: 8000 (ms) — how long each toast shows
  rotation_interval: number;  // default: 15000 (ms) — time between showing next toast
  delay_before_first: number; // default: 3000 (ms) — delay before first toast appears
  max_per_session: number;    // default: 5 — stop showing after N toasts per page visit
  show_dismiss: boolean;      // default: true
  animate_in: 'slide' | 'fade'; // default: 'slide'
}
```

**Why this widget:**
- Offered by Senja (Testimonial Toast), Shapo (Floating Review Toast), Famewall (Popup), Endorsal (FOMO Popup)
- Universal across all 4 competitors — the most requested widget type we're missing
- Works site-wide without any layout changes to the host page
- High conversion impact — similar to "X just purchased..." notifications but with testimonials
- Different embed approach: runs as a floating overlay, not inline

---

### Database Changes

#### Migration: Expand Widget Type CHECK Constraint

```sql
-- Drop and recreate the type CHECK constraint to include new types
ALTER TABLE public.widgets
  DROP CONSTRAINT IF EXISTS widgets_type_check;

ALTER TABLE public.widgets
  ADD CONSTRAINT widgets_type_check
  CHECK (type IN (
    'wall_of_love',
    'carousel',
    'single_quote',
    'marquee',
    'rating_badge',
    'avatars_bar',
    'toast_popup'
  ));

-- Update column comment
COMMENT ON COLUMN public.widgets.type IS 'Layout type: wall_of_love (grid), carousel (slider), single_quote (featured), marquee (auto-scroll strip), rating_badge (compact rating), avatars_bar (hero social proof), toast_popup (floating notification)';
```

No other schema changes needed — the `settings` JSONB column already handles type-specific config per ADR-024.

#### Hasura Metadata

Update `public_widgets.yaml` enum values if any enum constraints are defined in metadata (verify during implementation).

---

### Embed Script Changes

Add 4 new render components in `packages/widget-embed/`:

```
packages/widget-embed/src/components/
├── WallOfLove.ts       # ✅ EXISTS
├── Carousel.ts         # ✅ EXISTS
├── SingleQuote.ts      # ✅ EXISTS
├── Marquee.ts          # 🔲 NEW
├── RatingBadge.ts      # 🔲 NEW
├── AvatarsBar.ts       # 🔲 NEW
└── ToastPopup.ts       # 🔲 NEW
```

The embed script's existing type→component dispatch pattern (`renderer.ts`) already supports this — just register new type mappings.

**Toast Popup special handling:** Unlike inline widgets, the toast popup doesn't render inside the target `<div>`. Instead, it appends a fixed-position overlay to the Shadow DOM host, independent of page scroll. The `loader.ts` initialization logic needs a branching path for overlay-type widgets.

---

### Widget Builder UI Changes

#### Type Selector

Expand the type selector grid from 3 to 7 options, organized by category:

```
┌─────────────────────────────────────────────────────────────────┐
│  Widget Type:                                                    │
│                                                                  │
│  Section Widgets                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Wall of  │ │ Carousel │ │ Single   │                        │
│  │ Love     │ │          │ │ Quote    │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                  │
│  Micro Widgets                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Marquee  │ │ Rating   │ │ Avatars  │                        │
│  │ Strip    │ │ Badge    │ │ Bar      │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                  │
│  Ambient Widgets                                                 │
│  ┌──────────┐                                                   │
│  │ Toast    │                                                   │
│  │ Popup    │                                                   │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Settings Panel

Each new type gets its own settings section in the Design tab. Follow the same pattern as the existing carousel/grid settings — type-specific fields that map to the `settings` JSONB.

#### Preview

Live preview in the widget builder should render a preview of each new type. For toast popup, show a simulated corner overlay within the preview pane.

---

### Implementation Priority

Implement in two phases to ship value incrementally:

#### Phase 1: Micro-Widgets (lower complexity, high value)

| Order | Widget | Effort | Notes |
|-------|--------|--------|-------|
| 1 | **Rating Badge** | Small | Simplest — just render numbers, no cards |
| 2 | **Avatars Bar** | Small | Avatar row + count text, no scrolling logic |
| 3 | **Marquee Strip** | Medium | CSS animation for continuous scroll, pause-on-hover |

**Phase 1 deliverables:**
- DB migration (expand CHECK constraint for all 4 new types at once)
- 3 embed components (RatingBadge, AvatarsBar, Marquee)
- Widget builder type selector expansion
- Type-specific settings panels
- Live preview for each new type

#### Phase 2: Ambient Widget (different rendering paradigm)

| Order | Widget | Effort | Notes |
|-------|--------|--------|-------|
| 4 | **Toast Popup** | Medium-Large | Overlay positioning, rotation timer, session tracking, dismiss behavior |

**Phase 2 deliverables:**
- Toast embed component with fixed-position overlay
- Loader.ts update for overlay-type widget initialization
- Session-aware rotation (max_per_session tracking via sessionStorage)
- Builder preview with simulated toast appearance
- Dismiss UX and animation

---

### Shared Display Toggle Applicability

The existing boolean columns on `widgets` (`show_ratings`, `show_dates`, `show_company`, `show_avatar`) apply differently per widget type:

| Toggle | Wall of Love | Carousel | Single Quote | Marquee | Rating Badge | Avatars Bar | Toast Popup |
|--------|-------------|----------|--------------|---------|-------------|-------------|-------------|
| `show_ratings` | Yes | Yes | Yes | Yes | N/A (always shows aggregate) | Optional (below avatars) | Yes |
| `show_dates` | Yes | Yes | Yes | No (too compact) | No | No | No |
| `show_company` | Yes | Yes | Yes | Yes | No | No | Yes |
| `show_avatar` | Yes | Yes | Yes | No (too compact) | No | N/A (always shows) | Yes |

The builder Design tab should show/hide toggle controls based on the selected widget type.

---

## Alternatives Considered

### Alternative 1: Add Only Marquee + Toast (2 widgets)

**Approach:** Just add the two most universally offered competitor widgets.

**Rejected because:**
- Misses the "micro-widget" category entirely (badge, avatars)
- Micro-widgets serve different placements than section widgets — high incremental value
- Badge and avatars are low-effort additions that round out the offering

### Alternative 2: Add 8+ Widget Types (Match Famewall)

**Approach:** Add Quote Grid, Dual Slider, Plain Grid, Award Style, etc. to match or exceed Famewall's 10 types.

**Rejected because:**
- Many are visual variants of the same layout (e.g., "Quote Grid" vs "Plain Colored Grid" vs "Famewall Grid")
- Diminishing returns after covering the 3 categories (section, micro, ambient)
- More types = more builder UI complexity, more preview code, more maintenance
- Can add visual variants later as "themes" within existing types rather than new types

### Alternative 3: Toast Popup as Standalone (Not a Widget)

**Approach:** Build the toast popup as a separate feature with its own embed script, not part of the widget system.

**Rejected because:**
- Duplicates infrastructure (separate API, separate builder, separate embed)
- Users already understand the widget mental model — "create widget, pick type, embed"
- Same data (testimonials + customization) drives it
- Overlay rendering is a loader.ts concern, not an architectural difference

### Alternative 4: Implement All 4 in One Phase

**Approach:** Ship all 4 new widget types together.

**Rejected because:**
- Toast popup has a fundamentally different rendering model (overlay vs inline)
- Phase 1 (micro-widgets) can ship faster and deliver value immediately
- Phased approach reduces risk and allows user feedback before toast implementation

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Competitive parity** | Matches the widget variety of Shapo (8) and approaches Famewall (10) |
| **New placement categories** | Micro-widgets and ambient widgets open placements our current types can't serve |
| **Higher embed density** | More types per customer = more touchpoints = stickier product |
| **Premium upsell potential** | Toast popup and avatars bar are premium-tier features at competitors |
| **Minimal schema changes** | Single CHECK constraint migration — no new tables or columns |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **More embed components to maintain** | Each is small and self-contained; shared base styles |
| **Builder UI complexity** | Category grouping keeps type selector organized |
| **More preview variations** | Preview components share the same data layer, only rendering differs |
| **Toast popup requires overlay logic** | Isolated to a single component; doesn't affect inline widgets |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Toast popup conflicts with host site popups | Medium | Low | Configurable position, z-index management, dismiss button |
| Marquee performance on low-end devices | Low | Low | Use CSS transforms (GPU-accelerated), `will-change` hints |
| Badge aggregate calculation accuracy | Low | Medium | Compute on API side, not in embed script; cache with widget data |
| Type selector overwhelming with 7 options | Low | Low | Category grouping, brief descriptions, visual previews |

---

## File Structure

### Database

```
db/hasura/migrations/default/
└── XXXXXX__widgets__expand_type_check/     # 🔲 NEW
    └── up.sql                               # Expand CHECK for 4 new types
```

### Embed Script

```
packages/widget-embed/src/
├── components/
│   ├── WallOfLove.ts       # ✅ EXISTS
│   ├── Carousel.ts         # ✅ EXISTS
│   ├── SingleQuote.ts      # ✅ EXISTS
│   ├── Marquee.ts          # 🔲 NEW
│   ├── RatingBadge.ts      # 🔲 NEW
│   ├── AvatarsBar.ts       # 🔲 NEW
│   └── ToastPopup.ts       # 🔲 NEW
├── styles/
│   ├── base.css            # ✅ EXISTS
│   ├── marquee.css         # 🔲 NEW (keyframe animations)
│   └── toast.css           # 🔲 NEW (overlay positioning)
├── loader.ts               # ✅ EXISTS (update: overlay widget branch)
└── renderer.ts             # ✅ EXISTS (update: register new types)
```

### Web App (Widget Builder)

```
apps/web/src/features/widgetBuilder/ui/
├── WidgetTypeSelector.vue  # ✅ EXISTS (update: 7 types, categories)
├── WidgetSettingsPanel.vue  # ✅ EXISTS (update: new type settings)
├── WidgetPreview.vue       # ✅ EXISTS (update: new type previews)
└── previews/
    ├── MarqueePreview.vue   # 🔲 NEW
    ├── RatingBadgePreview.vue # 🔲 NEW
    ├── AvatarsBarPreview.vue  # 🔲 NEW
    └── ToastPopupPreview.vue  # 🔲 NEW

apps/web/src/entities/widget/models/
└── index.ts                # ✅ EXISTS (update: add new type + settings interfaces)
```

---

## References

### Internal
- `docs/adr/024-widgets-v1/adr.md` — Widget v1 architecture, data model, embed strategy
- `docs/adr/024-widgets-v1/research/research.md` — Original competitor analysis

### External
- [Senja - Testimonial Widgets](https://senja.io/testimonial-widgets) — 23+ widget types, avatars grid, toast popup
- [Shapo - Testimonial Widgets](https://shapo.io/testimonial-widgets) — Marquee, floating toast, rating badge
- [Famewall - Widget Showcase](https://famewall.io/testimonial-widgets-showcase/) — Social proof avatars, award style, popup
- [Endorsal - Widget Features](https://www.endorsal.io/features/widgets) — FOMO popup notifications
