import assert from "node:assert/strict";
import test from "node:test";
import {
  detectAgent,
  EnvironmentDetectionStrategy,
  ProcessTreeDetectionStrategy
} from "../dist/index.js";

test("detects an agent from a strong environment variable", () => {
  const result = detectAgent({
    env: {
      CLAUDECODE: "1"
    },
    includeProcessTree: false
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "claude-code");
  assert.equal(result.confidence.level, "high");
  assert.equal(result.confidence.score, 0.95);
  assert.equal(result.matches[0].strategy, "environment");
  assert.equal(result.matches[0].score, 0.95);
});

test("normalizes session ids across agent-specific environment variables", () => {
  const result = detectAgent({
    env: {
      CURSOR_AGENT: "1",
      CURSOR_CONVERSATION_ID: "conversation-123"
    },
    includeProcessTree: false
  });

  assert.equal(result.detected, true);
  assert.deepEqual(result.agent, {
    id: "cursor",
    name: "Cursor",
    sessionId: "conversation-123"
  });
  assert.equal(result.confidence.level, "high");
  assert.equal(result.confidence.score, 0.988);
  assert.equal(result.confidence.signals, 2);
});

test("does not detect unrelated environment variables", () => {
  const result = detectAgent({
    env: {
      PATH: "/usr/bin"
    },
    includeProcessTree: false
  });

  assert.equal(result.detected, false);
  assert.equal(result.agent, undefined);
  assert.deepEqual(result.matches, []);
});

test("process tree detection can detect opencode without env vars", () => {
  const processes = new Map([
    [100, { pid: 100, ppid: 90, command: "node" }],
    [90, { pid: 90, ppid: 80, command: "/opt/homebrew/bin/opencode" }],
    [80, { pid: 80, ppid: 1, command: "zsh" }]
  ]);
  const strategy = new ProcessTreeDetectionStrategy({
    read(pid) {
      return processes.get(pid);
    }
  });

  const result = detectAgent({
    env: {},
    pid: 100,
    strategies: [strategy]
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "opencode");
  assert.equal(result.confidence.level, "medium");
  assert.equal(result.confidence.score, 0.65);
  assert.equal(result.matches[0].strategy, "process-tree");
});

test("custom agents can be added without custom detector code", () => {
  const result = detectAgent({
    agents: [
      {
        id: "example-agent",
        name: "Example Agent",
        env: [{ name: "EXAMPLE_AGENT", value: "yes" }]
      }
    ],
    env: {
      EXAMPLE_AGENT: "yes"
    },
    strategies: [new EnvironmentDetectionStrategy()]
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "example-agent");
  assert.equal(result.confidence.score, 0.95);
});
