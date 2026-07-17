import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultStrategies,
  detectAgent,
  EnvironmentDetectionStrategy,
  ProcessTreeDetectionStrategy
} from "../dist/index.js";

test("detects an agent from a strong environment variable", () => {
  const result = detectAgent({
    env: {
      CLAUDECODE: "1"
    }
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "claude-code");
});

test("normalizes session ids across agent-specific environment variables", () => {
  const result = detectAgent({
    env: {
      CURSOR_AGENT: "1",
      CURSOR_CONVERSATION_ID: "conversation-123"
    }
  });

  assert.equal(result.detected, true);
  assert.deepEqual(result.agent, {
    id: "cursor",
    name: "Cursor",
    sessionId: "conversation-123"
  });
});

test("detects kiro and normalizes its session id", () => {
  const result = detectAgent({
    env: {
      KIRO_SESSION_ID: "a537a99b-b87d-450b-ace9-74231e3f4fe8"
    }
  });

  assert.equal(result.detected, true);
  assert.deepEqual(result.agent, {
    id: "kiro",
    name: "Kiro",
    sessionId: "a537a99b-b87d-450b-ace9-74231e3f4fe8"
  });
});

test("detects replit and normalizes its session id", () => {
  const result = detectAgent({
    env: {
      REPLIT_SESSION: "session-123"
    }
  });

  assert.equal(result.detected, true);
  assert.deepEqual(result.agent, {
    id: "replit",
    name: "Replit",
    sessionId: "session-123"
  });
});

test("default strategies only use environment variables", () => {
  assert.deepEqual(
    createDefaultStrategies().map((strategy) => strategy.name),
    ["environment"]
  );
});

test("process tree strategy is experimental and opt-in", () => {
  assert.deepEqual(
    createDefaultStrategies(true).map((strategy) => strategy.name),
    ["environment", "process-tree"]
  );
});

test("process tree detection can detect kiro in the hierarchy", () => {
  const processes = new Map([
    [62926, { pid: 62926, ppid: 53313, command: "sh" }],
    [53313, { pid: 53313, ppid: 53303, command: "kiro-cli-chat" }],
    [53303, { pid: 53303, ppid: 52756, command: "bun" }],
    [52756, { pid: 52756, ppid: 51504, command: "kiro-cli-chat" }],
    [51504, { pid: 51504, ppid: 47657, command: "kiro-cli" }],
    [47657, { pid: 47657, ppid: 1, command: "zsh" }]
  ]);
  const strategy = new ProcessTreeDetectionStrategy({
    read(pid) {
      return processes.get(pid);
    }
  });

  const result = detectAgent({
    env: {},
    pid: 62926,
    strategies: [strategy]
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "kiro");
});

test("does not detect unrelated environment variables", () => {
  const result = detectAgent({
    env: {
      PATH: "/usr/bin"
    }
  });

  assert.equal(result.detected, false);
  assert.equal(result.agent, undefined);
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
});

test("process tree detection can detect devin in the hierarchy", () => {
  const processes = new Map([
    [200, { pid: 200, ppid: 190, command: "node" }],
    [190, { pid: 190, ppid: 180, command: "/usr/local/bin/devin" }],
    [180, { pid: 180, ppid: 1, command: "zsh" }]
  ]);
  const strategy = new ProcessTreeDetectionStrategy({
    read(pid) {
      return processes.get(pid);
    }
  });

  const result = detectAgent({
    env: {},
    pid: 200,
    strategies: [strategy]
  });

  assert.equal(result.detected, true);
  assert.equal(result.agent.id, "devin");
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
});
