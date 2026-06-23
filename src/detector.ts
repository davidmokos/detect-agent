import { defaultAgents } from "./agents.js";
import { EnvironmentDetectionStrategy } from "./strategies/environment.js";
import { ProcessTreeDetectionStrategy } from "./strategies/process-tree.js";
import type {
  Confidence,
  DetectAgentOptions,
  DetectionContext,
  DetectionEvidence,
  DetectionResult,
  DetectionStrategy
} from "./types.js";

const confidenceRank: Record<Confidence, number> = {
  high: 3,
  medium: 2,
  low: 1
};

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
  const bestMatch = selectBestMatch(matches);

  if (bestMatch === undefined) {
    return {
      detected: false,
      matches
    };
  }

  return {
    detected: true,
    agent: bestMatch.agent,
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

function selectBestMatch(
  matches: readonly DetectionEvidence[]
): DetectionEvidence | undefined {
  return [...matches].sort(compareEvidence)[0];
}

function compareEvidence(left: DetectionEvidence, right: DetectionEvidence): number {
  const confidenceDelta = confidenceRank[right.confidence] - confidenceRank[left.confidence];

  if (confidenceDelta !== 0) {
    return confidenceDelta;
  }

  return strategyRank(right.strategy) - strategyRank(left.strategy);
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
