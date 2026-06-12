# /orchestrate Judgment-Layer Hardening — Implemented 2026-06-12

Implements `C:\Users\doner\pi-orchestrator-extension\specs\INTAKE_ORCHESTRATE_HARDENING.md`,
oriented by `ORCHESTRATION_HARNESS_FEEDBACK_2026-06-12.md` (findings F1, F2, F5, F6, F7, F8).
F3/F4 (subagent tool provider parity) intentionally out of scope — companion intake still needed.

## What changed (develop repo `C:\Users\doner\pi-orchestrator-extension`, synced to deploy copy `C:\Users\doner\.pi\pi-orchestrator-extension`)

### New files
- `src/judgment.ts` — shared judgment layer: `ToolCallSummary` (mutating tool-call
  telemetry), `GateFinding` (text-shape vs effect), `resolveGateDecision()` (hard-gate
  mode semantics + per-task effect-evidence immunity), `buildZeroEffectFindings()`,
  `detectFalsePassContradiction()` (2026-06-03 false-PASS guard), `parseProviderError()`
  (structured rate_limit/auth/not_found/network errors with resets_at),
  `extractReferencedTaskIds()` (F2 retry targeting).
- `src/shapes/verify-only.ts` — F8 paradigm: checklist in → verifier(s) only →
  per-check verdicts with citations; multi-verifier majority vote; verifiers get
  read/bash/grep tools; exempt from implementation heuristics.
- `tests/test-judgment-hardening.cjs` — 7 regression fixtures modeled on real
  transcripts (see below).

### Key behavior changes
- **F1**: text-shape heuristics (truncation regexes, "text-only response",
  "suspiciously short output", escape clauses, file-claim regexes) are NEVER
  verdict-determining in default mode. New `hardGates: strict|advisory|off`
  param/flag (default **advisory** — pending human-gate confirmation, recommended
  by the spec). Tasks with ≥1 mutating tool call or ≥1 worktree file change are
  immune from text-shape findings in ALL modes. Effect evidence = per-spawn
  tool_execution counting in both `substrate.spawnSubagent` and the inline
  `runSubagent`, + per-task `git status` pre/post snapshots.
- **False-PASS guard**: verifier PASS + implementation tasks + zero mutating tool
  calls + zero worktree delta → forced FAIL with "Post-verification effect
  contradiction (false-PASS guard)" evidence.
- **F2**: `taskLedger` persists per-task verdicts across attempts; verifier-reason
  task-id extraction marks failed tasks; passed tasks with artifacts still on disk
  are REUSED (output re-fed to verifier, "re-verification not regeneration");
  planner prompt lists completed tasks with do-not-recreate instruction.
- **F5**: pre-flight 1-token health ping per routed provider/model before any
  spawn (default on; `--no-preflight`); per-role `*FallbackModel/*FallbackProvider`
  params; ALL aborts now return a partial report (`details.aborted`,
  `details.providerError` structured) instead of throwing bare errors.
- **F6**: `inferIntent` no longer reclassifies real tasks containing "mock"/"smoke";
  executor output contract carries `source: explicit|inferred`; inferred contracts
  go to `intake.inferredAdvisoryCriteria` (warn-only, never fail);
  `intake.criteriaProvenance` tags every derived criterion; verifier prompt has an
  ADVISORY CRITERIA RULE.
- **F7**: per-attempt pre/post `git rev-parse HEAD` in report section
  "## Commit evidence (run orc-…)" with ready-made `git diff a..b` hints; run id
  in report header.
- **Invariant kept**: `Subagent X: using provider/model.` attestation lines and the
  deterministic routing check are byte-unchanged; preflight pings never emit
  attestation-shaped lines and don't count against maxSubagents.

### Tests (all green, both copies)
1a Ramen Don false-FAIL fixture (real writes + summary-table reply → PASS);
1b false-PASS fixture (claims, no writes, verifier pass → FAIL w/ contradiction);
2 verify-only (zero planner/executor spawns, cited per-check verdicts);
3 retry targeting (3-task plan, task-2 fails once → attempt 2 runs only task-2; 4 executor spawns total);
4 pre-flight badprov → structured rate_limit error w/ resets_at, partial report, zero work spawns;
5 normalizer provenance (no synthesized failure criteria; inferred contract is advisory);
6 strict mode fails fast pre-verifier.
One existing assertion amended: preflight pings excluded from the
"all prompts carry intake" check (they are 1-token probes by design).

## Open items
- Human gates from the spec: confirm `hardGates` default (advisory) and review the
  new report sections (Gate warnings / Commit evidence / Effect evidence lines)
  with downstream consumers.
- ~~F3/F4 companion intake (subagent tool: silent-empty under openai-codex OAuth,
  missing model/provider params)~~ — **DONE 2026-06-12** (see `F3_F4_SUBAGENT_PROVIDER_PARITY_2026-06-12.md`).
- The dev repo has no git; graphify graph (2026-06-02) predates the shapes split —
  consider `/graphify` refresh.
- Note: pre-flight default-on adds ~1 subprocess ping per routed provider/model per run.
