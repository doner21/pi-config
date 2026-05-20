---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260512-163845
context_saturation_estimate: "~22%"
---

# Test-Builder Execution Report

## Result

**FAIL — sandbox reliability tests executed and found an implementation defect.** Do not route this as passing verification.

## Sandbox Created

Root:
`C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/`

Created sandbox-only artifacts:
- `README.md`
- `run-tests.js`
- `fixtures/README.md` plus generated fixture subtrees during execution
- `tests/helpers.js`
- `tests/parser-config.test.js`
- `tests/validator-continuation.test.js`
- `tests/static-propagation.test.js`
- `tests/route-d-simulation.test.js`
- `tests/normal-flow-smoke.test.js`
- `results/stdout.txt`
- `results/stderr.txt`
- `results/exit-code.txt`
- `results/summary.json`

No implementation/product files were modified by this test-builder; tests read live implementation files and write only under the sandbox/results paths plus these required report artifacts.

## Single Rerunnable Command Executed

```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1 && node run-tests.js > results/stdout.txt 2> results/stderr.txt; code=$?; printf "%s\n" "$code" > results/exit-code.txt; exit "$code"
```

Observed exit code: `1` from `results/exit-code.txt`.

## Coverage Outcome

- Threshold values `65, 45, 35, 20, 40` parse/propagate: **PASS**.
- Invalid/unrelated values reject or default safely: **FAIL** for negative value `context threshold -4%`, parsed as `4` instead of default/reject.
- `RUN_CONFIG.json` read/write/default behavior: **PASS**.
- Continuation validator complete-valid accept and missing/placeholder/mismatch/bad path/name/invalid percentage/stale/future rejects: **PASS**.
- Active Pi orchestrator has Route D plus `RUN_CONFIG.json` and `context_handoff_threshold_percent`: **PASS**.
- Role skills no longer rely on `At ~65% self-estimated saturation` and contain configured-threshold/continuation-path instructions: **PASS**.
- Route D simulation finds valid continuation and builds same-role minimal prompt with exact next paths: **PASS**.
- Existing validator smoke for representative PLAN, EXECUTION_REPORT, VERIFICATION_REPORT: **PASS**.

## Failure Evidence

From `results/stderr.txt`:

```text
FAIL parser-config.test.js :: invalid and unrelated percentages reject or default safely (1ms)
AssertionError [ERR_ASSERTION]: context threshold -4%

4 !== 65
```

From `results/summary.json`: total `13`, passed `12`, failed `1`.

## Routing Recommendation

Route back to planner/executor for a targeted fix to threshold parsing invalid-value handling. The likely affected live implementation file is:
`C:/Users/doner/.pi/agent/nenflow-v3/context-policy.js`.
