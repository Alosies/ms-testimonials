# ADR-024: Widgets Research v1

## Status
Research

## Context
We need to determine what testimonial display widgets to support and what customization options to offer customers. This research analyzes competitors to inform our widget strategy.

## Competitors Analyzed
1. **Testimonial.to** - Market leader, credit-based pricing
2. **Senja.io** - Popular alternative with extensive widget variety
3. **Famewall.io** - Affordable option, good for solopreneurs
4. **Shoutout.io** - Video testimonial focus

## Widget Types Analysis

### High Priority Widgets (MVP)

Based on competitor analysis, these widgets appear on every platform and are marked as "Popular":

| Widget Type | Description | Use Case |
|-------------|-------------|----------|
| **Wall of Love / Masonry Grid** | Pinterest-style grid layout | Landing pages, dedicated testimonial pages |
| **Carousel** | Horizontal slider with navigation | Hero sections, product pages |
| **Single Quote** | Highlight one testimonial | Hero sections, pricing pages, CTAs |

### Medium Priority Widgets (Post-MVP)

| Widget Type | Description | Use Case |
|-------------|-------------|----------|
| **Marquee/Scrolling** | Auto-scrolling horizontal ticker | Social proof bars |
| **Avatar Badge** | Avatars + rating + count | Below CTAs, sign-up forms |
| **Video Single** | Single video testimonial embed | Landing pages, case studies |
| **Quote Grid** | Fixed grid of text quotes | About pages, trust sections |

### Lower Priority / Nice-to-Have

| Widget Type | Description | Use Case |
|-------------|-------------|----------|
| **Popup/Toast** | Notification-style testimonials | Site-wide social proof |
| **Dual Slider** | Two-row marquee | High-volume testimonial display |
| **Bold Highlights** | Text with highlighted quotes | Blog posts, long-form content |
| **Company Logos** | Customer logo display | Enterprise trust signals |
| **Rating Badge** | Aggregate rating display | Quick trust signals |

## Customization Options Analysis

### Essential Customizations (All Competitors Offer)

1. **Theme**
   - Light / Dark mode
   - Custom background color
   - Card/tile color

2. **Layout**
   - Number of columns (for grids)
   - Card spacing/gap
   - Maximum height/rows visible

3. **Content Display**
   - Show/hide star ratings
   - Show/hide date
   - Show/hide company/role
   - Show/hide avatar
   - Show/hide source icon (Twitter, LinkedIn, etc.)

4. **Typography**
   - Font family (inherit from site or custom)
   - Text size options (small, medium, large)

### Advanced Customizations (Premium Feature)

1. **Branding**
   - Remove "Powered by" branding
   - Custom brand colors
   - Custom fonts

2. **Filtering**
   - Filter by tags
   - Filter by rating
   - Filter by date range

3. **Animation**
   - Scroll speed (marquee)
   - Autoplay interval (carousel)
   - Hover effects

4. **Custom CSS**
   - Advanced users can inject custom CSS

## Embed Implementation Patterns

### Common Approach (Senja, Famewall)
```html
<div class="widget-embed" data-id="xxx" data-mode="shadow"></div>
<script async src="https://widget.example.com/embed.js"></script>
```

**Pros:**
- Simple copy-paste
- Shadow DOM isolates styles
- Dynamic updates without re-embedding

### iframe Approach (Testimonial.to)
```html
<iframe src="https://embed.example.com/wall/xxx"></iframe>
<script>iFrameResize({}, "#widget-iframe");</script>
```

**Pros:**
- Complete style isolation
- Works everywhere

**Cons:**
- Requires iframe resizer for dynamic height
- SEO implications (content not indexable)

### Recommendation
Use the **div + script approach with Shadow DOM** for:
- Better integration with customer sites
- No iframe restrictions
- Cleaner embed code
- Dynamic height handling

## Testimonial Card Components

Based on competitor analysis, each testimonial card typically contains:

```
┌─────────────────────────────────────────┐
│  ★★★★★                    [Source Icon] │
│                                         │
│  "The testimonial text content goes     │
│   here with optional highlighting..."   │
│                                         │
│  [Avatar] Name                          │
│           Role @ Company                │
│           Date                          │
│                                         │
│  [Video Thumbnail] (if video)           │
└─────────────────────────────────────────┘
```

### Key Observations

1. **Source Platform Icons** - Twitter/X, LinkedIn, G2, ProductHunt, Facebook, Google Reviews are commonly supported
2. **Text Highlighting** - Senja highlights key phrases with background color
3. **Video Integration** - Video testimonials show thumbnail with play button
4. **Social Proof** - Links back to original source when applicable
5. **Expandable Text** - Long testimonials have "Read more" functionality

## Pricing Patterns

| Platform | Free Tier | Paid Tiers |
|----------|-----------|------------|
| Testimonial.to | Credits system | $50-250/mo |
| Senja | 15 testimonials | $29-99/mo |
| Famewall | Unlimited testimonials | $9-29/mo |
| Shoutout | Limited features | Lifetime deals |

### Observation
- Most platforms offer unlimited widgets on paid plans
- Free tiers typically limit testimonial count, not widget types
- "Powered by" branding removal is premium feature

## Recommendations for Our Implementation

### Phase 1 (MVP)
1. **Wall of Love (Masonry Grid)**
   - Most requested widget type
   - Showcases volume of testimonials
   - Good for dedicated testimonial pages

2. **Carousel**
   - Perfect for landing page hero sections
   - Compact, doesn't dominate page
   - Auto-advance with manual controls

3. **Single Quote**
   - Simple but effective
   - Use near CTAs and pricing
   - Highlight best testimonial

### Phase 2
4. **Marquee/Ticker**
5. **Avatar Badge**
6. **Quote Grid**

### Customization Priority

**MVP:**
- Light/Dark theme
- Background color
- Show/hide ratings, avatar, date
- Max items displayed

**Post-MVP:**
- Custom fonts
- Custom CSS
- Filtering by tags
- Animation controls
- Remove branding (paid)

## Technical Considerations

1. **Performance**
   - Lazy load images
   - Lazy load widget script
   - Minimal JS bundle size

2. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation for carousels
   - Color contrast compliance

3. **Responsive Design**
   - Column count adapts to viewport
   - Mobile-first approach
   - Touch-friendly carousel

4. **SEO**
   - Shadow DOM approach allows content indexing
   - Structured data for testimonials (schema.org)

## Screenshots

See the following screenshots in `images/`:
- `images/testimonial-to-homepage.png` - Testimonial.to homepage
- `images/testimonial-to-widgets-list.png` - Testimonial.to widget types
- `images/testimonial-to-masonry-grid.png` - Wall of Love example
- `images/senja-homepage.png` - Senja homepage
- `images/senja-widgets-list.png` - Senja's extensive widget collection (23+ types)
- `images/senja-masonry-widget-demo.png` - Senja masonry widget demo
- `images/famewall-homepage.png` - Famewall homepage
- `images/famewall-widgets-showcase.png` - Famewall widget showcase
- `images/shoutout-homepage.png` - Shoutout homepage

## Next Steps

1. Create detailed specs for MVP widgets (Wall of Love, Carousel, Single Quote)
2. Design widget customization UI in dashboard
3. Define embed code generation system
4. Plan widget preview functionality
5. Determine pricing/feature gating strategy
