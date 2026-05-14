---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260512-163845
context_saturation_estimate: "~18%"
---

# Research: Context-Health Handoff Threshold Infrastructure

## Finding

**PARTIALLY_IMPLEMENTED**: Pi/NenFlow has useful primitives (Pi context APIs, abort APIs, RPC stats, a subagent extension pattern, continuation templates, and prompt-only 65% self-estimation instructions), but **flexible user-configurable subagent handoff thresholds such as 65%, 45%, 35%, 20%, or 40% are NOT implemented/enforced in the active Pi NenFlow v3 path**.

## Scope Investigated

- Active Pi `/nenflow_v3` prompt/skill/runtime files.
- Pi subagent extension behavior and official subagent example.
- Pi extension/RPC context telemetry APIs.
- NenFlow continuation templates/validator/run artifacts.
- Claude Code NenFlow command/hooks split.
- Local static/runnable checks for thresholds and continuations.

## Key Evidence

### Active Pi runtime is prompt-template + skill, not an enforcing extension

- `C:/Users/doner/.pi/agent/prompts/nenflow_v3.md` loads `~/.pi/agent/skills/nenflow-v3/SKILL.md`.
- `C:/Users/doner/.pi/agent/extensions/nenflow-v3.ts` explicitly says the extension is intentionally a no-op and that NenFlow v3 runs as a visible prompt-template + skill workflow.
- `C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md` defines orchestration shape and subagents, but has no Route D continuation-detection loop and no threshold parsing/config propagation.

### Role skills contain only hard-coded prompt policy at ~65%

Static check found `65%` in all active role skills and no `40%`, `45%`, `35%`, or `20%` threshold handling in NenFlow role files:

- `C:/Users/doner/.pi/agent/skills/nenflow-pev-researcher/SKILL.md`: “At ~65% self-estimated saturation”.
- `C:/Users/doner/.pi/agent/skills/nenflow-pev-planner/SKILL.md`: “At ~65% self-estimated saturation”.
- `C:/Users/doner/.pi/agent/skills/nenflow-pev-executor/SKILL.md`: “At ~65% self-estimated saturation”.
- `C:/Users/doner/.pi/agent/skills/nenflow-pev-verifier/SKILL.md`: “At ~65% self-estimated saturation”.

No local active Pi file implements a run/prompt-configurable handoff percentage.

### Pi has telemetry/control primitives, but NenFlow does not use them

Pi docs/source show available primitives:

- `docs/extensions.md`: `ctx.getContextUsage()` returns current context usage; `ctx.abort()` exists; `ctx.signal` is available during active turn events.
- `docs/rpc.md`: RPC supports `get_session_stats` with `contextUsage.percent`, and `abort`.
- `dist/core/extensions/types.d.ts`: `abort(): void` and `getContextUsage(): ContextUsage | undefined` are on `ExtensionContext`.
- `dist/modes/rpc/rpc-types.d.ts`: includes command type `get_session_stats`.

But local static search found no `getContextUsage`, `ctx.abort`, or `get_session_stats` usage in the active NenFlow skill/extension/validator path.

### Subagent behavior: isolated process, no proactive context watchdog

Active local subagent tool:

- `C:/Users/doner/.pi/agent/extensions/subagent.ts` spawns `pi --mode json -p --no-session` for the child agent and parses only `message_end` events into a local `messages` array; it returns final assistant text to the parent.
- It can kill the child if the **parent** abort signal fires, but it does not collect child usage/context percent and does not threshold-abort/handoff.

Official example:

- `examples/extensions/subagent/README.md` advertises isolated context, streaming output, usage tracking, and abort support.
- `examples/extensions/subagent/index.ts` captures usage from child `message_end` (`usage.input`, `usage.output`, `usage.totalTokens`) and can stream `onUpdate` details, but it still has no proactive threshold stop/handoff loop.

Implication: the visible orchestrator LLM receives the subagent tool result after the tool returns; extension/UI code can stream details, but the active NenFlow orchestrator prompt has no live decision point while a child subagent is running.

### Continuation artifacts/templates exist, but validation is weak

- `C:/Users/doner/.pi/agent/nenflow-v3/templates/CONTINUATION.md` exists and includes required body sections.
- `C:/Users/doner/.pi/agent/nenflow-v3/validator.js` only requires frontmatter fields `artifact_type`, `role`, and `run_id`, plus optional role/type matching and verification verdict checks.
- Runnable check: a malformed continuation with no Work Completed/Remaining/Critical Context/Resume Instruction still passed:
  `PASS: nenflow-bad-continuation.X6VD.md validated as role=EXECUTOR artifact_type=CONTINUATION_CONTRACT`.

### No evidence the continuation path has been exercised locally

Runnable counts:

```text
find C:/Users/doner/.pi/agent/nenflow-v3/runs -maxdepth 3 -type f -iname '*CONTINUATION*' | wc -l  -> 0
find C:/Users/doner/nenflow_v3/runs -maxdepth 3 -type f -iname '*CONTINUATION*' | wc -l       -> 0
```

### Claude Code has related hooks/Route D, but they do not apply automatically to Pi

- `C:/Users/doner/.claude/commands/nenflow_v3.md` defines Route D and Route F, but it is a Claude Code command path, not the active Pi `/nenflow_v3` prompt-template path.
- That Claude Route D checks `ATT_{n}CONTINUATION{role}.md`, while Pi role skills write `ATT_{n}_CONTINUATION_ROLE.md` (filename mismatch).
- `C:/Users/doner/.claude/hooks/nenflow-statusline.js` writes `threshold_65_hit`/`threshold_70_hit` from Claude Code status-line context data.
- `C:/Users/doner/.claude/hooks/context_health.py` is a Claude PostToolUse hook fallback, also hard-coded to 65/70.
- These hooks are configured in `C:/Users/doner/.claude/settings.json`; Pi does not consume Claude Code hooks unless deliberately bridged.

## Constraints for Planning

- Do not assume prompt-only self-estimation enforces handoff; it failed for the user’s reported Gemma run.
- Active Pi NenFlow currently lacks an enforcing extension/wrapper and lacks configurable thresholds.
- Exact live child context percent is not available to the visible orchestrator LLM during an active subagent tool call; any exact live enforcement must be implemented inside the subagent tool/extension/RPC wrapper.
- Role-generated handoff remains necessary unless the parent forcibly aborts, because aborting alone loses semantic work state.
- Continuation validation must be strengthened; current validator accepts incomplete continuation bodies.

## Recommended Direction

Planner should treat this as a gap-hardening task, not as already solved:

1. Add run-level configurable threshold parsing/persistence and pass it to every role prompt.
2. Update active Pi `nenflow-v3` skill with explicit Route D detection/validation/resume.
3. Update role skills to obey configured threshold instead of hard-coded ~65%.
4. Add strict continuation validation for required sections/freshness/role/path.
5. Optionally harden with a Pi extension or subagent wrapper using child JSON/RPC stats plus `abort`/child kill to enforce thresholds deterministically.

## Unknowns Remaining

- Whether Pi JSON-mode assistant `usage.totalTokens` is always populated for every provider/model; official docs show RPC `contextUsage` is more direct.
- Whether an enforcement extension should replace the current `subagent.ts` or wrap it with a dedicated NenFlow-only role runner.
