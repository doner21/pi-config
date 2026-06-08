# HANDOFF: Orchestrate Extension — Systemic Issues Found

**Date:** 2026-06-03
**Run:** `/orchestrate` to build a live dashboard sidebar panel for the orchestration flow
**Outcome:** PASS verdict, but ZERO implementation artifacts created after 18 subagents / 3 attempts / ~1 hour

---

## Summary of What Happened

The orchestrator was asked to build a right-hand-side dashboard panel showing subagent status, model assignments, task mappings, context percentages, and orchestration parameters. After 3 attempts and 18 subagent spawns, the verifier returned PASS — but no files were created, no code was written, and no tests exist.

---

## Root-Cause Issues to Fix

### ISSUE 1: Deterministic routing check fights planner role assignments

- **File:** `src/shapes/plan-execute-verify.ts` — `checkRequiredModelRouting()`
- **Problem:** The routing check counts spawns by agent name (e.g., `coder`) and demands exactly N spawn evidence items for that specific agent name. When the planner naturally assigns different agent names to different semantic roles (`researcher` for research tasks, `planner` for planning tasks, `reviewer` for verification tasks), the check fails with _"executor expected 4 spawn evidence item(s) for coder, found 1"_ because the spawns happened under agent names `researcher`, `planner`, `coder`, and `reviewer`.
- **Impact:** The planner had to burn 2 attempts (11 subagent spawns) discovering a workaround: assign ALL tasks to `agent: "coder"` and express semantic roles only via the `role` field. This is an unnatural constraint that fights the planner.
- **Evidence from run:**
  - Attempt 1: `"Deterministic model routing check failed: executor expected 4 spawn evidence item(s) for coder using deepseek/deepseek-v4-pro, found 1"`
  - Attempt 2: `"Deterministic model routing check failed: executor expected 4 spawn evidence item(s) for coder using deepseek/deepseek-v4-pro, found 2"`
  - Attempt 3: planner explicitly notes in plan JSON: _"All four executor tasks are assigned agent='coder'... to satisfy the deterministic spawn-evidence check... This directly addresses the Attempt 1 and Attempt 2 failures"_
- **Suggested fix:** The routing check should verify model/provider for the **executor role** (the phase), not a specific agent name. A task assigned to agent `researcher` with `deepseek/deepseek-v4-pro` should count as valid executor routing evidence. Either make the check phase-based (count all executor-phase spawns) or make it tolerate agent-name variance when the model/provider match.

---

### ISSUE 2: Intake contract normalizer overrides user's model preference

- **File:** `src/index.ts` — `inferModelRoutingFromTask()` / `applyRoutingAlias()`
- **Problem:** When the user writes "use deepseek v4 pro planning, use deepseek v4 pro for execution and code work and deepseek v4 flash for any verification work", the intake parser sees both `v4 pro` and `v4 flash` in the text. The `applyRoutingAlias()` function applies the **first-found** alias to a role and then **never overwrites** it with a later, more specific alias. Both `v4 pro` and `v4 flash` are found in the task text, but `v4 pro` appears first and maps to all roles including verifier, and `v4 flash` never gets applied.
- **Impact:** The user explicitly requested `v4 flash` for verification, but the intake contract forced `v4 pro` for the verifier. The planner noted this discrepancy: _"DISCREPANCY NOTE: The original user task requested 'deepseek v4 flash for any verification work' but the intake contract normalized the verifier... to deepseek-v4-pro."_ — then followed the broken contract.
- **Evidence from run:**
  - Intake contract includes: `"verifier": { "provider": "deepseek", "model": "deepseek-v4-pro" }` — NOT "deepseek-v4-flash" as requested
  - Planner notes in plan JSON: _"DISCREPANCY NOTE: The original user task requested 'deepseek v4 flash for any verification work' but the intake contract normalized the verifier (reviewer) role to deepseek-v4-pro as a success criterion. This plan follows the intake contract as the governing specification."_
- **Suggested fix:** The local routing clause detection in `inferModelRoutingFromTask()` should give priority to the most specific (nearest) role-model pairing. When parsing "use X for planning, use Y for execution, use Z for verification", the last clause for each role should win, or the model alias nearest to the role word in the text should take precedence. Specifically, `v4 flash` appears closest to "verification work" in the text and that association should be preserved.

---

### ISSUE 3: Verifier trusts executor text output, not file artifacts

- **File:** `src/shapes/plan-execute-verify.ts` — `buildVerificationPrompt()`
- **Problem:** The verifier subagent receives the executor's **text output** and judges it against the original task. If an executor writes "I implemented the dashboard, 13/13 tests pass, all 7 display fields render correctly" in its text response, the verifier has no mechanism to confirm actual files on disk. It simply trusts the text.
- **Impact:** All 3 attempts' executor outputs were accepted by the verifier as evidence of work done. The verifier never checks whether `edit`/`write` tool calls actually happened or whether files exist.
- **Evidence from run:**
  - Task-3 executor output is a long report describing what it would build, not actual code artifacts
  - Progress logs show heavy `read` and `bash` activity but almost no `write`/`edit` calls
  - Verifier declares PASS: _"task-3 executed implementation and fixed a resource-leak bug"_ — but no files on disk
- **Suggested fix:** The verifier prompt should include a requirement to check for actual file artifacts. Options:
  - Include a `git diff --stat` or `git status` in the verifier prompt showing what files changed
  - Add a post-execution file artifact check: if the task description includes "CREATE" or "IMPLEMENT", the verifier must confirm at least one new/modified file exists
  - Add a `filesTouched` field to executor outputs (already exists as `ExecutorOutput.stderr` but not used for verification)

---

### ISSUE 4: Executor tasks too large — agents produce reports, not code

- **File:** `src/shapes/plan-execute-verify.ts` — planner prompt construction
- **Problem:** The planner constructed a single task-3 with ~400 words covering 7 major implementation requirements (subscribe to events, render a TUI panel, implement polling fallback, auto-show/auto-close lifecycle, write unit tests, run tests, produce summary). Subagents with limited context windows default to producing long text reports describing what they *would* do rather than actually using `write`/`edit`/`bash` to create files.
- **Impact:** Zero files created after 18 subagent spawns over ~1 hour. The executor subagents spent their context budget on reading/analyzing and producing prose, not on creating artifacts.
- **Evidence from run:**
  - Task-3 executor output is a multi-thousand-word narrative report
  - Progress logs for coder subagents: overwhelmingly `read` and `bash` calls, extremely rare `edit`/`write` calls
  - No files created: `git status` shows zero new files
- **Suggested fix:**
  - Add a planner guideline: "Each executor task must be small enough to complete in one turn. Prefer 3 small tasks over 1 large task. A task exceeding 200 words should be split."
  - Add a maximum task-description length in the planner prompt
  - Consider adding an explicit `outputType` field to tasks: `"code"` vs `"report"` — code tasks get stricter verification
  - Add a system prompt line for executor subagents: "If your task is to CREATE or IMPLEMENT, you MUST use write/edit/bash tools to produce actual files. A text-only response for an implementation task is a FAILURE."

---

### ISSUE 5: No post-execution artifact verification

- **File:** `src/shapes/plan-execute-verify.ts` — orchestration main loop
- **Problem:** After executor tasks complete, the orchestration moves directly to the verifier without running any automated artifact check (e.g., `git diff` to confirm files changed, test runner to confirm tests pass). The verifier is an AI subagent that can only read the executor's text output; it has no built-in mechanism to inspect the actual file system.
- **Impact:** Combined with Issue 4, this creates a gap where the system can pass verification without producing any real output.
- **Evidence from run:** The verifier's token budget (71,345 chars for the prompt!) was consumed by the executor's text output rather than actual evidence of work.
- **Suggested fix:**
  - Add a post-execution metadata collection step: capture `git diff --stat`, list of files created/modified, test exit codes
  - Include this metadata in the verifier prompt as structured evidence
  - Consider a lightweight non-AI check: if no files were touched during an implementation attempt, flag it as suspicious before reaching the verifier

---

### ISSUE 6: Subagent post-`agent_end` error noise (FIXED)

- **File:** `src/substrate.ts` — `spawnSubagent()`
- **Problem:** Subagent Pi processes emit `agent_end` to signal completion, then can emit additional `message_end` events with `stopReason=error` during internal shutdown. The substrate was treating all `message_end` errors as fatal, even those arriving after `agent_end`.
- **Impact:** In the initial run (before this session's fixes), the orchestration crashed entirely with: _"Subagent researcher reported assistant failure despite exit code 0: assistant stopReason=error; assistant errorMessage=terminated."_
- **Fix applied:** Added `agentEnded` flag — once `agent_end` is received, all subsequent `message_end` events are ignored for failure detection.
- **Status:** ✅ FIXED in this session

---

### ISSUE 7: Model routing inference: "PT 5.5" not recognized as "GPT 5.5"

- **File:** `src/index.ts` — `modelAliasFromText()`
- **Problem:** The regex for GPT-5.5 matching is `/\b(?:gpt|pt)[-\s]*5(?:\.5)?\b/`. The word `pt` alone followed by `5` or `5.5` matches as GPT-5.5. This is overly broad and can cause false matches with non-GPT text containing "pt 5.5" or similar. In this run it didn't cause issues since the user specified deepseek models, but it's a latent bug.
- **Suggested fix:** Tighten the regex to require a word boundary or "g" prefix for GPT matching: `/\bg?pt[-\s]*5[.\s]*5\b/` or add negative lookbehind for common false-match patterns.

---

## Run Statistics (for reference)

| Metric | Value |
|--------|-------|
| Attempts | 3 |
| Subagents spawned | 18/18 |
| Total wall time | ~1 hour |
| Files created by orchestration | **0** |
| Files modified by orchestration | **0** |
| Attempt 1 planner subagent turns | ~25 tool calls |
| Attempt 1 executor runtime | researcher: ~4.5 min, planner: ~5 min, coder: ~7.5 min, reviewer: ~5 min |
| Attempt 1 failure reason | Routing check: "expected 4 coder spawns, found 1" |
| Attempt 2 failure reason | Routing check: "expected 4 coder spawns, found 2" |
| Attempt 3 planner strategy | Assign all tasks to `agent: "coder"` with `role` field for semantics |

---

## Priority

| Priority | Issue | Why |
|----------|-------|-----|
| **P0** | #3: Verifier trusts text output | The system fundamentally cannot guarantee work was done. Every PASS verdict is unreliable. |
| **P0** | #4: Tasks too large | Executors default to report-writing instead of code-writing. Blocks all implementation work. |
| **P1** | #5: No artifact verification | Even with smaller tasks, there's no automated check that files were actually created. |
| **P1** | #1: Routing check fights planner | Burns ~60% of subagent budget on workarounds for an inflexible check. |
| **P2** | #2: Intake overrides user model prefs | Silently ignores user-specified model routing. Violates explicit instructions. |
| **P3** | #7: "PT 5.5" false-match risk | Latent bug, not triggered in this run but will cause incorrect routing. |
