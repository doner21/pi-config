# MULTI-HYPOTHESIS RECOVERY ANALYSIS

**Run:** RUN_20260603-030000
**Date:** 2026-06-03
**Artifact Type:** RECOVERY_ANALYSIS
**Context:** When the Pi orchestrator detects an executor agent is failing due to context exhaustion (~60% saturation), what is the optimal recovery path?

---

## 0. CURRENT STATE AUDIT

### What Exists Today

The Pi orchestrator at C:/Users/doner/pi-orchestrator-extension/src/ already has:

| Component | File | What It Detects |
|-----------|------|----------------|
| detectExecutorOutputQualityFailures() | src/index.ts | Truncation, mid-sentence cutoff, unclosed JSON, text-only responses |
| collectArtifactEvidence() | src/index.ts, shapes/plan-execute-verify.ts | git status --short, file claims vs. disk ground truth |
| enforceTaskSizeCap() | Both files | Splits >200-word tasks into chained subtasks |
| SpawnGuard | src/substrate.ts | Monotonic spawn ceiling, prevents runaway |
| SubagentResult | src/substrate.ts | agentName, task, text, stderr, exitCode, durationMs, events |
| spawnSubagent() | src/substrate.ts | Role-agnostic subprocess spawner, no continuation concept |
| CONTINUATION_CONTRACT (Route D) | nenflow-v3/context-policy.js | For NenFlow role subagents only |

### Current Recovery Flow (The Crude Path)

Executor fails -> detectExecutorOutputQualityFailures() -> hardGateFailures -> auto-fail, skip verifier -> failureReasons -> replan from scratch -> ALL executor work discarded.

**Cost per failure:** 1 planner spawn + N executor spawns (wasted) + 1 verifier spawn (skipped).

### What Is Missing

1. No context saturation tracking at substrate level (SpawnGuard tracks spawns, not tokens)
2. No handoff contract format for executor-level continuation
3. No split-and-respawn DURING execution (only pre-execution in enforceTaskSizeCap)
4. No reviewer validation of mid-execution state snapshots
5. No progressive scope reduction during retry

---

## 1. APPROACH A — CONTEXT HANDOFF CONTINUATION

### 1.1 How It Works (Step-by-Step)

1. Executor agent is spawned with task.
2. Orchestrator monitors executor output for context exhaustion signals (truncation, stopReason=error, stderr warnings).
3. IF exhaustion detected at ~60%: orchestrator ABORTS the current executor spawn (SIGTERM) but first reads partial output.
4. Executor had been instructed to periodically write a CONTINUATION_CONTRACT at a known temp path. Orchestrator reads this contract.
5. IF no contract exists (agent too far gone): orchestrator derives a minimum contract from partial text + task description.
6. Orchestrator spawns a fresh executor with the contract, task description, and instruction to SKIP completed work.
7. Fresh executor reads contract, checks disk state, continues only remaining work.
8. Output is combined: partial output from agent 1 + full output from agent 2.

### 1.2 Functions to Create/Modify

| Function | File | What It Does |
|----------|------|--------------|
| buildExecutorContinuationPrompt() | src/executor-recovery/continuation.ts (NEW) | Constructs the prompt for a continuation executor |
| deriveMinimalContract() | Same | Derives minimum handoff contract when failing agent could not write one |
| injectContinuationGuardrail() | Same | Injected into executor system prompt for proactive snapshot writing |
| buildExecutorPrompt() [MODIFY] | src/shapes/plan-execute-verify.ts | Add the continuation guardrail instruction |
| runWorkGraph() caller [MODIFY] | src/shapes/plan-execute-verify.ts | Insert pre-spawn check + post-output recovery logic |
| SpawnGuard [MODIFY] | src/substrate.ts | Add abortSpawn() method for graceful abort without ceiling penalty |

Insertion point: Inside the runWorkGraph worker closure, wrap spawnChecked with spawnWithRecovery.

### 1.3 What It Needs from the Substrate

- spawnSubagent change required: No. But it currently throws on non-zero exitCode. Need variant that returns partial output on graceful abort.
- SubagentResult change required: Add truncated: boolean and contextExhaustionSignal: boolean fields.
- New substrate function: abortSpawn(agentName) on SpawnGuard — marks a spawn as recoverable abort.

### 1.4 What the Failing Agent Must Produce

Ideal contract (agent writes proactively): YAML frontmatter with artifact_type: EXECUTOR_CONTINUATION_CONTRACT, sections for Files Touched, Decisions Made, Work Completed, Work Remaining, Critical Context.

Minimum contract (derived by orchestrator): JSON with task_id, task_description, partial_output, files_mentioned, derivation_method.

### 1.5 What the Receiving Agent Needs

buildExecutorContinuationPrompt() constructs: CONTINUATION TASK preamble + ORIGINAL TASK + CONTINUATION CONTRACT + RULES (read contract first, verify against disk, complete only Work Remaining, do not redo completed work, produce normal executor output).

### 1.6 Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Agent too far gone to write contract | deriveMinimalContract() does regex scan of partial output for file mentions. Falls back to task description only. |
| Contract itself is hallucinated | Receiving agent validates contract against disk before proceeding. If files do not exist, agent reports discrepancy and starts from scratch. |
| Handoff contract path collision | Each executor task gets unique temp path: {tempDir}/continuation-{taskId}.md |
| Agent aborts before any output | Fall back to Approach B (Split-and-Respawn). |
| Second agent also exhausts | Chain another continuation. If depth > 3, escalate to full replan. |

### 1.7 Risk of Infinite Loops

LOW. Each continuation decrements a depth counter. After 3 continuation attempts for the same task, orchestrator falls back to Approach B (Split-and-Respawn) or Approach C (Replan-With-Learning). SpawnGuard still enforces hard ceiling.

---

## 2. APPROACH B — SPLIT-AND-RESPWAN

### 2.1 How It Works

1. Executor agent fails with context exhaustion signal.
2. Orchestrator takes the original task description.
3. Programmatic splitter: parse sentence/paragraph, split into N chunks <= 150 words, create dependency chain (chunk-N depends on chunk-(N-1)).
4. Spawn N fresh executors, one per chunk, each receiving only its chunk.
5. First chunk gets partial output of failed agent as context.
6. Each subsequent chunk gets output of previous chunk.
7. Combine all outputs into single executor result.

### 2.2 Functions to Create/Modify

| Function | File | Role |
|----------|------|------|
| splitTaskOnFailure() | src/executor-recovery/splitter.ts (NEW) | Takes failed task + partial output, returns subtask array |
| buildSubtaskExecutorPrompt() | Same | Builds minimal prompt for one chunk |
| chainExecutorOutputs() | Same | Merges N partial outputs into one result |
| runWorkGraph() caller [MODIFY] | src/shapes/plan-execute-verify.ts | Insert split-and-respawn after quality failure detection, before hard gate |
| OrchestrationState [MODIFY] | Same | Add recoverySubtaskMap for tracking split outputs |

### 2.3 Substrate Needs

No spawnSubagent change required. No SubagentResult change required. SpawnGuard must have enough remaining slots (check wouldFit before splitting). runBoundedPool already supports concurrent sub-task execution.

### 2.4 What the Failing Agent Must Produce

Very little. The splitter only needs: (1) original task description (from plan), (2) any partial output (from SubagentResult.text). The splitter does NOT depend on agent writing a handoff contract. Uses wordCount() + splitIntoStatements() already in enforceTaskSizeCap().

### 2.5 What the Receiving Agent Needs

Each chunk executor receives: SUB-TASK preamble + chunk description (~120 words) + CONTEXT FROM PREVIOUS PARTS + INSTRUCTIONS (complete only this sub-task, read context, do not redo, produce concise output).

### 2.6 Edge Cases

- Task already small (<150 words): Do not split; fall back to Approach D (Progressive Scope Reduction).
- Partial output empty: Split without predecessor context; first chunk starts from scratch.
- Split count > remaining spawn slots: Split into as many chunks as slots allow.
- Chained split overflows downstream context: Downstream chunks receive only preceding chunk OUTPUT (<=4K chars), not full prompt.

### 2.7 Risk of Infinite Loops

MEDIUM. If a split chunk also fails, recursive split is possible. Mitigations: (1) hard cap on split depth (2 levels max), (2) minimum chunk size of 40 words, (3) total spawn ceiling from SpawnGuard.

---

## 3. APPROACH C — REPLAN-WITH-LEARNING

### 3.1 How It Works

1. Executor fails with context exhaustion.
2. Instead of passing failureReasons as simple strings (current behavior), orchestrator collects structured recovery metadata: failedTaskId, failureType (context_exhaustion), contextConsumed, wordsInTaskDescription, wordsInOutput, completedSubObjectives, remainingSubObjectives, partialOutputSummary.
3. This metadata is fed into the planner prompt alongside failureReasons.
4. Planner receives explicit instruction: "The previous plan had tasks too large for one executor. Split task-3 into smaller subtasks. Here is what was completed vs remaining."
5. Planner produces new plan preserving completed work (completed sub-objectives appear as dependsOn: [] pre-completed tasks or notes).
6. Executor waves run the new plan, skipping already-completed tasks.

### 3.2 Functions to Create/Modify

| Function | File | Role |
|----------|------|------|
| buildRecoveryMetadata() | src/executor-recovery/metadata.ts (NEW) | Produces structured failure metadata from ExecutorOutput + task |
| extractCompletedObjectives() | Same | Uses splitIntoStatements() + pattern matching to identify what was completed |
| buildRecoveryAwarePlanningPrompt() | src/shapes/plan-execute-verify.ts | Variant of buildPlanningPrompt() with recovery metadata |
| runPlanExecuteVerify() [MODIFY] | Same | Replace simple failureReasons feeding with structured metadata feeding |

### 3.3 Substrate Needs

No substrate changes required. Entirely shape-level. Uses existing SpawnGuard, spawnSubagent, SubagentResult unchanged.

### 3.4 What the Failing Agent Must Produce

Nothing beyond what it already produces. Orchestrator uses SubagentResult.text (partial output) to derive recovery metadata. Even truncated output contains signals: file mentions, module names, function signatures.

### 3.5 What the Planner Needs

Planning prompt augmented with RECOVERY METADATA section: failed task details, completion estimate, instructions to split into smaller tasks, preserve completed work, keep new tasks under 150 words.

### 3.6 Edge Cases

- Partial output empty: extractCompletedObjectives() returns empty. Planner treats as 0% complete, splits from scratch.
- Recovery metadata wrong (overestimates completion): Verifier catches this on next attempt. Costs one extra attempt.
- Planner itself hits context exhaustion: Uses existing NenFlow v3 CONTINUATION_CONTRACT (Route D).
- Task cannot be split: Planner returns one task with note. Orchestrator falls back to Approach A or D.

### 3.7 Risk of Infinite Loops

LOW. Retry loop bounded by resolvedMaxAttempts (clamped by substrate). Each replan consumes one attempt.

---

## 4. APPROACH D — PROGRESSIVE SCOPE REDUCTION

### 4.1 How It Works

1. Executor fails with context exhaustion.
2. Retry 1 (MINIMAL): Spawn same executor with stripped prompt: ~2000 chars (task description + minimal rules only, no intake JSON, no full plan).
3. Retry 2 (ESSENTIAL_ONLY): If retry 1 fails, ultra-stripped: ~500 chars (task description only, no rules).
4. Retry 3: If retry 2 fails, split the task (Approach B).
5. All retries fail: hard-fail with accumulated failure data.

### 4.2 Functions to Create/Modify

| Function | File | Role |
|----------|------|------|
| buildProgressiveExecutorPrompt() | src/executor-recovery/scope-reducer.ts (NEW) | Returns one of 3 prompt levels based on retry tier |
| PROMPT_TIERS constants | Same | Define FULL, MINIMAL, ESSENTIAL_ONLY levels with includesIntakeJSON, includesFullPlan, includesRules flags |
| Executor spawn in runPlanExecuteVerify() [MODIFY] | src/shapes/plan-execute-verify.ts | Replace single buildExecutorPrompt() with tier-based retry loop |

PROMPT_TIERS: FULL (level 0, all context, ~8K chars), MINIMAL (level 1, task+rules, ~2K chars), ESSENTIAL_ONLY (level 2, task only, ~500 chars).

### 4.3 Substrate Needs

No spawnSubagent change required, but need to distinguish context exhaustion errors from other errors. Recommend adding SubagentResult.truncated boolean (set when output ends mid-sentence without agent_end) or a ContextExhaustionError class.

### 4.4 What the Failing Agent Must Produce

Nothing special. Orchestrator determines exhaustion from: (1) detectExecutorOutputQualityFailures() detecting truncation, (2) SubagentResult.exitCode 0 but output truncated, (3) Pi JSON mode stopReason: max_tokens.

### 4.5 What the Receiving Agent Needs

Tier 1 (MINIMAL): EXECUTOR TASK + RULES (complete only this task, produce file artifacts). ~400 chars vs ~8000 full.
Tier 2 (ESSENTIAL_ONLY): Just task description. ~200 chars.

### 4.6 Edge Cases

- Task depends on intake constraints: MINIMAL tier preserves constraints. ESSENTIAL_ONLY loses them, agent might violate constraints (verifier catches).
- Agent produces wrong output without full context: Verifier catches.
- All tiers fail: Fall through to Approach B (split) or hard-fail.
- Prompts between tiers inconsistent: Each tier preserves task description; verifier checks against original intake, not prompt tier.

### 4.7 Risk of Infinite Loops

MEDIUM. Each tier is one spawn. 3 tiers x N tasks = up to 3N extra spawns. SpawnGuard ceiling caps this. Tier loop terminates at exactly 3 levels.

---

## 5. APPROACH E — DUAL-AGENT HANDOFF (WRITER + REVIEWER)

### 5.1 How It Works

1. Executor agent approaches context exhaustion.
2. Agent writes a state snapshot to a known file path: files touched (paths, line ranges), decisions made (with rationale), remaining work, current mental model.
3. Orchestrator spawns a REVIEWER agent: task = "Validate this state snapshot against disk." Reviewer checks if files exist, if claimed modifications are present, if decisions are consistent. Reviewer produces VALIDATED_SNAPSHOT with corrections.
4. Orchestrator spawns a fresh WRITER agent: receives the VALIDATED_SNAPSHOT (not raw), continues only validated remaining work, corrects discrepancies reviewer found.
5. Both Reviewer and Writer produce normal executor outputs. Orchestrator merges: original partial + reviewer corrections + writer additions.

### 5.2 Functions to Create/Modify

| Function | File | Role |
|----------|------|------|
| buildReviewerPrompt() | src/executor-recovery/dual-agent.ts (NEW) | Builds reviewer validation prompt |
| buildWriterPrompt() | Same | Builds continuation writer prompt from validated snapshot |
| validateSnapshot() | Same | Programmatic snapshot validation (no subagent spawn) |
| mergeRecoveryOutputs() | Same | Merges original + review corrections + writer output |
| New agent profile: state-reviewer | DEFAULT_AGENTS [MODIFY] | Distinct from verifier; system prompt: "You validate an executor state snapshot against filesystem. Do NOT fix issues." |

### 5.3 Substrate Needs

No spawnSubagent change required. Uses existing spawnSubagent for both reviewer and writer. SubagentResult needs optional stateSnapshot field (path or inline object). SpawnGuard impact: +2 spawns per recovery (expensive).

### 5.4 What the Failing Agent Must Produce

JSON state snapshot with: task_id, snapshot_type, context_saturation, timestamp, files array (path, modified_lines, changes_summary, syntax_valid), decisions array (decision, rationale, alternatives_considered), remaining_work array, mental_model object.
If agent is too far gone to write JSON, orchestrator falls back to deriveStateSnapshot() which regex-scans partial output.

### 5.5 What the Reviewer Needs

REVIEWER TASK prompt + STATE SNAPSHOT + INSTRUCTIONS (check each claimed file exists, check claimed modifications present, check decisions consistent, check remaining work complete). Returns validated snapshot as JSON with validation_status, corrected fields, corrections list.

### 5.6 Edge Cases

- Reviewer is wrong: Writer cross-checks validated snapshot AND disk state before proceeding. Writer has final say.
- Reviewer and original agent disagree: This is the POINT of Approach E. Validated snapshot is source of truth.
- Reviewer is expensive (+2 spawns): Only justified when redoing work costs more than 2 extra spawns.
- None of claimed files exist: Reviewer reports validation_status: invalid. Orchestrator falls back to Approach B.
- Snapshot references unreadable files: Reviewer notes as unverifiable.

### 5.7 Risk of Infinite Loops

LOW. Recovery chain: Executor -> Reviewer -> Writer. If Writer also exhausts, chain again (Writer -> Reviewer2 -> Writer2). Max depth: 2 chains (6 spawns). Then fall back to Approach C (Replan-With-Learning).

---

## 6. CROSS-CUTTING CRITIQUE — ALL 5 APPROACHES EVALUATED

### 6.1 Evaluation Matrix

| Criterion | A: Handoff | B: Split | C: Replan-Learn | D: Scope Reduce | E: Dual-Agent |
|-----------|-----------|----------|-----------------|-----------------|---------------|
| Recovery Quality | GOOD - preserves all completed work | MEDIUM - preserves nothing explicitly | MEDIUM - planner controls quality | LOW - stripped prompts may produce incomplete output | BEST - validated snapshot prevents hallucination |
| Latency Cost | +1 spawn | +N spawns (N = words/150) | +1 planner + N executors | +1-3 spawns per tier | +2 spawns (reviewer + writer) |
| Hallucination Risk | MEDIUM - contract written by potentially hallucinating agent | LOWEST - no handoff contract, only task chunks | LOW - planner does not trust executor blind | LOWEST - no handoff, just task text | MEDIUM - reviewer can ALSO hallucinate |
| Substrate Independence | Needs SubagentResult.truncated field | Zero changes | Zero changes | Needs context exhaustion signal | Zero changes (uses existing spawn) |
| Implementation Complexity | ~250 LOC, 2 new files, 3 interface changes | ~150 LOC, 1 new file, reuses existing splitter | ~100 LOC, 1 new function, minor prompt change | ~80 LOC, 1 new file | ~350 LOC, 2 new files, new agent profile |
| Worst-Case Failure | Hallucinated contract -> writer builds on false premise | All chunks fail -> same as current | Planner overestimates completion -> gaps | Essential-only prompt violates constraints | Reviewer + writer both hallucinate -> 3x wasted |
| Synergy with Existing Gates | GOOD - contracts validatable by collectArtifactEvidence | BEST - works WITH enforceTaskSizeCap | BEST - uses existing failureReasons feed | WEAK - strips context gates need | WEAK - reviewer adds verification but does not use existing gates |

### 6.2 Detailed Critique Per Approach

**Approach A — Handoff Continuation:** Best for tasks where agent is still functional (60-75% saturation). Risky above 80%. Most natural extension of existing CONTINUATION_CONTRACT (Route D) mechanism. Weakness: depends on failing agent writing coherent contract. Receiving agent must validate against disk, costing context.

**Approach B — Split-and-Respawn:** Best as FALLBACK when handoff contracts unavailable (agent too far gone). Also best for inherently large tasks that should have been split in planning. Weakness: does NOT preserve completed work. Splitter does not know what was done vs remaining. Can produce incoherent results at split boundaries.

**Approach C — Replan-With-Learning:** Least invasive — already happens (failureReasons fed to planner), just richer metadata. Planner has global context to re-balance entire plan. Weakness: replans from scratch — ALL executor work discarded. Costs expensive planner spawn. Planner may misinterpret completion.

**Approach D — Progressive Scope Reduction:** Elegantly simple — just strip parts of prompt. Each tier self-contained. Works even when agent produces zero useful output. Weakness: ESSENTIAL_ONLY tier removes intake constraints (agent could do anything). Output from different tiers is inconsistent.

**Approach E — Dual-Agent Handoff:** Theoretically safest — reviewer catches hallucinations before propagation. Provides validated ground truth. Weakness: most expensive (+2 spawns, +latency). Reviewer can hallucinate too. Limited context for deep verification. Over-engineered for most cases; only justified for mission-critical tasks.

### 6.3 Cross-Cutting Finding: 60% Threshold Is Too Late

All 5 approaches assume detection occurs AT ~60%. But by the time detectExecutorOutputQualityFailures() notices truncation, the agent is already at 80-100%. Truncation is a LAGGING indicator. The real problem is PROACTIVE detection: pre-spawn budget estimation (if prompt > 40% of context window, split before spawning). Also: Pi JSON mode usage events with token counts could enable real-time telemetry, but orchestrator currently only parses message_end, not usage events.

**Recommendation:** Proactive budget estimation (pre-spawn) is a higher-impact change than any recovery mechanism. If we prevent exhaustion, we do not need recovery.

---

## 7. SYNTHESIS — 5 CONCRETE CODE CHANGES

Merging the strongest ideas from all 5 approaches, respecting substrate independence, implementation complexity, and synergy with existing gates.

### Change 1: Pre-Spawn Budget Estimator (Proactive)

**File:** src/executor-recovery/budget-estimator.ts (NEW)
**Function:** estimateExecutorContextBudget(task, intake) -> ContextBudget
**What it does:** Before spawning an executor, estimates prompt size and warns if task exceeds safe limits. Returns ContextBudget with promptChars, estimatedPromptTokens, maxAgentContextTokens, saturationPercent, risk (SAFE/AT_RISK/CRITICAL), and recommendation (PROCEED/SPLIT_BEFORE_SPAWN/REDUCE_SCOPE).
**Insertion point:** In runPlanExecuteVerify(), before spawnChecked call, after building executor prompt.
**Dependency order:** None. Pure computation. No substrate changes.
**Why:** Prevents exhaustion before it happens. If a task would consume 60%+ of agent context, split BEFORE first spawn. Better than any recovery mechanism.

### Change 2: Recovery Tier System (Approach D + A Hybrid)

**File:** src/executor-recovery/recovery-tiers.ts (NEW)
**Functions:** buildTieredExecutorPrompt(tier, intake, plan, task, contract?) -> string; executeWithRecoveryTiers(state, params, agents, task, plan, intake, ...) -> Promise<SubagentResult>
**What it does:** Implements 3-tier recovery escalation:
- TIER 0 (FULL): Normal execution with full prompt.
- On failure: TIER 1 (CONTINUE): Try Approach A — look for CONTINUATION_CONTRACT, spawn continuation agent.
- On TIER 1 failure: TIER 2 (SPLIT): Approach B — programmatically split task, spawn chunk executors, chain outputs.
- On TIER 2 failure: TIER 3 (REPLAN): Approach C — feed structured recovery metadata to planner.
**Insertion point:** Replace flat executor spawn in runPlanExecuteVerify() with executeWithRecoveryTiers().
**Dependency order:** Depends on Change 1 (budget estimator) and Change 3 (recovery contract types).
**Why:** No single approach is universally optimal. Tiered escalation tries cheapest recovery first.

### Change 3: Recovery Contract Types and Validation

**File:** src/executor-recovery/contract-types.ts (NEW)
**Types:** ExecutorContinuationContract (structured format executor writes before exhaustion), RecoveryMetadata (what orchestrator derives when executor cannot write contract).

**File:** src/substrate.ts (MODIFY)
**Changes:** Add to SubagentResult: truncated?: boolean, contextExhaustionSignal?: boolean. These are populated by orchestrator post-hoc based on output analysis, NOT by spawnSubagent itself. Backward-compatible (optional fields).

**File:** src/shapes/plan-execute-verify.ts (MODIFY)
**Function:** detectExecutorOutputQualityFailures() — enhance to set truncated and contextExhaustionSignal on the ExecutorOutput directly.
**Dependency order:** Change 2 depends on this.
**Why:** Current SubagentResult cannot distinguish "agent completed normally with bad output" from "agent was cut off mid-sentence." This distinction is essential for choosing the right recovery tier.

### Change 4: Proactive Snapshot Injection into Executor System Prompt

**File:** src/shapes/plan-execute-verify.ts (MODIFY)
**Function:** buildExecutorPrompt() — add guardrail instruction.
**What it does:** Adds to executor system prompt: CONTEXT HEALTH MONITORING block instructing agent to write state snapshot JSON to a temp file when it detects context exhaustion (output truncated, forgetting instructions, struggling to hold full task in mind). Snapshot format: completed array, remaining array, files_touched array, decisions array, notes string.
**Insertion point:** In buildExecutorPrompt(), after INTAKE CONTRACT block, before output format rules.
**Dependency order:** None. But Change 2 (recovery tiers) reads these snapshots.
**Why:** The biggest weakness of Approach A is agent being too far gone to write a contract. By injecting snapshot instruction INTO the system prompt (not just the task), it becomes part of core agent behavior, increasing chance of snapshot before total failure.

### Change 5: Recovery-Aware OrchestrationState

**File:** src/shapes/plan-execute-verify.ts (MODIFY)
**Interface:** OrchestrationState — add recoveryLog: RecoveryEntry[] (tracks all recovery attempts), recoveryDepth: Map<string, number> (taskId -> recovery chain depth), maxRecoveryDepth: number (configurable, default 2).
**RecoveryEntry type:** taskId, attempt, tier (CONTINUE/SPLIT/REPLAN/SCOPE_REDUCE), agentName, success, spawnCount, durationMs.
**What it does:** Tracks every recovery attempt so orchestrator can: (1) enforce maxRecoveryDepth to prevent infinite chains, (2) report recovery statistics to user, (3) decide escalation based on aggregate failure patterns.
**Insertion point:** At top of file in OrchestrationState interface. Updated by executeWithRecoveryTiers().
**Dependency order:** Change 2 writes to these fields.
**Why:** Without tracking, orchestrator cannot know if it is in a recovery loop. This is the infrastructure that guarantees no infinite loops.

---

## 8. SUMMARY: RECOMMENDED IMPLEMENTATION ORDER

Phase 1 (Foundation — 0 substrate changes):
  Change 1: Pre-Spawn Budget Estimator
  Change 3: Recovery Contract Types (+ SubagentResult fields, backward-compatible)
  Change 5: Recovery-Aware OrchestrationState

Phase 2 (Core Recovery — minimal substrate impact):
  Change 4: Proactive Snapshot Injection into Executor System Prompt
  Change 2: Recovery Tier System (TIER 0 -> TIER 1 -> TIER 2 -> TIER 3)

Phase 3 (Optional Enhancement):
  Approach E (Dual-Agent Handoff): Only if Phase 2 shows hallucination propagation is a real problem.
  This can be added as TIER 1.5 (reviewer validates contract before writer spawns).

### What This Changes About the Current Flow

BEFORE (current crude path): Executor fails -> detectQualityFailures -> hard gate -> replan from scratch -> waste all work.

AFTER (with Phase 1+2):
  Pre-spawn: estimateContextBudget() -> split over-large tasks BEFORE spawning.
  Executor runs with snapshot guardrail in system prompt.
  On failure: TIER 1 (read snapshot/contract -> spawn continuation agent, preserves work).
  TIER 2 (split task programmatically -> spawn chunk agents).
  TIER 3 (build recovery metadata -> feed to planner for learning-aware replan).
  On success: Normal verification flow (unchanged).

### Total Substrate Changes Required

| Change | Substrate Impact |
|--------|-----------------|
| Change 1 | None |
| Change 2 | None (uses existing spawnSubagent) |
| Change 3 | Add 2 optional fields to SubagentResult (backward-compatible) |
| Change 4 | None (prompt-only change) |
| Change 5 | None (shape-level tracking) |

Substrate changes are minimal and backward-compatible. The 2 new fields on SubagentResult are optional booleans — existing code that does not read them is unaffected.

### Synergy Verification: Each Change With Existing Gates

| Change | collectArtifactEvidence | enforceTaskSizeCap | detectExecutorOutputQualityFailures |
|--------|------------------------|-------------------|--------------------------------------|
| 1 (Budget Estimator) | N/A — runs before execution | Uses same wordCount() logic | Prevents exhaustion, reducing false positives |
| 2 (Recovery Tiers) | TIER 1 contract can be validated against git status | TIER 2 uses same split logic | TIER selectors use quality failure types |
| 3 (Contract Types) | Contracts track files_touched — verifiable against git | N/A | truncated field lets quality detector distinguish exhaustion from bad output |
| 4 (Snapshot Injection) | Snapshots written to disk — artifact evidence can find them | N/A | Snapshot existence is independent of output quality |
| 5 (Recovery State) | Recovery log includes file artifact status | Recovery depth prevents infinite split chains | Recovery failures tracked per-task |

---

## 9. RISK APPENDIX: WHAT COULD GO WRONG

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Recovery loop: agent fails -> recovery spawn -> recovery agent fails -> ... | Medium | High (runaway spawns) | recoveryDepth counter (Change 5) + SpawnGuard ceiling. After depth 3, escalation to replan stops the loop. |
| Hallucinated snapshot poisons writer | Medium | High (wrong code built) | Writer MUST validate snapshot against disk before proceeding. Verifier catches discrepancies. |
| Budget estimator is wrong (underestimates) | Low-Medium | Medium (exhaustion still happens) | Estimator uses conservative multiplier (prompt chars x 0.3, not 0.25). Falls back to recovery tiers on actual exhaustion. |
| Split boundaries break code coherence | Medium | Medium (chunks produce conflicting changes) | Each chunk runs on same working directory with same git state. Dependencies ensure ordering. Verifier catches conflicts. |
| Progressive scope reduction violates constraints | Medium | High (constraint violation) | TIER 2 (SPLIT) is tried before scope reduction. Only when splitting fails do we strip constraints. Verifier catches violations. |
| Recovery tier escalation consumes too many spawns | Medium | Medium (premature ceiling exhaustion) | SpawnGuard wouldFit() check before each tier. Auto-raise ceiling if within substrate limits. Report recovery spawns in final output for tuning. |
| Snapshot injection adds noise to executor output | Low | Low (minor clutter) | Snapshot is written to temp file, NOT included in executor text response. Orchestrator reads it separately. |
| Recovery metadata extraction from truncated output is inaccurate | Medium | Medium (planner acts on wrong info) | Planner is explicitly instructed: "this is best-effort metadata from a failing agent; verify against plan before trusting." |

---

*End of RECOVERY_ANALYSIS.md — Produced by Multi-Hypothesis Synthesis for RUN_20260603-030000*
