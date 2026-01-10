/**
 * Structured value format for branch_value JSONB column.
 * The `type` field enables type-safe parsing and validation.
 * All fields are required - no optional/default values in storage.
 */
export type BranchValue =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | {
      type: 'range';
      min: number;
      max: number;
      minInclusive: boolean; // Always explicit: true = includes min value
      maxInclusive: boolean; // Always explicit: true = includes max value
    }
  | { type: 'list'; values: (number | string)[] }
  | null; // For is_empty operator

/**
 * Response fields map to form_question_responses columns.
 */
export type ResponseField =
  | 'answer_integer' // Star rating (1-5), NPS (0-10), scale values
  | 'answer_text' // Single choice option value, short/long text
  | 'answer_boolean' // Consent checkbox, yes/no questions
  | 'answer_json'; // Multiple choice selected values array

/**
 * Verbose operator names for clarity and self-documentation.
 */
export type BranchOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal_to'
  | 'less_than'
  | 'less_than_or_equal_to'
  | 'between'
  | 'is_one_of'
  | 'contains'
  | 'is_empty';

/**
 * Flattened branch condition columns (stored on flows table).
 */
export interface FlowBranchCondition {
  branch_question_id: string | null;
  branch_field: ResponseField | null;
  branch_operator: BranchOperator | null;
  branch_value: BranchValue;
}

/**
 * Flow type distinguishes shared flows (always shown) from branch flows (conditional).
 */
export type FlowType = 'shared' | 'branch';
