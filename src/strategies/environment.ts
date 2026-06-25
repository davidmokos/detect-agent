import type {
  AgentDefinition,
  DetectionContext,
  DetectionEvidence,
  DetectionStrategy,
  EnvSignal,
  EnvValueMatcher
} from "../types.js";

export class EnvironmentDetectionStrategy implements DetectionStrategy {
  readonly name = "environment";

  detect(context: DetectionContext): readonly DetectionEvidence[] {
    const matches: DetectionEvidence[] = [];

    for (const agent of context.agents) {
      for (const signal of agent.env ?? []) {
        const value = context.env[signal.name];

        if (value === undefined || !matchesEnvValue(value, signal.value)) {
          continue;
        }

        matches.push(toEvidence(agent, signal, value));
      }
    }

    return matches;
  }
}

function matchesEnvValue(value: string, matcher: EnvValueMatcher | undefined): boolean {
  if (matcher === undefined) {
    return true;
  }

  if (typeof matcher === "string") {
    return value === matcher;
  }

  if (matcher instanceof RegExp) {
    return matcher.test(value);
  }

  return matcher(value);
}

function toEvidence(agent: AgentDefinition, signal: EnvSignal, value: string): DetectionEvidence {
  return {
    agent: {
      id: agent.id,
      name: agent.name
    },
    strategy: "environment",
    signal: signal.name,
    value
  };
}
