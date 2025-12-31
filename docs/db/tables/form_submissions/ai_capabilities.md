# Form Submissions - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI uses form submissions to identify submitter context (company, role) for personalizing testimonial assembly and for extracting social proof verification data.

## Use Cases

### 1. Submitter Context Enrichment
**Purpose**: Enrich submitter information for better testimonial context

**Pseudo-Code**:
```
FUNCTION enrichSubmitterContext(submissionId):
    submission = getSubmissionById(submissionId)

    // Use LinkedIn URL for company verification
    IF submission.submitter_linkedin_url:
        linkedInData = fetchLinkedInPreview(submission.submitter_linkedin_url)
        enriched = {
            verifiedTitle: linkedInData.title,
            verifiedCompany: linkedInData.company,
            profilePhoto: linkedInData.photoUrl
        }
        RETURN enriched

    // Fall back to email domain for company inference
    IF submission.submitter_email:
        domain = extractDomain(submission.submitter_email)
        IF NOT isFreeEmailDomain(domain):
            companyInfo = lookupCompanyByDomain(domain)
            RETURN { inferredCompany: companyInfo.name }

    RETURN null
```

### 2. Submission Quality Scoring
**Purpose**: Score submission quality for prioritization

**Pseudo-Code**:
```
FUNCTION scoreSubmissionQuality(submissionId):
    submission = getSubmissionById(submissionId)
    responses = getResponsesBySubmissionId(submissionId)

    score = 0

    // Completeness score
    IF submission.submitter_title: score += 10
    IF submission.submitter_company: score += 10
    IF submission.submitter_avatar_url: score += 15
    IF submission.submitter_linkedin_url: score += 20
    IF submission.submitter_twitter_url: score += 10

    // Response quality score
    FOR EACH response IN responses:
        IF response.answer_text AND response.answer_text.length > 100:
            score += 15

    // Social proof score
    IF isKnownCompany(submission.submitter_company):
        score += 25

    RETURN {
        totalScore: score,
        tier: score >= 80 ? "premium" : score >= 50 ? "standard" : "basic"
    }
```

### 3. Duplicate Detection
**Purpose**: Identify potential duplicate submissions from same person

**Pseudo-Code**:
```
FUNCTION detectDuplicateSubmission(newSubmission):
    recentSubmissions = getSubmissionsByFormId(
        newSubmission.form_id,
        since: NOW() - 30 days
    )

    FOR EACH existing IN recentSubmissions:
        // Email match
        IF existing.submitter_email == newSubmission.submitter_email:
            RETURN { isDuplicate: true, reason: "Same email", existingId: existing.id }

        // Name + Company match
        IF existing.submitter_name.similar(newSubmission.submitter_name, 0.9)
           AND existing.submitter_company == newSubmission.submitter_company:
            RETURN { isDuplicate: true, reason: "Same person at company", existingId: existing.id }

    RETURN { isDuplicate: false }
```

### 4. Follow-up Suggestion
**Purpose**: Suggest follow-up actions based on submission quality

**Pseudo-Code**:
```
FUNCTION suggestFollowUp(submissionId):
    submission = getSubmissionById(submissionId)
    qualityScore = scoreSubmissionQuality(submissionId)

    suggestions = []

    IF qualityScore.tier == "premium":
        suggestions.add({
            action: "request_video_testimonial",
            priority: "high",
            template: "video_request_premium"
        })

    IF NOT submission.submitter_avatar_url:
        suggestions.add({
            action: "request_photo",
            priority: "medium",
            template: "photo_request"
        })

    IF submission.submitter_linkedin_url AND NOT submission.submitter_twitter_url:
        suggestions.add({
            action: "request_twitter_share",
            priority: "low",
            template: "twitter_share_request"
        })

    RETURN suggestions
```
