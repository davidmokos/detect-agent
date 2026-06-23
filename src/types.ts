export type AgentId =
  | "antigravity"
  | "cline"
  | "codex"
  | "copilot"
  | "cursor"
  | "gemini"
  | "kilocode"
  | "claude-code"
  | "opencode"
  | "pi"
  | "aider"
  | "amazon-q"
  | "codeium"
  | "continue"
  | "windsurf";

export type DetectionStrategyName = "environment" | "process-tree";

export type Confidence = "high" | "medium" | "low";

export type EnvValueMatcher =
  | string
  | RegExp
  | ((value: string) => boolean);

export interface EnvSignal {
  readonly name: string;
  readonly value?: EnvValueMatcher;
  readonly confidence?: Confidence;
  readonly description?: string;
}

export interface ProcessSignal {
  readonly pattern: RegExp;
  readonly confidence?: Confidence;
  readonly description?: string;
}

export interface AgentIdentity {
  readonly id: AgentId | string;
  readonly name: string;
}

export interface DetectedAgent extends AgentIdentity {
  readonly sessionId?: string;
}

export interface AgentDefinition extends AgentIdentity {
  readonly env?: readonly EnvSignal[];
  readonly process?: readonly ProcessSignal[];
  readonly sessionEnv?: readonly string[];
}

export interface ProcessInfo {
  readonly pid: number;
  readonly ppid?: number;
  readonly command: string;
}

export interface DetectionEvidence {
  readonly agent: AgentIdentity;
  readonly strategy: DetectionStrategyName | string;
  readonly confidence: Confidence;
  readonly score: number;
  readonly signal: string;
  readonly value?: string;
}

export interface ConfidenceMeasurement {
  readonly level: Confidence;
  readonly score: number;
  readonly signals: number;
}

export interface DetectionResult {
  readonly detected: boolean;
  readonly agent?: DetectedAgent;
  readonly confidence?: ConfidenceMeasurement;
}

export interface DetectionContext {
  readonly env: NodeJS.ProcessEnv;
  readonly pid: number;
  readonly agents: readonly AgentDefinition[];
  readonly maxProcessDepth: number;
}

export interface DetectionStrategy {
  readonly name: DetectionStrategyName | string;
  detect(context: DetectionContext): readonly DetectionEvidence[];
}

export interface DetectAgentOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly pid?: number;
  readonly agents?: readonly AgentDefinition[];
  readonly strategies?: readonly DetectionStrategy[];
  readonly includeProcessTree?: boolean;
  readonly maxProcessDepth?: number;
}
