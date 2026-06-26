# agent-cli-detector

Detect whether a JavaScript CLI is running inside a coding agent.

The package is designed around environment-variable detection and data-driven agent definitions. Parent-process inspection is available as an experimental opt-in feature for callers that can tolerate best-effort process-tree detection.

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
npx agent-cli-detector
npx agent-cli-detector --json
```

After installing the package, the CLI command is available as `agent-cli-detector`:

```sh
agent-cli-detector
agent-cli-detector --json
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
  }
}
```

`sessionId` is normalized from agent-specific environment variables when available, such as `CODEX_THREAD_ID`, `CURSOR_CONVERSATION_ID`, `CLAUDE_CODE_SESSION_ID`, `ANTIGRAVITY_TRAJECTORY_ID`, `KIRO_SESSION_ID`, `KILO_RUN_ID`, and `COPILOT_AGENT_SESSION_ID`.

## Supported agents

The built-in detector uses environment variables by default:

- `environment`: matches agent-specific environment variables in `process.env`

Process-tree inspection is experimental and turned off by default. Enable it explicitly if you need best-effort parent-process matching:

```ts
const result = detectAgent({ experimentalProcessTree: true });
```

Process-tree inspection has only been tested on macOS and does not work on Windows.

| Agent | Environment strategy | Process-tree strategy | Session ID |
| --- | --- | --- | --- |
| Antigravity | `ANTIGRAVITY_AGENT=1`, `ANTIGRAVITY_TRAJECTORY_ID` | `antigravity` | `ANTIGRAVITY_TRAJECTORY_ID` |
| Claude Code | `CLAUDECODE=1`, `CLAUDE_CODE_SESSION_ID` | `claude` | `CLAUDE_CODE_SESSION_ID` |
| Cline | `CLINE_WRAPPER_PATH` | `cline` | - |
| Codex | `CODEX_CI=1`, `CODEX_SHELL=1`, `CODEX_THREAD_ID` | `codex` | `CODEX_THREAD_ID` |
| Cursor | `CURSOR_AGENT=1`, `CURSOR_CONVERSATION_ID` | `cursor` | `CURSOR_CONVERSATION_ID` |
| Devin | - | command containing `devin` | - |
| Gemini CLI | `GEMINI_CLI=1` | `gemini` | - |
| GitHub Copilot CLI | `COPILOT_CLI=1`, `COPILOT_AGENT_SESSION_ID`, `COPILOT_RUN_APP=1` | `github-copilot-cli` or `copilot` | `COPILOT_AGENT_SESSION_ID` |
| Kiro | `KIRO_SESSION_ID` | command containing `kiro` | `KIRO_SESSION_ID` |
| Kilo Code | `KILO=1`, `KILOCODE_VERSION`, `KILO_RUN_ID` | `kilo` or `kilocode` | `KILO_RUN_ID` |
| OpenCode | - | `opencode` | - |
| Pi | `PI_CODING_AGENT=true` | - | - |

Some sandboxes block `ps`, and process names can vary by launcher, so process-tree detection should be treated as experimental.

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
