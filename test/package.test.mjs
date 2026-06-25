import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

test("packed package can be installed, imported, and run as a CLI", () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "agent-cli-detector-"));

  try {
    const packOutput = execNpm(
      ["pack", "--ignore-scripts", "--json", "--pack-destination", workspace],
      {
        cwd: projectRoot,
        encoding: "utf8"
      }
    );
    const [packResult] = JSON.parse(packOutput);
    const tarball = path.join(workspace, packResult.filename);
    const packageContents = packResult.files.map((file) => file.path).sort();

    assert.deepEqual(packageContents, [
      "LICENSE",
      "README.md",
      "dist/agents.d.ts",
      "dist/agents.d.ts.map",
      "dist/agents.js",
      "dist/agents.js.map",
      "dist/cli.d.ts",
      "dist/cli.d.ts.map",
      "dist/cli.js",
      "dist/cli.js.map",
      "dist/detector.d.ts",
      "dist/detector.d.ts.map",
      "dist/detector.js",
      "dist/detector.js.map",
      "dist/index.d.ts",
      "dist/index.d.ts.map",
      "dist/index.js",
      "dist/index.js.map",
      "dist/strategies/environment.d.ts",
      "dist/strategies/environment.d.ts.map",
      "dist/strategies/environment.js",
      "dist/strategies/environment.js.map",
      "dist/strategies/process-tree.d.ts",
      "dist/strategies/process-tree.d.ts.map",
      "dist/strategies/process-tree.js",
      "dist/strategies/process-tree.js.map",
      "dist/types.d.ts",
      "dist/types.d.ts.map",
      "dist/types.js",
      "dist/types.js.map",
      "package.json"
    ]);

    writeFileSync(path.join(workspace, "package.json"), '{"type":"module"}\n');
    execNpm(["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], {
      cwd: workspace,
      stdio: "pipe"
    });

    const importOutput = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        [
          "import { detectAgent, isRunningFromAgent } from 'agent-cli-detector';",
          "const result = detectAgent({ env: { CODEX_THREAD_ID: 'thread-123' } });",
          "console.log(JSON.stringify({ result, running: isRunningFromAgent({ env: { CODEX_CI: '1' } }) }));"
        ].join("")
      ],
      {
        cwd: workspace,
        encoding: "utf8"
      }
    );
    assert.deepEqual(JSON.parse(importOutput), {
      result: {
        detected: true,
        agent: {
          id: "codex",
          name: "Codex",
          sessionId: "thread-123"
        }
      },
      running: true
    });

    const installedPackage = JSON.parse(
      readFileSync(path.join(workspace, "node_modules/agent-cli-detector/package.json"), "utf8")
    );
    const binPath = path.join(workspace, "node_modules/agent-cli-detector", installedPackage.bin["detect-agent"]);
    const cliOutput = execFileSync(process.execPath, [binPath, "--json"], {
      cwd: workspace,
      env: {
        ...process.env,
        CODEX_CI: "1",
        CODEX_THREAD_ID: ""
      },
      encoding: "utf8"
    });

    assert.deepEqual(JSON.parse(cliOutput), {
      detected: true,
      agent: {
        id: "codex",
        name: "Codex"
      }
    });
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

function execNpm(args, options) {
  if (process.env.npm_execpath !== undefined) {
    return execFileSync(process.execPath, [process.env.npm_execpath, ...args], options);
  }

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  return execFileSync(npm, args, options);
}
