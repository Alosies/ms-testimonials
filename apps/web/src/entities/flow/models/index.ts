export type * from './mutations';

// Utility types
export type FlowId = string;
export type FlowType = 'shared' | 'branch';

// Branch condition structure per ADR-009
export interface BranchCondition {
  field: string;
  op: '>=' | '>' | '<' | '<=' | '=' | '!=' | 'between';
  value: number | boolean | [number, number];
}
