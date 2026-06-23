import type {
  AgentDefinition,
  Confidence,
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
  const score = scoreForEnvSignal(signal);

  return {
    agent: {
      id: agent.id,
      name: agent.name
    },
    strategy: "environment",
    confidence: scoreToConfidence(score),
    score,
    signal: signal.name,
    value
  };
}

function scoreForEnvSignal(signal: EnvSignal): number {
  if (signal.confidence !== undefined) {
    return scoreForConfidence(signal.confidence);
  }

  return signal.value === undefined ? 0.75 : 0.95;
}

function scoreForConfidence(confidence: Confidence): number {
  if (confidence === "high") {
    return 0.95;
  }

  if (confidence === "medium") {
    return 0.75;
  }

  return 0.4;
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
