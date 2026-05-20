# NenFlow v3 Context-Handoff Infrastructure Audit

Run: `RUN_20260512-163845`
Created: 2026-05-12

## Verdict

Current infrastructure is **not sufficient** to enforce the requested 40% subagent context handoff in active Pi NenFlow v3.

What exists today is mostly prompt-policy and artifact templates:

- Continuation template exists.
- Role skills instruct agents to self-estimate and emit continuation at ~65%.
- Validator can validate continuation frontmatter.
- Claude Code has hooks/statusline that can write `.nenflow_context_health.json`.

What is missing for the requested behavior:

- Active Pi NenFlow v3 has no enforcing extension; `~/.pi/agent/extensions/nenflow-v3.ts` is a no-op.
- Active Pi orchestrator skill does not include an explicit Route D continuation detection/resume loop.
- Current role skills use ~65%, not 40%.
- Context monitoring is self-estimated inside role prompts, not enforced by the orchestrator.
- No evidence of successful continuation artifacts in prior run directories.
- Validator does not enforce continuation body completeness.
- Claude Code `nenflow_v3.md` contains Route D, but active Pi `/nenflow_v3` uses `~/.pi/agent/skills/nenflow-v3/SKILL.md`, not the Claude command file.

## Evidence

### Active Pi entrypoint

`C:/Users/doner/.pi/agent/prompts/nenflow_v3.md`:

```md
Load and follow the global skill at `~/.pi/agent/skills/nenflow-v3/SKILL.md`.
```

`C:/Users/doner/.pi/agent/extensions/nenflow-v3.ts` is a no-op stub.

### Threshold mismatch

Static audit showed:

```text
pi_skill: mentions 40%=False, mentions 65%=False, Route D=False
exec_skill: mentions 40%=False, mentions 65%=True
planner_skill: mentions 40%=False, mentions 65%=True
verifier_skill: mentions 40%=False, mentions 65%=True
researcher_skill: mentions 40%=False, mentions 65%=True
claude_nenflow: mentions 40%=False, mentions 65%=True, Route D=True
```

### No continuation artifacts observed

```text
find ~/.pi/agent/nenflow-v3/runs -iname '*CONTINUATION*' | wc -l  -> 0
find C:/Users/doner/nenflow_v3/runs -iname '*CONTINUATION*' | wc -l -> 0
```

### Validator is too loose

A sample continuation artifact validates successfully:

```text
PASS: ATT_1_CONTINUATION_EXECUTOR.md validated as role=EXECUTOR artifact_type=CONTINUATION_CONTRACT
```

But `validator.js` only requires `artifact_type`, `role`, and `run_id` plus role/type matching. It does not enforce `Work Completed`, `Work Remaining`, `Critical Context`, or `Resume Instruction`.

### Claude Code context hook works in isolation

Tested `C:/Users/doner/.claude/hooks/nenflow-statusline.js` with fake context data:

```json
{
  "session_id": "test-session",
  "tokens_estimated": 120000,
  "context_max": 200000,
  "saturation_pct": 60,
  "health_band": "WARNING",
  "threshold_65_hit": false,
  "threshold_70_hit": false
}
```

This proves the Claude Code hook can write a health file, not that Pi subagents are automatically monitored.

## Implementation Plan Needed

1. Add/standardize configurable thresholds in NenFlow run config, including `handoff_pct: 40`.
2. Update all active Pi role skills to obey run-provided threshold, not hard-coded ~65%.
3. Add explicit Route D handling to `~/.pi/agent/skills/nenflow-v3/SKILL.md`.
4. Add a strict continuation validator (`validate-continuation.js`) checking required body sections and resume instructions.
5. Fix filename/path conventions: use `ATT_{n}_CONTINUATION_{ROLE}.md` consistently.
6. Add deterministic tests that simulate threshold crossing without needing huge context.
7. Optional hardening: implement a Pi extension/subagent wrapper that uses available streaming usage/RPC context data to detect subagent saturation and abort/route where possible.
