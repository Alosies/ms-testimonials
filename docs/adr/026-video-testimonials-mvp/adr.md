# ADR-026: Video Testimonials (Upload-Only MVP)

## Doc Connections
**ID**: `adr-026-video-testimonials-mvp`

2026-02-23 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-004-media-upload` - Media upload architecture (S3, Lambda, webhook, media table)
- `adr-024-widgets-v1` - Widget builder (Wall of Love video card mockup)
- `adr-025-testimonials-display` - Testimonials list and detail views

---

## Status

**Proposed** - 2026-02-23

- 2026-02-23: Initial proposal after infrastructure audit

---

## Context

### The Problem

Video testimonials are an increasingly expected feature in the testimonial collection space. Competitors like Shoutout.io lead with a video-first approach. Without video support, customers may bounce from the MVP before evaluating the product's core AI-powered text flow.

Currently:
1. The `testimonials` table is **text-only** — no `type` column, no video reference
2. The public form flow has **no video upload step** — only text-based question/answer collection
3. The dashboard and widgets have **no video playback** — everything renders as text cards
4. The `testimonial_video` entity type is **seeded but disabled** (`is_active = false`)

### Business Value

| Value | Description |
|-------|-------------|
| **Reduced bounce risk** | Customers expect video as table stakes; missing it signals an incomplete product |
| **Competitive parity** | Matches Shoutout.io, Testimonial.to, and VideoAsk on core capability |
| **Higher trust signals** | Video testimonials convert 2-3x better than text for end viewers |
| **Upsell opportunity** | Video storage/bandwidth creates natural premium tier differentiation |

### Existing Infrastructure

The media upload pipeline from ADR-004 is **largely built** and designed with video in mind:

| Component | Status | Location |
|-----------|--------|----------|
| `media` table with `duration_seconds`, `thumbnail_path` | Implemented | `db/hasura/migrations/` |
| `testimonial_video` entity type (500MB, mp4/mov/webm) | Seeded, `is_active = false` | Same migration seed data |
| `media-service` package (S3 presign + path builder) | Implemented | `packages/libs/media-service/src/` |
| `POST /media/presign` API endpoint | Implemented | `api/src/features/media/presign/` |
| `POST /webhooks/s3-media-upload` webhook | Implemented | `api/src/features/media/webhook/` |
| Lambda validator with video MIME types + 500MB limit | Implemented | `infrastructure/lambdas/media-validator/` |
| S3 buckets (dev/qa/prod) | Deployed | AWS accounts per environment |
| `MediaUploader.vue` component | Implemented | `apps/web/src/entities/media/` |
| `useUploadMedia` composable | Implemented | `apps/web/src/entities/media/composables/` |
| Widget Wall of Love video card mockup | Designed | ADR-024 |

**What's NOT built:**
- Linking a video to a testimonial (no `video_media_id` column)
- Distinguishing text vs video testimonials (no `type` column)
- Video upload step in the public form flow
- Video playback in dashboard or widgets
- Video thumbnail generation

---

## Decision

### Scope: Upload-Only, No In-Browser Recording

Support video testimonials via **file upload only** for MVP. Customers upload video files (mp4/mov/webm) from their device — no in-browser webcam recording.

**Rationale:**
- The S3 presign + upload pipeline already works — we build on proven plumbing
- File upload UX is straightforward (drag-drop or file picker)
- Most customers already have videos on their phone gallery or desktop
- In-browser recording (MediaRecorder API) requires significant UI/UX effort: camera permissions, recording controls, preview/re-record flow, cross-browser testing
- Upload-only can ship in days; recording would add weeks

### Schema Changes

#### 1. Add `type` and `video_media_id` to `testimonials` table

```sql
-- Add testimonial type discriminator
ALTER TABLE public.testimonials
  ADD COLUMN type TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text', 'video'));

-- Add video media reference
ALTER TABLE public.testimonials
  ADD COLUMN video_media_id TEXT REFERENCES public.media(id) ON DELETE SET NULL;

-- Index for filtering by type
CREATE INDEX idx_testimonials_type ON public.testimonials(type);

-- Comment
COMMENT ON COLUMN public.testimonials.type IS
  'Testimonial format: text (AI-assembled or manual) or video (uploaded file)';
COMMENT ON COLUMN public.testimonials.video_media_id IS
  'FK to media table for video testimonials. NULL for text testimonials.';
```

#### 2. Enable `testimonial_video` entity type

```sql
UPDATE public.media_entity_types
SET is_active = true
WHERE code = 'testimonial_video';
```

#### 3. Hasura metadata

- Add `video_media` object relationship on `testimonials` → `media` (via `video_media_id`)
- Expose `type` and `video_media_id` columns in existing permissions
- Add `video_media` relationship to select permissions

### Video Upload in Public Form Flow

Add a new form step type `video_upload` that appears as an alternative to the text-based `testimonial_write` step. The form configuration determines which collection mode is presented.

#### Form-Level Configuration

No new `testimonial_type` column on the `forms` table for MVP. Instead, use the existing `form_steps` system — if a form has a `video_upload` step, it collects video; if it has a `testimonial_write` step, it collects text. A form can have both for a "customer's choice" flow.

#### Video Upload Step UI

```
┌──────────────────────────────────────────────┐
│                                              │
│      Upload your video testimonial           │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │     ┌──────────────────────┐           │  │
│  │     │   📁  Drop video    │           │  │
│  │     │   here or click     │           │  │
│  │     │   to browse         │           │  │
│  │     │                     │           │  │
│  │     │   MP4, MOV, WebM    │           │  │
│  │     │   Up to 500MB       │           │  │
│  │     └──────────────────────┘           │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  After upload:                               │
│  ┌────────────────────────────────────────┐  │
│  │  ┌──────────┐  video-testimonial.mp4   │  │
│  │  │ ▶ Preview │  12.4 MB  ✓ Uploaded    │  │
│  │  └──────────┘  [Remove]                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│                          [Continue →]        │
└──────────────────────────────────────────────┘
```

The step reuses the existing `MediaUploader.vue` component with `entityType: 'testimonial_video'`.

#### Upload Flow (Sequence)

```
Customer                Frontend              API                S3              Lambda
   │                       │                    │                 │                 │
   │  1. Select file       │                    │                 │                 │
   │──────────────────────▶│                    │                 │                 │
   │                       │  2. POST /media/   │                 │                 │
   │                       │     presign        │                 │                 │
   │                       │───────────────────▶│                 │                 │
   │                       │                    │ 3. Create media │                 │
   │                       │                    │    record       │                 │
   │                       │                    │    (pending)    │                 │
   │                       │  4. { uploadUrl,   │                 │                 │
   │                       │     mediaId }      │                 │                 │
   │                       │◀───────────────────│                 │                 │
   │  5. Progress bar      │  6. PUT to S3      │                 │                 │
   │◀──────────────────────│─────────────────────────────────────▶│                 │
   │                       │                    │                 │  7. Validate    │
   │                       │                    │                 │────────────────▶│
   │                       │                    │  8. Webhook     │                 │
   │                       │                    │◀────────────────────────────────── │
   │                       │                    │ 9. Update media │                 │
   │                       │                    │    (ready)      │                 │
   │                       │                    │                 │                 │
   │  10. Submit form      │                    │                 │                 │
   │──────────────────────▶│ 11. Create         │                 │                 │
   │                       │    testimonial     │                 │                 │
   │                       │    (type=video,    │                 │                 │
   │                       │    video_media_id) │                 │                 │
   │                       │───────────────────▶│                 │                 │
```

### Dashboard Display

Video testimonials appear in the same `TestimonialsTable` (ADR-025) with visual differentiation:

| Aspect | Text Testimonial | Video Testimonial |
|--------|-----------------|-------------------|
| **Content column** | Truncated text | Video icon + "Video testimonial" label + duration |
| **Detail panel** | Full text content | Inline `<video>` player with controls |
| **Thumbnail** | N/A | Browser-generated poster frame (first frame) |

The detail panel renders a native `<video>` element for video testimonials:

```html
<video
  v-if="testimonial.type === 'video'"
  :src="videoUrl"
  controls
  preload="metadata"
  class="w-full rounded-lg"
/>
```

Video URL is constructed from `media.storage_path` via the CDN (ImageKit supports video delivery) or directly from S3 with a presigned download URL.

### Widget Display

Video testimonials in widgets (Wall of Love, Carousel) show as cards with a play button overlay. Clicking opens an inline player or lightbox.

```
┌─────────────────┐
│ ┌─────────────┐ │
│ │             │ │
│ │    ▶ Play   │ │
│ │             │ │
│ └─────────────┘ │
│ ★★★★★           │
│ John Doe        │
│ CEO, Acme Corp  │
└─────────────────┘
```

Since the widget embed script is still TODO (ADR-024), video playback support is built into the widget design from the start rather than retrofitted.

### Video Serving Strategy (MVP)

For MVP, serve videos directly through S3 presigned download URLs or via ImageKit (which supports video delivery). No transcoding or adaptive streaming.

**Constraints accepted for MVP:**
- No HLS/DASH adaptive bitrate streaming
- No server-side thumbnail generation (use `<video>` poster frame or `preload="metadata"`)
- No video compression/transcoding (serve as-uploaded)
- Maximum file size: 500MB (enforced by Lambda)

### What We Explicitly Defer

| Feature | Reason | When |
|---------|--------|------|
| **In-browser recording** | Significant UI/UX effort (camera, recording controls, re-record) | Post-MVP, separate ADR |
| **Video transcoding** | Requires async processing queue (SQS + FFmpeg Lambda/ECS) | Post-MVP, when bandwidth costs justify |
| **Adaptive streaming (HLS)** | Over-engineered for MVP volumes | Post-MVP, if video becomes primary format |
| **AI video transcription** | Whisper/Deepgram integration for video-to-text | Post-MVP, pairs with transcoding pipeline |
| **Server-side thumbnails** | FFmpeg thumbnail extraction | Post-MVP, use browser `preload="metadata"` for now |
| **Video trimming/editing** | Client-side video editor | Post-MVP |

---

## Alternatives Considered

### Alternative 1: Full Video Recording + Upload

**Approach:** Build both in-browser webcam recording and file upload from day one.

**Deferred because:**
- MediaRecorder API has cross-browser inconsistencies (Safari codec support, mobile quirks)
- Recording UI requires: camera permission flow, countdown timer, recording indicator, preview, re-record, pause/resume
- Doubles the frontend work for a feature that upload-only covers adequately
- Can be added post-MVP without any schema or API changes (same `testimonial_video` entity type)

### Alternative 2: Third-Party Video Platform (Loom, Vimeo)

**Approach:** Integrate with Loom SDK or Vimeo API for recording and hosting.

**Rejected because:**
- Adds external dependency and cost per video
- Less control over UX and branding
- Vendor lock-in on video storage
- Our S3 + CDN infrastructure already handles this

### Alternative 3: Skip Video Entirely for MVP

**Approach:** Launch text-only, add video in v2.

**Rejected because:**
- Competitive analysis shows video is expected (Shoutout.io, Testimonial.to, VideoAsk)
- Risk of customer bounce before they experience the AI text flow differentiator
- The infrastructure is 80% built — the marginal effort is low
- Text-only positioning risks being perceived as "yet another text testimonial tool"

### Alternative 4: URL-Only (Paste a YouTube/Loom Link)

**Approach:** Accept video URLs instead of hosting files. Store as a `video_url` text field.

**Deferred because:**
- Poor UX for customers (they must upload to YouTube/Loom first, then paste)
- No control over video availability (link could break)
- Embedding third-party players has inconsistent styling
- Can't generate thumbnails or extract metadata
- Could be added later as an additional source alongside native upload

---

## Implementation Plan

### Phase 1: Database & API Foundation

1. Create migration: add `type` and `video_media_id` columns to `testimonials` table
2. Create migration: enable `testimonial_video` entity type (`is_active = true`)
3. Update Hasura metadata: expose new columns, add `video_media` relationship
4. Update Hasura permissions: allow `type` and `video_media_id` in insert/select
5. Update `TestimonialBasic.gql` fragment to include `type` and `video_media` fields
6. Run GraphQL codegen

**Files:**
```
db/hasura/migrations/default/TIMESTAMP_video_testimonials/
├── up.sql                                                    # 🔲 NEW
└── down.sql                                                  # 🔲 NEW
db/hasura/metadata/databases/default/tables/public_testimonials.yaml  # ✅ EXISTS (update)
apps/web/src/entities/testimonial/graphql/fragments/
└── TestimonialBasic.gql                                      # ✅ EXISTS (update)
```

### Phase 2: Public Form Video Upload Step

1. Add `video_upload` to the step type registry
2. Create `VideoUploadStep.vue` component using `MediaUploader.vue`
3. Wire video upload into form submission flow — on submit, pass `video_media_id` to testimonial creation
4. Update testimonial creation API to accept `type` and `video_media_id`

**Files:**
```
apps/web/src/features/publicForm/ui/steps/
└── VideoUploadStep.vue                                       # 🔲 NEW
apps/web/src/features/publicForm/composables/
└── usePublicFormFlow.ts                                      # ✅ EXISTS (update)
api/src/features/testimonials/
└── submit.ts                                                 # ✅ EXISTS (update)
```

### Phase 3: Dashboard Video Display

1. Update `TestimonialsTableRow.vue` to show video icon + duration for video testimonials
2. Update `TestimonialDetailPanel.vue` to render `<video>` player for video type
3. Add video URL resolution (CDN or presigned download URL)

**Files:**
```
apps/web/src/features/testimonialsList/ui/
├── TestimonialsTableRow.vue                                  # ✅ EXISTS (update)
└── TestimonialDetailPanel.vue                                # ✅ EXISTS (update)
apps/web/src/entities/media/composables/
└── useMediaUrl.ts                                            # ✅ EXISTS (update: add video URL support)
```

### Phase 4: Widget Video Support

1. Design video card variant for Wall of Love and Carousel widgets
2. Implement inline video player or lightbox in widget embed
3. This phase can overlap with widget embed implementation (ADR-024)

**Files:**
```
packages/widget-embed/src/
└── components/VideoCard.ts                                   # 🔲 NEW (with widget embed)
```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Competitive parity** | Matches market expectation for video testimonial collection |
| **Low marginal effort** | Media infrastructure is 80% built; schema + UI changes are incremental |
| **No new infrastructure** | Reuses S3, Lambda, webhook, media service — zero new AWS resources |
| **Forward-compatible** | Schema supports adding recording, transcoding, and transcription later |
| **Clean upgrade path** | Upload-only → add recording → add transcoding → add AI transcription, each independently |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **No in-browser recording** | Most customers can upload from phone gallery; recording added post-MVP |
| **No transcoding** | Serve as-uploaded; acceptable for MVP volumes and file sizes |
| **No thumbnails** | Browser `preload="metadata"` shows first frame; server-side thumbnails post-MVP |
| **Large file sizes** | 500MB limit is generous; can reduce or add compression guidance later |
| **Storage costs** | S3 Standard pricing; move to Infrequent Access for older videos post-MVP |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Large uploads failing mid-way | Medium | Medium | S3 multipart upload support in presign flow; retry logic in `useUploadMedia` |
| Video playback issues (codec) | Low | Medium | Accept only mp4/webm/mov; browser-native `<video>` handles these well |
| Storage costs scaling | Low (early) | Medium | Monitor S3 usage; add lifecycle policies to move old videos to IA tier |
| Customers expecting recording | Medium | Low | Upload covers most use cases; recording is a fast follow |

---

## References

### Internal
- `docs/adr/004-media-upload-architecture.md` — Full media pipeline architecture (S3, Lambda, webhook)
- `docs/adr/024-widgets-v1/adr.md` — Widget video card mockup in Wall of Love
- `docs/adr/025-testimonials-display/adr.md` — Testimonials list and detail panel
- `packages/libs/media-service/src/` — Media service with `testimonial_video` entity type
- `api/src/features/media/presign/` — Presigned URL endpoint
- `api/src/features/media/webhook/` — S3 upload webhook handler
- `infrastructure/lambdas/media-validator/` — Lambda with video MIME validation
- `apps/web/src/entities/media/` — Frontend media components and composables

### External
- [ImageKit Video Delivery](https://imagekit.io/use-cases/video-api/) — CDN video serving with transforms
- [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — For future in-browser recording reference
- [S3 Multipart Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) — For large file upload reliability
