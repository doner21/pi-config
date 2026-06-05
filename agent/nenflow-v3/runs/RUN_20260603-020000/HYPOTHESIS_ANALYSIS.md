---
artifact_type: HYPOTHESIS_ANALYSIS
role: PLANNER (acting as 3 hypothesizers + 1 critique + 1 synthesizer)
run_id: RUN_20260603-020000
context_saturation_estimate: "~40%"
created: 2026-06-03T02:00:00Z
---

# Multi-Hypothesis Analysis: Orchestrator Resilience Improvements

## Codebase Under Analysis
- **Entry point**: `C:/Users/doner/pi-orchestrator-extension/src/index.ts` (2187 lines, extension root)
- **Shape**: `C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts` (1828 lines, canonical PEV loop)
- **Substrate**: `C:/Users/doner/pi-orchestrator-extension/src/substrate.ts` (~717 lines, role-agnostic plumbing)
- **Types**: `C:/Users/doner/pi-orchestrator-extension/src/types.ts`

**Important note on code duplication**: The shape file (`plan-execute-verify.ts`) and the extension root (`index.ts`) contain parallel implementations of many functions (`collectArtifactEvidence`, `detectExecutorOutputQualityFailures`, `enforceTaskSizeCap`, `buildPlanningPrompt`, etc.). The shape version is the canonical one used by `runPlanExecuteVerify()` via `SpawnGuard` and `spawnSubagent()` from substrate. The index.ts version is older/legacy used directly by `runOrchestration()`. Changes must therefore be applied to both locations or preferably only to the shape if the legacy path is being deprecated. For clarity, all insertion points below reference the shape file as canonical.


---
## HYPOTHESIS 1: Proactive Context Budget Tracking

### Concept

Track how much context each subagent is likely consuming using heuristics (prompt character length to estimated tokens, events count from SubagentResult.events, durationMs). When estimated usage crosses a configurable threshold (default 60%), preemptively fail with context_exhaustion_risk reason, feed into the retry loop with split/smaller scope, and do NOT forward output to the verifier.

### Rationale

The orchestrator currently has zero visibility into subagent context consumption. A subagent can silently exhaust its context window and produce truncated/incomplete output (partially caught post-hoc by detectExecutorOutputQualityFailures). By preemptively detecting context pressure, the orchestrator can avoid wasting a verification cycle on known-bad output, trigger automatic task splitting, and prevent cascading failures.

### Detailed Design

**New Type: ContextBudgetEstimate**
```
interface ContextBudgetEstimate {
  promptChars: number;
  estimatedPromptTokens: number;
  modelContextLimit: number;
  usagePercent: number;
  exhausted: boolean;
}
```

**New Field on SubagentResult** (substrate.ts ~line 163):
Add contextBudget?: ContextBudgetEstimate to SubagentResult.

**New Function: estimateContextBudget()** — insert near detectExecutorOutputQualityFailures (~line 1560):
```
function estimateContextBudget(
  task: string, systemPrompt: string,
  modelId?: string, thresholdPercent?: number
): ContextBudgetEstimate {
  const totalChars = task.length + systemPrompt.length;
  const estimatedPromptTokens = Math.ceil(totalChars / 3.5);
  const modelContextLimit = resolveModelContextLimit(modelId);
  const threshold = thresholdPercent ?? 60;
  const usagePercent = Math.round((estimatedPromptTokens / modelContextLimit) * 100);
  return {
    promptChars: task.length, estimatedPromptTokens,
    modelContextLimit, usagePercent,
    exhausted: usagePercent >= threshold,
  };
}
```

**New Helper: resolveModelContextLimit()** — hardcoded lookup: gemma4-200k=200k, claude-3.5=200k, gpt-5.5=200k, deepseek-v4=128k, default=200k.

**Insertion Points:**
- estimateContextBudget(): plan-execute-verify.ts, near line 1560
- resolveModelContextLimit(): same location
- ExecutorOutput enrichment: add contextBudget to interface at ~line 73
- spawnChecked(): after spawnSubagent() returns, call estimateContextBudget() with task + systemPrompt
- runPlanExecuteVerify(): at ~line 360, add context exhaustion check to allHardFailures
- Requires exporting buildSubagentSystemPrompt from substrate.ts (or inline copy)

**Configurability**: Threshold via NormalizedParams.contextBudgetThresholdPercent (default 60%). Substrate-safe: no substrate.ts behavioral changes needed.


---
## HYPOTHESIS 2: Post-hoc Hallucination Detection

### Concept

After subagent returns, scan output for hallucination signatures: references to files/functions that don't exist in the workspace, fabricated tool results (claiming to have run bash/write when no corresponding tool events appear), internally inconsistent claims (e.g., "created file X" followed by "file X contains Y" but file X doesn't exist). Build a confidence score. Above threshold -> treat as quality failure, trigger replanning.

### Rationale

The current detectExecutorOutputQualityFailures() catches truncation and empty outputs but has zero awareness of hallucination. An executor can confidently claim to have created 5 files and run 3 tests when it actually produced nothing. The collectArtifactEvidence() function provides ground-truth via git status --short, giving us raw material to cross-check claims.

### Detailed Design

**New Types:**
```
interface HallucinationReport {
  taskId: string;
  overallConfidence: number;       // 0.0 (verified) to 1.0 (fabricated)
  fileClaims: FileExistenceClaim[];
  internalConsistencyFailures: string[];
  hallucinationLikely: boolean;    // overallConfidence >= threshold
}
```

**New Function: detectHallucinations(cwd, executorOutputs, options?)**
Insert near detectExecutorOutputQualityFailures() (~line 1560).

Four detection phases:
1. Extract file claims from output text via regex (created/wrote/generated file X)
2. Verify each claim against disk: fs.existsSync() + git status --short
3. Internal consistency checks: "created X" + "X not found", "all tests pass" + "failures mentioned"
4. Compute weighted confidence: file claims (0.5) + consistency (0.3) + tool mismatch (0.2)

**Helper Functions:**
- extractFileClaims(text): extracts file paths from executor output
- verifyFileClaims(cwd, claims): cross-checks against git status
- checkInternalConsistency(text): detects self-contradictions
- getDiskFilesFromGit(cwd): runs git status --short, parses file paths

**Insertion Points:**
- detectHallucinations() + helpers: plan-execute-verify.ts, near line 1560
- Gating: in runPlanExecuteVerify() at ~line 360, merge hallucination failures into allHardFailures

**Configurable**: threshold via options.hallucinationThreshold (default 0.7).

**Limitation**: Without real-time tool event preservation, tool-usage verification is approximate (regex-based). File-existence checks are fully reliable via git ground truth.


---
## HYPOTHESIS 3: Context-Adaptive Task Dispatch

### Concept

Make task sizing dynamic based on available context. Read model context limits from agent profiles, estimate prompt overhead (plan context + intake contract + instructions), size tasks for a safe budget (40% of remaining). Strip non-essential intake/plan context from executor prompts. Implement promptMinification() to remove verbose sections.

### Rationale

Currently enforceTaskSizeCap() uses a hardcoded maxWords=200 with no awareness of actual model context limits. A subagent with 200k-token context could handle much larger tasks. Conversely, a 32k-context model may already be overloaded at 200 words. Context-adaptive sizing ensures tasks fit the actual model.

### Detailed Design

**New Function: computeAdaptiveTaskSizeCap(modelId)**
```
function computeAdaptiveTaskSizeCap(modelId?: string): number {
  const limit = resolveModelContextLimit(modelId);
  // 40% budget, 35% overhead
  const usableTokens = Math.ceil(limit * 0.40) - Math.ceil(limit * 0.35);
  const safeTokens = Math.max(500, usableTokens);
  const words = Math.ceil(safeTokens * 0.75);
  return Math.min(Math.max(words, 60), 500);  // clamp [60, 500]
}
```

**New Function: promptMinification(intake)**
Strips non-essential sections from intake for executor prompts:
- **Keeps**: task_summary, constraints, invariants, success_criteria, failure_criteria, executor_output_contract, original_task
- **Strips**: routing_decision, routing_requirements, orchestration_controls, ambiguities, non_goals, goal_attractor, task_scope, task_type, user_intent

**Modified buildExecutorPrompt()** (~line 1030):
Replace formatIntakeForPrompt(intake) with JSON.stringify(promptMinification(intake)), update label.

**Modified runPlanExecuteVerify()** (~line 213):
Before: enforceTaskSizeCap(parsePlan(planner.text, params.task), 200)
After: const cap = computeAdaptiveTaskSizeCap(executorModelId); enforceTaskSizeCap(plan, cap)

**Insertion Points:**
- computeAdaptiveTaskSizeCap(): near enforceTaskSizeCap() (~line 1700)
- promptMinification(): near formatIntakeForPrompt() (~line 700)
- buildExecutorPrompt() modification: at ~line 1030
- runPlanExecuteVerify() modification: at ~line 213

**Configurable**: adaptiveTaskSizing and promptMinification booleans in NormalizedParams (both opt-in initially).


---
## CRITIQUE: Cross-Cutting Evaluation

### Criterion 1: Hard enforcement vs soft warning?

| Hypothesis | Verdict | Reasoning |
|-----------|---------|-----------|
| H1 (Context Budget) | Hard enforcement-capable | contextBudget.exhausted is boolean; gates at allHardFailures level. Prevents verifier from seeing truncated output. |
| H2 (Hallucination) | Mixed — start soft | Confidence scoring is probabilistic; false positives WILL happen. Recommend soft warning initially, graduate to hard after calibration. |
| H3 (Context-Adaptive) | Soft improvement | Adaptive sizing improves quality without blocking execution; no enforcement semantics. |

### Criterion 2: Works without modifying src/substrate.ts?

| Hypothesis | Works w/o substrate changes? | Reasoning |
|-----------|------------------------------|-----------|
| H1 | Partially | Can estimate in spawnChecked() wrapper; needs buildSubagentSystemPrompt exported or inlined. |
| H2 | Yes, fully | Uses ExecutorOutput[] + cwd + git; all available in shape. |
| H3 | Yes, fully | Pure functions on Intake and model strings; shape-local. |

### Criterion 3: Degrades gracefully without real-time telemetry?

| Hypothesis | Graceful degradation? | Reasoning |
|-----------|----------------------|-----------|
| H1 | Yes, with caveat | Pre-flight heuristic only; cannot observe runtime context fill from tool outputs. Conservative 60% threshold accounts for this. |
| H2 | Yes, partially | File-existence checks (git, fs) are fully reliable. Tool-usage verification is approximate without event-stream preservation. |
| H3 | Yes, fully | Static transformations based on model identity; no runtime data needed. |

### Criterion 4: False positive risk? False negative risk?

| Hypothesis | False Positive Risk | False Negative Risk |
|-----------|-------------------|-------------------|
| H1 | Low — 60% threshold is conservative | Moderate — tool-output-driven exhaustion missed by pre-flight check |
| H2 | Moderate-High — regex can't distinguish descriptive from actual claims | Low — git ground truth catches fabricated paths reliably |
| H3 | Negligible — only affects task splitting | N/A — not a detection mechanism |

### Criterion 5: Implementation complexity?

| Hypothesis | Complexity | LOC | Risk |
|-----------|-----------|-----|------|
| H1 | Medium | ~120 LOC | Low — additive, touches spawnChecked and gating block |
| H2 | High | ~200 LOC | Medium — regex patterns need calibration against real outputs |
| H3 | Medium | ~130 LOC | Low — additive, prompt changes only |


---
## SYNTHESIS: Top 5 Concrete Code Changes

All changes are additive and backward-compatible. No existing behavior is altered.

### Change 1: Context Budget Estimation (Priority: HIGH)

**Rationale**: Catches the most impactful failure mode (silent truncation) with simplest implementation. Substrate-safe approach avoids modifying substrate.ts.

**File**: src/shapes/plan-execute-verify.ts

**Five modifications:**
1. Add ContextBudgetEstimate type after ArtifactEvidence interface (~line 48)
2. Add contextBudget?: ContextBudgetEstimate to ExecutorOutput interface (~line 73)
3. Add estimateContextBudget(task, systemPrompt, modelId?, thresholdPercent?) function near detectExecutorOutputQualityFailures (~line 1560)
4. Add resolveModelContextLimit(modelId?) function (same location) - hardcoded lookup table for known model context limits
5. In runPlanExecuteVerify(), after executor outputs (~line 360), add context exhaustion gating

**Key integration code in runPlanExecuteVerify():**
- Filter executorOutputs for exhausted contextBudget entries
- Map to human-readable failure strings
- Merge into allHardFailures array alongside artifact evidence and quality failures

**Dependencies**: Requires resolveModelContextLimit() (also needed by Change 4). Requires buildSubagentSystemPrompt exported from substrate.ts or inlined.

---
### Change 2: File-Claim Verification via Git Ground Truth (Priority: HIGH)

**Rationale**: Most reliable hallucination detection subset. Uses git status --short as ground truth. Hard-gate integration without full confidence-scoring machinery.

**File**: src/shapes/plan-execute-verify.ts

**Three new functions** (near collectArtifactEvidence() ~line 1480):
1. verifyFileClaims(cwd, executorOutputs): string[] - cross-checks output file claims against git status
2. extractFileClaimsSimple(text): string[] - regex extraction of file paths from executor output
3. getDiskFilesFromGit(cwd): string[] - runs git status --short, returns file paths

**Gating logic**: Only hard-gates when ALL file claims are unverified (no files on disk match any claim). Partial mismatch is a warning only.

**Insertion**: Add fileClaimFailures to allHardFailures array alongside other failure sources.


---
### Change 3: Prompt Minification for Executor Prompts (Priority: MEDIUM)

**Rationale**: Simple, low-risk optimization. An executor doesn't need routing decisions, ambiguities, or non-goals - just its task and relevant constraints. Pure win with no behavioral risk.

**File**: src/shapes/plan-execute-verify.ts

**One new function** (near formatIntakeForPrompt() ~line 700):
promptMinification(intake: Intake): Record<string, unknown>
- Keeps: task_summary, constraints, invariants, success_criteria, failure_criteria, executor_output_contract, original_task
- Strips: routing_decision, routing_requirements, orchestration_controls, ambiguities, non_goals, goal_attractor, task_scope, task_type, user_intent

**One-line change in buildExecutorPrompt() (~line 1035):**
- Replace: formatIntakeForPrompt(intake)
- With: JSON.stringify(promptMinification(intake), null, 2)
- Update label to indicate executor-relevant sections only

---
### Change 4: Adaptive Task Size Cap (Priority: MEDIUM)

**Rationale**: Prevents over-splitting for large-context models and under-splitting for small-context models. The 200-word hardcoded cap is reasonable for 128k models but wastes capacity on 200k models.

**File**: src/shapes/plan-execute-verify.ts

**One new function** (near enforceTaskSizeCap() ~line 1700):
computeAdaptiveTaskSizeCap(modelId?: string): number
- Resolves model context limit via resolveModelContextLimit()
- Computes: 40% budget - 35% overhead = usable tokens
- Converts tokens to words (0.75x) with [60, 500] clamp

**Two-line change in runPlanExecuteVerify() (~line 213):**
- Before: enforceTaskSizeCap(parsePlan(planner.text, params.task), 200)
- After: resolve executor model, compute adaptive cap, pass dynamic cap to enforceTaskSizeCap()

---
### Change 5: Internal Consistency Checks (Priority: LOW)

**Rationale**: Catches obvious self-contradictions without expensive file-system verification. Low false-positive risk because patterns are specific.

**File**: src/shapes/plan-execute-verify.ts

**One new function** (near detectExecutorOutputQualityFailures() ~line 1560):
checkOutputConsistency(executorOutputs: ExecutorOutput[]): string[]
- Detects: "created X" + "X not found" contradictions
- Detects: "all tests pass" + "failures mentioned" contradictions

**Gating**: Add consistencyFailures to allHardFailures.
**Recommendation**: Start as soft warnings (emit to progress log), graduate to hard enforcement after 10+ calibration runs.

---
### Integration Priority and Dependency Map

Change 3 (Prompt Minification)  <-- No dependencies, pure win
Change 4 (Adaptive Sizing)      <-- Depends on resolveModelContextLimit() from Change 1
Change 1 (Context Budget)       <-- Core; resolveModelContextLimit() needed by 3 & 4
Change 2 (File Claim Verify)    <-- Independent, uses git already integrated
Change 5 (Consistency Checks)   <-- Independent, pure text analysis

**Recommended implementation order**: 1, 3, 4, 2, 5


---
### Files Touched Summary

| File | Changes |
|------|---------|
| src/shapes/plan-execute-verify.ts | All 5 changes: new types (ContextBudgetEstimate), 8+ new functions (estimateContextBudget, resolveModelContextLimit, verifyFileClaims, extractFileClaimsSimple, getDiskFilesFromGit, promptMinification, computeAdaptiveTaskSizeCap, checkOutputConsistency), modified spawnChecked, buildExecutorPrompt, runPlanExecuteVerify at 4 points |
| src/substrate.ts | Minimal: export buildSubagentSystemPrompt (needed by Change 1). No behavioral changes if substrate-safe approach used |
| src/types.ts | Optional: add contextBudgetThresholdPercent, hallucinationThreshold, adaptiveTaskSizing, promptMinification to NormalizedParams |

---
### Risk Summary

| Risk | Mitigation |
|------|-----------|
| Context budget false positives | Conservative 60% threshold; only triggers on genuinely large prompts |
| File claim regex false positives | Only hard-gate when ALL claims are unverified; partial mismatch is warning |
| Minified prompts missing critical context | Preserves all constraints, invariants, success criteria, original task |
| Adaptive sizing producing too-large tasks | Clamped to [60, 500] word range; ceiling prevents runaway sizing |
| Internal consistency false positives | Start as soft warnings, not hard gates; graduate after calibration |

---
### Verifier Brief

The verifier should check:
1. That all 5 changes are present and correctly inserted at specified file paths and line ranges
2. That no existing behavior is broken (backward compatibility)
3. That resolveModelContextLimit() is implemented once and shared between Changes 1 and 4
4. That buildSubagentSystemPrompt is exported from substrate.ts or acceptably inlined
5. That gating logic in runPlanExecuteVerify() correctly merges all new failure sources into allHardFailures
6. That new functions are placed near related existing functions (context gating near quality detection, minification near intake formatting, etc.)
