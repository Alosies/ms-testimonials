# Testimonials - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI powers the core testimonial assembly feature - transforming structured form responses into coherent, compelling testimonial quotes. Also enables content optimization and approval suggestions.

## Use Cases

### 1. Testimonial Assembly (Core Feature)
**Purpose**: Transform structured responses into a coherent testimonial quote

**Pseudo-Code**:
```
FUNCTION assembleTestimonialContent(submissionId, formId):
    form = getFormById(formId)
    submission = getSubmissionById(submissionId)
    responses = getResponsesBySubmissionId(submissionId)

    // Build response context by question key
    responseContext = {}
    FOR EACH response IN responses:
        key = response.question.question_key
        responseContext[key] = getTypedValue(response)

    prompt = buildAssemblyPrompt({
        productName: form.product_name,
        productDescription: form.product_description,
        customerName: submission.submitter_name,
        customerCompany: submission.submitter_company,
        responses: responseContext
    })

    content = AI.generate({
        system: "Create a testimonial quote from customer responses",
        prompt: prompt,
        maxTokens: 300
    })

    RETURN {
        content: content,
        source: "form",
        submission_id: submissionId
    }
```

### 2. Auto-Approval Scoring
**Purpose**: Score testimonials for auto-approval based on quality

**Pseudo-Code**:
```
FUNCTION scoreForAutoApproval(testimonialId):
    testimonial = getTestimonialById(testimonialId)

    score = 0
    flags = []

    // Content quality
    IF testimonial.content:
        length = testimonial.content.length
        IF length >= 100 AND length <= 500:
            score += 25

        // Check for specific claims
        specificity = AI.measureSpecificity(testimonial.content)
        IF specificity.hasMetrics:
            score += 20
        IF specificity.hasTimeframes:
            score += 15

        // Sentiment must be positive
        sentiment = AI.analyzeSentiment(testimonial.content)
        IF sentiment.score > 0.5:
            score += 20
        ELSE IF sentiment.score < 0:
            flags.add("Negative sentiment detected")

    // Rating alignment
    IF testimonial.rating >= 4:
        score += 15

    // Social proof
    IF testimonial.customer_linkedin_url:
        score += 15
    IF testimonial.customer_company:
        score += 10

    autoApprove = score >= 80 AND flags.length == 0

    RETURN {
        score: score,
        autoApprove: autoApprove,
        flags: flags
    }
```

### 3. Content Enhancement Suggestions
**Purpose**: Suggest improvements to testimonial content

**Pseudo-Code**:
```
FUNCTION suggestContentEnhancements(testimonialId):
    testimonial = getTestimonialById(testimonialId)
    suggestions = []

    IF testimonial.content:
        // Length check
        IF testimonial.content.length < 50:
            suggestions.add({
                type: "length",
                message: "Consider adding more detail for impact"
            })

        // Vagueness check
        vaguePhrases = AI.findVaguePhrases(testimonial.content)
        IF vaguePhrases.length > 0:
            suggestions.add({
                type: "specificity",
                message: "Replace vague phrases with specifics",
                examples: vaguePhrases
            })

        // Grammar/clarity
        grammarIssues = AI.checkGrammar(testimonial.content)
        IF grammarIssues.length > 0:
            suggestions.add({
                type: "grammar",
                message: "Grammar improvements available",
                corrections: grammarIssues
            })

    // Missing fields
    IF NOT testimonial.customer_title:
        suggestions.add({
            type: "missing_field",
            field: "customer_title",
            message: "Adding job title increases credibility"
        })

    RETURN suggestions
```

### 4. Similar Testimonial Detection
**Purpose**: Find and flag similar/duplicate testimonials

**Pseudo-Code**:
```
FUNCTION findSimilarTestimonials(testimonialId):
    testimonial = getTestimonialById(testimonialId)
    existingTestimonials = getTestimonialsByOrgId(testimonial.organization_id)

    similar = []

    FOR EACH existing IN existingTestimonials:
        IF existing.id == testimonialId:
            CONTINUE

        similarity = AI.calculateSimilarity(testimonial.content, existing.content)

        IF similarity > 0.8:
            similar.add({
                id: existing.id,
                similarity: similarity,
                customerName: existing.customer_name,
                reason: "Content is very similar"
            })
        ELSE IF testimonial.customer_email == existing.customer_email:
            similar.add({
                id: existing.id,
                similarity: 1.0,
                customerName: existing.customer_name,
                reason: "Same customer email"
            })

    RETURN similar
```
