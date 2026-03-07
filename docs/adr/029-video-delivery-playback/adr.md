# ADR-029: Video Delivery, Playback & Transcoding

## Doc Connections
**ID**: `adr-029-video-delivery-playback`

2026-03-07 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-026-video-testimonials-mvp` - Video testimonials scope, schema, and upload flow
- `adr-004-media-upload` - Media upload architecture (S3, Lambda, webhook, media table)
- `adr-024-widgets-v1` - Widget builder (video card in Wall of Love)

---

## Status

**Proposed** - 2026-03-07

- 2026-03-07: Initial proposal — companion to ADR-026, covering delivery, transcoding, codec strategy, player selection, and mobile playback
- 2026-03-07: Revised — switched from AWS MediaConvert to Bunny Stream for MVP speed; MediaConvert + CloudFront documented as scale-up path

---

## Context

### The Problem

ADR-026 establishes the scope and schema for video testimonials (upload-only MVP) but defers critical technical decisions about how videos are actually delivered and played. Without these decisions, we risk:

1. **Broken playback** — iPhone users record in HEVC/H.265 by default (`.mov`). These files do not play in Firefox at all and have inconsistent Chrome support. Without transcoding, ~15% of browsers will show a blank player.
2. **Poor mobile UX** — Without `playsinline`, iOS forces fullscreen on video start. Without poster frames, users see a black rectangle until the video loads.
3. **No CDN strategy** — Serving 500MB videos directly from S3 presigned URLs is slow and expensive at scale. No edge caching, no adaptive bitrate.
4. **Widget embed fragility** — The native `<video>` tag has no customizable controls, inconsistent styling across browsers, and no HLS support outside Safari. Testimonial widgets embedded on third-party sites need a reliable, branded player.
5. **No thumbnail generation** — The `media` table has `thumbnail_path` and `duration_seconds` columns (from ADR-004) but nothing populates them.

### Design Priority: Speed to Market

This is an MVP. The goal is to ship reliable video testimonials with minimal infrastructure overhead. We favor managed services over self-built pipelines, accepting vendor dependency in exchange for dramatically reduced implementation time and operational burden.

### Why Transcoding is Mandatory

| Upload Scenario | Without Transcoding | With Transcoding |
|----------------|-------------------|-----------------|
| iPhone `.mov` (HEVC/H.265) | Fails in Firefox, inconsistent in Chrome | Plays everywhere |
| Android `.mp4` (H.264) | Works but may be 4K/60fps (wasteful) | Normalized to 720p |
| Desktop `.webm` (VP9) | Works in Chrome/Firefox, inconsistent Safari < Big Sur | Plays everywhere |
| Any format, any bitrate | Wildly varying file sizes and bandwidth usage | Consistent quality and size |

H.264 (AVC) in an MP4 container with AAC audio is the only codec combination with universal browser support (~98%).

### Existing Infrastructure (from ADR-004 & ADR-026)

| Component | Status | Relevant Detail |
|-----------|--------|-----------------|
| S3 presigned upload pipeline | Built | Browser uploads directly to S3 via presigned URL |
| Lambda media validator | Built | Validates MIME types (video/mp4, video/quicktime, video/webm), max 500MB |
| ImageKit CDN | Built | Configured with S3 as origin, used for **image** transforms |
| `media` table | Built | Has `duration_seconds`, `thumbnail_path`, `processing_metadata` (JSONB) columns |
| `testimonial_video` entity type | Seeded | `is_active = false`, 500MB limit, mp4/mov/webm |
| `MediaUploader.vue` + `useUploadMedia` | Built | Drag-drop upload with progress tracking |
| `useMediaUrl` composable | Built | ImageKit URL generation with transform presets |

### Key Questions This ADR Answers

1. How do we ensure uploaded videos play across all browsers and devices?
2. What CDN/delivery strategy serves videos efficiently?
3. What video player do we use in the dashboard vs. widget embeds?
4. How do we handle mobile autoplay policies and inline playback?
5. How do we generate thumbnails and extract duration?

---

## Decision

### 1. Transcoding & Delivery: Bunny Stream

**Use Bunny Stream as the managed video platform for MVP.** Bunny Stream handles transcoding, CDN delivery, thumbnail generation, and duration extraction — eliminating the need to build a custom transcoding pipeline.

#### Why Bunny Stream

| Criteria | Bunny Stream | AWS MediaConvert + CloudFront | Lambda + FFmpeg | Mux |
|----------|-------------|-------------------------------|-----------------|-----|
| Transcoding | Auto (on upload) | Managed, any codec | Manual FFmpeg packaging | Auto (on upload) |
| CDN delivery | Included (114+ PoPs) | Separate (CloudFront) | None (bring your own) | Included |
| Thumbnails | Auto-generated | Yes (frame capture in job) | Yes (FFmpeg) | Auto-generated |
| Duration | Auto-extracted | Yes (job metadata) | Yes (FFmpeg probe) | Auto-extracted |
| Cost (2K min/mo) | ~$12/mo | ~$60/mo (transcode) + CDN | ~$2-4/mo (compute) + CDN | ~$6/mo (free 100K delivery min) |
| Infrastructure to build | API integration only | IAM role + EventBridge + Lambda + DLQ + reconciliation cron | FFmpeg layer + error handling | API integration only |
| Time to implement | Days | Weeks | Weeks | Days |
| New vendor | Yes | No (AWS-native) | No | Yes |

**Bunny Stream is chosen because:**
- **Fastest to ship** — API integration only, no AWS infrastructure to provision (IAM roles, EventBridge rules, Lambdas, DLQs, reconciliation crons)
- **Cheapest all-in** — ~$12/mo covers transcoding + CDN + thumbnails + storage at MVP volumes. MediaConvert alone would be ~$60/mo plus CloudFront costs.
- **Free transcoding** — automatically converts any input to H.264 MP4 with adaptive streaming
- **Thumbnails and duration included** — auto-generated on upload, no separate extraction pipeline
- **114+ PoP CDN** — global edge delivery included, no separate CDN setup
- **Simple error model** — Bunny provides webhook on completion/failure. No EventBridge → Lambda → DLQ chain.

#### Pipeline Flow

```
Customer              Frontend              API                S3              Bunny Stream
   |                       |                    |                 |                    |
   |  1. Select file       |                    |                 |                    |
   |---------------------->|                    |                 |                    |
   |                       | 2. POST /media/    |                 |                    |
   |                       |    presign         |                 |                    |
   |                       |------------------>|                  |                    |
   |                       |                    | 3. Create media  |                    |
   |                       |                    |    record        |                    |
   |                       |                    |    (pending)     |                    |
   |                       |                    |                  |                    |
   |                       | 4. { uploadUrl,    |                  |                    |
   |                       |   mediaId }        |                  |                    |
   |                       |<------------------|                  |                    |
   |  5. Progress bar      | 6. PUT to S3       |                 |                    |
   |<----------------------|---------------------------------->  |                    |
   |                       |                    |                  |                    |
   |                       |                    | 7. Lambda        |                    |
   |                       |                    |    validates     |                    |
   |                       |                    |<-----------------|                    |
   |                       |                    |                  |                    |
   |                       |                    | 8. Upload to     |                    |
   |                       |                    |    Bunny Stream  |                    |
   |                       |                    |---------------------------------->   |
   |                       |                    |                  |                    |
   |                       |                    | 9. Update media  |  10. Transcode     |
   |                       |                    |    status =      |      + thumbnail   |
   |                       |                    |    processing    |      + duration    |
   |                       |                    |                  |                    |
   |                       |                    | 11. Webhook:     |                    |
   |                       |                    |     encoding     |                    |
   |                       |                    |     complete     |                    |
   |                       |                    |<------------------------------------- |
   |                       |                    |                  |                    |
   |                       |                    | 12. Update media:|                    |
   |                       |                    |     status=ready |                    |
   |                       |                    |     bunny_id     |                    |
   |                       |                    |     thumbnail    |                    |
   |                       |                    |     duration     |                    |
```

**Key design decisions in this flow:**

1. **S3 remains the initial upload target** — the existing presign + Lambda validation pipeline is unchanged. S3 is the "landing zone."
2. **API uploads from S3 to Bunny** — after Lambda validation succeeds, the webhook handler downloads from S3 and uploads to Bunny Stream via their API. This keeps the upload UX unchanged.
3. **Bunny webhook notifies completion** — Bunny calls our webhook when encoding finishes, providing video GUID, thumbnail URL, and duration.
4. **S3 original can be deleted** — once Bunny has the video, the S3 copy is redundant. Delete after Bunny confirms receipt, or keep for backup (configurable).

#### Bunny Stream Integration Details

**Creating a video:**
```typescript
// After Lambda validation succeeds for testimonial_video
const createResponse = await fetch('https://video.bunnycdn.com/library/{libraryId}/videos', {
  method: 'POST',
  headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: `${mediaId}_${orgId}` }),
});
const { guid } = await createResponse.json();

// Upload the file from S3 to Bunny
const fileStream = await s3.getObject({ Bucket: bucket, Key: key }).promise();
await fetch(`https://video.bunnycdn.com/library/{libraryId}/videos/${guid}`, {
  method: 'PUT',
  headers: { 'AccessKey': BUNNY_API_KEY },
  body: fileStream.Body,
});
```

**Webhook payload (encoding complete):**
```json
{
  "VideoGuid": "abc-123-def",
  "VideoLibraryId": 12345,
  "Status": 4,
  "ThumbnailUrl": "https://vz-xxx.b-cdn.net/abc-123-def/thumbnail.jpg",
  "Length": 125,
  "Width": 1280,
  "Height": 720
}
```

**Playback URL pattern:**
```
Video:     https://iframe.mediadelivery.net/play/{libraryId}/{videoGuid}  (iframe embed)
Direct:    https://vz-xxx.b-cdn.net/{videoGuid}/play_720p.mp4            (direct MP4)
Thumbnail: https://vz-xxx.b-cdn.net/{videoGuid}/thumbnail.jpg            (auto-generated)
HLS:       https://vz-xxx.b-cdn.net/{videoGuid}/playlist.m3u8            (adaptive streaming)
```

#### Media Table Updates

After Bunny webhook fires, update the media record:

```sql
UPDATE media SET
  status = 'ready',
  duration_seconds = 125,
  thumbnail_path = 'https://vz-xxx.b-cdn.net/{videoGuid}/thumbnail.jpg',
  processing_metadata = jsonb_build_object(
    'provider', 'bunny_stream',
    'bunny_video_guid', 'abc-123-def',
    'bunny_library_id', 12345,
    'playback_url', 'https://vz-xxx.b-cdn.net/{videoGuid}/play_720p.mp4',
    'hls_url', 'https://vz-xxx.b-cdn.net/{videoGuid}/playlist.m3u8',
    'thumbnail_url', 'https://vz-xxx.b-cdn.net/{videoGuid}/thumbnail.jpg',
    'original_s3_path', '{org_id}/testimonial_video/{date}/{media_id}_{timestamp}.mov',
    'output_resolution', '1280x720'
  )
WHERE id = 'med_xxxxxxxxxxxx';
```

The `processing_metadata` JSONB column (already exists in the `media` table) stores Bunny Stream details without schema changes. The `provider` field enables future migration to a different service.

#### Error Handling

| Scenario | Handling |
|----------|----------|
| Bunny encoding fails | Webhook fires with error status → API sets `media.status = 'failed'` |
| Upload from S3 to Bunny fails | API retries once. On second failure, sets `media.status = 'failed'` with error in `processing_metadata` |
| Bunny webhook not received | Cron checks for media in `processing` status >30 minutes, queries Bunny API for status |
| Bunny service outage | Rare (99.99% SLA). S3 original preserved as fallback. Manual re-upload when service recovers. |
| Original file corrupt | Lambda validator catches this before Bunny upload is triggered |

#### Cost Estimate

| Component | Pricing | Notes |
|-----------|---------|-------|
| Storage | $0.01/GB/mo (first 2 regions) | A 2-min video at 720p is ~37MB |
| CDN delivery | $0.005/GB | 114+ PoPs globally |
| Transcoding | **Free** | Included with storage |
| Thumbnails | **Free** | Auto-generated |

| Volume | Monthly Cost | Notes |
|--------|-------------|-------|
| 100 videos/mo, 1K views | ~$1 | Negligible |
| 500 videos/mo, 5K views | ~$5 | |
| 2,000 videos/mo, 20K views | ~$15 | |

Compare to MediaConvert + CloudFront: ~$60+ for the same 2K videos/month (transcoding alone), plus CloudFront delivery costs.

#### S3 Original File Retention

After Bunny confirms receipt, the S3 original file is **retained for 30 days** then deleted via S3 lifecycle policy. This provides a safety net for re-processing if needed without accumulating storage costs.

```
Upload day:     S3 original exists + Bunny transcoded copy
Day 30:         S3 original deleted (lifecycle policy)
Ongoing:        Bunny hosts the video (transcoded + CDN)
```

If re-transcoding is needed (e.g., changing quality settings), re-upload from Bunny's stored original.

---

### 2. Video Delivery: Bunny CDN (Included with Bunny Stream)

Bunny Stream includes CDN delivery via Bunny CDN — no separate CDN configuration needed.

**ImageKit continues to serve images.** Only video delivery moves to Bunny.

| Content Type | CDN | Rationale |
|-------------|-----|-----------|
| Images (logos, avatars, attachments) | ImageKit | Already configured, image transforms (resize, format, face detection) |
| Video thumbnails | Bunny CDN | Auto-generated by Bunny Stream, served from same edge network |
| Transcoded videos | Bunny CDN | Included with Bunny Stream, $0.005/GB |

**Delivery URL structure:**
```
Video:     https://vz-xxx.b-cdn.net/{videoGuid}/play_720p.mp4
Thumbnail: https://vz-xxx.b-cdn.net/{videoGuid}/thumbnail.jpg
HLS:       https://vz-xxx.b-cdn.net/{videoGuid}/playlist.m3u8
```

**Why not ImageKit for video:**
- ImageKit bandwidth overage is $0.45/GB — 90x more expensive than Bunny's $0.005/GB
- Video files are 10-100x larger than images — cost compounds quickly
- ImageKit's video transform features are unnecessary since Bunny handles transcoding
- Simpler to let the video service handle its own CDN

---

### 3. Video Player Selection

**Two different players for two different contexts:**

| Context | Player | Rationale |
|---------|--------|-----------|
| **Dashboard** (admin views) | Native `<video>` element | Zero bundle cost, sufficient for authenticated admin viewing, standard browser controls are fine |
| **Widget embeds** (third-party sites) | Vidstack Player | Customizable branded controls, small bundle, HLS-ready, works as web component in embeds |

#### Dashboard: Native `<video>`

The dashboard is an authenticated admin view where the user reviews and approves testimonials. Browser-native controls are sufficient.

```html
<video
  :src="playbackUrl"
  :poster="thumbnailUrl"
  controls
  playsinline
  preload="metadata"
  class="w-full rounded-lg"
  crossorigin="anonymous"
>
  Your browser does not support video playback.
</video>
```

**Why native `<video>` for dashboard:**
- Zero additional bundle size
- H.264 MP4 plays natively in all browsers (Bunny transcoding guarantees this)
- Admin users don't need fancy controls
- Poster frame from Bunny-generated thumbnail shows immediately
- `preload="metadata"` loads duration/dimensions without downloading the full video

#### Widget Embeds: Vidstack Player

Widgets are embedded on third-party customer sites where appearance, reliability, and bundle size matter.

**Why Vidstack over alternatives:**

| Player | Bundle Size (gzip) | Status | HLS | Customizable UI | Web Components |
|--------|-------------------|--------|-----|-----------------|----------------|
| Native `<video>` | 0 KB | Built-in | Safari only | No | N/A |
| **Vidstack** | **~54-80 KB** | **Active, MIT** | **Built-in** | **Yes (headless)** | **Yes** |
| Video.js | ~195 KB | Active | Via plugin | Yes (themes) | No |
| Plyr | ~34 KB | **Deprecated** | Via plugin | Limited | No |
| hls.js | ~60-70 KB | Active | Yes | No UI at all | No |

> Bundle size note: ~54 KB is core only. With a default layout/theme, expect ~60-80 KB gzipped. Still 2.5-3.5x smaller than Video.js. Treeshakeable.

**Vidstack is chosen because:**
- **Modern architecture** — web components + framework adapters (Vue, React), not legacy jQuery patterns
- **Headless UI** — full control over player appearance for branded widget styling
- **Built-in HLS** — uses hls.js internally. Bunny Stream provides HLS URLs — Vidstack can use them for adaptive streaming on widget embeds
- **Active development** — designed as the official successor to Plyr (which is now deprecated)
- **Accessible by default** — keyboard navigation, screen reader support, ARIA attributes
- **Widget-friendly** — works as web component, isolatable in shadow DOM for embed scripts

**Widget player with HLS (enabled by Bunny Stream):**

```typescript
import { VidstackPlayer, VidstackPlayerLayout } from 'vidstack/global/player';

const player = await VidstackPlayer.create({
  target: containerElement,
  // Use HLS for adaptive bitrate on widgets (Bunny provides this URL)
  src: hlsUrl,  // https://vz-xxx.b-cdn.net/{guid}/playlist.m3u8
  poster: thumbnailUrl,
  playsinline: true,
  layout: new VidstackPlayerLayout({
    // Minimal controls for testimonial context
  })
});
```

> **Bonus**: Bunny Stream provides HLS URLs out of the box. Combined with Vidstack's built-in HLS support, we get **adaptive bitrate streaming for free** in widget embeds — a feature we previously deferred as post-MVP. This means mobile users on slow connections get automatic quality adjustment.

#### Player Decision Tree

```
Is this the admin dashboard?
+-- Yes -> Native <video> with direct MP4 URL
+-- No (widget embed)
    +-- Single testimonial display -> Vidstack (click-to-play, HLS URL)
    +-- Wall of Love / Carousel -> Vidstack (poster + play overlay, HLS URL)
```

---

### 4. Mobile Playback Strategy

Mobile video playback has specific browser policy constraints that must be handled explicitly.

#### Required HTML Attributes

Every `<video>` element (dashboard and widgets) MUST include:

```html
<video
  playsinline    <!-- CRITICAL: prevents iOS fullscreen takeover -->
  preload="metadata"
  :poster="thumbnailUrl"
  crossorigin="anonymous"
>
```

| Attribute | Purpose | What Happens Without It |
|-----------|---------|------------------------|
| `playsinline` | iOS inline playback | iOS forces fullscreen when video starts |
| `preload="metadata"` | Load duration/dimensions without full download | Black rectangle until user clicks play |
| `poster` | Show thumbnail before playback | Black rectangle (or first frame after metadata loads) |
| `crossorigin="anonymous"` | Allow CDN-served video with CORS | Canvas operations (thumbnail extraction) may fail |

#### Autoplay Policies

| Platform | Muted Autoplay | Unmuted Autoplay |
|----------|---------------|-----------------|
| iOS Safari | Allowed with `autoplay muted playsinline` | Blocked unless prior user interaction |
| Android Chrome | Always allowed (since Chrome 53) | Allowed only with high Media Engagement Index |
| Desktop Chrome | Allowed | Allowed with high MEI or prior interaction |
| Desktop Safari | Allowed with `autoplay muted` | Blocked unless prior interaction |
| Firefox | Allowed | Blocked by default |

**Widget autoplay strategy:**

For Wall of Love / Carousel widgets where multiple videos are visible:
- Do NOT autoplay — show poster thumbnail + play button overlay
- User taps play -> video plays with sound
- This avoids all autoplay policy issues and is better UX (multiple autoplaying videos would be chaotic)

For single testimonial spotlight widgets:
- Optional muted autoplay: `autoplay muted loop playsinline`
- Shows video playing silently with unmute button
- Configurable per widget (form owner chooses in widget builder)

```typescript
// Widget video card behavior
const videoAttributes = {
  playsinline: true,
  preload: 'metadata' as const,
  poster: thumbnailUrl,
  crossorigin: 'anonymous' as const,
  // Only for single spotlight with autoplay enabled:
  ...(widget.autoplay && {
    autoplay: true,
    muted: true,
    loop: true,
  }),
};
```

#### Poster Frame / Thumbnail Strategy

**Primary: Bunny Stream auto-generated thumbnail** (server-side)
- Generated automatically during encoding
- Served via Bunny CDN: `https://vz-xxx.b-cdn.net/{videoGuid}/thumbnail.jpg`
- Customizable: Bunny allows setting the thumbnail time offset via API
- Available as soon as encoding completes

**Fallback: `preload="metadata"`** (client-side)
- Browser loads video metadata (including first frame) without downloading the full file
- Used while encoding is in progress (edge case)
- No additional infrastructure required

**Thumbnail in different widget contexts:**

| Context | Thumbnail Source | Notes |
|---------|-----------------|-------|
| Wall of Love card | Bunny thumbnail URL | Displayed at card size, CSS `object-fit: cover` |
| Carousel card | Bunny thumbnail URL | Displayed at carousel frame size |
| Detail panel | Bunny thumbnail URL | Full width in panel |
| Dashboard table row | Not displayed | Video icon + duration text instead |

---

### 5. Codec Acceptance & Validation Strategy

#### What We Accept (Upload)

| Format | MIME Type | Common Source | Already in Lambda Config |
|--------|-----------|--------------|-------------------------|
| MP4 | `video/mp4` | Android, screen recorders, exports | Yes |
| MOV | `video/quicktime` | iPhone/iPad, macOS | Yes |
| WebM | `video/webm` | Chrome-based screen recorders | Yes |

These three formats cover 99%+ of user-uploaded video. The Lambda validator already accepts all three.

#### What We Deliver (Playback)

**Always H.264 MP4** (or HLS adaptive). Bunny Stream transcodes every upload to multiple quality levels automatically.

| Input | Input Codec (likely) | Output | Browser Support |
|-------|---------------------|--------|----------------|
| iPhone .mov | HEVC (H.265) | H.264 MP4 (+ HLS) | 98%+ |
| Android .mp4 | H.264 | H.264 MP4 (+ HLS) | 98%+ |
| Screen recording .webm | VP9 | H.264 MP4 (+ HLS) | 98%+ |
| Old device .mp4 | MPEG-4 Part 2 | H.264 MP4 (+ HLS) | 98%+ |

**No codec validation at upload time** — we accept any video with a valid MIME type and let Bunny Stream handle format conversion. Bunny supports virtually all input codecs.

#### What We Explicitly Do NOT Support

| Format | Why Not |
|--------|---------|
| AVI, FLV, WMV | Legacy formats, extremely rare for user recordings |
| MKV | Uncommon for user-generated content |
| 3GP | Obsolete mobile format |

If users request additional input formats, adding them requires only updating the Lambda validator config and `ENTITY_VALIDATION_CONFIG` — no pipeline changes.

---

## Scale-Up Path: MediaConvert + CloudFront

If video volumes grow significantly or we need more control over transcoding, the architecture can migrate from Bunny Stream to an AWS-native pipeline. This section documents the target architecture for reference.

### When to Consider Migration

| Trigger | Threshold | Rationale |
|---------|-----------|-----------|
| Bunny costs exceed AWS equivalent | ~$50+/mo on Bunny | MediaConvert + CloudFront may be cheaper at scale |
| Need custom transcoding settings | N/A | Bunny's transcoding is automatic — no control over codec profile, bitrate, etc. |
| Vendor risk | N/A | Bunny is a smaller company than AWS; risk tolerance decision |
| Compliance/data residency | N/A | Bunny stores in their infrastructure; AWS keeps everything in your account |

### AWS-Native Architecture (for future reference)

```
S3 Upload -> Lambda Validator -> Webhook -> MediaConvert Job -> EventBridge -> Lambda -> DB Update
```

**Components required:**
- AWS MediaConvert — managed transcoding ($0.015/min HD AVC, normalized minutes, 10-second minimum billing)
- CloudFront — CDN distribution for transcoded videos ($0.085/GB)
- EventBridge rule — catches MediaConvert job completion events
- transcode-complete Lambda — updates media record on job completion
- SQS Dead Letter Queue — catches failed EventBridge deliveries
- Reconciliation cron — checks for stuck `processing` records >1 hour old
- IAM role — MediaConvert S3 read/write permissions
- Separate S3 prefixes — `originals/` vs `transcoded/` for lifecycle isolation

**Transcoding output specification:**
```
Container:    MP4
Video Codec:  H.264 Main Profile, Level 3.1
Resolution:   Max 720p (1280x720), preserve aspect ratio
Frame Rate:   Match source, cap at 30fps
Video Bitrate: 2.5 Mbps (VBR)
Audio Codec:  AAC-LC
Audio Bitrate: 128 kbps stereo
```

**Cost at 2K videos/month:** ~$60 (MediaConvert) + ~$15 (CloudFront) = ~$75/mo vs ~$15 on Bunny Stream.

**Migration path:** The `processing_metadata.provider` field in the media record distinguishes between `bunny_stream` and `mediaconvert` providers. The `getVideoUrl()` composable reads this field to construct the correct playback URL. Both providers can coexist during migration — new videos go to the new provider, existing videos continue serving from Bunny.

---

## Alternatives Considered

### Alt 1: No Transcoding — Accept Only H.264 MP4

**Approach:** Validate codec at upload time. Reject HEVC, VP9, and any non-H.264 content.

**Rejected because:**
- iPhone records in HEVC by default (since iPhone 7). Rejecting these files means rejecting most iPhone users.
- Users would need to manually convert before uploading — terrible UX for a product that promises "2 minutes"
- Even H.264 files vary wildly in bitrate/resolution — 4K 60fps talking-head videos waste bandwidth
- The Lambda validator checks MIME types, not codecs — adding codec detection requires FFprobe or similar

### Alt 2: AWS MediaConvert + CloudFront (Self-Managed Pipeline)

**Approach:** Build a full AWS-native transcoding and delivery pipeline.

**Deferred because:**
- Requires 6+ AWS resources to provision (IAM role, EventBridge rule, Lambda, DLQ, reconciliation cron, CloudFront distribution)
- Implementation takes weeks vs. days for Bunny Stream
- ~$75/mo vs ~$15/mo at 2K videos
- More operational burden (monitoring 6 log sources for debugging failures)
- Documented as scale-up path above for when/if we outgrow Bunny Stream

### Alt 3: Lambda + FFmpeg (Self-Managed Transcoding)

**Approach:** Package FFmpeg as a Lambda layer (~70MB), transcode in the validation Lambda or a dedicated Lambda.

**Rejected because:**
- 15-minute Lambda timeout limits video length (~8-10 min max for transcoding)
- FFmpeg Lambda layer must be maintained and updated
- Error handling, retries, and monitoring must be built from scratch
- More engineering effort than Bunny Stream for marginal cost savings

### Alt 4: Mux Video

**Approach:** Use Mux as the complete video infrastructure (upload, transcode, deliver, analytics).

**Deferred because:**
- More expensive than Bunny Stream at scale
- Best-in-class DX but overkill for testimonial-length videos
- Free tier (100K delivery minutes) is generous but creates lock-in concern
- Worth reconsidering if we need video analytics/QoE metrics

**Notable:** Mux Player is built on top of Vidstack (our widget player choice). If we migrate to Mux later, the player integration would be seamless.

### Alt 5: Cloudflare Stream

**Approach:** Upload to Cloudflare Stream for transcoding and delivery.

**Rejected because:**
- Locks into Cloudflare ecosystem
- Pricing ($5/1K min storage + $1/1K min delivery) compounds — ~$840/year even for moderate usage
- The project uses AWS, not Cloudflare, for infrastructure
- Player customization is limited compared to Vidstack

### Alt 6: Video.js for Widget Player

**Approach:** Use Video.js instead of Vidstack for widget embed player.

**Rejected because:**
- 195 KB gzipped bundle (2.5-3.5x larger than Vidstack's 54-80 KB with layout)
- Legacy architecture — originally built in the jQuery era
- Widget embeds are bandwidth-sensitive — every KB matters for third-party site performance
- Vidstack is the modern successor with equivalent features in a smaller package

### Alt 7: ImageKit for Video Delivery

**Approach:** Use existing ImageKit CDN for video delivery (same as images).

**Rejected because:**
- ImageKit bandwidth overage is $0.45/GB — 90x more expensive than Bunny's $0.005/GB
- Video files are 10-100x larger than images — cost compounds quickly
- Bunny Stream includes CDN delivery — no reason to pay ImageKit for video when Bunny covers it

---

## Implementation Plan

See [`implementation.md`](./implementation.md) for detailed phased implementation plan with code examples, testing checklists, and deployment order.

**Summary of phases:**
0. **Database Schema** (ADR-026 prerequisites) — `/hasura-migrations`, `/hasura-permissions`, `/hasura-table-docs`, `/graphql-code`
1. **Bunny Stream Integration** — `/api-creator` (webhook endpoint with Zod/OpenAPIHono), `/api-code-review` (pure/impure separation)
2. **Video Delivery URLs** — `/graphql-code` (validate fragments, run codegen, export types from models/)
3. **Dashboard Video Playback** — `/e2e-test-ids` (test IDs first), `/e2e-tests-creator` (video display tests), `/code-review`
4. **Widget Video Player** — Vidstack + Bunny HLS, lazy loading, poster + play overlay (ships with ADR-024)

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Ships in days, not weeks** | API integration only — no IAM roles, EventBridge rules, Lambdas, DLQs, or reconciliation crons to build |
| **Universal playback** | H.264 MP4 plays on 98%+ of browsers — iPhone HEVC uploads just work |
| **Adaptive streaming for free** | Bunny provides HLS URLs — Vidstack uses them for adaptive bitrate in widgets. Previously deferred as post-MVP. |
| **Cheapest all-in** | ~$12/mo covers transcoding + CDN + thumbnails at 2K videos. 5x cheaper than MediaConvert + CloudFront. |
| **Thumbnails and duration included** | Auto-generated by Bunny — no separate pipeline |
| **Simple error model** | One webhook, one retry, one cron. vs. EventBridge + DLQ + reconciliation + 6 log sources |
| **Future-ready** | Vidstack + HLS ready. MediaConvert + CloudFront documented as scale-up path. Provider field in DB enables seamless migration. |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **New vendor (Bunny)** | Bunny is well-established (est. 2015), 99.99% SLA. S3 originals retained 30 days as fallback. Provider field enables migration. |
| **Less transcoding control** | Bunny auto-selects output settings. Acceptable for testimonials. If custom settings needed, migrate to MediaConvert. |
| **Video data outside AWS** | Bunny stores transcoded files on their infrastructure. Original stays in S3 for 30 days. Acceptable for testimonial content (not regulated data). |
| **Two CDN providers** | ImageKit for images, Bunny for video. Different URL patterns but clean separation. `getVideoUrl()` composable abstracts this. |
| **Encoding delay** | Bunny encoding takes 30-120s depending on video length. Show "Processing..." state in UI. Acceptable for testimonial workflow. |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Bunny Stream service outage | Very Low | High | S3 originals retained 30 days. Re-upload when service recovers. Bunny has 99.99% SLA. |
| Bunny pricing changes | Low | Medium | Provider field in DB enables migration to MediaConvert + CloudFront. Scale-up path documented. |
| Bunny encoding quality insufficient | Low | Low | Bunny uses industry-standard H.264 encoding. Quality is configurable per video library. |
| Encoding delay frustrates users | Medium | Low | Show clear processing state. Most testimonials are < 2 min, encoding completes in 30-120s. |
| Vidstack bundle size impacts widget load time | Low | Low | Treeshake unused components. 60-80KB with layout is acceptable. Lazy-load player on user interaction. |

---

## References

### Internal
- `docs/adr/026-video-testimonials-mvp/adr.md` — Video testimonials scope and schema
- `docs/adr/004-media-upload-architecture.md` — Media upload pipeline (S3, Lambda, webhook)
- `docs/adr/024-widgets-v1/adr.md` — Widget builder with video card design
- `packages/libs/media-service/src/` — Media service with entity types and CDN adapter
- `infrastructure/lambdas/media-validator/src/` — Lambda validator with video MIME support
- `apps/web/src/entities/media/composables/useMediaUrl.ts` — ImageKit URL generation

### External
- [Bunny Stream Documentation](https://docs.bunny.net/stream/) — API reference, webhooks, encoding
- [Bunny Stream Pricing](https://bunny.net/pricing/stream/) — Storage $0.01/GB, delivery $0.005/GB, free transcoding
- [Vidstack Player](https://vidstack.io/) — Modern video player library (MIT, Plyr successor)
- [Vidstack GitHub](https://github.com/vidstack/player) — Source and documentation
- [AWS MediaConvert Developer Guide](https://docs.aws.amazon.com/mediaconvert/latest/ug/what-is.html) — Scale-up path reference
- [AWS MediaConvert Pricing](https://aws.amazon.com/mediaconvert/pricing/) — $0.015/min HD AVC (Basic tier)
- [MDN Web Video Codec Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs) — Browser codec compatibility
- [WebKit Video Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/) — `playsinline` and autoplay behavior
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) — Media Engagement Index and autoplay rules
- [Mux Video Pricing](https://www.mux.com/pricing) — Alternative managed video service
