export { defaultAgents } from "./agents.js";
export {
  createDefaultStrategies,
  detectAgent,
  isRunningFromAgent
} from "./detector.js";
export { EnvironmentDetectionStrategy } from "./strategies/environment.js";
export {
  ProcessTreeDetectionStrategy,
  PsProcessReader,
  type ProcessReader
} from "./strategies/process-tree.js";
export type {
  AgentDefinition,
  AgentId,
  AgentIdentity,
  Confidence,
  ConfidenceMeasurement,
  DetectAgentOptions,
  DetectedAgent,
  DetectionContext,
  DetectionEvidence,
  DetectionResult,
  DetectionStrategy,
  DetectionStrategyName,
  EnvSignal,
  EnvValueMatcher,
  ProcessInfo,
  ProcessSignal
} from "./types.js";
