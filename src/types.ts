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

export interface AgentDefinition {
  readonly id: AgentId | string;
  readonly name: string;
  readonly env?: readonly EnvSignal[];
  readonly process?: readonly ProcessSignal[];
}

export interface ProcessInfo {
  readonly pid: number;
  readonly ppid?: number;
  readonly command: string;
}

export interface DetectionEvidence {
  readonly agent: AgentDefinition;
  readonly strategy: DetectionStrategyName | string;
  readonly confidence: Confidence;
  readonly signal: string;
  readonly value?: string;
}

export interface DetectionResult {
  readonly detected: boolean;
  readonly agent?: AgentDefinition;
  readonly confidence?: Confidence;
  readonly matches: readonly DetectionEvidence[];
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
