---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260603-000000
---

# ATT_2_VERIFIER_BRIEF

## What to Verify

The executor (assisted by ORCHESTRATOR) applied fixes for 5 issues + 1 latent bug across 2 source files in `C:/Users/doner/pi-orchestrator-extension`.

## Files to Check

1. **`src/index.ts`** — active extension entry point
2. **`src/shapes/plan-execute-verify.ts`** — shape-based PEV orchestration

## Issue-by-Issue Verification Checklist

### Issue #1: Routing check fights planner (P1)
- [ ] `src/index.ts`: `checkRequiredModelRouting()` uses `isCore` flag to match by provider/model only for core roles (planner/executor/verifier)
- [ ] `src/shapes/plan-execute-verify.ts`: `routingEvidenceMatchesRequirement()` skips agentName check for `isCoreRoutingRole(req.role)`
- [ ] A spawn to agent "researcher" during executor phase with correct model/provider counts as valid executor routing evidence
- [ ] Runtime roles (e.g., "researcher") still match by agentName

### Issue #2: Intake overrides user model prefs (P2)
- [ ] `src/index.ts`: `applyRoutingAlias()` does NOT have `!inferred.*` guards — last-write-wins
- [ ] When "use v4 pro for execution and v4 flash for verification" is parsed, verifier gets v4-flash (not overwritten by v4-pro)

### Issue #3: Verifier trusts text output (P0)
- [ ] `src/index.ts`: `buildVerificationPrompt()` accepts optional `artifactEvidence` parameter
- [ ] `src/shapes/plan-execute-verify.ts`: `buildVerificationPrompt()` accepts optional `artifactEvidence` parameter
- [ ] Both include FILE ARTIFACT VERIFICATION RULE in the prompt

### Issue #4: Tasks too large (P0)
- [ ] `src/index.ts`: `buildPlanningPrompt()` includes "Task-size cap: ~200 words"
- [ ] `src/shapes/plan-execute-verify.ts`: `buildPlanningPrompt()` includes "Task-size cap: ~200 words"
- [ ] `src/index.ts`: `buildExecutorPrompt()` includes "text-only response = FAILURE" warning
- [ ] `src/shapes/plan-execute-verify.ts`: `buildExecutorPrompt()` includes "text-only response = FAILURE" warning

### Issue #5: No artifact verification (P1)
- [ ] `src/index.ts`: call site calls `collectArtifactEvidence()` before verifier prompt
- [ ] `src/shapes/plan-execute-verify.ts`: call site calls `collectArtifactEvidence()` before verifier prompt
- [ ] Both files have `collectArtifactEvidence()` function with git diff + file-claim scanning + suspiciousness flag
- [ ] `src/index.ts`: imports `spawnSync` from `node:child_process`

### Issue #7: PT 5.5 false-match (P3)
- [ ] `src/index.ts`: `modelAliasFromText()` regex is `/\bgpt[-\s]*5(?:\.5)?\b/` — no bare "pt" alternative

## Invariants to Check
- [ ] `src/substrate.ts` is UNMODIFIED (Issue #6 already fixed)
- [ ] Tests pass: `node tests/test-natural-language-controls.cjs` exits 0

## How to Verify
1. Read `src/index.ts` and search for the patterns above
2. Read `src/shapes/plan-execute-verify.ts` and search for the patterns above
3. Run the test suite
4. Check that `src/substrate.ts` has not been modified
