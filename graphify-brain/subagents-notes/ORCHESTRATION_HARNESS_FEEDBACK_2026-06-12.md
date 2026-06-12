# Orchestration Harness Feedback — Ramen Don Newsletter Build (2026-06-11/12)

Source session: full PEV build (7 orchestrate runs, ~10 direct subagent dispatches,
4 providers exercised). Every issue below was observed directly, not hypothesized.

---

## 1. Post-execution hard gates false-positive on EVERY implementation phase (CRITICAL)

**Observed:** All 7 `orchestrate` runs returned `FAIL` via hard gates —
`"text-only response for implementation task"`, `"possible truncation"`,
`"suspiciously short output"` — while the executors had in fact written/edited every
file correctly (verified on disk each time). One run's internal planner even wrote:
*"Existing files from prior attempts are correct (tsc passes, build succeeds, all 8
gates pass) but MUST be re-created by executors to satisfy the verifier."*

**Root cause (inferred):** the hard gate classifies the executor's *reply text shape*,
not its *effects*. Executors that do real work via tools and answer with a summary
table get flagged "text-only". Long structured replies trip the truncation heuristic.

**Consequence:** the deterministic verdict became meaningless; the controlling agent
had to adopt a standing procedure of adjudicating every gate manually on disk
(git diff / tsc / tests / build). The harness's strongest feature — a trustable
PASS/FAIL — was the first casualty.

**Recommendations:**
- Gate on **evidence of mutation**: compare worktree state (or tool-call log:
  edit/write/bash counts) before/after each task instead of reply-text heuristics.
- Demote text-shape heuristics to **warnings**; let the verifier subagent's verdict be
  the gate.
- Expose per-task tool-call counts in the final report so "text-only" is derivable
  from facts.
- Provide a `hardGates: false` (or threshold config) escape hatch.

## 2. Retry semantics amplify the false positives (HIGH)

**Observed:** `maxRetries: 2` → every phase ran 3 full attempts, 9–27 subagents
spawned per phase, with each retry re-planning and re-executing ALL tasks — including
ones whose outputs were already correct on disk. Retries were driven by the
false-positive gate, so the harness repeatedly paid to redo finished work.

**Recommendations:**
- Retry only the failed checks/tasks, not the whole plan.
- Idempotency awareness: before re-executing, detect that expected artifacts already
  exist and route to verification instead of regeneration.

## 3. `subagent` tool silently returns empty under openai-codex OAuth (HIGH)

**Observed:** any agent JSON pinned to `openai-codex/gpt-5.5` produced an empty
result via the `subagent` tool — only MCP registration noise, no text, no error —
even on a trivial smoke test. The same provider works fine inside `orchestrate`
subprocesses. anthropic and deepseek pins work in both paths.

**Recommendations:**
- Unify the provider/auth stack between the `subagent` path and `orchestrate`
  subprocesses (the OAuth refresh path appears to be orchestrate-only).
- **Never return an empty result**: if the assistant produced no output, surface
  stopReason/errorMessage exactly as orchestrate does ("No API key for provider: …").
  The silent variant cost three dispatches to diagnose.

## 4. No model/provider routing parameters on the `subagent` tool (HIGH)

**Observed:** orchestrate accepts `executorModel/Provider` etc.; `subagent` accepts
nothing. The only workaround is editing global agent JSONs (`~/.pi/agent/agents/*`)
— a mutation that persists across sessions (this session left `reviewer.json` pinned
to a model for hours; cleaned up afterwards).

**Recommendation:** add optional `model`/`provider` (and `thinkingLevel`) params to
the `subagent` tool, mirroring orchestrate's overrides.

## 5. Provider failure handling: aborts, raw dumps, no pre-flight (MEDIUM)

**Observed:**
- One run died with bare `"Orchestration aborted."` — no partial report, no reason.
- Codex 429 (usage limit) surfaced as a raw multi-KB JSON header dump mid-spawn,
  wasting the already-started planner.
- Expired OAuth produced "No API key for provider" only after spawning.

**Recommendations:**
- Pre-flight provider health check (1-token ping) for every routed role before
  spawning the tree; fail fast with a clean, machine-readable reason incl. resets_at.
- Always emit the partial report on abort.
- Optional `fallbackModel`/`fallbackProvider` per role for graceful degradation
  (the human had to perform this re-routing manually three times).

## 6. Intake-contract normalization invents constraints and misclassifies intent (MEDIUM)

**Observed:**
- `userIntent` was classified as *"Validate orchestration behavior with a low-cost
  mock/smoke task"* on three REAL implementation phases.
- The normalizer synthesized an `executorOutputContract` ("must follow the explicit
  output format in the original task") and failure criteria ("more than one executor
  output line violates strict output requirements") for tasks that specified no
  output format — then graded against them, feeding issue #1.

**Recommendations:** the normalized contract should not synthesize success/failure
criteria beyond the literal task; tag every derived criterion with provenance; let
the caller see/veto the contract before execution (dry-run flag).

## 7. Checkpoint auto-commits obscure verification diffs (LOW)

**Observed:** `checkpoint: pre-op auto-commit [pi]` commits interleave with executor
work, so `git diff HEAD` is unreliable for gate evidence; verifiers had to hunt for
the right `HEAD~N`/hash. **Recommendation:** include phase/task identifiers in
checkpoint messages, or expose pre/post-phase commit hashes in the orchestrate report.

## 8. Missing verification-only paradigm (LOW)

**Observed need:** vote-leg / re-verification work requires only a verifier, but the
paradigms spawn full planner+executor trees. A `verify-only` paradigm (input: evidence
checklist; output: per-check verdicts) would have served gates G2/G4/G5/G7 cheaply and
would sidestep issue #1 entirely (verification replies are legitimately text-only).

## What worked well (keep)

- **Model-routing evidence log**: deterministic per-spawn provider/model attestation
  was flawless across all runs — exactly what multi-model orchestration needs.
- **Routing override params on orchestrate** behaved precisely as specified.
- **maxSubagents/concurrency budgeting** kept runaway spawning bounded.
- Internal planners consistently decomposed packets sensibly and carried constraints
  forward verbatim ("notes" field discipline was good).
- Despite verdict noise, the **actual verifier subagents' evidence quality was high**
  (file:line citations, independent command runs).

## Net assessment

The execution layer is strong; the **judgment layer is the weak link**. Every false
FAIL traced to output-shape heuristics rather than effect inspection, and every
routing incident traced to inconsistent provider handling between the two dispatch
paths. Fixing #1 (effect-based gating) and #3/#4 (subagent provider parity + routing
params) would have eliminated ~90% of the manual intervention this session required.
