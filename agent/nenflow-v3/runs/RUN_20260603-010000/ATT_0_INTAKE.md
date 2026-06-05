---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260603-010000
paradigm: multi-hypothesis
clarification_needed: false
recommended_next_step: HYPOTHESIZE
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# ATT_0_INTAKE — Multi-Hypothesis: Systemic Fix for Executor Truncation

## Task Summary

The prior run (RUN_20260603-000000) applied prompt-level fixes to the orchestrator's executor-truncation problem, but the ORCHESTRATOR's own post-run analysis identified they are **necessary but not sufficient** — they make the system *aware* of the problem but don't *prevent* it. The task now is to implement **systemic enforcement mechanisms** that actually stop executor truncation / text-only-report failures from propagating through the orchestration loop.

## Task Type

Systemic architecture improvement — implementing gating, splitting, and monitoring mechanisms in the orchestration engine.

## User Intent

Run a **multi-hypothesis paradigm**: spawn 3 independent hypothesizing agents (GPT 5.5 codex) that each propose a different solution to the executor-truncation problem, then have a critique agent evaluate all 3, then have a synthesizing planner merge the surviving ideas into a concrete implementation plan (up to 5 changes), then have an executor (DeepSeek V4 Pro) implement the plan, then verify.

## Goal Attractor

An orchestration system where executor subagents **cannot** silently produce zero file artifacts — the orchestration loop itself detects, gates, splits, and retries to guarantee concrete output from implementation tasks.

## Seed Ideas (from ORCHESTRATOR)

These are starter concepts for the hypothesizers to expand upon, critique, and synthesize:

1. **Post-execution gate**: If `collectArtifactEvidence()` finds no file changes for a CREATE/IMPLEMENT task, the orchestrator auto-fails that task and triggers re-planning instead of forwarding a text-only report to the verifier. This turns a soft warning into a hard gate.

2. **Programmatic task splitting**: After the planner returns its plan, the orchestrator parses each task description, counts words, and splits any task over ~200 words into multiple sub-tasks programmatically before dispatching to executors. This prevents large tasks from reaching executors at all.

3. **Subagent output monitoring & auto-retry**: After each executor subagent returns, scan the output for truncation signals (incomplete JSON, mid-sentence cutoff at the end, missing expected sections). If truncation is detected, auto-retry with a tighter scope — split the original task description further and re-dispatch.

## Constraints

- TypeScript codebase at `C:\Users\doner\pi-orchestrator-extension`
- Must not break existing tests (`node tests/test-natural-language-controls.cjs`)
- Must not regress prior fixes (Issues #1-#7 from RUN_20260603-000000)
- Must not modify `src/substrate.ts`
- Changes should be in `src/index.ts` (active code path) and optionally `src/shapes/plan-execute-verify.ts`

## Invariants

1. `src/substrate.ts` untouched
2. Tests pass after all changes
3. Each mechanism must have a concrete implementation (not just prompt text)
4. The post-execution gate must be a hard gate (return/throw/reject), not a warning string

## Success Criteria

1. Post-execution gate: orchestrator loop auto-fails tasks with zero artifacts for implementation work
2. Programmatic task splitting: tasks over ~200 words are split before executor dispatch
3. Truncation detection: executor outputs are scanned for truncation signals; auto-retry with tighter scope
4. All changes compile and tests pass
5. Verifier confirms each mechanism has concrete code — not just prompt additions

## Routing Decision

**Custom multi-hypothesis paradigm:**

| Phase | Agent | Model | Purpose |
|-------|-------|-------|---------|
| HYPOTHESIZE-1 | pev-researcher | GPT 5.5 codex | Propose solution path A |
| HYPOTHESIZE-2 | pev-researcher | GPT 5.5 codex | Propose solution path B |
| HYPOTHESIZE-3 | pev-researcher | GPT 5.5 codex | Propose solution path C |
| CRITIQUE | pev-planner | GPT 5.5 codex | Evaluate all 3 hypotheses against constraints |
| SYNTHESIZE-PLAN | pev-planner | GPT 5.5 codex | Merge surviving ideas into implementation plan |
| EXECUTE | pev-executor | DeepSeek V4 Pro | Implement the plan |
| VERIFY | pev-verifier | DeepSeek V4 Flash | Verify all mechanisms work |

## Epistemic Map

- **Known**: Codebase structure, existing `collectArtifactEvidence()`, current orchestration loop in `runOrchestration()` / `runPlanExecuteVerify()`
- **Inferred**: The orchestration loop has hook points where gating/splitting/monitoring can be inserted
- **Assumed**: The subagent result object has enough metadata to detect truncation
- **Unknown**: Whether `SubagentResult` has a `truncated` flag or we need to infer from output shape

## Affordance Landscape

- `runOrchestration()` in `src/index.ts` — main loop where post-execution gate would sit
- `runPlanExecuteVerify()` in `src/shapes/plan-execute-verify.ts` — shape-based loop
- `collectArtifactEvidence()` — already exists, currently returns warning string
- `spawnSubagent()` in `src/substrate.ts` — returns `SubagentResult` with `text`, `stderr`, `exitCode`
- `PlanTask` interface — has `description` field we can word-count for splitting

## Falsifiers

- If no changes beyond prompt text are produced → FAIL
- If any mechanism relies solely on LLM judgment without code enforcement → FAIL
- If `src/substrate.ts` is modified → FAIL
