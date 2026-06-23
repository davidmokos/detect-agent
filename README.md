# agent-cli-detector

Detect whether a JavaScript CLI is running inside a coding agent.

The package is designed around small detection strategies and data-driven agent definitions. Today it supports environment-variable detection and parent-process detection; additional agents or strategies can be added without changing the core detector.

## Install

```sh
npm install agent-cli-detector
```

## Library usage

```ts
import { detectAgent, isRunningFromAgent } from "agent-cli-detector";

const result = detectAgent();

if (result.detected) {
  console.log(`running from ${result.agent.name}`);
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

## Supported agents

Environment-variable detection:

- Antigravity
- Cline
- Codex
- Cursor
- Gemini CLI
- GitHub Copilot CLI
- Kilo Code
- Claude Code
- Pi

Process-tree detection:

- Aider
- Amazon Q
- Codeium
- Codex
- Continue
- Cursor
- Gemini CLI
- GitHub Copilot CLI
- Kilo Code
- Claude Code
- OpenCode
- Windsurf

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
