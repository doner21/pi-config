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
- Continuation template: `~/.pi/agent/nenflow-v3/templates/CONTINUATION.md`
- Runs dir: `~/.pi/agent/nenflow-v3/runs/`
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
   - pass it the intake path and exact output path

3. **PLAN**
   - call subagent `pev-planner`
   - pass intake path, optional research path, run id, and exact output path

4. **EXECUTE**
   - call subagent `pev-executor`
   - pass intake path, active plan path, run id, exact execution report path, and exact verifier brief path

5. **VERIFY**
   - call subagent `pev-verifier`
   - pass intake path, plan path, verifier brief path, run id, and exact verification report path

6. **Retry policy**
   - if verification is FAIL, you may run one more execution+verification attempt
   - if retrying, pass the previous failure report path to the executor

## Run Setup

When invoked:
- generate a new run id in the form `RUN_YYYYMMDD-HHMMSS`
- create `~/.pi/agent/nenflow-v3/runs/{run_id}/`
- maintain/update `~/.pi/agent/nenflow-v3/.nenflow_context_health.json`

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

## Subagent Invocation Pattern

Use the `subagent` tool to invoke the role agents. Use the project being worked on as the working directory when helpful, but keep artifact paths in the global NenFlow home.

Subagents to use:
- `pev-researcher`
- `pev-planner`
- `pev-executor`
- `pev-verifier`

Do not call `pev-intake`.

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
