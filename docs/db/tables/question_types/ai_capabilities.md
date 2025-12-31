# Question Types - AI Capabilities

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Overview

AI can leverage question types to intelligently select appropriate input types when generating smart prompts and to understand how to interpret responses based on answer_data_type.

## Use Cases

### 1. Smart Question Type Selection
**Purpose**: Suggest optimal question types based on the kind of information being collected

**Pseudo-Code**:
```
FUNCTION suggestQuestionType(questionIntent):
    IF intent contains "rating" OR "score" OR "satisfaction":
        IF intent mentions "NPS" OR "recommend":
            RETURN "rating_nps"
        ELSE:
            RETURN "rating_star"

    IF intent contains "email" OR "contact":
        RETURN "text_email"

    IF intent contains "choose" OR "select" AND "multiple":
        RETURN "choice_multiple"

    IF intent contains "long" OR "describe" OR "explain":
        RETURN "text_long"

    RETURN "text_short"
```

### 2. Response Interpretation
**Purpose**: Parse and interpret form responses based on question type

**Pseudo-Code**:
```
FUNCTION interpretResponse(questionTypeId, response):
    questionType = getQuestionTypeById(questionTypeId)

    SWITCH questionType.answer_data_type:
        CASE "integer":
            score = parseInteger(response.answer_integer)
            IF questionType.unique_name == "rating_nps":
                RETURN classifyNPS(score)  // Promoter/Passive/Detractor
            ELSE:
                RETURN normalizeRating(score, questionType.default_max_value)

        CASE "json":
            RETURN parseMultipleChoices(response.answer_json)

        CASE "boolean":
            RETURN response.answer_boolean ? "Consented" : "Declined"

        DEFAULT:
            RETURN response.answer_text
```

### 3. Validation Rule Inference
**Purpose**: Auto-configure validation based on question type capabilities

**Pseudo-Code**:
```
FUNCTION configureValidation(questionTypeId):
    questionType = getQuestionTypeById(questionTypeId)
    validation = {}

    IF questionType.supports_min_length:
        validation.minLength = questionType.default_min_value OR 1

    IF questionType.supports_max_length:
        validation.maxLength = questionType.default_max_value OR 500

    IF questionType.supports_min_value:
        validation.min = questionType.default_min_value

    IF questionType.supports_max_value:
        validation.max = questionType.default_max_value

    IF questionType.supports_pattern:
        validation.pattern = getPatternForType(questionType.unique_name)

    RETURN validation
```
