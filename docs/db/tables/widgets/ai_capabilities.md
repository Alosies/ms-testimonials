# Widgets - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI can assist with widget configuration optimization, testimonial selection for widgets, and generating embed code snippets based on widget settings.

## Use Cases

### 1. Optimal Testimonial Selection
**Purpose**: Automatically select best testimonials for a widget

**Pseudo-Code**:
```
FUNCTION selectOptimalTestimonials(widgetId, maxCount):
    widget = getWidgetById(widgetId)
    approvedTestimonials = getApprovedTestimonialsByOrgId(widget.organization_id)

    // Score each testimonial for this widget type
    scored = []
    FOR EACH testimonial IN approvedTestimonials:
        score = 0

        // Content quality
        IF testimonial.content:
            length = testimonial.content.length
            IF length >= 100 AND length <= 300:
                score += 20

        // Rating boost
        IF testimonial.rating >= 4:
            score += testimonial.rating * 5

        // Visual completeness (important for widgets)
        IF widget.show_avatar AND testimonial.customer_avatar_url:
            score += 15
        IF widget.show_company AND testimonial.customer_company:
            score += 10

        // Diversity bonus (different companies)
        IF NOT alreadyHasCompany(scored, testimonial.customer_company):
            score += 20

        scored.add({ testimonial: testimonial, score: score })

    // Sort and select top N
    selected = scored.sortBy(s => s.score, DESC).take(maxCount)

    RETURN selected.map(s => s.testimonial)
```

### 2. Widget Type Recommendation
**Purpose**: Recommend best widget type based on testimonials available

**Pseudo-Code**:
```
FUNCTION recommendWidgetType(organizationId):
    testimonials = getApprovedTestimonialsByOrgId(organizationId)
    count = testimonials.length

    IF count == 0:
        RETURN { type: null, reason: "No approved testimonials yet" }

    IF count == 1:
        RETURN { type: "single_quote", reason: "Perfect for highlighting your one testimonial" }

    IF count <= 3:
        RETURN { type: "carousel", reason: "Carousel works well with a few testimonials" }

    IF count >= 6:
        // Check for diversity
        uniqueCompanies = unique(testimonials.map(t => t.customer_company)).length
        IF uniqueCompanies >= 4:
            RETURN { type: "wall_of_love", reason: "Great variety - wall showcases diversity" }

    RETURN { type: "carousel", reason: "Flexible option for your testimonial count" }
```

### 3. Display Settings Optimization
**Purpose**: Suggest optimal display settings based on testimonial data

**Pseudo-Code**:
```
FUNCTION optimizeDisplaySettings(widgetId):
    widget = getWidgetById(widgetId)
    testimonials = getWidgetTestimonials(widgetId)

    suggestions = []

    // Avatar setting
    avatarRate = testimonials.filter(t => t.customer_avatar_url).length / testimonials.length
    IF avatarRate < 0.5 AND widget.show_avatar:
        suggestions.add({
            setting: "show_avatar",
            value: false,
            reason: "Only {avatarRate * 100}% have avatars - hiding creates cleaner look"
        })

    // Company setting
    companyRate = testimonials.filter(t => t.customer_company).length / testimonials.length
    IF companyRate < 0.3 AND widget.show_company:
        suggestions.add({
            setting: "show_company",
            value: false,
            reason: "Few testimonials have company info"
        })

    // Rating setting
    avgRating = average(testimonials.filter(t => t.rating).map(t => t.rating))
    IF avgRating >= 4.5 AND NOT widget.show_ratings:
        suggestions.add({
            setting: "show_ratings",
            value: true,
            reason: "Your average rating is excellent ({avgRating}) - show it!"
        })

    RETURN suggestions
```

### 4. Embed Code Generation
**Purpose**: Generate optimized embed code for different platforms

**Pseudo-Code**:
```
FUNCTION generateEmbedCode(widgetId, platform):
    widget = getWidgetById(widgetId)
    baseUrl = getEmbedBaseUrl()

    SWITCH platform:
        CASE "html":
            RETURN generateHtmlEmbed(widget, baseUrl)

        CASE "react":
            RETURN generateReactEmbed(widget, baseUrl)

        CASE "vue":
            RETURN generateVueEmbed(widget, baseUrl)

        CASE "wordpress":
            RETURN generateWordPressShortcode(widget)

        DEFAULT:
            RETURN generateHtmlEmbed(widget, baseUrl)

FUNCTION generateHtmlEmbed(widget, baseUrl):
    script = """
    <div id="testimonials-widget-{widget.id}"></div>
    <script src="{baseUrl}/embed.js" data-widget-id="{widget.id}"></script>
    """
    RETURN script
```
