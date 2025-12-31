# Question Options - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI can leverage question options to understand categorical responses, generate sentiment analysis based on selected options, and suggest optimal option configurations.

## Use Cases

### 1. Option Selection Analysis
**Purpose**: Analyze distribution of selected options for insights

**Pseudo-Code**:
```
FUNCTION analyzeOptionDistribution(questionId):
    options = getOptionsByQuestionId(questionId)
    responses = getResponsesByQuestionId(questionId)

    distribution = {}
    FOR EACH option IN options:
        count = responses.filter(r => r.answer_text == option.option_value).length
        distribution[option.option_label] = {
            count: count,
            percentage: (count / responses.length) * 100
        }

    insights = AI.analyze({
        distribution: distribution,
        totalResponses: responses.length
    })

    RETURN {
        distribution: distribution,
        insights: insights
    }
```

### 2. Sentiment Mapping
**Purpose**: Map option values to sentiment scores for analysis

**Pseudo-Code**:
```
FUNCTION mapOptionSentiment(questionId):
    options = getOptionsByQuestionId(questionId)

    sentimentMap = {}
    FOR EACH option IN options:
        sentiment = AI.classifySentiment(option.option_label)
        sentimentMap[option.option_value] = {
            label: option.option_label,
            sentiment: sentiment.score,  // -1 to 1
            category: sentiment.category  // negative/neutral/positive
        }

    RETURN sentimentMap
```

### 3. Option Suggestions
**Purpose**: Suggest additional options based on response patterns

**Pseudo-Code**:
```
FUNCTION suggestMissingOptions(questionId):
    question = getQuestionById(questionId)
    existingOptions = getOptionsByQuestionId(questionId)
    responses = getOpenEndedSimilarResponses(question.form_id)

    // Analyze if users are adding custom text that could be an option
    commonPatterns = AI.extractPatterns(responses)

    suggestions = []
    FOR EACH pattern IN commonPatterns:
        IF NOT existingOptions.any(o => o.option_label.similar(pattern)):
            suggestions.add({
                suggestedValue: slugify(pattern),
                suggestedLabel: pattern,
                frequency: pattern.count
            })

    RETURN suggestions
```

### 4. Default Option Recommendation
**Purpose**: Recommend which option should be default based on usage

**Pseudo-Code**:
```
FUNCTION recommendDefaultOption(questionId):
    options = getOptionsByQuestionId(questionId)
    responses = getResponsesByQuestionId(questionId)

    // Find most commonly selected option
    optionCounts = {}
    FOR EACH response IN responses:
        optionCounts[response.answer_text] = (optionCounts[response.answer_text] || 0) + 1

    mostCommon = Object.entries(optionCounts)
        .sortBy(([_, count]) => count, DESC)
        .first()

    // Only recommend if significantly more common
    IF mostCommon[1] / responses.length > 0.4:
        RETURN {
            recommendedDefault: mostCommon[0],
            reason: "Selected by {mostCommon[1] / responses.length * 100}% of respondents"
        }

    RETURN null
```
