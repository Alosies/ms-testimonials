// Provider configuration
export {
  getModel,
  getModelForQuality,
  getModelInfo,
  getAIProvider,
  isProviderAvailable,
  CREDIT_COSTS,
  QUALITY_TO_PRESET,
  type AIProvider,
  type ModelPreset,
  type QualityLevel,
} from './providers';

// Audit tracking and credit calculation
export {
  calculateEstimatedCost,
  calculateCreditsFromCost,
  getCreditConversionRate,
  buildTrackingTag,
  extractUsageFromResponse,
  createAuditRecord,
  logAIUsage,
  type AIOperationType,
  type AIUsageData,
  type AIAuditRecord,
  type AITrackingContext,
  type AILogEntry,
} from './audit';
