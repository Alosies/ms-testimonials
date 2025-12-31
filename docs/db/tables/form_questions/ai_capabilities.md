# Form Questions - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI uses form questions to understand testimonial context, generate personalized follow-up prompts, and assemble coherent testimonials from responses keyed by question_key.

## Use Cases

### 1. Testimonial Assembly by Question Key
**Purpose**: Assemble a coherent testimonial from structured question responses

**Pseudo-Code**:
```
FUNCTION assembleTestimonial(submissionId):
    responses = getResponsesBySubmissionId(submissionId)
    questions = getQuestionsByFormId(responses[0].question.form_id)

    // Map responses by question_key for semantic access
    responseMap = {}
    FOR EACH response IN responses:
        key = response.question.question_key
        responseMap[key] = response.answer_text

    testimonial = AI.assemble({
        problem: responseMap["problem"],
        solution: responseMap["solution"],
        result: responseMap["result"],
        recommendation: responseMap["recommend"]
    })

    RETURN testimonial
```

### 2. Dynamic Placeholder Generation
**Purpose**: Generate contextual placeholders based on previous answers

**Pseudo-Code**:
```
FUNCTION generateDynamicPlaceholder(questionId, previousAnswers):
    question = getQuestionById(questionId)
    form = getFormById(question.form_id)

    IF question.question_key == "solution":
        problem = previousAnswers["problem"]
        placeholder = AI.generate({
            prompt: "Generate placeholder for solution question",
            context: {
                productName: form.product_name,
                problemMentioned: problem
            }
        })
        RETURN placeholder

    RETURN question.placeholder
```

### 3. Question Relevance Scoring
**Purpose**: Determine which questions yield best testimonial content

**Pseudo-Code**:
```
FUNCTION scoreQuestionRelevance(formId):
    questions = getQuestionsByFormId(formId)
    responses = getResponsesByFormId(formId)

    scores = []
    FOR EACH question IN questions:
        questionResponses = filterByQuestionId(responses, question.id)

        score = {
            questionId: question.id,
            questionKey: question.question_key,
            avgLength: average(questionResponses.map(r => r.answer_text.length)),
            sentimentVariance: calculateSentimentVariance(questionResponses),
            uniqueInsights: countUniqueInsights(questionResponses)
        }
        scores.add(score)

    RETURN scores.sortBy(s => s.uniqueInsights, DESC)
```

### 4. Smart Question Suggestions
**Purpose**: Suggest additional questions based on response patterns

**Pseudo-Code**:
```
FUNCTION suggestAdditionalQuestions(formId):
    form = getFormById(formId)
    existingKeys = getQuestionKeys(formId)
    responses = getResponsesByFormId(formId)

    // Identify gaps in PSAR framework
    recommendedKeys = ["problem", "solution", "accomplishment", "recommend"]
    missingKeys = recommendedKeys.filter(k => !existingKeys.includes(k))

    suggestions = []
    FOR EACH key IN missingKeys:
        suggestion = AI.suggestQuestion({
            framework: key,
            productName: form.product_name,
            productDescription: form.product_description
        })
        suggestions.add(suggestion)

    RETURN suggestions
```
