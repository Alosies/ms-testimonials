# Widget Testimonials - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI can assist with optimal testimonial ordering, featured testimonial selection, and managing widget content based on engagement patterns and diversity goals.

## Use Cases

### 1. Optimal Ordering Algorithm
**Purpose**: Determine best display order for testimonials in a widget

**Pseudo-Code**:
```
FUNCTION optimizeTestimonialOrder(widgetId):
    placements = getPlacementsByWidgetId(widgetId)
    widget = getWidgetById(widgetId)

    // Score each testimonial for ordering
    scored = []
    FOR EACH placement IN placements:
        testimonial = placement.testimonial
        score = 0

        // Rating weight (higher ratings first)
        IF testimonial.rating:
            score += testimonial.rating * 10

        // Content quality
        IF testimonial.content:
            IF testimonial.content.length >= 100:
                score += 15
            specificity = AI.measureSpecificity(testimonial.content)
            score += specificity.score * 0.2

        // Visual completeness
        IF testimonial.customer_avatar_url:
            score += 10
        IF testimonial.customer_company:
            score += 5

        // Recency bonus (newer testimonials slightly higher)
        daysOld = daysSince(testimonial.created_at)
        IF daysOld < 30:
            score += 10
        ELSE IF daysOld < 90:
            score += 5

        scored.add({ placementId: placement.id, score: score })

    // Generate new order
    sorted = scored.sortBy(s => s.score, DESC)
    newOrder = []
    FOR i, item IN enumerate(sorted):
        newOrder.add({ id: item.placementId, display_order: i + 1 })

    RETURN newOrder
```

### 2. Featured Testimonial Selection
**Purpose**: Automatically select best testimonial to feature

**Pseudo-Code**:
```
FUNCTION selectFeaturedTestimonial(widgetId):
    widget = getWidgetById(widgetId)
    placements = getPlacementsByWidgetId(widgetId)

    IF placements.length == 0:
        RETURN null

    // Single quote widget: pick the absolute best
    IF widget.type == "single_quote":
        RETURN selectBestTestimonial(placements)

    // Other types: feature testimonial that stands out
    candidates = []
    FOR EACH placement IN placements:
        testimonial = placement.testimonial
        featureScore = 0

        // Must have 5-star rating to feature
        IF testimonial.rating != 5:
            CONTINUE

        // Strong content required
        IF NOT testimonial.content OR testimonial.content.length < 100:
            CONTINUE

        // Visual elements boost
        IF testimonial.customer_avatar_url:
            featureScore += 20
        IF testimonial.customer_company:
            featureScore += 15

        // Notable company bonus
        IF isWellKnownCompany(testimonial.customer_company):
            featureScore += 30

        // Content strength
        contentQuality = AI.evaluateContent(testimonial.content)
        featureScore += contentQuality.impactScore

        candidates.add({ placement: placement, score: featureScore })

    IF candidates.length == 0:
        RETURN null

    best = candidates.sortBy(c => c.score, DESC).first()
    RETURN best.placement.id
```

### 3. Widget Content Diversity
**Purpose**: Ensure widget shows diverse testimonials

**Pseudo-Code**:
```
FUNCTION analyzeDiversity(widgetId):
    placements = getPlacementsByWidgetId(widgetId)
    testimonials = placements.map(p => p.testimonial)

    analysis = {
        total: testimonials.length,
        companies: unique(testimonials.map(t => t.customer_company)),
        hasAvatars: testimonials.filter(t => t.customer_avatar_url).length,
        ratings: testimonials.filter(t => t.rating).map(t => t.rating)
    }

    issues = []

    // Company diversity
    IF analysis.companies.length < analysis.total * 0.5:
        issues.add({
            type: "company_diversity",
            message: "Multiple testimonials from same companies",
            suggestion: "Add testimonials from different companies"
        })

    // Rating variety
    avgRating = average(analysis.ratings)
    IF avgRating == 5 AND analysis.ratings.length > 3:
        issues.add({
            type: "rating_variety",
            message: "All 5-star ratings may seem less authentic",
            suggestion: "Consider including 4-star testimonials"
        })

    // Visual consistency
    avatarRate = analysis.hasAvatars / analysis.total
    IF avatarRate > 0 AND avatarRate < 0.8:
        issues.add({
            type: "visual_consistency",
            message: "Mixed avatar presence",
            suggestion: "Either add avatars to all or hide avatars in widget settings"
        })

    RETURN {
        analysis: analysis,
        issues: issues,
        diversityScore: calculateDiversityScore(analysis)
    }
```

### 4. Auto-Populate Widget
**Purpose**: Automatically populate a new widget with best testimonials

**Pseudo-Code**:
```
FUNCTION autoPopulateWidget(widgetId, maxTestimonials):
    widget = getWidgetById(widgetId)
    available = getApprovedTestimonialsByOrgId(widget.organization_id)

    // Filter out testimonials already in other widgets (if needed)
    // Score testimonials
    scored = available.map(t => ({
        testimonial: t,
        score: scoreForWidget(t, widget)
    }))

    // Select diverse set
    selected = selectDiverseSet(scored, maxTestimonials)

    // Create placements
    placements = []
    FOR i, testimonial IN enumerate(selected):
        placements.add({
            organization_id: widget.organization_id,
            widget_id: widgetId,
            testimonial_id: testimonial.id,
            display_order: i + 1,
            is_featured: i == 0  // Feature first one
        })

    RETURN placements
```
