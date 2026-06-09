# Pi Orchestrator Extension

A local Pi package that adds deterministic multi-agent orchestration through an `orchestrate` tool and `/orchestrate` command.

## API note

Pi v0.75.0 does **not** expose a built-in core subagent API. This extension uses the extension-style subagent mechanism available in this install: it spawns isolated `pi` subprocesses in JSON print mode:

```bash
pi --mode json -p --no-session --no-extensions ...
```

The orchestrator captures JSONL `message_end` events and uses the final assistant text from each subprocess. It also listens to child JSONL progress events (`message_start`, `message_end`, `agent_end`, tool-call starts, and tool execution events) so `/orchestrate` and the `orchestrate` tool can prove visible activity while work is happening. It treats assistant `stopReason: "error"`, `stopReason: "aborted"`, or `errorMessage` as subprocess failures even when the process exits 0. It does not call LLM provider APIs directly.

Subprocesses are launched with `--no-extensions` so recursive orchestration is hard-disabled and child agents cannot see the parent `orchestrate` tool. Executor agents should rely on built-in Pi tools selected by their `tools` allowlist.

## Pi CLI resolution

By default, the extension prefers the currently running Pi CLI script when available, then known installed `cli.js` locations, then falls back to `pi` (`pi.cmd` on Windows). Optional overrides:

- `PI_CLI_PATH`: path to a Pi executable or script. `.js`/`.mjs`/`.cjs` paths are run with the current Node executable; Windows `.cmd`/`.bat` paths are spawned through a shell.
- `PI_CLI`: command name/path override used as the executable command. On Windows, `.cmd`/`.bat` values are spawned with `shell: true`.

## Install

```bash
pi install C:/Users/doner/pi-orchestrator-extension
```

If Pi is already running, reload resources after installing:

```text
/reload
```

## Command usage

```text
/orchestrate add tests for auth
/orchestrate --max-subagents 24 --max-retries 2 add tests for auth
/orchestrate --planner-model gpt-5.5 --planner-provider openai-codex --executor-model deepseek-v4-pro --executor-provider deepseek "plan with GPT 5.5, execute with DeepSeek V4"
/orchestrate --concurrency 3 --planner-agent planner --executor-agent coder --verifier-agent reviewer -- "task text that may start with dashes"
```

Supported command flags:

- `--max-subagents N` — explicit total subprocess ceiling for the run.
- `--max-retries N` — retry count after the first attempt; `2` means up to 3 attempts.
- `--concurrency N` — executor concurrency per dependency wave.
- `--planner-agent NAME`, `--executor-agent NAME`, `--verifier-agent NAME` — agent profile names.
- `--planner-model M`, `--planner-provider P` — per-run model override for the planner.
- `--executor-model M`, `--executor-provider P` — per-run model override for executor agents.
- `--verifier-model M`, `--verifier-provider P` — per-run model override for the verifier.
- `--cwd PATH` — child subprocess working directory.
- `--allow-local-model` / `--no-allow-local-model` — local model guard override.

If no task is provided, `/orchestrate` prompts for one. While running, it now surfaces visible progress in the Pi window: status/footer text, a live widget, durable `orchestrate-progress` messages, and child JSON-mode events such as subagent launches, assistant starts/finishes, and tool-call starts. When complete, it notifies a summary, sends a durable visible `orchestrate-result` message, places the final markdown report in the editor when UI is available, and includes a `Progress evidence` section in the report.

If `--max-subagents` is omitted, the extension auto-raises the ceiling after planning when the discovered plan size and retry budget require more than the default. Example: 6 executor tasks with `--max-retries 2` needs `3 * (1 planner + 6 executors + 1 verifier) = 24` subprocesses, so the default ceiling auto-raises from 12 to 24. If `--max-subagents` is provided explicitly, that number is honored and auto-raise is disabled.

## Per-run model routing and natural-language controls

The `orchestrate` tool accepts optional `plannerModel`/`plannerProvider`, `executorModel`/`executorProvider`, and `verifierModel`/`verifierProvider` parameters so the calling model can decide which provider/model to use for each role. On the command line, use `--planner-model`, `--planner-provider`, etc. When these are omitted, the subagent inherits its configured model from the agent profile in `~/.pi/agent/agents/` (if set), otherwise from the parent session model.

The intake also preserves pure natural-language orchestration controls inside the task text, including max agents/subagents, executor concurrency/parallelism, retry/attempt loop limits, researcher counts, distinct perspectives, and runtime-role model routing. Explicit natural-language model routing is treated as essential orchestrator configuration, not executor work.

Examples:

```text
User: "plan with GPT 5.5, execute with DeepSeek V4, verify with GPT 5.5"
→ LLM calls orchestrate({ task:"...", plannerModel:"gpt-5.5", plannerProvider:"openai-codex", executorModel:"deepseek-v4-pro", executorProvider:"deepseek", verifierModel:"gpt-5.5", verifierProvider:"openai-codex" })

User: "Use max five agents, concurrency two, loop at most one attempt. Run two researchers with two different perspectives: routing pipeline and orchestration-language controls. Use DeepSeek V4 Pro for the researchers. Use PT 5.5 for the planner."
→ intake.orchestration_controls.maxSubagents = 5
→ intake.orchestration_controls.concurrency = 2
→ intake.orchestration_controls.maxAttempts = 1
→ intake.orchestration_controls.researcherCount = 2
→ intake.routing_requirements includes researcher=deepseek/deepseek-v4-pro and planner=openai-codex/gpt-5.5 as essential natural-language requirements
```

## Tool usage example

Ask Pi to use the tool, or call it from the model with parameters like:

```json
{
  "task": "Add tests for auth",
  "plannerAgent": "planner",
  "executorAgent": "coder",
  "verifierAgent": "reviewer",
  "plannerModel": "gpt-5.5",
  "plannerProvider": "openai-codex",
  "executorModel": "deepseek-v4-pro",
  "executorProvider": "deepseek",
  "verifierModel": "deepseek-v4-pro",
  "verifierProvider": "deepseek",
  "concurrency": 2,
  "maxRetries": 2,
  "maxSubagents": 12,
  "cwd": "C:/Users/doner/my-project",
  "allowLocalModel": false
}
```

## Agent profiles

The extension loads optional agent definitions from:

```text
~/.pi/agent/agents
```

Supported formats:

- `.json` files with fields: `name`, `description`, `systemPrompt`, `provider`, `model`, `tools`, `skills`, `agencyLevel`
- `.md` files with frontmatter: `name`, `description`, `tools`, `model`, `provider`; the markdown body is used as the system prompt

If profiles are absent, conservative default `planner`, `coder`, and `reviewer` profiles are used.

## Determinism model

The parent extension owns all orchestration state: attempt counter, spawned count, plan, executor outputs, verifier result, failure reasons, and final result. Subagents are isolated Pi processes and do not share a mutable blackboard.
