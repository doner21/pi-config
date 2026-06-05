---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260603-020000
paradigm: multi-hypothesis-preview
clarification_needed: false
recommended_next_step: HYPOTHESIZE
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# ATT_0_INTAKE — Context Exhaustion Safety Mechanisms

## Task Summary

Subagents that approach or exceed their context window (~60%+) become dangerous — they begin hallucinating, producing incoherent output, or truncating mid-response. The prior runs added artifact gating and task splitting, but neither addresses the root cause: **detecting when a subagent is approaching context exhaustion and acting before hallucination begins.**

Design systemic mechanisms to prevent, detect, and mitigate context exhaustion in subagents, with particular attention to the ~60% threshold where hallucination risk rises sharply.

## Task Type

Systemic safety architecture — designing detection and prevention mechanisms for subagent context exhaustion.

## User Intent

Run the multi-hypothesis paradigm (3 hypothesizers → 1 critique → 1 synthesizer, all GPT 5.5 codex) but **STOP BEFORE EXECUTION**. The user wants to preview the full hypothesis/critique/synthesis output before deciding whether to proceed with implementation.

## Goal Attractor

A synthesized plan with up to 5 concrete code changes that provide systemic protection against subagent context exhaustion — not prompt-level suggestions but code-level gates, monitors, or circuit breakers.

## Seed Ideas (from ORCHESTRATOR / User)

1. **Context budget tracking**: The orchestrator should track how much context each subagent consumes. If a subagent is approaching 60% of its window (or a configurable threshold), the orchestrator should either split remaining work, reduce scope, or preemptively fail the task with a "context_approaching_limit" reason.

2. **Hallucination detection**: After a subagent returns, scan output for hallucination signatures — references to files/functions that don't exist, fabricated tool call results, internally inconsistent statements. This is harder than truncation detection and may require heuristics.

3. **Preemptive scope reduction**: If the orchestrator knows a subagent has limited context, it should reduce the task description and reference material passed to the subagent. Strip non-essential intake/plan context, keep only the immediate task.

4. **Context-adaptive task sizing**: Instead of a fixed ~200 word cap, tasks should be sized relative to available context. If the subagent model has a small context window, cap at 100 words. If large, 300 words.

5. **Subagent context telemetry**: If Pi or the substrate exposes context usage stats (tokens consumed, tokens remaining), pass these to the orchestrator and use them as a real-time gate. Even coarse telemetry (e.g., "subagent used 85% of context") is valuable.

## Constraints

- TypeScript codebase at `C:\Users\doner\pi-orchestrator-extension`
- Must not modify `src/substrate.ts` (but may read it to understand what telemetry is available)
- Must not break existing tests
- Changes should be in `src/index.ts` and `src/shapes/plan-execute-verify.ts`
- This run STOPS after synthesis — no execution until user approves

## Invariants

1. `src/substrate.ts` untouched
2. Tests pass (when/if executed)
3. Each mechanism must be concrete code, not prompt text
4. No mechanism may assume perfect context telemetry — must degrade gracefully

## Success Criteria

1. Full hypothesis text for all 3 hypothesizers is captured and visible
2. Full critique text evaluating all 3 hypotheses is captured and visible
3. Synthesized plan with up to 5 concrete changes is captured and visible
4. User can review and approve before execution

## Routing Decision

**Multi-hypothesis preview paradigm (same models as prior run):**

| Phase | Agent | Model | Purpose |
|-------|-------|-------|---------|
| HYPOTHESIZE (3 in parallel) | Planner (GPT 5.5 codex) | openai-codex/gpt-5.5 | Generate 3 distinct context-exhaustion solutions |
| CRITIQUE | Planner (GPT 5.5 codex) | openai-codex/gpt-5.5 | Evaluate each hypothesis |
| SYNTHESIZE | Planner (GPT 5.5 codex) | openai-codex/gpt-5.5 | Merge surviving ideas into implementation plan |
| ⏸️ STOP HERE | — | — | User reviews before execution |

## Epistemic Map

- **Known**: Codebase structure, existing `SpawnGuard` with cap tracking, `SubagentResult` interface, `spawnChecked` function, progress log format
- **Inferred**: Pi subagent processes may expose some context telemetry via stderr or events; `SubagentResult.events` field exists but may not include context data
- **Assumed**: The substrate's `spawnSubagent()` doesn't expose real-time context usage
- **Unknown**: Whether Pi's JSON-mode subprocess protocol includes token/context reporting; what `SubagentResult.events` actually contains
