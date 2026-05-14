---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260512-163845
clarification_needed: false
recommended_next_step: RESEARCH → PLAN → EXECUTE → VERIFY
context_saturation_estimate: "~12%"
created_at: "2026-05-12"
project_path: "C:/Users/doner/local_model_reaserch"
primary_scope:
  - "C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md"
  - "C:/Users/doner/.pi/agent/skills/nenflow-pev-*/SKILL.md"
  - "C:/Users/doner/.pi/agent/nenflow-v3/"
  - "C:/Users/doner/.pi/agent/agents/pev-*.json"
  - "C:/Users/doner/.claude/commands/nenflow_v3.md"
  - "C:/Users/doner/.claude/hooks/"
---

# Intake: NenFlow v3 Context-Health Handoff Infrastructure Audit and Hardening

## Raw User Prompt

> We just finished running some stuff to do with Gemma4. One of my prompts instructed the orchestrator to track the context health of the execution agent. If the execution agent goes past 40% of its context window, it needs to begin creating a handoff.md of what needs to still be finished. The orchestrator ensures that handoff goes to the proper handoff/contracts folder or run, then opens a new agent and feeds it that handoff to continue working. This completely failed: the execution agent completed the work but ran out of context while doing it, which is what I wanted to avoid. Check whether we have the infrastructure to do this with the current NenFlow_v3 orchestration file. Verify whether the orchestrator can check subagent context health; whether it can stop an executor/current agent or instruct it to create a handoff; whether that handoff can be stored in the run/contracts folder; and whether the orchestrator can spawn a fresh sub-agent to continue. If the infrastructure does not exist, create a plan to implement it. Make sure it is not brittle and has hooks, validation policies, and tests. Turn this prompt into an intake.md defining constraints, invariants, tasks, goals, attractors, and intents. Ensure tests can be run to verify whether this is already implemented.

## Task Summary

Audit and harden NenFlow v3 context-rot prevention so long-running subagents cannot silently exhaust context. Determine what exists today, prove gaps with runnable tests, and plan/implement a non-brittle handoff mechanism if needed.

## Task Type

- Meta-system / orchestration infrastructure
- Pi/NenFlow v3 workflow hardening
- Context health telemetry, continuation contracts, validation, and test harness design

## User Intent

The user wants to experiment with orchestration techniques on the fly, but with a reliable substrate that enforces safe context handoffs instead of relying on fragile prompt-only instructions.

## Goal Attractor

A NenFlow v3 run can safely survive long executor/planner/researcher/verifier work:

1. Context health is measurable or conservatively approximated.
2. A role agent crosses a user-configurable threshold supplied per run or prompt — e.g. 65%, 45%, 35%, 20%, 40%, or any other explicit percentage the user chooses.
3. The agent is forced or strongly guarded to stop after an atomic unit.
4. A structured continuation/handoff contract is written into the correct run directory.
5. The orchestrator detects and validates the contract.
6. A fresh role-compatible subagent is spawned with the contract.
7. The workflow resumes without losing state or continuing in a rotten context.
8. Tests can prove each mechanism rather than assuming prompts will be obeyed.

## Current Evidence / Initial Diagnostic Findings

These findings were gathered before writing this intake and should be independently rechecked during RESEARCH/VERIFY:

- `C:/Users/doner/.pi/agent/prompts/nenflow_v3.md` loads `~/.pi/agent/skills/nenflow-v3/SKILL.md`; the active Pi NenFlow v3 path is skill/prompt-template based, not a real enforcing extension.
- `C:/Users/doner/.pi/agent/extensions/nenflow-v3.ts` is intentionally a no-op.
- Pi has a documented context API: `ctx.getContextUsage()` in extensions and RPC `get_session_stats` with `contextUsage.percent`, but no active NenFlow Pi extension appears to use it for enforcement.
- The Pi subagent example captures per-agent usage after streamed assistant messages, including `usage.contextTokens`, but it does not implement a proactive threshold stop/handoff loop.
- The role skills (`nenflow-pev-executor`, planner, verifier, researcher) currently use self-estimated context checks and a `~65%` threshold, not the requested 40% threshold.
- `~/.pi/agent/skills/nenflow-v3/SKILL.md` defines run setup and artifact names, but does not explicitly define a Route D continuation-detection loop equivalent to the older Claude command file.
- `C:/Users/doner/.claude/commands/nenflow_v3.md` does define Route D and context-health file reading, but it is for Claude Code command usage, not the active Pi prompt-template flow. It also references `ATT_{n}CONTINUATION{role}.md`, while role skills write `ATT_{n}_CONTINUATION_ROLE.md`.
- `~/.pi/agent/nenflow-v3/templates/CONTINUATION.md` exists.
- `~/.pi/agent/nenflow-v3/validator.js` validates frontmatter and artifact type only; it does not enforce continuation body sections, work remaining, resume instructions, or freshness.
- Existing run directories under both `~/.pi/agent/nenflow-v3/runs/` and `C:/Users/doner/nenflow_v3/runs/` currently contain zero `*CONTINUATION*` artifacts, so there is no evidence the continuation path has been exercised successfully.
- Claude Code hooks exist (`context_health.py`, `nenflow-statusline.js`) and can write `.nenflow_context_health.json`, but this is not the same as an active Pi subagent enforcement mechanism.

## Constraints

1. Do not assume prompt instructions alone are sufficient for enforcement.
2. Do not require the user to manually monitor context health during long runs.
3. Do not depend on stale `.nenflow_context_health.json` files from old sessions.
4. Do not conflate Claude Code hooks/commands with Pi prompt-template/skill behavior; treat them as separate runtimes unless bridged deliberately.
5. Preserve existing NenFlow v3 artifact compatibility where possible: `ATT_n_*`, `LATEST_*`, run directory under `~/.pi/agent/nenflow-v3/runs/{run_id}/`.
6. Keep handoff contracts durable and readable markdown, not hidden in transient process state.
7. Support role-specific continuation for at least EXECUTOR; ideally all roles: RESEARCHER, PLANNER, EXECUTOR, VERIFIER, ORCHESTRATOR.
8. Context handoff threshold must be user-configurable per run/prompt and must accept arbitrary explicit percentages such as 65%, 45%, 35%, 20%, or 40%; no threshold may be hard-coded as the only supported behavior.
9. If the user specifies a threshold in the prompt, that threshold is authoritative for that run unless it is invalid or unsafe to parse.
10. Fresh subagent continuation must receive only necessary context: intake path, plan/research/brief as applicable, continuation contract path, run id, and exact output paths.
10. No large irreversible refactor unless RESEARCH shows a smaller robust path is impossible.

## Invariants

1. A role agent must never leave files half-written when stopping for continuation; it must finish the current atomic unit first.
2. A continuation contract must include: work completed, work remaining, critical context, exact resume instruction, role, run id, continuation source, and saturation measurement/estimate.
3. The orchestrator must validate continuation contracts before spawning a replacement agent.
4. A continuation event must be visible in the run directory and not only in chat text.
5. The orchestrator must not continue routing based on stale health telemetry.
6. The handoff mechanism must work even when live exact subagent context telemetry is unavailable; conservative self-check/fallback must still be enforced through tests and contract validation.
7. User-specified context thresholds are run contract data, not advice; they must be written into the intake/run config and carried into planner/executor/verifier prompts.
8. The Verifier must independently inspect artifacts and run tests; it must not accept the Executor's narrative as proof.
9. Existing successful PEV paths must not regress: PLAN → EXECUTE → VERIFY should still work when no continuation is triggered.

## Core Questions to Answer

1. Can the active Pi orchestrator directly check a subagent's live context health while the subagent is running?
2. If yes, through what API/tool details/events can it do so, and can it interrupt or steer that subagent?
3. If no, what is the closest reliable alternative: role self-estimation, subagent streaming usage, watchdog extension, RPC subprocess wrapper, or forced task chunking?
4. Can the orchestrator stop/abort a subagent and preserve useful state, or must the subagent produce the handoff itself before stopping?
5. Where should continuation contracts live: global run dir, project-local run dir, `contracts/`, or both?
6. What validator should enforce continuation contract completeness?
7. What tests can deterministically simulate threshold crossing without actually filling 40% of a 200k context window?
8. Which NenFlow file is canonical for Pi: `~/.pi/agent/skills/nenflow-v3/SKILL.md`, `~/.claude/commands/nenflow_v3.md`, or another file?

## Tasks

### Task 1 — Canonical Runtime Mapping

Map the active runtime paths for:
- Pi prompt template `/nenflow_v3`
- Pi skill `nenflow-v3`
- Pi PEV role agents and role skills
- global run directory and templates
- Claude Code command/hooks path, noting what is active only in Claude Code

### Task 2 — Capability Audit

Determine and document whether current infrastructure supports:
- live orchestrator visibility into subagent context health
- subagent self-reporting of context health
- proactive threshold detection at 40%
- automatic continuation contract creation
- continuation artifact detection by the orchestrator
- validation of continuation contracts
- spawning a fresh role-compatible continuation subagent
- tests for all above behaviors

### Task 3 — Gap Analysis

Classify every gap as:
- missing telemetry
- prompt-only policy without enforcement
- missing orchestrator route logic
- missing validator/policy
- filename/path mismatch
- stale-runtime split between Claude Code and Pi
- test coverage missing

### Task 4 — Implementation Plan if Needed

If gaps exist, create a plan for a robust implementation. Prefer a layered design:

1. Configurable thresholds (`warning`, `handoff`, `hard_risk`) stored in run config/manifest, with `handoff` accepting any explicit user-specified percentage such as 65, 45, 35, 20, or 40.
2. Threshold parsing rules: detect percentages from the user prompt/intake, persist the chosen threshold in the run contract, reject invalid values, and pass the chosen value to every subagent.
3. Continuation contract schema and strict validator.
4. Role-skill updates to use the configured threshold when specified, not hard-coded 65% or hard-coded 40%.
5. Orchestrator Route D in the active Pi skill: detect, validate, spawn replacement, resume.
6. Optional Pi extension/wrapper if live context telemetry from subagents is needed.
7. Test fixtures and deterministic threshold simulation.

### Task 5 — Tests / Verification Harness

Create or identify tests that can be run locally to prove current behavior and future fixes:

- Static grep/assertion test for threshold values and Route D presence.
- Validator tests for valid/invalid continuation contracts.
- Simulated role-agent continuation artifact test.
- Threshold-parameter tests proving 65%, 45%, 35%, 20%, and 40% are accepted and propagated instead of a hard-coded value.
- Orchestrator continuation detection test.
- Fresh-agent resume prompt construction test.
- Stale health-file rejection test.
- Optional integration test using a small subagent instructed to trigger a fake low threshold.

## Success Criteria

1. `intake.md` exists and captures the user's orchestration failure, goals, constraints, invariants, tasks, and test intent.
2. A diagnostic report or research artifact clearly states whether the existing system can enforce 40% subagent context handoff today.
3. The active Pi NenFlow v3 runtime path is identified unambiguously.
4. Tests can be run to prove at least:
   - current threshold is not flexible/user-configurable where applicable,
   - arbitrary requested thresholds such as 65%, 45%, 35%, 20%, and 40% are parsed and propagated after implementation,
   - active Pi skill lacks or contains Route D continuation handling,
   - validator accepts/rejects continuation artifacts appropriately,
   - existing runs do or do not contain continuation artifacts.
5. If infrastructure is missing, a concrete implementation plan is produced with exact files to change and validation strategy.
6. No claim of support is made without direct file/code evidence or a runnable test.

## Ambiguities / Assumptions

- Ambiguity: The user referred to `NenFlow_v3`; active Pi uses `~/.pi/agent/skills/nenflow-v3/SKILL.md`, while Claude Code has `~/.claude/commands/nenflow_v3.md`. Assumption: both should be audited, but Pi skill/prompt path is primary for this session.
- Ambiguity: The phrase "40% of context health" could mean 40% used or 40% remaining. Assumption: it means 40% used/saturation, because the prior prompt said "go above 40% of context window".
- Ambiguity: "handoff contracts folder or run" may refer to legacy `contracts/` or NenFlow run dir. Assumption: canonical destination should be the run dir, with optional `contracts/` alias only if legacy tooling requires it.

## Routing Decision

Proceed with RESEARCH → PLAN → EXECUTE → VERIFY.

Reason: this is an orchestration-infrastructure audit with multiple runtimes and possible implementation. Research is required before changing files because the failure may come from runtime mismatch, missing hooks, prompt-only policy, or validator gaps.

## Initial Test Commands Already Run / To Re-run

```bash
# Active graph context was read first:
read graphify-out/GRAPH_REPORT.md

# Static audit of active files and thresholds:
python - <<'PY'
from pathlib import Path
paths = [
  Path(r'C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md'),
  Path(r'C:/Users/doner/.pi/agent/skills/nenflow-pev-executor/SKILL.md'),
  Path(r'C:/Users/doner/.claude/commands/nenflow_v3.md'),
]
for p in paths:
    txt = p.read_text(encoding='utf-8')
    print(p, '40%', '40%' in txt, '65%', '65%' in txt, 'Route D', 'Route D' in txt)
PY

# Count continuation artifacts:
find C:/Users/doner/.pi/agent/nenflow-v3/runs -maxdepth 3 -type f -iname '*CONTINUATION*' | wc -l
find C:/Users/doner/nenflow_v3/runs -maxdepth 3 -type f -iname '*CONTINUATION*' | wc -l

# Validate a sample continuation contract:
node C:/Users/doner/.pi/agent/nenflow-v3/validator.js <sample-continuation.md> EXECUTOR CONTINUATION_CONTRACT

# Test Claude Code context-health hook in isolation:
printf '{"session_id":"test","context_window":{"remaining_percentage":50},"model":{"display_name":"Test"},"workspace":{"current_dir":"/tmp"}}' \
  | node C:/Users/doner/.claude/hooks/nenflow-statusline.js
```
