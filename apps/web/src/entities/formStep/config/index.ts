/**
 * Form Step Configuration - Barrel Export
 */
export {
  stepTypeRegistry,
  getStepTypeConfig,
  getStepTypeConfigSafe,
  stepTypeRequiresQuestion,
  getStepTypeDefaultContent,
  getStepTypesForFlow,
  getAllStepTypes,
  getStepTypesByCategory,
} from './stepTypeRegistry';

export type {
  StepTypeConfig,
  StepTypeRegistry,
  StepTypeCategory,
} from './stepTypeRegistry';
