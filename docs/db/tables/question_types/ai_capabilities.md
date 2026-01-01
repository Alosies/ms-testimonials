# Question Types - AI Capabilities

**Last Updated**: 2026-01-01-0803 (GMT+5:30)

## Overview

AI can leverage question types to intelligently select appropriate input types when generating smart prompts and to understand how to interpret responses based on answer_data_type. Types are aligned with Google Forms standards.

## Use Cases

### 1. Smart Question Type Selection
**Purpose**: Suggest optimal question types based on the kind of information being collected

**Pseudo-Code**:
```
FUNCTION suggestQuestionType(questionIntent):
    IF intent contains "rating" OR "score" OR "satisfaction":
        IF intent mentions "scale" OR "1-10":
            RETURN "rating_scale"
        ELSE:
            RETURN "rating_star"

    IF intent contains "email" OR "contact":
        RETURN "text_email"

    IF intent contains "choose" OR "select" AND "multiple":
        RETURN "choice_multiple"

    IF intent contains "agree" OR "consent" OR "permission":
        RETURN "input_checkbox"

    IF intent contains "toggle" OR "on/off" OR "yes/no":
        RETURN "input_switch"

    IF intent contains "date" OR "when":
        RETURN "input_date"

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
            RETURN normalizeRating(score, questionType.default_max_value)

        CASE "json":
            RETURN parseMultipleChoices(response.answer_json)

        CASE "boolean":
            IF questionType.unique_name == "input_checkbox":
                RETURN response.answer_boolean ? "Agreed" : "Declined"
            ELSE:
                RETURN response.answer_boolean ? "Yes" : "No"

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

### 4. Icon-Based UI Rendering
**Purpose**: Use icons to provide visual cues in form builder

**Pseudo-Code**:
```
FUNCTION renderQuestionTypeOption(questionType):
    RETURN {
        label: questionType.name,
        value: questionType.unique_name,
        icon: "heroicons:" + questionType.icon,
        category: questionType.category
    }
```
