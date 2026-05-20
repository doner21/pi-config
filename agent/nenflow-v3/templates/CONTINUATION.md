---
artifact_type: CONTINUATION_CONTRACT
role: [PLANNER|EXECUTOR|VERIFIER|RESEARCHER|ORCHESTRATOR]
run_id: [RUN_YYYYMMDD-HHMMSS]
continuation_from: [PLANNER|EXECUTOR|VERIFIER|RESEARCHER|ORCHESTRATOR]
context_saturation_estimate: "~65%"
context_handoff_threshold_percent: 65
threshold_source: [user_prompt|intake|default]
measured_at: [ISO-8601 timestamp]
---

# ATT_[n] — CONTINUATION CONTRACT

## Work Completed
- Replace this with concrete completed work and evidence.

## Work Remaining
- Replace this with concrete remaining work.

## Critical Context
- Replace this with key constraints, file paths, findings, failures, command outputs, or decisions.

## Resume Instruction
Fresh [ROLE] continuation for run [RUN_ID]: read this continuation contract at [CONTRACT_PATH], read RUN_CONFIG.json, then complete only the remaining work and write the normal role output to the exact requested path. If context again reaches context_handoff_threshold_percent, finish the current atomic unit and write the next continuation contract to the exact configured path.
