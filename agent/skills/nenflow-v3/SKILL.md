---
name: nenflow-v3
description: Run the NenFlow v3 orchestration loop visibly in the current Pi session. Use this when you want the current model to act as the ORCHESTRATOR, perform INTAKE itself, and delegate only RESEARCH, PLANNING, EXECUTION, or VERIFICATION to subagents.
---

# NenFlow v3 Orchestrator Skill

You are the **ORCHESTRATOR** for a NenFlow v3 loop.

Important operating mode:
- Stay in the **current visible Pi session**.
- Do **not** switch to hidden/background JSON orchestration.
- Do **not** spawn an INTAKE subagent.
- The ORCHESTRATOR performs **INTAKE itself** in the current context window.
- Use subagents only for:
  - `pev-researcher`
  - `pev-planner`
  - `pev-executor`
  - `pev-verifier`

## NenFlow Global Home

Use this global NenFlow runtime home:

- `~/.pi/agent/nenflow-v3/`

Key paths:
- Validator: `~/.pi/agent/nenflow-v3/validator.js`
- Context policy module: `~/.pi/agent/nenflow-v3/context-policy.js`
- Continuation template: `~/.pi/agent/nenflow-v3/templates/CONTINUATION.md`
- Runs dir: `~/.pi/agent/nenflow-v3/runs/`
- Per-run config: `~/.pi/agent/nenflow-v3/runs/{run_id}/RUN_CONFIG.json`
- Shared health file: `~/.pi/agent/nenflow-v3/.nenflow_context_health.json`

All run artifacts should be written under the global runs dir.

## Required Orchestration Shape

For every NenFlow run:

1. **ORCHESTRATOR INTAKE in current session**
   - analyse the raw task ecologically yourself
   - write `ATT_0_INTAKE.md` yourself
   - set frontmatter role to `ORCHESTRATOR`
   - decide `recommended_next_step`

2. **Optional RESEARCH**
   - if the intake recommends RESEARCH, call subagent `pev-researcher`
   - pass it the intake path, run id, `RUN_CONFIG.json`, configured `context_handoff_threshold_percent`, exact output path, and exact continuation path

3. **PLAN**
   - call subagent `pev-planner`
   - pass intake path, optional research path, run id, `RUN_CONFIG.json`, configured `context_handoff_threshold_percent`, exact output path, and exact continuation path

4. **EXECUTE**
   - call subagent `pev-executor`
   - pass intake path, active plan path, run id, `RUN_CONFIG.json`, configured `context_handoff_threshold_percent`, exact execution report path, exact verifier brief path, and exact continuation path

5. **VERIFY**
   - call subagent `pev-verifier`
   - pass intake path, plan path, verifier brief path, run id, `RUN_CONFIG.json`, configured `context_handoff_threshold_percent`, exact verification report path, and exact continuation path

6. **Retry policy**
   - if verification is FAIL, you may run one more execution+verification attempt
   - if retrying, pass the previous failure report path to the executor

## Ecological Intake Mode (Alternative INTAKE)

The Orchestrator supports an optional ecological spec-driven intake mode as an alternative to the standard ORCHESTRATOR INTAKE path.

### Trigger Detection

Ecological mode is triggered when the user's prompt contains keywords like:
- "ecological"
- "spec-driven ecology"
- "ecological intake"
- "deep spec"
- "/spec_driven_ecology"
- Explicit request for the 15-phase ecological process

If it is unclear whether the user wants ecological mode, the Orchestrator explicitly asks rather than auto-detecting from ambiguous prompts.

### Ecological Mode Behavior

1. **Do NOT perform INTAKE yourself.** Instead, spawn the `pev-intake-ecological` subagent.
2. Pass to the subagent: raw prompt, run id, `RUN_CONFIG.json` path, configured `context_handoff_threshold_percent`, exact `ATT_0_INTAKE.md` output path, and exact continuation path.
3. The subagent uses the `spec-driven-ecology` skill to guide the 15-phase ecological intake conversation.
4. The subagent produces `ATT_0_INTAKE.md` in NenFlow-compatible format with standard frontmatter enriched with ecological sections.

### After Ecological Intake

After `pev-intake-ecological` completes:
1. Read and validate the produced `ATT_0_INTAKE.md`.
2. Continue to RESEARCH (optional) or PLAN normally.
3. Route D-E (continuation, retry) operate as usual.

## Run Setup

When invoked:
- generate a new run id in the form `RUN_YYYYMMDD-HHMMSS`
- create `~/.pi/agent/nenflow-v3/runs/{run_id}/`
- parse the raw user prompt for a context handoff threshold using `~/.pi/agent/nenflow-v3/context-policy.js`
- write `~/.pi/agent/nenflow-v3/runs/{run_id}/RUN_CONFIG.json` before spawning any role subagent
- maintain/update `~/.pi/agent/nenflow-v3/.nenflow_context_health.json`

`RUN_CONFIG.json` schema:
```json
{
  "schema_version": 1,
  "run_id": "RUN_...",
  "context_handoff": {
    "handoff_threshold_percent": 40,
    "threshold_source": "user_prompt|intake|default",
    "warning_threshold_percent": 35,
    "hard_risk_threshold_percent": 45
  }
}
```

Threshold rules:
- Use an explicit user prompt percentage near words such as `context`, `handoff`, `threshold`, `saturation`, `window`, `past`, or `above` when valid.
- Accept any valid percentage where `0 < percent < 100`, including `65%`, `45%`, `35%`, `20%`, and `40%`.
- If no valid user threshold exists, use default `65%`.
- Persist the selected value in `RUN_CONFIG.json` and in INTAKE frontmatter; it is run contract data, not advice.

Minimum health file fields:
```json
{
  "run_id": "RUN_...",
  "phase": "INTAKE|RESEARCH|PLAN|EXECUTE|VERIFY|ERROR",
  "measured_at": "ISO-8601",
  "orchestrator_session": "current-visible-session"
}
```

## Artifact Rules

Use these file names:
- `ATT_0_INTAKE.md`
- `ATT_1_RESEARCH.md` only if research is used
- `ATT_1_PLAN.md` or `ATT_2_PLAN.md` depending on whether research exists
- `ATT_n_EXECUTION.md`
- `ATT_n_VERIFIER_BRIEF.md`
- `ATT_n_VERIFICATION.md`
- `LATEST_PLAN.md`
- `LATEST_RESEARCH.md`
- `LATEST_EXECUTION.md`
- `LATEST_VERIFIER_BRIEF.md`
- `LATEST_VERIFICATION.md`

## Validation

After each artifact is created, validate it with the validator when applicable.
Use:

```bash
node ~/.pi/agent/nenflow-v3/validator.js <artifact-path> <ROLE> [ARTIFACT_TYPE]
```

Examples:
```bash
node ~/.pi/agent/nenflow-v3/validator.js <plan> PLANNER PLAN
node ~/.pi/agent/nenflow-v3/validator.js <verification> VERIFIER VERIFICATION_REPORT
```

## INTAKE Format

The ORCHESTRATOR-written intake must include frontmatter like:

```yaml
---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_...
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---
```

Then include ecological sections covering:
- Task Summary
- Task Type
- User Intent
- Goal Attractor
- Constraints
- Invariants
- Success Criteria
- Ambiguities
- Routing Decision
- Clarification Questions only if needed

**Ecological INTAKE enrichment:** When ecological intake mode is used, `ATT_0_INTAKE.md` includes the standard sections above plus additional ecological supplements that the Planner, Executor, and Verifier can consume without format changes:
- Epistemic Map (Known / Inferred / Assumed / Unknown)
- Affordance Landscape
- Attractors and Failure Modes
- Perturbation Tests
- Representative Environment
- Falsifiers
- Human Gates

These supplements are additive — they enrich the specification without breaking compatibility with existing subagents.

## Subagent Invocation Pattern

Use the `subagent` tool to invoke the role agents. Use the project being worked on as the working directory when helpful, but keep artifact paths in the global NenFlow home.

Subagents to use:
- `pev-researcher`
- `pev-planner`
- `pev-executor`
- `pev-verifier`
- `pev-intake-ecological` (only for ecological intake mode)

Do not call `pev-intake`.

Every role-agent task MUST include:
- run id
- INTAKE path and any active upstream artifacts needed by that role
- `RUN_CONFIG.json` path
- configured `context_handoff_threshold_percent` and `threshold_source`
- exact normal output path(s)
- exact continuation path for this role and attempt, preferably `ATT_{stage}_CONTINUATION_{ROLE}_{attempt}.md`
- instruction to finish the current atomic unit, write the continuation contract, and stop if saturation reaches the configured threshold

If `RUN_CONFIG.json` is unreadable in an old run, instruct roles to fall back to the task-provided threshold or default `65%`.

## Route D — Context Handoff Continuation

Route D is triggered when a role subagent returns without the expected normal artifact but writes a `CONTINUATION_CONTRACT` in the current run directory.

After every `pev-researcher`, `pev-planner`, `pev-executor`, or `pev-verifier` subagent returns:
1. Check whether the expected normal artifact(s) exist.
2. If normal artifacts exist, validate them normally and continue the route.
3. If normal artifacts are absent, search the run directory for the expected role continuation contract. Accept both legacy `ATT_{stage}_CONTINUATION_{ROLE}.md` and canonical `ATT_{stage}_CONTINUATION_{ROLE}_{attempt}.md`; prefer the highest attempt suffix.
4. Strictly validate the contract before resuming:
   ```bash
   node ~/.pi/agent/nenflow-v3/validator.js <contract-path> <ROLE> CONTINUATION_CONTRACT
   ```
   The validator must reject incomplete, stale, mismatched, placeholder, wrong-path, or wrong-filename contracts.
5. Spawn a fresh same-role subagent with minimal context only:
   - run id
   - INTAKE path
   - active upstream artifacts needed by that role (research, plan, verifier brief, or failure report as applicable)
   - `RUN_CONFIG.json` path
   - validated continuation contract path
   - exact normal output path(s) still required
   - exact next continuation path with incremented attempt suffix
   - instruction to read the contract first, complete only `Work Remaining`, and preserve completed work unless rechecking is necessary
6. Repeat Route D for that same role until the normal artifact exists or five continuation attempts have occurred.
7. If validation fails, no continuation contract is found, or five attempts are exhausted, stop the route and write an evidence-rich planner handoff/escalation artifact instead of guessing.

Route D continuation prompt construction may use `buildContinuationResumePrompt()` from `~/.pi/agent/nenflow-v3/context-policy.js` for deterministic path and prompt assembly.

## Optional Stronger Enforcement

Active Pi NenFlow v3 remains a visible prompt-template + skill workflow. If role self-estimation proves insufficient, add a dedicated Pi extension/RPC runner behind an explicit feature flag rather than making the visible workflow depend on Claude Code hooks. The runner should monitor child context telemetry (`get_session_stats`/`contextUsage` or streamed usage when available), steer the child to write the semantic continuation contract at the configured threshold, and abort only after a grace interval or hard-risk threshold. Even with live telemetry, durable role-written continuation contracts remain required because aborting alone loses semantic work state.

## User-Facing Behavior

Because this is a visible orchestration skill:
- narrate the current phase briefly in the visible session
- show key decisions and next steps
- do not disappear into a hidden mode
- the current session is the orchestrator

## Completion

At the end:
- state the run id
- state PASS or FAIL
- point to the final verification file
