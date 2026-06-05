---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260603-000000
context_saturation_estimate: "~35%"
---

# ATT_1_PLAN — Fix Orchestration Systemic Issues

## Task Statement

Fix 5 unfixed systemic issues (and 1 latent regex bug) in the Pi orchestrator extension. These are the root causes of a failed /orchestrate run that spent ~1 hour with 18 subagents yet produced ZERO implementation artifacts. Every fix is targeted, scoped to a single function, and uses oldText/newText edits.

## Invariants

1. **No modification to src/substrate.ts** — Issue #6 is ALREADY FIXED. Do not touch substrate.ts.
2. **Build must not break** — All TypeScript must remain valid; no syntax errors.
3. **Existing tests must pass** — Tests in tests/ directory must still pass.
4. **No regression** — Non-PEV shapes (multi-verify-vote) must be unaffected.
5. **Only modify specified functions** — No refactoring beyond documented edits.

## Success Criteria

| # | Issue | Success Condition |
|---|-------|-------------------|
| 1 | Routing check fights planner | checkRequiredModelRouting() counts by phaseRole, not agentName |
| 2 | Intake overrides model prefs | verifier.model = "deepseek-v4-flash" when user requests v4 flash for verification |
| 3 | Verifier trusts text output | Verifier prompt includes file-artifact verification rule |
| 4 | Tasks too large | Planner prompt has ~200-word cap; executor warned text-only = FAILURE |
| 5 | No artifact verification | Post-execution git diff collected and passed to verifier |
| 7 | PT 5.5 false-match | Regex tightened — bare "pt" no longer matches as GPT-5.5 |

## Implementation Steps

All changes in two files, applied as oldText->newText edits. Execute in numbered order.

---

### STEP 1: Fix Issue #7 — Tighten GPT-5.5 regex (src/index.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/index.ts
**Function:** modelAliasFromText()

**Root cause:** Regex /(?:gpt|pt)[-\s]*5(?:\.5)?/ matches bare "pt 5.5" as GPT-5.5.

**Fix:** Require the "g" prefix explicitly.

**oldText:**
```
  if (/(?:gpt|pt)[-\s]*5(?:\.5)?/.test(normalized) || /codex/.test(normalized)) return { provider: "openai-codex", model: "gpt-5.5" };
```

**newText:**
```
  if (/gpt[-\s]*5(?:\.5)?/.test(normalized) || /codex/.test(normalized)) return { provider: "openai-codex", model: "gpt-5.5" };
```

---

### STEP 2: Fix Issue #2 — Intake overrides user model prefs (src/index.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/index.ts
**Function:** applyRoutingAlias()

**Root cause:** applyRoutingAlias() uses !inferred.planner / !inferred.executor / !inferred.verifier guards — first-write-wins. When a sentence like "use v4 pro for planning, use v4 pro for execution and v4 flash for verification" is parsed, the v4 pro alias local clause catches both "execution" and "verification" roles (no comma between them). Verifier gets v4-pro before v4-flash is processed, and the guard prevents overwrite.

**Fix:** Remove the guards so later (more specific / rightmost) role-model pairings always override earlier ones. Last-write-wins.

**oldText (function applyRoutingAlias):**
```typescript
function applyRoutingAlias(inferred: InferredModelRouting, roles: RoutingRequirement["role"][], alias: RoleModelOverride): void {
  for (const role of roles) {
    if (role === "planner" && !inferred.planner) inferred.planner = alias;
    if (role === "executor" && !inferred.executor) inferred.executor = alias;
    if (role === "verifier" && !inferred.verifier) inferred.verifier = alias;
  }
}
```

**newText:**
```typescript
function applyRoutingAlias(inferred: InferredModelRouting, roles: RoutingRequirement["role"][], alias: RoleModelOverride): void {
  for (const role of roles) {
    // Last-write-wins: later (more specific) role-model clauses override earlier ones.
    // This correctly handles "use X for planning, use Y for execution and Z for verification"
    // where Z's local clause may also capture earlier roles if no comma separates them.
    if (role === "planner") inferred.planner = alias;
    if (role === "executor") inferred.executor = alias;
    if (role === "verifier") inferred.verifier = alias;
  }
}
```

---

### STEP 3: Fix Issue #1 — Routing check fights planner (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**Function:** routingEvidenceMatchesRequirement()

**Root cause:** The function checks evidence.agentName !== req.agentName AFTER confirming the phase role matches. For the executor phase, when the planner assigns tasks to agent "researcher", the evidence has phaseRole: "executor" and agentName: "researcher", but req.agentName is "coder" — so the match fails even though the spawn was a valid executor-phase spawn with the correct model.

**Fix:** For core routing roles (planner/executor/verifier), skip the agent name check since the phaseRole match is sufficient to classify the spawn. Agent name matching remains for non-core (runtime) roles like "researcher".

**oldText:**
```typescript
function routingEvidenceMatchesRequirement(
  evidence: RoutingEvidence,
  req: RoutingRequirement,
): boolean {
  const roleMatches = isCoreRoutingRole(req.role)
    ? evidence.phaseRole === req.role
    : evidence.agentName === req.agentName || evidence.semanticRole === req.role;
  if (!roleMatches) return false;
  if (evidence.agentName !== req.agentName) return false;
  if (req.provider && evidence.provider !== req.provider) return false;
  if (req.model && evidence.model !== req.model) return false;
  return true;
}
```

**newText:**
```typescript
function routingEvidenceMatchesRequirement(
  evidence: RoutingEvidence,
  req: RoutingRequirement,
): boolean {
  if (isCoreRoutingRole(req.role)) {
    // Core roles (planner/executor/verifier): match by phaseRole.
    // Agent name variance is tolerated — a spawn to agent "researcher" during
    // the executor phase counts as valid executor routing evidence as long as
    // provider/model match. This allows the planner to assign semantic agent
    // names (e.g., "researcher", "coder", "reviewer") without breaking
    // deterministic routing verification.
    if (evidence.phaseRole !== req.role) return false;
  } else {
    // Runtime roles (e.g., "researcher"): match by agentName or semanticRole.
    if (evidence.agentName !== req.agentName && evidence.semanticRole !== req.role) return false;
  }
  if (req.provider && evidence.provider !== req.provider) return false;
  if (req.model && evidence.model !== req.model) return false;
  return true;
}
```

---

### STEP 4: Fix Issue #4 — Task-size cap in planner prompt (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**Functions:** buildPlanningPrompt() and buildExecutorPrompt()

**Root cause:** No size guidance, leading to single tasks with ~400 words covering 7+ major requirements. Subagent executors default to prose reports instead of using write/edit/bash.

**Fix (A):** Add task-size cap guideline (~200 words) to planner prompt.

**oldText (end of buildPlanningPrompt):**
```
- If the task cannot be safely split and no runtime-role count is requested, return one task.

Attempt: ${attempt}${retryBlock}`;
```

**newText:**
```
- If the task cannot be safely split and no runtime-role count is requested, return one task.
- **Task-size cap**: each executor task description MUST be under ~200 words. Tasks exceeding this should be split into multiple smaller tasks. Small tasks ensure executor subagents have enough context budget to use write/edit/bash tools and produce actual file artifacts rather than text reports.
- An executor task that only describes/analyzes and never touches files is NOT sufficient for CREATE or IMPLEMENT work — the verifier will check for actual file artifacts.

Attempt: ${attempt}${retryBlock}`;
```

**Fix (B):** Add implementation-failure warning to executor system prompt.

**oldText (buildExecutorPrompt return statement):**
```typescript
  return `You are executing one task from a deterministic orchestration.

INTAKE CONTRACT:
${formatIntakeForPrompt(intake)}

Full plan:
${JSON.stringify(plan, null, 2)}

Assigned executor task:
${JSON.stringify(task, null, 2)}

Complete only the assigned task. Use Pi tools only if needed and allowed by the intake constraints.

${outputRule}`;
```

**newText:**
```typescript
  return `You are executing one task from a deterministic orchestration.

IMPORTANT: If your task is to CREATE, IMPLEMENT, BUILD, or MODIFY code/files, you MUST use write/edit/bash tools to produce actual file artifacts. A text-only response that merely describes what you would do — without creating or modifying any files — is a FAILURE. Always produce concrete artifacts for implementation tasks.

INTAKE CONTRACT:
${formatIntakeForPrompt(intake)}

Full plan:
${JSON.stringify(plan, null, 2)}

Assigned executor task:
${JSON.stringify(task, null, 2)}

Complete only the assigned task. Use Pi tools only if needed and allowed by the intake constraints.

${outputRule}`;
```

---

### STEP 5: Fix Issue #3 — Verifier must check file artifacts (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**Function:** buildVerificationPrompt()

**Root cause:** The verifier prompt passes executor text output directly with no instruction to check for actual file artifacts. The verifier trusts text claims like "I implemented the dashboard" without confirming files exist.

**Fix:** Add optional artifactEvidence parameter and explicit file-artifact verification rules.

**oldText:**
```typescript
function buildVerificationPrompt(
  intake: Intake,
  plan: Plan,
  outputs: ExecutorOutput[],
  routingEvidence: string,
): string {
  return `Verify the orchestration result against the intake contract.

INTAKE CONTRACT:
${formatIntakeForPrompt(intake)}

Plan:
${JSON.stringify(plan, null, 2)}

Executor outputs:
${JSON.stringify(outputs, null, 2)}

Model routing evidence/configuration supplied by orchestrator:
${routingEvidence}

Return JSON exactly and only in this shape:
{"status":"pass"|"fail","reasons":["..."]}

Use status "pass" only if the plan, outputs, and supplied routing evidence/configuration satisfy the intake success criteria and do not violate any constraints, invariants, or failure criteria. Use "fail" with concrete reasons for missing, unclear, or incorrect work.`;
}
```

**newText:**
```typescript
function buildVerificationPrompt(
  intake: Intake,
  plan: Plan,
  outputs: ExecutorOutput[],
  routingEvidence: string,
  artifactEvidence?: string,
): string {
  const artifactBlock = artifactEvidence
    ? `

ARTIFACT EVIDENCE (collected post-execution by orchestrator):
${artifactEvidence}`
    : "";
  return `Verify the orchestration result against the intake contract.

INTAKE CONTRACT:
${formatIntakeForPrompt(intake)}

Plan:
${JSON.stringify(plan, null, 2)}

Executor outputs:
${JSON.stringify(outputs, null, 2)}

Model routing evidence/configuration supplied by orchestrator:
${routingEvidence}${artifactBlock}

Return JSON exactly and only in this shape:
{"status":"pass"|"fail","reasons":["..."]}

Use status "pass" only if the plan, outputs, and supplied routing evidence/configuration satisfy the intake success criteria and do not violate any constraints, invariants, or failure criteria. Use "fail" with concrete reasons for missing, unclear, or incorrect work.

FILE ARTIFACT VERIFICATION RULE: If any executor task description contains CREATE, IMPLEMENT, BUILD, MODIFY, ADD, WRITE, or GENERATE (case-insensitive), the executor output MUST reference actual file artifacts (files created, modified, or edited). A text-only response that describes what was done without mentioning any specific files created/modified is INSUFFICIENT — treat it as FAIL with reason "no file artifacts produced for implementation task". The ARTIFACT EVIDENCE block (if present) shows what files actually changed on disk — use it as ground truth, overriding any text claims.`;
}
```

---

### STEP 6: Update verifier prompt call site (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**Function:** runPlanExecuteVerify() — inside the main loop where buildVerificationPrompt is called

**Change:** Collect artifact evidence and pass it to buildVerificationPrompt.

**oldText:**
```typescript
    const verifierPrompt = buildVerificationPrompt(
      state.intake!,
      plan,
      executorOutputs,
      buildRoutingEvidenceForVerifier(params, state),
    );
```

**newText:**
```typescript
    const artifactEvidence = collectArtifactEvidence(params.cwd, executorOutputs);
    const verifierPrompt = buildVerificationPrompt(
      state.intake!,
      plan,
      executorOutputs,
      buildRoutingEvidenceForVerifier(params, state),
      artifactEvidence,
    );
```

---

### STEP 7: Fix Issue #5 — Add post-execution artifact verification (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**New function:** collectArtifactEvidence() — add before the Shared utility functions section

**Change:** Add a function that collects post-execution metadata (git diff --stat, file-artifact claims from executor outputs, suspiciousness flag). Insert right before the `// ── Shared utility functions` comment.

**oldText:**
```typescript
// ── Shared utility functions (local to this shape) ──────────────────────────

function optionalString(value: unknown): string | undefined {
```

**newText:**
```typescript
// ── Post-execution artifact evidence collection ─────────────────────────────

/**
 * Collects post-execution artifact evidence for the verifier.
 *
 * - Attempts to run git diff --stat to show what files changed.
 * - Falls back to listing executor output claims about file artifacts.
 * - Produces a structured summary for inclusion in the verifier prompt.
 */
function collectArtifactEvidence(
  cwd: string,
  executorOutputs: ExecutorOutput[],
): string | undefined {
  const lines: string[] = [];

  // Attempt to collect git diff evidence
  try {
    const gitResult = spawnSync("git", ["-C", cwd, "diff", "--stat", "--name-only"], {
      timeout: 5000,
      encoding: "utf8",
      windowsHide: true,
    });
    if (gitResult.status === 0 && gitResult.stdout?.trim()) {
      lines.push("git diff --stat --name-only:");
      lines.push(gitResult.stdout.trim());
    } else if (gitResult.status === 0) {
      lines.push("git diff --stat: (working tree clean — no uncommitted changes)");
    } else {
      lines.push("git diff --stat: (command returned status " + gitResult.status + " — may not be a git repo or git not available)");
    }
  } catch (_err) {
    lines.push("git diff: (git not available or command failed)");
  }

  // Summarize file-artifact claims from executor outputs
  const fileArtifactPatterns = [
    /\b(?:created?|wrote?|added?|modified?|edited?|updated?|changed?|generated?)\s+(?:file|the\s+)?\s*[`"']?([^\s`"',;]+[.][a-z]{1,6})[`"']?/gi,
  ];
  const fileClaims: string[] = [];
  for (const output of executorOutputs) {
    for (const pattern of fileArtifactPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(output.output)) !== null) {
        const claim = match[1];
        if (claim && !fileClaims.includes(claim)) fileClaims.push(claim);
      }
    }
  }
  if (fileClaims.length) {
    lines.push("Files mentioned in executor outputs: " + fileClaims.join(", "));
  }

  // Lightweight suspiciousness: check for implementation tasks with no file claims
  const implPattern = /\b(CREATE|IMPLEMENT|BUILD|MODIFY|ADD|WRITE|GENERATE)\b/i;
  let hasImplTask = false;
  for (const output of executorOutputs) {
    if (implPattern.test(output.description)) {
      hasImplTask = true;
      break;
    }
  }
  if (hasImplTask && fileClaims.length === 0) {
    lines.push("WARNING: Implementation task(s) detected but no file artifacts found in executor outputs or git diff.");
  }

  return lines.length ? lines.join("\n") : undefined;
}

// ── Shared utility functions (local to this shape) ──────────────────────────

function optionalString(value: unknown): string | undefined {
```

---

### STEP 8: Add spawnSync import (src/shapes/plan-execute-verify.ts)

**File:** C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts
**Location:** Top of file, import section

**Change:** Add spawnSync import from node:child_process for the collectArtifactEvidence function.

**oldText:**
```typescript
import {
  SpawnGuard,
  SUBSTRATE_CAPS,
  clampIterations,
  spawnSubagent,
  runWorkGraph,
  buildExecutionWaves,
  formatRoutedModel,
  truncateWithNotice,
  throwIfAborted,
  type AgentProfile,
  type SubagentResult,
} from "../substrate";
```

**newText:**
```typescript
import { spawnSync } from "node:child_process";
import {
  SpawnGuard,
  SUBSTRATE_CAPS,
  clampIterations,
  spawnSubagent,
  runWorkGraph,
  buildExecutionWaves,
  formatRoutedModel,
  truncateWithNotice,
  throwIfAborted,
  type AgentProfile,
  type SubagentResult,
} from "../substrate";
```

---

## Handoff Notes

### Key File Paths (absolute)
- **C:/Users/doner/pi-orchestrator-extension/src/index.ts** — Active extension entry point. Contains inferModelRoutingFromTask(), modelAliasFromText(), applyRoutingAlias(). Issues #2 and #7.
- **C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts** — Shape-based PEV orchestration. Contains routingEvidenceMatchesRequirement(), buildPlanningPrompt(), buildExecutorPrompt(), buildVerificationPrompt(). Issues #1, #3, #4, #5.
- **C:/Users/doner/pi-orchestrator-extension/src/substrate.ts** — Substrate layer. **DO NOT MODIFY** (Issue #6 already fixed here).

### Architecture note
index.ts is the **active** code path (loaded via package.json -> pi.extensions). plan-execute-verify.ts is the **shape-based refactoring target** — not yet wired into the extension but contains the next-generation orchestration logic. The INTAKE maps issues #1, #3, #4, #5 to plan-execute-verify.ts. The Executor should verify with the ORCHESTRATOR whether corresponding fixes are also needed in index.ts duplicate functions (checkRequiredModelRouting(), buildPlanningPrompt(), buildExecutorPrompt(), buildVerificationPrompt()).

### Risks
- **Step 2 (Issue #2):** If any code path relies on first-write-wins semantics for model routing, last-write-wins could cause different behavior. Risk is low — only affected when multiple aliases appear in the same sentence (the bug case).
- **Step 8 (import):** Adding spawnSync import is safe — it is a Node.js built-in, already imported as spawn in index.ts and substrate.ts.
- **Step 7 (git diff):** spawnSync with timeout handles git not available (non-git repos, Windows without git in PATH). Function degrades gracefully.

### Build verification
After all edits, run in C:/Users/doner/pi-orchestrator-extension:
```
npx tsc --noEmit
```

### Test verification
After build succeeds, run:
```
node tests/test-natural-language-controls.cjs
```

## Summary of Edits

| Step | Issue | File | Function | Change |
|------|-------|------|----------|--------|
| 1 | #7 | index.ts | modelAliasFromText() | Remove bare "pt" from GPT regex: (?:gpt|pt) -> gpt |
| 2 | #2 | index.ts | applyRoutingAlias() | Remove !inferred.* guards -> last-write-wins |
| 3 | #1 | plan-execute-verify.ts | routingEvidenceMatchesRequirement() | Skip agentName check for core roles (phase-based match) |
| 4A | #4 | plan-execute-verify.ts | buildPlanningPrompt() | Add ~200-word task-size cap guideline |
| 4B | #4 | plan-execute-verify.ts | buildExecutorPrompt() | Add text-only=failure warning for impl tasks |
| 5 | #3 | plan-execute-verify.ts | buildVerificationPrompt() | Add artifactEvidence param + file-artifact check rule |
| 6 | #3,#5 | plan-execute-verify.ts | runPlanExecuteVerify() | Call collectArtifactEvidence, pass to verifier |
| 7 | #5 | plan-execute-verify.ts | (new) collectArtifactEvidence() | git diff + file-claim scanning + suspiciousness check |
| 8 | #5 | plan-execute-verify.ts | imports | Add spawnSync import from node:child_process |
