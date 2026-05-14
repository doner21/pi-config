---
artifact_type: TEST_EVIDENCE
role: EXECUTOR
run_id: RUN_20260512-163845
context_saturation_estimate: "~22%"
---

# Test Evidence

## Command and Raw Results

Rerunnable command:

```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1 && node run-tests.js > results/stdout.txt 2> results/stderr.txt; code=$?; printf "%s\n" "$code" > results/exit-code.txt; exit "$code"
```

Raw evidence files:
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/results/stdout.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/results/stderr.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/results/exit-code.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1/results/summary.json`

Observed `results/exit-code.txt`:

```text
1
```

## Stdout Summary

```text
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative PLAN artifact
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative EXECUTION_REPORT artifact
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative VERIFICATION_REPORT artifact
PASS parser-config.test.js :: thresholds 65,45,35,20,40 parse and propagate into RUN_CONFIG shape
PASS parser-config.test.js :: RUN_CONFIG read/write/default behavior and invalid config rejection
PASS route-d-simulation.test.js :: Route D simulation finds valid continuation when normal artifact is missing
PASS route-d-simulation.test.js :: Route D builds same-role minimal continuation prompt with exact current and next paths
PASS static-propagation.test.js :: active Pi orchestrator skill includes Route D, RUN_CONFIG, threshold propagation, and resume helper
PASS static-propagation.test.js :: role skills use configured threshold and exact continuation path instead of hard-coded At ~65% language
PASS validator-continuation.test.js :: continuation validator accepts complete valid contract through policy and CLI
PASS validator-continuation.test.js :: continuation validator rejects missing sections and placeholders
PASS validator-continuation.test.js :: continuation validator rejects role/run mismatch, bad name/path, invalid percentages, and stale/future cases
[sandbox-test-builder] summary total=13 passed=12 failed=1
```

## Stderr Failure

```text
FAIL parser-config.test.js :: invalid and unrelated percentages reject or default safely (1ms)
AssertionError [ERR_ASSERTION]: context threshold -4%

4 !== 65

    at Object.fn (.../tests/parser-config.test.js:31:16)
```

## Required Coverage Mapping

| Required coverage | Test file | Result |
|---|---|---|
| Thresholds `65,45,35,20,40` parse/propagate | `tests/parser-config.test.js` | PASS |
| Invalid/unrelated values reject/default safely | `tests/parser-config.test.js` | **FAIL**: `context threshold -4%` becomes `4` |
| `RUN_CONFIG.json` read/write/default behavior | `tests/parser-config.test.js` | PASS |
| Complete continuation accepted | `tests/validator-continuation.test.js` | PASS |
| Missing sections/placeholders rejected | `tests/validator-continuation.test.js` | PASS |
| Role/run mismatch, bad path/name, invalid percentages, stale/future rejected | `tests/validator-continuation.test.js` | PASS |
| Active Pi orchestrator Route D + config/threshold propagation | `tests/static-propagation.test.js` | PASS |
| Role-skill configured threshold/continuation-path instructions and no old hard-coded phrase | `tests/static-propagation.test.js` | PASS |
| Route D simulated missing normal artifact and same-role resume prompt | `tests/route-d-simulation.test.js` | PASS |
| Normal validator smoke for PLAN, EXECUTION_REPORT, VERIFICATION_REPORT | `tests/normal-flow-smoke.test.js` | PASS |

## Defect Isolated by Test

The implementation accepts `context threshold -4%` as a valid `4%` threshold. This violates the safe invalid-value behavior required by the run plan and intake. Because one required coverage item failed, this test-builder cannot call the implementation reliable/pass.
