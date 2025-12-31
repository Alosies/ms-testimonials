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

// Audit tracking
export {
  calculateEstimatedCost,
  buildTrackingTag,
  extractUsageFromResponse,
  createAuditRecord,
  type AIOperationType,
  type AIUsageData,
  type AIAuditRecord,
  type AITrackingContext,
} from './audit';
