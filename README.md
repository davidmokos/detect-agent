# agent-cli-detector

Detect whether a JavaScript CLI is running inside a coding agent.

The package is designed around small detection strategies and data-driven agent definitions. Today it supports environment-variable detection and parent-process detection; additional agents or strategies can be added without changing the core detector.

## Install

Install from npm:

```sh
npm install agent-cli-detector
```

## Library usage

```ts
import { detectAgent, isRunningFromAgent } from "agent-cli-detector";

const result = detectAgent();

if (result.detected) {
  console.log(`running from ${result.agent.name}`);
  console.log(`confidence: ${result.confidence.level} (${result.confidence.score})`);

  if (result.agent.sessionId) {
    console.log(`session: ${result.agent.sessionId}`);
  }
}

if (isRunningFromAgent()) {
  // Adjust CLI behavior for agent-driven execution.
}
```

## CLI usage

```sh
npx detect-agent
npx detect-agent --json
```

Exit codes:

- `0`: a coding agent was detected
- `1`: no coding agent was detected

## Result shape

`detectAgent()` returns a normalized agent identity instead of the internal detector definition:

```ts
{
  detected: true,
  agent: {
    id: "cursor",
    name: "Cursor",
    sessionId: "d9e9cd60-2e1c-487c-9bc7-fceee5e9c3a2"
  },
  confidence: {
    level: "high",
    score: 0.988,
    signals: 2
  }
}
```

`sessionId` is normalized from agent-specific environment variables when available, such as `CODEX_THREAD_ID`, `CURSOR_CONVERSATION_ID`, `CLAUDE_CODE_SESSION_ID`, `ANTIGRAVITY_TRAJECTORY_ID`, `KIRO_SESSION_ID`, `KILO_RUN_ID`, and `COPILOT_AGENT_SESSION_ID`.

Confidence is a heuristic score from `0` to `1`, not a statistical probability. Exact agent-owned environment markers score highest, presence-only environment markers score medium-high, and process-tree signals score medium by default. Multiple signals for the same agent are combined with `1 - product(1 - signalScore)`, so corroborating evidence raises confidence while keeping the score bounded at `1`.

## Supported agents

The built-in detector uses two strategies:

- `environment`: matches agent-specific environment variables in `process.env`
- `process-tree`: walks up the current process tree with `ps` and matches ancestor command names

| Agent | Environment strategy | Process-tree strategy | Session ID |
| --- | --- | --- | --- |
| Antigravity | `ANTIGRAVITY_AGENT=1`, `ANTIGRAVITY_TRAJECTORY_ID` | `antigravity` | `ANTIGRAVITY_TRAJECTORY_ID` |
| Claude Code | `CLAUDECODE=1`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_CODE_CHILD_SESSION=1`, `CLAUDE_CODE_EXECPATH` | `claude` | `CLAUDE_CODE_SESSION_ID` |
| Cline | `CLINE_WRAPPER_PATH` | `cline` | - |
| Codex | `CODEX_CI=1`, `CODEX_SHELL=1`, `CODEX_THREAD_ID`, `CODEX_INTERNAL_ORIGINATOR_OVERRIDE` containing `codex` | `codex` | `CODEX_THREAD_ID` |
| Cursor | `CURSOR_AGENT=1`, `CURSOR_CONVERSATION_ID`, `CURSOR_EXTENSION_HOST_ROLE=agent-exec` | `cursor` | `CURSOR_CONVERSATION_ID` |
| Devin | - | command containing `devin` | - |
| Gemini CLI | `GEMINI_CLI=1`, `GEMINI_CLI_NO_RELAUNCH=true` | `gemini` | - |
| GitHub Copilot CLI | `COPILOT_CLI=1`, `COPILOT_AGENT_SESSION_ID`, `COPILOT_RUN_APP=1` | `github-copilot-cli` or `copilot` | `COPILOT_AGENT_SESSION_ID` |
| Kiro | `KIRO_SESSION_ID` | command containing `kiro` | `KIRO_SESSION_ID` |
| Kilo Code | `KILO=1`, `KILOCODE_VERSION`, `KILO_RUN_ID` | `kilo` or `kilocode` | `KILO_RUN_ID` |
| OpenCode | - | `opencode` | - |
| Pi | `PI_CODING_AGENT=true` | - | - |

Process-tree detection is best-effort. Some sandboxes block `ps`, so environment-variable matches are preferred when available.

## Extending

Add an agent by supplying an `AgentDefinition`:

```ts
import { detectAgent, defaultAgents } from "agent-cli-detector";

const result = detectAgent({
  agents: [
    ...defaultAgents,
    {
      id: "my-agent",
      name: "My Agent",
      env: [{ name: "MY_AGENT", value: "1" }],
      process: [{ pattern: /^my-agent$/i }]
    }
  ]
});
```

Add a detection strategy by implementing `DetectionStrategy`:

```ts
import type { DetectionStrategy } from "agent-cli-detector";

const strategy: DetectionStrategy = {
  name: "my-strategy",
  detect(context) {
    return [];
  }
};
```

## License

MIT
