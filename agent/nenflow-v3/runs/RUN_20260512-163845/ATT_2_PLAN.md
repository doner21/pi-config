---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260512-163845
context_saturation_estimate: "~31%"
---

# Plan: Configurable NenFlow v3 Context Handoffs

## Task Statement
Implement run-level, user-configurable context handoff thresholds for active Pi NenFlow v3 subagents. The active Pi orchestrator must persist the threshold, pass it to all role agents, detect strict continuation contracts, resume Route D with a fresh same-role agent, and prove behavior with deterministic simulations.

## Invariants
- Accept arbitrary valid explicit percentages, including `65%`, `45%`, `35%`, `20%`, `40%`; `65%` is only a default fallback.
- Canonical active runtime: `C:/Users/doner/.pi/agent/prompts/nenflow_v3.md` -> `C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md` -> `C:/Users/doner/.pi/agent/agents/pev-*.json` + role skills.
- Continuation contracts are durable markdown under `C:/Users/doner/.pi/agent/nenflow-v3/runs/{run_id}/` and must validate before resume.
- A role agent finishes the current atomic unit before stopping; normal output files must not be half-written.
- Existing non-continuation PEV artifacts and old runs remain compatible.
- Claude Code hooks/commands are compatibility-only; Pi must not depend on them.

## Success Criteria
1. Prompt/intake parsing chooses and persists configured thresholds such as `65/45/35/20/40`.
2. New runs write `RUN_CONFIG.json` and intake frontmatter fields for threshold percent/source.
3. Researcher, Planner, Executor, and Verifier receive the configured threshold and exact continuation output path.
4. Role skills stop at configured `context_handoff_threshold_percent`, not hard-coded `~65%`.
5. Active Pi `nenflow-v3` skill has Route D: detect, strictly validate, spawn fresh same-role continuation, resume.
6. `validator.js` rejects incomplete, stale, mismatched, or placeholder continuation contracts.
7. Tests simulate thresholds and Route D without filling real context.
8. Optional extension/RPC enforcement is documented behind a flag/tool if prompt-level self-estimation remains weak.

## Implementation Steps
1. **Shared policy module**: create `C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js` exporting `DEFAULT_HANDOFF_THRESHOLD_PERCENT=65`, `parseContextThreshold(text)`, `buildContextPolicy(rawPrompt,intakeText)`, `readRunConfig`, `writeRunConfig`, `validateRunConfig`, `buildContinuationPath`, `findContinuation`, `buildContinuationResumePrompt`, and `validateContinuationContract`. Accept `0 < percent < 100`, preferring percentages near `context|handoff|threshold|saturation|window|past|above`.

2. **Run config persistence**: update `C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md` Run Setup/INTAKE rules to parse the raw prompt, then write `C:/Users/doner/.pi/agent/nenflow-v3/runs/{run_id}/RUN_CONFIG.json`:
   `{"schema_version":1,"run_id":"RUN_...","context_handoff":{"handoff_threshold_percent":40,"threshold_source":"user_prompt|intake|default","warning_threshold_percent":35,"hard_risk_threshold_percent":45}}`.
   Add intake frontmatter `context_handoff_threshold_percent` and `context_handoff_threshold_source`. Missing config in old runs means default 65.

3. **Subagent propagation**: update `C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md` so every `pev-researcher|planner|executor|verifier` task includes: run config path, configured threshold `X%`, exact continuation path `ATT_{stage}_CONTINUATION_{ROLE}_{attempt}.md`, and fallback rule if config is unreadable. Use same propagation for continuation agents with incremented attempt suffix.

4. **Role skill updates**: edit `C:/Users/doner/.pi/agent/skills/nenflow-pev-researcher/SKILL.md`, `...planner/SKILL.md`, `...executor/SKILL.md`, and `...verifier/SKILL.md`. Replace `At ~65% self-estimated saturation` / `Protocol when you reach 65%` with configured threshold language. Require reading `RUN_CONFIG.json`, printing threshold status, using the task-provided continuation path, and adding `context_handoff_threshold_percent`, `threshold_source`, `measured_at` to continuation frontmatter.

5. **Strict continuation validation**: update `C:/Users/doner/.pi/agent/nenflow-v3/templates/CONTINUATION.md` and `validator.js`. For `CONTINUATION_CONTRACT`, require role in `RESEARCHER|PLANNER|EXECUTOR|VERIFIER|ORCHESTRATOR`, `continuation_from == role`, matching `run_id`, path inside run dir, filename `ATT_\d+_CONTINUATION_{ROLE}(_\d+)?\.md`, valid threshold/saturation percentages, and non-empty non-placeholder `Work Completed`, `Work Remaining`, `Critical Context`, `Resume Instruction` mentioning role/run/contract/remaining work. Preserve existing validation for other artifact types.

6. **Active Pi Route D**: add `## Route D — Context Handoff Continuation` to `C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md`. After each role subagent returns: validate expected normal artifact; if absent, search current stage/role continuation; validate via `node ~/.pi/agent/nenflow-v3/validator.js <contract> <ROLE> CONTINUATION_CONTRACT`; spawn same `pev-*` role with minimal context (intake, active research/plan/brief, `RUN_CONFIG.json`, contract path, exact normal output path, next continuation path); loop until normal output exists or max continuations (e.g. 5), then escalate. Accept legacy `ATT_{n}_CONTINUATION_{ROLE}.md`; canonical new form uses attempt suffix.

7. **Migration/compatibility**: keep `RUN_CONFIG.json` optional. Update `C:/Users/doner/.claude/commands/nenflow_v3.md` only to align wording/filenames and configurable thresholds. Optionally update `C:/Users/doner/.claude/hooks/context_health.py` and `nenflow-statusline.js` to read `NENFLOW_HANDOFF_THRESHOLD_PERCENT` or run config, but do not make Pi depend on Claude hooks. Keep `C:/Users/doner/.pi/agent/extensions/nenflow-v3.ts` no-op unless optional enforcement is selected.

8. **Tests**: create `C:/Users/doner/.pi/agent/nenflow-v3/tests/context-policy.test.js` using Node `node:test`. Cover parser values `[65,45,35,20,40]`, invalid `0/100/unrelated`, config write/read, generated role prompt propagation, valid continuation pass, malformed continuation fail, stale role/run/path fail, and Route D resume prompt simulation. Add static assertions that role skills no longer contain `At ~65% self-estimated saturation` and orchestrator contains `Route D`, `RUN_CONFIG.json`, `context_handoff_threshold_percent`.

9. **Optional stronger enforcement**: if self-estimation is insufficient, either enhance `C:/Users/doner/.pi/agent/extensions/subagent.ts` to collect child JSON `message_end` usage/context tokens, or add `C:/Users/doner/.pi/agent/extensions/nenflow-role-runner.ts` using `pi --mode rpc`, `get_session_stats`, `steer` at threshold, and `abort` after grace/hard-risk. Semantic work state should still be captured by role-written contracts.

## Verification Commands
```bash
node C:/Users/doner/.pi/agent/nenflow-v3/validator.js C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/ATT_2_PLAN.md PLANNER PLAN
node --test C:/Users/doner/.pi/agent/nenflow-v3/tests/*.test.js
python - <<'PY'
from pathlib import Path
root=Path(r'C:/Users/doner/.pi/agent')
for p in (root/'skills').glob('nenflow-pev-*/SKILL.md'):
    if p.parent.name=='nenflow-pev-intake': continue
    txt=p.read_text(encoding='utf-8')
    assert 'At ~65% self-estimated saturation' not in txt, p
    assert 'context_handoff_threshold_percent' in txt, p
orch=(root/'skills/nenflow-v3/SKILL.md').read_text(encoding='utf-8')
assert 'Route D' in orch and 'RUN_CONFIG.json' in orch and 'context_handoff_threshold_percent' in orch
print('PASS static configurable-threshold checks')
PY
node - <<'JS'
const p=require('C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js');
for (const n of [65,45,35,20,40]) if (p.buildContextPolicy(`handoff threshold ${n}%`,'').handoff_threshold_percent!==n) throw Error(n);
console.log('PASS threshold parser smoke');
JS
```

## Handoff Notes
Evidence read: active Pi skill has no Route D; `extensions/nenflow-v3.ts` is no-op; `subagent.ts` does not enforce thresholds; all role skills hard-code 65%; `validator.js` only checks basic frontmatter. Pi docs expose `ctx.getContextUsage()`, `ctx.abort()`, and RPC `get_session_stats` for optional stronger enforcement.
