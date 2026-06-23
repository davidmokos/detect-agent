#!/usr/bin/env node
import { detectAgent } from "./index.js";
import type { DetectionResult } from "./types.js";

const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const quiet = args.has("--quiet");
const help = args.has("--help") || args.has("-h");

if (help) {
  printHelp();
  process.exit(0);
}

const result = detectAgent();

if (json) {
  console.log(JSON.stringify(toJsonResult(result), null, 2));
} else if (!quiet) {
  if (result.detected && result.agent !== undefined) {
    console.log(`detected: ${result.agent.name}`);
  } else {
    console.log("no coding agent detected");
  }
}

process.exit(result.detected ? 0 : 1);

function printHelp(): void {
  console.log(`Usage: detect-agent [--json] [--quiet]

Detect whether the current process is running inside a coding agent.

Options:
  --json    Print the full detection result as JSON
  --quiet   Print nothing and use only the exit code
  -h, --help
           Show this help message
`);
}

function toJsonResult(result: DetectionResult): object {
  return {
    detected: result.detected,
    agent: result.agent === undefined
      ? undefined
      : {
          id: result.agent.id,
          name: result.agent.name
        },
    confidence: result.confidence,
    matches: result.matches.map((match) => ({
      agent: {
        id: match.agent.id,
        name: match.agent.name
      },
      strategy: match.strategy,
      confidence: match.confidence,
      signal: match.signal,
      value: match.value
    }))
  };
}
