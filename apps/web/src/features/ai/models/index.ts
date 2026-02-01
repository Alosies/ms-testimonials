/**
 * AI Feature Models
 *
 * Type definitions for AI access checking and credit management.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */

// =============================================================================
// AI Access Check Types (from useAIAccess)
// =============================================================================

/**
 * Model information in access check response
 */
export interface AIAccessCheckModel {
  id: string;
  name: string;
  isDefault: boolean;
}

/**
 * Quality level with full details including allowed models
 */
export interface AIAccessCheckQualityLevel {
  id: string;
  name: string;
  creditCost: number;
  allowedModels: AIAccessCheckModel[];
}

/**
 * Quality level summary for listing available options
 */
export interface AIAccessCheckQualityLevelSummary {
  id: string;
  name: string;
  creditCost: number;
}

/**
 * Capability access information
 */
export interface AIAccessCheckCapability {
  id: string;
  name: string;
  hasAccess: boolean;
}

/**
 * Credit availability information
 */
export interface AIAccessCheckCredits {
  available: number;
  required: number;
  hasEnough: boolean;
}

/**
 * Complete access check response
 */
export interface AIAccessCheck {
  canProceed: boolean;
  capability: AIAccessCheckCapability;
  credits: AIAccessCheckCredits;
  selectedQualityLevel: AIAccessCheckQualityLevel | null;
  availableQualityLevels: AIAccessCheckQualityLevelSummary[];
  upgradeHint?: string;
  topupHint?: string;
}

/**
 * Request payload for access check API
 */
export interface AIAccessCheckRequest {
  capabilityUniqueName: string;
  qualityLevelUniqueName?: string;
}

// =============================================================================
// AI Operation Types (from useAIOperationWithCredits)
// =============================================================================

/**
 * Capability unique names for AI operations
 */
export type AICapabilityName = 'question_generation' | 'testimonial_assembly' | 'testimonial_polish';

/**
 * Quality level unique names
 */
export type AIQualityLevel = 'fast' | 'enhanced' | 'premium';

/**
 * Options for executing an AI operation with credits
 */
export interface ExecuteWithCreditsOptions<T> {
  /** The capability being used */
  capability: AICapabilityName;
  /** Optional quality level (defaults to cheapest available) */
  qualityLevel?: AIQualityLevel;
  /** The actual AI operation to execute */
  execute: () => Promise<T>;
  /** Optional idempotency key to prevent duplicate charges */
  idempotencyKey?: string;
}

/**
 * Result of an AI operation with credits
 */
export interface AIOperationWithCreditsResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** Credits consumed by the operation */
  creditsUsed?: number;
  /** Remaining balance after the operation */
  balanceRemaining?: number;
  /** Error message if failed */
  error?: string;
  /** Whether access was denied (needs upgrade or topup) */
  accessDenied?: boolean;
  /** The access check result (for detailed info) */
  accessCheck?: AIAccessCheck;
}

/**
 * Stored result of the last AI operation
 */
export interface LastAIOperationResult {
  capability: AICapabilityName;
  qualityLevel?: AIQualityLevel;
  success: boolean;
  creditsUsed?: number;
  balanceRemaining?: number;
  error?: string;
  accessDenied?: boolean;
  timestamp: Date;
}
