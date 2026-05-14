---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260512-163845
context_saturation_estimate: "~18%"
---

# Run Plan: Implementation Executor + Independent Test-Builder Executor

## Task Statement
Plan the orchestration run, not the product implementation. First run an implementation executor against `ATT_2_PLAN.md`; then run a separate executor acting as a test-builder to create and execute sandboxed reliability tests that prove the implementation works.

## Invariants
- Subagent order starts with implementation `pev-executor`, then independent test-builder `pev-executor`.
- The test-builder is not a verifier/code reviewer: it must create runnable test artifacts, execute them, and capture raw evidence.
- Test-builder may only modify sandbox/test/report artifacts, not repair implementation files.
- Do not stop because code looks correct; stop only with executed passing evidence or bounded evidence-rich failure/handoff.
- Carry forward `ATT_0_INTAKE.md`, `ATT_1_RESEARCH.md`, and `ATT_2_PLAN.md` invariants: configurable thresholds, strict continuation validation, Route D, durable artifacts, and non-regression.
- Planner re-entry must be driven by concrete test failure or insufficient proof.

## Success Criteria
1. Implementation executor produces required artifacts and either completes `ATT_2_PLAN.md` or explains a blocking failure.
2. Test-builder creates sandbox tests under the run directory and executes them from a single rerunnable command.
3. Evidence covers threshold parsing/propagation for `65/45/35/20/40`, validator accept/reject cases, Route D simulation, role-skill threshold propagation, and normal artifact smoke checks.
4. Raw stdout/stderr, exit codes, test files, and evidence mapping are durable in the run directory.
5. Failed, non-executing, or non-proving tests route to planner handoff instead of final success.
6. Retry is bounded to avoid infinite loops while preserving the user's demand for strong knowledge.

## Implementation Steps

### 1. Prerequisite gate
Before spawning agents, confirm these exist:
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/ATT_0_INTAKE.md`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/ATT_1_RESEARCH.md`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/ATT_2_PLAN.md`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/ATT_3_RUN_PLAN.md`
If missing, stop with `ATT_4_ORCHESTRATION_BLOCKER.md`.

### 2. Subagent A: implementation executor
Spawn `pev-executor` with `ATT_0`, `ATT_1`, `ATT_2`, and this run plan. Its job is to implement `ATT_2_PLAN.md` only, capture commands/output, and not treat its own checks as final proof.

Required outputs:
- `.../RUN_20260512-163845/ATT_4_EXECUTION.md`
- `.../RUN_20260512-163845/ATT_4_VERIFIER_BRIEF.md`
- aliases `LATEST_IMPLEMENTATION_EXECUTION.md`, `LATEST_IMPLEMENTATION_VERIFIER_BRIEF.md`
Continuation path: `.../RUN_20260512-163845/ATT_4_CONTINUATION_EXECUTOR.md`.

Gate after Subagent A:
- If continuation exists, validate it and continue same role before testing.
- If implementation is impossible/plan-ambiguous, write `ATT_5_PLANNER_HANDOFF.md` and replan to `ATT_6_PLAN.md`.
- If implementation completed, proceed to Subagent B.

### 3. Subagent B: test-builder executor
Spawn a fresh `pev-executor` with instruction: "You are the test-builder executor, not a verifier. Build sandbox tests and execute them to prove/disprove the implementation from Subagent A. Do not modify implementation files."

Required sandbox root:
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/`

Minimum sandbox artifacts:
- `README.md` with rerun instructions.
- `run-tests.js` or equivalent single entrypoint using local tooling.
- `fixtures/` for valid/invalid continuations, run configs, and simulated run dirs.
- `tests/` for parser/config, validator, Route D, role-skill propagation, stale/mismatch rejection, and normal-flow smoke.
- `results/` with raw stdout/stderr and exit-code files.

Required outputs:
- `.../RUN_20260512-163845/ATT_5_TEST_BUILDER_EXECUTION.md`
- `.../RUN_20260512-163845/ATT_5_TEST_EVIDENCE.md`
- `.../RUN_20260512-163845/ATT_5_VERIFIER_BRIEF.md`
- aliases `LATEST_TEST_BUILDER_EXECUTION.md`, `LATEST_TEST_EVIDENCE.md`, `LATEST_VERIFIER_BRIEF.md`
Continuation path: `.../RUN_20260512-163845/ATT_5_CONTINUATION_TEST_BUILDER_EXECUTOR.md`.

### 4. Required test coverage
The test-builder must execute tests proving:
1. Thresholds `65`, `45`, `35`, `20`, and `40` parse/propagate; invalid/unrelated values reject or default safely.
2. `RUN_CONFIG.json` read/write/default behavior works.
3. Continuation validator accepts a complete valid contract and rejects missing sections, placeholders, role/run mismatch, bad path/name, invalid percentages, and stale cases if implemented.
4. Active Pi orchestrator skill includes Route D plus `RUN_CONFIG.json` and `context_handoff_threshold_percent` propagation.
5. Role skills no longer rely on hard-coded `At ~65% self-estimated saturation` and contain configured-threshold/continuation-path instructions.
6. Route D simulation finds a valid continuation when normal artifact is missing and builds a same-role continuation prompt with minimal context and exact next paths.
7. Existing validator smoke still passes for representative PLAN, EXECUTION_REPORT, and VERIFICATION_REPORT artifacts.

### 5. Evidence sufficient to continue/stop
Sufficient evidence requires: one clean rerun command with exit code `0`; durable raw output in `sandbox-tests/attempt-1/results/`; `ATT_5_TEST_EVIDENCE.md` mapping each required coverage item to file/function/result; confirmation tests hit live implemented files while destructive cases use temp/sandbox dirs; no skipped required tests.

Insufficient evidence includes: code review only, file-existence-only tests, tests written but not executed, unstated dependencies/manual setup, copied Subagent A evidence, or failed tests called success.

### 6. Pass/fail routing
If Subagent B passes and evidence is sufficient, either stop with `ATT_5_TEST_EVIDENCE.md` as proof or optionally spawn normal `pev-verifier` for final audit:
- success-branch verification: `ATT_6_VERIFICATION.md`, alias `LATEST_VERIFICATION.md`.

If tests fail, do not execute, or do not prove the mechanism:
- write `ATT_6_PLANNER_HANDOFF.md` with failed commands, exit codes, missing proof, failure class, and affected files;
- spawn `pev-planner` to `ATT_7_PLAN.md` / `LATEST_PLAN.md`;
- retry as `ATT_8_EXECUTION.md`, `ATT_8_VERIFIER_BRIEF.md`, sandbox `attempt-2/`, `ATT_9_TEST_BUILDER_EXECUTION.md`, `ATT_9_TEST_EVIDENCE.md`, `ATT_9_VERIFIER_BRIEF.md`;
- if attempt 2 passes, final verification path is `ATT_10_VERIFICATION.md`;
- if attempt 2 fails, write `ATT_10_PLANNER_HANDOFF.md`, allow one final replan to `ATT_11_PLAN.md`, then `ATT_12_EXECUTION.md`, `ATT_13_TEST_BUILDER_EXECUTION.md`, `ATT_13_TEST_EVIDENCE.md`.

### 7. Infinite-loop control
Maximum: 3 implementation/test attempts total. Stop with success only after executed passing evidence. Stop with failure/human escalation after attempt 3 fails or cannot prove the mechanism. If the same failure class repeats twice without new information, create `ATT_FINAL_ESCALATION.md` and ask for human direction.

## Handoff Notes
- `ATT_2_PLAN.md` remains the implementation plan; this artifact controls sequencing and proof standards.
- Test-builder executor creates tests/evidence; it does not patch product code and does not replace optional final verifier.
- Strong evidence means behavioral sandbox execution, especially for thresholds, continuation validation, and Route D resume behavior.
- Capati memory tools were not available in this session; planning used the provided artifacts and NenFlow role skills.
