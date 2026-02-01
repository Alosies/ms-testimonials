// HTTP handler
export { assembleTestimonial } from './assembleTestimonial';

// Data fetching (impure)
export {
  getFormById,
  type FormData,
  type GetFormByIdResult,
} from './getFormById';

// AI execution (impure)
export {
  executeAssembly,
  type AssemblyResult,
  type ExecuteAssemblyParams,
  type ExecuteAssemblyResult,
} from './executeAssembly';
