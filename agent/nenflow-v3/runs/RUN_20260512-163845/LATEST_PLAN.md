---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260512-163845
context_saturation_estimate: "~14%"
---

# Retry Plan Attempt 2: Safe Threshold Parsing

## Task Statement
Fix the isolated attempt-1 defect: `context threshold -4%` is parsed as `4` instead of being rejected/defaulting safely. Do not replan or refactor the NenFlow v3 handoff architecture; preserve the 12 passing sandbox behaviors.

## Invariants
- Valid explicit context thresholds `65%`, `45%`, `35%`, `20%`, and `40%` must still parse and propagate.
- Invalid/signed/malformed threshold text must default to `65` with `threshold_source: "default"` unless another separate valid threshold is present.
- Route D, role-skill propagation, continuation validation, and normal artifact validation must not regress.
- Continuation validation must still accept saturation estimates such as `context_saturation_estimate: "~41%"`.
- Test-builder attempt 2 provides independent proof; executor prechecks are not final verification.

## Expected Parsing Behavior
- Accept only unsigned numeric threshold percentages with `%`, near context/handoff keywords, and `0 < n < 100`.
- Reject/default negative values: `-4%`, `- 4%`, `-40%`.
- Reject/default signed positives: `+4%`, `+ 40%`.
- Reject/default out-of-range: `0%`, `100%`, `101%`.
- Reject/default malformed tokens: `4%%`, `4.5.6%`, `%40`, `abc4%`, `4%abc`, `--4%`, `++4%`, empty/unrelated text.
- For frontmatter/config numeric fields, accept clean `40`, `40%`, and existing estimate form `~41%`; reject signed, negative, embedded, or malformed strings.

## Files / Functions to Inspect and Change
1. `C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js`
   - `parseContextThreshold(text)`: fix the token matcher so signed values are rejected as whole tokens, not partially matched as digits.
   - `parsePercentValue(raw)`: stop extracting digit substrings from arbitrary strings; require a clean whole-field unsigned percent/number, with optional leading `~` only to preserve estimate parsing.
   - `thresholdFromIntakeFrontmatter(intakeText)` and `buildContextPolicy(...)`: confirm they now default safely for invalid values.
2. `C:/Users/doner/.pi/agent/nenflow-v3/tests/context-policy.test.js`
   - Add focused assertions for negative, signed positive, and malformed threshold values.
3. Inspect `C:/Users/doner/.pi/agent/nenflow-v3/validator.js` only if the parser change breaks continuation validation. Avoid validator changes unless necessary.
4. Do not edit sandbox attempt-1 tests except to rerun them as a precheck. The test-builder will create/recreate attempt-2 sandbox tests.

## Implementation Steps
1. Reproduce the defect before editing with:
   ```bash
   node - <<'JS'
   const p=require('C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js');
   console.log(p.buildContextPolicy('context threshold -4%', ''));
   JS
   ```
2. Patch `parseContextThreshold` using token-aware parsing that detects optional `+`/`-` signs and rejects signed tokens. Avoid a brittle fix that merely changes one lookbehind while still allowing `- 4%` or `+40%`.
3. Patch `parsePercentValue` so the entire trimmed input must match a clean percent value; do not allow substring extraction from `abc4`, `4abc`, `-4`, or `+4`.
4. Add/extend product tests for accepted `[65,45,35,20,40]` and rejected/default cases: `-4%`, `- 4%`, `+4%`, `+ 40%`, `0%`, `100%`, `101%`, `4%%`, `4.5.6%`, `%40`, `abc4%`, `4%abc`, unrelated `40%`.
5. Confirm continuation validation still passes for a contract with `context_saturation_estimate: "~41%"`.

## Focused Checks Before Test-Builder
Retry executor must run and capture output:

```bash
node -c C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js
node -c C:/Users/doner/.pi/agent/nenflow-v3/validator.js
node --test C:/Users/doner/.pi/agent/nenflow-v3/tests/*.test.js
```

```bash
node - <<'JS'
const assert=require('node:assert/strict');
const p=require('C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js');
for (const n of [65,45,35,20,40]) assert.equal(p.buildContextPolicy(`context handoff threshold ${n}%`,'').handoff_threshold_percent,n);
for (const raw of ['context threshold -4%','context threshold - 4%','context threshold +4%','context threshold + 40%','context threshold 0%','context threshold 100%','context threshold 101%','context threshold 4%%','context threshold 4.5.6%','context threshold %40','context threshold abc4%','context threshold 4%abc','marketing conversion is 40% this week']) {
  const got=p.buildContextPolicy(raw,'');
  assert.equal(got.handoff_threshold_percent,65,raw);
  assert.equal(got.threshold_source,'default',raw);
}
console.log('PASS focused signed/malformed threshold smoke');
JS
```

```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1 && node run-tests.js > results/stdout-attempt2-precheck.txt 2> results/stderr-attempt2-precheck.txt; code=$?; printf "%s\n" "$code" > results/exit-code-attempt2-precheck.txt; exit "$code"
```

## Attempt-2 Test-Builder Instruction
After executor prechecks pass, the independent test-builder must re-run or recreate sandbox tests under `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2/`. It should include the original 13 coverage checks plus explicit negative/signed/malformed threshold cases, then write durable stdout/stderr/exit-code/summary evidence and attempt-2 evidence artifacts.

## Pass / Fail Routing Notes
- Executor precheck failure: write a new planner handoff with exact command output; do not proceed to final verification.
- Executor prechecks pass: route to independent attempt-2 test-builder; do not declare success yet.
- Attempt-2 sandbox pass with sufficient evidence: route to final verification per `ATT_3_RUN_PLAN.md`.
- Attempt-2 sandbox fail: follow bounded retry routing in `ATT_3_RUN_PLAN.md` with failure class and raw evidence.

## Handoff Notes
Root cause is isolated to `context-policy.js`: current regex/digit extraction allows `-4%` to become `4`. Keep the fix narrow and preserve all passing attempt-1 behavior.
