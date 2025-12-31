# Forms - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI leverages form context (product_name, product_description) to generate contextual smart prompts and personalize questions for testimonial collection.

## Use Cases

### 1. Smart Prompt Generation
**Purpose**: Generate contextual questions based on product information

**Pseudo-Code**:
```
FUNCTION generateSmartPrompts(formId):
    form = getFormById(formId)
    context = {
        productName: form.product_name,
        productDescription: form.product_description
    }

    prompts = AI.generate({
        system: "Generate 4 testimonial questions following PSAR framework",
        context: context,
        framework: ["Problem", "Solution", "Accomplishment", "Recommend"]
    })

    RETURN prompts.map(p => {
        question_text: p.question,
        placeholder: p.placeholder,
        help_text: p.helpText
    })
```

### 2. Form Analytics Summary
**Purpose**: Generate insights about form performance

**Pseudo-Code**:
```
FUNCTION generateFormAnalytics(formId):
    form = getFormById(formId)
    submissions = getSubmissionsByFormId(formId)

    analytics = {
        totalSubmissions: submissions.length,
        conversionRate: calculateConversionRate(form),
        averageRating: calculateAverageRating(submissions),
        topKeywords: extractKeywords(submissions)
    }

    summary = AI.summarize({
        productName: form.product_name,
        analytics: analytics
    })

    RETURN summary
```

### 3. Question Optimization Suggestions
**Purpose**: Suggest improvements to form questions based on response patterns

**Pseudo-Code**:
```
FUNCTION suggestQuestionImprovements(formId):
    form = getFormById(formId)
    questions = getQuestionsByFormId(formId)
    responses = getResponsesByFormId(formId)

    FOR EACH question IN questions:
        responseQuality = analyzeResponseQuality(question, responses)

        IF responseQuality.averageLength < 50:
            suggestions.add({
                questionId: question.id,
                issue: "Short responses",
                suggestion: "Add more context or examples in help_text"
            })

        IF responseQuality.skipRate > 0.3:
            suggestions.add({
                questionId: question.id,
                issue: "High skip rate",
                suggestion: "Consider making optional or rephrasing"
            })

    RETURN suggestions
```
