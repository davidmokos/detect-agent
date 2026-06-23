import type { AgentDefinition } from "./types.js";

export const defaultAgents = [
  {
    id: "codex",
    name: "Codex",
    env: [
      { name: "CODEX_CI", value: "1" },
      { name: "CODEX_SHELL", value: "1" },
      { name: "CODEX_THREAD_ID" },
      { name: "CODEX_INTERNAL_ORIGINATOR_OVERRIDE", value: /codex/i }
    ],
    process: [{ pattern: /^codex$/i }],
    sessionEnv: ["CODEX_THREAD_ID"]
  },
  {
    id: "cursor",
    name: "Cursor",
    env: [
      { name: "CURSOR_AGENT", value: "1" },
      { name: "CURSOR_CONVERSATION_ID" },
      { name: "CURSOR_EXTENSION_HOST_ROLE", value: "agent-exec" }
    ],
    process: [{ pattern: /^cursor$/i }],
    sessionEnv: ["CURSOR_CONVERSATION_ID"]
  },
  {
    id: "claude-code",
    name: "Claude Code",
    env: [
      { name: "CLAUDECODE", value: "1" },
      { name: "CLAUDE_CODE_SESSION_ID" },
      { name: "CLAUDE_CODE_CHILD_SESSION", value: "1" },
      { name: "CLAUDE_CODE_EXECPATH" }
    ],
    process: [{ pattern: /^claude$/i }],
    sessionEnv: ["CLAUDE_CODE_SESSION_ID"]
  },
  {
    id: "opencode",
    name: "OpenCode",
    process: [{ pattern: /^opencode$/i }]
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    env: [
      { name: "GEMINI_CLI", value: "1" },
      { name: "GEMINI_CLI_NO_RELAUNCH", value: "true", confidence: "medium" }
    ],
    process: [{ pattern: /^gemini$/i }]
  },
  {
    id: "antigravity",
    name: "Antigravity",
    env: [
      { name: "ANTIGRAVITY_AGENT", value: "1" },
      { name: "ANTIGRAVITY_TRAJECTORY_ID" }
    ],
    process: [{ pattern: /^antigravity$/i }],
    sessionEnv: ["ANTIGRAVITY_TRAJECTORY_ID"]
  },
  {
    id: "pi",
    name: "Pi",
    env: [{ name: "PI_CODING_AGENT", value: "true" }]
  },
  {
    id: "cline",
    name: "Cline",
    env: [{ name: "CLINE_WRAPPER_PATH" }],
    process: [{ pattern: /^cline$/i }]
  },
  {
    id: "kilocode",
    name: "Kilo Code",
    env: [
      { name: "KILO", value: "1" },
      { name: "KILOCODE_VERSION" },
      { name: "KILO_RUN_ID" }
    ],
    process: [{ pattern: /^(kilo|kilocode)$/i }],
    sessionEnv: ["KILO_RUN_ID"]
  },
  {
    id: "copilot",
    name: "GitHub Copilot CLI",
    env: [
      { name: "COPILOT_CLI", value: "1" },
      { name: "COPILOT_AGENT_SESSION_ID" },
      { name: "COPILOT_RUN_APP", value: "1" }
    ],
    process: [{ pattern: /^(github-copilot-cli|copilot)$/i }],
    sessionEnv: ["COPILOT_AGENT_SESSION_ID"]
  },
  {
    id: "aider",
    name: "Aider",
    process: [{ pattern: /^aider$/i }]
  },
  {
    id: "amazon-q",
    name: "Amazon Q",
    process: [{ pattern: /^(amazon-q|q)$/i }]
  },
  {
    id: "codeium",
    name: "Codeium",
    process: [{ pattern: /^codeium$/i }]
  },
  {
    id: "continue",
    name: "Continue",
    process: [{ pattern: /^continue$/i }]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    process: [{ pattern: /^windsurf$/i }]
  }
] satisfies readonly AgentDefinition[];
