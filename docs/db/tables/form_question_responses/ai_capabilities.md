# Form Question Responses - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI primarily uses form question responses for testimonial assembly - combining structured answers into coherent narratives. The typed columns enable proper parsing based on question type.

## Use Cases

### 1. Testimonial Assembly
**Purpose**: Combine structured responses into a coherent testimonial

**Pseudo-Code**:
```
FUNCTION assembleTestimonial(submissionId):
    responses = getResponsesBySubmissionId(submissionId)
    submission = getSubmissionById(submissionId)
    form = getFormById(submission.form_id)

    // Build context from typed responses
    context = {}
    FOR EACH response IN responses:
        questionType = response.question.question_type.answer_data_type

        SWITCH questionType:
            CASE "text":
                context[response.question.question_key] = response.answer_text
            CASE "integer":
                context[response.question.question_key] = response.answer_integer
            CASE "boolean":
                context[response.question.question_key] = response.answer_boolean
            CASE "json":
                context[response.question.question_key] = response.answer_json

    testimonial = AI.assemble({
        productName: form.product_name,
        customerName: submission.submitter_name,
        customerCompany: submission.submitter_company,
        responses: context
    })

    RETURN testimonial
```

### 2. Sentiment Analysis per Response
**Purpose**: Analyze sentiment of individual text responses

**Pseudo-Code**:
```
FUNCTION analyzeResponseSentiment(responseId):
    response = getResponseById(responseId)

    IF response.answer_text IS NULL:
        RETURN null

    sentiment = AI.analyzeSentiment(response.answer_text)

    RETURN {
        score: sentiment.score,  // -1 to 1
        magnitude: sentiment.magnitude,
        keyPhrases: sentiment.keyPhrases,
        emotions: sentiment.emotions  // joy, trust, anticipation, etc.
    }
```

### 3. Response Quality Scoring
**Purpose**: Score response quality for testimonial potential

**Pseudo-Code**:
```
FUNCTION scoreResponseQuality(responseId):
    response = getResponseById(responseId)
    question = response.question

    score = 0
    reasons = []

    IF response.answer_text:
        length = response.answer_text.length

        // Length scoring
        IF length > 200:
            score += 30
            reasons.add("Detailed response")
        ELSE IF length > 100:
            score += 20
            reasons.add("Good length")
        ELSE IF length > 50:
            score += 10

        // Specificity scoring
        specificity = AI.measureSpecificity(response.answer_text)
        IF specificity.hasNumbers:
            score += 15
            reasons.add("Contains specific numbers")
        IF specificity.hasTimeframes:
            score += 10
            reasons.add("Mentions timeframes")
        IF specificity.hasCompanyMentions:
            score += 10
            reasons.add("Mentions specific tools/companies")

    IF response.answer_integer:
        // High ratings score better
        maxValue = question.max_value OR 5
        IF response.answer_integer >= maxValue * 0.8:
            score += 25
            reasons.add("High rating")

    RETURN { score: score, reasons: reasons }
```

### 4. Cross-Response Coherence Check
**Purpose**: Verify responses are consistent with each other

**Pseudo-Code**:
```
FUNCTION checkResponseCoherence(submissionId):
    responses = getResponsesBySubmissionId(submissionId)

    textResponses = responses.filter(r => r.answer_text != null)

    // Check for contradictions
    coherence = AI.checkCoherence(textResponses.map(r => ({
        question: r.question.question_text,
        answer: r.answer_text
    })))

    // Check rating aligns with text sentiment
    ratingResponse = responses.find(r => r.answer_integer != null)
    IF ratingResponse:
        avgSentiment = calculateAverageSentiment(textResponses)
        ratingNormalized = ratingResponse.answer_integer / ratingResponse.question.max_value

        IF abs(avgSentiment - ratingNormalized) > 0.4:
            coherence.warnings.add("Rating doesn't match text sentiment")

    RETURN coherence
```
