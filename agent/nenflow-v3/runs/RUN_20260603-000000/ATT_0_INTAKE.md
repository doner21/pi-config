---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260603-000000
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# ATT_0_INTAKE — Fix Orchestration Systemic Issues

## Task Summary

Fix 5 unfixed systemic issues (and 1 latent bug) in `C:\Users\doner\push_pi_to_git`'s orchestration engine. The HANDOFF.md documents a failed `/orchestrate` run that spent ~1 hour with 18 subagents and produced ZERO implementation artifacts. The issues span: deterministic routing checks, model routing inference, verifier reliability, task sizing, artifact verification, and a latent regex false-match bug.

## Task Type

Bug-fix / code improvement across multiple source files in an existing TypeScript project.

## User Intent

Implement all necessary fixes described in HANDOFF.md so the orchestration system can reliably produce actual file artifacts (code, tests) when asked to implement features — not just text reports claiming success.

## Goal Attractor

An orchestration system where: (1) routing checks are phase-based not agent-name-based, (2) user model preferences are preserved, (3) verifier checks actual file artifacts, (4) executor tasks are small enough to produce real code, (5) post-execution artifact verification exists, and (7) the GPT-5.5 regex is safe from false matches.

## Constraints

- TypeScript codebase at `C:\Users\doner\push_pi_to_git`
- Issue #6 (subagent post-agent_end error noise) is ALREADY FIXED — do not modify `src/substrate.ts`
- Build must not break
- Existing tests must pass

## Invariants

1. No regression of Issue #6 fix in `src/substrate.ts`
2. Build passes after all changes
3. Each fix addresses exactly the root cause described in HANDOFF.md

## Success Criteria

| # | Issue | Success Condition |
|---|-------|-------------------|
| 1 | Routing check fights planner | `checkRequiredModelRouting()` counts by PHASE not agent name; a spawn to agent `researcher` with deepseek-v4-pro counts as valid executor routing |
| 2 | Intake overrides user model prefs | "v4 flash for verification" in user task → `verifier.model = "deepseek-v4-flash"` in intake contract |
| 3 | Verifier trusts text output | Verifier prompt includes requirement to check for actual file artifacts; executor output includes `filesTouched` or equivalent |
| 4 | Tasks too large | Planner prompt includes task-size cap (~200 words); executor system prompt warns text-only response for implementation tasks is failure |
| 5 | No artifact verification | Post-execution: collect `git diff --stat` + file list; include in verifier prompt as structured evidence |
| 7 | "PT 5.5" false-match | Regex tightened to avoid matching bare "pt" as "GPT" |

## Ambiguities

- None significant. HANDOFF.md provides precise file locations, root causes, and suggested fixes.
- The ORCHESTRATOR has read the full source files and confirmed issue locations.

## Routing Decision

- **Skip RESEARCH** — HANDOFF.md already provides deep root-cause analysis with file paths, code references, and run evidence. Research would be redundant.
- **Route directly to PLAN** then EXECUTE then VERIFY.

## Issue-to-File Mapping

| Issue | File(s) | Change Type |
|-------|---------|-------------|
| #1 | `src/shapes/plan-execute-verify.ts` | Modify `checkRequiredModelRouting()` — count by phase |
| #2 | `src/index.ts` | Modify `inferModelRoutingFromTask()` / `applyRoutingAlias()` — role-nearest wins |
| #3 | `src/shapes/plan-execute-verify.ts` | Modify `buildVerificationPrompt()` — add file-artifact check |
| #4 | `src/shapes/plan-execute-verify.ts` | Modify planner prompt — task-size cap + executor system prompt |
| #5 | `src/shapes/plan-execute-verify.ts` | Add post-execution metadata collection (git diff) |
| #7 | `src/index.ts` | Tighten GPT-5.5 regex |

## Ecological Notes

### Epistemic Map

- **Known:** Exact file paths, issue descriptions, root causes, suggested fixes from HANDOFF.md
- **Inferred:** The code structure matches what HANDOFF.md describes (verified by ORCHESTRATOR reading files)
- **Assumed:** No hidden dependencies that would break with these changes
- **Unknown:** Whether any tests exist that need updating

### Affordance Landscape

- `checkRequiredModelRouting()` is a single function — straightforward to modify
- `inferModelRoutingFromTask()` has a well-defined parsing pipeline — easy to reorder
- `buildVerificationPrompt()` is a prompt template — easy to extend
- Planner prompt construction is in `buildPlannerPrompt()` adjacent code
- Post-execution metadata can be a simple `bash("git diff --stat")` in the main loop

### Attractors and Failure Modes

- **Attractor:** Small, focused changes in 2 files (`src/shapes/plan-execute-verify.ts` and `src/index.ts`)
- **Failure mode 1:** Issue #1 fix changes routing counting but breaks `types.ts` interfaces
- **Failure mode 2:** Issue #2 fix changes alias application order and breaks other alias cases
- **Failure mode 3:** Verifier prompt becomes too long and exceeds subagent context
