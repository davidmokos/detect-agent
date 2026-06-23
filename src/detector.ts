import { defaultAgents } from "./agents.js";
import { EnvironmentDetectionStrategy } from "./strategies/environment.js";
import { ProcessTreeDetectionStrategy } from "./strategies/process-tree.js";
import type {
  AgentDefinition,
  Confidence,
  ConfidenceMeasurement,
  DetectAgentOptions,
  DetectedAgent,
  DetectionContext,
  DetectionEvidence,
  DetectionResult,
  DetectionStrategy
} from "./types.js";

export function detectAgent(options: DetectAgentOptions = {}): DetectionResult {
  const agents = options.agents ?? defaultAgents;
  const strategies = options.strategies ?? defaultStrategies(options.includeProcessTree);
  const context: DetectionContext = {
    env: options.env ?? process.env,
    pid: options.pid ?? process.pid,
    agents,
    maxProcessDepth: options.maxProcessDepth ?? 20
  };

  const matches = strategies.flatMap((strategy) => strategy.detect(context));
  const bestMatch = selectBestAgent(agents, matches, context.env);

  if (bestMatch === undefined) {
    return {
      detected: false,
      matches
    };
  }

  return {
    detected: true,
    agent: bestMatch.detectedAgent,
    confidence: bestMatch.confidence,
    matches
  };
}

export function isRunningFromAgent(options: DetectAgentOptions = {}): boolean {
  return detectAgent(options).detected;
}

export function createDefaultStrategies(includeProcessTree = true): readonly DetectionStrategy[] {
  return defaultStrategies(includeProcessTree);
}

function defaultStrategies(includeProcessTree = true): readonly DetectionStrategy[] {
  const strategies: DetectionStrategy[] = [new EnvironmentDetectionStrategy()];

  if (includeProcessTree) {
    strategies.push(new ProcessTreeDetectionStrategy());
  }

  return strategies;
}

interface AgentMatch {
  readonly agent: AgentDefinition;
  readonly detectedAgent: DetectedAgent;
  readonly confidence: ConfidenceMeasurement;
  readonly evidence: readonly DetectionEvidence[];
}

function selectBestAgent(
  agents: readonly AgentDefinition[],
  matches: readonly DetectionEvidence[],
  env: NodeJS.ProcessEnv
): AgentMatch | undefined {
  const agentMatches: AgentMatch[] = [];

  for (const agent of agents) {
    const evidence = matches.filter((match) => match.agent.id === agent.id);

    if (evidence.length === 0) {
      continue;
    }

    agentMatches.push({
      agent,
      detectedAgent: {
        id: agent.id,
        name: agent.name,
        ...sessionIdProperties(agent, env)
      },
      confidence: measureConfidence(evidence),
      evidence
    });
  }

  return agentMatches.sort(compareAgentMatches)[0];
}

function measureConfidence(evidence: readonly DetectionEvidence[]): ConfidenceMeasurement {
  const score = roundScore(1 - evidence.reduce((miss, match) => miss * (1 - match.score), 1));

  return {
    level: scoreToConfidence(score),
    score,
    signals: evidence.length
  };
}

function compareAgentMatches(left: AgentMatch, right: AgentMatch): number {
  const scoreDelta = right.confidence.score - left.confidence.score;

  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return bestStrategyRank(right.evidence) - bestStrategyRank(left.evidence);
}

function bestStrategyRank(evidence: readonly DetectionEvidence[]): number {
  return Math.max(...evidence.map((match) => strategyRank(match.strategy)));
}

function strategyRank(strategy: string): number {
  if (strategy === "environment") {
    return 2;
  }

  if (strategy === "process-tree") {
    return 1;
  }

  return 0;
}

function sessionIdProperties(
  agent: AgentDefinition,
  env: NodeJS.ProcessEnv
): { readonly sessionId?: string } {
  for (const envName of agent.sessionEnv ?? []) {
    const value = env[envName];

    if (value !== undefined && value.length > 0) {
      return { sessionId: value };
    }
  }

  return {};
}

function scoreToConfidence(score: number): Confidence {
  if (score >= 0.85) {
    return "high";
  }

  if (score >= 0.6) {
    return "medium";
  }

  return "low";
}

function roundScore(score: number): number {
  return Math.round(score * 1000) / 1000;
}
