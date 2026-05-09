---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260509-011600
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~8%"
---

# INTAKE — Pi Config Harness Hardening Sprint

## Task Summary

Implement the four highest-priority improvements identified in the architectural review of `C:/Users/doner/.pi/agent/` (the pi-config harness, also tracked as GitHub repo `doner21/pi-config`). These improvements address real gaps between the harness's conceptual architecture and its runtime behavior: portability, memory safety, git checkpoint hygiene, and subagent observability.

## Task Type

Multi-file refactor and enhancement of Pi extension/agent/skill infrastructure. Touches:

- 1 TypeScript extension (`subagent.ts`)
- 1 TypeScript extension (`graphify.ts`)
- 1 TypeScript extension (`git-checkpoint.ts`)
- 1 TypeScript extension (`playwright-mcp.ts`)
- 6 skill markdown files (NenFlow v3 family)
- 2 prompt markdown files

## User Intent

The user wants the harness to be genuinely portable across Windows/macOS/Linux (not just claim portable in the README while hardcoding Windows paths), and wants safety/observability mechanisms that are enforced by code rather than trusted to LLM prompt compliance.

## Goal Attractor

A pi-config harness where:

1. A fresh clone onto Linux/macOS works without manual path editing
2. Graphify memory injection respects `safeToInject` and `verifiedStatus` metadata
3. Git checkpoints don't silently absorb unrelated human changes
4. Subagent results include structured metadata beyond just the final text response
5. The changes are minimal, surgical, and don't break existing functionality

## Constraints

- Must work within Pi's extension API (no pi-core changes assumed)
- Must preserve Windows support while adding macOS/Linux support
- Existing agent configs, skills, and extensions must continue functioning
- The NenFlow v3 workflow must still work after changes
- No breaking changes to the subagent API contract (parent agents still receive text)

## Invariants

1. `subagent` tool returns valid content that parent agents can consume
2. Graphify brain injection continues to work for projects with valid, safe graphs
3. Git checkpoint never blocks agent operations
4. Destructive command confirmation still fires
5. All existing `/memory`, `/subagents`, `/graphify`, `/nenflow_v3` commands still work

## Success Criteria

| ID  | Criterion | Method |
|---|---|---|
| SC1 | CLI path in `subagent.ts` resolves on Linux/macOS without the hardcoded `AppData/Roaming/npm` path | Read the file, verify platform-aware resolution |
| SC2 | Playwright MCP profiles path doesn't fall back to `C:/Users/doner/...` literal | Read `playwright-mcp.ts`, verify fallback uses `os.homedir()` |
| SC3 | All 6 NenFlow skill files use portable paths (e.g., `{PI_HOME}/...` or `~/.pi/...`) instead of `C:/Users/doner/...` | Grep for `C:/Users/doner` in skills/ directory — should be zero |
| SC4 | Both prompt files (`pev.md`, `nenflow_v3.md`) use portable paths | Grep for `C:/Users/doner` in prompts/ directory — should be zero |
| SC5 | `brainContextForCwd()` in `graphify.ts` checks `safeToInject` and `verifiedStatus` before injecting full report | Read `graphify.ts`, verify gating logic in the injection function |
| SC6 | A run with `safeToInject: false` does not get its GRAPH_REPORT content injected | Design review — the code path must clearly bail out |
| SC7 | Git checkpoint extension uses `git add -u` or saves a patch instead of `git add -A` | Read `git-checkpoint.ts`, verify no `git add -A` |
| SC8 | Subagent result includes structured metadata alongside the text | Read `subagent.ts`, verify content format includes run metadata |

## Ambiguities

1. For the skill files — should we use a placeholder token like `{PI_HOME}` and resolve at runtime, or just use `~/.pi/...` which is understood by Pi? Answer: use `~/.pi/agent/...` for skills (Pi resolves home directory) and environment-variable-aware resolution in TypeScript extensions.
2. For subagent result metadata — should we change the return shape of the `subagent` tool? Answer: Add a `metadata` field to the tool result alongside the existing `details`, keeping the content text unchanged for backward compatibility.
3. The NenFlow verifier skill references `C:/Users/doner/nenflow_v3/` while the orchestrator skill references `C:/Users/doner/.pi/agent/nenflow-v3/` — which is canonical? Answer: `C:/Users/doner/.pi/agent/nenflow-v3/` is canonical; the verifier skill has a stale path. Both must be fixed.

## Routing Decision

**PLAN** — The task is well-scoped with clear success criteria. No research needed; the codebase was already thoroughly reviewed in the preceding session.

## Clarification Questions

None. The review identified concrete, specific changes with exact file paths and old/new text mappings.
