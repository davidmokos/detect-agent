import { defaultAgents } from "./agents.js";
import { EnvironmentDetectionStrategy } from "./strategies/environment.js";
import { ProcessTreeDetectionStrategy } from "./strategies/process-tree.js";
import type {
  AgentDefinition,
  DetectAgentOptions,
  DetectedAgent,
  DetectionContext,
  DetectionEvidence,
  DetectionResult,
  DetectionStrategy
} from "./types.js";

export function detectAgent(options: DetectAgentOptions = {}): DetectionResult {
  const agents = options.agents ?? defaultAgents;
  const strategies = options.strategies ?? defaultStrategies(options.experimentalProcessTree);
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
      detected: false
    };
  }

  return {
    detected: true,
    agent: bestMatch
  };
}

export function isRunningFromAgent(options: DetectAgentOptions = {}): boolean {
  return detectAgent(options).detected;
}

export function createDefaultStrategies(experimentalProcessTree = false): readonly DetectionStrategy[] {
  return defaultStrategies(experimentalProcessTree);
}

function defaultStrategies(experimentalProcessTree = false): readonly DetectionStrategy[] {
  const strategies: DetectionStrategy[] = [new EnvironmentDetectionStrategy()];

  if (experimentalProcessTree) {
    strategies.push(new ProcessTreeDetectionStrategy());
  }

  return strategies;
}

function selectBestAgent(
  agents: readonly AgentDefinition[],
  matches: readonly DetectionEvidence[],
  env: NodeJS.ProcessEnv
): DetectedAgent | undefined {
  const matchedAgentIds = new Set(matches.map((match) => match.agent.id));

  for (const agent of agents) {
    if (!matchedAgentIds.has(agent.id)) {
      continue;
    }

    return {
      id: agent.id,
      name: agent.name,
      ...sessionIdProperties(agent, env)
    };
  }

  return undefined;
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
