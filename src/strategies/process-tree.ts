import { execFileSync } from "node:child_process";
import path from "node:path";
import type {
  AgentDefinition,
  DetectionContext,
  DetectionEvidence,
  DetectionStrategy,
  ProcessInfo,
  ProcessSignal
} from "../types.js";

export interface ProcessReader {
  read(pid: number): ProcessInfo | undefined;
}

export class PsProcessReader implements ProcessReader {
  read(pid: number): ProcessInfo | undefined {
    const command = readPsField(pid, "comm");
    const ppid = Number.parseInt(readPsField(pid, "ppid"), 10);

    if (!command || !Number.isInteger(ppid)) {
      return undefined;
    }

    return {
      pid,
      ppid,
      command: normalizeCommand(command)
    };
  }
}

export class ProcessTreeDetectionStrategy implements DetectionStrategy {
  readonly name = "process-tree";

  constructor(private readonly reader: ProcessReader = new PsProcessReader()) {}

  detect(context: DetectionContext): readonly DetectionEvidence[] {
    const matches: DetectionEvidence[] = [];
    let currentPid = context.pid;

    for (let depth = 0; depth < context.maxProcessDepth; depth += 1) {
      const processInfo = this.reader.read(currentPid);

      if (processInfo === undefined) {
        break;
      }

      matches.push(...matchProcess(context.agents, processInfo));

      if (processInfo.ppid === undefined || processInfo.ppid <= 1 || processInfo.ppid === currentPid) {
        break;
      }

      currentPid = processInfo.ppid;
    }

    return matches;
  }
}

function matchProcess(
  agents: readonly AgentDefinition[],
  processInfo: ProcessInfo
): readonly DetectionEvidence[] {
  const matches: DetectionEvidence[] = [];
  const command = normalizeCommand(processInfo.command);

  for (const agent of agents) {
    for (const signal of agent.process ?? []) {
      if (!signal.pattern.test(command)) {
        continue;
      }

      matches.push(toEvidence(agent, signal, { ...processInfo, command }));
    }
  }

  return matches;
}

function toEvidence(
  agent: AgentDefinition,
  signal: ProcessSignal,
  processInfo: ProcessInfo
): DetectionEvidence {
  return {
    agent: {
      id: agent.id,
      name: agent.name
    },
    strategy: "process-tree",
    signal: signal.pattern.toString(),
    value: `${processInfo.pid}:${processInfo.command}`
  };
}

function readPsField(pid: number, field: "comm" | "ppid"): string {
  try {
    return execFileSync("ps", ["-o", `${field}=`, "-p", String(pid)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function normalizeCommand(command: string): string {
  const baseName = path.basename(command.trim());
  return baseName.replace(/^-+/, "");
}
