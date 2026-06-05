# MULTI-HYPOTHESIS PREVENTION ANALYSIS
## Preventing Text-Only Executor Responses in NenFlow v3

**Artifact Type:** PREVENTION_ANALYSIS
**Run ID:** RUN_20260604-010000
**Date:** 2026-06-04
**Context Saturation Estimate:** ~12%

---

## 0. THE CORE PROBLEM (Restated)

The `plan-execute-verify` shape has robust **detection** of text-only executor responses:
- `collectArtifactEvidence()` runs `git status --short` post-execution and hard-gate FAILs when implementation tasks produce no disk changes
- `detectExecutorOutputQualityFailures()` scans outputs for truncation, contradictions, text-only patterns
- `buildExecutorPrompt()` warns: "text-only response is a FAILURE"

But detection is _reactive_. Every detection-triggered retry burns spawn budget (1 planner + N executors + 1 verifier per detection cycle).
The root cause is that executors _choose_ the text-only path because:

1. **Task descriptions contain escape clauses** like "or repair" / "or verify" / "if already done"
2. **Tasks lack concrete output demands** — executor sees "implement or repair X" and interprets "repair" as "check if X exists"
3. **Soft prompt warnings are overridable** — system prompt says "text-only = FAIL" but the TASK says "or repair" and the task wins
4. **No pre-dispatch enforcement** — nothing stops a text-only task from being dispatched

**Prevention is ~3-5x cheaper than detection+recovery.**

---

## 1. FIVE PREVENTION HYPOTHESES

### HYPOTHESIS A — Task Output Type Classification

**Core Idea:** Every executor task MUST declare an `outputType` field before dispatch. The orchestrator enforces contract before spawning. Implementation tasks with zero file writes are rejected **immediately, pre-verifier.**

#### 1. Exact Functions to Create/Modify

| Function | File | Action |
|----------|------|--------|
| `classifyTaskOutputType(task)` | `src/shapes/plan-execute-verify.ts` | **CREATE** |
| `validateOutputTypeContract(outputType, result, evidence)` | `src/shapes/plan-execute-verify.ts` | **CREATE** |
| `buildExecutorPrompt(...)` | `src/shapes/plan-execute-verify.ts` | **MODIFY** — inject outputType into prompt |
| `buildPlanningPrompt(...)` | `src/shapes/plan-execute-verify.ts` | **MODIFY** — require planner to set outputType |
| `PlanTask` interface | `src/shapes/plan-execute-verify.ts` | **MODIFY** — add `outputType?` field |
| `ArtifactEvidence` interface | `src/shapes/plan-execute-verify.ts` | **MODIFY** — add `outputTypeViolations` field |

#### 2. Insertion Point in Orchestration Loop

**Pre-dispatch:** inside `executeExecutorTaskWithRecovery()`, before Tier 0 (budget estimation) — classify task and inject outputType into prompt.
**Post-spawn:** inside `executeExecutorTaskWithRecovery()`, after SubagentResult is received — validate outputType contract, reject immediately on violation.

#### 3. Changes to Types/Interfaces

```typescript
type TaskOutputType = "file_change" | "validation" | "analysis";
```
`PlanTask` gets optional `outputType?: TaskOutputType` field.
`ArtifactEvidence` gets `outputTypeViolations: string[]` field.

#### 4. Composition with Existing Infrastructure

- **Budget estimator:** Composes cleanly — outputType is a task-level property, independent of context budget.
- **Hard gates:** Adds a pre-verifier rejection layer that fires _before_ the verifier is spawned. The existing `allHardFailures` gate would also check `outputTypeViolations`.
- **Tiered recovery:** `file_change` tasks rejected pre-verifier skip directly to Tier 4 (REPLAN).
- **Task splitting:** `enforceTaskSizeCap()` preserves `outputType` on split subtasks.

#### 5. Edge Cases

- **Task legitimately requires no file changes:** `outputType: "validation"` or `"analysis"` bypasses the file-change gate.
- **Git unavailable:** Falls back to checking SubagentResult events for tool-call evidence.
- **"Check if X exists":** Planner assigns `outputType: "validation"` — no false positive.
- **Hybrid tasks:** Planner splits into two tasks or uses most restrictive type (`file_change`).

#### 6. Risk Assessment

- **False positives:** LOW. outputType is planner-assigned, not heuristically guessed.
- **False negatives:** LOW-MEDIUM. A clever executor could claim file changes without making them. Caught by existing `collectArtifactEvidence()` git-ground-truth check.

### HYPOTHESIS B — Escape-Clause Scanner & Rewriter

**Core Idea:** Before dispatching any executor task, scan its description for escape-clause patterns. Tasks containing escape routes are **rewritten** to remove the escape before the executor sees them.

#### 1. Exact Functions to Create/Modify

| Function | File | Action |
|----------|------|--------|
| `scanEscapeClauses(description)` | `plan-execute-verify.ts` | **CREATE** |
| `rewriteEscapeClauses(description)` | `plan-execute-verify.ts` | **CREATE** |
| `buildExecutorPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — call rewriter before building prompt |
| `buildPlanningPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — add anti-escape-clause rule |
| `detectExecutorOutputQualityFailures(...)` | `plan-execute-verify.ts` | **MODIFY** — detect escape clause usage in output |

#### 2. Insertion Point

Inside `buildExecutorPrompt()` (~line 854): scan task description for escape clauses, rewrite if found.
Inside `buildPlanningPrompt()` (~line 843): add rule prohibiting escape clauses in task descriptions.

#### 3. Escape Clause Patterns

```typescript
const ESCAPE_CLAUSE_PATTERNS = [
  { regex: /ors+repair/i,                  type: "or_fallback" },
  { regex: /ors+verify/i,                  type: "or_fallback" },
  { regex: /ors+validate/i,                type: "validation_as_primary" },
  { regex: /ifs+(?:alreadys+)?(?:done|exists|present)/i, type: "conditional_skip" },
  { regex: /checks+ifs+(?:alreadys+)?(?:exists|done|present)/i, type: "conditional_skip" },
  { regex: /alreadys+(?:implemented|done|created|exists)/i, type: "conditional_skip" },
  { regex: /(?:just|simply|only)s+check/i, type: "validation_as_primary" },
  { regex: /ors+(?:confirm|ensure|make sure)/i, type: "or_fallback" },
  { regex: /nos+changes?s+(?:needed|required)/i, type: "conditional_skip" },
  { regex: /(?:implement|create|build|write|add|modify)s+ors+(?:confirm|check|verify)/i, type: "or_fallback" },
];
```

#### 4. Edge Cases

- **Legitimate "or" task:** Should be resolved during planning, not execution. The scanner flags it; the planner produces two distinct tasks.
- **"Verify the build passes":** `validation_as_primary` — scanner rewrites to demand evidence, closing the "just check if it exists" escape.
- **False positives on "or" in file paths:** Word boundary `` prevents matching `src/or/repair.ts`.

#### 5. Risk Assessment

- **False positives:** LOW-MEDIUM. Scanner might rewrite legitimate tasks. Mitigation: preserves original meaning, planner can split into two tasks.
- **False negatives:** MEDIUM. Novel escape phrasings evade the scanner. This is defense-in-depth, not a silver bullet.

### HYPOTHESIS C — Minimum Tool-Call Contract

**Core Idea:** Inject into executor system prompt: "Your response MUST include at least one write, edit, or bash tool call. Zero tool calls = rejection regardless of content." Track actual tool-call events from SubagentResult.

#### 1. Exact Functions to Create/Modify

| Function | File | Action |
|----------|------|--------|
| `buildMinimumToolCallContract(outputType)` | `plan-execute-verify.ts` | **CREATE** |
| `detectZeroToolCallResponse(result)` | `plan-execute-verify.ts` | **CREATE** |
| `buildExecutorPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — inject contract for file_change tasks |
| `SubagentResult` interface | `src/substrate.ts` | **MODIFY** — add `toolCallCount` field |
| `spawnSubagent(...)` | `src/substrate.ts` | **MODIFY** — count tool calls during JSONL parsing |
| `detectExecutorOutputQualityFailures(...)` | `plan-execute-verify.ts` | **MODIFY** — add zero-tool-call failure |

#### 2. Substrate Change Required

`spawnSubagent()` adds `let toolCallCount = 0` + increments on `tool_call_start` and `tool_execution_start` events.
`SubagentResult` gets optional `toolCallCount?: number` field.

#### 3. Risk Assessment

- **Prevention power:** LOW. Executor can run no-op tool calls (`bash "echo done"`) to satisfy count without creating files.
- **False positives:** LOW. Only applies to `file_change` tasks.
- **False negatives:** MEDIUM. No-op tool calls evade the count.
- **Key weakness:** Requires substrate change (+1 field on SubagentResult). Tool-call count is not a reliable signal of file creation.

### HYPOTHESIS D — Structured Output Contract as Prompt Suffix

**Core Idea:** Every executor prompt ends with a JSON block: `{"files_created": [...], "files_modified": [...], "commands_run": [...], "tests_passed": false}`. If task is file_change and both arrays are empty → hard reject (pre-verifier).

#### 1. Exact Functions to Create/Modify

| Function | File | Action |
|----------|------|--------|
| `buildStructuredOutputSuffix(outputType)` | `plan-execute-verify.ts` | **CREATE** |
| `parseExecutorOutputSuffix(text)` | `plan-execute-verify.ts` | **CREATE** |
| `validateOutputSuffixAgainstType(suffix, outputType)` | `plan-execute-verify.ts` | **CREATE** |
| `buildExecutorPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — append suffix block |
| `ExecutorOutput` interface | `plan-execute-verify.ts` | **MODIFY** — add `outputSuffix` field |
| `executeExecutorTaskWithRecovery(...)` | `plan-execute-verify.ts` | **MODIFY** — parse/validate suffix post-spawn |
| `buildVerificationPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — inject suffix data as evidence |

#### 2. Suffix Format

```
── REQUIRED OUTPUT SUFFIX ──
```json
OUTPUT_CONTRACT
{
  "files_created": ["path/to/file1.ts"],
  "files_modified": ["path/to/existing.ts"],
  "commands_run": ["npm test"],
  "tests_passed": true,
  "exit_code": 0
}
OUTPUT_CONTRACT
```
── END REQUIRED SUFFIX ──
```

#### 3. Risk Assessment

- **Prevention power:** STRONG. Forces executor to explicitly state what it produced. Cross-reference with git ground truth catches fabrication.
- **False positives:** LOW-MEDIUM. Executor might ignore suffix format → treated as violation. Fallback: `hasFileClaimsInProse()` regex check prevents false positive.
- **False negatives:** LOW. Combined with git ground truth, evasion requires both fabricated suffix AND zero git diff (impossible).

### HYPOTHESIS E — Pre-Execution Git Snapshot + Post-Execution Diff Requirement

**Core Idea:** Before each executor spawn, capture `git status --short`. The executor prompt states: "The orchestrator will compare git state before and after your work. If no files changed, your response will be rejected." External forcing function the executor cannot reason around.

#### 1. Exact Functions to Create/Modify

| Function | File | Action |
|----------|------|--------|
| `capturePreExecutionGitSnapshot(cwd)` | `plan-execute-verify.ts` | **CREATE** |
| `computePostExecutionDiff(before, after)` | `plan-execute-verify.ts` | **CREATE** |
| `buildGitDiffForcingBlock(snapshot)` | `plan-execute-verify.ts` | **CREATE** |
| `buildExecutorPrompt(...)` | `plan-execute-verify.ts` | **MODIFY** — inject git forcing block |
| `executeExecutorTaskWithRecovery(...)` | `plan-execute-verify.ts` | **MODIFY** — snapshot before, diff after |
| `collectArtifactEvidence(...)` | `plan-execute-verify.ts` | **MODIFY** — accept pre-exec snapshot for diff |

#### 2. New Types

```typescript
interface GitSnapshot { success: boolean; timestamp: string; files: Array<{status:string;path:string}>; rawStatus: string; }
interface GitDiff { filesChanged: number; newFiles: string[]; modifiedFiles: string[]; deletedFiles: string[]; }
```

#### 3. Edge Cases

- **Git unavailable:** Snapshot returns `{success:false}`. Forcing block NOT injected into prompt. Falls back to existing behavior.
- **Pre-existing dirty state:** Captured in snapshot. Diff shows what the EXECUTOR changed vs what was already dirty.
- **Background processes (auto-formatters):** Time window is ~20-60 seconds per spawn. Noise is minimal. Only files appearing POST-spawn AND NOT in pre-spawn count as changes.
- **Performance:** `git status --short` takes <100ms on most repos.

#### 4. Risk Assessment

- **False positives:** VERY LOW. If git says no files changed and task was file_change, executor produced nothing. This is ground truth.
- **False negatives:** VERY LOW. Mechanical check cannot be reasoned around — no amount of prose defeats `git status --short`.

---

## 2. CRITIQUE OF ALL FIVE HYPOTHESES

### Summary Table

| Criterion | A (OutputType) | B (EscapeScan) | C (ToolCall) | D (Suffix) | E (GitDiff) |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Prevention vs detection | TRUE | TRUE | HYBRID | TRUE | TRUE |
| Escape-proof | PARTIAL | WEAK | WEAK | PARTIAL | STRONGEST |
| Backward compatibility | GOOD | GOOD | GOOD | MINOR RISK | GOOD |
| Substrate independence | YES | YES | NO | YES | YES |
| Implementation complexity | LOW | LOW-MED | LOW-MED | MEDIUM | LOW-MED |
| Synergy with existing gates | STRONG | MODERATE | MODERATE | VERY STRONG | STRONGEST |

### HYPOTHESIS A — Output Type Classification

Verdict: STRONG. Prevention by design — type set before dispatch, gates are type-specific. Weakness: planner could misclassify tasks. Mitigation: planner prompt rules + isImplementationTask() regex safety net.

### HYPOTHESIS B — Escape-Clause Scanner

Verdict: AUXILIARY. Useful defense-in-depth but a cat-and-mouse game. LLMs creatively paraphrase — novel escape clauses evade the scanner. Best as planner-level rule rather than hard enforcement gate.

### HYPOTHESIS C — Minimum Tool-Call Contract

Verdict: WEAKEST. Requires substrate change. Executor satisfies with no-op tool calls. Does not guarantee file creation — only git ground truth does. DROPPED from synthesis.

### HYPOTHESIS D — Structured Output Suffix

Verdict: STRONG. Machine-parseable self-report. Cross-reference with git diff = lie-detection. Weakness: executor can ignore format. Mitigation: fallback to prose-based file claim extraction.

### HYPOTHESIS E — Git Snapshot + Diff

Verdict: STRONGEST. Mechanical, un-evadable ground truth. Executor cannot reason around git diff. Forms the backbone making all other hypotheses reliable.

### RANKING BY EFFECTIVENESS

| Rank | Hypothesis | Prevention | Escape-Proof | Complexity | Substrate? |
|------|-----------|:----------:|:------------:|:----------:|:----------:|
| 1 | E — Git Snapshot + Diff | 5/5 | 5/5 | LOW-MED | No |
| 2 | A — Output Type Classification | 4/5 | 4/5 | LOW | No |
| 3 | D — Structured Output Suffix | 4/5 | 3/5 | MEDIUM | No |
| 4 | B — Escape-Clause Scanner | 3/5 | 2/5 | LOW-MED | No |
| 5 | C — Minimum Tool-Call Contract | 2/5 | 1/5 | LOW-MED | Yes |

---

## 3. SYNTHESIS - 5 CONCRETE CODE CHANGES

The strongest ideas merge into a defense-in-depth pipeline:

1. Git diff is the backbone (E) - mechanical, un-evadable ground truth
2. Output type provides task-level semantics (A) - gates apply type-appropriate enforcement
3. Structured suffix provides machine-parseable executor self-report (D) - cross-reference with git
4. Escape-clause scanner cleans task descriptions (B) - prevents planner from seeding escape routes
5. Minimum tool-call contract is redundant (C) - git diff + suffix combo already covers it; dropped


### CHANGE 1: Git Snapshot + Diff Enforcement

**File:** src/shapes/plan-execute-verify.ts
**New functions:** capturePreExecutionGitSnapshot(), computePostExecutionDiff(), buildGitDiffForcingBlock()
**Modified:** executeExecutorTaskWithRecovery(), collectArtifactEvidence(), buildExecutorPrompt()
**New types:** GitSnapshot, GitDiff
**Dependency:** FOUNDATIONAL, no dependencies. Must be implemented FIRST.
**Estimated LOC:** ~115 total (80 new + 35 modified)

### CHANGE 2: TaskOutputType Classification

**File:** src/shapes/plan-execute-verify.ts
**New functions:** classifyTaskOutputType(), inferOutputTypeFromDescription(), validateOutputTypeContract()
**New type:** TaskOutputType = file_change | validation | analysis
**PlanTask** gets optional `outputType` field.
**Dependency:** AFTER Change 1. Uses GitDiff type.
**Estimated LOC:** ~90 total (60 new + 30 modified)

### CHANGE 3: Structured Output Suffix Contract

**File:** src/shapes/plan-execute-verify.ts
**New functions:** buildStructuredOutputSuffix(), parseExecutorOutputSuffix(), validateOutputSuffixAgainstType(), hasFileClaimsInProse()
**New type:** ExecutorOutputSuffix {files_created, files_modified, commands_run, tests_passed, exit_code}
**Dependency:** AFTER Changes 1 and 2. Uses GitDiff and TaskOutputType for cross-reference.
**Estimated LOC:** ~140 total (100 new + 40 modified)

### CHANGE 4: Escape-Clause Scanner

**File:** src/shapes/plan-execute-verify.ts
**New functions:** scanEscapeClauses(), rewriteEscapeClauses()
**New types:** EscapeClause, ESCAPE_CLAUSE_PATTERNS constant
**Dependency:** AFTER Changes 1-3. Independent of other changes.
**Estimated LOC:** ~95 total (80 new + 15 modified)

### CHANGE 5: Unified collectArtifactEvidence()

**File:** src/shapes/plan-execute-verify.ts
**Modified:** collectArtifactEvidence(cwd, executorOutputs, options?) to accept preExecSnapshot + outputTypes
**Dependency:** LAST. Pulls together Changes 1-4 into unified evidence collection.
**Estimated LOC:** ~50 modified


---

## 4. IMPLEMENTATION ORDER (Dependency Graph)



**Total estimated LOC:** ~115 + 90 + 140 + 95 + 50 = **~490 LOC** (new + modified)

**Files touched:** Only src/shapes/plan-execute-verify.ts (no substrate changes, no new files)

**Backward compatibility:** All new fields are optional. Old tasks without outputType fall back to regex-based isImplementationTask() detection. Git-unavailable environments skip git-dependent gates gracefully.

---

## 5. EXPECTED IMPACT

| Before (current state) | After (with all 5 changes) |
|------------------------|-----------------------------|
| Executor sees implement-or-repair, reads file, reports already done | Planner never generates or-repair (C4). Executor prompt says outputType:file_change. Git forcing block warns of diff check |
| No pre-dispatch enforcement, text-only reaches verifier | Suffix contract (C3) + git diff (C1) + type classification (C2) all fire pre-verifier |
| Verifier trusts executor text, PASS with zero files | Verifier receives structured suffix + git diff as ground truth |
| Detection burns 1 planner + N executors + 1 verifier per retry (3-5 spawns) | Prevention rejects at executor return, saves verifier spawn (0-1 spawns) |
| Cost per text-only event: ~3-5 spawns | Cost per text-only event: ~0-1 spawns (rejection is inline) |

---

## 6. FILE PATH SUMMARY

**All changes target:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts

**No changes required to:**
- src/substrate.ts (substrate remains role-agnostic)
- src/types.ts (types are shape-level)
- src/index.ts (orchestration extension entry point unchanged)
- src/executor-recovery/* (recovery modules unchanged - prevention reduces the need for recovery)
