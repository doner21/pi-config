---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260604-010000
paradigm: multi-hypothesis-preview
clarification_needed: false
recommended_next_step: HYPOTHESIZE
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
---

# ATT_0_INTAKE — Preventing Text-Only Executor Responses

## Task Summary

After 4 runs building detection infrastructure (budget tracking, hard gates, tiered recovery, prompt minification, task splitting), the system can now DETECT text-only executor responses reliably. But it cannot PREVENT them. The executor still defaults to "read file → see it exists → report 'already done'" when tasks use "implement or repair" language or when the task lacks a concrete output demand.

The detection/recovery pipeline is: catch failure → hard gate → tiered recovery → replan. But every recovery attempt costs spawns and time. Prevention is cheaper.

## The Core Problem

Executors choose the path of least resistance. When a task says "implement or repair budget-estimator.ts" and the file already exists, the executor reads it, validates it, and reports "already correctly implemented." Zero write/edit/bash calls. The task's language provides an escape clause.

The system prompt already warns: "text-only response = FAILURE." But the TASK description overrides this by saying "or repair" — giving explicit permission to validate instead of create.

## Task Type

Systemic prevention design — mechanisms that make text-only executor responses impossible, not just detectable.

## Seed Ideas

1. **Task contract enforcement**: Require every executor task to declare a concrete output type — FILE_CHANGE (must produce at least one edit/write), VALIDATION (may be text-only), ANALYSIS (may be text-only). The orchestrator enforces this: FILE_CHANGE tasks that produce zero file artifacts are rejected before reaching the verifier. Not detected — PREVENTED at dispatch.

2. **Anti-escape-clause task validation**: Before dispatching any executor task, scan the task description for escape language ("or repair", "or verify", "if already done", "check if", "validate existing"). Flag these tasks for pre-split or rewrite them to remove the escape clause. WARN if any task contains "or" followed by a non-action word.

3. **Minimum tool-call requirement**: Inject into every executor prompt a concrete tool-use requirement: "Before responding, you MUST make at least one write, edit, or bash call. Your response will be rejected if you have not used tools." Track actual tool calls in SubagentResult and reject responses with zero tool calls.

4. **Output contract as prompt suffix**: Every executor prompt ends with a JSON output contract: `{"files_created": [], "files_modified": [], "tests_run": false, "exit_code": null}`. The executor MUST populate this. The orchestrator validates: if task type is FILE_CHANGE and both arrays are empty → hard fail before verifier.

5. **Pre-execution file state snapshot + post-execution diff requirement**: Take a git diff snapshot before each executor spawn. The executor's system prompt states: "After your work, the orchestrator will compare git state to verify changes. If no files changed, your response will be rejected regardless of content." This creates a forcing function without requiring the executor to report its own tool usage.

## Constraints

- TypeScript codebase at C:\Users\doner\pi-orchestrator-extension
- Must compose with existing budget estimator, hard gates, tiered recovery
- Must not modify src/substrate.ts beyond existing fields
- Changes in src/index.ts, src/shapes/plan-execute-verify.ts, src/executor-recovery/

## Routing Decision

Same multi-hypothesis paradigm: 3 hypothesizers → 1 critique → 1 synthesizer. Write analysis to file. Stop before execution for user review.

## Model Routing

| Phase | Agent | Model |
|-------|-------|-------|
| HYPOTHESIZE-1 | pev-researcher | GPT 5.5 codex |
| HYPOTHESIZE-2 | pev-researcher | GPT 5.5 codex |
| HYPOTHESIZE-3 | pev-researcher | GPT 5.5 codex |
| CRITIQUE | pev-planner | GPT 5.5 codex |
| SYNTHESIZER | pev-planner | GPT 5.5 codex |
