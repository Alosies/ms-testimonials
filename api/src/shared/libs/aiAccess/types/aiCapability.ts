/**
 * AI Capability Access Types
 *
 * TypeScript types for checking AI capability access and credit management.
 * These types support the ADR-023 AI Capabilities & Plan Integration system.
 *
 * Database Tables Referenced:
 * - quality_levels: Defines AI quality tiers (fast, enhanced, premium)
 * - ai_capabilities: Catalog of AI features (question_generation, etc.)
 * - plan_ai_capabilities: Junction linking plans to capabilities with rate limits
 * - plan_ai_capability_quality_levels: Links plan-capabilities to quality levels
 * - plan_quality_level_models: Links quality levels to available LLM models
 * - llm_models: Catalog of AI models with provider metadata
 * - organization_credit_balances: Credit balance state per organization
 * - credit_transactions: Immutable audit log of credit changes
 * - credit_reservations: Tracks in-flight AI operations
 */

// =============================================================================
// AI Capability Identifiers
// =============================================================================

/**
 * AI capability identifiers matching the database ai_capabilities.unique_name column.
 *
 * These are the machine-readable names used in code to reference specific
 * AI capabilities. Each maps to a row in the ai_capabilities table.
 *
 * @example
 * const capability: AICapabilityId = 'question_generation';
 */
export type AICapabilityId =
  | 'question_generation'
  | 'testimonial_assembly'
  | 'testimonial_polish';

// =============================================================================
// Quality Level Identifiers
// =============================================================================

/**
 * Quality level identifiers matching the database quality_levels.unique_name column.
 *
 * Each quality level represents a tier of AI model capability and associated
 * credit cost. Higher quality levels use more capable (and expensive) models.
 *
 * - fast: Quick responses using efficient models (1.0x credits)
 * - enhanced: Better quality with smarter models (1.5x credits)
 * - premium: Best quality using most capable models (3.0x credits)
 *
 * @example
 * const quality: QualityLevelId = 'enhanced';
 */
export type QualityLevelId = 'fast' | 'enhanced' | 'premium';

// =============================================================================
// Quality Level Information
// =============================================================================

/**
 * Quality level information returned when checking capability access.
 *
 * Contains all the information needed to execute an AI operation at a
 * specific quality level, including credit cost and available models.
 *
 * @property id - Database ID (NanoID) of the quality level
 * @property uniqueName - Machine-readable identifier (fast, enhanced, premium)
 * @property name - Human-readable display name
 * @property creditCost - Credits required for this quality level
 * @property defaultModelId - ID of the default LLM model for this quality level
 * @property allowedModelIds - All LLM model IDs available at this quality level
 */
export interface QualityLevelInfo {
  /** Database ID (NanoID) of the quality level */
  id: string;

  /** Machine-readable unique identifier (fast, enhanced, premium) */
  uniqueName: QualityLevelId;

  /** Human-readable display name shown in UI */
  name: string;

  /** Credits required to use this quality level for the capability */
  creditCost: number;

  /** Database ID of the default LLM model for this quality level */
  defaultModelId: string;

  /** Array of all LLM model IDs available at this quality level */
  allowedModelIds: string[];
}

// =============================================================================
// Access Check Results
// =============================================================================

/**
 * Reasons why capability access may be denied.
 *
 * Used in AICapabilityAccessResult.reason to explain why hasAccess is false.
 *
 * - plan_not_active: The organization's plan is not active
 * - capability_not_included: The plan doesn't include this AI capability
 * - rate_limit_exceeded: Daily or monthly rate limits have been reached
 */
export type AICapabilityDenialReason =
  | 'plan_not_active'
  | 'capability_not_included'
  | 'rate_limit_exceeded';

/**
 * Result of checking capability access for a plan.
 *
 * Returned by checkCapabilityAccess() to indicate whether an organization
 * can use a specific AI capability, and if so, what quality levels and
 * rate limits apply.
 *
 * @property hasAccess - Whether the organization can use this capability
 * @property capabilityId - Database ID of the AI capability
 * @property capabilityName - Human-readable name of the capability
 * @property availableQualityLevels - Quality levels accessible to this plan
 * @property dailyLimit - Max requests per day (null = unlimited)
 * @property monthlyLimit - Max requests per month (null = unlimited)
 * @property usedToday - Requests made today for this capability
 * @property usedThisMonth - Requests made this month for this capability
 * @property reason - Why access was denied (only set when hasAccess is false)
 */
export interface AICapabilityAccessResult {
  /** Whether the organization can use this AI capability */
  hasAccess: boolean;

  /** Database ID (NanoID) of the AI capability */
  capabilityId: string;

  /** Human-readable name of the capability */
  capabilityName: string;

  /** Quality levels available for this capability on the organization's plan */
  availableQualityLevels: QualityLevelInfo[];

  /** Maximum requests per day (null means unlimited) */
  dailyLimit: number | null;

  /** Maximum requests per month (null means unlimited) */
  monthlyLimit: number | null;

  /** Number of requests made today for this capability */
  usedToday: number;

  /** Number of requests made this month for this capability */
  usedThisMonth: number;

  /** Reason for denial (only present when hasAccess is false) */
  reason?: AICapabilityDenialReason;
}

// =============================================================================
// Combined Access Check Result
// =============================================================================

/**
 * Reasons why an AI operation cannot proceed.
 *
 * More detailed than AICapabilityDenialReason, includes credit-related denials.
 */
export type AIAccessDenialReason =
  | 'plan_not_active'
  | 'capability_not_included'
  | 'rate_limit_exceeded'
  | 'insufficient_credits'
  | 'quality_level_not_available';

/**
 * Combined result for full AI access check (capability + credits).
 *
 * This is the primary type used by API endpoints to determine if an AI
 * operation can proceed. It combines capability access checks with credit
 * balance verification.
 *
 * @property canProceed - Whether the AI operation can be executed
 * @property capability - Full capability access check result
 * @property credits - Credit balance and requirements
 * @property selectedQualityLevel - The quality level to use for the operation
 * @property reason - Human-readable explanation if canProceed is false
 *
 * @example
 * const access = await checkAIAccess(orgId, 'question_generation', 'enhanced');
 * if (!access.canProceed) {
 *   return errorResponse(c, access.reason, 402);
 * }
 * // Proceed with AI operation using access.selectedQualityLevel
 */
export interface AIAccessResult {
  /** Whether the AI operation can proceed */
  canProceed: boolean;

  /** Full capability access check result */
  capability: AICapabilityAccessResult;

  /** Credit balance information */
  credits: {
    /** Currently available credits (monthly + bonus - reserved - used) */
    available: number;

    /** Credits required for this operation at the selected quality level */
    required: number;

    /** Projected balance after the operation completes */
    afterOperation: number;
  };

  /** The quality level that will be used for the operation */
  selectedQualityLevel: QualityLevelInfo;

  /** Human-readable reason if canProceed is false */
  reason?: string;
}

// =============================================================================
// Credit Transaction Types
// =============================================================================

/**
 * Types of credit transactions that can occur.
 *
 * Matches the CHECK constraint on credit_transactions.transaction_type column.
 *
 * - ai_consumption: Credits consumed by an AI operation (negative)
 * - plan_allocation: Monthly credit allocation from plan (positive)
 * - topup_purchase: Purchased credit package (positive)
 * - promo_bonus: Promotional bonus credits (positive)
 * - admin_adjustment: Manual adjustment by admin (positive or negative)
 * - plan_change_adjustment: Credits added during plan upgrade (positive)
 * - expiration: Expired unused monthly credits (negative)
 */
export type CreditTransactionType =
  | 'ai_consumption'
  | 'plan_allocation'
  | 'topup_purchase'
  | 'promo_bonus'
  | 'admin_adjustment'
  | 'plan_change_adjustment'
  | 'expiration';

// =============================================================================
// Credit Reservation Status
// =============================================================================

/**
 * Status of a credit reservation.
 *
 * Matches the CHECK constraint on credit_reservations.status column.
 *
 * - pending: Reservation is active, operation in progress
 * - settled: Operation completed successfully, credits consumed
 * - released: Operation cancelled or failed, credits returned
 * - expired: Reservation timed out, credits automatically returned
 */
export type CreditReservationStatus =
  | 'pending'
  | 'settled'
  | 'released'
  | 'expired';

// =============================================================================
// LLM Provider Types
// =============================================================================

/**
 * Supported LLM provider identifiers.
 *
 * Matches the CHECK constraint on llm_models.provider column.
 */
export type LLMProvider = 'openai' | 'google' | 'anthropic';

/**
 * Quality tier classification for LLM models.
 *
 * Matches the CHECK constraint on llm_models.quality_tier column.
 * Note: This is the model's primary quality tier, not the same as QualityLevelId.
 */
export type LLMQualityTier = 'fast' | 'balanced' | 'powerful';
