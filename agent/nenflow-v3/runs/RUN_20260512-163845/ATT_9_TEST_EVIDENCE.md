---
artifact_type: TEST_EVIDENCE
role: EXECUTOR
run_id: RUN_20260512-163845
context_saturation_estimate: "~18%"
---

# ATT_9 Test Evidence — Attempt 2

## Command and Raw Results

Rerunnable command:

```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2 && node run-tests.js > results/stdout.txt 2> results/stderr.txt; code=$?; printf "%s\n" "$code" > results/exit-code.txt; exit "$code"
```

Raw evidence files:

- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2/results/stdout.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2/results/stderr.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2/results/exit-code.txt`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-2/results/summary.json`

Observed `results/exit-code.txt`:

```text
0
```

Observed `results/stderr.txt`: empty file (0 bytes).

## Stdout Summary

```text
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative PLAN artifact
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative EXECUTION_REPORT artifact
PASS normal-flow-smoke.test.js :: existing validator smoke passes representative VERIFICATION_REPORT artifact
PASS parser-config.test.js :: thresholds 65,45,35,20,40 parse and propagate into RUN_CONFIG shape
PASS parser-config.test.js :: explicit invalid, signed, negative, malformed, empty, and unrelated percentages reject/default safely
PASS parser-config.test.js :: RUN_CONFIG read/write/default behavior, clean string values, and invalid config rejection
PASS parser-config.test.js :: intake frontmatter threshold fields accept clean values and reject signed or malformed fields
PASS route-d-simulation.test.js :: Route D simulation finds valid continuation when normal artifact is missing
PASS route-d-simulation.test.js :: Route D builds same-role minimal continuation prompt with exact current and next paths
PASS static-propagation.test.js :: active Pi orchestrator skill includes Route D, RUN_CONFIG, threshold propagation, and resume helper
PASS static-propagation.test.js :: role skills use configured threshold and exact continuation path instead of hard-coded At ~65% language
PASS validator-continuation.test.js :: continuation validator accepts complete valid contract through policy and CLI
PASS validator-continuation.test.js :: continuation validator rejects missing sections and placeholders
PASS validator-continuation.test.js :: continuation validator rejects role/run mismatch, bad name/path, invalid percentages, and stale/future cases
[sandbox-test-builder] summary total=14 passed=14 failed=0
```

## Required Coverage Mapping

| Required coverage | Test file / assertion | Result |
|---|---|---|
| Thresholds `65,45,35,20,40` parse/propagate | `tests/parser-config.test.js` / `thresholds 65,45,35,20,40 parse and propagate into RUN_CONFIG shape` | PASS |
| Invalid/unrelated/signed/negative/malformed values reject/default safely | `tests/parser-config.test.js` / explicit cases for `-4%`, `- 4%`, `-40%`, `+4%`, `+ 40%`, `0%`, `100%`, `101%`, `4%%`, `4.5.6%`, `%40`, `abc4%`, `4%abc`, `--4%`, `++4%`, empty/unrelated text, unrelated `40%` | PASS |
| Separate valid threshold still accepted when invalid token also present | `tests/parser-config.test.js` / mixed `-4%` then `context handoff threshold 40%` | PASS |
| `RUN_CONFIG.json` read/write/default behavior | `tests/parser-config.test.js` / missing config default, write/read round-trip, invalid config rejection | PASS |
| Clean frontmatter/config field values and malformed rejection | `tests/parser-config.test.js` / accepts `40`, `40%`, `~41%`; rejects signed/malformed fields | PASS |
| Continuation validator accepts complete valid contract | `tests/validator-continuation.test.js` | PASS |
| Continuation validator rejects missing sections/placeholders | `tests/validator-continuation.test.js` | PASS |
| Continuation validator rejects role/run mismatch, bad path/name, invalid percentages, stale/future cases | `tests/validator-continuation.test.js` | PASS |
| Active Pi orchestrator skill Route D + `RUN_CONFIG.json` + `context_handoff_threshold_percent` propagation | `tests/static-propagation.test.js` | PASS |
| Role skills configured threshold and continuation path, no hard-coded `At ~65% self-estimated saturation` reliance | `tests/static-propagation.test.js` | PASS |
| Route D simulation | `tests/route-d-simulation.test.js` | PASS |
| Existing validator smoke for PLAN, EXECUTION_REPORT, VERIFICATION_REPORT | `tests/normal-flow-smoke.test.js` | PASS |

## Evidence Sufficiency Statement

The harness reads live implementation files from `C:/Users/doner/.pi/agent/nenflow-v3/` and invokes the live `validator.js` CLI. Destructive/generated cases write only inside `sandbox-tests/attempt-2/fixtures/generated` and `sandbox-tests/attempt-2/results/`. No required test was skipped. The single rerunnable command exited `0` with `14/14` passing tests.
